'use strict';

const VIEWS = [['overview', 'Overview'], ['hot', "Who's Hot"], ['explore', 'Explore'], ['match', 'Pitch Matcher']];
const WINDOWS = { 7: 'This week', 30: '30 days', 90: '90 days', 365: '1 year' };
const ALIAS = {
  'a16z': 'Andreessen Horowitz', 'andreessen horowitz': 'Andreessen Horowitz', 'andreessen horowitz (a16z)': 'Andreessen Horowitz',
  'a16z speedrun': 'a16z Speedrun', 'sequoia': 'Sequoia Capital', 'sequoia capital': 'Sequoia Capital',
  'nea': 'NEA', 'enterprise associates': 'NEA', 'enterprise associates (nea)': 'NEA', 'new enterprise associates': 'NEA',
  'iconiq': 'ICONIQ', 'nvidia': 'NVIDIA', 'gv': 'Google Ventures', 'google ventures': 'Google Ventures',
  'y combinator': 'Y Combinator', 'index': 'Index Ventures', 'index ventures': 'Index Ventures',
  'lux': 'Lux Capital', 'lux capital': 'Lux Capital', 'greylock': 'Greylock', 'greylock partners': 'Greylock',
  'tiger global': 'Tiger Global', 'tiger global management': 'Tiger Global', 'coatue': 'Coatue', 'coatue management': 'Coatue',
  'insight': 'Insight Partners', 'insight partners': 'Insight Partners', 'accel': 'Accel',
  'lightspeed': 'Lightspeed Venture Partners', 'lightspeed venture partners': 'Lightspeed Venture Partners',
  'founders fund': 'Founders Fund', 'khosla': 'Khosla Ventures', 'khosla ventures': 'Khosla Ventures',
  'general catalyst': 'General Catalyst', 'benchmark': 'Benchmark', 'benchmark capital': 'Benchmark',
  'm12': 'M12', "microsoft's venture fund": 'M12', '8vc': '8VC'
};
const DROP = new Set(['others', 'other investors', 'ceo', 'ventures', 'investor', 'investors', 'vc']);
const PREFIX = /^(?:as well as existing investors|as well as|such as|previous investors|major investor|other new investors|founder of|existing investors)\s+/i;
const STOP = new Set('the and for with that this from are was were has have been will not your you into over per its their they them than then about across after also more most other such using used use via company startup companies million billion series seed round funding raised raises announced based reported industry group private placement filing investors already offering without naming them'.split(' '));
const $ = (s) => document.querySelector(s);

const state = {
  all: [],
  meta: {},
  view: 'overview',
  window: 90,
  sort: { key: 'date', dir: 'desc' },
  index: null
};

function localISO(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}
function validISO(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
function shiftDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
function minusYears(iso, years) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y - years, m - 1, d);
  return localISO(date);
}
function pretty(iso) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = iso.split('-').map(Number);
  return months[m - 1] + ' ' + d + ', ' + y;
}
function money(n) {
  const value = Number(n) || 0;
  const abs = Math.abs(value);
  const num = abs >= 1e9 ? abs / 1e9 : abs >= 1e6 ? abs / 1e6 : abs >= 1e3 ? abs / 1e3 : abs;
  const suffix = abs >= 1e9 ? 'B' : abs >= 1e6 ? 'M' : abs >= 1e3 ? 'K' : '';
  const digits = suffix && num < 10 ? 1 : 0;
  const text = digits ? num.toFixed(digits).replace(/\.0$/, '') : String(Math.round(num));
  return (value < 0 ? '-' : '') + '$' + text + suffix;
}
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function safeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
  } catch (e) { /* ignore */ }
  return '';
}
function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return 'Source'; }
}
function cleanInvestor(raw) {
  let name = String(raw ?? '').replace(/\s+/g, ' ').trim().replace(/[’‘]/g, "'");
  name = name.replace(PREFIX, '').replace(/\s+along$/i, '').trim();
  const key = name.toLowerCase();
  if (key.length < 2 || DROP.has(key)) return null;
  return ALIAS[key] || name;
}
function prepare(rounds, today) {
  const start = minusYears(today, 5);
  return rounds.map((row, index) => {
    const leads = [];
    const seen = new Set();
    for (const name of [...(row.lead_investors || []), ...(row.other_investors || [])]) {
      const cleaned = cleanInvestor(name);
      if (cleaned && !seen.has(cleaned)) { seen.add(cleaned); leads.push(cleaned); }
    }
    return { ...row, _id: index, _investors: leads };
  }).filter((row) => validISO(row.date) && row.date >= start && row.date <= today && safeUrl(row.source_url) && Number(row.amount_usd) > 0);
}

