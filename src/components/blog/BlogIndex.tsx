"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deletePost, formatDate, readingTime, signIn, signOut } from "@/lib/blog";
import { useBlog } from "./useBlog";
import { Cover } from "./Cover";
import { BtnArrow } from "../Icons";

type Sort = "newest" | "oldest" | "shortest";

export function BlogIndex() {
  const router = useRouter();
  const { all, published, editor } = useBlog();
  const posts = editor ? all : published;
  const [tag, setTag] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [gate, setGate] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState(false);

  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].sort(), [posts]);
  const counts = useMemo(() => {
    const m: Record<string, number> = { All: posts.length };
    tags.forEach((t) => (m[t] = posts.filter((p) => p.tags.includes(t)).length));
    return m;
  }, [posts, tags]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = posts.filter((p) => {
      const inTag = tag === "All" || p.tags.includes(tag);
      const inText = !needle || (p.title + " " + p.subtitle + " " + p.tags.join(" ")).toLowerCase().includes(needle);
      return inTag && inText;
    });
    if (sort === "oldest") list = [...list].sort((a, b) => +new Date(a.date) - +new Date(b.date));
    if (sort === "shortest") list = [...list].sort((a, b) => readingTime(a.body) - readingTime(b.body));
    return list;
  }, [posts, tag, q, sort]);

  const [lead, ...rest] = shown;
  const featured = tag === "All" && !q && sort === "newest" && lead;

  function attempt() {
    if (signIn(pass)) {
      setGate(false);
      setPass("");
      setPassErr(false);
    } else setPassErr(true);
  }

  return (
    <>
      <section className="phead" data-nav="light">
        <div className="wrap">
          <p className="label eyebrow">Field notes</p>
          <div className="phead__grid">
            <h1 className="h1">
              Notes from <span className="light muted">the job.</span>
            </h1>
            <div className="blog__intro">
              <p className="lead muted">Project write-ups and lessons from our electrical, automation and refrigeration work.</p>
              <div className="blog__actions">
                {editor ? (
                  <>
                    <button className="btn" onClick={() => router.push("/blog/new")}>
                      <span>New post</span>
                      <BtnArrow />
                    </button>
                    <button className="btn btn--ghost" onClick={signOut}>
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <button className="btn btn--ghost" onClick={() => setGate(true)}>
                    <span>Editor sign in</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {editor ? (
            <p className="blog__mode" role="status">
              <b>Editor mode.</b> Drafts are visible to you. Changes are saved in this browser only, never to a server.
            </p>
          ) : null}

          <div className="blog__bar">
            <div className="filters" role="group" aria-label="Filter by topic">
              {["All", ...tags].map((t) => (
                <button key={t} className="chip" aria-pressed={tag === t} onClick={() => setTag(t)}>
                  {t} <i className="chip__n">{counts[t] ?? 0}</i>
                </button>
              ))}
            </div>
            <div className="blog__tools">
              <label className="blog__search">
                <span className="sr-only">Search articles</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <input type="search" value={q} placeholder="Search articles" onChange={(e) => setQ(e.target.value)} />
              </label>
              <select className="blog__sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort articles">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="shortest">Shortest read</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }} data-nav="light">
        <div className="wrap">
          {shown.length ? (
            <>
              {featured ? (
                <article className="bfeat">
                  <Link href={`/blog/${lead.slug}`} className="bfeat__media media">
                    <Cover src={lead.cover} sizes="(max-width: 900px) 100vw, 60vw" eager />
                    {lead.status === "draft" ? <span className="bcard__draft">Draft</span> : null}
                  </Link>
                  <div className="bfeat__body">
                    <p className="label muted">
                      Latest · {formatDate(lead.date)} · {readingTime(lead.body)} min read
                    </p>
                    <h2 className="h3" style={{ marginTop: 16 }}>
                      <Link href={`/blog/${lead.slug}`}>{lead.title}</Link>
                    </h2>
                    <p className="muted" style={{ marginTop: 16 }}>
                      {lead.subtitle}
                    </p>
                    <div className="bcard__tags" style={{ marginTop: 24 }}>
                      {lead.tags.map((t) => (
                        <i key={t}>{t}</i>
                      ))}
                    </div>
                    <Admin editor={editor} slug={lead.slug} title={lead.title} />
                  </div>
                </article>
              ) : null}
              <div className="bgrid">
                {(featured ? rest : shown).map((p) => (
                  <article className="bcard" key={p.slug}>
                    <Link href={`/blog/${p.slug}`} className="bcard__media media">
                      <Cover src={p.cover} sizes="(max-width: 900px) 100vw, 33vw" />
                      {p.status === "draft" ? <span className="bcard__draft">Draft</span> : null}
                    </Link>
                    <p className="label muted bcard__meta">
                      {formatDate(p.date)} · {readingTime(p.body)} min read
                    </p>
                    <h2 className="bcard__t">
                      <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                    </h2>
                    <p className="bcard__x">{p.subtitle}</p>
                    <div className="bcard__tags">
                      {p.tags.map((t) => (
                        <i key={t}>{t}</i>
                      ))}
                    </div>
                    <Admin editor={editor} slug={p.slug} title={p.title} />
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="blog__empty">
              <b>Nothing matches that.</b>
              <span>{q ? `No article mentions "${q}".` : `No article is tagged ${tag}.`}</span>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setQ("");
                  setTag("All");
                }}
              >
                <span>Clear filters</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {gate ? (
        <div className="bmodal" role="dialog" aria-modal="true" aria-labelledby="gate-t" onClick={(e) => e.target === e.currentTarget && setGate(false)}>
          <div className="bmodal__p">
            <h2 id="gate-t" className="h4">
              Editor sign in
            </h2>
            <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>
              This gate is client-side. It keeps editing controls out of a reader&rsquo;s way, but it is not security.
              Real publishing needs a server.
            </p>
            <div className="field" style={{ marginTop: 20 }}>
              <label htmlFor="gate-pass">Passphrase</label>
              <input
                id="gate-pass"
                type="password"
                value={pass}
                autoFocus
                aria-invalid={passErr}
                onChange={(e) => {
                  setPass(e.target.value);
                  setPassErr(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && attempt()}
              />
              {passErr ? <span className="err">That passphrase is not right.</span> : null}
            </div>
            <div className="bmodal__foot">
              <button className="btn btn--ghost" onClick={() => setGate(false)}>
                <span>Cancel</span>
              </button>
              <button className="btn" onClick={attempt}>
                <span>Sign in</span>
                <BtnArrow />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Admin({ editor, slug, title }: { editor: boolean; slug: string; title: string }) {
  if (!editor) return null;
  return (
    <div className="badmin">
      <Link href={`/blog/edit/${slug}`} className="link link--under">
        Edit
      </Link>
      <button
        className="link link--under badmin__del"
        onClick={() => {
          if (confirm(`Delete "${title}"? This cannot be undone.`)) deletePost(slug);
        }}
      >
        Delete
      </button>
    </div>
  );
}
