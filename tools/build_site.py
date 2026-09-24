#!/usr/bin/env python3
"""Generate the Deacam static site.

Plain HTML + CSS, no build step and no dependencies — run it and commit the
output. Shared chrome (head, header, mobile nav, footer, CTA) lives here once
so the six pages cannot drift apart.

    python3 tools/build_site.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site")

PHONE_HREF = "tel:+61397380528"
PHONE = "(03) 9738 0528"
EMAIL = "info@deacam.com.au"
ADDR1 = "7/428 Mt Dandenong Rd"
ADDR2 = "Kilsyth VIC 3137"
YEAR = "2026"

NAV = [("About", "about.html"), ("Services", "services.html"),
       ("Industries", "industries.html"), ("Projects", "projects.html"),
       ("Contact", "contact.html")]

LICENCES = [("VIC", "REC 31967"), ("NSW", "386499C"),
            ("TAS", "934109158"), ("RTA", "AU59460")]

ICON = {
    "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    "arrow": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    "pin": '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    "mail": '<path d="M4 4h16v16H4z"/><polyline points="4 6 12 13 20 6"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    "bolt": '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    "pencil": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    "people": '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    "snow": '<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1"/>',
    "panel": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/>',
    "check": '<polyline points="20 6 9 17 4 12"/>',
    "doc": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/>',
    "star": '<path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/>',
}


def svg(name, size=20, stroke="currentColor", width=2, cls=""):
    c = ' class="%s"' % cls if cls else ""
    return ('<svg%s width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="%s" '
            'stroke-width="%s" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>'
            % (c, size, size, stroke, width, ICON[name]))


def head(title, desc, css_depth=""):
    return """<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
<title>%s</title>
<meta name="description" content="%s">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0e0f10">
<meta name="color-scheme" content="light">
<meta property="og:title" content="%s">
<meta property="og:description" content="%s">
<meta property="og:type" content="website">
<link rel="icon" href="%sassets/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="%sassets/css/style.css">
</head>
<body>
<a class="sr-only" href="#main">Skip to content</a>
""" % (title, desc, title, desc, css_depth, css_depth)


def header(current):
    links = "".join(
        '<a class="nav__link" href="%s"%s>%s</a>' % (h, ' aria-current="page"' if l == current else "", l)
        for l, h in NAV)
    mlinks = "".join(
        '<a href="%s"%s>%s</a>' % (h, ' aria-current="page"' if l == current else "", l)
        for l, h in NAV)
    return """<header class="header">
  <div class="wrap header__inner">
    <a class="header__logo" href="index.html" aria-label="Deacam home"><img src="assets/img/logo.png" alt="Deacam" width="1024" height="164"></a>
    <nav class="nav" aria-label="Main">
      %s
      <a class="nav__link" href="#login">Login</a>
      <a class="btn btn--red btn--cap" href="contact.html">Request a quote</a>
    </nav>
    <button class="burger" type="button" data-nav-open aria-expanded="false" aria-controls="mobile-nav">
      <span class="sr-only">Open menu</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
    </button>
  </div>
</header>

<div class="mnav" id="mobile-nav" data-open="false" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="mnav__top">
    <img src="assets/img/logo-white.png" alt="Deacam" width="1024" height="163">
    <button class="mnav__close" type="button" data-nav-close><span class="sr-only">Close menu</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
    </button>
  </div>
  <nav class="mnav__links" aria-label="Mobile">%s<a href="#login">Login</a></nav>
  <div class="mnav__foot">
    <a class="btn btn--red" href="contact.html">Request a quote</a>
    <a class="btn btn--white btn--phone" href="%s">%s</a>
  </div>
</div>
""" % (links, mlinks, PHONE_HREF, PHONE)


def hero(eyebrow, title, lede, actions="", media="", plain=False):
    return """<section class="hero%s">
  <div class="wrap hero__inner">
    <div class="hero__copy">
      <p class="eyebrow">%s</p>
      <h1 class="hero__title">%s</h1>
      <p class="hero__lede">%s</p>
      %s
    </div>
    %s
  </div>
