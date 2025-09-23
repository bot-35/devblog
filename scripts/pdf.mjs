// scripts/pdf.mjs
import { spawn } from "child_process";
import { setTimeout as wait } from "timers/promises";
import { chromium } from "playwright";
import { globby } from "globby";
import matter from "gray-matter";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const HOST = process.env.PDF_HOST || "127.0.0.1";
const PORT = process.env.PDF_PORT || "4321";
const BASE = `http://${HOST}:${PORT}`;

const onlyOne = process.argv.find(a => a.startsWith("slug="))?.split("=")[1];

async function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
    child.on("exit", code => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function waitForReady(url, attempts = 60, delayMs = 500) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) return true;
    } catch {}
    await wait(delayMs);
  }
  throw new Error(`Preview non joignable: ${url}`);
}

async function getPosts() {
  const files = await globby(["src/content/posts/**/*.{md,mdx}"], { gitignore: true });
  const posts = [];
  for (const fp of files) {
    const raw = readFileSync(fp, "utf8");
    const { data } = matter(raw) || {};
    if (data?.draft === true) continue;
    const slug = data?.slug ||
      fp.replace(/\\/g, "/")
        .replace(/^src\/content\/posts\//, "")
        .replace(/\.(md|mdx)$/i, "");
    posts.push({ slug, url: `${BASE}/posts/${slug}` });
  }
  return onlyOne ? posts.filter(p => p.slug === onlyOne) : posts;
}

async function main() {
  // 1) Build
  await run("npm", ["run", "build"]);

  // 2) Preview (en bg)
  const preview = spawn(
    "npx",
    ["astro", "preview", "--port", PORT, "--host", HOST],
    { shell: true, stdio: "inherit" }
  );

  try {
    // 3) Attendre prêt
    await waitForReady(`${BASE}`);

    // 4) Générer
    const posts = await getPosts();
    if (posts.length === 0) {
      console.log("Aucun article à traiter.");
      return;
    }

    const outDir = "public/pdfs";
    mkdirSync(outDir, { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.emulateMedia({ media: "print" });

    for (const p of posts) {
      console.log("➡ Génération PDF:", p.slug, p.url);
      await page.goto(p.url, { waitUntil: "networkidle" });
      // (Optionnel) attendre qu’un article soit rendu pour éviter un PDF vide
      await page.waitForSelector("section#article", { timeout: 5000 })

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "16mm", right: "16mm", bottom: "16mm", left: "16mm" },
      });
      const safe = p.slug.replace(/\/*$/, "").replace(/\//g, "__");
      writeFileSync(join(outDir, `${safe}.pdf`), pdf);
    }

    await browser.close();
  } finally {
    // 5) Stopper preview proprement
    if (preview && !preview.killed) {
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(preview.pid), "/t", "/f"], { shell: true, stdio: "ignore" });
      } else {
        preview.kill("SIGTERM");
      }
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
