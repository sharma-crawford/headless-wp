/**
 * Small facts about a live session's time, shared by the hub, the unit
 * screen and the calendar file.
 *
 * Times arrive as ISO 8601 with the site's offset ("2026-11-13T18:00:00-06:00").
 * Dates and clock times are read off that text rather than converted, so the
 * hub shows the time the session was scheduled in — the site's timezone —
 * whatever timezone the server rendering it happens to run in.
 */

/** Join opens this long before the start: time to find headphones. */
const JOIN_OPENS_MINUTES = 15;

type SessionTimes = { starts_at: string; ends_at?: string; duration?: number };

function startMs(session: SessionTimes): number {
  return session.starts_at ? Date.parse(session.starts_at) : NaN;
}

function endMs(session: SessionTimes): number {
  if (session.ends_at) {
    return Date.parse(session.ends_at);
  }

  return startMs(session) + (session.duration ?? 60) * 60_000;
}

type Phase = "scheduled" | "opening" | "live" | "ended" | "undated";

/** Where a session is, at a given moment. */
function phaseAt(session: SessionTimes, now: number): Phase {
  const start = startMs(session);

  if (Number.isNaN(start)) {
    return "undated";
  }

  if (now >= endMs(session)) {
    return "ended";
  }

  if (now >= start) {
    return "live";
  }

  return now >= start - JOIN_OPENS_MINUTES * 60_000 ? "opening" : "scheduled";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** The calendar date and clock time as scheduled, read off the ISO text. */
function scheduled(iso: string): {
  month: string;
  day: number;
  weekday: string;
  time: string;
} | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match.map(Number);
  // The weekday of a calendar date does not depend on any timezone.
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const twelve = hour % 12 === 0 ? 12 : hour % 12;

  return {
    month: MONTHS[month - 1],
    day,
    weekday: WEEKDAYS[weekday],
    time: `${twelve}:${String(minute).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`,
  };
}

/** "in 3 days", "in 2 h 5 min", "in 12 min". */
function untilText(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000));

  if (minutes < 60) {
    return `in ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    const rest = minutes % 60;
    return rest ? `in ${hours} h ${rest} min` : `in ${hours} h`;
  }

  const days = Math.round(hours / 24);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

/** Where a session's calendar file is served (app/webinars/sessions/[id]/calendar). */
function calendarHref(id: number): string {
  return `/webinars/sessions/${id}/calendar`;
}

export { JOIN_OPENS_MINUTES, calendarHref, endMs, phaseAt, scheduled, startMs, untilText };
export type { Phase, SessionTimes };
