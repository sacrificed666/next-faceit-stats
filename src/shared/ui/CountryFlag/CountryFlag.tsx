"use client";

import Image from "next/image";

import { useI18n } from "@/shared/i18n/useI18n";
import { flagUrl } from "@/shared/lib/urls";

interface CountryFlagProps {
  code: string;
  size?: number;
  className?: string;
}

// A country flag with the country name for screen readers
const CountryFlag = ({ code, size = 18, className = "" }: CountryFlagProps) => {
  const { format } = useI18n();
  const name = format.country(code);
  const width = Math.round(size * 1.5);
  return (
    <Image
      src={flagUrl(code)}
      alt={name}
      title={name}
      width={width}
      height={size}
      unoptimized
      className={`inline-block shrink-0 rounded-[3px] object-cover ring-1 ring-line ${className}`}
      style={{ width, height: size }}
    />
  );
};

export default CountryFlag;
