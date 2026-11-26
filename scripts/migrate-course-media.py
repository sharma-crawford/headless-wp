#!/usr/bin/env python3
"""Moves the nine law-school courses' art and songs into WordPress.

Uploads each file to the module it belongs to and puts a `[[media:N]]` line in
that module's body, so the song is a player and the picture is an image in the
lesson. Talks to WordPress's own API directly (not through the web app), so the
4 MB cap on the web app's requests does not apply; WordPress's PHP upload limit
does.

SAFE BY DEFAULT. Without --apply it only reads WordPress and prints what it
would do: files, sizes, which module each goes to, and anything it cannot place.
Nothing is written. With --apply it uploads, and:

  * it never deletes anything, here or in the repo;
  * it is safe to run again: a file already uploaded (by its SHA-256, recorded
    in the state file) is reused, and a token already in a body is not added twice;
  * it stops at the first error rather than leaving a half-attached course.

Needs only the Python 3 standard library.

  # See the plan against a local WordPress
  WP_PASSWORD=... python3 scripts/migrate-course-media.py \\
      --wp http://localhost:8080 --user admin

  # Do it, one course first
  WP_PASSWORD=... python3 scripts/migrate-course-media.py \\
      --wp https://platform.example.org --user someone --only contracts --apply

The password is read from the WP_PASSWORD environment variable, never from the
command line, so it does not land in shell history.
"""
import argparse
import hashlib
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
COURSES = REPO / "apps/web/src/components/study/courses"
MUSIC = REPO / "apps/web/src/components/study/music/catalog.json"

# docs/renaissance-courses.md and apps/web/src/lib/study-courses.ts
PROGRAMS = {
    "business-associations": 179,
    "criminal-procedure": 221,
    "evidence": 275,
    "professional-responsibility": 386,
    "property": 479,
    "criminal-law": 524,
    "contracts": 569,
    "torts": 620,
    "civil-procedure": 671,
}

ART = re.compile(r"study-art/([A-Za-z0-9._-]+\.(?:png|jpe?g|webp|gif))")
SONG_TYPES = {".m4a", ".mp3"}


def study_data(subject):
    """A course's sections, from the data the interactive room reads."""
    folder = COURSES / subject
    path = folder / "study-data.json"
    if not path.exists():  # business-associations keeps its data one level up
        path = COURSES / "study-data.json"
    return json.loads(path.read_text())["sections"]


def art_in(value):
    """Every study-art filename mentioned anywhere inside one section, in order."""
    found = []
    text = json.dumps(value)
    for name in ART.findall(text):
        if name not in found:
            found.append(name)
    return found


class WordPress:
    def __init__(self, base, user, password):
        self.api = base.rstrip("/") + "/wp-json"
        self.token = self._post_json(
            "/jwt-auth/v1/token", {"username": user, "password": password}, auth=False
        )["token"]

    def _request(self, method, route, body=None, headers=None, auth=True):
        request = urllib.request.Request(self.api + route, data=body, method=method)
        for name, value in (headers or {}).items():
            request.add_header(name, value)
        if auth:
            request.add_header("Authorization", "Bearer " + self.token)
        try:
            with urllib.request.urlopen(request, timeout=300) as response:
                return json.loads(response.read().decode())
        except urllib.error.HTTPError as error:
            detail = error.read().decode(errors="replace")[:400]
            raise SystemExit(f"WordPress refused {method} {route}: {error.code} {detail}")

    def _post_json(self, route, data, auth=True):
        return self._request("POST", route, json.dumps(data).encode(), {"Content-Type": "application/json"}, auth)

    def get(self, route):
        return self._request("GET", route)

    def patch(self, route, data):
        return self._request("PATCH", route, json.dumps(data).encode(), {"Content-Type": "application/json"})

    def upload(self, node_id, path):
        """POSTs one file as multipart, streaming nothing clever: files are under 10 MB."""
        boundary = uuid.uuid4().hex
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        head = (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="file"; filename="{path.name}"\r\n'
            f"Content-Type: {mime}\r\n\r\n"
        ).encode()
        body = head + path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
        return self._request(
            "POST",
            f"/platform-cle/v1/authoring/nodes/{node_id}/media",
            body,
            {"Content-Type": f"multipart/form-data; boundary={boundary}"},
        )


def modules_by_title(tree):
    """Title -> module id, over a programme's tree. A repeated title is ambiguous and left out."""
    seen, ambiguous = {}, set()

    def walk(node):
        for child in node.get("children") or []:
            if child.get("type") == "pcle_module":
                title = child["title"]
                if title in seen:
                    ambiguous.add(title)
                seen[title] = int(child["id"])
            walk(child)

    walk(tree)
    return {title: id_ for title, id_ in seen.items() if title not in ambiguous}, ambiguous


def build_plan(subject, assets):
    """What belongs where, from the repo alone: [(section title, kind, label, file)]."""
    sections = study_data(subject)
    catalog = [s for s in json.loads(MUSIC.read_text()) if s["subject"] == subject]
    by_section = {s.get("id"): s for s in sections}
    items, missing = [], []

    for section in sections:
        names = art_in(section)
        # Business Associations names its section art after the section id,
        # rather than listing it in the data.
        conventional = f"ba-{section.get('id')}.png"
        if subject == "business-associations" and (assets / "study-art" / conventional).exists() and conventional not in names:
            names.append(conventional)
        for name in names:
            file = assets / "study-art" / name
            if file.exists():
                items.append((section["title"], "art", name, file))
            else:
                missing.append((f"art {name}: file not in {assets / 'study-art'}",))

    for song in catalog:
        for index, version in enumerate(song["versions"], start=1):
            file = None
            for ext in SONG_TYPES:
                candidate = assets / "study-songs" / subject / f"{version['id']}{ext}"
                if candidate.exists():
                    file = candidate
            label = f"{song['title']} (version {index})"
            for section_id in song["sectionIds"][:1]:  # a song goes to its first section
                section = by_section.get(section_id)
                if section is None:
                    missing.append((f"song {label}: no section {section_id}",))
                elif file is None:
                    missing.append((f"song {label}: file {version['id']}",))
                else:
                    items.append((section["title"], "song", label, file))
    return items, missing


