"use client";

import Link from "next/link";
import { formatDate, readingTime, renderMarkdown } from "@/lib/blog";
import { useBlog } from "./useBlog";
import { Cover } from "./Cover";
import { Btn } from "../Btn";

export function PostView({ slug }: { slug: string }) {
  const { all, published, editor } = useBlog();
  const post = all.find((p) => p.slug === slug);
  const more = published.filter((p) => p.slug !== slug).slice(0, 3);

  // Missing, or a draft seen by a reader: same answer, no hint that a draft exists.
  if (!post || (post.status === "draft" && !editor)) {
    return (
      <section className="phead" data-nav="light">
        <div className="wrap">
          <p className="label eyebrow">Field notes</p>
          <h1 className="h2" style={{ marginTop: 24 }}>
            That article is not available.
          </h1>
          <div style={{ marginTop: 32 }}>
            <Btn href="/blog">Back to all articles</Btn>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="phead post__head" data-nav="light">
        <div className="wrap post__narrow">
          <Link href="/blog" className="label muted">
            ← All articles
          </Link>
          <p className="label muted post__meta">
            {formatDate(post.date)} · {readingTime(post.body)} min read · {post.author}
            {post.status === "draft" ? <span className="bcard__draft is-inline">Draft</span> : null}
            {editor ? (
              <Link href={`/blog/edit/${post.slug}`} className="link link--under" style={{ marginLeft: 16 }}>
                Edit
              </Link>
            ) : null}
          </p>
          <h1 className="h1 post__t">{post.title}</h1>
          <p className="lead muted" style={{ marginTop: 24 }}>
            {post.subtitle}
          </p>
          <div className="bcard__tags" style={{ marginTop: 24 }}>
            {post.tags.map((t) => (
              <i key={t}>{t}</i>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap" data-nav="light">
        <div className="post__cover media media--r">
          <Cover src={post.cover} sizes="(max-width: 1200px) 100vw, 1200px" eager />
        </div>
      </div>

      <section className="section" data-nav="light" style={{ paddingTop: "clamp(48px, 6vw, 88px)" }}>
        <div className="wrap post__narrow">
          <article className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
        </div>
      </section>

      {more.length ? (
        <section className="section mist" data-nav="light">
          <div className="wrap">
            <h2 className="h3" style={{ marginBottom: 32 }}>
              Keep reading
            </h2>
            <div className="bmore">
              {more.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="bmore__card">
                  <span className="label muted">{formatDate(p.date)}</span>
                  <b>{p.title}</b>
                  <span className="muted">{p.subtitle}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
