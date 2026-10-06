import type { ReactNode } from "react";

import Icon, { type IconName } from "../Icon/Icon";

interface NoticeProps {
  tone?: "info" | "warning";
  title: string;
  children?: ReactNode;
  icon?: IconName;
}

// A highlighted message with an icon, for warnings and information
const Notice = ({ tone = "info", title, children, icon }: NoticeProps) => {
  const palette = tone === "warning" ? "border-bad/30 bg-bad-soft" : "border-line bg-surface";
  return (
    <div role={tone === "warning" ? "status" : undefined} className={`flex gap-3 rounded-2xl border p-4 ${palette}`}>
      <Icon
        name={icon ?? (tone === "warning" ? "alert" : "info")}
        size={20}
        className={`mt-0.5 shrink-0 ${tone === "warning" ? "text-bad" : "text-ink-muted"}`}
      />
      <div className="flex min-w-0 flex-col gap-1 text-sm">
        <p className="font-semibold text-ink">{title}</p>
        {children ? <div className="text-ink-secondary">{children}</div> : null}
      </div>
    </div>
  );
};

export default Notice;
