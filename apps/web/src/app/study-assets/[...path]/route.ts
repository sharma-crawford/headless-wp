import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { getMyTraining, getProgram } from "@/lib/wordpress";
import { studyPrograms } from "@/lib/study-courses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const types: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav" };

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = [...(await params).path];
  const course = Object.hasOwn(studyPrograms, parts[0]) ? parts.shift() : undefined;
  let allowed = false;
  try {
    if (course) { await getProgram(studyPrograms[course], true); allowed = true; }
    else {
      const training = await getMyTraining();
      allowed = training.programs.some(p => Object.values(studyPrograms).includes(p.id));
      if (!allowed) { await getProgram(studyPrograms["business-associations"], true); allowed = true; }
    }
  } catch { /* The same WordPress access rules protect the shared course media. */ }
  if (!allowed) return new Response("Course access required", { status: 403 });
  if (!parts.length || !["study-art", "study-songs"].includes(parts[0]) || parts.some(p => p === "." || p === ".." || /[\\/\0]/.test(p))) return new Response("Not found", { status: 404 });
  const file = path.join(process.cwd(), "course-assets", ...parts);
  const mime = types[path.extname(file).toLowerCase()];
  if (!mime) return new Response("Not found", { status: 404 });
  let size;
  try { const info = await stat(file); if (!info.isFile()) throw Error(); size = info.size; } catch { return new Response("Not found", { status: 404 }); }
  const headers = new Headers({ "Content-Type": mime, "Accept-Ranges": "bytes", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
  const range = request.headers.get("range");
  let start = 0, end = size - 1;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    if (!match[1]) start = Math.max(0, size - Number(match[2]));
    else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  }
  headers.set("Content-Length", String(end - start + 1));
  const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream<Uint8Array>;
  return new Response(stream, { status: range ? 206 : 200, headers });
}
