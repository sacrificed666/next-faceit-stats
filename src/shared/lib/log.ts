type LogContext = Record<string, unknown>;

const line = (message: string, context?: LogContext): string =>
  context ? `[faceit-stats] ${message} ${JSON.stringify(context)}` : `[faceit-stats] ${message}`;

export const log = {
  info(message: string, context?: LogContext): void {
    console.info(line(message, context));
  },
  warn(message: string, context?: LogContext): void {
    console.warn(line(message, context));
  },
  error(message: string, context?: LogContext): void {
    console.error(line(message, context));
  },
};
