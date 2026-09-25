import { company } from "@/content/site";

/** Fixed quick-contact stack on the right edge (desktop; phones use the bottom bar). */
export function SideContact() {
  const items = [
    {
      href: company.whatsapp,
      label: "WhatsApp",
      external: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.1c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.3.6.8 1.2 1.3 1.6.5.4 1 .7 1.6.9.2.1.4 0 .5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.2.3.4 0 .5-.2 1.1-.6 1.4-.5.4-1.2.6-1.9.5-1.2-.2-2.3-.8-3.2-1.6-1-.9-1.8-2-2.3-3.2-.3-.9-.3-1.9.3-2.6Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      href: company.phoneHref,
      label: company.phone,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 3.5h3.6l1.7 4.3-2.2 1.5a11.8 11.8 0 0 0 6.6 6.6l1.5-2.2 4.3 1.7V19a1.8 1.8 0 0 1-1.8 1.8A16.7 16.7 0 0 1 3.2 5.3 1.8 1.8 0 0 1 5 3.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      href: `mailto:${company.email}`,
      label: company.email,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.2" y="5.5" width="17.6" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];
  return (
    <nav className="sidec" aria-label="Quick contact">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          className="sidec__btn"
          aria-label={it.label}
          {...(it.external ? { target: "_blank", rel: "noopener" } : {})}
        >
          {it.icon}
          <span className="sidec__tip">{it.label}</span>
        </a>
      ))}
    </nav>
  );
}
