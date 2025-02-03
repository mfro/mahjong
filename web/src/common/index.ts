import { filterMap } from '@/util';
import { Meld, Tile, Wind } from './tiles';
import { assert } from '@mfro/ts-common/assert';

export * from './tiles';

export interface Game {
  dealer: number;
  prevailing: Wind;

  deck: Tile[];

  players: Player[];

  state: GameState;
}

export interface OpenMeld {
  value: Meld;
  claimed: Tile;
  claimedFrom: number;
}

export interface Player {
  hand: Tile[];
  draw: Tile | null;
  discard: Tile[];
  open: OpenMeld[];
  declaredFours: Tile[];
}

export namespace Player {
  export function getAllTiles(player: Player) {
    return [
      ...player.declaredFours.flat(),
      ...player.open.flatMap(meld => meld.value),
      ...player.hand,
    ];
  }
}

export type Hand =
  | { melds: Meld[]; pair: Tile[] }
  | { pairs: Tile[][] }
  | { orphans: Tile[]; pair: Tile[] };

interface Call {
  player: number;
  result: Meld;
}

export type GameState =
  | { type: 'done' }
  | { type: 'discarding', player: number }
  | { type: 'calling', from: number, tile: Tile, pending: Call[], called: Call[] };

export type Input =
  | { type: 'declare four', tile: Tile }
  | { type: 'discard', tile: Tile }
  | { type: 'call', player: number, meld: Meld }
  | { type: 'pass', player: number }

export namespace Game {
  /** To the right */
  export function nextPlayer(state: Game, player: number) {
    const index = (player + 1) % state.players.length;
    return index < 0 ? index + state.players.length : index;
  }

  /** To the left */
  export function previousPlayer(state: Game, player: number) {
    const index = (player - 1) % state.players.length;
    return index < 0 ? index + state.players.length : index;
  }

  export function otherPlayers(state: Game, player: number) {
    const list = [];
    for (let i = nextPlayer(state, player); i != player; i = nextPlayer(state, i)) {
      list.push(i);
    }
    return list;
  }

  export function isHandComplete(hand: Tile[]) {
    assert(hand.length == 14, 'invalid hand');

    const hands = buildHands(hand);

    // TODO winning conditions

    return hands.length > 0;
  }

