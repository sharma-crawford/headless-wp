# UI map — a code for every screen and popup

Every screen, popup and dropdown menu in the web app has a short code, shown in
small grey text. Put the code at the start of a change request so everyone is
looking at the same thing:
*"P10 Program builder: move Add module above the list"*.

| Prefix | What it is | Where the code shows | Example |
|---|---|---|---|
| `P` | A screen, with its own address | Bottom-right corner of the window | `P10 Program builder` |
| `M` | A popup over the screen | Top-right corner of the popup | `M1 Delete confirmation` |
| `D` | A dropdown menu opened from a button | Last line of the menu, on the right | `D2 Item actions menu` |

Sections that open in place on a screen (such as *Restore from a backup* on P9)
are part of that screen and use its code.

In the code (`apps/web/src/components/screen-code.tsx`):

- **Screens**: the `code` prop on `PageShell` (`components/page-shell.tsx`), or
  `<PageCode>` directly on the two screens without the shared header (P0, P1).
- **Popups and dropdowns**: `<PopupCode>` as the last child of the popup's or
  menu's content.

When a new screen, popup or menu ships, give it the next free number of its
prefix and add it here. Never reuse or renumber a code, so old requests keep
pointing at the right thing.

## Pages

| Code | Name | Address | Who sees it | File (`apps/web/src/`) |
|---|---|---|---|---|
| P0 | Sign in | `/login` | Anyone signed out | `app/login/page.tsx` |
| P1 | Menu | `/` | Everyone; where signing in lands | `app/page.tsx` |
| P2 | My Training (incl. upcoming live sessions) | `/my-training` | Participants | `app/my-training/page.tsx` |
| P3 | Program | `/programs/:id` | Participants (enrolled) | `app/programs/[id]/page.tsx` |
| P4 | Module | `/modules/:id` | Participants (enrolled) | `app/modules/[id]/page.tsx` |
| P5 | Unit | `/units/:id` | Participants (enrolled) | `app/units/[id]/page.tsx` |
| P6 | Quiz | `/quizzes/:id` | Participants (enrolled) | `app/quizzes/[id]/page.tsx` |
| P7 | Your account (incl. My colours) | `/account` | Everyone | `app/account/page.tsx` |
| P8 | People | `/people` | Authors (changing a role takes an administrator) | `app/people/page.tsx` |
| P9 | Build | `/builder` | Authors | `app/builder/page.tsx` |
| P10 | Program builder | `/builder/programs/:id` | Authors | `app/builder/programs/[id]/page.tsx` |
| P11 | Item editor (module, unit or quiz) | `/builder/nodes/:id` | Authors | `app/builder/nodes/[id]/page.tsx` |
| P12 | Reports | `/reports` | Authors | `app/reports/page.tsx` |
| P13 | Program report | `/reports/:id` | Authors | `app/reports/[id]/page.tsx` |
| P14 | Participant report | `/reports/:id/participants/:userId` | Authors | `app/reports/[id]/participants/[userId]/page.tsx` |
| P15 | Not allowed | any of the above, when WordPress refuses access | Anyone without access | `components/access-error.tsx` |
| P16 | Colours | `/colours` | Authors (the defaults and display take an administrator) | `app/colours/page.tsx` |
| P17 | Webinars (retired) | `/webinars` | Redirects to My Training (P2). A webinar is a course in the Library; the live sessions a reader has coming up are on My Training | `app/webinars/page.tsx` |
| P18 | Catalogue | `/catalogue` | Redirects to the Library, `/castle#list` (P24) | `app/catalogue/page.tsx` |
| P19 | Catalogue programme | `/catalogue/:id` | Anyone, signed in or not | `app/catalogue/[id]/page.tsx` |
| P20 | Plans | `/plans` | Administrators | `app/plans/page.tsx` |
| P21 | Pricing | `/pricing` | Anyone, signed in or not | `app/pricing/page.tsx` |
| P22 | Not found | any address with nothing at it | Anyone | `app/not-found.tsx` |

| P23 | Castle preview alias | `/castle-preview` | Redirects to `/castle` (P24) | `app/castle-preview/page.tsx` |
| P24 | Castle: the entrance, and its views `#courtyard`, `#list` (the Library: every course), `#council` (Council Chamber: rights and family resources), `#training` (Training Hall: the court tour, Dice, the Simulator) | `/castle` | Public | `app/castle/page.tsx` |
| P25 | Forgot your password | `/forgot-password` | Anyone | `app/forgot-password/page.tsx` |
| P26 | Choose a password | `/reset-password?login=&key=` | Anyone with the emailed link | `app/reset-password/page.tsx` |

## Popups

| Code | Name | Opened from | File (`apps/web/src/`) |
|---|---|---|---|
| M1 | Delete confirmation | D2 → Delete | `components/builder/row-actions.tsx` (`NodeMenu`) |

## Dropdowns

| Code | Name | Opened from | File (`apps/web/src/`) |
|---|---|---|---|
| D1 | Add menu (new module, unit or quiz) | **Add** on a row in P10 | `components/builder/row-actions.tsx` (`AddChildMenu`) |
| D2 | Item actions menu (publish, delete) | **⋯** on a row in P10 | `components/builder/row-actions.tsx` (`NodeMenu`) |
| D3 | Colour menu (32 swatches) | The coloured dot beside a title in P10, P11 or P16 | `components/colours/swatch-menu.tsx` |
