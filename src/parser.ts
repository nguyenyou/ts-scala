import * as ts from 'typescript';
import type { Declaration, ScalaTrait, ScalaTypeAlias, ValMember, Diagnostic } from './ir';

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
    [ts.SyntaxKind.NumberKeyword]: 'Double',
    [ts.SyntaxKind.BooleanKeyword]: 'Boolean',
  } as const;

  const visit = (node: ts.Node): void => {
    if (ts.isInterfaceDeclaration(node)) {
      declarations.push(convertInterface(node));
      return; // do not traverse children further, we already handled them
    }
    if (ts.isTypeAliasDeclaration(node)) {
      declarations.push(convertTypeAlias(node));
      return;
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

  const convertTypeAlias = (node: ts.TypeAliasDeclaration): Declaration => {
    // If the alias is for an inline object type (a TypeLiteral), model it as a separate trait
    // so that the resulting Scala mirrors an interface-style definition. This also ensures
    // we preserve member information instead of collapsing it into `Any`.
    if (ts.isTypeLiteralNode(node.type)) {
      const trait: ScalaTrait = {
        kind: 'trait',
        name: node.name.getText(),
        members: [],
      };

      node.type.members.forEach((member) => {
        if (ts.isPropertySignature(member)) {
          const val = convertPropertySignature(member);
          trait.members.push(val);
        } else {
          diagnostics.push({
            message: `Unsupported member in type literal alias ${trait.name}`,
            start: member.getStart(),
            end: member.getEnd(),
          });
        }
      });
      return trait;
    }

    // Fallback: keep as a simple type alias
    const alias: ScalaTypeAlias = {
      kind: 'typeAlias',
      name: node.name.getText(),
      type: convertType(node.type),
    };
    return alias;
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

    // Handle union types recursively.
    if (ts.isUnionTypeNode(typeNode)) {
      return typeNode.types.map(convertType).join(' | ');
    }

    // Handle literal types like string literals.
    if (ts.isLiteralTypeNode(typeNode)) {
      const lit = typeNode.literal;
      if (ts.isStringLiteral(lit)) {
        return `"${lit.text}"`;
      }
      if (ts.isNumericLiteral(lit)) {
        return lit.text;
      }
    }

    // Handle type references (aliases, interfaces, etc.)
    if (ts.isTypeReferenceNode(typeNode)) {
      return typeNode.getText();
    }

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