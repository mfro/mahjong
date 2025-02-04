<template>
  <Flex class="gap-4">
    <template v-for="meld in props.player.open">
      <UIOpenMeld :player="player" :meld="meld" />
    </template>

    <template v-for="quad in props.player.declaredQuads">
      <UIDeclaredQuad :quad="quad" />
    </template>
  </Flex>
</template>

<script setup lang="ts">
import type { Player } from '@/common';

import Flex from './common/Flex.vue';
import UIOpenMeld from './UIOpenMeld.vue';
import UIDeclaredQuad from './UIDeclaredQuad.vue';

const props = defineProps<{
  player: Player,
}>();
</script>

<style scoped lang="scss"></style>
