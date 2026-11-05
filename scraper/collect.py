#!/usr/bin/env python3
"""Collect a public funding sample and write site/data.

News rows come from publisher articles found via Google News RSS.
SEC rows are a monthly sample of Form D filings. No paid APIs.
"""
import argparse, datetime as dt, json, re, sys, threading, time, xml.etree.ElementTree as ET
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import quote

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
import scrape

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site' / 'data'
UA = 'FundingTracker/1.0 research contact@example.com'
SEC = {'User-Agent': UA, 'Accept': 'application/json'}
LIMIT = threading.Lock()
NEXT = {'t': 0.0}

SECTOR_BY_INDUSTRY = {
    'Biotechnology': 'Health/Bio', 'Other Biotechnology': 'Health/Bio', 'Pharmaceuticals': 'Health/Bio',
    'Other Health Care': 'Health/Bio', 'Hospitals and Physicians': 'Health/Bio', 'Health Insurance': 'Health/Bio',
    'Other Technology': 'Dev Tools/Infra', 'Computers': 'Dev Tools/Infra', 'Semiconductors': 'Robotics/Hardware',
    'Telecommunications': 'Dev Tools/Infra', 'Other Telecommunications': 'Dev Tools/Infra',
    'Business Services': 'Enterprise SaaS', 'Other Business Services': 'Enterprise SaaS',
    'Manufacturing': 'Robotics/Hardware', 'Other Manufacturing': 'Robotics/Hardware',
    'Retailing': 'Consumer', 'Other Retailing': 'Consumer', 'Restaurants': 'Consumer',
    'Energy Conservation': 'Climate/Energy', 'Environmental Services': 'Climate/Energy',
    'Electric Utilities': 'Climate/Energy',
}
VEHICLE = re.compile(r'\b(fund|holdings|spv|reit|properties|joint venture|capital fund|venture fund|series of|roll up|l\.p\.|partners lp)\b', re.I)


def pace():
    with LIMIT:
        now = time.time()
        if now < NEXT['t']:
            time.sleep(NEXT['t'] - now)
        NEXT['t'] = time.time() + 0.12


def sec_get(url, accept='application/xml'):
    pace()
    for attempt in range(3):
        try:
            response = requests.get(url, headers={'User-Agent': UA, 'Accept': accept}, timeout=30)
            if response.status_code == 429:
                time.sleep(2 + attempt)
                continue
            response.raise_for_status()
            return response.text
        except requests.RequestException:
            time.sleep(1 + attempt)
    return ''


def today():
    return dt.date.today()


def five_year_start(day):
    try:
        return day.replace(year=day.year - 5)
    except ValueError:
        return day.replace(year=day.year - 5, day=28)


def parse_date(value):
    if not value:
        return None
    try:
        return dt.date.fromisoformat(str(value)[:10])
    except ValueError:
        return None


def in_window(day, start, end):
    return bool(day) and start <= day <= end


def nice_name(name):
    name = re.sub(r'\s+', ' ', name or '').strip(' ,')
    if name.isupper():
        name = name.title()
    name = re.sub(r'\bLlc\b', 'LLC', name)
    name = re.sub(r'\bInc\.?\b', 'Inc.', name)
    name = re.sub(r'\bLp\b', 'LP', name)
    return name.replace('Inc..', 'Inc.')


def norm_company(name):
    return re.sub(r'[^a-z0-9]', '', (name or '').lower())


def text_of(root, path):
    node = root.find(path)
    return node.text.strip() if node is not None and node.text else ''


