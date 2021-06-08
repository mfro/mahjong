<template>
  <v-flex justify-center>
    <discards :player="player" />

    <v-flex column justify-end class="melds pl-5">
      <meld
        v-for="meld in [...player.open].reverse()"
        :key="meld"
        :player="index"
        :meld="meld"
      />
    </v-flex>
  </v-flex>
  <!-- <v-flex column class="player pa-5" :class="{ visible }">
    <div class="info">
      <v-flex column>
        <meld
          v-for="meld in player.open"
          :key="meld"
          :player="index"
          :meld="meld"
          small
        />
      </v-flex>

      <discards :player="player" />

      <v-flex column class="pa-2">
        <v-button
          class="mb-2 py-1"
          style="height: auto"
          v-for="meld in calls"
          :key="meld"
          @click="call(meld)"
        >
          <meld :player="index" :meld="meld" small />
        </v-button>
      </v-flex>
    </div>

    <div class="my-5" />

    <hand :player="player" :visible="visible" />
  </v-flex> -->
</template>

<script>
import { computed, inject } from 'vue';

import Hand from './hand';
import Tile from './tile';
import Meld from './meld';
import Discards from './discards';

export default {
  name: 'player',
  components: {
    Hand,
    Tile,
    Meld,
    Discards,
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

    const calls = computed(() => {
      if (game.phase.type != 'calling')
        return [];

      const matches = game.phase.pending
        .filter(p => p.player == index.value)
        .map(p => p.meld);

      return matches;
    });

    return {
      calls,
      index,

      onClick(tile) {
        game.discard(tile);
      },

      call(meld) {
        game.call(index.value, meld);
      },
    };
  },
};
</script>

<style lang="scss" scoped>
.discard {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(6, 1fr);
}

.melds {
  position: absolute;
  top: 0;
  left: 100%;
  height: 100%;
}

.info {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
}
</style>
