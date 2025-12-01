# Testing Guide

Quick reference for testing in the Virtual Classroom application.

## Quick Start

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm run test:run -- src/tests/mytest.test.ts
```

## Test Structure

```
src/tests/
├── helpers/           # Test utilities and helpers
├── setup.ts          # Global test configuration
├── *.test.ts         # Test files
└── README.md         # Detailed testing documentation
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should return correct value', () => {
    expect(myFunction(5)).toBe(10);
  });
});
```

### Property-Based Test Example

```typescript
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: feature-name, Property 1: Description**
 * 
 * Property: For any valid input, output should satisfy condition
 * 
 * Validates: Requirements X.Y
 */
describe('Property Tests', () => {
  it('Property 1: Description', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer(), // Use arbitraries from helpers
        async (input) => {
          const result = await myFunction(input);
          expect(result).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Available Test Helpers

### Custom Arbitraries

Import from `./helpers/pbt-helpers`:

- `emailArbitrary` - Random emails
- `sessionIdArbitrary` - Random UUIDs
- `colorArbitrary` - Random hex colors
- `coordinateArbitrary` - Random coordinates
- `zoomLevelArbitrary` - Random zoom levels (50-300%)
- And many more...

### Helper Functions

- `hasExpectedFields(obj, fields)` - Check object structure
- `isValidHexColor(color)` - Validate hex colors
- `calculateContrastRatio(c1, c2)` - WCAG contrast
- `meetsWCAGAA(c1, c2)` - Check accessibility
- `deepEqual(obj1, obj2)` - Deep comparison

### React Testing

```typescript
import { renderWithProviders } from './helpers/test-utils';

const { getByText } = renderWithProviders(<MyComponent />);
```

## Coverage

Coverage thresholds are set to 70% for:
- Lines
- Functions
- Branches
- Statements

View coverage report: `coverage/index.html`

## Best Practices

1. **Test behavior, not implementation**
2. **Use property-based tests for universal rules**
3. **Keep tests simple and focused**
4. **Run minimum 100 iterations for property tests**
5. **Clean up after tests (use `afterEach`)**

## More Information

See `src/tests/README.md` for comprehensive documentation.