function setStatus(message) {
  const el = $('#status');
  el.hidden = !message;
  el.textContent = message || '';
}
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('signal-theme', theme); } catch (e) { /* ignore */ }
  const button = $('#theme');
  button.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  button.setAttribute('aria-pressed', String(theme === 'dark'));
  if (state.view === 'overview' && state.all.length) drawCharts();
}
function setView(name) {
  if (!VIEWS.some(([id]) => id === name)) name = 'overview';
  state.view = name;
  VIEWS.forEach(([id]) => { $('#view-' + id).hidden = id !== name; });
  document.querySelectorAll('#nav button').forEach((button) => {
    const on = button.dataset.view === name;
    button.classList.toggle('is-active', on);
    if (on) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  document.title = 'Signal — ' + VIEWS.find(([id]) => id === name)[1];
  if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
  if (name === 'overview') renderOverview();
  if (name === 'hot') renderHot();
  if (name === 'explore') renderTable();
  if (name === 'match') renderMatch(false);
}

function quarters(rows) {
  if (!rows.length) return [];
  const first = rows.reduce((min, row) => row.date < min ? row.date : min, rows[0].date);
  const last = rows.reduce((max, row) => row.date > max ? row.date : max, rows[0].date);
  const start = quarterStart(first);
  const end = quarterStart(last);
  const keys = [];
  let cursor = start;
  while (cursor <= end) {
    keys.push(cursor);
    cursor = nextQuarter(cursor);
  }
  return keys.map((key) => {
    const list = rows.filter((row) => quarterStart(row.date) === key);
    return { key, label: quarterLabel(key), capital: list.reduce((sum, row) => sum + row.amount_usd, 0), count: list.length };
  });
}
function quarterStart(iso) {
  const [y, m] = iso.split('-').map(Number);
  const q = Math.floor((m - 1) / 3);
  return y + '-' + String(q * 3 + 1).padStart(2, '0');
}
function nextQuarter(key) {
  const [y, m] = key.split('-').map(Number);
  return m === 10 ? (y + 1) + '-01' : y + '-' + String(m + 3).padStart(2, '0');
}
function quarterLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return 'Q' + (Math.floor((m - 1) / 3) + 1) + ' ’' + String(y).slice(2);
}

function renderOverview() {
  const rows = state.all;
  const sum = rows.reduce((total, row) => total + row.amount_usd, 0);
  const investors = new Set(rows.flatMap((row) => row._investors));
  const news = rows.filter((row) => row.extraction !== 'sec-form-d').length;
  const today = localISO(new Date());
  const cards = [
    ['Capital in sample', money(sum), 'News rounds and Form D amount sold'],
    ['Rows', rows.length.toLocaleString(), news + ' from articles'],
    ['Named investors', investors.size.toLocaleString(), 'After merging obvious duplicates'],
    ['Window', '5 years', pretty(minusYears(today, 5)) + ' – ' + pretty(today)]
  ];
  $('#stats').innerHTML = cards.map(([label, value, note]) => `<article class="stat"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`).join('');
  const start = state.meta.window_start;
  const end = state.meta.as_of;
  $('#range-label').textContent = (start && end) ? pretty(start) + ' — ' + pretty(end) : '';
  $('#lede').textContent = rows.length + ' public rows. News coverage is densest in late 2026. Earlier quarters are a lighter sample, plus a monthly slice of US Form D filings. Nothing here is a full market census.';
  $('#latest').innerHTML = [...rows].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map(dealCard).join('');
  const notes = [...(state.meta.notes || []), ...(state.meta.gaps || [])];
  $('#coverage').innerHTML = notes.map((note) => `<li>${esc(note)}</li>`).join('') || '<li>Coverage notes were not included in this snapshot.</li>';
  requestAnimationFrame(drawCharts);
}
function dealCard(row) {
  const href = safeUrl(row.source_url);
  const kind = row.extraction === 'sec-form-d' ? 'SEC Form D' : 'News';
  return `<article class="deal"><div class="deal-top"><span>${esc(kind)}</span><span>${esc(pretty(row.date))}</span></div><h3>${esc(row.company)}</h3><p class="amount">${esc(money(row.amount_usd))}</p><p class="clamp">${esc(row.description || '')}</p><p class="meta">${esc(row.sector)} · ${esc(row.stage)}${row._investors.length ? ' · ' + esc(row._investors.slice(0, 3).join(', ')) : ''}</p><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">Read the source</a></article>`;
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function drawCharts() {
  if (!window.d3) {
    $('#bar-chart').textContent = 'Charts did not load.';
    return;
  }
  const points = quarters(state.all);
  $('#bar-chart').style.minWidth = Math.max(720, points.length * 52) + 'px';
  $('#line-chart').style.minWidth = Math.max(720, points.length * 52) + 'px';
  drawBars($('#bar-chart'), points);
  drawLine($('#line-chart'), points);
}
function chartBox(el) {
  const width = el.clientWidth || 720;
  const height = el.clientHeight || 320;
  el.innerHTML = '';
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img');
  return { svg, width, height, margin: { top: 16, right: 16, bottom: 48, left: 64 } };
}
function drawBars(el, points) {
  const { svg, width, height, margin } = chartBox(el);
  svg.attr('aria-label', 'Bar chart of disclosed capital by quarter');
  const x = d3.scaleBand().domain(points.map((d) => d.label)).range([margin.left, width - margin.right]).padding(0.28);
  const y = d3.scaleLinear().domain([0, d3.max(points, (d) => d.capital) || 1]).nice().range([height - margin.bottom, margin.top]);
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickValues(x.domain().filter((label, i) => i % 2 === 0)));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(money));
  svg.selectAll('rect').data(points).join('rect').attr('x', (d) => x(d.label)).attr('y', (d) => y(d.capital)).attr('width', x.bandwidth()).attr('height', (d) => y(0) - y(d.capital)).attr('rx', 4).attr('fill', cssVar('--bar'));
  svg.selectAll('rect').append('title').text((d) => d.label + ' ' + money(d.capital));
}
function drawLine(el, points) {
  const { svg, width, height, margin } = chartBox(el);
  svg.attr('aria-label', 'Line chart of deal counts by quarter');
  const x = d3.scalePoint().domain(points.map((d) => d.label)).range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, d3.max(points, (d) => d.count) || 1]).nice().range([height - margin.bottom, margin.top]);
  svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickValues(x.domain().filter((label, i) => i % 2 === 0)));
  svg.append('g').attr('class', 'axis').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('d')));
  const line = d3.line().x((d) => x(d.label)).y((d) => y(d.count));
  svg.append('path').datum(points).attr('fill', 'none').attr('stroke', cssVar('--stroke')).attr('stroke-width', 2.5).attr('d', line);
  svg.selectAll('circle').data(points).join('circle').attr('cx', (d) => x(d.label)).attr('cy', (d) => y(d.count)).attr('r', 4).attr('fill', cssVar('--stroke')).append('title').text((d) => d.label + ' ' + d.count + ' rows');
}

