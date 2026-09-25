import Image from "next/image";
import dims from "@/img-dims.json";

type Props = {
  name: string;
  alt: string;
  sizes?: string;
  eager?: boolean;
  className?: string;
  /** Natural aspect ratio instead of filling a sized parent. */
  natural?: boolean;
  style?: React.CSSProperties;
};

const table = dims as unknown as Record<string, [number, number]>;

export function Img({ name, alt, sizes = "100vw", eager, className, natural, style }: Props) {
  const src = `/img/${name}.jpg`;
  if (natural) {
    const [w, h] = table[name] ?? [1600, 1200];
    return (
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        sizes={sizes}
        className={className}
        style={{ width: "100%", height: "auto", ...style }}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      style={style}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
    />
  );
}
