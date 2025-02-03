import { assert } from '@mfro/ts-common/assert';

export function never(n: never): never {
  assert(false, `never`);
}

export function filterMap<T, V>(array: T[], fn: (value: T) => false | undefined | null | V) {
  return array.map(fn).filter(t => t !== false && t !== undefined && t !== null) as V[];
}

export function unique<T>(array: T[], equals: (a: T, b: T) => boolean = (a, b) => a == b) {
  return array.filter((value, i) => array.findIndex(v => equals(value, v)) == i);
}
