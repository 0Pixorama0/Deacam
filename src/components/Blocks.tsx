import Link from "next/link";
import { Img } from "./Img";
import { Btn } from "./Btn";
import { Arrow, ArrowUpRight, Phone } from "./Icons";
import { company, needs } from "@/content/site";

export function Needs() {
  return (
    <div className="needs" data-stagger>
      {needs.map((n, i) => {
        const urgent = n.key === "broken";
        const inner = (
          <>
            <span className={`label ${urgent ? "label--red" : "muted"}`}>{urgent ? "24/7" : `0${i + 1}`}</span>
            <span className="need__title">{n.title}</span>
            <span className="need__body">{n.body}</span>
            <span className="need__cta">
              <span className="txt">{urgent ? company.phone : n.cta}</span>
              <span className="circle" aria-hidden="true">
                {urgent ? <Phone /> : <Arrow />}
              </span>
            </span>
          </>
        );
        return n.href.startsWith("tel:") ? (
          <a key={n.key} href={n.href} className={`need ${urgent ? "need--urgent" : ""}`} aria-label={`${n.title}. ${n.cta} ${company.phone}`}>
            {inner}
          </a>
        ) : (
          <Link key={n.key} href={n.href} className="need">
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

export function Facts({ items }: { items: { v: string; k: string; count?: number }[] }) {
  return (
    <div className="facts" data-stagger>
      {items.map((f) => (
        <div key={f.k} className="fact">
          <div className="fact__v">{f.count ? <span data-count={f.count}>{f.v}</span> : f.v}</div>
          <div className="fact__k">{f.k}</div>
        </div>
      ))}
    </div>
  );
}

export function Licences() {
  return (
    <div className="licences" data-stagger>
      {company.licences.map((l) => (
        <div key={l.value}>
          <span className="label">
            {l.state} · {l.label}
          </span>
          <b>{l.value}</b>
        </div>
      ))}
    </div>
  );
}

export function BreakdownCta({ image = "tw-14" }: { image?: string }) {
  return (
    <section className="cta dark section" data-nav="dark" aria-labelledby="cta-title">
      <div className="cta__bg" data-parallax="6" aria-hidden="true">
        <Img name={image} alt="" sizes="100vw" />
      </div>
      <div className="wrap">
        <div className="cta__grid">
          <div>
            <p className="label eyebrow">24/7 Breakdown</p>
            <h2 id="cta-title" className="h1" style={{ marginTop: 24 }} data-reveal="lines">
              Plant down? <span className="light muted-on-dark">We answer.</span>
            </h2>
            <a href={company.phoneHref} className="cta__phone" data-reveal="fade">
              {company.phone}
            </a>
          </div>
          <div className="cta__side" data-reveal="fade">
            <p className="lead">
              Breakdown response around the clock, backed by in-house engineering and on-site labour. Electrical,
              mechanical or refrigeration.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Btn href="/contact" variant="light" magnetic>
                Plan a project
              </Btn>
              <Btn href={`mailto:${company.email}`} variant="ghost">
                {company.email}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PageHead({
  eyebrow,
  title,
  light,
  body,
  dark,
  children,
}: {
  eyebrow: string;
  title: string;
  light?: string;
  body?: string;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className={`phead ${dark ? "dark" : ""}`} data-nav={dark ? "dark" : "light"}>
      <div className="wrap">
        <p className="label eyebrow" data-reveal="fade">
          {eyebrow}
        </p>
        <div className="phead__grid">
          <h1 className="h1" data-reveal="lines">
            {title} {light && <span className={`light ${dark ? "muted-on-dark" : "muted"}`}>{light}</span>}
          </h1>
          {body && (
            <p className="lead" data-reveal="fade" data-delay="0.3">
              {body}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export { ArrowUpRight };
