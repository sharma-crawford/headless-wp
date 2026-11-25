/** Castle wings group real courses and resources without replacing course access checks. */
export const courses = [
  { id: "library", room: "The Library", title: "Course Library", description: "Explore the Armory catalogue and all nine renAIssance law-school courses.", position: "library" },
  { id: "council", room: "The Council Chamber", title: "Rights & Resources", description: "Find immigration foundations, rights guides, habeas resources, and detention information.", position: "council" },
  { id: "training", room: "The Training Hall", title: "Courtroom Practice", description: "Tour the courtroom, practice advocacy, or return to your enrolled training and webinars.", position: "training" },
] as const;

export type CastleProgram = {
  id: number;
  title: string;
  description: string;
  enrolled: boolean;
  progress?: { completed: number; total: number };
};