</section>
""" % (" hero--plain" if plain else "", eyebrow, title, lede, actions, media)


CTA = """<section class="section">
  <div class="wrap">
    <div class="panel panel--red panel__row">
      <div>
        <h2>Plant down? We answer.</h2>
        <p style="margin-top:.5rem;max-width:30rem;">Breakdown response around the clock, backed by in-house engineering and on-site labour.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:.5rem;align-items:flex-start;">
        <a class="btn btn--white btn--phone" href="%s">%s %s</a>
        <span style="font-size:.8125rem;color:rgba(255,255,255,.84);">%s &middot; Kilsyth VIC</span>
      </div>
    </div>
  </div>
</section>
""" % (PHONE_HREF, svg("phone", 22, "currentColor", "2.3"), PHONE, EMAIL)


def footer():
    lic = "".join('<li><strong>%s</strong> %s</li>' % (a, b) for a, b in LICENCES)
    svc = ["Industrial Electrical", "Mechanical Engineering", "Industrial Refrigeration",
           "Process Automation", "On-site Labour"]
    return """<footer class="footer">
  <div class="wrap footer__grid">
    <div class="footer__col">
      <img class="footer__logo" src="assets/img/logo-white.png" alt="Deacam" width="1024" height="163">
      <p style="display:flex;gap:.75rem;">%s<span>%s<br>%s</span></p>
      <p style="margin-top:1rem;color:rgba(255,255,255,.48);font-size:.8125rem;">Servicing Victoria, New South Wales and Tasmania.</p>
    </div>
    <div class="footer__col">
      <h2 class="footer__title">Services</h2>
      <ul>%s</ul>
    </div>
    <div class="footer__col">
      <h2 class="footer__title">Company</h2>
      <ul><li><a href="about.html">About</a></li><li><a href="industries.html">Industries</a></li><li><a href="projects.html">Projects</a></li><li><a href="contact.html">Contact Us</a></li></ul>
    </div>
    <div class="footer__col">
      <h2 class="footer__title">24/7 Breakdown</h2>
      <a class="footer__phone" href="%s">%s</a>
      <p style="margin-top:.75rem;"><a href="mailto:%s">%s</a></p>
      <div class="socials">
        <a href="#facebook" aria-label="Deacam on Facebook"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
        <a href="#instagram" aria-label="Deacam on Instagram"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg></a>
        <a href="#linkedin" aria-label="Deacam on LinkedIn"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM2.98 21h4V9h-4zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.5c0-1.31-.02-3-1.9-3-1.9 0-2.19 1.42-2.19 2.9V21H9z"/></svg></a>
      </div>
    </div>
  </div>
  <div class="footer__licences">
    <div class="wrap licences">
      <p class="licences__label">Licensed &amp; accredited</p>
      <ul>%s</ul>
    </div>
  </div>
  <div class="legal">
    <div class="wrap legal__row">
      <span>&copy; %s Deacam Engineering Pty Ltd</span>
      <span class="legal__links"><a href="#login">Staff Login</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#safety">Safety &amp; Compliance</a></span>
    </div>
  </div>
</footer>

<script src="assets/js/nav.js" defer></script>
</body>
</html>
""" % (svg("pin", 17, "#bf1e2e"), ADDR1, ADDR2,
       "".join('<li><a href="services.html">%s</a></li>' % s for s in svc),
       PHONE_HREF, PHONE, EMAIL, EMAIL, lic, YEAR)


def write(name, title, desc, current, body):
    html = head(title, desc) + header(current) + '<main id="main">\n' + body + CTA + "</main>\n" + footer()
    path = os.path.join(OUT, name)
    with open(path, "w") as f:
        f.write(html)
    print("  %-18s %6.1f KB" % (name, os.path.getsize(path) / 1024))


# ── shared blocks ──────────────────────────────────────────────────────────

CLIENTS = [("siemens", "Siemens", 26), ("melbourne-airport", "Melbourne Airport", 54),
           ("bluescope", "BlueScope", 48), ("cpb-contractors", "CPB Contractors", 50),
           ("ausnet", "AusNet Services", 46), ("airservices", "Airservices Australia", 38),
           ("level-crossing-removal", "Level Crossing Removal Authority", 54),
           ("north-east-link", "Spark North East Link", 56), ("taswater", "TasWater", 34),
           ("mt-buller", "Mt Buller", 32), ("pirate-life", "Pirate Life Brewing", 50),
           ("oakridge", "Oakridge", 28)]


def clients_block():
    cells = "".join(
        '<div class="logo" style="--h:%dpx"><img src="assets/img/clients/%s.png" alt="%s" loading="lazy"></div>'
        % (h, f, a) for f, a, h in CLIENTS)
    return """<section class="clients section section--tight">
  <div class="wrap">
    <div class="section__head">
      <div>
        <p class="eyebrow eyebrow--bare">Delivered for</p>
        <h2 style="margin-top:.375rem;">Tier 1 infrastructure, utilities and heavy industry</h2>
      </div>
      <a class="section__link" href="projects.html">See the work &rarr;</a>
    </div>
    <div class="clients__grid">%s</div>
  </div>
