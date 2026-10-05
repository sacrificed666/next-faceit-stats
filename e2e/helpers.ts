import type { Locator, Page } from "@playwright/test";

export const option = (page: Page, name: string | RegExp): Locator =>
  page.locator("label").filter({ has: page.getByRole("radio", { name, exact: true }) });
