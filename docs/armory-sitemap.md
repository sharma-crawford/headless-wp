# Armory: sitemap and plan

Status: **in progress** (Edward, Rekha, Maria). Updated 2026-11-27. Phases 1 and 2
are done and live on `main`. Phases 3 to 5 are built in code and merged, but most of
it needs the WordPress plugin deployed before it exists on the live site. Phase 6
(payment) has not started. See [Status snapshot](#status-snapshot-2026-11-27).

## The principle

From here on, we keep the site structure consistent, so that all program content
(creating, editing, deleting, pricing, adding images) can be managed in the
website itself, without writing code or needing Claude or ChatGPT.

The rule behind it: **if a course author needs to change it, it lives in WordPress
and is edited in the builder. If it needs a developer, it is a theme or a widget,
and there is a short, shared list of those.**

## Where we started

The table below is the baseline before Phase 1. What has changed since is in the
[status snapshot](#status-snapshot-2026-11-27) further down.

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

## Status snapshot, 2026-11-27

Merged to `main`: PRs #72 to #94. Phase 2b is in review (#95).

### The site now

| Zone | Pages | Who |
| --- | --- | --- |
| Discover | Castle `/castle` (front door), Library `/castle#list`, course page `/catalogue/:id`, Pricing, Webinars | Public |
| Learn | Sign in, Forgot password, Choose password, My Training, Programme (themed), Module and quiz, Account | Signed in (the first three: anyone) |
| Practice tools | Dice, Simulator, court tour, ICE map, Immigration 101, habeas primer | Public |
| Staff | Build, Reports, People, Plans, Colours | Authors and administrators |
| Still in code | Nine law-school rooms under `/study/<subject>` | Enrolled learners |

One Armory header (`Castle`, then the reader's menu with My Training, Account and the
staff paths by role) on every page, including the static immigration pages. `/catalogue` and
`/castle-preview` redirect. Full list of addresses: [ui-map.md](ui-map.md).

### By phase

| Phase | State | What is in `main` |
| --- | --- | --- |
| 1. One shell and theme | **Done** | Shared header, one set of colour and font tokens, learner pages themed, static pages on the tokens (#73 to #81) |
| 2. Library is the catalogue | **Done** | Library has the catalogue's cards, covers, topics, filters and search; redirects; header is Castle, Library (#82, #83). The nine hardcoded courses stay listed until Phase 3 removes them |
| 3. Room themes from WordPress | **Partly done** | Theme setting per programme and a themed frame (#84). Not done: one generic room that replaces the nine bespoke ones, and `/study/<slug>` redirecting |
| 4. Content leaves the repo | **Built, not run** | Study mode for quizzes (#85), whole songs by direct upload (#86), widgets by key (#87), song player and `/media/<id>` (#88), migration script (#89). Not done: moving the files to production, rooms on WordPress quizzes, deletions |
| 5. Progress, sign-up, enrollment | **Mostly built** | Self-completion (#90), emails and password pages (#91), room answers saved to WordPress quizzes (#92). Not confirmed: Reports for these courses |
| 6. Plans and payment | **Not started** | Last, as agreed |

### Not true yet

1. **The plugin is not deployed.** Until it is, the live site has no room theme,
   study mode, direct upload, widgets, song player, self-completion or new emails.
   Needs someone with server access.
2. **Email may not arrive.** No SMTP is configured, and the new-account and password
   emails depend on it. Needs a choice (the organisation's Microsoft 365, or a
   transactional provider) and DNS records. See the plugin's `ROADMAP.md`.
3. **Content is still in two places.** The nine rooms hold it in code; WordPress holds
   the lessons as drafts. The 138 MB of art and songs are not in WordPress yet
   ([course-media-migration.md](course-media-migration.md)). Needs the plugin
   deployed, PHP's upload limit checked (8 MB or more), and a backup of each programme.
4. **Nothing has been deleted.** `quiz-data.json`, `study-data.json`, `course-assets/`
   and `/api/study/grade` are still there, and stay until the rooms read WordPress.
   That needs a go-ahead at that moment.

### Small debts

- The static header (`public/castle-resources/armory/`) is a copy of the React one and
  is kept in step by hand.
- The cream and olive content colours in the court tour, Immigration 101 and the ICE
  map are still hardcoded.
- Signed-in and staff screens were checked by CI's end-to-end tests, not by eye in a
  browser; mobile was spot-checked on the Simulator and Dice only.
- The colour-menu end-to-end tests had a timing problem on slow runners; fixed by
  waiting for the menu to open (#82, #89).

### Needs your decision or go-ahead

- Confirm self-completion as built: per programme, off by default, never open for a
  programme with CLE credit hours (decision 1).
- Who deploys the plugin, and who sets up email (open decision 5, owners).
- When to run the migration script on production, one course first.
- When to switch the rooms to WordPress quizzes and delete the old files.

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

### What each place is

Decided 2026-11-27. The Castle is the entrance; the three rooms answer three
different needs, and nothing is in two places.

| Place | What it is for | Holds | Does not hold |
| --- | --- | --- | --- |
| **Castle** (`/castle`) | The entrance and the map. Orients a visitor and sends them to a room. Public. | The courtyard, three doors, a strip of what is live soon | Content of its own |
| **Library** | Learn. Every course, to choose from and sign up for. Public to browse. | All courses from WordPress, in two formats (several lessons, or one video, live or recorded), free or paid, with filters and one search. Free ones such as Immigration 101 included. The nine law-school courses until Phase 3 moves them | Reference material, practice tools, a person's own progress |
| **Council Chamber** | Consult. Information and help to have at hand, for families and for practitioners. Public. | Rights and family resources, the habeas primer, the ICE detention map, in plain language, grouped "For families" and "For practitioners", each saying who it is for | Courses (it may link to Immigration 101, which lives in the Library) |
| **Training Hall** | Practice. Active exercises. Public. | The court tour, Roll the Dice, the Simulator | Courses, My Training, webinars |
| **Header** | Me. The way back to the Castle, and what is theirs. | Castle, then the reader's menu (their name; under it My Training, Account, the staff paths by role, Log out), or Sign in. It does not repeat the Castle's doors | The Library, Council Chamber or Training Hall |

Two ideas sit behind this: **a webinar is a course** whose format is one video, with
an optional live date (not a separate kind of thing), and **"mine" lives in the
header**, not in a room.

### Target sitemap

```
Armory (one header and theme on every page)
├── Castle                        the entrance: three doors, what is live soon
│   ├── Library                   learn: all courses (from WP), free and paid,
│   │   │                         several lessons or one video, live soon
│   │   └── Course page           what it is, price, sign up / enroll
│   ├── Council Chamber           consult: rights and family resources,
│   │                             habeas primer, ICE map (families, practitioners)
│   └── Training Hall             practice: court tour, Dice, Simulator
├── Me (header, signed in)
│   ├── My Training               enrolled courses and progress
│   ├── Course room               themed, rendered from WP data
│   │   └── Lessons, quizzes      progress saved
│   └── Account
├── Pricing, plans                tiers per course
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

### Phase 1: One shell and theme (about 1 to 2 days) [done]
- Shared Armory header on Castle, Dice, Simulator, course rooms. **Done (PR #73).**
  Study room pages carry it but were not visually tested (behind login).
- Same header on the four static immigration pages. **Done (static copy in
  `public/castle-resources/armory/`; keep in sync with `armory-nav`).**
- Theme tokens: `public/castle-resources/armory/tokens.css`, taken from the Castle
  interface. **Castle, the header, Dice, Simulator, the static header and the shared
  resource styles (court tour, Immigration 101, ICE map), the habeas primer
  (its alert and wrong-answer rust stay), `/login` and the learner pages read them
  (done).** Still hardcoded: the pages' own cream and olive content colours in
  court tour, Immigration 101 and the ICE map.
- `/programs`, `/modules`, `/units`, `/quizzes`, `/my-training`, `/webinars`,
  `/pricing`, `/account` adopt the Armory header and theme.
- Done when: moving between any two learner pages never changes the header or fonts.

### Phase 2: Library is the catalogue (about 1 day) [done]
- Castle's Library reads WP programs only. Delete the hardcoded nine-course list.
- The Library list view now carries the catalogue's cards, covers, topics, format
  filters and search (**done**); `/catalogue` redirects to it. Enrolled programs
  not in the public catalogue appear only in My Training.
- One course page (today `/catalogue/:id`) with enroll and sign-up.
- Remove the stale catalogue links. `/castle-preview` now redirects to `/castle`
  (**done**; kept as a redirect so old bookmarks work).
- Done when: publishing a program in the builder makes it appear in the Library
  with no deploy.

### Phase 2b: One Library, three rooms (about 1 to 2 days, web only) [done]

Found in the 2026-11-27 walkthrough: there are two "Library" views with different
content (the header's page `#list` and the courtyard's room `#library`), the same
course has two doors that lead to different places (via an empty `#program-ID` page,
or straight to `/catalogue/:id`), there are two search boxes on one page, the
immigration resources are split three ways, and the same thing has five names.

- The courtyard's "The Library" door and the header's "Library" open the **same
  page**. The `#library` room is removed.
- No middle pages. A course card goes straight to its course page
  (`/catalogue/:id`, which already says "Go to the course" when enrolled). The
  `#program-ID` and `#study-X` pages are removed; a law-school card goes straight to
  `/study/X` until Phase 3.
- **Immigration 101** is shown in the Library as a free course (a "Free" mark); it
  stays public. Until it is a WordPress course it is listed by hand.
- **Council Chamber:** the habeas primer, the Rights and Family Resources, the ICE
  map and a link to Immigration 101, in two groups, "For families" and "For
  practitioners". **Training Hall:** the court tour, Dice and the Simulator only;
  My Training and Webinars buttons come out.
- **Webinars are courses.** "Webinars" leaves the header and `/webinars` redirects.
  Built a little differently from first written: the old page was the reader's own
  calendar (it also listed the live sessions of series programmes, for what they
  are enrolled in), so those sessions now sit on **My Training** ("Upcoming live
  sessions", with Join and Add to calendar), and the Library has the public "Live
  soon" filter. The live date, reminder emails and calendar file are unchanged; the
  reminder email still links to `/webinars`, which redirects, so the plugin is
  untouched.
- **Header:** Castle, then the reader's menu: their name, and under it My Training,
  Account, the staff paths by role and Log out (Sign in when signed out). Library is
  no longer in the header, because the Castle's door already opens it; Castle takes
  the reader back to the doors from any page.
- **One search** on the Library for courses and for the resources it still lists.
- **One name per thing.** "Library" everywhere: no "Course rooms", no "Catalogue" on
  the course page's trail, no "Your course room" on pages that are not a room.
  Every "back" goes to the same place.
- **The courtyard labels are small plaques** that scale with the picture and sit
  beside each door, not over it; the whole plaque is the link.
- **The courtyard picture and its four labels.** A fourth door, "My Training", sits
  on a lectern with an open study journal in the courtyard art (an edit of the
  existing picture, `public/castle/courtyard-training.webp`; the old
  `courtyard.png` is kept in the repo, unused). It is not a room: it is the
  reader's own page, so its label is drawn from their data: the next module to
  do and the next live session; signed out it says "Sign in to see your
  training". All four labels read the same way: the place, what it is for
  ("Learn", "Consult", "Practice"), one action.
- Updates `docs/ui-map.md` (P17 becomes a redirect) and the webinar end-to-end tests.
- Done when: from the Castle, a visitor can answer "where do I learn, where do I look
  something up, where do I practice" without finding the same thing in two places.

### Phase 3: Room themes come from WordPress (about 3 to 4 days for one generic room; more per bespoke layout) [partly done]
- Plugin: a room-theme setting on programs, exposed by the API, with a control in
  the program builder. **Done (PR for this step, not yet deployed).** The list is
  `pcle_room_themes()` in `formats.php` and `lib/room-themes.ts`; keep them in step.
- Fix the import: the script wrote `program_format = 'course'`, but the plugin only
  knows `series` and `webinar`. **Done:** the script now writes `series`.
- Web, first cut **done**: a programme with a theme is drawn inside that room's frame
  (palette, hero band, accent buttons) on its course page, from WP data. The lesson
  bodies are still the plain imported text; the bespoke layouts return as widgets
  (Phase 4). Rooms at `/study/<slug>` stay until they match.
- Web: one room renders by theme from WP data. `/study/<slug>` redirects to the
  program. Remove `studyPrograms`.
- Widget registry: lesson content references a widget by key. **Done (plugin not
  yet deployed):** `[[widget:key]]` on a line of its own in a lesson body; the app
  draws the component registered under that key (`components/widgets/registry.tsx`),
  and an unknown key draws nothing. Widgets so far: `corporate-veil-tabs`, `business-associations-practice`,
  `evidence-admission-flowchart`. (The per-room topic guides are not widgets: a
  generic room has its own outline.) Adding a
  widget is a developer's job: a component and one line in the registry.
- Done when: Contracts renders from WP and looks like it does today.

### Phase 4: Content leaves the repo (about 2 to 3 days) [built, not run]
- Art and songs go to the WP media library and attach to modules. The builder
  now takes MP3 and M4A, and files over 4 MB go from the browser straight to
  WordPress by a one-time address (**done**, plugin not yet deployed; the limit is
  then the server's own PHP upload limit, still to be checked on the host). See
  [builder-guide.md](builder-guide.md).
- Songs play in the lesson: an audio attachment is an audio player, and lesson
  files are fetched through the app's `/media/<id>` route with the reader's own
  token, because WordPress's file check wants a WordPress login a learner here does
  not have (images and PDFs attached to lessons had the same problem). The plugin
  now answers byte ranges, which Safari needs to play audio at all. **Done (plugin
  not yet deployed).**
- A migration script moves the art and songs into WordPress: [course-media-migration.md](course-media-migration.md).
  Dry run by default, never deletes, tested locally, **not yet run on production**.
- Rooms use the WP quizzes (446 questions are already imported as drafts).
- A study-mode endpoint for flashcards and "show answers", for enrolled learners
  only, because WP quizzes normally hide answers until attempted. **Done in the
  plugin (not yet deployed):** `GET /quizzes/<id>/study`, opt-in per quiz with a
  checkbox in the quiz editor, and never for a quiz that gates completion.
- Finding: the 4 MB limit on songs is the web app's request cap (Vercel and
  `bodySizeLimit`), not the plugin's. Audio types alone will not fix it; uploads
  over 4 MB need a chunked path (web sends parts, the plugin assembles them).
- Delete `quiz-data.json`, `study-data.json`, `course-assets/`, `/api/study/grade`,
  `/study-assets`.
- Note: deleting files stops the repo growing but does not shrink git history.
- Done when: an author edits a question in the builder and the change shows with no deploy.

### Phase 5: Progress, sign-up, enrollment (about 2 to 3 days) [mostly built]
- Self-completion for self-study programs. **Done (plugin not yet deployed):** a
  per-program setting, off by default, on the programme's Details tab (Progress).
  Closed for a programme that carries CLE credit hours (refused when enabling, and
  closed again if hours are added later), so a certificate never rests on a
  learner's own tick. A learner's own completions are recorded with no instructor
  against them, so Reports can tell them apart.
- Quiz results saved from the rooms. **Done in the web app, best effort:** after the
  room marks an answer, `/api/study/grade` also submits it as an attempt on the
  matching WordPress quiz (the section's module and its practice quiz, as the
  migration made them), so it counts in the learner's record and in Reports. If
  the programme is not published yet, or a section has no module or quiz, that
  section is skipped and the room works as before. Checked locally against a
  Contracts fixture: 1 of 2 right was recorded as 1 of 2. Lesson progress (marking
  modules) stays with Progress above.
- Check the sign-up and enrollment flow end to end for a new learner. **Walked
  through locally; fixed (plugin not yet deployed).** Matriculating an address with
  no account made an account and sent two WordPress emails that sent the learner to
  WordPress, not the app. Now: the "set your password" email and the enrolment email
  link to the app (`PCLE_APP_URL`, default production), the app has "Forgot your
  password?" (`/forgot-password`) and the page the link opens (`/reset-password`),
  and the sign-in page says the email address works. Sign-up is still by invitation
  (decided: payment last).
- Reports include these courses.

### Phase 6: Plans and payment (last, as agreed) [not started]
- Per-program access and price set in the builder (the fields exist; price is a label today).
- Course-page call to action per plan.
- Payment provider integration.

Every phase that adds, moves or removes a page also updates `docs/ui-map.md`.

## Decisions

Decided (Rafael, 2026-11-26):

1. **Learner self-completion: yes.** Learners can mark their own progress in
   self-study programs. Built as proposed: a per-program setting, off by default,
   and never open for a programme with CLE credit hours (instructor-marked stays
   the rule for credit). To confirm: that this is the shape you want.
2. **Immigration tools: public.** The static pages, Dice and Simulator need no
   login. Moving them inside the shell (Phase 1) keeps them public.
3. **Front door: `/castle`.** Castle stays the Armory home. `/` is unchanged.
4. **Header links: Library.** "Library" replaces both "Course rooms" and "Catalogue"
   (done). Later superseded: the header is now Castle and the reader's menu, and
   the Library is the Castle's door (2026-11-27).

Decided (Rafael, 2026-11-27), numbered after the open decision below so no number
is reused:

6. **Council Chamber is for families and practitioners both.** Plain language, and
   each resource says who it is for.
7. **Immigration 101 is a free course.** It lives in the Library with a "Free" mark.
8. **Webinars are courses.** A course in the one-video format, with an optional live
   date. One catalogue, no separate Webinars place.
9. **"Mine" lives in the header.** My Training and Account are in the header, not in
   a room. The Training Hall is practice only.

## Open decisions

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