</section>
""" % cells


ENTRY = [("bolt", "Something&rsquo;s broken", "Emergency electrical, mechanical or refrigeration breakdown &mdash; day or night.", "contact.html"),
         ("pencil", "I&rsquo;m planning a project", "New plant, an upgrade or a fit-out &mdash; designed and delivered end to end.", "services.html"),
         ("people", "I need people on site", "Qualified on-site labour and engineering support, contract or ongoing.", "services.html")]


def entry_block(title="What do you need?"):
    cards = "".join(
        '<a class="card card--pad" href="%s"><span class="card__icon">%s</span>'
        '<span class="card__title">%s</span><span class="card__text">%s</span></a>'
        % (href, svg(icon, 23, "currentColor", "2.1"), t, b) for icon, t, b, href in ENTRY)
    return """<section class="section">
  <div class="wrap">
    <div class="section__head"><h2>%s</h2></div>
    <div class="grid grid--3">%s</div>
  </div>
</section>
""" % (title, cards)


def licence_strip():
    lic = "".join('<li><strong>%s</strong> %s</li>' % (a, b) for a, b in LICENCES)
    return """<section class="section section--tight section--paper">
  <div class="wrap licences">
    <p class="licences__label">Licensed in</p>
    <ul>%s</ul>
  </div>
</section>
""" % lic


# ── pages ──────────────────────────────────────────────────────────────────

def build():
    os.makedirs(OUT, exist_ok=True)
    print("Building site/")

    # ---------- home ----------
    actions = ('<p class="hero__actions">'
               '<a class="btn btn--red" href="contact.html">Talk to an engineer %s</a>'
               '<a class="btn btn--ghost" href="services.html">Capability statements</a></p>'
               % svg("arrow", 17, "currentColor", "2.2"))
    media = ('<figure class="hero__media" style="margin:0">'
             '<img src="assets/img/bluescope.jpg" width="760" height="442" '
             'alt="Cable reticulation and conduit runs installed through an operating steel plant at BlueScope, Victoria">'
             '<figcaption><span class="rule"></span>Electrical reticulation through a live steel plant &mdash; BlueScope, VIC</figcaption></figure>')
    divisions = [("bolt", "Industrial Electrical", "LV and HV installation, site reticulation and hazardous areas."),
                 ("panel", "Panels &amp; Automation", "Control panel design and build, PLC, VSD and HMI software."),
                 ("shield", "Machine Safety &amp; Mechanical", "Guarding, assessment, fabrication and mechanical fit-out."),
                 ("snow", "Industrial Refrigeration", "Chillers, cool rooms and process cooling &mdash; design to 24/7 service.")]
    div_cards = "".join(
        '<a class="card card--pad" href="services.html">%s<span class="card__title">%s</span>'
        '<span class="card__text">%s</span></a>' % (svg(i, 26, "#bf1e2e"), t, b) for i, t, b in divisions)
    stats = [("2008", "Founded"), ("3", "States licensed"),
             ("[XXX]", "Projects delivered"), ("24/7", "Breakdown response")]
    stat_cells = "".join('<div class="stat"><div class="stat__value">%s</div><div class="stat__label">%s</div></div>' % v for v in stats)
    recent = [("westgate", "Tier 1 Infrastructure", "VIC", "West Gate Tunnel Project", "West Gate Tunnel Project site, Victoria"),
              ("taswater", "Water Utility", "TAS", "TasWater Bryn Estyn WTP", "Electrical fit-out at TasWater Bryn Estyn water treatment plant"),
              ("selwyn", "Tourism &amp; Alpine", "NSW", "Selwyn Snow Resort", "Deacam crew on site at Selwyn Snow Resort, New South Wales")]
    recent_cards = "".join(
        '<a class="card" href="projects.html"><img class="card__media" src="assets/img/%s.jpg" alt="%s" loading="lazy" width="760" height="440">'
        '<div class="card__body"><p class="card__meta">%s <span>&middot; %s</span></p>'
        '<h3 class="card__title">%s</h3></div></a>' % (f, alt, sec, st, name) for f, sec, st, name, alt in recent)

    home = (hero("Electrical &middot; Mechanical &middot; Refrigeration",
                 "Engineering that keeps plants <em>running.</em>",
                 "Since 2008 Deacam has delivered electrical, mechanical and refrigeration engineering across Victoria, New South Wales and Tasmania &mdash; plus the on-site labour and engineering support to keep it running.",
                 actions, media)
            + clients_block()
            + entry_block()
            + """<section class="section section--white">
  <div class="wrap">
    <div class="section__head"><h2>Four divisions, one contract</h2><a class="section__link" href="services.html">All services &rarr;</a></div>
    <div class="grid grid--4">%s</div>
  </div>
