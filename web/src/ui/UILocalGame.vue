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

import { Game, Tile } from '@/common';
import { CONTEXT, type Context } from './common';

import Button from 'primevue/button';

import Flex from './common/Flex.vue';
import UIHand from './UIHand.vue';
import UIDiscard from './UIDiscard.vue';
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

game.players[1].hand[0] = Tile.balls[0];
game.players[1].hand[1] = Tile.balls[1];
game.players[1].hand[2] = Tile.balls[3];
game.players[1].hand[3] = Tile.balls[4];
game.players[0].draw = Tile.balls[2];
</script>

<style scoped lang="scss"></style>
