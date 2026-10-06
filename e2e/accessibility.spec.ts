import { AxeBuilder } from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const PAGES = [
  "/en",
  "/en/players/anna",
  "/en/compare",
  "/uk",
  "/pl/players/Bohdan",
  "/nl/compare",
  "/en/players/ghost",
];

test.use({ reducedMotion: "reduce" });

// The computed background colour of an element
const background = (locator: Locator): Promise<string> =>
  locator.evaluate((element) => getComputedStyle(element).backgroundColor);

// Axe violations of a page once it has applied the address
const violations = async (page: Page) => {
  await page.locator("html:not([data-pending])").waitFor();
  const results = await new AxeBuilder({ page })
    .options({ rules: { "label-content-name-mismatch": { enabled: true } } })
    .analyze();
  return results.violations.map((violation) => ({
    rule: violation.id,
    targets: violation.nodes.map((node) => node.target.join(" ")),
  }));
};

for (const path of PAGES) {
  test(`has no detectable accessibility issues on ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await violations(page)).toEqual([]);
  });
}

test("keeps the dark theme accessible", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/en?range=100");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await violations(page)).toEqual([]);
});

for (const path of ["/en", "/nl", "/de/players/anna", "/pl/compare", "/uk/compare?a=anna&b=dana"]) {
  test(`reflows at 320 pixels without scrolling sideways on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test.describe("in forced colours mode", () => {
  test.use({ forcedColors: "active" });

  test("keeps the chosen option and the data bars visible", async ({ page }) => {
    await page.goto("/en");
    const toolbar = page.getByRole("group", { name: "Matches to include for each player" });
    const chosen = await background(toolbar.locator(":checked + .choice"));
    const other = await background(toolbar.locator(":not(:checked) + .choice").first());
    const canvas = await background(page.locator("body"));
    expect(chosen).not.toBe(other);
    expect(await background(page.locator("#rankings .mark").first())).not.toBe(canvas);
  });
});
