import * as ts from 'typescript';
import type { Declaration, ScalaTrait, ValMember, Diagnostic } from './ir';

/**
 * Convert a TypeScript source string into an intermediate representation
 * that can subsequently be emitted to Scala (or any other language).
 */
export function parseToIR(
  tsSource: string
): {
  declarations: Declaration[];
  diagnostics: Diagnostic[];
} {
  const declarations: Declaration[] = [];
  const diagnostics: Diagnostic[] = [];

  const trimmed = tsSource.trim();
  if (!trimmed) {
    return { declarations, diagnostics };
  }

  const sourceFile = ts.createSourceFile(
    'temp.ts',
    tsSource,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ true
  );

  // Primitive TypeScript -> Scala mapping table.
  const primitiveTypeMap: Partial<Record<ts.SyntaxKind, string>> = {
    [ts.SyntaxKind.StringKeyword]: 'String',
    [ts.SyntaxKind.NumberKeyword]: 'Int',
    [ts.SyntaxKind.BooleanKeyword]: 'Boolean',
  } as const;

  const visit = (node: ts.Node): void => {
    if (ts.isInterfaceDeclaration(node)) {
      declarations.push(convertInterface(node));
      return; // do not traverse children further, we already handled them
    }
    ts.forEachChild(node, visit);
  };

  const convertInterface = (node: ts.InterfaceDeclaration): ScalaTrait => {
    const trait: ScalaTrait = {
      kind: 'trait',
      name: node.name.text,
      members: [],
    };

    node.members.forEach((member) => {
      if (ts.isPropertySignature(member)) {
        const val = convertPropertySignature(member);
        trait.members.push(val);
      } else {
        diagnostics.push({
          message: `Unsupported member in interface ${trait.name}`,
          start: member.getStart(),
          end: member.getEnd(),
        });
      }
    });

    return trait;
  };

  const convertPropertySignature = (
    property: ts.PropertySignature
  ): ValMember => {
    const propertyName = property.name?.getText() ?? '<unknown>'; // should always have name
    const propertyType = convertType(property.type);

    return {
      kind: 'val',
      name: propertyName,
      type: propertyType,
    };
  };

  const convertType = (typeNode: ts.TypeNode | undefined): string => {
    if (!typeNode) return 'Any';
    const mapped = primitiveTypeMap[typeNode.kind as ts.SyntaxKind];
    if (mapped) return mapped;

    diagnostics.push({
      message: `Unsupported type kind ${ts.SyntaxKind[typeNode.kind]}`,
      start: typeNode.getStart(),
      end: typeNode.getEnd(),
    });
    return 'Any';
  };

  visit(sourceFile);
  return { declarations, diagnostics };
} 