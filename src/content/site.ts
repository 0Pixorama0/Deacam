// Single source of truth for site copy.
// Sources: deacam.com.au (Sep 2026) and the client's Website Concept doc.
// Nothing here is invented. Unknowns are left out and listed in CONTENT-GAPS.md.

export const company = {
  name: "Deacam",
  legalName: "Deacam Engineering Pty Ltd",
  founded: 2008,
  phone: "(03) 9738 0528",
  phoneHref: "tel:+61397380528",
  email: "info@deacam.com.au",
  address: { street: "7/428 Mt Dandenong Rd", suburb: "Kilsyth", state: "VIC", postcode: "3137" },
  serviceArea: "Victoria, New South Wales and Tasmania",
  licences: [
    { state: "VIC", label: "REC", value: "31967" },
    { state: "VIC", label: "RTA", value: "AU59460" },
    { state: "NSW", label: "Contractor Licence", value: "386499C" },
    { state: "TAS", label: "Contractor Licence", value: "934109158" },
  ],
  social: {
    linkedin: "https://www.linkedin.com/company/deacam/",
    instagram: "https://www.instagram.com/deacamaust/",
    facebook: "https://www.facebook.com/deacamelectrical/",
  },
  staffLogin: "https://deacam.maaps.com.au",
};

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const clients = [
  "West Gate Tunnel Project",
  "BlueScope",
  "TasWater",
  "Yarra Trams",
  "CPB Contractors",
  "Downer",
  "Level Crossing Removal Project",
  "Spark North East Link",
  "Melbourne Airport",
  "Airservices",
  "Canberra Metro",
  "Mt Buller",
  "Selwyn Snow Resort",
  "LS Precast",
  "Agnitek",
  "Oakridge Wines",
  "Four Pillars",
  "Yarra Yering",
];

export const needs = [
  {
    key: "broken",
    title: "Something’s broken",
    body: "Emergency electrical, mechanical or refrigeration breakdown, day or night.",
    cta: "Call the breakdown line",
    href: "tel:+61397380528",
  },
  {
    key: "project",
    title: "I’m planning a project",
    body: "New plant, an upgrade or a fit-out. Designed and delivered end to end.",
    cta: "Send us a scope",
    href: "/contact?need=project",
  },
  {
    key: "people",
    title: "I need people on site",
    body: "Qualified on-site labour and engineering support, contract or ongoing.",
    cta: "Discuss resourcing",
    href: "/contact?need=labour",
  },
];

export type Division = {
  id: string;
  no: string;
  name: string;
  short: string;
  lead: string;
  points: string[];
  image: string;
  alt: string;
  layer: string;
};

