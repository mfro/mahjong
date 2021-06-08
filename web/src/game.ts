import alea from 'alea';

import { nextTile, previousTile, Suit, TileKind, tiles, WindKind } from './tiles';
import { Packet } from '@mfro/ts-common/sockets';
import { assert } from '@mfro/ts-common/assert';
import { shallowReactive } from '@vue/reactivity';

export interface BaseTile {
  id: number;
}

export interface KnownTile extends BaseTile {
  kind: TileKind
}

export type Tile = BaseTile | KnownTile;

export interface GameView {
  dealer: number;
  prevailing: WindKind;

  deck: Tile[];
  doraIndicators: KnownTile[];

  players: Player[];
}

export interface MasterView extends GameView {
  deck: KnownTile[];
  players: KnownPlayer[];
}

export interface Meld {
  tiles: Tile[];
  extended: boolean;
  claimedPlayer: number;
}

export interface ConcealedKan {
  kind: TileKind[];
  tiles: Tile[];
}

export interface Player {
  hand: Tile[];
  draw: Tile | null;
  discard: KnownTile[];
  discarded: Set<TileKind>;
  open: Meld[];
  declaredKan: ConcealedKan[];
}

export interface KnownPlayer extends Player {
  hand: KnownTile[];
  draw: KnownTile | null;
}

export interface Game {
  state: GameView;
  phase: GamePhase;
  local: number | null;

  pass(player: number): void;
  call(player: number, meld: Meld): void;
  discard(tile: Tile): void;
  declareKan(kind: TileKind, tiles: Tile[]): void;
}

interface PendingCall {
  player: number;
  meld: Meld;
}

export type GamePhase =
  | { type: 'complete' }
  | { type: 'discarding', player: number }
  | { type: 'calling', player: number, pending: PendingCall[] };

// const StartGame = Packet.define<{ dealer: number, position: number, prevailing: WindKind, doraIndicators: TileKind[], tilesRemaining: number, hand: TileKind[] }>();
// const PlayerDraw = Packet.define<{ position: number, tile: null | TileKind }>();
// const PlayerDiscard = Packet.define<{ position: number, tile: TileKind }>();
// const PlayerCall = Packet.define<{ position: number, claimedPlayer: number, revealed: TileKind[] }>();
// const PlayerDeclareKan = Packet.define<{ tile: TileKind, doraIndicator: number }>();

/** To the left */
export function nextPlayer(state: GameView, player: number) {
  const index = (player + 1) % state.players.length;
  return index < 0 ? index + state.players.length : index;
}

/** To the right */
export function previousPlayer(state: GameView, player: number) {
  const index = (player - 1) % state.players.length;
  return index < 0 ? index + state.players.length : index;
}

/** To the right */
export function otherPlayers(state: GameView, player: number) {
  const list = [];
  for (let i = nextPlayer(state, player); i != player; i = nextPlayer(state, i)) {
    list.push(i);
  }
  return list;
}

/** Find all winning hands using a drawn or discarded tile */
export function findHands(seed: TileKind, hand: TileKind[]) {
  return [];
}

/** Check if the hand can call a pon on a drawn or discarded tile */
export function canPon(seed: TileKind, hand: TileKind[]) {
  return hand.filter(k => k == seed).length >= 2;
}

/** Check if the hand can call a kan on a drawn or discarded tile */
export function canKan(seed: TileKind, hand: TileKind[]) {
  return hand.filter(k => k == seed).length >= 3;
}

/** Find all chii that can be called on a drawn or discarded tile */
export function findChii(seed: TileKind, hand: TileKind[]) {
  return allChii(seed)
    .filter(meld => meld.every(k => hand.includes(k)));
}

/** Find all chii that include a specified tile */
export function allChii(seed: TileKind) {
  if (seed.suit == Suit.Wind || seed.suit == Suit.Dragon)
    return [];

  const list = [];

  const p1 = nextTile(seed);
  const p2 = nextTile(p1);
  const m1 = previousTile(seed);
  const m2 = previousTile(m1);

  if (seed.value < 8)
    list.push([p1, p2]);

  if (seed.value < 9 && seed.value > 1)
    list.push([m1, p1]);

  if (seed.value > 2)
    list.push([m2, m1]);

  return list;
}

