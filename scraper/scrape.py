#!/usr/bin/env python3
"""Public-source funding collector. No synthetic records or currency conversions."""
import argparse, concurrent.futures as cf, datetime as dt, email.utils, hashlib, json, random, re, shutil, time, xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin, quote, urlparse
import requests
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
SECTORS={'Security':r'cyber|security|fraud','Health/Bio':r'biotech|health|medical|therapeut|clinical|drug discovery','Defense/Space':r'defense|defence|satellite|spaceflight|aerospace','Robotics/Hardware':r'robot|semiconductor|chipmaker|hardware','Climate/Energy':r'climate|energy|battery|batteries|carbon|fusion','Fintech':r'fintech|payment|banking|financial services|lending','Crypto/Web3':r'crypto|blockchain|web3','Mobility':r'mobility|autonomous driving|electric vehicle|transport','Dev Tools/Infra':r'developer|infrastructure|database|coding|open.source','AI/ML':r'\bAI\b|artificial intelligence|machine learning','Enterprise SaaS':r'enterprise|software|saas|workflow','Consumer':r'consumer|shopping|gaming|social media'}
MONEY=r'(?:US\$|USD\s*|\$)\s*([\d,]+(?:\.\d+)?)\s*(billion|million|bn|[mb])\b'
VERB=r'rais(?:es|ed)|secur(?:es|ed)|land(?:s|ed)|nab(?:s|bed)|clos(?:es|ed)|receiv(?:es|ed)|bags|snags|announces|completes'
errors=[]
OFFLINE=False
REFRESH=False
def get(url):
 p=ROOT/'data/cache'/ (hashlib.sha256(url.encode()).hexdigest()+'.html');p.parent.mkdir(parents=True,exist_ok=True)
 ttl=3600 if ('feed' in url or '/page/' in url or '/rss/search' in url) else 7*86400
 if p.exists() and (OFFLINE or (not REFRESH and time.time()-p.stat().st_mtime<ttl)): return p.read_text()
 if OFFLINE:return ''
 try:
  r=requests.get(url,timeout=22,headers={'User-Agent':'FundingTracker/1.0 (public funding research)'});r.raise_for_status();p.write_text(r.text);return r.text
 except Exception as e: errors.append({'url':url,'error':str(e)[:160]});return ''
def clean(t):return re.sub(r'\s+',' ',BeautifulSoup(t or '','html.parser').get_text(' ',strip=True)).strip()
def dateof(s):
 if not s:return None
 try:return dt.date.fromisoformat(s[:10])
 except (ValueError,TypeError):
  try:return email.utils.parsedate_to_datetime(s).date()
  except Exception:return None
def feed(url):
 try:
  root=ET.fromstring(get(url));return [{'url':x.findtext('link'),'title':clean(x.findtext('title')),'summary':clean(x.findtext('description')),'date':x.findtext('pubDate')} for x in root.findall('.//item')]
 except Exception:return []
def stage(t):
 m=re.search(r'\bseries\s+([a-z])(?:[- ]\d)?\b',t,re.I)
 if m:return 'Series '+(m[1].upper() if m[1].upper()<'E' else 'E+')
 for k,p in [('Pre-seed',r'pre.seed'),('Seed',r'\bseed\b'),('Debt',r'\bdebt\b'),('Growth/Late',r'growth round|late.stage')]:
  if re.search(p,t,re.I):return k
 return 'Unknown'
def investors(t,pattern):
 m=next((x for x in re.finditer('(?:'+pattern+r')\s+(.{3,600}?)(?:\.\s|;|\n|$)',t,re.I) if not re.match(r'(?:CEO|founder|co-founder|president|chief)\b',x[1],re.I)),None)
 if not m:return []
 s=re.split(r'\b(?:with|bringing|valuing|which|that|to support|to accelerate|alongside|the round|the funding)\b',m[1],flags=re.I)[0]
 result=[]
 for x in re.split(r',\s*|\s+and\s+',s):
  x=x.strip(' .')
  x=re.sub(r'^(?:(?:and|existing|new|investors? including|investors?|co-led by)\s+)+','',x,flags=re.I).strip(' .')
  if x.lower() in ['new','existing','investor','investors','angel investors']:continue
  if 2<len(x)<65 and not re.search(r'\b(?:million|billion|round|funding|company|will|was|has|is|its|among|including|startup|also|from|joined|invested|participated|developer)\b',x,re.I):result.append(x)
 return list(dict.fromkeys(result))[:12]
