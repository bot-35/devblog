// * On retire le prerender pour build vercel
export const prerender = false;
import type { APIRoute } from "astro";

// Petit helper pour normaliser la réponse Last.fm
function mapTracks(raw: any[]) {
  return (raw ?? []).map((t) => ({
    title: t?.name ?? null,
    artist: t?.artist?.["#text"] ?? null,
    album: t?.album?.["#text"] ?? null,
    url: t?.url ?? null,
    image: (t?.image ?? []).at(-1)?.["#text"] || null, // plus grande vignette
    nowPlaying: t?.["@attr"]?.nowplaying === "true",
    date: t?.date?.uts ? Number(t.date.uts) : null,
  }));
}

export const GET: APIRoute = async () => {
  const apiKey = import.meta.env.LASTFM_API_KEY;
  const user = import.meta.env.LASTFM_USERNAME;

  if (!apiKey || !user) {
    return new Response(
      JSON.stringify({ error: "Missing LASTFM_API_KEY or LASTFM_USERNAME" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const LIMIT = 10;
  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks` +
    `&user=${encodeURIComponent(user)}` +
    `&api_key=${encodeURIComponent(apiKey)}` +
    `&format=json&limit=${LIMIT}`;

  try {
    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
      // Si rate limit (erreur 29) ou autre, on renvoie un code 503 + cache court
      return new Response(
        JSON.stringify({ error: "lastfm_error", status: res.status, body: text }),
        {
          status: res.status === 200 ? 503 : res.status,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, s-maxage=120, stale-while-revalidate=60",
          },
        }
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
      tracks,
    };

    // Cache côté edge/CDN : 10 min, avec SWR 5 min
    return new Response(JSON.stringify(payload), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, s-maxage=180, stale-while-revalidate=60"
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "network_error", message: String(err?.message ?? err) }),
      {
        status: 502,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "public, s-maxage=120, stale-while-revalidate=60",
        },
      }
    );
  }
};
