"use client";

import Link from "next/link";

import { useI18n } from "@/shared/i18n/useI18n";
import { homePath } from "@/shared/lib/urls";
import Icon from "@/shared/ui/Icon/Icon";

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

const ErrorPage = ({ error, retry }: ErrorPageProps) => {
  const { locale, t } = useI18n();
  return (
    <div className="flex flex-col items-start gap-6 pt-10 sm:pt-16">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-bad-soft text-bad">
        <Icon name="alert" size={24} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t("error.title")}</h1>
        <p className="max-w-xl text-ink-secondary">{t("error.body")}</p>
        {error.digest ? (
          <p className="text-xs text-ink-muted">{t("error.reference", { digest: error.digest })}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-ink transition-transform hover:-translate-y-0.5"
        >
          <Icon name="refresh" size={16} />
          {t("error.retry")}
        </button>
        <Link
          href={homePath(locale)}
          className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-ink hover:border-accent"
        >
          <Icon name="home" size={16} />
          {t("error.home")}
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
