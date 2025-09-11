// scripts/latest-post.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function safeExec(cmd) {
  try { return execSync(cmd, { encoding: 'utf8' }).trim(); }
  catch { return ''; }
}

function listFilesRec(dir, exts = ['.md', '.mdx']) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRec(p, exts));
    else if (exts.includes(path.extname(entry.name))) out.push(p);
  }
  return out;
}

function parseFrontmatter(fileContent) {
  // parse minimal front-matter sans dépendance
  // Compatible YAML "simple" — si besoin, tu peux passer à gray-matter
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

function isoOrNull(s) {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function fileGitDateIso(file) {
  const iso = safeExec(`git log --follow -1 --format=%cI -- "${file}"`);
  return iso || '';
}

function pickLatest(posts) {
  return posts.sort((a, b) => b.date - a.date)[0];
}

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

(function main() {
  const POSTS_DIR = process.env.POSTS_DIR || 'src/content/posts';
  const README = process.env.README_PATH || 'README.md';
  const BASE_URL = process.env.BLOG_BASE_URL || 'https://devblog-bot-35.vercel.app'; // adapte si besoin
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
