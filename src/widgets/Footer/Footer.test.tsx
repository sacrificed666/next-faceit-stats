import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SITE } from "@/shared/lib/site";
import { i18nFor, renderWithI18n } from "@/test/render";

import { Footer } from "./Footer";

vi.mock("next/cache", () => ({ cacheLife: vi.fn<(profile: string) => void>() }));

describe("Footer", () => {
  it("credits the author and the FACEIT Data API in the language of the page", async () => {
    renderWithI18n(await Footer({ i18n: i18nFor("de") }), "de");
    expect(screen.getByText(`© ${new Date().getFullYear()}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /FACEIT Data API/ })).toHaveAttribute(
      "href",
      "https://docs.faceit.com/docs/data-api/data",
    );
    expect(screen.getByRole("link", { name: /Code auf GitHub/ })).toHaveAttribute("href", SITE.repository);
  });
});
