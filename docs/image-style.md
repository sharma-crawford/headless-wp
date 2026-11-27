# Armory pictures: style guide and what exists

For Rekha to approve before more are made. The pictures are AI-generated, in one style,
and the site says so where it matters (the Dice already captions its scenes "AI-generated").

## The style

One paragraph, used at the start of every picture request so they read as one set:

> Warm painterly digital illustration in the style of a romantic Gothic Revival castle
> scene: golden-hour light, rich saturated colours, detailed stonework and warm wood,
> soft depth of field. A deep navy banner with a white laurel-wreath emblem hangs on
> the wall. No people, no text, no letters, no logos.

- **The laurel banner** is the thread through every picture: it is on the Castle's
  courtyard, so it ties a cover to the Castle.
- **No people, no real places, no text.** Scenes, rooms and objects only. Nothing that
  depicts clients, immigration enforcement or a real person.
- **Each course has a mood** that matches its room theme: Contracts is the infernal bar
  (plum and crimson), Evidence is noir case files (amber, charcoal, teal), Criminal
  Procedure is Viking Law, Professional Responsibility is the fairy court, Property is
  the noble estates, Criminal Law is the tidewater docket, Torts is Tort Station,
  Civil Procedure is the procedure dojo. Immigration 101 is a welcoming first-day classroom.

## Sizes and files

- Covers: 3:2, saved at 960 px wide as WebP (about 80 KB), in `apps/web/public/castle/covers/`,
  named after the course (`contracts.webp`). A card crops it to a wide strip.
- A WordPress programme's cover is set in the builder (cover image, up to 4 MB), not here.

## What exists

| Picture | State |
| --- | --- |
| Castle courtyard with the lectern (My Training) | Done, in use |
| Cover: Contracts (infernal bar) | Done, in use |
| Cover: Immigration 101 (welcoming classroom) | Done, in use |
| Covers: the other seven law-school courses | Not made |
| A plain fallback cover for programmes without one | Not made |
| An interior picture for each place (Library, Council Chamber, Training Hall, My Training) | Not made: the headers use crops of the courtyard |

## Limits to know

- The image service charges credits per picture (about 12 each) and ran out after two
  covers. More need credits added, or another source.
- The service cannot hold a style fixed between pictures: each is a fresh draw, so the
  style paragraph above and a person choosing from the results are what keep them alike.
- Course art in `apps/web/course-assets/` is behind each course's login and is **not**
  used for covers, which are public.
