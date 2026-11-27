// wetter-karte-card v1.0 (27.11.2026: erste Version – Kopf mit aktuellem Zustand und Wettereffekt (Sonne, Regen, Schnee, klare Nacht, Gewitter, Nebel, Wolken) plus naechste Stunden;
// Warnungen DWD (aktuell + Vorabinfo) und NINA mit Farben der NINA-DWD-Karte, antippen zeigt Beschreibung; Vorhersage als Zeilen (Apple-Stil) oder Balken,
// Temperaturfarben nach den Schwellen der Aussentemperatur-Grafik, Niederschlag in mm bzw. Schnee ca. cm; Testauswahl fuer Wetter und Warnungen)
(() => {
  const TAG = 'wetter-karte-card';
  if (customElements.get(TAG)) return;

  const C = { green: '#30d158', yellow: '#ffd60a', orange: '#f56300', red: '#ff453a', purple: '#bf5af2', blue: '#0a84ff', teal: '#64d2ff', gray: '#8e8e93', gray3: '#aeaeb2' };
  const DEF = {
    entity: 'weather.weather_fusion_ai_elm', icons_path: '/local/wettericons', sun: 'sun.sun',
    temperature_entity: 'sensor.wohnen_wohnen_wohnen_aussen_temperature',
    dwd_entity: 'sensor.stadt_schluchtern_aktuelle_warnstufe', dwd_advance_entity: 'sensor.stadt_schluchtern_vorwarnstufe',
    nina_match: 'warning_schluchtern_stadt_main_kinzig_kreis_hessen_', title: 'Wetter Elm', forecast_style: 'zeilen', hours: 6, days: 7, test: false,
  };
  // Farbschwellen wie Aussentemperatur-Grafik (statistics-graph-chart-card)
  const TH = [[-10, [140, 52, 253]], [-5, [140, 52, 253]], [2, [10, 132, 255]], [5, [66, 245, 227]], [10, [121, 210, 179]], [14, [48, 209, 88]], [19, [255, 214, 10]], [30, [255, 99, 0]], [35, [255, 69, 58]]];
  const tc = (v) => {
    if (v <= TH[0][0]) return `rgb(${TH[0][1]})`;
    for (let i = 1; i < TH.length; i++) if (v <= TH[i][0]) { const a = TH[i - 1], b = TH[i], f = (v - a[0]) / (b[0] - a[0]); return `rgb(${a[1].map((x, k) => Math.round(x + (b[1][k] - x) * f))})`; }
    return `rgb(${TH[TH.length - 1][1]})`;
  };
  // Warnfarben wie NINA-DWD-Karte (color_overrides)
  const LV = { 0: C.green, 1: C.yellow, 2: C.orange, 3: C.red, 4: '#880e4f' };
  const LVN = { 1: 'Stufe 1', 2: 'Stufe 2', 3: 'Stufe 3', 4: 'Stufe 4' };
  const NSEV = { minor: [1, 'gering'], moderate: [2, 'mäßig'], severe: [3, 'schwer'], extreme: [4, 'extrem'], unknown: [1, 'Info'] };
  const NAMES = { 'clear-night': 'Klar', cloudy: 'Bewölkt', exceptional: 'Unwetter', fog: 'Nebel', hail: 'Hagel', lightning: 'Gewitter', 'lightning-rainy': 'Gewitter', partlycloudy: 'Teils bewölkt',
    'partlycloudy-night': 'Teils bewölkt', pouring: 'Starkregen', rainy: 'Regen', snowy: 'Schnee', 'snowy-rainy': 'Schneeregen', sunny: 'Sonnig', windy: 'Windig', 'windy-variant': 'Windig' };
  const MDI = { 'clear-night': 'mdi:weather-night', cloudy: 'mdi:weather-cloudy', exceptional: 'mdi:alert-circle-outline', fog: 'mdi:weather-fog', hail: 'mdi:weather-hail', lightning: 'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy', partlycloudy: 'mdi:weather-partly-cloudy', 'partlycloudy-night': 'mdi:weather-night-partly-cloudy', pouring: 'mdi:weather-pouring', rainy: 'mdi:weather-rainy',
    snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy', sunny: 'mdi:weather-sunny', windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant' };
  // Effekt je Zustand
  const FXOF = { sunny: 'sun', 'clear-night': 'night', partlycloudy: 'cloud', 'partlycloudy-night': 'night', cloudy: 'cloud', fog: 'fog', rainy: 'rain', pouring: 'rain', 'snowy-rainy': 'snow', snowy: 'snow',
    hail: 'rain', lightning: 'storm', 'lightning-rainy': 'storm', windy: 'cloud', 'windy-variant': 'cloud', exceptional: 'storm' };
  // Warn-Icons (wird durch icon_map aus der Konfiguration ergaenzt/ersetzt)
  const WICO = [[/gewitter/i, 'mdi:weather-lightning'], [/orkan|sturm|wind|b(oe|ö)en/i, 'mdi:weather-windy'], [/starkregen|dauerregen|regen/i, 'mdi:weather-pouring'], [/schnee/i, 'mdi:weather-snowy-heavy'],
    [/glatteis|gl(ae|ä)tte|reif/i, 'mdi:car-traction-control'], [/frost/i, 'mdi:snowflake-thermometer'], [/nebel/i, 'mdi:weather-fog'], [/hitze/i, 'mdi:thermometer-high'], [/uv/i, 'mdi:weather-sunny-alert'],
    [/tauwetter/i, 'mdi:snowflake-melt'], [/hochwasser|flut|pegel/i, 'mdi:home-flood'], [/brand|feuer/i, 'mdi:fire'], [/strom/i, 'mdi:flash-off'], [/gefahrstoff|chemi/i, 'mdi:biohazard'], [/.*/, 'mdi:alert-outline']];
  const TESTS = [['live', 'Live'], ['sunny', 'Sonne'], ['partlycloudy', 'Teils bewölkt'], ['cloudy', 'Wolken'], ['rainy', 'Regen'], ['snowy', 'Schnee'], ['clear-night', 'Klare Nacht'], ['lightning-rainy', 'Gewitter'], ['fog', 'Nebel']];
  const WTESTS = [['live', 'Live'], ['keine', 'Keine'], ['beispiel', 'Beispiel']];

  const CSS = `
    :host { display:block; container-type:inline-size; }
    ha-card { padding:4px 0 8px; overflow:hidden; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 4px; color:var(--ha-card-header-color, var(--primary-text-color)); }
    .tst { display:flex; flex-wrap:wrap; gap:6px; padding:0 16px 10px; }
    .tst .lb { font-size:11px; color:var(--secondary-text-color); width:100%; margin-top:2px; }
    .tst button { font:inherit; font-size:12px; padding:4px 10px; border-radius:14px; border:0; background:rgba(118,118,128,.24); color:var(--primary-text-color); cursor:pointer; }
    .tst button.on { background:${C.orange}; color:#fff; }
    .hero { position:relative; margin:0 16px; height:112px; border-radius:12px; overflow:hidden; background:rgba(118,118,128,.12); cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .hero canvas { position:absolute; inset:0; width:100%; height:100%; }
    .now { position:absolute; inset:0; display:flex; align-items:center; padding:0 12px; gap:10px; }
    .cur { flex:0 0 88px; display:flex; flex-direction:column; align-items:center; }
    .cur img, .cur ha-icon { width:54px; height:54px; --mdc-icon-size:50px; display:flex; align-items:center; justify-content:center; color:#c7c7cc; }
    .cur .cn { font-size:14px; line-height:1.2; margin-top:2px; color:var(--primary-text-color); text-align:center; }
    .sep { width:.5px; align-self:stretch; margin:18px 0; background:rgba(255,255,255,.15); }
    .hrs { flex:1; min-width:0; display:flex; justify-content:space-between; }
    .h { display:flex; flex-direction:column; align-items:center; gap:2px; font-size:11px; color:var(--secondary-text-color); min-width:30px; }
    .h .t { color:var(--primary-text-color); opacity:.85; }
    .h .t.n { color:${C.orange}; opacity:1; }
    .h img, .h ha-icon { width:26px; height:26px; --mdc-icon-size:22px; display:flex; align-items:center; justify-content:center; color:#c7c7cc; }
    .h .p { font-variant-numeric:tabular-nums; }
    .h .p.wet { color:${C.teal}; }
    .fold { padding:0 16px; }
    .fh { display:flex; align-items:center; gap:16px; height:44px; cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; border-bottom:0.5px solid var(--divider-color, rgba(128,128,128,.3)); margin:8px 0 4px; }
    .fh .ft { flex:0 0 28px; width:28px; height:28px; border-radius:7px; background:rgba(118,118,128,.28); display:flex; align-items:center; justify-content:center; }
    .fh .ft ha-icon { --mdc-icon-size:20px; color:#fff; display:flex; }
    .fh .lbl { flex:1; font-weight:500; font-size:14px; text-transform:uppercase; letter-spacing:.04em; color:var(--primary-text-color); }
    .fh .fx { font-size:11px; color:var(--secondary-text-color); display:flex; align-items:center; gap:4px; white-space:nowrap; }
    .fh .fx ha-icon { --mdc-icon-size:15px; display:flex; }
    .fh .fx .cnt { font-size:12px; }
    .fb { display:grid; grid-template-rows:1fr; transition:grid-template-rows .3s ease; }
    .fold.closed .fb { grid-template-rows:0fr; }
    .fi { overflow:hidden; min-height:0; }
    .w { background:rgba(118,118,128,.12); border-radius:10px; padding:8px 10px; margin-bottom:4px; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .w:last-child { margin-bottom:8px; }
    .w .row { display:flex; align-items:center; gap:10px; }
    .w .bx { flex:0 0 30px; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
    .w .bx ha-icon { --mdc-icon-size:18px; display:flex; }
    .w .tx { flex:1; min-width:0; }
    .w .nm { font-size:14px; line-height:1.3; color:var(--primary-text-color); }
    .w .tg { font-size:11px; padding:1px 6px; border-radius:6px; margin-left:4px; white-space:nowrap; }
    .w .sb { font-size:12px; line-height:1.35; color:var(--secondary-text-color); }
    .w .cv { --mdc-icon-size:18px; color:var(--secondary-text-color); display:flex; transition:transform .25s; }
    .w.op .cv { transform:rotate(180deg); }
    .w .ds { display:grid; grid-template-rows:0fr; transition:grid-template-rows .25s ease; }
    .w.op .ds { grid-template-rows:1fr; }
    .w .ds > div { overflow:hidden; min-height:0; font-size:12px; line-height:1.5; color:var(--primary-text-color); opacity:.85; padding-left:40px; white-space:pre-line; }
    .w.op .ds > div { padding-top:6px; padding-bottom:2px; }
    .w .ds b { font-weight:400; color:var(--secondary-text-color); }
    .w.adv { opacity:.7; }
    .dr { display:grid; grid-template-columns:44px 28px 56px 30px minmax(0,1fr) 32px; align-items:center; height:34px; font-size:14px; border-top:.5px solid var(--divider-color, rgba(84,84,88,.45)); font-variant-numeric:tabular-nums; }
    .dr:first-child { border-top:0; }
    .dr .d { color:var(--primary-text-color); }
    .dr .d.n { color:${C.orange}; }
    .dr img, .dr ha-icon { width:24px; height:24px; --mdc-icon-size:22px; display:flex; align-items:center; justify-content:center; color:#c7c7cc; }
    .pr { font-size:12px; color:var(--secondary-text-color); display:flex; align-items:center; gap:4px; white-space:nowrap; }
    .pr.wet { color:${C.teal}; }
    .pr .k { position:relative; width:4px; height:14px; border-radius:2px; background:rgba(10,132,255,.22); overflow:hidden; flex:none; }
    .pr .k i { position:absolute; left:0; right:0; bottom:0; background:${C.blue}; }
    .pr .k.s { background:rgba(255,255,255,.2); } .pr .k.s i { background:#fff; }
    .lo { color:var(--secondary-text-color); text-align:right; padding-right:8px; }
    .hi { text-align:right; color:var(--primary-text-color); }
    .tr { position:relative; height:5px; border-radius:3px; background:rgba(118,118,128,.16); }
    .tr i { position:absolute; top:0; bottom:0; border-radius:3px; }
    .tr b { position:absolute; top:-2px; width:9px; height:9px; margin-left:-4.5px; border-radius:50%; background:#fff; box-shadow:0 0 0 1.5px var(--ha-card-background, var(--card-background-color, #1c1c1e)); }
    .lg { font-size:11px; color:var(--secondary-text-color); display:flex; gap:10px; align-items:center; margin:6px 0 8px; }
    .lg span { display:flex; align-items:center; gap:4px; }
    .lg i { width:4px; height:10px; border-radius:2px; display:inline-block; }
    .bc { display:grid; text-align:center; font-size:12px; font-variant-numeric:tabular-nums; }
    .bc .d { color:var(--secondary-text-color); }
    .bc .d.n { color:${C.orange}; }
    .bc img, .bc ha-icon { width:24px; height:24px; --mdc-icon-size:22px; margin:2px auto 0; display:flex; align-items:center; justify-content:center; color:#c7c7cc; }
    .bc .pv { font-size:11px; color:var(--secondary-text-color); }
    .bc .pv.wet { color:${C.teal}; }
    .bsvg { display:block; width:100%; }
    .err { padding:10px 16px; font-size:12px; color:${C.red}; }
  `;

  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const num = (v, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const r0 = (v) => { const x = Math.round(v); return x === 0 ? '0' : String(x).replace('-', '−'); };
  const dc = (v) => (Math.round(v * 10) / 10).toString().replace('.', ',');
  const hhmm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const ico = (i, col) => `<ha-icon icon="${i}"${col ? ` style="color:${col}"` : ''}></ha-icon>`;
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const when = (d) => {
    if (!d || isNaN(d)) return '';
    const n = new Date(), t = new Date(n); t.setDate(n.getDate() + 1);
    return (sameDay(d, n) ? 'heute' : sameDay(d, t) ? 'morgen' : WD[d.getDay()] + ' ' + d.getDate() + '.' + (d.getMonth() + 1) + '.') + ' ' + hhmm(d);
  };

  class WetterKarteCard extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({}, DEF, c || {});
      this._test = 'live'; this._wtest = 'live'; this._open = {}; this._wop = {};
      this._fc = { daily: null, hourly: null };
      this._last = {};
      if (this._root) this._build();
    }
    getCardSize() { return 8; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    static getStubConfig() { return {}; }

    connectedCallback() {
      this._on = true;
      if (!this._root) this._build();
      this._sub();
      this._iv = setInterval(() => this._render(true), 60000);
      if ('IntersectionObserver' in window) { this._io = new IntersectionObserver((e) => { this._vis = e[0].isIntersecting; if (this._vis) this._loop(); }); this._io.observe(this); } else this._vis = true;
      this._loop();
    }
    disconnectedCallback() {
      this._on = false; clearInterval(this._iv); if (this._io) this._io.disconnect();
      if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0;
      this._unsub();
    }
    set hass(h) {
      const first = !this._hass; this._hass = h;
      if (first && this._on) this._sub();
      this._render();
    }

    /* ---------- Vorhersage abonnieren ---------- */
    _sub() {
      if (!this._hass || this._subs || !this._on) return;
      this._subs = [];
      ['daily', 'hourly'].forEach((type) => {
        const p = this._hass.connection.subscribeMessage((m) => { this._fc[type] = (m && m.forecast) || []; this._render(true); },
          { type: 'weather/subscribe_forecast', forecast_type: type, entity_id: this._c.entity });
        this._subs.push(p);
        p.catch((e) => { console.warn(TAG, type, e); });
      });
    }
    _unsub() { if (!this._subs) return; this._subs.forEach((p) => p.then((u) => u && u()).catch(() => {})); this._subs = null; }

    /* ---------- Aufbau ---------- */
    _build() {
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      this._root = root;
      root.innerHTML = `<style>${CSS}</style><ha-card>
        <div class="hd"></div>
        <div class="tst" id="tst"></div>
        <div class="hero" id="hero"><canvas id="cv"></canvas><div class="now"><div class="cur" id="cur"></div><div class="sep"></div><div class="hrs" id="hrs"></div></div></div>
        <div id="ex"></div>
        <div class="fold" data-id="warn"><div class="fh"><span class="ft">${ico('mdi:alert-outline')}</span><span class="lbl">Warnungen</span><span class="fx" id="wfx"></span></div><div class="fb"><div class="fi" id="wl"></div></div></div>
        <div class="fold" data-id="fc"><div class="fh"><span class="ft">${ico('mdi:calendar-month-outline')}</span><span class="lbl">Vorhersage</span><span class="fx" id="ffx"></span></div><div class="fb"><div class="fi" id="fl"></div></div></div>
      </ha-card>`;
      this._last = {};
      const card = root.querySelector('ha-card');
      card.addEventListener('click', (ev) => this._click(ev));
      this._cv = root.getElementById('cv'); this._g = this._cv.getContext('2d');
      if ('ResizeObserver' in window) { this._ro = new ResizeObserver(() => this._size()); this._ro.observe(root.getElementById('hero')); }
      this._render(true);
    }
    _set(id, html) { if (this._last[id] === html) return; this._last[id] = html; const e = this._root.getElementById(id); if (e) e.innerHTML = html; }
    _click(ev) {
      const t = ev.target;
      const tb = t.closest('[data-t]'); if (tb) { this._test = tb.dataset.t; this._render(true); return; }
      const wb = t.closest('[data-wt]'); if (wb) { this._wtest = wb.dataset.wt; this._render(true); return; }
      const fh = t.closest('.fh'); if (fh) { const f = fh.parentElement, id = f.dataset.id; this._open[id] = f.classList.toggle('closed') ? 'zu' : 'auf'; this._render(true); return; }
      const w = t.closest('.w[data-k]'); if (w) { const k = w.dataset.k; this._wop[k] = !this._wop[k]; w.classList.toggle('op', !!this._wop[k]); this._last.wl = null; return; }
      if (t.closest('#hero')) { const e = new Event('hass-more-info', { bubbles: true, composed: true }); e.detail = { entityId: this._c.entity }; this.dispatchEvent(e); }
    }

    /* ---------- Hilfen ---------- */
    _night() { const s = this._hass && this._hass.states[this._c.sun]; return s ? s.state === 'below_horizon' : false; }
    _cond(c, night) { if (night && c === 'sunny') return 'clear-night'; if (night && c === 'partlycloudy') return 'partlycloudy-night'; return c || 'exceptional'; }
    _img(cond) {
      const p = this._c.icons_path;
      if (!p) return ico(MDI[cond] || 'mdi:weather-cloudy');
      return `<img src="${esc(p.replace(/\/$/, ''))}/${esc(cond)}.svg" alt="" data-f="${MDI[cond] || 'mdi:weather-cloudy'}" onerror="this.outerHTML='<ha-icon icon=&quot;'+this.dataset.f+'&quot;></ha-icon>'">`;
    }
    _isNightAt(d) {
      const s = this._hass.states[this._c.sun]; if (!s) return d.getHours() < 7 || d.getHours() >= 17;
      const rise = new Date(s.attributes.next_rising), set = new Date(s.attributes.next_setting);
      if (isNaN(rise) || isNaN(set)) return d.getHours() < 7 || d.getHours() >= 17;
      const m = d.getHours() * 60 + d.getMinutes(), rm = rise.getHours() * 60 + rise.getMinutes(), sm = set.getHours() * 60 + set.getMinutes();
      return m < rm || m >= sm;
    }

    /* ---------- Rendern ---------- */
    _render(force) {
      const H = this._hass; if (!H || !this._root) return;
      const we = H.states[this._c.entity];
      const sig = [we && we.last_updated, this._c.dwd_entity && H.states[this._c.dwd_entity] && H.states[this._c.dwd_entity].last_updated,
        this._c.dwd_advance_entity && H.states[this._c.dwd_advance_entity] && H.states[this._c.dwd_advance_entity].last_updated,
        H.states[this._c.sun] && H.states[this._c.sun].state, this._ninaIds().map((id) => H.states[id].state + H.states[id].last_updated).join(),
        this._c.temperature_entity && H.states[this._c.temperature_entity] && H.states[this._c.temperature_entity].state].join('|');
      if (!force && sig === this._sig) return;
      this._sig = sig;
      try {
        this._root.querySelector('.hd').textContent = this._c.title || '';
        this._root.querySelector('.hd').style.display = this._c.title ? '' : 'none';
        this._root.querySelectorAll('.fold').forEach((f) => f.classList.toggle('closed', this._open[f.dataset.id] === 'zu'));
        this._set('tst', this._c.test ? this._tests() : '');
        this._root.getElementById('tst').style.display = this._c.test ? '' : 'none';
        if (!we) { this._set('ex', `<div class="err">Entität ${esc(this._c.entity)} nicht gefunden</div>`); return; }
        this._set('ex', '');
        this._hero(we);
        this._warn();
        this._fcast(we);
      } catch (e) {
        console.error(TAG, e);
        this._set('ex', `<div class="err">${TAG} Fehler: ${esc(e && e.message || e)}</div>`);
      }
    }
    _tests() {
      const b = (a, v, cur, k) => `<button data-${k}="${v}" class="${v === cur ? 'on' : ''}">${esc(a)}</button>`;
      return `<span class="lb">Test Wetter</span>${TESTS.map(([v, a]) => b(a, v, this._test, 't')).join('')}<span class="lb">Test Warnungen</span>${WTESTS.map(([v, a]) => b(a, v, this._wtest, 'wt')).join('')}`;
    }

    _hero(we) {
      const c = this._test === 'live' ? this._cond(we.state, this._night()) : this._test;
      this._fx = FXOF[c] || 'cloud';
      if (this._fx === 'sun' || this._fx === 'night') { const cc = num(we.attributes.cloud_coverage, 0); this._fxClouds = this._test === 'live' ? cc : 15; } else this._fxClouds = 0;
      if (c === 'partlycloudy' || c === 'partlycloudy-night') this._fxClouds = 55;
      this._sunEl = num(this._hass.states[this._c.sun] && this._hass.states[this._c.sun].attributes.elevation, 30);
      this._set('cur', `${this._img(c)}<div class="cn">${esc(NAMES[c] || c)}</div>`);
      // naechste Stunden
      const hf = (this._fc.hourly || []).filter((x) => Date.parse(x.datetime) > Date.now() - 1800000).slice(0, Math.max(3, num(this._c.hours, 6)));
      let hrs = '';
      if (hf.length) {
        const n = Math.max(3, Math.min(hf.length, num(this._c.hours, 6)));
        hrs = hf.slice(0, n).map((x, i) => {
          const d = new Date(x.datetime), hc = this._cond(x.condition, this._isNightAt(d)), p = Math.round(num(x.precipitation_probability));
          return `<div class="h"><span class="t${i === 0 ? ' n' : ''}">${i === 0 ? 'Jetzt' : String(d.getHours()).padStart(2, '0')}</span>${this._img(i === 0 && this._test !== 'live' ? c : hc)}<span class="p${p >= 30 ? ' wet' : ''}">${p} %</span></div>`;
        }).join('');
      }
      this._set('hrs', hrs);
    }

    /* ---------- Warnungen ---------- */
    _ninaIds() {
      const m = this._c.nina_match; if (!m || !this._hass) return [];
      if (this._nIds && Date.now() - this._nAt < 300000) return this._nIds.filter((id) => this._hass.states[id]);
      this._nAt = Date.now();
      this._nIds = Object.keys(this._hass.states).filter((id) => id.startsWith('binary_sensor.') && id.includes(m) && /_\d+$/.test(id)).sort();
      return this._nIds;
    }
    _wicon(name) {
      const map = this._c.icon_map || {};
      for (const k of Object.keys(map)) if (name.toLowerCase().includes(k.toLowerCase())) return map[k];
      for (const [re, i] of WICO) if (re.test(name)) return i;
      return 'mdi:alert-outline';
    }
    _collect() {
      const H = this._hass, out = [];
      if (this._wtest === 'keine') return out;
      if (this._wtest === 'beispiel') {
        const n = new Date(), e = new Date(Date.now() + 18 * 3600000);
        return [
          { k: 'x1', src: 'DWD', lv: 2, name: 'Sturmböen', head: 'Amtliche WARNUNG vor STURMBÖEN', desc: 'Es treten Sturmböen mit Geschwindigkeiten um 70 km/h aus westlicher Richtung auf.', ins: 'Achten Sie auf herabstürzende Äste und herumfliegende Gegenstände.', s: n, e },
          { k: 'x2', src: 'DWD', lv: 1, name: 'Glätte', head: 'Amtliche WARNUNG vor GLÄTTE', desc: 'Es besteht Glättegefahr.', ins: 'Verhalten im Straßenverkehr anpassen.', s: n, e },
          { k: 'x3', src: 'DWD', lv: 3, name: 'Schwere Gewitter', adv: true, head: 'Vorabinformation UNWETTER vor schwerem Gewitter', desc: 'Für morgen Nachmittag sind schwere Gewitter mit Hagel möglich.', ins: '', s: new Date(Date.now() + 20 * 3600000), e: new Date(Date.now() + 28 * 3600000) },
          { k: 'x4', src: 'NINA', lv: 2, sev: 'mäßig', name: 'Stromausfall Schlüchtern', head: 'Stromausfall im Stadtgebiet', desc: 'Im Stadtgebiet Schlüchtern kommt es zu einem großflächigen Stromausfall.', ins: 'Informieren Sie sich über Radio und Warn-Apps. Halten Sie Notrufnummern frei.', s: n, e: null },
        ];
      }
      const dwd = (id, adv) => {
        const s = id && H.states[id]; if (!s) return;
        const a = s.attributes, n = num(a.warning_count, 0);
        for (let i = 1; i <= n; i++) {
          const nm = a[`warning_${i}_name`]; if (!nm) continue;
          const name = String(nm).charAt(0) + String(nm).slice(1).toLowerCase();
          out.push({ k: `${adv ? 'v' : 'd'}${i}${nm}`, src: 'DWD', adv, lv: Math.max(1, Math.min(4, num(a[`warning_${i}_level`], 1))), name,
            head: a[`warning_${i}_headline`], desc: a[`warning_${i}_description`], ins: a[`warning_${i}_instruction`], s: new Date(a[`warning_${i}_start`]), e: new Date(a[`warning_${i}_end`]) });
        }
      };
      dwd(this._c.dwd_entity, false);
      dwd(this._c.dwd_advance_entity, true);
      this._ninaIds().forEach((id) => {
        const s = H.states[id]; if (s.state !== 'on') return;
        const a = s.attributes, sv = NSEV[String(a.severity || 'unknown').toLowerCase()] || NSEV.unknown;
        const ra = Array.isArray(a.recommended_actions) ? a.recommended_actions.join('\n') : (a.recommended_actions || '');
        out.push({ k: 'n' + id + (a.id || ''), src: 'NINA', lv: sv[0], sev: sv[1], name: a.headline || 'NINA-Meldung', head: a.sender || '', desc: a.description || '', ins: ra,
          s: a.start ? new Date(a.start) : (a.sent ? new Date(a.sent) : null), e: a.expires ? new Date(a.expires) : null });
      });
      out.sort((x, y) => (x.adv - y.adv) || (y.lv - x.lv));
      return out;
    }
    _warn() {
      const L = this._collect(), closed = this._open.warn === 'zu';
      const nd = L.filter((x) => x.src === 'DWD' && !x.adv), nv = L.filter((x) => x.src === 'DWD' && x.adv), nn = L.filter((x) => x.src === 'NINA');
      const mx = (a) => a.reduce((m, x) => Math.max(m, x.lv), 0);
      let fx;
      if (!L.length) fx = `<span class="cnt" style="color:${C.green}">Keine Warnungen</span>${ico('mdi:shield-check-outline', C.green)}`;
      else if (closed) fx = `${L.length} aktiv · Anzeigen`;
      else {
        const p = [];
        p.push(`<span class="cnt" style="color:${nd.length ? LV[mx(nd)] : 'var(--secondary-text-color)'}">DWD ${nd.length}</span>`);
        if (nv.length) p.push(`<span class="cnt" style="color:var(--secondary-text-color)">Vorab ${nv.length}</span>`);
        p.push(`<span class="cnt" style="color:${nn.length ? LV[mx(nn)] : 'var(--secondary-text-color)'}">NINA ${nn.length}</span>`);
        fx = p.join('<span>·</span>');
      }
      this._set('wfx', fx);
      const rows = L.map((w) => {
        const col = LV[w.lv] || C.yellow, tag = w.src === 'NINA' ? `NINA · ${w.sev}` : `DWD · ${w.adv ? 'Vorabinfo' : LVN[w.lv]}`;
        const sub = w.e && !isNaN(w.e) ? (w.s && w.s > Date.now() ? `ab ${when(w.s)}` : `bis ${when(w.e)}`) : (w.s && !isNaN(w.s) ? `seit ${when(w.s)}` : '');
        const left = w.e && !isNaN(w.e) && w.e > Date.now() && (!w.s || w.s <= Date.now()) ? (() => { const m = Math.round((w.e - Date.now()) / 60000); return m < 60 ? `noch ${m} min` : `noch ${Math.round(m / 60)} h`; })() : '';
        const det = [w.head && `<b>${esc(w.head)}</b>`, w.desc && esc(w.desc), w.ins && `<b>Empfehlung:</b> ${esc(String(w.ins).replace(/^Hinweis auf:.*?\n?Handlungsempfehlungen:\s*\n?/s, '').trim())}`,
          (w.s || w.e) && `<b>Gültig:</b> ${w.s && !isNaN(w.s) ? when(w.s) : ''}${w.e && !isNaN(w.e) ? ' bis ' + when(w.e) : ''}`].filter(Boolean).join('\n');
        return `<div class="w${w.adv ? ' adv' : ''}${this._wop[w.k] ? ' op' : ''}" data-k="${esc(w.k)}"><div class="row"><span class="bx" style="background:${col}26">${ico(this._wicon(w.name + ' ' + (w.head || '')), col)}</span>
          <div class="tx"><div class="nm">${esc(w.name)}<span class="tg" style="color:${col};background:${col}22">${esc(tag)}</span></div><div class="sb">${esc([sub, left].filter(Boolean).join(' · '))}</div></div>${ico('mdi:chevron-down')}</div>
          <div class="ds"><div>${det}</div></div></div>`.replace('<ha-icon icon="mdi:chevron-down">', '<ha-icon class="cv" icon="mdi:chevron-down">');
      }).join('');
      this._set('wl', rows);
    }

    /* ---------- Vorhersage ---------- */
    _days(we) {
      const D = (this._fc.daily || []).slice(0, Math.max(3, num(this._c.days, 7)));
      const hf = this._fc.hourly || [];
      return D.map((x, i) => {
        const d = new Date(x.datetime);
        // Schnee: Niederschlag in Stunden mit <= 0,5 Grad (aus Stundenvorhersage) oder Tageszustand Schnee
        let tot = 0, sn = 0, have = false;
        hf.forEach((h) => { const hd = new Date(h.datetime); if (!sameDay(hd, d)) return; have = true; const p = num(h.precipitation); tot += p; if (num(h.temperature, 9) <= 0.5 || /snow/.test(h.condition || '')) sn += p; });
        const pr = num(x.precipitation);
        const snowDay = /snowy/.test(x.condition || '') || (have ? (tot > 0.05 && sn / tot >= 0.5) : num(x.temperature, 9) <= 0);
        const snowFrac = have && tot > 0 ? sn / tot : (snowDay ? 1 : 0);
        return { d, i, cond: x.condition, hi: num(x.temperature), lo: num(x.templow, num(x.temperature) - 3), pr, pp: Math.round(num(x.precipitation_probability)), snow: snowDay && pr >= 0.05, cm: pr * snowFrac };
      });
    }
    _fcast(we) {
      const D = this._days(we);
      if (!D.length) { this._set('fl', `<div class="lg">Vorhersage wird geladen …</div>`); this._set('ffx', ''); return; }
      const style = this._c.forecast_style === 'balken' ? 'balken' : 'zeilen';
      this._set('ffx', this._open.fc === 'zu' ? 'Anzeigen' : 'Einklappen');
      const tNow = this._c.temperature_entity && this._hass.states[this._c.temperature_entity] ? num(this._hass.states[this._c.temperature_entity].state, num(we.attributes.temperature)) : num(we.attributes.temperature);
      this._set('fl', style === 'balken' ? this._bars(D, tNow) : this._rows(D, tNow));
    }
    _dayName(x) { return x.i === 0 && sameDay(x.d, new Date()) ? 'Heute' : WD[x.d.getDay()]; }
    _rows(D, tNow) {
      const lo = Math.min(...D.map((x) => x.lo), tNow), hi = Math.max(...D.map((x) => x.hi), tNow), sp = Math.max(1, hi - lo);
      const pMax = Math.max(2, ...D.map((x) => x.pr));
      const anySnow = D.some((x) => x.snow);
      return D.map((x) => {
        const l = (x.lo - lo) / sp * 100, w = Math.max(4, (x.hi - x.lo) / sp * 100);
        const g = `linear-gradient(90deg,${tc(x.lo)},${tc((x.lo + x.hi) / 2)},${tc(x.hi)})`;
        const today = this._dayName(x) === 'Heute';
        const v = x.snow ? `ca. ${dc(Math.max(0.1, x.cm))}` : dc(x.pr), f = Math.max(12, Math.min(100, x.pr / pMax * 100));
        return `<div class="dr"><span class="d${today ? ' n' : ''}">${this._dayName(x)}</span>${this._img(x.cond)}
          <span class="pr${x.pr >= 0.5 ? ' wet' : ''}"><span class="k${x.snow ? ' s' : ''}"><i style="height:${x.pr > 0.04 ? f : 0}%"></i></span>${v}</span>
          <span class="lo">${r0(x.lo)}°</span><span class="tr"><i style="left:${l}%;width:${Math.min(100 - l, w)}%;background:${g}"></i>${today ? `<b style="left:${Math.max(0, Math.min(100, (tNow - lo) / sp * 100))}%"></b>` : ''}</span><span class="hi">${r0(x.hi)}°</span></div>`;
      }).join('') + `<div class="lg"><span><i style="background:${C.blue}"></i>Regen in mm</span>${anySnow ? `<span><i style="background:#fff"></i>Schnee in cm</span>` : ''}</div>`;
    }
    _bars(D, tNow) {
      const n = D.length, W = 340, Hh = 92, lo = Math.min(...D.map((x) => x.lo)), hi = Math.max(...D.map((x) => x.hi));
      const y = (v) => 6 + (hi - v) / Math.max(1, hi - lo) * (Hh - 12), cx = (i) => (i + 0.5) * W / n;
      const pMax = Math.max(2, ...D.map((x) => x.pr)), anySnow = D.some((x) => x.snow);
      const col = `grid-template-columns:repeat(${n},minmax(0,1fr))`;
      let s = `<div class="bc" style="${col}">${D.map((x) => `<div><div class="d${this._dayName(x) === 'Heute' ? ' n' : ''}">${this._dayName(x)}</div>${this._img(x.cond)}<div style="margin-top:2px">${r0(x.hi)}°</div></div>`).join('')}</div>`;
      s += `<svg class="bsvg" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" style="height:${Hh}px"><defs><linearGradient id="wkg" x1="0" y1="${y(hi)}" x2="0" y2="${y(lo)}" gradientUnits="userSpaceOnUse">${[0, 0.25, 0.5, 0.75, 1].map((k) => `<stop offset="${k}" stop-color="${tc(hi - (hi - lo) * k)}"/>`).join('')}</linearGradient></defs>`;
      D.forEach((x, i) => { s += `<rect x="${cx(i) - 3}" y="${y(x.hi)}" width="6" height="${Math.max(6, y(x.lo) - y(x.hi))}" rx="3" fill="url(#wkg)"/>`; });
      if (D.length && this._dayName(D[0]) === 'Heute') s += `<circle cx="${cx(0)}" cy="${y(Math.max(lo, Math.min(hi, tNow)))}" r="4" fill="#fff" stroke="var(--ha-card-background, var(--card-background-color, #1c1c1e))" stroke-width="1.5"/>`;
      s += `</svg><div class="bc" style="${col};border-top:.5px solid var(--divider-color, rgba(84,84,88,.45));padding-top:4px">${D.map((x) => {
        const h = x.pr > 0.04 ? Math.max(2, x.pr / pMax * 18) : 0, c = x.snow ? '#fff' : (x.pr >= 0.5 ? C.blue : 'rgba(10,132,255,.5)');
        return `<div><div class="d">${r0(x.lo)}°</div><div style="height:18px;display:flex;align-items:flex-end;justify-content:center;margin-top:4px"><span style="width:14px;height:${h}px;border-radius:3px 3px 1px 1px;background:${c}"></span></div><div class="pv${x.pr >= 0.5 ? ' wet' : ''}">${x.snow ? dc(Math.max(0.1, x.cm)) : dc(x.pr)}</div></div>`;
      }).join('')}</div><div class="lg"><span><i style="background:${C.blue}"></i>Regen in mm</span>${anySnow ? `<span><i style="background:#fff"></i>Schnee in cm</span>` : ''}</div>`;
      return s;
    }

    /* ---------- Effekte (Canvas) ---------- */
    _size() {
      const cv = this._cv; if (!cv) return;
      const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!r.width) return;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); this._dpr = dpr; this._W = r.width; this._H = r.height; this._seedFx = null;
    }
    _seed(kind) {
      const W = this._W, H = this._H, R = Math.random, P = [];
      const n = { rain: 70, storm: 80, snow: 55, night: 45, fog: 5, cloud: 0, sun: 0 }[kind] || 0;
      for (let i = 0; i < n; i++) P.push({ x: R() * W, y: R() * H, v: 0.6 + R() * 0.8, r: R(), ph: R() * 6.28 });
      const clouds = []; for (let i = 0; i < 3; i++) clouds.push({ x: R() * W, y: 14 + i * 16 + R() * 8, s: 0.7 + R() * 0.5, v: 4 + R() * 6 });
      this._P = P; this._cl = clouds; this._seedFx = kind; this._fl = 0; this._nextFl = performance.now() + 2500;
    }
    _loop() {
      if (this._raf || !this._on) return;
      let last = performance.now();
      const step = (now) => {
        this._raf = 0;
        if (!this._on || !this._vis || document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        try { this._draw(now, dt); } catch (e) { console.warn(TAG, e); }
        this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
      if (!this._visH) { this._visH = () => { if (!document.hidden) this._loop(); }; document.addEventListener('visibilitychange', this._visH); }
    }
    _cloud(g, x, y, s, a, col) {
      g.fillStyle = col || `rgba(174,174,178,${a})`;
      g.beginPath(); g.arc(x, y, 18 * s, 0, 7); g.arc(x + 20 * s, y - 8 * s, 22 * s, 0, 7); g.arc(x + 44 * s, y, 17 * s, 0, 7); g.rect(x, y, 44 * s, 14 * s); g.fill();
    }
    _draw(now, dt) {
      if (!this._W) this._size(); if (!this._W) return;
      const kind = this._fx || 'cloud'; if (this._seedFx !== kind) this._seed(kind);
      const g = this._g, W = this._W, H = this._H, t = now / 1000;
      g.setTransform(this._dpr, 0, 0, this._dpr, 0, 0); g.clearRect(0, 0, W, H);
      const sx = 56, sy = H * 0.42; // Mitte des Zustandssymbols
      if (kind === 'sun') {
        const el = this._sunEl, gold = el < 6 && el >= 3, red = el < 3;
        const rc = red ? '255,106,0' : gold ? '251,191,36' : '255,214,10';
        const gr = g.createRadialGradient(sx, sy, 6, sx, sy, 90); gr.addColorStop(0, `rgba(${rc},.28)`); gr.addColorStop(1, `rgba(${rc},0)`);
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.lineCap = 'round';
        for (let i = 0; i < 14; i++) {
          const a = i / 14 * 6.283 + t * 0.08, l = 58 + 10 * Math.sin(t * 1.3 + i * 1.7);
          g.strokeStyle = `rgba(${rc},${0.16 + 0.08 * Math.sin(t * 1.1 + i)})`; g.lineWidth = 2.5;
          g.beginPath(); g.moveTo(sx + Math.cos(a) * 36, sy + Math.sin(a) * 36); g.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l); g.stroke();
        }
      }
      if (kind === 'night') {
        const gr = g.createRadialGradient(sx, sy, 4, sx, sy, 70); gr.addColorStop(0, 'rgba(207,223,255,.16)'); gr.addColorStop(1, 'rgba(207,223,255,0)');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        this._P.forEach((p) => { const a = 0.25 + 0.6 * Math.abs(Math.sin(t * (0.4 + p.r * 0.8) + p.ph)); g.fillStyle = `rgba(207,223,255,${a})`; g.beginPath(); g.arc(p.x, p.y * 0.85, 0.5 + p.r * 1.1, 0, 7); g.fill(); });
        // Sternschnuppe ab und zu
        if (!this._met && Math.random() < dt * 0.05) this._met = { x: W * (0.3 + Math.random() * 0.6), y: 6 + Math.random() * 20, t: 0 };
        if (this._met) { const m = this._met; m.t += dt; const k = m.t / 0.7, x = m.x - k * 70, y = m.y + k * 30;
          const lg = g.createLinearGradient(x, y, x + 26, y - 11); lg.addColorStop(0, `rgba(255,255,255,${0.8 * (1 - k)})`); lg.addColorStop(1, 'rgba(255,255,255,0)');
          g.strokeStyle = lg; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 26, y - 11); g.stroke(); if (k >= 1) this._met = null; }
      }
      const cc = this._fxClouds;
      if (kind === 'cloud' || kind === 'rain' || kind === 'snow' || kind === 'storm' || cc > 30) {
        const dark = kind === 'storm' ? 'rgba(58,58,66,.62)' : kind === 'rain' ? 'rgba(99,99,102,.34)' : null;
        const a = kind === 'cloud' ? 0.16 : 0.12;
        this._cl.forEach((c) => { c.x += c.v * dt; if (c.x > W + 20) c.x = -90; this._cloud(g, c.x, c.y, c.s, a, dark); });
      }
      if (kind === 'fog') {
        for (let i = 0; i < 4; i++) { const y = 26 + i * 22, o = (t * (6 + i * 3)) % W;
          g.fillStyle = `rgba(199,199,204,${0.07 + i * 0.015})`; g.beginPath(); g.ellipse((o + i * 90) % (W + 200) - 100, y, 160, 10, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse((o + i * 90 + W / 2) % (W + 200) - 100, y + 6, 140, 9, 0, 0, 7); g.fill(); }
      }
      if (kind === 'rain' || kind === 'storm') {
        g.strokeStyle = 'rgba(129,212,250,.5)'; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath();
        this._P.forEach((p) => { g.moveTo(p.x, p.y); g.lineTo(p.x - 2.5, p.y + 9 * p.v); p.y += 320 * p.v * dt; p.x -= 60 * p.v * dt; if (p.y > H) { p.y = -12; p.x = Math.random() * (W + 30); } });
        g.stroke();
      }
      if (kind === 'snow') {
        g.fillStyle = 'rgba(255,255,255,.85)';
        this._P.forEach((p) => { g.beginPath(); g.arc(p.x + Math.sin(t * 1.2 + p.ph) * 6, p.y, 1 + p.r * 2, 0, 7); g.fill(); p.y += 22 * p.v * dt; if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; } });
      }
      if (kind === 'storm') {
        if (!this._fl && now > this._nextFl) { this._fl = 0.45; this._bolt = []; let x = W * (0.45 + Math.random() * 0.45), y = 0; this._bolt.push([x, y]); while (y < H * 0.9) { x += (Math.random() - 0.5) * 22; y += 10 + Math.random() * 12; this._bolt.push([x, y]); } this._nextFl = now + 3000 + Math.random() * 6000; }
        if (this._fl > 0) {
          const k = this._fl / 0.45, fl = k > 0.75 || (k > 0.35 && k < 0.5);
          if (fl) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,214,10,.9)'; g.lineWidth = 2; g.lineJoin = 'round'; g.beginPath(); this._bolt.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
          this._fl -= dt; if (this._fl <= 0) this._fl = 0;
        }
      }
    }
  }

  customElements.define(TAG, WetterKarteCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Wetter-Karte', description: 'Aktuelles Wetter mit Effekten, Warnungen (DWD/NINA) und Vorhersage' });
})();
