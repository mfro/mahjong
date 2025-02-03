<template>
  <Flex align-end class="gap-2">
    <template v-for="tile, i in tiles">
      <UITile :tile="tile"
              :rotated="i == rotated" />
    </template>
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { CONTEXT } from './common';
import { Game, Meld, Tile, TileKind, type OpenMeld, type Player } from '@/common';

import Flex from './common/Flex.vue';
import UITile from './UITile.vue';

const props = defineProps<{
  player: Player,
  meld: OpenMeld,
}>();

const context = CONTEXT.get();
const game = context.game;

const playerIndex = computed(() => game.players.indexOf(props.player));

const rotated = computed(() => {
  if (props.meld.claimedFrom == Game.previousPlayer(game, playerIndex.value))
    return 0;

  if (props.meld.claimedFrom == Game.nextPlayer(game, playerIndex.value))
    return props.meld.value.length - 1;

  return 1;
});

const tiles = computed(() => {
  const claimed = props.meld.claimed;
  const rest = Meld.getRest(props.meld.value, claimed.kind)
    .sort(Tile.compare);

  if (props.meld.claimedFrom == Game.previousPlayer(game, playerIndex.value))
    return [claimed, ...rest];

  if (props.meld.claimedFrom == Game.nextPlayer(game, playerIndex.value))
    return [...rest, claimed];

  return [rest[0], claimed, ...rest.slice(1)];
});
</script>

<style scoped lang="scss"></style>
