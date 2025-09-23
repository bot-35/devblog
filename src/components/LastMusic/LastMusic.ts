// src/scripts/astro-lastmusic.ts
class AstroLastMusic extends HTMLElement {
  #timer: number | null = null;
  #backoff = 0;
  #lastKey = "";
  #onVisibility?: () => void;

  connectedCallback() {
    const API_KEY = import.meta.env.PUBLIC_LASTFM_API_KEY as string | undefined;
    if (!API_KEY) {
      console.error("PUBLIC_LASTFM_API_KEY manquante (voir .env / Vercel)");
      return;
    }

    const USER = this.dataset.user || "bot-35";
    const LIMIT = Number(this.dataset.limit || 1);
    const BASE_REFRESH = Number(this.dataset.interval || 30000); // 30s par défaut (live)
    const prefersNoMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Structure DOM existante
    const root = this.querySelector("div") as HTMLDivElement; // conteneur interne
    const artistEl = root.querySelector<HTMLElement>("[data-artist]")!;
    const timeEl   = root.querySelector<HTMLElement>("[data-time]")!;
    const vinyl  = document.getElementById("lastmusic_vinyl");
    const imageIdle = vinyl?.querySelector("img");
    const imageOnLive = vinyl?.querySelector("img:nth-of-type(2)");
    const ondeDerriereImageVinyl = vinyl?.querySelector("span");
    const status = document.getElementById("lastmusic_status");

    const timeAgo = (uts?: number | string) => {
      if (!uts) return "";
      const mins = Math.floor((Date.now() - Number(uts) * 1000) / 60000);
      if (mins < 1) return "à l’instant";
      if (mins < 60) return `il y a ${mins} min`;
      const h = Math.floor(mins / 60);
      return `il y a ${h} h`;
    };

    const applyAnimations = (isPlaying: boolean) => {
      if (!vinyl || !status) return;
      if (isPlaying && !prefersNoMotion) {
        vinyl.classList.add("animate-[spin_1800ms_linear_infinite]");
        vinyl.classList.replace("brightness-40", "brightness-100");
        imageIdle?.classList.replace("block","hidden");
        imageOnLive?.classList.replace("hidden","block");
        ondeDerriereImageVinyl?.classList.replace("animate-[ping_3800ms_ease-out_infinite]","animate-[ping_1300ms_ease-out_infinite]");
        status.classList.add("animate-bounce", "text-red-500");
      } else {
        vinyl.classList.remove("animate-[spin_1800ms_linear_infinite]");
        imageOnLive?.classList.replace("block","hidden");
        imageIdle?.classList.replace("hidden","block");
        vinyl.classList.replace("brightness-100", "brightness-40");
        ondeDerriereImageVinyl?.classList.replace("animate-[ping_1300ms_ease-out_infinite]","animate-[ping_3800ms_ease-out_infinite]");
        status.classList.remove("animate-bounce", "text-red-500");
      }
    };

    // Re-sélectionne toujours le titre courant (h3 ou a)
    const getTitleEl = () => root.querySelector<HTMLElement>("h3, a")!;

    const paint = (t: { title: string; artist: string; url?: string; nowPlaying?: boolean; date?: number }) => {
      let titleEl = getTitleEl();
      const wantLink = Boolean(t?.url);

      if (wantLink && titleEl.tagName !== "A") {
        const a = document.createElement("a");
        a.className = titleEl.className + " hover:opacity-90";
        a.target = "_blank";
        a.rel = "noopener";
        a.href = t.url!;
        a.textContent = t?.title || "Sans titre";
        titleEl.replaceWith(a);
        titleEl = a;
      } else if (!wantLink && titleEl.tagName === "A") {
        const h3 = document.createElement("h3");
        h3.className = titleEl.className.replace(" hover:opacity-90", "");
        h3.textContent = t?.title || "Sans titre";
        titleEl.replaceWith(h3);
        titleEl = h3;
      } else {
        titleEl.textContent = t?.title || "Sans titre";
        if (wantLink) (titleEl as HTMLAnchorElement).href = t.url!;
      }

      artistEl.textContent = t?.artist || "Artiste inconnu";
      timeEl.textContent   = t?.nowPlaying ? "👨🏼‍🎤 LIVE !" : timeAgo(t?.date);
      applyAnimations(Boolean(t?.nowPlaying));
    };

    // --- Fetch Last.fm côté client ---
    const buildUrl = (n = LIMIT) => {
      const u = new URL("https://ws.audioscrobbler.com/2.0/");
      u.searchParams.set("method", "user.getrecenttracks");
      u.searchParams.set("user", USER);
      u.searchParams.set("api_key", API_KEY);
      u.searchParams.set("format", "json");
      u.searchParams.set("limit", String(n));
      u.searchParams.set("extended", "1"); // nom d'artiste propre + images
      return u.toString();
    };

    type RawTrack = {
      name?: string;
      artist?: { name?: string; ["#text"]?: string };
      url?: string;
      date?: { uts?: string };
      ["@attr"]?: { nowplaying?: string };
    };

    const mapTrack = (r: RawTrack) => {
      const now = r?.["@attr"]?.nowplaying === "true";
      const uts = now ? undefined : Number(r?.date?.uts);
      return {
        title: r?.name ?? "Sans titre",
        artist: r?.artist?.name ?? r?.artist?.["#text"] ?? "Artiste inconnu",
        url: r?.url || undefined,
        nowPlaying: now,
        date: uts,
      };
    };

    const fetchData = async () => {
      const ac = new AbortController();
      const kill = setTimeout(() => ac.abort(), 8000);
      const res = await fetch(buildUrl(LIMIT), { cache: "no-store", signal: ac.signal });
      clearTimeout(kill);

      let data: any;
      try { data = await res.json(); } catch { throw new Error("Réponse non JSON"); }
      if (!res.ok || !data?.recenttracks) {
        throw new Error("Erreur Last.fm: " + (data?.message || res.status));
      }
      const list = Array.isArray(data.recenttracks.track) ? data.recenttracks.track : [];
      return list.map(mapTrack);
    };

    const refresh = async () => {
      if (document.hidden) return;
      try {
        const tracks = await fetchData();
        if (!tracks.length) {
          const titleEl = getTitleEl();
          titleEl.textContent = "Aucune donnée disponible";
          artistEl.textContent = "";
          timeEl.textContent = "";
          applyAnimations(false);
          this.#backoff = 0;
          return;
        }

        const t = tracks[0];
        const key = `${t?.title}::${t?.artist}::${t?.date || (t?.nowPlaying ? "now" : "")}`;
        if (key !== this.#lastKey) {
          paint(t);
          this.#lastKey = key;
        } else if (!t?.nowPlaying) {
          timeEl.textContent = timeAgo(t?.date);
        }
        this.#backoff = 0;
      } catch (e) {
        console.warn(e);
        // backoff exponentiel (5 min → 10 → … → 30 max)
        this.#backoff = Math.min(this.#backoff ? this.#backoff * 2 : 5 * 60 * 1000, 30 * 60 * 1000);
      }
    };

    const planNext = () => {
      const base = this.#backoff || BASE_REFRESH;
      const jitter = Math.floor(Math.random() * 30_000) - 15_000;
      clearTimeout(this.#timer!);
      this.#timer = window.setTimeout(async () => {
        await refresh();
        planNext();
      }, base + jitter);
    };

    this.#onVisibility = () => {
      if (!document.hidden) {
        if (this.#timer) clearTimeout(this.#timer);
        refresh().finally(planNext);
      }
    };
    document.addEventListener("visibilitychange", this.#onVisibility);

    // Go!
    refresh().finally(planNext);
  }

  disconnectedCallback() {
    if (this.#timer) clearTimeout(this.#timer);
    if (this.#onVisibility) document.removeEventListener("visibilitychange", this.#onVisibility);
  }
}

if (!customElements.get("astro-lastmusic")) {
  customElements.define("astro-lastmusic", AstroLastMusic);
}
