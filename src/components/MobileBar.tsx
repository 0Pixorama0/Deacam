"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { company } from "@/content/site";
import { Phone } from "./Icons";

/** Phone-only action bar. Hides while the footer (which repeats both actions) is on screen. */
export function MobileBar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { threshold: 0.05 });
    io.observe(footer);
    return () => io.disconnect();
  }, [pathname]);

  return (
    <nav className={`mbar ${hidden ? "is-hidden" : ""}`} aria-label="Quick actions">
      <a href={company.phoneHref}>
        <Phone /> 24/7 Call
      </a>
      <Link href="/contact">Start a project</Link>
    </nav>
  );
}
