import { never, unique } from '@/util';
import { assert } from '@mfro/ts-common/assert';

export interface Tile {
  readonly kind: TileKind;
  readonly isRed: boolean;
}

export namespace Tile {
  export function plain(kind: TileKind): Tile {
    return Object.freeze({
      kind,
      isRed: false,
    });
  }

  export function equals(a: Tile, b: Tile): boolean {
    return a.kind == b.kind
      && a.isRed == b.isRed;
  }

  export function compare(a: Tile, b: Tile) {
    return TileKind.compare(a.kind, b.kind)
      || (a.isRed != b.isRed ? (a.isRed ? 1 : -1) : 0);
  }
}

export enum Suit {
  Cracks,
  Sticks,
  Balls,
  Dragon,
  Wind,
}

export enum Wind { East, West, North, South }
export enum Dragon { Red, Green, White }
export type TileNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TileKind =
  | { readonly suit: Suit.Cracks | Suit.Sticks | Suit.Balls, readonly value: TileNumber }
  | { readonly suit: Suit.Dragon, readonly value: Dragon }
  | { readonly suit: Suit.Wind, readonly value: Wind };

export namespace TileKind {
  export const all: TileKind[] = [];

  function define(suit: Suit.Cracks | Suit.Sticks | Suit.Balls, value: TileNumber): TileKind;
  function define(suit: Suit.Dragon, value: Dragon): TileKind;
  function define(suit: Suit.Wind, value: Wind): TileKind;
  function define(suit: Suit, value: TileNumber | Wind | Dragon): TileKind {
    const tile = Object.freeze({ suit, value }) as TileKind;

    all.push(tile);

    return tile;
  }

  export const cracks = [
    define(Suit.Cracks, 1),
    define(Suit.Cracks, 2),
    define(Suit.Cracks, 3),
    define(Suit.Cracks, 4),
    define(Suit.Cracks, 5),
    define(Suit.Cracks, 6),
    define(Suit.Cracks, 7),
    define(Suit.Cracks, 8),
    define(Suit.Cracks, 9),
  ];

  export const sticks = [
    define(Suit.Sticks, 1),
    define(Suit.Sticks, 2),
    define(Suit.Sticks, 3),
    define(Suit.Sticks, 4),
    define(Suit.Sticks, 5),
    define(Suit.Sticks, 6),
    define(Suit.Sticks, 7),
    define(Suit.Sticks, 8),
    define(Suit.Sticks, 9),
  ];

  export const balls = [
    define(Suit.Balls, 1),
    define(Suit.Balls, 2),
    define(Suit.Balls, 3),
    define(Suit.Balls, 4),
    define(Suit.Balls, 5),
    define(Suit.Balls, 6),
    define(Suit.Balls, 7),
    define(Suit.Balls, 8),
    define(Suit.Balls, 9),
  ];

  export const east = define(Suit.Wind, Wind.East);
  export const south = define(Suit.Wind, Wind.South);
  export const west = define(Suit.Wind, Wind.West);
  export const north = define(Suit.Wind, Wind.North);

  export const red = define(Suit.Dragon, Dragon.Red);
  export const green = define(Suit.Dragon, Dragon.Green);
  export const white = define(Suit.Dragon, Dragon.White);

  export function next(tile: TileKind): TileKind {
    if (tile.suit == Suit.Wind) {
      if (tile.value == Wind.East)
        return south;

      if (tile.value == Wind.South)
        return west;

      if (tile.value == Wind.West)
        return north;

      if (tile.value == Wind.North)
        return east;

      assert(false, 'impossible');
    }

    if (tile.suit == Suit.Dragon) {
      if (tile.value == Dragon.White)
        return green;

      if (tile.value == Dragon.Green)
        return red;

      if (tile.value == Dragon.Red)
        return white;

      assert(false, 'impossible');
    }

    if (tile.suit == Suit.Cracks)
      return cracks[tile.value % 9];

    if (tile.suit == Suit.Sticks)
      return sticks[tile.value % 9];

    if (tile.suit == Suit.Balls)
      return balls[tile.value % 9];

    assert(false, 'impossible');
  }