function windowRows(days) {
  const today = localISO(new Date());
  const recentStart = shiftDays(today, -days);
  const priorStart = shiftDays(today, -2 * days);
  return {
    today,
    recent: state.all.filter((row) => row.date > recentStart && row.date <= today),
    prior: state.all.filter((row) => row.date > priorStart && row.date <= recentStart)
  };
}
function investorRanks(rows) {
  const map = new Map();
  rows.forEach((row) => row._investors.forEach((name) => {
    if (!map.has(name)) map.set(name, { name, count: 0, sum: 0 });
    const item = map.get(name);
    item.count += 1;
    item.sum += row.amount_usd;
  }));
  return [...map.values()];
}
function shareLink(text) {
  const page = location.origin + location.pathname + '#hot';
  return 'https://x.com/intent/post?text=' + encodeURIComponent(text + ' ' + page);
}
function shotCard(kicker, title, figure, detail, shareText) {
  const period = WINDOWS[state.window];
  return `<article class="shot"><header><span>Signal</span><span>${esc(period)}</span></header><p class="eyebrow">${esc(kicker)}</p><h3>${esc(title)}</h3><p class="figure">${esc(figure)}</p><p>${esc(detail)}</p><a class="share" href="${shareLink(shareText)}" target="_blank" rel="noopener noreferrer">Share on X</a></article>`;
}
function renderHot() {
  document.querySelectorAll('#windows button').forEach((button) => button.classList.toggle('is-active', Number(button.dataset.window) === state.window));
  const { recent, prior } = windowRows(state.window);
  const named = recent.filter((row) => row._investors.length).length;
  $('#hot-note').textContent = recent.length + ' rows in this window, ' + prior.length + ' in the previous one. ' + named + ' of the current rows name an investor. Older windows are a thinner public sample.';
  const ranks = investorRanks(recent);
  const byDeals = [...ranks].sort((a, b) => b.count - a.count || b.sum - a.sum).slice(0, 6);
  const byDollars = [...ranks].sort((a, b) => b.sum - a.sum || b.count - a.count).slice(0, 6);
  $('#hot-deals').innerHTML = byDeals.map((item) => shotCard(
    'Most active by deals',
    item.name,
    item.count + (item.count === 1 ? ' deal' : ' deals'),
    money(item.sum) + ' of round capital in this sample.',
    item.name + ' shows up in ' + item.count + ' deals in this public funding sample (' + WINDOWS[state.window].toLowerCase() + '), alongside ' + money(item.sum) + ' of round capital.'
  )).join('') || '<p class="hint">No named investors in this window.</p>';
  $('#hot-dollars').innerHTML = byDollars.map((item) => shotCard(
    'Largest round dollars',
    item.name,
    money(item.sum),
    item.count + (item.count === 1 ? ' named deal' : ' named deals') + ' in this sample. Dollars are full round size.',
    item.name + ' is attached to ' + money(item.sum) + ' of disclosed round capital in this public sample (' + WINDOWS[state.window].toLowerCase() + ').'
  )).join('') || '<p class="hint">No named investors in this window.</p>';
  const sectors = [...new Set(state.all.map((row) => row.sector))];
  const rising = sectors.map((sector) => {
    const now = recent.filter((row) => row.sector === sector);
    const then = prior.filter((row) => row.sector === sector);
    const nowSum = now.reduce((sum, row) => sum + row.amount_usd, 0);
    const thenSum = then.reduce((sum, row) => sum + row.amount_usd, 0);
    const change = thenSum ? (nowSum - thenSum) / thenSum : null;
    return { sector, nowSum, thenSum, nowCount: now.length, thenCount: then.length, change };
  }).filter((item) => item.nowCount >= 2 || item.nowSum >= 5e6)
    .sort((a, b) => (b.change ?? 99) - (a.change ?? 99) || b.nowSum - a.nowSum)
    .slice(0, 6);
  $('#hot-sectors').innerHTML = rising.map((item) => {
    const change = item.change == null ? 'No capital in the prior window' : (item.change >= 0 ? 'Up ' : 'Down ') + Math.abs(item.change * 100).toFixed(0) + '% versus the prior window';
    return shotCard(
      'Sector in this sample',
      item.sector,
      money(item.nowSum),
      item.nowCount + ' rows now, ' + item.thenCount + ' before. ' + change + '.',
      item.sector + ': ' + money(item.nowSum) + ' across ' + item.nowCount + ' rows in this public sample (' + WINDOWS[state.window].toLowerCase() + '). ' + change + '.'
    );
  }).join('') || '<p class="hint">Not enough rows in this window to rank sectors.</p>';
}

