/** Source catalogue verified against Edward's local renAIssance project. */
export const education = [
  { title: "Immigration Court Virtual Tour", group: "Immigration", path: "/immigration-court-tour", description: "Explore the courtroom and the people, roles, and steps in an immigration hearing." },
  { title: "Immigration 101 · The Advocate’s Crash Course", group: "Immigration", path: "/immigration-101", description: "Ten illustrated lessons, understanding checks, and a final case file." },
  { title: "Habeas Corpus · From Custody to Court", group: "Immigration", path: "/habeas-corpus", description: "An advocate lesson and dated primers for all 94 federal judicial districts." },
  { title: "Rights & Family Resources", group: "Immigration", path: "/immigration-rights", description: "Multilingual rights guides, family next steps, and legal-help resources." },
  { title: "ICE Detention Map", group: "Immigration", path: "/icemap", description: "Facility information, family resources, and federal district resources." },
  { title: "Roll the Dice · Immigration Practice Lab", group: "Immigration", path: "/immigration-dice", description: "Written practice through six immigration scenarios." },
  { title: "The Line · Immigration Simulator", group: "Immigration", path: "/immigration-simulator", description: "An interactive story about family pressures, evidence, and immigration court." },
  { title: "Business Associations", group: "Doctrinal courses", path: "/what-like-its-hard/business-associations", description: "What, Like It’s Hard? · Agency, partnerships, LLCs, and corporate governance." },
  { title: "Criminal Procedure", group: "Doctrinal courses", path: "/what-like-its-hard/criminal-procedure", description: "Viking Law · Constitutional procedure in the shield hall." },
  { title: "Evidence", group: "Doctrinal courses", path: "/what-like-its-hard/evidence", description: "The Admissibility Files · Rules, cases, and illustrated practice." },
  { title: "Professional Responsibility", group: "Doctrinal courses", path: "/what-like-its-hard/professional-responsibility", description: "Counsel of the Fairy Court · Duties, confidentiality, and conflicts." },
  { title: "Property", group: "Doctrinal courses", path: "/what-like-its-hard/property", description: "The Noble Estates · Land, ownership, and practice problems." },
  { title: "Criminal Law", group: "Doctrinal courses", path: "/what-like-its-hard/criminal-law", description: "The Tidewater Docket · Acts, intent, offenses, and defenses." },
  { title: "Contracts", group: "Doctrinal courses", path: "/what-like-its-hard/contracts", description: "The Infernal Bar · Formation, defenses, breach, and remedies." },
  { title: "Torts", group: "Doctrinal courses", path: "/what-like-its-hard/torts", description: "Tort Station · Intent, negligence, causation, and damages." },
  { title: "Civil Procedure", group: "Doctrinal courses", path: "/what-like-its-hard/civil-procedure", description: "The Procedure Dojo · Pleadings, discovery, judgment, and jurisdiction." },
] as const;

const localResources: Record<string, string> = {
  "/immigration-court-tour": "/castle-resources/court-tour/index.html",
  "/immigration-101": "/castle-resources/advocate-101/index.html",
  "/habeas-corpus": "/castle-resources/habeas-primer/index.html",
  "/icemap": "/castle-resources/icemap/map.html",
  "/immigration-rights": "/castle-resources/icemap/map.html?view=rights",
};

export function educationHref(path: string) {
  if (path.startsWith("/what-like-its-hard/")) return path.replace("/what-like-its-hard/", "/study/");
  return localResources[path] ?? `https://legal-renaissance.com${path}`;
}
