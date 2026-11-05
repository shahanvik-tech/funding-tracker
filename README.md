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

The included snapshot is a five-year public sample ending on the collection date. News coverage is densest in late 2026. Earlier quarters are a smaller article sample, plus a monthly slice of US Form D filings. See `site/data/meta.json` for the exact window, counts, and gaps. To refresh the recent window and redeploy, the daily GitHub Actions workflow runs `python3 scraper/collect.py --mode refresh`. A full historical collection is:

```bash
python3 scraper/collect.py --mode backfill
python3 scraper/collect.py --mode refresh   # last few weeks, merged into the snapshot
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

- **Overview:** headline counts, capital by quarter (bars), deals by quarter (line), and the latest rows.
- **Who's Hot:** investor and sector cards for this week, 30 days, 90 days, or 1 year, with a share-to-X link on each card.
- **Explore:** sortable table of every row in the five-year window, with source links.
- **Pitch Matcher:** client-side keyword similarity over descriptions, sectors, and stages, weighted toward recent deals.

## Verification

The delivered build was collected from live public sources, rebuilt from cache, checked for schema/date/duplicate/provenance constraints, and spot-checked against cached publisher article text. Browser smoke checks cover all tabs, details, search/reset, desktop/mobile layout, and uncaught JavaScript errors. No deployment was performed.
