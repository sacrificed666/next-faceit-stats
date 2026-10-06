import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

// A titled region with a description and optional actions
const Section = ({ id, title, description, actions, children, className = "" }: SectionProps) => {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id={headingId} className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {title}
          </h2>
          {description ? <p className="max-w-prose text-sm text-ink-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
};

export default Section;
