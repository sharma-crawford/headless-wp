import Link from "next/link";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CircleHelpIcon,
  ClipboardListIcon,
  FileTextIcon,
  LayersIcon,
  MessagesSquareIcon,
  RadioIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@pcle/ui/lib/utils";
import { Button } from "@pcle/ui/components/button";

import ActionForm from "@/components/builder/action-form";
import { authorshipText } from "@/components/builder/authorship-line";
import CollapsibleNode from "@/components/builder/collapsible-node";
import ColourMenu from "@/components/colours/colour-menu";
import { ColourStrip } from "@/components/colour-marks";
import { AddChildMenu, NodeMenu } from "@/components/builder/row-actions";
import { DragHandle } from "@/components/builder/sortable-group";
import { StateBadge } from "@/components/state-badge";
import { reorderAction } from "@/app/actions/authoring";
import type { Swatch } from "@/lib/colours";
import { decodeEntities } from "@/lib/html";
import type { NodeType, TreeNode } from "@/lib/types";

/**
 * Counts everything hanging off a node, so a delete can say what it will take.
 */
function countDescendants(node: TreeNode): number {
  return node.children.reduce(
    (total, child) => total + 1 + countDescendants(child),
    0
  );
}

/**
 * The ordering that results from moving one id one step in a direction.
 *
 * Computed here, on the server, and carried in the form. The reorder endpoint
 * wants the whole sibling list; the page already knows it, so there is no
 * reason to make the request twice.
 */
function reordered(ids: number[], id: number, direction: -1 | 1): number[] {
  const from = ids.indexOf(id);
  const to = from + direction;

  if (from < 0 || to < 0 || to >= ids.length) {
    return ids;
  }

  const next = [...ids];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

function MoveButton({
  parentId,
  childType,
  siblingIds,
  id,
  direction,
}: {
  parentId: number;
  childType: NodeType;
  siblingIds: number[];
  id: number;
  direction: -1 | 1;
}) {
  const position = siblingIds.indexOf(id);
  const atEdge = direction === -1 ? position <= 0 : position >= siblingIds.length - 1;

  if (atEdge) {
    // Keep the space so rows do not jitter as things move.
    return <span aria-hidden="true" className="inline-block w-7" />;
  }

  return (
    <ActionForm action={reorderAction} className="inline">
      <input type="hidden" name="parent_id" value={parentId} />
      <input type="hidden" name="child_type" value={childType} />
      <input
        type="hidden"
        name="ids"
        value={reordered(siblingIds, id, direction).join(",")}
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        className="text-zinc-400 hover:text-zinc-700"
        aria-label={direction === -1 ? "Move up" : "Move down"}
      >
        {direction === -1 ? (
          <ChevronUpIcon className="size-4" />
        ) : (
          <ChevronDownIcon className="size-4" />
        )}
      </Button>
    </ActionForm>
  );
}

/**
 * How prominent a row is, by what it is.
 *
 * Every row used to render identically — same badge, same size — so the only
 * thing separating a unit from a template was how far right it sat, four
 * levels deep. Weight carries the hierarchy now, and indentation only
 * confirms it.
 */
const TITLE_STYLES: Record<NodeType, string> = {
  pcle_program: "text-base font-semibold text-zinc-950",
  pcle_unit: "font-serif text-lg font-semibold text-zinc-950",
  pcle_module: "text-[0.95rem] font-medium text-zinc-900",
  pcle_scenario: "text-sm text-zinc-600",
  pcle_quiz: "text-sm text-zinc-600",
  pcle_template: "text-sm text-zinc-600",
  pcle_event: "text-sm text-zinc-600",
};

export default function NodeRow({
  node,
  parentId,
  siblingIds,
  inherited,
  inheritedFrom,
  children,
}: {
  node: TreeNode;
  parentId: number;
  siblingIds: number[];
  /** The colour this row shows unless it has its own, and whose it is. */
  inherited: Swatch | null;
  inheritedFrom: string;
  children?: React.ReactNode;
}) {
  const isDraft = node.status !== "publish";
  const descendants = countDescendants(node);
  const title = decodeEntities(node.title);

  const hasChildren = node.children.length > 0;

  const isUnit = node.type === "pcle_unit";
  const summary = summarise(node);

  // The left padding is kept on every row, coloured or not, so colouring one
  // item does not shift it sideways from the rest.
  const row = (
    <div
      className={cn(
        "relative flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 pr-4 pl-3",
        isUnit && "py-3.5"
      )}
    >
      <ColourStrip swatch={node.color ?? inherited} />

      <DragHandle />

      <TypeIcon type={node.type} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <ColourMenu
            nodeId={node.id}
            title={title}
            own={node.color}
            inherited={inherited}
            inheritedFrom={inheritedFrom}
          />

          {/*
            Who made it, on hover only: a line under every row would double
            the height of the tree to answer a question asked of one item.
          */}
          <Link
            href={`/builder/nodes/${node.id}`}
            title={authorshipText(node) || undefined}
            className={cn("hover:text-brand-800 hover:underline", TITLE_STYLES[node.type])}
          >
            {title}
          </Link>
        </div>

        {summary && <p className="mt-0.5 text-xs text-zinc-500">{summary}</p>}
      </div>

      {isDraft ? (
        <StateBadge state="draft" />
      ) : (
        !isUnit && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            Published
          </span>
        )
      )}

      <span className="flex items-center gap-1">
        <MoveButton
          parentId={parentId}
          childType={node.type}
          siblingIds={siblingIds}
          id={node.id}
          direction={-1}
        />
        <MoveButton
          parentId={parentId}
          childType={node.type}
          siblingIds={siblingIds}
          id={node.id}
          direction={1}
        />

        <AddChildMenu parentId={node.id} childTypes={node.allowed_children} />

        <NodeMenu
          nodeId={node.id}
          title={title}
          isDraft={isDraft}
          descendants={descendants}
        />
      </span>
    </div>
  );

  // The <li> is SortableGroup's: it is the element that moves while dragging.
  return (
    <>
      {hasChildren ? (
        /*
         * Units arrive folded. Anything deeper arrives open: having opened a
         * unit you have already asked to see inside it, and a second click
         * would only move the problem down a level.
         */
        <CollapsibleNode
          row={row}
          label={title}
          defaultOpen={node.type !== "pcle_unit"}
        >
          {children}
        </CollapsibleNode>
      ) : (
        <div className="flex items-start gap-1.5">
          {/* Keeps childless rows aligned with the ones that have a chevron. */}
          <span aria-hidden="true" className="size-5 shrink-0" />
          <div className="min-w-0 flex-1">{row}</div>
        </div>
      )}
    </>
  );
}

