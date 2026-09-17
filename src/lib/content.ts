/**
 * All site copy lives here so it can be edited without touching markup.
 *
 * PLACEHOLDER copy is marked. Replace before launch — it is written to be
 * plausible, not accurate.
 */

export const site = {
  name: "WingTheIdea",
  domain: "www.wingtheidea.com",
  tagline: "Ideas, shipped.",
  description:
    "WingTheIdea is a product studio. We take early ideas and build them into working software that real customers use.",
  email: "hello@wingtheidea.com", // PLACEHOLDER — confirm the real address
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

// PLACEHOLDER — ReconFlow's description is a guess from the name. Correct it.
export const ventures: Venture[] = [
  {
    name: "ReconFlow",
    status: "In development",
    summary:
      "Reconciliation without the spreadsheet archaeology — matching records across systems and surfacing only what actually needs a human.",
  },
  {
    name: "Next idea",
    status: "Exploring",
    summary:
      "We are always working on what comes next. If you have an idea worth building, we would like to hear it.",
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
