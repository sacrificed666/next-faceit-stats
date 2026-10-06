import type { Locator, Page } from "@playwright/test";

// The label of a radio option, which is what a visitor clicks
export const option = (page: Page, name: string | RegExp): Locator =>
  page.locator("label").filter({ has: page.getByRole("radio", { name, exact: true }) });
