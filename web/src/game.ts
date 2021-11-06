import alea from 'alea';

import { Meld, allMelds, nextTile, previousTile, Suit, TileKind, tiles, WindKind, allTiles } from './tiles';
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

export interface OpenMeld {
  meld: Meld;
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
  open: OpenMeld[];
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
  call(player: number, meld: OpenMeld): void;
  discard(tile: Tile): void;
  declareKan(kind: TileKind, tiles: Tile[]): void;
}

interface Call {
  player: number;
  result: OpenMeld;
}

export type GamePhase =
  | { type: 'complete' }
  | { type: 'discarding', player: number }
  | { type: 'calling', player: number, pending: Call[], called: Call[] };

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

export type Hand =
  | { melds: TileKind[][]; pair: TileKind[] }
  | { pairs: TileKind[][] };

export function findHands(kinds: TileKind[]): Hand[] {
  if (kinds.length == 2) {
    if (kinds[0] == kinds[1])
      return [{ melds: [], pair: kinds }];

    return [];
  }

  const list = [];
  for (const meld of allMelds) {
    const next = kinds.slice();
    const valid = meld.every(kind => {
      const index = next.indexOf(kind);
      if (index == -1) return false;
      next.splice(index, 1);
      return true;
    });

    if (valid) {
      for (const base of findHands(next)) {
        assert('melds' in base, '7 pairs?');
        list.push({
          melds: [meld, ...base.melds],
          pair: base.pair,
        });
      }
    }
  }

  return list;
}

/** Find all tiles that would complete the specified hand */
export function findWaits(melds: TileKind[][], hand: TileKind[]) {
  const waits = [];

  for (const seed of allTiles) {
    const hands = findHands([seed, ...hand]);
    if (hands.length == 0) return;

    waits.push({ seed, hands });
  }

  return waits;
}

/** Check if the hand can call a pon on a drawn or discarded tile */
export function findPon(seed: KnownTile, hand: KnownTile[]): null | { meld: Meld, tiles: KnownTile[] } {
  const matches = hand.filter(k => k.kind == seed.kind);
  if (matches.length < 2) return null;

  const meld = allMelds.find(m => m.length == 3 && m.every(t => t == seed.kind));
  assert(meld != null, 'pon');
  return { meld, tiles: [seed, ...matches.slice(0, 2)] };
}

/** Check if the hand can call a kan on a drawn or discarded tile */
export function findKan(seed: KnownTile, hand: KnownTile[]): null | { meld: Meld, tiles: KnownTile[] } {
  const matches = hand.filter(k => k.kind == seed.kind);
  if (matches.length < 3) return null;

  const meld = allMelds.find(m => m.length == 4 && m.every(k => k == seed.kind));
  assert(meld != null, 'pon');
  return { meld, tiles: [seed, ...matches.slice(0, 3)] };
}

/** Find all chii that can be called on a drawn or discarded tile */
export function findChii(seed: KnownTile, hand: KnownTile[]): { meld: Meld, tiles: KnownTile[] }[] {
  return allMelds.map(m => {
    if (!m.includes(seed.kind) || m.every(k => k == seed.kind))
      return null;

    const tiles = m.map(k => k == seed.kind ? seed : hand.find(t => t.kind == k));
    if (tiles.some(t => t == null))
      return null;

    const index = tiles.indexOf(seed);
    tiles.splice(index, 1);
    tiles.splice(0, 0, seed);

    return { meld: m, tiles: tiles! };
  })
    .filter(v => v != null) as { meld: Meld, tiles: KnownTile[] }[];
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

  function doCalling(player: number): GamePhase {
    const seed = players[player].discard[players[player].discard.length - 1];

    const pending: Call[] = [];
    for (const other of otherPlayers(state, player)) {
      const tiles = players[other].hand;

      const pon = findPon(seed, tiles);
      if (pon != null) {
        pending.push({
          player: other,
          result: {
            ...pon,
            extended: false,
            claimedPlayer: player,
          },
        });
      }

      const kan = findKan(seed, tiles);
      if (kan != null) {
        pending.push({
          player: other,
          result: {
            ...kan,
            extended: false,
            claimedPlayer: player,
          },
        });
      }

      if (other == nextPlayer(state, player)) {
        for (const chii of findChii(seed, tiles)) {
          pending.push({
            player: other,
            result: {
              ...chii,
              extended: false,
              claimedPlayer: player,
            },
          });
        }
      }
    }

    if (pending.length == 0)
      return doDraw(nextPlayer(state, player));

    return { type: 'calling', player, pending, called: [] };
  }

  function updateCalling() {
    assert(game.phase.type == 'calling', 'calling phase');

    if (game.phase.pending.length > 0) return;

    let player;
    if (game.phase.called.length == 0) {
      player = nextPlayer(game.state, game.phase.player);
    } else {
      assert(game.phase.called.length == 1, 'TODO call prioritization');

      const call = game.phase.called[0];

      const target = game.state.players[call.player];
      target.open.push(call.result);

      for (const tile of call.result.tiles.slice(1)) {
        const index = target.hand.indexOf(tile);
        target.hand.splice(index, 1);
      }

      const victim = game.state.players[game.phase.player];
      victim.discard.pop();

      player = call.player;
    }

    game.phase = { type: 'discarding', player };
  }

  const game: Game = shallowReactive({
    state,
    local: 0,
    phase: doDraw(0),

    pass(player) {
      assert(game.phase.type == 'calling', 'calling phase');

      const calls = game.phase.pending.filter(p => p.player == player);

      for (const c of calls) {
        const index = game.phase.pending.indexOf(c);
        assert(index != -1, 'call exists 2');
        game.phase.pending.splice(index, 1);
      }

      updateCalling();
    },

    call(player, meld) {
      assert(game.phase.type == 'calling', 'calling phase');

      const calls = game.phase.pending.filter(p => p.player == player);
      for (const c of calls) {
        const index = game.phase.pending.indexOf(c);
        assert(index != -1, 'call exists 2');
        game.phase.pending.splice(index, 1);
      }

      const call = calls.find(p => p.result == meld);
      assert(call != null, 'call exists');
      game.phase.called.push(call);

      updateCalling();
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

      game.phase = doCalling(game.phase.player);
    },

    declareKan(kind, tiles) {
      assert(game.phase.type == 'discarding', 'discarding phase');
      const player = players[game.phase.player];

      assert(false, 'todo');
    },
  });

  return game;
}
