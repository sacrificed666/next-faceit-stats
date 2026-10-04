import type { Locator, Page } from "@playwright/test";

export function option(page: Page, name: string | RegExp): Locator {
  return page.locator("label").filter({ has: page.getByRole("radio", { name, exact: true }) });
}

export async function stubFlags(page: Page) {
  await page.route("https://flagcdn.com/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#888"/></svg>',
    }),
  );
}
