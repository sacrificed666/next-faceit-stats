import type { Metadata } from "next";
import Link from "next/link";

import { rich } from "@/shared/i18n/rich";
import { currentLocale, getI18n } from "@/shared/i18n/server";
import { homePath } from "@/shared/lib/urls";
import { Icon } from "@/shared/ui/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n(await currentLocale());
  return { title: t("notFound.meta"), robots: { index: false, follow: true } };
}

export default async function NotFound() {
  const locale = await currentLocale();
  const { t } = await getI18n(locale);
  return (
    <div className="flex flex-col items-start gap-6 pt-10 sm:pt-16">
      <p className="text-7xl font-extrabold tracking-tight text-accent-text sm:text-8xl">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t("notFound.title")}</h1>
        <p className="max-w-xl text-ink-secondary">
          {rich(t("notFound.body"), {
            variable: (
              <code className="rounded-md bg-inset px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink">
                FACEIT_PLAYERS
              </code>
            ),
          })}
        </p>
      </div>
      <Link
        href={homePath(locale)}
        className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink transition-transform hover:-translate-y-0.5"
      >
        <Icon name="home" size={16} />
        {t("notFound.home")}
      </Link>
    </div>
  );
}
