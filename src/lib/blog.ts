/* ============================================================
   BLOG STORE (ported from the Pixorama site)

   Seed posts live here; anything the composer changes is kept in
   localStorage and merged over the seed on read.

   Deliberate limitation, stated plainly: this site has no backend, so
   "signing in" is a client-side gate and edits exist only in the browser
   that made them. It is enough to shape the editing experience. Real
   publishing needs a server, a database and actual authentication.

   Seed articles are written only from facts published on deacam.com.au.
   Their dates are placeholders until DEACAM confirms publishing dates.
   ============================================================ */

export type Status = "draft" | "published";

export type Post = {
  slug: string;
  title: string;
  subtitle: string;
  body: string; // markdown
  cover: string; // any URL or /img path
  tags: string[];
  author: string;
  date: string; // yyyy-mm-dd
  status: Status;
};

export const COVER_PRESETS = ["/img/tw-09.jpg", "/img/wg-05.jpg", "/img/pn-13.jpg", "/img/bluescope.jpg", "/img/brand-22.jpg", "/img/tw-14.jpg"];

const SEED: Post[] = [
  {
    slug: "inside-the-bryn-estyn-switch-room",
    title: "Inside the Bryn Estyn switch room",
    subtitle:
      "Over 40 drives, over 50 harmonic filters and three layers of cable ladder, delivered for Tasmania's largest public infrastructure project at announcement.",
    body: `TasWater's Capital Delivery Office engaged Deacam for electrical construction at the Bryn Estyn Water Treatment Plant in Plenty, Tasmania. Our scope was the electrical installation of the chemical dosing systems and the switch room that runs them.

## What went into the switch room

- Over 40 variable speed drives
- Over 50 harmonic filters
- Three layers of 2 × 600 mm cable ladder throughout
- Two main switchboards and two HV kiosks
- Four motor control centres
- Control panels, data racks, UPS systems and distribution boards

## Out in the dosing field

Beyond the switch room, the team installed cable ladder, underground and steel conduit reticulation, and terminated and tested the field equipment: pumps, weigh feeders, vibrators, motors, valves and instruments. Control panels, remote IO panels, switchboards and isolators were installed in the field, followed by testing and QA.

> At the time of its announcement, Bryn Estyn was the largest public infrastructure project in the history of Tasmania.

## Moving a team interstate

To support the local crew, Deacam leased two homes in Tasmania and relocated 12 Melbourne-based staff for the job. Work on a water utility runs to strict timelines and regulatory requirements, so continuity of the team mattered as much as the equipment list.`,
    cover: "/img/tw-09.jpg",
    tags: ["Water & Utilities", "Electrical"],
    author: "Deacam",
    date: "2026-08-20",
    status: "published",
  },
  {
    slug: "greenfield-to-full-production-at-benalla",
    title: "Greenfield to full production: four years at Benalla",
    subtitle:
      "Turnkey electrical, automation and communications for the largest precast facility in the southern hemisphere.",
    body: `The precast facility at Benalla was built to produce every concrete element for the West Gate Tunnel Project. Deacam was on site from greenfield through to full production, a period of more than four years.

## One team, the whole scope

The facility comprises three large factory buildings, several office complexes, outbuildings and two batching plants. Deacam delivered design and construct for the electrical and communications services, plus the automation packages for the machines that make the precast elements.

## Design work

- Engineered power reticulation design
- Switchboard design
- Earthing system design and soil resistivity testing
- Lightning control system design
- Engineered lighting design

## Automation

- Automated batching plant installation and commissioning
- Automated segment carousel installation and commissioning
- Control systems for stressing, remote vibration and water treatment
- Bespoke dual-lift crane synchronisation systems

> Though built for the West Gate Tunnel, the facility continues to serve Victoria's Big Build projects.

The plant also continues to support the local economy and job market in Benalla.`,
    cover: "/img/wg-05.jpg",
    tags: ["Infrastructure", "Automation"],
    author: "Deacam",
    date: "2026-07-30",
    status: "published",
  },
  {
    slug: "why-apprentices-learn-on-the-panel-shop-floor",
    title: "Why our apprentices learn on the panel shop floor",
    subtitle:
      "Reading, writing and building from detailed schematics is a core skill, so it is where every Deacam apprenticeship starts.",
    body: `At Deacam we treat the interpretation of schematics, and the ability to wire control panels efficiently and well, as an essential part of an electrical apprenticeship.

## A workshop that doubles as a classroom

Our panel building shop runs a training group where apprentices learn on the job under experienced tradespeople. The workshop is fully stocked and equipped, with automated CNC cutting and marking and 3D printing, so apprentices train on the same tools and standards as production work.

## What every graduate leaves with

Every apprentice who graduates from Deacam can read, write and interpret detailed schematics, then turn those designs into complex, high-quality installations that meet our standards.

> More than ten Deacam apprentices have qualified as A Grade electricians.

## Why it matters to clients

The people who build a panel in the workshop are the same people who commission it on site. That continuity is part of how a single team can carry a scope from drawings to handover.`,
    cover: "/img/pn-13.jpg",
    tags: ["Panels & Automation", "People"],
    author: "Deacam",
    date: "2026-07-09",
    status: "published",
  },
  {
    slug: "adding-a-refrigeration-division",
    title: "Why we added a refrigeration division",
    subtitle:
      "In 2023 Deacam Industrial Refrigeration launched alongside our electrical and mechanical divisions.",
    body: `In 2023 we launched Deacam Industrial Refrigeration to complement our existing industrial electrical and mechanical divisions.

## What the division does

The refrigeration team designs, installs, automates and services industrial refrigeration systems, shaped to each client's growing requirements. That covers chillers, cool rooms and process cooling.

- Design and installation
- Automation and retrofit solutions
- Flexible maintenance plans
- 24/7 breakdown service

## Why it sits with electrical and mechanical

Refrigeration plant depends on electrical supply, controls and mechanical installation. With all three divisions under one roof, a single scope can cover the switchboard, the control software, the pipework and the people who maintain it.

> "Deacam not only understands the nuances of winemaking but also delivers tailored, efficient refrigeration solutions." David Bicknell, Chief Winemaker, Oakridge Wines`,
    cover: "/img/tw-14.jpg",
    tags: ["Refrigeration"],
    author: "Deacam",
    date: "2026-06-18",
    status: "published",
  },
];

