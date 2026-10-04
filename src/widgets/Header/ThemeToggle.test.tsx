import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithI18n } from "@/test/render";

import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("follows the system by default", () => {
    renderWithI18n(<ThemeToggle />);
    expect(screen.getByRole("radio", { name: "System theme" })).toBeChecked();
  });

  it("stores an explicit choice and returns to the system theme", async () => {
    const user = userEvent.setup();
    renderWithI18n(<ThemeToggle />);

    await user.click(screen.getByRole("radio", { name: "Dark theme" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByRole("radio", { name: "Dark theme" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "System theme" }));
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
    renderWithI18n(<ThemeToggle />);

    await user.click(screen.getByRole("radio", { name: "Dark theme" }));
    expect([light.content, dark.content]).toEqual(["#0f1011", "#0f1011"]);

    await user.click(screen.getByRole("radio", { name: "System theme" }));
    expect([light.content, dark.content]).toEqual(["#f3f3f0", "#0f1011"]);
    light.remove();
    dark.remove();
  });
});
