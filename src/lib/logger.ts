type LogContext = Record<string, unknown>;

const PREFIX = "[faceit-stats]";

function format(level: string, message: string, context?: LogContext): string {
  const base = `${PREFIX} ${level}: ${message}`;
  return context ? `${base} ${JSON.stringify(context)}` : base;
}

/**
 * Structured logger for consistent logging across the application.
 * Prefixes all messages with `[faceit-stats]` and optionally serializes context.
 */
export const logger = {
  info(message: string, context?: LogContext): void {
    console.info(format("INFO", message, context));
  },
  warn(message: string, context?: LogContext): void {
    console.warn(format("WARN", message, context));
  },
  error(message: string, context?: LogContext): void {
    console.error(format("ERROR", message, context));
  },
} as const;
