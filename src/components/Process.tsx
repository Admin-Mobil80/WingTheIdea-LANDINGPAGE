import { process } from "@/lib/content";

export function Process() {
  return (
    <section id="process" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          How an idea becomes a product
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Four steps, run tightly. Most ideas do not survive the first two — that
          is the point.
        </p>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {process.map((item) => (
            <li key={item.step} className="bg-surface p-7">
              <span className="font-mono text-xs font-medium text-brand">
                {item.step}
              </span>
              <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
