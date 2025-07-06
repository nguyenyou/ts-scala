export type Declaration = ScalaTrait | ScalaTypeAlias;

export interface ScalaTrait {
  kind: 'trait';
  name: string;
  members: TraitMember[];
}

export type TraitMember = ValMember;

export interface ValMember {
  kind: 'val';
  name: string;
  type: string;
}

export interface Diagnostic {
  message: string;
  start: number;
  end: number;
}

// New IR node for Scala type alias
export interface ScalaTypeAlias {
  kind: 'typeAlias';
  name: string;
  type: string;
} 