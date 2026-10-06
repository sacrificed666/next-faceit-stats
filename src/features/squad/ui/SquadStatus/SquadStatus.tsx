import type { ReactNode } from "react";

import type { ApiFailure, ConfigVariable, FailedPlayer } from "@/features/squad/model/types";
import type { I18n } from "@/shared/i18n/context";
import { rich } from "@/shared/i18n/rich";
import type { MessageKey } from "@/shared/i18n/translate";
import Icon, { type IconName } from "@/shared/ui/Icon/Icon";

export type SquadProblem =
  | { status: "unconfigured"; missing: ConfigVariable[] }
  | { status: "unavailable"; reason: ApiFailure }
  | { status: "empty"; failed: FailedPlayer[] };

const FAILURES: Record<ApiFailure, { title: MessageKey; body: MessageKey; icon: IconName }> = {
  unauthorized: { title: "status.unauthorized.title", body: "status.unauthorized.body", icon: "alert" },
  "rate-limited": { title: "status.rateLimited.title", body: "status.rateLimited.body", icon: "clock" },
  unreachable: { title: "status.unreachable.title", body: "status.unreachable.body", icon: "refresh" },
};

const HINTS: Record<ConfigVariable, MessageKey> = {
  FACEIT_API_KEY: "status.apiKey",
  FACEIT_PLAYERS: "status.players",
};

// Inline code in the setup help
const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded-md bg-inset px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink">{children}</code>
);

interface SquadStatusProps {
  problem: SquadProblem;
  i18n: I18n;
}

// Explains a missing configuration, an unavailable API or an empty squad
const SquadStatus = ({ problem, i18n: { t, format } }: SquadStatusProps) => {
  let icon: IconName = "info";
  let title: string;
  let body: ReactNode;

  if (problem.status === "unconfigured") {
    title = t("status.almostReady");
    body = (
      <>
        <p>{rich(t("status.missing"), { env: <Code>.env</Code>, example: <Code>.env.example</Code> })}</p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {problem.missing.map((variable) => (
            <li key={variable} className="flex flex-wrap items-center gap-2">
              <Icon name="chevronRight" size={14} className="text-accent-text" />
              <Code>{variable}</Code>
              <span>{t(HINTS[variable])}</span>
            </li>
          ))}
        </ul>
      </>
    );
  } else if (problem.status === "unavailable") {
    const copy = FAILURES[problem.reason];
    title = t(copy.title);
    icon = copy.icon;
    body = <p>{t(copy.body)}</p>;
  } else {
    icon = "users";
    title = t("status.empty.title");
    const names = problem.failed.map((entry) => entry.nickname);
    body = (
      <p>
        {rich(t("status.empty.body"), {
          names: names.length > 0 ? format.list(names) : t("status.empty.configured"),
          variable: <Code>FACEIT_PLAYERS</Code>,
        })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-6 sm:pt-10">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-bold tracking-[0.18em] text-accent-text uppercase">{t("app.kicker")}</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">{t("status.title")}</h1>
      </header>
      <div className="panel flex max-w-2xl gap-4 p-6">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
          <Icon name={icon} size={20} />
        </span>
        <div className="flex min-w-0 flex-col gap-2 text-sm text-ink-secondary">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {body}
        </div>
      </div>
    </div>
  );
};

export default SquadStatus;
