import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createGunzip } from "node:zlib";

const execFileAsync = promisify(execFile);

async function downloadFeedToFile(url,filePath){
  await execFileAsync(
    "curl",
    [
      "--location",
      "--fail",
      "--silent",
      "--show-error",
      "--retry","3",
      "--retry-delay","2",
      "--connect-timeout","30",
      "--max-time","600",
      "--user-agent","JB-Deals-Awin-Importer/4.0",
      "--header","Accept: text/csv,application/json,application/jsonl,application/octet-stream,text/plain,*/*",
      "--output",filePath,
      url
    ],
    {
      maxBuffer: 1024 * 1024,
      windowsHide: true
    }
  );
}

async function isGzipFile(filePath){
  const handle = await fsp.open(filePath,"r");
  try{
    const buffer = Buffer.alloc(2);
    const result = await handle.read(buffer,0,2,0);
    return result.bytesRead === 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
  }finally{
    await handle.close();
  }
}

function splitCsvLine(line,delimiter){
  const values = [];
  let cell = "";
  let quoted = false;

  for(let i=0;i<line.length;i++){
    const ch = line[i];

    if(quoted){
      if(ch === '"'){
        if(line[i+1] === '"'){
          cell += '"';
          i++;
        }else{
          quoted = false;
        }
      }else{
        cell += ch;
      }
      continue;
    }

    if(ch === '"'){
      quoted = true;
    }else if(ch === delimiter){
      values.push(cell);
      cell = "";
    }else{
      cell += ch;
    }
  }

  values.push(cell);
  return values;
}

function detectDelimiter(header){
  const candidates = [",",";","\t"];
  return candidates
    .map(delimiter => ({
      delimiter,
      fields: splitCsvLine(header,delimiter).length
    }))
    .sort((a,b)=>b.fields-a.fields)[0].delimiter;
}

async function* csvRowsFromStream(stream,maxRecordChars=2000000){
  const decoder = new TextDecoder("utf-8",{fatal:false});

  let headerMode = true;
  let headerRecord = "";
  let headerQuoted = false;
  let headerQuotePending = false;

  let delimiter = null;
  let inQuotes = false;
  let quotePending = false;
  let cell = "";
  let row = [];
  let recordChars = 0;

  function checkSize(){
    if(recordChars > maxRecordChars){
      throw new Error(
        "CSV-Datensatz überschreitet " +
        maxRecordChars.toLocaleString("de-DE") +
        " Zeichen."
      );
    }
  }

  function finishHeader(){
    const cleanHeader = headerRecord.replace(/^\uFEFF/,"");
    delimiter = detectDelimiter(cleanHeader);
    return splitCsvLine(cleanHeader,delimiter);
  }

  for await(const chunk of stream){
    if(!chunk?.length) continue;

    const text = decoder.decode(chunk,{stream:true});

    for(let i=0;i<text.length;i++){
      const ch = text[i];

      if(headerMode){
        if(headerQuotePending){
          if(ch === '"'){
            headerRecord += '"';
            headerQuotePending = false;
            continue;
          }

          headerQuotePending = false;
          headerQuoted = false;
        }

        if(headerQuoted){
          headerRecord += ch;
          if(ch === '"') headerQuotePending = true;
          continue;
        }

        if(ch === '"'){
          headerQuoted = true;
          headerRecord += ch;
          continue;
        }

        if(ch === "\n"){
          headerMode = false;
          const headers = finishHeader();

          headerRecord = "";
          headerQuoted = false;
          headerQuotePending = false;
          recordChars = 0;

          yield {headers};
          continue;
        }

        if(ch !== "\r") headerRecord += ch;
        recordChars++;
        checkSize();
        continue;
      }

      if(quotePending){
        if(ch === '"'){
          cell += '"';
          quotePending = false;
          inQuotes = true;
          recordChars++;
          checkSize();
          continue;
        }

        quotePending = false;
        inQuotes = false;
      }

      if(inQuotes){
        if(ch === '"'){
          quotePending = true;
        }else{
          cell += ch;
          recordChars++;
          checkSize();
        }
        continue;
      }

      if(ch === '"'){
        inQuotes = true;
        continue;
      }

      if(ch === delimiter){
        row.push(cell);
        cell = "";
        continue;
      }

      if(ch === "\n"){
        row.push(cell);
        yield {values:row};

        row = [];
        cell = "";
        recordChars = 0;
        continue;
      }

      if(ch !== "\r"){
        cell += ch;
        recordChars++;
        checkSize();
      }
    }
  }

  const tail = decoder.decode();
  if(tail){
    for(let i=0;i<tail.length;i++){
      // Der Decoder-Tail enthält normalerweise nur ein einzelnes UTF-8-Reststück.
      // Zur Sicherheit wird es nicht als eigener Datensatz interpretiert.
      if(!tail[i].trim()) continue;
      throw new Error("Unerwartetes UTF-8-Decoder-Ende im CSV-Stream.");
    }
  }

  if(headerMode){
    if(headerRecord.trim()){
      const headers = finishHeader();
      yield {headers};
      headerMode = false;
    }
    return;
  }

  if(quotePending) inQuotes = false;

  if(cell.length || row.length){
    row.push(cell);
    yield {values:row};
  }
}

export async function processProductFeedStream(url,mapProduct,onProduct,options={}){
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(),"jb-awin-"));
  const feedFile = path.join(tempDir,"feed.dat");

  try{
    await downloadFeedToFile(url,feedFile);

    const gzip = await isGzipFile(feedFile);
    const source = fs.createReadStream(feedFile);
    const stream = gzip ? source.pipe(createGunzip()) : source;

    let headers = null;
    let rowCount = 0;
    let validCount = 0;

    for await(const item of csvRowsFromStream(
      stream,
      options.maxRecordChars || 2000000
    )){
      if(item.headers){
        headers = item.headers;
        continue;
      }

      if(!headers || !item.values) continue;

      rowCount++;

      const row = {};
      headers.forEach((header,i)=>{
        row[header] = item.values[i] ?? "";
      });

      const product = mapProduct(row);
      if(product){
        await onProduct(product);
        validCount++;
      }
    }

    if(!headers) throw new Error("Feed enthält keinen CSV-Header.");

    return {rowCount,validCount};
  }finally{
    await fsp.rm(tempDir,{recursive:true,force:true}).catch(()=>{});
  }
}
