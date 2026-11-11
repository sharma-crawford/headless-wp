import { decodeEntities } from "@/lib/html";
import { endMs, startMs } from "@/lib/sessions";
import { getWebinars } from "@/lib/wordpress";

/**
 * GET /webinars/sessions/:id/calendar — one session as an .ics file.
 *
 * Built here from the hub's own data rather than served by WordPress: the
 * hub has already decided which sessions this reader may see, so a session
 * not in it is answered with a 404, exactly as if it did not exist.
 *
 * The join link goes in the event, so it is in the reader's calendar when
 * the reminder fires — the moment they actually need it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let session;

  try {
    session = (await getWebinars()).upcoming.find(
      (candidate) => candidate.id === Number(id)
    );
  } catch {
    return new Response("Sign in to add this session to your calendar.", {
      status: 401,
    });
  }

  if (!session || !session.starts_at) {
    return new Response("No such session.", { status: 404 });
  }

  const title = decodeEntities(
    session.program.format === "webinar" ? session.program.title : session.title
  );
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://armory.thepen-and-swordkc.org";
  const details = new URL(session.href, site).toString();
  const description = [
    session.join_url ? `Join: ${session.join_url}` : "The join link will be on The Armory.",
    `Details: ${details}`,
  ].join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Armory//Webinars//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:session-${session.id}@armory`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(startMs(session))}`,
    `DTEND:${stamp(endMs(session))}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(session.join_url || details)}`,
    `URL:${escape(session.join_url || details)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="session-${session.id}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}

/** UTC in the basic format calendars expect: 20261113T000000Z. */
function stamp(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 text escaping. */
function escape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\;");
}

/** RFC 5545 line folding: no line longer than 75 octets. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);

  if (bytes.length <= 75) {
    return line;
  }

  const parts: string[] = [];
  let current = "";

  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74;

    if (new TextEncoder().encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }

  parts.push(current);
  return parts.join("\r\n ");
}
