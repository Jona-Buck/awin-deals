import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createGunzip } from "node:zlib";

const execFileAsync = promisify(execFile);

async function downloadFeedToFile(url, filePath){
  await execFileAsync(
    "curl",
    [
      "--location",
      "--fail",
      "--silent",
      "--show-error",
      "--retry", "3",
      "--retry-delay", "2",
      "--connect-timeout", "30",
      "--max-time", "600",
      "--user-agent", "JB-Deals-Awin-Importer/3.0",
      "--header", "Accept: text/csv,application/json,application/jsonl,application/octet-stream,text/plain,*/*",
      "--output", filePath,
      url
    ],
    {
      maxBuffer: 1024 * 1024,
      windowsHide: true
    }
  );
}

async function isGzipFile(filePath){
  const handle = await fsp.open(filePath, "r");
  try{
    const buffer = Buffer.alloc(2);
    const result = await handle.read(buffer,0,2,0);
    return result.bytesRead === 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
  }finally{
    await handle.close();
  }
}

function textChunksFromStream(stream){
  return (async function*(){
    const decoder = new TextDecoder("utf-8",{fatal:false});

    for await(const chunk of stream){
      if(chunk?.length){
        yield decoder.decode(chunk,{stream:true});
      }
    }

    const tail = decoder.decode();
    if(tail) yield tail;
  })();
}

function recordComplete(record){
  let quoted = false;

  for(let i=0;i<record.length;i++){
    if(record[i] !== '"') continue;

    if(quoted && record[i+1] === '"'){
      i++;
      continue;
    }

    quoted = !quoted;
  }

  return !quoted;
}

async function* csvRecordsFromStream(stream,maxRecordChars=2000000){
  let pending = "";
  let record = "";

  for await(const chunk of textChunksFromStream(stream)){
    pending += chunk;

    let start = 0;

    for(let i=0;i<pending.length;i++){
      if(pending[i] !== "\n") continue;

      const physicalLine = pending.slice(start,i).replace(/\r$/,"");
      start = i + 1;
      record += (record ? "\n" : "") + physicalLine;

      if(record.length > maxRecordChars){
        throw new Error(
          "CSV-Datensatz überschreitet " +
          maxRecordChars.toLocaleString("de-DE") +
          " Zeichen."
        );
      }

      if(recordComplete(record)){
        yield record;
        record = "";
      }
    }

    pending = pending.slice(start);
  }

  if(pending){
    record += (record ? "\n" : "") + pending.replace(/\r$/,"");
  }

  if(record.trim()) yield record;
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
  return [",",";","\t"]
    .map(d => ({d,count:header.split(d).length-1}))
    .sort((a,b)=>b.count-a.count)[0].d;
}

export async function processProductFeedStream(url,mapProduct,onProduct,options={}){
  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(),"jb-awin-"));
  const feedFile = path.join(tempDir,"feed.dat");

  try{
    await downloadFeedToFile(url,feedFile);

    const gzip = await isGzipFile(feedFile);
    const source = fs.createReadStream(feedFile);
    const stream = gzip ? source.pipe(createGunzip()) : source;

    const records = csvRecordsFromStream(
      stream,
      options.maxRecordChars || 2000000
    );

    let delimiter = null;
    let headers = null;
    let rowCount = 0;
    let validCount = 0;

    for await(const record of records){
      if(!record.trim()) continue;

      if(!headers){
        delimiter = detectDelimiter(record);
        headers = splitCsvLine(record,delimiter)
          .map((h,i)=>String(h || "").replace(/^\uFEFF/,"").trim() || ("column_" + i));
        continue;
      }

      rowCount++;

      const values = splitCsvLine(record,delimiter);
      const row = {};
      headers.forEach((header,i)=>{ row[header] = values[i] ?? ""; });

      const product = mapProduct(row);

      if(product){
        await onProduct(product);
        validCount++;
      }
    }

    if(!headers){
      throw new Error("Feed enthält keinen CSV-Header.");
    }

    return {rowCount,validCount};
  }finally{
    await fsp.rm(tempDir,{recursive:true,force:true}).catch(()=>{});
  }
}
