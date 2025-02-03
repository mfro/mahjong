import { filterMap, unique } from '@/util';
import { Meld, Tile, TileKind, Wind } from './tiles';
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
  declaredQuads: Meld[];
}

export namespace Player {
  export function getAllTiles(player: Player) {
    return [
      ...player.declaredQuads.flat(),
      ...player.open.flatMap(meld => meld.value),
      ...player.hand,
      ...(player.draw ? [player.draw] : []),
    ];
  }
}

export type Hand =
  | { melds: Meld[]; pair: Tile[] }
  | { pairs: Tile[][] }
  | { orphans: Tile[]; pair: Tile[] };

interface CallOption {
  player: number;
  result: Meld;
}

interface Call {
  player: number;
  result: Meld;
  win: boolean;
}

export type GameState =
  | { type: 'done' }
  | { type: 'discarding', player: number }
  | { type: 'calling', from: number, tile: Tile, pending: CallOption[], called: Call[] };

export type Input =
  | { type: 'declare quad', tile: Meld }
  | { type: 'discard', tile: Tile }
  | { type: 'call', player: number, meld: Meld, win: boolean }
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

    return hands.length > 0;
  }

  /** complete with at least one winning condition */
  export function isHandWin(hand: Tile[]) {
    // TODO winning conditions
    return isHandComplete(hand);
  }

  function buildMelds(kinds: readonly TileKind[], hand: Tile[]): Tile[][] {
    if (kinds.length == 0) return [[]];

    const kind = kinds[0];
    const rest = kinds.slice(1);

    const options = unique(hand.filter(t => t.kind == kind), Tile.equals);

    const results = [];
    for (const tile of options) {
      const remainingHand = hand.filter(t => t != tile);

      for (const tail of buildMelds(rest, remainingHand)) {
        results.push([tile, ...tail]);
      }
    }

    return results;
  }

  export function buildHands(hand: Tile[]): Hand[] {
    if (hand.length == 2) {
      if (hand[0] == hand[1])
        return [{ melds: [], pair: hand }];

      return [];
    }

    const list = [];
    for (const kinds of Meld.all) {
      const melds = buildMelds(kinds, hand).map(Meld.of);
      const options = unique(melds, Meld.isIdentical);

      for (const option of options) {
        const remainingHand = hand.filter(t => !option.includes(t));
        for (const tail of buildHands(remainingHand)) {
          assert('melds' in tail, '7 pairs?');
          list.push({
            melds: [option, ...tail.melds],
            pair: tail.pair,
          });
        }
      }
    }

    return list;
  }

  /** Find all tiles that would complete the specified hand */
  export function findWaits(melds: Meld[], hand: Tile[]) {
    const waits = [];

    for (const kind of TileKind.all) {
      const tile = Tile.plain(kind);
      const hands = buildHands([tile, ...hand]);
      if (hands.length == 0) return;

      waits.push({ seed: kind, hands });
    }

    return waits;
  }

  /** Check if the hand can call a triple on a discarded tile */
  export function findTriples(seed: Tile, hand: Tile[]): Meld[] {
    const options = buildMelds([seed.kind, seed.kind], hand)
      .map(tiles => Meld.of([seed, ...tiles]))

    return unique(options, Meld.isIdentical);
  }

  /** Check if the hand can call a quad on a discarded tile */
  export function findQuads(seed: Tile, hand: Tile[]) {
    const options = buildMelds([seed.kind, seed.kind, seed.kind], hand)
      .map(tiles => Meld.of([seed, ...tiles]))

    return unique(options, Meld.isIdentical);
  }

  /** Find all sequences that can be called on a discarded tile */
  export function findSequences(seed: Tile, hand: Tile[]): Meld[] {
    return filterMap(Meld.getSequenceOptions(seed.kind), others => {
      for (const sequence of buildMelds(others, hand)) {
        return Meld.of([seed, ...sequence]);
      }
    });
  }

  export function newDeck(): Tile[] {
    const pool = [
      ...TileKind.all.map(Tile.plain),
      ...TileKind.all.map(Tile.plain),
      ...TileKind.all.map(Tile.plain),
      ...TileKind.all.map(Tile.plain),
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
        declaredQuads: [],
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

  export function getDeclaredQuads(game: Game) {
    const quads = game.players
      .flatMap(p => p.declaredQuads);

    return quads;
  }

  export function getBonusIndicators(game: Game) {
    const quads = getDeclaredQuads(game).length;

    const offset = 4 - quads;
    const list = [];

    for (let i = 0; i < quads + 1; ++i) {
      list.push(game.deck[offset + i * 2]);
    }
  }

  export function getHiddenBonusIndicators(game: Game) {
    const quads = game.players
      .map(p => p.declaredQuads.length)
      .reduce((a, b) => a + b, 0);

    const offset = 4 - quads;
    const list = [];

    for (let i = 0; i < quads + 1; ++i) {
      list.push(game.deck[offset + i * 2]);
    }
  }

  export function applyQuad(game: Game, player: number) {
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

  function getCallPriority(a: Call) {
    return (a.win ? 2 : 0)
      + (Meld.isSet(a.result) ? 1 : 0);
  }

  function compareCallPriority(a: Call, b: Call) {
    return (getCallPriority(a) - getCallPriority(b));
  }

  export function updateCallState(game: Game) {
    assert(game.state.type == 'calling', 'calling phase');

    if (game.state.pending.length > 0) return;

    const call = [...game.state.called]
      .sort(compareCallPriority)
      .pop();

    if (call) {
      const target = game.players[call.player];
      target.open.push({
        value: call.result,
        claimed: game.state.tile,
        claimedFrom: game.state.from,
      });

      for (const tile of Meld.getRest(call.result, game.state.tile.kind)) {
        const index = target.hand.indexOf(tile)
        target.hand.splice(index, 1);
      }

      const victim = game.players[game.state.from];
      victim.discard.pop();

      game.state = { type: 'discarding', player: call.player };
    } else {
      draw(game, nextPlayer(game, game.state.from));
    }
  }

  export function isDiscarding(game: Game, player: Player) {
    return game.state.type == 'discarding'
      && game.players[game.state.player] == player;
  }

  export function getQuadOptions(game: Game) {
    if (game.state.type != 'discarding' || getDeclaredQuads(game).length == 4) {
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

    const pending: CallOption[] = [];
    for (const other of otherPlayers(game, game.state.player)) {
      const tiles = game.players[other].hand;

      for (const result of findTriples(tile, tiles)) {
        pending.push({ player: other, result });
      }

      for (const result of findQuads(tile, tiles)) {
        pending.push({ player: other, result });
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

  export function declareQuad(game: Game, meld: Meld) {
    assert(game.state.type == 'discarding', 'invalid discard');
    const player = game.players[game.state.player];

    for (const tile of meld) {
      const index = player.hand.indexOf(tile);
      assert(index != -1, 'invalid declare quad');
      player.hand.splice(index);
    }

    player.declaredQuads.push(meld);
  }

  export function call(game: Game, player: number, meld: Meld, win: boolean) {
    assert(game.state.type == 'calling', 'calling phase');

    const calls = game.state.pending.filter(p => p.player == player);
    game.state.pending = game.state.pending.filter(p => p.player != player);

    const call = calls.find(p => p.result == meld);
    assert(call != null, 'call exists');
    game.state.called.push({
      player: call.player,
      result: call.result,
      win,
    });

    updateCallState(game);
  }

  export function pass(game: Game, player: number) {
    assert(game.state.type == 'calling', 'invalid call');

    game.state.pending = game.state.pending.filter(p => p.player != player);

    updateCallState(game);
  }

  export function input(game: Game, input: Input) {
    if (input.type == 'discard') {
      discard(game, input.tile);
    } else if (input.type == 'declare quad') {
      declareQuad(game, input.tile);
    } else if (input.type == 'call') {
      call(game, input.player, input.meld, input.win);
    } else if (input.type == 'pass') {
      pass(game, input.player);
    }
  }
}
