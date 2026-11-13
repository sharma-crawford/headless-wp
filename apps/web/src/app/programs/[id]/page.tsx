import Link from "next/link";
import { redirect } from "next/navigation";

import { renderAccessError } from "@/components/access-error";
import Breadcrumbs from "@/components/breadcrumbs";
import PageShell from "@/components/page-shell";
import PreviewBanner from "@/components/preview-banner";
import { Cover } from "@/components/programme-card";
import ProgressBar from "@/components/progress-bar";
import UnitSection from "@/components/unit-section";
import WpContent from "@/components/wp-content";
import { isAuthenticated } from "@/lib/auth";
import { swatchSolid } from "@/lib/colours";
import { decodeEntities } from "@/lib/html";
import { firstUnfinished } from "@/lib/outline";
import { isPreview, keepPreview } from "@/lib/preview";
import type { Program } from "@/lib/types";
import { WordPressApiError, getProgram } from "@/lib/wordpress";

export default async function ProgramPage({
  params,
  searchParams,
}: PageProps<"/programs/[id]">) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const { id } = await params;
  const preview = isPreview(await searchParams);

  let program: Program | null = null;
  let refused: unknown = null;

  try {
    program = await getProgram(Number(id), preview);
  } catch (error) {
    refused = error;
  }

  /*
   * Not theirs: show them what it is and how to get it, rather than a
   * locked door. The catalogue page says why they landed there. Outside
   * the try, because redirect() works by throwing.
   */
  if (refused instanceof WordPressApiError && refused.status === 403 && !preview) {
    redirect(`/catalogue/${Number(id)}?locked=1`);
  }

  if (!program) {
    return renderAccessError(refused);
  }

  // A webinar is its one module: this screen would only be a link to it.
  // Outside the try, because redirect() works by throwing.
  if (program.format === "webinar" && program.webinar_module) {
    redirect(keepPreview(`/modules/${program.webinar_module}`, preview));
  }

  const next = firstUnfinished(program);
  const { completed, total } = program.progress;
  const started = completed > 0;
  const finished = total > 0 && completed === total;
  const credits = (program.credits ?? []).filter((credit) => credit.hours > 0);

  return (
    <PageShell code="P3" wide>
      {preview && <PreviewBanner programmeId={Number(id)} />}

      <Breadcrumbs
        trail={[
          { label: "My Training", href: "/my-training" },
          { label: program.title },
        ]}
      />

      {/* The course's front page: what it is, how far you are, and the way on. */}
      <div className="mt-5 grid overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] md:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">Course</p>
          <h1 className="mt-2 text-3xl leading-tight font-semibold text-zinc-950 sm:text-4xl">
            {decodeEntities(program.title)}
          </h1>

          {credits.length > 0 && (
            <p className="mt-3 text-sm font-medium text-zinc-700">
              CLE credit: {credits.map((credit) => `${credit.label} ${credit.hours} h`).join(" · ")}
            </p>
          )}

          <div className="mt-6 max-w-md">
            <ProgressBar progress={program.progress} label="Programme progress" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {next ? (
              <Link
                href={keepPreview(`/modules/${next.module.id}`, preview)}
                className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-brand-800 px-5 font-semibold text-white transition hover:bg-brand-900"
              >
                {started ? "Continue" : "Start"}: {decodeEntities(next.module.title)}
                <span aria-hidden="true">→</span>
              </Link>
            ) : finished ? (
              <span className="inline-flex h-11 items-center rounded-lg bg-emerald-50 px-5 font-semibold text-emerald-800">
                ✓ You&apos;ve completed every module
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden md:block">
          <Cover
            colour={program.color ? swatchSolid(program.color) : undefined}
            webinar={false}
            image={program.cover ?? null}
            className="h-full min-h-56"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-zinc-950">Course outline</h2>
          <p className="mt-1 text-zinc-600">
            {program.units.length} {program.units.length === 1 ? "unit" : "units"} · {total}{" "}
            {total === 1 ? "module" : "modules"}
          </p>

          {program.units.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-zinc-600">
              This programme has no published units yet.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {program.units.map((unit) => (
                <UnitSection key={unit.id} unit={unit} preview={preview} />
              ))}
            </div>
          )}
        </div>

        {program.content.trim() && (
          <aside>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold text-zinc-950">About this course</h2>
              <WpContent html={program.content} className="mt-3 text-[0.95rem]" />
            </div>
          </aside>
        )}
      </div>
    </PageShell>
  );
}
