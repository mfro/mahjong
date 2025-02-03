<template>
  <Flex class="player-hand gap-2">
    <template v-for="tile in sorted">
      <UITile :tile="tile"
              :active="isDiscarding"
              @click="discard(tile)" />
    </template>

    <template v-if="player.draw">
      <div class="mx-3" />

      <UITile :tile="player.draw"
              :active="isDiscarding"
              @click="discard(player.draw)" />
    </template>
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Game, Tile, type Player } from '@/common';
import { CONTEXT } from './common';

import Flex from './common/Flex.vue';
import UITile from './UITile.vue';

const props = defineProps<{
  player: Player,
}>();

const context = CONTEXT.get();
const game = context.game;

const sorted = computed(() => {
  return props.player.hand.slice().sort(Tile.compare);
});

const isActive = computed(() => props.player == context.localPlayer)
const isDiscarding = computed(() => isActive && Game.isDiscarding(game, props.player));

function discard(tile: Tile) {
  context.input({ type: 'discard', tile });
}
</script>

<style scoped lang="scss"></style>
