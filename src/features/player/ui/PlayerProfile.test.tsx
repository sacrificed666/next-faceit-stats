import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { profileData } from "@/features/player/model/profile";
import { makeMatch, makePlayer } from "@/test/factories";
import { renderWithI18n } from "@/test/render";
import { sampleSquad } from "@/test/squad";

import { PlayerProfile } from "./PlayerProfile";

function renderProfile() {
  const players = sampleSquad();
  const [anna] = players;
  if (!anna) throw new Error("The sample squad needs a first player");
  renderWithI18n(<PlayerProfile data={profileData(players, anna, Date.UTC(2026, 9, 3, 10))} />);
  return anna;
}

function historyRows(): HTMLElement[] {
  const table = screen.getByRole("table", { name: /Match history/ });
  return within(table).getAllByRole("row").slice(1);
}

describe("PlayerProfile", () => {
  it("compares the current form with the squad", () => {
    renderProfile();
    const form = screen.getByRole("region", { name: "Current form" });
    expect(within(form).getByText("Kills per death")).toBeInTheDocument();
    expect(within(form).getByText("3-2")).toBeInTheDocument();
  });

  it("filters the match history by result and map", async () => {
    const user = userEvent.setup();
    renderProfile();
    expect(historyRows()).toHaveLength(5);

    await user.click(screen.getByRole("radio", { name: "Wins" }));
    expect(historyRows()).toHaveLength(3);

    await user.selectOptions(screen.getByRole("combobox", { name: "Map" }), "de_nuke");
    expect(historyRows()).toHaveLength(1);
    expect(historyRows()[0]).toHaveTextContent("With bohdan");
  });

  it("lists teammates from the squad", () => {
    renderProfile();
    const teammates = screen.getByRole("region", { name: "Teammates" });
    expect(within(teammates).getByRole("link", { name: "bohdan" })).toBeInTheDocument();
    expect(within(teammates).getByText(/2 matches together/)).toBeInTheDocument();
  });

  it("links to the rest of the squad", () => {
    renderProfile();
    const nav = screen.getByRole("navigation", { name: "More from the squad" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/en/players/bohdan", "/en/players/chris", "/en"]);
  });

  it("shows lifetime numbers and playstyle meters", () => {
    renderProfile();
    const lifetime = screen.getByRole("region", { name: "Lifetime and playstyle" });
    expect(within(lifetime).getByText("1,838")).toBeInTheDocument();
    expect(within(lifetime).getByRole("meter", { name: "Entry rate" })).toHaveAttribute("aria-valuetext", "20%");
    expect(within(lifetime).getByRole("meter", { name: "Sniper kills" })).toHaveAttribute("aria-valuetext", "No data");
  });

  it("adds all-time map numbers to the map cards", () => {
    renderProfile();
    const maps = screen.getByRole("region", { name: "Maps" });
    expect(within(maps).getByText("All time: 109 matches · 51% win rate · 1.14 K/D")).toBeInTheDocument();
    expect(within(maps).getAllByText("No all-time data from FACEIT").length).toBeGreaterThan(0);
  });

  it("switches the trend to another metric", async () => {
    const user = userEvent.setup();
    renderProfile();
    const trend = screen.getByRole("region", { name: "Trend" });
    expect(within(trend).getByRole("slider", { name: "Kills per death per match for anna" })).toBeInTheDocument();
    await user.click(within(trend).getByRole("radio", { name: "ADR" }));
    expect(within(trend).getByRole("slider", { name: "Damage per round per match for anna" })).toBeInTheDocument();
  });

  it("explains what is missing for a player who plays alone and has no lifetime numbers", () => {
    const solo = makePlayer({
      nickname: "solo",
      lifetime: null,
      matches: [makeMatch({ finishedAt: Date.UTC(2026, 9, 2) })],
    });
    renderWithI18n(<PlayerProfile data={profileData([solo], solo, Date.UTC(2026, 9, 3))} />);
    expect(screen.getByText("No matches with the squad in this range")).toBeInTheDocument();
    expect(screen.getByText("FACEIT has no lifetime statistics for this player")).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "More from the squad" })).not.toBeInTheDocument();
  });
});
