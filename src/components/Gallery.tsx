"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Img } from "./Img";

/*
  Editorial project gallery. A repeating five-photo rhythm (wide + narrow,
  then three across) keeps rows level with no gaps. Any photo opens a
  full-screen viewer with arrows, keyboard and swipe.
*/
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open, go]);

  const alt = (i: number) => `${title}: site photo ${i + 1} of ${count}`;

  return (
    <>
      <ul className="gal" data-stagger>
        {images.map((name, i) => {
          const slot = i % 5; // 0,1 = wide/narrow row; 2,3,4 = three across
          return (
            <li key={name} className={`gal__item gal__item--${slot < 2 ? (slot === 0 ? "wide" : "narrow") : "third"}`}>
              <button className="gal__btn" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${count}`}>
                <Img name={name} alt={alt(i)} sizes={slot === 0 ? "(max-width: 760px) 100vw, 58vw" : "(max-width: 760px) 100vw, 33vw"} />
                <span className="gal__zoom" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 7V3h4M15 11v4h-4M3 3l5 5M15 15l-5-5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {open !== null ? (
        <div
          className="lbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touch.current = null;
          }}
        >
          <div className="lbox__frame">
            <Img key={images[open]} name={images[open]} alt={alt(open)} sizes="100vw" eager />
          </div>
          <p className="lbox__count label">
            {open + 1} / {count}
          </p>
          <button className="lbox__close" onClick={() => setOpen(null)} aria-label="Close" autoFocus>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4l12 12M16 4 4 16" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <button className="lbox__nav lbox__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M14 4 7 11l7 7" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <button className="lbox__nav lbox__nav--next" onClick={() => go(1)} aria-label="Next photo">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="m8 4 7 7-7 7" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
