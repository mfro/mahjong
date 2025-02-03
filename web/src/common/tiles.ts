import { assert } from '@mfro/ts-common/assert';

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

export type Tile =
  | { suit: Suit.Cracks | Suit.Sticks | Suit.Balls, value: TileNumber }
  | { suit: Suit.Dragon, value: Dragon }
  | { suit: Suit.Wind, value: Wind };

export namespace Tile {
  export const all: Tile[] = [];

  function define(suit: Suit.Cracks | Suit.Sticks | Suit.Balls, value: TileNumber): Tile;
  function define(suit: Suit.Dragon, value: Dragon): Tile;
  function define(suit: Suit.Wind, value: Wind): Tile;
  function define(suit: Suit, value: TileNumber | Wind | Dragon): Tile {
    const tile = Object.freeze({ suit, value }) as Tile;

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

  export function next(tile: Tile): Tile {
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

  export function previous(tile: Tile): Tile {
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

  export function compare(a: Tile, b: Tile) {
    return all.indexOf(a) - all.indexOf(b);
  }
}

export type Meld = Tile[] & { _meld: true };

export namespace Meld {
  export const all: Meld[] = [];
  function define(a: Tile[]): Meld {
    const meld = Object.freeze(a) as Meld;
    all.push(meld);
    return meld
  }

  export const allThrees = Tile.all.map(t => define([t, t, t]));
  export const allFours = Tile.all.map(t => define([t, t, t, t]));
  export const allSequences = [Tile.cracks, Tile.sticks, Tile.balls].flatMap(suit => [
    define([suit[0], suit[1], suit[2]]),
    define([suit[1], suit[2], suit[3]]),
    define([suit[2], suit[3], suit[4]]),
    define([suit[3], suit[4], suit[5]]),
    define([suit[4], suit[5], suit[6]]),
    define([suit[5], suit[6], suit[7]]),
    define([suit[6], suit[7], suit[8]]),
  ]);

  export function three(tile: Tile) {
    const meld = allThrees.find(meld => meld[0] == tile);
    assert(meld != null, 'invalid three');
    return meld;
  }

  export function four(tile: Tile) {
    const meld = allFours.find(meld => meld[0] == tile);
    assert(meld != null, 'invalid four');
    return meld;
  }

  export function sequence(tiles: Tile[]) {
    const meld = allSequences.find(meld => tiles.every(tile => meld.includes(tile)));
    assert(meld != null, 'invalid sequence');
    return meld;
  }

  export function equals(a: Tile[], b: Tile[]) {
    return a.every(t => b.includes(t)) && b.every(t => a.includes(t));
  }

  export function isThree(tiles: Tile[]): boolean {
    const unique = new Set(tiles);
    return tiles.length == 3 && unique.size == 1;
  }

  export function isFour(tiles: Tile[]): boolean {
    const unique = new Set(tiles);
    return tiles.length == 4 && unique.size == 1;
  }

  export function isSequence(tiles: Tile[]): boolean {
    const suits = new Set(tiles.map(t => t.suit));
    const numbers = tiles.map(t => t.value);
    return tiles.length == 3 && suits.size == 1 && numbers.some(t => numbers.includes(t + 1) && numbers.includes(t + 2));
  }
}
