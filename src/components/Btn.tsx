import Link from "next/link";
import { BtnArrow } from "./Icons";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "red" | "light";
  magnetic?: boolean;
  className?: string;
  external?: boolean;
};

export function Btn({ href, children, variant = "primary", magnetic, className = "", external }: Props) {
  const cls = `btn ${variant === "primary" ? "" : `btn--${variant}`} ${className}`.trim();
  const inner = (
    <>
      <span>{children}</span>
      <BtnArrow />
    </>
  );
  const isRaw = external || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");
  if (isRaw) {
    return (
      <a href={href} className={cls} data-magnetic={magnetic || undefined} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-magnetic={magnetic || undefined}>
      {inner}
    </Link>
  );
}
