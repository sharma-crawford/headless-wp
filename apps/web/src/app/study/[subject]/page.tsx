import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getProgram, WordPressApiError } from "@/lib/wordpress";
import { studyPrograms } from "@/lib/study-courses";
import ArmoryNav from "@/components/armory/armory-nav";
import { renderAccessError } from "@/components/access-error";
import "@/components/study/armory.css";

const rooms = {
  "business-associations": () => import("@/components/study/courses/business-associations/page"),
  "criminal-procedure": () => import("@/components/study/courses/criminal-procedure/page"),
  evidence: () => import("@/components/study/courses/evidence/page"),
  "professional-responsibility": () => import("@/components/study/courses/professional-responsibility/page"),
  property: () => import("@/components/study/courses/property/page"),
  "criminal-law": () => import("@/components/study/courses/criminal-law/page"),
  contracts: () => import("@/components/study/courses/contracts/page"),
  torts: () => import("@/components/study/courses/torts/page"),
  "civil-procedure": () => import("@/components/study/courses/civil-procedure/page"),
};

export const dynamic = "force-dynamic";
export default async function StudyPage({ params }: PageProps<"/study/[subject]">) {
  const { subject } = await params;
  const id = studyPrograms[subject];
  if (!Object.hasOwn(studyPrograms, subject) || !Object.hasOwn(rooms, subject) || !id) notFound();
  if (!(await isAuthenticated())) redirect("/login");
  let refused: unknown;
  try { await getProgram(id, true); } catch (error) { refused = error; }
  if (refused instanceof WordPressApiError && refused.status === 403) redirect(`/catalogue/${id}?locked=1`);
  if (refused) return renderAccessError(refused);
  const Room = (await rooms[subject as keyof typeof rooms]()).default;
  return <div className="armory-study"><ArmoryNav signedIn /><nav className="armory-study-nav" aria-label="Course navigation"><a href="/castle#library">← Castle library</a><a href={`/programs/${id}`}>Lessons and progress →</a></nav><Room /></div>;
}