export function newDeck(seed: number): KnownTile[] {
  const pool: TileKind[] = [];
  for (const kind of tiles.cracks) for (let i = 0; i < 4; ++i) pool.push(kind);
  for (const kind of tiles.sticks) for (let i = 0; i < 4; ++i) pool.push(kind);
  for (const kind of tiles.balls) for (let i = 0; i < 4; ++i) pool.push(kind);
  for (let i = 0; i < 4; ++i) pool.push(tiles.dragons.red);
  for (let i = 0; i < 4; ++i) pool.push(tiles.dragons.green);
  for (let i = 0; i < 4; ++i) pool.push(tiles.dragons.white);
  for (let i = 0; i < 4; ++i) pool.push(tiles.winds.east);
  for (let i = 0; i < 4; ++i) pool.push(tiles.winds.west);
  for (let i = 0; i < 4; ++i) pool.push(tiles.winds.north);
  for (let i = 0; i < 4; ++i) pool.push(tiles.winds.south);

  const deck: KnownTile[] = [];

  const random = alea(seed);

  while (pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    const kind = pool.splice(index, 1)[0];
    deck.push({ id: deck.length, kind });
  }

  return deck;
}

export function newLocalGame(seed: number): Game {
  const dealer = 0;
  const prevailing = WindKind.East;

  const deck = shallowReactive(newDeck(seed));
  const doraIndicators: KnownTile[] = shallowReactive([]);

  doraIndicators.push(deck[4]);

  const players: KnownPlayer[] = shallowReactive([]);

  for (let i = 0; i < 4; ++i) {
    const hand = deck.splice(deck.length - 13);

    players.push(shallowReactive({
      hand: shallowReactive(hand),
      draw: null,
      discard: shallowReactive([]),
      discarded: shallowReactive(new Set()),
      open: shallowReactive([]),
      declaredKan: shallowReactive([]),
    }));
  }

  const state: GameView = shallowReactive({
    dealer,
    prevailing,
    deck,
    doraIndicators,
    players,
  });

  function doDraw(player: number): GamePhase {
    if (deck.length == 14) return { type: 'complete' };
    const next = deck.pop();
    assert(next != null, 'empty deck');

    players[player].draw = next;
    return { type: 'discarding', player };
  }

  function doCalling(player: number, order: number): GamePhase {
    const seed = players[player].discard[players[player].discard.length - 1];

    const pending: PendingCall[] = [];
    for (const other of otherPlayers(state, player)) {
      const tiles = players[other].hand;
      const kinds = tiles.map(t => t.kind);

      if (canPon(seed.kind, kinds)) {
        pending.push({
          player: other,
          meld: {
            tiles: [seed, ...tiles.filter(t => t.kind == seed.kind).slice(0, 2)],
            extended: false,
            claimedPlayer: player,
          },
        });
      }

      if (canKan(seed.kind, kinds)) {
        pending.push({
          player: other,
          meld: {
            tiles: [seed, ...tiles.filter(t => t.kind == seed.kind).slice(0, 3)],
            extended: false,
            claimedPlayer: player,
          },
        });
      }

      if (other == nextPlayer(state, player)) {
        for (const chii of findChii(seed.kind, kinds)) {
          const mapped = chii.map(k => tiles.find(t => t.kind == k)!);
          pending.push({
            player: other,
            meld: {
              tiles: [seed, ...mapped],
              extended: false,
              claimedPlayer: player,
            },
          });
        }
      }
    }

    if (pending.length == 0)
      return doDraw(nextPlayer(state, player));

    return { type: 'calling', player, pending };
  }

  const game: Game = shallowReactive({
    state,
    local: 0,
    phase: doDraw(0),

    pass(player) {
      assert(game.phase.type == 'calling', 'calling phase');

      while (true) {
        const index = game.phase.pending.findIndex(p => p.player == player);
        if (index == -1) break;
        game.phase.pending.splice(index, 1);
      }

      if (game.phase.pending.length == 0) {
        game.phase = doDraw(nextPlayer(state, player));
      }
    },

    call(player, meld) {
      assert(game.phase.type == 'calling', 'calling phase');

      const index = game.phase.pending.findIndex(p => p.player == player && p.meld == meld);
      assert(index != -1, 'calling player');

      const target = game.state.players[player];
      target.open.push(meld);

      for (const tile of meld.tiles.slice(1)) {
        const index = target.hand.indexOf(tile);
        target.hand.splice(index, 1);
      }

      const victim = game.state.players[game.phase.player];
      victim.discard.pop();

      game.phase = { type: 'discarding', player };
    },

    discard(tile) {
      assert(game.phase.type == 'discarding', 'discarding phase');
      const player = players[game.phase.player];

      assert('kind' in tile, 'discard known');

      if (tile != player.draw) {
        const index = player.hand.indexOf(tile);
        assert(index != -1, 'discard tile');

        player.hand.splice(index, 1);

        if (player.draw !== null) {
          player.hand.push(player.draw);
        }
      } else {
        assert(tile == player.draw, 'discard tile');
      }

      player.draw = null;
      player.discard.push(tile);
      player.discarded.add(tile.kind);

      game.phase = doCalling(game.phase.player, 0);
    },

    declareKan(kind, tiles) {
      assert(game.phase.type == 'discarding', 'discarding phase');
      const player = players[game.phase.player];

      assert(false, 'todo');
    },
  });

  return game;
}
