import { inject, provide, type InjectionKey } from 'vue';
import { assert } from '@mfro/ts-common/assert';
import type { Game, Input, Player } from '@/common';

export * from './v-scroll-lock';
export * from './localStorage';

export class InjectionHelper<T> {
  key: InjectionKey<T>;

  constructor() {
    this.key = Symbol();
  }

  get() {
    const value = inject(this.key);
    assert(value != null, 'invalid value');

    return value;
  }

  set(value: T) {
    provide(this.key, value);
    return value;
  }
}

export interface Context {
  game: Game,
  localPlayer: Player | null;

  reset(): void;
  input(input: Input): void;
}

export const CONTEXT = new InjectionHelper<Context>();
