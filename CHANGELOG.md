# 📜 Changelog

All notable changes to FACEIT Stats are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). How versions are cut is described in [docs/releases.md](./docs/releases.md).

## [Unreleased]

## [1.0.0] - 2026-10-05

The first release.

### Added

- 🧑‍🤝‍🧑 A squad overview with the average ELO, squad K/D and win rate, matches played together and the hottest streak.
- 🃏 Player cards with the level, ELO progress to the next level, region ranking, recent results and the last match.
- 🕹️ One feed of recent matches for the whole squad, a sortable leaderboard, rankings against the squad average and per-player trend charts.
- 🗺️ A map pool heatmap of win rate, K/D or picks, duos and lineups detected from shared matches, and records such as the most kills or the longest win streak.
- 👤 Player pages with current form, a trend chart, maps, a filterable match history, teammates, lifetime and playstyle statistics.
- ⚔️ A head-to-head comparison of two players, including every match they played together or against each other.
- 🎚️ One range for every page: the last 7, 30 or 90 days, or the last 20, 50 or 100 matches, kept in the address.
- ⚙️ A settings panel with the theme (automatic, light or dark, without a flash), full or reduced effects (reduced by default outside capable Apple devices) and the language.
- 🌍 Ten languages under their own addresses: English, Ukrainian, Czech, German, Spanish, French, Italian, Dutch, Polish and Portuguese, with correct plurals, numbers and dates.
- ♿ WCAG AA support: landmarks, sortable table headers, native radio groups and meters, and charts with data tables.
- 🔎 Canonical and `hreflang` links, generated share cards for every page and language, a sitemap, robots rules and JSON-LD.
- ⚡ Prerendered pages refreshed every five minutes, a shared cache for FACEIT responses and throttled, retried requests.
- 🛡️ A server-only API key, validated FACEIT data, flags served by the app itself and strict security headers.
- 🧪 Unit tests, end-to-end tests against a mock FACEIT API, axe checks and a Lighthouse budget in CI.
- 🐳 Docker images for development, staging and production: a multi-stage Dockerfile, a Compose overlay per environment, a non-root standalone server and environment files passed to the build as secrets.

[Unreleased]: https://github.com/sacrificed666/faceit-stats/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sacrificed666/faceit-stats/releases/tag/v1.0.0