</section>
<section class="band">
  <img src="assets/img/hero-solar.jpg" alt="Deacam field crew at a solar installation in regional Victoria" loading="lazy" width="1900" height="474">
  <div class="band__scrim"></div>
  <div class="band__copy"><div class="wrap">
    <p class="eyebrow">Off-grid &amp; renewables</p>
    <p class="band__title">Including total off-grid operations</p>
    <p><a href="industries.html" style="color:var(--red-light);font-weight:600;font-size:.875rem;">Where we work &rarr;</a></p>
  </div></div>
</section>
<section class="stats"><div class="wrap stats__grid">%s</div></section>
<section class="section">
  <div class="wrap">
    <div class="section__head">
      <div><h2>Recent work</h2><p>Tier 1 infrastructure, government utilities and remote sites.</p></div>
      <a class="section__link" href="projects.html">All projects &rarr;</a>
    </div>
    <div class="grid grid--3">%s</div>
  </div>
</section>
""" % (div_cards, stat_cells, recent_cards))
    write("index.html", "Deacam — Industrial Electrical, Mechanical & Refrigeration Engineering",
          "Deacam delivers electrical, mechanical and refrigeration engineering across VIC, NSW and TAS, with on-site labour and 24/7 breakdown response.",
          None, home)

    # ---------- about ----------
    timeline = [("2008", "Deacam founded", "Started as a customised industrial electrical contractor in Melbourne&rsquo;s east."),
                ("Growth", "Mechanical added", "Mechanical installation brought in-house so one team carries the whole scope."),
                ("2023", "Refrigeration division", "Deacam Industrial Refrigeration launched alongside the electrical and mechanical divisions."),
                ("Today", "Licensed in three states", "VIC, NSW and TAS &mdash; delivering for Tier 1 infrastructure, utilities and heavy industry.")]
    tl = "".join('<div class="step"><div class="step__num">%s</div><p class="step__title">%s</p><p class="step__text">%s</p></div>' % t for t in timeline)
    values = [("star", "Bespoke by default", "Almost every project has a specific requirement that rules out an off-the-shelf answer. That is the work we take on."),
              ("shield", "Safety as a deliverable", "Machine safety and hazardous area work are their own disciplines here, not an afterthought bolted onto an install."),
              ("people", "Training the next generation", "Apprentices and early-career engineers work alongside licensed trades on live sites, not away from them.")]
    vcards = "".join('<div class="card card--pad"><span class="card__icon">%s</span><h3 class="card__title">%s</h3><p class="card__text">%s</p></div>'
                     % (svg(i, 23, "currentColor"), t, b) for i, t, b in values)
    glance = [("Founded", "2008"), ("Head office", "Kilsyth, VIC"), ("Divisions", "3"),
              ("States licensed", "VIC &middot; NSW &middot; TAS"), ("Breakdown cover", "24/7")]
    grows = "".join('<div class="spec__row"><span>%s</span><span style="color:var(--ink);font-weight:600;">%s</span></div>' % g for g in glance)

    about = (hero("About Deacam", "Engineering the jobs nobody else will quote.",
                  "Founded in 2008 and run from Kilsyth in Melbourne&rsquo;s east. Three divisions, licensed in three states, and a deliberate focus on training the next generation of trades.",
                  plain=True)
             + """<section class="band"><img src="assets/img/hero-solar.jpg" alt="Deacam field crew at a solar installation in regional Victoria" loading="lazy" width="1900" height="474"></section>
