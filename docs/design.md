# 🎨 Design system

## 💡 Principles

- 🔶 **FACEIT at heart**: a calm dark or light surface with FACEIT orange for everything interactive.
- 🔢 **Numbers first**: large proportional figures for headlines, tabular figures in tables, units in a quieter tone.
- 🧑 **Identity through faces**: players are recognised by their avatar and nickname, never by a colour, which keeps the data colours free for meaning.
- 🪶 **Quiet chrome**: hairline borders and gridlines, soft shadows, no decoration that is not data.
- 📱 **One layout for every screen**: the same markup reflows from phones to wide screens; nothing is duplicated for mobile.

## 🔤 Typography

**Montserrat** is loaded with `next/font` and self-hosted at build time. Only the Latin subset is preloaded; Latin Extended (Polish) and Cyrillic (Ukrainian) are fetched through `unicode-range` when a page needs them. The generated images use the same font from `src/shared/assets/fonts` (SIL Open Font License).

| Role             | Style                                                  |
| ---------------- | ------------------------------------------------------ |
| 🏷️ Page title    | 36-60 px, extra bold, tight tracking                   |
| 📰 Section title | 20-24 px, bold                                         |
| 🔢 Stat values   | 24-30 px, bold, proportional figures                   |
| 📋 Table cells   | 14 px, tabular figures                                 |
| 🔖 Kicker        | 12 px, bold, uppercase with wide tracking, accent text |

## 🎨 Tokens

All colours are CSS custom properties defined in `src/app/globals.scss` and exposed to Tailwind through `@theme inline`. The default Tailwind palette is switched off, so only tokens can be used.

| Token           | ☀️ Light              | 🌙 Dark               | Used for                                           |
| --------------- | --------------------- | --------------------- | -------------------------------------------------- |
| `plane`         | `#f3f3f0`             | `#0f1011`             | Page background                                    |
| `surface`       | `#fcfcfb`             | `#18191b`             | Cards and tables                                   |
| `raised`        | `#ffffff`             | `#202124`             | Tooltips                                           |
| `inset`         | `#ebeae6`             | `#26272a`             | Tracks, wells and placeholders                     |
| `ink`           | `#111110`             | `#f5f5f3`             | Primary text                                       |
| `ink-secondary` | `#4d4c48`             | `#c3c2b7`             | Secondary text                                     |
| `ink-muted`     | `#64635e`             | `#a09f98`             | Captions, axis labels                              |
| `accent`        | `#ff5500`             | `#ff5500`             | Selected controls, focus rings, skip link          |
| `accent-text`   | `#b33a0a`             | `#ff7a3d`             | Links and accent text                              |
| `data`          | `#eb6834`             | `#d95926`             | Bars, lines and meters                             |
| `data-muted`    | `#c3c2b7`             | `#4a4a46`             | Context series                                     |
| `good` / `bad`  | `#006300` / `#b42323` | `#3fbf3f` / `#f06a6a` | Wins and losses, positive and negative differences |
| `div-positive`  | `#75cca7`             | `#007e57`             | Heatmap cells above the baseline                   |
| `div-middle`    | `#f0efec`             | `#383835`             | Heatmap cells at the baseline                      |
| `div-negative`  | `#ea6e52`             | `#c0453b`             | Heatmap cells below the baseline                   |

Every text token reaches **4.5:1** on the surfaces it sits on and every mark reaches **3:1**, measured with a contrast script rather than by eye.

## 🌗 Themes

The light tokens live on `:root`. The dark tokens are applied twice: inside `@media (prefers-color-scheme: dark)` for `:root:not([data-theme="light"])`, and for `:root[data-theme="dark"]`, so the system setting works without JavaScript and an explicit choice wins in both directions. An inline script in `<head>` copies a saved choice to `data-theme` before the first paint and gives the `theme-color` meta tags the same colour, so the browser's address bar matches a forced theme.

| Preference                  | What changes                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔆 `prefers-contrast: more` | Secondary and muted text move closer to the primary ink, and borders get two to three times stronger                                                                 |
| 🖥️ `forced-colors: active`  | Selected options use `Highlight`, data bars `Highlight` and `GrayText`, reference lines `CanvasText`, current links are underlined; heatmap cells keep their colours |
| 🐢 `prefers-reduced-motion` | Transitions, the fade-in of data and the skeleton pulse are switched off                                                                                             |

> [!TIP]
> All three can be tried in Chrome DevTools under **Rendering**, with the emulation options for `prefers-contrast`, `forced-colors` and `prefers-reduced-motion`.

## 📈 Data visualisation

| Job                          | Form                              | Colour                                                                                               |
| ---------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 🏆 Compare players           | Ranked horizontal bars            | One hue (`data`), names and values as text                                                           |
| 📈 Change over time          | Small multiples on a shared scale | `data` for the rolling average, `data-muted` for single matches, a dashed line for the squad average |
| 🗺️ Above or below a baseline | Heatmap                           | Diverging green ↔ red around a grey midpoint (50 % wins, 1.00 K/D), paler for small samples          |
| 🔁 How often                 | Heatmap                           | One hue, lighter to darker                                                                           |
| ✅ Win or loss               | Badges                            | `good` / `bad` **with** the letter W or L                                                            |
| 🎚️ Progress                  | Meters                            | The level colour or `data` on an `inset` track                                                       |
| 🥊 Two players               | Mirrored bars from the centre     | `data` for the leader of the row, `data-muted` for the other                                         |

