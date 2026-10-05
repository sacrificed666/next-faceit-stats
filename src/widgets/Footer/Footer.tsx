import { cacheLife } from "next/cache";

import type { I18n } from "@/shared/i18n/context";
import { rich } from "@/shared/i18n/rich";
import { SITE } from "@/shared/lib/site";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";

const currentYear = async (): Promise<number> => {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
};

interface FooterProps {
  i18n: I18n;
}

const Footer = async ({ i18n: { t } }: FooterProps) => {
  const year = await currentYear();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="flex flex-wrap items-center gap-x-1.5">
          <span className="font-semibold text-ink-secondary">{`© ${year} ${SITE.author.name}`}</span>
          <span aria-hidden="true">·</span>
          <ExternalLink href={SITE.changelog} icon={false} className="min-h-6 hover:text-ink">
            {`v${SITE.version}`}
          </ExternalLink>
          <span aria-hidden="true">·</span>
          <span>
            {rich(t("footer.data"), {
              api: (
                <ExternalLink
                  href="https://docs.faceit.com/docs/data-api/data"
                  icon={false}
                  className="underline decoration-line-strong underline-offset-4 hover:text-ink"
                >
                  {t("footer.api")}
                </ExternalLink>
              ),
            })}
          </span>
        </p>
        <ExternalLink href={SITE.repository} className="min-h-6 font-semibold text-ink-secondary hover:text-ink">
          {t("footer.source")}
        </ExternalLink>
      </div>
    </footer>
  );
};

export default Footer;