<section class="section">
  <div class="wrap split">
    <div style="display:flex;flex-direction:column;gap:1rem;">
      <h2>Unconventional projects, delivered by one accountable team</h2>
      <p>Deacam was founded in 2008 and has built its reputation on projects that demand innovative thinking. We specialise in customised electrical and mechanical work &mdash; the jobs where a catalogue solution does not fit.</p>
      <p>Today the business runs three divisions from Kilsyth: industrial electrical, mechanical, and industrial refrigeration. Because they sit under one roof, a single scope can cover the switchboard, the control software, the pipework and the people who maintain it &mdash; without the coordination risk of three separate contractors.</p>
      <p>We are licensed in Victoria, New South Wales and Tasmania, and we work on operating plants where shutting down is not an option.</p>
    </div>
    <div class="spec" style="align-self:start;">
      <div class="spec__head">At a glance</div>%s
    </div>
  </div>
</section>
<section class="section section--white">
  <div class="wrap"><div class="section__head"><h2>How we got here</h2></div><div class="steps">%s</div></div>
</section>
<section class="section">
  <div class="wrap"><div class="section__head"><h2>What we hold ourselves to</h2></div><div class="grid grid--3">%s</div></div>
</section>
""" % (grows, tl, vcards))
    write("about.html", "About — Deacam",
          "Founded in 2008 in Kilsyth, Victoria. Three engineering divisions, licensed across VIC, NSW and TAS.",
          "About", about)

    # ---------- services ----------
    rows = [("bluescope", "01", "Industrial Electrical",
             "Installation, reticulation and site services for operating plants &mdash; delivered without shutting you down.",
             ["LV and HV installation", "Hazardous area installations", "Site reticulation and distribution", "Switchboard supply and install"],
             "Conduit and cable reticulation at BlueScope Steel", False),
            ("panels", "02", "Control Panels &amp; Automation",
             "Concept to construction in our own workshop, with detailed drawings, schematics and panel layouts.",
             ["Control panel design and build", "PLC, VSD and HMI software", "SCADA and process control", "3D modelling and documentation"],
             "A Deacam technician beside a completed control panel", True),
            ("agnitek", "03", "Machine Safety &amp; Mechanical",
             "Guarding, assessment and mechanical installation to keep plant compliant and operators safe.",
             ["Machine safety assessment", "Guarding design and install", "Mechanical fit-out and fabrication", "Compliance to industry standards"],
             "Machine guarding and control installation at Agnitek", False)]
    mrows = ""
    for f, num, t, b, bullets, alt, flip in rows:
        lis = "".join('<li>%s<span>%s</span></li>' % (svg("check", 16, "currentColor", "2.6"), x) for x in bullets)
        mrows += ('<div class="media-row%s"><img src="assets/img/%s.jpg" alt="%s" loading="lazy" width="760" height="440">'
                  '<div><p class="eyebrow eyebrow--bare">Division %s</p><h3 style="margin:.5rem 0 .75rem;">%s</h3>'
                  '<p style="color:var(--grey);">%s</p><ul>%s</ul></div></div>'
                  % (" media-row--flip" if flip else "", f, alt, num, t, b, lis))

    services = (hero("Services", "Electrical, mechanical and refrigeration.",
                     "Four divisions under one accountable contract &mdash; plus the on-site labour to deliver them. We work on operating plants, so the work is planned around your production, not the other way round.",
                     plain=True)
                + entry_block()
                + """<section class="section section--white"><div class="wrap">%s</div></section>
