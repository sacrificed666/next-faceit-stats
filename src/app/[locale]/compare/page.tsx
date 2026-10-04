import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComparePage } from "@/features/compare/ui/ComparePage";
import { withoutMaps } from "@/features/player/model/profile";
import { alternates, social } from "@/features/seo/model/seo";
import { getSquad } from "@/features/squad/api/loader";
import { SquadStatus } from "@/features/squad/ui/SquadStatus";
import { isLocale } from "@/shared/i18n/locales";
import { getI18n } from "@/shared/i18n/server";

export async function generateMetadata({ params }: PageProps<"/[locale]/compare">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const i18n = await getI18n(locale);
  const { t } = i18n;
  const links = alternates(locale, "/compare");
  const title = `${t("compare.title")} · ${t("app.name")}`;
  return {
    title: t("compare.title"),
    description: t("meta.compare"),
    alternates: links,
    ...social(i18n, { url: links.canonical, title, description: t("meta.compare") }),
  };
}

export default async function CompareRoute({ params }: PageProps<"/[locale]/compare">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [squad, i18n] = await Promise.all([getSquad(), getI18n(locale)]);

  if (squad.status === "unconfigured" || squad.status === "unavailable")
    return <SquadStatus problem={squad} i18n={i18n} />;
  if (squad.players.length === 0) {
    return <SquadStatus problem={{ status: "empty", failed: squad.failed }} i18n={i18n} />;
  }
  return <ComparePage players={squad.players.map(withoutMaps)} updatedAt={squad.updatedAt} />;
}
