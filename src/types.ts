export interface SetInfo {
  name: string;
  total: number;
  common_land: number;
  common: number;
  uncommon: number;
  rare: number;
  mythic: number;
}

export interface SetsData {
  [setCode: string]: SetInfo;
}

export interface CardPrice {
  eur?: string;
  usd?: string;
}

export interface Card {
  n: string; // name
  s: string; // set
  r: string; // rarity
  f: string[]; // finishes
  i: string; // image URL
  p?: CardPrice; // prices
}

export interface CardsData {
  [cardId: string]: Card;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'common_land';

export interface CardNameEntry {
  n: string; // name
  i: string; // img
  s: string; // set
  r: Rarity; // rarity
  p?: CardPrice; // prices
}

export type CardNamesData = CardNameEntry[];
