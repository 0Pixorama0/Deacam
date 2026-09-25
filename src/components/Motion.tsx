"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

declare global {
  interface Window {
    __lenis?: Lenis;
    __motionReady?: boolean;
  }
}

const EASE = "expo.out";

/**
 * Site-wide motion layer.
 * Smooth scroll (Lenis) drives GSAP's ticker so ScrollTrigger and the
 * scroll position never disagree. Reveals are declared in markup with
 * data-reveal / data-parallax / data-magnetic, then wired here per route.
 */
export function Motion() {
  const pathname = usePathname();

  // Smooth scroll: created once for the life of the app.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  // Per-route reveals.
  useEffect(() => {
    const root = document.documentElement;
    window.__motionReady = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.__lenis?.scrollTo(0, { immediate: true, force: true });
    if (reduce) {
      root.classList.remove("motion");
      return;
    }

    const splits: SplitText[] = [];
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
        const split = new SplitText(el, { type: "lines", mask: "lines", linesClass: "line" });
        splits.push(split);
        gsap.set(el, { visibility: "visible" });
        gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.25,
          ease: EASE,
          stagger: 0.085,
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: el.closest(".hero") ? undefined : { trigger: el, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="fade"], [data-reveal="up"]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: el.dataset.reveal === "up" ? 40 : 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            ease: EASE,
            delay: Number(el.dataset.delay ?? 0),
            scrollTrigger: el.closest(".hero") ? undefined : { trigger: el, start: "top 90%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal="img"]').forEach((el) => {
        const img = el.querySelector("img");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 86%", once: true } });
        tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
        if (img) tl.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 1.9, ease: EASE }, 0);
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amt = Number(el.dataset.parallax || 10);
        gsap.fromTo(
          el,
          { yPercent: -amt },
          {
            yPercent: amt,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.fromTo(
          el.children,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            ease: EASE,
            stagger: 0.07,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const end = Number(el.dataset.count);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: end,
          duration: 1.6,
          ease: "power3.out",
          onUpdate: () => (el.textContent = Math.round(obj.v).toString()),
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });
    });

    // Magnetic primary CTAs: fine pointers only.
    if (window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
          yTo((e.clientY - (r.top + r.height / 2)) * 0.32);
        };
        const leave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });
    }

    // Late-loading images change layout; keep trigger positions honest.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 600);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", onLoad);
      cleanups.forEach((c) => c());
      splits.forEach((s) => s.revert());
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
