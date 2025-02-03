import { assert } from '@mfro/ts-common/assert';

export function never(n: never): never {
  assert(false, `never`);
}

export function filterMap<T, V>(array: T[], fn: (value: T) => false | undefined | null | V) {
  return array.map(fn).filter(t => t !== false && t !== undefined && t !== null) as V[];
}
