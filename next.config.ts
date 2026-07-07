import type { NextConfig } from "next";

const repositoryName = "bubatzbande-koenigreiche-chaos";
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGitHubPagesBuild ? `/${repositoryName}` : "");

const nextConfig: NextConfig = {
  output: isGitHubPagesBuild ? "export" : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
