import CodeBlockWriter from 'code-block-writer';
import type { Declaration, ScalaTrait, ValMember } from './ir';

export function emitScala(declarations: Declaration[]): string {
  const writer = new CodeBlockWriter({ indentNumberOfSpaces: 2 });

  declarations.forEach((decl, declIndex) => {
    if (decl.kind === 'trait') {
      emitTrait(writer, decl);
      if (declIndex < declarations.length - 1) {
        writer.blankLine();
      }
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