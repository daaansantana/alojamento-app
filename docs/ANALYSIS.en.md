# Analysis of the guest house data

English version of [ANALISE.md](ANALISE.md), which is the reference. The numbers in this document come from three places, and each table says which: the data contract (`docs/SPEC.md`, "SPEC"), the hypotheses registered before looking at the data (`HIPOTESES.md`, "HIPOTESES") and the `npm run explorar` script ("explorar"), which only computes what the SPEC does not have. The market references are in `lib/benchmarks.ts`, each with its source.

## 1. For whom and what for: the persona

The persona is described in [PRODUCT.md](../PRODUCT.md). In short:

- She is Isabel, the owner of a guest house with 8 rooms, which she runs herself.
- She is not used to data and is not very confident with digital tools. She knows the Booking and Airbnb extranets, email and her phone.
- She opens the app between tasks, often on her phone, and wants to know what to do next, not to read charts.
- Her questions: «Como correu o ano?» (how did the year go?), «O que devo fazer este mês?» (what should I do this month?), «Quanto ganho se mudar alguma coisa?» (how much do I gain if I change something?).

The teacher's question guides this analysis:

> With this data, how interesting is what we are going to build for the persona?

To answer it, the analysis shows what the data says about the house, which decisions the owner can make with it, and how much those decisions are worth per year. The answer, with the number, is in section 6.

## 2. The data

The data comes from the business's Excel file, `alojamento.xlsx`, converted once into one JSON per sheet, in `public/data/`.

| Sheet | Rows | Columns | What it has | Source |
| --- | --- | --- | --- | --- |
| `quartos.json` | 8 | 5 | name, type, capacity and price per night of each room | explorar |
| `reservas.json` | 481 | 12 | one row per booking: room, guest, country, dates, nights, guests, channel, total and status | explorar |

- **Period:** 1 November 2025 to 31 October 2026. That is 365 days × 8 rooms = 2,920 room-nights available (SPEC §1).
- **Reference date:** 2 November 2026, the latest check-out of a completed stay. It is computed from the data, never from today (SPEC §1).

The rules in SPEC §1, in plain words:

- **Statuses.** «Concluída» is a stay that happened. «Cancelada» was cancelled. «Confirmada» is booked and has not happened yet. Nights, revenue, occupancy and everything about guests count completed stays only. Cancelled bookings only count in cancellation rates.
- **Channels.** Booking, Airbnb and Direto (direct). "Platforms" means Booking and Airbnb.
- **Each night belongs to its own date.** A stay from 30 January to 2 February puts 2 nights in January and 1 in February. That is why the period has 1,344 nights and €133,985, while the completed stays add up to 1,345 nights and €134,065: booking 477 has 1 night after 31 October.
- **`total` is the list price, before commission.** It is the same on every channel. Commissions come from the public rates in `lib/benchmarks.ts`.
- **A guest is an email.** Each email has exactly one name.
- **Country belongs to the booking, not to the guest.** 82 of the 102 returning guests appear with more than one country.
- **A guest's stays are ordered by check-in date**, then by booking id.

### Data quality

`npm run explorar` checks both sheets. No rule fails.

| Check | Result | Source |
| --- | --- | --- |
| Empty values | 0 in both sheets | explorar |
| Exact duplicates and repeated booking ids | 0 | explorar |
| Check-in dates | 2025-11-01 to 2026-10-31 | explorar |
| Check-out dates | 2025-11-03 to 2026-11-03; the latest completed check-out is 2026-11-02 | explorar |
| Statuses | 440 completed (91%), 37 cancelled (8%), 4 booked (1%) | explorar |
| `nights` equals check-out minus check-in | 0 failures | explorar |
| Every `room_id` exists in `quartos` | 0 failures | explorar |
| Guests within the room's capacity | 0 failures | explorar |
| One name per email | 0 failures; 329 emails and 329 names | explorar |
| `total` equals room price × nights | always, in all 481 bookings | explorar |

