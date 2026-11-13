import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@pcle/ui/components/badge";
import { Button } from "@pcle/ui/components/button";
import { Card, CardContent } from "@pcle/ui/components/card";
import { Input } from "@pcle/ui/components/input";

import { renderAccessError } from "@/components/access-error";
import Breadcrumbs from "@/components/breadcrumbs";
import ActionForm from "@/components/builder/action-form";
import AuthorshipLine from "@/components/builder/authorship-line";
import BodyEditor from "@/components/builder/body-editor";
import ColourMenu from "@/components/colours/colour-menu";
import { TypeIcon } from "@/components/builder/node-row";
import QuizEditor from "@/components/builder/quiz-editor";
import { NODE_BADGES } from "@/components/builder/node-labels";
import PageShell from "@/components/page-shell";
import WpContent from "@/components/wp-content";
import { KindBadge, StateBadge } from "@/components/state-badge";
import { saveBodyAction, setStatusAction } from "@/app/actions/authoring";
import { isAuthenticated } from "@/lib/auth";
import { decodeEntities } from "@/lib/html";
import type { NodeDetail } from "@/lib/types";
import { getNode } from "@/lib/wordpress";

export default async function BuilderNodePage({
  params,
}: PageProps<"/builder/nodes/[id]">) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const { id } = await params;

  let node: NodeDetail;

  try {
    node = await getNode(Number(id));
  } catch (error) {
    return renderAccessError(error, {
      title: "You do not have access to the builder",
      detail:
        "Building courses is limited to instructors and administrators. If you think that should include you, contact your programme administrator.",
    });
  }

  const title = decodeEntities(node.title);

  const isDraft = node.status !== "publish";

  return (
    <PageShell code="P11" wide>
      <Breadcrumbs
        trail={[
          { label: "Build", href: "/builder" },
          ...(node.program
            ? [
                {
                  label: node.program.title,
                  href: `/builder/programs/${node.program.id}`,
                },
              ]
            : []),
          { label: node.title },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
        <TypeIcon type={node.type} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {node.type === "pcle_program" ? (
              <Badge variant="secondary" className="uppercase tracking-wide">
                {NODE_BADGES[node.type]}
              </Badge>
            ) : (
              <KindBadge kind={node.type} className="uppercase tracking-wide" />
            )}
            <StateBadge state={isDraft ? "draft" : "published"} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <ColourMenu
              nodeId={node.id}
              title={title}
              own={node.color}
              inherited={node.inherited_color}
              // The editor knows the colour above it, not which ancestor set it.
              inheritedFrom={node.parent ? "parent" : null}
            />
            <h1 className="text-2xl font-semibold text-zinc-950 sm:text-3xl">{title}</h1>
          </div>

          <AuthorshipLine item={node} />
        </div>

        <ActionForm action={setStatusAction}>
          <input type="hidden" name="id" value={node.id} />
          <input type="hidden" name="status" value={isDraft ? "publish" : "draft"} />
          <Button type="submit" variant={isDraft ? "default" : "outline"} className="h-10 px-4">
            {isDraft ? "Publish" : "Unpublish"}
          </Button>
        </ActionForm>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
        {/*
          A quiz is authored as questions, not prose, so it gets its own editor
          rather than the body field every other type shares.
        */}
        {node.type === "pcle_quiz" ? (
          <QuizEditor node={node} />
        ) : (
          <ActionForm action={saveBodyAction}>
            <Card className="p-6">
              <CardContent className="p-0">
                <input type="hidden" name="id" value={node.id} />

                <label
                  htmlFor="node-title"
                  className="block text-sm font-medium text-zinc-700"
                >
                  Title
                </label>
                <Input
                  id="node-title"
                  type="text"
                  name="title"
                  defaultValue={title}
                  className="mt-1 w-full"
                />

                <label
                  htmlFor="node-body"
                  className="mt-6 block text-sm font-medium text-zinc-700"
                >
                  Body
                </label>
                <BodyEditor
                  defaultValue={node.body}
                  preserved={node.preserved}
                  nodeId={node.id}
                />

                <Button type="submit" className="mt-6">
                  Save
                </Button>
              </CardContent>
            </Card>
          </ActionForm>
        )}

        {node.type !== "pcle_quiz" && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              As a participant sees it
            </h2>

            {/*
              The preview is the server's own rendering of the stored content —
              the same call the participant screens make. Rendering it a second
              way here would make it a preview of something else the moment the
              two drift.
            */}
            <Card className="mt-3 p-6">
              <CardContent className="p-0">
                {node.rendered.trim() ? (
                  <WpContent html={node.rendered} />
                ) : (
                  <p className="text-sm text-zinc-500">Nothing written yet.</p>
                )}
              </CardContent>
            </Card>
          </section>
        )}
        </div>

        <aside className="space-y-5">
          {(node.program || node.parent) && (
            <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm">
              <h2 className="text-lg font-semibold text-zinc-950">Where it is</h2>
              <dl className="mt-3 space-y-2.5">
                {node.program && (
                  <div>
                    <dt className="text-xs text-zinc-500">Programme</dt>
                    <dd>
                      <Link
                        href={`/builder/programs/${node.program.id}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {decodeEntities(node.program.title)}
                      </Link>
                    </dd>
                  </div>
                )}
                {node.parent && node.parent.id !== node.program?.id && (
                  <div>
                    <dt className="text-xs text-zinc-500">Inside</dt>
                    <dd>
                      <Link
                        href={`/builder/nodes/${node.parent.id}`}
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {decodeEntities(node.parent.title)}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>

              {node.program && (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  nativeButton={false}
                  render={<Link href={`/builder/programs/${node.program.id}`} />}
                >
                  Back to the programme
                </Button>
              )}
            </div>
          )}

          {node.type !== "pcle_quiz" && (
            <div className="rounded-xl border border-zinc-200 bg-brand-50 p-5 text-sm text-brand-900">
              <h2 className="text-lg font-semibold text-brand-950">Writing tips</h2>
              <ul className="mt-3 list-disc space-y-2 pl-4">
                <li>Use <strong className="font-semibold">Video or embed</strong> in the toolbar for a YouTube, Vimeo or Google Drive video.</li>
                <li>Drop a PDF, Word document or image on the text to attach it; paste an image to add it at the cursor.</li>
                <li>The preview below the editor is exactly what participants see once you save.</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
