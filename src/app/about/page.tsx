import type { Metadata } from "next";
import { BreakdownCta, Licences, PageHead } from "@/components/Blocks";
import { Img } from "@/components/Img";
import { Quotes } from "@/components/home/Quotes";
import { company, timeline, values } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Founded in 2008 and run from Kilsyth in Melbourne’s east. Industrial electrical, mechanical and refrigeration divisions, licensed in Victoria, New South Wales and Tasmania.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHead
        eyebrow="About Deacam"
        title="Engineering the jobs"
        light="nobody else will quote."
        body="Founded in 2008 and run from Kilsyth in Melbourne’s east. Three divisions, licensed in three states, and a deliberate focus on training the next generation of trades."
      />
      <section className="pbanner" data-nav="dark" aria-hidden="true">
        <div className="parallax-img" data-parallax="10">
          <Img name="about-banner" alt="" sizes="100vw" eager />
        </div>
      </section>

      <section className="section" data-nav="light" aria-labelledby="story-title">
        <div className="wrap grid" style={{ rowGap: 48 }}>
          <div style={{ gridColumn: "1 / span 7" }}>
            <p className="label eyebrow">Who we are</p>
            <h2 id="story-title" className="h2" style={{ marginTop: 20 }} data-reveal="lines">
              Unconventional projects, delivered by one accountable team.
            </h2>
            <div style={{ marginTop: 32, display: "grid", gap: 20, maxWidth: "36em" }} className="muted">
              <p data-reveal="fade">
                Deacam was founded in 2008 and has built its reputation on projects that demand innovative thinking. We
                specialise in customised electrical and mechanical work: the jobs where a catalogue solution does not
                fit.
              </p>
              <p data-reveal="fade">
                Today the business runs three divisions from Kilsyth: industrial electrical, mechanical, and industrial
                refrigeration. Because they sit under one roof, a single scope can cover the switchboard, the control
                software, the pipework and the people who maintain it, without the coordination risk of three separate
                contractors.
              </p>
              <p data-reveal="fade">
                We are licensed in Victoria, New South Wales and Tasmania, and we work on operating plants where shutting
                down is not an option.
              </p>
            </div>
          </div>
          <aside style={{ gridColumn: "9 / span 4" }}>
            <p className="label">At a glance</p>
            <ul className="glance" style={{ marginTop: 20 }}>
              <li><span>Founded</span><span>{company.founded}</span></li>
              <li><span>Head office</span><span>Kilsyth, VIC</span></li>
              <li><span>Divisions</span><span>3</span></li>
              <li><span>States licensed</span><span>VIC · NSW · TAS</span></li>
              <li><span>Breakdown cover</span><span>24/7</span></li>
              <li><span>Recognition</span><span>Four-time award winner</span></li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section mist" data-nav="light" aria-labelledby="tl-title">
        <div className="wrap">
          <p className="label eyebrow">How we got here</p>
          <h2 id="tl-title" className="h2" style={{ marginTop: 20, marginBottom: 56 }} data-reveal="lines">
            Built one division at a time.
          </h2>
          <div className="tl" data-stagger>
            {timeline.map((t) => (
              <div key={t.title}>
                <b>{t.year}</b>
                <h3 className="h4">{t.title}</h3>
                <p>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" data-nav="light" aria-labelledby="val-title">
        <div className="wrap">
          <p className="label eyebrow">What we hold ourselves to</p>
          <h2 id="val-title" className="h2" style={{ marginTop: 20, marginBottom: 56, maxWidth: "12em" }} data-reveal="lines">
            Three principles, on every job.
          </h2>
          <div className="values" data-stagger>
            {values.map((v) => (
              <div key={v.title}>
                <h3 className="h4">{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} data-nav="light" aria-labelledby="app-title">
        <div className="wrap split">
          <div className="mosaic">
            <div className="media tall" data-reveal="img">
              <Img name="pn-05" alt="Deacam electrician with a finished control panel" sizes="(max-width: 900px) 50vw, 25vw" />
            </div>
            <div className="media tall off" data-reveal="img">
              <Img name="pn-13" alt="Apprentice in the Deacam panel workshop" sizes="(max-width: 900px) 50vw, 25vw" />
            </div>
          </div>
          <div>
            <p className="label eyebrow">Apprenticeships</p>
            <h2 id="app-title" className="h2" style={{ marginTop: 20 }} data-reveal="lines">
              More than ten A Grade electricians, <span className="light muted">trained here.</span>
            </h2>
            <p className="lead muted" style={{ marginTop: 24 }} data-reveal="fade">
              Our panel workshop doubles as a training floor. Apprentices learn to interpret schematics and wire complex
              panels under experienced tradespeople, then carry those skills onto live sites.
            </p>
          </div>
        </div>
      </section>

      <section className="section mist" data-nav="light" aria-label="Testimonials">
        <div className="wrap">
          <Quotes />
        </div>
      </section>

      <section className="section--tight" data-nav="light" aria-label="Licences">
        <div className="wrap">
          <p className="label" style={{ marginBottom: 24 }}>
            Licensed &amp; accredited
          </p>
          <Licences />
        </div>
      </section>

      <BreakdownCta image="brand-17" />
    </>
  );
}