| Dimension | Score (1 to 5) | Why | Source |
| --- | --- | --- | --- |
| Completeness | 5 | no empty values | explorar |
| Consistency | 5 | dates, nights, amounts and capacity agree | explorar |
| Uniqueness | 5 | no duplicates | explorar |
| Timeliness | 4 | a fixed snapshot of one year, ending on 2026-11-02 | explorar |
| Accuracy | 5 | one name per email; the price is always the room's | explorar |
| Integrity | 5 | every booking points to a room that exists | explorar |

Reading: the data is clean. No row had to be fixed or removed. This cleanliness is also a sign that the dataset is fictitious (see section 7).

## 3. Exploration

### The year

| Nights sold | Nights available | Occupancy | Revenue | Average price per night | Revenue per available room | Source |
| --- | --- | --- | --- | --- | --- | --- |
| 1,344 | 2,920 | 46% | €133,985 | €99.69 | €45.89 | SPEC §4, Whole period |

Reading: the house sold less than half of its nights. 54% of the year's nights went unsold (explorar, point 8).

### The months

| Month | Occupancy | Revenue | Demand | Source |
| --- | --- | --- | --- | --- |
| Nov 2025 | 38% | €9,550 | low | SPEC §4, By month and Price thermometer |
| Dec 2025 | 39% | €9,595 | low | SPEC §4, By month and Price thermometer |
| Jan 2026 | 32% | €7,715 | low | SPEC §4, By month and Price thermometer |
| Feb 2026 | 41% | €9,180 | normal | SPEC §4, By month and Price thermometer |
| Mar 2026 | 44% | €10,615 | normal | SPEC §4, By month and Price thermometer |
| Apr 2026 | 50% | €12,390 | normal | SPEC §4, By month and Price thermometer |
| May 2026 | 50% | €12,105 | normal | SPEC §4, By month and Price thermometer |
| Jun 2026 | 51% | €12,400 | normal | SPEC §4, By month and Price thermometer |
| Jul 2026 | 56% | €13,475 | high | SPEC §4, By month and Price thermometer |
| Aug 2026 | 65% | €15,990 | high | SPEC §4, By month and Price thermometer |
| Sep 2026 | 48% | €11,555 | normal | SPEC §4, By month and Price thermometer |
| Oct 2026 | 40% | €9,415 | low | SPEC §4, By month and Price thermometer |

"High" is an occupancy of 55% or more; "low", 40% or less (SPEC §3, `THERMOMETER`). On screen they read «mais procurado» and «menos procurado».

Reading: August was the best month and January the worst. From November to February, 600 of the 960 room-nights went unsold, 62.5% (SPEC §4, Alert facts; explorar, point 8).

### The rooms

| Room | Nights | Occupancy | Revenue | Source |
| --- | --- | --- | --- | --- |
| Suite Mar | 146 | 40% | €20,440 | SPEC §4, By room |
| Quarto Duplo Vista Mar 1 | 191 | 52% | €20,055 | SPEC §4, By room |
| Quarto Duplo Vista Mar 2 | 156 | 43% | €16,380 | SPEC §4, By room |
| Quarto Duplo Jardim | 188 | 52% | €15,980 | SPEC §4, By room |
| Quarto Twin | 166 | 45% | €13,280 | SPEC §4, By room |
| Quarto Familiar | 173 | 47% | €20,760 | SPEC §4, By room |
| Estúdio Terraço | 153 | 42% | €16,830 | SPEC §4, By room |
| Quarto Individual | 171 | 47% | €10,260 | SPEC §4, By room |

Reading: no room goes above 52%. The two sea-view doubles have the same price but not the same demand: the second was occupied on 26 of the 120 winter nights (SPEC §4, Winter room).

### The channels

