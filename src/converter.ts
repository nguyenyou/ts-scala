import * as ts from 'typescript'

/**
 * Convert a subset of TypeScript type-only declarations (.d.ts) to very basic Scala 3 code.
 *
 * Supported constructs (initial version):
 * 1. `interface`  → Scala `trait` with `val` members
 * 2. `type` alias → Scala `type` alias
 *
 * Only primitive type mappings and simple `T[]` arrays are handled for now.
 */
export function convertTsToScala(source: string): string {
  const file = ts.createSourceFile('input.d.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const out: string[] = []

  // Traverse top-level statements only (enough for .d.ts definitions)
  for (const stmt of file.statements) {
    if (ts.isInterfaceDeclaration(stmt)) {
      out.push(convertInterface(stmt))
    } else if (ts.isTypeAliasDeclaration(stmt)) {
      out.push(convertTypeAlias(stmt))
    }
  }

  return out.join('\n\n').trimEnd()
}

function convertInterface(node: ts.InterfaceDeclaration): string {
  const header = `trait ${node.name.text}:`
  const members: string[] = []

  for (const m of node.members) {
    if (ts.isPropertySignature(m) && m.type && ts.isIdentifier(m.name)) {
      const propName = m.name.text
      const propType = mapTsTypeToScala(m.type, /*insideArray*/ false)
      members.push(`  val ${propName}: ${propType}`)
    }
  }

  return [header, ...members].join('\n')
}

function convertTypeAlias(node: ts.TypeAliasDeclaration): string {
  const aliasName = node.name.text
  const targetType = mapTsTypeToScala(node.type, /*insideArray*/ false)
  return `type ${aliasName} = ${targetType}`
}

function mapTsTypeToScala(typeNode: ts.TypeNode, insideArray: boolean): string {
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return 'String'
    case ts.SyntaxKind.NumberKeyword:
      return 'Int'
    case ts.SyntaxKind.BooleanKeyword:
      return 'Boolean'
    case ts.SyntaxKind.AnyKeyword:
    case ts.SyntaxKind.UnknownKeyword:
      return 'Any'
    case ts.SyntaxKind.VoidKeyword:
      return 'Unit'
    case ts.SyntaxKind.NullKeyword:
      return 'Null'
    case ts.SyntaxKind.UndefinedKeyword:
      return 'Unit'
    case ts.SyntaxKind.TypeReference: {
      const ref = typeNode as ts.TypeReferenceNode
      // Handle Array<T> generics – convert to List[ScalaType]
      if (ts.isIdentifier(ref.typeName) && ref.typeName.text === 'Array' && ref.typeArguments?.length === 1) {
        const inner = mapTsTypeToScala(ref.typeArguments[0], /*insideArray*/ true)
        return `List[${inner}]`
      }
      return ref.getText()
    }
    case ts.SyntaxKind.ArrayType: {
      const arr = typeNode as ts.ArrayTypeNode
      const inner = mapTsTypeToScala(arr.elementType, /*insideArray*/ true)
      return `List[${inner}]`
    }
    default:
      return typeNode.getText()
  }
} 