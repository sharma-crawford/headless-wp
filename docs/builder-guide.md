# The curriculum builder: how courses are made, and why every course goes through it

For anyone adding or changing courses: developers, and people working with
Claude or ChatGPT. It explains what the builder is, how a course moves through it,
and why the nine law-school rooms should come from it too.
See also [armory-sitemap.md](armory-sitemap.md) for the plan.

## The short version

- The **builder** (`/builder` in the app) is where courses are created and edited:
  titles, lessons, images, quizzes, access, catalogue listing, enrollment.
- It writes to **WordPress**. Everything else (My Training, progress, reports,
  enrollment, plans, catalogue, the course rooms) reads from the same records.
- Instructors edit in a web page. **No code, no deploy, no AI tool.**
- A course that lives in the repo instead can only be changed by a developer, and
  none of the features above can see it.

That last point is the whole reason. It is not about which tool a developer uses:
Claude or ChatGPT can edit code in either place just as well. It is about
everyone else who needs to change a course.

## What the builder edits

The curriculum is a tree. Every course has the same shape:

```
Programme            the course itself (cover, topics, credit hours, who can open it)
└── Unit             a section of the course
    └── Module       one lesson (body text, images, attached files)
        ├── Quiz         questions, answers, pass mark, optional completion gate
        ├── Scenario     a practice problem with a protected model answer
        └── Template     a downloadable or reference document
```

Webinars use the same tree with one unit and one module (the "Format" setting).

Because every course has the same shape, every course gets the same navigation,
the same progress bars, the same reports and the same access rules for free.
That consistency is what makes no-code editing possible.

## Making a course, step by step

1. Sign in and open **/builder**. Only instructors and administrators see it.
2. **New programme**: type a title. It starts as a draft.
3. On the programme page, add **units**, then **modules** inside them. Rename
   inline, drag to reorder.
4. Click a module to write its body. You can attach a document or image
   (PDF, Word, JPG, PNG, GIF, WebP; 4 MB each).
5. Add a **quiz** to a module: questions, correct answers, a pass mark, and
   whether passing is required to complete the module.
6. Open the programme's settings:
   - **In the catalogue**: cover image and topics.
   - **Who can open it** and **Included in**: which plans open it, and its price
     as shown.
   - **CLE credit hours** and **Format**.
7. **Publish** (nothing is visible to learners while it is a draft).
8. Under **Participants**, enroll people, or let plans and sign-up do it.
9. **Download backup** at any time. **Restore from a backup** brings a file back
   as a new draft programme and never changes anything that exists.

The full reference is in
[`apps/wordpress/plugins/platform-cle/docs/USER-GUIDE.md`](../apps/wordpress/plugins/platform-cle/docs/USER-GUIDE.md).

## How it works underneath

```
Builder (apps/web, /builder)
        │  plain text, never HTML
        ▼
Authoring REST API  (plugin: includes/rest-authoring.php)
        │  escapes it and turns it into WordPress blocks
        ▼
WordPress database  (programmes, units, modules, quizzes, progress, enrollment)
        ▲
        │  reads
Learner screens: My Training, programs, modules, quizzes, rooms, reports
```

- The **plugin owns all logic**; the web app only presents. This is the rule from
  the plugin README, and it still holds.
- The builder sends **plain text**. The server builds the markup, so an
  instructor cannot paste something unsafe, and content opens cleanly in wp-admin.
- Quizzes are **marked on the server** and answers are stripped before a
  participant receives a quiz.
- Files: [`rest-authoring.php`](../apps/wordpress/plugins/platform-cle/plugin/includes/rest-authoring.php)
  (the API), [`authoring-content.php`](../apps/wordpress/plugins/platform-cle/plugin/includes/authoring-content.php)
  (text to blocks), [`backup.php`](../apps/wordpress/plugins/platform-cle/plugin/includes/backup.php)
  (export and restore), [`plans.php`](../apps/wordpress/plugins/platform-cle/plugin/includes/plans.php)
  (plans and access), and `apps/web/src/app/builder/` (the screens).

