<template>
  <span class="v-icon" :class="classes">
    <slot />
  </span>
</template>

<script lang="ts">
import { computed } from 'vue';

export default {
  name: 'v-icon',

  props: {
    bold: { type: Boolean, default: false },
    color: { type: String, default: null },

    outlined: { type: Boolean, default: false },
    rounded: { type: Boolean, default: false },
    twoTone: { type: Boolean, default: false },
    sharp: { type: Boolean, default: false },

    small: { type: Boolean, default: false },
    xSmall: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
    xLarge: { type: Boolean, default: false },
  },

  setup(props) {
    const classes = computed(() => [props.color, {
      'bold': props.bold,

      'material-icons': !(props.outlined || props.rounded || props.twoTone || props.sharp),

      'material-icons-outlined': props.outlined,
      'material-icons-round': props.rounded,
      'material-icons-two-tone': props.twoTone,
      'material-icons-sharp': props.sharp,

      'small': props.small,
      'x-small': props.xSmall,
      'large': props.large,
      'x-large': props.xLarge,
    }]);

    return { classes };
  },
};
</script>

<style lang="scss" scoped>
span.v-icon {
  font-size: calc(1.5em / 0.875);
  user-select: none;

  vertical-align: middle;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.bold {
    font-weight: bold;
  }

  &.x-small {
    font-size: calc(0.875em / 0.875);
  }

  &.small {
    font-size: calc(1.3em / 0.875);
  }

  &.large {
    font-size: calc(1.75em / 0.875);
  }

  &.x-large {
    font-size: calc(2em / 0.875);
  }
}
</style>
