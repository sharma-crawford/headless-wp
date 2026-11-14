"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@pcle/ui/components/button";
import { cn } from "@pcle/ui/lib/utils";

/**
 * One link in the site header, marked when it is where the reader is.
 *
 * "Where the reader is" means the path or anything under it, so a module
 * deep inside a programme still lights My Training… except that the
 * participant's screens (/programs, /modules, /units, /quizzes) are not
 * under /my-training at all. They are listed here as belonging to it, which
 * is the only place that fact needs to live.
 *
 * A client component only for usePathname(); the header around it, and the
 * decision about which links exist, stay on the server.
 */
const BELONGS_TO: Record<string, string[]> = {
  "/my-training": ["/programs", "/modules", "/units", "/quizzes"],
};

function isCurrent(pathname: string, href: string): boolean {
  const prefixes = [href, ...(BELONGS_TO[href] ?? [])];

  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function NavLink({
  href,
  label,
  external = false,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const pathname = usePathname();
  const current = !external && isCurrent(pathname, href);

  return (
    <Button
      variant="ghost"
      className={cn(
        "relative h-16 rounded-none px-3 text-[0.95rem] font-medium text-zinc-600 hover:bg-transparent hover:text-brand-800",
        /* An underline on the header's bottom edge, the way a tab marks itself. */
        "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent",
        current && "text-brand-800 after:bg-brand-500"
      )}
      aria-current={current ? "page" : undefined}
      nativeButton={false}
      render={external ? <a href={href} /> : <Link href={href} />}
    >
      {label}
    </Button>
  );
}
