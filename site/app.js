'use strict';

const VIEWS = [
  ['overview', 'Overview'],
  ['startups', 'Startups'],
  ['investors', 'Investors'],
  ['sectors', 'Sectors'],
  ['explore', 'Explore']
];
const SECTORS = ['AI/ML', 'Fintech', 'Health/Bio', 'Climate/Energy', 'Defense/Space', 'Enterprise SaaS', 'Dev Tools/Infra', 'Security', 'Consumer', 'Robotics/Hardware', 'Crypto/Web3', 'Mobility', 'Other'];
const STAGE_ORDER = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Series E+', 'Growth/Late', 'Debt', 'Unknown'];
const PALETTE = {
  light: ['#1f7a64', '#2c6cb0', '#6d4ea3', '#5d7a32', '#b86a2d', '#2a7c78', '#3e6284', '#a84b52', '#a45d86', '#4550a8', '#8a7044', '#2f8a5b', '#6b7280'],
  dark: ['#7ddec0', '#8eb6f2', '#c7b0ea', '#d5e09a', '#f0b27a', '#8fd4cf', '#b7cbe0', '#f0a3a6', '#f0c2dc', '#b7bef5', '#e2c99a', '#9ee0bc', '#a8b4c0']
};

const ALIAS = {
  'a16z': 'Andreessen Horowitz',
  'andreessen horowitz': 'Andreessen Horowitz',
  'andreessen horowitz (a16z)': 'Andreessen Horowitz',
  'a16z speedrun': 'a16z Speedrun',
  'sequoia': 'Sequoia Capital',
  'sequoia capital': 'Sequoia Capital',
  'nea': 'NEA',
  'enterprise associates': 'NEA',
  'enterprise associates (nea)': 'NEA',
  'new enterprise associates': 'NEA',
  'new enterprise associates (nea)': 'NEA',
  'iconiq': 'ICONIQ',
  'nvidia': 'NVIDIA',
  'nvidia .the fundraise': 'NVIDIA',
  'gv': 'Google Ventures',
  'google ventures': 'Google Ventures',
  'y combinator': 'Y Combinator',
  'yc': 'Y Combinator',
  'usv': 'Union Square Ventures',
  'union square ventures': 'Union Square Ventures',
  "microsoft's venture fund": 'M12',
  "m12 (microsoft's venture fund)": 'M12',
  "microsoft's venture fund m12": 'M12',
  'm12': 'M12',
  'index': 'Index Ventures',
  'index ventures': 'Index Ventures',
  'lux': 'Lux Capital',
  'lux capital': 'Lux Capital',
  'greylock': 'Greylock',
  'greylock partners': 'Greylock',
  'tiger global': 'Tiger Global',
  'tiger global management': 'Tiger Global',
  'coatue': 'Coatue',
  'coatue management': 'Coatue',
  'insight': 'Insight Partners',
  'insight partners': 'Insight Partners',
  'accel': 'Accel',
  'bessemer': 'Bessemer Venture Partners',
  'bessemer venture partners': 'Bessemer Venture Partners',
  'lightspeed': 'Lightspeed Venture Partners',
  'lightspeed venture partners': 'Lightspeed Venture Partners',
  'founders fund': 'Founders Fund',
  'khosla': 'Khosla Ventures',
  'khosla ventures': 'Khosla Ventures',
  'general catalyst': 'General Catalyst',
  'ribbit': 'Ribbit Capital',
  'ribbit capital': 'Ribbit Capital',
  'thrive': 'Thrive Capital',
  'thrive capital': 'Thrive Capital',
  'kleiner perkins': 'Kleiner Perkins',
  'benchmark': 'Benchmark',
  'benchmark capital': 'Benchmark',
  'first round': 'First Round Capital',
  'first round capital': 'First Round Capital',
  'initialized': 'Initialized Capital',
  'initialized capital': 'Initialized Capital',
  'redpoint': 'Redpoint Ventures',
  'redpoint ventures': 'Redpoint Ventures',
  'spark capital': 'Spark Capital',
  'menlo': 'Menlo Ventures',
  'menlo ventures': 'Menlo Ventures',
  'battery': 'Battery Ventures',
  'battery ventures': 'Battery Ventures',
  'eqt': 'EQT',
  'eqt ventures': 'EQT',
  'dst': 'DST Global',
  'dst global': 'DST Global',
  'boldstart': 'Boldstart Ventures',
  'boldstart ventures': 'Boldstart Ventures',
  'stepstone': 'StepStone',
  'stepstone group': 'StepStone',
  'altimeter': 'Altimeter',
  'altimeter capital': 'Altimeter',
  'quantumlight': 'QuantumLight',
  'quantumlight capital': 'QuantumLight',
  'xora': 'Xora Innovation',
  'xora innovation': 'Xora Innovation',
  'definition': 'Definition Capital',
  'definition capital': 'Definition Capital',
  'triatomic': 'Triatomic Capital',
  'triatomic capital': 'Triatomic Capital',
  'avenir': 'Avenir Growth Capital',
  'avenir growth capital': 'Avenir Growth Capital',
  'evolution': 'Evolution Equity Partners',
  'evolution equity partners': 'Evolution Equity Partners',
  'jane street': 'Jane Street',
  'jane street capital': 'Jane Street',
  'point72': 'Point72 Ventures',
  'point72 ventures': 'Point72 Ventures',
  'gradient': 'Gradient Ventures',
  'gradient ventures': 'Gradient Ventures',
  'lightbank': 'Lightbank',
  'lightbank vc': 'Lightbank',
  'wellington': 'Wellington Management',
  'wellington management': 'Wellington Management',
  'citi': 'Citi Ventures',
  'citi ventures': 'Citi Ventures',
  'salesforce': 'Salesforce Ventures',
  'salesforce ventures': 'Salesforce Ventures',
  'janus henderson': 'Janus Henderson Investors',
  'janus henderson investors': 'Janus Henderson Investors',
  'allianz': 'Allianz X',
  'allianz x': 'Allianz X',
  'invus': 'The Invus Group',
  'the invus group': 'The Invus Group',
  'baillie gifford': 'Baillie Gifford',
  'baillie gifford press': 'Baillie Gifford',
  'arch venture partners': 'ARCH Venture Partners',
  '8vc': '8VC',
  '8vc 1': '8VC'
};
const DROP = new Set(['others', 'other investors', 'other investor', 'ceo', 'ceos', 'ventures', 'along', 'oct', 'proprietary benchmarks', 'additional angel investors', 'select angel investors', 'several individual strategic investors', 'earlier investors', 'strategic angel investors', 'other corporate investors', 'previous angel investors', 'angel investors', 'in addition to several individual investors', 'amongst others as well as existing investors', 'an early investor in openai', 'new', 'existing', 'investor', 'investors', 'vc', 'co-founder', 'health systems', 'health system']);
const PREFIX = /^(?:as well as existing investors|as well as|such as|previous investors|major investor|other new investors|founder of|managing partner at|general partner at|backed by|companies such as|included new strategic investors|strategic investors|existing investors)\s+/i;

