"use client";

import Image from "next/image";
import { createContext, use, useState, type ReactNode } from "react";

import { mapName } from "../../model/maps";

const MapImagesContext = createContext<Readonly<Record<string, string>>>({});

const SIZES = {
  xs: { box: "h-5 w-8 rounded-[5px]", image: "32px", text: "text-[0.5rem]" },
  sm: { box: "h-7 w-11 rounded-md", image: "44px", text: "text-[0.625rem]" },
  md: { box: "h-9 w-14 rounded-lg", image: "56px", text: "text-xs" },
} as const;

// Shares the map pictures of the squad with every MapThumb below it
export const MapImagesProvider = ({
  images,
  children,
}: {
  images: Readonly<Record<string, string>>;
  children: ReactNode;
}) => <MapImagesContext value={images}>{children}</MapImagesContext>;

interface MapThumbProps {
  map: string;
  size?: keyof typeof SIZES;
  className?: string;
}

// A small picture of the map, or its initials when FACEIT has none
const MapThumb = ({ map, size = "sm", className = "" }: MapThumbProps) => {
  const image = use(MapImagesContext)[map];
  const [failed, setFailed] = useState(false);
  const { box, image: width, text } = SIZES[size];
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-inset ring-1 ring-line ${box} ${className}`}
    >
      {image && !failed ? (
        <Image src={image} alt="" fill sizes={width} className="object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className={`font-bold text-ink-muted ${text}`}>{mapName(map).slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
};

export default MapThumb;
