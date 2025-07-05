import { it, expect } from 'bun:test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { convertTsToScala } from '../converter'

it.skip('converts TypeScript definitions to Scala based on fixture files', () => {
  // Read the input TypeScript definition file
  const inputPath = join(__dirname, 'test-fixtures', 'input.d.ts')
  const expectedPath = join(__dirname, 'test-fixtures', 'conversion-result.scala')
  
  const tsInput = readFileSync(inputPath, 'utf-8')
  const expectedOutput = readFileSync(expectedPath, 'utf-8')
  
  // Convert the TypeScript to Scala
  const actualOutput = convertTsToScala(tsInput)
  
  // Compare the actual output with expected output
  expect(actualOutput.trim()).toBe(expectedOutput.trim())
})
