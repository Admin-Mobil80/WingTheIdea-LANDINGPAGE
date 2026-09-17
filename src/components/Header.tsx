import Link from "next/link";
import { Logo } from "./Logo";
import { nav } from "@/lib/content";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" aria-label="WingTheIdea home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="min-w-0">
          <ul className="flex items-center gap-1 sm:gap-2">
            {nav.map((item, i) => (
              <li
                key={item.href}
                /* Below `sm` there is not room for the full nav beside the
                   wordmark, so only the last item (Contact) is shown. */
                className={i < nav.length - 1 ? "hidden sm:block" : ""}
              >
                <a
                  href={item.href}
                  className="block whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
