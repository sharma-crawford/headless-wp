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

const banks: Record<string, typeof business> = {
  "business-associations": business, "criminal-procedure": criminalProcedure, evidence,
  "professional-responsibility": responsibility, property, "criminal-law": criminalLaw,
  contracts, torts, "civil-procedure": civilProcedure,
};
export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request" }, { status: 400 }); }
  const { subject, ids } = body ?? {};
  if (typeof subject !== "string" || !Object.hasOwn(banks, subject) || !Array.isArray(ids) || ids.length > 500 || ids.some(id => !Number.isInteger(id))) {
    return Response.json({ error: "Invalid quiz selection" }, { status: 400 });
  }
  try { await getProgram(studyPrograms[subject], true); } catch { return Response.json({ error: "Course access required" }, { status: 403 }); }
  const selected = new Set(ids);
  return Response.json({ review: banks[subject].filter(q => selected.has(q.id)).map(({ id, answer, explanation, refs }) => ({ id, answer, explanation, refs })) }, { headers: { "Cache-Control": "private, no-store" } });
}
