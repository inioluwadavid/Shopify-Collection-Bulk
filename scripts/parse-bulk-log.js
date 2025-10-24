#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

// Configuration - can be overridden with environment variables
const SCRIPTS_DIR = process.env.SCRIPTS_DIR || path.resolve(process.cwd(), "scripts");
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), "data");
const LOG_PATH = path.join(SCRIPTS_DIR, "bulk-collections.log");
const SUCCESS_CSV = path.join(DATA_DIR, "upload_report_successes.csv");
const ERROR_CSV = path.join(DATA_DIR, "upload_report_errors.csv");

console.log("📊 Parsing bulk upload log...");
console.log(`📝 Log file: ${LOG_PATH}`);
console.log(`📁 Output directory: ${DATA_DIR}`);
console.log(`---`);

if (!fs.existsSync(LOG_PATH)) {
  console.error(`❌ Log file not found: ${LOG_PATH}`);
  console.error(`   Make sure you've run bulk-collections.js first to generate the log.`);
  process.exit(1);
}

const text = fs.readFileSync(LOG_PATH, "utf8");
const lines = text.split(/\r?\n/);

const successes = [];
const errors = [];

const successRe = /^Created\s+(custom|smart):\s+id=(\d+)\s+handle=(\S+)/;
const errorRe = /^Row\s+(\d+)\s+"([^"]*)":\s+ERROR\s+->\s+(.*)$/;

for (const line of lines) {
  if (!line) continue;
  let m = line.match(successRe);
  if (m) {
    const [, type, id, handle] = m;
    successes.push({ type, id, handle });
    continue;
  }
  m = line.match(errorRe);
  if (m) {
    const [, row, title, message] = m;
    errors.push({ row: Number(row), title, error: message });
    continue;
  }
}

// Ensure output directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Write successes CSV
{
  const header = ["type", "id", "handle"]; 
  const out = [header.join(",")];
  for (const s of successes) {
    out.push([s.type, s.id, s.handle].join(","));
  }
  fs.writeFileSync(SUCCESS_CSV, out.join("\n"), "utf8");
}

// Write errors CSV
{
  const header = ["row", "title", "error"]; 
  const out = [header.join(",")];
  for (const e of errors) {
    const title = e.title.includes(",") ? `"${  e.title.replaceAll('"', '""')  }"` : e.title;
    const err = e.error.includes(",") ? `"${  e.error.replaceAll('"', '""')  }"` : e.error;
    out.push([String(e.row), title, err].join(","));
  }
  fs.writeFileSync(ERROR_CSV, out.join("\n"), "utf8");
}

console.log(`✅ Parsing complete!`);
console.log(`📊 Successes: ${successes.length} -> ${SUCCESS_CSV}`);
console.log(`❌ Errors: ${errors.length} -> ${ERROR_CSV}`);
if (errors.length > 0) {
  console.log(`💡 Review the error CSV to fix issues and re-run the upload.`);
}