function cleanOne(raw) {
  let s = String(raw ?? '').replace(/\s+/g, ' ').trim().replace(/[’‘]/g, "'");
  s = s.replace(PREFIX, '').replace(/\s+along$/i, '').replace(/\s+1$/, '').replace(/^[\s.]+|[\s.]+$/g, '');
  const key = s.toLowerCase();
  if (key.length < 2) return null;
  if (Object.prototype.hasOwnProperty.call(ALIAS, key)) return ALIAS[key];
  if (DROP.has(key)) return null;
  return s;
}

function buildCanon(rawNames) {
  const counts = new Map();
  for (const raw of rawNames) {
    const n = cleanOne(raw);
    if (n) counts.set(n, (counts.get(n) || 0) + 1);
  }
  const suffixMap = new Map();
  const suffixes = [' Venture Partners', ' Ventures', ' Capital', ' Partners', ' Management', ' VC'];
  const stop = new Set(['capital', 'ventures', 'partners', 'global', 'fund', 'funds', 'growth', 'equity', 'management', 'venture', 'new', 'other', 'strategic', 'angel', 'individual', 'corporate', 'early', 'previous', 'existing', 'several', 'select', 'additional', 'general']);
  for (const n of counts.keys()) suffixMap.set(n, n);
  for (const n of counts.keys()) {
    for (const suf of suffixes) {
      if (!n.endsWith(suf)) continue;
      const base = n.slice(0, -suf.length);
      if (counts.has(base) && base.length >= 4 && !stop.has(base.toLowerCase())) suffixMap.set(base, n);
    }
  }
  function suffixCanon(n) {
    const seen = new Set();
    while (suffixMap.get(n) && suffixMap.get(n) !== n && !seen.has(n)) {
      seen.add(n);
      n = suffixMap.get(n);
    }
    return n;
  }
  const weight = new Map();
  for (const [n, c] of counts) {
    const canon = suffixCanon(n);
    weight.set(canon, (weight.get(canon) || 0) + c);
  }
  const grouped = new Map();
  for (const canon of weight.keys()) {
    const k = canon.toLowerCase();
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k).push(canon);
  }
  const caseMap = new Map();
  for (const [k, arr] of grouped) {
    arr.sort((a, b) => (weight.get(b) || 0) - (weight.get(a) || 0) || b.length - a.length);
    caseMap.set(k, arr[0]);
  }
  return function canon(raw) {
    const n = cleanOne(raw);
    if (!n) return null;
    const c = suffixCanon(n);
    return caseMap.get(c.toLowerCase()) || c;
  };
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tidy = (s) => String(s ?? '').replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function pretty(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return MONTHS[m - 1] + ' ' + d + ', ' + y;
}
function money(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? '-' : '';
  const a = Math.abs(v);
  const num = a >= 1e9 ? a / 1e9 : a >= 1e6 ? a / 1e6 : a >= 1e3 ? a / 1e3 : a;
  const suffix = a >= 1e9 ? 'B' : a >= 1e6 ? 'M' : a >= 1e3 ? 'K' : '';
  const digits = suffix && num < 10 ? 2 : suffix && num < 100 ? 1 : 0;
  const text = digits ? num.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1') : String(Math.round(num));
  return sign + '$' + text + suffix;
}
function safeUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.href;
  } catch (e) { /* ignore bad urls */ }
  return '';
}
function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}
function color(sector) {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const i = Math.max(0, SECTORS.indexOf(sector));
  return PALETTE[theme][i] || PALETTE[theme][12];
}
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const state = {
  all: [],
  filtered: [],
  meta: {},
  view: 'overview',
  sectors: new Set(SECTORS),
  investor: '',
  defaults: { from: '', to: '' },
  netCap: 24,
  sort: { key: 'date', dir: 'desc' },
  byId: new Map(),
  simulation: null,
  zoom: null,
  drawToken: 0,
  canon: (name) => cleanOne(name)
};

let drawerHistory = [];
let lastFocus = null;

function investorsOf(r) {
  return r._investors;
}

function readControls() {
  const minRaw = $('#min').value;
  const maxRaw = $('#max').value;
  const min = Number(minRaw);
  const max = Number(maxRaw);
  return {
    q: $('#search').value.trim().toLowerCase(),
    from: $('#from').value,
    to: $('#to').value,
    min: minRaw !== '' && Number.isFinite(min) ? min * 1e6 : 0,
    max: maxRaw !== '' && Number.isFinite(max) ? max * 1e6 : Infinity,
    stage: $('#stage').value
  };
}

function matches(r, controls, opts = {}) {
  if (!opts.ignoreSector && !state.sectors.has(r.sector)) return false;
  if (!opts.ignoreStage && controls.stage && r.stage !== controls.stage) return false;
  if (controls.from && r.date < controls.from) return false;
  if (controls.to && r.date > controls.to) return false;
  if (r.amount_usd < controls.min || r.amount_usd > controls.max) return false;
  if (state.investor && !r._investors.includes(state.investor)) return false;
  if (controls.q) {
    const hay = (r.company + ' ' + r._investors.join(' ')).toLowerCase();
    if (!hay.includes(controls.q)) return false;
  }
  return true;
}

function apply() {
  const controls = readControls();
  state.filtered = state.all.filter((r) => matches(r, controls));
  render();
}

function filtersActive(controls) {
  const sectorChanged = state.sectors.size !== SECTORS.length;
  return Boolean(
    controls.q || state.investor || controls.stage || sectorChanged ||
    controls.min > 0 || Number.isFinite(controls.max) ||
    controls.from !== state.defaults.from || controls.to !== state.defaults.to
  );
}

function updateCount() {
  $('#result-count').textContent = state.filtered.length + ' of ' + state.all.length + ' rounds';
}