const KEY = "deacam.blog.v1";
const GATE = "deacam.blog.editor";
export const EDITOR_PASSPHRASE = "deacam";

type Overlay = { edited: Record<string, Post>; created: Post[]; deleted: string[] };
const EMPTY: Overlay = { edited: {}, created: [], deleted: [] };

const byDate = (a: Post, b: Post) => +new Date(b.date) - +new Date(a.date);

function read(): Overlay {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(o: Overlay) {
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch {
    /* storage blocked; the session simply will not persist */
  }
  emit();
}

/** Everything, drafts included. */
export function allPosts(): Post[] {
  const o = read();
  return SEED.map((p) => o.edited[p.slug] ?? p)
    .concat(o.created)
    .filter((p) => !o.deleted.includes(p.slug))
    .sort(byDate);
}

/** Seed posts only: what the server renders and crawlers see. */
export function seedPosts(): Post[] {
  return [...SEED].sort(byDate);
}

export function getSeedPost(slug: string) {
  return SEED.find((p) => p.slug === slug);
}

export function getPost(slug: string): Post | undefined {
  return allPosts().find((p) => p.slug === slug);
}

export function savePost(post: Post, originalSlug?: string) {
  const o = read();
  const key = originalSlug ?? post.slug;
  if (SEED.some((p) => p.slug === key)) {
    o.edited[key] = post;
  } else {
    const i = o.created.findIndex((p) => p.slug === key);
    if (i >= 0) o.created[i] = post;
    else o.created.push(post);
  }
  write(o);
}

export function deletePost(slug: string) {
  const o = read();
  o.created = o.created.filter((p) => p.slug !== slug);
  delete o.edited[slug];
  if (SEED.some((p) => p.slug === slug)) o.deleted.push(slug);
  write(o);
}

/* --- Editor gate -------------------------------------------------------
   A client-side check. It keeps the controls out of a reader's way; it does
   not protect anything, because it cannot. Anyone can read this file. */

export function isEditor() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(GATE) === "1";
  } catch {
    return false;
  }
}

export function signIn(pass: string) {
  if (pass.trim().toLowerCase() !== EDITOR_PASSPHRASE) return false;
  try {
    sessionStorage.setItem(GATE, "1");
  } catch {}
  emit();
  return true;
}

export function signOut() {
  try {
    sessionStorage.removeItem(GATE);
  } catch {}
  emit();
}

/* --- Subscription for useSyncExternalStore --------------------------------
   Components read one cached snapshot; any write or sign-in invalidates it. */

export type BlogSnapshot = { all: Post[]; published: Post[]; editor: boolean };

const listeners = new Set<() => void>();
let cache: BlogSnapshot | null = null;
const SERVER: BlogSnapshot = { all: seedPosts(), published: seedPosts(), editor: false };

function emit() {
  cache = null;
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): BlogSnapshot {
  if (!cache) {
    const all = allPosts();
    cache = { all, published: all.filter((p) => p.status === "published"), editor: isEditor() };
  }
  return cache;
}

export function getServerSnapshot(): BlogSnapshot {
  return SERVER;
}

/* --- Helpers ----------------------------------------------------------- */

export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 70);
}

export function readingTime(body: string) {
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

/* --- Markdown, small on purpose -------------------------------------------
   Headings, bold, italic, links, quotes, lists and paragraphs. Text is escaped
   first, so a post body cannot inject markup. */

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s: string) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]*)\)/g, '<a href="$2" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|\W)\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

export function renderMarkdown(md: string): string {
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  for (const raw of md.replace(/\r/g, "").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    if (/^###\s+/.test(line)) {
      closeList();
      out.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`);
    } else if (/^##\s+/.test(line)) {
      closeList();
      out.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`);
    } else if (/^>\s?/.test(line)) {
      closeList();
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
    } else if (/^[-*]\s+/.test(line)) {
      if (list !== "ul") {
        closeList();
        out.push("<ul>");
        list = "ul";
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      if (list !== "ol") {
        closeList();
        out.push("<ol>");
        list = "ol";
      }
      out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}
