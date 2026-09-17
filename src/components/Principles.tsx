import { principles } from "@/lib/content";

export function Principles() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          How we operate
        </h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title}>
              <div className="h-px w-10 bg-accent" />
              <h3 className="mt-5 text-base font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