## Why every course should go through it

| What you want | In the builder | Hardcoded in the repo |
| --- | --- | --- |
| Fix a typo in a question | An instructor edits it and saves | A developer changes a file and deploys |
| Add a lesson or an image | In the page | A code change |
| Students keep their progress | Saved per learner | Nothing records it |
| Quiz attempts and scores | Kept, shown to the learner, in reports | Not recorded |
| Sell it or include it in a plan | Plan and access settings on the programme | Not connected to plans |
| Show it in the catalogue and Library | Publish it | Listed by hand in code |
| Enroll a cohort, run a report | Existing screens | Not visible to them |
| Back it up or copy it | Download backup, Restore | Git history only |

## What the builder does not do yet

These are real gaps. Closing them is what the plan is for.

- **Audio.** Uploads accept PDF, Word and images only. The course songs (`.m4a`,
  4 to 5 MB each) need audio types and a higher size limit. Today's limit is 4 MB.
- **Themes.** A programme has no "room theme" setting yet. The Viking, noir,
  infernal and other looks are code (planned: a setting that picks from a short
  list of themes).
- **Custom widgets.** The corporate-veil tabs and the Evidence flowchart are
  React components. They stay in code and would be referenced by key from lesson
  content (planned).
- **Self-completion.** Participants do not mark modules complete; an instructor
  does. Self-study programs need an option for learners to record their own
  progress (planned, and a product decision).
- **Price is a label** ("$199 a year"), not a charged amount. Payment is built last.
- **Case briefs and glossary entries** have no block type of their own. They are
  ordinary module content today.
- **Program format** is `series` or `webinar`. The import script writes `course`,
  which the plugin does not know yet.

## Where the nine law-school rooms fit

The rooms are well made and their look stays. What changes is where the content
comes from.

| Room content today (repo) | Becomes (WordPress) |
| --- | --- |
| `study-data.json` sections | Units and modules |
| `quiz-data.json` questions | Quizzes with questions, answers, pass mark |
| Case briefs, glossary | Module body (and Scenarios where it fits) |
| Art in `course-assets/study-art` | Images attached to modules (cover for the programme) |
| Songs in `course-assets/study-songs` | Audio attached to modules (needs the audio gap closed) |
| Themed layout (Viking, noir, ...) | A theme chosen per programme, drawn by code |
| Custom exercises | Widgets referenced from lesson content |
| `lib/study-courses.ts` programme IDs | Removed: the room reads the programme itself |

Much of this is already done. `scripts/prepare-renaissance-import.py` converted
the nine courses into backup files and they were restored as draft programmes
(IDs 179 to 671, see [renaissance-courses.md](renaissance-courses.md)). They hold
172 sections and 446 questions. What is left is the theme, the media, and
reading the room from WordPress.

## Working on this with Claude or ChatGPT

Developers can use either tool on the plugin or the web app exactly as they would
anywhere else. Two things make it easier:

- **Local setup**: Docker. The plugin and theme are bind-mounted, so edits apply
  at once. See
  [`DEVELOPMENT.md`](../apps/wordpress/plugins/platform-cle/docs/DEVELOPMENT.md).
- **Bulk-creating a course**: ask the AI to produce a **backup file** (the
  versioned JSON that **Download backup** writes; `backup.php` is the authoritative
  shape, and the import script shows an example), then **Restore** it. It arrives
  as a new draft, nothing existing is touched, and an instructor can polish it in
  the builder afterwards. Generate content as data, not as code.

The builder is for the people who should not need an AI tool at all.

## Rules of thumb

1. If a course author needs to change it, it lives in WordPress and is edited in
   the builder.
2. If it needs a developer, it is a theme or a widget, and there is a short,
   shared list of those.
3. Every course has the same shape (programme, units, modules, quizzes). Variety
   comes from themes, not from different structures.
4. Never ship a course as files in the repo. Import it as a draft programme
   instead.
5. When you add, move or remove a page, update [ui-map.md](ui-map.md).
