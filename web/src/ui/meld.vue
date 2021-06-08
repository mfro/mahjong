<template>
  <v-flex align-end>
    <tile
      :small="small"
      v-for="(tile, i) in meld.tiles"
      :key="tile"
      :tile="tile"
      :rotated="i == rotated"
    />
  </v-flex>
</template>

<script>
import { computed, inject } from 'vue';

import Tile from './tile';
import { nextPlayer, previousPlayer } from '../game';

export default {
  name: 'meld',
  components: {
    Tile,
  },

  props: {
    player: Number,
    meld: Object,
    small: Boolean,
  },

  setup(props) {
    const game = inject('game');

    const rotated = computed(() => {
      if (props.meld.claimedPlayer == nextPlayer(game.state, props.player))
        return 0;

      if (props.meld.claimedPlayer == previousPlayer(game.state, props.player))
        return props.meld.tiles.length - 1;

      return 1;
    });

    return {
      game,
      rotated,
    };
  },
};
</script>
