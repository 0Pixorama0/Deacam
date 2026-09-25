"use client";

import { useEffect, useState } from "react";
import { testimonials } from "@/content/site";

export function Quotes() {
  const [on, setOn] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setOn((o) => (o + 1) % testimonials.length), 8000);
    return () => window.clearTimeout(t);
  }, [on, paused]);

  return (
    <div className="quotes" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div>
        <p className="label eyebrow">What clients say</p>
        <div className="quotes__tabs" role="tablist" aria-label="Testimonials" style={{ marginTop: 32 }}>
          {testimonials.map((t, i) => (
            <button
              key={t.org}
              role="tab"
              id={`q-tab-${i}`}
              aria-selected={i === on}
              aria-controls={`q-panel-${i}`}
              className="quotes__tab"
              onClick={() => setOn(i)}
            >
              <span style={{ fontWeight: 500 }}>{t.org}</span>
              <span className="bar" key={`${i}-${on}-${paused}`} style={paused ? { opacity: 0.4 } : undefined} />
            </button>
          ))}
        </div>
      </div>
      <div>
        {testimonials.map((t, i) => (
          <figure
            key={t.org}
            id={`q-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`q-tab-${i}`}
            hidden={i !== on}
            className="quote-panel is-anim"
            style={{ margin: 0 }}
          >
            <blockquote className="quote">“{t.quote}”</blockquote>
            <figcaption className="quote__who">
              <span>
                <b style={{ fontWeight: 600 }}>{t.who}</b>
                <span className="muted"> · {t.org}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
