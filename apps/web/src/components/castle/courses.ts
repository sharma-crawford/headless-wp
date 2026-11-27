/**
 * The Castle's doors. The Castle itself holds no content: each door opens a place
 * with one purpose (see docs/armory-sitemap.md, "What each place is").
 *
 *   Library          learn: every course (opens the Library page)
 *   Council Chamber  consult: rights and family resources, for families and practitioners
 *   Training Hall    practice: the court tour, Roll the Dice, the Simulator
 *
 * "My Training" is a fourth door on the courtyard, but it is not a room: it is the
 * reader's own page, and its label is drawn from their data (castle-explorer.tsx).
 *
 * Each label reads the same way: the place, what it is for, and one action.
 * `room` and `title` are the heading a room page shows when it is opened.
 */
export const courses = [
  { id: "library", name: "Library", purpose: "Learn: every course", cta: "Browse courses →", room: "The Library", title: "Library", description: "Every course and webinar, free and paid. Choose what to learn.", position: "library", href: "#list" },
  { id: "council", name: "Council Chamber", purpose: "Consult: rights and resources", cta: "Enter →", room: "The Council Chamber", title: "Rights & Resources", description: "Information and help to have at hand, for families and for practitioners.", position: "council", href: "#council" },
  { id: "training", name: "Training Hall", purpose: "Practice: court tour, Dice, Simulator", cta: "Enter →", room: "The Training Hall", title: "Courtroom Practice", description: "Tour the courtroom and practice advocacy.", position: "training", href: "#training" },
] as const;