  export function previous(tile: TileKind): TileKind {
    if (tile.suit == Suit.Wind) {
      if (tile.value == Wind.East)
        return north;

      if (tile.value == Wind.North)
        return west;

      if (tile.value == Wind.West)
        return south;

      if (tile.value == Wind.South)
        return east;

      assert(false, 'impossible');
    }

    if (tile.suit == Suit.Dragon) {
      if (tile.value == Dragon.White)
        return red;

      if (tile.value == Dragon.Red)
        return green;

      if (tile.value == Dragon.Green)
        return white;

      assert(false, 'impossible');
    }

    if (tile.suit == Suit.Cracks)
      return cracks[(tile.value + 7) % 9];

    if (tile.suit == Suit.Sticks)
      return sticks[(tile.value + 7) % 9];

    if (tile.suit == Suit.Balls)
      return balls[(tile.value + 7) % 9];

    assert(false, 'impossible');
  }

  export function compare(a: TileKind, b: TileKind) {
    return all.indexOf(a) - all.indexOf(b);
  }

  export function get(suit: Suit.Cracks | Suit.Sticks | Suit.Balls, value: TileNumber): TileKind;
  export function get(suit: Suit.Dragon, value: Dragon): TileKind;
  export function get(suit: Suit.Wind, value: Wind): TileKind;
  export function get(suit: Suit, value: number) {
    return all.find(k => k.suit == suit && k.value == value);
  }

  export function numbered(suit: Suit.Cracks | Suit.Sticks | Suit.Balls) {
    if (suit == Suit.Cracks) return cracks;
    if (suit == Suit.Sticks) return sticks;
    if (suit == Suit.Balls) return balls;
    never(suit);
  }
}

export type Meld = Tile[] & { _meld: true };
export type MeldKind = readonly TileKind[] & { _meld: true };

export namespace Meld {
  export function of(tiles: Tile[]): Meld {
    return tiles as Meld;
  }


  export const all: MeldKind[] = [];
  function define(a: TileKind[]): MeldKind {
    const tiles = Object.freeze(a) as MeldKind;
    all.push(tiles);
    return tiles;
  }

  export const allThrees = TileKind.all.map(t => define([t, t, t]));
  export const allFours = TileKind.all.map(t => define([t, t, t, t]));
  export const allSequences = [TileKind.cracks, TileKind.sticks, TileKind.balls].flatMap(suit => [
    define([suit[0], suit[1], suit[2]]),
    define([suit[1], suit[2], suit[3]]),
    define([suit[2], suit[3], suit[4]]),
    define([suit[3], suit[4], suit[5]]),
    define([suit[4], suit[5], suit[6]]),
    define([suit[5], suit[6], suit[7]]),
    define([suit[6], suit[7], suit[8]]),
  ]);

  export function getSequenceOptions(kind: TileKind) {
    if (kind.suit == Suit.Dragon || kind.suit == Suit.Wind) {
      return [];
    } else {
      const index = TileKind.numbered(kind.suit);
      const get = (n: number) => index[n - 1];

      const results = [];

      if (kind.value > 2)
        results.push([get(kind.value - 2), get(kind.value - 1)]);
      if (kind.value > 1 && kind.value < 9)
        results.push([get(kind.value - 1), get(kind.value + 1)]);
      if (kind.value < 8)
        results.push([get(kind.value + 1), get(kind.value + 2)]);

      return results;
    }
  }

  export function isIdentical(a: Meld, b: Meld) {
    const tiles = unique(a, Tile.equals);
    return tiles.every(tile => {
      const aTiles = a.filter(t => Tile.equals(t, tile));
      const bTiles = b.filter(t => Tile.equals(t, tile));
      return aTiles.length == bTiles.length;
    });
  }

  export function getRest(meld: Meld, kind: TileKind) {
    const rest = [...meld];
    const index = rest.findIndex(tile => tile.kind == kind);
    assert(index != -1, 'invalid meld');
    rest.splice(index, 1);
    return rest;
  }

  export function isTriple(tiles: Meld): boolean {
    const unique = new Set(tiles.map(t => t.kind));
    return tiles.length == 3 && unique.size == 1;
  }

  export function isQuad(tiles: Meld): boolean {
    const unique = new Set(tiles.map(t => t.kind));
    return tiles.length == 4 && unique.size == 1;
  }

  export function isSet(tiles: Meld): boolean {
    const unique = new Set(tiles.map(t => t.kind));
    return unique.size == 1;
  }

  export function isSequence(tiles: Meld): boolean {
    const suits = new Set(tiles.map(t => t.kind.suit));
    const numbers = tiles.map(t => t.kind.value);
    return tiles.length == 3 && suits.size == 1 && numbers.some(t => numbers.includes(t + 1) && numbers.includes(t + 2));
  }
}
