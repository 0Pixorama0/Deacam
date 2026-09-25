"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { COVER_PRESETS, type Post, type Status, readingTime, renderMarkdown, savePost, slugify } from "@/lib/blog";
import { useBlog } from "./useBlog";
import { Btn } from "../Btn";
import { BtnArrow } from "../Icons";

type Mode = "write" | "preview" | "split";

const TEMPLATE = `Open with the point, in one sentence.

## The site and the brief

What the client needed, and what made it unusual.

## What we delivered

- The scope
- The constraint that shaped it
- How it was commissioned

> A line worth quoting back.

## What we would do again

Be specific. This is the part people trust.`;

export function Composer({ slug }: { slug?: string }) {
  const { all, editor } = useBlog();

  if (!editor) {
    return (
      <section className="phead" data-nav="light">
        <div className="wrap">
          <p className="label eyebrow">Field notes</p>
          <h1 className="h2" style={{ marginTop: 24 }}>
            Sign in as an editor to write posts.
          </h1>
          <p className="lead muted" style={{ marginTop: 16 }}>
            Open the blog and use Editor sign in first.
          </p>
          <div style={{ marginTop: 32 }}>
            <Btn href="/blog">Back to the blog</Btn>
          </div>
        </div>
      </section>
    );
  }

  const post = slug ? all.find((p) => p.slug === slug) : undefined;
  return <Form key={slug ?? "new"} slug={slug} post={post} />;
}

