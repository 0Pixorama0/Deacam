"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Img } from "../Img";
import { Arrow } from "../Icons";
import { divisions } from "@/content/site";

export function ServicesExplorer() {
  const [on, setOn] = useState(0);
  const [prev, setPrev] = useState(-1);
  const timer = useRef<number>(0);

  const select = (i: number) => {
    if (i === on) return;
    setPrev(on);
    setOn(i);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPrev(-1), 1200);
  };

  const d = divisions[on];

  return (
    <div className="svx">
      <div>
        <ul className="svx__list" role="tablist" aria-label="Services" aria-orientation="vertical">
          {divisions.map((x, i) => (
            <li key={x.id} className={`svx__item ${i === on ? "is-on" : ""}`}>
              <button
                role="tab"
                id={`svx-tab-${x.id}`}
                aria-selected={i === on}
                aria-controls="svx-panel"
                className="svx__btn"
                onClick={() => select(i)}
                onMouseEnter={() => window.matchMedia("(pointer: fine)").matches && select(i)}
                onFocus={() => select(i)}
              >
                <span className="label">{x.no}</span>
                <span className="svx__name">{x.name}</span>
                <span className="svx__plus" aria-hidden="true" />
              </button>
              <div className="svx__detail">
                <div>
                  <p>{x.lead}</p>
                  <Link href={`/services#${x.id}`} className="link" tabIndex={i === on ? 0 : -1}>
                    {x.id === "labour" ? "Discuss resourcing" : `Explore ${x.short.toLowerCase()}`} <Arrow />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="svx__media" id="svx-panel" role="tabpanel" aria-labelledby={`svx-tab-${d.id}`}>
        <div className="svx__frame">
          {divisions.map((x, i) => (
            <div key={x.id} className={`svx__img ${i === on ? "is-on" : ""} ${i === prev ? "was-on" : ""}`}>
              <Img name={x.image} alt={x.alt} sizes="(max-width: 900px) 100vw, 56vw" />
            </div>
          ))}
          <span className="svx__tag label">
            {d.no} / {d.layer}
          </span>
        </div>
        <ul className="svx__points" key={d.id}>
          {d.points.map((p, i) => (
            <li key={p} style={{ animation: `qin .8s ${0.05 * i}s var(--ease-out) both` }}>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
