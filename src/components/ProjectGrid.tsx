"use client";

import Link from "next/link";
import { useState } from "react";
import { Img } from "./Img";
import { ArrowUpRight } from "./Icons";
import { projects } from "@/content/site";

const FILTERS = ["All projects", "Infrastructure", "Water & utilities", "Manufacturing", "Panels & automation", "VIC", "NSW", "TAS"];

export function ProjectGrid() {
  const [f, setF] = useState(FILTERS[0]);
  const list = f === FILTERS[0] ? projects : projects.filter((p) => p.filter.includes(f));

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap", marginBottom: 56 }}>
        <div className="filters" role="group" aria-label="Filter projects">
          {FILTERS.map((x) => (
            <button key={x} className="chip" aria-pressed={x === f} onClick={() => setF(x)}>
              {x}
            </button>
          ))}
        </div>
        <p className="label muted" aria-live="polite">
          Showing {list.length} of {projects.length}
        </p>
      </div>
      <div className="pgrid">
        {list.map((p) => {
          const body = (
            <>
              <div className="pcard__media">
                <Img name={p.image} alt={p.alt} sizes="(max-width: 860px) 100vw, 60vw" />
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
              <h2 className="pcard__name">{p.name}</h2>
              <p className="pcard__sum">{p.summary}</p>
              {!p.detailed && <p className="label pcard__note">Case study details on request</p>}
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
    </>
  );
}
