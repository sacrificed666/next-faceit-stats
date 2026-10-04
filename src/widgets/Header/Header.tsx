import Link from "next/link";

import type { I18n } from "@/shared/i18n/context";
import { SITE } from "@/shared/lib/site";
import { homePath } from "@/shared/lib/urls";
import { Icon } from "@/shared/ui/Icon";
import { Logo } from "@/shared/ui/Logo";

import { HeaderNav } from "./HeaderNav";
import { LanguageMenu } from "./LanguageMenu";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  i18n: I18n;
}

export function Header({ i18n: { locale, t } }: HeaderProps) {
  const name = t("app.name");
  return (
    <header className="relative z-30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-3 px-4 py-4 sm:flex-nowrap sm:gap-x-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 max-sm:flex-1">
          <Link
            href={homePath(locale)}
            aria-label={t("app.home", { app: name })}
            className="group flex min-w-0 items-center gap-2.5 rounded-lg text-base font-extrabold tracking-tight text-ink sm:text-lg"
          >
            <Logo size={32} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span className="truncate">{name}</span>
          </Link>
        </div>
        <HeaderNav className="order-last w-full sm:order-none sm:ml-4 sm:w-auto" />
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageMenu />
          <ThemeToggle />
          <a
            href={SITE.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden size-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-hover hover:text-ink xs:inline-flex"
          >
            <Icon name="github" size={18} />
            <span className="sr-only">{t("external.label", { label: t("nav.source") })}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
