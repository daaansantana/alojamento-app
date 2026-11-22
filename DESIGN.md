---
name: A sua casa
description: Casa caiada. Whitewashed walls, azulejo blue and type that reads without glasses.
colors:
  wall: "#FFFFFF"
  ink: "#172033"
  ink-soft: "#4A5468"
  divider: "#E3E7EE"
  control-border: "#7A879D"
  azulejo: "#1F4FA3"
  azulejo-pressed: "#173B7A"
  accent-panel: "#EEF3FB"
  nav-pill: "#E8EEF9"
  muted-panel: "#F3F5F8"
  success: "#1E7A46"
  destructive: "#B42318"
  chart-bar: "#6B8AC9"
  channel-direct: "#1F4FA3"
  channel-booking: "#B7791F"
  channel-airbnb: "#C2456B"
  commission: "#7A879D"
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
    backgroundColor: "{colors.azulejo}"
    textColor: "{colors.wall}"
    rounded: "{rounded.control}"
    height: "52px"
  button-primary-pressed:
    backgroundColor: "{colors.azulejo-pressed}"
    textColor: "{colors.wall}"
  button-secondary:
    backgroundColor: "{colors.wall}"
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
    textColor: "{colors.azulejo}"
    rounded: "{rounded.pill}"
---

# Design system: Casa caiada

## Overview

A guest house by the sea: whitewashed walls, the blue of azulejo tiles, and type that reads without glasses. The app is a working tool for Isabel, who runs the house herself, opens it on her phone between tasks and is at the age when small print starts to cost. Four screens, one of her questions each, with the navigation always in view.

The page is calm. Boldness is spent in one place only: the price thermometer on Preços, the one chart with strong colour. Everything else is white ground, dark ink and a single blue.

- Mode: Operate. Scanability, consistency and the real scene (a phone, in a hurry, at arm's length) outrank expression.
- Only a light theme.
- Motion: none beyond opening and closing; `prefers-reduced-motion` turns even that off.

## Colors

Whitewash and ink, with azulejo blue as the one accent. Colours live as variables in `app/globals.css`, mapped onto the shadcn tokens (`background`, `foreground`, `primary`, `accent`, `muted`, `border`, `destructive`).

### Primary

- **Azulejo** `#1F4FA3` (7.8:1 on white): primary buttons, the active screen, links, the house's own marker in charts. Pressed: `#173B7A`.

### Neutral

- **Wall** `#FFFFFF`: page and cards.
- **Ink** `#172033` (16.3:1): all text and chart labels.
- **Soft ink** `#4A5468` (7.6:1): secondary text. Never lighter.
- **Divider** `#E3E7EE`: list dividers and card edges. Decorative only.
- **Control border** `#7A879D` (3.6:1): the edge of every button, toggle and field.
- **Accent panel** `#EEF3FB`: the featured panel (one per screen). The navigation pill is `#E8EEF9`.
- **Muted panel** `#F3F5F8`: the «E se…?» panels.

### Status and data

- **Success** `#1E7A46` (5.4:1): «Escreveu a …», always with the tick icon and the words.
- **Destructive** `#B42318` (6.6:1): errors.
- **Chart bar** `#6B8AC9` (3.4:1): bars of the year; the best month in azulejo.
- **Channels:** Direto `#1F4FA3`, Booking `#B7791F`, Airbnb `#C2456B`; all three pass the colour-blindness check. Commission on the per-night chart: `#7A879D`.

### Named Rules

- **One blue panel.** At most one accent-panel surface per screen. It marks the one thing to do.
- **Text never takes a series colour.** Chart labels use ink or soft ink; identity never rides on colour alone.

## Typography

Atkinson Hyperlegible Next, from the Braille Institute, made for low vision, loaded through `next/font/google` (variable, `latin`, `display: swap`). One family for everything. Its slashed zero stays: it is how the face tells 0 from O.

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
- **Header:** the house icon, «A sua casa», and the «Letra maior» toggle.
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

- **Primary:** azulejo fill, white text, 52 px tall, full width on the phone inside the featured panel. Pressed `#173B7A`.
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
- Computer: the active item has a 3 px azulejo underline.

### The price thermometer (signature)

Her price per night beside the market's, month by month, drawn in HTML and CSS so each month is a button.

- A ruler from 60 € to 180 €, axis marks on one line with the first and last flush to the ends.
- The house: a filled azulejo circle. The market: a dark ring with a white centre. The stretch between them is thicker.
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

- Use shadows, gradients or more than one blue panel on a screen.
- Use sliders, hidden menus or tooltips as the only way to see something.
- Separate data with «·», put «→» in buttons, or use acronyms on screen (INE is the one exception).
- Repeat a number on the same screen.
- Animate anything beyond opening and closing.
