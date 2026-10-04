import { ImageResponse } from "next/og";

import { OgLogo } from "@/features/seo/og/components";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<OgLogo size={180} />, size);
}
