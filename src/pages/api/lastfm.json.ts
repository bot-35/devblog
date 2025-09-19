// ✅ route dynamique (jamais prérendue)
export const prerender = false;

import type { APIRoute } from "astro";

function mapTracks(raw: any[]) {
  return (raw ?? []).map((t) => ({
    title: t?.name ?? null,
    artist: t?.artist?.["#text"] ?? null,
    album: t?.album?.["#text"] ?? null,
    url: t?.url ?? null,
    image: (t?.image ?? []).at(-1)?.["#text"] || null,
    nowPlaying: t?.["@attr"]?.nowplaying === "true",
    date: t?.date?.uts ? Number(t.date.uts) : null,
  }));
}

// 🛡️ headers zéro cache (navigateur + CDN Vercel)
const noCacheHeaders = {
  "content-type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  // Vercel priorise ce header pour son CDN :
  "CDN-Cache-Control": "max-age=0, s-maxage=0, stale-while-revalidate=0",
  // (compat optionnelle)
  "Vercel-CDN-Cache-Control": "max-age=0, s-maxage=0, stale-while-revalidate=0",
};

export const GET: APIRoute = async () => {
  const apiKey = import.meta.env.LASTFM_API_KEY;
  const user = import.meta.env.LASTFM_USERNAME;

  if (!apiKey || !user) {
    return new Response(
      JSON.stringify({ error: "Missing LASTFM_API_KEY or LASTFM_USERNAME" }),
      { status: 500, headers: noCacheHeaders }
    );
  }

  const LIMIT = 1; // 🎯 un seul titre
  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
    `&user=${encodeURIComponent(user)}` +
    `&api_key=${encodeURIComponent(apiKey)}` +
    `&format=json&limit=${LIMIT}`;

  try {
    const res = await fetch(url, { cache: "no-store" }); // on évite aussi le cache intermédiaire
    const text = await res.text();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "lastfm_error", status: res.status, body: text }),
        { status: res.status === 200 ? 503 : res.status, headers: noCacheHeaders }
      );
    }

    const data = JSON.parse(text);
    const tracks = mapTracks(data?.recenttracks?.track ?? []);
    const payload = {
      source: "lastfm",
      username: user,
      updatedAt: new Date().toISOString(),
      updatedAtTs: Date.now(),
      count: tracks.length,
      tracks, // ← contient max 1 élément
    };

    return new Response(JSON.stringify(payload), { headers: noCacheHeaders });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "network_error", message: String(err?.message ?? err) }),
      { status: 502, headers: noCacheHeaders }
    );
  }
};
