"use client";

import { useEffect, useState } from "react";

/** Sticky in-page index that tracks which section is in view. */
export function SubNav({ items }: { items: { id: string; label: string }[] }) {
  const [on, setOn] = useState(items[0]?.id);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const line = window.innerHeight * 0.35;
      let current = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= line) current = it.id;
      }
      setOn(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  const go = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.scrollY - 110;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="subnav" aria-label="On this page" data-nav="light">
      <div className="wrap subnav__in">
        {items.map((it) => (
          <a key={it.id} href={`#${it.id}`} className={on === it.id ? "is-on" : ""} onClick={(e) => go(e, it.id)}>
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
