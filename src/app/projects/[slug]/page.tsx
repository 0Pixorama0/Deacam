import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreakdownCta } from "@/components/Blocks";
import { Img } from "@/components/Img";
import { Arrow } from "@/components/Icons";
import { projects } from "@/content/site";

const detailed = projects.filter((p) => p.detailed);

export function generateStaticParams() {
  return detailed.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = detailed.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: `${p.name}`,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { images: [{ url: `/img/${p.image}.jpg`, alt: p.alt }] },
  };
}

export default async function CaseStudy({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const i = detailed.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = detailed[i];
  const next = detailed[(i + 1) % detailed.length];

  return (
    <>
      <section className="case-hero" data-nav="dark">
        <div className="media">
          <div className="parallax-img" data-parallax="8">
            <Img name={p.image} alt={p.alt} sizes="100vw" eager />
          </div>
        </div>
        <div className="case-hero__copy wrap">
          <Link href="/projects" className="label" style={{ color: "rgba(255,255,255,.7)" }}>
            ← Project record
          </Link>
          <h1 className="h1" style={{ marginTop: 20, maxWidth: "14em" }} data-reveal="lines">
            {p.name}
          </h1>
          <div className="case-meta">
            <div>
              <span className="label">Client</span>
              <b>{p.client}</b>
            </div>
            <div>
              <span className="label">Location</span>
              <b>{p.location}</b>
            </div>
            <div>
              <span className="label">Sector</span>
              <b>{p.sector}</b>
            </div>
            <div>
              <span className="label">State</span>
              <b>{p.state}</b>
            </div>
          </div>
        </div>
      </section>

      <section className="section" data-nav="light">
        <div className="wrap grid" style={{ rowGap: 48 }}>
          <div style={{ gridColumn: "1 / span 5" }}>
            <p className="label eyebrow">Fast facts</p>
            <ul className="glance glance--facts" style={{ marginTop: 24 }} data-stagger>
              {p.facts?.map((f) => (
                <li key={f}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ gridColumn: "7 / span 6" }}>
            <p className="label eyebrow">Scope of works</p>
            <p className="statement" style={{ marginTop: 24, fontSize: "clamp(24px, 2.4vw, 36px)" }} data-reveal="lines">
              {p.summary}
            </p>
            {p.scope?.map((s) => (
              <p key={s} className="muted" style={{ marginTop: 20 }} data-reveal="fade">
                {s}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} data-nav="light" aria-labelledby="svc-h">
        <div className="wrap">
          <h2 id="svc-h" className="h3" style={{ marginBottom: 40 }}>
            Services provided
          </h2>
          <div className="case-cols">
            {p.services?.map((g) => (
              <div key={g.group}>
                <h3 className="h4">{g.group}</h3>
                <ul data-stagger>
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {p.gallery && (
        <section className="section" style={{ paddingTop: 0 }} data-nav="light" aria-label="Project gallery">
          <div className="wrap gallery">
            {p.gallery.map((g) => (
              <div key={g} className="media" data-reveal="img">
                <Img name={g} alt={`${p.name}: site photograph`} natural sizes="(max-width: 900px) 50vw, 33vw" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="dark" data-nav="dark">
        <div className="wrap">
          <Link href={`/projects/${next.slug}`} className="next-case">
            <div>
              <p className="label muted">Next project</p>
              <p className="h2" style={{ marginTop: 16 }}>
                {next.name}
              </p>
            </div>
            <span className="btn btn--light" aria-hidden="true">
              View <Arrow />
            </span>
          </Link>
        </div>
      </section>

      <BreakdownCta />
    </>
  );
}
