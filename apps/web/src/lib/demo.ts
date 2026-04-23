export type DemoPersona = {
  slug: string;
  userId: string;
  name: string;
  stage: string;
  headline: string;
  summary: string;
  focus: string;
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    slug: "maya",
    userId: "maya",
    name: "Maya Chen",
    stage: "Trying to get ahead",
    headline: "Good income, real progress, and a few balances that still need attention.",
    summary:
      "Maya is doing a lot right, but credit cards and student loans still shape too many decisions. She wants one place that helps her stay steady without making money feel overwhelming.",
    focus:
      "A useful example if you're earning, paying things down, and still trying to keep saving.",
  },
  {
    slug: "david",
    userId: "david",
    name: "David Park",
    stage: "Getting started",
    headline: "Early paychecks, first savings goals, and a habit that is just starting to stick.",
    summary:
      "David is building an emergency fund, putting a little money aside each month, and learning what actually helps him feel in control.",
    focus:
      "A good fit if you're in your twenties and figuring out how to save without making life feel too tight.",
  },
  {
    slug: "linda",
    userId: "linda",
    name: "Linda Rossi",
    stage: "Thinking about what's next",
    headline: "Years of progress, a few big decisions, and retirement getting closer.",
    summary:
      "Linda has built a strong foundation and wants a simple view of what she has, what she still owes, and when work can start to become optional.",
    focus:
      "A helpful example if you're planning for retirement and want clarity more than noise.",
  },
];

const DEMO_USER_IDS = new Set(DEMO_PERSONAS.map((persona) => persona.userId));

export function getDemoPersona(slug: string) {
  return DEMO_PERSONAS.find((persona) => persona.slug === slug) ?? null;
}

export function isDemoUserId(userId: string) {
  return DEMO_USER_IDS.has(userId);
}
