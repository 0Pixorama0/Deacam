import Image from "next/image";
import logos from "@/content/logos.json";

type Logo = { slug: string; name: string; w: number; h: number };
const all = logos as Logo[];

// Equal optical weight: every mark gets roughly the same area, capped in height.
function size(l: Logo) {
  const aspect = l.w / l.h;
  const h = Math.min(64, Math.round(Math.sqrt(9200 / aspect)));
  return { h, w: Math.round(h * aspect) };
}

function Row({ items, reverse }: { items: Logo[]; reverse?: boolean }) {
  return (
    <div className={`logos__row ${reverse ? "is-rev" : ""}`}>
      <div className="logos__track">
        {[...items, ...items].map((l, i) => {
          const { w, h } = size(l);
          return (
            <div key={i} className="logos__item" aria-hidden={i >= items.length || undefined}>
              <Image src={`/logos/${l.slug}.png`} alt={i >= items.length ? "" : l.name} width={w} height={h} sizes={`${w}px`} style={{ width: w, height: h }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClientLogos() {
  const half = Math.ceil(all.length / 2);
  return (
    <section className="logos" data-nav="light" aria-labelledby="logos-title">
      <div className="wrap logos__head">
        <p id="logos-title" className="label eyebrow">
          Delivered for
        </p>
        <p className="muted">Tier 1 contractors, utilities, manufacturers and producers across three states.</p>
      </div>
      <div className="logos__rows">
        <Row items={all.slice(0, half)} />
        <Row items={all.slice(half)} reverse />
      </div>
      {/* Reduced motion: a still grid instead of moving rows. */}
      <ul className="logos__grid wrap">
        {all.map((l) => {
          const { w, h } = size(l);
          return (
            <li key={l.slug}>
              <Image src={`/logos/${l.slug}.png`} alt={l.name} width={w} height={h} sizes={`${w}px`} style={{ width: w, height: h }} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
