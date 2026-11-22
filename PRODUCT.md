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
- Very good at hosting, basic online: 102 of the 312 guests came back, and they brought 52% of the revenue (the data). Online she does the basics, so guests who already know her often come back through the platforms: 3 in 4 returns paid a commission, and guests whose first stay was booked direct came back through a platform in 27 of 37 stays (the data).
- A possible story, not a finding: a guest who wants to come back looks for the house, does not find a phone number and books on a platform. The data does not say why guests return through the platforms.
- The platforms are not the enemy: they bring guests who do not know her yet. Being listed on an online travel agency also brings bookings through the hotel's own channels, the «billboard effect»: a listing on Expedia raised reservations through the hotels' own channels by 7.5% to 26% (Anderson, «The Billboard Effect: Online Travel Agent Impact on Non-OTA Reservation Volume», Cornell Center for Hospitality Research, 2009). nexo helps the guests who already know her come back through her.

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

## Product Vision

The MVP helps her decide. The next steps help her be found and then run the house with less effort. None of this is built: it is the direction, so the MVP's choices do not close it off.

| Stage | What it solves | What |
| --- | --- | --- |
| Today (the MVP) | Deciding | The four screens: the action of the month, who to write to, her price next to the market's, and the year |
| Next | Being found | A one-page site for the house, made from what she fills in (photos, rooms, phone, WhatsApp, map, a booking request), with the registration number. Her Google Business Profile, step by step. A card with a QR code to her page, handed to each guest at check-out. A review request after each stay |
| Later | Running it with less effort | One calendar with the platforms, so direct bookings never overlap. An agent that fetches the INE values when they come out, watches the prices around the house and tells her when a change is worth it. The local-accommodation paperwork in one place |
| Scale | Other owners like her | Owners with one house who run it themselves |

Why the page and Google go together:
- On Google, a guest house like hers is a hotel property (inns, hotels and bed and breakfasts are; vacation homes and short-term rentals are not), so she can verify a free Business Profile on Search and Maps.
- Google's free booking links show a direct price next to the platforms at no cost to the property, but the link must take the guest to the property's own site, and only hotels that are bookable online can add rates. The page is what makes that possible.
- Sources: Google Hotel Center Help, «Connect with more travelers using free booking links» and «How to add and manage rates and availability to your Google Business Profile»; Google, «Make your hotel stand out on Google»; innRoad, «The Benefits of Using Google Free Booking Links for Your Property».

Rules the page and the card must follow:
- Advertising, commercial documents and merchandising of a local-accommodation property must show its registration number in the RNAL (Decreto-Lei n.º 128/2014, the local-accommodation law; Turismo de Portugal). nexo would add the number on its own.
- Only guests who gave their contact to the house are written to, with an opt-out in every message (Lei 41/2004, art. 13.º-A).

Scale:
- There were 120,002 local-accommodation registrations in Portugal in October 2026 (ALEP study, reported by RTP, 19 November 2026), and eight in ten registration holders have one property (RNAL, in the NOVA SBE study for ALEP, 2025).
- Business model, a hypothesis to test: a monthly fee lower than the commissions nexo helps her save.

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