def form_d_row(hit, start, end):
    source = hit['_source']
    cik_raw = source['ciks'][0]
    cik = str(int(cik_raw))
    adsh = source['adsh']
    acc = adsh.replace('-', '')
    display = source.get('display_names', [''])[0]
    rough = display.split('(CIK')[0].strip()
    if VEHICLE.search(rough):
        return None
    xml = sec_get(f'https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/primary_doc.xml')
    if not xml or '<edgarSubmission' not in xml:
        return None
    try:
        root = ET.fromstring(xml)
    except ET.ParseError:
        return None
    if text_of(root, './/isPooledInvestmentFundType') == 'true':
        return None
    if text_of(root, './/isBusinessCombinationTransaction') == 'true':
        return None
    industry = text_of(root, './/industryGroupType')
    sector = SECTOR_BY_INDUSTRY.get(industry)
    if not sector:
        return None
    name = nice_name(text_of(root, './/entityName') or rough)
    if not name or VEHICLE.search(name) or len(name) < 2:
        return None
    sold = text_of(root, './/totalAmountSold')
    if not sold.isdigit():
        return None
    amount = int(sold)
    if not 250_000 <= amount <= 2_000_000_000:
        return None
    sale = parse_date(text_of(root, './/dateOfFirstSale/value'))
    filed = parse_date(source.get('file_date'))
    day = sale or filed
    if not in_window(day, start, end):
        return None
    city = text_of(root, './/issuerAddress/city').title()
    state = text_of(root, './/issuerAddress/stateOrCountry')
    where = ', '.join(x for x in (city, state) if x)
    investors = text_of(root, './/totalNumberAlreadyInvested')
    index = f'https://www.sec.gov/Archives/edgar/data/{cik}/{acc}/{adsh}-index.html'
    description = f'{name} reported ${amount:,.0f} sold in a US Form D private placement'
    if where:
        description += f', based in {where}'
    description += f'. Industry group: {industry}.'
    if investors.isdigit():
        description += f' The filing lists {investors} investors already in the offering, without naming them.'
    return dict(
        company=name,
        description=description,
        sector=sector,
        stage='Private placement',
        amount_usd=amount,
        date=day.isoformat(),
        lead_investors=[],
        other_investors=[],
        source_url=index,
        source_name='SEC EDGAR Form D',
        evidence=f'Form D total amount sold ${amount:,.0f}; industry {industry}',
        extraction='sec-form-d',
    )


def search_form_d(start, end):
    url = (
        'https://efts.sec.gov/LATEST/search-index?forms=D&dateRange=custom'
        f'&startdt={start.isoformat()}&enddt={end.isoformat()}'
    )
    pace()
    try:
        response = requests.get(url, headers=SEC, timeout=40)
        response.raise_for_status()
        return response.json()['hits']['hits']
    except (requests.RequestException, KeyError, ValueError):
        return []


def month_starts(start, end):
    cursor = dt.date(start.year, start.month, 1)
    while cursor <= end:
        yield cursor
        year = cursor.year + (1 if cursor.month == 12 else 0)
        month = 1 if cursor.month == 12 else cursor.month + 1
        cursor = dt.date(year, month, 1)


def collect_form_d(start, end, per_month=4, attempts=10, day_offset=0):
    def one_month(month):
        window_start = month + dt.timedelta(days=day_offset)
        window_end = min(end, window_start + dt.timedelta(days=3))
        if window_end < start or window_start > end:
            return []
        hits = search_form_d(max(start, window_start), window_end)
        kept, tried = [], 0
        for hit in hits:
            display = hit.get('_source', {}).get('display_names', [''])[0]
            if VEHICLE.search(display):
                continue
            tried += 1
            if tried > attempts:
                break
            row = form_d_row(hit, start, end)
            if row:
                kept.append(row)
            if len(kept) >= per_month:
                break
        return kept

    rows = []
    months = list(month_starts(start, end))
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = [pool.submit(one_month, month) for month in months]
        for future in as_completed(futures):
            rows.extend(future.result())
            print(f'Form D kept {len(rows)}', flush=True)
    return rows


def collect_news(start, end, per_query=4):
    queries = ['raises $ million Series A', 'raises $ million Series B', 'raises $ million Series C', 'raises $ million seed round']
    tasks = []
    cursor = start
    while cursor <= end:
        chunk_end = min(end, cursor + dt.timedelta(days=89))
        for query in queries:
            q = f'{query} after:{cursor.isoformat()} before:{(chunk_end + dt.timedelta(days=1)).isoformat()}'
            url = 'https://news.google.com/rss/search?q=' + quote(q) + '&hl=en-US&gl=US&ceid=US:en'
            tasks.append((url, cursor, chunk_end))
        cursor = chunk_end + dt.timedelta(days=1)
    items = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        feeds = list(pool.map(lambda task: scrape.feed(task[0]), tasks))
    for (url, chunk_start, chunk_end), feed_items in zip(tasks, feeds):
        for item in feed_items[:per_query]:
            items.append((item, chunk_start - dt.timedelta(days=14), chunk_end + dt.timedelta(days=14)))
    print(f'News headlines to read: {len(items)}', flush=True)
    rows = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(scrape.article, item, item_start, item_end) for item, item_start, item_end in items]
        done = 0
        for future in as_completed(futures):
            done += 1
            rows.extend(future.result() or [])
            if done % 40 == 0:
                print(f'News read {done}/{len(futures)} kept {len(rows)}', flush=True)
    print(f'News kept {len(rows)} from {len(items)} headlines', flush=True)
    return rows


