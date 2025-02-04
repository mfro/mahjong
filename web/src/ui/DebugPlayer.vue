<template>
  <Flex class="gap-6">
    <Flex column class="gap-2">
      <Flex class="gap-2" align-end>
        <template v-if="game.state.type == 'calling'">
          <template v-for="option in callOptions">
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

        <template v-for="option in promoteQuadOptions">
          <Button variant="outlined" @click="promoteQuad(option)">
            <Flex class="gap-2">
              <UIOpenMeld :player="player"
                          :meld="{ ...option.meld, value: Meld.of([...option.meld.value, option.tile]) }" />
            </Flex>
          </Button>
        </template>

        <template v-for="quad in declareQuadOptions">
          <Button variant="outlined" @click="declareQuad(quad)">
            <Flex class="gap-2">
              <UIDeclaredQuad :quad="quad" />
            </Flex>
          </Button>
        </template>
      </Flex>

      <UIPlayerMelds :player="player" />

      <UIHand :player="player" />
    </Flex>

    <UIDiscard :player="player" />
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { Game, Meld, Player, Tile, type OpenMeld, type PromoteQuadOption } from '@/common';
import { CONTEXT } from './common';
import { assert } from '@mfro/ts-common/assert';

import Button from 'primevue/button';

import Flex from './common/Flex.vue';
import UIHand from './UIHand.vue';
import UIDiscard from './UIDiscard.vue';
import UIPlayerMelds from './UIPlayerMelds.vue';
import UIOpenMeld from './UIOpenMeld.vue';
import UIDeclaredQuad from './UIDeclaredQuad.vue';

const props = defineProps<{
  player: Player
}>();

const context = CONTEXT.get();
const game = context.game;

const index = computed(() => game.players.indexOf(props.player));

const callOptions = computed(() => {
  if (game.state.type != 'calling') {
    return [];
  } else {
    return game.state.pending.filter(c => c.player == index.value);
  }
});

const promoteQuadOptions = computed(() => {
  if (!Game.isDiscarding(game, props.player)) {
    return [];
  } else {
    return Game.getPromoteQuadOptions(game);
  }
});

const declareQuadOptions = computed(() => {
  if (!Game.isDiscarding(game, props.player)) {
    return [];
  } else {
    return Game.getDeclareQuadOptions(game);
  }
});

const canPass = computed(() => callOptions.value.length > 0);

function call(meld: Meld) {
  assert(game.state.type == 'calling', 'invalid call')
  // TODO optional ron
  const win = Game.canWinOffDiscard(game, props.player, game.state.tile)
  context.input({ type: 'call', player: index.value, meld, win });
}

function promoteQuad(option: PromoteQuadOption) {
  context.input({ type: 'promote quad', option });
}

function declareQuad(meld: Meld) {
  context.input({ type: 'declare quad', meld });
}

function pass() {
  context.input({ type: 'pass', player: index.value });
}

</script>

<style scoped lang="scss"></style>
