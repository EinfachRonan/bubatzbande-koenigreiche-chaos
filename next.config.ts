import type { NextConfig } from "next";

const repositoryName = "bubatzbande-koenigreiche-chaos";
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: isGitHubPagesBuild ? "export" : undefined,
  basePath: isGitHubPagesBuild ? `/${repositoryName}` : undefined,
  assetPrefix: isGitHubPagesBuild ? `/${repositoryName}/` : undefined,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