def extract(title,text,url,date,source):
 if not re.search(r'rais(?:es|ed)|funding|financing|series|seed|round|secures|lands|nabs|closes',title,re.I):return None
 # Amount must be adjacent to a completed financing verb, never a valuation.
 m=re.search(r'(?P<company>[^!?\n]{2,160}?)\s+(?:'+VERB+r')\s+(?:an?\s+|up to\s+|about\s+|another\s+|over\s+|nearly\s+|more than\s+)?'+MONEY,title,re.I)
 if not m:
  # Only trust a body match when its explicit company is also in the headline.
  candidates=re.finditer(r'(?P<company>[A-Z][A-Za-z0-9& .’\'-]{1,55}?)(?:,\s+[^\n]{1,100}?,)?\s+(?:has\s+)?(?:'+VERB+r')\s+(?:an?\s+|over\s+|about\s+|more than\s+)?'+MONEY,text)
  m=next((x for x in candidates if x['company'].strip().lower() in title.lower()),None)
 if not m:return None
 company=m['company'].strip(' ,–—-:');company=re.split(r'\s+[–—|:]\s+|\bstartup\s+|\bstart-up\s+',company,flags=re.I)[-1]
 company=re.sub(r'^(?:Exclusive: |Breaking: |[\w -]+-based )','',company,flags=re.I)
 if ',' in company:company=company.split(',')[-1].strip()
 company=re.sub(r'^(?:How |Exclusive: |ICYMI: |a16z-backed |OpenAI-backed |China[’\']s |Argentine fintech |Colombian fintech |Tanzanian healthtech |AI cloud |AI startup |Fintech |Viral AI agent |Viral AI assistant |Year-old AI lab )','',company,flags=re.I)
 company=re.sub(r'\s+(?:just|reportedly|is)$','',company)
 company=re.sub(r'^(?:Accountancy platform |Event-marketing firm |Retail Media Platform |Live events marketing platform |Radiology software firm |Behavioral Health Compliance Platform |AI order-to-cash platform |European AI drone maker )','',company,flags=re.I)
 if company in ['It','AI','At 19','Ex-Eigen Team','Clearwater Cybersecurity Startup']:return None
 if re.search(r'^(?:While |From |Now |There |The company)',company):return None
 if not (company[0].isupper() or re.match(r'[a-z][A-Z]',company)) or len(company.split())>7 or re.search(r'\b(?:which|that|who|when|have|had|has|said|announced|company|companies|startups|previously|recently|collectively|alumni|million|billion|valuation|guidance|foundation|founder|shares|offering|IPO|stock|nonprofit|fund)\b',company,re.I):return None
 if re.search(r'\b(?:IPO|public offering|charity|foundation|fund|acquisition|acquires|is raising|plans to raise|seeks to raise|in talks)\b',title,re.I):return None
 if len(company)>65 or len(company)<2 or re.search(r'\b(fund|ventures|capital|IPO|acquisition|report|week|market|stocks|shares)\b',company,re.I):return None
 amount=float(m[2].replace(',',''))*(1e9 if m[3].lower() in ['b','bn','billion'] else 1e6)
 if not 50000<=amount<=100e9:return None
 context=(title+' '+text[:2500]);sector=next((k for k,p in SECTORS.items() if re.search(p,context,re.I)),'Other')
 description=next((s for s in re.split(r'(?<=[.!?])\s+',text) if company.lower() in s.lower() and 35<len(s)<450),title)
 return dict(company=company,description=description[:350],sector=sector,stage=stage(context),amount_usd=int(amount),date=date.isoformat(),lead_investors=investors(text,r'(?:co-)?led by'),other_investors=investors(text,r'(?:with )?participation from|investors includ(?:e|ing)'),source_url=url,source_name=source,evidence=m[0],extraction='heuristic')