function Form({ slug, post }: { slug?: string; post?: Post }) {
  const router = useRouter();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [subtitle, setSubtitle] = useState(post?.subtitle ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [cover, setCover] = useState(post?.cover ?? COVER_PRESETS[0]);
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [date, setDate] = useState(post?.date ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<Status>(post?.status ?? "published");
  const [mode, setMode] = useState<Mode>("write");
  const [err, setErr] = useState("");

  const minutes = useMemo(() => readingTime(body), [body]);
  const preview = useMemo(() => renderMarkdown(body), [body]);

  /** Wrap or prefix the current selection, the way a real toolbar behaves. */
  function apply(kind: string) {
    const el = areaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = body.slice(start, end);
    const before = body.slice(0, start);
    const after = body.slice(end);
    const wrap = (l: string, r = l, ph = "text") => {
      const inner = sel || ph;
      setBody(before + l + inner + r + after);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + l.length, start + l.length + inner.length);
      });
    };
    const prefix = (p: string, ph: string) => {
      const lineStart = before.lastIndexOf("\n") + 1;
      const head = body.slice(0, lineStart);
      const rest = body.slice(lineStart);
      const line = sel ? rest : ph + rest;
      setBody(head + p + line);
      requestAnimationFrame(() => el.focus());
    };
    if (kind === "b") wrap("**", "**", "bold text");
    if (kind === "i") wrap("*", "*", "italic text");
    if (kind === "code") wrap("`", "`", "code");
    if (kind === "link") wrap("[", "](https://)", "link text");
    if (kind === "h2") prefix("## ", "Heading");
    if (kind === "h3") prefix("### ", "Sub-heading");
    if (kind === "quote") prefix("> ", "Something worth quoting");
    if (kind === "ul") prefix("- ", "List item");
    if (kind === "ol") prefix("1. ", "First item");
    if (kind === "template") setBody(body.trim() ? body + "\n\n" + TEMPLATE : TEMPLATE);
  }

  function publish() {
    if (!title.trim()) return setErr("A post needs a title.");
    if (!subtitle.trim()) return setErr("Add a subtitle. It is what the card shows.");
    if (!body.trim()) return setErr("The body is empty.");
    const list = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!list.length) return setErr("Add at least one tag so the post can be filtered.");
    savePost(
      {
        slug: slug ?? (slugify(title) || `post-${Date.now()}`),
        title: title.trim(),
        subtitle: subtitle.trim(),
        body: body.trim(),
        cover: cover.trim() || COVER_PRESETS[0],
        tags: list,
        author: "Deacam",
        date,
        status,
      },
      slug,
    );
    router.push("/blog");
  }

  const clear = () => setErr("");

  return (
    <section className="cmp" data-nav="light">
      <div className="wrap">
        <div className="cmp__top">
          <Link href="/blog" className="label muted">
            ← Back to blog
          </Link>
          <h1 className="h3">{slug ? "Edit post" : "New post"}</h1>
        </div>

        <div className="cmp__grid">
          <aside className="cmp__side">
            <p className="label">Status</p>
            <div className="cmp__seg" role="group" aria-label="Publication status">
              {(["draft", "published"] as Status[]).map((s) => (
                <button key={s} aria-pressed={status === s} onClick={() => setStatus(s)}>
                  {s === "draft" ? "Draft" : "Published"}
                </button>
              ))}
            </div>
            <p className="cmp__hint">
              {status === "draft" ? "Drafts are visible to editors only." : "Published posts appear on the blog to everyone."}
            </p>

            <div className="cmp__read">
              <span>Read time</span>
              <b>{minutes} min</b>
            </div>

            <div className="field">
              <label htmlFor="c-tags">Tags, comma separated</label>
              <input id="c-tags" value={tags} onChange={(e) => (setTags(e.target.value), clear())} placeholder="Electrical, Water & Utilities" />
              <span className="help">These become the filter chips on the blog.</span>
            </div>

            <div className="field">
              <label htmlFor="c-cover">Cover image</label>
              <input id="c-cover" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="/img/tw-09.jpg or https://…" />
            </div>
            <div className="cmp__presets" role="group" aria-label="Cover presets">
              {COVER_PRESETS.map((src) => (
                <button key={src} className="cmp__preset" aria-pressed={cover === src} aria-label={`Use ${src}`} style={{ backgroundImage: `url(${src})` }} onClick={() => setCover(src)} />
              ))}
            </div>

            <div className="field">
              <label htmlFor="c-date">Date</label>
              <input id="c-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="cmp__tips">
              <p className="label">Formatting</p>
              <ul>
                <li>
                  <code>##</code> section heading, <code>###</code> sub-heading
                </li>
                <li>
                  <code>**bold**</code>, <code>*italic*</code>
                </li>
                <li>
                  <code>&gt;</code> pull quote, <code>-</code> list
                </li>
                <li>Blank line between paragraphs. The toolbar writes this for you.</li>
              </ul>
            </div>
          </aside>

          <div className="cmp__main">
            <input className="cmp__title" value={title} onChange={(e) => (setTitle(e.target.value), clear())} placeholder="Post title" aria-label="Title" />
            <input className="cmp__sub" value={subtitle} onChange={(e) => (setSubtitle(e.target.value), clear())} placeholder="One line of summary. This is what the card shows." aria-label="Subtitle" />

            <div className="cmp__bar">
              <div className="cmp__tools" role="toolbar" aria-label="Formatting">
                {[
                  ["b", "B"],
                  ["i", "I"],
                  ["code", "‹›"],
                  ["link", "Link"],
                  ["h2", "H2"],
                  ["h3", "H3"],
                  ["quote", "Quote"],
                  ["ul", "List"],
                  ["ol", "1."],
                ].map(([k, label]) => (
                  <button key={k} onClick={() => apply(k)} title={label}>
                    {label}
                  </button>
                ))}
                <button onClick={() => apply("template")}>Template</button>
              </div>
              <div className="cmp__seg" role="group" aria-label="View">
                {(["write", "preview", "split"] as Mode[]).map((m) => (
                  <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
                    {m === "write" ? "Write" : m === "preview" ? "Preview" : "Split"}
                  </button>
                ))}
              </div>
            </div>

            <div className={`cmp__panes is-${mode}`}>
              {mode !== "preview" ? (
                <textarea
                  ref={areaRef}
                  className="cmp__area"
                  value={body}
                  spellCheck
                  aria-label="Body"
                  onChange={(e) => (setBody(e.target.value), clear())}
                  placeholder="Start writing. Use the toolbar for headings, quotes and lists."
                />
              ) : null}
              {mode !== "write" ? (
                <div className="cmp__preview prose">
                  {body.trim() ? <div dangerouslySetInnerHTML={{ __html: preview }} /> : <p className="muted">Nothing to preview yet.</p>}
                </div>
              ) : null}
            </div>

            {err ? (
              <p className="err" role="alert" style={{ marginTop: 16 }}>
                {err}
              </p>
            ) : null}

            <div className="cmp__foot">
              <Link href="/blog" className="btn btn--ghost">
                <span>Cancel</span>
              </Link>
              <button className="btn" onClick={publish}>
                <span>{slug ? "Save changes" : status === "draft" ? "Save draft" : "Publish article"}</span>
                <BtnArrow />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
