import type { Directive } from 'vue';

const scroll_lock = new Map<HTMLElement, { lockX: boolean, lockY: boolean, consumed: boolean }>();
export const vScrollLock: Directive = {
  beforeUpdate(el, binding) {
    let ctx = scroll_lock.get(el);
    if (!ctx) return;

    if (ctx.consumed) {
      ctx.lockX = Math.abs(el.scrollWidth - (el.clientWidth + Math.ceil(el.scrollLeft))) < 2;
      ctx.lockY = Math.abs(el.scrollHeight - (el.clientHeight + Math.ceil(el.scrollTop))) < 2;
    }

    ctx.consumed = false;
  },

  updated(el, binding) {
    let ctx = scroll_lock.get(el)!;

    if (ctx.lockX) {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    }

    if (ctx.lockY) {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }

    ctx.consumed = true;
  },

  mounted(el, binding, vnode) {
    el.scroll(el.scrollWidth - el.clientWidth, el.scrollHeight - el.clientHeight)

    scroll_lock.set(el, {
      lockX: true,
      lockY: true,
      consumed: true,
    });
  },
};
