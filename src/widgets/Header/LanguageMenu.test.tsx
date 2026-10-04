import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import { LanguageMenu } from "./LanguageMenu";

afterEach(() => {
  document.cookie = "locale=; path=/; max-age=0";
});

describe("LanguageMenu", () => {
  it("names the current language", () => {
    renderWithI18n(<LanguageMenu />, "uk");
    expect(screen.getByRole("button", { name: "Мова: Українська (UK)" })).toBeInTheDocument();
  });

  it("links every language to the same page with the same filters", () => {
    window.history.replaceState(null, "", "/en/players/sacrificed?range=50");
    renderWithI18n(<LanguageMenu />);
    expect(screen.getAllByRole("link", { hidden: true }).map((link) => link.getAttribute("href"))).toEqual([
      "/en/players/sacrificed?range=50",
      "/uk/players/sacrificed?range=50",
      "/de/players/sacrificed?range=50",
      "/es/players/sacrificed?range=50",
      "/fr/players/sacrificed?range=50",
      "/it/players/sacrificed?range=50",
      "/nl/players/sacrificed?range=50",
      "/pl/players/sacrificed?range=50",
    ]);
    expect(screen.getByRole("link", { name: "English", hidden: true })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Polski", hidden: true })).toHaveAttribute("hreflang", "pl");
  });

  it("remembers the chosen language", async () => {
    const user = userEvent.setup();
    renderWithI18n(<LanguageMenu />);
    const polish = screen.getByRole("link", { name: "Polski", hidden: true });
    polish.addEventListener("click", (event) => event.preventDefault());
    await user.click(polish);
    expect(document.cookie).toContain("locale=pl");
  });
});
