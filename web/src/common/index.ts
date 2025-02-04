import { filterMap, never, removeFirst, unique } from '@/util';
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
  discard: Tile[];
  open: OpenMeld[];
  declaredQuads: Meld[];
  isTemporaryFuriten: boolean;
}

export namespace Player {
  export function getAllTiles(player: Player) {
    return [
      ...player.declaredQuads.flat(),
      ...player.open.flatMap(meld => meld.value),
      ...player.hand,
    ];
  }

  export function hasDraw(player: Player) {
    return getAllTiles(player).length == 14
      + player.declaredQuads.length
      + player.open.filter(m => Meld.isQuad(m.value)).length
  }

  export function getDrawTile(player: Player) {
    if (Player.hasDraw(player)) {
      return player.hand[player.hand.length - 1];
    } else {
      return null;
    }
  }
}

export type Hand =
  | { type: 'classic', melds: Meld[]; pair: Tile[] }
  | { type: '7 pairs', pairs: Tile[][] }
  | { type: 'orphans', orphans: Tile[]; pair: Tile[] };

export namespace Hand {
  export function isComplete(hand: Hand) {
    if (hand.type == 'classic') {
      return hand.melds.length == 4;
    } else if (hand.type == '7 pairs') {
      return hand.pairs.length == 7;
    } else if (hand.type == 'orphans') {
      return hand.orphans.length == 12;
    } else {
      never(hand);
    }
  }
}

export interface CallOption {
  player: number;
  result: Meld;
}

export interface Call {
  player: number;
  result: Meld;
  win: boolean;
}

export interface PromoteQuadOption {
  tile: Tile;
  meld: OpenMeld;
}

export type GameState =
  | { type: 'done' }
  | { type: 'discarding', player: number }
  | { type: 'calling', from: number, tile: Tile, pending: CallOption[], called: Call[] };

