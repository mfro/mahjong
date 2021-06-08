<template>
  <div class="spacer" :class="{ small, rotated }" v-if="spacer" />

  <div
    class="tile"
    :class="{ small, rotated, active }"
    v-else
    @click="active && $emit('click', tile)"
  >
    <div class="front" v-if="art">
      <div class="shadow1" />
      <div class="shadow2" />
      <div class="body" />
      <div class="art"><img :src="art" /></div>
    </div>

    <div class="back" v-else>
      <div class="shadow1" />
      <div class="shadow2" />
      <div class="body" />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'tile',

  emits: ['click'],
  props: {
    tile: Object,
    kind: Object,
    small: Boolean,
    active: Boolean,
    rotated: Boolean,
    spacer: Boolean,
  },

  setup(props, { emit }) {
    const kind = computed(() => {
      return props.kind ?? props.tile?.kind;
    });

    const art = computed(() => {
      return kind.value?.art;
    });

    return { art };
  },
};
</script>

<style lang="scss" scoped>
$width: 5.336179295vh;
$height: $width * 30 / 23;
$rounding: $width * 0.1;
$hover-offset: $width * 0.2;

.spacer {
  margin: 0.213447172vh;
  width: $width;
  height: ($height + $width * 0.15);

  &.small {
    transform: scale(0.6);
  }
}

.tile {
  margin: 0.213447172vh;
  display: flex;
  position: relative;
  transition: transform 10ms ease-in-out;
  user-select: none;

  &.rotated.small {
    .front {
      .art {
        height: ($width * 0.6);
        width: ($height * 0.6);

        img {
          transform: translateX(-50%) translateY(-50%) rotateZ(90deg) translateX(50%) translateY(-50%);
          width: ($width * 0.6);
          height: ($height * 0.6);
        }
      }

      .body {
        top: ($width * 0.6 * 0.15);
        height: ($width * 0.6);
        width: ($height * 0.6);
      }

      .shadow1 {
        height: ($width * 0.6);
        width: ($height * 0.6);
      }

      .shadow2 {
        top: ($width * 0.6 * 0.05);
        height: ($width * 0.6);
        width: ($height * 0.6);
      }
    }
  }

  &.rotated {
    .front {
      .art {
        height: ($width);
        width: ($height);

        img {
          transform: translateX(-50%) translateY(-50%) rotateZ(90deg) translateX(50%) translateY(-50%);
          width: ($width);
          height: ($height);
        }
      }

      .body {
        top: ($width * 0.15);
        height: ($width);
        width: ($height);
      }

      .shadow1 {
        height: ($width);
        width: ($height);
      }

      .shadow2 {
        top: ($width * 0.05);
        height: ($width);
        width: ($height);
      }
    }
  }

  &.small {
    .front {
      box-shadow: 0 0 ($rounding * 0.6) gray;
      border-radius: ($rounding * 0.6);

      .art {
        width: ($width * 0.6);
        height: ($height * 0.6);
        margin-top: ($width * 0.6 * 0.15);

        img {
          width: ($width * 0.6);
          height: ($height * 0.6);
        }
      }

      .body {
        top: ($width * 0.6 * 0.15);
        width: ($width * 0.6);
        height: ($height * 0.6);
        border-radius: ($rounding * 0.6);
      }

      .shadow1 {
        width: ($width * 0.6);
        height: ($height * 0.6);
        border-radius: ($rounding * 0.6);
      }

      .shadow2 {
        top: ($width * 0.6 * 0.05);
        width: ($width * 0.6);
        height: ($height * 0.6);
        border-radius: ($rounding * 0.6);
      }
    }

    .back {
      width: ($width * 0.6);
      height: (($height + $width * 0.15) * 0.6);
      box-shadow: 0 0 ($rounding * 0.6) gray;
      border-radius: ($rounding * 0.6);

      .body {
        top: ($width * 0.6 * 0.15);
        width: ($width * 0.6);
        height: ($height * 0.6);
        border-radius: ($rounding * 0.6);
      }

      .shadow1 {
        width: ($width * 0.6);
        height: ($height * 0.6);
        border-radius: ($rounding * 0.6);
      }

      .shadow2 {
        top: ($width * 0.6 * 0.1);
        width: ($width * 0.6);
        height: ($height * 0.6);
        border-radius: ($rounding * 0.6);
      }
    }
  }

  &.active {
    cursor: pointer;

    &:hover > .front {
      transform: translateY(-$hover-offset);
    }
  }

  .front {
    position: relative;
    display: flex;
    box-shadow: 0 0 $rounding gray;
    border-radius: $rounding;
    overflow: hidden;
    pointer-events: none;

    .art {
      width: ($width);
      height: ($height);
      margin-top: ($width * 0.15);
      display: flex;

      img {
        width: ($width);
        height: ($height);
        position: relative;
      }
    }

    .body {
      background-color: #f0f0f0;
      top: ($width * 0.15);
      width: $width;
      height: $height;
      position: absolute;
      border-radius: $rounding;
    }

    .shadow1 {
      background-color: #da7c0c;
      width: $width;
      height: $height;
      position: absolute;
      border-radius: $rounding;
    }

    .shadow2 {
      background-color: darken(#f0f0f0, 20%);
      top: ($width * 0.05);
      width: $width;
      height: $height;
      position: absolute;
      border-radius: $rounding;
    }
  }

  .back {
    width: $width;
    height: ($height + $width * 0.15);
    position: relative;
    display: flex;
    box-shadow: 0 0 $rounding gray;
    border-radius: $rounding;
    overflow: hidden;
    pointer-events: none;

    .body {
      background-color: lighten(#da7c0c, 8%);
      top: $width * 0.15;
      // left: 9px;
      width: $width;
      height: $height;
      position: absolute;
      border-radius: $rounding;
    }

    .shadow1 {
      background-color: darken(#f0f0f0, 20%);
      width: $width;
      height: $height;
      position: absolute;
      border-radius: $rounding;
    }

    .shadow2 {
      background-color: #da7c0c;
      top: ($width * 0.1);
      // left: 3px;
      width: $width;
      height: $height;
      position: absolute;
      border-radius: $rounding;
    }
  }
}
</style>
