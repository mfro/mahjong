<template>
  <div>
    <Flex column class="gap-6 ma-6">
      <template v-for="player in game.players">
        <DebugPlayer :player="player" />
      </template>
    </Flex>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

import { Game, Tile, TileKind } from '@/common';
import { CONTEXT, type Context } from './common';

import Flex from './common/Flex.vue';
import DebugPlayer from './DebugPlayer.vue';

const context: Context = reactive({
  game: Game.create(),
  localPlayer: null,

  reset() {
    context.game = Game.create();
  },

  input(input) {
    Game.input(context.game, input);
  },
});

CONTEXT.set(context);
const game = context.game;

game.players[1].hand[0] = Tile.plain(TileKind.balls[0]);
game.players[1].hand[1] = Tile.plain(TileKind.balls[1]);
game.players[1].hand[2] = Tile.plain(TileKind.balls[3]);
game.players[1].hand[3] = Tile.plain(TileKind.balls[4]);
game.players[0].hand.pop();
game.players[0].hand.push(Tile.plain(TileKind.balls[2]));
game.players[2].hand[0] = Tile.plain(TileKind.balls[2]);
game.players[2].hand[1] = Tile.plain(TileKind.balls[2]);

game.players[3].hand[0] = Tile.plain(TileKind.sticks[2]);
game.players[3].hand[1] = Tile.plain(TileKind.sticks[2]);
game.players[3].hand[2] = Tile.plain(TileKind.sticks[2]);
game.players[3].hand[3] = Tile.plain(TileKind.sticks[2]);
</script>

<style scoped lang="scss"></style>
