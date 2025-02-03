<template>
  <Flex class="gap-4">
    <template v-for="meld in melds">
      <UIOpenMeld :player="player" :meld="meld" />
    </template>
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Player } from '@/common';

import Flex from './common/Flex.vue';
import UIOpenMeld from './UIOpenMeld.vue';

const props = defineProps<{
  player: Player,
}>();

const melds = computed(() => props.player.open);
</script>

<style scoped lang="scss"></style>