<section class="section"><div class="wrap">
  <div class="panel panel__row">
    <div style="max-width:38rem;">
      <p class="eyebrow eyebrow--bare" style="color:var(--red-light);">Division 04 &mdash; On-site labour</p>
      <h3 style="margin:.5rem 0 .75rem;">Qualified people, on your site, for as long as you need them</h3>
      <p>Licensed electricians and engineering support on contract or ongoing &mdash; supervised by the same team that designs and builds the plant.</p>
    </div>
    <a class="btn btn--red" href="contact.html">Discuss your resourcing</a>
  </div>
</div></section>
<section class="section section--tight"><div class="wrap"><div class="grid grid--2">
  <a class="card card--pad" href="#download" style="flex-direction:row;align-items:center;gap:1rem;">%s
    <span><span class="card__title" style="display:block;">Electrical capability statement</span>
    <span class="card__text">PDF &middot; for tender and prequalification</span></span></a>
  <a class="card card--pad" href="#download" style="flex-direction:row;align-items:center;gap:1rem;">%s
    <span><span class="card__title" style="display:block;">Refrigeration capability statement</span>
    <span class="card__text">PDF &middot; for tender and prequalification</span></span></a>
</div></div></section>
""" % (mrows, svg("doc", 30, "#bf1e2e", "1.9"), svg("doc", 30, "#bf1e2e", "1.9")))
    write("services.html", "Services — Deacam",
          "Industrial electrical, control panels and automation, machine safety, mechanical and refrigeration — plus on-site labour.",
          "Services", services)

    # ---------- industries ----------
    sectors = [("taswater", "Water &amp; Utilities", "Treatment plants and pump stations where uptime is a regulatory obligation, not a preference.", "TasWater Bryn Estyn WTP", "TAS", "Electrical fit-out at TasWater Bryn Estyn water treatment plant"),
               ("westgate", "Infrastructure &amp; Transport", "Tier 1 road and tunnel programs, delivered to principal-contractor safety and documentation standards.", "West Gate Tunnel Project", "VIC", "West Gate Tunnel Project site, Victoria"),
               ("bluescope", "Heavy Industry", "Steel, processing and manufacturing plants &mdash; reticulation and upgrades staged around live production.", "BlueScope Steel", "VIC", "Conduit and cable reticulation at BlueScope Steel"),
               ("agnitek", "Manufacturing &amp; Automation", "Machine guarding, control panels and process logic for production lines that have to keep running.", "Agnitek", "VIC", "Machine guarding and control installation at Agnitek"),
               ("selwyn", "Tourism &amp; Alpine", "Remote and seasonal sites where access is limited and a return visit is expensive.", "Selwyn Snow Resort &amp; Mt Buller", "NSW / VIC", "Deacam crew on site at Selwyn Snow Resort"),
               ("hero-solar", "Renewables &amp; Off-grid", "Solar, storage and hybrid systems &mdash; including total off-grid operations for sites beyond the network.", "Off-grid operations", "VIC", "Deacam crew at a solar installation in regional Victoria")]
    scards = "".join(
        '<article class="card"><img class="card__media" src="assets/img/%s.jpg" alt="%s" loading="lazy" width="760" height="440">'
        '<div class="card__body"><h3 class="card__title">%s</h3><p class="card__text" style="flex:1">%s</p>'
        '<p style="display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;margin-top:.75rem;padding-top:.75rem;border-top:1px solid var(--line-2);">'
        '<span style="font-size:.6875rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--grey-2);">Proof</span>'
        '<span style="font-size:.875rem;font-weight:600;">%s</span>'
        '<span style="font-size:.75rem;font-weight:700;color:var(--red);">%s</span></p></div></article>'
        % (f, alt, n, b, proof, st) for f, n, b, proof, st, alt in sectors)

    industries = (hero("Industries", "Plants that cannot afford to stop.",
                       "Water utilities, Tier 1 infrastructure, heavy industry, manufacturing, alpine sites and off-grid operations. Each has a different definition of risk &mdash; and a different definition of done.",
                       plain=True)
                  + """<section class="section">
  <div class="wrap">
    <div class="section__head"><h2>Where we work</h2><a class="section__link" href="projects.html">See the project record &rarr;</a></div>
    <div class="grid grid--3">%s</div>
  </div>