| Channel | Bookings | Nights | Share of nights | Revenue | Commission | Kept per night | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Booking | 220 | 632 | 47.0% | €62,595 | €9,389.25 | €84.19 | SPEC §4, Channel mix and Net revenue |
| Direto | 127 | 383 | 28.5% | €37,605 | €0 | €98.19 | SPEC §4, Channel mix and Net revenue |
| Airbnb | 134 | 329 | 24.5% | €33,785 | €5,236.68 | €86.77 | SPEC §4, Channel mix and Net revenue |

Commissions use the typical rates: 15% on Booking and 15.5% on Airbnb (`lib/benchmarks.ts`).

Reading: commissions add up to €14,626, 10.9% of the period's revenue (SPEC §4). The platforms sell 71.5% of the nights. In European hotels with fewer than 20 rooms, that share is 32.1% (HOTREC 2024, in `lib/benchmarks.ts`).

### Cancellations

| Channel | Cancelled / bookings | Rate | Source |
| --- | --- | --- | --- |
| Airbnb | 11 / 134 | 8.2% | SPEC §4, Cancellations |
| Booking | 17 / 220 | 7.7% | SPEC §4, Cancellations |
| Direto | 9 / 127 | 7.1% | SPEC §4, Cancellations |
| All | 37 / 481 | 7.7% | SPEC §4, Cancellations |

| Country of the booking | Cancelled / bookings | Rate | Source |
| --- | --- | --- | --- |
| Alemanha (Germany) | 6 / 46 | 13.0% | SPEC §4, Cancellations |
| Espanha (Spain) | 10 / 81 | 12.3% | SPEC §4, Cancellations |
| Brasil (Brazil) | 5 / 45 | 11.1% | SPEC §4, Cancellations |
| França (France) | 4 / 39 | 10.3% | SPEC §4, Cancellations |
| Portugal | 9 / 166 | 5.4% | SPEC §4, Cancellations |
| Países Baixos (Netherlands) | 2 / 38 | 5.3% | SPEC §4, Cancellations |
| Reino Unido (United Kingdom) | 1 / 66 | 1.5% | SPEC §4, Cancellations |

Reading: the channel does not change cancellations; the difference is not significant (p = 0.94, SPEC §5, H2). Each country has few bookings, so the rates by country are fragile.

### Returning guests

| Group | Guests | Stays | Spent | Per stay | Per guest | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Returning | 102 | 230 | €69,535 | €302 | €682 | SPEC §4, Guest totals; explorar, point 4 |
| Came once | 210 | 210 | €64,530 | €307 | €307 | explorar, point 4 |

| What | Value | Source |
| --- | --- | --- |
| Returning guests' share of the spend | 51.9% of €134,065 | SPEC §4, Guest totals |
| A returning guest is worth, per guest, in the year | 2.22 times more | explorar, point 4 |
| Return stays (stays after the first) | 128, €38,115 | SPEC §4, Guests |
| Return stays through the platforms | 95 of 128 (74%), €28,265 | SPEC §4, Guests; explorar, point 8 |
| Commission on those stays, at 15% | €4,239.75 | SPEC §4, Direct-booking simulator |
| Commission on those stays, from minimum to maximum | €3,317.55 to €4,895.58 | explorar, point 6 |
| First stay direct, return stays through the platforms | 27 of 37 | SPEC §5, exploratory findings |
| Winter stays: returning / came once | 25% / 32% | explorar, point 5 |
| Returning guests who already came in winter | 49 | SPEC §4, Winter returners |

The minimum commission uses Booking at 15% and Airbnb at 3% (split fee); the maximum, Booking at 18% (with Preferred Partner) and Airbnb at 15.5% (`lib/benchmarks.ts`).

Reading: returning guests spend the same per stay, but are worth more than twice as much in the year because they come back. They bring half of what guests spend, and 3 in 4 return stays arrive through a platform, which charges commission for a guest who already belongs to the house.

### Profiles, levels and language

The teacher asked us not to treat guests as one mass: to see who they are and talk to each group in its own way.

**Levels.** Booking.com Genius moves up a level at 2, 5 and 15 stays in two years. Here only 1 guest reaches 5, so the house uses 2 and 3 stays. €840 is where the top 10% by spend start. These are starting values: the owner can change them under «Regras das etiquetas».

