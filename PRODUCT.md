# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

### Persona

The owner of a small guest house with 8 rooms, who runs it herself. She is not used to data and is not very confident with digital tools: she knows the Booking and Airbnb extranets, email and her phone, not spreadsheets or dashboards. She opens the app between tasks, often on her phone, and wants to know what to do next, not to read charts.

Her questions, in her words:
- «Como correu o ano?»
- «O que devo fazer este mês?»
- «Quanto ganho se mudar alguma coisa?»

Where each trait comes from:
- 8 rooms, 481 bookings, guests who come back and the same price all year: the data (`alojamento.xlsx`).
- Runs it herself: 76% of local-accommodation owners manage alone (NOVA SBE for ALEP, 2023). Eight in ten registration holders have one property (RNAL, in the NOVA SBE study for ALEP, 2025).
- The house matters to the family budget: for 39% of owners it is more than 60% of it (NOVA SBE for ALEP, 2023).
- Not confident with digital tools: in Portugal, 27.6% of people aged 16 to 74 have below-basic digital skills and 10.6% do not use the internet (European Commission, Digital Skills Indicator 2.0, 2025). The team chose this trait for the persona.

Her name is Isabel («Isabel, que não é nenhum hóspede da base»: no guest in the data has this name).

Open: her age, and a check of the persona in a conversation with a real guest house (aggregated numbers only, no guest data).

## Product Purpose

The app is called **nexo**: «A sua casa, com nexo.» The brand is visual only (the logo, the name and the colours in `DESIGN.md`); the screens, the numbers and the texts stay as they are.

Four screens, each answering one of her questions, that turn the guest house's own bookings into a few decisions: who to contact and when, what discount to give on direct bookings, what price to charge in each season.

| Screen | Her question | What it answers |
| --- | --- | --- |
| Início (`/`) | «O que faço este mês?» | The action of the month, with what it is worth, and the yearly gain (the KPI) |
| Hóspedes (`/hospedes`) | «A quem escrevo?» | The two lists of guests to write to, the email already written and who she has written to |
| Preços (`/precos`) | «O meu preço está bem?» | Her price per night next to the market's, month by month |
| O ano (`/ano`) | «Como correu o ano?» | The summary, the months and, folded away, the numbers behind them |

Success: she can say what to do this month after a few seconds on the first screen, and how much it is worth per year (the KPI).

## Operating Context

- No backend: the browser reads `public/data/quartos.json` and `public/data/reservas.json`.
- The reference date comes from the data (2026-11-02), never from today.
- Guest contact happens outside the platforms, by email (`mailto:`), with an opt-out line.

## Capabilities and Constraints

- Stack: Next.js App Router, TypeScript, Tailwind, shadcn/ui (base-nova), Recharts, Zustand.
- Every number comes from a pure function in `lib/`, specified in `docs/SPEC.md`, with expected values in `scripts/golden.test.ts`. Components receive data by props and never call `lib/`, the store or `fetch`.
- Terms on screen: «Agora», «A preparar», «Sempre», «Mais tarde» for the alerts; no acronyms (RevPAR becomes «quanto rende cada quarto por noite», ADR «preço médio por noite»).
- Interface in Portuguese (pt-PT); code, names and commits in English.

## Evidence on Hand

- Data: `public/data/` (8 rooms, 481 bookings, November 2025 to October 2026).
- Findings and hypotheses: `HIPOTESES.md`; expected values: `docs/SPEC.md`.
- Market references with sources: `lib/benchmarks.ts`.
- No testimonials, quotes or user research exist yet. Do not invent them.

## Product Principles

1. Answer her question first; the numbers behind it come after, folded away.
2. One action at a time, in plain words, with the money it is worth.
3. Every number on screen is checked against the SPEC.
4. Works on a phone first.
5. Navigation always in view: the four screens are one tap away, with an icon and a word each, never behind a menu.
6. One question per screen: each screen answers one of her questions, and finds each thing always in the same place.

## Accessibility & Inclusion

Base text of 18 px (16 px at the smallest), with a «Letra maior» option at 20 px that she can keep on. Touch targets of 48 px or more. WCAG 2.2 AA contrast, visible keyboard focus, nothing shown only in a tooltip or only by colour, and nothing lost at 200% zoom.
