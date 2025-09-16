// npm i @octokit/graphql
import { graphql } from "@octokit/graphql";

const client = graphql.defaults({
  headers: { authorization: `token ${process.env.GITHUB_TOKEN}` },
});

type Stats = {
  login: string;
  followers: number;
  publicRepos: number;
  totalStars: number;
  commitsLast12Months: number;
  devblog: {
    totalCommitsDefaultBranch: number;
    languages: { name: string; color: string | null; size: number; share: number }[];
  };
};

export async function getGithubStats(login: string, repo = "devblog"): Promise<Stats> {
  const QUERY = `
    query GH($login: String!, $repo: String!, $after: String) {
      user(login: $login) {
        login
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

  let stars = 0; let after: string | null = null; let base: any, repoData: any;

  while (true) {
    const res: any = await client(QUERY, { login, repo, after });
    base = res.user; repoData = res.repository;
    stars += res.user.reposForStars.nodes.reduce((a: number, r: any) => a + r.stargazerCount, 0);
    if (res.user.reposForStars.pageInfo.hasNextPage) after = res.user.reposForStars.pageInfo.endCursor;
    else break;
  }

  const totalSize = repoData.languages.totalSize || 0;
  const languages = repoData.languages.edges.map((e: any) => ({
    name: e.node.name, color: e.node.color, size: e.size,
    share: totalSize ? +(100 * e.size / totalSize).toFixed(2) : 0
  }));

  return {
    login,
    followers: base.followers.totalCount,
    publicRepos: base.repositories.totalCount,
    totalStars: stars,
    commitsLast12Months: base.contributionsCollection.totalCommitContributions,
    devblog: {
      totalCommitsDefaultBranch: repoData.defaultBranchRef?.target?.history?.totalCount ?? 0,
      languages
    }
  };
}