| Level | Rule | Guests | Source |
| --- | --- | --- | --- |
| Novo (new) | 1 stay | 210 | SPEC §4, Guest segments |
| Voltou (came back) | 2 stays | 81 | SPEC §4, Guest segments |
| Habitual (regular) | 3 or more | 21 | SPEC §4, Guest segments |
| Gasta mais (big spender) | €840 or more in all | 34 | SPEC §4, Guest segments |

**Profiles.** We tried automatic clustering (k-means on 8 variables: stays, spend, nights, party size, winter, summer, direct channel and days since the last stay). The groups barely separate (silhouette 0.26) and come out the same as a simple rule. We kept the rule, which the owner understands: the season of most stays, or «Estadas longas» (long stays) at 5 nights or more on average.

| Profile | Guests | Suggested message | Source |
| --- | --- | --- | --- |
| Winter | 66 | Come back in winter, 10% | SPEC §4, Guest segments |
| Summer | 110 | May or October, 10% | SPEC §4, Guest segments |
| Shoulder season | 85 | Book directly, 5% | SPEC §4, Guest segments |
| Long stays | 51 | A week, 10% | SPEC §4, Guest segments |

**Language.** 76% of consumers prefer information in their own language (CSA Research, 2020). The country comes with each booking; 82 guests booked under more than one country, so the latest stay counts. The flag shows the country; the language is shown by its own name (Deutsch, Français), because a flag is not a language. The ready messages exist in 7 languages and are drafts for a speaker of each to review.

**Limits.** Portuguese Law 41/2004 (art. 13-A) allows writing to existing customers about similar services if opting out is easy when the contact is collected and in every message, so the opt-out line always goes at the end. Booking.com gives an address for the stay only and does not allow marketing to it after check-out; the app marks those addresses and leaves them out of offers. The data has no phone numbers: WhatsApp and SMS only work with a number the owner adds by hand.

