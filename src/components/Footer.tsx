import Link from "next/link";
import { Logo } from "./Logo";
import { company, divisions } from "@/content/site";

export function Footer() {
  const year = 2026;
  return (
    <footer className="footer" data-nav="dark">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>
              Industrial electrical, mechanical and refrigeration engineering. Head office in Kilsyth, servicing{" "}
              {company.serviceArea}.
            </p>
          </div>
          <div>
            <h3 className="label">Services</h3>
            <ul>
              {divisions.map((d) => (
                <li key={d.id}>
                  <Link href={`/services#${d.id}`}>{d.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label">Company</h3>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/industries">Industries</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><a href={company.social.linkedin} target="_blank" rel="noopener">LinkedIn</a></li>
              <li><a href={company.social.instagram} target="_blank" rel="noopener">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h3 className="label">24/7 Breakdown</h3>
            <a href={company.phoneHref} className="footer__big">{company.phone}</a>
            <ul style={{ marginTop: 12 }}>
              <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
              <li>
                <span style={{ color: "rgba(255,255,255,.86)", fontSize: 15 }}>
                  {company.address.street}
                  <br />
                  {company.address.suburb} {company.address.state} {company.address.postcode}
                </span>
              </li>
            </ul>
            <h3 className="label" style={{ marginTop: 32 }}>Licensed</h3>
            <div className="footer__lic">
              {company.licences.map((l) => (
                <span key={l.value}>
                  {l.state} {l.label} {l.value}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {year} {company.legalName}</span>
          <nav aria-label="Footer">
            <a href={company.staffLogin} target="_blank" rel="noopener">Staff login</a>
            <a href="#top">Back to top</a>
          </nav>
        </div>
      </div>
      <div className="footer__word" aria-hidden="true">
        <div className="wrap">
          <Logo title="" />
        </div>
      </div>
    </footer>
  );
}
