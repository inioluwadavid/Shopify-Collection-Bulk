# Contributing to Shopify Bulk Collections

Thank you for your interest in contributing to Shopify Bulk Collections! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** to ensure it's not a usage question
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Error messages or logs

### Suggesting Enhancements

We welcome feature requests! Please:

1. **Check existing issues** for similar suggestions
2. **Describe the use case** and why it would be valuable
3. **Provide examples** of how the feature would work
4. **Consider implementation complexity** and maintainability

### Pull Requests

#### Before You Start

1. **Fork the repository** and clone your fork
2. **Create a feature branch** from `main`
3. **Install dependencies**: `npm install`
4. **Run tests** (if available): `npm test`

#### Development Process

1. **Make your changes** following the coding standards below
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Test your changes** thoroughly
5. **Commit your changes** with clear, descriptive messages

#### Pull Request Guidelines

- **Use descriptive titles** that explain what the PR does
- **Provide detailed descriptions** of changes made
- **Reference related issues** using `#issue-number`
- **Include screenshots** for UI changes
- **Ensure all checks pass** before requesting review

## Coding Standards

### JavaScript/Node.js

- **Use ES6+ features** (the project uses ES modules)
- **Follow consistent naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_SNAKE_CASE` for constants
- **Use meaningful variable names**
- **Add comments** for complex logic
- **Handle errors gracefully** with try-catch blocks

### Code Style

```javascript
// Good
const createCollection = async (collectionData) => {
  try {
    const response = await apiClient.post('/collections', collectionData);
    return response.data;
  } catch (error) {
    console.error('Failed to create collection:', error.message);
    throw error;
  }
};

// Avoid
const createCollection = async (data) => {
  const res = await apiClient.post('/collections', data);
  return res.data;
};
```

### File Organization

- **Keep scripts focused** on single responsibilities
- **Use descriptive filenames**
- **Group related functionality** together
- **Export functions** that might be reused

## Testing

### Manual Testing

Before submitting a PR, please test:

1. **Happy path scenarios** with valid data
2. **Error conditions** with invalid data
3. **Edge cases** like empty files or malformed CSV
4. **Rate limiting** behavior
5. **Different collection types** (custom vs smart)

### Test Data

- Use the provided sample CSV files
- Test with both small and large datasets
- Verify error handling with malformed data

## Documentation

### Code Documentation

- **Add JSDoc comments** for public functions
- **Explain complex algorithms** in comments
- **Document API requirements** and limitations

### User Documentation

- **Update README.md** for new features
- **Add usage examples** for new functionality
- **Update CSV format documentation** for schema changes

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Changelog

- **Document all changes** in CHANGELOG.md
- **Group changes** by type (Added, Changed, Fixed, Removed)
- **Include migration notes** for breaking changes

## Getting Help

### Questions and Discussion

- **GitHub Discussions** for general questions
- **Issues** for bug reports and feature requests
- **Pull Request comments** for code-specific questions

### Development Setup

```bash
# Clone and setup
git clone https://github.com/davidajibade/shopify-bulk-collections.git
cd shopify-bulk-collections
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your Shopify credentials

# Test the setup
npm run bulk:collections
```

## Recognition

Contributors will be:

- **Listed in CONTRIBUTORS.md** (if desired)
- **Mentioned in release notes** for significant contributions
- **Credited in the README** for major features

## License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to Shopify Bulk Collections! 🚀
