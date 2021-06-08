import master from '!raw-loader!./assets/tiles.svg';
import { assert } from '@mfro/ts-common/assert';

const artLookup = load();

function load() {
  const parser = new DOMParser();
  const doc = parser.parseFromString(master, "image/svg+xml");
  const root = doc.documentElement;

  root.style.top = '0';
  root.style.left = '0';
  root.style.width = `1400px`;
  root.style.height = `980px`;
  root.style.position = 'fixed';

  document.body.appendChild(root);

  const lookup = new Map<string, string>();

  const container = root.children[0];
  for (const child of container.children) {
    const index = [...container.childNodes].indexOf(child);
    const name = container.childNodes[index - 2].textContent!.trim();

    const box = child.getBoundingClientRect();
    const viewBox = `${box.left} ${box.top} ${box.width} ${box.height}`;

    child.removeChild(child.firstElementChild!);

    const svgFile = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${child.outerHTML}</svg>`;

    const blob = new Blob([svgFile], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    lookup.set(name, url);
  }

  document.body.removeChild(root);

  return lookup;
}

function makeTile(artName: string, suit: Suit.Cracks | Suit.Sticks | Suit.Balls, value: NumberTile): TileKind;
function makeTile(artName: string, suit: Suit.Dragon, value: DragonKind): TileKind;
function makeTile(artName: string, suit: Suit.Wind, value: WindKind): TileKind;
function makeTile(artName: string, suit: Suit, value: NumberTile | WindKind | DragonKind): TileKind {
  const art = artLookup.get(artName);
  assert(art != null, `tile not found: ${artName}`);

  return { art, suit, value } as TileKind;
}

export function nextTile(tile: TileKind): TileKind {
  if (tile.suit == Suit.Wind) {
    if (tile.value == WindKind.East)
      return tiles.winds.south;

    if (tile.value == WindKind.South)
      return tiles.winds.west;

    if (tile.value == WindKind.West)
      return tiles.winds.north;

    if (tile.value == WindKind.North)
      return tiles.winds.east;

    assert(false, 'impossible');
  }

  if (tile.suit == Suit.Dragon) {
    if (tile.value == DragonKind.White)
      return tiles.dragons.green;

    if (tile.value == DragonKind.Green)
      return tiles.dragons.red;

    if (tile.value == DragonKind.Red)
      return tiles.dragons.white;

    assert(false, 'impossible');
  }

  if (tile.suit == Suit.Cracks)
    return tiles.cracks[tile.value % 9];

  if (tile.suit == Suit.Sticks)
    return tiles.sticks[tile.value % 9];

  if (tile.suit == Suit.Balls)
    return tiles.balls[tile.value % 9];

  assert(false, 'impossible');
}

export function previousTile(tile: TileKind): TileKind {
  if (tile.suit == Suit.Wind) {
    if (tile.value == WindKind.East)
      return tiles.winds.north;

    if (tile.value == WindKind.North)
      return tiles.winds.west;

    if (tile.value == WindKind.West)
      return tiles.winds.south;

    if (tile.value == WindKind.South)
      return tiles.winds.east;

    assert(false, 'impossible');
  }

  if (tile.suit == Suit.Dragon) {
    if (tile.value == DragonKind.White)
      return tiles.dragons.red;

    if (tile.value == DragonKind.Red)
      return tiles.dragons.green;

    if (tile.value == DragonKind.Green)
      return tiles.dragons.white;

    assert(false, 'impossible');
  }

  if (tile.suit == Suit.Cracks)
    return tiles.cracks[(tile.value + 7) % 9];

  if (tile.suit == Suit.Sticks)
    return tiles.sticks[(tile.value + 7) % 9];

  if (tile.suit == Suit.Balls)
    return tiles.balls[(tile.value + 7) % 9];

  assert(false, 'impossible');
}

export enum Suit {
  Cracks,
  Sticks,
  Balls,
  Dragon,
  Wind,
}

export enum WindKind { East, West, North, South }
export enum DragonKind { Red, Green, White }
export type NumberTile = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TileKind =
  | { art: string, suit: Suit.Cracks | Suit.Sticks | Suit.Balls, value: NumberTile }
  | { art: string, suit: Suit.Dragon, value: DragonKind }
  | { art: string, suit: Suit.Wind, value: WindKind };

export const tiles = {
  cracks: [
    makeTile('cracks/1', Suit.Cracks, 1),
    makeTile('cracks/2', Suit.Cracks, 2),
    makeTile('cracks/3', Suit.Cracks, 3),
    makeTile('cracks/4', Suit.Cracks, 4),
    makeTile('cracks/5', Suit.Cracks, 5),
    makeTile('cracks/6', Suit.Cracks, 6),
    makeTile('cracks/7', Suit.Cracks, 7),
    makeTile('cracks/8', Suit.Cracks, 8),
    makeTile('cracks/9', Suit.Cracks, 9),
  ],
  sticks: [
    makeTile('sticks/1', Suit.Sticks, 1),
    makeTile('sticks/2', Suit.Sticks, 2),
    makeTile('sticks/3', Suit.Sticks, 3),
    makeTile('sticks/4', Suit.Sticks, 4),
    makeTile('sticks/5', Suit.Sticks, 5),
    makeTile('sticks/6', Suit.Sticks, 6),
    makeTile('sticks/7', Suit.Sticks, 7),
    makeTile('sticks/8', Suit.Sticks, 8),
    makeTile('sticks/9', Suit.Sticks, 9),
  ],
  balls: [
    makeTile('balls/1', Suit.Balls, 1),
    makeTile('balls/2', Suit.Balls, 2),
    makeTile('balls/3', Suit.Balls, 3),
    makeTile('balls/4', Suit.Balls, 4),
    makeTile('balls/5', Suit.Balls, 5),
    makeTile('balls/6', Suit.Balls, 6),
    makeTile('balls/7', Suit.Balls, 7),
    makeTile('balls/8', Suit.Balls, 8),
    makeTile('balls/9', Suit.Balls, 9),
  ],
  dragons: {
    red: makeTile('honor/red dragon', Suit.Dragon, DragonKind.Red),
    green: makeTile('honor/green dragon', Suit.Dragon, DragonKind.Green),
    white: makeTile('honor/white dragon', Suit.Dragon, DragonKind.White),
  },
  winds: {
    east: makeTile('honor/east wind', Suit.Wind, WindKind.East),
    west: makeTile('honor/west wind', Suit.Wind, WindKind.West),
    north: makeTile('honor/north wind', Suit.Wind, WindKind.North),
    south: makeTile('honor/south wind', Suit.Wind, WindKind.South),
  },
};
