<template>
  <v-app row justify-center>
    <v-flex column align-center>
      <div class="board">
        <player :player="localPlayer" :visible="false" class="local-player" />
        <player :player="leftPlayer" :visible="false" class="left-player" />
        <player :player="rightPlayer" :visible="false" class="right-player" />
        <player :player="acrossPlayer" :visible="false" class="across-player" />
      </div>

      <v-flex grow align-center>
        <hand :player="localPlayer" :visible="true" />
      </v-flex>
    </v-flex>

    <v-flex column>
      <hand :player="leftPlayer" :visible="true" />
      <hand :player="acrossPlayer" :visible="true" />
      <hand :player="rightPlayer" :visible="true" />

      <v-flex>
        <v-flex
          column
          class="pa-2"
          align-start
          v-for="[player, list] in allCalls"
          :key="player"
        >
          <v-button
            class="mb-2 py-1"
            style="height: auto"
            v-for="result in list"
            :key="result"
            @click="call(player, result)"
          >
            <meld :player="player" :meld="result" small />
          </v-button>

          <v-button
            class="mb-2 py-1"
            style="height: auto"
            @click="pass(player)"
          >
            Pass
          </v-button>
        </v-flex>
      </v-flex>
    </v-flex>
  </v-app>
</template>

<script>
import { computed, provide } from 'vue';

import Tile from './ui/tile';
import Meld from './ui/meld';
import Hand from './ui/hand';
import Discards from './ui/discards';
import Player from './ui/player';

import { nextPlayer, previousPlayer } from './game';

export default {
  name: 'mahjong',
  components: {
    Tile,
    Meld,
    Hand,
    Discards,
    Player,
  },

  props: ['game', 'tiles'],

  setup(props) {
    provide('game', props.game);
    provide('tiles', props.tiles);

    const localPlayer = computed(() => {
      return props.game.state.players[props.game.local];
    });

    const leftPlayer = computed(() => {
      return props.game.state.players[nextPlayer(props.game.state, props.game.local)];
    });

    const rightPlayer = computed(() => {
      return props.game.state.players[previousPlayer(props.game.state, props.game.local)];
    });

    const acrossPlayer = computed(() => {
      return props.game.state.players[nextPlayer(props.game.state, nextPlayer(props.game.state, props.game.local))];
    });

    const allCalls = computed(() => {
      if (props.game.phase.type != 'calling')
        return new Map();

      const byPlayer = new Map();

      for (const { result, player } of props.game.phase.pending) {
        const list = byPlayer.get(player);
        if (!list) byPlayer.set(player, list = []);
        list.push(result);
      }

      return [...byPlayer];
    });

    return {
      localPlayer, leftPlayer, rightPlayer, acrossPlayer,
      allCalls,

      pass(player) {
        props.game.pass(player);
      },

      call(player, meld) {
        props.game.call(player, meld);
      },
    };
  },
};
</script>

<style lang="scss">
#app {
  width: 100vw;
  height: 100vh;
}
</style>

<style lang="scss" scoped>
$grid1: 26.6808965vh;
$grid2: 37.3532551vh;

.board {
  width: ($grid1 * 2 + $grid2);
  height: ($grid1 * 2 + $grid2);

  position: relative;

  background-image: url("./assets/table.jpg");
  background-size: auto 240%;
  background-position: center;

  .left-player {
    width: $grid2;
    top: $grid1;
    left: 0px;
    position: absolute;
    transform: translateX(-50%) translateY(-50%) rotateZ(90deg) translateX(50%)
      translateY(-50%);
  }

  .right-player {
    width: $grid2;
    right: 0px;
    bottom: $grid1;
    position: absolute;
    transform: translateX(50%) translateY(50%) rotateZ(-90deg) translateX(50%)
      translateY(-50%);
  }

  .across-player {
    width: $grid2;
    top: 0;
    right: $grid1;
    position: absolute;
    transform: translateX(-50%) translateY(-50%) rotateZ(180deg)
      translateX(-50%) translateY(-50%);
  }

  .local-player {
    width: $grid2;
    left: $grid1;
    bottom: 0;
    position: absolute;
  }
}
</style>
