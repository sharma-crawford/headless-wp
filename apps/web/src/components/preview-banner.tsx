import Link from "next/link";
import { EyeIcon } from "lucide-react";

/**
 * Says, on every screen of a preview, that this is a preview — and the way
 * back to the builder.
 *
 * A slim bar rather than a panel: the point of previewing is to see the
 * screen as a participant does, and a block of text above it is the one
 * thing a participant never sees.
 */
export default function PreviewBanner({
  programmeId,
}: {
  programmeId?: number;
}) {
  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-brand-900 px-4 py-2.5 text-sm text-brand-100"
    >
      <EyeIcon aria-hidden="true" className="size-4 text-amber-300" />
      <span>
        <span className="font-semibold text-white">Previewing as a participant.</span>{" "}
        Your own progress doesn&apos;t count here, quiz gates are closed, and
        drafts are shown and marked.
      </span>

      <Link
        href={programmeId ? `/builder/programs/${programmeId}` : "/builder"}
        className="ml-auto font-semibold text-amber-300 hover:text-amber-200"
      >
        Leave preview →
      </Link>
    </div>
  );
}
