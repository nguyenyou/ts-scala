import * as ts from 'typescript'

/**
 * Convert a subset of TypeScript type-only declarations (.d.ts) to Scala 3 code.
 *
 * Supported constructs:
 * 1. `interface` → Scala `trait` with `val` members
 * 2. `type` alias → Scala `type` alias
 * 3. Optional properties → `Option[T]`
 * 4. Union types → `T | U`
 * 5. Generic types → `T[U]`
 * 6. Function types → `T => U`
 * 7. Arrays → `List[T]`
 */
export function convertTsToScala(source: string): string {
  if (!source.trim()) return ''
  
  const file = ts.createSourceFile('input.d.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const out: string[] = []

  // Traverse top-level statements only (enough for .d.ts definitions)
  for (const stmt of file.statements) {
    if (ts.isInterfaceDeclaration(stmt)) {
      out.push(convertInterface(stmt))
    } else if (ts.isTypeAliasDeclaration(stmt)) {
      out.push(convertTypeAlias(stmt))
    } else if (ts.isEnumDeclaration(stmt)) {
      out.push(convertEnum(stmt))
    }
  }

  return out.join('\n\n').trimEnd()
}

function convertInterface(node: ts.InterfaceDeclaration): string {
  const name = node.name.text
  const typeParams = convertTypeParameters(node.typeParameters)
  
  // Handle inheritance
  const extendsClause = node.heritageClauses?.find(clause => 
    clause.token === ts.SyntaxKind.ExtendsKeyword
  )
  const inheritance = extendsClause ? 
    ` extends ${extendsClause.types.map(t => t.expression.getText()).join(', ')}` : ''
  
  const header = `trait ${name}${typeParams}${inheritance}:`
  
  if (!node.members.length) {
    return header
  }
  
  const members: string[] = []

  for (const m of node.members) {
    if (ts.isPropertySignature(m) && m.type && ts.isIdentifier(m.name)) {
      const propName = m.name.text
      const isOptional = !!m.questionToken
      const propType = mapTsTypeToScala(m.type, /*insideArray*/ false)
      const finalType = isOptional ? `Option[${propType}]` : propType
      members.push(`  val ${propName}: ${finalType}`)
    }
  }

  return [header, ...members].join('\n')
}

function convertTypeAlias(node: ts.TypeAliasDeclaration): string {
  const aliasName = node.name.text
  const typeParams = convertTypeParameters(node.typeParameters)
  const targetType = mapTsTypeToScala(node.type, /*insideArray*/ false)
  return `type ${aliasName}${typeParams} = ${targetType}`
}

function convertEnum(node: ts.EnumDeclaration): string {
  const enumName = node.name.text
  const members: string[] = []
  
  for (const member of node.members) {
    if (ts.isIdentifier(member.name)) {
      const memberName = member.name.text
      if (member.initializer) {
        if (ts.isStringLiteral(member.initializer)) {
          members.push(`  case ${memberName} extends ${enumName}("${member.initializer.text}")`)
        } else if (ts.isNumericLiteral(member.initializer)) {
          members.push(`  case ${memberName} extends ${enumName}(${member.initializer.text})`)
        } else {
          members.push(`  case ${memberName} extends ${enumName}`)
        }
      } else {
        members.push(`  case ${memberName} extends ${enumName}`)
      }
    }
  }
  
  return `enum ${enumName}:\n${members.join('\n')}`
}

function convertTypeParameters(typeParams: ts.NodeArray<ts.TypeParameterDeclaration> | undefined): string {
  if (!typeParams || typeParams.length === 0) return ''
  
  const params = typeParams.map(param => param.name.text).join(', ')
  return `[${params}]`
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
      // Handle generic types like Container<T>
      if (ref.typeArguments && ref.typeArguments.length > 0) {
        const baseName = ref.typeName.getText()
        const args = ref.typeArguments.map(arg => mapTsTypeToScala(arg, false)).join(', ')
        return `${baseName}[${args}]`
      }
      return ref.getText()
    }
    case ts.SyntaxKind.ArrayType: {
      const arr = typeNode as ts.ArrayTypeNode
      const inner = mapTsTypeToScala(arr.elementType, /*insideArray*/ true)
      return `List[${inner}]`
    }
    case ts.SyntaxKind.UnionType: {
      const union = typeNode as ts.UnionTypeNode
      const types = union.types.map(t => mapTsTypeToScala(t, false))
      return types.join(' | ')
    }
    case ts.SyntaxKind.IntersectionType: {
      const intersection = typeNode as ts.IntersectionTypeNode
      const types = intersection.types.map(t => mapTsTypeToScala(t, false))
      return types.join(' & ')
    }
    case ts.SyntaxKind.TupleType: {
      const tuple = typeNode as ts.TupleTypeNode
      const elements = tuple.elements.map(el => mapTsTypeToScala(el, false))
      return `(${elements.join(', ')})`
    }
    case ts.SyntaxKind.FunctionType: {
      const func = typeNode as ts.FunctionTypeNode
      const params = func.parameters.map(param => {
        if (param.type) {
          return mapTsTypeToScala(param.type, false)
        }
        return 'Any'
      })
      const returnType = mapTsTypeToScala(func.type, false)
      
      if (params.length === 0) {
        return `() => ${returnType}`
      } else if (params.length === 1) {
        return `${params[0]} => ${returnType}`
      } else {
        return `(${params.join(', ')}) => ${returnType}`
      }
    }
    case ts.SyntaxKind.LiteralType: {
      const literal = typeNode as ts.LiteralTypeNode
      if (ts.isStringLiteral(literal.literal)) {
        // Convert single quotes to double quotes for Scala
        return `"${literal.literal.text}"`
      }
      // Handle null literal specifically
      if (literal.literal.kind === ts.SyntaxKind.NullKeyword) {
        return 'Null'
      }
      return literal.getText()
    }
    case ts.SyntaxKind.TypeLiteral: {
      // Handle inline object types like { theme: string; debug: boolean }
      const typeLit = typeNode as ts.TypeLiteralNode
      const members: string[] = []
      
      for (const member of typeLit.members) {
        if (ts.isPropertySignature(member) && member.type && ts.isIdentifier(member.name)) {
          const propName = member.name.text
          const propType = mapTsTypeToScala(member.type, false)
          members.push(`${propName}: ${propType}`)
        }
      }
      
      return `{${members.join('; ')}}`
    }
    default:
      return typeNode.getText()
  }
} 