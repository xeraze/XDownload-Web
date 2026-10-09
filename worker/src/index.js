const WINDOW_MS = 60_000;
const WRITE_MAX = 6;
const READ_MAX = 90;
const PASS = [
  "content-type",
  "content-disposition",
  "content-length",
  "content-range",
  "accept-ranges",
  "cache-control",
  "etag",
  "last-modified",
];

const FWD = ["range", "if-range", "content-type"];

const PART_MAX = 10 * 1024 * 1024;
const PARTS_MAX = 12;

const buckets = new Map();

function allow(key, max) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.start >= WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    if (buckets.size > 4096) {
      for (const [k, v] of buckets) {
        if (now - v.start >= WINDOW_MS) buckets.delete(k);
      }
    }
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Range",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function merge(target, headers) {
  for (const [name, value] of Object.entries(headers)) target.set(name, value);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }

    const origin = request.headers.get("origin");
    let allowedOrigin = null;
    if (origin) {
      try {
        const allowed = env.SITE_ORIGIN ? new URL(env.SITE_ORIGIN).origin : url.origin;
        if (new URL(origin).origin === allowed) allowedOrigin = origin;
      } catch {
        allowedOrigin = null;
      }
      if (!allowedOrigin) return new Response("Forbidden", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      const headers = new Headers();
      if (allowedOrigin) merge(headers, corsHeaders(allowedOrigin));
      return new Response(null, { status: 204, headers });
    }

    const write = request.method === "POST";
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    if (!allow(`${write ? "w" : "r"}:${ip}`, write ? WRITE_MAX : READ_MAX)) {
      return new Response("Too many requests", { status: 429 });
    }

    const partMatch = url.pathname.match(/^\/api\/enhance-part\/([A-Za-z0-9-]{8,64})\/(\d{1,2})$/);
    if (partMatch) {
      if (!env.UPLOADS) return new Response("Misconfigured", { status: 500 });
      const idx = Number(partMatch[2]);
      if (idx >= PARTS_MAX) return new Response("Bad part", { status: 400 });
      const key = `p:${partMatch[1]}:${idx}`;
      const withCors = (headers) => {
        if (allowedOrigin) merge(headers, corsHeaders(allowedOrigin));
        return headers;
      };
      if (request.method === "PUT") {
        const buf = await request.arrayBuffer();
        if (buf.byteLength === 0 || buf.byteLength > PART_MAX) {
          return new Response("Bad size", { status: 413 });
        }
        await env.UPLOADS.put(key, buf, { expirationTtl: 1200 });
        return new Response(JSON.stringify({ ok: true, size: buf.byteLength }), {
          status: 200,
          headers: withCors(new Headers({ "content-type": "application/json" })),
        });
      }
      if (request.method === "GET") {
        const value = await env.UPLOADS.get(key, "arrayBuffer");
        if (value === null) return new Response("Not found", { status: 404 });
        return new Response(value, {
          status: 200,
          headers: withCors(
            new Headers({ "content-type": "application/octet-stream", "cache-control": "no-store" }),
          ),
        });
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (!env.ORIGIN) {
      return new Response("Misconfigured", { status: 502 });
    }
    const enhance = url.pathname === "/api/enhance";
    const target = enhance ? env.ENHANCE_ORIGIN || env.ORIGIN : env.ORIGIN;

    const headers = new Headers();
    headers.set("X-Api-Key", env.API_KEY || "");
    for (const name of FWD) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }

    const upstream = await fetch(new URL(url.pathname + url.search, target), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });

    const out = new Headers();
    for (const name of PASS) {
      const value = upstream.headers.get(name);
      if (value) out.set(name, value);
    }
    if (allowedOrigin) merge(out, corsHeaders(allowedOrigin));

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: out,
    });
  },
};
