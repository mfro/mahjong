<template>
  <div class="player-discard gap-2">
    <template v-for="tile in player.discard">
      <UITile :tile="tile" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { type Player } from '@/common';
import UITile from './UITile.vue';

const props = defineProps<{
  player: Player,
}>();
</script>

<style scoped lang="scss">
.player-discard {
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: auto;
  grid-template-columns: repeat(6, auto);

  align-content: start;
}
</style>
