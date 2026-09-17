export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* A wing: three strokes lifting from a common origin. */}
        <path
          d="M3 20.5C7.5 20.5 10.8 17.6 12.4 12.2"
          stroke="var(--brand)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M8 21C14 20.2 18.4 16.2 20.2 8.6"
          stroke="var(--brand)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.72"
        />
        <path
          d="M14 21.5C20.4 20 23.6 14.4 23 5"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight">
        Wing<span className="text-brand">The</span>Idea
      </span>
    </span>
  );
}
