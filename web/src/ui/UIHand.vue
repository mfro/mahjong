<template>
  <Flex class="player-hand gap-2">
    <template v-for="tile in sorted">
      <UITile :tile="tile"
              :active="isDiscarding"
              @click="discard(tile)" />
    </template>

    <template v-if="Player.hasDraw(player)">
      <div class="mx-3" />

      <UITile :tile="player.hand[player.hand.length - 1]"
              :active="isDiscarding"
              @click="discard(player.hand[player.hand.length - 1])" />
    </template>
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Game, Player, Tile } from '@/common';
import { CONTEXT } from './common';

import Flex from './common/Flex.vue';
import UITile from './UITile.vue';
import { removeFirst } from '@/util';

const props = defineProps<{
  player: Player,
}>();

const context = CONTEXT.get();
const game = context.game;

const drawTile = computed(() => Player.getDrawTile(props.player))

const sorted = computed(() => {
  const list = [...props.player.hand];
  if (drawTile.value) {
    removeFirst(list, drawTile.value);
  }
  return list.sort(Tile.compare);
});

const isLocal = computed(() => props.player == context.localPlayer)
const isDiscarding = computed(() => isLocal && Game.isDiscarding(game, props.player));

function discard(tile: Tile) {
  context.input({ type: 'discard', tile });
}
</script>

<style scoped lang="scss"></style>