function chip(label, onRemove) {
  const el = document.createElement('span');
  el.className = 'chip';
  el.append(document.createTextNode(label));
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Remove filter ' + label);
  btn.textContent = '×';
  btn.addEventListener('click', onRemove);
  el.append(btn);
  return el;
}

function updateChips() {
  const controls = readControls();
  const box = $('#chips');
  box.replaceChildren();
  const active = filtersActive(controls);
  $('#clear-all').hidden = !active;
  if (controls.q) box.append(chip('Search: ' + $('#search').value.trim(), () => { $('#search').value = ''; apply(); }));
  if (state.investor) box.append(chip('Investor: ' + state.investor, () => { state.investor = ''; apply(); }));
  if (controls.stage) box.append(chip(controls.stage, () => { $('#stage').value = ''; apply(); }));
  if (controls.from !== state.defaults.from) box.append(chip('From ' + pretty(controls.from), () => { $('#from').value = state.defaults.from; apply(); }));
  if (controls.to !== state.defaults.to) box.append(chip('To ' + pretty(controls.to), () => { $('#to').value = state.defaults.to; apply(); }));
  if (controls.min > 0) box.append(chip('Min ' + money(controls.min), () => { $('#min').value = ''; apply(); }));
  if (Number.isFinite(controls.max)) box.append(chip('Max ' + money(controls.max), () => { $('#max').value = ''; apply(); }));
  if (state.sectors.size !== SECTORS.length) {
    const excluded = SECTORS.filter((s) => !state.sectors.has(s));
    if (excluded.length && excluded.length <= 3) {
      excluded.forEach((s) => box.append(chip('Except ' + s, () => { state.sectors.add(s); syncSectors(); apply(); })));
    } else {
      [...state.sectors].forEach((s) => box.append(chip(s, () => {
        state.sectors.delete(s);
        if (!state.sectors.size) SECTORS.forEach((name) => state.sectors.add(name));
        syncSectors();
        apply();
      })));
    }
  }
}

