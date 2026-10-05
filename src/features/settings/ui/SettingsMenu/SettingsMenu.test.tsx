import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import SettingsMenu from "./SettingsMenu";

afterEach(() => {
  document.cookie = "locale=; path=/; max-age=0";
});

describe("SettingsMenu", () => {
  it("opens a labelled panel from the settings button", () => {
    renderWithI18n(<SettingsMenu />, "uk");
    const button = screen.getByRole("button", { name: "Налаштування" });
    const panel = document.getElementById(button.getAttribute("popovertarget") ?? "");
    expect(panel).toHaveAttribute("popover", "auto");
    expect(document.getElementById(panel?.getAttribute("aria-labelledby") ?? "")).toHaveTextContent("Налаштування");
    expect(screen.getByRole("button", { name: "Закрити", hidden: true })).toHaveAttribute(
      "popovertargetaction",
      "hide",
    );
  });

  it("links every language to the same page with the same filters", () => {
    window.history.replaceState(null, "", "/en/players/sacrificed?range=50");
    renderWithI18n(<SettingsMenu />);
    expect(screen.getAllByRole("link", { hidden: true }).map((link) => link.getAttribute("href"))).toEqual([
      "/en/players/sacrificed?range=50",
      "/uk/players/sacrificed?range=50",
      "/cs/players/sacrificed?range=50",
      "/de/players/sacrificed?range=50",
      "/es/players/sacrificed?range=50",
      "/fr/players/sacrificed?range=50",
      "/it/players/sacrificed?range=50",
      "/nl/players/sacrificed?range=50",
      "/pl/players/sacrificed?range=50",
      "/pt/players/sacrificed?range=50",
    ]);
    expect(screen.getByRole("link", { name: "English", hidden: true })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Čeština", hidden: true })).toHaveAttribute("hreflang", "cs");
  });

  it("remembers the chosen language", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SettingsMenu />);
    const portuguese = screen.getByRole("link", { name: "Português", hidden: true });
    portuguese.addEventListener("click", (event) => event.preventDefault());
    await user.click(portuguese);
    expect(document.cookie).toContain("locale=pt");
  });

  it("follows the system theme by default", () => {
    renderWithI18n(<SettingsMenu />);
    expect(screen.getByRole("radio", { name: "Auto", hidden: true })).toBeChecked();
  });

  it("stores an explicit theme and returns to the system theme", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SettingsMenu />);

    await user.click(screen.getByRole("radio", { name: "Dark", hidden: true }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByRole("radio", { name: "Dark", hidden: true })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "Auto", hidden: true }));
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("keeps the browser theme color in sync with an explicit choice", async () => {
    const user = userEvent.setup();
    const light = Object.assign(document.createElement("meta"), {
      name: "theme-color",
      media: "(prefers-color-scheme: light)",
      content: "#f3f3f0",
    });
    const dark = Object.assign(document.createElement("meta"), {
      name: "theme-color",
      media: "(prefers-color-scheme: dark)",
      content: "#0f1011",
    });
    document.head.append(light, dark);
    renderWithI18n(<SettingsMenu />);

    await user.click(screen.getByRole("radio", { name: "Dark", hidden: true }));
    expect([light.content, dark.content]).toEqual(["#0f1011", "#0f1011"]);

    await user.click(screen.getByRole("radio", { name: "Auto", hidden: true }));
    expect([light.content, dark.content]).toEqual(["#f3f3f0", "#0f1011"]);
    light.remove();
    dark.remove();
  });
});
