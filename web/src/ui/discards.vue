<template>
  <div class="discards">
    <tile v-for="tile in player.discard" :key="tile.id" :tile="tile" />

    <tile spacer v-if="player.discard.length == 0" />
  </div>
</template>

<script>
import Tile from './tile';

export default {
  name: 'discards',
  components: {
    Tile,
  },

  props: {
    player: Object,
  },
};
</script>

<style lang="scss" scoped>
.discards {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(6, 1fr);
}
</style>