export const divisions: Division[] = [
  {
    id: "electrical",
    no: "01",
    name: "Industrial Electrical",
    short: "Electrical",
    lead: "Installation, reticulation and site services for operating plants, delivered without shutting you down.",
    points: [
      "LV and HV installation",
      "Hazardous area installations",
      "Site reticulation and distribution",
      "Switchboard supply and install",
      "Earthing and lighting design",
      "Fibre and copper communications",
    ],
    image: "tw-01",
    alt: "Cable ladder and conduit runs through an industrial plant",
    layer: "Power",
  },
  {
    id: "automation",
    no: "02",
    name: "Control Panels & Automation",
    short: "Panels & Automation",
    lead: "Concept to construction in our own workshop, with detailed drawings, schematics and panel layouts.",
    points: [
      "Control panel design and build",
      "PLC, VSD and HMI software",
      "SCADA and process control",
      "3D modelling and documentation",
      "Factory acceptance testing",
      "Siemens TIA Portal and PROFINET",
    ],
    image: "pn-18",
    alt: "Open control panels wired in the Deacam workshop",
    layer: "Control",
  },
  {
    id: "safety",
    no: "03",
    name: "Machine Safety & Mechanical",
    short: "Safety & Mechanical",
    lead: "Guarding, assessment and mechanical installation to keep plant compliant and operators safe.",
    points: [
      "Machine safety assessment",
      "SIL and PL rated safety systems",
      "Guarding design and install",
      "Mechanical fit-out and fabrication",
      "Compliance to industry standards",
    ],
    image: "agnitek",
    alt: "Yellow machine guarding around a Deacam control installation",
    layer: "Protection",
  },
  {
    id: "refrigeration",
    no: "04",
    name: "Industrial Refrigeration",
    short: "Refrigeration",
    lead: "Chillers, cool rooms and process cooling. Design, installation, automation and retrofit, with 24/7 breakdown service.",
    points: [
      "Refrigeration design and installation",
      "Automation and retrofit solutions",
      "Flexible maintenance plans",
      "24/7 breakdown service",
      "Licensed refrigerant handling (RTA AU59460)",
    ],
    image: "what-we-do",
    alt: "Deacam technician testing equipment on site",
    layer: "Cooling",
  },
  {
    id: "labour",
    no: "05",
    name: "On-site Labour",
    short: "On-site Labour",
    lead: "Licensed electricians and engineering support on contract or ongoing, supervised by the same team that designs and builds the plant.",
    points: [
      "Licensed electricians",
      "Engineering support",
      "Contract or ongoing",
      "Interstate mobilisation",
    ],
    image: "brand-22",
    alt: "Deacam electricians pulling cable on a rural site",
    layer: "People",
  },
];

export type Project = {
  slug: string;
  name: string;
  sector: string;
  state: string;
  location?: string;
  client?: string;
  summary: string;
  image: string;
  alt: string;
  detailed: boolean;
  facts?: string[];
  scope?: string[];
  services?: { group: string; items: string[] }[];
  gallery?: string[];
  filter: string[];
};

