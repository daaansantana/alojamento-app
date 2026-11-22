---
name: nexo
description: A sua casa, com nexo. Deep green, sage and mint on a warm white, and type that reads without glasses.
colors:
  ground: "#FAFAF8"
  card: "#FFFFFF"
  ink: "#1A2B25"
  ink-soft: "#4B5A55"
  divider: "#E1E3DF"
  control-border: "#7C8A84"
  nexo: "#0F3D33"
  nexo-pressed: "#0A2E26"
  accent-panel: "#EAF3EE"
  nav-pill: "#DCEBE3"
  muted-panel: "#F0F1EE"
  sage: "#4E8B74"
  mint: "#B9D6C6"
  success: "#1E7A46"
  destructive: "#B42318"
  chart-bar: "#4E8B74"
  channel-direct: "#1F8A5F"
  channel-booking: "#B7791F"
  channel-airbnb: "#C2456B"
  commission: "#7C8A84"
typography:
  h1:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.667rem"
    fontWeight: 700
    lineHeight: 1.2
  h1-desktop:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
  h2:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  lead:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.056rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.889rem"
    fontWeight: 400
    lineHeight: 1.45
  statement:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.333rem"
    fontWeight: 700
    lineHeight: 1.35
  figure:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
  kpi:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "2.333rem"
    fontWeight: 700
    lineHeight: 1.1
rounded:
  control: "12px"
  panel: "20px"
  pill: "999px"
spacing:
  gutter-phone: "16px"
  gutter-desktop: "40px"
  section: "28px"
  section-wide: "32px"
  content-max: "1120px"
  aside: "400px"
  reading-max: "760px"
components:
  button-primary:
    backgroundColor: "{colors.nexo}"
    textColor: "{colors.card}"
    rounded: "{rounded.control}"
    height: "52px"
  button-primary-pressed:
    backgroundColor: "{colors.nexo-pressed}"
    textColor: "{colors.card}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "48px"
  panel-featured:
    backgroundColor: "{colors.accent-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px"
  panel-muted:
    backgroundColor: "{colors.muted-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "20px"
  nav-item-active:
    backgroundColor: "{colors.nav-pill}"
    textColor: "{colors.nexo}"
    rounded: "{rounded.pill}"
---

# Design system: nexo

## Overview

nexo is the app's name and its look: «A sua casa, com nexo.» A deep green, a sage and a mint on a warm white, and type that reads without glasses. The app is a working tool for Isabel, who runs the house herself, opens it on her phone between tasks and is at the age when small print starts to cost. Four screens, one of her questions each, with the navigation always in view.

The page is calm. Boldness is spent in one place only: the price thermometer on Preços, the one chart with strong contrast. Everything else is warm white ground, dark ink and a single green.

