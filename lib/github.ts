export interface GitHubRepoInfo {
  connected: boolean;
  repoUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  starsCount: number;
  openIssuesCount: number;
  description?: string;
  latestCommit: {
    message: string;
    authorName: string;
    authorAvatar?: string;
    committedAt: string;
    hash: string;
  };
}

/**
 * Ekstraksi owner dan repo name dari URL GitHub
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.trim().replace(/\/$/, "");
    const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/i);
    if (match && match[1] && match[2]) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Mengambil metadata repository dan commit terbaru dari GitHub REST API
 * Menggunakan server-side fetch dengan revalidasi 300 detik (5 menit)
 */
export async function getGitHubRepoDetails(repoUrl: string): Promise<GitHubRepoInfo> {
  const parsed = parseGitHubUrl(repoUrl);

  const fallbackData: GitHubRepoInfo = {
    connected: false,
    repoUrl,
    defaultBranch: "main",
    isPrivate: false,
    starsCount: 0,
    openIssuesCount: 0,
    latestCommit: {
      message: "Tidak dapat mengambil riwayat commit repositori",
      authorName: "System",
      committedAt: "Tidak diketahui",
      hash: "0000000",
    },
  };

  if (!parsed) {
    return fallbackData;
  }

  const { owner, repo } = parsed;
  const token = process.env.GITHUB_TOKEN;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ProjectManagement-App",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    // 1. Ambil data repo
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 300 }, // Cache 5 menit
    });

    if (!repoRes.ok) {
      return fallbackData;
    }

    const repoData = await repoRes.json();

    // 2. Ambil commit terbaru
    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      {
        headers,
        next: { revalidate: 300 },
      }
    );

    let latestCommit = fallbackData.latestCommit;

    if (commitRes.ok) {
      const commitData = await commitRes.json();
      if (Array.isArray(commitData) && commitData.length > 0) {
        const c = commitData[0];
        latestCommit = {
          message: c.commit?.message?.split("\n")[0] || "Update repository",
          authorName: c.commit?.author?.name || c.author?.login || "Contributor",
          authorAvatar: c.author?.avatar_url,
          committedAt: new Date(c.commit?.author?.date || Date.now()).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          hash: c.sha?.substring(0, 7) || "0000000",
        };
      }
    }

    return {
      connected: true,
      repoUrl,
      defaultBranch: repoData.default_branch || "main",
      isPrivate: Boolean(repoData.private),
      starsCount: repoData.stargazers_count || 0,
      openIssuesCount: repoData.open_issues_count || 0,
      description: repoData.description || undefined,
      latestCommit,
    };
  } catch {
    return fallbackData;
  }
}
