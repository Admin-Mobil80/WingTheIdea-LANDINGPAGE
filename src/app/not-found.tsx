import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 font-mono text-sm text-brand">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        That page does not exist
      </h1>
      <p className="mt-3 text-muted">
        It may have moved, or it may never have been here.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Back home
      </Link>
    </main>
  );
}
