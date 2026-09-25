import type { Metadata } from "next";
import { BreakdownCta, Needs, PageHead } from "@/components/Blocks";
import { Img } from "@/components/Img";
import { Btn } from "@/components/Btn";
import { Download } from "@/components/Icons";
import { SubNav } from "@/components/SubNav";
import { divisions } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Industrial electrical, control panels and automation, machine safety and mechanical, industrial refrigeration and on-site labour, delivered under one accountable contract.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHead
        eyebrow="Services"
        title="Electrical, mechanical"
        light="and refrigeration."
        body="Four divisions under one accountable contract, plus the on-site labour to deliver them. We work on operating plants, so the work is planned around your production, not the other way round."
      />

      <section className="section--tight" style={{ paddingTop: 0 }} data-nav="light">
        <div className="wrap">
          <Needs />
        </div>
      </section>

      <SubNav items={divisions.map((d) => ({ id: d.id, label: d.name }))} />

      <div className="wrap" data-nav="light">
        {divisions.map((d) => (
          <section key={d.id} id={d.id} className="division" aria-labelledby={`${d.id}-title`}>
            <div className="media division__media" data-reveal="img">
              <div style={{ position: "absolute", inset: 0 }}>
                <Img name={d.image} alt={d.alt} sizes="(max-width: 900px) 100vw, 50vw" />
              </div>
            </div>
            <div>
              <p className="label">
                <span className="red">Division {d.no}</span> <span className="muted">· {d.layer}</span>
              </p>
              <h2 id={`${d.id}-title`} className="h2" style={{ marginTop: 20 }} data-reveal="lines">
                {d.name}
              </h2>
              <p className="lead muted" style={{ marginTop: 24 }} data-reveal="fade">
                {d.lead}
              </p>
              <ul className="division__points" data-stagger>
                {d.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Btn href={`/contact?need=${d.id}`}>{d.id === "labour" ? "Discuss your resourcing" : "Send us a scope"}</Btn>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="section mist" data-nav="light" aria-labelledby="dl-title">
        <div className="wrap">
          <div className="grid" style={{ rowGap: 24, marginBottom: 48 }}>
            <div style={{ gridColumn: "1 / span 7" }}>
              <p className="label eyebrow">For tender and prequalification</p>
              <h2 id="dl-title" className="h2" style={{ marginTop: 20 }} data-reveal="lines">
                Capability statements
              </h2>
            </div>
          </div>
          <div className="downloads">
            <a className="dl" href="https://www.deacam.com.au/s/Deacam-Electrical-Capability-Statement.pdf" target="_blank" rel="noopener">
              <div>
                <h3 className="h4">Electrical capability statement</h3>
                <p>PDF · Industrial electrical and automation</p>
              </div>
              <Download size={20} />
            </a>
            <a className="dl" href="/contact?need=refrigeration">
              <div>
                <h3 className="h4">Refrigeration capability statement</h3>
                <p>Available on request from our team</p>
              </div>
              <Download size={20} />
            </a>
          </div>
        </div>
      </section>

      <BreakdownCta image="tw-13" />
    </>
  );
}
