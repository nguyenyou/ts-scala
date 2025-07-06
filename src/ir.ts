export type Declaration = ScalaTrait;

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