def human(n):
    return f"{n / 1_000_000:.1f} MB"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--wp", required=True, help="WordPress site URL, e.g. https://platform.example.org")
    parser.add_argument("--user", required=True)
    parser.add_argument("--assets", default=str(REPO / "apps/web/course-assets"))
    parser.add_argument("--only", choices=sorted(PROGRAMS), action="append", help="One course (repeatable). Default: all nine.")
    parser.add_argument("--program", action="append", default=[], metavar="SUBJECT=ID", help="Override a programme id.")
    parser.add_argument("--state", default=str(REPO / "scripts/.migrate-course-media.state.json"))
    parser.add_argument("--apply", action="store_true", help="Actually upload. Without it, nothing is written.")
    args = parser.parse_args()

    password = os.environ.get("WP_PASSWORD")
    if not password:
        sys.exit("Set WP_PASSWORD in the environment.")

    host = urllib.parse.urlparse(args.wp)
    if host.scheme != "https" and host.hostname not in ("localhost", "127.0.0.1"):
        sys.exit("Refusing to send a password over plain http to " + args.wp)

    programs = dict(PROGRAMS)
    for override in args.program:
        subject, _, id_ = override.partition("=")
        programs[subject] = int(id_)

    assets = Path(args.assets)
    state_path = Path(args.state)
    state = json.loads(state_path.read_text()) if state_path.exists() else {}

    wp = WordPress(args.wp, args.user, password)
    print(("APPLYING to " if args.apply else "DRY RUN against ") + args.wp + "\n")

    grand = {"files": 0, "bytes": 0, "unplaced": 0}

    for subject in args.only or sorted(programs):
        program_id = programs[subject]
        tree = wp.get(f"/platform-cle/v1/authoring/programs/{program_id}/tree")
        modules, ambiguous = modules_by_title(tree)
        items, missing = build_plan(subject, assets)

        print(f"== {subject}  (programme {program_id}: {tree.get('title')!r})")
        placed = []
        for title, kind, label, file in items:
            if title in modules:
                placed.append((modules[title], title, kind, label, file))
            else:
                reason = "title appears more than once" if title in ambiguous else "no module with that title"
                missing.append((f"{kind} {label}: {reason} ({title!r})",))
        size = sum(f.stat().st_size for *_, f in placed)
        print(f"   {len(placed)} files to place, {human(size)}; {len(missing)} not placed")
        for entry in missing:
            print("   NOT PLACED:", entry[0])
        grand["files"] += len(placed)
        grand["bytes"] += size
        grand["unplaced"] += len(missing)

        if not args.apply:
            for module_id, title, kind, label, file in placed[:6]:
                print(f"   - {kind:4} {label}  ->  module {module_id} {title!r}  ({human(file.stat().st_size)})")
            if len(placed) > 6:
                print(f"   ... and {len(placed) - 6} more")
            continue

        by_module = {}
        for module_id, title, kind, label, file in placed:
            sha = hashlib.sha256(file.read_bytes()).hexdigest()
            key = f"{args.wp}|{sha}"
            if key not in state:
                print(f"   uploading {file.name} ({human(file.stat().st_size)}) ...", flush=True)
                media = wp.upload(module_id, file)
                state[key] = {"id": media["id"], "token": media["token"]}
                state_path.write_text(json.dumps(state, indent=2))
                print(f"   uploaded {file.name} -> media {media['id']}")
            by_module.setdefault(module_id, []).append((kind, label, state[key]["token"]))

        for module_id, lines in by_module.items():
            node = wp.get(f"/platform-cle/v1/authoring/nodes/{module_id}")
            if not node.get("editable", True):
                sys.exit(f"Module {module_id} cannot be edited as text; stopped before changing it.")
            body = node.get("body", "")
            additions = []
            for kind, label, token in lines:
                if token in body:
                    continue
                if kind == "song":
                    additions.append(f"### Study song: {label}")
                additions.append(token)
            if additions:
                wp.patch(f"/platform-cle/v1/authoring/nodes/{module_id}", {"body": (body.rstrip() + "\n\n" + "\n\n".join(additions)).strip()})
                print(f"   module {module_id}: added {sum(1 for a in additions if a.startswith('[['))} item(s)")
        print()

    print(f"\nTotal: {grand['files']} files, {human(grand['bytes'])}; {grand['unplaced']} not placed.")

    # Files in the repo that no section refers to: room-level art (hero, cover,
    # comic sheets). Listed so nobody assumes they moved; they are attached by
    # hand, for instance as a programme's cover image.
    if not args.only:
        planned = set()
        for subject in programs:
            planned |= {file for *_, file in build_plan(subject, assets)[0]}
        everything = {p for p in assets.rglob("*") if p.is_file()}
        left = sorted(everything - planned)
        print(f"\n{len(left)} of {len(everything)} files in {assets} belong to no section and are not handled here:")
        for path in left[:20]:
            print("   ", path.relative_to(assets))
        if len(left) > 20:
            print(f"    ... and {len(left) - 20} more")
    if not args.apply:
        print("Nothing was written. Add --apply to do it.")


if __name__ == "__main__":
    main()