  export function buildHands(hand: Tile[]): Hand[] {
    if (hand.length == 2) {
      if (hand[0] == hand[1])
        return [{ melds: [], pair: hand }];

      return [];
    }

    const list = [];
    for (const meld of Meld.all) {
      const next = hand.slice();
      const valid = meld.every(kind => {
        const index = next.indexOf(kind);
        if (index == -1) return false;
        next.splice(index, 1);
        return true;
      });

      if (valid) {
        for (const base of buildHands(next)) {
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
  export function findWaits(melds: Meld[], hand: Tile[]) {
    const waits = [];

    for (const seed of Tile.all) {
      const hands = buildHands([seed, ...hand]);
      if (hands.length == 0) return;

      waits.push({ seed, hands });
    }

    return waits;
  }

  /** Check if the hand can call a three on a discarded tile */
  export function canCallThree(seed: Tile, hand: Tile[]) {
    const matches = hand.filter(k => k == seed);
    return matches.length >= 2;
  }

  /** Check if the hand can call a four on a discarded tile */
  export function canCallFour(seed: Tile, hand: Tile[]) {
    const matches = hand.filter(k => k == seed);
    return matches.length >= 3;
  }

  /** Find all sequences that can be called on a discarded tile */
  export function findSequences(seed: Tile, hand: Tile[]): Meld[] {
    return filterMap(Meld.allSequences, meld => {
      const others = meld.filter(t => t != seed);
      if (others.length == 2 && others.every(t => hand.includes(t))) {
        return meld;
      }
    });
  }

  export function newDeck(): Tile[] {
    const pool = [
      ...Tile.all,
      ...Tile.all,
      ...Tile.all,
      ...Tile.all,
    ];
    const deck = [];

    while (pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      const kind = pool.splice(index, 1)[0];
      deck.push(kind);
    }

    return deck;
  }

  export function create(): Game {
    const dealer = 0;
    const prevailing = Wind.East;

    const deck = newDeck();
    const players: Player[] = [];

    for (let i = 0; i < 4; ++i) {
      const hand = deck.splice(deck.length - 13);

      players.push({
        hand,
        draw: null,
        discard: [],
        open: [],
        declaredFours: [],
      });
    }

    const game: Game = {
      dealer,
      prevailing,
      deck,
      players,
      state: { type: 'done' },
    };

    draw(game, game.dealer);

    return game;
  }

  export function getDeclaredFours(game: Game) {
    const fours = game.players
      .flatMap(p => p.declaredFours);

    return fours;
  }

  export function getBonusIndicators(game: Game) {
    const fours = getDeclaredFours(game).length;

    const offset = 4 - fours;
    const list = [];

    for (let i = 0; i < fours + 1; ++i) {
      list.push(game.deck[offset + i * 2]);
    }
  }

  export function getHiddenBonusIndicators(game: Game) {
    const fours = game.players
      .map(p => p.declaredFours.length)
      .reduce((a, b) => a + b, 0);

    const offset = 4 - fours;
    const list = [];

    for (let i = 0; i < fours + 1; ++i) {
      list.push(game.deck[offset + i * 2]);
    }
  }

  export function applyFour(game: Game, player: number) {
    const drawTile = game.deck.shift();
    assert(drawTile != null, 'invalid deck state');

    game.players[player].draw = drawTile;
    game.state = { type: 'discarding', player };
  }

  export function draw(game: Game, player: number) {
    if (game.deck.length == 14) {
      game.state = { type: 'done' };
    } else {
      const next = game.deck.pop();
      assert(next != null, 'invalid draw');

      game.players[player].draw = next;
      game.state = { type: 'discarding', player };
    }
  }

  export function updateCallState(game: Game) {
    assert(game.state.type == 'calling', 'calling phase');

    if (game.state.pending.length > 0) return;

    if (game.state.called.length == 0) {
      draw(game, nextPlayer(game, game.state.from));
    } else {
      assert(game.state.called.length == 1, 'TODO call prioritization');

      const call = game.state.called[0];

      const target = game.players[call.player];
      target.open.push({
        value: call.result,
        claimed: game.state.tile,
        claimedFrom: game.state.from,
      });

      for (const tile of call.result.slice(1)) {
        const index = target.hand.indexOf(tile);
        target.hand.splice(index, 1);
      }

      const victim = game.players[game.state.from];
      victim.discard.pop();

      game.state = { type: 'discarding', player: call.player };
    }
  }

  export function isDiscarding(game: Game, player: Player) {
    return game.state.type == 'discarding'
      && game.players[game.state.player] == player;
  }

  export function getFourOptions(game: Game) {
    if (game.state.type != 'discarding' || getDeclaredFours(game).length == 4) {
      return [];
    }

    const player = game.players[game.state.player];
    const unique = [...new Set(player.hand)];
    const tiles = unique.filter(tile => player.hand.filter(t => tile == t).length == 4);
    return tiles;
  }

  export function discard(game: Game, tile: Tile) {
    assert(game.state.type == 'discarding', 'invalid discard');

    const player = game.players[game.state.player];
    if (player.draw) {
      player.hand.push(player.draw);
      player.draw = null;
    }

    const index = player.hand.indexOf(tile);
    assert(index != -1, 'invalid discard');

    player.hand.splice(index, 1);
    player.discard.push(tile);

    const pending: Call[] = [];
    for (const other of otherPlayers(game, game.state.player)) {
      const tiles = game.players[other].hand;

      if (canCallThree(tile, tiles)) {
        pending.push({
          player: other,
          result: Meld.three(tile),
        });
      }

      if (canCallFour(tile, tiles)) {
        pending.push({
          player: other,
          result: Meld.four(tile),
        });
      }

      if (other == nextPlayer(game, game.state.player)) {
        for (const sequence of findSequences(tile, tiles)) {
          pending.push({
            player: other,
            result: sequence,
          });
        }
      }
    }

    if (pending.length == 0) {
      draw(game, nextPlayer(game, game.state.player));
    } else {
      game.state = { type: 'calling', from: game.state.player, tile, pending, called: [] };
    }
  }

  export function declareFour(game: Game, tile: Tile) {
    assert(game.state.type == 'discarding', 'invalid discard');
    const player = game.players[game.state.player];

    for (let i = 0; i < 4; ++i) {
      const index = player.hand.indexOf(tile);
      assert(index != -1, 'invalid declare four');
      player.hand.splice(index);
    }

    player.declaredFours.push(tile);
  }

  export function call(game: Game, player: number, meld: Meld) {
    assert(game.state.type == 'calling', 'calling phase');

    const calls = game.state.pending.filter(p => p.player == player);
    game.state.pending = game.state.pending.filter(p => p.player != player);

    const call = calls.find(p => p.result == meld);
    assert(call != null, 'call exists');
    game.state.called.push(call);

    updateCallState(game);
  }

  export function pass(game: Game, player: number) {
    assert(game.state.type == 'calling', 'invalid call');

    const calls = game.state.pending.filter(p => p.player == player);
    for (const c of calls) {
      const index = game.state.pending.indexOf(c);
      assert(index != -1, 'call exists 2');
      game.state.pending.splice(index, 1);
    }

    updateCallState(game);
  }

  export function input(game: Game, input: Input) {
    if (input.type == 'discard') {
      discard(game, input.tile);
    } else if (input.type == 'declare four') {
      declareFour(game, input.tile);
    } else if (input.type == 'call') {
      call(game, input.player, input.meld);
    } else if (input.type == 'pass') {
      pass(game, input.player);
    }
  }
}
