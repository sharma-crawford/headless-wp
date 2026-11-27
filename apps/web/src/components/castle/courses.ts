/**
 * The Castle's three doors. The Castle itself holds no content: each door opens a
 * place with one purpose (see docs/armory-sitemap.md, "What each place is").
 *
 *   Library          learn: every course (opens the Library page)
 *   Council Chamber  consult: rights and family resources, for families and practitioners
 *   Training Hall    practice: the court tour, Roll the Dice, the Simulator
 */
export const courses = [
  { id: "library", room: "The Library", title: "Library", description: "Every course and webinar, free and paid. Choose what to learn.", position: "library", href: "#list" },
  { id: "council", room: "The Council Chamber", title: "Rights & Resources", description: "Information and help to have at hand, for families and for practitioners.", position: "council", href: "#council" },
  { id: "training", room: "The Training Hall", title: "Courtroom Practice", description: "Tour the courtroom and practice advocacy.", position: "training", href: "#training" },
] as const;
