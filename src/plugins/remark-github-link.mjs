// src/plugins/remark-github-link.mjs
import path from 'node:path';

export function remarkGitHubLink(options = {}) {
  const host = options.host ?? 'https://github.com';

  // Prends en priorité les vars Vercel (très pratiques en CI),
  // sinon retombe sur des options manuelles ou des valeurs par défaut.
  const owner  = process.env.VERCEL_GIT_REPO_OWNER ?? options.owner ?? 'bot-35';
  const repo   = process.env.VERCEL_GIT_REPO_SLUG  ?? options.repo  ?? 'devblog';
  const branch = process.env.VERCEL_GIT_COMMIT_REF ?? options.branch ?? 'main';

  // Répertoire racine de tes contenus dans le repo (à adapter si besoin)
  // Exemple: 'src/content' ou 'src/content/posts'
  const repoContentRoot = options.repoContentRoot ?? 'src/content/posts';

  return function remarkGitHubLinkTransformer(_, file) {
    // file.cwd = racine du projet au build
    // file.path = chemin absolu du fichier MD/MDX
    const relFromRepoRoot = path
      .relative(file.cwd, file.path)
      .replace(/\\/g, '/'); // windows safe

    // On ne force pas repoContentRoot ; on l’utilise seulement si tu veux
    // tronquer un préfixe spécifique. Sinon on garde relFromRepoRoot tel quel.
    const repoPath = relFromRepoRoot;

    const ghUrl = `${host}/${owner}/${repo}/blob/${branch}/${repoPath}`;

    // Injecte dans le frontmatter Astro
    file.data.astro = file.data.astro || {};
    file.data.astro.frontmatter = file.data.astro.frontmatter || {};
    file.data.astro.frontmatter.ghUrl = ghUrl;
  };
}
