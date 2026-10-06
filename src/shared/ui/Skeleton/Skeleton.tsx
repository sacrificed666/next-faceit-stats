import type { ReactNode } from "react";

interface SkeletonProps {
  label: string;
  children: ReactNode;
}

// Pulsing placeholders with a spoken loading message
const Skeleton = ({ label, children }: SkeletonProps) => (
  <>
    <output className="sr-only">{`${label}…`}</output>
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-12 pt-6 sm:gap-16 sm:pt-10">
      {children}
    </div>
  </>
);

export default Skeleton;
