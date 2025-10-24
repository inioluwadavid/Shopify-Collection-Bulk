# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced GitHub Actions release workflow
- Modern release automation with softprops/action-gh-release
- Automatic release notes generation

## [1.0.1] - 2024-12-19

### Fixed
- GitHub Actions release workflow permissions
- Updated to modern release action (softprops/action-gh-release@v2)
- Fixed package name references in release notes
- Added proper permissions for release creation

### Added
- Comprehensive documentation for open source release
- Environment variable configuration for all paths
- Example CSV files for different use cases
- Contributing guidelines and code of conduct
- MIT License
- GitHub Actions workflow for CI/CD

### Changed
- Refactored hardcoded paths to be configurable via environment variables
- Enhanced logging with timestamp and file output
- Updated package.json with proper metadata for open source

## [1.0.0] - 2024-12-19

### Added
- Initial release of Shopify Bulk Collections
- Bulk collection creation from CSV files
- Support for both custom and smart collections
- Word document extraction functionality
- Comprehensive error handling and retry logic
- Rate limiting and API throttling
- Detailed logging and progress tracking
- Log parsing utility for success/error reports

### Features
- **Custom Collections**: Create collections with title, handle, description, and image
- **Smart Collections**: Create collections with automatic product rules
- **Word Document Support**: Extract collection data from .docx files
- **Retry Logic**: Automatic retry for API rate limits and server errors
- **Progress Tracking**: Detailed logs and CSV reports
- **Rate Limiting**: Respects Shopify API limits with automatic throttling

### Technical Details
- Node.js ES modules
- Axios for HTTP requests
- CSV parsing with csv-parse
- XML parsing for Word documents
- Environment variable configuration
- Comprehensive error handling
