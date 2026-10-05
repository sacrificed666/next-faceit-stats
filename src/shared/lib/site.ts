import packageJson from "../../../package.json" with { type: "json" };

export const SITE = {
  keywords: ["FACEIT", "CS2", "Counter-Strike 2", "stats", "ELO", "K/D", "ADR", "leaderboard", "squad", "dashboard"],
  author: { name: "Illia Movchko", url: "https://github.com/sacrificed666" },
  repository: "https://github.com/sacrificed666/next-faceit-stats",
  version: packageJson.version,
  changelog: "https://github.com/sacrificed666/next-faceit-stats/blob/main/CHANGELOG.md",
  themeColor: { light: "#f3f3f0", dark: "#0f1011" },
} as const;

export const siteUrl = (env: Partial<Record<string, string>> = process.env): URL => {
  const explicit = env.SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return new URL(`https://${vercel}`);
  return new URL(`http://localhost:${env.PORT ?? "3000"}`);
};

export const isIndexable = (env: Partial<Record<string, string>> = process.env): boolean =>
  env.VERCEL_ENV === undefined || env.VERCEL_ENV === "production";
