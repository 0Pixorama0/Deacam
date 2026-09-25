"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { reducedMotion } from "@/lib/motion";
import { Img } from "../Img";
import { Arrow, ArrowUpRight } from "../Icons";
import { projects } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ProjectRail() {
  const root = useRef<HTMLElement>(null);
  const list = projects.filter((p) => p.slug !== "west-gate-tunnel-project");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 861px)", () => {
        if (reducedMotion()) return;
        const track = root.current!.querySelector<HTMLElement>(".rail__track")!;
        const dist = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${dist()}`,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(".rail__progress i", { scaleX: self.progress }),
          },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="rail" data-nav="dark" aria-labelledby="rail-title">
      <div className="wrap rail__head">
        <div>
          <p className="label eyebrow">Recent work</p>
          <h2 id="rail-title" className="h2" style={{ marginTop: 20, maxWidth: "12em" }} data-reveal="lines">
            Tier 1 infrastructure, utilities and remote sites.
          </h2>
        </div>
        <div style={{ display: "grid", gap: 20, justifyItems: "end" }}>
          <div className="rail__progress" aria-hidden="true">
            <i />
          </div>
          <Link href="/projects" className="link">
            All projects <Arrow />
          </Link>
        </div>
      </div>
      <div className="rail__viewport">
        <div className="rail__track">
          {list.map((p) => {
            const body = (
              <>
                <div className="pcard__media">
                  <Img name={p.image} alt={p.alt} sizes="(max-width: 860px) 78vw, 34vw" />
                  {p.detailed && (
                    <span className="pcard__go" aria-hidden="true">
                      <ArrowUpRight />
                    </span>
                  )}
                </div>
                <div className="pcard__meta label">
                  <span>{p.sector}</span>
                  <span>{p.state}</span>
                </div>
                <h3 className="pcard__name">{p.name}</h3>
                <p className="pcard__sum">{p.summary}</p>
              </>
            );
            return p.detailed ? (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="pcard">
                {body}
              </Link>
            ) : (
              <article key={p.slug} className="pcard">
                {body}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
