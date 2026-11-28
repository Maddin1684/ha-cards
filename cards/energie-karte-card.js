// energie-karte-card v1.5 (28.11.2026: Icons wie Energiefluss-Karte (mdi), Kachel-Hintergrund wie andere Karten (Apple-Grau .12); v1.4: Batterie-Balken in Kachelfarbe (gruen laedt, lila entlaedt, grau Ruhe), Kacheln noch transparenter; v1.3: Ladestandsbalken einfarbig nach Stand (rot < 20, gelb < 40, gruen) mit Verlauf schwach zu kraeftig; v1.2: Wasser-Balken im Blau der Kachel, Kacheln noch transparenter; v1.1: drehende Sonne weiter links oben, Tagesdaten-Pille standardmaessig aus, Ladestandsbalken als Verlauf rot-gelb-gruen, Kacheln transparenter; v1.0: erste Version – Live-Energiefluss als Kacheln mit atmenden Linien und weichem Lichtschweif (Farben und Glow-Regeln wie Energiefluss-Karte),
// Solar aufgeteilt in Dachgaube/Gartenhaus, Haus-Herkunft jetzt, Batterie- und Enyaq-Ladestand als Balken, Wasser fliesst zum Haus; einklappbare Diagramme Strom und Wasser
// (Tag/Woche/Monat aus der Langzeitstatistik); Simulations-Schalter zum Testen; grafischer Editor fuer alle Entitaeten)
(() => {
  const TAG = 'energie-karte-card';
  if (customElements.get(TAG)) return;

  const C = { red: '#ff453a', green: '#30d158', solar: '#fbbf24', solar2: '#ffe08a', lila: '#bf5af2', blue: '#0a84ff', cyan: 'rgb(64,200,224)', orange: '#f56300', yellow: '#ffd60a', t2: 'rgba(235,235,245,.6)' };
  const DEF = {
    title: 'Energie', link: '', link_label: 'Tagesdaten', simulation: false, charts: true, strom_eingeklappt: false, wasser_eingeklappt: false,
    solar_power: 'sensor.balkonkraftwerk_summe', solar_dachgaube: 'sensor.smart_plug_2212096903668551080548e1e9b26bfc_power', solar_gartenhaus: 'sensor.solarbank_2_e1600_pro_solarleistung', solar_day: 'sensor.solar_kwh_helfer',
    grid_power: 'sensor.stromverbrauch', grid_day: 'sensor.tagesverbrauch_strom', home_day: 'sensor.tagesgesamt',
    battery_power: 'sensor.solarbank_2_e1600_pro_akkuleistung', battery_soc: 'sensor.solarbank_2_e1600_pro_ladestand', battery_invert: false,
    water_flow: 'sensor.flowiq_2200_flow', water_day: 'sensor.tagesverbrauch_wasser_berechnet',
    car_power: 'sensor.wallbox_modbus_ladeleistung', car_day: 'sensor.wallbox_tagesverbrauch', car_soc: 'sensor.enyaq_batterieladezustand', car_grid_power: 'sensor.enyaq_netzladeleistung',
    stat_grid: 'sensor.bezug_stromnetz', stat_solar: ['sensor.smart_plug_2212096903668551080548e1e9b26bfc_energy', 'sensor.system_alt_ertrag_gesamt'],
    stat_charge: 'sensor.aufladeleistung_integral', stat_discharge: 'sensor.entladeleistung_integral', stat_water: 'sensor.watermeter_value',
  };
  // Testszenarien (W, L/min, Tageswerte)
  const SIM = {
    mittag: { n: 'Mittag', solar: 1950, sg: 1170, grid: -420, bat: 900, soc: 64, water: 0, wall: 0, car: 83, gday: 4.1, hday: 9.5, sday: 6.8, wday: 180, wallday: 0 },
    akku: { n: 'Akku entlädt', solar: 0, sg: 0, grid: 120, bat: -850, soc: 72, water: 0, wall: 0, car: 83, gday: 9.9, hday: 14.6, sday: 5.2, wday: 310, wallday: 0 },
    enyaq: { n: 'Enyaq lädt', solar: 200, sg: 140, grid: 11250, bat: 0, soc: 12, water: 0, wall: 11000, wallNetz: 10600, car: 46, gday: 28.7, hday: 29.7, sday: 1.2, wday: 240, wallday: 18.4 },
    wasser: { n: 'Wasser läuft', solar: 350, sg: 230, grid: 600, bat: 0, soc: 30, water: 14, wall: 0, car: 83, gday: 12.2, hday: 14.0, sday: 1.9, wday: 395, wallday: 0 },
    voll: { n: 'Alles an', solar: 2100, sg: 1300, grid: 2400, bat: -900, soc: 18, water: 12, wall: 3600, wallNetz: 2000, car: 61, gday: 15.3, hday: 22.8, sday: 7.4, wday: 260, wallday: 6.2 },
  };
  const ICON = {
    solar: 'M4 3h16l2 10H2L4 3zm1.6 2-.9 6h4.6l.4-6H5.6zm5.9 0-.3 6h1.6l-.3-6h-1zm3 0 .4 6h4.6l-.9-6h-4.1zM11 15h2v4h3v2H8v-2h3v-4z',
    grid: 'M8.28 5.45 6.5 4.55 7.76 2h8.48l1.26 2.55-1.78.9L15 4H9zM18.62 8h-4.53l-.79-3h-2.6l-.79 3H5.38L4.1 10.55l1.79.89.4-.79h11.42l.4.79 1.79-.89zM17 22h-2l-3-11h-.01-.01L9 22H7l3.73-13.73h2.54z',
    home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
    bat: 'M16 4h-1V2H9v2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
    water: 'M12 20a6 6 0 0 1-6-6c0-4 6-10.75 6-10.75S18 10 18 14a6 6 0 0 1-6 6z',
    car: 'M18.92 6.01A1.5 1.5 0 0 0 17.5 5h-11a1.5 1.5 0 0 0-1.42 1.01L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8l-2.08-5.99zM6.5 16A1.5 1.5 0 1 1 8 14.5 1.5 1.5 0 0 1 6.5 16zm11 0a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
    ev: 'M5 3h8a2 2 0 0 1 2 2v7h1a2 2 0 0 1 2 2v3a1 1 0 0 0 2 0v-7.5L18.5 8 20 6.5l2 2v8.5a3 3 0 0 1-6 0v-3h-1v7H3V5a2 2 0 0 1 2-2zm0 2v5h8V5H5zm3 6-2 4h2v3l2-4H8v-3z',
    chart: 'M3 13h2v7H3zm4-4h2v11H7zm4-6h2v17h-2zm4 9h2v8h-2zm4-4h2v12h-2z',
    bolt: 'M11 15H6l7-14v8h5l-7 14v-8z',
    chev: 'M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z',
  };
  const num = (v, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const dc = (v, d = 1) => Number(v).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtW = (w) => Math.abs(w) >= 1000 ? dc(Math.abs(w) / 1000, 1) + ' kW' : Math.round(Math.abs(w)) + ' W';
  const ic = (k, col) => `<svg viewBox="0 0 24 24" fill="${col}"><path d="${ICON[k]}"/></svg>`;
  const socCol = (p) => p < 20 ? C.red : p < 40 ? C.yellow : C.green;
  const sum = (a) => a.reduce((m, x) => m + x, 0);
  const niceMax = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v || 1))); for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (v <= m * p) return m * p; return 10 * p; };
  const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const MON = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  // Verteilung wie Energiefluss-Karte: Solar zuerst ins Netz/Akku, Rest ins Haus
  function split(s) {
    const gIn = Math.max(0, s.grid), gOut = Math.max(0, -s.grid), bCh = Math.max(0, s.bat), bDis = Math.max(0, -s.bat);
    const sToGrid = Math.min(s.solar, gOut), sToBat = Math.min(s.solar - sToGrid, bCh), sToHome = Math.max(0, s.solar - sToGrid - sToBat);
    const gToBat = Math.max(0, bCh - sToBat), gToHome = Math.max(0, gIn - gToBat), bToHome = bDis;
    return { sToGrid, sToBat, sToHome, gToBat, gToHome, bToHome, home: sToHome + gToHome + bToHome };
  }
  // Glow-Regeln wie bisher (uix-Styles der Energiefluss-Karte)
  const glowOf = (s) => ({ solar: s.solar >= 1800 ? C.solar : '', grid: s.grid >= 2000 ? C.red : s.grid <= -300 ? C.green : '', bat: s.bat >= 1500 ? C.green : s.bat <= -800 ? C.lila : '',
    water: s.water >= 10 ? C.blue : '', car: s.wall >= 10000 && (s.wallNetz || 0) >= s.wall * 0.95 ? C.cyan : '', home: '' });

  // Geometrie der Flaeche (400 x 350, wird auf Kartenbreite gezoomt)
  const VW = 400, VH = 350, TW = 104, TH = 94;
  const T = { solar: [200, 46, 200], grid: [62, 180], home: [200, 180], bat: [338, 180], water: [62, 302], car: [338, 302] };
  const FLOWS = [
    ['M200,93 L200,133', 'sToHome', C.solar], ['M100,46 C72,46 62,80 62,133', 'sToGrid', C.green], ['M300,46 C328,46 338,80 338,133', 'sToBat', C.solar],
    ['M114,180 L148,180', 'gToHome', C.red], ['M62,227 C62,250 140,246 200,246 C260,246 338,250 338,227', 'gToBat', C.red], ['M286,180 L252,180', 'bToHome', C.lila],
    ['M114,302 C166,302 182,276 182,227', 'water', C.blue], ['M218,227 C218,276 234,302 286,302', 'wall', C.cyan]];
  // Dauer je Leistung (0,75 – 6 s wie bisher, log), in Stufen damit die Animation nicht bei jeder kleinen Aenderung neu startet
  const durOf = (w) => { const k = Math.min(1, Math.log10(1 + w) / Math.log10(20001)); return Math.round((3.2 - 2.4 * k) * 5) / 5; };

  const CSS = `
    :host { display:block; }
    ha-card { padding:4px 16px 10px; overflow:hidden; }
    .hd { display:flex; align-items:center; gap:8px; padding:12px 0 2px; }
    .ttl { flex:1; font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; color:var(--ha-card-header-color, var(--primary-text-color)); }
    .pl { display:inline-flex; align-items:center; gap:6px; height:30px; padding:0 12px 0 10px; border-radius:15px; background:rgba(118,118,128,.24); font-size:13px; white-space:nowrap; cursor:pointer; color:var(--primary-text-color); }
    .pl svg { width:16px; height:16px; }
    .sim { display:flex; flex-wrap:wrap; gap:6px; margin:2px 0 6px; }
    .sim span { font-size:12px; padding:4px 10px; border-radius:14px; background:rgba(118,118,128,.24); cursor:pointer; user-select:none; }
    .sim span.on { background:${C.orange}; color:#fff; }
    .fw { position:relative; width:100%; }
    .tflow { position:relative; width:${VW}px; height:${VH}px; margin:2px 0 4px; transform-origin:0 0; }
    .tln { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
    @keyframes comet { from { stroke-dashoffset:100; } to { stroke-dashoffset:0; } }
    @keyframes breath { 0%,100% { stroke-opacity:.4; } 50% { stroke-opacity:.65; } }
    .tk { position:absolute; border-radius:16px; padding:9px 10px 8px; overflow:hidden; background:rgba(118,118,128,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);
      display:flex; flex-direction:column; transition:background .4s, box-shadow .4s; cursor:pointer; box-sizing:border-box; color:#fff; }
    .tk.on { background:linear-gradient(155deg, color-mix(in srgb, var(--c) 22%, rgba(118,118,128,.12)) 0%, rgba(118,118,128,.12) 65%); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--c) 40%, transparent); }
    .tk.hs { background:linear-gradient(155deg, rgba(255,255,255,.14), rgba(118,118,128,.12) 65%); box-shadow:inset 0 0 0 1px rgba(255,255,255,.18); }
    .tk.gl { animation:tglow 1.6s ease-in-out infinite; }
    @keyframes tglow { 0%,100% { box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--gc) 50%, transparent), 0 0 0 transparent; } 50% { box-shadow:inset 0 0 0 1px var(--gc), 0 0 22px color-mix(in srgb, var(--gc) 55%, transparent); } }
    .tk .th { position:relative; z-index:1; display:flex; align-items:center; gap:6px; font-size:11px; color:rgba(235,235,245,.6); }
    .tk .th ha-icon { --mdc-icon-size:18px; width:18px; height:18px; display:inline-flex; transition:color .4s; }
    .tk .tv { position:relative; z-index:1; font-size:18px; font-weight:600; letter-spacing:-.01em; line-height:22px; margin-top:auto; font-variant-numeric:tabular-nums; white-space:nowrap; transition:color .4s; }
    .tk .td { position:relative; z-index:1; font-size:10.5px; line-height:13px; color:rgba(235,235,245,.6); white-space:nowrap; font-variant-numeric:tabular-nums; margin-top:1px; overflow:hidden; text-overflow:ellipsis; }
    .tk.bt .td, .tk.cr .td { margin-bottom:5px; }
    .tk .jr { position:relative; z-index:1; display:flex; align-items:center; gap:6px; margin:3px 0 2px; font-size:10px; line-height:12px; color:rgba(235,235,245,.6); }
    .tk .mx { flex:1; display:flex; height:4px; gap:2px; border-radius:2px; overflow:hidden; background:rgba(118,118,128,.3); }
    .tk .mx i { display:block; height:100%; border-radius:2px; transition:flex-grow .6s; }
    .tk .sp { position:absolute; right:10px; top:9px; bottom:8px; width:100px; z-index:1; display:flex; flex-direction:column; justify-content:center; gap:5px; }
    .tk .spr { display:flex; justify-content:space-between; gap:4px; font-size:9.5px; line-height:12px; color:rgba(235,235,245,.6); white-space:nowrap; }
    .tk .spr b { font-weight:600; color:${C.solar}; font-variant-numeric:tabular-nums; } .tk .spr b.z { color:rgba(235,235,245,.6); }
    .tk .dot { display:inline-block; width:6px; height:6px; border-radius:50%; margin-right:4px; vertical-align:1px; }
    .tk .spb { display:flex; gap:2px; height:4px; border-radius:2px; background:rgba(118,118,128,.3); overflow:hidden; } .tk .spb i { display:block; height:100%; border-radius:2px; transition:flex-grow .6s; }
    .tk .fill { position:absolute; left:0; right:0; bottom:0; background:color-mix(in srgb, var(--fc) 22%, transparent); transition:height .8s, background .4s; }
    .tk .fill .wave { position:absolute; left:0; top:-6px; width:200%; height:7px; fill:color-mix(in srgb, var(--fc) 22%, transparent); animation:wave 3s linear infinite; }
    @keyframes wave { from { transform:translateX(0); } to { transform:translateX(-50%); } }
    .tk .soc2 { position:absolute; left:10px; right:10px; bottom:5px; height:3px; border-radius:2px; background:rgba(118,118,128,.3); overflow:hidden; z-index:1; }
    .tk .soc2 i { display:block; height:100%; border-radius:2px; transition:width .8s, background .4s; background:linear-gradient(90deg, color-mix(in srgb, var(--sc) 35%, transparent), var(--sc)); }
    .tk .soc2 i { position:relative; overflow:hidden; }
    .tk .soc2 i.chg::after { content:''; position:absolute; inset:0; background:repeating-linear-gradient(90deg, rgba(255,255,255,.35) 0 6px, transparent 6px 12px); background-size:24px 100%; animation:stripes .8s linear infinite; }
    @keyframes stripes { from { background-position:0 0; } to { background-position:24px 0; } }
    .tk .rays { position:absolute; left:-34px; top:-56px; width:110px; height:110px; border-radius:50%; background:repeating-conic-gradient(rgba(251,191,36,.18) 0deg 6deg, transparent 6deg 20deg);
      -webkit-mask:radial-gradient(circle, transparent 18%, #000 30%, transparent 70%); mask:radial-gradient(circle, transparent 18%, #000 30%, transparent 70%); animation:rot 18s linear infinite; transition:opacity .6s; }
    @keyframes rot { to { transform:rotate(360deg); } }
    .tk .rip { position:absolute; left:0; right:0; bottom:0; height:18px; overflow:hidden; transition:opacity .6s; }
    .tk .rip svg { position:absolute; left:0; bottom:0; width:200%; height:100%; fill:rgba(10,132,255,.25); animation:wave 1.4s linear infinite; }
    .off { opacity:0; }
    /* Einklappbare Bereiche */
    .fh { display:flex; align-items:center; gap:14px; height:44px; cursor:pointer; user-select:none; border-bottom:.5px solid rgba(128,128,128,.3); margin:6px 0 6px; }
    .fh .ft { flex:0 0 28px; width:28px; height:28px; border-radius:7px; background:rgba(118,118,128,.28); display:flex; align-items:center; justify-content:center; }
    .fh .ft svg { width:18px; height:18px; }
    .fh .lbl { flex:1; font-weight:500; font-size:14px; text-transform:uppercase; letter-spacing:.04em; }
    .fh .fx { font-size:12px; color:var(--secondary-text-color); display:flex; align-items:center; gap:4px; font-variant-numeric:tabular-nums; }
    .fh .fx b { color:var(--primary-text-color); font-weight:400; }
    .fh .fx svg { width:18px; height:18px; transition:transform .3s; transform:rotate(180deg); }
    .fold.closed .fh .fx svg { transform:none; }
    .fb { display:grid; grid-template-rows:1fr; transition:grid-template-rows .3s ease; }
    .fold.closed .fb { grid-template-rows:0fr; }
    .fi { overflow:hidden; min-height:0; }
    .ah { display:flex; align-items:flex-end; justify-content:space-between; margin:2px 0 6px; }
    .ah small { display:block; font-size:11px; font-weight:500; letter-spacing:.04em; text-transform:uppercase; color:var(--secondary-text-color); }
    .ah .big { font-size:26px; font-weight:600; letter-spacing:-.01em; line-height:30px; font-variant-numeric:tabular-nums; }
    .ah .big span { font-size:14px; font-weight:500; color:var(--secondary-text-color); margin-left:3px; }
    .ah .when { font-size:12px; color:var(--secondary-text-color); text-align:right; }
    .seg { display:flex; background:rgba(118,118,128,.2); border-radius:8px; padding:2px; margin-bottom:8px; }
    .seg span { flex:1; text-align:center; font-size:12px; line-height:16px; padding:3px 0; border-radius:6px; color:var(--secondary-text-color); cursor:pointer; user-select:none; }
    .seg span.on { background:rgba(255,255,255,.18); color:var(--primary-text-color); }
    .chw { position:relative; height:150px; }
    .chw .grid { position:absolute; left:0; right:28px; border-top:1px solid rgba(255,255,255,.1); }
    .chw .grid.d { border-top:1px dashed rgba(255,255,255,.35); }
    .chw .yl { position:absolute; right:0; transform:translateY(-50%); font-size:10px; color:var(--secondary-text-color); width:26px; text-align:right; font-variant-numeric:tabular-nums; }
    .chw .avg { position:absolute; right:30px; transform:translateY(-110%); font-size:10px; color:var(--secondary-text-color); background:rgba(28,28,30,.85); padding:0 4px; border-radius:4px; }
    .bars { position:absolute; left:0; right:28px; top:0; bottom:0; display:flex; align-items:stretch; }
    .bc { flex:1; position:relative; cursor:pointer; }
    .bc .st { position:absolute; left:20%; right:20%; bottom:0; display:flex; flex-direction:column-reverse; border-radius:4px; overflow:hidden; transition:opacity .2s; }
    .bc .st i { display:block; flex:none; }
    .bc .st i + i { box-shadow:0 1px 0 rgba(28,28,30,.9); }
    .bars.sel .bc .st { opacity:.32; } .bars.sel .bc.on .st { opacity:1; }
    .xax { position:relative; height:14px; margin-right:28px; font-size:10px; color:var(--secondary-text-color); }
    .xax span { position:absolute; transform:translateX(-50%); top:2px; white-space:nowrap; } .xax span:first-child { transform:none; left:0 !important; }
    .alg { display:flex; flex-wrap:wrap; gap:4px 12px; margin:6px 0 4px; font-size:11px; color:var(--secondary-text-color); }
    .alg span { display:inline-flex; align-items:center; gap:5px; } .alg i { width:8px; height:8px; border-radius:50%; }
    .alg b { color:var(--primary-text-color); font-weight:400; font-variant-numeric:tabular-nums; }
    .ld { font-size:12px; color:var(--secondary-text-color); padding:20px 0; text-align:center; }
  `;

  class EnergieKarteCard extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({}, DEF, c || {});
      if (!Array.isArray(this._c.stat_solar)) this._c.stat_solar = this._c.stat_solar ? [this._c.stat_solar] : [];
      this._fold = { s: !!this._c.strom_eingeklappt, w: !!this._c.wasser_eingeklappt };
      this._rng = this._rng || { s: 'tag', w: 'tag' }; this._sel = { s: null, w: null };
      this._stat = {}; this._statAt = {}; this._sim = this._sim || '';
      if (this._root) this._build();
    }
    getCardSize() { return 9; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    static getStubConfig() { return {}; }
    static getConfigElement() { return document.createElement(TAG + '-editor'); }
    connectedCallback() {
      if (!this._root && this._c) this._build();
      clearInterval(this._iv); this._iv = setInterval(() => { this._statAt = {}; this._loadStats(); }, 600000);
      if (this._hass) this._loadStats();
    }
    disconnectedCallback() { clearInterval(this._iv); if (this._ro) this._ro.disconnect(); }
    set hass(h) { const first = !this._hass; this._hass = h; if (!this._root) this._build(); if (first) this._loadStats(); this._render(); }

    _build() {
      const r = this.shadowRoot || this.attachShadow({ mode: 'open' });
      this._root = r; this._last = {}; this._fl = [];
      const c = this._c;
      const tile = (k, nm, cls, inner) => {
        const w = T[k][2] || TW, l = T[k][0] - w / 2, t = T[k][1] - TH / 2;
        return `<div class="tk ${cls}" id="t-${k}" data-k="${k}" style="left:${l}px;top:${t}px;width:${w}px;height:${TH}px">${inner}<div class="th"><ha-icon id="i-${k}"></ha-icon><span>${nm}</span></div><div class="tv" id="v-${k}"></div><div class="td" id="d-${k}"></div></div>`;
      };
      const flowSvg = `<svg class="tln" viewBox="0 0 ${VW} ${VH}"><defs><filter id="gl" filterUnits="userSpaceOnUse" x="0" y="0" width="${VW}" height="${VH}"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${FLOWS.map((_, i) => `<g id="f${i}"></g>`).join('')}</svg>`;
      const tiles = tile('solar', 'Solar', 'sol', `<span class="rays off" id="rays"></span><span class="sp"><span class="spr"><span><i class="dot" style="background:${C.solar}"></i>Dachgaube</span><b id="sd"></b></span><span class="spr"><span><i class="dot" style="background:${C.solar2}"></i>Gartenhaus</span><b id="sg"></b></span><span class="spb"><i id="sdb" style="background:${C.solar};flex-grow:0"></i><i id="sgb" style="background:${C.solar2};flex-grow:0"></i></span></span>`)
        + tile('grid', 'Netz', '', '')
        + tile('home', 'Haus', 'hs', '')
        + tile('bat', 'Batterie', 'bt', `<span class="fill" id="bfill"><svg class="wave" viewBox="0 0 120 10" preserveAspectRatio="none"><path d="M0,5 Q15,0 30,5 T60,5 T90,5 T120,5 V10 H0Z"/></svg></span><span class="soc2"><i id="bsoc"></i></span>`)
        + tile('water', 'Wasser', '', `<span class="rip off" id="rip"><svg viewBox="0 0 120 12" preserveAspectRatio="none"><path d="M0,6 Q10,0 20,6 T40,6 T60,6 T80,6 T100,6 T120,6 V12 H0Z"/></svg></span>`)
        + tile('car', 'Enyaq', 'cr', `<span class="soc2"><i id="csoc"></i></span>`);
      const fold = (k, nm, icon) => `<div class="fold${this._fold[k] ? ' closed' : ''}" id="fo-${k}"><div class="fh" data-f="${k}"><span class="ft">${ic(icon, '#fff')}</span><span class="lbl">${nm}</span><span class="fx"><span id="fx-${k}"></span>${ic('chev', 'currentColor')}</span></div><div class="fb"><div class="fi" id="ch-${k}"><div class="ld">Lade Verlauf …</div></div></div></div>`;
      r.innerHTML = `<style>${CSS}</style><ha-card>
        <div class="hd"><div class="ttl">${c.title || ''}</div>${c.link ? `<span class="pl" id="lnk">${ic('chart', 'currentColor')}${c.link_label || ''}</span>` : ''}</div>
        ${c.simulation ? `<div class="sim" id="sim"></div>` : ''}
        <div class="fw" id="fw"><div class="tflow" id="tf">${flowSvg}${tiles}</div></div>
        ${c.charts ? fold('s', 'Strom', 'bolt') + fold('w', 'Wasser', 'water') : ''}
      </ha-card>`;
      const card = r.querySelector('ha-card');
      card.addEventListener('click', (ev) => {
        const sm = ev.target.closest('[data-sim]'); if (sm) { this._sim = sm.dataset.sim; this._render(); return; }
        if (ev.target.closest('#lnk')) { history.pushState(null, '', c.link); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); return; }
        const f = ev.target.closest('[data-f]'); if (f) { const k = f.dataset.f; this._fold[k] = !this._fold[k]; r.getElementById('fo-' + k).classList.toggle('closed', this._fold[k]); return; }
        const sg = ev.target.closest('[data-rng]'); if (sg) { const k = sg.dataset.kind; this._rng[k] = sg.dataset.rng; this._sel[k] = null; this._loadStats(); this._chart(k); return; }
        const bc = ev.target.closest('.bc'); if (bc) { const k = bc.parentElement.dataset.kind, i = +bc.dataset.i; this._sel[k] = this._sel[k] === i ? null : i; this._chart(k); return; }
        const t = ev.target.closest('.tk'); if (t) { const id = { solar: c.solar_power, grid: c.grid_power, home: c.home_day, bat: c.battery_power, water: c.water_flow, car: c.car_power }[t.dataset.k]; if (id) this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: id }, bubbles: true, composed: true })); }
      });
      // feste 400er-Flaeche auf Kartenbreite skalieren (Schrift waechst mit)
      if (this._ro) this._ro.disconnect();
      this._ro = new ResizeObserver(() => this._fit()); this._ro.observe(r.getElementById('fw'));
      this._fit();
      if (this._hass) this._render();
      if (c.charts) { this._chart('s'); this._chart('w'); }
    }
    _fit() {
      const fw = this._root && this._root.getElementById('fw'), tf = this._root && this._root.getElementById('tf'); if (!fw || !tf) return;
      const k = Math.min(1.3, (fw.clientWidth || VW) / VW); if (this._k === k) return; this._k = k;
      tf.style.transform = `scale(${k})`; fw.style.height = (VH * k + 6) + 'px';
    }
    _set(id, prop, val) { const key = id + '|' + prop; if (this._last[key] === val) return; this._last[key] = val; const e = this._root.getElementById(id); if (!e) return; if (prop === 'html') e.innerHTML = val; else if (prop === 'cls') e.className = val; else if (prop === 'icon') e.setAttribute('icon', val); else if (prop.startsWith('--')) e.style.setProperty(prop, val); else e.style[prop] = val; }
    _st(id) { const s = id && this._hass && this._hass.states[id]; return s ? s.state : undefined; }

    _values() {
      const c = this._c;
      if (this._sim && SIM[this._sim]) return Object.assign({ sd: SIM[this._sim].solar - SIM[this._sim].sg }, SIM[this._sim]);
      const solar = Math.max(0, num(this._st(c.solar_power)));
      const sg = Math.max(0, num(this._st(c.solar_gartenhaus))), sd = Math.max(0, num(this._st(c.solar_dachgaube)));
      const bat = num(this._st(c.battery_power)) * (c.battery_invert ? -1 : 1);
      return { solar, sg, sd, grid: num(this._st(c.grid_power)), bat, soc: Math.round(num(this._st(c.battery_soc))), water: Math.max(0, num(this._st(c.water_flow))),
        wall: Math.max(0, num(this._st(c.car_power))), wallNetz: num(this._st(c.car_grid_power)), car: Math.round(num(this._st(c.car_soc))),
        gday: num(this._st(c.grid_day)), hday: num(this._st(c.home_day)), sday: num(this._st(c.solar_day)), wday: Math.round(num(this._st(c.water_day))), wallday: num(this._st(c.car_day)) };
    }

    _render() {
      if (!this._root || !this._hass) return;
      const c = this._c, s = this._values(), f = split(s), G = glowOf(s);
      if (c.simulation) this._set('sim', 'html', [['', 'Live'], ...Object.entries(SIM).map(([k, v]) => [k, v.n])].map(([k, n]) => `<span data-sim="${k}" class="${this._sim === k ? 'on' : ''}">${n}</span>`).join(''));
      // Linien: nur neu zeichnen, wenn aktiv/inaktiv oder Tempostufe wechselt (kein Springen)
      const W = Object.assign({}, f, { water: s.water * 120, wall: s.wall });
      FLOWS.forEach(([d, key, col], i) => {
        const w = W[key], on = w > 0.5, t = on ? durOf(w) : 0, sig = on ? 'a' + t : 'z';
        if (this._fl[i] === sig) return; this._fl[i] = sig;
        let h;
        if (on) {
          const short = !d.includes('C');
          const [tl, ld, n, op] = short ? [58, 40, 28, 0.032] : [70, 22, 16, 0.07];
          h = `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linecap="round" style="animation:breath ${(t * 1.2).toFixed(2)}s ease-in-out infinite"/><g filter="url(#gl)">`
            + Array.from({ length: n }, (_, j) => [tl * (1 - j / n), ld * (1 - j / n)]).map(([a, b]) => `<path d="${d}" pathLength="100" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="2.2" stroke-dasharray="${(a + b).toFixed(2)} ${(100 - a - b).toFixed(2)}" style="animation:comet ${t}s linear infinite;animation-delay:-${(t * (tl - a) / 100).toFixed(3)}s"/>`).join('') + '</g>';
        } else h = `<path d="${d}" fill="none" stroke="rgba(189,189,189,.35)" stroke-width="1" stroke-dasharray="2 4"/>`;
        this._set('f' + i, 'html', h);
      });
      // Kacheln
      const tk = (k, col, active, cls) => { this._set('t-' + k, 'cls', `tk ${cls}${active ? ' on' : ''}${G[k] ? ' gl' : ''}`); this._set('t-' + k, '--c', col); this._set('t-' + k, '--gc', G[k] || 'transparent'); };
      const val = (k, txt, col) => { this._set('v-' + k, 'html', txt); this._set('v-' + k, 'color', col); };
      const MDI = { solar: 'mdi:solar-power-variant', grid: 'mdi:transmission-tower', home: 'mdi:home', water: 'mdi:water', car: 'mdi:car-electric', ev: 'mdi:ev-station',
        bat: s.soc >= 80 ? 'mdi:battery-high' : s.soc >= 45 ? 'mdi:battery-medium' : s.soc >= 15 ? 'mdi:battery-low' : 'mdi:battery-outline' };
      const icon = (k, name, col) => { this._set('i-' + k, 'icon', MDI[name]); this._set('i-' + k, 'color', col); };
      // Solar
      const sOn = s.solar > 0; tk('solar', C.solar, sOn, 'sol'); icon('solar', 'solar', sOn ? C.solar : C.t2);
      val('solar', fmtW(s.solar), sOn ? C.solar : C.t2); this._set('d-solar', 'html', `${dc(s.sday)} kWh heute`);
      this._set('rays', 'cls', 'rays' + (sOn ? '' : ' off'));
      this._set('sd', 'html', fmtW(s.sd)); this._set('sd', 'cls', s.sd > 0 ? '' : 'z'); this._set('sg', 'html', fmtW(s.sg)); this._set('sg', 'cls', s.sg > 0 ? '' : 'z');
      this._set('sdb', 'flexGrow', String(s.sd)); this._set('sgb', 'flexGrow', String(s.sg));
      // Netz
      const gCol = s.grid > 0 ? C.red : s.grid < 0 ? C.green : C.t2; tk('grid', gCol, s.grid !== 0, ''); icon('grid', 'grid', s.grid ? gCol : C.t2);
      val('grid', (s.grid < 0 ? '↤ ' : '') + fmtW(s.grid), gCol); this._set('d-grid', 'html', s.grid < 0 ? `${dc(s.gday)} kWh · Export` : `${dc(s.gday)} kWh heute`);
      // Haus: Herkunft jetzt
      tk('home', '#fff', false, 'hs'); icon('home', 'home', '#fff'); val('home', fmtW(f.home), '#fff');
      const parts = [[f.sToHome, C.solar], [f.gToHome, C.red], [f.bToHome, C.lila]];
      this._set('d-home', 'html', `<span class="jr" style="margin:0 0 2px"><span>jetzt</span><span class="mx">${parts.map(([v, col]) => v > 0 ? `<i style="flex-grow:${Math.round(v)};background:${col}"></i>` : '').join('')}</span></span>${dc(s.hday)} kWh heute`);
      // Batterie
      const bCol = s.bat > 0 ? C.green : s.bat < 0 ? C.lila : 'rgba(118,118,128,.6)'; tk('bat', bCol, s.bat !== 0, 'bt'); icon('bat', 'bat', s.bat ? bCol : C.t2);
      val('bat', fmtW(s.bat), s.bat ? bCol : C.t2); this._set('d-bat', 'html', `${s.soc} %${s.bat > 0 ? ' · lädt' : s.bat < 0 ? ' · entlädt' : ''}`);
      this._set('bfill', 'height', s.soc + '%'); this._set('bfill', '--fc', bCol);
      this._set('bsoc', 'width', Math.max(0.5, s.soc) + '%'); this._set('bsoc', '--sc', s.bat ? bCol : '#8e8e93');
      // Wasser
      const wOn = s.water > 0; tk('water', C.blue, wOn, ''); icon('water', 'water', wOn ? C.blue : C.t2);
      val('water', dc(s.water, 0) + ' L/min', wOn ? C.blue : C.t2); this._set('d-water', 'html', `${s.wday} L heute`); this._set('rip', 'cls', 'rip' + (wOn ? '' : ' off'));
      // Enyaq
      const cOn = s.wall > 0; tk('car', C.cyan, cOn, 'cr'); icon('car', cOn ? 'ev' : 'car', cOn ? C.cyan : C.t2);
      val('car', cOn ? fmtW(s.wall) : `${s.car} %`, cOn ? C.cyan : C.t2); this._set('d-car', 'html', cOn || s.wallday > 0 ? `${dc(s.wallday)} kWh · ${s.car} %` : 'Akku');
      this._set('csoc', 'width', Math.max(0.5, s.car) + '%'); this._set('csoc', '--sc', socCol(s.car)); this._set('csoc', 'cls', cOn ? 'chg' : '');
    }

    /* ---------- Diagramme aus der Langzeitstatistik ---------- */
    _range(rng) {
      const now = new Date(), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (rng === 'tag') return { start: d0, n: 24, period: 'hour', step: (i) => new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), i), done: now.getHours() + now.getMinutes() / 60 };
      if (rng === 'woche') { const s = new Date(d0); s.setDate(s.getDate() - 6); return { start: s, n: 7, period: 'day', step: (i) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + i), done: 6 + (now - d0) / 864e5 }; }
      const s = new Date(now.getFullYear(), now.getMonth(), 1), n = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return { start: s, n, period: 'day', step: (i) => new Date(s.getFullYear(), s.getMonth(), 1 + i), done: now.getDate() - 1 + (now - d0) / 864e5 };
    }
    async _loadStats() {
      const c = this._c; if (!this._hass || !c.charts) return;
      for (const k of ['s', 'w']) {
        const rng = this._rng[k], key = k + rng;
        if (this._statAt[key] && Date.now() - this._statAt[key] < 600000) continue;
        this._statAt[key] = Date.now();
        const R = this._range(rng);
        const ids = k === 's' ? [c.stat_grid, ...c.stat_solar, c.stat_charge, c.stat_discharge].filter(Boolean) : [c.stat_water].filter(Boolean);
        if (!ids.length) continue;
        try {
          const res = await this._hass.callWS({ type: 'recorder/statistics_during_period', start_time: R.start.toISOString(), statistic_ids: ids, period: R.period, types: ['change'] });
          const arr = (id) => { const out = Array(R.n).fill(0); (res[id] || []).forEach((p) => { const t = typeof p.start === 'number' ? p.start : Date.parse(p.start); for (let i = 0; i < R.n; i++) { const a = +R.step(i), b = +R.step(i + 1); if (t >= a && t < b) { out[i] += Math.max(0, p.change || 0); break; } } }); return out; };
          if (k === 's') {
            const grid = arr(c.stat_grid), sol = Array(R.n).fill(0); c.stat_solar.forEach((id) => arr(id).forEach((v, i) => { sol[i] += v; }));
            const chg = c.stat_charge ? arr(c.stat_charge) : Array(R.n).fill(0), dis = c.stat_discharge ? arr(c.stat_discharge) : Array(R.n).fill(0);
            this._stat[key] = { R, series: [{ n: 'Netz', v: grid, c: C.red }, { n: 'Solar', v: sol.map((v, i) => Math.max(0, v - chg[i])), c: C.solar }, { n: 'Akku', v: dis, c: C.lila }], neg: chg };
          } else {
            const st = this._hass.states[c.stat_water], u = st && st.attributes.unit_of_measurement, fac = u === 'm³' ? 1000 : u === 'L' ? 1 : 1;
            this._stat[key] = { R, series: [{ n: 'Wasser', v: arr(c.stat_water).map((v) => v * fac), c: C.blue }] };
          }
        } catch (e) { this._stat[key] = { err: String(e && e.message || e) }; }
        this._chart(k);
      }
    }
    _chart(k) {
      if (!this._root || !this._c.charts) return;
      const rng = this._rng[k], D = this._stat[k + rng], sel = this._sel[k], unit = k === 's' ? 'kWh' : 'L', dec = k === 's' ? 1 : 0;
      const seg = `<div class="seg">${[['tag', 'Tag'], ['woche', 'Woche'], ['monat', 'Monat']].map(([v, l]) => `<span data-kind="${k}" data-rng="${v}" class="${rng === v ? 'on' : ''}">${l}</span>`).join('')}</div>`;
      if (!D || D.err) { this._set('ch-' + k, 'html', seg + `<div class="ld">${D ? 'Statistik nicht verfügbar' : 'Lade Verlauf …'}</div>`); return; }
      const { R, series, neg } = D, n = R.n;
      const tops = Array.from({ length: n }, (_, i) => series.reduce((m, x) => m + x.v[i], 0)), mx = niceMax(Math.max(...tops, k === 's' ? 0.5 : 5)), total = sum(tops);
      const avg = total / Math.max(1, Math.min(n, R.done)), y = (v) => (1 - v / mx) * 100;
      const lab = (i) => { const d = R.step(i); return R.period === 'hour' ? `${i}:00–${i + 1}:00` : `${WD[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`; };
      const when = rng === 'tag' ? 'Heute' : rng === 'woche' ? 'Letzte 7 Tage' : MON[R.start.getMonth()];
      const big = sel == null ? ['Gesamt', total] : [lab(sel), tops[sel]];
      let h = `<div class="ah"><div><small>${big[0]}</small><div class="big">${dc(big[1], dec)}<span>${unit}</span></div></div><div class="when">${when}${sel == null ? `<br>Ø ${dc(avg, k === 's' ? 2 : 0)} ${unit} pro ${R.period === 'hour' ? 'Stunde' : 'Tag'}` : ''}</div></div>` + seg;
      h += '<div class="chw">';
      [mx, mx / 2, 0].forEach((t) => { h += `<span class="grid" style="top:${y(t)}%"></span><span class="yl" style="top:${y(t)}%">${dc(t, Number.isInteger(t) ? 0 : 1)}</span>`; });
      if (avg > 0) h += `<span class="grid d" style="top:${y(avg)}%"></span><span class="avg" style="top:${y(avg)}%">Ø</span>`;
      h += `<div class="bars${sel != null ? ' sel' : ''}" data-kind="${k}">`;
      for (let i = 0; i < n; i++) {
        const th = tops[i] / mx * 100;
        const segs = series.map((x) => x.v[i] > 0 ? `<i style="height:${(x.v[i] / tops[i] * 100).toFixed(2)}%;background:${x.c}"></i>` : '').join('');
        h += `<div class="bc${sel === i ? ' on' : ''}" data-i="${i}"><div class="st" style="height:${Math.max(tops[i] > 0 ? 2.5 : 0, th).toFixed(2)}%">${segs}</div></div>`;
      }
      h += '</div></div>';
      const ticks = R.period === 'hour' ? [0, 6, 12, 18].map((t) => [t, `${t} Uhr`]) : n === 7 ? Array.from({ length: 7 }, (_, i) => [i, WD[R.step(i).getDay()]]) : [0, 7, 14, 21, 28].filter((t) => t < n).map((t) => [t, `${t + 1}.`]);
      h += `<div class="xax">${ticks.map(([t, l]) => `<span style="left:${((t + 0.5) / n * 100).toFixed(2)}%">${l}</span>`).join('')}</div>`;
      if (series.length > 1) h += `<div class="alg">${series.map((x) => `<span><i style="background:${x.c}"></i>${x.n} <b>${dc(sel == null ? sum(x.v) : x.v[sel], dec)}</b></span>`).join('')}${neg ? `<span><i style="background:${C.green}"></i>Akku geladen <b>${dc(sel == null ? sum(neg) : neg[sel], dec)}</b></span>` : ''}</div>`;
      this._set('ch-' + k, 'html', h);
      this._set('fx-' + k, 'html', `<b>${k === 's' ? dc(total, 1) + ' kWh' : (total >= 1000 ? dc(total / 1000, 2) + ' m³' : Math.round(total) + ' L')}</b>`);
    }
  }
  customElements.define(TAG, EnergieKarteCard);

  /* ---------- Grafischer Editor ---------- */
  const E = (domain) => ({ entity: domain ? { domain } : {} });
  const SCHEMA = [
    { name: 'title', selector: { text: {} } },
    { type: 'grid', name: '', schema: [{ name: 'link', selector: { text: {} } }, { name: 'link_label', selector: { text: {} } }] },
    { type: 'expandable', name: '', title: 'Solar', schema: [
      { name: 'solar_power', selector: E('sensor') }, { name: 'solar_dachgaube', selector: E('sensor') }, { name: 'solar_gartenhaus', selector: E('sensor') }, { name: 'solar_day', selector: E('sensor') } ] },
    { type: 'expandable', name: '', title: 'Netz und Haus', schema: [
      { name: 'grid_power', selector: E('sensor') }, { name: 'grid_day', selector: E('sensor') }, { name: 'home_day', selector: E('sensor') } ] },
    { type: 'expandable', name: '', title: 'Batterie', schema: [
      { name: 'battery_power', selector: E('sensor') }, { name: 'battery_soc', selector: E('sensor') }, { name: 'battery_invert', selector: { boolean: {} } } ] },
    { type: 'expandable', name: '', title: 'Wasser', schema: [
      { name: 'water_flow', selector: E('sensor') }, { name: 'water_day', selector: E('sensor') } ] },
    { type: 'expandable', name: '', title: 'Enyaq / Wallbox', schema: [
      { name: 'car_power', selector: E('sensor') }, { name: 'car_grid_power', selector: E('sensor') }, { name: 'car_day', selector: E('sensor') }, { name: 'car_soc', selector: E('sensor') } ] },
    { type: 'expandable', name: '', title: 'Diagramme (Zähler der Langzeitstatistik)', schema: [
      { name: 'charts', selector: { boolean: {} } },
      { name: 'stat_grid', selector: E('sensor') }, { name: 'stat_solar', selector: { entity: { domain: 'sensor', multiple: true } } },
      { name: 'stat_charge', selector: E('sensor') }, { name: 'stat_discharge', selector: E('sensor') }, { name: 'stat_water', selector: E('sensor') },
      { name: 'strom_eingeklappt', selector: { boolean: {} } }, { name: 'wasser_eingeklappt', selector: { boolean: {} } } ] },
    { type: 'expandable', name: '', title: 'Test', schema: [{ name: 'simulation', selector: { boolean: {} } }] },
  ];
  const LBL = {
    title: 'Titel', link: 'Link (Pille oben rechts)', link_label: 'Beschriftung Link',
    solar_power: 'Solar gesamt (W)', solar_dachgaube: 'Solar Dachgaube (W)', solar_gartenhaus: 'Solar Gartenhaus (W)', solar_day: 'Solar heute (kWh)',
    grid_power: 'Netz (W, + Bezug / − Einspeisung)', grid_day: 'Netz heute (kWh)', home_day: 'Haus heute (kWh)',
    battery_power: 'Batterie (W, + lädt / − entlädt)', battery_soc: 'Batterie Ladestand (%)', battery_invert: 'Vorzeichen Batterie umkehren',
    water_flow: 'Wasser Durchfluss (L/min)', water_day: 'Wasser heute (L)',
    car_power: 'Wallbox Ladeleistung (W)', car_grid_power: 'Enyaq Netzladeleistung (W)', car_day: 'Wallbox heute (kWh)', car_soc: 'Enyaq Ladestand (%)',
    charts: 'Diagramme Strom und Wasser anzeigen', stat_grid: 'Netzbezug (kWh-Zähler)', stat_solar: 'Solarertrag (kWh-Zähler)', stat_charge: 'Akku geladen (kWh-Zähler)',
    stat_discharge: 'Akku entladen (kWh-Zähler)', stat_water: 'Wasserzähler (m³ oder L)', strom_eingeklappt: 'Strom anfangs eingeklappt', wasser_eingeklappt: 'Wasser anfangs eingeklappt',
    simulation: 'Simulations-Schalter anzeigen',
  };
  class EnergieKarteEditor extends HTMLElement {
    setConfig(c) { this._c = Object.assign({}, c || {}); this._draw(); }
    set hass(h) { this._hass = h; if (this._f) this._f.hass = h; else this._draw(); }
    _draw() {
      if (!this._hass || !this._c) return;
      if (!this._f) {
        this._f = document.createElement('ha-form');
        this._f.computeLabel = (s) => LBL[s.name] || s.name;
        this._f.addEventListener('value-changed', (ev) => {
          const v = Object.assign({}, this._c, ev.detail.value);
          Object.keys(v).forEach((k) => { if (k !== 'type' && (v[k] === '' || v[k] == null || (k in DEF && JSON.stringify(v[k]) === JSON.stringify(DEF[k])))) delete v[k]; });
          this._c = v; this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: v }, bubbles: true, composed: true }));
        });
        this.appendChild(this._f);
      }
      this._f.hass = this._hass; this._f.schema = SCHEMA;
      const d = Object.assign({}, DEF, this._c); delete d.type; this._f.data = d;
    }
  }
  if (!customElements.get(TAG + '-editor')) customElements.define(TAG + '-editor', EnergieKarteEditor);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Energie-Karte', description: 'Live-Energiefluss als Kacheln mit Lichtfluss, Diagramme Strom und Wasser' });
})();
