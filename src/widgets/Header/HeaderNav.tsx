"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useRange, withRange } from "@/features/squad/model/useRange";
import { useI18n } from "@/shared/i18n/useI18n";
import { comparePath, homePath } from "@/shared/lib/urls";

interface HeaderNavProps {
  className?: string;
}

// Squad and Compare links that keep the range
const HeaderNav = ({ className = "" }: HeaderNavProps) => {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const range = useRange();
  const compare = comparePath(locale);
  const links = [
    { href: withRange(homePath(locale), range), label: t("nav.squad"), current: !pathname.startsWith(compare) },
    { href: withRange(compare, range), label: t("nav.compare"), current: pathname.startsWith(compare) },
  ];
  return (
    <nav aria-label={t("nav.label")} className={className}>
      <ul className="flex items-center gap-1 rounded-full bg-inset p-1 sm:bg-transparent sm:p-0">
        {links.map((link) => (
          <li key={link.label} className="flex-1 sm:flex-none">
            <Link
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              className="block rounded-full px-3.5 py-1.5 text-center text-sm font-semibold text-ink-secondary transition-colors hover:bg-hover hover:text-ink aria-[current=page]:bg-surface aria-[current=page]:text-ink aria-[current=page]:shadow-card sm:aria-[current=page]:bg-inset sm:aria-[current=page]:shadow-none"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HeaderNav;