export type Input =
  | { type: 'declare quad', meld: Meld }
  | { type: 'promote quad', option: PromoteQuadOption }

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
    const hands = buildHands(hand).filter(hand => Hand.isComplete(hand));

    return hands.length > 0;
  }

  /** complete with at least one winning condition */
  export function isHandWin(hand: Tile[]) {
    // TODO winning conditions
    return isHandComplete(hand);
  }

  export function getAllDiscarded(game: Game, player: Player) {
    return [
      ...player.discard,
      ...game.players.flatMap(player => filterMap(player.open, meld => game.players[meld.claimedFrom] == player && meld.claimed))
    ]
  }

  export function isDiscardFuriten(game: Game, player: Player) {
    return getAllDiscarded(game, player).some(tile => isWaitingFor(game, player, tile));
  }

  export function isFuriten(game: Game, player: Player): boolean {
    return player.isTemporaryFuriten || isDiscardFuriten(game, player);
  }

  export function isWaitingFor(game: Game, player: Player, tile: Tile) {
    const waits = findWaits(player).map(wait => wait.seed);
    return waits.includes(tile.kind);
  }

  export function canWinOffDiscard(game: Game, player: Player, discard: Tile): boolean {
    const hand = [...Player.getAllTiles(player), discard];

    return isHandWin(hand) && !isFuriten(game, player);
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

  function buildHands(hand: Tile[]): Hand[] {
    if (hand.length == 2) {
      if (hand[0] == hand[1])
        return [{ type: 'classic', melds: [], pair: hand }];

      return [];
    }

    const list: Hand[] = [];
    for (const kinds of Meld.all) {
      const melds = buildMelds(kinds, hand).map(Meld.of);
      const options = unique(melds, Meld.isIdentical);

      for (const option of options) {
        const remainingHand = hand.filter(t => !option.includes(t));
        for (const tail of buildHands(remainingHand)) {
          assert(tail.type == 'classic', '7 pairs?');
          list.push({
            type: 'classic',
            melds: [option, ...tail.melds],
            pair: tail.pair,
          });
        }
      }
    }

    return list;
  }

  /** Find all tiles that would complete the specified hand */
  export function findWaits(player: Player) {
    const waits = [];

    for (const kind of TileKind.all) {
      const tile = Tile.plain(kind);
      const hands = buildHands([tile, ...player.hand]);
      if (hands.length == 0) return [];

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
        discard: [],
        open: [],
        declaredQuads: [],
        isTemporaryFuriten: false,
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

    game.players[player].hand.push(drawTile);
    game.state = { type: 'discarding', player };
  }

  export function draw(game: Game, player: number) {
    if (game.deck.length == 14) {
      game.state = { type: 'done' };
    } else {
      const drawTile = game.deck.pop();
      assert(drawTile != null, 'invalid draw');

      game.players[player].hand.push(drawTile);
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
      const meld: OpenMeld = {
        value: call.result,
        claimed: game.state.tile,
        claimedFrom: game.state.from,
      };

      const target = game.players[call.player];
      target.open.push(meld);

      for (const tile of meld.value.filter(tile => tile != meld.claimed)) {
        removeFirst(target.hand, tile);
      }

      const victim = game.players[game.state.from];
      victim.discard.pop();

      if (Meld.isQuad(meld.value)) {
        applyQuad(game, call.player);
      }

      game.state = { type: 'discarding', player: call.player };
    } else {
      draw(game, nextPlayer(game, game.state.from));
    }
  }

  export function isDiscarding(game: Game, player: Player) {
    return game.state.type == 'discarding'
      && game.players[game.state.player] == player;
  }

  export function getPromoteQuadOptions(game: Game): PromoteQuadOption[] {
    if (game.state.type != 'discarding') {
      return []
    }

    const player = game.players[game.state.player];
    if (!Player.hasDraw(player)) {
      return [];
    }

    return filterMap(player.hand, tile => {
      const meld = player.open.find(m => Meld.isTriple(m.value) && m.value[0].kind == tile.kind);
      return meld && {
        tile,
        meld,
      }
    });
  }

  export function getDeclareQuadOptions(game: Game): Meld[] {
    if (game.state.type != 'discarding' || getDeclaredQuads(game).length == 4) {
      return [];
    }

    const player = game.players[game.state.player];
    const kinds = [...new Set(player.hand.map(c => c.kind))];

    const options = [];

    for (const kind of kinds) {
      const tiles = player.hand.filter(t => t.kind == kind);
      if (tiles.length == 4) {
        options.push(Meld.of(tiles));
      }
    }

    return options;
  }

  export function discard(game: Game, tile: Tile) {
    assert(game.state.type == 'discarding', 'invalid discard');

    const player = game.players[game.state.player];

    removeFirst(player.hand, tile);
    player.discard.push(tile);
    // TODO riichi
    player.isTemporaryFuriten = false;

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
      removeFirst(player.hand, tile);
    }

    player.declaredQuads.push(meld);

    applyQuad(game, game.state.player);
  }

  export function promoteQuad(game: Game, option: PromoteQuadOption) {
    assert(game.state.type == 'discarding', 'invalid discard');
    const player = game.players[game.state.player];

    assert(player.open.includes(option.meld), 'invalid promote quad');
    option.meld.value = Meld.of([...option.meld.value, option.tile]);

    applyQuad(game, game.state.player);
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

    if (isWaitingFor(game, game.players[player], game.state.tile)) {
      game.players[player].isTemporaryFuriten = true;
    }

    updateCallState(game);
  }

  export function input(game: Game, input: Input) {
    if (input.type == 'discard') {
      discard(game, input.tile);
    } else if (input.type == 'declare quad') {
      declareQuad(game, input.meld);
    } else if (input.type == 'promote quad') {
      promoteQuad(game, input.option);
    } else if (input.type == 'call') {
      call(game, input.player, input.meld, input.win);
    } else if (input.type == 'pass') {
      pass(game, input.player);
    }
  }
}
