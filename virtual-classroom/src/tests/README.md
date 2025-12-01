# Testing Infrastructure

This directory contains the testing infrastructure for the Virtual Classroom application, including unit tests, property-based tests, and test utilities.

## Overview

The testing strategy follows a dual approach:
- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property-Based Tests**: Verify universal properties that should hold across all inputs

## Test Framework

- **Test Runner**: Vitest
- **Property-Based Testing**: fast-check
- **React Testing**: @testing-library/react
- **Environment**: jsdom

## Directory Structure

```
src/tests/
├── helpers/
│   ├── pbt-helpers.ts      # Property-based testing utilities
│   ├── test-utils.tsx      # React component testing utilities
│   └── index.ts            # Central export point
├── setup.ts                # Global test setup
├── *.test.ts               # Test files
└── README.md               # This file
```

## Running Tests

```bash
# Run all tests in watch mode
npm test

# Run all tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

## Writing Unit Tests

Unit tests verify specific examples and edge cases:

```typescript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Test specific example
    expect(true).toBe(true);
  });

  it('should handle edge case', () => {
    // Test edge case
    expect(true).toBe(true);
  });
});
```

## Writing Property-Based Tests

Property-based tests verify universal properties across many inputs:

```typescript
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * **Feature: feature-name, Property X: Property description**
 * 
 * Property: For any [input], [expected behavior]
 * 
 * Validates: Requirements X.Y
 */
describe('Property Tests', () => {
  it('Property X: Description', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(), // arbitrary input
        async (input) => {
          // Test the property
          expect(true).toBe(true);
        }
      ),
      { numRuns: 100 } // Run 100 iterations
    );
  });
});
```

### Property Test Requirements

1. **Comment Format**: Each property test MUST include a comment with:
   - Feature name
   - Property number and description
   - Requirements validation

2. **Iterations**: Each property test should run a minimum of 100 iterations

3. **Arbitraries**: Use custom arbitraries from `pbt-helpers.ts` for domain-specific data

## Test Helpers

### Property-Based Testing Helpers

Located in `helpers/pbt-helpers.ts`:

**Custom Arbitraries**:
- `userIdArbitrary` - Generate random user IDs
- `emailArbitrary` - Generate random emails
- `sessionIdArbitrary` - Generate random session IDs
- `colorArbitrary` - Generate random hex colors
- `coordinateArbitrary` - Generate random coordinates
- And many more...

**Helper Functions**:
- `hasExpectedFields(obj, fields)` - Check if object has expected fields
- `isValidHexColor(color)` - Validate hex color format
- `calculateContrastRatio(color1, color2)` - Calculate WCAG contrast ratio
- `meetsWCAGAA(color1, color2)` - Check WCAG AA compliance
- `deepEqual(obj1, obj2)` - Deep equality check

### React Component Testing Utilities

Located in `helpers/test-utils.tsx`:

**Custom Render**:
```typescript
import { renderWithProviders } from './helpers';

const { getByText } = renderWithProviders(<MyComponent />);
```

**Mock Utilities**:
- `MockStorage` - Mock localStorage/sessionStorage
- `MockWebSocket` - Mock WebSocket connections
- `MockAgoraRTCClient` - Mock Agora RTC client
- `createMockFile()` - Create mock files for upload testing

**Helper Functions**:
- `waitForCondition(condition)` - Wait for async condition
- `createMockFetch(responses)` - Mock fetch API
- `simulateUserDelay(ms)` - Simulate user interaction delay

## Coverage Reporting

Coverage is configured to track:
- Line coverage: 70% minimum
- Function coverage: 70% minimum
- Branch coverage: 70% minimum
- Statement coverage: 70% minimum

Coverage reports are generated in:
- `coverage/` - HTML report (open `coverage/index.html`)
- Console output - Text summary
- `coverage/lcov.info` - LCOV format for CI/CD

## Best Practices

### Unit Tests

1. **Focus on Core Logic**: Test business logic, not implementation details
2. **Test Edge Cases**: Empty inputs, boundary values, error conditions
3. **Use Descriptive Names**: Test names should explain what is being tested
4. **Keep Tests Simple**: One assertion per test when possible
5. **Avoid Mocks When Possible**: Test real functionality

### Property-Based Tests

1. **Define Clear Properties**: Properties should be universal rules
2. **Use Smart Generators**: Constrain input space to valid domain
3. **Run Sufficient Iterations**: Minimum 100 runs per property
4. **Handle Edge Cases**: Generators should include edge cases
5. **Validate Against Spec**: Each property should map to requirements

### General Guidelines

1. **Test Behavior, Not Implementation**: Focus on what, not how
2. **Keep Tests Independent**: Tests should not depend on each other
3. **Clean Up After Tests**: Use `afterEach` to reset state
4. **Use Meaningful Assertions**: Assertions should be clear and specific
5. **Document Complex Tests**: Add comments for non-obvious test logic

## Troubleshooting

### Tests Failing Intermittently

- Check for race conditions in async tests
- Ensure proper cleanup in `afterEach`
- Use `waitFor` for async operations

### Coverage Not Updating

- Run `npm run test:coverage` to regenerate
- Check that files are not in exclude list
- Ensure tests are actually running

### Property Tests Failing

- Check if generators produce valid inputs
- Verify property is correctly specified
- Ensure code handles all generated inputs

## Examples

See existing test files for examples:
- `apiEndpointValidation.test.ts` - Property-based API tests
- `AnnotationStorageService.test.ts` - Unit tests for service
- `coordinateTransformation.test.ts` - Unit tests for utilities

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [fast-check Documentation](https://fast-check.dev/)
- [React Testing Library](https://testing-library.com/react)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