/** An icon and a tint per kind, so a row says what it is before it is read. */
const TYPE_ICONS: Record<NodeType, { icon: LucideIcon; className: string }> = {
  pcle_program: { icon: LayersIcon, className: "bg-brand-50 text-brand-700" },
  pcle_unit: { icon: LayersIcon, className: "bg-brand-800 text-white" },
  pcle_module: { icon: FileTextIcon, className: "bg-brand-50 text-brand-700" },
  pcle_scenario: { icon: MessagesSquareIcon, className: "bg-emerald-50 text-emerald-700" },
  pcle_quiz: { icon: CircleHelpIcon, className: "bg-violet-50 text-violet-700" },
  pcle_template: { icon: ClipboardListIcon, className: "bg-amber-50 text-amber-800" },
  pcle_event: { icon: RadioIcon, className: "bg-red-50 text-red-700" },
};

export function TypeIcon({ type }: { type: NodeType }) {
  const { icon: Icon, className } = TYPE_ICONS[type];

  return (
    <span
      aria-hidden="true"
      className={cn("grid size-8 shrink-0 place-items-center rounded-lg", className)}
    >
      <Icon className="size-4" />
    </span>
  );
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** One line under a row: what is in it, or what is missing from it. */
function summarise(node: TreeNode): string {
  const count = (type: NodeType) => node.children.filter((child) => child.type === type).length;

  switch (node.type) {
    case "pcle_unit": {
      const parts = [plural(count("pcle_module"), "module", "modules")];
      const sessions = count("pcle_event");
      if (sessions) parts.push(plural(sessions, "live session", "live sessions"));
      return parts.join(" · ");
    }
    case "pcle_module": {
      const parts = [
        count("pcle_scenario") && plural(count("pcle_scenario"), "scenario", "scenarios"),
        count("pcle_quiz") && plural(count("pcle_quiz"), "quiz", "quizzes"),
        count("pcle_template") && plural(count("pcle_template"), "template", "templates"),
      ].filter(Boolean);
      return parts.length ? `Module · ${parts.join(", ")}` : "Module";
    }
    case "pcle_quiz":
      return [
        node.questions ? plural(node.questions, "question", "questions") : "No questions yet",
        node.gates_completion ? "required to complete" : null,
      ]
        .filter(Boolean)
        .join(" · ");
    case "pcle_event":
      return [
        node.starts_at ? node.starts_at.slice(0, 16).replace("T", " ") : "No date yet",
        node.duration ? `${node.duration} min` : null,
        node.join_url ? "join link set" : "no join link",
      ]
        .filter(Boolean)
        .join(" · ");
    case "pcle_scenario":
      return node.has_model_answer ? "With a model answer" : "No model answer yet";
    default:
      return "";
  }
}
