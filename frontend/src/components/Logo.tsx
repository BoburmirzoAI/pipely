export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 16 12 10.5 20 5" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="16" r="2.7" fill="#4F46E5" />
      <circle cx="12" cy="10.5" r="2.7" fill="#4F46E5" />
      <circle cx="20" cy="5" r="2.7" fill="#4F46E5" />
    </svg>
  );
}

export function Wordmark({ size = 17 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={size + 7} />
      <span
        className="font-semibold text-ink"
        style={{ fontSize: size, letterSpacing: "-.02em" }}
      >
        pipely
      </span>
    </div>
  );
}