- Mode: Operate. Scanability, consistency and the real scene (a phone, in a hurry, at arm's length) outrank expression.
- Only a light theme.
- Motion: none beyond opening and closing; `prefers-reduced-motion` turns even that off.
- Out of scope: gradients, textures, background patterns, a dark theme, illustrations.

## Brand

### Name

- **nexo**, always in lower case. The line is «A sua casa, com nexo.»
- The name shows as the logo in the header and in the browser tab («Preços · nexo»). Screen titles (`h1`) stay as they are: they are her questions, not the brand.

### Logo

An arch with a dot: a doorway and the person in it. The files are used as they are, never redrawn; the wordmark is Poppins already turned into outlines, so the font is never loaded.

| File | Use |
| --- | --- |
| `logo-horizontal.svg`, `logo-horizontal-branco.svg` | The header, linking to Início, with `aria-label="nexo"` |
| `logo-vertical.svg`, `logo-vertical-branco.svg` | The error and «não encontrado» screens, when there is room |
| `simbolo.svg`, `simbolo-branco.svg` | Small places |
| `icone-app.svg` | The app icon: white symbol on nexo green, rounded corners |
| `icone-app-menta.svg` | A variant; not used in the app |

The white versions go on nexo green only.

- **Clear space:** around the logo, at least the width of one leg of the arch (the arch's stroke). In the horizontal logo that is about 18% of its height: 5 px around a 28 px logo.
- **Smallest sizes:** the icon reads at 16 px and the symbol at 16 px; the dot must stay visible.

## Colors

Warm white and dark green ink, with nexo green as the one accent. Colours live as variables in `app/globals.css`, mapped onto the shadcn tokens (`background`, `card`, `popover`, `foreground`, `primary`, `ring`, `accent`, `muted`, `border`, `destructive`).

| Role | Value | Rule |
| --- | --- | --- |
| `background` | `#FAFAF8` | |
| `card`, `popover` | `#FFFFFF` | |
| `foreground` (ink) | `#1A2B25` | 14.2:1 |
| `muted-foreground` (soft ink) | `#4B5A55` | 7.0:1; never lighter |
| `primary` (nexo) | `#0F3D33`, `#0A2E26` when pressed | 12.1:1; text on it is `#FFFFFF` |
| `ring` (focus) | `#0F3D33` | |
| `accent` (the featured panel) | `#EAF3EE` | one per screen |
| Navigation pill | `#DCEBE3` | |
| `muted` (the «E se…?» panels) | `#F0F1EE` | |
| `border` | `#E1E3DF` | decorative only |
| Control border | `#7C8A84` | 3.5:1 |
| Sage | `#4E8B74` | icons, bars and type of 24 px or more only; never body text (4.0:1) |
| Mint | `#B9D6C6` | backgrounds only; never text (1.6:1) |
| Month bars | `#4E8B74`; the best month `#0F3D33` | |
| Channels | Direto `#1F8A5F`, Booking `#B7791F`, Airbnb `#C2456B` | they pass the colour-blindness check; Direto and Booking sit close for red-green colour blindness, so the written labels stay |
| Thermometer | the house: filled circle `#0F3D33`; the market: ring `#1A2B25` | |
| Success | `#1E7A46` | close to the brand, so always with the tick and the sentence |
| `destructive` | `#B42318` | |

### Named Rules

- **One green panel.** At most one accent-panel surface per screen. It marks the one thing to do.
- **Sage and mint are not for reading.** Sage carries icons, bars and large type; mint carries backgrounds; neither carries body text.
- **Text never takes a series colour.** Chart labels use ink or soft ink; identity never rides on colour alone.

## Typography

Atkinson Hyperlegible Next, from the Braille Institute, made for low vision, loaded through `next/font/google` (variable, `latin`, `display: swap`). One family for everything; Poppins lives only inside the logo, as outlines, and neither Poppins nor Inter is loaded. Its slashed zero stays: it is how the face tells 0 from O.

- Base: `html { font-size: 112.5% }`, 18 px. «Letra maior» sets 125%, 20 px, and everything in `rem` grows with it, touch targets included.
- Numbers use `tabular-nums`.

### Hierarchy

| Role | Phone | Desktop |
| --- | --- | --- |
| `h1` | 30 px | up to 36 px |
| `h2` | 21 to 24 px | 21 to 24 px |
| Opening sentence | 19 px | 19 px |
| A screen's statement («Em 7 dos 12 meses…», the year's sentence) | 24 px | 24 px |
| A figure (46%, 104 €) | 36 px | 36 px |
| Body | 18 px | 18 px |
| Smallest text | 16 px | 16 px |
| The KPI figure | 42 px | 42 px |

### Named Rules

- **Nothing under 16 px.** Not badges, not axis ticks, not legends. The one exception: the twelve month names under the year's chart are 15 px on phones, so they stand apart.
- **Sentence case.** A capital only at the start of a sentence; no uppercase labels.

## Layout

- **Navigation always in view.** Below 1024 px, a bar fixed at the bottom with four destinations (icon and word), `env(safe-area-inset-bottom)` included, and bottom padding on the content so nothing hides behind it. From 1024 px, the same list at the top, sticky, beside the name «A sua casa».
- **Header:** the nexo logo, linking to Início, and the «Letra maior» toggle.
- **Width:** content up to 1120 px. Gutters of 16 px on the phone and 40 px on the computer. Two columns on the computer, `1fr` and 400 px, the aside sticky where the screen says so. O ano is a single column of 760 px at most, on every width.
- **Rhythm:** 28 to 32 px between sections.
- **Lists:** straight rows with dividers, at least 72 px tall when the whole row is a link.
- Nothing scrolls sideways below 1024 px; nothing is lost at 200% zoom or with «Letra maior».

## Elevation & Depth

Flat. No shadows anywhere: edges are borders and dividers, and depth comes from the tinted panels alone (accent for the one thing to do, muted for «E se…?»).

## Shapes

- 12 px corners on buttons, toggles and cards.
- 20 px on the featured panel, the muted panels and the thermometer.
- Pills at 999 px: the active navigation item, small tags.
- List rows are square, separated by dividers only.

## Components

### Buttons

- **Primary:** nexo green fill, white text, 52 px tall, full width on the phone inside the featured panel. Pressed `#0A2E26`.
- **Secondary:** white, control-border edge, ink text, 48 px tall.
- Every button says what happens, with a Solar `linear` icon of 22 to 26 px when one helps. The same action has the same name everywhere. No «→» in labels.

### Choices

- **Toggle groups** (shadcn `ToggleGroup`) for picking a list or a question: large, two lines when needed, `aria-pressed`.
- **Steppers** for amounts: «−», the value large in an `<output aria-live="polite">`, «+». Or a row of value buttons (0%, 5%, 10%…). Never sliders: on touch, hitting an exact value on a slider is hard.

### Cards / Containers

- **Featured panel:** accent ground, 20 px corners, the action's icon in a white circle, the title as `h2`, the text, the worth in bold, then the primary button.
- **Muted panel:** «E se…?» blocks, with their answer in `aria-live="polite"`.
- **Bordered card:** white with a divider edge and 12 px corners, for the KPI aside and link cards.

### Navigation

- Four destinations: Início, Hóspedes, Preços, O ano. `aria-label="Principal"`, `aria-current="page"` on the active one.
- Phone: the active item has a pill behind its icon and its word in bold.
- Computer: the active item has a 3 px nexo green underline.

### The price thermometer (signature)

Her price per night beside the market's, month by month, drawn in HTML and CSS so each month is a button.

- A ruler from 60 € to 180 €, axis marks on one line with the first and last flush to the ends.
- The house: a filled nexo green circle. The market: an ink ring with a white centre. The stretch between them is thicker.
- The month in focus sits in the featured panel with both figures large; the twelve months below are `<button aria-pressed>` rows with a full `aria-label`.
- A table view of the same values, one tap away.

### Charts

- One axis only. A legend whenever there are two series.
- Each chart has a summary in `aria-label` and a list or table for screen readers.

## Do's and Don'ts

### Do:

- Answer her question first; fold the numbers behind it away.
- Keep targets at 48 px or more, primary buttons at 52 px.
- Write short sentences in European Portuguese, active voice, addressing her in the third person («Pode ganhar», «Escreveu a»).
- Put the unit on every number, with the non-breaking space before «€» that `Intl` already adds.

### Don't:

- Use shadows, gradients, textures or more than one green panel on a screen.
- Use sliders, hidden menus or tooltips as the only way to see something.
- Separate data with «·», put «→» in buttons, or use acronyms on screen (INE is the one exception).
- Repeat a number on the same screen.
- Animate anything beyond opening and closing.
