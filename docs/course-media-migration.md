# Moving the law-school courses' art and songs into WordPress

`scripts/migrate-course-media.py` uploads the files in `apps/web/course-assets/`
to the modules they belong to, and puts a `[[media:N]]` line in each module's
body, so a song is a player and a picture is an image in the lesson.

**It has not been run against production.** It was tested on a local WordPress
with Contracts (16 pictures) and Evidence (13 files, 56.6 MB, with songs), and a
second run changed nothing.

## What it does and does not do

- Dry run by default. Without `--apply` it only reads WordPress and prints the plan.
- Never deletes anything, in WordPress or in the repo.
- Safe to run again: a file already uploaded (by SHA-256, kept in a state file) is
  reused, and a token already in a body is not added twice.
- Stops at the first error. Nothing it did stays half-attached: each module is
  updated after its files are up.
- Places **83 of the 103** files: section pictures, and songs on their section's
  module. The other 20 are room-level art (comic sheets, heroes, covers) that
  belong to no section; the script lists them at the end of a dry run. Attach
  those by hand, for instance as a programme's cover image.
- Songs whose files are not in `course-assets/` (only Evidence's are) are listed
  as "not placed", not guessed.
- Modules are found by **title**: a section's title must equal the title of one
  module in the programme. The import created them that way. A title that appears
  twice is reported, not guessed.

## Before you run it

1. **Deploy the plugin** (this branch's plugin changes included). Without it
   WordPress refuses MP3 and M4A, and the m4a songs (MP4 containers) are refused
   until the fix in this change is live.
2. **Check the host's PHP upload limit**: `upload_max_filesize` and
   `post_max_size` of at least 8 MB (the largest song is 6.9 MB).
3. Use an account that may edit these programmes (an administrator).
4. Take a backup of each programme (Download backup in the builder) first.

## Running it

The password is read from the environment, never the command line.

```bash
# See the plan
WP_PASSWORD=... python3 scripts/migrate-course-media.py --wp https://YOUR-WORDPRESS --user YOUR-USER

# One course first
WP_PASSWORD=... python3 scripts/migrate-course-media.py --wp https://YOUR-WORDPRESS --user YOUR-USER --only contracts --apply
```

`--program subject=ID` overrides a programme id if the ids in
[renaissance-courses.md](renaissance-courses.md) are not the ones on that site.

## After it

Open a lesson as a learner: the pictures and songs load through the app's
`/media/<id>` route. Then the files in `course-assets/` are no longer needed by
the rooms that read WordPress. **Deleting them is a separate step and is not
done by this script.**
