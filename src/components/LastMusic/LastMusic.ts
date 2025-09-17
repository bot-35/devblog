    class AstroLastMusic extends HTMLElement {
      #timer = null;
      #backoff = 0;
      #lastKey = "";
      #onVisibility;

      connectedCallback() {
        const root = this.querySelector("div");
        const titleEl = root.querySelector("h3, a") || root.querySelector("h3");
        const artistEl = root.querySelector("p:nth-of-type(1)");
        const timeEl = root.querySelector("p:nth-of-type(2)");
        const LIMIT = Number(this.dataset.limit || 1);

        const vinyl = document.getElementById("lastmusic_vinyl");
        const status = document.getElementById("lastmusic_status");
        const prefersNoMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        this.#onVisibility = () => {
          if (!document.hidden) {
            clearTimeout(this.#timer);
            refresh().finally(planNext);
          }
        };
        document.addEventListener("visibilitychange", this.#onVisibility);
        const timeAgo = (uts) => {
          if (!uts) return "";
          const mins = Math.floor((Date.now() - Number(uts) * 1000) / 60000);
          if (mins < 1) return "à l’instant";
          if (mins < 60) return `il y a ${mins} min`;
          const h = Math.floor(mins / 60);
          return `il y a ${h} h`;
        };

        const applyAnimations = (isPlaying) => {
          if (!vinyl || !status) return;
          if (isPlaying && !prefersNoMotion) {
            vinyl.classList.add("animate-[spin_10s_linear_infinite]");
            vinyl.classList.replace("brightness-10", "brightness-100");
            status.classList.add("animate-bounce", "text-red-500");
          } else {
            vinyl.classList.remove("animate-[spin_10s_linear_infinite]");
            status.classList.remove("animate-bounce", "text-red-500");
          }
        };

        const paint = (t) => {
          // Titre cliquable (conserve tes classes)
          if (t?.url) {
            const currentIsLink = titleEl?.tagName === "A";
            if (!currentIsLink) {
              const a = document.createElement("a");
              a.href = t.url;
              a.target = "_blank";
              a.rel = "noopener";
              a.className = titleEl.className + " hover:opacity-90";
              a.textContent = t?.title || "Sans titre";
              titleEl.replaceWith(a);
            } else {
              titleEl.textContent = t?.title || "Sans titre";
              titleEl.href = t.url;
            }
          } else {
            // S'il n'y a pas d'URL, assure-toi qu'on a un élément texte
            if (titleEl?.tagName === "A") {
              const h3 = document.createElement("h3");
              h3.className = titleEl.className.replace(" hover:opacity-90", "");
              h3.textContent = t?.title || "Sans titre";
              titleEl.replaceWith(h3);
            } else {
              titleEl.textContent = t?.title || "Sans titre";
            }
          }

          artistEl.textContent = t?.artist || "Artiste inconnu";
          timeEl.textContent = t?.nowPlaying ? "👨🏼‍🎤 LIVE !" : timeAgo(t?.date);

          applyAnimations(!!t?.nowPlaying);
        };

        const REFRESH_MS = 3 * 60 * 1000; // 3 minutes

        const fetchData = async () => {
          // Timeout via AbortController
          const ac = new AbortController();
          const kill = setTimeout(() => ac.abort(), 8000);

          const res = await fetch("/api/lastfm.json", {
            cache: "no-store",
            signal: ac.signal,
          });
          clearTimeout(kill);

          let data;
          try {
            data = await res.json();
          } catch (e) {
            throw new Error("Réponse non JSON");
          }
          if (!res.ok) {
            // Erreur API / rate-limit → laisser le backoff agir
            throw new Error("Erreur endpoint: " + (data?.error || res.status));
          }
          return (data?.tracks ?? []).slice(0, LIMIT);
        };

        const refresh = async () => {
          if (document.hidden) return; // ne pas rafraîchir si onglet non visible
          try {
            const tracks = await fetchData();
            if (!tracks.length) {
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
            } else {
              // Même morceau → juste remettre à jour l’horodatage si nécessaire
              if (!t?.nowPlaying) timeEl.textContent = timeAgo(t?.date);
            }

            this.#backoff = 0; // reset backoff au succès
          } catch (e) {
            console.warn(e);
            // Backoff progressif: 5 → 10 → 20 → 30 min (max)
            this.#backoff = Math.min(
              this.#backoff ? this.#backoff * 2 : 5 * 60 * 1000,
              30 * 60 * 1000,
            );
          }
        };

        const planNext = () => {
          const base = this.#backoff || REFRESH_MS;
          const jitter = Math.floor(Math.random() * 30_000) - 15_000; // ±15 s
          clearTimeout(this.#timer);
          this.#timer = setTimeout(async () => {
            await refresh();
            planNext();
          }, base + jitter);
        };

        // Premier chargement + planification
        refresh().finally(planNext);

        // Replanifier quand l’onglet revient au premier plan
      }

      disconnectedCallback() {
        clearTimeout(this.#timer);
        document.removeEventListener("visibilitychange", this.#onVisibility);
      }
    }

    if (!customElements.get("astro-lastmusic")) {
      customElements.define("astro-lastmusic", AstroLastMusic);
    }