# Shopify Collection Bulk

A powerful Node.js utility for bulk creating and managing Shopify collections from CSV files and Word documents via the Shopify Admin API.

## Features

- 🚀 **Bulk Collection Creation**: Create multiple Shopify collections from CSV files
- 📄 **Word Document Support**: Extract collection data from Word documents (.docx)
- 🎯 **Smart & Custom Collections**: Support for both smart and custom collection types
- 🔄 **Retry Logic**: Built-in retry mechanism for API rate limits and errors
- 📊 **Progress Tracking**: Detailed logging and error reporting
- ⚡ **Rate Limiting**: Respects Shopify API rate limits with automatic throttling

## Installation

```bash
# Clone the repository
git clone https://github.com/inioluwadavid/Shopify-Collection-Bulk.git
cd shopify-collection-bulk

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
```

## Configuration

Create a `.env` file with your Shopify store credentials:

```env
SHOPIFY_STORE=your-store-name.myshopify.com
SHOPIFY_ADMIN_TOKEN=your-admin-api-token
SHOPIFY_API_VERSION=2024-10
```

### Getting Your Shopify Admin Token

1. Go to your Shopify Admin → Apps → App and sales channel settings
2. Click "Develop apps" → "Create an app"
3. Configure Admin API access scopes:
   - `write_products` (for collections)
   - `read_products` (for smart collection rules)
4. Install the app and copy the Admin API access token

## Usage

### 1. Bulk Create Collections from CSV

```bash
# Using npm script
npm run bulk:collections

# Or directly
node scripts/bulk-collections.js data/collections.sample.csv
```

### 2. Extract Collections from Word Document

```bash
# Extract data from Word document
npm run extract:docx
```

### 3. Parse Bulk Upload Logs

```bash
# Generate success/error reports
npm run parse:log
```

## CSV Format

Your CSV file should include the following columns:

### For Custom Collections
```csv
title,handle,body_html,image_src,published
"Electronics","electronics","Shop our latest electronics","https://example.com/image.jpg","true"
```

### For Smart Collections
```csv
title,handle,body_html,image_src,published,type,rules_json,disjunctive
"Expensive Items","expensive","High-value products","https://example.com/image.jpg","true","smart","[{\"column\":\"price\",\"relation\":\"greater_than\",\"condition\":\"100\"}]","false"
```

### CSV Columns Reference

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `title` | ✅ | Collection title | "Electronics" |
| `handle` | ❌ | URL handle (auto-generated if empty) | "electronics" |
| `body_html` | ❌ | Collection description | "Shop our latest electronics" |
| `image_src` | ❌ | Collection image URL | "https://example.com/image.jpg" |
| `published` | ❌ | Published status (default: true) | "true" |
| `type` | ❌ | Collection type: "custom" or "smart" (default: "custom") | "smart" |
| `rules_json` | ⚠️ | Smart collection rules (required for smart collections) | `[{"column":"price","relation":"greater_than","condition":"100"}]` |
| `disjunctive` | ❌ | Smart collection logic (default: false) | "false" |

## Smart Collection Rules

Smart collections use JSON rules to automatically include products. Example rules:

```json
[
  {
    "column": "title",
    "relation": "contains",
    "condition": "electronics"
  },
  {
    "column": "price",
    "relation": "greater_than",
    "condition": "100"
  }
]
```

### Available Rule Types

- **Column**: `title`, `type`, `vendor`, `tag`, `price`, `compare_at_price`, `weight`, `inventory_stock`, `created_at`, `updated_at`
- **Relation**: `equals`, `not_equals`, `contains`, `not_contains`, `starts_with`, `ends_with`, `greater_than`, `less_than`
- **Condition**: The value to match against

## Word Document Extraction

The tool can extract collection data from Word documents by:

1. Parsing hyperlinks and their associated text
2. Extracting images and their URLs
3. Generating collection titles from link text
4. Creating descriptions automatically

### Supported Word Document Features

- Hyperlinks with text
- Images with URLs
- Automatic deduplication
- CSV export with proper formatting

## Error Handling

The tool includes comprehensive error handling:

- **Rate Limiting**: Automatic retry with exponential backoff
- **API Errors**: Detailed error messages with context
- **Validation**: Input validation for required fields
- **Logging**: Detailed logs for debugging and monitoring

## Output Files

After running the bulk upload, you'll find:

- `data/upload_report_successes.csv` - Successfully created collections
- `data/upload_report_errors.csv` - Failed collections with error details
- `scripts/bulk-collections.log` - Detailed execution log

## Development

### Project Structure

```
├── scripts/
│   ├── bulk-collections.js      # Main bulk upload script
│   ├── extract-from-docx.js     # Word document extraction
│   └── parse-bulk-log.js        # Log parsing utility
├── data/
│   ├── collections.sample.csv   # Example CSV file
│   └── collections.from_docx.csv # Extracted from Word doc
├── docs/
│   └── categorylist.docx        # Example Word document
└── package.json
```

### Adding New Features

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/davidajibade/shopify-collection-bulk#readme)
- 🐛 [Report Issues](https://github.com/davidajibade/shopify-collection-bulk/issues)
- 💬 [Discussions](https://github.com/davidajibade/shopify-collection-bulk/discussions)

## Changelog

### v1.0.0
- Initial release
- Bulk collection creation from CSV
- Word document extraction
- Smart and custom collection support
- Comprehensive error handling and logging
