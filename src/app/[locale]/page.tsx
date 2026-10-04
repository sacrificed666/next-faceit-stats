import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Dashboard } from "@/features/dashboard/ui/Dashboard";
import { withoutDetails } from "@/features/player/model/profile";
import { alternates, social, squadSchema } from "@/features/seo/model/seo";
import { JsonLd } from "@/features/seo/ui/JsonLd";
import { getSquad } from "@/features/squad/api/loader";
import { SquadStatus } from "@/features/squad/ui/SquadStatus";
import { isLocale } from "@/shared/i18n/locales";
import { getI18n } from "@/shared/i18n/server";
import { siteUrl } from "@/shared/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const i18n = await getI18n(locale);
  const links = alternates(locale);
  return {
    alternates: links,
    ...social(i18n, { url: links.canonical, title: i18n.t("app.name"), description: i18n.t("app.description") }),
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [squad, i18n] = await Promise.all([getSquad(), getI18n(locale)]);

  if (squad.status === "unconfigured" || squad.status === "unavailable")
    return <SquadStatus problem={squad} i18n={i18n} />;
  if (squad.players.length === 0) {
    return <SquadStatus problem={{ status: "empty", failed: squad.failed }} i18n={i18n} />;
  }

  return (
    <>
      <JsonLd data={squadSchema(squad.players, siteUrl(), i18n)} />
      <Dashboard players={squad.players.map(withoutDetails)} failed={squad.failed} updatedAt={squad.updatedAt} />
    </>
  );
}