const COLUMNS = [['company', 'Company'], ['sector', 'Sector'], ['stage', 'Stage'], ['amount_usd', 'Raised'], ['date', 'Announced'], ['investors', 'Investors'], ['source', 'Source']];
function filteredRows() {
  const query = $('#search').value.trim().toLowerCase();
  const from = $('#from').value;
  const to = $('#to').value;
  const sector = $('#sector').value;
  const stage = $('#stage').value;
  return state.all.filter((row) => {
    if (sector && row.sector !== sector) return false;
    if (stage && row.stage !== stage) return false;
    if (from && row.date < from) return false;
    if (to && row.date > to) return false;
    if (!query) return true;
    return (row.company + ' ' + row._investors.join(' ')).toLowerCase().includes(query);
  });
}
function renderTable() {
  const rows = filteredRows().sort((a, b) => {
    const dir = state.sort.dir === 'asc' ? 1 : -1;
    const key = state.sort.key;
    const left = key === 'investors' ? a._investors.join(', ') : key === 'source' ? a.source_name : a[key];
    const right = key === 'investors' ? b._investors.join(', ') : key === 'source' ? b.source_name : b[key];
    if (typeof left === 'number' && typeof right === 'number') return (left - right) * dir;
    return String(left).localeCompare(String(right)) * dir;
  });
  $('#explore-count').textContent = rows.length + ' of ' + state.all.length + ' rows';
  $('#table thead').innerHTML = '<tr>' + COLUMNS.map(([key, label]) => {
    const on = state.sort.key === key;
    const arrow = on ? (state.sort.dir === 'asc' ? ' ↑' : ' ↓') : '';
    return `<th scope="col" aria-sort="${on ? (state.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}"><button type="button" data-sort="${key}">${label}${arrow}</button></th>`;
  }).join('') + '</tr>';
  $('#table tbody').innerHTML = rows.map((row) => {
    const href = safeUrl(row.source_url);
    return `<tr><td><span class="name">${esc(row.company)}</span><span class="sub">${esc(row.extraction === 'sec-form-d' ? 'SEC Form D' : 'News')}</span></td><td>${esc(row.sector)}</td><td>${esc(row.stage)}</td><td class="amount">${esc(money(row.amount_usd))}</td><td class="num">${esc(pretty(row.date))}</td><td>${esc(row._investors.slice(0, 3).join(', ') || 'Not named')}${row._investors.length > 3 ? `<span class="sub">+${row._investors.length - 3} more</span>` : ''}</td><td><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(hostOf(href))}</a></td></tr>`;
  }).join('') || '<tr><td colspan="7">No rows match these filters.</td></tr>';
}

