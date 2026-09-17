import { site } from "@/lib/content";

export function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-t border-border bg-surface-muted/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="rounded-3xl border border-border bg-surface px-8 py-14 text-center sm:px-14">
          <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Have an idea worth building?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Tell us what you are thinking. If it is a fit, we will say so
            quickly — and if it is not, we will tell you that just as quickly.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-8 inline-block rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {site.email}
          </a>
        </div>
      </div>
    </section>
  );
}
