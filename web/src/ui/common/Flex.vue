<template>
  <div class="v-flex" :class="[classes]">
    <slot />
  </div>
</template>

<script lang="ts">
import { computed } from 'vue';

export default {
  name: 'v-flex',

  props: {
    grow: { type: Boolean, default: false },
    wrap: { type: Boolean, default: false },
    row: { type: Boolean, default: false },
    column: { type: Boolean, default: false },
    alignStart: { type: Boolean, default: false },
    alignCenter: { type: Boolean, default: false },
    alignBaseline: { type: Boolean, default: false },
    alignEnd: { type: Boolean, default: false },
    justifyStart: { type: Boolean, default: false },
    justifyCenter: { type: Boolean, default: false },
    justifySpaceEvenly: { type: Boolean, default: false },
    justifySpaceAround: { type: Boolean, default: false },
    justifySpaceBetween: { type: Boolean, default: false },
    justifyEnd: { type: Boolean, default: false },
  },

  setup(props) {
    const classes = computed(() => ({
      grow: props.grow,
      wrap: props.wrap,
      row: props.row,
      column: props.column,
      'align-start': props.alignStart,
      'align-center': props.alignCenter,
      'align-baseline': props.alignBaseline,
      'align-end': props.alignEnd,
      'justify-start': props.justifyStart,
      'justify-center': props.justifyCenter,
      'justify-space-evenly': props.justifySpaceEvenly,
      'justify-space-around': props.justifySpaceAround,
      'justify-space-between': props.justifySpaceBetween,
      'justify-end': props.justifyEnd,
    }));

    return { classes };
  },
};
</script>

<style lang="scss" scoped>
div.v-flex {
  display: flex;

  &.grow {
    flex: 1 0 0;
  }

  &.wrap {
    flex-wrap: wrap;
  }

  &.column {
    flex-direction: column;
  }

  &.row {
    flex-direction: row;
  }

  &.align-start {
    align-items: flex-start;
  }

  &.align-center {
    align-items: center;
  }

  &.align-baseline {
    align-items: baseline;
  }

  &.align-end {
    align-items: flex-end;
  }

  &.justify-start {
    justify-content: flex-start;
  }

  &.justify-center {
    justify-content: center;
  }

  &.justify-end {
    justify-content: flex-end;
  }

  &.justify-space-evenly {
    justify-content: space-evenly;
  }

  &.justify-space-around {
    justify-content: space-around;
  }

  &.justify-space-between {
    justify-content: space-between;
  }
}
</style>
