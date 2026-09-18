"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "sent" | "error";

/**
 * CloudFront signs requests to the Lambda Function URL origin (OAC + AWS_IAM),
 * but it does NOT hash the request body. Without this header the SigV4
 * signature never matches a POST that has a payload, and the function URL
 * returns 403 — which the distribution's error pages then render as a 404.
 * The viewer has to supply the hex SHA-256 of the exact body it sends.
 */
async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const field =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-brand";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus("submitting");
    setMessage("");

    try {
      const requestBody = JSON.stringify(payload);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-amz-content-sha256": await sha256Hex(requestBody),
        },
        body: requestBody,
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok || !result.ok) {
        setStatus("error");
        setMessage(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Please check your connection.");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-border bg-background px-6 py-12 text-center"
      >
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-soft">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 10.5l4 4 8-9"
              stroke="var(--brand)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="mt-5 text-lg font-semibold">Thanks — that reached us.</h3>
        <p className="mt-2 text-sm text-muted">
          We read every submission and reply if it looks like a fit.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-brand hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  const busy = status === "submitting";

  return (
    <form onSubmit={onSubmit} noValidate className="text-left">
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Your name
          </label>
          <input id="name" name="name" type="text" required maxLength={200}
            autoComplete="name" placeholder="Alex Morgan" className={field} />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <input id="email" name="email" type="email" required maxLength={320}
            autoComplete="email" placeholder="you@company.com" className={field} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="phone" className="mb-2 block text-sm font-medium">
          Contact number{" "}
          <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="phone" name="phone" type="tel" maxLength={50}
          inputMode="tel" autoComplete="tel" placeholder="+1 555 000 0000"
          className={field} />
      </div>

      <div className="mt-5">
        <label htmlFor="description" className="mb-2 block text-sm font-medium">
          Describe your idea
        </label>
        <textarea id="description" name="description" required rows={5}
          minLength={10} maxLength={5000}
          placeholder="What are you building?"
          className={`${field} resize-y`} />
      </div>

      {status === "error" && (
        <p role="alert" className="mt-4 rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Sending…" : "Submit"}
      </button>

    </form>
  );
}
