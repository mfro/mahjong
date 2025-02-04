<template>
  <Flex align-end class="gap-2">
    <UITile />
    <UITile :tile="kind" />
    <UITile :tile="kind" />
    <UITile />
  </Flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Meld } from '@/common';

import Flex from './common/Flex.vue';
import UITile from './UITile.vue';

const props = defineProps<{
  quad: Meld;
}>();

const kind = computed(() => props.quad[0].kind);
</script>

<style scoped lang="scss">
</style>
