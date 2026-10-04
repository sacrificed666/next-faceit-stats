export type CssVariable = `--${string}`;

declare module "react" {
  interface CSSProperties {
    [property: CssVariable]: string | number | undefined;
  }
}
