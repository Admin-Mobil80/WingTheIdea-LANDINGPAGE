/** All site copy lives here so it can be edited without touching markup. */

export const site = {
  name: "WingTheIdea",
  domain: "www.wingtheidea.com",
  tagline: "Ideas, shipped.",
  description:
    "WingTheIdea is a product studio. We take early ideas and build them into working software that real customers use.",
  /** Sending address on the SES-verified domain. */
  senderEmail: "no-reply@wingtheidea.com",
  /** Address the Contact CTA points at. NOTE: a no-reply mailbox cannot
   *  receive replies — swap this for a monitored inbox before launch. */
  email: "no-reply@wingtheidea.com",
};

export const nav = [
  { label: "How we work", href: "#process" },
  { label: "Ventures", href: "#ventures" },
  { label: "Contact", href: "#contact" },
];

export const process = [
  {
    step: "01",
    title: "Sharpen the idea",
    body: "We pressure-test the premise before any code exists — who it is for, what it replaces, and what has to be true for it to work.",
  },
  {
    step: "02",
    title: "Build the first version",
    body: "A small, real product rather than a prototype. Enough to put in front of users and learn something you cannot learn from a mockup.",
  },
  {
    step: "03",
    title: "Put it in front of people",
    body: "Ship early, watch what people actually do, and let that decide what gets built next.",
  },
  {
    step: "04",
    title: "Scale what works",
    body: "The ideas that find traction get invested in properly — infrastructure, reliability and a roadmap.",
  },
];

export type Venture = {
  name: string;
  status: "Live" | "In development" | "Exploring";
  summary: string;
  href?: string;
};

export const ventures: Venture[] = [
  {
    name: "CloudMeter",
    status: "Live",
    href: "https://www.cloudmeter.io",
    summary:
      "Cloud cost monitoring across providers and AI models — one view of what you are actually spending, wherever it runs.",
  },
  {
    name: "Expenze",
    status: "Live",
    href: "https://www.expenze.ai",
    summary:
      "Agentic expense auditing for businesses, with claims submitted however people actually work — email, WhatsApp, portal or API.",
  },
  {
    name: "Flaunt",
    status: "Live",
    href: "https://www.flaunt.network",
    summary:
      "A networking platform built on your real network, not a list of contacts you have never spoken to.",
  },
  {
    name: "ReconFlow",
    status: "In development",
    summary:
      "An agentic decision support system: it reads data across disparate systems and derives meaning for the human in the loop. In study, with a prototype underway.",
  },
];

export const principles = [
  {
    title: "Small teams, short loops",
    body: "Fewer people, closer to the problem, shipping continuously.",
  },
  {
    title: "Built to run, not to demo",
    body: "Infrastructure as code, automated deploys, and no manual steps between a commit and production.",
  },
  {
    title: "Honest about uncertainty",
    body: "Most ideas do not work. We find that out quickly and cheaply, rather than slowly and expensively.",
  },
];
