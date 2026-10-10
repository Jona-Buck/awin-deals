import { readFile, writeFile } from "node:fs/promises";

const filePath = "products.json";
const catalog = JSON.parse(await readFile(filePath, "utf8"));
const products = Array.isArray(catalog.products) ? catalog.products : [];

function toAbsoluteImageUrl(value, origin) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    return new URL(value.trim(), origin).href;
  } catch {
    return "";
  }
}

async function fetchProductImages(product) {
  const alreadyHasImages = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
  ].some(value => typeof value === "string" && value.trim());

  if (alreadyHasImages || !product.productUrl) return { id: product.id, status: "skipped" };

  let sourceUrl;
  try {
    sourceUrl = new URL(product.productUrl);
  } catch {
    return { id: product.id, status: "failed", reason: "invalid product URL" };
  }

  if (sourceUrl.hostname !== "eu.inmotionworld.com") {
    return { id: product.id, status: "failed", reason: "unsupported image source host" };
  }

  const endpoint = new URL(sourceUrl.pathname.replace(/\/+$/, "") + ".js", sourceUrl.origin);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const rawImages = [
      data.featured_image,
      ...(Array.isArray(data.images) ? data.images : []),
      data.image,
    ];
    const images = [...new Set(rawImages
      .map(value => toAbsoluteImageUrl(value, sourceUrl.origin))
      .filter(Boolean))];

    if (!images.length) {
      throw new Error("the product endpoint returned no images");
    }

    product.image = images[0];
    product.images = images;
    return { id: product.id, status: "updated", count: images.length };
  } catch (error) {
    return {
      id: product.id,
      status: "failed",
      reason: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

const results = await Promise.all(products.map(fetchProductImages));
const updated = results.filter(result => result.status === "updated");
const failed = results.filter(result => result.status === "failed");

if (updated.length) {
  await writeFile(filePath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
}

for (const result of updated) {
  console.log(`✓ ${result.id}: ${result.count} official image(s) added`);
}
for (const result of results.filter(result => result.status === "skipped")) {
  console.log(`– ${result.id}: already has an image`);
}
for (const result of failed) {
  console.warn(`! ${result.id}: ${result.reason}`);
}
console.log(`Finished: ${updated.length} updated, ${failed.length} unresolved, ${results.filter(result => result.status === "skipped").length} already complete.`);
