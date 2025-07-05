# Test Fixtures

This directory contains test fixtures for the TypeScript to Scala converter.

## Structure

Each test case consists of two files:
- `{name}.d.ts` - The input TypeScript definition
- `{name}-expected.scala` - The expected Scala output

## Adding New Test Cases

1. Create a new input file: `{name}.d.ts`
2. Create the expected output file: `{name}-expected.scala`
3. Add the test case to the `testCases` array in `converter.test.ts`:

```typescript
{
  name: "descriptive test name",
  inputFile: "filename-without-extension",
  expectedFile: "expected-filename-without-extension"
}
```

## Benefits

- **Separation of concerns**: Test logic is separate from test data
- **Easy to maintain**: Complex multi-line inputs/outputs are in dedicated files
- **Version control friendly**: Changes to test data show clear diffs
- **Reusable**: Test fixtures can be used across different test files
- **IDE support**: Proper syntax highlighting for TypeScript and Scala files
- **Scalable**: Easy to add new test cases without cluttering test files

## Current Test Cases

- `input.d.ts` / `conversion-result.scala` - Basic interfaces and types
- `simple-types.d.ts` / `simple-types-expected.scala` - Type aliases and unions
- `generics-input.d.ts` / `generics-expected.scala` - Generic interfaces and types 