import * as ts from 'typescript'
import CodeBlockWriter from 'code-block-writer'
import { match } from 'ts-pattern'

export function convertTsToScala(tsSource: string): string {
  const writer = new CodeBlockWriter({ indentNumberOfSpaces: 2 })
  
  // Create a TypeScript source file
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    tsSource,
    ts.ScriptTarget.Latest,
    true
  )
  
  // Visit each node in the AST
  ts.forEachChild(sourceFile, visitNode)
  
  function visitNode(node: ts.Node): void {
    match(node.kind)
      .with(ts.SyntaxKind.InterfaceDeclaration, () => {
        convertInterface(node as ts.InterfaceDeclaration)
      })
      .otherwise(() => {
        ts.forEachChild(node, visitNode)
      })
  }
  
  function convertInterface(node: ts.InterfaceDeclaration): void {
    const interfaceName = node.name.text
    
    writer.write(`trait ${interfaceName} `).block(() => {
      // Convert interface members
      node.members.forEach((member, index) => {
        match(member)
          .when(ts.isPropertySignature, (prop) => {
            convertPropertySignature(prop)
            // Add newline between members except for the last one
            if (index < node.members.length - 1) {
              writer.newLine()
            }
          })
          .otherwise(() => {
            // Handle other member types in the future
          })
      })
    })
  }
  
  function convertPropertySignature(property: ts.PropertySignature): void {
    const propertyName = property.name?.getText()
    const propertyType = convertType(property.type)
    
    writer.write(`val ${propertyName}: ${propertyType}`)
  }
  
  function convertType(typeNode: ts.TypeNode | undefined): string {
    if (!typeNode) return 'Any'
    
    return match(typeNode.kind)
      .with(ts.SyntaxKind.StringKeyword, () => 'String')
      .with(ts.SyntaxKind.NumberKeyword, () => 'Int')
      .with(ts.SyntaxKind.BooleanKeyword, () => 'Boolean')
      .otherwise(() => 'Any')
  }
  
  return writer.toString()
}