export const projects: Project[] = [
  {
    slug: "west-gate-tunnel-project",
    name: "West Gate Tunnel Project",
    sector: "Tier 1 Infrastructure",
    state: "VIC",
    location: "Benalla, Victoria",
    client: "West Gate Tunnel Project",
    summary:
      "Turnkey electrical, automation and communications for the largest precast facility in the southern hemisphere.",
    image: "wg-05",
    alt: "Gantry cranes lifted into place at the Benalla precast facility",
    detailed: true,
    filter: ["Infrastructure", "VIC"],
    facts: [
      "On site from greenfield through to full production, over four years.",
      "Built for the West Gate Tunnel, the facility continues to supply Victoria’s Big Build.",
    ],
    scope: [
      "Turnkey electrical, automation and communications design and installation for the largest precast facility in the southern hemisphere: three large factory buildings, several office complexes, outbuildings and two batching plants.",
      "Deacam delivered design and construct for electrical and communications services, plus automation packages for the machines producing every precast concrete element for the West Gate Tunnel.",
      "The facility continues to support the local economy and job market in Benalla.",
    ],
    services: [
      {
        group: "Design",
        items: [
          "Engineered power reticulation design",
          "Switchboard design",
          "Earthing system design and specification",
          "Soil resistivity testing",
          "Lightning control system design",
          "Engineered lighting design",
        ],
      },
      {
        group: "Installation",
        items: [
          "Fibre optic and copper communications networks",
          "Site wide CCTV",
          "Gantry, portal and semi-portal cranes",
          "Street lighting and underground cable systems",
          "Light, power and switchboards",
        ],
      },
      {
        group: "Automation",
        items: [
          "Automated batching plant commissioning",
          "Automated segment carousel commissioning",
          "Stressing, vibration and water treatment control systems",
          "Bespoke dual-lift crane synchronisation systems",
        ],
      },
    ],
    gallery: ["wg-01", "wg-02", "wg-03", "wg-04", "wg-06", "wg-08", "westgate-warehouse", "wg-07"],
  },
  {
    slug: "taswater-bryn-estyn",
    name: "TasWater Bryn Estyn WTP",
    sector: "Water Utility",
    state: "TAS",
    location: "Plenty, Tasmania",
    client: "TasWater Capital Delivery Office",
    summary:
      "Electrical construction of the chemical dosing systems and switch room at Tasmania’s largest public infrastructure project at announcement.",
    image: "tw-05",
    alt: "Chemical dosing silos at the Bryn Estyn water treatment plant",
    detailed: true,
    filter: ["Water & utilities", "TAS"],
    facts: [
      "12 Melbourne staff relocated to Tasmania, housed in two leased homes, to support the local team.",
      "At announcement, the largest public infrastructure project in Tasmania’s history.",
    ],
    scope: [
      "Engaged by the TasWater Capital Delivery Office for electrical construction at the Bryn Estyn Water Treatment Plant in Plenty, Tasmania.",
      "Deacam delivered the electrical installation of the chemical dosing systems and the associated switch room, to strict timelines and regulatory requirements.",
    ],
    services: [
      {
        group: "Switch room",
        items: [
          "Over 40 variable speed drives",
          "Over 50 harmonic filters",
          "Three layers of 2 × 600 mm cable ladder",
          "2 × main switchboards, 2 × HV kiosks",
          "4 × motor control centres",
          "Control panels, data racks, UPS, distribution boards",
        ],
      },
      {
        group: "Chemical dosing field",
        items: [
          "Cable ladder systems",
          "Ladder, underground and steel conduit reticulation",
          "Pumps, weigh feeders, vibrators, motors, valves, instruments",
          "Control panels, remote IO, switchboards, isolators",
          "Testing and QA",
        ],
      },
    ],
    gallery: ["tw-09", "tw-16", "tw-11", "tw-06", "tw-01", "tw-12", "tw-04", "tw-02"],
  },
  {
    slug: "custom-panel-builds",
    name: "Custom Panel Builds",
    sector: "Panels & Automation",
    state: "VIC",
    location: "Deacam workshop, Victoria",
    client: "Various",
    summary: "Designed, built and tested in our own panel workshop, from functional description to commissioning.",
    image: "pn-13",
    alt: "Deacam electrician with finished control panels in the workshop",
    detailed: true,
    filter: ["Panels & automation", "VIC"],
    facts: [
      "Automated CNC cutting and marking, and 3D printing, in house.",
      "Every Deacam apprentice graduates able to read, write and build from detailed schematics.",
    ],
    scope: [
      "A fully stocked and equipped panel building workshop delivers precision-engineered panels tailored to each application.",
      "The workshop doubles as a training floor: apprentices learn to interpret schematics and wire complex panels under experienced tradespeople.",
    ],
    services: [
      {
        group: "Engineering",
        items: [
          "Functional description development",
          "Schematic development",
          "Risk assessment",
          "SIL and PL rated safety system design",
          "Panel layout drawings and 3D renderings",
          "Hardware specification",
        ],
      },
      {
        group: "Build and commission",
        items: [
          "PLC, VSD, soft starter and motor starters",
          "HMI and remote touch screen control",
          "Safety relays and controllers",
          "Retrofit to existing equipment",
          "Factory acceptance testing",
        ],
      },
    ],
    gallery: ["pn-10", "pn-03", "pn-08", "pn-16", "pn-02", "pn-21", "pn-12", "pn-15"],
  },
  {
    slug: "bluescope-steel",
    name: "BlueScope Steel",
    sector: "Heavy Industry",
    state: "VIC",
    summary: "Cable reticulation and conduit runs through an operating steel facility.",
    image: "bluescope",
    alt: "Orange cables running the length of a steel cable ladder",
    detailed: false,
    filter: ["Manufacturing", "VIC"],
  },
  {
    slug: "selwyn-snow-resort",
    name: "Selwyn Snow Resort",
    sector: "Tourism & Alpine",
    state: "NSW",
    summary: "Alpine site works delivered interstate under our NSW contractor licence.",
    image: "selwyn",
    alt: "Deacam team in the snow at Selwyn Snow Resort",
    detailed: false,
    filter: ["Infrastructure", "NSW"],
  },
  {
    slug: "agnitek",
    name: "Agnitek",
    sector: "Manufacturing",
    state: "VIC",
    summary: "Machine guarding and control panel installation.",
    image: "agnitek",
    alt: "Yellow machine guarding around a control panel",
    detailed: false,
    filter: ["Manufacturing", "Panels & automation", "VIC"],
  },
];

