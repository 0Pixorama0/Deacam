import type { Metadata } from "next";
import { BreakdownCta, PageHead } from "@/components/Blocks";
import { IndustriesIndex } from "@/components/home/IndustriesIndex";
import { Btn } from "@/components/Btn";
import { Img } from "@/components/Img";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Water utilities, Tier 1 infrastructure, heavy industry, manufacturing, alpine sites and off-grid operations. Electrical, automation and refrigeration engineering for plants that cannot stop.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHead
        eyebrow="Industries"
        title="Plants that cannot"
        light="afford to stop."
        body="Water utilities, Tier 1 infrastructure, heavy industry, manufacturing, alpine sites and off-grid operations. Each has a different definition of risk, and a different definition of done."
      />
      <section className="pbanner" data-nav="dark" aria-hidden="true">
        <div className="parallax-img" data-parallax="10">
          <Img name="tw-12" alt="" sizes="100vw" eager />
        </div>
      </section>
      <section className="section" data-nav="light" aria-label="Where we work">
        <div className="wrap">
          <IndustriesIndex />
        </div>
      </section>
      <section className="section mist" data-nav="light" aria-labelledby="nl-title">
        <div className="wrap split split--rev">
          <div className="media split__media" style={{ aspectRatio: "4 / 3" }} data-reveal="img">
            <Img name="selwyn" alt="Deacam team at Selwyn Snow Resort" sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <div>
            <p className="label eyebrow">Not listed?</p>
            <h2 id="nl-title" className="h2" style={{ marginTop: 20 }} data-reveal="lines">
              Most of our work starts as an <span className="light muted">unconventional request.</span>
            </h2>
            <p className="lead muted" style={{ marginTop: 24 }} data-reveal="fade">
              If your plant does not fit a standard category, that is usually a reason to call us rather than a reason
              not to.
            </p>
            <div style={{ marginTop: 40 }}>
              <Btn href="/contact">Talk to an engineer</Btn>
            </div>
          </div>
        </div>
      </section>
      <BreakdownCta />
    </>
  );
}
