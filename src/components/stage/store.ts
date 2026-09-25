// Shared, mutable state between the DOM stage and the WebGL scene.
// Kept outside React so scroll never triggers a re-render.
export const stageStore = {
  el: null as HTMLElement | null,
  px: 0, // pointer, -1..1
  py: 0,
  reduce: false,
  mobile: false,
  ready: false,
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Scroll position through the stage, in viewport heights from its top. */
export function stageV() {
  const el = stageStore.el;
  if (!el) return 0;
  return -el.getBoundingClientRect().top / window.innerHeight;
}