export const industries = [
  {
    name: "Water & Utilities",
    body: "Treatment plants and pump stations where uptime is a regulatory obligation, not a preference.",
    proof: "TasWater Bryn Estyn WTP",
    state: "TAS",
    image: "tw-09",
    href: "/projects/taswater-bryn-estyn",
  },
  {
    name: "Infrastructure & Transport",
    body: "Tier 1 road, tunnel and rail programs, delivered to principal-contractor safety and documentation standards.",
    proof: "West Gate Tunnel Project",
    state: "VIC",
    image: "wg-05",
    href: "/projects/west-gate-tunnel-project",
  },
  {
    name: "Heavy Industry",
    body: "Steel, processing and manufacturing plants, with reticulation and upgrades staged around live production.",
    proof: "BlueScope Steel",
    state: "VIC",
    image: "bluescope",
    href: "/projects/bluescope-steel",
  },
  {
    name: "Manufacturing & Automation",
    body: "Machine guarding, control panels and process logic for production lines that have to keep running.",
    proof: "Agnitek",
    state: "VIC",
    image: "agnitek",
    href: "/projects/agnitek",
  },
  {
    name: "Tourism & Alpine",
    body: "Remote and seasonal sites where access is limited and a return visit is expensive.",
    proof: "Selwyn Snow Resort",
    state: "NSW",
    image: "selwyn",
    href: "/projects/selwyn-snow-resort",
  },
  {
    name: "Renewables & Off-grid",
    body: "Solar, storage and hybrid systems, including total off-grid operations for sites beyond the network.",
    proof: "Off-grid operations",
    state: "VIC",
    image: "hero-solar-team",
    href: "/contact",
  },
];

export const testimonials = [
  {
    quote:
      "We offer our strongest recommendation for the Deacam team in delivery on time, on budget work. … we have not experienced variation, nor defect.",
    who: "Management Team",
    org: "Yarra Trams",
  },
  {
    quote:
      "Deacam have repeatedly proven themselves to be excellently capable of working with Siemens technology.",
    who: "Leonie Wong",
    org: "Siemens Digital Industries",
  },
  {
    quote:
      "Deacam not only understands the nuances of winemaking but also delivers tailored, efficient refrigeration solutions.",
    who: "David Bicknell, Chief Winemaker",
    org: "Oakridge Wines",
  },
];

export const timeline = [
  { year: "2008", title: "Deacam founded", body: "Started as a customised industrial electrical contractor in Melbourne’s east." },
  { year: "Growth", title: "Mechanical added", body: "Mechanical installation brought in-house so one team carries the whole scope." },
  { year: "2023", title: "Refrigeration division", body: "Deacam Industrial Refrigeration launched alongside the electrical and mechanical divisions." },
  { year: "Today", title: "Licensed in three states", body: "VIC, NSW and TAS, delivering for Tier 1 infrastructure, utilities and heavy industry." },
];

export const values = [
  { title: "Bespoke by default", body: "Almost every project has a specific requirement that rules out an off-the-shelf answer. That is the work we take on." },
  { title: "Safety as a deliverable", body: "Machine safety and hazardous area work are their own disciplines here, not an afterthought bolted onto an install." },
  { title: "Training the next generation", body: "Apprentices work alongside licensed trades on live sites and in the panel shop. More than ten have qualified as A Grade electricians." },
];