function syncSectors() {
  $$('#sectors button').forEach((btn) => {
    const on = state.sectors.has(btn.dataset.sector);
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}

function clearAll() {
  $('#search').value = '';
  $('#from').value = state.defaults.from;
  $('#to').value = state.defaults.to;
  $('#min').value = '';
  $('#max').value = '';
  $('#stage').value = '';
  state.investor = '';
  state.sectors = new Set(SECTORS);
  syncSectors();
  apply();
}

function onlySector(sector) {
  if (state.sectors.size === 1 && state.sectors.has(sector)) state.sectors = new Set(SECTORS);
  else state.sectors = new Set([sector]);
  syncSectors();
  apply();
}

function onlyInvestor(name) {
  state.investor = state.investor === name ? '' : name;
  apply();
}

function setFiltersOpen(open) {
  $('#filter-panel').hidden = !open;
  const btn = $('#filter-toggle');
  btn.setAttribute('aria-expanded', String(open));
  btn.textContent = open ? 'Hide filters' : 'Show filters';
}

function setView(name, updateHash) {
  if (!VIEWS.some(([id]) => id === name)) name = 'overview';
  state.view = name;
  VIEWS.forEach(([id]) => {
    $('#view-' + id).hidden = id !== name;
  });
  $$('#nav button').forEach((btn) => {
    const on = btn.dataset.view === name;
    btn.classList.toggle('is-active', on);
    if (on) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  document.title = 'Signal — ' + VIEWS.find(([id]) => id === name)[1];
  if (updateHash !== false && location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
  hideTooltip();
  render();
}

function render() {
  updateChips();
  updateCount();
  paintSectorButtons();
  if (state.view === 'overview') renderOverview();
  if (state.view === 'explore') renderTable();
  if (state.view === 'startups' || state.view === 'investors' || state.view === 'sectors') {
    requestAnimationFrame(() => drawChart());
  }
}

function daysAgo(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function renderOverview() {
  const rows = state.filtered;
  const sum = rows.reduce((a, r) => a + r.amount_usd, 0);
  const amounts = rows.map((r) => r.amount_usd).sort((a, b) => a - b);
  const median = amounts.length ? amounts[Math.floor((amounts.length - 1) / 2)] : 0;
  const investors = new Set(rows.flatMap(investorsOf));
  const cards = [
    ['Capital raised', money(sum), 'Disclosed round sizes'],
    ['Funding rounds', rows.length.toLocaleString(), 'In the current filters'],
    ['Median round', money(median), 'Middle of this selection'],
    ['Investors', investors.size.toLocaleString(), 'Named, after merging duplicates']
  ];
  $('#kpis').innerHTML = cards.map(([label, value, note]) =>
    `<article class="stat"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></article>`
  ).join('');

  const bySector = SECTORS.map((sector) => {
    const list = rows.filter((r) => r.sector === sector);
    return { sector, sum: list.reduce((a, r) => a + r.amount_usd, 0), count: list.length };
  }).filter((d) => d.count).sort((a, b) => b.sum - a.sum);
  const byCount = [...bySector].sort((a, b) => b.count - a.count);
  const big = [...rows].sort((a, b) => b.amount_usd - a.amount_usd).slice(0, 4);
  const topInv = investorRanks(rows).slice(0, 8);
  const end = state.meta.as_of || (rows[0] && rows[0].date) || '';
  const recent = rows.filter((r) => end && r.date > daysAgo(end, 30));
  const prior = rows.filter((r) => end && r.date > daysAgo(end, 60) && r.date <= daysAgo(end, 30));
  const rSum = recent.reduce((a, r) => a + r.amount_usd, 0);
  const pSum = prior.reduce((a, r) => a + r.amount_usd, 0);
  let change = 'No prior 30-day capital to compare.';
  if (pSum) {
    const pct = Math.abs((rSum / pSum - 1) * 100);
    change = pct.toFixed(0) + '% ' + (rSum >= pSum ? 'higher' : 'lower') + ' than the prior 30 days.';
  }
  const leadSector = bySector[0];
  const leadCount = byCount[0];
  $('#narrative').textContent = rows.length && leadSector
    ? leadSector.sector + ' leads by capital with ' + money(leadSector.sum) + '. ' +
      (leadCount.sector === leadSector.sector
        ? 'It also has the most deals, ' + leadCount.count + ' rounds. '
        : leadCount.sector + ' has the most deals, ' + leadCount.count + ' rounds. ') +
      'Largest disclosed rounds: ' + big.map((r) => r.company + ' (' + money(r.amount_usd) + ')').join(', ') + '.'
    : 'No rounds match these filters.';

  const maxSector = bySector[0] ? bySector[0].sum : 1;
  $('#sector-cards').innerHTML = bySector.slice(0, 6).map((d) => {
    const on = state.sectors.size === 1 && state.sectors.has(d.sector);
    return `<button type="button" class="insight${on ? ' is-active' : ''}" data-sector="${esc(d.sector)}" aria-pressed="${on}">
      <span class="name"><i class="swatch" style="background:${color(d.sector)}"></i> ${esc(d.sector)}</span>
      <strong>${esc(money(d.sum))}</strong>
      <span class="meta">${d.count} rounds</span>
      <span class="meter" aria-hidden="true"><span style="width:${Math.max(6, d.sum / maxSector * 100)}%;background:${color(d.sector)}"></span></span>
    </button>`;
  }).join('');

  const maxDeals = topInv[0] ? topInv[0].count : 1;
  $('#investor-cards').innerHTML = topInv.map((d) => {
    const on = state.investor === d.name;
    return `<button type="button" class="insight${on ? ' is-active' : ''}" data-investor="${esc(d.name)}" aria-pressed="${on}">
      <span class="name">${esc(d.name)}</span>
      <strong>${d.count}</strong>
      <span class="meta">${d.count === 1 ? 'deal' : 'deals'} · ${esc(money(d.sum))} in rounds</span>
      <span class="meter" aria-hidden="true"><span style="width:${Math.max(8, d.count / maxDeals * 100)}%;background:var(--accent)"></span></span>
    </button>`;
  }).join('');

  $('#round-cards').innerHTML = big.map((r) =>
    `<button type="button" data-round="${r._id}">
      <span><span class="name">${esc(r.company)}</span><span class="meta">${esc(r.sector)} · ${esc(r.stage)} · ${esc(pretty(r.date))}</span></span>
      <strong>${esc(money(r.amount_usd))}</strong>
    </button>`
  ).join('');

  $('#momentum').innerHTML = `
    <article><span class="eyebrow">Last 30 days</span><strong>${esc(money(rSum))}</strong><p>${recent.length} rounds through ${esc(pretty(end))}. ${esc(change)}</p></article>
    <article><span class="eyebrow">Prior 30 days</span><strong>${esc(money(pSum))}</strong><p>${prior.length} rounds. Comparison uses the snapshot end date and the current filters.</p></article>`;
}

function investorRanks(rows) {
  const map = new Map();
  rows.forEach((r) => {
    r._investors.forEach((name) => {
      if (!map.has(name)) map.set(name, { name, count: 0, sum: 0 });
      const item = map.get(name);
      item.count += 1;
      item.sum += r.amount_usd;
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count || b.sum - a.sum || a.name.localeCompare(b.name));
}

const COLUMNS = [
  ['company', 'Company'],
  ['sector', 'Sector'],
  ['stage', 'Stage'],
  ['amount_usd', 'Raised'],
  ['date', 'Announced'],
  ['investors', 'Investors'],
  ['source', 'Source']
];

function renderTable() {
  const table = $('#rounds-table');
  const head = table.querySelector('thead');
  const body = table.querySelector('tbody');
  head.innerHTML = '<tr>' + COLUMNS.map(([key, label]) => {
    const on = state.sort.key === key;
    const arrow = on ? (state.sort.dir === 'asc' ? ' ↑' : ' ↓') : '';
    return `<th scope="col"${key === 'amount_usd' || key === 'date' ? ' class="num"' : ''} aria-sort="${on ? (state.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}"><button type="button" data-sort="${key}">${label}${arrow}</button></th>`;
  }).join('') + '</tr>';
  const rows = [...state.filtered].sort((a, b) => {
    const dir = state.sort.dir === 'asc' ? 1 : -1;
    const key = state.sort.key;
    const av = key === 'investors' ? a._investors.join(', ') : key === 'source' ? a.source_name : a[key];
    const bv = key === 'investors' ? b._investors.join(', ') : key === 'source' ? b.source_name : b[key];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="7">No rounds match these filters.</td></tr>';
    return;
  }
  body.innerHTML = rows.map((r) => {
    const href = safeUrl(r.source_url);
    const leads = r.lead_investors.join(', ');
    return `<tr data-round="${r._id}" tabindex="0">
      <td><span class="name">${esc(r.company)}</span>${leads ? `<span class="sub">${esc(leads)}</span>` : ''}</td>
      <td>${esc(r.sector)}</td>
      <td>${esc(r.stage)}</td>
      <td class="num amount">${esc(money(r.amount_usd))}</td>
      <td class="num">${esc(pretty(r.date))}</td>
      <td>${esc(r._investors.slice(0, 4).join(', ') || 'Not named')}${r._investors.length > 4 ? `<span class="sub">+${r._investors.length - 4} more</span>` : ''}</td>
      <td>${href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(hostOf(href) || 'Article')}</a>` : esc(r.source_name || '')}</td>
    </tr>`;
  }).join('');
}

function hideTooltip() {
  const tip = $('#tooltip');
  tip.hidden = true;
  tip.innerHTML = '';
}

function showTooltip(event, html) {
  const tip = $('#tooltip');
  tip.hidden = false;
  tip.innerHTML = html;
  const rect = tip.getBoundingClientRect();
  let x = event.clientX + 16;
  let y = event.clientY + 18;
  if (x + rect.width > window.innerWidth - 12) x = event.clientX - rect.width - 14;
  if (y + rect.height > window.innerHeight - 12) y = event.clientY - rect.height - 14;
  tip.style.left = Math.max(8, x) + 'px';
  tip.style.top = Math.max(8, y) + 'px';
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function mountSvg(el, label) {
  const w = Math.max(280, el.clientWidth);
  const h = Math.max(280, el.clientHeight);
  el.innerHTML = '';
  const svg = d3.select(el).append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('role', 'img')
    .attr('aria-label', label);
  const root = svg.append('g');
  const zoom = d3.zoom().scaleExtent([0.45, 8]).on('zoom', (event) => {
    root.attr('transform', event.transform);
  });
  svg.call(zoom).on('dblclick.zoom', null);
  state.zoom = { behavior: zoom, svg, root };
  return { svg, root, w, h, zoom };
}

function drawChart() {
  if (state.simulation) state.simulation.stop();
  const token = ++state.drawToken;
  hideTooltip();
  if (!state.filtered.length) {
    const el = chartHost();
    if (el) el.innerHTML = '';
    const note = state.view === 'investors' ? $('#net-note') : null;
    if (note) note.textContent = 'No rounds match these filters.';
    return;
  }
  if (state.view === 'startups') drawBubbles(token);
  if (state.view === 'investors') drawNetwork(token);
  if (state.view === 'sectors') drawFlow(token);
}

function chartHost() {
  if (state.view === 'startups') return $('#bubble-chart');
  if (state.view === 'investors') return $('#net-chart');
  if (state.view === 'sectors') return $('#flow-chart');
  return null;
}

function legend(el, sectors) {
  el.innerHTML = sectors.map((s) => `<span><i class="swatch" style="background:${color(s)}"></i>${esc(s)}</span>`).join('');
}

function drawBubbles() {
  const el = $('#bubble-chart');
  if (!el || !el.clientWidth) return;
  const used = SECTORS.filter((s) => state.filtered.some((r) => r.sector === s));
  legend($('#bubble-legend'), used);
  const { root, w, h } = mountSvg(el, 'Funding rounds sized by capital raised');
  const max = d3.max(state.filtered, (d) => d.amount_usd) || 1;
  const scale = d3.scaleSqrt().domain([0, max]).range([16, Math.min(w, h) * 0.18]);
  const nodes = state.filtered.map((r) => ({ ...r, r: Math.max(12, scale(r.amount_usd)) }));
  const area = d3.sum(nodes, (n) => Math.PI * (n.r + 6) ** 2);
  const shrink = Math.min(1, Math.sqrt(w * h * 0.62 / Math.max(area, 1)));
  nodes.forEach((n) => { n.r = Math.max(11, n.r * shrink); });
  const labelFill = document.documentElement.dataset.theme === 'dark' ? '#14211c' : '#f7fffb';
  const sim = d3.forceSimulation(nodes)
    .force('x', d3.forceX(w / 2).strength(0.08))
    .force('y', d3.forceY(h / 2).strength(0.08))
    .force('collide', d3.forceCollide((d) => d.r + 3).iterations(3))
    .stop();
  for (let i = 0; i < 280; i++) sim.tick();
  nodes.forEach((d) => {
    d.x = Math.max(d.r + 2, Math.min(w - d.r - 2, d.x));
    d.y = Math.max(d.r + 2, Math.min(h - d.r - 2, d.y));
  });
  const g = root.selectAll('g').data(nodes).join('g')
    .attr('transform', (d) => `translate(${d.x},${d.y})`)
    .attr('role', 'button')
    .attr('aria-label', (d) => `${d.company}, ${money(d.amount_usd)}`)
    .style('cursor', 'pointer')
    .on('click', (event, d) => { if (event.defaultPrevented) return; openRound(d); })
    .on('pointermove', (event, d) => showTooltip(event, `<strong>${esc(d.company)}</strong><br>${esc(money(d.amount_usd))} · ${esc(d.stage)}<br>${esc(d.sector)}`))
    .on('pointerleave', hideTooltip);
  g.append('circle')
    .attr('r', (d) => d.r)
    .attr('fill', (d) => color(d.sector))
    .attr('fill-opacity', 0.92)
    .attr('stroke', (d) => color(d.sector));
  g.filter((d) => d.r > 26).append('text')
    .attr('class', 'bubble-label')
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => d.r > 38 ? '-0.15em' : '0.35em')
    .attr('fill', labelFill)
    .style('font-size', (d) => Math.min(15, d.r / 3.2) + 'px')
    .text((d) => d.company.length > d.r / 3.4 ? d.company.slice(0, Math.max(4, Math.floor(d.r / 3.4))) + '…' : d.company);
  g.filter((d) => d.r > 38).append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.15em')
    .attr('fill', labelFill)
    .attr('opacity', 0.85)
    .style('font-size', (d) => Math.min(13, d.r / 4.2) + 'px')
    .text((d) => money(d.amount_usd));
}

function drawNetwork(token) {
  const el = $('#net-chart');
  if (!el || !el.clientWidth) return;
  const ranks = investorRanks(state.filtered);
  const cap = state.netCap;
  const top = ranks.slice(0, cap);
  const allowed = new Set(top.map((d) => d.name));
  const linked = state.filtered.filter((r) => r._investors.some((name) => allowed.has(name)));
  const deals = [...linked].sort((a, b) => b.amount_usd - a.amount_usd).slice(0, 80);
  $('#net-note').textContent = top.length
    ? `Showing ${top.length} of ${ranks.length} investors and ${deals.length}${linked.length > deals.length ? ' of ' + linked.length : ''} startups. Labels show on hover.`
    : 'No named investors in this selection.';
  if (!top.length) {
    el.innerHTML = '';
    return;
  }
  const { root, w, h } = mountSvg(el, 'Investor and startup network');
  const nodes = [];
  const links = [];
  deals.forEach((r) => nodes.push({ id: 's' + r._id, type: 'startup', round: r, label: r.company, r: 8 }));
  top.forEach((inv) => nodes.push({ id: 'i:' + inv.name, type: 'investor', label: inv.name, count: inv.count, r: 12 + Math.sqrt(inv.count) * 5 }));
  const have = new Set(nodes.map((n) => n.id));
  deals.forEach((r) => {
    r._investors.filter((name) => allowed.has(name)).forEach((name) => {
      const target = 'i:' + name;
      if (have.has(target)) links.push({ source: 's' + r._id, target });
    });
  });
  const link = root.append('g').selectAll('line').data(links).join('line')
    .attr('stroke', cssVar('--muted')).attr('stroke-opacity', 0.35).attr('stroke-width', 1.2);
  let hovered = null;
  const g = root.append('g').selectAll('g').data(nodes).join('g')
    .attr('role', 'button')
    .attr('aria-label', (d) => d.label)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      if (event.defaultPrevented) return;
      if (d.type === 'startup') openRound(d.round);
      else openInvestor(d.label);
    })
    .on('pointermove', (event, d) => {
      hovered = d;
      const connected = new Set([d.id]);
      links.forEach((l) => {
        const s = l.source.id || l.source;
        const t = l.target.id || l.target;
        if (s === d.id) connected.add(t);
        if (t === d.id) connected.add(s);
      });
      g.attr('opacity', (n) => connected.has(n.id) ? 1 : 0.14);
      link.attr('stroke-opacity', (l) => (l.source.id === d.id || l.target.id === d.id) ? 0.9 : 0.04);
      const extra = d.type === 'investor' ? d.count + (d.count === 1 ? ' deal' : ' deals') : money(d.round.amount_usd) + ' · ' + d.round.stage;
      showTooltip(event, `<strong>${esc(d.label)}</strong><br>${esc(extra)}`);
      placeLabel();
    })
    .on('pointerleave', () => {
      hovered = null;
      hideTooltip();
      g.attr('opacity', 1);
      link.attr('stroke-opacity', 0.35);
      label.attr('display', 'none');
    });
  g.append('circle')
    .attr('r', (d) => d.r)
    .attr('fill', (d) => d.type === 'investor' ? cssVar('--accent') : color(d.round.sector))
    .attr('stroke', cssVar('--chart'))
    .attr('stroke-width', 2);
  const label = root.append('text').attr('class', 'hover-label').attr('fill', cssVar('--ink')).style('font-size', '13px').attr('display', 'none');
  function placeLabel() {
    if (!hovered) return;
    const k = state.zoom ? d3.zoomTransform(state.zoom.svg.node()).k : 1;
    label.attr('display', null)
      .attr('x', hovered.x + hovered.r + 8 / k)
      .attr('y', hovered.y + 4 / k)
      .style('font-size', (14 / k) + 'px')
      .text(hovered.label);
  }
  state.simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d) => d.id).distance(108))
    .force('charge', d3.forceManyBody().strength((d) => d.type === 'investor' ? -260 : -90))
    .force('center', d3.forceCenter(w / 2, h / 2))
    .force('collide', d3.forceCollide().radius((d) => d.r + 18).strength(0.95).iterations(3))
    .force('x', d3.forceX(w / 2).strength(0.045))
    .force('y', d3.forceY(h / 2).strength(0.06))
    .on('tick', () => {
      if (token !== state.drawToken) { state.simulation.stop(); return; }
      link.attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y).attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y);
      g.attr('transform', (d) => `translate(${d.x},${d.y})`);
      placeLabel();
    });
  state.zoom.behavior.on('zoom.network', (event) => {
    state.zoom.root.attr('transform', event.transform);
    placeLabel();
  });
}

function drawFlow() {
  const el = $('#flow-chart');
  if (!el || !el.clientWidth) return;
  const rows = state.filtered;
  const months = [...new Set(rows.map((r) => r.date.slice(0, 7)))].sort();
  const keys = SECTORS.filter((s) => rows.some((r) => r.sector === s));
  legend($('#flow-legend'), keys);
  const { root, w, h } = mountSvg(el, 'Monthly capital by sector');
  const data = months.map((month) => {
    const row = { month };
    keys.forEach((s) => { row[s] = d3.sum(rows.filter((r) => r.date.startsWith(month) && r.sector === s), (r) => r.amount_usd); });
    return row;
  });
  const margin = { left: 72, right: 24, top: 24, bottom: 56 };
  const x = d3.scaleBand().domain(months).range([margin.left, w - margin.right]).padding(0.28);
  const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d3.sum(keys, (s) => d[s])) || 1]).nice().range([h - margin.bottom, margin.top]);
  const axisInk = cssVar('--muted');
  const axisLine = cssVar('--line');
  const xAxis = root.append('g').attr('class', 'axis').attr('transform', `translate(0,${h - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat((d) => pretty(d + '-15').replace(/ \d+,/, '')));
  const yAxis = root.append('g').attr('class', 'axis').attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(money));
  root.selectAll('.axis text').attr('fill', axisInk);
  root.selectAll('.axis path, .axis line').attr('stroke', axisLine);
  const stacked = d3.stack().keys(keys)(data);
  root.append('g').selectAll('g').data(stacked).join('g').attr('fill', (d) => color(d.key))
    .selectAll('rect').data((d) => d.map((v) => ({ v, sector: d.key }))).join('rect')
    .attr('x', (d) => x(d.v.data.month))
    .attr('y', (d) => y(d.v[1]))
    .attr('height', (d) => Math.max(0, y(d.v[0]) - y(d.v[1])))
    .attr('width', x.bandwidth())
    .attr('rx', 5)
    .style('cursor', 'pointer')
    .on('pointermove', (event, d) => showTooltip(event, `<strong>${esc(d.sector)}</strong><br>${esc(pretty(d.v.data.month + '-15').replace(/ \d+,/, ''))}<br>${esc(money(d.v[1] - d.v[0]))}`))
    .on('pointerleave', hideTooltip)
    .on('click', (event, d) => { if (event.defaultPrevented) return; onlySector(d.sector); });
  xAxis.raise();
  yAxis.raise();
  renderHeat(rows);
}

function renderHeat(rows) {
  const stages = STAGE_ORDER.filter((s) => rows.some((r) => r.stage === s));
  const sectors = SECTORS.filter((s) => rows.some((r) => r.sector === s));
  const max = d3.max(sectors.flatMap((s) => stages.map((st) => d3.sum(rows.filter((r) => r.sector === s && r.stage === st), (r) => r.amount_usd)))) || 1;
  const head = stages.map((s) => `<th scope="col">${esc(s)}</th>`).join('');
  const body = sectors.map((s) => {
    const cells = stages.map((st) => {
      const list = rows.filter((r) => r.sector === s && r.stage === st);
      const sum = d3.sum(list, (r) => r.amount_usd);
      if (!sum) return `<td><span class="meta">—</span></td>`;
      const bg = hexToRgba(color(s), 0.18 + Math.min(0.72, sum / max));
      return `<td><button type="button" data-heat-sector="${esc(s)}" data-heat-stage="${esc(st)}" style="background:${bg}"><span>${esc(money(sum))}</span><small>${list.length} rounds</small></button></td>`;
    }).join('');
    return `<tr><th scope="row">${esc(s)}</th>${cells}</tr>`;
  }).join('');
  $('#flow-extra').innerHTML = `<h3>Sector and stage</h3><p class="hint">Choose a cell to filter by that sector and stage.</p><div class="heat-scroll"><table class="heat"><thead><tr><th scope="col">Sector</th>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function closeDrawer() {
  $('#drawer').hidden = true;
  $('#drawer').setAttribute('aria-hidden', 'true');
  $('#scrim').hidden = true;
  document.body.classList.remove('drawer-open');
  drawerHistory = [];
  $('#drawer-back').hidden = true;
  if (lastFocus) lastFocus.focus();
}

function focusDrawerTitle() {
  const title = $('#drawer-title');
  if (!title) return;
  title.tabIndex = -1;
  title.focus();
}

function showDrawer(paint, resetHistory) {
  if (resetHistory) drawerHistory = [];
  if ($('#drawer').hidden) lastFocus = document.activeElement;
  $('#drawer').hidden = false;
  $('#drawer').setAttribute('aria-hidden', 'false');
  $('#drawer').setAttribute('aria-labelledby', 'drawer-title');
  $('#scrim').hidden = false;
  document.body.classList.add('drawer-open');
  $('#drawer-back').hidden = drawerHistory.length === 0;
  paint();
  focusDrawerTitle();
}

function openRound(r) {
  showDrawer(() => paintRound(r), true);
}

function openInvestor(name) {
  showDrawer(() => paintInvestor(name), true);
}

function paintRound(r) {
  const href = safeUrl(r.source_url);
  const pills = (list, empty) => list.length
    ? `<div class="pills">${list.map((name) => `<button type="button" class="pill" data-filter-investor="${esc(name)}">${esc(name)}</button>`).join('')}</div>`
    : `<p>${empty}</p>`;
  $('#drawer-body').innerHTML = `
    <p class="kicker">${esc(r.sector)} · ${esc(r.stage)}</p>
    <h2 id="drawer-title">${esc(r.company)}</h2>
    <p>${esc(tidy(r.description))}</p>
    <p class="amount">${esc(money(r.amount_usd))}</p>
    <dl>
      <dt>Announced</dt><dd>${esc(pretty(r.date))}</dd>
      <dt>Source</dt><dd>${esc(r.source_name || hostOf(href))}</dd>
    </dl>
    <h3>Lead investors</h3>
    ${pills(r.lead_investors, 'No lead investor was named in the source.')}
    <h3>Other investors</h3>
    ${pills(r.other_investors, 'No other investors were named in the source.')}
    ${href ? `<a class="source-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">Read the announcement</a>` : ''}
    <p class="fine">Names are merged when they are obvious duplicates, such as a16z and Andreessen Horowitz. The amount is the announced round, not one investor’s check.${r.evidence ? ' Matched text: ' + esc(tidy(r.evidence)) + '.' : ''}</p>`;
}

function paintInvestor(name) {
  const deals = state.filtered.filter((r) => r._investors.includes(name));
  const allDeals = state.all.filter((r) => r._investors.includes(name));
  const sum = allDeals.reduce((a, r) => a + r.amount_usd, 0);
  $('#drawer-body').innerHTML = `
    <p class="kicker">Investor</p>
    <h2 id="drawer-title">${esc(name)}</h2>
    <p class="amount">${allDeals.length} ${allDeals.length === 1 ? 'deal' : 'deals'}</p>
    <p>Named on rounds totaling ${esc(money(sum))}. That figure is the full announced round, not this investor’s check.</p>
    <p><button type="button" class="source-link" id="apply-investor" style="border:0">Filter to this investor</button></p>
    <h3>Rounds in the current view</h3>
    <div class="deal-list">${deals.map((r) => `<button type="button" class="deal-btn" data-round="${r._id}">${esc(r.company)} · ${esc(money(r.amount_usd))}<span class="sub">${esc(pretty(r.date))} · ${esc(r.stage)}</span></button>`).join('') || '<p>None of this investor’s rounds are in the current filters.</p>'}</div>`;
  $('#apply-investor').addEventListener('click', () => {
    state.investor = name;
    closeDrawer();
    apply();
  });
}

function prepare(rounds) {
  const rawNames = rounds.flatMap((r) => [...(r.lead_investors || []), ...(r.other_investors || [])]);
  const canon = buildCanon(rawNames);
  state.canon = canon;
  return rounds.map((r, i) => {
    const leads = [];
    const seen = new Set();
    for (const name of r.lead_investors || []) {
      const c = canon(name);
      if (c && !seen.has(c)) { seen.add(c); leads.push(c); }
    }
    const others = [];
    for (const name of r.other_investors || []) {
      const c = canon(name);
      if (c && !seen.has(c)) { seen.add(c); others.push(c); }
    }
    const next = { ...r, _id: i, lead_investors: leads, other_investors: others, _investors: leads.concat(others) };
    state.byId.set(i, next);
    return next;
  });
}

function sectorCounts(controls) {
  const counts = new Map(SECTORS.map((s) => [s, 0]));
  state.all.forEach((r) => {
    if (matches(r, controls, { ignoreSector: true })) counts.set(r.sector, (counts.get(r.sector) || 0) + 1);
  });
  return counts;
}

function paintSectorButtons() {
  const controls = readControls();
  const counts = sectorCounts(controls);
  $('#sectors').innerHTML = SECTORS.map((s) => {
    const on = state.sectors.has(s);
    return `<button type="button" data-sector="${esc(s)}" class="${on ? 'is-on' : ''}" aria-pressed="${on}"><i class="swatch" style="background:${color(s)}"></i>${esc(s)} <span class="count">${counts.get(s) || 0}</span></button>`;
  }).join('');
}

function fillStageOptions() {
  const present = new Set(state.all.map((r) => r.stage));
  const stages = STAGE_ORDER.filter((s) => present.has(s));
  const select = $('#stage');
  const current = select.value;
  select.innerHTML = '<option value="">All stages</option>' + stages.map((s) => `<option>${esc(s)}</option>`).join('');
  select.value = stages.includes(current) ? current : '';
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('signal-theme', theme); } catch (e) { /* private mode */ }
  const btn = $('#theme');
  const dark = theme === 'dark';
  btn.textContent = dark ? 'Light mode' : 'Dark mode';
  btn.setAttribute('aria-pressed', String(dark));
  const meta = document.querySelector('meta[name="theme-color"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
  meta.content = theme === 'dark' ? '#141613' : '#f4f0e7';
  if (state.all.length) render();
}

function status(message) {
  const el = $('#status');
  el.hidden = !message;
  el.textContent = message || '';
}

function wire() {
  $('#nav').innerHTML = VIEWS.map(([id, label]) => `<button type="button" data-view="${id}">${label}</button>`).join('');
  $('#nav').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-view]');
    if (btn) setView(btn.dataset.view);
  });
  $('#theme').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  $('#filter-toggle').addEventListener('click', () => setFiltersOpen($('#filter-panel').hidden));
  $('#clear-all').addEventListener('click', clearAll);
  $('#sectors-all').addEventListener('click', () => { state.sectors = new Set(SECTORS); syncSectors(); apply(); });
  ['search', 'from', 'to', 'min', 'max'].forEach((id) => $('#' + id).addEventListener('input', apply));
  $('#stage').addEventListener('change', apply);
  $('#sectors').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-sector]');
    if (!btn) return;
    const name = btn.dataset.sector;
    if (state.sectors.has(name)) state.sectors.delete(name);
    else state.sectors.add(name);
    syncSectors();
    apply();
  });
  $('#net-cap').addEventListener('input', () => {
    state.netCap = Number($('#net-cap').value);
    $('#net-cap-out').textContent = String(state.netCap);
    $('#net-cap').setAttribute('aria-valuenow', String(state.netCap));
    if (state.view === 'investors') drawChart();
  });
  document.body.addEventListener('click', (event) => {
    const zoomBtn = event.target.closest('[data-zoom]');
    if (zoomBtn && state.zoom) {
      const { behavior, svg } = state.zoom;
      const action = zoomBtn.dataset.zoom;
      const transition = svg.transition().duration(220);
      if (action === 'reset') transition.call(behavior.transform, d3.zoomIdentity);
      else transition.call(behavior.scaleBy, action === 'in' ? 1.35 : 1 / 1.35);
      return;
    }
    const sector = event.target.closest('#sector-cards [data-sector]');
    if (sector) { onlySector(sector.dataset.sector); return; }
    const investor = event.target.closest('[data-investor]');
    if (investor && !event.target.closest('#drawer')) { onlyInvestor(investor.dataset.investor); return; }
    const heat = event.target.closest('[data-heat-sector]');
    if (heat) {
      state.sectors = new Set([heat.dataset.heatSector]);
      $('#stage').value = heat.dataset.heatStage;
      syncSectors();
      apply();
      return;
    }
    const roundEl = event.target.closest('[data-round]');
    if (roundEl && !event.target.closest('a')) {
      const round = state.byId.get(Number(roundEl.dataset.round));
      if (!round) return;
      if (event.target.closest('#drawer') && $('#drawer-title') && !roundEl.closest('.round-list')) {
        const investorName = $('#drawer-title').textContent;
        drawerHistory.push(() => paintInvestor(investorName));
        showDrawer(() => paintRound(round), false);
      } else openRound(round);
      return;
    }
    const filterInv = event.target.closest('[data-filter-investor]');
    if (filterInv) {
      state.investor = filterInv.dataset.filterInvestor;
      closeDrawer();
      apply();
    }
  });
  $('#rounds-table').addEventListener('click', (event) => {
    const sort = event.target.closest('[data-sort]');
    if (!sort) return;
    const key = sort.dataset.sort;
    if (state.sort.key === key) state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    else state.sort = { key, dir: key === 'company' || key === 'sector' || key === 'stage' || key === 'investors' || key === 'source' ? 'asc' : 'desc' };
    renderTable();
  });
  $('#rounds-table').addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const row = event.target.closest('[data-round]');
    if (!row) return;
    const round = state.byId.get(Number(row.dataset.round));
    if (round) openRound(round);
  });
  $('#drawer-close').addEventListener('click', closeDrawer);
  $('#scrim').addEventListener('click', closeDrawer);
  $('#drawer-back').addEventListener('click', () => {
    const prev = drawerHistory.pop();
    $('#drawer-back').hidden = drawerHistory.length === 0;
    if (prev) { prev(); focusDrawerTitle(); }
    else closeDrawer();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$('#drawer').hidden) closeDrawer();
    if ($('#drawer').hidden || event.key !== 'Tab') return;
    const items = [...$('#drawer').querySelectorAll('button, a, input')].filter((el) => !el.hidden && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  window.addEventListener('hashchange', () => setView(location.hash.slice(1), false));
  const observed = ['#bubble-chart', '#net-chart', '#flow-chart'];
  const ro = new ResizeObserver(() => {
    clearTimeout(state.resizeTimer);
    state.resizeTimer = setTimeout(() => {
      if (state.view === 'startups' || state.view === 'investors' || state.view === 'sectors') drawChart();
    }, 120);
  });
  observed.forEach((sel) => { const el = $(sel); if (el) ro.observe(el); });
}

async function init() {
  wire();
  setTheme(document.documentElement.dataset.theme || 'light');
  setFiltersOpen(!matchMedia('(max-width: 720px)').matches);
  if (!window.d3) {
    status('The chart library did not load. Check your connection and refresh.');
    return;
  }
  try {
    const [rounds, meta] = await Promise.all(['rounds', 'meta'].map(async (name) => {
      const response = await fetch('data/' + name + '.json');
      if (!response.ok) throw new Error('Funding data is unavailable.');
      return response.json();
    }));
    if (!Array.isArray(rounds)) throw new Error('Funding data is unavailable.');
    state.meta = meta || {};
    state.all = prepare(rounds);
    state.defaults.from = state.meta.window_start || state.all.reduce((min, r) => r.date < min ? r.date : min, state.all[0].date);
    state.defaults.to = state.meta.as_of || state.all.reduce((max, r) => r.date > max ? r.date : max, state.all[0].date);
    $('#from').value = state.defaults.from;
    $('#to').value = state.defaults.to;
    const sources = state.meta.counts_per_source ? Object.keys(state.meta.counts_per_source).length : new Set(state.all.map((r) => r.source_name)).size;
    $('#window-label').textContent = pretty(state.defaults.from) + ' — ' + pretty(state.defaults.to);
    $('#updated').textContent = state.meta.last_run ? 'Updated ' + pretty(state.meta.last_run.slice(0, 10)) : '';
    $('#lede').textContent = 'A ' + state.all.length + '-round sample of public announcements across ' + sources + ' sources. Amounts are explicit US dollars. Filters apply to every section.';
    $('#foot').textContent = state.all.length + ' rounds in this snapshot. Sector, stage, and investor names are extracted from articles and can be incomplete. Duplicate investor names such as a16z and Andreessen Horowitz are merged when the page loads.';
    fillStageOptions();
    status('');
    const controls = readControls();
    state.filtered = state.all.filter((r) => matches(r, controls));
    const initial = location.hash.slice(1);
    setView(VIEWS.some(([id]) => id === initial) ? initial : 'overview', false);
  } catch (error) {
    status(error.message || 'Funding data is unavailable.');
    console.error(error);
  }
}

if (typeof document !== 'undefined') init();
