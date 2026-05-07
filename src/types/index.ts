/* ─────────────────────────────────────────────
 * MYTHOS Lorekeeper — Core Data Types (Mobile)
 * Web ile birebir uyumlu tip tanımları.
 * ───────────────────────────────────────────── */

// ── Entity (Karakter / Mekan / Olay) ──
export type EntityType = 'character' | 'place' | 'event';

export type RelationType = 'friend' | 'enemy' | 'neutral';

export interface Connection {
  id: string;
  universeId?: string;
  sourceId: string;
  targetId: string;
  relation: RelationType;
}

export interface Entity {
  id: string;
  universeId?: string;
  name: string;
  type: EntityType;
  era: string;
  status: string;
  description: string;
  domains: string[];
  linkCount: number;
}

// ── Mitoloji ──
export interface MythCard {
  id: string;
  universeId?: string;
  tier: string;
  glyph: string;
  name: string;
  epithet: string;
  color: string;
  description: string;
  domains: string[];
}

// ── Zaman Çizelgesi ──
export interface TimelineEvent {
  id: string;
  universeId?: string;
  era: string;
  year: string;
  name: string;
  description: string;
  color: string;
  position: number;
  side: 'above' | 'below';
}

// ── Harita Bölgesi ──
export interface MapRegion {
  id: string;
  universeId?: string;
  name: string;
  type: string;
  color: string;
  opacity: number;
  svgPath: string;
  description: string;
}

// ── Dil & Alfabe ──
export interface LanguageGlyph {
  char: string;
  label: string;
}

export interface LanguagePhrase {
  original: string;
  transcription: string;
  meaning: string;
}

export interface LanguagePhonetic {
  source: string;
  equivalent: string;
}

export interface Language {
  id: string;
  universeId?: string;
  name: string;
  glyphs: LanguageGlyph[];
  phrases: LanguagePhrase[];
  info: string;
  phonetics: LanguagePhonetic[];
  family: string;
  writingDirection: string;
}

// ── Notlar ──
export interface Note {
  id: string;
  universeId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ── Evren ──
export interface Universe {
  id: string;
  name: string;
  summary: string;
  tone: string;
  createdAt: string;
}
