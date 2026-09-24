# Deacam website

A static site. No build step, no framework, no dependencies — the files in this
folder are the site. Open `index.html` in a browser and it works.

```
site/
├── index.html          Home
├── about.html          About
├── services.html       Services
├── industries.html     Industries
├── projects.html       Projects
├── contact.html        Contact
└── assets/
    ├── css/style.css   All styling — tokens, layout, components, breakpoints
    ├── js/nav.js       Mobile menu only (the site works without it on desktop)
    └── img/            Photography, logo, and client logos
```

## Editing

The HTML is **generated** by `tools/build_site.py`, so shared chrome (header,
mobile nav, footer, call-to-action) is written once and cannot drift between
pages. Edit the generator, then:

```bash
python3 tools/build_site.py
```

Editing the `.html` files directly also works, but the next generator run
overwrites them. Pick one and stick to it.

Styling never needs the generator — `assets/css/style.css` is loaded as-is.

## Checking it

```bash
python3 tools/shoot.py
```

Renders every page at 1440px and 390px, screenshots them to `tools/shots/`,
and fails if it finds horizontal overflow, a missing asset, a console error, or
a mobile menu that will not open and close.

## Deploying

Upload the contents of `site/` to any web host. It is plain static files, so
Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3 and ordinary cPanel hosting
all work with no configuration.

## Still to do before this goes live

- **Contact form has no backend.** `<form action="#">` — point it at a form
  handler (Formspree, Netlify Forms, or your own endpoint) or it will not send.
- **Placeholders**: `[XXX]` projects delivered, `[XX]` total on the projects
  page, `[YOUR HOURS]` on contact.
- **Photography** is upscaled from screenshots of the previous site. Replace
  with originals before launch.
- **Client logos** are cropped from the previous site. Confirm you hold
  permission to display each one — some Tier 1 contracts restrict it.
- **No refrigeration photo** exists yet; that division has no visual proof.
- **Verify the registered entity name** in the footer copyright, and add the ABN
  if you want it there.
- `#login` points nowhere — wire it to the CRM.
- Social links are `#facebook` / `#instagram` / `#linkedin` placeholders.

## Notes on the front end

- Fluid type via `clamp()`, so nothing snaps between breakpoints.
- Breakpoints at 1080px, 860px (mobile nav appears) and 620px.
- Hover styles are gated behind `@media (hover: hover) and (pointer: fine)` so
  touch devices never get a stuck hover state.
- Form inputs are 16px minimum, which stops iOS zooming the page on focus.
- `touch-action: manipulation` on controls removes the 300ms tap delay.
- Honours `prefers-reduced-motion`, `prefers-reduced-transparency` and
  `prefers-contrast`.
- Every image carries `width`/`height` attributes to prevent layout shift, with
  `height: auto` in CSS so aspect ratios stay correct.
