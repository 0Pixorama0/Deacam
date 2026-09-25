import Image from "next/image";

/** Local /img covers go through next/image; pasted URLs render as-is. */
export function Cover({ src, sizes, eager }: { src: string; sizes: string; eager?: boolean }) {
  if (src.startsWith("/")) {
    return <Image src={src} alt="" fill sizes={sizes} style={{ objectFit: "cover" }} loading={eager ? "eager" : "lazy"} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- editor-supplied URL, host unknown at build time
    <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading={eager ? "eager" : "lazy"} />
  );
}