function tokens(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').filter((token) => token.length > 2 && !STOP.has(token));
}
function buildIndex() {
  const docs = state.all.map((row) => ({
    row,
    tokens: tokens([row.company, row.description, row.sector, row.stage, row._investors.join(' ')].join(' '))
  }));
  const df = new Map();
  docs.forEach((doc) => new Set(doc.tokens).forEach((token) => df.set(token, (df.get(token) || 0) + 1)));
  const n = docs.length || 1;
  const idf = (token) => Math.log((n + 1) / ((df.get(token) || 0) + 1)) + 1;
  function vector(list) {
    const counts = new Map();
    list.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
    const out = new Map();
    let norm = 0;
    counts.forEach((count, token) => {
      const weight = (count / list.length) * idf(token);
      out.set(token, weight);
      norm += weight * weight;
    });
    return { weights: out, norm: Math.sqrt(norm) || 1 };
  }
  docs.forEach((doc) => { doc.vector = vector(doc.tokens.length ? doc.tokens : ['empty']); });
  state.index = { docs, idf, vector };
}
function cosine(a, b) {
  let dot = 0;
  a.weights.forEach((weight, token) => { if (b.weights.has(token)) dot += weight * b.weights.get(token); });
  return dot / (a.norm * b.norm);
}
function recency(iso) {
  const today = Date.parse(localISO(new Date()) + 'T00:00:00Z');
  const then = Date.parse(iso + 'T00:00:00Z');
  return Math.exp(-Math.max(0, (today - then) / 86400000) / 450);
}
function renderMatch(run) {
  if (!run) {
    if (!$('#matches').childElementCount) $('#matches').innerHTML = '<p class="hint">Results appear here, with the words that overlapped and the comparable deals.</p>';
    return;
  }
  const text = $('#pitch').value.trim();
  const sector = $('#match-sector').value;
  const stage = $('#match-stage').value;
  if (text.length < 8 && !sector && !stage) {
    $('#matches').innerHTML = '<p class="hint">Add a short description, or choose a sector or stage.</p>';
    return;
  }
  if (!state.index) buildIndex();
  const queryTokens = tokens(text + ' ' + sector + ' ' + stage + ' ' + (sector + ' ').repeat(3) + (stage + ' ').repeat(2));
  const query = state.index.vector(queryTokens.length ? queryTokens : ['startup']);
  const scores = new Map();
  state.index.docs.forEach((doc) => {
    if (!doc.row._investors.length) return;
    let score = cosine(query, doc.vector);
    if (sector && doc.row.sector === sector) score *= 1.45;
    if (stage && doc.row.stage === stage) score *= 1.2;
    if (score < 0.04) return;
    const weighted = score * recency(doc.row.date);
    doc.row._investors.forEach((name) => {
      if (!scores.has(name)) scores.set(name, { name, score: 0, deals: [] });
      const item = scores.get(name);
      item.score += weighted;
      item.deals.push({ row: doc.row, score, overlap: overlapTerms(query, doc) });
    });
  });
  const ranked = [...scores.values()].sort((a, b) => b.score - a.score).slice(0, 8);
  if (!ranked.length) {
    $('#matches').innerHTML = '<p class="hint">No named investors in the sample look close to that description. Try broader wording or a sector.</p>';
    return;
  }
  $('#matches').innerHTML = ranked.map((item, index) => {
    item.deals.sort((a, b) => b.score - a.score);
    const top = item.deals.slice(0, 3);
    const words = [...new Set(top.flatMap((deal) => deal.overlap))].slice(0, 6);
    const sectorHits = sector ? top.filter((deal) => deal.row.sector === sector).length : 0;
    const why = [
      words.length ? 'Overlapping words: ' + words.join(', ') + '.' : 'Matched on sector and stage more than on wording.',
      sector ? sectorHits + ' of the closest deals are in ' + sector + '.' : '',
      'Recent deals count more than older ones.'
    ].filter(Boolean).join(' ');
    const list = top.map((deal) => {
      const href = safeUrl(deal.row.source_url);
      return `<li><a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(deal.row.company)}</a> · ${esc(money(deal.row.amount_usd))} · ${esc(pretty(deal.row.date))} · ${esc(deal.row.sector)}, ${esc(deal.row.stage)}</li>`;
    }).join('');
    return `<article class="match"><p class="eyebrow">Match ${index + 1}</p><h3>${esc(item.name)}</h3><p class="why">${esc(why)}</p><ol>${list}</ol></article>`;
  }).join('');
}
function overlapTerms(query, doc) {
  const terms = [];
  query.weights.forEach((weight, token) => {
    if (doc.vector.weights.has(token)) terms.push([token, weight * doc.vector.weights.get(token)]);
  });
  return terms.sort((a, b) => b[1] - a[1]).slice(0, 4).map(([token]) => token);
}

