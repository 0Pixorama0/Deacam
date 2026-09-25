"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Img } from "../Img";
import { industries, projects } from "@/content/site";

/** Typographic index. On fine pointers a project photo follows the cursor. */
export function IndustriesIndex({ withBody = true }: { withBody?: boolean }) {
  const float = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(-1);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = float.current!;
    const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX + 32);
      yTo(e.clientY - 120);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const hrefFor = (href: string) => {
    const slug = href.split("/projects/")[1];
    if (!slug) return href;
    return projects.find((p) => p.slug === slug)?.detailed ? href : "/projects";
  };

  return (
    <>
      <ul className="ind" onMouseLeave={() => setHover(-1)}>
        {industries.map((x, i) => (
          <li key={x.name} className="ind__row" onMouseEnter={() => setHover(i)}>
            <span className="label no">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="ind__name">{x.name}</h3>
            {withBody && <p className="ind__body">{x.body}</p>}
            <div className="ind__proof">
              <span className="label">Proof · {x.state}</span>
              {x.href === "/contact" ? (
                <span className="pn">{x.proof}</span>
              ) : (
                <Link href={hrefFor(x.href)} className="link link--under">
                  {x.proof}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div ref={float} className={`ind-float ${hover >= 0 ? "is-on" : ""}`} aria-hidden="true">
        {industries.map((x, i) => (
          <div key={x.name} className={i === hover ? "is-on" : ""} style={{ position: "absolute", inset: 0, opacity: i === hover ? 1 : 0, transition: "opacity .4s" }}>
            <Img name={x.image} alt="" sizes="320px" />
          </div>
        ))}
      </div>
    </>
  );
}
