import { site } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand glow. Decorative only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-[32rem] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(45rem 20rem at 50% 0%, var(--brand-soft), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="size-1.5 rounded-full bg-accent" />
          A product studio
        </p>

        <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          {site.tagline}
          <span className="block text-muted">Not just pitched.</span>
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
          {site.description}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#contact"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Start a conversation
          </a>
          <a
            href="#ventures"
            className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface-muted"
          >
            See what we are building
          </a>
        </div>
      </div>
    </section>
  );
}