</section>
<section class="section section--tight"><div class="wrap"><div class="panel panel__row">
  <div style="max-width:40rem;">
    <p class="eyebrow eyebrow--bare" style="color:var(--red-light);">Not listed?</p>
    <h3 style="margin:.5rem 0 .75rem;">Most of our work starts as an unconventional request</h3>
    <p>If your plant does not fit a standard category, that is usually a reason to call us rather than a reason not to.</p>
  </div>
  <a class="btn btn--red" href="contact.html">Talk to an engineer</a>
</div></div></section>
""" % scards)
    write("industries.html", "Industries — Deacam",
          "Water utilities, Tier 1 infrastructure, heavy industry, manufacturing, alpine sites and off-grid operations.",
          "Industries", industries)

    # ---------- projects ----------
    projects = [("westgate", "Tier 1 Infrastructure", "VIC", "West Gate Tunnel Project", "Electrical installation on one of Victoria&rsquo;s largest road infrastructure programs.", "West Gate Tunnel Project site, Victoria"),
                ("bluescope", "Heavy Industry", "VIC", "BlueScope Steel", "Cable reticulation and conduit runs through an operating steel facility.", "Conduit and cable reticulation at BlueScope Steel"),
                ("taswater", "Water Utility", "TAS", "TasWater Bryn Estyn WTP", "Electrical fit-out at the Bryn Estyn water treatment plant.", "Electrical fit-out at TasWater Bryn Estyn water treatment plant"),
                ("selwyn", "Tourism &amp; Alpine", "NSW", "Selwyn Snow Resort", "Alpine site works delivered interstate under our NSW contractor licence.", "Deacam crew on site at Selwyn Snow Resort"),
                ("agnitek", "Manufacturing", "VIC", "Agnitek", "Machine guarding and control panel installation.", "Machine guarding and control installation at Agnitek"),
                ("panels", "Panels &amp; Automation", "VIC", "Custom Panel Builds", "Designed, built and tested in our Kilsyth workshop.", "A Deacam technician beside a completed control panel")]
    pcards = "".join(
        '<article class="card"><img class="card__media" src="assets/img/%s.jpg" alt="%s" loading="lazy" width="760" height="440">'
        '<div class="card__body"><p class="card__meta">%s <span>&middot; %s</span></p>'
        '<h3 class="card__title">%s</h3><p class="card__text">%s</p></div></article>'
        % (f, alt, sec, st, n, scope) for f, sec, st, n, scope, alt in projects)
    pstats = [("2008", "Delivering since"), ("3", "States licensed"),
              ("[XXX]", "Projects delivered"), ("24/7", "Breakdown response")]
    pstat = "".join('<div class="stat"><div class="stat__value">%s</div><div class="stat__label">%s</div></div>' % v for v in pstats)

    projects_page = (hero("Project record", "Referenceable work, three states.",
                          "Tier 1 infrastructure, heavy industry, government utilities and alpine sites. Every project has a bespoke requirement &mdash; that is where our engineering earns its keep.",
                          plain=True)
                     + clients_block()
                     + """<section class="section">
  <div class="wrap">
    <div class="section__head"><h2>Selected projects</h2><span style="color:var(--grey);font-size:.875rem;">Showing 6 of [XX]</span></div>
    <div class="grid grid--3">%s</div>
  </div>
