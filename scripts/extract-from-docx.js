#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

// Configuration - can be overridden with environment variables
const DOCS_DIR = process.env.DOCS_DIR || path.resolve(process.cwd(), "docs");
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
const DOCX_DIR = path.join(DOCS_DIR, "categorylist_extracted", "word");
const RELS_PATH = path.join(DOCX_DIR, "_rels", "document.xml.rels");
const DOCUMENT_XML_PATH = path.join(DOCX_DIR, "document.xml");
const OUT_CSV = path.join(DATA_DIR, "collections.from_docx.csv");

function loadText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function decodeXmlEntities(str) {
  return str
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function parseRels(xml) {
  const relRegex = /<Relationship[^>]*Id="(rId\d+)"[^>]*Target="([^"]+)"[^>]*>/g;
  const map = new Map();
  let m;
  while ((m = relRegex.exec(xml)) !== null) {
    map.set(m[1], decodeXmlEntities(m[2]));
  }
  return map;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, "");
}

function extractRunsText(fragment) {
  // Collect all text nodes inside this fragment
  const texts = [];
  const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  let m;
  while ((m = tRegex.exec(fragment)) !== null) {
    texts.push(decodeXmlEntities(m[1]));
  }
  return texts.join("");
}

function parseHyperlinks(documentXml) {
  const results = [];
  // Word can encode hyperlinks either via <w:hyperlink r:id="rId.."> or via field codes (w:fldSimple)
  // 1) r:id hyperlinks
  const hyperlinkRegex = /<w:hyperlink[^>]*r:id="(rId\d+)"[^>]*>([\s\S]*?)<\/w:hyperlink>/g;
  let m;
  while ((m = hyperlinkRegex.exec(documentXml)) !== null) {
    const rid = m[1];
    const inner = m[2];
    const text = extractRunsText(inner).trim();
    if (text) results.push({ rid, text });
  }

  // 2) fldSimple hyperlinks: <w:fldSimple w:instr=" HYPERLINK \"url\" "> ... <w:r><w:t>Text</w:t>
  const fldRegex = /<w:fldSimple[^>]*w:instr="[^"]*HYPERLINK\s+\"([^"]+)\"[^"]*"[^>]*>([\s\S]*?)<\/w:fldSimple>/g;
  while ((m = fldRegex.exec(documentXml)) !== null) {
    const url = decodeXmlEntities(m[1]);
    const inner = m[2];
    const text = extractRunsText(inner).trim();
    if (text) results.push({ url, text });
  }

  return results;
}

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function toCsvValue(val) {
  const s = String(val ?? "");
  if (s.includes("\"") || s.includes(",") || s.includes("\n")) {
    return '"' + s.replaceAll('"', '""') + '"';
  }
  return s;
}

function makeDescription(title) {
  return `${title} — curated category featuring related products and components.`;
}

function main() {
  console.log("🔍 Extracting collections from Word document...");
  console.log(`📁 Docs directory: ${DOCS_DIR}`);
  console.log(`📄 Output CSV: ${OUT_CSV}`);
  console.log(`---`);
  
  if (!fs.existsSync(RELS_PATH) || !fs.existsSync(DOCUMENT_XML_PATH)) {
    console.error("❌ Extracted docx XML not found.");
    console.error(`   Expected files:`);
    console.error(`   - ${RELS_PATH}`);
    console.error(`   - ${DOCUMENT_XML_PATH}`);
    console.error(`   Make sure the .docx was unzipped to docs/categorylist_extracted/`);
    process.exit(1);
  }

  const relsXml = loadText(RELS_PATH);
  const docXml = loadText(DOCUMENT_XML_PATH);

  const relsMap = parseRels(relsXml);
  const links = parseHyperlinks(docXml);

  // Resolve URLs using rId when present
  const rows = [];
  for (const item of links) {
    const title = item.text;
    const url = item.url || relsMap.get(item.rid) || "";
    if (!title) continue;
    if (!url) continue; // skip if no image url found
    rows.push({ title, image_src: url, body_html: makeDescription(title) });
  }

  const deduped = uniqueBy(rows, (r) => `${r.title}||${r.image_src}`);
  deduped.sort((a, b) => a.title.localeCompare(b.title));

  const header = ["title", "image_src", "body_html"];
  const lines = [header.join(",")];
  for (const r of deduped) {
    lines.push([toCsvValue(r.title), toCsvValue(r.image_src), toCsvValue(r.body_html)].join(","));
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUT_CSV);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(OUT_CSV, lines.join("\n"), "utf8");
  console.log(`✅ Successfully extracted ${deduped.length} collections`);
  console.log(`📄 Output file: ${OUT_CSV}`);
  console.log(`💡 Next step: Review the CSV and run bulk-collections.js`);
}

main();


