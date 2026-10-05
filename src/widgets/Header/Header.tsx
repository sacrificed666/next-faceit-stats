import Link from "next/link";

import SettingsMenu from "@/features/settings/ui/SettingsMenu/SettingsMenu";
import type { I18n } from "@/shared/i18n/context";
import { homePath } from "@/shared/lib/urls";
import Logo from "@/shared/ui/Logo/Logo";

import HeaderNav from "./HeaderNav";

interface HeaderProps {
  i18n: I18n;
}

const Header = ({ i18n: { locale, t } }: HeaderProps) => {
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
        <div className="ml-auto flex items-center">
          <SettingsMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
