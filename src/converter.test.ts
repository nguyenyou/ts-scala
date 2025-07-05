import { describe, expect, test } from "bun:test";
import { convertTsToScala } from "./converter";
import dedent from "dedent";

// describe("interface conversion", () => {
//   test("simple interface", () => {
//     const tsSource = `
//     interface Person {
//       name: string
//       age: number
//     }
//     `;
//     const result = convertTsToScala(tsSource);
//     expect(result).toMatchSnapshot();
//   });
// });

describe("type conversion", () => {
  test("simple type", () => {
    const tsSource = dedent`
    interface Person {
      name: string
      age: number
    }
    `;
    const result = convertTsToScala(tsSource);
    expect(result).toBe(dedent`
    trait Person {
      name: String
      age: Int
    }
    `);
  });
});