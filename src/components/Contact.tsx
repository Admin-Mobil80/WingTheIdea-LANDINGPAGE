import { ContactForm } from "./ContactForm";

export function Contact() {
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-t border-border bg-surface-muted/40"
    >
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
        <div className="text-center">
          <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Have an idea worth building?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Tell us what you are thinking. If it is a fit, we will say so
            quickly — and if it is not, we will tell you that just as quickly.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-surface p-6 sm:p-10">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
