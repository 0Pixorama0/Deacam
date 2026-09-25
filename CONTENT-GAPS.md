# DEACAM website: content gaps and assumptions

Everything on the site comes from deacam.com.au (read September 2026) or the client's
"Website Concept" document. Nothing has been invented. These items need the client.

## Missing information (left out, not faked)
- **Projects delivered**: the concept doc shows `[XXX]`. The stat is omitted until a real number is supplied.
- **Office hours**: the concept doc shows `[YOUR HOURS]`. Omitted; the 24/7 breakdown line is shown instead.
- **Awards**: the site says "four-time award winner" but never names the awards. Shown as that sentence only.
- **Certifications and prequalifications** (ISO, safety system, etc.): none published, none shown.
- **Case studies** for BlueScope Steel, Selwyn Snow Resort and Agnitek: only a title, one photo and a one-line
  summary exist. Their cards are not clickable and say "Case study details on request".
- **Refrigeration photography**: no refrigeration photos exist on the current site. The Refrigeration service
  uses a generic technician photo (`what-we-do`). A chiller or cool-room shot is needed.
- **Refrigeration capability statement**: the current site links to Contact, not a PDF. The card says
  "Available on request".
- **Renewables & off-grid proof**: the capability is on the site, but no named project. The industry row shows
  "Off-grid operations" without a link.

## Decisions to confirm
- **Address**: Kilsyth (7/428 Mt Dandenong Rd) is used everywhere, per the concept doc. The old site's schema
  and panel page still say 10 Clare St, Bayswater. Confirm the workshop location.
- **Client logos** in the "Delivered for" section are the 25 colour logos from the current site's "Our Customers"
  strip, including Siemens, Eaton and Dräger, which may be partners or suppliers rather than clients. Confirm the
  list and permission to show each logo. Originals are small (500x300 JPG); vector logos would be sharper.
- **Testimonials** are verbatim excerpts from the current site (Yarra Trams, Siemens, Oakridge Wines).
- **Staff login** keeps the current MAAPS link (deacam.maaps.com.au) in the footer.
- **Privacy and Terms pages** do not exist yet, so they are not linked.

## Before launch
- **Contact form delivery is not wired.** `src/app/contact/actions.ts` validates and logs enquiries but does not
  send email. Connect Resend, SMTP or the client's CRM to info@deacam.com.au.
- Supply original high-resolution photography where possible (current images are the website copies, max 2500px).
- Vector logo: the logo in `src/components/Logo.tsx` was traced from the supplied PNG. Replace it with the
  official SVG when available.

## 3D models
- The hero/chapter models are CC0 scans from Poly Haven (polyhaven.com): power_box_01, utility_box_01,
  overhead_crane, exterior_aircon_unit, plus the studio_small_09 HDRI. CC0 means no attribution or licence fee.
  The DEACAM badges are added in code. For a bespoke look, DEACAM's own panel CAD (from the workshop) could replace
  the distribution board model with no code changes beyond the file path.
