import Link from "next/link";
import { Stage } from "@/components/stage/Stage";
import { ServicesExplorer } from "@/components/home/ServicesExplorer";
import { FeatureProject } from "@/components/home/FeatureProject";
import { ProjectRail } from "@/components/home/ProjectRail";
import { IndustriesIndex } from "@/components/home/IndustriesIndex";
import { Quotes } from "@/components/home/Quotes";
import { ClientLogos } from "@/components/home/ClientLogos";
import { BreakdownCta, Facts, Licences, Needs } from "@/components/Blocks";
import { Img } from "@/components/Img";
import { Btn } from "@/components/Btn";
import { Arrow } from "@/components/Icons";

export default function Home() {
  return (
    <>
      <Stage />
      <ClientLogos />

      {/* Positioning + triage */}
      <section className="section" data-nav="light" aria-labelledby="pos-title">
        <div className="wrap">
          <p className="label eyebrow" data-reveal="fade">
            One accountable team
          </p>
          <h2 id="pos-title" className="statement" style={{ marginTop: 32, maxWidth: "20em" }} data-reveal="lines">
            From the switchboard to the control software, the pipework and the people who maintain it.{" "}
            <span className="muted">Under one roof, without the coordination risk of three contractors.</span>
          </h2>
          <div style={{ marginTop: "clamp(64px, 8vw, 112px)" }}>
            <Facts
              items={[
                { v: "2008", k: "Founded in Melbourne’s east" },
                { v: "3", k: "States licensed: VIC, NSW, TAS" },
                { v: "24/7", k: "Breakdown response" },
                { v: "10+", k: "Apprentices qualified as A Grade electricians" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} data-nav="light" aria-labelledby="need-title">
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginBottom: 40, flexWrap: "wrap" }}>
            <h2 id="need-title" className="h2" data-reveal="lines">
              What do you need?
            </h2>
            <p className="muted" style={{ maxWidth: "24em" }} data-reveal="fade">
              Three ways in. If something is down right now, the breakdown line is answered around the clock.
            </p>
          </div>
          <Needs />
        </div>
      </section>

      {/* Services */}
      <section className="section mist" data-nav="light" aria-labelledby="svc-title">
        <div className="wrap">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, marginBottom: "clamp(40px, 5vw, 72px)", flexWrap: "wrap" }}>
            <div>
              <p className="label eyebrow" data-reveal="fade">
                Services
              </p>
              <h2 id="svc-title" className="h2" style={{ marginTop: 20, maxWidth: "13em" }} data-reveal="lines">
                Four divisions, one contract. <span className="light muted">Plus the people to deliver it.</span>
              </h2>
            </div>
            <Link href="/services" className="link" data-reveal="fade">
              All services <Arrow />
            </Link>
          </div>
          <ServicesExplorer />
        </div>
      </section>

      <FeatureProject />
      <ProjectRail />

      {/* Industries */}
      <section className="section" data-nav="light" aria-labelledby="ind-title">
        <div className="wrap">
          <div className="grid" style={{ marginBottom: "clamp(40px, 5vw, 72px)", rowGap: 24 }}>
            <div style={{ gridColumn: "1 / span 7" }}>
              <p className="label eyebrow" data-reveal="fade">
                Industries
              </p>
              <h2 id="ind-title" className="h2" style={{ marginTop: 20 }} data-reveal="lines">
                Plants that cannot afford to stop.
              </h2>
            </div>
            <p className="muted" style={{ gridColumn: "9 / span 4", alignSelf: "end" }} data-reveal="fade">
              Each sector has a different definition of risk, and a different definition of done.
            </p>
          </div>
          <IndustriesIndex />
        </div>
      </section>

      {/* Workshop */}
      <section className="section mist" data-nav="light" aria-labelledby="ws-title">
        <div className="wrap workshop">
          <div className="workshop__copy">
            <p className="label eyebrow" data-reveal="fade">
              In-house panel workshop
            </p>
            <h2 id="ws-title" className="h2" style={{ marginTop: 20 }} data-reveal="lines">
              Designed, built and tested <span className="light muted">under our own roof.</span>
            </h2>
            <p className="lead muted" style={{ marginTop: 24 }} data-reveal="fade">
              A fully equipped panel shop means drawings, build and factory testing never leave the team that commissions
              them on site.
            </p>
            <ul className="workshop__list" data-stagger>
              {[
                "Automated CNC cutting and marking",
                "3D panel modelling and 3D printing",
                "SIL and PL rated safety system design",
                "Factory acceptance testing before dispatch",
                "Siemens PLC, VSD and HMI integration",
              ].map((t, i) => (
                <li key={t}>
                  <span className="label">0{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 32 }}>
              <Btn href="/projects/custom-panel-builds" variant="ghost">
                Custom panel builds
              </Btn>
            </div>
          </div>
          <div className="mosaic">
            <div className="media tall" data-reveal="img">
              <Img name="pn-10" alt="Wired control panel with PLC and drives" sizes="(max-width: 900px) 50vw, 28vw" />
            </div>
            <div className="media tall off" data-reveal="img">
              <Img name="pn-02" alt="Siemens automation demonstration panel built by Deacam" sizes="(max-width: 900px) 50vw, 28vw" />
            </div>
            <div className="media wide" data-reveal="img">
              <Img name="pn-12" alt="Control panel enclosures on the workshop bench" sizes="(max-width: 900px) 100vw, 56vw" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section" data-nav="light" aria-label="Testimonials and licences">
        <div className="wrap">
          <Quotes />
          <div style={{ marginTop: "clamp(72px, 9vw, 128px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
              <p className="label">Licensed &amp; accredited</p>
              <p className="muted" style={{ fontSize: 15 }}>
                Four-time award winner for excellence
              </p>
            </div>
            <Licences />
          </div>
        </div>
      </section>

      {/* Next generation */}
      <section className="section" style={{ paddingTop: 0 }} data-nav="light" aria-labelledby="gen-title">
        <div className="wrap split">
          <div className="media split__media" data-reveal="img">
            <Img name="panels-thumb" alt="Deacam electrician standing beside a control panel he wired" sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <div>
            <p className="label eyebrow" data-reveal="fade">
              The next generation
            </p>
            <h2 id="gen-title" className="h2" style={{ marginTop: 20 }} data-reveal="lines">
              Trades are trained on live sites, <span className="light muted">not away from them.</span>
            </h2>
            <p className="lead muted" style={{ marginTop: 24 }} data-reveal="fade">
              More than ten Deacam apprentices have qualified as A Grade electricians. Every one graduates able to read,
              write and build from detailed schematics.
            </p>
            <div style={{ marginTop: 40 }} data-reveal="fade">
              <Btn href="/about" variant="ghost">
                About Deacam
              </Btn>
            </div>
          </div>
        </div>
      </section>

      <BreakdownCta />
    </>
  );
}
