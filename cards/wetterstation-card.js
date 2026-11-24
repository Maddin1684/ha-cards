// wetterstation-card v1.6.2 (22.11.2026: Temperaturaenderung 1 h, Druck 3 h; v1.6.1: Tendenz-Icon buendig; v1.6: Tendenz-Bild als Kachel-Icon, Aenderung der letzten 3 h aus History, Max-Linie gestrichelt in Stufenbalken) – Wetterstation im Apple-Stil: Sektionen Himmel/Klima/Niederschlag/Blitze/Wind aufklappbar,
// Sonnenbogen mit ± min zu gestern (selbst berechnet aus hass.config), UV nur tagsueber, Balken mit Dreieck (aktuell) + gestrichelter Linie (max. heute),
// Animationen wie bisherige uix-Styles. Alle Entitaeten per Config ueberschreibbar (entities: {...}).
(() => {
  const TAG = 'wetterstation-card';
  if (customElements.get(TAG)) return;

  const C = { green: '#30d158', yellow: '#ffd60a', orange: '#ff9f0a', red: '#ff453a', purple: '#bf5af2', blue: '#0a84ff', white: '#f2f2f7', gray: '#8e8e93', gray2: '#636366', gray3: '#aeaeb2' };

  const DEF = {
    sun: 'sun.sun',
    uv: 'sensor.gw1100a_v2_2_5_uv_index', uv_text: 'sensor.uv_index_werte',
    moon: 'sensor.moon_api', moon_phase_text: 'sensor.mondphasen', moon_phase: 'sensor.moon_phase',
    iss: 'sensor.iss_nachster_uberflug', iss_warning: 'binary_sensor.international_space_station_iss_10_minute_pass_warning',
    aurora: 'sensor.polarlicht_wahrscheinlichkeit', aurora_camera: 'camera.aurora_mtwetter_de',
    temp_trend: 'sensor.temperaturtendenz', pressure_trend: 'sensor.luftdrucktendenz',
    temp_main: 'sensor.wohnen_wohnen_wohnen_aussen_temperature', pressure: 'sensor.gw1100a_v2_2_5_relative_pressure',
    temp: 'sensor.gw1100a_v2_2_5_outdoor_temperature', dewpoint: 'sensor.gw1100a_dewpoint_1', humidity: 'sensor.gw1100a_v2_2_5_humidity',
    rain_prob: 'sensor.regenwahrscheinlichkeit', rain_start: 'sensor.beginn_niederschlag', rain_hour: 'sensor.gw1100a_v2_2_5_hourly_rain_rate',
    pegel: 'sensor.elm_elmbach_pegelstand', pegel_trend: 'sensor.pegelstand_statistik',
    lightning: 'sensor.blitze', lightning_anim: 'input_boolean.blitze',
    lightning_last: 'sensor.gw1100a_v2_2_5_last_lightning_strike', lightning_dist: 'sensor.gw1100a_v2_2_5_lightning_strike_distance',
    wind_text: 'sensor.windstarke2', wind: 'sensor.gw1100a_v2_2_5_wind_speed', wind_max: 'input_number.wind_max_heute',
    gust: 'sensor.gw1100a_v2_2_5_wind_gust', gust_max: 'sensor.gw1100a_v2_2_5_max_daily_gust',
  };
  const POLLEN = [
    ['Ambrosia', 'sensor.pollenflug_ambrosia_91', 'fapro:ambrosia'], ['Beifuß', 'sensor.pollenflug_beifuss_91', 'fapro:beifuss'],
    ['Birke', 'sensor.pollenflug_birke_91', 'fapro:birke'], ['Erle', 'sensor.pollenflug_erle_91', 'fapro:erle'],
    ['Esche', 'sensor.pollenflug_esche_91', 'fapro:esche'], ['Gräser', 'sensor.pollenflug_graeser_91', 'fapro:gras'],
    ['Hasel', 'sensor.pollenflug_hasel_91', 'fapro:hasel'], ['Roggen', 'sensor.pollenflug_roggen_91', 'fapro:roggen'],
  ];
  const STUFEN = ['sehr gering', 'gering', 'mäßig', 'Vorwarnung', 'hoch', 'sehr hoch', 'extrem hoch'];
  const STUFEN_C = [C.gray, C.gray, C.gray3, C.yellow, C.green, C.purple, C.purple];
  const STUFEN_L = ['sehr<br>gering', 'gering', 'mäßig', 'Vor-<br>warnung', 'hoch', 'sehr<br>hoch', 'extrem'];

  const CSS = `
    :host { display:block; }
    ha-card { padding:10px 10px 2px; overflow:hidden; }
    .ttl { display:flex; justify-content:space-between; align-items:baseline; padding:0 4px 8px; }
    .ttl h2 { margin:0; font-size:20px; font-weight:700; letter-spacing:-.3px; color:var(--primary-text-color); }
    .ttl span { font-size:12px; color:var(--secondary-text-color); }
    .fold { border-top:1px solid rgba(128,128,128,.25); }
    .fh { display:flex; align-items:center; gap:8px; padding:9px 4px; cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; }
    .fh > ha-icon { --mdc-icon-size:18px; color:var(--secondary-text-color); transition:transform .25s; }
    .fold.closed .fh > ha-icon { transform:rotate(-90deg); }
    .fh .lbl { font-size:12px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:var(--secondary-text-color); }
    .fh .sum { margin-left:auto; font-size:13px; font-weight:400; color:var(--secondary-text-color); display:flex; gap:5px; align-items:baseline; }
    .fh .sum b { font-weight:600; }
    .fh .sum u { text-decoration:none; font-size:11px; font-weight:400; opacity:.8; }
    .fb { display:grid; grid-template-rows:1fr; transition:grid-template-rows .3s ease; }
    .fold.closed .fb { grid-template-rows:0fr; }
    .fi { overflow:hidden; min-height:0; }
    .fp { padding:0 0 8px; display:flex; flex-direction:column; gap:6px; }
    .tile { background:var(--wsc-tile, rgba(120,120,128,.16)); border-radius:12px; padding:7px 10px; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .g2 { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
    .th { display:flex; align-items:center; gap:5px; font-size:13px; font-weight:400; color:var(--secondary-text-color); margin-bottom:1px; }
    .th ha-icon { --mdc-icon-size:15px; display:inline-flex; }
    .big { font-size:17px; font-weight:600; line-height:1.25; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
    .big small, .mid small { font-size:12px; font-weight:400; color:var(--secondary-text-color); margin-left:2px; }
    .mid { font-size:15px; font-weight:600; line-height:1.3; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
    .mt { display:grid; grid-template-columns:auto auto; column-gap:8px; row-gap:1px; font-size:13px; color:var(--secondary-text-color); align-items:baseline; }
    .mt b { color:var(--primary-text-color); font-weight:600; font-size:13px; text-align:right; font-variant-numeric:tabular-nums; }
    .cap { font-size:12px; font-weight:400; color:var(--secondary-text-color); margin-top:1px; }
    .cap b { color:var(--primary-text-color); font-weight:500; }
    .mx2 { text-align:right; }
    .mx2 .cap { margin:0; }
    .mx2 .v { font-size:13px; font-weight:600; font-variant-numeric:tabular-nums; }
    .mx2 .v small { font-size:11px; font-weight:400; color:var(--secondary-text-color); margin-left:2px; }
    .row { display:flex; justify-content:space-between; align-items:center; gap:8px; }
    .pill { display:inline-flex; align-items:center; font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; white-space:nowrap; }
    .hint { font-size:12px; font-weight:400; color:var(--secondary-text-color); line-height:1.35; margin-top:6px; }
    .hint b { color:var(--primary-text-color); font-weight:500; }
    .lg { margin-top:8px; position:relative; }
    .tr { position:relative; height:4px; border-radius:2px; background:rgba(128,128,128,.3); }
    .seg { position:relative; height:4px; display:flex; gap:3px; }
    .seg > div { height:100%; border-radius:2px; opacity:.25; }
    .seg > div.on { opacity:1; }
    .tri { position:absolute; top:5px; width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-bottom:7px solid #fff;
      transform:translateX(-50%); filter:drop-shadow(0 0 1px #000) drop-shadow(0 0 1px #000); }
    .mx { position:absolute; }
    .seg > .tri { opacity:1; height:0; border-radius:0; }
    .seg > .mx { position:absolute; top:-7px; height:18px; flex:none; width:2px; opacity:1; border:none; border-radius:0; transform:translateX(-1px);
      background:repeating-linear-gradient(to bottom,#fff 0 3px,transparent 3px 6px); }
    .th img { width:22px; height:22px; object-fit:contain; margin:-5px -4px -5px -4px; }
    .sc { display:flex; justify-content:space-between; font-size:10px; font-weight:400; color:var(--secondary-text-color); opacity:.75; margin-top:12px; }
    .lgd { display:flex; gap:14px; font-size:11px; color:var(--secondary-text-color); margin-top:4px; align-items:center; }
    .lgd .t { display:inline-block; width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:6px solid #fff; margin-right:5px; }
    .lgd i { display:inline-block; width:2px; height:12px; background:repeating-linear-gradient(to bottom,#fff 0 3px,transparent 3px 5px); margin:0 5px -1px 3px; }
    .trend { display:inline-flex; align-items:center; gap:2px; }
    .trend ha-icon { --mdc-icon-size:20px; display:inline-flex; }
    .trend img { height:34px; width:34px; object-fit:contain; margin:-8px 4px -8px -4px; }
    .dbl { display:inline-flex; flex-direction:column; line-height:0; }
    .dbl ha-icon { margin:-7px 0; }
    .moon { width:34px; height:34px; border-radius:50%; flex:0 0 34px; object-fit:cover; }
    .steps { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; margin-top:8px; position:relative; }
    .steps div { height:4px; border-radius:2px; opacity:.25; }
    .steps div.on { opacity:1; }
    .stl { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; margin-top:12px !important; font-size:10px; color:var(--secondary-text-color); opacity:.8; text-align:center; margin-top:5px; line-height:1.15; }
    .stl span.on { color:var(--primary-text-color); font-weight:600; opacity:1; }
    .pol { display:flex; justify-content:space-between; margin-top:8px; }
    .pol div { display:flex; flex-direction:column; align-items:center; gap:1px; font-size:10px; width:12%; }
    .pol ha-icon { --mdc-icon-size:18px; }
    .pol b { font-size:13px; font-weight:600; }
    .pol span { color:var(--secondary-text-color); }
    .bl { position:relative; height:46px; margin:8px 4px 0 10px; }
    .bl .zn { position:absolute; top:22px; height:4px; border-radius:2px; }
    .bl .home { position:absolute; left:-14px; top:12px; --mdc-icon-size:22px; color:#fff; }
    .bl .bi { position:absolute; top:0; transform:translateX(-50%); --mdc-icon-size:22px; display:inline-flex; }
    .bl .lb { position:absolute; top:32px; left:0; right:0; font-size:9.5px; color:var(--secondary-text-color); }
    .bl .lb span { position:absolute; transform:translateX(-50%); white-space:nowrap; }
    svg text { font-family:inherit; }

    @keyframes sunny { 70% { transform:rotate(360deg) scale(1); } 80% { transform:scale(1); } 90% { transform:scale(1.15); } 100% { transform:scale(1); } }
    .a-sunny { animation:sunny 1s ease-in-out infinite alternate; }
    @keyframes sparkle { 0%,69%,74%,79%,85% { clip-path:inset(0 0 0 0); } 70% { clip-path:polygon(0 100%,0 76%,75% 0,100% 0,100% 100%); } 75% { clip-path:polygon(0 100%,0 0,39% 0,100% 62%,100% 100%); } 80% { clip-path:polygon(0 100%,0 0,100% 0,100% 26%,25% 100%); } }
    @keyframes kadabra { 0%,80%,100% { transform:rotate(-10deg); } 70% { transform:rotate(10deg); } 75% { transform:rotate(5deg); } 80% { transform:rotate(15deg); } }
    .a-sock { animation:sparkle 1.8s linear infinite, kadabra 1.8s ease-in-out infinite; transform-origin:10% 90%; }
    @keyframes gusty { 0%,100% { transform:scaleX(1.2); } 30% { transform:scaleX(.9); } 45% { transform:scaleX(1.1); } 75% { transform:scaleX(.8); } }
    .a-gust { animation:gusty 3s ease-in-out infinite; transform-origin:15% 50%; }
    @keyframes cloudy { 0%,100% { transform:translateX(3px); } 30% { transform:translateX(-1px); } 45% { transform:translateX(1.5px); } 75% { transform:translateX(-3.2px); } }
    @keyframes rain { 0%,50%,100% { clip-path:inset(0 0 0 0); } 25% { clip-path:polygon(0 0,100% 0,100% 83%,54% 83%,62% 47%,47% 46%,38% 83%,0 83%); } 75% { clip-path:polygon(100% 2%,94% 91%,69% 70%,73% 61%,73% 50%,35% 44%,27% 63%,2% 76%,0 4%); } }
    .a-rain { animation:cloudy 10s ease-in-out infinite, rain 1s infinite; }
    @keyframes lightning { 10%,15% { clip-path:polygon(100% 2%,94% 91%,63% 70%,67% 56%,65% 45%,50% 44%,34% 70%,2% 76%,0 4%); transform:scale(1.1); } 10.1%,15.1% { clip-path:inset(0 0 0 0); transform:scale(1); } }
    .a-bolt { animation:cloudy 6s ease-in-out infinite, lightning 1.5s infinite; }
    @keyframes arrowUp { 0% { transform:translateY(6px); opacity:0; } 50% { opacity:1; } 100% { transform:translateY(0); opacity:1; } }
    @keyframes arrowDown { 0% { transform:translateY(-6px); opacity:0; } 50% { opacity:1; } 100% { transform:translateY(0); opacity:1; } }
    .a-up { animation:arrowUp 1.2s ease-in-out infinite; }
    .a-down { animation:arrowDown 1.2s ease-in-out infinite; }
    @keyframes focus { 50% { filter:blur(10px); } }
    .a-f3 { animation:focus 3s linear infinite alternate; }
    .a-f2 { animation:focus 2s linear infinite alternate; }
    .a-f4 { animation:focus 4s linear infinite alternate; }
  `;

  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const num = (v, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const fmt = (v, d = 1) => num(v).toFixed(d).replace('.', ',');
  const hhmm = (dt) => String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
  const hm = (h) => { const t = Math.max(0, Math.round(h * 60)); return `${Math.floor(t / 60)} h ${t % 60} min`; };
  const dtxt = (d) => (d === 0 ? '±0 min' : (d > 0 ? '+' : '−') + Math.abs(d) + ' min');
  const ico = (icon, cls = '', col = '', extra = '') => `<ha-icon icon="${icon}"${cls ? ` class="${cls}"` : ''} style="${col ? `color:${col};` : ''}${extra}"></ha-icon>`;

  /* Sonnenauf-/untergang (Sunrise-Gleichung, Genauigkeit ~1 min) */
  function sunTimes(day, lat, lon) {
    const rad = Math.PI / 180;
    const noon = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);
    const jd = noon.getTime() / 86400000 + 2440587.5;
    const n = Math.ceil(jd - 2451545.0 + 0.0008);
    const js = n - lon / 360;
    const M = (357.5291 + 0.98560028 * js) % 360;
    const Cc = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    const L = (M + Cc + 180 + 102.9372) % 360;
    const jt = 2451545 + js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * L * rad);
    const sd = Math.sin(L * rad) * Math.sin(23.4397 * rad), cd = Math.cos(Math.asin(sd));
    const cw = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * sd) / (Math.cos(lat * rad) * cd);
    if (cw < -1 || cw > 1) return null;
    const w = Math.acos(cw) / rad;
    const toD = (j) => new Date((j - 2440587.5) * 86400000);
    return { rise: toD(jt - w / 360), set: toD(jt + w / 360) };
  }
  const minOfDay = (d) => d.getHours() * 60 + d.getMinutes();

  class WetterstationCard extends HTMLElement {
    setConfig(c) {
      this._c = c || {};
      this._e = Object.assign({}, DEF, this._c.entities || {});
      this._sig = '';
      try { this._open = JSON.parse(localStorage.getItem('wsc-open') || 'null') || {}; } catch (e) { this._open = {}; }
    }
    getCardSize() { return 12; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    connectedCallback() { this._iv = setInterval(() => { this._sig = ''; this._render(); }, 60000); }
    disconnectedCallback() { clearInterval(this._iv); }

    set hass(h) { this._hass = h; this._hist(); this._render(); }

    /* Aenderung der letzten 3 h (Temperatur, Luftdruck) aus der History, alle 10 min */
    async _hist() {
      if (!this._hass || this._histBusy || Date.now() - (this._histAt || 0) < 600000) return;
      this._histBusy = true; this._histAt = Date.now();
      const ids = [this._e.temp_main, this._e.pressure].filter(Boolean);
      try {
        const r = await this._hass.callWS({ type: 'history/history_during_period', start_time: new Date(Date.now() - 3 * 3600000).toISOString(),
          entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
        const d = {};
        ids.forEach((id) => {
          const rows = ((r && r[id]) || []).map((x) => [x.lu * 1000, parseFloat(x.s)]).filter((x) => !isNaN(x[1]));
          const cur = parseFloat(this._hass.states[id] && this._hass.states[id].state);
          const h = id === this._e.temp_main ? 1 : 3, cut = Date.now() - h * 3600000;
          let ref = null; rows.forEach(([t, v]) => { if (t <= cut || ref == null) ref = v; });
          if (ref != null && !isNaN(cur)) d[id] = { d: cur - ref, h };
        });
        this._d3 = d; this._sig = ''; this._render();
      } catch (e) { /* History nicht verfuegbar */ }
      this._histBusy = false;
    }

    _s(k) { const id = this._e[k]; return id ? this._hass.states[id] : undefined; }
    _v(k) { const s = this._s(k); return s ? s.state : ''; }
    _a(k, a) { const s = this._s(k); return s && s.attributes ? s.attributes[a] : undefined; }

    _render() {
      const H = this._hass; if (!H || !this._c) return;
      const ids = Object.values(this._e).filter(Boolean).concat(POLLEN.map((p) => p[1]));
      const sig = ids.map((id) => { const s = H.states[id]; return s ? s.state + '|' + (s.last_changed || '') : '-'; }).join(';') + '|' + new Date().getMinutes();
      if (sig === this._sig) return;
      this._sig = sig;
      try {
        const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
        if (!root.querySelector('ha-card')) {
          root.innerHTML = `<style>${CSS}</style><ha-card></ha-card>`;
          const card = root.querySelector('ha-card');
          if (this._c.transparent) [['background', 'none'], ['box-shadow', 'none'], ['border', 'none']].forEach(([k, v]) => card.style.setProperty(k, v, 'important'));
          card.addEventListener('click', (ev) => this._click(ev));
        }
        root.querySelector('ha-card').innerHTML = this._html();
      } catch (e) {
        console.error(TAG, e);
        const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
        root.innerHTML = `<ha-card style="padding:12px;color:#ff453a;font-size:13px">${TAG} Fehler: ${esc(e && e.message || e)}</ha-card>`;
      }
    }

    _click(ev) {
      const fh = ev.target.closest('.fh');
      if (fh) {
        const f = fh.parentElement; f.classList.toggle('closed');
        this._open[f.dataset.id] = f.classList.contains('closed') ? 'zu' : 'auf';
        try { localStorage.setItem('wsc-open', JSON.stringify(this._open)); } catch (e) {}
        return;
      }
      const t = ev.target.closest('[data-more],[data-aurora]');
      if (!t) return;
      if (t.dataset.aurora) {
        const cam = this._e.aurora_camera;
        if (cam && this._hass.services.browser_mod) this._hass.callService('browser_mod', 'more_info', { entity: cam, large: false, ignore_popup_card: false });
        else this._more(this._e.aurora);
        return;
      }
      this._more(t.dataset.more);
    }
    _more(id) { if (id) this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: id }, bubbles: true, composed: true })); }

    /* Balken: Dreieck = aktuell, gestrichelt = max. heute */
    _gauge({ min, max, zones, value, maxValue, scale }) {
      const span = max - min, pct = (v) => Math.max(0, Math.min(100, (v - min) / span * 100)), pos = (v) => Math.max(1.5, Math.min(98.5, pct(v)));
      let prev = min;
      const segs = zones.map((z, i) => {
        const w = (Math.min(z.to, max) - prev) / span * 100, on = i === 0 || value > prev; prev = z.to;
        return `<div class="${on ? 'on' : ''}" style="flex:0 0 calc(${w.toFixed(2)}% - 3px);background:${z.c}"></div>`;
      }).join('');
      return `<div class="lg"><div class="seg">${segs}
        ${maxValue != null ? `<div class="mx" style="left:${pct(maxValue)}%"></div>` : ''}<i class="tri" style="left:${pos(value)}%"></i></div>
        <div class="sc">${scale.map((s) => `<span>${s}</span>`).join('')}</div></div>`;
    }
    _trendTile(k, label, fallback, src, unit) {
      const t = this._v(k), pic = this._a(k, 'entity_picture');
      const col = /Fallend/i.test(t) ? C.blue : /Steigend/i.test(t) ? C.red : 'var(--primary-text-color)';
      const x = this._d3 && src ? this._d3[src] : undefined;
      const dTxt = !x ? '' : `<div class="cap"><b style="color:${col}">${x.d > 0 ? '+' : x.d < 0 ? '−' : '±'}${fmt(Math.abs(x.d))} ${unit}</b> in ${x.h} h</div>`;
      return `<div class="tile" data-more="${this._e[k]}"><div class="th">${pic ? `<img src="${esc(pic)}" alt="">` : ico(fallback)}${label}</div>
        <div class="mid" style="color:${col}">${esc(t)}</div>${dTxt}</div>`;
    }
    _trendPic(k) {
      const t = this._v(k), pic = this._a(k, 'entity_picture');
      if (!pic) return this._trend(t);
      const col = /Fallend/i.test(t) ? C.blue : /Steigend/i.test(t) ? C.red : 'var(--primary-text-color)';
      return `<span class="trend" style="color:${col}"><img src="${esc(pic)}" alt=""><span>${esc(t)}</span></span>`;
    }
    _trend(t, label) {
      const col = /Fallend/i.test(t) ? C.blue : /Steigend/i.test(t) ? C.red : 'var(--secondary-text-color)';
      const sym = /Steigend/i.test(t) ? '▲' : /Fallend/i.test(t) ? '▼' : '▶';
      const anim = /Steigend/i.test(t) ? 'a-up' : /Fallend/i.test(t) ? 'a-down' : '';
      return `<span class="trend" style="color:${col};gap:4px"><span class="${anim}" style="font-size:10px;display:inline-block">${sym}</span><span>${esc(label != null ? label : t)}</span></span>`;
    }
    _ring(pct, color, label, size = 44) {
      const r = 26, c = 2 * Math.PI * r;
      return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" style="flex:0 0 ${size}px"><circle cx="32" cy="32" r="${r}" fill="none" stroke="rgba(128,128,128,.3)" stroke-width="7"/>
        <circle cx="32" cy="32" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c * Math.max(0, Math.min(100, pct)) / 100} ${c}" transform="rotate(-90 32 32)"/>
        <text x="32" y="37" text-anchor="middle" fill="var(--primary-text-color)" font-size="15" font-weight="600">${esc(label)}</text></svg>`;
    }
    _fold(id, label, sum, body) {
      const closed = this._open[id] === 'zu';
      return `<div class="fold${closed ? ' closed' : ''}" data-id="${id}"><div class="fh">${ico('mdi:chevron-down')}<span class="lbl">${label}</span><span class="sum">${sum}</span></div>
        <div class="fb"><div class="fi"><div class="fp">${body}</div></div></div></div>`;
    }

    _sun() {
      const H = this._hass, now = new Date();
      const lat = H.config && H.config.latitude, lon = H.config && H.config.longitude;
      const today = sunTimes(now, lat, lon), yest = sunTimes(new Date(now.getTime() - 86400000), lat, lon);
      if (!today) return '';
      const sameDay = (iso) => { if (!iso) return null; const d = new Date(iso); return d.toDateString() === now.toDateString() ? d : null; };
      const rise = sameDay(this._a('sun', 'next_rising')) || today.rise;
      const set = sameDay(this._a('sun', 'next_setting')) || today.set;
      const rD = yest ? minOfDay(today.rise) - minOfDay(yest.rise) : 0;
      const sD = yest ? minOfDay(today.set) - minOfDay(yest.set) : 0;
      const lenH = (set - rise) / 3600000, lenD = sD - rD;
      const day = now >= rise && now <= set, t = day ? (now - rise) / (set - rise) : 0;
      let nextRise = this._a('sun', 'next_rising') ? new Date(this._a('sun', 'next_rising')) : rise;
      const untilRise = (nextRise - now) / 3600000;
      const W = 380, x0 = 40, x1 = W - 40, base = 60, h = 46;
      const pt = (u) => [x0 + (x1 - x0) * u, base - h * Math.sin(Math.PI * u)];
      const pth = (a, b) => { let s = ''; for (let i = 0; i <= 48; i++) { const [x, y] = pt(a + (b - a) * i / 48); s += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); } return s; };
      const [sx, sy] = pt(t);
      const dc = (v, good) => (v === 0 ? 'var(--secondary-text-color)' : ((v > 0) === good ? C.yellow : '#f56300'));
      const svg = `<svg viewBox="0 0 ${W} 108" width="100%" style="display:block">
        <defs><linearGradient id="wsg" x1="0" x2="1"><stop offset="0" stop-color="${C.orange}"/><stop offset="1" stop-color="${C.yellow}"/></linearGradient>
        <radialGradient id="wsglow"><stop offset="0" stop-color="${C.yellow}" stop-opacity=".5"/><stop offset="1" stop-color="${C.yellow}" stop-opacity="0"/></radialGradient></defs>
        <line x1="8" x2="${W - 8}" y1="${base}" y2="${base}" stroke="rgba(128,128,128,.4)"/>
        <path d="${pth(0, 1)}" fill="none" stroke="rgba(128,128,128,.45)" stroke-width="2" stroke-dasharray="3 5"/>
        ${day ? `<path d="${pth(0, t)}" fill="none" stroke="url(#wsg)" stroke-width="3" stroke-linecap="round"/><circle cx="${sx}" cy="${sy}" r="20" fill="url(#wsglow)"/><circle cx="${sx}" cy="${sy}" r="7" fill="${C.yellow}"/>`
          : `<text x="${W / 2}" y="${base - 22}" text-anchor="middle" fill="#f56300" font-size="13" font-weight="600">Aufgang in ${hm(untilRise)}</text>`}
        <text x="${x0}" y="${base + 19}" fill="var(--primary-text-color)" font-size="14" font-weight="600" text-anchor="middle">${hhmm(rise)}</text>
        <text x="${x0}" y="${base + 33}" fill="${dc(rD, false)}" font-size="10.5" font-weight="600" text-anchor="middle">${dtxt(rD)}</text>
        <text x="${x0}" y="${base + 45}" fill="var(--secondary-text-color)" font-size="9.5" text-anchor="middle">Aufgang</text>
        <text x="${x1}" y="${base + 19}" fill="var(--primary-text-color)" font-size="14" font-weight="600" text-anchor="middle">${hhmm(set)}</text>
        <text x="${x1}" y="${base + 33}" fill="${dc(sD, true)}" font-size="10.5" font-weight="600" text-anchor="middle">${dtxt(sD)}</text>
        <text x="${x1}" y="${base + 45}" fill="var(--secondary-text-color)" font-size="9.5" text-anchor="middle">Untergang</text>
        <text x="${W / 2}" y="${base + 22}" fill="var(--secondary-text-color)" font-size="11" text-anchor="middle">${day ? `noch ${hm((set - now) / 3600000)} Tageslicht` : ''}</text>
        <text x="${W / 2}" y="${base + 38}" fill="var(--secondary-text-color)" font-size="11" text-anchor="middle">Tag ${hm(lenH)} · <tspan fill="${dc(lenD, true)}" font-weight="600">${dtxt(lenD)}</tspan></text>
      </svg>`;
      return { html: `<div class="tile" data-more="${this._e.sun}" style="padding:6px 8px 4px">${svg}</div>`, set: hhmm(set), day };
    }

    _html() {
      const H = this._hass, E = this._e;
      const out = [];
      out.push(`<div class="ttl"><h2>${esc(this._c.title || 'Wetterstation')}</h2><span>${esc(this._c.subtitle || '')}</span></div>`);

      /* ---------- Himmel ---------- */
      const sun = this._sun();
      const uv = num(this._v('uv'));
      const uvC = uv <= 2 ? C.green : uv <= 5 ? C.yellow : uv <= 7 ? C.orange : uv <= 10 ? C.red : C.purple;
      const uvTxt = String(this._v('uv_text')).replace(/^[\d.,]+\s*/, '') || '';
      const below = this._v('sun') === 'below_horizon';
      const showUv = !below || uv > 0;
      const mPic = this._a('moon_phase_text', 'entity_picture');
      const full = this._v('moon_phase') === 'full_moon';
      const iss = this._v('iss');
      const issSoon = iss.startsWith('Heute') || iss.startsWith('ISS am Himmel') || iss.includes('Minute');
      const issNow = this._v('iss_warning') === 'on';
      let aState = this._v('aurora'); if (aState === 'hoch - sehr hoch') aState = 'sehr hoch';
      const aIdx = Math.max(0, STUFEN.indexOf(aState)), aC = STUFEN_C[aIdx];
      const aAnim = aState === 'Vorwarnung' ? 'a-f3' : aIdx >= 4 ? 'a-f2' : '';
      const kp = (a) => fmt(this._a('aurora', a));
      out.push(this._fold('himmel', 'Himmel', `${showUv ? `<b style="color:${uvC}">UV ${uv}</b> · ` : ''}${sun.set ? (sun.day ? '↓ ' + sun.set : 'Nacht') : ''}`, `
        ${sun.html || ''}
        ${showUv ? `<div class="tile" data-more="${E.uv}">
          <div class="row"><div class="th">${ico('mdi:sun-wireless', uv >= 8 ? 'a-sunny' : '', uvC)}UV-Index</div><span class="pill" style="background:${uvC}22;color:${uvC}">${esc(uvTxt)}</span></div>
          <div class="big" style="color:${uvC}">${uv}</div>
          ${this._gauge({ min: 0, max: 12, value: uv, zones: [{ to: 3, c: C.green }, { to: 6, c: C.yellow }, { to: 8, c: C.orange }, { to: 11, c: C.red }, { to: 12, c: C.purple }], scale: ['0', '3', '6', '8', '11+'] })}
        </div>` : ''}
        <div class="tile" data-more="${E.moon_phase_text}"><div class="row" style="justify-content:flex-start;gap:10px">
          ${mPic ? `<img class="moon" src="${esc(mPic)}" alt="">` : ico('mdi:moon-waning-crescent', '', '', '--mdc-icon-size:30px')}
          <div style="flex:1;min-width:0">
            <div class="mid" style="color:${full ? C.yellow : 'var(--primary-text-color)'}">${esc(this._v('moon_phase_text'))}</div></div>
          <div class="mt"><span>Aufgang</span><b>${esc(this._a('moon', 'moonrise') || '–')}</b><span>Untergang</span><b>${esc(this._a('moon', 'moonset') || '–')}</b></div></div></div>
        <div class="tile" data-more="${E.iss}">
          <div class="th">${ico('mdi:space-station', issNow ? 'a-f4' : '', issSoon ? C.yellow : '')}ISS Überflug</div>
          <div class="mid" style="color:${issSoon ? C.yellow : 'var(--primary-text-color)'}">${esc(iss)}</div></div>
        <div class="tile" data-aurora="1">
          <div class="row"><div class="th">${ico('mdi:creation', aAnim, aIdx >= 3 ? aC : '')}Chance Polarlichter</div>
            <span class="pill" style="background:${aC}22;color:${aIdx >= 3 ? aC : 'var(--primary-text-color)'}">${esc(aState)}</span></div>
          <div class="steps">${STUFEN.map((s, i) => `<div class="${i <= aIdx ? 'on' : ''}" style="background:${STUFEN_C[i]}"></div>`).join('')}
            <i class="tri" style="left:${(aIdx + 0.5) / 7 * 100}%"></i></div>
          <div class="stl">${STUFEN_L.map((s, i) => `<span class="${i === aIdx ? 'on' : ''}">${s}</span>`).join('')}</div>
          <div class="hint">Ab <b style="color:${C.green}">hoch</b> lohnt sich der Blick nach Norden. <b style="color:${C.yellow}">Vorwarnung</b> = in den nächsten 24 h wird „hoch“ erwartet.</div>
          <div class="hint" style="margin-top:4px">Kp jetzt <b>${kp('kp_aktuell')}</b> · in 3 h <b>${kp('kp_prognose_3h')}</b> · max. 24 h <b>${kp('kp_max_24h')}</b> · Ovation Elm <b>${num(this._a('aurora', 'ovation_elm_prozent'))} %</b></div>
        </div>`));

      /* ---------- Klima ---------- */
      const hum = num(this._v('humidity')), dew = num(this._v('dewpoint')), temp = num(this._v('temp'));
      const spread = Math.max(0, temp - dew);
      const spTxt = spread <= 1.5 ? (temp <= 0 ? 'Reif / Nebel bildet sich' : 'Nebel / Tau bildet sich') : spread <= 4 ? 'feuchte Luft' : 'trockene Luft';
      const spC = spread <= 1.5 ? C.blue : spread <= 4 ? 'var(--primary-text-color)' : C.gray;
      const pol = POLLEN.map(([n, id, icon]) => [n, id, icon, num(H.states[id] && H.states[id].state)]);
      const polMax = Math.max(...pol.map((p) => p[3]));
      const pc = (v) => (v <= 1 ? C.green : v < 3 ? C.yellow : C.red);
      out.push(this._fold('klima', 'Klima', `<b style="color:${hum >= 90 ? C.blue : 'var(--primary-text-color)'}">${hum}</b><u>%</u> · Taupunkt ${fmt(dew)} °C`, `
        <div class="g2">
          ${this._trendTile('temp_trend', 'Temperaturtendenz', 'mdi:thermometer', E.temp_main, '°C')}
          ${this._trendTile('pressure_trend', 'Luftdrucktendenz', 'mdi:gauge', E.pressure, 'hPa')}
        </div>
        <div class="tile" data-more="${E.humidity}">
          <div class="row"><div><div class="th">${ico('mdi:water-percent')}Luftfeuchte außen</div>
            <div class="big">${hum}<small>%</small></div><div class="cap">Taupunkt <b>${fmt(dew)} °C</b></div></div>
            ${this._ring(hum, hum >= 90 ? C.blue : hum <= 35 ? C.orange : C.white, hum + '%')}</div>
          <div class="cap" style="margin-top:10px;color:${spC};font-weight:600">${spTxt}</div>
          ${this._gauge({ min: 0, max: 10, value: Math.min(spread, 10), zones: [{ to: 1.5, c: C.blue }, { to: 4, c: C.gray3 }, { to: 10, c: C.gray2 }], scale: ['Nebel/Tau', 'feucht', 'trocken'] })}
          <div class="hint">${spread < 0.1 ? 'Temperatur hat den <b>Taupunkt erreicht</b> – die Luft ist gesättigt.' : `Die Luft ist nur <b>${fmt(spread)} °C</b> wärmer als der Taupunkt.`} Je kleiner der Abstand, desto feuchter: unter ~1,5 °C bilden sich Nebel, Tau${temp <= 0 ? ' bzw. bei Frost Reif' : ''}.</div>
        </div>
        <div class="tile" data-more="${POLLEN[0][1]}">
          <div class="row"><div class="th" style="margin:0">${ico('mdi:flower-pollen')}Pollen-Index</div>
            <span style="font-size:11px;font-weight:600;color:${pc(polMax)}">${polMax === 0 ? 'keine Belastung' : polMax < 3 ? 'mäßig' : 'stark'}</span></div>
          <div class="pol">${pol.map(([n, id, icon, v]) => `<div data-more="${id}" style="color:${pc(v)};opacity:${v === 0 ? 0.55 : 1}">${ico(icon)}<b>${fmt(v, v % 1 ? 1 : 0)}</b><span>${n.length > 6 ? n.slice(0, 5) + '.' : n}</span></div>`).join('')}</div>
        </div>`));

      /* ---------- Niederschlag ---------- */
      const prob = num(this._v('rain_prob'));
      const st = this._v('rain_start');
      const mm = st.match(/(Regen|Schnee)\s+in\s+(\d+)\s+Minute/i);
      const nowP = /regnet|schneit/i.test(st);
      const kind = mm ? mm[1] : (/schnee|schneit/i.test(st) ? 'Schnee' : 'Regen');
      const mins = mm ? +mm[2] : null;
      const pCol = kind === 'Schnee' ? C.white : C.blue;
      const at = mins != null ? hhmm(new Date(Date.now() + mins * 60000)) : '';
      const startPct = nowP ? 0 : mins != null ? Math.min(mins, 60) / 60 * 100 : 100;
      const head = nowP ? `<span style="color:${C.blue}">${esc(st)}</span>` : mins != null ? `<span style="color:${pCol}">${kind} ab ${at}</span>` : esc(st);
      const rh = num(this._v('rain_hour'));
      const peg = num(this._v('pegel')), pTr = num(this._v('pegel_trend'));
      const pegC = peg >= 70 ? C.red : peg >= 50 ? C.yellow : 'var(--primary-text-color)';
      const pegIcon = pTr > 0 ? 'mdi:waves-arrow-up' : pTr < 0 ? 'mdi:wave-arrow-down' : 'mdi:waves';
      const py = (v) => 82 - (Math.min(v, 100) / 100) * 82;
      const pegSvg = `<svg viewBox="0 0 64 92" width="52" style="flex:0 0 52px"><rect x="16" y="2" width="20" height="82" rx="6" fill="rgba(128,128,128,.3)"/>
        <clipPath id="wpc"><rect x="16" y="2" width="20" height="82" rx="6"/></clipPath>
        <rect clip-path="url(#wpc)" x="16" y="${2 + py(peg)}" width="20" height="${82 - py(peg)}" fill="${peg >= 70 ? C.red : peg >= 50 ? C.yellow : C.blue}"/>
        <line x1="12" x2="40" y1="${2 + py(70)}" y2="${2 + py(70)}" stroke="${C.red}" stroke-width="1.5" stroke-dasharray="3 2"/>
        <line x1="12" x2="40" y1="${2 + py(50)}" y2="${2 + py(50)}" stroke="${C.yellow}" stroke-width="1.5" stroke-dasharray="3 2"/>
        <text x="43" y="${5 + py(70)}" fill="${C.red}" font-size="8">70</text><text x="43" y="${5 + py(50)}" fill="${C.yellow}" font-size="8">50</text></svg>`;
      out.push(this._fold('niederschlag', 'Niederschlag', `<b style="color:${prob >= 50 || nowP ? C.blue : 'var(--primary-text-color)'}">${prob}</b><u>%</u> · ${mins != null ? kind + ' ab ' + at : 'Pegel ' + Math.round(peg) + ' cm'}`, `
        <div class="tile" data-more="${E.rain_start}">
          <div class="row"><div style="min-width:0"><div class="th">${ico('mdi:weather-rainy', nowP || (mins != null && mins <= 5) ? 'a-rain' : '', nowP || mins != null ? C.blue : '')}Niederschlag</div>
            <div class="mid">${head}</div>
            <div class="cap">${nowP ? 'aktuell' : mins != null ? `in ${mins} min` : 'nächste 60 min trocken'} · Wahrscheinlichkeit <b>${prob} %</b></div></div>
            ${this._ring(prob, C.blue, prob + '%', 42)}</div>
          <div class="lg"><div class="tr">
            <div style="position:absolute;left:${startPct}%;right:0;top:0;bottom:0;border-radius:2px;background:${pCol};opacity:${startPct >= 100 ? 0 : 1}"></div>
            <i class="tri" style="left:${Math.max(1.5, Math.min(98.5, startPct))}%"></i></div>
            <div class="sc"><span>jetzt</span><span>+15</span><span>+30</span><span>+45</span><span>+60 min</span></div></div>
        </div>
        <div class="g2">
          <div class="tile" data-more="${E.rain_hour}"><div class="th">${ico('mdi:weather-pouring', rh >= 7 ? 'a-rain' : '', rh >= 7 ? C.blue : '')}Regen letzte Std.</div>
            <div class="big" style="color:${rh >= 7 ? C.blue : 'var(--primary-text-color)'}">${fmt(rh)}<small>mm</small></div>
            ${this._gauge({ min: 0, max: 25, value: rh, zones: [{ to: 7, c: C.gray3 }, { to: 25, c: C.blue }], scale: ['0', '7', '25'] })}</div>
          <div class="tile row" data-more="${E.pegel}">
            <div><div class="th">${ico(pegIcon, pTr > 0 ? 'a-up' : pTr < 0 ? 'a-down' : '', peg >= 50 ? pegC : '')}Pegel Elmbach</div>
              <div class="big" style="color:${pegC}">${Math.round(peg)}<small>cm</small></div>
              <div class="cap">${this._trend(pTr > 0 ? 'Steigend' : pTr < 0 ? 'Fallend' : 'Konstant', pTr > 0 ? 'steigt' : pTr < 0 ? 'fällt' : 'gleich')}</div></div>
            ${pegSvg}</div>
        </div>`));

      /* ---------- Blitze ---------- */
      const cnt = num(this._v('lightning'));
      const act = cnt >= 1, anim = this._v('lightning_anim') === 'on';
      const dist = num(this._v('lightning_dist'));
      const zone = dist < 10 ? ['Gefahrenzone', C.red] : dist < 20 ? ['nah', C.orange] : dist < 30 ? ['mittel', C.yellow] : ['fern', C.gray];
      const lastIso = this._v('lightning_last');
      let lastTxt = '–';
      if (lastIso && !isNaN(Date.parse(lastIso))) {
        const d = new Date(lastIso), m = Math.round((Date.now() - d) / 60000);
        lastTxt = m < 60 ? (m < 1 ? 'gerade' : `vor ${m} min`) : `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}. ${hhmm(d)}`;
      }
      const bx = Math.min(dist, 40) / 40 * 100;
      const zn = (l, w, c, a) => `<div class="zn" style="left:${l}%;width:${w}%;background:${c};opacity:${a}"></div>`;
      out.push(this._fold('blitze', 'Blitze', act ? `<b style="color:${C.yellow}">${cnt}</b><u>Blitze</u> · ${dist} km` : 'keine', `
        <div class="tile" data-more="${E.lightning}">
          <div class="row"><div class="th">${ico('mdi:weather-lightning', anim ? 'a-bolt' : '', act ? C.blue : '')}Blitze</div>
            ${act ? `<span class="pill" style="background:${C.yellow}22;color:${C.yellow}">${cnt}</span>` : ''}</div>
          <div class="mid" style="color:${act ? C.yellow : 'var(--primary-text-color)'}">${esc(this._a('lightning', 'sprechender_status') || this._v('lightning'))}</div>
          <div class="bl">
            ${zn(0, 24.5, C.red, act && dist < 10 ? 1 : 0.25)}${zn(25, 24.5, C.orange, act && dist >= 10 && dist < 20 ? 1 : 0.25)}${zn(50, 24.5, C.yellow, act && dist >= 20 && dist < 30 ? 1 : 0.25)}${zn(75, 25, C.gray, act && dist >= 30 ? 1 : 0.25)}
            ${ico('mdi:home', 'home')}
            ${ico('mdi:flash', 'bi' + (act ? ' a-bolt' : ''), act ? zone[1] : C.gray, `left:${bx}%`)}
            <div class="lb"><span style="left:25%">10 km</span><span style="left:50%">20 km</span><span style="left:75%">30 km</span><span style="right:0;transform:none">40 km</span></div>
          </div>
        </div>
        <div class="g2">
          <div class="tile" data-more="${E.lightning_dist}"><div class="th">${ico('mdi:signal-distance-variant')}Entfernung</div>
            <div class="big" style="color:${act ? zone[1] : 'var(--primary-text-color)'}">${dist}<small>km</small></div><div class="cap">${act ? zone[0] : 'letzter Blitz'}</div></div>
          <div class="tile" data-more="${E.lightning_last}"><div class="th">${ico('mdi:flash')}Letzter Blitz</div><div class="mid">${lastTxt}</div></div>
        </div>`));

      /* ---------- Wind ---------- */
      const ws = num(this._v('wind')), wmax = E.wind_max ? num(this._v('wind_max')) : null;
      const g = num(this._v('gust')), gm = num(this._v('gust_max'));
      const wC = ws <= 28 ? C.green : ws <= 61 ? C.yellow : ws <= 117 ? C.red : C.purple;
      const gC = (v) => (v <= 59 ? C.green : v <= 99 ? C.yellow : C.red);
      const lc = (k) => { const s = this._s(k); return s && s.last_changed ? new Date(s.last_changed) : null; };
      const gAge = lc('gust'), gmAge = lc('gust_max'), wmAge = E.wind_max ? lc('wind_max') : null;
      const rel = (d) => { if (!d) return ''; const m = Math.round((Date.now() - d) / 60000); return m < 1 ? 'gerade' : m < 60 ? `vor ${m} min` : `vor ${Math.round(m / 60)} h`; };
      const wtxt = this._v('wind_text');
      const wmC = wmax == null ? '' : wmax <= 28 ? C.green : wmax <= 61 ? C.yellow : wmax <= 117 ? C.red : C.purple;
      const mxb = (lbl, v, col, age, ent) => `<div class="mx2" data-more="${ent}"><div class="cap">${lbl}</div><div class="v" style="color:${col}">${fmt(v)}<small>km/h${age ? ' · ' + hhmm(age) : ''}</small></div></div>`;
      out.push(this._fold('wind', 'Wind', `<b style="color:${wC}">${fmt(ws)}</b><u>km/h</u> · Böe <b style="color:${gC(g)}">${fmt(g)}</b><u>km/h</u>`, `
        <div class="tile" data-more="${E.wind}">
          <div class="row"><div class="th">${ico('mdi:windsock', ws >= 50 ? 'a-sock' : '', ws > 28 ? wC : '')}Windstärke</div>
            <span class="pill" style="background:${wC}22;color:${wC}">${esc(wtxt)}</span></div>
          <div class="row"><div class="big" style="color:${wC}">${fmt(ws)}<small>km/h</small></div>
            ${wmax != null ? mxb('Max. heute', wmax, wmC, wmAge, E.wind_max) : ''}</div>
          ${this._gauge({ min: 0, max: 130, value: ws, maxValue: wmax, zones: [{ to: 28, c: C.green }, { to: 61, c: C.yellow }, { to: 117, c: C.red }, { to: 130, c: C.purple }], scale: ['0', '28', '61', '117', ''] })}
        </div>
        <div class="tile" data-more="${E.gust}">
          <div class="row"><div class="th">${ico('mdi:weather-dust', g >= 60 || gm >= 100 ? 'a-gust' : '', g > 59 ? gC(g) : '')}Windböe</div><div class="cap" style="margin:0">${rel(gAge)}</div></div>
          <div class="row"><div class="big" style="color:${gC(g)}">${fmt(g)}<small>km/h</small></div>
            ${mxb('Max. heute', gm, gC(gm), gmAge, E.gust_max)}</div>
          ${this._gauge({ min: 0, max: 130, value: g, maxValue: gm, zones: [{ to: 60, c: C.green }, { to: 100, c: C.yellow }, { to: 130, c: C.red }], scale: ['0', '60', '100', ''] })}
          <div class="lgd"><span><span class="t"></span>aktuell</span><span><i></i>max. heute</span></div>
        </div>`));
      return out.join('');
    }
  }

  customElements.define(TAG, WetterstationCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Wetterstation Card', description: 'Wetterstation Elm im Apple-Stil mit Sonnenbogen, Balken und Animationen' });
})();
