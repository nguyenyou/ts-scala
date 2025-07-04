#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertTsToScala } from '../src/converter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateResultJS() {
  try {
    // Read the input TypeScript file
    const inputPath = path.join(__dirname, '..', 'src', 'test-fixtures', 'input.d.ts');
    const outputPath = path.join(__dirname, '..', 'result-js.scala');
    
    const tsInput = fs.readFileSync(inputPath, 'utf-8');
    console.log('Read input file:', inputPath);
    
    // Convert TypeScript to Scala
    const scalaOutput = convertTsToScala(tsInput);
    console.log('Converted TypeScript to Scala');
    
    // Create the complete Scala file with main method
    const completeScalaCode = `
//> using scala 3.7.1
//> using platform scala-js

//> using dep "org.scala-js::scalajs-dom::2.8.0"
//> using dep "com.raquo::laminar::17.2.1"

//> using jsModuleKind es
//> using jsModuleSplitStyleStr fewestmodules

import scala.scalajs.js

${scalaOutput}

@main def run(): Unit = println("SUCCESS!!!")
`;
    
    // Write the output
    fs.writeFileSync(outputPath, completeScalaCode);
    console.log('Written complete Scala file to:', outputPath);
    
  } catch (error) {
    console.error('Error generating result-js.scala:', error);
    process.exit(1);
  }
}

generateResultJS(); 