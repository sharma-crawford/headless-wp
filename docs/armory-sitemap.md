# Armory: sitemap and plan

Status: **draft for review** (Edward, Rekha, Maria). Nothing here is built unless marked.

## The principle

From here on, we keep the site structure consistent, so that all program content
(creating, editing, deleting, pricing, adding images) can be managed in the
website itself, without writing code or needing Claude or ChatGPT.

The rule behind it: **if a course author needs to change it, it lives in WordPress
and is edited in the builder. If it needs a developer, it is a theme or a widget,
and there is a short, shared list of those.**

## Where we are today

The Armory shell (Castle, the nine course rooms, Dice, Simulator) and the course
platform (programs, modules, My Training, catalogue, webinars) are two sites
sharing a login.

| Problem | Evidence |
| --- | --- |
| Nine courses live in the repo, not WordPress | `components/study/courses/*` (quiz and study JSON), `course-assets/` (138 MB), `lib/study-courses.ts` (hardcoded programme IDs 179 to 671) |
| Editing a course needs a deploy | Questions, lessons and art are files in git; the builder cannot edit the rooms |
| Progress is not saved in the rooms | The rooms only call `/api/study/grade`, which returns answers and stores nothing |
| The rooms sit outside sell and subscribe | Castle lists them from a fixed list, not from the catalogue, plans or enrollment |
| Every course exists twice | Lessons as WP programs (drafts), interactive rooms in code |
| Two shells and two headers | Armory header on Castle, Dice, Simulator, rooms; main-site navigation on `/programs`, `/modules`, `/my-training`, `/webinars` |
| The immigration pages are outside the app | Static HTML in `public/castle-resources/`: no login, no shared header, links to `legal-renaissance.com` |
| Catalogue links remain in 7+ places | Home card, main nav, Castle, locked-course redirect, pricing, 404, access error |

WordPress already decides who may enter a room (access check per programme), so
plans and enrollment can gate these courses once they are real programs.

## Target model

1. **One shell.** One Armory header and theme on every learner-facing page,
   including the old course pages. Staff tools (Build, Reports, People, Plans,
   Colours) keep their current shell.
2. **WordPress owns every course.** The builder creates it. Plans, enrollment,
   progress and media all live in WP.
3. **Code only draws.** A course room is a **theme** (Viking, noir, infernal,
   tidewater, noble estates, fairy court, dojo, orbit, default) chosen per course in
   the builder. It renders data from WP. A few custom **widgets** (corporate-veil
   tabs, evidence admission flowchart) stay in code and are referenced from lesson
   content by key.
4. **The catalogue and the Library merge.** One list of courses, from WP. The
   course page is where people see what a course is, what it costs, and sign up
   or subscribe.

### Target sitemap

```
Armory (one header and theme on every page)
├── Discover (public)
│   ├── Courtyard, Library        all published courses, from WP
│   ├── Course page               what it is, price, sign up / enroll
│   ├── Pricing, plans            tiers per course
│   └── Webinars                  live and on demand
├── Learn (signed in)
│   ├── My Training               enrolled courses and progress
│   ├── Course room              themed, rendered from WP data
│   │   └── Lessons, quizzes      progress saved
│   └── Account
├── Practice and resources
│   └── Immigration tools         Dice, Simulator, court tour, ICE map,
│                                 Immigration 101, habeas primer (inside the shell)
└── Staff
    └── Build, Reports, People, Plans, Colours
```

### What lives where

| Thing | Lives in | Edited by |
| --- | --- | --- |
| Course, units, modules, lesson text | WordPress | Authors, in the builder |
| Quiz questions, answers, explanations | WordPress quizzes | Authors, in the builder |
| Art, songs, cover images | WordPress media library | Authors, in the builder |
| Who can open it, price shown | WordPress (plan and access settings per program) | Authors and administrators |
| Learner progress, quiz attempts | WordPress | Automatic |
| Room theme | A setting on the program, chosen from a short list | Authors |
| The themes and widgets themselves | Code | Developers |

## Phases

Each phase ends with something visible and leaves the site working. Estimates are
rough and assume the WordPress plugin can be changed.

