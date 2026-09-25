"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { stageStore, stageV } from "./store";
import { reducedMotion } from "@/lib/motion";
import { Btn } from "../Btn";
import { Arrow } from "../Icons";
import { divisions } from "@/content/site";

const PanelScene = dynamic(() => import("./PanelScene"), { ssr: false });

const CHAPTERS = divisions.slice(0, 4);

export function Stage() {
  const ref = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [mount3d, setMount3d] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    stageStore.el = el;
    const mq = window.matchMedia("(max-width: 960px)");
    stageStore.mobile = mq.matches;
    stageStore.reduce = reducedMotion();

    // Defer WebGL until the browser is idle so the headline paints first.
    const idle = (window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))) as (cb: () => void) => number;
    const id = idle(() => setMount3d(true));

    const onMove = (e: PointerEvent) => {
      stageStore.px = (e.clientX / window.innerWidth) * 2 - 1;
      stageStore.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const v = stageV();
        // Hero copy drifts up and fades as the panel opens.
        const h = heroRef.current;
        if (h && !stageStore.reduce) {
          const t = Math.min(1, Math.max(0, v / 0.6));
          h.style.opacity = String(1 - t);
          h.style.transform = `translate3d(0, ${-t * 80}px, 0)`;
        }
        el.querySelectorAll<HTMLElement>(".chapter").forEach((c, i) => {
          const p = Math.min(1, Math.max(0, v - i - 0.5));
          c.style.setProperty("--p", p.toFixed(3));
        });
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      (window.cancelIdleCallback ?? window.clearTimeout)(id);
      stageStore.el = null;
    };
  }, []);

  return (
    <section ref={ref} className="stage dark" data-nav="dark" aria-label="Deacam engineering overview">
      <div className="stage__canvas" aria-hidden="true">
        <div className="stage__grid" />
        {mount3d && <PanelScene />}
      </div>

      <div ref={heroRef} className="hero wrap">
        <div className="hero__copy">
          <p className="label eyebrow" data-reveal="fade">
            Electrical · Mechanical · Refrigeration
          </p>
          <h1 className="display hero__title" data-reveal="lines">
            Engineering that keeps <span className="light">plants running.</span>
          </h1>
          <p className="lead hero__sub" data-reveal="fade" data-delay="0.35">
            Since 2008, Deacam has delivered electrical, mechanical and refrigeration engineering across Victoria, New
            South Wales and Tasmania, plus the on-site labour to keep it running.
          </p>
          <div className="hero__ctas" data-reveal="fade" data-delay="0.5">
            <Btn href="/contact" variant="light" magnetic>
              Talk to an engineer
            </Btn>
            <Btn href="/projects" variant="ghost">
              See the work
            </Btn>
          </div>
        </div>
        <div className="hero__scroll label" aria-hidden="true">
          Scroll to open <i />
        </div>
      </div>

      <div className="chapters">
        {CHAPTERS.map((d) => (
          <div key={d.id} className="chapter wrap">
            <div className="chapter__card">
              <div className="chapter__idx label">
                <b>{d.no}</b>
                <span className="chapter__bar" />
                <span>{d.layer}</span>
              </div>
              <h2 className="h2" data-reveal="lines">
                {d.name}
              </h2>
              <p className="lead" data-reveal="fade">
                {d.lead}
              </p>
              <ul data-stagger>
                {d.points.slice(0, 4).map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <Link href={`/services#${d.id}`} className="link">
                Explore {d.short.toLowerCase()} <Arrow />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
