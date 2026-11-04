# Signal — startup funding tracker

A static, responsive D3 v7 dashboard backed by real public funding announcements. No build step, API key, or deployment required.

## Run

```bash
# If these packages are not already available:
python3 -m pip install --user -r scraper/requirements.txt
python3 scraper/scrape.py
./serve.sh
```

Open **http://localhost:8080**. On a Python installation that disallows `--user`, use a virtual environment (`python3 -m venv .venv`, then `.venv/bin/pip install -r scraper/requirements.txt`).

The included snapshot ends **2026-11-03**, covering 90 calendar days starting **2026-08-06**. To collect a different window:

```bash
python3 scraper/scrape.py --as-of 2026-11-03 --days 90 --pages 16
python3 scraper/scrape.py --offline  # deterministic rebuild using saved HTTP responses
python3 scraper/scrape.py --refresh  # force a fresh fetch of all pages
```

The default collector caches discovery feeds/pages for one hour and articles for seven days. Remove `data/cache/` for a completely clean collection. Network access is required for collection, the D3 CDN, and web fonts. The dashboard gives an explicit message if D3 or the JSON cannot load.

## Data and provenance

- `scraper/scrape.py` collects TechCrunch venture/fundraising RSS and paginated venture category pages, Crunchbase News RSS/archive pages and weekly biggest-rounds posts, Fortune Term Sheet RSS, PR Newswire, BusinessWire, GlobeNewswire, and date-bounded Google News RSS searches.
- Google News IDs are resolved to original publisher URLs. Only accessible publisher articles qualify; the feed headline alone is insufficient. Some queries lead to other public publishers, such as FinSMEs.
- Article titles, publication metadata, and article text are parsed with conservative regular expressions. Weekly Crunchbase rankings are parsed as separate company sections. The collector rejects missing company, amount, date, or article URL, aggregate figures, ambiguous body-only company matches, investment funds, and obvious non-round material.
- Amounts are **explicit USD figures**, with no estimated currency conversion. Missing investors remain empty arrays. Stage defaults to `Unknown`; sectors are keyword classifications. Debt may be included when explicitly identified.
- `data/rounds.json` contains the requested fields plus a short `evidence` excerpt and `extraction` label. Deduplication uses normalized company plus amount. Repeated collection replaces the snapshot rather than appending records.
- `data/meta.json` records the collection time, date bounds, counts per publisher, discovered articles, and individual source errors. Inaccessible/paywalled articles and unresolvable links are skipped. This is a sample of public announcements, not a complete market census.
- Both JSON files are copied into `site/data/` for the standalone static site. Full HTTP responses stay in ignored `data/cache/` for reproducibility.
- Ten reproducibly random rows are printed at completion and saved in `data/spot-check.json`. See `data/spot-check-report.md` for the delivered snapshot review.

Publication dates are used; weekly roundup dates may lag the original announcement. Investor names and stages use heuristics and can be incomplete. Different spellings or aliases can survive deduplication. Round amounts are total announced capital, **not individual investor contributions**. Secondary transactions, extensions, or combined equity/debt may need source context. Always consult the linked article before relying on a row.

## Dashboard

- **Funding universe:** force-packed circles sized by capital and colored by sector. Click a circle or a recent-deal row for full details and its article.
- **Investor network:** named investor/startup links, investor sizes based on deal count, labels for repeated investors, hover highlighting, draggable nodes, and investor profiles. For readability, the graph shows up to 65 investors and 110 startups; KPIs still use all filtered rounds.
- **Sector flow:** stacked monthly capital bars, sector/stage capital and deal-count heatmap, and generated analysis of leading sectors, biggest rounds, active investors, and last-30-day versus prior-30-day momentum.
- Sector checkboxes, stage, dates, USD amount bounds (millions), and company/investor search apply to every view, KPI, summary, and recent-round list. The list displays the latest 15 matches. Reset restores the snapshot window.

## Verification

The delivered build was collected from live public sources, rebuilt from cache, checked for schema/date/duplicate/provenance constraints, and spot-checked against cached publisher article text. Browser smoke checks cover all tabs, details, search/reset, desktop/mobile layout, and uncaught JavaScript errors. No deployment was performed.
