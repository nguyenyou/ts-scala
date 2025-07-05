import { describe, expect, test } from "bun:test";
import { convertTsToScala } from "./converter";
import { readFileSync } from "fs";
import { join } from "path";

// Helper function to read test fixtures
function readFixture(name: string, extension: string): string {
  const filePath = join(__dirname, "tests/test-fixtures", `${name}.${extension}`);
  return readFileSync(filePath, "utf-8").trim();
}
type TestCase = {
  name: string;
  inputFile: string;
}
// Test cases configuration
const testCases: TestCase[] = [
  {
    name: "basic interfaces and types",
    inputFile: "basic",
  },
  // {
  //   name: "simple type aliases and unions",
  //   inputFile: "simple-types",
  //   expectedFile: "simple-types-expected"
  // },
  // {
  //   name: "advanced generics",
  //   inputFile: "generics-input",
  //   expectedFile: "generics-expected"
  // },
  // Add more test cases here as you create more fixtures
  // {
  //   name: "complex inheritance",
  //   inputFile: "inheritance-input", 
  //   expectedFile: "inheritance-expected"
  // }
];

describe("TypeScript to Scala conversion", () => {
  testCases.forEach(({ name, inputFile }: TestCase) => {
    test(`converts ${name}`, () => {
      const tsInput = readFixture(inputFile, "d.ts");
      const expectedOutput = readFixture(`${inputFile}-expected`, "scala");
      
      const result = convertTsToScala(tsInput);
      expect(result.trim()).toBe(expectedOutput);
    });
  });
});

// Individual test cases for specific scenarios
describe("edge cases", () => {
  test("handles empty input", () => {
    const result = convertTsToScala("");
    expect(result.trim()).toBe("");
  });
  
  test("handles whitespace-only input", () => {
    const result = convertTsToScala("   \n  \n  ");
    expect(result.trim()).toBe("");
  });
});

