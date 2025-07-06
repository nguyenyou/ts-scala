import { parseToIR } from './parser';
import { emitScala } from './emitter';

/**
 * Public API: Convert TypeScript source text to equivalent Scala.
 *
 * Internally the function orchestrates two phases:
 *  1. Parsing (AST → IR)
 *  2. Emitting  (IR  → Scala source)
 */
export function convertTsToScala(tsSource: string): string {
  const { declarations } = parseToIR(tsSource);
  return emitScala(declarations);
}
