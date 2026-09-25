"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Btn } from "./Btn";
import { company, nav } from "@/content/site";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [open, setOpen] = useState(false);

  // Compact on scroll, and flip to light ink whenever a dark section sits under the bar.
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      setScrolled(window.scrollY > 24);
      const probeY = 30;
      const els = document.elementsFromPoint(window.innerWidth / 2, probeY);
      const host = els.find((e) => !e.closest(".nav") && e.closest("[data-nav]"))?.closest<HTMLElement>("[data-nav]");
      setOnDark(host?.dataset.nav === "dark");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("menu-open", open);
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Close the menu on navigation without an extra effect-driven state update.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isOn = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className={`nav ${scrolled ? "is-scrolled" : ""} ${onDark || open ? "on-dark" : ""}`}>
        <div className="wrap nav__in">
          <Link href="/" className="nav__logo" aria-label="Deacam home">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="nav__links">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isOn(n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="nav__right">
            <a href={company.phoneHref} className="nav__phone" aria-label={`24/7 breakdown line ${company.phone}`}>
              <i aria-hidden="true" />
              24/7 {company.phone}
            </a>
            <a href={company.staffLogin} className="nav__login" target="_blank" rel="noopener" aria-label="Staff login (opens in a new tab)">
              Login
            </a>
            <Btn href="/contact">Start a project</Btn>
            <button
              className="nav__burger"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mmenu"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div id="mmenu" className="mmenu" aria-hidden={!open} inert={!open}>
        <ul>
          {nav.map((n, i) => (
            <li key={n.href}>
              <Link href={n.href}>
                {n.label}
                <span className="label">0{i + 1}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mmenu__foot">
          <Btn href={company.phoneHref} variant="light">
            24/7 Breakdown {company.phone}
          </Btn>
          <Btn href="/contact" variant="red">
            Start a project
          </Btn>
          <a href={company.staffLogin} className="mmenu__login" target="_blank" rel="noopener">
            Staff login
          </a>
        </div>
      </div>
    </>
  );
}
