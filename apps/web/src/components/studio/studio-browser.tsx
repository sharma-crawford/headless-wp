"use client";

import { useMemo, useState } from "react";

import { Input } from "@pcle/ui/components/input";
import { cn } from "@pcle/ui/lib/utils";

import { decodeEntities } from "@/lib/html";
import type { AuthoringProgram } from "@/lib/types";

type Filter = "all" | "published" | "drafts" | "webinars";

/**
 * Search and filters over the author's programmes, in the browser; the cards
 * are rendered on the server and passed in by id.
 */
export default function StudioBrowser({
  programs,
  cards,
}: {
  programs: AuthoringProgram[];
  cards: Record<number, React.ReactNode>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = {
    all: programs.length,
    published: programs.filter((p) => p.status === "publish").length,
    drafts: programs.filter((p) => p.status !== "publish").length,
    webinars: programs.filter((p) => p.format === "webinar").length,
  };

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return programs.filter((program) => {
      if (filter === "published" && program.status !== "publish") return false;
      if (filter === "drafts" && program.status === "publish") return false;
      if (filter === "webinars" && program.format !== "webinar") return false;

      const title = decodeEntities(program.title).toLowerCase();
      return words.every((word) => title.includes(word));
    });
  }, [programs, query, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="studio-search" className="sr-only">
          Search your programmes
        </label>
        <Input
          id="studio-search"
          type="search"
          placeholder="Search your programmes"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-10 w-72 max-w-full"
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Show">
          {(
            [
              ["all", "All"],
              ["published", "Published"],
              ["drafts", "Drafts"],
              ["webinars", "Webinars"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "h-8 rounded-full border px-3.5 text-sm font-medium transition",
                filter === value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
              )}
            >
              {label} <span className={filter === value ? "text-brand-200" : "text-zinc-400"}>{counts[value]}</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length > 0 ? (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((program) => (
            <li key={program.id}>{cards[program.id]}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600">
          No programmes match.
        </p>
      )}
    </div>
  );
}
