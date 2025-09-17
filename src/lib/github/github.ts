import { graphql } from "@octokit/graphql";

// Direct access Astro
const tokenAstro = import.meta.env.GITHUB_TOKEN;
// Fallback Node (scripts standalone avec dotenv)
const tokenNode = process.env.GITHUB_TOKEN;

const TOKEN = tokenAstro || tokenNode;
if (!TOKEN) throw new Error("GITHUB_TOKEN manquant (vérifie .env ou variables Vercel)");

export const client = graphql.defaults({
  headers: { authorization: `token ${TOKEN}` },
});

export async function getGithubStats(login: string, repo = "devblog") {
  const QUERY = `
    query GH($login: String!, $repo: String!, $after: String) {
      user(login: $login) {
        followers { totalCount }
        repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
        reposForStars: repositories(ownerAffiliations: OWNER, isFork: false, first: 100, after: $after) {
          nodes { stargazerCount }
          pageInfo { hasNextPage endCursor }
        }
        contributionsCollection { totalCommitContributions }
      }
      repository(owner: $login, name: $repo) {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          totalSize
          edges { size node { name color } }
        }
        defaultBranchRef { target { ... on Commit { history(first: 0) { totalCount } } } }
      }
    }`;

  let stars = 0, after: string | null = null, base: any, repoData: any;
  while (true) {
    const res: any = await client(QUERY, { login, repo, after });
    base = res.user; repoData = res.repository;
    stars += res.user.reposForStars.nodes.reduce((a: number, r: any) => a + r.stargazerCount, 0);
    if (res.user.reposForStars.pageInfo.hasNextPage) after = res.user.reposForStars.pageInfo.endCursor;
    else break;
  }

  const totalSize = repoData.languages.totalSize || 0;
  const languages = repoData.languages.edges.map((e: any) => ({
    name: e.node.name,
    color: e.node.color,
    size: e.size,
    share: totalSize ? +(100 * e.size / totalSize).toFixed(2) : 0,
  }));

  return {
    followers: base.followers.totalCount,
    publicRepos: base.repositories.totalCount,
    totalStars: stars,
    commitsLast12Months: base.contributionsCollection.totalCommitContributions,
    devblog: {
      totalCommitsDefaultBranch: repoData.defaultBranchRef?.target?.history?.totalCount ?? 0,
      languages,
    },
  };
}
