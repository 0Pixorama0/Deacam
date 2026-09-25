"use client";

import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "@/lib/motion";

/**
 * Figures roll into place like a mechanical counter when they scroll into view.
 * Each digit spins through 0-9 (plus a couple of extra turns for the leading
 * digits) and lands on its value; symbols such as "/" and "+" fade in after.
 * Screen readers get the plain value.
 */
export function Odometer({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting || reducedMotion()) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const chars = value.split("");
  let digitIndex = 0;

  return (
    <span ref={ref} className={`odo ${on ? "is-on" : ""}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="odo__row">
        {chars.map((ch, i) => {
          if (!/\d/.test(ch)) {
            return (
              <span key={i} className="odo__sym" style={{ transitionDelay: `${0.9 + i * 0.06}s` }}>
                {ch}
              </span>
            );
          }
          const d = Number(ch);
          const spins = Math.max(0, 2 - digitIndex); // earlier digits travel further
          const stop = spins * 10 + d;
          const delay = digitIndex * 0.09;
          digitIndex++;
          return (
            <span key={i} className="odo__col">
              <span
                className="odo__reel"
                style={{
                  transform: on ? `translateY(-${stop * 1.2}em)` : "translateY(0)",
                  transitionDelay: `${delay}s`,
                  transitionDuration: `${1.6 + spins * 0.25}s`,
                }}
              >
                {Array.from({ length: spins * 10 + 10 }, (_, n) => (
                  <span key={n}>{n % 10}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
