import { cacheLife } from "next/cache";

import type { I18n } from "@/shared/i18n/context";
import { rich } from "@/shared/i18n/rich";
import { SITE } from "@/shared/lib/site";
import { ExternalLink } from "@/shared/ui/ExternalLink";

async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

interface FooterProps {
  i18n: I18n;
}

export async function Footer({ i18n: { t } }: FooterProps) {
  const year = await currentYear();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          {`© ${year} `}
          <ExternalLink href={SITE.author.url} icon={false} className="font-semibold text-ink-secondary hover:text-ink">
            {SITE.author.name}
          </ExternalLink>
          {". "}
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
        </p>
        <ExternalLink href={SITE.repository} className="font-semibold text-ink-secondary hover:text-ink">
          {t("footer.source")}
        </ExternalLink>
      </div>
    </footer>
  );
}
