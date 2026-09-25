import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHead } from "@/components/Blocks";
import { company } from "@/content/site";
import { EnquiryForm } from "./EnquiryForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send Deacam a scope, or call the 24/7 breakdown line on (03) 9738 0528. Head office 7/428 Mt Dandenong Rd, Kilsyth VIC 3137.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const addr = `${company.address.street}, ${company.address.suburb} ${company.address.state} ${company.address.postcode}`;
  return (
    <>
      <PageHead
        eyebrow="Contact"
        title="Tell us what"
        light="you need."
        body="Send a scope and we will send back a method. If something is down right now, call the breakdown line instead. It is answered around the clock."
      />
      <section className="section" style={{ paddingTop: 0 }} data-nav="light">
        <div className="wrap contact">
          <div>
            <div className="breakdown dark">
              <p className="label eyebrow">24/7 Breakdown</p>
              <a className="num" href={company.phoneHref}>
                {company.phone}
              </a>
              <p>A real engineer answers. Electrical, mechanical or refrigeration, day or night.</p>
            </div>
            <ul className="details">
              <li>
                <span className="label">Head office</span>
                <span>
                  {company.address.street}
                  <br />
                  {company.address.suburb} {company.address.state} {company.address.postcode}
                  <br />
                  <a className="link link--under" style={{ marginTop: 8 }} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`} target="_blank" rel="noopener">
                    Get directions
                  </a>
                </span>
              </li>
              <li>
                <span className="label">Email</span>
                <a href={`mailto:${company.email}`} className="link link--under" style={{ justifySelf: "start" }}>
                  {company.email}
                </a>
              </li>
              <li>
                <span className="label">Service area</span>
                <span>{company.serviceArea}</span>
              </li>
              <li>
                <span className="label">Licences</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.8 }}>
                  VIC REC 31967 · RTA AU59460
                  <br />
                  NSW Contractor Licence 386499C
                  <br />
                  TAS Contractor Licence 934109158
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="h3" style={{ marginBottom: 32 }}>
              Send us a scope
            </h2>
            <Suspense>
              <EnquiryForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
