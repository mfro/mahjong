import master from './assets/tiles.svg?raw';
import { assert } from '@mfro/ts-common/assert';
import { Suit, Tile } from './common';

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

function getArtName(artName: string) {
  const art = artLookup.get(artName);
  assert(art != null, `tile not found: ${artName}`);

  return art;
}

export function getArt(tile: Tile) {
  if (tile.suit == Suit.Cracks)
    return getArtName(`cracks/${tile.value}`);

  else if (tile.suit == Suit.Sticks)
    return getArtName(`sticks/${tile.value}`);

  else if (tile.suit == Suit.Balls)
    return getArtName(`balls/${tile.value}`);

  else if (tile == Tile.red)
    return getArtName('honor/red dragon');

  else if (tile == Tile.green)
    return getArtName('honor/green dragon');

  else if (tile == Tile.white)
    return getArtName('honor/white dragon');

  else if (tile == Tile.east)
    return getArtName('honor/east wind');

  else if (tile == Tile.west)
    return getArtName('honor/west wind');

  else if (tile == Tile.north)
    return getArtName('honor/north wind');

  else if (tile == Tile.south)
    return getArtName('honor/south wind');

  else
    assert(false, 'invalid suit');
}
