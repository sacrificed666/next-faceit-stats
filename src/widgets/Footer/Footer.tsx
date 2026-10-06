import { cacheLife } from "next/cache";

import type { I18n } from "@/shared/i18n/context";
import { rich } from "@/shared/i18n/rich";
import { SITE } from "@/shared/lib/site";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";

// The year for the copyright line, cached for a day
const currentYear = async (): Promise<number> => {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
};

interface FooterProps {
  i18n: I18n;
}

// Author, version, data source and source code
const Footer = async ({ i18n: { t } }: FooterProps) => {
  const year = await currentYear();
  const link = "min-h-6 text-ink underline decoration-line-strong underline-offset-4 hover:text-accent-text";
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:px-8">
      <div className="panel flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 text-sm">
        <p className="flex flex-wrap items-center gap-x-1.5 font-semibold text-ink">
          {`© ${year} ${SITE.author.name}`}
          <span aria-hidden="true" className="text-ink-muted">
            ·
          </span>
          <ExternalLink href={SITE.changelog} icon={false} className={`${link} font-medium text-ink-secondary`}>
            {`v${SITE.version}`}
          </ExternalLink>
        </p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-0.5 font-medium text-ink-secondary">
          <span>
            {rich(t("footer.data"), {
              api: (
                <ExternalLink href="https://docs.faceit.com/docs/data-api/data" icon={false} className={link}>
                  {t("footer.api")}
                </ExternalLink>
              ),
            })}
          </span>
          <ExternalLink href={SITE.repository} icon={false} className={link}>
            {t("footer.source")}
          </ExternalLink>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
