import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { Button } from "@pcle/ui/components/button";

import PageShell from "@/components/page-shell";

/**
 * Not found (P22): an address with nothing at it — a mistyped link, or a
 * programme that is no longer published.
 *
 * Inside the usual frame, so the header still offers the way on.
 */
export default function NotFound() {
  return (
    <PageShell code="P22">
      <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <span
          aria-hidden="true"
          className="mx-auto grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700"
        >
          <CompassIcon className="size-5" />
        </span>

        <h1 className="mt-4 text-2xl font-semibold text-zinc-950">There&apos;s nothing here</h1>

        <p className="mt-3 text-zinc-600">
          The link may be mistyped, or what it pointed to is no longer
          published.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button nativeButton={false} render={<Link href="/" />}>
            Go to the menu
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/catalogue" />}>
            Browse the catalogue
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
