#!/usr/bin/env node

import fs from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { processProductFeedStream } from "./awin-stream.mjs";

const PRODUCTS_FILE = new URL("../products.json", import.meta.url);
const MAX_PRODUCTS = clampInt(process.env.AWIN_MAX_PRODUCTS, 1000, 1, 20000);
const MIN_DISCOUNT = clampNumber(process.env.AWIN_MIN_DISCOUNT, 0, 0, 100);
const KEEP_MANUAL = process.env.AWIN_KEEP_MANUAL !== "false";
const INCLUDE_NOT_JOINED = process.env.AWIN_INCLUDE_NOT_JOINED === "true";

function clampInt(value, fallback, min, max){
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function clampNumber(value, fallback, min, max){
  const n = Number.parseFloat(value ?? "");
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function clean(value){
  return String(value ?? "").replace(/^\uFEFF/, "").trim();
}

function first(...values){
  for(const value of values){
    const v = clean(value);
    if(v) return v;
  }
  return "";
}

function rowValue(row, ...wantedNames){
  const wanted = wantedNames.map(name =>
    clean(name).toLowerCase().replace(/[\s_-]+/g, "")
  );

  for(const [key, value] of Object.entries(row ?? {})){
    const normalizedKey = clean(key).toLowerCase().replace(/[\s_-]+/g, "");
    if(wanted.includes(normalizedKey)){
      const v = clean(value);
      if(v) return v;
    }
  }
  return "";
}

function parseNumber(value){
  if(value === null || value === undefined) return null;
  let s = clean(value);
  if(!s) return null;
  s = s.replace(/\s/g, "").replace(/€/g, "");
  if(s.includes(",") && s.includes(".")){
    s = s.lastIndexOf(",") > s.lastIndexOf(".")
      ? s.replace(/\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  }else if(s.includes(",")){
    s = s.replace(",", ".");
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeUrl(value){
  const s = clean(value);
  if(!s) return "";
  try{
    const u = new URL(s);
    return /^https?:$/.test(u.protocol) ? u.toString() : "";
  }catch{
    return "";
  }
}

function truthy(value){
  const s = clean(value).toLowerCase();
  if(!s) return null;
  if(["1","true","yes","y","ja","available","in stock","instock"].includes(s)) return true;
  if(["0","false","no","n","nein","unavailable","out of stock","outofstock"].includes(s)) return false;
  return null;
}

function isAvailable(row){
  const inStock = truthy(row.in_stock);
  const forSale = truthy(row.is_for_sale);
  if(inStock === false || forSale === false) return false;
  const stock = first(row.stock_status, row.stock);
  if(/out.?of.?stock|unavailable|nicht\s*verf(ü|u)gbar|sold\s*out/i.test(stock)) return false;
  return true;
}

function detectDelimiter(text){
  const line = text.split(/\r?\n/).find(Boolean) || "";
  return [",",";","\t"]
    .map(d => ({d, count: line.split(d).length - 1}))
    .sort((a,b)=>b.count-a.count)[0].d;
}

function parseCsv(text){
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for(let i=0;i<text.length;i++){
    const ch = text[i];
    if(quoted){
      if(ch === '"'){
        if(text[i+1] === '"'){ cell += '"'; i++; }
        else quoted = false;
      }else cell += ch;
      continue;
    }
    if(ch === '"') quoted = true;
    else if(ch === delimiter){ row.push(cell); cell = ""; }
    else if(ch === "\n"){ row.push(cell); rows.push(row); row=[]; cell=""; }
    else if(ch !== "\r") cell += ch;
  }

  row.push(cell);
  if(row.some(v=>clean(v))) rows.push(row);
  if(!rows.length) return [];

  const headers = rows[0].map((h,i)=>clean(h) || `column_${i}`);
  return rows.slice(1).map(values=>{
    const obj = {};
    headers.forEach((h,i)=>{ obj[h] = values[i] ?? ""; });
    return obj;
  });
}

function parseText(text){
  const trimmed = text.trim();
  if(!trimmed) return [];

  if(trimmed[0] === "[" || trimmed[0] === "{"){
    try{
      const parsed = JSON.parse(trimmed);
      if(Array.isArray(parsed)) return parsed;
      for(const key of ["products","items","data","results"]){
        if(Array.isArray(parsed?.[key])) return parsed[key];
      }
      if(parsed && typeof parsed === "object") return [parsed];
    }catch{}
  }

  const lines = trimmed.split(/\r?\n/).filter(line=>line.trim());
  if(lines.length && lines.every(line=>{
    try { JSON.parse(line); return true; } catch { return false; }
  })){
    return lines.map(line=>JSON.parse(line));
  }

  return parseCsv(trimmed);
}

async function downloadText(url){
  const response = await fetch(url, {
    headers: {
      "User-Agent": "JB-Deals-Awin-Importer/1.0",
      "Accept": "text/csv,application/json,application/jsonl,application/octet-stream,text/plain,*/*"
    }
  });
  if(!response.ok) throw new Error(`${response.status} ${response.statusText}`);

  let bytes = new Uint8Array(await response.arrayBuffer());
  if(bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = gunzipSync(bytes);
  return new TextDecoder("utf-8",{fatal:false}).decode(bytes).replace(/^\uFEFF/,"");
}

async function resolveFeedUrls(){
  const rawListUrls = clean(process.env.AWIN_FEED_LIST_URLS);
  const rawDirectUrls = clean(process.env.AWIN_PRODUCT_FEED_URLS);

  const feedUrls = [];

  if(rawListUrls){
    const listUrls = rawListUrls.split(/[,\n]+/).map(clean).filter(Boolean);

    for(let i=0;i<listUrls.length;i++){
      console.log(`→ Lade Awin Feed-Liste ${i+1}/${listUrls.length}`);
      const listText = await downloadText(listUrls[i]);
      const rows = parseText(listText);

      if(!rows.length) throw new Error(`Feed-Liste ${i+1} enthält keine Datensätze.`);

      let added = 0;
      for(const row of rows){
        const membership = rowValue(
          row,
          "Membership Status",
          "membership_status",
          "MembershipStatus",
          "Status"
        ).toLowerCase();

        if(!INCLUDE_NOT_JOINED){
          const normalizedMembership = membership
            .replace(/[._-]+/g," ")
            .replace(/\s+/g," ")
            .trim();

          // Awin can return values such as "Not Joined". The old regex
          // accidentally matched the word "joined" inside "not joined".
          const isJoined = /^(joined|beigetreten|member)$/i.test(normalizedMembership);

          if(!isJoined) continue;
        }

        const url = normalizeUrl(rowValue(
          row,
          "URL",
          "Download URL",
          "download_url",
          "Feed URL",
          "feed_url",
          "url"
        ));

        if(url){
          feedUrls.push(url);
          added++;
        }
      }

      console.log(`  ${rows.length.toLocaleString("de-DE")} Feed-Einträge gefunden, ${added.toLocaleString("de-DE")} zulässige Download-URLs übernommen`);
    }
  }

  if(rawDirectUrls){
    for(const url of rawDirectUrls.split(/[,\n]+/).map(clean).filter(Boolean)){
      const normalized = normalizeUrl(url);
      if(normalized) feedUrls.push(normalized);
    }
  }

  const unique = [...new Set(feedUrls)];
  if(!unique.length){
    throw new Error(
      "Keine Awin-Feeds gefunden. Hinterlege AWIN_FEED_LIST_URLS als GitHub Secret (empfohlen) " +
      "oder AWIN_PRODUCT_FEED_URLS für direkte Produktfeed-URLs."
    );
  }

  console.log(`✓ ${unique.length.toLocaleString("de-DE")} eindeutige Awin-Feeds werden importiert`);
  return unique;
}

function parseSpecifications(value){
  const raw = clean(value);
  if(!raw) return [];
  return raw
    .split(/(?:\r?\n|\s*\|\s*|\s*;\s*)/)
    .map(clean)
    .filter(Boolean)
    .filter(x=>x.length<=120)
    .slice(0,8);
}

function slug(value){
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/gi,"-")
    .replace(/^-+|-+$/g,"")
    .slice(0,80) || "product";
}

function roundMoney(value){
  return Math.round(value*100)/100;
}

function mapProduct(row){
  const affiliateUrl = normalizeUrl(first(row.aw_deep_link,row.awin_deep_link,row.tracking_link,row.affiliate_url));
  const productUrl = normalizeUrl(first(row.merchant_deep_link,row.product_url,row.purl));
  const imageCandidates = [
    row.large_image,row.merchant_image_url,row.aw_image_url,row.image_link,
    row.alternate_image,row.alternate_image_two,row.alternate_image_three
  ].map(normalizeUrl).filter(Boolean);

  const name = first(row.product_name,row.name,row.title);
  const merchant = first(row.merchant_name,row.shop_name,row.merchant);
  const brand = first(row.brand_name,row.brand);
  const category = first(row.category_name,row.merchant_category,row.product_type,"Weitere Produkte");
  const description = first(row.product_short_description,row.description,row.promotional_text);
  const price = parseNumber(first(row.search_price,row.store_price,row.price));
  const oldPrice = parseNumber(first(row.product_price_old,row.rrp_price,row.old_price));
  const savingsPercent = parseNumber(first(row.savings_percent,row.discount_percent));

  if(!name || !affiliateUrl || !imageCandidates[0] || price===null || price<=0 || !isAvailable(row)) return null;

  const discount = savingsPercent!==null
    ? Math.max(0,Math.min(100,Math.round(savingsPercent)))
    : oldPrice && oldPrice>price ? Math.round((1-price/oldPrice)*100) : 0;

  if(discount<MIN_DISCOUNT) return null;

  const awProductId = first(row.aw_product_id,row.aw_productid,row.product_id,row.pid);
  const merchantProductId = first(row.merchant_product_id,row.merchant_productid,row.sku,row.ean);
  const merchantId = first(row.merchant_id,row.aw_merchant_id,merchant);
  const stableKey = awProductId || merchantProductId || productUrl || affiliateUrl;
  const id = `awin-${slug(merchantId||"shop")}-${slug(stableKey)}`;

  const highlights = [
    ...parseSpecifications(row.specifications),
    first(row.colour,row.color),
    first(row.size)
  ].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).slice(0,8);

  return {
    id,
    name,
    description: description.slice(0,700),
    price: roundMoney(price),
    currency: first(row.currency,"EUR"),
    category,
    merchant: merchant || "Shop",
    ...(brand ? {brand} : {}),
    image: imageCandidates[0],
    ...(productUrl ? {productUrl} : {}),
    affiliateUrl,
    ...(oldPrice && oldPrice>price ? {oldPrice:roundMoney(oldPrice)} : {}),
    ...(discount>0 ? {badge:`-${discount}%`} : {}),
    images: imageCandidates.slice(0,6),
    highlights
  };
}

function score(p){
  const explicitDiscount = Number(p?._discount);
  const oldPrice = Number(p?.oldPrice || 0);
  const price = Number(p?.price || 0);
  const badgeDiscount = Number((String(p?.badge || "").match(/(\\d+)/)?.[1] || 0));
  const discount = Number.isFinite(explicitDiscount)
    ? explicitDiscount
    : oldPrice > price && price > 0
      ? Math.round((1-price/oldPrice)*100)
      : badgeDiscount;
  return discount*100000-Math.min(price,100000);
}

async function checkUrl(url, kind){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try{
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "JB-Deals-Awin-Validator/1.0",
        "Accept": kind === "image" ? "image/*,*/*;q=0.8" : "*/*"
      }
    });

    const status = response.status;

    if(status >= 400 && status !== 403 && status !== 405){
      return {ok:false,status};
    }

    if(kind === "image"){
      const type = String(response.headers.get("content-type") || "").toLowerCase();
      if(type && !type.startsWith("image/") && status < 400){
        return {ok:false,status,reason:`kein Bild-Content-Type: ${type}`};
      }
    }

    return {ok:true,status};
  }catch(error){
    return {
      ok:false,
      status:0,
      reason:error?.name === "AbortError" ? "Timeout" : String(error?.message || error)
    };
  }finally{
    clearTimeout(timer);
  }
}

async function validateProducts(products){
  const concurrency = clampInt(process.env.AWIN_VALIDATION_CONCURRENCY, 12, 1, 30);
  const valid = [];
  let checked = 0;
  let rejected = 0;

  for(let start=0; start<products.length; start+=concurrency){
    const batch = products.slice(start,start+concurrency);

    const results = await Promise.all(batch.map(async product=>{
      const [image, affiliate] = await Promise.all([
        checkUrl(product.image, "image"),
        checkUrl(product.affiliateUrl, "affiliate")
      ]);

      return {product,image,affiliate};
    }));

    for(const result of results){
      checked++;

      if(!result.image.ok || !result.affiliate.ok){
        rejected++;
        const imageInfo = result.image.ok
          ? "Bild OK"
          : `Bild ${result.image.status || "ERR"} ${result.image.reason || ""}`.trim();
        const affiliateInfo = result.affiliate.ok
          ? "Affiliate-Link OK"
          : `Affiliate ${result.affiliate.status || "ERR"} ${result.affiliate.reason || ""}`.trim();

        console.warn(`  ✗ Produkt verworfen: ${result.product.name.slice(0,100)} — ${imageInfo}; ${affiliateInfo}`);
        continue;
      }

      valid.push(result.product);
    }

    if(checked % 120 === 0 || checked === products.length){
      console.log(`  ✓ Link-/Bildprüfung: ${checked}/${products.length} geprüft, ${rejected} verworfen`);
    }
  }

  return {valid,rejected};
}

async function main(){
  const urls = await resolveFeedUrls();
  const existing = KEEP_MANUAL ? JSON.parse(await fs.readFile(PRODUCTS_FILE,"utf8")).products || [] : [];
  const existingAuto = existing.filter(p=>String(p.id||"").startsWith("awin-"));
  // Nie alle Produkte gleichzeitig im RAM halten: die Feed-Liste kann hunderte
  // Feeds mit sehr vielen Produkten enthalten. Wir behalten nur einen begrenzten
  // Kandidaten-Pool und reduzieren ihn regelmäßig auf die besten Produkte.
  const candidates = new Map();
  const errors = [];
  let importedCount = 0;

  function addCandidate(product){
    const key = product.id || product.affiliateUrl;
    const previous = candidates.get(key);
    if(!previous || score(product)>score(previous)) candidates.set(key, product);

    // Harte RAM-Begrenzung. Ein paar tausend Kandidaten reichen aus, um am Ende
    // die besten MAX_PRODUCTS zuverlässig auszuwählen.
    if(candidates.size > Math.max(MAX_PRODUCTS * 4, 4000)){
      const best = [...candidates.values()]
        .map(p=>({...p,_discount:p.oldPrice && p.oldPrice>p.price ? Math.round((1-p.price/p.oldPrice)*100) : Number((p.badge||"").match(/(\\d+)/)?.[1]||0)}))
        .sort((a,b)=>score(b)-score(a))
        .slice(0, Math.max(MAX_PRODUCTS * 2, 2000));
      candidates.clear();
      for(const p of best){
        const {_discount,...productWithoutScore}=p;
        candidates.set(productWithoutScore.id || productWithoutScore.affiliateUrl, productWithoutScore);
      }
    }
  }

  for(let i=0;i<urls.length;i++){
    try{
      console.log(`→ Lade Awin Produktfeed ${i+1}/${urls.length}`);

      const result = await processProductFeedStream(
        urls[i],
        mapProduct,
        product=>{
          addCandidate(product);
          importedCount++;
        },
        {
          retries: 3,
          maxRecordChars: 2000000
        }
      );

      if(result.validCount===0){
        throw new Error("Feed wurde geladen, aber kein gültiges Produkt konnte daraus erstellt werden.");
      }

      console.log(
        `  ✓ ${result.rowCount.toLocaleString("de-DE")} Datensätze gelesen, ` +
        `${result.validCount.toLocaleString("de-DE")} gültige Produkte`
      );

      if(typeof global.gc === "function") global.gc();
    }catch(error){
      errors.push(`Feed ${i+1}: ${error instanceof Error ? error.message : String(error)}`);
      console.warn(`  ⚠️ Feed ${i+1} fehlgeschlagen: ${errors.at(-1)}`);
      if(typeof global.gc === "function") global.gc();
    }
  }

  if(!importedCount){
    throw new Error(errors.length ? errors.join(" | ") : "Keine verwertbaren Produkte gefunden.");
  }

  let importedBest = [...candidates.values()]
    .sort((a,b)=>score(b)-score(a))
    .slice(0,MAX_PRODUCTS);

  console.log(`→ Prüfe ${importedBest.length.toLocaleString("de-DE")} übernommene Produkte auf funktionierende Bilder und Affiliate-Links`);
  const validation = await validateProducts(importedBest);
  importedBest = validation.valid;

  if(!importedBest.length){
    throw new Error("Die Link-/Bildprüfung hat alle importierten Produkte verworfen.");
  }

  console.log(
    `✓ Qualitätsprüfung abgeschlossen: ${importedBest.length.toLocaleString("de-DE")} gültige Produkte, ` +
    `${validation.rejected.toLocaleString("de-DE")} verworfen`
  );

  const importedAffiliateUrls = new Set(importedBest.map(p=>String(p.affiliateUrl)));
  const manual = existing.filter(p=>{
    const importedId = String(p.id||"").startsWith("awin-");
    return !importedId && !importedAffiliateUrls.has(String(p.affiliateUrl));
  });

  // Bei einem teilweisen Feed-Fehler niemals den alten funktionierenden Katalog löschen.
  // Die vorhandenen Auto-Produkte bleiben stehen, bis alle konfigurierten Feeds wieder erfolgreich geladen wurden.
  const autoProductsToKeep = errors.length ? existingAuto : [];
  const finalMap = new Map();
  for(const product of [...manual,...autoProductsToKeep,...importedBest]){
    if(product?.id) finalMap.set(String(product.id),product);
  }

  await fs.writeFile(PRODUCTS_FILE,JSON.stringify({products:[...finalMap.values()]},null,2)+"\n");

  console.log(`✓ ${importedCount.toLocaleString("de-DE")} gültige Feed-Datensätze verarbeitet; ${importedBest.length.toLocaleString("de-DE")} Top-Produkte übernommen`);
  console.log(`✓ ${manual.length.toLocaleString("de-DE")} manuell gepflegte Produkte behalten`);
  if(errors.length) console.log(`⚠️ ${autoProductsToKeep.length.toLocaleString("de-DE")} bisherige Feed-Produkte wegen Feed-Fehler beibehalten`);
  console.log(`✓ ${finalMap.size.toLocaleString("de-DE")} Produkte insgesamt`);

  if(errors.length){
    console.warn("⚠️ Einige Feeds konnten nicht geladen werden:");
    errors.forEach(error=>console.warn("  "+error));
  }
}

main().catch(error=>{
  console.error("✗ Import fehlgeschlagen:",error instanceof Error ? error.message : error);
  process.exit(1);
});
