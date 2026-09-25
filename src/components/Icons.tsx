export function Arrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className="ico">
      <path d="M1.5 8h12M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ArrowUpRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" className="ico">
      <path d="M4 12 12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Phone({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 1.8h2.6l1.2 3-1.6 1.1a8.4 8.4 0 0 0 4.9 4.9l1.1-1.6 3 1.2V13a1.3 1.3 0 0 1-1.3 1.3A11.7 11.7 0 0 1 1.7 3.1 1.3 1.3 0 0 1 3 1.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function Download({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5v9M4 7l4 4 4-4M2 14.5h12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Two stacked arrows so the button can slide one out and the next in. */
export function BtnArrow() {
  return (
    <span className="arr" aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M1.5 8h12M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M1.5 8h12M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  );
}