function fillSelects() {
  const sectors = [...new Set(state.all.map((row) => row.sector))].sort();
  const stages = [...new Set(state.all.map((row) => row.stage))].sort();
  $('#sector').innerHTML = '<option value="">All sectors</option>' + sectors.map((name) => `<option>${esc(name)}</option>`).join('');
  $('#stage').innerHTML = '<option value="">All stages</option>' + stages.map((name) => `<option>${esc(name)}</option>`).join('');
  $('#match-sector').innerHTML = '<option value="">Any sector</option>' + sectors.map((name) => `<option>${esc(name)}</option>`).join('');
  $('#match-stage').innerHTML = '<option value="">Any stage</option>' + stages.map((name) => `<option>${esc(name)}</option>`).join('');
  const dates = state.all.map((row) => row.date).sort();
  if (dates.length) {
    $('#from').min = dates[0];
    $('#from').max = dates[dates.length - 1];
    $('#to').min = dates[0];
    $('#to').max = dates[dates.length - 1];
  }
}
function wire() {
  $('#nav').innerHTML = VIEWS.map(([id, label]) => `<button type="button" data-view="${id}">${label}</button>`).join('');
  $('#nav').addEventListener('click', (event) => {
    const button = event.target.closest('[data-view]');
    if (button) setView(button.dataset.view);
  });
  $('#theme').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
  $('#windows').addEventListener('click', (event) => {
    const button = event.target.closest('[data-window]');
    if (!button) return;
    state.window = Number(button.dataset.window);
    renderHot();
  });
  ['search', 'from', 'to'].forEach((id) => $('#' + id).addEventListener('input', renderTable));
  ['sector', 'stage'].forEach((id) => $('#' + id).addEventListener('change', renderTable));
  $('#clear').addEventListener('click', () => {
    $('#search').value = '';
    $('#from').value = '';
    $('#to').value = '';
    $('#sector').value = '';
    $('#stage').value = '';
    renderTable();
  });
  $('#table').addEventListener('click', (event) => {
    const button = event.target.closest('[data-sort]');
    if (!button) return;
    const key = button.dataset.sort;
    if (state.sort.key === key) state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    else state.sort = { key, dir: key === 'company' || key === 'sector' || key === 'stage' || key === 'investors' || key === 'source' ? 'asc' : 'desc' };
    renderTable();
  });
  $('#match-form').addEventListener('submit', (event) => {
    event.preventDefault();
    renderMatch(true);
  });
  window.addEventListener('hashchange', () => setView(location.hash.slice(1)));
  let timer;
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { if (state.view === 'overview') drawCharts(); }, 150);
  });
}

async function init() {
  wire();
  setTheme(document.documentElement.dataset.theme || 'light');
  try {
    const [rounds, meta] = await Promise.all(['rounds', 'meta'].map(async (name) => {
      const response = await fetch('data/' + name + '.json');
      if (!response.ok) throw new Error('Funding data is unavailable.');
      return response.json();
    }));
    if (!Array.isArray(rounds)) throw new Error('Funding data is unavailable.');
    state.meta = meta || {};
    state.all = prepare(rounds, localISO(new Date()));
    fillSelects();
    buildIndex();
    setStatus('');
    const initial = location.hash.replace('#', '');
    setView(VIEWS.some(([id]) => id === initial) ? initial : 'overview');
  } catch (error) {
    setStatus(error.message || 'Funding data is unavailable.');
  }
}
init();