### Phase 1: One shell and theme (about 1 to 2 days)
- Shared Armory header on Castle, Dice, Simulator, course rooms. **Done (PR #73).**
  Study room pages carry it but were not visually tested (behind login).
- Same header on the four static immigration pages.
- Castle, Dice and Simulator read the theme tokens instead of hardcoded fonts and colours.
- `/programs`, `/modules`, `/units`, `/quizzes`, `/my-training`, `/webinars`,
  `/pricing`, `/account` adopt the Armory header and theme.
- Done when: moving between any two learner pages never changes the header or fonts.

### Phase 2: Library is the catalogue (about 1 day)
- Castle's Library reads WP programs only. Delete the hardcoded nine-course list.
- One course page (today `/catalogue/:id`) with enroll and sign-up.
- Remove the stale catalogue links and the `/castle-preview` alias.
- Done when: publishing a program in the builder makes it appear in the Library
  with no deploy.

### Phase 3: Room themes come from WordPress (about 3 to 4 days for one generic room; more per bespoke layout)
- Plugin: a room-theme setting on programs, exposed by the API, with a control in
  the program builder.
- Fix the import: the script writes `program_format = 'course'`, but the plugin only
  knows `series` and `webinar`.
- Web: one room renders by theme from WP data. `/study/<slug>` redirects to the
  program. Remove `studyPrograms`.
- Widget registry: lesson content references a widget by key.
- Done when: Contracts renders from WP and looks like it does today.

### Phase 4: Content leaves the repo (about 2 to 3 days)
- Art and songs go to the WP media library and attach to modules. The builder
  accepts PDF, Word and images only, up to 4 MB each, so songs (`.m4a`, 4 to 5 MB)
  need audio types and a higher limit first. See [builder-guide.md](builder-guide.md).
- Rooms use the WP quizzes (446 questions are already imported as drafts).
- A study-mode endpoint for flashcards and "show answers", for enrolled learners
  only, because WP quizzes normally hide answers until attempted.
- Delete `quiz-data.json`, `study-data.json`, `course-assets/`, `/api/study/grade`,
  `/study-assets`.
- Note: deleting files stops the repo growing but does not shrink git history.
- Done when: an author edits a question in the builder and the change shows with no deploy.

### Phase 5: Progress, sign-up, enrollment (about 2 to 3 days)
- Self-completion for self-study programs. Today only staff mark completions.
- Quiz results and lesson progress saved from the rooms.
- Check the sign-up and enrollment flow end to end for a new learner.
- Reports include these courses.

### Phase 6: Plans and payment (last, as agreed)
- Per-program access and price set in the builder (the fields exist; price is a label today).
- Course-page call to action per plan.
- Payment provider integration.

Every phase that adds, moves or removes a page also updates `docs/ui-map.md`.

## Decisions

Decided (Rafael, 2026-11-26):

1. **Learner self-completion: yes.** Learners can mark their own progress in
   self-study programs. Proposed shape, not yet confirmed: a per-program setting,
   with instructor-marked staying the default for CLE credit. Unblocks Phase 5.
2. **Immigration tools: public.** The static pages, Dice and Simulator need no
   login. Moving them inside the shell (Phase 1) keeps them public.
3. **Front door: `/castle`.** Castle stays the Armory home. `/` is unchanged.

## Open decisions

4. **Header links.** After Phase 2 the header is Castle, Library, My Training or
   Sign in. Confirm "Library" replaces both "Course rooms" and "Catalogue". The
   Catalogue link is out of the header today; confirm that stays.
5. **Who owns what.** Suggested: Edward for room themes and widgets, Rekha for design
   sign-off, plugin work needs someone with WordPress access. To be confirmed.

## Risks

- **Fidelity.** Each room has a bespoke layout. A generic themed room first, then
  bespoke parts as widgets, keeps the look without nine one-off pages.
- **Content drift.** Until Phase 4, the rooms (repo) and the WP lessons both hold
  course content. Edit both, or freeze edits, during Phases 1 to 3.
- **Plugin work.** Phases 3 to 5 need WordPress plugin changes (room theme,
  study-mode endpoint, self-completion). Confirm who can ship them.
- **Public media.** The immigration pages stay public (decision 2), so nothing
  behind login may be embedded in them.

## Not in this plan

Payment provider choice, new course content, CLE accreditation, new themes.
