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

Open: her name (provisional «Isabel», which is not a guest in the data), her age, and a check of the persona in a conversation with a real guest house (aggregated numbers only, no guest data).

## Product Purpose

A one-page dashboard that turns the guest house's own bookings into a few decisions: who to contact and when, what discount to give on direct bookings, what price to charge in each season. Success: she can say what to do this month after a few seconds on the page, and how much it is worth per year (the KPI).

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

## Accessibility & Inclusion

Body text 16 px or more, touch targets of 44 px, WCAG 2.2 AA contrast, visible keyboard focus, nothing shown only in a tooltip or only by colour.
