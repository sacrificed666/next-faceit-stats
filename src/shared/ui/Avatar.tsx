"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src: string | null;
  name: string;
  size?: number;
  className?: string;
  eager?: boolean;
}

export function Avatar({ src, name, size = 40, className = "", eager = false }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const style = { width: size, height: size };
  if (!src || failed === src) {
    return (
      <span
        aria-hidden="true"
        style={{ ...style, fontSize: Math.round(size * 0.42) }}
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-inset font-bold text-ink-secondary ring-1 ring-line ${className}`}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(src)}
      style={style}
      className={`shrink-0 rounded-full bg-inset object-cover ring-1 ring-line ${className}`}
    />
  );
}
