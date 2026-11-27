// wind-kompass-card v1.1 (27.11.2026: Mond nur nach Sonnenuntergang (nie beide); Sonne/Mond weiter aussen; Zeitraum als eckiger Umschalter; Wind und Boeen als Balken mit Zonen und Maximum; v1.0: erste Version – Kompass mit Luftaufnahme, Windrichtung (Pfeil in Windfarben) und -geschwindigkeit,
// Sonne bzw. Mond (mit Mondphase) am Rand je nachdem was am Himmel steht; integrierte Windrose der letzten Stunden (1 h / 3 h / 24 h / 3 Tage) mit Geschwindigkeitsklassen in Windfarben)
(() => {
  const TAG = 'wind-kompass-card';
  if (customElements.get(TAG)) return;

  const C = { green: '#30d158', yellow: '#ffd60a', red: '#ff453a', purple: '#a927f5', orange: '#f56300' };
  const DEF = {
    title: 'Wind', direction_entity: 'sensor.gw1100a_v2_2_5_wind_direction', speed_entity: 'sensor.gw1100a_v2_2_5_wind_speed', gust_entity: 'sensor.gw1100a_v2_2_5_wind_gust',
    background_image: '/local/drohnenaufnahme.jpeg', background_opacity: 0.6, sun: 'sun.sun', sun_image: '/local/moonphases/sun.png',
    moon_entity: 'sensor.moon_api', moon_phase_entity: 'sensor.moon_phase_index', moon_images_path: '/local/mond2', period: '3h', rose: true,
  };
  // Windfarben wie bisher (compass-card bands)
  const wcol = (v) => (v >= 118 ? C.purple : v >= 62 ? C.red : v >= 29 ? C.yellow : C.green);
  // Klassen der Windrose (km/h); unter 1 km/h = Windstille
  const BINS = [
    { to: 6, c: 'rgba(48,209,88,.38)', l: '1–5' }, { to: 12, c: 'rgba(48,209,88,.58)', l: '6–11' }, { to: 20, c: 'rgba(48,209,88,.8)', l: '12–19' },
    { to: 29, c: '#30d158', l: '20–28' }, { to: 62, c: C.yellow, l: '29–61' }, { to: 118, c: C.red, l: '62–117' }, { to: Infinity, c: C.purple, l: '≥ 118' },
  ];
  const PER = [['1h', '1 h', 1], ['3h', '3 h', 3], ['24h', '24 h', 24], ['72h', '3 Tage', 72]];
  const DIRS = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const MOON = ['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'last_quarter', 'waning_crescent'];
  const num = (v, d = NaN) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const dc = (v) => String(Math.round(v * 10) / 10).replace('.', ',');

  const CSS = `
    :host { display:block; }
    ha-card { padding:4px 0 12px; overflow:hidden; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 0; color:var(--ha-card-header-color, var(--primary-text-color)); }
    .wrap { position:relative; width:min(100%, 330px); margin:0 auto; aspect-ratio:1; }
    .wrap svg.k { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
    .arr { transition:transform 1s ease; transform-origin:150px 150px; }
    .ctr { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); text-align:center; pointer-events:none; text-shadow:0 1px 6px rgba(0,0,0,.6); }
    .ctr .d { font-size:30px; font-weight:500; line-height:32px; color:rgba(255,255,255,.85); }
    .ctr .v { font-size:36px; font-weight:400; line-height:38px; color:#fff; white-space:nowrap; }
    .ctr .v small { font-size:18px; color:rgba(255,255,255,.8); margin-left:4px; }
    .sky { position:absolute; width:10%; aspect-ratio:1; transform:translate(-50%,-50%); transition:left 1s, top 1s; pointer-events:none; filter:drop-shadow(0 0 6px rgba(255,255,255,.25)); }
    .sky img { width:100%; height:100%; object-fit:contain; display:block; }
    .sky.sun img { filter:drop-shadow(0 0 8px rgba(255,200,80,.7)); }
    .pills { display:flex; margin:10px 16px 0; background:rgba(118,118,128,.2); border-radius:8px; padding:2px; }
    .pills:empty { display:none; }
    .pills span { flex:1; text-align:center; font-size:12px; line-height:16px; padding:4px 0; border-radius:6px; color:var(--secondary-text-color); cursor:pointer; -webkit-tap-highlight-color:transparent; transition:background .2s, color .2s; }
    .pills span.on { background:rgba(255,255,255,.18); color:var(--primary-text-color); }
    .bars { margin:12px 16px 0; display:flex; flex-direction:column; gap:8px; }
    .br { display:grid; grid-template-columns:44px 1fr 62px; align-items:center; gap:8px; font-size:12px; color:var(--secondary-text-color); }
    .br .vv { text-align:right; color:var(--primary-text-color); font-variant-numeric:tabular-nums; white-space:nowrap; }
    .br .vv small { color:var(--secondary-text-color); font-size:10px; }
    .tk { position:relative; height:8px; border-radius:4px; background:rgba(118,118,128,.22); overflow:visible; }
    .tk .z { position:absolute; top:0; bottom:0; opacity:.28; }
    .tk .f { position:absolute; left:0; top:0; bottom:0; border-radius:4px; transition:width .8s ease; }
    .tk .mx { position:absolute; top:-3px; bottom:-3px; width:2px; margin-left:-1px; border-radius:1px; background:rgba(255,255,255,.55); }
    .br.sc { margin-top:-6px; font-size:9px; line-height:10px; }
    .lg { display:flex; flex-wrap:wrap; justify-content:center; gap:4px 12px; margin:10px 16px 0; font-size:11px; color:var(--secondary-text-color); font-variant-numeric:tabular-nums; }
    .lg span { display:inline-flex; align-items:center; gap:4px; white-space:nowrap; }
    .lg i { width:10px; height:10px; border-radius:3px; display:inline-block; }
    .lg b { font-weight:500; color:var(--primary-text-color); }
    .info { text-align:center; font-size:12px; color:var(--secondary-text-color); margin:6px 16px 0; }
    .info b { font-weight:500; color:var(--primary-text-color); }
  `;

  class WindKompassCard extends HTMLElement {
    setConfig(c) { this._c = Object.assign({}, DEF, c || {}); this._per = this._c.period; this._hist = null; this._histAt = 0; if (this._root) this._build(); }
    getCardSize() { return 8; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    static getStubConfig() { return {}; }
    connectedCallback() { if (!this._root) this._build(); this._iv = setInterval(() => { this._histAt = 0; this._load(); }, 300000); this._load(); }
    disconnectedCallback() { clearInterval(this._iv); }
    set hass(h) { this._hass = h; if (!this._root) this._build(); this._load(); this._render(); }

    _build() {
      const r = this.shadowRoot || this.attachShadow({ mode: 'open' });
      this._root = r;
      r.innerHTML = `<style>${CSS}</style><ha-card><div class="hd"></div><div class="wrap" id="wrap"><svg class="k" id="k" viewBox="0 0 300 300"></svg><div id="sky"></div><div class="ctr" id="ctr"></div></div>
        <div class="bars" id="bars"></div><div class="pills" id="pills"></div><div class="lg" id="lg"></div><div class="info" id="info"></div></ha-card>`;
      r.querySelector('ha-card').addEventListener('click', (ev) => {
        const p = ev.target.closest('[data-p]'); if (p) { this._per = p.dataset.p; this._histAt = 0; this._hist = null; this._last = {}; this._load(); this._render(true); return; }
        if (ev.target.closest('#wrap')) { const e = new Event('hass-more-info', { bubbles: true, composed: true }); e.detail = { entityId: this._c.speed_entity }; this.dispatchEvent(e); }
      });
      this._last = {};
      this._render(true);
    }
    _set(id, html) { if (this._last[id] === html) return; this._last[id] = html; const e = this._root.getElementById(id); if (e) e.innerHTML = html; }

    /* ---------- Verlauf fuer die Windrose ---------- */
    async _load() {
      if (!this._hass || !this._c.rose || this._busy || Date.now() - this._histAt < 300000) return;
      this._busy = true; this._histAt = Date.now();
      const per = this._per, hrs = (PER.find((p) => p[0] === per) || PER[1])[2];
      try {
        const now = Date.now(), from = now - hrs * 3600000, E = [this._c.direction_entity, this._c.speed_entity, this._c.gust_entity].filter(Boolean);
        const r = await this._hass.callWS({ type: 'history/history_during_period', start_time: new Date(from).toISOString(), end_time: new Date(now).toISOString(), entity_ids: E, minimal_response: true, no_attributes: true, significant_changes_only: false });
        const ser = (e) => ((r && r[e]) || []).map((x) => ({ t: (x.lu || x.lc || 0) * 1000 || Date.parse(x.last_updated || x.last_changed), v: parseFloat(x.s != null ? x.s : x.state) })).filter((x) => isFinite(x.v) && isFinite(x.t)).sort((a, b) => a.t - b.t);
        const D = ser(this._c.direction_entity), S = ser(this._c.speed_entity), G = this._c.gust_entity ? ser(this._c.gust_entity) : [];
        // gleichmaessig abtasten (je nach Zeitraum 1–5 min) und Richtung/Geschwindigkeit paaren
        const step = hrs <= 3 ? 60000 : hrs <= 24 ? 120000 : 300000;
        const cnt = Array.from({ length: 16 }, () => BINS.map(() => 0)); let calm = 0, n = 0, i = 0, j = 0, d = null, s = null, smax = 0, sum = 0;
        for (let t = from; t <= now; t += step) {
          while (i < D.length && D[i].t <= t) d = D[i++].v;
          while (j < S.length && S[j].t <= t) s = S[j++].v;
          if (d == null || s == null) continue;
          n++; sum += s; smax = Math.max(smax, s);
          if (s < 1) { calm++; continue; }
          const sec = Math.round((((d % 360) + 360) % 360) / 22.5) % 16, b = BINS.findIndex((x) => s < x.to);
          cnt[sec][b]++;
        }
        const gmax = G.filter((x) => x.t >= from).reduce((m, x) => Math.max(m, x.v), 0);
        if (per === this._per) { this._hist = { cnt, calm, n, smax, avg: n ? sum / n : 0, gmax }; this._last.k = null; this._render(true); }
      } catch (e) { console.warn(TAG, e); }
      this._busy = false;
    }

    /* ---------- Darstellung ---------- */
    _render(force) {
      const H = this._hass; if (!H || !this._root) return;
      const c = this._c, ds = H.states[c.direction_entity], ss = H.states[c.speed_entity];
      const dir = ds ? num(ds.state, 0) : 0, sp = ss ? num(ss.state, 0) : 0;
      const sun = H.states[c.sun], mo = c.moon_entity && H.states[c.moon_entity];
      const sunUp = sun && sun.state === 'above_horizon', moonUp = !sunUp && mo && (mo.state === 'up' || num(mo.attributes.moon_altitude, -1) > 0);
      const sig = [dir, sp, sunUp, sun && Math.round(num(sun.attributes.azimuth, 0)), moonUp, mo && Math.round(num(mo.attributes.moon_azimuth, 0)), this._per, !!this._hist].join('|');
      if (!force && sig === this._sig) return; this._sig = sig;
      this._root.querySelector('.hd').textContent = c.title || ''; this._root.querySelector('.hd').style.display = c.title ? '' : 'none';
      const R = 102, cx = 150, cy = 150, col = wcol(sp);
      // Windrose
      let rose = '';
      const h = this._hist;
      if (c.rose && h && h.n) {
        const tot = h.n, mx = Math.max(...h.cnt.map((a) => a.reduce((x, y) => x + y, 0))) / tot || 1, k = (R - 6) / Math.max(mx, 0.08);
        let rings = '';
        [0.25, 0.5, 0.75, 1].forEach((f) => { const rr = 18 + (R - 24) * f; rings += `<circle cx="150" cy="150" r="${rr.toFixed(1)}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width=".8"/>`; });
        rose += rings;
        h.cnt.forEach((a, sec) => {
          let r0 = 18;
          a.forEach((v, b) => {
            if (!v) return; const r1 = r0 + v / tot * k;
            const a0 = (sec * 22.5 - 8.5 - 90) * Math.PI / 180, a1 = (sec * 22.5 + 8.5 - 90) * Math.PI / 180;
            const p = (rr, an) => `${(cx + rr * Math.cos(an)).toFixed(1)},${(cy + rr * Math.sin(an)).toFixed(1)}`;
            rose += `<path d="M${p(r0, a0)}L${p(r1, a0)}A${r1.toFixed(1)},${r1.toFixed(1)} 0 0 1 ${p(r1, a1)}L${p(r0, a1)}A${r0},${r0} 0 0 0 ${p(r0, a0)}Z" fill="${BINS[b].c}"/>`;
            r0 = r1;
          });
        });
      }
      // Kompass: Luftbild, Rose, Ring, Himmelsrichtungen, Pfeil (zeigt von der Windherkunft zur Mitte)
      const lbl = [['N', 0], ['O', 90], ['S', 180], ['W', 270]].map(([t, a]) => { const an = (a - 90) * Math.PI / 180, rr = R + 18; return `<text x="${(cx + rr * Math.cos(an)).toFixed(1)}" y="${(cy + rr * Math.sin(an)).toFixed(1)}" fill="${C.orange}" font-size="20" text-anchor="middle" dominant-baseline="central">${t}</text>`; }).join('');
      const svg = `<defs><clipPath id="wkc"><circle cx="150" cy="150" r="${R}"/></clipPath>
        <radialGradient id="wkd"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
        <linearGradient id="wka" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity=".25"/></linearGradient></defs>
        <g clip-path="url(#wkc)"><rect x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" fill="#1c1c1e"/>
        ${c.background_image ? `<image href="${esc(c.background_image)}" x="${cx - R}" y="${cy - R}" width="${2 * R}" height="${2 * R}" preserveAspectRatio="xMidYMid slice" opacity="${num(c.background_opacity, 0.6)}"/>` : ''}
        <g opacity=".9">${rose}</g><circle cx="150" cy="150" r="62" fill="url(#wkd)"/></g>
        <circle cx="150" cy="150" r="${R}" fill="none" stroke="${C.orange}" stroke-width="3"/>${lbl}
        <g class="arr" style="transform:rotate(${Math.round(dir)}deg)"><path d="M150,${cy - R + 2} L139,${cy - R - 26} L150,${cy - R - 18} L161,${cy - R - 26} Z" fill="url(#wka)" stroke="${col}" stroke-width="1" stroke-linejoin="round"/></g>`;
      this._set('k', svg);
      const dirTxt = DIRS[Math.round((((dir % 360) + 360) % 360) / 22.5) % 16];
      this._set('ctr', `<div class="d">${dirTxt}</div><div class="v">${Math.round(sp)}<small>km/h</small></div>`);
      // Sonne / Mond am Rand
      let sky = '';
      const pos = (az) => { const an = (az - 90) * Math.PI / 180, rr = R + 36; return `left:${((cx + rr * Math.cos(an)) / 3).toFixed(2)}%;top:${((cy + rr * Math.sin(an)) / 3).toFixed(2)}%`; };
      if (sunUp) sky += `<div class="sky sun" style="${pos(num(sun.attributes.azimuth, 0))}"><img src="${esc(c.sun_image)}" alt=""></div>`;
      if (moonUp) {
        const ph = c.moon_phase_entity && H.states[c.moon_phase_entity] ? Math.max(0, Math.min(7, Math.round(num(H.states[c.moon_phase_entity].state, 4)))) : 4;
        sky += `<div class="sky" style="${pos(num(mo.attributes.moon_azimuth, 0))}"><img src="${esc(c.moon_images_path.replace(/\/$/, ''))}/${MOON[ph]}.png" alt=""></div>`;
      }
      this._set('sky', sky);
      // Wind und Boeen als Balken (Skala 0–75 km/h, Zonen in Windfarben, Strich = Maximum im Zeitraum)
      const MAXS = 75, gs = c.gust_entity && H.states[c.gust_entity], gu = gs ? num(gs.state, NaN) : NaN;
      const zones = [[0, 29, C.green], [29, 62, C.yellow], [62, MAXS, C.red]].map(([a, b, cc]) => `<i class="z" style="left:${a / MAXS * 100}%;width:${(b - a) / MAXS * 100}%;background:${cc};${a === 0 ? 'border-radius:4px 0 0 4px;' : ''}${b === MAXS ? 'border-radius:0 4px 4px 0;' : ''}"></i>`).join('');
      const bar = (lb, v, mx) => isNaN(v) ? '' : `<div class="br"><span>${lb}</span><div class="tk">${zones}<i class="f" style="width:${Math.min(100, v / MAXS * 100).toFixed(1)}%;background:${wcol(v)}"></i>${mx > 0 ? `<i class="mx" style="left:${Math.min(100, mx / MAXS * 100).toFixed(1)}%"></i>` : ''}</div><span class="vv">${dc(v)} <small>km/h</small></span></div>`;
      this._set('bars', bar('Wind', sp, h ? h.smax : 0) + bar('Böen', gu, h ? h.gmax : 0) + `<div class="br sc"><span></span><div style="position:relative;height:10px">${[[0, '0'], [29, '29'], [62, '62'], [75, '75+']].map(([v, t]) => `<span style="position:absolute;left:${(v / MAXS * 100).toFixed(1)}%;transform:translateX(${v === 0 ? '0' : v === 75 ? '-100%' : '-50%'})">${t}</span>`).join('')}</div><span></span></div>`);
      // Zeitraum und Legende
      this._set('pills', c.rose ? PER.map(([k, l]) => `<span data-p="${k}" class="${k === this._per ? 'on' : ''}">${l}</span>`).join('') : '');
      if (c.rose && h && h.n) {
        const tot = h.n, sums = BINS.map((_, b) => h.cnt.reduce((m, a) => m + a[b], 0));
        this._set('lg', BINS.map((b, i) => (sums[i] ? `<span><i style="background:${b.c}"></i>${b.l} <b>${Math.round(sums[i] / tot * 100)} %</b></span>` : '')).join('') + `<span><i style="background:rgba(255,255,255,.25)"></i>Windstill <b>${Math.round(h.calm / tot * 100)} %</b></span>`);
        this._set('info', `Ø <b>${dc(h.avg)} km/h</b> · max. <b>${dc(h.smax)} km/h</b>${h.gmax ? ` · Böen bis <b style="color:${wcol(h.gmax)}">${dc(h.gmax)} km/h</b>` : ''}`);
      } else { this._set('lg', c.rose ? '<span>Verlauf wird geladen …</span>' : ''); this._set('info', ''); }
    }
  }
  customElements.define(TAG, WindKompassCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Wind-Kompass', description: 'Windrichtung und -geschwindigkeit mit Luftbild, Sonne/Mond und Windrose' });
})();
