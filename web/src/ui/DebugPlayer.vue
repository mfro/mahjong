<template>
  <Flex class="gap-6">
    <Flex column class="gap-2">
      <Flex class="gap-2" align-end>
        <template v-if="game.state.type == 'calling'">
          <template v-for="option in options">
            <Button variant="outlined" @click="call(option.result)">
              <Flex class="gap-2">
                <UIOpenMeld :player="player"
                            :meld="{ value: option.result, claimed: game.state.tile, claimedFrom: game.state.from }" />
              </Flex>
            </Button>
          </template>

          <template v-if="canPass">
            <Button @click="pass()" severity="secondary"
                    variant="outlined">Pass</Button>
          </template>
        </template>
      </Flex>

      <UIOpenMelds :player="player" />

      <UIHand :player="player" />
    </Flex>

    <UIDiscard :player="player" />
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Game, Meld, Player } from '@/common';
import { CONTEXT } from './common';
import { assert } from '@mfro/ts-common/assert';

import Button from 'primevue/button';

import Flex from './common/Flex.vue';
import UIHand from './UIHand.vue';
import UIDiscard from './UIDiscard.vue';
import UIOpenMelds from './UIOpenMelds.vue';
import UIOpenMeld from './UIOpenMeld.vue';

const props = defineProps<{
  player: Player
}>();

const context = CONTEXT.get();
const game = context.game;

const index = computed(() => game.players.indexOf(props.player));

const options = computed(() => {
  if (game.state.type != 'calling') {
    return [];
  } else {
    return game.state.pending.filter(c => c.player == index.value);
  }
})

const canPass = computed(() => options.value.length > 0);

function call(meld: Meld) {
  assert(game.state.type == 'calling', 'invalid call')
  const hand = [...Player.getAllTiles(props.player), game.state.tile];
  // TODO optional ron
  const win = Game.isHandWin(hand);
  context.input({ type: 'call', player: index.value, meld, win });
}

function pass() {
  context.input({ type: 'pass', player: index.value });
}

</script>

<style scoped lang="scss"></style>
