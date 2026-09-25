import type { Metadata } from "next";
import { Composer } from "@/components/blog/Composer";

export const metadata: Metadata = { title: "Edit post", robots: { index: false, follow: false } };

export default async function EditPostPage({ params }: PageProps<"/blog/edit/[slug]">) {
  const { slug } = await params;
  return <Composer slug={slug} />;
}
