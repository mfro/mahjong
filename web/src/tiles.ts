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

export const allTiles = [
  ...tiles.cracks,
  ...tiles.sticks,
  ...tiles.balls,
  tiles.winds.east,
  tiles.winds.south,
  tiles.winds.west,
  tiles.winds.north,
  tiles.dragons.white,
  tiles.dragons.green,
  tiles.dragons.red,
];

export type Meld = TileKind[] & { _meld: true };

export const melds = {
  pon: {
    cracks: tiles.cracks.map(k => [k, k, k]) as Meld[],
    sticks: tiles.sticks.map(k => [k, k, k]) as Meld[],
    balls: tiles.balls.map(k => [k, k, k]) as Meld[],
    winds: {
      east: [tiles.winds.east, tiles.winds.east, tiles.winds.east] as Meld,
      west: [tiles.winds.west, tiles.winds.west, tiles.winds.west] as Meld,
      north: [tiles.winds.north, tiles.winds.north, tiles.winds.north] as Meld,
      south: [tiles.winds.south, tiles.winds.south, tiles.winds.south] as Meld,
    },
    dragons: {
      red: [tiles.dragons.red, tiles.dragons.red, tiles.dragons.red] as Meld,
      green: [tiles.dragons.green, tiles.dragons.green, tiles.dragons.green] as Meld,
      white: [tiles.dragons.white, tiles.dragons.white, tiles.dragons.white] as Meld,
    },
  },
  kan: {
    cracks: tiles.cracks.map(k => [k, k, k, k]) as Meld[],
    sticks: tiles.sticks.map(k => [k, k, k, k]) as Meld[],
    balls: tiles.balls.map(k => [k, k, k, k]) as Meld[],
    winds: {
      east: [tiles.winds.east, tiles.winds.east, tiles.winds.east, tiles.winds.east] as Meld,
      west: [tiles.winds.west, tiles.winds.west, tiles.winds.west, tiles.winds.west] as Meld,
      north: [tiles.winds.north, tiles.winds.north, tiles.winds.north, tiles.winds.north] as Meld,
      south: [tiles.winds.south, tiles.winds.south, tiles.winds.south, tiles.winds.south] as Meld,
    },
    dragons: {
      red: [tiles.dragons.red, tiles.dragons.red, tiles.dragons.red, tiles.dragons.red] as Meld,
      green: [tiles.dragons.green, tiles.dragons.green, tiles.dragons.green, tiles.dragons.green] as Meld,
      white: [tiles.dragons.white, tiles.dragons.white, tiles.dragons.white, tiles.dragons.white] as Meld,
    },
  },
  chii: {
    cracks: [
      [tiles.cracks[0], tiles.cracks[1], tiles.cracks[2]],
      [tiles.cracks[1], tiles.cracks[2], tiles.cracks[3]],
      [tiles.cracks[2], tiles.cracks[3], tiles.cracks[4]],
      [tiles.cracks[3], tiles.cracks[4], tiles.cracks[5]],
      [tiles.cracks[4], tiles.cracks[5], tiles.cracks[6]],
      [tiles.cracks[5], tiles.cracks[6], tiles.cracks[7]],
      [tiles.cracks[6], tiles.cracks[7], tiles.cracks[8]],
      [tiles.cracks[7], tiles.cracks[8], tiles.cracks[9]],
    ] as Meld[],
    sticks: [
      [tiles.sticks[0], tiles.sticks[1], tiles.sticks[2]],
      [tiles.sticks[1], tiles.sticks[2], tiles.sticks[3]],
      [tiles.sticks[2], tiles.sticks[3], tiles.sticks[4]],
      [tiles.sticks[3], tiles.sticks[4], tiles.sticks[5]],
      [tiles.sticks[4], tiles.sticks[5], tiles.sticks[6]],
      [tiles.sticks[5], tiles.sticks[6], tiles.sticks[7]],
      [tiles.sticks[6], tiles.sticks[7], tiles.sticks[8]],
      [tiles.sticks[7], tiles.sticks[8], tiles.sticks[9]],
    ] as Meld[],
    balls: [
      [tiles.balls[0], tiles.balls[1], tiles.balls[2]],
      [tiles.balls[1], tiles.balls[2], tiles.balls[3]],
      [tiles.balls[2], tiles.balls[3], tiles.balls[4]],
      [tiles.balls[3], tiles.balls[4], tiles.balls[5]],
      [tiles.balls[4], tiles.balls[5], tiles.balls[6]],
      [tiles.balls[5], tiles.balls[6], tiles.balls[7]],
      [tiles.balls[6], tiles.balls[7], tiles.balls[8]],
      [tiles.balls[7], tiles.balls[8], tiles.balls[9]],
    ] as Meld[],
  }
}

export const allMelds = [
  ...melds.pon.cracks,
  ...melds.pon.sticks,
  ...melds.pon.balls,
  ...melds.kan.cracks,
  ...melds.kan.sticks,
  ...melds.kan.balls,
  ...melds.chii.cracks,
  ...melds.chii.sticks,
  ...melds.chii.balls,
  melds.pon.winds.east,
  melds.pon.winds.west,
  melds.pon.winds.north,
  melds.pon.winds.south,
  melds.pon.dragons.red,
  melds.pon.dragons.green,
  melds.pon.dragons.white,
  melds.kan.winds.east,
  melds.kan.winds.west,
  melds.kan.winds.north,
  melds.kan.winds.south,
  melds.kan.dragons.red,
  melds.kan.dragons.green,
  melds.kan.dragons.white,
] as Meld[];
