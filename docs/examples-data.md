# Examples data (U7 lock)

Writer lock for every public `examples/valid` gallery card. Coder replaces fences + regenerates SVGs to match **story** (fence `title:`) and density; invalid fixtures stay off `/examples`.

Rules: conclusion titles, real units, no stem-slug captions, no competitor names. "illustrative" means fictional but real-world-shaped.

Densified seeds (EXAMPLES.md § Demo data) stay authoritative for `01`–`06`, `09`, and home/Play defaults.

| id | type | story | dataset | source note |
| --- | --- | --- | --- | --- |
| `01-bar-basic` | bar | Mar led Midtown box office at 9.2k tickets | 8 months Sep–Apr Midtown tickets; peak named in title | illustrative Midtown box-office shape |
| `02-line-multi` | line | Walk-up still leads member through week 12 | 12 weeks × walk-up / member season-pass sales | illustrative season-pass funnel |
| `03-area-basic` | area | Day 6 held the deepest queue at 48 holds | 10 days hold-queue depth | illustrative ticketing hold queue |
| `04-scatter-basic` | scatter | Rent climbs as commute shortens on the Beltline | 12 points: commute_min × rent_index Intown belt | illustrative Intown commute vs rent |
| `05-pie-raw` | pie | MARTA takes the largest mode share | 5 slices MARTA / Walk / Drive / Bike / Other | illustrative mode-share counts |
| `06-hist-basic` | hist | Most API samples stay under 40 ms | 18+ ms latency samples, mid cluster + slow tail | illustrative API latency histogram |
| `07-bar-gfm` | bar | Engineering still leads headcount at 24 | Department headcount categories | illustrative org headcount |
| `08-bar-comment` | bar | Mar led Midtown box office at 9.2k tickets | Same densified Midtown seed as 01 (comment fence) | illustrative Midtown box-office shape |
| `09-bar-twelve-categories` | bar | Jul peaked Midtown walks at 22k | 12 calendar months walk counts | illustrative monthly foot traffic |
| `10-bar-unicode` | bar | Tokyo leads regional RSVPs at 92 | Unicode city labels, RSVP counts | illustrative regional RSVPs |
| `11-line-omitted-title` | line | Tuesday peaked corridor delays at 120 min | Weekday delay minutes (title omitted in fence) | illustrative transit delay |
| `12-bar-zeros-large` | bar | Friday spike dwarfs quiet weekdays | Daily traffic with zeros + one large spike | illustrative sparse daily traffic |
| `13-line-unsorted-months` | line | December led signups at 55 | Monthly signups, unsorted input months | illustrative signup seasonality |
| `14-pie-sum-105` | pie | Budget lines overrun the 100% pie | Pie slices summing over 100 | illustrative budget overrun |
| `15-area-vis-tag` | area | Sprint 2 carried the deepest backlog at 24 | Sprint backlog depth over time | illustrative sprint backlog |
| `16-scatter-markvis-tag` | scatter | Humidity falls as afternoon heat rises | Temp × humidity outdoor samples | illustrative weather scatter |
| `17-bar-long-labels` | bar | North America leads cloud spend at 420k | Long region labels, spend USD | illustrative regional spend |
| `18-line-multi-regions` | line | US traffic still leads EU week over week | Two-region weekly traffic | illustrative multi-region traffic |
| `19-hist-weights` | hist | Mid-20s carry most of the weight mass | Weighted age histogram | illustrative weighted age bins |
| `20-pie-gfm` | pie | Chrome still leads browser share at 52 | Browser share pie via GFM table | illustrative browser share |
| `21-area-multi-series` | area | Queue A stays deeper than queue B | Two hold queues over a day | illustrative dual queue depth |
| `22-scatter-series` | scatter | Scores rise with study hours | Hours × score, two cohorts | illustrative study hours vs score |
| `23-bar-unit-only` | bar | API leads p99 latency at 120 ms | Service p99 with unit only | illustrative service latency |
| `24-line-numeric-x` | line | Noon peaked outdoor heat at 22°C | Numeric hour axis, temperature | illustrative diurnal temperature |
| `25-hist-vis-tag` | hist | 8 kb payloads show up most often | Payload size histogram | illustrative payload sizes |
| `26-pie-zeros` | pie | On still leads status mix at 70 | Status pie including zero slices | illustrative status mix |
| `27-bar-negatives` | bar | Sales led the net at +120 | P&L bars with negatives | illustrative signed P&L |
| `28-comment-line` | line | Tuesday peaked error bursts at 5 | Comment-fence daily errors | illustrative error bursts |
| `29-comment-pie` | pie | Core still leads product mix at 50% | Comment-fence product mix | illustrative product mix |
| `30-area-omitted-title` | area | Day 4 peaked warehouse intake at 120 | Daily intake area (title omitted) | illustrative warehouse intake |
| `31-bar-extra-unused-col` | bar | Enterprise leads NPS at 72 | Segment NPS with unused column | illustrative segment NPS |
| `32-line-markvis-version` | line | Retention fell to 70 by week 4 | Weekly retention curve | illustrative cohort retention |
| `33-scatter-omitted-title` | scatter | Delivery time rises with distance | Distance × minutes (title omitted) | illustrative delivery scatter |
| `34-hist-gfm` | hist | Twos show up twice as often | Small integer histogram via GFM | illustrative discrete counts |
| `35-bar-thirteen-cats` | bar | A12 led units shipped at 14 | Thirteen SKU categories | illustrative SKU units |
| `36-line-unicode-series` | line | Tokyo still leads Beijing on RSVPs | Unicode series names over weeks | illustrative bilingual RSVPs |
| `37-pie-markvis-tag` | pie | Billing leads support tickets at 40 | Ticket category pie | illustrative support mix |
| `38-area-unsorted-x` | area | September led park events at 40 | Monthly events, unsorted x | illustrative park events |
| `39-bar-gfm-unit` | bar | Archive leads storage at 8000 GB | Storage tiers with unit via GFM | illustrative storage tiers |
| `40-hist-large-sample` | hist | Idle CPU clusters near zero | Large CPU-idle sample set | illustrative CPU idle hist |
| `41-scatter-large-numbers` | scatter | Bigger metros, bigger GDP | Population × GDP large magnitudes | illustrative metro GDP |
| `42-line-vis-tag` | line | FPS holds near 60 through the run | Frame-rate over minutes | illustrative render FPS |
| `43-bar-comment-unit` | bar | Hosting leads monthly cost at 400 | Cost categories with unit | illustrative infra cost |
| `44-area-markvis-tag` | area | RSS climbed then eased after noon | Diurnal RSS feed hits | illustrative feed traffic |
| `45-pie-omitted-title` | pie | Yes leads survey answers at 60 | Yes/No/Other (title omitted) | illustrative survey mix |
| `46-bar-multi-series` | bar | Free still outnumbers pro seats | Free vs pro seats by month | illustrative seat mix |
| `47-line-long-labels` | line | Points climb through beta weeks | Long milestone labels on x | illustrative beta milestones |
| `48-scatter-vis-tag` | scatter | Most points sit near the axes | Sparse scatter near axes | illustrative sparse scatter |
| `49-hist-markvis-tag` | hist | Most retries stay at 0–1 | Retry-count histogram | illustrative retry hist |
| `50-comment-area` | area | Week 2 led pipeline depth at 11 | Comment-fence weekly pipeline | illustrative pipeline depth |
| `51-bar-omitted-xy` | bar | Gamma leads category share at 3 | Tiny categorical bar (x/y omitted) | illustrative tiny category bar |
| `52-line-zeros` | line | Tuesday took 12 minutes end-to-end | Daily duration with zeros | illustrative job duration |

## Theme × type proud cards

Each built-in theme should keep at least one proud bar / line / pie on the gallery filter. Prefer densified `01`, `02`, `05` fences under that theme — same stories as above; grammar comes from `theme=`, colors from optional `palette=`.

## Out of gallery

`examples/invalid/*` stay invalid and off the gallery. Edge thin toys must not be default thumbs.
