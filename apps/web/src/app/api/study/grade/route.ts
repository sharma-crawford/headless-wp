import { saveRoomAttempts } from "@/lib/study-attempts";
import { getProgram } from "@/lib/wordpress";
import { studyPrograms } from "@/lib/study-courses";
import business from "@/components/study/courses/quiz-data.json";
import criminalProcedure from "@/components/study/courses/criminal-procedure/quiz-data.json";
import evidence from "@/components/study/courses/evidence/quiz-data.json";
import responsibility from "@/components/study/courses/professional-responsibility/quiz-data.json";
import property from "@/components/study/courses/property/quiz-data.json";
import criminalLaw from "@/components/study/courses/criminal-law/quiz-data.json";
import contracts from "@/components/study/courses/contracts/quiz-data.json";
import torts from "@/components/study/courses/torts/quiz-data.json";
import civilProcedure from "@/components/study/courses/civil-procedure/quiz-data.json";
import businessData from "@/components/study/courses/study-data.json";
import criminalProcedureData from "@/components/study/courses/criminal-procedure/study-data.json";
import evidenceData from "@/components/study/courses/evidence/study-data.json";
import responsibilityData from "@/components/study/courses/professional-responsibility/study-data.json";
import propertyData from "@/components/study/courses/property/study-data.json";
import criminalLawData from "@/components/study/courses/criminal-law/study-data.json";
import contractsData from "@/components/study/courses/contracts/study-data.json";
import tortsData from "@/components/study/courses/torts/study-data.json";
import civilProcedureData from "@/components/study/courses/civil-procedure/study-data.json";

const banks: Record<string, typeof business> = {
  "business-associations": business, "criminal-procedure": criminalProcedure, evidence,
  "professional-responsibility": responsibility, property, "criminal-law": criminalLaw,
  contracts, torts, "civil-procedure": civilProcedure,
};
/** Each subject's section titles, in the order its question bank indexes them. */
const sectionTitles: Record<string, string[]> = {
  "business-associations": businessData.sections.map(s => s.title), "criminal-procedure": criminalProcedureData.sections.map(s => s.title),
  evidence: evidenceData.sections.map(s => s.title), "professional-responsibility": responsibilityData.sections.map(s => s.title),
  property: propertyData.sections.map(s => s.title), "criminal-law": criminalLawData.sections.map(s => s.title),
  contracts: contractsData.sections.map(s => s.title), torts: tortsData.sections.map(s => s.title),
  "civil-procedure": civilProcedureData.sections.map(s => s.title),
};

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const { subject, ids, answers } = body ?? {};
  if (typeof subject !== "string" || !Object.hasOwn(banks, subject) || !Array.isArray(ids) || ids.length > 500 || ids.some(id => !Number.isInteger(id))) {
    return Response.json({ error: "Invalid quiz selection" }, { status: 400 });
  }
  try { await getProgram(studyPrograms[subject], true); } catch { return Response.json({ error: "Course access required" }, { status: 403 }); }
  const selected = new Set(ids);

  /*
   * What was answered also goes to the matching WordPress quiz, so it counts in
   * the learner's record. Best effort (lib/study-attempts.ts): the answer review
   * below is returned either way.
   */
  if (answers && typeof answers === "object") {
    const answered = banks[subject]
      .filter(q => selected.has(q.id) && Number.isInteger((answers as Record<string, unknown>)[String(q.id)]))
      .map(q => ({ id: q.id, section: q.section, option: (answers as Record<string, number>)[String(q.id)] }));
    await saveRoomAttempts(studyPrograms[subject], sectionTitles[subject], answered).catch(() => 0);
  }

  return Response.json({ review: banks[subject].filter(q => selected.has(q.id)).map(({ id, answer, explanation, refs }) => ({ id, answer, explanation, refs })) }, { headers: { "Cache-Control": "private, no-store" } });
}
