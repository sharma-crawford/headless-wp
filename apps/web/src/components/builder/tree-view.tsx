import { decodeEntities } from "@/lib/html";
import { NODE_LABELS } from "@/components/builder/node-labels";
import NodeRow from "@/components/builder/node-row";
import SortableGroup from "@/components/builder/sortable-group";
import type { Swatch } from "@/lib/colours";
import type { NodeType, TreeNode } from "@/lib/types";

/**
 * The children of a node, grouped by type.
 *
 * Grouping is not cosmetic: ordering is per type on the server — a unit's
 * modules and its sessions are two independent lists — so the groups here are
 * the same units the reorder endpoint works in. Rendering them mixed would
 * make "move up" mean something the API cannot express.
 */
function childrenOfType(node: TreeNode, type: NodeType): TreeNode[] {
  return node.children.filter((child) => child.type === type);
}

/** "programme", "unit": whose colour an item is showing, in words. */
function owner(type: NodeType): string {
  return NODE_LABELS[type].singular.toLowerCase();
}

/**
 * `inherited` is the colour this node's children show unless they have their
 * own, and `inheritedFrom` whose colour that is. Worked out here, walking down
 * the tree the page already has, rather than asked of the server per row.
 */
export default function TreeView({
  node,
  inherited,
  inheritedFrom,
}: {
  node: TreeNode;
  inherited: Swatch | null;
  inheritedFrom: string;
}) {
  const groups = node.allowed_children
    .map((type) => ({ type, items: childrenOfType(node, type) }))
    .filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return null;
  }

  // A programme's units are cards of their own; inside a unit, rows.
  const topLevel = node.type === "pcle_program";

  return (
    <div
      className={
        topLevel
          ? "space-y-5"
          : node.type === "pcle_unit"
            ? "border-t border-zinc-100"
            : // Below a module: indented under it, so what belongs to what reads at a glance.
              "mb-2 ml-14 border-l-2 border-zinc-100"
      }
    >
      {groups.map((group) => (
        <section key={group.type}>
          {!topLevel && (
            <h3
              className={
                node.type === "pcle_unit"
                  ? "flex items-center gap-1.5 bg-zinc-50/70 px-5 pt-3 pb-1.5 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase"
                  : "flex items-center gap-1.5 px-3 pt-2 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase"
              }
            >
              {/* The kind's colour from the Colours screen, as on its badge. */}
              <span
                aria-hidden="true"
                className="size-2 rounded-sm"
                style={{ backgroundColor: `var(--kind-${group.type}-fg)` }}
              />
              {NODE_LABELS[group.type].plural}
            </h3>
          )}

          <SortableGroup
            parentId={node.id}
            childType={group.type}
            variant={topLevel ? "cards" : "rows"}
            rows={group.items.map((child) => ({
              id: child.id,
              label: decodeEntities(child.title),
              content: (
                <NodeRow
                  node={child}
                  parentId={node.id}
                  siblingIds={group.items.map((item) => item.id)}
                  inherited={inherited}
                  inheritedFrom={inheritedFrom}
                >
                  <TreeView
                    node={child}
                    inherited={child.color ?? inherited}
                    // With nothing coloured above, "Use the unit's colour"
                    // names the parent, so the choice still reads.
                    inheritedFrom={
                      child.color || !inherited ? owner(child.type) : inheritedFrom
                    }
                  />
                </NodeRow>
              ),
            }))}
          />
        </section>
      ))}
    </div>
  );
}
