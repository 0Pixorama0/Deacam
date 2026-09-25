"use client";

import { useSyncExternalStore } from "react";
import { MOTION_KEY } from "@/lib/motion";

const read = () => document.documentElement.dataset.motion !== "reduce";

/** Footer switch: full motion by default, visitors can opt out; remembered per browser. */
export function MotionToggle() {
  const on = useSyncExternalStore(
    () => () => {},
    read,
    () => true,
  );
  const flip = () => {
    try {
      if (on) localStorage.setItem(MOTION_KEY, "reduce");
      else localStorage.removeItem(MOTION_KEY);
    } catch {}
    window.location.reload();
  };
  return (
    <button type="button" role="switch" aria-checked={on} className="motion-toggle" onClick={flip}>
      <i aria-hidden="true" />
      Motion {on ? "on" : "reduced"}
    </button>
  );
}
