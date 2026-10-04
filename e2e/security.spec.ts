import { expect, test } from "@playwright/test";

import { option, stubFlags } from "./helpers";

test("runs without console errors or policy violations", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  await page.addInitScript(() => {
    const violations: string[] = [];
    Reflect.set(window, "policyViolations", violations);
    document.addEventListener("securitypolicyviolation", (event) => {
      violations.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  await stubFlags(page);

  await page.goto("/en");
  await option(page, "Last 30 days").check();
  await page.getByRole("button", { name: /^Language: English/ }).click();
  await page.goto("/uk/players/anna?range=50");
  await expect(page.getByRole("heading", { level: 1, name: "anna" })).toBeVisible();
  await page.goto("/pl/compare?a=chris&b=dana");
  await expect(page.getByRole("combobox").first()).toHaveValue("chris");

  expect(problems).toEqual([]);
  expect(await page.evaluate(() => Reflect.get(window, "policyViolations"))).toEqual([]);
});

test("sends the security headers", async ({ request }) => {
  const response = await request.get("/en");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["strict-transport-security"]).toBe("max-age=31536000");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-powered-by"]).toBeUndefined();
});
