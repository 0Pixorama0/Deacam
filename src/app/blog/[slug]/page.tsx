import type { Metadata } from "next";
import { PostView } from "@/components/blog/PostView";
import { getSeedPost, seedPosts } from "@/lib/blog";

export function generateStaticParams() {
  return seedPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getSeedPost(slug);
  if (!post) return { title: "Article", alternates: { canonical: `/blog/${slug}` } };
  return {
    title: post.title,
    description: post.subtitle,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.subtitle,
      publishedTime: post.date,
      images: post.cover.startsWith("/") ? [{ url: post.cover }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  return <PostView slug={slug} />;
}
