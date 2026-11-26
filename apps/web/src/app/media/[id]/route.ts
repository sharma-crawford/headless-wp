import { getAuthToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A lesson's attachment (a song, an image, a PDF), fetched on the reader's
 * behalf.
 *
 * WordPress keeps these files behind its own access check, which signs a reader
 * in with a WordPress cookie. A learner here is signed in with a token this app
 * holds, so a browser asking WordPress directly would be sent to wp-login. This
 * route asks WordPress with the reader's token instead and hands the bytes
 * back, so `<audio src>` and `<img src>` just work. WordPress still decides who
 * may have the file; nothing is checked or cached here.
 *
 * Byte ranges pass straight through: a browser seeks in a song, and Safari will
 * not play one from a server that cannot answer a range.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = await getAuthToken();
  const api = process.env.WORDPRESS_API_URL;

  if (!/^\d+$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  if (!token) {
    return new Response("Sign in to see this file.", { status: 401 });
  }

  if (!api) {
    return new Response("The course site is not configured.", { status: 500 });
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const range = request.headers.get("range");

  if (range) {
    headers.Range = range;
  }

  const upstream = await fetch(`${new URL(api).origin}/?pcle_download=${id}`, {
    headers,
    redirect: "manual",
    cache: "no-store",
  });

  // A redirect is WordPress sending a stranger to its login; a refusal is a refusal.
  if (upstream.status >= 300 && upstream.status < 400) {
    return new Response("Sign in to see this file.", { status: 401 });
  }

  if (!upstream.ok && upstream.status !== 206 && upstream.status !== 416) {
    return new Response(upstream.status === 403 ? "You do not have access to this file." : "Not found", {
      status: upstream.status === 403 ? 403 : 404,
    });
  }

  const out = new Headers({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });

  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "content-disposition"]) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }

  return new Response(upstream.body, { status: upstream.status, headers: out });
}
