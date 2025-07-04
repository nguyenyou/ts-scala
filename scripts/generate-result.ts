#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertTsToScala } from '../src/converter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateExpectedOutput() {
  try {
    // Read the input TypeScript file
    const inputPath = path.join(__dirname, '..', 'src', 'test-fixtures', 'input.d.ts');
    const outputPath = path.join(__dirname, '..', 'src', 'test-fixtures', 'conversion-result.scala');
    
    const tsInput = fs.readFileSync(inputPath, 'utf-8');
    console.log('Read input file:', inputPath);
    
    // Convert TypeScript to Scala
    const scalaOutput = convertTsToScala(tsInput);
    console.log('Converted TypeScript to Scala');
    
    // Write the output
    fs.writeFileSync(outputPath, scalaOutput);
    console.log('Written output to:', outputPath);
    
  } catch (error) {
    console.error('Error generating expected output:', error);
    process.exit(1);
  }
}

generateExpectedOutput(); 