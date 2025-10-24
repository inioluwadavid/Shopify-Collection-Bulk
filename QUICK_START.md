# Quick Start Guide 🚀

Get up and running with Shopify Collection Bulk in under 5 minutes!

## ⚡ **Super Quick Setup**

### 1. **Clone & Install**
```bash
git clone https://github.com/inioluwadavid/Shopify-Collection-Bulk.git
cd Shopify-Collection-Bulk
npm install
```

### 2. **Configure Shopify**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your Shopify credentials
nano .env
```

**Required Environment Variables:**
```env
SHOPIFY_STORE=your-store.myshopify.com
SHOPIFY_ADMIN_TOKEN=your-admin-token
```

### 3. **Get Your Shopify Admin Token**
1. Go to Shopify Admin → Apps → App and sales channel settings
2. Click "Develop apps" → "Create an app"
3. Configure scopes: `write_products`, `read_products`
4. Install app and copy the Admin API access token

### 4. **Run Your First Bulk Upload**
```bash
# Test with sample data
npm run bulk:collections

# Or with your own CSV
node scripts/bulk-collections.js data/your-collections.csv
```

## 📊 **Sample CSV Format**

Create a CSV file with these columns:

```csv
title,handle,body_html,image_src,published,type
"Electronics","electronics","Shop our latest electronics","https://example.com/image.jpg","true","custom"
"Smart Collection","smart-items","Auto-updating collection","","true","smart"
```

## 🎯 **Common Use Cases**

### **Bulk Create Collections**
```bash
# Create multiple collections from CSV
node scripts/bulk-collections.js data/collections.csv
```

### **Extract from Word Document**
```bash
# Extract collections from Word doc
npm run extract:docx
```

### **Generate Reports**
```bash
# Parse upload logs and generate reports
npm run parse:log
```

## 🔧 **Troubleshooting**

### **Common Issues:**
- **"Missing env variables"** → Check your `.env` file
- **"CSV file not found"** → Use absolute path or check file location
- **"API rate limit"** → Tool automatically handles this with retries

### **Get Help:**
- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/inioluwadavid/Shopify-Collection-Bulk/issues)
- 💬 [Discussions](https://github.com/inioluwadavid/Shopify-Collection-Bulk/discussions)

## 🎉 **Success!**

You should see output like:
```
🚀 Starting Shopify Bulk Collections
📁 Store: your-store.myshopify.com
📄 CSV: data/collections.csv
📝 Log: scripts/bulk-collections.log
⏱️  API Version: 2024-10
---
📊 Found 5 collection(s) to process
---
Created custom: id=123456 handle=electronics
Created smart: id=123457 handle=smart-items
---
✅ Completed: 5 successful, 0 errors
📝 Full log: scripts/bulk-collections.log
📊 Reports: data/upload_report_*.csv
```

**Next Steps:**
- Review the generated reports
- Check your Shopify admin for the new collections
- Customize the CSV format for your needs
- Explore smart collection rules for auto-updating collections