Rules that keep the charts honest and readable:

- 🎯 No colour per player. Ten players would need ten hues, and past eight they become indistinguishable, especially with colour blindness.
- 📏 Bars are at most 20 px thick with a rounded data end and a square baseline.
- ✏️ Lines are 2 px with round joins; gridlines are solid 1 px hairlines.
- 🏷️ Values are written as text next to every bar and inside every heatmap cell; the tooltip only adds detail.
- 📋 Every chart has a data table or an equivalent text alternative.
- 🧮 Small samples are pale: a heatmap cell reaches its full colour only from five matches on, so one lucky game does not look like a strength.

### 🟢 Green and red for everyone

Green for above and red for below matches the rest of the interface, where wins and positive differences are green. Red and green are also the pair that people with red-green colour blindness (about one in twelve men) confuse most, so the two poles are chosen to stay apart for them too:

- 🧭 The green leans towards teal (OKLCH hue 165) and the red towards vermilion (hue 34), so they still differ on the blue-yellow axis that red-green colour blind eyes see.
- 🌗 In the light theme the green is lighter than the red, which adds a difference in lightness.
- 🔢 Every cell prints its value and the legend names both ends, so colour is never the only clue.

| Pair, light theme | Normal vision | Protanopia | Deuteranopia | Tritanopia |
| ----------------- | ------------: | ---------: | -----------: | ---------: |
| 🔵 Blue ↔ red     |          17.7 |       13.1 |         14.7 |       22.3 |
| 🟢 Green ↔ red    |          25.8 |       20.6 |         11.7 |       31.9 |

The numbers are OKLab distances between the two poles after simulating each kind of colour blindness (Machado et al.), where about 10 is easy to tell apart. Text on every cell keeps at least **4.6:1** in both themes.

> [!NOTE]
> The dark theme has less room: light text needs dark cells, so the two poles differ mainly in hue and stay around 7.7 apart for red-green colour blindness. The printed values carry the meaning there.

## 🧩 Components

| Component                  | Purpose                                                     |
| -------------------------- | ----------------------------------------------------------- |
| `Section`                  | Titled region with description and actions                  |
| `SegmentedControl`         | Native radio group styled as pills; used for every switch   |
| `StatTile`                 | Label, value, difference and detail                         |
| `LevelBadge`               | FACEIT-style ring with the level number in the level colour |
| `LevelProgress`, `Meter`   | Native `<meter>` styled with tokens                         |
| `BarList`                  | Ranked bars with an optional reference line                 |
| `LineChart`                | SVG line chart with crosshair, tooltip and slider           |
| `DataTable`                | Collapsible table behind every chart                        |
| `ResultBadge`, `FormGuide` | W/L badges and the last results                             |
| `RankMedal`                | Gold, silver and bronze place for the top three             |
| `CompareRows`              | Two players per row with mirrored bars and the leader named |
| `MapPool`                  | Diverging heatmap with a squad row and a legend             |
| `Skeleton`                 | Pulsing placeholders and a spoken loading message           |
| `LanguageMenu`             | Flag and code button with a native popover of languages     |
| `Avatar`, `BackdropImage`  | Images that fall back gracefully when the CDN fails         |

## 📐 Layout

- 📏 Content is centred with a maximum width of 80 rem and 16-32 px side padding.
- 🧱 Grids step up from one column on phones to two, three and five columns.
- 📊 Wide tables scroll sideways inside their card with the first column pinned; the page itself never scrolls horizontally.
- 📌 The range toolbar is a floating pill that sticks to the top while scrolling; days and matches are two clusters of one radio group, and on screens narrower than about 360 px the matches move to a second row.
- 🧭 On phones the navigation moves to its own row under the logo, and the language menu opens under its button with CSS anchor positioning where supported.
- 🌍 Long words in German, Dutch or Polish wrap instead of widening the page; every page is checked for sideways scrolling at 320 px, the width of a 1280 px window zoomed to 400 %.

## 🌊 Motion

Motion is limited to short colour and lift transitions on hover, and a quick fade-in of the data when the address asks for a range or players other than the prerendered default. With `prefers-reduced-motion: reduce`, transitions, the fade and the skeleton pulse are switched off and smooth scrolling becomes instant.

## 🔶 Brand mark

The logo is a rounded square with an orange gradient from `#ff9a4d` to `#ff4a00`, a soft white sheen across the top and a bold near-black **F**. The glyph is drawn from rectangles instead of a font, so the favicon, the header, the Apple touch icon and the Open Graph cards look the same everywhere. It deliberately does not reuse FACEIT's own logo.

## 🖼️ Iconography

Icons are a small set of 24 px stroke icons drawn in `Icon.tsx` and inherit the text colour. They are hidden from assistive technology unless they carry meaning on their own.
