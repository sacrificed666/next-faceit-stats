"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { useRange, withRange } from "@/features/squad/model/useRange";
import { useI18n } from "@/shared/i18n/useI18n";
import { homePath } from "@/shared/lib/urls";

interface SquadLinkProps {
  children: ReactNode;
  className?: string;
}

const SquadLink = ({ children, className }: SquadLinkProps) => {
  const { locale } = useI18n();
  const range = useRange();
  return (
    <Link href={withRange(homePath(locale), range)} className={className}>
      {children}
    </Link>
  );
};

export default SquadLink;
