/* Conuco – Demo-MVP. Reines Vanilla-JS, In-Memory-State, kein Backend. */
(function () {
  'use strict';

  const I18N = window.CONUCO_I18N;
  let WEATHER = window.CONUCO_WEATHER;

  // ---------------------------------------------------------------------------
  // Stammdaten & Beispieldaten
  // ---------------------------------------------------------------------------
  const PLOTS = {
    norte: { id: 'norte', name: 'Lote Norte', type: 'field', plants: 5000 },
    sur:   { id: 'sur',   name: 'Lote Sur',   type: 'field', plants: 4500 },
    inv1:  { id: 'inv1',  name: 'Invernadero 1', type: 'greenhouse', plants: 1500 }
  };
  // Feste Serien-Reihenfolge (farbenblind-validiert): Arbeitskraft, Betriebsmittel, Treibstoff, Saatgut
  const CATEGORIES = [
    { id: 'labor',  color: 'var(--series-labor)' },
    { id: 'inputs', color: 'var(--series-inputs)' },
    { id: 'fuel',   color: 'var(--series-fuel)' },
    { id: 'seed',   color: 'var(--series-seed)' }
  ];
  const QUALITY_FACTOR = { A: 1, B: 0.8, C: 0.5 };
  const MOIST_TARGET = { min: 45, max: 65 };
  const TOTAL_PLANTS = 11000;

  let nextId = 1;
  const uid = () => nextId++;

  const state = {
    lang: 'de',
    tab: 'water',
    plot: 'norte',
    day: 1,
    irrigated: {},           // "plot:day" -> true
    price: 0.70,
    entryType: 'harvest',
    harvest: [
      { id: uid(), date: '2026-08-24', plot: 'norte', kg: 1450, quality: 'A' },
      { id: uid(), date: '2026-08-25', plot: 'sur',   kg: 1180, quality: 'B' },
      { id: uid(), date: '2026-08-26', plot: 'inv1',  kg: 620,  quality: 'A' },
      { id: uid(), date: '2026-08-27', plot: 'norte', kg: 1720, quality: 'A' },
      { id: uid(), date: '2026-08-28', plot: 'sur',   kg: 1390, quality: 'A' },
      { id: uid(), date: '2026-08-29', plot: 'inv1',  kg: 580,  quality: 'A' },
      { id: uid(), date: '2026-08-31', plot: 'norte', kg: 1980, quality: 'B' },
      { id: uid(), date: '2026-09-01', plot: 'sur',   kg: 1460, quality: 'A' },
      { id: uid(), date: '2026-09-02', plot: 'inv1',  kg: 640,  quality: 'A' },
      { id: uid(), date: '2026-09-03', plot: 'norte', kg: 1650, quality: 'A' },
      { id: uid(), date: '2026-09-04', plot: 'sur',   kg: 1210, quality: 'C' },
      { id: uid(), date: '2026-09-05', plot: 'inv1',  kg: 610,  quality: 'A' },
      { id: uid(), date: '2026-09-07', plot: 'norte', kg: 1320, quality: 'B' }
    ],
    costs: [
      { id: uid(), date: '2026-07-15', category: 'seed',   noteKey: 'note.seed',      amount: 420 },
      { id: uid(), date: '2026-07-20', category: 'inputs', noteKey: 'note.fert',      amount: 1850 },
      { id: uid(), date: '2026-07-28', category: 'labor',  noteKey: 'note.plant',     amount: 780 },
      { id: uid(), date: '2026-08-05', category: 'fuel',   noteKey: 'note.diesel',    amount: 310 },
      { id: uid(), date: '2026-08-12', category: 'inputs', noteKey: 'note.fung',      amount: 640 },
      { id: uid(), date: '2026-08-18', category: 'labor',  noteKey: 'note.care',      amount: 920 },
      { id: uid(), date: '2026-08-25', category: 'fuel',   noteKey: 'note.transport', amount: 540 },
      { id: uid(), date: '2026-08-30', category: 'labor',  noteKey: 'note.harvest',   amount: 1650 },
      { id: uid(), date: '2026-09-04', category: 'inputs', noteKey: 'note.crates',    amount: 290 }
    ]
  };

  // ---------------------------------------------------------------------------
  // Hilfsfunktionen
  // ---------------------------------------------------------------------------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const locale = () => (state.lang === 'es' ? 'es-VE' : 'de-DE');

  function t(key, vars) {
    const dict = I18N[state.lang];
    let s = (dict && dict[key] != null) ? dict[key] : (I18N.de[key] != null ? I18N.de[key] : key);
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
    return s;
  }
  const tCond = (s) => (I18N[state.lang].cond[s] || I18N.de.cond[s] || s);
  const tHarvest = (s) => (I18N[state.lang].harvest[s] || I18N.de.harvest[s] || s);

  function parseDate(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
  function fmtDate(iso, style) {
    const d = parseDate(iso);
    const opts = {
      short: { day: 'numeric', month: 'numeric' },
      medium: { day: 'numeric', month: 'short' },
      long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      wd: { weekday: 'short' },
      table: { day: '2-digit', month: '2-digit', year: 'numeric' }
    }[style || 'medium'];
    let s = new Intl.DateTimeFormat(locale(), opts).format(d);
    if (style === 'wd') s = s.replace('.', '');
    return s;
  }
  function fmtNum(n, digits) {
    return new Intl.NumberFormat(locale(), { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 }).format(n);
  }
  const fmtUSD = (n, digits) => '$ ' + fmtNum(n, digits == null ? 0 : digits);
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (id, cls) => `<svg class="${cls || ''}" aria-hidden="true"><use href="#${id}"/></svg>`;

  // ---------------------------------------------------------------------------
  // Fachlogik Modul 1
  // ---------------------------------------------------------------------------
  const dayData = (day) => WEATHER.days[day - 1];
  const isIrrigated = (plotId, day) => !!state.irrigated[plotId + ':' + day];

  // Mock-Sensorwert: Freiland folgt der Regenlage (heute + Vortag), Gewächshaus zehrt vom Zeitplan.
  function moisture(plotId, day) {
    const d = dayData(day);
    const prev = day > 1 ? dayData(day - 1) : null;
    const plot = PLOTS[plotId];
    let m;
    if (plot.type === 'field') {
      const rain = d.rainProbabilityPercent;
      const prevRain = prev ? prev.rainProbabilityPercent : 60;
      m = 62 + (rain - 55) * 0.55 + (prevRain - 55) * 0.35 + (plotId === 'sur' ? 3 : 0);
    } else {
      m = 58 - ((day * 5) % 17);   // 42–57 %: an drei Tagen unter Ziel → "Jetzt bewässern"
    }
    if (isIrrigated(plotId, day)) m += plot.type === 'field' ? 8 : 18;
    return clamp(Math.round(m), 5, 98);
  }
  function moistureTone(m) {
    if (m < MOIST_TARGET.min) return 'crit';
    if (m > MOIST_TARGET.max) return 'warn';
    return 'ok';
  }
  function rainTone(p) { return p >= 85 ? 'crit' : (p >= 60 ? 'warn' : 'ok'); }

  function recommendation(plotId, day) {
    const d = dayData(day);
    const plot = PLOTS[plotId];
    const rain = d.rainProbabilityPercent;
    const m = moisture(plotId, day);
    const done = isIrrigated(plotId, day);
    if (plot.type === 'greenhouse') {
      if (done) return { key: 'done', tone: 'ok', icon: 'i-check', title: t('reco.done.title'), why: t('reco.done.why'), badge: t('irr.done') };
      if (m < MOIST_TARGET.min) return { key: 'now', tone: 'crit', icon: 'i-drop', title: t('reco.now.title'), why: t('reco.now.why', { moist: m, rain }), badge: t('irr.now') };
      return { key: 'normal', tone: 'info', icon: 'i-drop', title: t('reco.normal.title'), why: t('reco.normal.why'), badge: t('irr.normal') };
    }
    if (done) return { key: 'done', tone: 'warn', icon: 'i-check', title: t('reco.done.title'), why: t('reco.done.field.why', { rain }), badge: t('irr.done') };
    if (d.irrigationOpenField === 'keine') return { key: 'none', tone: 'warn', icon: 'i-ban', title: t('reco.none.title'), why: t('reco.none.why', { rain }), badge: t('irr.keine') };
    return { key: 'reduced', tone: 'ok', icon: 'i-drop', title: t('reco.reduced.title'), why: t('reco.reduced.why', { rain }), badge: t('irr.reduziert') };
  }
  function diseaseInfo(plotId, day) {
    const d = dayData(day);
    if (PLOTS[plotId].type === 'greenhouse') return { tone: 'ok', title: t('disease.gh.title'), body: t('disease.gh.body'), short: t('kpi.disease.low') };
    if (d.diseaseRiskFlag) return { tone: 'crit', title: t('disease.title'), body: t('disease.body'), short: t('kpi.disease.high') };
    return { tone: 'warn', title: t('disease.mod.title'), body: t('disease.mod.body'), short: t('kpi.disease.mod') };
  }
  function weatherIcon(d) {
    const c = d.condition.toLowerCase();
    if (d.rainProbabilityPercent >= 85 || c.includes('regenperioden')) return 'w-rain';
    if (c.includes('gewitter')) return 'w-storm';
    if (c.includes('sonnig')) return 'w-suncloud';
    return 'w-cloud';
  }

  // ---------------------------------------------------------------------------
  // Rendering Modul 1
  // ---------------------------------------------------------------------------
  function kpiCard(label, value, tone, status, opts) {
    const textValue = opts && opts.text;
    return `<div class="kpi tone-${tone}">
      <div class="kpi-label">${esc(label)}</div>
      <div class="kpi-value" ${textValue ? 'style="font-family:var(--font-ui);font-size:1.25rem;font-weight:600"' : ''}>${value}</div>
      <div class="kpi-status"><span class="pill" aria-hidden="true"></span><span>${esc(status)}</span></div>
    </div>`;
  }

  function renderWaterKpis() {
    const d = dayData(state.day);
    const plot = PLOTS[state.plot];
    const rain = d.rainProbabilityPercent;
    const m = moisture(state.plot, state.day);
    const mt = moistureTone(m);
    const reco = recommendation(state.plot, state.day);
    const dis = diseaseInfo(state.plot, state.day);
    const rt = rainTone(rain);
    $('#waterKpis').innerHTML =
      kpiCard(t('kpi.rain'), `${fmtNum(rain)}<small>%</small>`, rt, t('kpi.rain.' + rt)) +
      kpiCard(t('kpi.moisture') + ' · ' + plot.name, `${fmtNum(m)}<small>%</small>`, mt, t('kpi.moisture.' + (mt === 'crit' ? 'low' : mt === 'warn' ? 'high' : 'ok'))) +
      kpiCard(t('kpi.irrigation') + ' · ' + plot.name, esc(reco.badge), reco.tone, t(plot.type === 'field' ? 'plot.field' : 'plot.greenhouse'), { text: true }) +
      kpiCard(t('kpi.disease') + ' · ' + plot.name, esc(dis.short), dis.tone, t(plot.type === 'greenhouse' ? 'kpi.disease.status.gh' : 'kpi.disease.status.field'), { text: true });
  }

  function renderTimeline() {
    const el = $('#timeline');
    el.innerHTML = WEATHER.days.map(d => {
      const rt = rainTone(d.rainProbabilityPercent);
      const sel = d.day === state.day;
      return `<button type="button" class="day-chip rp-${rt}${d.source !== 'forecast' ? ' pattern' : ''}" data-day="${d.day}" aria-pressed="${sel}"
        aria-label="${esc(t('timeline.chip', { day: d.day, date: fmtDate(d.date, 'medium'), rain: d.rainProbabilityPercent }))}" ${sel ? '' : 'tabindex="-1"'}>
        <span class="wd">${esc(fmtDate(d.date, 'wd'))}</span>
        <span class="dt">${esc(fmtDate(d.date, 'short'))}</span>
        <span class="rp">${d.rainProbabilityPercent}%</span>
      </button>`;
    }).join('');
    $('#timelineSub').textContent = t('timeline.sub', { day: state.day, date: fmtDate(dayData(state.day).date, 'long') });
    $('#dayPrev').disabled = state.day <= 1;
    $('#dayNext').disabled = state.day >= WEATHER.days.length;
  }

  function renderWeather() {
    const d = dayData(state.day);
    $('#weatherTitle').textContent = t('weather.title');
    $('#weatherDate').textContent = (state.day === 1 ? t('weather.today') : t('weather.day', { day: state.day })) + ' · ' + fmtDate(d.date, 'long');
    const badge = $('#sourceBadge');
    badge.className = 'badge ' + (d.source === 'forecast' ? 'tone-info' : 'sample');
    badge.textContent = d.source === 'forecast' ? t('weather.source.forecast') : t('weather.source.pattern');
    $('#weatherIcon').innerHTML = icon(weatherIcon(d));
    $('#tempMax').textContent = d.tempMaxC + '°';
    $('#tempMin').textContent = ' / ' + d.tempMinC + '°';
    $('#weatherCond').textContent = tCond(d.condition);
    $('#weatherMeta').innerHTML =
      `<span>${esc(t('weather.rain'))} <b>${d.rainProbabilityPercent} %</b></span>` +
      `<span>${esc(t('weather.min'))} <b>${d.tempMinC} °C</b></span>`;

    const n = WEATHER.days.length;
    const start = clamp(state.day, 1, n - 4);
    $('#strip').innerHTML = WEATHER.days.slice(start - 1, start + 4).map(x => `
      <div class="strip-day${x.day === state.day ? ' active' : ''}">
        <span class="wd">${esc(fmtDate(x.date, 'wd'))} ${esc(fmtDate(x.date, 'short'))}</span>
        ${icon(weatherIcon(x))}
        <span class="t">${x.tempMaxC}° <span>${x.tempMinC}°</span></span>
        <span class="r">${x.rainProbabilityPercent} %</span>
      </div>`).join('');
  }

  function renderReco() {
    const d = dayData(state.day);
    const plot = PLOTS[state.plot];
    const isGH = plot.type === 'greenhouse';
    const reco = recommendation(state.plot, state.day);
    const m = moisture(state.plot, state.day);
    const mt = moistureTone(m);
    const done = isIrrigated(state.plot, state.day);

    const card = $('#recoCard');
    card.classList.toggle('is-greenhouse', isGH);
    card.classList.toggle('is-field', !isGH);
    $('#recoPlotName').textContent = plot.name;
    $('#recoPlotType').textContent = t(isGH ? 'plot.greenhouse.desc' : 'plot.field.desc', { n: fmtNum(plot.plants) });
    const pb = $('#recoPlotBadge');
    pb.className = 'badge ' + (isGH ? 'tone-info' : 'tone-accent');
    pb.textContent = t(isGH ? 'plot.badge.greenhouse' : 'plot.badge.field');

    const main = $('#recoMain');
    main.className = 'reco-main tone-' + reco.tone;
    main.innerHTML = `
      <div class="reco-icon">${icon(reco.icon)}</div>
      <div>
        <div class="reco-kicker">${esc(t('reco.kicker'))} · ${esc(fmtDate(d.date, 'medium'))}</div>
        <div class="reco-title">${esc(reco.title)}</div>
        <p class="reco-why">${esc(reco.why)}</p>
      </div>`;

    $('#moisture').innerHTML = `
      <div class="moisture-row"><span>${esc(t('moisture.label'))}</span><b>${fmtNum(m)} %</b></div>
      <div class="meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m}" aria-label="${esc(t('moisture.label'))}">
        <div class="meter-fill" style="width:${m}%;--meter-color:var(--${mt})"></div>
      </div>
      <div class="meter-marks"><span>0 · ${esc(t('moisture.dry'))}</span><span>${esc(t('moisture.target'))}</span><span>${esc(t('moisture.wet'))} · 100</span></div>`;

    $('#recoActions').innerHTML = done
      ? `<button type="button" class="btn is-done" id="markBtn">${icon('i-undo')}${esc(t('action.undo'))}</button><span class="hint">${esc(t('action.hint.done', { date: fmtDate(d.date, 'medium') }))}</span>`
      : `<button type="button" class="btn btn-primary" id="markBtn">${icon('i-check')}${esc(t('action.mark'))}</button><span class="hint">${esc(t('action.hint.none'))}</span>`;
    $('#markBtn').addEventListener('click', () => {
      const k = state.plot + ':' + state.day;
      if (state.irrigated[k]) delete state.irrigated[k]; else state.irrigated[k] = true;
      renderWater();
      $('#markBtn').focus();
    });

    const dis = diseaseInfo(state.plot, state.day);
    $('#diseaseAlert').innerHTML = `<div class="alert tone-${dis.tone}">${icon(dis.tone === 'ok' ? 'i-shield' : 'i-warn')}<div><div class="alert-title">${esc(dis.title)}</div><div class="alert-body">${esc(dis.body)}</div></div></div>`;

    const note = tHarvest(d.harvestNote);
    const chain = /^(Vor Mittag|Sehr nass)/.test(d.harvestNote) ? ' ' + t('harvest.chain') : '';
    $('#harvestAlert').innerHTML = `<div class="alert tone-earth">${icon('i-basket')}<div><div class="alert-title">${esc(t('harvest.title'))}</div><div class="alert-body">${esc(note + chain)}</div></div></div>`;

    $('#compare').innerHTML = Object.values(PLOTS).map(p => {
      const r = recommendation(p.id, state.day);
      const pm = moisture(p.id, state.day);
      return `<div class="compare-row${p.id === state.plot ? ' active' : ''}">
        <span class="name"><span class="dot" style="background:var(--${p.type === 'field' ? 'accent' : 'water'})"></span>${esc(p.name)} <span class="type">${esc(t(p.type === 'field' ? 'plot.field' : 'plot.greenhouse'))}</span></span>
        <span class="moist">${esc(t('compare.moist', { m: fmtNum(pm) }))}</span>
        <span class="badge tone-${r.tone}">${esc(r.badge)}</span>
      </div>`;
    }).join('');
  }

  function renderWater() {
    renderWaterKpis();
    renderTimeline();
    renderWeather();
    renderReco();
  }

  // ---------------------------------------------------------------------------
  // Fachlogik Modul 2
  // ---------------------------------------------------------------------------
  function costSummary() {
    const totalKg = state.harvest.reduce((s, h) => s + h.kg, 0);
    const kgA = state.harvest.filter(h => h.quality === 'A').reduce((s, h) => s + h.kg, 0);
    const totalCost = state.costs.reduce((s, c) => s + c.amount, 0);
    const byCat = {};
    CATEGORIES.forEach(c => { byCat[c.id] = 0; });
    state.costs.forEach(c => { byCat[c.category] = (byCat[c.category] || 0) + c.amount; });
    const topCat = CATEGORIES.slice().sort((a, b) => byCat[b.id] - byCat[a.id])[0].id;
    const revenue = state.harvest.reduce((s, h) => s + h.kg * state.price * QUALITY_FACTOR[h.quality], 0);
    const margin = revenue - totalCost;
    const costPerKg = totalKg ? totalCost / totalKg : 0;
    return { totalKg, kgA, totalCost, byCat, topCat, revenue, margin, costPerKg };
  }

  function renderCostKpis() {
    const s = costSummary();
    const marginPct = s.revenue ? (s.margin / s.revenue) * 100 : 0;
    const price = fmtUSD(state.price, 2);
    $('#costKpis').innerHTML =
      kpiCard(t('kpi.harvest'), `${fmtNum(s.totalKg)}<small>kg</small>`, 'accent',
        t('kpi.harvest.status', { a: s.totalKg ? Math.round(s.kgA / s.totalKg * 100) : 0, kgp: fmtNum(s.totalKg / TOTAL_PLANTS, 2) })) +
      kpiCard(t('kpi.cost'), fmtUSD(s.totalCost), 'earth',
        t('kpi.cost.status', { n: state.costs.length, cat: t('cat.' + s.topCat) })) +
      kpiCard(t('kpi.costkg'), `${fmtUSD(s.costPerKg, 2)}<small>/kg</small>`, s.costPerKg < state.price ? 'ok' : 'crit',
        t(s.costPerKg < state.price ? 'kpi.costkg.ok' : 'kpi.costkg.crit')) +
      kpiCard(t('kpi.margin'), `${s.margin < 0 ? '−' : ''}${fmtUSD(Math.abs(s.margin))}<small>· ${fmtNum(marginPct)} %</small>`, s.margin >= 0 ? 'ok' : 'crit',
        s.margin >= 0 ? t('kpi.margin.status', { rev: fmtUSD(s.revenue), price }) : t('kpi.margin.neg', { price }));
  }

  // --- Tooltip -----------------------------------------------------------------
  const tip = $('#tooltip');
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.classList.add('show');
    tip.setAttribute('aria-hidden', 'false');
    moveTip(x, y);
  }
  function moveTip(x, y) {
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y - r.height - 10;
    if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
    if (top < 8) top = y + 16;
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  }
  function hideTip() { tip.classList.remove('show'); tip.setAttribute('aria-hidden', 'true'); }

  function niceMax(v) {
    if (v <= 0) return 100;
    const step = v <= 250 ? 50 : v <= 500 ? 100 : v <= 1000 ? 200 : v <= 2500 ? 500 : 1000;
    return Math.ceil(v / step) * step;
  }

  // --- Balkendiagramm: Erntemenge über Zeit -------------------------------------
  function renderHarvestChart() {
    const byDate = {};
    state.harvest.forEach(h => {
      if (!byDate[h.date]) byDate[h.date] = { date: h.date, kg: 0, parts: {} };
      byDate[h.date].kg += h.kg;
      byDate[h.date].parts[h.plot] = (byDate[h.date].parts[h.plot] || 0) + h.kg;
    });
    const rows = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    const W = 560, H = 230, L = 44, R = 10, T = 22, B = 30;
    const pw = W - L - R, ph = H - T - B;
    const max = niceMax(Math.max(...rows.map(r => r.kg), 0));
    const ticks = 4;
    const band = pw / Math.max(rows.length, 1);
    const bw = Math.min(24, band * 0.62);
    const maxIdx = rows.reduce((mi, r, i) => (r.kg > rows[mi].kg ? i : mi), 0);
    const labelEvery = rows.length > 9 ? Math.ceil(rows.length / 7) : 1;

    let g = '<g class="grid">';
    let ax = '<g class="axis">';
    for (let i = 0; i <= ticks; i++) {
      const v = max * i / ticks, y = T + ph - ph * i / ticks;
      g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/>`;
      ax += `<text x="${L - 8}" y="${y + 4}" text-anchor="end">${fmtNum(v)}</text>`;
    }
    g += '</g>';
    let bars = '';
    rows.forEach((r, i) => {
      const x = L + band * i + (band - bw) / 2;
      const h = ph * r.kg / max;
      const y = T + ph - h;
      const rad = Math.min(4, h);
      const path = `M${x},${T + ph} V${y + rad} a${rad},${rad} 0 0 1 ${rad},-${rad} H${x + bw - rad} a${rad},${rad} 0 0 1 ${rad},${rad} V${T + ph} Z`;
      const parts = Object.keys(r.parts).map(p => `${esc(PLOTS[p].name)}: <b>${fmtNum(r.parts[p])} kg</b>`).join('<br>');
      bars += `<g class="bar-group" data-tip="${esc(`<div>${esc(fmtDate(r.date, 'long'))}</div><div><b>${fmtNum(r.kg)} kg</b></div>${parts}`)}">
        <rect class="bar-hit" x="${L + band * i}" y="${T}" width="${band}" height="${ph}"/>
        <path class="bar" d="${path}"/>
        ${i === maxIdx ? `<text class="bar-label" x="${x + bw / 2}" y="${y - 6}">${fmtNum(r.kg)}</text>` : ''}
      </g>`;
      if (i % labelEvery === 0) ax += `<text x="${L + band * i + band / 2}" y="${H - 8}" text-anchor="middle">${esc(fmtDate(r.date, 'short'))}</text>`;
    });
    ax += '</g>';
    $('#harvestChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('chart.harvest.title'))}">${g}${bars}${ax}</svg>`;
    $$('#harvestChart .bar-group').forEach(el => {
      el.addEventListener('mouseenter', e => showTip(el.dataset.tip, e.clientX, e.clientY));
      el.addEventListener('mousemove', e => moveTip(e.clientX, e.clientY));
      el.addEventListener('mouseleave', hideTip);
    });
  }

  // --- Donut: Kosten nach Kategorie ---------------------------------------------
  function renderCostDonut() {
    const s = costSummary();
    const size = 150, cx = 75, cy = 75, r = 58, sw = 18;
    const C = 2 * Math.PI * r;
    const gap = 2;
    const items = CATEGORIES.map(c => ({ ...c, value: s.byCat[c.id] || 0 })).filter(c => c.value > 0);
    let offset = 0, segs = '';
    items.forEach(c => {
      const len = (c.value / s.totalCost) * C;
      const dash = Math.max(len - gap, 0.5);
      segs += `<circle class="seg" data-cat="${c.id}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c.color}" stroke-width="${sw}"
        stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-offset - gap / 2}" transform="rotate(-90 ${cx} ${cy})"
        data-tip="${esc(`<div>${esc(t('cat.' + c.id))}</div><div><b>${fmtUSD(c.value)}</b> · ${fmtNum(c.value / s.totalCost * 100)} %</div>`)}"/>`;
      offset += len;
    });
    $('#costDonut').innerHTML = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(t('chart.costs.title'))}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${sw}"/>
      ${segs}
      <text class="donut-center" x="${cx}" y="${cy + 2}">${fmtUSD(s.totalCost)}</text>
      <text class="donut-center-label" x="${cx}" y="${cy + 17}">${esc(t('chart.total'))}</text>
    </svg>`;
    $('#costLegend').innerHTML = CATEGORIES.map(c => {
      const v = s.byCat[c.id] || 0;
      return `<div class="legend-row" data-cat="${c.id}">
        <span class="sw" style="background:${c.color}"></span>
        <span class="name">${esc(t('cat.' + c.id))}</span>
        <span class="val">${fmtUSD(v)} <span class="pct">${s.totalCost ? fmtNum(v / s.totalCost * 100) : 0} %</span></span>
      </div>`;
    }).join('');
    const segsEl = $$('#costDonut .seg');
    const focus = (cat) => segsEl.forEach(el => el.classList.toggle('is-dim', !!cat && el.dataset.cat !== cat));
    segsEl.forEach(el => {
      el.addEventListener('mouseenter', e => { focus(el.dataset.cat); showTip(el.dataset.tip, e.clientX, e.clientY); });
      el.addEventListener('mousemove', e => moveTip(e.clientX, e.clientY));
      el.addEventListener('mouseleave', () => { focus(null); hideTip(); });
    });
    $$('#costLegend .legend-row').forEach(row => {
      row.addEventListener('mouseenter', () => focus(row.dataset.cat));
      row.addEventListener('mouseleave', () => focus(null));
    });
  }

  // --- Tabellen ------------------------------------------------------------------
  let highlightId = null;
  function renderTables() {
    const hb = $('#harvestTable tbody');
    hb.innerHTML = state.harvest.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).map(h => `
      <tr${h.id === highlightId ? ' class="is-new"' : ''}>
        <td class="num">${esc(fmtDate(h.date, 'table'))}</td>
        <td><span class="plot-tag"><span class="dot" style="background:var(--${PLOTS[h.plot].type === 'field' ? 'accent' : 'water'})"></span>${esc(PLOTS[h.plot].name)}</span></td>
        <td class="num">${fmtNum(h.kg)}</td>
        <td><span class="quality ${h.quality}" title="${esc(t('quality.' + h.quality))}"><span class="sw"></span>${esc(t('quality.short.' + h.quality))}</span></td>
      </tr>`).join('');
    $('#harvestCount').textContent = t('table.count', { n: state.harvest.length });

    const cb = $('#costTable tbody');
    cb.innerHTML = state.costs.slice().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).map(c => {
      const cat = CATEGORIES.find(x => x.id === c.category);
      return `<tr${c.id === highlightId ? ' class="is-new"' : ''}>
        <td class="num">${esc(fmtDate(c.date, 'table'))}</td>
        <td><span class="cat"><span class="sw" style="background:${cat.color}"></span>${esc(t('cat.' + c.category))}</span></td>
        <td>${esc(c.noteKey ? t(c.noteKey) : (c.note || '–'))}</td>
        <td class="num">${fmtUSD(c.amount, 2)}</td>
      </tr>`;
    }).join('');
    $('#costCount').textContent = t('table.count', { n: state.costs.length });
    highlightId = null;
  }

  function renderCosts() {
    renderCostKpis();
    renderHarvestChart();
    renderCostDonut();
    renderTables();
  }

  // ---------------------------------------------------------------------------
  // Formular
  // ---------------------------------------------------------------------------
  function setEntryType(type) {
    state.entryType = type;
    $$('#entryTypeSwitch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === type)));
    $$('#entryForm [data-for]').forEach(f => { f.hidden = f.dataset.for !== type; });
    $('#formFeedback').textContent = '';
  }
  function feedback(msg, isError) {
    const el = $('#formFeedback');
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
  }
  function handleSubmit(e) {
    e.preventDefault();
    const date = $('#fDate').value;
    if (!date) { feedback(t('form.err.date'), true); $('#fDate').focus(); return; }
    if (state.entryType === 'harvest') {
      const kg = Number($('#fKg').value);
      if (!(kg > 0)) { feedback(t('form.err.kg'), true); $('#fKg').focus(); return; }
      const plot = $('#fPlot').value, quality = $('#fQuality').value;
      const id = uid();
      state.harvest.push({ id, date, plot, kg: Math.round(kg), quality });
      highlightId = id;
      feedback(t('form.ok.harvest', { kg: fmtNum(kg), plot: PLOTS[plot].name }));
      $('#fKg').value = '';
    } else {
      const amount = Number($('#fAmount').value);
      if (!(amount > 0)) { feedback(t('form.err.amount'), true); $('#fAmount').focus(); return; }
      const id = uid();
      state.costs.push({ id, date, category: $('#fCategory').value, note: $('#fNote').value.trim(), amount: Math.round(amount * 100) / 100 });
      highlightId = id;
      feedback(t('form.ok.cost', { amt: fmtUSD(amount, 2) }));
      $('#fAmount').value = ''; $('#fNote').value = '';
    }
    renderCosts();
  }

  // ---------------------------------------------------------------------------
  // Sprache, Theme, Tabs, Navigation
  // ---------------------------------------------------------------------------
  function applyStaticI18n() {
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    document.documentElement.lang = state.lang;
    document.title = 'Conuco – ' + t('tab.water') + ' · ' + t('tab.costs');
  }
  function setLang(lang) {
    state.lang = lang;
    $$('#langSwitch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    applyStaticI18n();
    $('#formFeedback').textContent = '';
    renderAll();
  }
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('conuco.theme', theme); } catch (e) {}
  }
  function setTab(tab) {
    state.tab = tab;
    $$('.tab').forEach(b => {
      const on = b.dataset.tab === tab;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $('#panel-water').hidden = tab !== 'water';
    $('#panel-costs').hidden = tab !== 'costs';
  }
  function setPlot(plot) {
    state.plot = plot;
    $$('#plotSwitch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.plot === plot)));
    renderWater();
  }
  function setDay(day, focusChip) {
    state.day = clamp(day, 1, WEATHER.days.length);
    renderWater();
    if (focusChip) { const chip = $(`#timeline [data-day="${state.day}"]`); if (chip) chip.focus(); }
  }

  function renderAll() { renderWater(); renderCosts(); }

  function bind() {
    $('#langSwitch').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setLang(b.dataset.lang); });
    $('#plotSwitch').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setPlot(b.dataset.plot); });
    $('#themeToggle').addEventListener('click', () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

    const tablist = $('.tabs');
    tablist.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) setTab(b.dataset.tab); });
    tablist.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const tabs = $$('.tab'); const i = tabs.findIndex(x => x.getAttribute('aria-selected') === 'true');
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      setTab(next.dataset.tab); next.focus(); e.preventDefault();
    });

    $('#timeline').addEventListener('click', e => { const b = e.target.closest('.day-chip'); if (b) setDay(Number(b.dataset.day)); });
    $('#timeline').addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { setDay(state.day - 1, true); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setDay(state.day + 1, true); e.preventDefault(); }
      if (e.key === 'Home') { setDay(1, true); e.preventDefault(); }
      if (e.key === 'End') { setDay(WEATHER.days.length, true); e.preventDefault(); }
    });
    $('#dayPrev').addEventListener('click', () => setDay(state.day - 1));
    $('#dayNext').addEventListener('click', () => setDay(state.day + 1));

    $('#priceInput').addEventListener('input', e => {
      const v = Number(e.target.value);
      if (v >= 0 && isFinite(v)) { state.price = v; renderCostKpis(); }
    });
    $('#entryTypeSwitch').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setEntryType(b.dataset.type); });
    $('#entryForm').addEventListener('submit', handleSubmit);
    window.addEventListener('scroll', hideTip, { passive: true });
  }

  // Optional: JSON direkt laden, wenn die Demo über http(s) läuft (per file:// blockiert der Browser fetch).
  function tryLoadJson() {
    if (!/^https?:/.test(location.protocol) || !window.fetch) return;
    fetch('data/wetter-14-tage.json').then(r => r.ok ? r.json() : null).then(json => {
      if (json && Array.isArray(json.days) && json.days.length) { WEATHER = json; renderWater(); }
    }).catch(() => {});
  }

  function init() {
    $('#fDate').value = WEATHER.generatedFor || '2026-09-07';
    $('#priceInput').value = state.price.toFixed(2);
    bind();
    setEntryType('harvest');
    applyStaticI18n();
    setTab('water');
    renderAll();
    tryLoadJson();
  }

  // Start, sobald DOM und Wetterdaten da sind (Fallback-Script kann nach DOMContentLoaded eintreffen).
  function start() {
    if (window.CONUCO_WEATHER) { WEATHER = window.CONUCO_WEATHER; init(); return; }
    var tries = 0;
    var timer = setInterval(function () {
      if (window.CONUCO_WEATHER) { clearInterval(timer); WEATHER = window.CONUCO_WEATHER; init(); }
      else if (++tries > 100) { clearInterval(timer); console.error('Conuco: Wetterdaten (wetter-14-tage.js) nicht gefunden.'); }
    }, 50);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