def dedupe(rounds):
    best = {}
    for row in rounds:
        if not row.get('source_url', '').startswith('http'):
            continue
        key = (norm_company(row['company']), int(row['amount_usd']))
        if not key[0]:
            continue
        current = best.get(key)
        investors = len(row.get('lead_investors') or []) + len(row.get('other_investors') or [])
        if current is None or investors > current[0]:
            best[key] = (investors, row)
    chosen = [pair[1] for pair in best.values()]
    filings = [row for row in chosen if row.get('extraction') == 'sec-form-d']
    others = [row for row in chosen if row.get('extraction') != 'sec-form-d']
    filings.sort(key=lambda row: (norm_company(row['company']), row['date']))
    collapsed = []
    for row in filings:
        if collapsed:
            prev = collapsed[-1]
            same = norm_company(prev['company']) == norm_company(row['company'])
            close = abs((parse_date(prev['date']) - parse_date(row['date'])).days) <= 60
            if same and close:
                if row['amount_usd'] > prev['amount_usd']:
                    collapsed[-1] = row
                continue
        collapsed.append(row)
    merged = others + collapsed
    return sorted(merged, key=lambda row: (row['date'], row['company']), reverse=True)


def load_existing():
    path = SITE / 'rounds.json'
    if not path.exists():
        return []
    return json.loads(path.read_text())


def summarize_errors():
    counts = Counter(item.get('error', '')[:48] for item in scrape.errors)
    return {'count': len(scrape.errors), 'top': counts.most_common(8)}


def write_snapshot(rounds, start, end, mode):
    by_year = Counter(row['date'][:4] for row in rounds)
    by_extraction = Counter(row.get('extraction') or 'unknown' for row in rounds)
    by_source = Counter(row['source_name'] for row in rounds)
    meta = {
        'last_run': dt.datetime.now(dt.timezone.utc).isoformat(),
        'as_of': end.isoformat(),
        'window_start': start.isoformat(),
        'round_count': len(rounds),
        'by_year': dict(sorted(by_year.items())),
        'by_extraction': dict(by_extraction),
        'counts_per_source': dict(by_source.most_common()),
        'collection_mode': mode,
        'error_summary': summarize_errors(),
        'notes': [
            'Dates after the collection date are excluded. The window is the five years ending on that date.',
            'News rows require an explicit USD amount in a public article. Non-USD announcements are skipped. Coverage is densest from August 2026 through early November 2026. Earlier quarters are a smaller Google News sample, and many publishers returned 403 or 429.',
            'SEC EDGAR Form D rows are a sample of the first few days of each month, limited to technology, health, and similar industry groups, with at least $250,000 sold. They are US private placements, not confirmed venture rounds. Form D does not name investors.',
            'FinSMEs archives were blocked. No paid datasets (Crunchbase, PitchBook, Dealroom) were used.',
            'This is a sample of public records, not a complete market census. Investor leaderboards under-count older periods because named investors come from news articles.',
            'Amounts are the announced round total or the Form D amount sold, not one investor’s check.',
        ],
        'gaps': [
            'Incomplete before August 2026: older news is a few articles per quarter, not every round.',
            'Form D sample misses most filings in a month and drops funds, real-estate vehicles, and offerings under $250,000.',
            'No investor names on Form D rows.',
            'Paywalled or blocked articles are missing even when a headline announced a round.',
            'Non-USD rounds are missing.',
        ],
    }
    SITE.mkdir(parents=True, exist_ok=True)
    (SITE / 'rounds.json').write_text(json.dumps(rounds, indent=2, ensure_ascii=False) + '\n')
    (SITE / 'meta.json').write_text(json.dumps(meta, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'round_count': len(rounds), 'by_year': meta['by_year'], 'by_extraction': meta['by_extraction']}, indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=['backfill', 'refresh'], default='refresh')
    args = parser.parse_args()
    end = today()
    start = five_year_start(end)
    existing = [row for row in load_existing() if in_window(parse_date(row.get('date')), start, end)]
    if args.mode == 'backfill':
        news_start, news_end = start, dt.date(2026, 7, 31)
        fresh = collect_form_d(start, end, per_month=4, attempts=8) + collect_news(news_start, news_end, per_query=4)
    else:
        recent = end - dt.timedelta(days=20)
        fresh = collect_form_d(recent, end, per_month=6, attempts=12) + collect_news(recent, end, per_query=6)
    write_snapshot(dedupe(existing + fresh), start, end, args.mode)


if __name__ == '__main__':
    main()
