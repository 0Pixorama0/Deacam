"use client";

import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "@/lib/blog";

/** Posts (with this browser's local edits merged) and the editor flag. */
export function useBlog() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
