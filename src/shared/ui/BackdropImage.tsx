"use client";

import Image from "next/image";
import { useState } from "react";

interface BackdropImageProps {
  src: string | null;
  sizes: string;
  eager?: boolean;
  className?: string;
}

export function BackdropImage({ src, sizes, eager = false, className = "" }: BackdropImageProps) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return null;
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(src)}
      className={`object-cover ${className}`}
    />
  );
}
