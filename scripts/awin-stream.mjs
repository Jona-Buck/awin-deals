function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchResponse(url, retries = 3){
  let lastError = null;

  for(let attempt=1; attempt<=retries; attempt++){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);

    try{
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "JB-Deals-Awin-Importer/2.1",
          "Accept": "text/csv,application/json,application/jsonl,application/octet-stream,text/plain,*/*"
        }
      });

      if(response.ok) return response;

      lastError = new Error(String(response.status) + " " + String(response.statusText));
      const retryable = response.status === 408 || response.status === 425 ||
        response.status === 429 || response.status >= 500;

      if(!retryable || attempt === retries) throw lastError;
    }catch(error){
      lastError = error instanceof Error ? error : new Error(String(error));
      if(attempt === retries) throw lastError;
    }finally{
      clearTimeout(timer);
    }

    await sleep(Math.min(30000, 1500 * 2 ** (attempt-1)));
  }

  throw lastError || new Error("Unbekannter Abruffehler");
}

function streamFromReader(reader, firstChunk){
  let first = true;

  return new ReadableStream({
    async pull(controller){
      try{
        if(first){
          first = false;
          if(firstChunk && firstChunk.length){
            controller.enqueue(firstChunk);
            return;
          }
        }

        const result = await reader.read();
        if(result.done){
          controller.close();
          return;
        }

        if(result.value && result.value.length){
          controller.enqueue(result.value);
        }
      }catch(error){
        controller.error(error);
      }
    },
    async cancel(reason){
      try{ await reader.cancel(reason); }catch{}
    }
  });
}

async function responseBody(response){
  if(!response.body) throw new Error("Feed-Antwort enthält keinen Body.");

  const reader = response.body.getReader();
  const first = await reader.read();
  if(first.done) throw new Error("Feed-Antwort ist leer.");

  const firstChunk = first.value;
  const isGzip = firstChunk && firstChunk.length >= 2 &&
    firstChunk[0] === 0x1f && firstChunk[1] === 0x8b;

  let body = streamFromReader(reader, firstChunk);

  if(isGzip){
    if(typeof DecompressionStream !== "function"){
      throw new Error("Gzip-Feed erkannt, aber DecompressionStream ist nicht verfügbar.");
    }
    body = body.pipeThrough(new DecompressionStream("gzip"));
  }

  return body;
}

async function* textChunks(body){
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8",{fatal:false});

  try{
    while(true){
      const {value,done} = await reader.read();
      if(done) break;
      if(value?.length) yield decoder.decode(value,{stream:true});
    }
  }finally{
    reader.releaseLock();
  }

  const tail = decoder.decode();
  if(tail) yield tail;
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

async function* csvRecords(body, maxRecordChars = 2000000){
  let pending = "";
  let record = "";

  for await(const chunk of textChunks(body)){
    pending += chunk;

    let start = 0;
    for(let i=0;i<pending.length;i++){
      if(pending[i] !== "\n") continue;

      const physicalLine = pending.slice(start,i).replace(/\r$/,"");
      start = i + 1;
      record += (record ? "\n" : "") + physicalLine;

      if(record.length > maxRecordChars){
        throw new Error(`CSV-Datensatz überschreitet ${maxRecordChars.toLocaleString("de-DE")} Zeichen.`);
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

function splitCsvLine(line, delimiter){
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

    if(ch === '"') quoted = true;
    else if(ch === delimiter){
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
    .map(d => ({d, count: header.split(d).length - 1}))
    .sort((a,b)=>b.count-a.count)[0].d;
}

export async function processProductFeedStream(url, mapProduct, onProduct, options = {}){
  const response = await fetchResponse(
    url,
    Number.isInteger(options.retries) ? options.retries : 3
  );

  const body = await responseBody(response);
  const records = csvRecords(body, options.maxRecordChars || 2000000);

  let delimiter = null;
  let headers = null;
  let rowCount = 0;
  let validCount = 0;

  // Header und Daten müssen in EINEM Durchlauf verarbeitet werden.
  // Ein "break" aus einem for-await-of würde den Async-Generator schließen
  // und anschließend gäbe es keine Produktzeilen mehr zu verarbeiten.
  for await(const record of records){
    if(!record.trim()) continue;

    if(!headers){
      delimiter = detectDelimiter(record);
      headers = splitCsvLine(record,delimiter)
        .map((h,i)=>String(h || "").replace(/^\uFEFF/,"").trim() || `column_${i}`);
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

  if(!headers) throw new Error("Feed enthält keinen CSV-Header.");

  return {rowCount,validCount};
}