Sources: [Booking.com Genius](https://www.booking.com/genius.html); [CSA Research, 2020](https://csa-research.com/blogs-events/csa-in-the-media/press-releases/consumers-prefer-their-own-language); [Law 41/2004](https://diariodarepublica.pt/dr/detalhe/lei/41-2004-480710); [Hospitality Net, Booking.com addresses](https://www.hospitalitynet.org/opinion/4072000.html).

### Orphan nights

| What | Value | Source |
| --- | --- | --- |
| Empty nights between two stays in the same room | 87 | SPEC §4, Orphan nights |
| Of those, from June to September | 46 | SPEC §4, Orphan nights |

Reading: a single night is hard to sell to someone looking for two or more. There are 87 in the year, more than half of them in summer, when demand is higher.

### Price

| What | Value | Source |
| --- | --- | --- |
| Price per night of the 8 rooms | €60 to €140 | explorar, point 2 |
| `total` equals room price × nights | in all 481 bookings | explorar, point 2 |
| Different prices for the same room, by channel, month or number of guests | 1 (never changes) | explorar, point 2 |
| Average price per night, month by month | €96.07 to €104.12 | SPEC §4, Price thermometer |
| Occupancy, month by month | 32% to 65% | SPEC §4, Price thermometer |
| +10% in July and August, with the same nights | €2,946.50 more | SPEC §4, Pricing simulator |
| Nights it could lose in July and August and earn the same | up to 27 | SPEC §4, Pricing simulator |

Reading: the price is the same all year, on every channel. Occupancy doubles from January to August and the price does not follow.

### What the stays look like

| What | Value | Source |
| --- | --- | --- |
| Completed stays | 440 | explorar, point 3 |
| Nights per stay | mean 3.06; 2 nights in 28% and 3 nights in 28% | explorar, point 3 |
| One-person stays | 226 (51%) | explorar, point 3 |
| Most frequent country of the booking | Portugal, 157 (36%); then Spain, 70 (16%) | explorar, point 3 |
| Check-in weekday | between 12% (Monday) and 16% (Tuesday and Saturday) | explorar, point 3 |
| Check-in month | between 6% (January and February) and 10% (April, August and September) | explorar, point 3 |

Reading: short stays, half of them by one person, and check-ins spread across the week. No check-in day stands out.

## 4. Hypotheses

These six hypotheses were registered in `HIPOTESES.md` before we saw the results. The criteria did not change afterwards.

| # | Hypothesis | Criterion | Result | Status | Source |
| --- | --- | --- | --- | --- | --- |
| H1 | Returning guests keep booking through the channel of their first time | More than half of the return stays use the channel of the first booking | 34% of return stays (44 of 128); at random it would be 36% (p = 0.80) | Rejected | HIPOTESES H1; SPEC §5 |
| H2 | Direct bookings are worth more | Direct stay 0.3 nights longer than platforms and cancellations 2 points lower | Direct stay 0.33 nights longer (3.302 vs 2.969); cancellations 0.8 points lower (7.09% vs 7.91%); neither difference is significant | Rejected | HIPOTESES H2; SPEC §5 |
| H3 | The house depends on platforms more than a small European hotel | More than 32.1% of nights through platforms | 71.5% of nights through platforms | Confirmed | HIPOTESES H3; SPEC §5 |
| H4 | Solo travellers stay in rooms bigger than they need | More than 20% of one-person stays in rooms for 3 or 4 | 21.2% (48 of 226); statistically the same as 20% (p = 0.35) | Confirmed by the criterion | HIPOTESES H4; SPEC §5 |
| H5 | In winter, one room can leave short stays without losing guests | No night from November to February with all 8 rooms occupied | At most 7 of the 8 rooms occupied | Confirmed | HIPOTESES H5; SPEC §5 |
| H6 | Those who cancel least are those who come back most | The 2 countries with the fewest cancellations are among the 3 with the most returning guests | Fewest cancellations: United Kingdom and Netherlands. Most returning: Portugal, Spain and United Kingdom | Rejected | HIPOTESES H6; SPEC §5 |

What they change in the app:

- **H1 rejected:** returning guests are not loyal to a channel. It is worth asking them to book direct.
- **H2 rejected:** a direct booking is not worth more because it is longer or cancels less. It is worth more because it pays no commission.
- **H3 confirmed:** the house depends heavily on the platforms, and therefore on commissions.
- **H5 confirmed:** in winter there is always at least one free room. There is room to invite guests who already came at that time of year.

### Exploratory findings (not registered before seeing the data)

These findings came from exploring the data after testing the hypotheses. They are shown apart, with their uncertainty.

| Finding | Value | Source |
| --- | --- | --- |
| One price per room, the same all year, on every channel and for any number of guests | 1 price per room | SPEC §5; explorar, point 2 |
| After commission, a night is worth | €98.19 direct, €86.77 on Airbnb, €84.19 on Booking | SPEC §5 |
| Returning guests spend the same per stay as one-time guests | €302 vs €307; worth 2.2 times more in the year | SPEC §5; explorar, point 4 |
| Guests whose first stay was direct came back through the platforms | 27 of 37 stays (73%, 95% interval: 57% to 85%) | SPEC §5 |
| Returning guests come less in winter, but 49 already came then | 25% of stays vs 32% | SPEC §5; explorar, point 5 |
| Orphan nights | 87, 46 of them from June to September | SPEC §5 |
| Week-long stays look more direct, but it is not a finding | 14 of 36 (39%); the 95% interval (25% to 55%) includes the overall 26% | SPEC §5 |

## 5. Conclusions

**The problem in one sentence:** the owner lives off returning guests, who bring half of what guests spend (51.9%), but she pays commission on 3 of every 4 return stays (95 of 128), charges the same price all year and leaves more than half of the nights unsold (54%).

Sources: SPEC §4, Guest totals and Guests; explorar, points 2 and 8.

The app supports four decisions. Each has the number behind it.

| Decision | What the data shows | What it is worth | Source |
| --- | --- | --- | --- |
| **Who to contact and when.** In winter, write to guests who already came at that time of year. | 600 winter room-nights unsold; 49 returning guests already came from November to February | If 1 in 5 comes back, with 10% off: 10 stays and €2,643.84 | SPEC §4, Alert facts and Winter campaign |
| **What discount to give on direct bookings.** Ask guests who return through the platforms to book direct, with a discount below the commission. | 95 return stays through the platforms paid €4,239.75 in commission; returning guests are not loyal to a channel (H1) | If half move to direct, with 5% off: €1,413.25 a year. The discount stops paying off at 15%, the commission | SPEC §4, Direct-booking simulator; HIPOTESES H1 |
| **What price to charge in each season.** Raise the price a little in the busiest months. | July and August at 56% and 65% occupancy, at the usual price | +10% in July and August, with the same nights: €2,946.50. It can sell up to 27 fewer nights and earn the same | SPEC §4, Pricing simulator |
| **Orphan nights.** Sell the empty nights between two stays, for example with a one-night price. | 87 orphan nights, 46 from June to September | No estimate: the SPEC has no simulator for them | SPEC §4, Orphan nights |

Reading: the first three decisions have a value in euros that comes from the house's own data. The fourth stays as a warning, with no number, until there is a rule to estimate it.

## 6. Indicators and KPI

### Business indicators

| Indicator | The house | Comparison | Source |
| --- | --- | --- | --- |
| Occupancy (nights sold ÷ available) | 46% | from 32% in January to 65% in August | SPEC §4, Whole period and By month |
| Average price per night (revenue ÷ nights sold) | €99.69 | from €96.07 to €104.12 across the months | SPEC §4, Whole period and Price thermometer |
| Revenue per available room (revenue ÷ nights available) | €45.89 | €72.4 in Portugal in 2025: the house is at 63% | SPEC §4; INE 2025, in `lib/benchmarks.ts`; explorar, point 8 |
| Commissions' share of revenue | 10.9% (€14,625.93) | — | SPEC §4, Net revenue |
| Returning guests' share of the spend | 51.9% | — | SPEC §4, Guest totals |
| Value of 1 point of occupancy | €2,910.98 a year (29.2 nights × €99.69) | — | explorar, point 7 |

The comparison with INE is only a reference: it is a figure for the whole of Portugal, and this is a house with 8 rooms.

### The KPI: how much the house can gain per year

The KPI adds two decisions from section 5: platform return stays that move to direct, and the extra winter stays at the normal price. It does not count the summer price rise.

| Scenario | Platform returners who move to direct | Direct discount | Winter guests who come back | Direct | Winter | Total per year | Share of the year's revenue | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cautious | 1 in 5 (20%) | 5% | 1 in 10 (10%) | €565.30 | €1,468.80 | €2,034.10 (about €2,030) | 1.5% | SPEC §4, Yearly gain scenarios; explorar, point 8 |
| Likely | half (50%) | 5% | 1 in 5 (20%) | €1,413.25 | €2,937.60 | €4,350.85 (about €4,350) | 3.2% | SPEC §4, Yearly gain scenarios; explorar, point 8 |
| Optimistic | all (100%) | 0% | 3 in 10 (30%) | €4,239.75 | €4,406.40 | €8,646.15 (about €8,650) | 6.5% | SPEC §4, Yearly gain scenarios; explorar, point 8 |

The commission used is Booking's typical rate, 15% (`lib/benchmarks.ts`). Winter stays are worth €293.76 each, the mean of the winter stays (SPEC §4, Winter campaign).

### The answer to the teacher's question

With this data, the app is interesting for the persona because it tells her who to contact and with what discount, which is worth about €4,350 a year in the likely scenario (between about €2,030 and €8,650, 3.2% of the year's revenue), with no building work and no extra rooms.

## 7. Limits, sources and next step

### Limits

- **The dataset is fictitious, but treated as fact.** The data has no empty values, errors or duplicates (section 2), and the price never changes. In a real guest house, the numbers would be different. The method and the app stay the same.
- **There is only one year.** Season cannot be told apart from chance, and we cannot see whether a weak month repeats.
- **There is no booking date.** We do not know how far ahead each guest books, so the app cannot say when to raise or lower the price before a date.
- **There are no competitor prices.** The app does not know whether €99.69 a night is above or below the market around it. It only has the national INE comparison.
- **The scenarios are assumptions.** How many guests agree to book direct or come back in winter is not in the data. That is why the KPI has three scenarios and not a single number.
- **Small samples.** By country and by kind of stay there are few bookings. The tests in SPEC §5 (H1, H2 and H4) show that several differences are not significant.

### Sources

Market references, in `lib/benchmarks.ts`:

| Reference | Value | Source |
| --- | --- | --- |
| Typical Booking commission | 15%; 10% to 25%; about +3% with Preferred Partner | Hostfully, "Booking.com host fees", 4 Nov 2026 |
| Airbnb host-only fee | 15.5%; about 3% with the split fee | Airbnb, "Simplifying Airbnb service fees" |
| Share of nights through platforms, European hotels with fewer than 20 rooms | 32.1% (direct: 59.5%), 2023 data | HOTREC European Hotel Distribution Study 2024 |
| Revenue per available room in Portugal, 2025 | €72.4 | INE, Estatísticas do Turismo 2025 (reported by ECO, 10 Jul 2026) |
| Date since which Booking.com may not impose price parity | 14 Nov 2024 | European Commission, DMA factsheet on Booking.com, 28 Sep 2026 |

Persona context, in `PRODUCT.md`:

| Fact | Value | Source |
| --- | --- | --- |
| Local-accommodation owners who manage alone | 76% | NOVA SBE for ALEP, 2023 |
| Registration holders with a single property | 8 in 10 | RNAL, in the NOVA SBE study for ALEP, 2025 |
| Owners for whom the house is more than 60% of the family budget | 39% | NOVA SBE for ALEP, 2023 |
| People aged 16 to 74 with below-basic digital skills, in Portugal | 27.6% | European Commission, Digital Skills Indicator 2.0, 2025 |
| People aged 16 to 74 who do not use the internet, in Portugal | 10.6% | European Commission, Digital Skills Indicator 2.0, 2025 |

### Next step

An agent that watches market prices around the house and tells the owner when it is worth changing the price. It would answer the competitor-prices limit. It needs outside data and a server that runs on its own, and the brief provides for neither: today's app has no server and only reads the files in `public/data/`.

**Market alerts (prototype).** The prices page already shows how it would work, with simulated data: alerts with how much and when to change the price, the next 90 days by room, and where the data comes from.

| What would be real | Why it is not connected | Source |
| --- | --- | --- |
| The official market | INE is free, but comes out once a month, late | INE |
| The neighbours' prices, day by day | Only through paid services (PriceLabs, AirDNA). Copying Booking.com with a program is against its terms | Booking.com terms of service |
| Updating on its own | On Vercel's free plan a scheduled job runs at most once a day | Vercel, Cron Jobs |

So the data is simulated, anchored on INE (November to February, plus 2.4%, the ADR growth in Q2 2026) and on the house's real prices. AI would have one job only: write the explanation from the numbers. How much and when come from tested rules (SPEC, version 5), and the AI never makes up a number. nexo does not change prices on Booking.com or Airbnb either: it says how much and when, and the owner makes the change.

Sources: [Booking.com terms of service](https://www.booking.com/content/terms.html); [Vercel, Cron Jobs](https://vercel.com/docs/cron-jobs/usage-and-pricing); [Portuguese Government, tourist accommodation in Q2 2026](https://portugal.gov.pt/gc25/comunicacao/noticias/alojamento-turistico-mantem-trajetoria-de-crescimento-no-segundo-trimestre-de-2026).
