"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Img } from "../Img";
import { Arrow } from "../Icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** West Gate: the image opens from an inset frame to full bleed while pinned. */
export function FeatureProject() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 861px) and (prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".feature__pin", start: "top top", end: "+=110%", scrub: 1, pin: true },
        });
        tl.fromTo(
          ".feature__img",
          { clipPath: "inset(14% 12% 14% 12% round 4px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" },
        )
          .fromTo(".feature__img img", { scale: 1.2 }, { scale: 1, ease: "none" }, 0)
          .fromTo(".feature__copy > *", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.08, ease: "power2.out" }, 0.45);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="feature" data-nav="dark" aria-labelledby="feature-title">
      <div className="feature__pin">
        <div className="feature__img">
          <Img name="wg-05" alt="Gantry cranes lifted into place at the Benalla precast facility" sizes="100vw" />
        </div>
        <div className="feature__copy wrap">
          <div className="feature__meta label">
            <span className="eyebrow" style={{ color: "#fff" }}>Featured project</span>
            <span>Tier 1 Infrastructure</span>
            <span>Benalla, VIC</span>
          </div>
          <h2 id="feature-title" className="h1 feature__title">
            West Gate Tunnel Project
          </h2>
          <div className="feature__row">
            <div>
              <p className="lead">
                Turnkey electrical, automation and communications for the largest precast facility in the southern
                hemisphere. On site from greenfield to full production.
              </p>
              <Link href="/projects/west-gate-tunnel-project" className="link" style={{ marginTop: 24 }}>
                Read the case study <Arrow />
              </Link>
            </div>
            <div className="feature__stats">
              <div>
                <b>4+</b>
                <span>years on site, greenfield to production</span>
              </div>
              <div>
                <b>3</b>
                <span>factory buildings delivered turnkey</span>
              </div>
              <div>
                <b>2</b>
                <span>automated batching plants commissioned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
