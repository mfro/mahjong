<template>
  <v-flex class="hand" :class="{ visible }">
    <!-- <div class="ma-1" style="width: 80px" />
    <div class="mx-5" /> -->

    <v-flex>
      <tile
        v-for="tile in sorted"
        :key="tile.id"
        :tile="visible ? tile : null"
        :active="visible && isDiscarding"
        @click="onClick"
      />
    </v-flex>

    <!-- <template v-if="player.draw !== null"> -->
    <div class="mx-5" />

    <!-- <tile spacer v-if="player.draw == null" /> -->

    <tile
      :spacer="player.draw == null"
      :tile="visible ? player.draw : null"
      :active="visible && isDiscarding"
      @click="onClick"
    />
    <!-- </template> -->
  </v-flex>
</template>

<script>
import { computed, inject } from 'vue';

import Tile from './tile';

import { allTiles } from '../tiles';

export default {
  name: 'hand',
  components: {
    Tile,
  },

  props: {
    player: Object,
    visible: Boolean,
  },

  setup(props) {
    const game = inject('game');

    const index = computed(() => {
      return game.state.players.indexOf(props.player);
    });

    const sorted = computed(() => {
      return props.player.hand.slice().sort((a, b) => {
        return allTiles.indexOf(a.kind) - allTiles.indexOf(b.kind);
      });
    });

    const isDiscarding = computed(() => {
      return game.phase.type == 'discarding'
        && game.phase.player == index.value;
    });

    return {
      game,
      sorted,
      isDiscarding,

      onClick(tile) {
        game.discard(tile);
      },
    };
  },
};
</script>

<style lang="scss" scoped>
</style>
