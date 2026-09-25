import type { Metadata } from "next";
import { Composer } from "@/components/blog/Composer";

export const metadata: Metadata = { title: "New post", robots: { index: false, follow: false } };

export default function NewPostPage() {
  return <Composer />;
}
