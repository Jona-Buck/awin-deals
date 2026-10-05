#!/usr/bin/env node

import fs from "node:fs/promises";
import { gunzipSync } from "node:zlib";

const PRODUCTS_FILE = new URL("../products.json", import.meta.url);
const MAX_PRODUCTS = clampInt(process.env.AWIN_MAX_PRODUCTS, 1000, 1, 20000);
const MIN_DISCOUNT = clampNumber(process.env.AWIN_MIN_DISCOUNT, 0, 0, 100);
const KEEP_MANUAL = process.env.AWIN_KEEP_MANUAL !== "false";

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
  const discount = Number(p._discount || 0);
  const price = Number(p.price || 0);
  return discount*100000-Math.min(price,100000);
}

async function main(){
  const rawUrls = clean(process.env.AWIN_PRODUCT_FEED_URLS);
  if(!rawUrls) throw new Error("AWIN_PRODUCT_FEED_URLS ist nicht gesetzt. Hinterlege die Awin-Produktfeed-URL(s) als GitHub Secret.");

  const urls = rawUrls.split(/[,\n]+/).map(clean).filter(Boolean);
  const existing = KEEP_MANUAL ? JSON.parse(await fs.readFile(PRODUCTS_FILE,"utf8")).products || [] : [];
  const existingAuto = existing.filter(p=>String(p.id||"").startsWith("awin-"));
  const imported = [];
  const errors = [];

  for(let i=0;i<urls.length;i++){
    try{
      console.log(`→ Lade Awin Feed ${i+1}/${urls.length}`);
      const feedText = await downloadText(urls[i]);
      const rows = parseText(feedText);
      console.log(`  ${rows.length.toLocaleString("de-DE")} Datensätze gelesen`);
      for(const row of rows){
        const product = mapProduct(row);
        if(product) imported.push(product);
      }
    }catch(error){
      errors.push(`Feed ${i+1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if(!imported.length){
    throw new Error(errors.length ? errors.join(" | ") : "Keine verwertbaren Produkte gefunden.");
  }

  const deduped = new Map();
  for(const product of imported){
    const key = product.id || product.affiliateUrl;
    const previous = deduped.get(key);
    if(!previous || score(product)>score(previous)) deduped.set(key,product);
  }

  const importedBest = [...deduped.values()]
    .map(p=>({...p,_discount:p.oldPrice && p.oldPrice>p.price ? Math.round((1-p.price/p.oldPrice)*100) : Number((p.badge||"").match(/(\d+)/)?.[1]||0)}))
    .sort((a,b)=>score(b)-score(a))
    .slice(0,MAX_PRODUCTS)
    .map(({_discount,...p})=>p);

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

  console.log(`✓ ${importedBest.length.toLocaleString("de-DE")} Feed-Produkte übernommen`);
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
