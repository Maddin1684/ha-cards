// wetter-karte-card v1.2 (27.11.2026: Regen feiner; Sonne nur als Licht und Strahlen ohne Scheibe; groesseres Zustandssymbol; Stunden mit 'Uhr' ohne 'Jetzt'; Vorhersage im Spaltenraster wie weather-forecast-card (gestrichelte Trenner, Min gepunktet, 0-Grad-Linie), Niederschlag in mm/cm, Wind mit Richtungspfeil in Windfarben; Varianten Linie und Balken (Zeilen entfallen); v1.1: Effekte wie ELMO-Hauskarte per CSS (Wolken, Regen, Schnee, Sterne, Sternschnuppe, Sonne mit Strahlenkranz, Blitz in der Wolke, Nebelbaender) statt Canvas; Balken-Variante durch Linien-Variante ersetzt; v1.0: erste Version – Kopf mit aktuellem Zustand und Wettereffekt (Sonne, Regen, Schnee, klare Nacht, Gewitter, Nebel, Wolken) plus naechste Stunden;
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
    nina_match: 'warning_schluchtern_stadt_main_kinzig_kreis_hessen_', title: 'Wetter Elm', forecast_style: 'linie', hours: 5, days: 7, test: false,
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
    .efx { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
    .efx > div { position:absolute; pointer-events:none; }
    /* Effekte wie ELMO-Hauskarte (Regen, Schnee, Wolken, Sterne, Sternschnuppe, Sonne, Blitz, Nebel) */
    .cloud { z-index:1; left:-45%; height:22%; background:radial-gradient(ellipse at center, rgba(var(--cloud-rgb,255,255,255),.95) 0%, rgba(var(--cloud-rgb,255,255,255),.55) 55%, rgba(var(--cloud-rgb,255,255,255),0) 80%); border-radius:50%; filter:blur(1.8px);
      animation-name:wk-cloud-drift; animation-timing-function:linear; animation-iteration-count:infinite; will-change:left, opacity; }
    .cloud::before, .cloud::after { content:""; position:absolute; background:inherit; border-radius:50%; }
    .cloud::before { width:55%; height:170%; top:-55%; left:12%; }
    .cloud::after { width:42%; height:130%; top:-35%; right:10%; }
    .cloud.flash { animation-name:wk-cloud-drift, wk-cloud-flash; animation-timing-function:linear, ease-out; }
    @keyframes wk-cloud-drift { 0% { left:var(--start-left,-45%); opacity:0; } 16% { opacity:var(--cloud-opacity,.35); } 93% { opacity:var(--cloud-opacity,.35); } 100% { left:var(--end-left,96%); opacity:0; } }
    @keyframes wk-cloud-flash { 0% { filter:blur(1.8px) brightness(1); } 2% { filter:blur(1.8px) brightness(5); } 4% { filter:blur(1.8px) brightness(1.5); } 6% { filter:blur(1.8px) brightness(4.2); } 9%, 100% { filter:blur(1.8px) brightness(1); } }
    .rain-drop { z-index:2; top:-6%; background:linear-gradient(to bottom, rgba(150,205,255,.95), rgba(190,230,255,var(--drop-alpha,1))); box-shadow:0 0 1px rgba(200,235,255,calc(var(--glow-alpha,1) * .6)), 0 0 3px rgba(90,180,255,calc(var(--glow-alpha,1) * .35));
      animation-name:wk-rain; animation-timing-function:linear; animation-iteration-count:infinite; will-change:transform, opacity; backface-visibility:hidden; }
    @keyframes wk-rain { 0% { transform:translateY(0); opacity:0; } 10% { opacity:1; } 90% { opacity:.9; } 97% { opacity:.5; } 100% { transform:translateY(var(--fall,130px)); opacity:0; } }
    .snow-flake { z-index:2; top:-4%; border-radius:50%; background:rgba(255,255,255,.85); box-shadow:0 0 2px rgba(255,255,255,.55);
      animation-name:wk-snow; animation-timing-function:linear; animation-iteration-count:infinite; will-change:transform, opacity; backface-visibility:hidden; }
    @keyframes wk-snow { 0% { transform:translate(0,0); opacity:0; } 10% { opacity:.9; } 50% { transform:translate(8px, calc(var(--fall,130px) / 2)); } 100% { transform:translate(-6px, var(--fall,130px)); opacity:.3; } }
    .star { z-index:0; border-radius:50%; background:#fff; box-shadow:0 0 3px rgba(255,255,255,.8); animation-name:wk-star; animation-timing-function:ease-in-out; animation-iteration-count:infinite; }
    @keyframes wk-star { 0%, 100% { opacity:.25; transform:scale(.88); } 50% { opacity:.6; transform:scale(1.08); } }
    .shooting-star { z-index:1; width:2px; height:2px; animation-name:wk-shoot; animation-timing-function:ease-in-out; animation-iteration-count:infinite; opacity:0; }
    .shooting-star::before { content:""; position:absolute; top:0; left:0; width:22px; height:1px; background:linear-gradient(to right, rgba(255,255,255,.95), rgba(255,255,255,0)); transform:rotate(var(--trail-rotate,-32deg)); transform-origin:0 0; }
    @keyframes wk-shoot { 0%, 72% { opacity:0; transform:translate(0,0); } 75% { opacity:1; transform:translate(calc(var(--mx,24px) * .12), calc(var(--my,17px) * .12)); } 92% { opacity:1; transform:translate(calc(var(--mx,24px) * .96), calc(var(--my,17px) * .96)); } 100% { opacity:0; transform:translate(var(--mx,24px), var(--my,17px)); } }
    .sun-glow { z-index:0; width:14px; height:14px; border-radius:50%; background:radial-gradient(circle, #fffdf6 0%, #fff2cf 55%, #ffe6a8 100%);
      box-shadow:0 0 5px 1px rgba(255,255,255,.95), 0 0 7px 3px rgba(255,205,100,.6), 0 0 12px 5px rgba(255,170,60,.32), 0 0 19px 7px rgba(255,150,40,.15); animation:wk-sun-pulse 2.2s ease-in-out infinite; }
    .sun-glow::before { content:""; position:absolute; inset:-260%; border-radius:50%; background:repeating-conic-gradient(rgba(255,222,160,.16) 0deg 2deg, rgba(255,222,160,0) 2deg 14deg); filter:blur(2px); animation:wk-sun-rays 55s linear infinite; }
    .sun-glow.gold { background:radial-gradient(circle, #fff5ee 0%, #ffb494 45%, #ff7a5c 100%); box-shadow:0 0 5px 1px rgba(255,238,228,.95), 0 0 7px 3px rgba(255,130,100,.65), 0 0 12px 5px rgba(240,90,70,.38), 0 0 19px 7px rgba(220,70,60,.18); }
    .sun-light { z-index:0; left:-30%; top:-90%; width:120%; height:220%; background:radial-gradient(closest-side, rgba(255,214,120,.22), rgba(255,214,120,.08) 45%, rgba(255,214,120,0) 100%); }
    .sun-light.gold { background:radial-gradient(closest-side, rgba(255,140,90,.3), rgba(255,120,80,.1) 45%, rgba(255,120,80,0) 100%); }
    .sun-rays { z-index:0; left:-260px; top:-260px; width:560px; height:560px; border-radius:50%; background:repeating-conic-gradient(from 0deg, rgba(255,226,160,.13) 0deg 3deg, rgba(255,226,160,0) 3deg 15deg);
      -webkit-mask-image:radial-gradient(circle, transparent 8%, #000 14%, rgba(0,0,0,.55) 40%, transparent 70%); mask-image:radial-gradient(circle, transparent 8%, #000 14%, rgba(0,0,0,.55) 40%, transparent 70%);
      filter:blur(1.5px); animation:wk-sun-rays 90s linear infinite, wk-sun-breathe 7s ease-in-out infinite; }
    .sun-rays.gold { background:repeating-conic-gradient(from 0deg, rgba(255,150,100,.16) 0deg 3deg, rgba(255,150,100,0) 3deg 15deg); }
    @keyframes wk-sun-breathe { 0%, 100% { opacity:.75; } 50% { opacity:1; } }
    .sun-sweep { z-index:0; top:-30%; height:160%; left:0; width:30%; background:linear-gradient(90deg, rgba(255,240,200,0), rgba(255,240,200,.12), rgba(255,240,200,0)); animation:wk-sun-sweep 14s linear infinite; will-change:transform; }
    .sun-sweep.gold { background:linear-gradient(90deg, rgba(255,170,120,0), rgba(255,170,120,.14), rgba(255,170,120,0)); }
    @keyframes wk-sun-sweep { 0% { transform:translateX(-130%) skewX(-25deg); } 45%, 100% { transform:translateX(420%) skewX(-25deg); } }
    .sun-halo { z-index:0; border-radius:50%; background:radial-gradient(circle, rgba(255,150,170,.4) 0%, rgba(255,150,170,.15) 55%, transparent 75%); }
    @keyframes wk-sun-pulse { 0%, 100% { transform:scale(1); opacity:.92; } 50% { transform:scale(1.1); opacity:1; } }
    @keyframes wk-sun-rays { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    .fog-band { z-index:1; left:-1%; width:102%; filter:blur(5px); opacity:var(--fog-opacity,.15); animation-name:wk-fog; animation-timing-function:ease-in-out; animation-iteration-count:infinite;
      background:radial-gradient(ellipse 42% 100% at 12% 55%, rgba(240,244,248,.95) 0%, rgba(240,244,248,0) 72%), radial-gradient(ellipse 38% 85% at 38% 35%, rgba(240,244,248,.85) 0%, rgba(240,244,248,0) 72%),
        radial-gradient(ellipse 44% 100% at 66% 60%, rgba(240,244,248,.9) 0%, rgba(240,244,248,0) 72%), radial-gradient(ellipse 36% 90% at 90% 40%, rgba(240,244,248,.85) 0%, rgba(240,244,248,0) 72%); }
    @keyframes wk-fog { 0% { transform:translateX(-4%) scaleX(1) scaleY(.96); opacity:calc(var(--fog-opacity,.15) * .62); } 50% { transform:translateX(4%) scaleX(1.06) scaleY(1.04); opacity:var(--fog-opacity,.15); } 100% { transform:translateX(-4%) scaleX(1) scaleY(.96); opacity:calc(var(--fog-opacity,.15) * .62); } }

    .now { position:absolute; inset:0; z-index:3; display:flex; align-items:center; padding:0 12px; gap:10px; }
    .cur { flex:0 0 96px; display:flex; flex-direction:column; align-items:center; }
    .cur img, .cur ha-icon { width:68px; height:68px; --mdc-icon-size:62px; display:flex; align-items:center; justify-content:center; color:#c7c7cc; }
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
    .cg { display:grid; text-align:center; font-variant-numeric:tabular-nums; }
    .cc { display:flex; flex-direction:column; align-items:center; min-width:0; }
    .cg .d { font-size:15px; color:var(--primary-text-color); }
    .cg .d.n { color:${C.orange}; }
    .cg img, .cg .cc > ha-icon:not([icon="mdi:navigation"]) { width:34px; height:34px; --mdc-icon-size:30px; margin-top:4px; display:flex; align-items:center; justify-content:center; color:#c7c7cc; }
    .ca { position:relative; margin:2px 0 0; }
    .ca .sp { position:absolute; top:4px; bottom:4px; border-left:1px dashed rgba(255,255,255,.14); }
    .ca .z0 { position:absolute; left:0; right:0; border-top:1px dashed rgba(100,210,255,.28); }
    .ca .z0l { position:absolute; left:0; font-size:9px; color:rgba(100,210,255,.6); }
    .ca .pt { position:absolute; width:9px; height:9px; margin:-4.5px 0 0 -4.5px; border-radius:50%; }
    .ca .bar { position:absolute; width:9px; margin-left:-4.5px; border-radius:5px; }
    .ca .tn { position:absolute; width:9px; height:9px; margin:-4.5px 0 0 -4.5px; border-radius:50%; background:#fff; box-shadow:0 0 0 2px var(--ha-card-background, var(--card-background-color, #1c1c1e)); }
    .ca .vh, .ca .vl { position:absolute; transform:translateX(-50%); font-size:13px; line-height:14px; white-space:nowrap; font-variant-numeric:tabular-nums; }
    .ca .vh { color:var(--primary-text-color); }
    .ca .vl { color:var(--secondary-text-color); }
    .cg.pr { margin-top:2px; }
    .cg .pb { height:12px; width:62%; display:flex; align-items:flex-end; }
    .cg .pb span { display:block; width:100%; border-radius:2px; }
    .cg .pv { font-size:12px; margin-top:3px; color:var(--secondary-text-color); white-space:nowrap; }
    .cg .pv.wet { color:${C.teal}; }
    .cg.wd { margin:6px 0 10px; }
    .cg.wd .cc { flex-direction:row; justify-content:center; gap:2px; font-size:12px; color:var(--secondary-text-color); white-space:nowrap; }
    .cg.wd ha-icon { --mdc-icon-size:13px; width:13px; height:13px; display:flex; }
    .cg.wd small { font-size:10px; }
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
    }
    disconnectedCallback() {
      this._on = false; clearInterval(this._iv);
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
        <div class="hero" id="hero"><div class="efx" id="fx"></div><div class="now"><div class="cur" id="cur"></div><div class="sep"></div><div class="hrs" id="hrs"></div></div></div>
        <div id="ex"></div>
        <div class="fold" data-id="warn"><div class="fh"><span class="ft">${ico('mdi:alert-outline')}</span><span class="lbl">Warnungen</span><span class="fx" id="wfx"></span></div><div class="fb"><div class="fi" id="wl"></div></div></div>
        <div class="fold" data-id="fc"><div class="fh"><span class="ft">${ico('mdi:calendar-month-outline')}</span><span class="lbl">Vorhersage</span><span class="fx" id="ffx"></span></div><div class="fb"><div class="fi" id="fl"></div></div></div>
      </ha-card>`;
      this._last = {};
      const card = root.querySelector('ha-card');
      card.addEventListener('click', (ev) => this._click(ev));
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
      const el = this._test === 'live' ? num(this._hass.states[this._c.sun] && this._hass.states[this._c.sun].attributes.elevation, 30) : 30;
      const night = this._test === 'live' ? this._night() : c === 'clear-night' || c === 'partlycloudy-night';
      const key = [c, night ? 'n' : 't', el < 10 && !night ? 'g' : '', Math.floor(Date.now() / 3600000)].join('|');
      if (key !== this._fxKey) { this._fxKey = key; const e = this._root.getElementById('fx'); if (e) e.innerHTML = this._fxHtml(c, night, el); }
      this._set('cur', `${this._img(c)}<div class="cn">${esc(NAMES[c] || c)}</div>`);
      // naechste Stunden
      const hf = (this._fc.hourly || []).filter((x) => Date.parse(x.datetime) > Date.now()).slice(0, Math.max(3, num(this._c.hours, 5)));
      const hrs = hf.map((x) => {
        const d = new Date(x.datetime), hc = this._cond(x.condition, this._isNightAt(d)), p = Math.round(num(x.precipitation_probability));
        return `<div class="h"><span class="t">${d.getHours()} Uhr</span>${this._img(hc)}<span class="p${p >= 30 ? ' wet' : ''}">${p} %</span></div>`;
      }).join('');
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
        return { ws: num(x.wind_speed, NaN), wb: num(x.wind_bearing, NaN), d, i, cond: x.condition, hi: num(x.temperature), lo: num(x.templow, num(x.temperature) - 3), pr, pp: Math.round(num(x.precipitation_probability)), snow: snowDay && pr >= 0.05, cm: pr * snowFrac };
      });
    }
    _fcast(we) {
      const D = this._days(we);
      if (!D.length) { this._set('fl', `<div class="lg">Vorhersage wird geladen …</div>`); this._set('ffx', ''); return; }
      const style = /balken|zeilen/.test(this._c.forecast_style || '') ? 'balken' : 'linie';
      this._set('ffx', this._open.fc === 'zu' ? 'Anzeigen' : 'Einklappen');
      const tNow = this._c.temperature_entity && this._hass.states[this._c.temperature_entity] ? num(this._hass.states[this._c.temperature_entity].state, num(we.attributes.temperature)) : num(we.attributes.temperature);
      this._set('fl', this._chart(D, tNow, style));
    }
    _dayName(x) { return x.i === 0 && sameDay(x.d, new Date()) ? 'Heute' : WD[x.d.getDay()]; }
    _chart(D, tNow, mode) {
      const n = D.length, CH = 118, PT = 24, PB = 24, lo = Math.min(...D.map((x) => x.lo)), hi = Math.max(...D.map((x) => x.hi));
      const y = (v) => PT + (hi - v) / Math.max(1, hi - lo) * (CH - PT - PB), X = (i) => (i + 0.5) / n * 100;
      const col = `grid-template-columns:repeat(${n},minmax(0,1fr))`, today0 = this._dayName(D[0]) === 'Heute';
      const pMax = Math.max(2, ...D.map((x) => x.pr));
      const wc = (v) => (v <= 28 ? C.green : v <= 61 ? C.yellow : v <= 117 ? C.red : C.purple);
      // Kopf: Tag + Icon
      let s = `<div class="cg" style="${col}">${D.map((x) => `<div class="cc"><div class="d${this._dayName(x) === 'Heute' ? ' n' : ''}">${this._dayName(x)}</div>${this._img(x.cond)}</div>`).join('')}</div>`;
      // Diagramm
      s += `<div class="ca" style="height:${CH}px">`;
      for (let i = 1; i < n; i++) s += `<i class="sp" style="left:${(i / n * 100).toFixed(2)}%"></i>`;
      if (lo < 0 && hi > 0) s += `<i class="z0" style="top:${y(0).toFixed(1)}px"></i><span class="z0l" style="top:${(y(0) - 7).toFixed(1)}px">0°</span>`;
      if (mode === 'linie') {
        const path = (k) => { let d = `M${X(0)},${y(D[0][k])}`; for (let i = 1; i < n; i++) { const x0 = X(i - 1), x1 = X(i), y0 = y(D[i - 1][k]), y1 = y(D[i][k]), m = (x1 - x0) / 2; d += ` C${x0 + m},${y0} ${x1 - m},${y1} ${x1},${y1}`; } return d; };
        s += `<svg viewBox="0 0 100 ${CH}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><defs><linearGradient id="wkg" x1="0" y1="${y(hi)}" x2="0" y2="${y(lo)}" gradientUnits="userSpaceOnUse">${[0, 0.25, 0.5, 0.75, 1].map((k) => `<stop offset="${k}" stop-color="${tc(hi - (hi - lo) * k)}"/>`).join('')}</linearGradient></defs>
          <path d="${path('hi')}" fill="none" stroke="url(#wkg)" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
          <path d="${path('lo')}" fill="none" stroke="url(#wkg)" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 5" vector-effect="non-scaling-stroke"/></svg>`;
        D.forEach((x, i) => { s += `<b class="pt" style="left:${X(i)}%;top:${y(x.hi).toFixed(1)}px;background:${tc(x.hi)}"></b><b class="pt" style="left:${X(i)}%;top:${y(x.lo).toFixed(1)}px;background:${tc(x.lo)}"></b>`; });
      } else {
        D.forEach((x, i) => {
          const t = y(x.hi), b = y(x.lo), h = Math.max(8, b - t);
          s += `<b class="bar" style="left:${X(i)}%;top:${t.toFixed(1)}px;height:${h.toFixed(1)}px;background:linear-gradient(180deg,${tc(x.hi)},${tc((x.hi + x.lo) / 2)},${tc(x.lo)})"></b>`;
          if (i === 0 && today0) s += `<b class="tn" style="left:${X(i)}%;top:${y(Math.max(lo, Math.min(hi, tNow))).toFixed(1)}px"></b>`;
        });
      }
      D.forEach((x, i) => { s += `<span class="vh" style="left:${X(i)}%;top:${(y(x.hi) - 21).toFixed(1)}px">${r0(x.hi)}°</span><span class="vl" style="left:${X(i)}%;top:${(y(x.lo) + 7).toFixed(1)}px">${r0(x.lo)}°</span>`; });
      s += `</div>`;
      // Niederschlag
      s += `<div class="cg pr" style="${col}">${D.map((x) => {
        const h = x.pr > 0.04 ? Math.max(3, x.pr / pMax * 12) : 0, c = x.snow ? 'rgba(255,255,255,.85)' : x.pr >= 0.5 ? C.blue : 'rgba(10,132,255,.55)';
        return `<div class="cc"><div class="pb"><span style="height:${h.toFixed(1)}px;background:${c}"></span></div><div class="pv${x.pr >= 0.5 ? ' wet' : ''}">${x.snow ? dc(Math.max(0.1, x.cm)) + ' cm' : dc(x.pr) + ' mm'}</div></div>`;
      }).join('')}</div>`;
      // Wind
      s += `<div class="cg wd" style="${col}">${D.map((x) => isNaN(x.ws) ? '<div class="cc"></div>' : `<div class="cc"><ha-icon icon="mdi:navigation" style="color:${wc(x.ws)};transform:rotate(${isNaN(x.wb) ? 0 : Math.round(x.wb + 180)}deg)"></ha-icon><span>${Math.round(x.ws)} <small>km/h</small></span></div>`).join('')}</div>`;
      return s;
    }

    /* ---------- Effekte (CSS wie ELMO-Hauskarte, Startzeit nach Uhrzeit -> kein Neustart) ---------- */
    _fxHtml(c, night, el) {
      const now = Date.now() / 1000, neg = (d, off) => (-((now + (off || 0)) % d)).toFixed(2);
      let sd = Math.floor(now / 3600) * 7919 + 17; const R = () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
      const rain = /rainy|pouring|hail|lightning/.test(c) && c !== 'snowy-rainy', snow = /snowy/.test(c), storm = /lightning|exceptional/.test(c);
      const fog = c === 'fog', partly = /partlycloudy/.test(c), sun = c === 'sunny' || (c === 'partlycloudy' && !night), stars = c === 'clear-night' || (partly && night);
      const showClouds = c === 'cloudy' || partly || rain || snow || /windy/.test(c);
      const fall = 130;
      let h = '';
      if (stars) {
        for (let i = 0; i < 40; i++) {
          const sz = (1 + R() * 1.1).toFixed(1), d = 3 + R() * 2.5;
          h += `<div class="star" style="left:${(R() * 100).toFixed(1)}%;top:${(R() * 92).toFixed(1)}%;width:${sz}px;height:${sz}px;animation-duration:${d.toFixed(2)}s;animation-delay:${neg(d, i * 1.3)}s"></div>`;
        }
        const md = 14, dirs = [[60, 22], [-60, 22], [56, 28], [-56, 28]], dr = dirs[Math.floor(R() * dirs.length)], ang = (Math.atan2(dr[1], dr[0]) * 180 / Math.PI + 180).toFixed(1);
        h += `<div class="shooting-star" style="top:${(6 + R() * 18).toFixed(1)}%;left:${(dr[0] > 0 ? 30 + R() * 30 : 55 + R() * 30).toFixed(1)}%;--mx:${dr[0]}px;--my:${dr[1]}px;--trail-rotate:${ang}deg;animation-duration:${md}s;animation-delay:${neg(md)}s"></div>`;
      }
      if (sun) {
        const gold = el < 10;
        h += `<div class="sun-light${gold ? ' gold' : ''}"></div><div class="sun-rays${gold ? ' gold' : ''}" style="animation-delay:${neg(90)}s, ${neg(7)}s"></div><div class="sun-sweep${gold ? ' gold' : ''}" style="animation-delay:${neg(14)}s"></div>`;
      }
      if (showClouds) {
        const stormy = rain || snow, n = partly && !stormy ? 4 : stormy ? 8 : 6, dark = Math.floor(R() * n), stag = 31.5 / n;
        const flash = storm ? Math.floor(R() * n) : -1;
        const rainSh = ['150,148,145', '120,118,116', '95,93,91', '165,162,158'], nightSh = ['95,99,120', '78,82,102', '110,114,132', '68,72,90'], nightRainSh = ['118,116,124', '100,98,108', '130,128,136', '108,106,118'];
        for (let i = 0; i < n; i++) {
          const big = i % 3 === 0, w = big ? 30 + R() * 10 : 18 + R() * 12, top = (2 + R() * 26).toFixed(1);
          const op = stormy ? (0.55 + R() * 0.3) : night ? (0.3 + R() * 0.2) : (0.25 + R() * 0.2);
          const d = 25 + R() * 13, del = (Number(neg(d)) - i * stag).toFixed(2);
          const rgb = stormy ? (night ? nightRainSh : rainSh)[Math.floor(R() * 4)] : night ? nightSh[Math.floor(R() * 4)] : (i === dark ? '175,172,168' : '255,255,255');
          const fl = i === flash;
          h += `<div class="cloud${fl ? ' flash' : ''}" style="top:${top}%;width:${w.toFixed(0)}%;--cloud-opacity:${op.toFixed(2)};--cloud-rgb:${rgb};--start-left:-${(w * 0.6).toFixed(0)}%;--end-left:${(104 - w * 0.4).toFixed(0)}%;animation-duration:${d.toFixed(1)}s${fl ? ', 3s' : ''};animation-delay:${del}s${fl ? ', ' + neg(3) + 's' : ''}"></div>`;
        }
      }
      if (rain) {
        const n = c === 'pouring' || storm ? 34 : 24, gap = 108 / n; let cur = -4;
        for (let i = 0; i < n; i++) {
          cur += gap * (0.45 + R() * 1.1);
          const d = (c === 'pouring' || storm ? 0.42 : 0.6) + R() * 0.12, len = (4.5 + R() * 2.5).toFixed(1);
          h += `<div class="rain-drop" style="left:${cur.toFixed(1)}%;width:.6px;height:${len}px;--fall:${fall}px;--drop-alpha:${(0.75 + R() * 0.25).toFixed(2)};--glow-alpha:${(0.55 + R() * 0.4).toFixed(2)};animation-duration:${d.toFixed(2)}s;animation-delay:${neg(d, i * 0.37)}s"></div>`;
        }
      }
      if (snow) {
        for (let i = 0; i < 34; i++) {
          const sz = (1.2 + R() * 1.5).toFixed(1), d = 3.5 + R() * 2.5;
          h += `<div class="snow-flake" style="left:${(R() * 104).toFixed(1)}%;width:${sz}px;height:${sz}px;--fall:${fall}px;animation-duration:${d.toFixed(2)}s;animation-delay:${neg(d, i * 0.9)}s"></div>`;
        }
      }
      if (fog) {
        for (let i = 0; i < 5; i++) {
          const d = 7 + i * 1.6 + R() * 2;
          h += `<div class="fog-band" style="top:${(18 + i * 15 + R() * 4).toFixed(1)}%;height:${(22 + R() * 8).toFixed(1)}%;--fog-opacity:${(0.5 - i * 0.045).toFixed(2)};animation-duration:${d.toFixed(2)}s;animation-delay:${neg(d)}s"></div>`;
        }
      }
      return h;
    }
  }

  customElements.define(TAG, WetterKarteCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Wetter-Karte', description: 'Aktuelles Wetter mit Effekten, Warnungen (DWD/NINA) und Vorhersage' });
})();
