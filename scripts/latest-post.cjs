// scripts/latest-post.js
// Import des dépendances
const fs = require('fs');
const path = require('path');

/* 
exécute une commande shell (ex : git log) et renvoie le résultat.
→ ici utilisé pour récupérer la date d’un fichier dans Git (git log -1 …).
→ ça permet d’avoir une date de secours si le front-matter n’a pas de publishedDate 
*/
const { execSync } = require('child_process');

function safeExec(cmd) {
  try { return execSync(cmd, { encoding: 'utf8' }).trim(); }
  catch { return ''; }
}

/* 
→ parcours un dossier (ici src/content/posts) récursivement.
→ ne garde que les fichiers .md ou .mdx.
→ résultat : une liste des fichiers d’articles. 
*/
function listFilesRec(dir, exts = ['.md', '.mdx']) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRec(p, exts));
    else if (exts.includes(path.extname(entry.name))) out.push(p);
  }
  return out;
}

/* 
parse minimal front-matter sans dépendance
Compatible YAML "simple" — si besoin, on peux passer par gray-matter 
 */
function parseFrontmatter(fileContent) {
  const fmMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) return { data: {}, content: fileContent };
  const yaml = fmMatch[1];
  const data = {};
  for (const line of yaml.split('\n')) {
    const m = line.match(/^([\w-]+)\s*:\s*(.+)$/);
    if (m) {
      const key = m[1].trim();
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  }
  const content = fileContent.slice(fmMatch[0].length);
  return { data, content };
}

/*
→ essaie de convertir une chaîne en Date.
→ renvoie null si ce n’est pas valide.
*/
function isoOrNull(s) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}


/*
→ fait un git log -1 --format=%cI pour avoir la date du dernier commit sur le fichier.
→ utile quand ton front-matter n’a pas de date.
*/
function fileGitDateIso(file) {
  const iso = safeExec(`git log --follow -1 --format=%cI -- "${file}"`);
  return iso || '';
}

/*
→ prend un tableau de posts avec une clé date.
→ trie par date décroissante.
→ renvoie le plus récent.
*/
function pickLatest(posts) {
  return posts.sort((a, b) => b.date - a.date)[0];
}

/**
→ ouvre le README.
→ cherche les balises <!-- START --> … <!-- END -->.
→ remplace tout ce qu’il y a entre par ton nouveau contenu.
→ si les marqueurs n’existent pas, les ajoute en bas du fichier. 
*/
function readmeReplaceBlock(readmePath, startMarker, endMarker, replacement) {
  const start = `<!-- ${startMarker} -->`;
  const end = `<!-- ${endMarker} -->`;
  let txt = fs.readFileSync(readmePath, 'utf8');
  if (!txt.includes(start) || !txt.includes(end)) {
    // Si les marqueurs n'existent pas, on les ajoute en fin de README
    txt = `${txt.trim()}\n\n${start}\n${replacement}\n${end}\n`;
  } else {
    const re = new RegExp(`${start}[\\s\\S]*?${end}`, 'm');
    txt = txt.replace(re, `${start}\n${replacement}\n${end}`);
  }
  fs.writeFileSync(readmePath, txt);
}

/*
Lister tous les fichiers dans src/content/posts.

Pour chaque fichier :

1 . Lire le contenu.
2 . Extraire front-matter (title, slug, description, publishedDate).
3 . Déterminer la date : publishedDate > date > date Git.
4 . Construire un objet {title, slug, desc, date}.
5 . Choisir le plus récent.
6 . Générer un bloc Markdown :
    |------------------------------------
    | **Dernier article :** [Titre](URL)
    | > description
    | *Publié le YYYY-MM-DD*
    |------------------------------------
7. Remplacer le bloc dans le README.md.
*/
(function main() {
  const POSTS_DIR = process.env.POSTS_DIR || 'src/content/posts';
  const README = process.env.README_PATH || 'README.md';
  const BASE_URL = process.env.BLOG_BASE_URL || 'https://devblog-bot-35.vercel.app';
  const START = process.env.START_MARKER || 'LAST_POST_START';
  const END = process.env.END_MARKER || 'LAST_POST_END';

  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`Dossier introuvable: ${POSTS_DIR}`);
    process.exit(1);
  }

  const files = listFilesRec(POSTS_DIR);
  if (files.length === 0) {
    readmeReplaceBlock(README, START, END, '_Aucun article trouvé._');
    process.exit(0);
  }

  const posts = [];
  for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8');
    const { data } = parseFrontmatter(raw);

    // Si l’article est marqué comme draft: true, on le saute
    if (data.draft && String(data.draft).toLowerCase() === 'true') {
      continue;
    }

    const title = data.title || path.basename(f);
    const slug = (data.slug || path.basename(f, path.extname(f))).replace(/^\//, '');
    const desc = data.description || '';
    const date =
      isoOrNull(data.publishedDate) ||
      isoOrNull(data.date) ||
      isoOrNull(fileGitDateIso(f)) ||
      new Date(0);

    posts.push({ file: f, title, slug, desc, date });
  }

  const latest = pickLatest(posts);
  const ymd = latest.date.toISOString().slice(0, 10);
  const url = `${BASE_URL}/posts/${latest.slug}`;

  const block = [
    `**Dernier article :** [${latest.title}](${url})`,
    ``,
    latest.desc ? `> ${latest.desc}` : '',
    `*Publié le ${ymd}*`,
  ].filter(Boolean).join('\n');

  readmeReplaceBlock(README, START, END, block);
})();
