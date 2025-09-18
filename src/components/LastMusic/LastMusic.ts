class AstroLastMusic extends HTMLElement {
  #timer: number | null = null;
  #backoff = 0;
  #lastKey = "";
  #onVisibility?: () => void;

  connectedCallback() {
    const root = this.querySelector("div") as HTMLDivElement; // le conteneur interne
    const artistEl = root.querySelector<HTMLElement>("[data-artist]")!;
    const timeEl   = root.querySelector<HTMLElement>("[data-time]")!;
    const LIMIT = Number(this.dataset.limit || 1);

    const vinyl  = document.getElementById("lastmusic_vinyl");
    const status = document.getElementById("lastmusic_status");
    const prefersNoMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        vinyl.classList.replace("brightness-10", "brightness-100");
        status.classList.add("animate-bounce", "text-red-500");
      } else {
        vinyl.classList.remove("animate-[spin_1800ms_linear_infinite]");
        vinyl.classList.replace("brightness-100", "brightness-10");
        status.classList.remove("animate-bounce", "text-red-500");
      }
    };

    // Re-sélectionne toujours le titre courant (h3 ou a) pour éviter le nœud "fantôme"
    const getTitleEl = () => root.querySelector<HTMLElement>("h3, a")!;

    const paint = (t: any) => {
      let titleEl = getTitleEl(); // ref FRAÎCHE à chaque paint
      const wantLink = Boolean(t?.url);

      if (wantLink && titleEl.tagName !== "A") {
        const a = document.createElement("a");
        a.className = titleEl.className + " hover:opacity-90";
        a.target = "_blank";
        a.rel = "noopener";
        a.href = t.url;
        a.textContent = t?.title || "Sans titre";
        titleEl.replaceWith(a);
        titleEl = a; // 🔑 on met à jour la ref
      } else if (!wantLink && titleEl.tagName === "A") {
        const h3 = document.createElement("h3");
        h3.className = titleEl.className.replace(" hover:opacity-90", "");
        h3.textContent = t?.title || "Sans titre";
        titleEl.replaceWith(h3);
        titleEl = h3; // 🔑 mise à jour
      } else {
        // même type d’élément, on met juste à jour le contenu/URL
        titleEl.textContent = t?.title || "Sans titre";
        if (wantLink) (titleEl as HTMLAnchorElement).href = t.url;
      }

      artistEl.textContent = t?.artist || "Artiste inconnu";
      timeEl.textContent   = t?.nowPlaying ? "👨🏼‍🎤 LIVE !" : timeAgo(t?.date);
      applyAnimations(Boolean(t?.nowPlaying));
    };

    const REFRESH_MS = 3 * 60 * 1000;

    const fetchData = async () => {
      const ac = new AbortController();
      const kill = setTimeout(() => ac.abort(), 8000);
      const res = await fetch("/api/lastfm.json", { cache: "no-store", signal: ac.signal });
      clearTimeout(kill);

      let data: any;
      try { data = await res.json(); } catch { throw new Error("Réponse non JSON"); }
      if (!res.ok) throw new Error("Erreur endpoint: " + (data?.error || res.status));

      return (data?.tracks ?? []).slice(0, LIMIT);
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
        this.#backoff = Math.min(this.#backoff ? this.#backoff * 2 : 5 * 60 * 1000, 30 * 60 * 1000);
      }
    };

    const planNext = () => {
      const base = this.#backoff || REFRESH_MS;
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
