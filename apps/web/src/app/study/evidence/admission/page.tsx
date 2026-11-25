import { redirect } from "next/navigation";
import { getProgram } from "@/lib/wordpress";
import { studyPrograms } from "@/lib/study-courses";
import AdmissionPage from "@/components/study/courses/evidence/admission/page";

export const dynamic = "force-dynamic";
export default async function Page() {
  try { await getProgram(studyPrograms.evidence, true); } catch { redirect(`/study/evidence`); }
  return <AdmissionPage />;
}
