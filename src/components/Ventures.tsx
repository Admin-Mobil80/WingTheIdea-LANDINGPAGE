import { ventures, type Venture } from "@/lib/content";

const statusStyles: Record<Venture["status"], string> = {
  Live: "bg-brand-soft text-brand border-brand/25",
  "In development": "bg-surface-muted text-foreground border-border",
  Exploring: "bg-surface-muted text-muted border-border",
};

export function Ventures() {
  return (
    <section
      id="ventures"
      className="scroll-mt-20 border-t border-border bg-surface-muted/40"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ventures
        </h2>
        <p className="mt-4 max-w-xl text-muted">
          Three shipped and in the hands of customers, one in the workshop.
        </p>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {ventures.map((v) => (
            <li
              key={v.name}
              className="flex flex-col rounded-2xl border border-border bg-surface p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-semibold tracking-tight">
                  {v.name}
                </h3>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[v.status]}`}
                >
                  {v.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {v.summary}
              </p>
              {v.href && (
                <a
                  href={v.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 text-sm font-medium text-brand hover:underline"
                >
                  {v.href.replace("https://", "")} →
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