def resolve_google(url):
 """Resolve Google News RSS IDs to the original publisher URL; cache result."""
 cache=ROOT/'data/cache'/('google-'+hashlib.sha256(url.encode()).hexdigest()+'.json')
 if cache.exists():return json.loads(cache.read_text()).get('url')
 if OFFLINE:return None
 try:
  ident=urlparse(url).path.split('/')[-1]
  html=get('https://news.google.com/rss/articles/'+ident+'?hl=en-US&gl=US&ceid=US%3Aen')
  signature=re.search(r'data-n-a-sg="([^"]+)"',html)[1];timestamp=int(re.search(r'data-n-a-ts="(\d+)"',html)[1])
  context=[["X","X",["X","X"],None,None,1,1,"US:en",None,1,None,None,None,None,None,0,1],"X","X",1,[1,1,1],1,1,None,0,0,None,0]
  payload=json.dumps([[["Fbv4je",json.dumps(["garturlreq",context,ident,timestamp,signature]),None,"0"]]])
  response=requests.post('https://news.google.com/_/DotsSplashUi/data/batchexecute',data={'f.req':payload},timeout=20)
  response.raise_for_status()
  for line in response.text.splitlines():
   if not line.startswith('[['):continue
   for entry in json.loads(line):
    if len(entry)>2 and entry[0]=='wrb.fr':
     result=json.loads(entry[2])
     if result[0]=='garturlres' and urlparse(result[1]).scheme in ['http','https']:
      cache.write_text(json.dumps({'url':result[1]}));return result[1]
 except Exception as e:errors.append({'url':url,'error':'Google resolution: '+str(e)[:100]})
 return None
def article(item,start,end):
 url=item['url']
 if not url or '/podcast/' in url or '/video/' in url:return []
 if 'news.google.com' in url:
  url=resolve_google(url)
  if not url:return []
 html=get(url)
 if not html:return []
 soup=BeautifulSoup(html,'html.parser')
 title=clean(soup.h1.get_text() if soup.h1 else item.get('title',''))
 for x in soup.select('script,style,nav,footer,header,aside'):x.decompose()
 date=dateof(item.get('date',''))
 # Prefer article metadata over feed discovery date.
 raw=BeautifulSoup(html,'html.parser')
 for sel in ['meta[property="article:published_time"]','meta[name="date"]','time[datetime]']:
  x=raw.select_one(sel)
  if x:
   d=dateof(x.get('content') or x.get('datetime'))
   if d:date=d;break
 if not date:
  m=re.search(r'/(2026)/(\d{2})/(\d{2})/',url)
  if m:date=dt.date(*map(int,m.groups()))
 if not date or not start<=date<=end:return []
 body=soup.select_one('.td-post-content,.entry-content,.wp-block-post-content,.article-body,.article-content') or soup.select_one('article') or soup.select_one('main') or soup
 text=clean(body.get_text(' ',strip=True));source={'techcrunch.com':'TechCrunch','news.crunchbase.com':'Crunchbase News','fortune.com':'Fortune Term Sheet','www.prnewswire.com':'PR Newswire','www.businesswire.com':'BusinessWire','www.globenewswire.com':'GlobeNewswire'}.get(urlparse(url).netloc,urlparse(url).netloc)
 rows=[]
 r=extract(title,text,url,date,source)
 if r and not ('news.crunchbase.com' in url and 'biggest' in url):rows.append(r)
 # Crunchbase weekly rankings use numbered company/amount headings.
 if 'news.crunchbase.com' in url and ('biggest' in title.lower() or 'biggest' in url):
  sections=re.split(r'(?=\b\d{1,2}\.\s+(?:\(tied\)\s*)?[^\n]{1,85}?,\s*\$)',text)
  for section in sections:
   m=re.match(r'\d+[.)]\s+(?:\(tied\)\s*)?(.+?)\s*,\s*('+MONEY+r')',section,re.I)
   if not m:continue
   r=extract(m[1]+' raises '+m[2],section,url,date,source)
   if r:
    r['company']=m[1].strip();r['description']=section[m.end():].split(': ',1)[-1][:300];r['evidence']=section[:m.end()];rows.append(r)

 return rows
