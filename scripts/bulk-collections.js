#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parse } from "csv-parse/sync";
import axios from "axios";

const SHOP = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-10";

// Configuration - can be overridden with environment variables
const SCRIPTS_DIR = process.env.SCRIPTS_DIR || path.resolve(process.cwd(), "scripts");
const LOG_PATH = path.join(SCRIPTS_DIR, "bulk-collections.log");

// Validate required environment variables
if (!SHOP || !TOKEN) {
	console.error("❌ Missing required environment variables:");
	if (!SHOP) console.error("  - SHOPIFY_STORE is required");
	if (!TOKEN) console.error("  - SHOPIFY_ADMIN_TOKEN is required");
	console.error("\nPlease check your .env file and ensure all required variables are set.");
	process.exit(1);
}

// Validate store format
if (!SHOP.includes('.myshopify.com')) {
	console.error("❌ Invalid SHOPIFY_STORE format. Expected: your-store.myshopify.com");
	process.exit(1);
}

const BASE_URL = `https://${SHOP}/admin/api/${API_VERSION}`;

// Logging function
function log(message) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${message}`;
	console.log(logMessage);
	
	// Also write to log file
	try {
		fs.appendFileSync(LOG_PATH, `${logMessage  }\n`);
	} catch (err) {
		console.error('Failed to write to log file:', err.message);
	}
}

function parseBoolean(value, defaultVal = false) {
	if (value === undefined || value === null || value === "") return defaultVal;
	const v = String(value).trim().toLowerCase();
	return v === "true" || v === "1" || v === "yes";
}

async function postWithRetry(url, payload, maxRetries = 5) {
	let delay = 1000;
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const res = await axios.post(url, payload, {
				headers: {
					"X-Shopify-Access-Token": TOKEN,
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
				timeout: 30000
			});
			return res.data;
		} catch (err) {
			const status = err?.response?.status;
			if ([429, 500, 502, 503, 504].includes(status)) {
				const retryAfter = err?.response?.headers?.["retry-after"];
				const sleepMs = retryAfter ? Number(retryAfter) * 1000 : delay;
				await new Promise(r => setTimeout(r, sleepMs));
				delay = Math.min(delay * 2, 16000);
				continue;
			}
			if (status) {
				console.error(`Error ${status}:`, err.response?.data || err.message);
			} else {
				console.error(`Network/Error:`, err.message);
			}
			throw err;
		}
	}
	throw new Error(`Failed after ${maxRetries} retries: ${url}`);
}

function buildCustomCollection(row) {
	const custom = {
		title: String(row.title || "").trim(),
		published: parseBoolean(row.published, true)
	};
	if (row.handle) custom.handle = String(row.handle).trim();
	if (row.body_html) custom.body_html = row.body_html;
	if (row.image_src) custom.image = { src: String(row.image_src).trim() };
	return { custom_collection: custom };
}

function buildSmartCollection(row) {
	const title = String(row.title || "").trim();
	const rulesRaw = String(row.rules_json || "").trim();
	if (!rulesRaw) throw new Error(`Smart collection "${title}" missing rules_json`);

	let rules;
	try {
		rules = JSON.parse(rulesRaw);
	} catch (e) {
		throw new Error(`Smart collection "${title}" has invalid rules_json: ${e.message}`);
	}

	const smart = {
		title,
		published: parseBoolean(row.published, true),
		rules,
		disjunctive: parseBoolean(row.disjunctive, false)
	};
	if (row.handle) smart.handle = String(row.handle).trim();
	if (row.body_html) smart.body_html = row.body_html;
	if (row.image_src) smart.image = { src: String(row.image_src).trim() };
	return { smart_collection: smart };
}

async function createCollection(row) {
	const type = String(row.type || "custom").trim().toLowerCase();
	let payload, url;
	if (type === "smart") {
		payload = buildSmartCollection(row);
		url = `${BASE_URL}/smart_collections.json`;
	} else {
		payload = buildCustomCollection(row);
		url = `${BASE_URL}/custom_collections.json`;
	}
	const data = await postWithRetry(url, payload);
	if (data.custom_collection) {
		const c = data.custom_collection;
		log(`Created custom: id=${c.id} handle=${c.handle}`);
	} else if (data.smart_collection) {
		const c = data.smart_collection;
		log(`Created smart: id=${c.id} handle=${c.handle}`);
	} else {
		log(`Unexpected response: ${JSON.stringify(data)}`);
	}
}

async function main() {
	const csvArg = process.argv[2];
	if (!csvArg) {
		console.error("❌ Usage: node scripts/bulk-collections.js /path/to/collections.csv");
		console.error("   Example: node scripts/bulk-collections.js data/collections.sample.csv");
		process.exit(1);
	}
	
	const csvPath = path.isAbsolute(csvArg) ? csvArg : path.join(process.cwd(), csvArg);
	
	// Validate CSV file exists
	if (!fs.existsSync(csvPath)) {
		console.error(`❌ CSV file not found: ${csvPath}`);
		process.exit(1);
	}
	
	console.log(`🚀 Starting Shopify Bulk Collections`);
	console.log(`📁 Store: ${SHOP}`);
	console.log(`📄 CSV: ${csvPath}`);
	console.log(`📝 Log: ${LOG_PATH}`);
	console.log(`⏱️  API Version: ${API_VERSION}`);
	console.log(`---`);
	
	const content = fs.readFileSync(csvPath, "utf8");

	const records = parse(content, {
		columns: true,
		skip_empty_lines: true
	});

	// Validate CSV has content
	if (records.length === 0) {
		console.error("❌ CSV file is empty or has no valid rows");
		process.exit(1);
	}

	// Validate required columns
	const requiredColumns = ['title'];
	const firstRow = records[0];
	const missingColumns = requiredColumns.filter(col => !(col in firstRow));
	if (missingColumns.length > 0) {
		console.error(`❌ CSV missing required columns: ${missingColumns.join(', ')}`);
		process.exit(1);
	}

	console.log(`📊 Found ${records.length} collection(s) to process`);
	console.log(`---`);

	let index = 0;
	let successCount = 0;
	let errorCount = 0;
	
	for (const row of records) {
		index += 1;
		const title = String(row.title || "").trim();
		if (!title) {
			log(`Row ${index}: skipped (missing title)`);
			continue;
		}
		try {
			await createCollection(row);
			successCount++;
		} catch (e) {
			log(`Row ${index} "${title}": ERROR -> ${e.message}`);
			errorCount++;
		}
		// ~2 req/sec for REST
		await new Promise(r => setTimeout(r, 600));
	}
	
	// Summary
	console.log(`---`);
	console.log(`✅ Completed: ${successCount} successful, ${errorCount} errors`);
	console.log(`📝 Full log: ${LOG_PATH}`);
	console.log(`📊 Reports: data/upload_report_*.csv`);
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});