</section>
<section class="stats"><div class="wrap stats__grid">%s</div></section>
""" % (pcards, pstat))
    write("projects.html", "Projects — Deacam",
          "West Gate Tunnel, BlueScope Steel, TasWater, Selwyn Snow Resort, Agnitek and custom panel builds.",
          "Projects", projects_page)

    # ---------- contact ----------
    lic_rows = ('<p style="display:flex;flex-direction:column;gap:.5rem;">'
                '<span style="font-size:.875rem;color:rgba(255,255,255,.8);"><strong style="color:#fff;">VIC</strong> &nbsp;REC 31967 &nbsp;&middot;&nbsp; RTA AU59460</span>'
                '<span style="font-size:.875rem;color:rgba(255,255,255,.8);"><strong style="color:#fff;">NSW</strong> &nbsp;Contractor Licence 386499C</span>'
                '<span style="font-size:.875rem;color:rgba(255,255,255,.8);"><strong style="color:#fff;">TAS</strong> &nbsp;Contractor Licence 934109158</span></p>')

    contact = (hero("Contact", "Tell us what you need.",
                    "Send a scope and we will send back a method. If something is down right now, call the breakdown line instead &mdash; it is answered around the clock.",
                    plain=True)
               + """<section class="section">
  <div class="wrap split split--form">
    <div class="tiles">
      <div class="panel panel--red">
        <p class="eyebrow eyebrow--bare" style="color:rgba(255,255,255,.86);">24/7 Breakdown</p>
        <p style="margin:.75rem 0;"><a class="footer__phone" style="color:#fff;font-size:clamp(1.5rem,4vw,2.125rem);" href="%s">%s</a></p>
        <p>A real engineer answers. Electrical, mechanical or refrigeration, day or night.</p>
      </div>
      <div class="tile">
        <div class="tile__row">%s<div><p style="font-weight:600;">Head office</p><p style="color:var(--grey);">%s<br>%s</p>
          <p style="margin-top:.25rem;"><a href="#directions" style="font-size:.875rem;font-weight:600;">Get directions &rarr;</a></p></div></div>
        <div class="tile__row">%s<div><p style="font-weight:600;">Email</p><p><a href="mailto:%s" style="color:var(--grey);">%s</a></p></div></div>
        <div class="tile__row">%s<div><p style="font-weight:600;">Office hours</p><p style="color:var(--grey);">Mon&ndash;Fri, [YOUR HOURS]<br>Breakdown line answered 24/7</p></div></div>
      </div>
      <div class="panel">
        <p class="eyebrow eyebrow--bare" style="color:var(--red-light);">Licensed &amp; accredited</p>
        <div style="margin-top:.75rem;">%s</div>
      </div>
    </div>

    <form class="form" action="#" method="post">
      <h2>Send us a scope</h2>
      <div class="form__grid">
        <p class="field"><label for="f-name">Your name</label><input id="f-name" name="name" type="text" autocomplete="name" required></p>
        <p class="field"><label for="f-company">Company</label><input id="f-company" name="company" type="text" autocomplete="organization"></p>
        <p class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" autocorrect="off" required></p>
        <p class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></p>
      </div>
      <p class="field"><label for="f-type">What do you need?</label>
        <select id="f-type" name="enquiry">
          <option>A new project or upgrade</option><option>Control panels or automation</option>
          <option>Industrial refrigeration</option><option>Machine safety assessment</option>
          <option>On-site labour</option><option>Something else</option>
        </select></p>
      <p class="field"><label for="f-detail">Tell us about the site</label><textarea id="f-detail" name="detail" rows="5" enterkeyhint="done"></textarea></p>
      <p><button class="btn btn--red" type="submit">Send enquiry</button></p>
      <p class="form__note">For a breakdown, call <a href="%s">%s</a> &mdash; do not use this form.</p>
    </form>
  </div>
</section>
""" % (PHONE_HREF, PHONE, svg("pin", 19, "#bf1e2e"), ADDR1, ADDR2,
       svg("mail", 19, "#bf1e2e"), EMAIL, EMAIL, svg("clock", 19, "#bf1e2e"),
       lic_rows, PHONE_HREF, PHONE))
    write("contact.html", "Contact Us — Deacam",
          "Kilsyth VIC. Call (03) 9738 0528 for 24/7 breakdown response, or send us a scope.",
          "Contact", contact)

    print("Done.")


if __name__ == "__main__":
    build()