def main():
 global OFFLINE,REFRESH
 ap=argparse.ArgumentParser();ap.add_argument('--as-of',default='2026-11-03');ap.add_argument('--days',type=int,default=90);ap.add_argument('--pages',type=int,default=16);ap.add_argument('--offline',action='store_true',help='Rebuild from cached pages only');ap.add_argument('--refresh',action='store_true',help='Refresh HTTP cache');a=ap.parse_args();OFFLINE=a.offline;REFRESH=a.refresh;end=dt.date.fromisoformat(a.as_of);start=end-dt.timedelta(days=a.days-1)
 urls=['https://techcrunch.com/category/venture/feed/','https://techcrunch.com/category/fundraising/feed/','https://news.crunchbase.com/feed/','https://fortune.com/tag/term-sheet/feed/','https://www.prnewswire.com/rss/news-releases-list.rss','https://www.businesswire.com/portal/site/home/news/subject/?vnsId=31333&rss=1','https://www.globenewswire.com/RssFeed/subjectcode/27-Financing%20Agreements%20and%20Equity%20Issues/feedTitle/GlobeNewswire%20-%20Financing%20Agreements%20and%20Equity%20Issues']
 for q in ['raises Series A','raises Series B','raises seed','raises funding','raises Series C','raises Series D','site:prnewswire.com raises','site:businesswire.com raises','site:globenewswire.com raises']:
  urls.append('https://news.google.com/rss/search?q='+quote(q+f' after:{start} before:{end+dt.timedelta(days=1)}')+'&hl=en-US&gl=US&ceid=US:en')
 items=[]
 with cf.ThreadPoolExecutor(max_workers=10) as pool:
  for batch in pool.map(feed,urls):items.extend(batch)
 pages=[f'https://techcrunch.com/category/venture/page/{n}/' for n in range(1,a.pages+1)]+[f'https://news.crunchbase.com/page/{n}/' for n in range(1,a.pages+1)]+[f'https://news.crunchbase.com/feed/?paged={n}' for n in range(2,a.pages+1)]
 with cf.ThreadPoolExecutor(max_workers=10) as pool:
  for u,html in zip(pages,pool.map(get,pages)):
   if '/feed/' in u:
    items.extend(feed(u));continue
   s=BeautifulSoup(html,'html.parser')
   for link in s.select('h2 a,h3 a'):
    href=urljoin(u,link.get('href',''))
    if urlparse(href).netloc==urlparse(u).netloc and not re.search(r'/category/|/author/|/page/|/tag/',href):items.append(dict(url=href,title=clean(link.get_text()),date=''))
 # Google feeds discover headlines; resolve publisher article links through publisher search only if direct.
 unique={i['url']:i for i in items if i.get('url')};print(f'Discovered {len(unique)} articles',flush=True)
 rounds=[]
 with cf.ThreadPoolExecutor(max_workers=12) as pool:
  for batch in pool.map(lambda x:article(x,start,end),unique.values()):rounds.extend(batch)
 dedup={}
 for r in rounds:
  key=(re.sub(r'[^a-z0-9]','',r['company'].lower()),r['amount_usd'])
  if key not in dedup or len(r['lead_investors'])>len(dedup[key]['lead_investors']):dedup[key]=r
 rounds=sorted(dedup.values(),key=lambda r:(r['date'],r['company']),reverse=True)
 meta=dict(last_run=dt.datetime.now(dt.timezone.utc).isoformat(),as_of=str(end),window_start=str(start),round_count=len(rounds),target=150,counts_per_source={s:sum(r['source_name']==s for r in rounds) for s in sorted({r['source_name'] for r in rounds})},discovered_articles=len(unique),errors=errors,notes=['USD explicitly reported only; no inferred exchange rates.','Dates are publication dates; weekly roundup dates may lag announcements.','Sector and stage are heuristic. Missing investor names remain empty.','Google News IDs are resolved to original publisher articles; unresolved links are excluded.'])
 for name,obj in [('rounds',rounds),('meta',meta)]:
  p=ROOT/f'data/{name}.json';p.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n');shutil.copy2(p,ROOT/f'site/data/{name}.json')
 sample=random.Random(42).sample(rounds,min(10,len(rounds)));(ROOT/'data/spot-check.json').write_text(json.dumps(sample,indent=2)+'\n')
 print(json.dumps(meta,indent=2));print('SPOT CHECK — compare evidence and article:');
 for r in sample:print(json.dumps(r,ensure_ascii=False))
if __name__=='__main__':main()
