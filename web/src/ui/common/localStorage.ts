import { customRef } from 'vue';

export const localStorage = {
  get(name: string, rawString = false) {
    try {
      const raw = window.localStorage.getItem(name);
      return rawString
        ? raw
        : JSON.parse(raw!);
    } catch (e) {
      return undefined;
    }
  },

  set(name: string, value: any, rawString = false) {
    window.localStorage.setItem(name, rawString ? value : JSON.stringify(value));
  },
};

export function localStorageRef(name: string, rawString = false) {
  let value = localStorage.get(name, rawString);

  return customRef((track, trigger) => ({
    get() {
      track();
      return value;
    },

    set(v) {
      value = v;
      localStorage.set(name, v, rawString)
      trigger();
    },
  }));
}
