"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/shared/i18n/useI18n";

import { Icon } from "./Icon";

interface ExternalLinkProps {
  href: string;
  children?: ReactNode;
  className?: string;
  icon?: boolean;
  label?: string;
  context?: string;
}

export function ExternalLink({ href, children, className = "", icon = true, label, context }: ExternalLinkProps) {
  const { t } = useI18n();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? t("external.label", { label }) : undefined}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {children}
      {context ? <span className="sr-only">{`, ${context}`}</span> : null}
      {icon ? <Icon name="external" size={14} className="shrink-0 opacity-70" /> : null}
      {label ? null : <span className="sr-only">{` (${t("external.newTab")})`}</span>}
    </a>
  );
}
