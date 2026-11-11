"use client";

import { useMemo, useState } from "react";

import { Input } from "@pcle/ui/components/input";
import { cn } from "@pcle/ui/lib/utils";

import { decodeEntities } from "@/lib/html";
import type { CatalogueProgram } from "@/lib/types";

type Format = "all" | "series" | "webinar";

/**
 * Search and filters over the catalogue, entirely in the browser.
 *
 * The whole catalogue is one response and a few dozen cards at most, so
 * filtering locally answers instantly and needs no route per filter. The
 * cards themselves are rendered on the server and passed in, keyed by id.
 */
export default function CatalogueBrowser({
  programs,
  topics,
  cards,
}: {
  programs: CatalogueProgram[];
  topics: string[];
  cards: Record<number, React.ReactNode>;
}) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<Format>("all");
  const [topic, setTopic] = useState<string | null>(null);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return programs.filter((program) => {
      if (format !== "all" && program.format !== format) {
        return false;
      }

      if (topic && !program.topics.includes(topic)) {
        return false;
      }

      const haystack = decodeEntities(
        `${program.title} ${program.excerpt} ${program.topics.join(" ")}`
      ).toLowerCase();

      return words.every((word) => haystack.includes(word));
    });
  }, [programs, query, format, topic]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
        <label htmlFor="catalogue-search" className="sr-only">
          Search the catalogue
        </label>
        <Input
          id="catalogue-search"
          type="search"
          placeholder="Search by title, subject or topic"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 text-base"
        />

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Format">
          {(
            [
              ["all", "All formats"],
              ["series", "Courses"],
              ["webinar", "Webinars"],
            ] as const
          ).map(([value, label]) => (
            <Chip key={value} pressed={format === value} onClick={() => setFormat(value)}>
              {label}
            </Chip>
          ))}

          {topics.length > 0 && (
            <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block" />
          )}

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Topic">
              {topics.map((name) => (
                <Chip
                  key={name}
                  pressed={topic === name}
                  onClick={() => setTopic(topic === name ? null : name)}
                >
                  {name}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-zinc-500" aria-live="polite">
        {shown.length === programs.length
          ? `${programs.length} ${programs.length === 1 ? "programme" : "programmes"}`
          : `${shown.length} of ${programs.length} programmes`}
      </p>

      {shown.length > 0 ? (
        <ul className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((program) => (
            <li key={program.id}>{cards[program.id]}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600">
          Nothing matches.{" "}
          <button
            type="button"
            className="font-medium text-brand-700 underline-offset-4 hover:underline"
            onClick={() => {
              setQuery("");
              setFormat("all");
              setTopic(null);
            }}
          >
            Clear the filters
          </button>
        </p>
      )}
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-8 rounded-full border px-3.5 text-sm font-medium transition",
        pressed
          ? "border-brand-800 bg-brand-800 text-white"
          : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:text-zinc-950"
      )}
    >
      {children}
    </button>
  );
}
