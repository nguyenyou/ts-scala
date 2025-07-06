import CodeBlockWriter from 'code-block-writer';
import type { Declaration, ScalaTrait, ScalaTypeAlias, ValMember } from './ir';

export function emitScala(declarations: Declaration[]): string {
  const writer = new CodeBlockWriter({ indentNumberOfSpaces: 2 });

  declarations.forEach((decl, declIndex) => {
    switch (decl.kind) {
      case 'trait':
        emitTrait(writer, decl);
        break;
      case 'typeAlias':
        emitTypeAlias(writer, decl);
        break;
    }

    if (declIndex < declarations.length - 1) {
      writer.blankLine();
    }
  });

  return writer.toString();
}

function emitTrait(writer: CodeBlockWriter, traitDecl: ScalaTrait): void {
  writer.write(`trait ${traitDecl.name} `).block(() => {
    traitDecl.members.forEach((member, index) => {
      if (member.kind === 'val') {
        emitVal(writer, member);
        if (index < traitDecl.members.length - 1) {
          writer.newLine();
        }
      }
    });
  });
}

function emitVal(writer: CodeBlockWriter, member: ValMember): void {
  writer.write(`val ${member.name}: ${member.type}`);
}

function emitTypeAlias(writer: CodeBlockWriter, alias: ScalaTypeAlias): void {
  writer.write(`type ${alias.name} = ${alias.type}`);
} 