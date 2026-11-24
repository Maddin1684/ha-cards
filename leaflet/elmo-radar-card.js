const ER_VERSION = '4.75.0'; // 4.75.0 (23.11.2026): Elm-Punkt gruen statt weiss, Beschriftung bleibt weiss; 4.74.0 (18.11.2026): Apple-Designsprache – Chips als Kapseln, Kartenecken konzentrisch (16 px)
const LEAF_JS = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js';
const LEAF_CSS = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
const LEAF_LOCAL = '/local/leaflet/';
const DWD_WMS = 'https://maps.dwd.de/geoserver/dwd/wms';
const DWD_LAYER = 'dwd:Radar_rv_product_1x1km_ger';
const DWD_CAP = 'https://maps.dwd.de/geoserver/dwd/Radar_rv_product_1x1km_ger/wms?service=WMS&version=1.3.0&request=GetCapabilities';
const DWD_LEG = l => 'https://maps.dwd.de/geoserver/dwd/wms?service=WMS&version=1.3.0&request=GetLegendGraphic&format=application/json&layer=' + l;
const DEM_URL = (z, x, y) => 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + z + '/' + x + '/' + y + '.png';
let LL = null, _erLp = null, _erCp = null;
const erPool = async (items, n, fn) => { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } })); };
const erFetch = (u, ms = 15000) => { const c = new AbortController(), t = setTimeout(() => c.abort(), ms); return fetch(u, { signal: c.signal }).finally(() => clearTimeout(t)); };
const erTxt = u => fetch(u).then(r => r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)));
const erLoadL = () => _erLp || (_erLp = import(LEAF_LOCAL + 'leaflet-src.esm.js').catch(() => import(LEAF_JS)).catch(e => { _erLp = null; throw e; }));
const erLoadCss = () => _erCp || (_erCp = erTxt(LEAF_LOCAL + 'leaflet.css').catch(() => erTxt(LEAF_CSS)).catch(e => { _erCp = null; throw e; }));
erLoadL().catch(() => {}); erLoadCss().catch(() => {});
const RP = [[0.1,'#64D2FF',0.20],[0.6,'#0A84FF',0.46],[3,'#30D158',0.62],[12,'#FFD60A',0.74],[25,'#FF9F0A',0.80],[50,'#FF453A',0.86],[200,'#BF5AF2',0.90]];
const SP = [[0.1,'#E5F4FF',0.40],[1,'#FFFFFF',0.70],[3,'#64D2FF',0.80],[5,'#5E5CE6',0.88]];
const WS = [[0,[216,232,255]],[20,[229,236,245]],[40,[255,214,10]],[60,[255,159,10]],[80,[255,69,58]]];
const WA = [0.40,0.60,0.80,0.88,0.95];
const BS = [[0,[255,255,255]],[5,[255,255,255]],[15,[255,214,10]],[30,[191,90,242]]];
const hx = h => [1,3,5].map(i => parseInt(h.slice(i, i + 2), 16));
const RPX = RP.map(p => [p[0], hx(p[1]), p[2]]);
const SPX = SP.map(p => [p[0], hx(p[1]), p[2]]);
function erSunCol(el, az) {
const g = Math.max(0, Math.min(1, (14 - el) / 14));
return az < 180 ? [255, Math.round(225 - 60 * g), Math.round(190 - 70 * g)] : [255, Math.round(225 - 75 * g), Math.round(150 - 110 * g)];
}
function palCol(v, P) {
const lo = P[0][0] * 0.3;
if (!(v >= lo)) return null;
if (v < P[0][0]) { const c = P[0][1]; return [c[0], c[1], c[2], 255 * P[0][2] * ((v - lo) / (P[0][0] - lo))]; }
for (let k = 1; k < P.length; k++) if (v < P[k][0]) {
const a = P[k-1], b = P[k], f = Math.log(v / a[0]) / Math.log(b[0] / a[0]);
return [a[1][0] + (b[1][0]-a[1][0])*f, a[1][1] + (b[1][1]-a[1][1])*f, a[1][2] + (b[1][2]-a[1][2])*f, 255*(a[2] + (b[2]-a[2])*f)];
}
const L = P[P.length-1]; return [L[1][0], L[1][1], L[1][2], 255 * L[2]];
}
function windCol(k, alpha) {
let r = WS[WS.length-1][1], a = WA[WA.length-1];
for (let i = 1; i < WS.length; i++) if (k < WS[i][0]) {
const f = (k - WS[i-1][0]) / (WS[i][0] - WS[i-1][0]);
r = WS[i-1][1].map((x, j) => x + (WS[i][1][j] - x) * f); a = WA[i-1] + (WA[i] - WA[i-1]) * f; break;
}
return 'rgba(' + Math.round(r[0]) + ',' + Math.round(r[1]) + ',' + Math.round(r[2]) + ',' + (alpha ? 1 : a.toFixed(2)) + ')';
}
function boltCol(a) {
for (let k = 1; k < BS.length; k++) if (a < BS[k][0]) {
const f = (a - BS[k-1][0]) / (BS[k][0] - BS[k-1][0]);
return BS[k-1][1].map((x, j) => Math.round(x + (BS[k][1][j] - x) * f));
}
return BS[BS.length-1][1];
}
function erSmooth(g, w, h) {
const t = new Float32Array(g.length);
for (let y = 0; y < h; y++) { const r = y * w; for (let x = 0; x < w; x++) { const l = g[r + Math.max(0, x - 1)], m = g[r + x], q = g[r + Math.min(w - 1, x + 1)]; t[r + x] = (l + 2 * m + q) / 4; } }
for (let y = 0; y < h; y++) { const u = Math.max(0, y - 1) * w, d = Math.min(h - 1, y + 1) * w, r = y * w; for (let x = 0; x < w; x++) g[r + x] = (t[u + x] + 2 * t[r + x] + t[d + x]) / 4; }
}
function erBil(g, w, h, x, y) {
if (x < 0) x = 0; else if (x > w - 1.001) x = w - 1.001;
if (y < 0) y = 0; else if (y > h - 1.001) y = h - 1.001;
const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = y0 * w + x0;
const a = g[i], b = g[i + 1], c = g[i + w], d = g[i + w + 1];
return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}
const ERN = []; for (let i = 0; i < 32 * 32; i++) ERN.push(Math.random());
function nz(x, y) {
x = ((x % 31) + 31) % 31; y = ((y % 31) + 31) % 31;
const xi = x | 0, yi = y | 0, x1 = (xi + 1) % 31, y1 = (yi + 1) % 31, fx = x - xi, fy = y - yi, sx = fx*fx*(3-2*fx), sy = fy*fy*(3-2*fy);
const a = ERN[yi*32+xi], b = ERN[yi*32+x1], d = ERN[y1*32+xi], e = ERN[y1*32+x1];
return a + (b-a)*sx + (d-a)*sy + (a-b-d+e)*sx*sy;
}
let ER_SPR = null;
const erGlowSprites = () => ER_SPR || (ER_SPR = Object.fromEntries(Object.entries({ sod: '255,150,50', led: '235,240,255', yel: '255,215,120', warm: '255,175,90', halo: '255,140,60', road: '255,172,62', amb: '255,168,60' }).map(([k, c]) => {
const s = document.createElement('canvas'); s.width = s.height = 32;
const g = s.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
gr.addColorStop(0, 'rgba(' + c + ',1)'); gr.addColorStop(0.35, 'rgba(' + c + ',.45)'); gr.addColorStop(1, 'rgba(' + c + ',0)');
g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return [k, s];
})));
/* Wetterpunkt aus Open-Meteo-Werten (Wind km/h + Richtung, Bewölkung gesamt/tief/mittel/hoch in %).
l: tiefe+mittlere Wolken (dichte Bewölkung), h: hohe Wolken (Cirrus); Windrichtung = Herkunft, Strömung zeigt in die Gegenrichtung */
const erWxPt = (sp, dr, cc, lo, mi, hi, sd, vis, sh, gu, t2, td) => {
sp = sp || 0; const dir = (dr || 0) * Math.PI / 180, tc = (cc || 0) / 100;
const sb = lo == null ? tc : Math.min(1, Math.max(lo / 100, (mi || 0) / 100 * 0.85, (hi || 0) / 100 * 0.3));
const lm = lo == null ? tc : Math.min(1, Math.max(lo / 100, (mi || 0) / 100)), hh = hi == null ? 0 : hi / 100;
const spread = t2 != null && td != null ? t2 - td : 9, fogS = (1 - erSm(0.5, 2.5, spread)) * (1 - erSm(5, 12, sp)), fogV = vis != null && isFinite(vis) ? 1 - erSm(200, 3000, vis) : 0;
return { u: -sp * Math.sin(dir), v: -sp * Math.cos(dir), c: tc, b: sb, l: lm, h: hh, lo: lo == null ? tc : lo / 100, mi: mi == null ? 0 : mi / 100,
sd: sd != null && isFinite(sd) ? Math.max(0, Math.min(1, sd / 3600)) : NaN, /* Schneefallgrenze plausibilisieren: das Modellfeld ist ohne Schneefall oft unsinnig niedrig (z. B. 150 m bei 8 °C);
     aus der Temperatur folgt eine Mindesthöhe (ca. 1 °C an der Grenze, 0,65 K je 100 m, Bezug ca. 250 m) */
    sh: (() => { const tl = t2 != null && isFinite(t2) ? 250 + (t2 - 1) / 0.0065 : NaN, m = sh != null && isFinite(sh) ? sh : NaN; return isFinite(tl) ? (isFinite(m) ? Math.max(m, tl) : tl) : m; })(), g: gu != null && isFinite(gu) ? gu : sp, fog: Math.max(fogV, fogS) };
};
const erTs = v => Date.parse(String(v || '').replace(/(\.\d{3})\d+/, '$1').replace(' ', 'T'));
const erLfAt = (NL, wx, wy) => {
const fx = (wx - NL.ox) / NL.cs - 0.5, fy = (wy - NL.oy) / NL.cs - 0.5, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
const g = (x, y) => x < 0 || y < 0 || x >= NL.w || y >= NL.h ? 0 : NL.d[y * NL.w + x];
const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
const v = (g(x0, y0) * (1 - sx) + g(x0 + 1, y0) * sx) * (1 - sy) + (g(x0, y0 + 1) * (1 - sx) + g(x0 + 1, y0 + 1) * sx) * sy;
return Math.min(1, v);
};
const erSm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const fbm = (x, y) => nz(x, y)*0.55 + nz(x*2.1+5, y*2.1+3)*0.30 + nz(x*4.3+9, y*4.3+1)*0.15;
function md(a, b, disp, depth, out) {
if (!depth) { out.push(b); return; }
const m = [(a[0]+b[0])/2 + (Math.random()-0.5)*disp, (a[1]+b[1])/2 + (Math.random()-0.5)*disp*0.35];
md(a, m, disp/2, depth-1, out); md(m, b, disp/2, depth-1, out);
}
function mkBolt() {
const s = [(Math.random()-0.5)*40, -72 - Math.random()*18], pts = [s];
md(s, [0, 0], 30, 5, pts);
const br = [], nb = 2 + Math.floor(Math.random()*3);
for (let i = 0; i < nb; i++) {
const k = 4 + Math.floor(Math.random()*20), p = pts[k], dir = Math.random() < 0.5 ? -1 : 1;
const e = [p[0] + dir*(8 + Math.random()*18), p[1] + 10 + Math.random()*16], bp = [p];
md(p, e, 10, 3, bp); br.push({ k, p: bp });
}
return { pts, br };
}
const PULSE = [[0.14,1],[0.26,0.75],[0.37,0.55]];
function pulseI(a) { let m = 0; for (const [t0, A] of PULSE) if (a >= t0) m = Math.max(m, A * Math.exp(-(a - t0) / 0.05)); return m; }
const BOLT_SHAPE = [[0.18,-1],[-0.62,0.14],[-0.04,0.14],[-0.2,1],[0.62,-0.16],[0.04,-0.16]];
const AC_PATH = {
jet: 'M12 1.6c.8 0 1.25 1 1.25 2.3V9l7.9 4.4c.4.2.55.55.55.95v.75l-8.45-2.5-.15 5.5 2.6 1.85v1.05L12 20.1l-3.75.9v-1.05l2.6-1.85-.15-5.5-8.45 2.5v-.75c0-.4.15-.75.55-.95L10.75 9V3.9c0-1.3.45-2.3 1.25-2.3z',
heavy: 'M12 .6c.95 0 1.45 1.2 1.45 2.7v5.1l9.2 5.3c.45.25.65.65.65 1.1v.9l-9.85-3.1-.15 6.3 3.1 2.2v1.2L12 21.3l-4.4 1v-1.2l3.1-2.2-.15-6.3-9.85 3.1v-.9c0-.45.2-.85.65-1.1l9.2-5.3V3.3c0-1.5.5-2.7 1.45-2.7z',
ga: 'M12 2.6c.65 0 1 .8 1 1.6v3.3l8.2.35v1.9l-8.2.4-.2 6.8 2.5.8v1.25l-3.3-.4-3.3.4v-1.25l2.5-.8-.2-6.8-8.2-.4V7.85l8.2-.35V4.2c0-.8.35-1.6 1-1.6z'
};
const AC_ENG = { jet: [[7.9,10.6],[16.1,10.6]], wide: [[7.6,10.7],[16.4,10.7]], heavy: [[8.9,9.9],[15.1,9.9],[5.4,11.9],[18.6,11.9]] };
const erMil = (hex, op, flag) => {
const h = parseInt(String(hex || '').trim(), 16), o = String(op || '');
if ((h >= 0x3EA000 && h <= 0x3EBFFF) || (h >= 0x3F4000 && h <= 0x3FBFFF) || /german air force|luftwaffe|bundeswehr|german navy|marineflieger|german army|heeresflieger/i.test(o)) return 'de';
if (flag || (h >= 0xAE0000 && h <= 0xAFFFFF) || (h >= 0x43C000 && h <= 0x43CFFF) || /air force|navy|army|military|armée de l/i.test(o)) return 'x';
return '';
};
const AC_SCALE = { mil: 1, jet: 0.95, wide: 1.1, heavy: 1.3, ga: 0.8, heli: 0.95, p1: 0.85, p2: 1.05, p4: 1.3 };
const AC_PROP = {
p1: { sp: 9, pr: [[0, -9.4, 3.6]] },
p2: { sp: 11, pr: [[-5, -4.2, 3.2], [5, -4.2, 3.2]] },
p4: { sp: 12.5, pr: [[-4.2, -4.2, 3], [4.2, -4.2, 3], [-8.5, -4, 3], [8.5, -4, 3]] }
};
const acPropPath = sp => { const p = new Path2D(); [[0,-9],[1.3,-7],[1.3,-3.2],[sp,-3],[sp,-0.6],[1.3,-0.4],[1,6.5],[4,7.4],[4,9],[0,8.5],[-4,9],[-4,7.4],[-1,6.5],[-1.3,-0.4],[-sp,-0.6],[-sp,-3],[-1.3,-3.2],[-1.3,-7]].forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
let AC_P2D = null;
const acPaths = () => AC_P2D || (AC_P2D = { jet: new Path2D(AC_PATH.jet), heavy: new Path2D(AC_PATH.heavy), ga: new Path2D(AC_PATH.ga), p1: acPropPath(AC_PROP.p1.sp), p2: acPropPath(AC_PROP.p2.sp), p4: acPropPath(AC_PROP.p4.sp) });
const HELI_RE = /^(EC|H1[0-9]|H16|H17|H2|AS3|AS5|AS6|A1[0-9][0-9]|A109|A119|A139|A149|A169|A189|AW|B06|B105|B212|B407|B412|B429|B47|BK17|R22|R44|R66|S76|S92|MI8|NH90|EH10|UH1|CH47|GAZL|ALO3|EXPL|LYNX)/;
const GA_RE = /^(C1[0-9][0-9]|C2[0-9][0-9]|C3[0-9][0-9]|C208|P28|P32|P46|PA[0-9]|DA4|DA2|DA6|DR40|DR10|SR2|BE[0-9]|M20|TB[0-9]|ULAC|GLID|AAT|RV[0-9]|PC6|PC7|PC9|PC12|PC21|TBM|KODI|G115|AQUI|C42|VL3|BRIS|SHRK|VIRU|FK9|FK12|FK14|TL20|TL30|TL40|STIN|KITF|EVSS|DYNA|SAVG|ATEC|MCR|ZEN|SKYL|TECN|P92|P2002|P210|ICP|EV97|PIVI|WT9|CTSW|TOBA|JAB|A210|SIRA|S22|NAVI|ZLIN|Z42|ECHO|DV20|FDCT|BR|SF25|ASK|LS[0-9]|DG[0-9]|ARCP|PNR|SKRA)/;
const HEAVY_RE = /^(A38|A34|B74|A124|A225|AN22|C5|IL96|IL76|IL86|B52|E3|K35R|KC135)/;
const WIDE_RE = /^(A33|A35|A30|A31|B76|B77|B78|MD11|DC10|A3ST|BLCF|B2|A400|C17)/;
const P4_RE = /^(A400|C130|C30J|L100|AN12|P3|DHC7|IL18)/;
const P2_RE = /^(AT4|AT7|ATP|DH8|DHC6|SF34|SB20|D228|D328|JS3|JS4|B190|BE20|BE30|BE9|BE10|BE55|BE58|BE60|BE76|BE95|DA42|DA62|P68|PA23|PA27|PA30|PA31|PA34|PA44|C303|C310|C320|C335|C340|C402|C404|C414|C421|C425|C441|E110|E120|F27|F50|L410|AN24|AN26|AN28|AN30|AN32|BN2|C212|CN35|C295|P180|SW4|MU2|AC90|DO28)/;
const GLIDER_RE = /^(GLID|ASK|ASW|ASG|ASH|LS[0-9]|DG[0-9]|ARCP|DUOD|DISC|VENT|JANU|NIMB|PUCH|SZD|BALL)/;
const easeBack = p => { const s = 1.70158; p -= 1; return p*p*((s+1)*p + s) + 1; };
const num = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const hhmm = t => { if (!t) return ''; const d = new Date(t * 1000); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const altTxt = f => f.ground || (f.altM != null && f.altM < 30) ? 'am Boden' : f.altM != null ? (Math.round(f.altM / 10) * 10).toLocaleString('de-DE') + ' m' : '–';
const ER_DEFAULTS = {
title: 'Radar Elm', home_label: 'Elm', height: 420, zoom: 9.75, latitude: null, longitude: null,
map_brightness: 0.6, map_contrast: 1.12, map_saturation: 0.9, radar_opacity: 1, cloud_strength: 0.5, mid_cloud_opacity: 0.6, sun_strength: 1, relief_strength: 1, night_brightness: 0.55, night_town_level: 1, night_road_level: 1,
show_wind: true, show_clouds: true, cloud_layers: true, show_fog: true, sun_layer: true, sun_spots: true, sun_rays: true, sun_grade: true, night_lights: true, night_colors: true, night_points: true, night_roads: true, night_glow: true, show_lightning: true, show_places: true, show_legend: true, show_status: true, show_attribution: false,
forecast_minutes: 120, loop_seconds: 20, hold_seconds: 1.5, fps: 30, particles: 120,
temperature_entity: 'sensor.wohnen_wohnen_wohnen_aussen_temperature', snow_below: 1.0, warning_entity: 'sensor.stadt_schluchtern_aktuelle_warnstufe',
lightning_minutes: 30, lightning_range_km: 50, storm_radius_km: 15, flash_radius_km: 8,
show_flights: true, show_flight_labels: true, show_flight_route: true, show_nav_lights: true, flight_color: [48, 177, 88], flights_entity: 'sensor.flightradar24_current_in_area', flight_max_alt_m: 0,
adsb_entity: 'sensor.adsb_aircraft_raw', adsb_filter: '',
wx_entity: 'sensor.elmo_radar_wetterdaten', radar_local: true, nowcast_entity: 'sensor.dwd_nowcast_minuten_forecast',
rv_factor: 12, radar_blur: 0, debug: false
};
class ElmoRadarCard extends HTMLElement {
setConfig(config) {
this._cfg = Object.assign({}, ER_DEFAULTS, config || {});
if (this._built) this._applyCfg();
}
getCardSize() { return 8; }
static getStubConfig() { const o = {}; for (const k in ER_DEFAULTS) if (ER_DEFAULTS[k] !== null) o[k] = ER_DEFAULTS[k]; return o; }
static getConfigElement() { return document.createElement('elmo-radar-card-editor'); }
static _form() {
const num = (min, max, step, unit) => ({ number: Object.assign({ min, max, step, mode: 'slider' }, unit ? { unit_of_measurement: unit } : {}) });
const bool = { boolean: {} };
const L = {
title: 'Titel (Kartenversion ' + ER_VERSION + ')', home_label: 'Name des Heimatorts', height: 'Kartenhöhe', zoom: 'Zoomstufe', latitude: 'Breitengrad (leer = HA-Standort)', longitude: 'Längengrad (leer = HA-Standort)',
temperature_entity: 'Temperatursensor (Regen/Schnee)', snow_below: 'Schnee unter', warning_entity: 'DWD-Warnstufen-Sensor',
map_brightness: 'Helligkeit Satellitenbild', map_contrast: 'Kontrast Satellitenbild', map_saturation: 'Farbsättigung Satellitenbild',
radar_opacity: 'Deckkraft Regen', cloud_strength: 'Stärke Wolken', mid_cloud_opacity: 'Deckkraft mittelhohe Wolken', sun_strength: 'Stärke Sonnenlicht', relief_strength: 'Stärke Relief-Schatten (0 = aus)', night_brightness: 'Helligkeit Nachtlichter (Satellitenbild)', night_town_level: 'Helligkeit Schein über Orten', night_road_level: 'Helligkeit Straßen',
show_wind: 'Windpartikel', show_clouds: 'Wolken', cloud_layers: 'Wolken-Stockwerke (Mittelschicht und Cirrus; aus = nur Quellwolken)', show_fog: 'Talnebel', sun_layer: 'Sonnenlicht (alle Sonnen-Effekte)', sun_spots: 'Sonnenflecken und Wolkenschatten', sun_rays: 'Lichtstrahlen', sun_grade: 'Farbstimmung nach Tageszeit', night_lights: 'Nachtlichter', night_colors: 'Nacht: Lichtfarben (Natrium orange, LED weiß)', night_points: 'Nacht: Schein über größeren Orten', night_roads: 'Nacht: Straßenbänder', night_glow: 'Nacht: Lichtglocke und angestrahlte Wolken', show_lightning: 'Blitze',
show_places: 'Ortsnamen', show_legend: 'Legende', show_status: 'Statuszeile unter dem Titel', show_attribution: 'Quellenhinweis (Copyright)',
forecast_minutes: 'Vorhersagezeitraum', loop_seconds: 'Dauer eines Durchlaufs', hold_seconds: 'Pause am Anfang', fps: 'Bildrate', particles: 'Anzahl Windpartikel',
lightning_minutes: 'Blitze anzeigen für', lightning_range_km: 'Blitz-Entfernung anzeigen bis', storm_radius_km: 'Gewitter-Radius', flash_radius_km: 'Lichtschein-Größe beim Einschlag (0 = aus)',
show_flights: 'Flugzeuge (Button auf der Karte)', show_flight_labels: 'Kennung und Höhe anzeigen', show_flight_route: 'Route anzeigen (z. B. FRA–AMS)', show_nav_lights: 'Positionslichter (Blitze rot/grün)', flight_color: 'Farbe der Flugzeuge', flights_entity: 'Flightradar24-Sensor', flight_max_alt_m: 'Nur Flüge unter (0 = alle)',
adsb_entity: 'ADS-B-Sensor (eigener Empfänger, ergänzt Flightradar24)', adsb_filter: 'ADS-B: nur Kennungen beginnend mit (leer = alle)',
wx_entity: 'Wetterdaten-Sensor (von Home Assistant vorgeladen)', radar_local: 'Radarbilder von Home Assistant vorladen lassen (/local/radar)', nowcast_entity: 'Nowcast-Sensor für den Regen-Countdown (minütlich)', rv_factor: 'Umrechnungsfaktor DWD-RV', radar_blur: 'Zusätzliche Regen-Unschärfe', debug: 'Diagnosezeile anzeigen'
};
return {
schema: [
{ name: 'title', selector: { text: {} } },
{ type: 'expandable', name: 'g_map', title: 'Karte', flatten: true, schema: [
{ name: 'home_label', selector: { text: {} } },
{ name: 'height', selector: num(250, 800, 10, 'px') },
{ name: 'zoom', selector: num(6, 12, 0.25) },
{ type: 'grid', name: 'g_pos', flatten: true, schema: [{ name: 'latitude', selector: { number: { step: 0.0001, mode: 'box' } } }, { name: 'longitude', selector: { number: { step: 0.0001, mode: 'box' } } }] }
] },
{ type: 'expandable', name: 'g_look', title: 'Helligkeit und Farben', flatten: true, schema: [
{ name: 'map_brightness', selector: num(0.2, 1.2, 0.05) },
{ name: 'map_contrast', selector: num(0.8, 1.6, 0.02) },
{ name: 'map_saturation', selector: num(0, 1.6, 0.05) },
{ name: 'radar_opacity', selector: num(0.3, 1, 0.05) },
{ name: 'cloud_strength', selector: num(0, 2, 0.1) },
{ name: 'mid_cloud_opacity', selector: num(0, 1, 0.05) },
{ name: 'sun_strength', selector: num(0, 2, 0.1) },
{ name: 'relief_strength', selector: num(0, 2, 0.1) },
{ name: 'night_brightness', selector: num(0, 1, 0.05) },
{ name: 'night_town_level', selector: num(0, 2, 0.1) },
{ name: 'night_road_level', selector: num(0, 3, 0.1) }
] },
{ type: 'expandable', name: 'g_layers', title: 'Ebenen und Anzeigen', flatten: true, schema: [
{ type: 'grid', name: 'g_l1', flatten: true, schema: [
{ name: 'show_wind', selector: bool }, { name: 'show_clouds', selector: bool },
{ name: 'sun_layer', selector: bool }, { name: 'night_lights', selector: bool },
{ name: 'sun_spots', selector: bool }, { name: 'sun_rays', selector: bool },
{ name: 'sun_grade', selector: bool }, { name: 'cloud_layers', selector: bool },
{ name: 'show_fog', selector: bool },
{ name: 'night_colors', selector: bool }, { name: 'night_points', selector: bool },
{ name: 'night_roads', selector: bool }, { name: 'night_glow', selector: bool },
{ name: 'show_lightning', selector: bool }, { name: 'show_places', selector: bool },
{ name: 'show_legend', selector: bool }, { name: 'show_status', selector: bool },
{ name: 'show_attribution', selector: bool }
] }
] },
{ type: 'expandable', name: 'g_air', title: 'Flugzeuge', flatten: true, schema: [
{ type: 'grid', name: 'g_a1', flatten: true, schema: [{ name: 'show_flights', selector: bool }, { name: 'show_flight_labels', selector: bool }, { name: 'show_nav_lights', selector: bool }, { name: 'show_flight_route', selector: bool }] },
{ name: 'flight_color', selector: { color_rgb: {} } },
{ name: 'flights_entity', selector: { entity: { domain: 'sensor' } } },
{ name: 'flight_max_alt_m', selector: num(0, 12000, 500, 'm') },
{ name: 'adsb_entity', selector: { entity: { domain: 'sensor' } } },
{ name: 'adsb_filter', selector: { text: {} } }
] },
{ type: 'expandable', name: 'g_anim', title: 'Animation', flatten: true, schema: [
{ name: 'forecast_minutes', selector: num(30, 120, 15, 'min') },
{ name: 'loop_seconds', selector: num(4, 40, 1, 's') },
{ name: 'hold_seconds', selector: num(0, 5, 0.5, 's') },
{ name: 'fps', selector: num(10, 60, 5) },
{ name: 'particles', selector: num(0, 400, 10) }
] },
{ type: 'expandable', name: 'g_sens', title: 'Sensoren', flatten: true, schema: [
{ name: 'temperature_entity', selector: { entity: { domain: 'sensor' } } },
{ name: 'snow_below', selector: num(-3, 3, 0.5, '°C') },
{ name: 'warning_entity', selector: { entity: { domain: 'sensor' } } },
{ name: 'wx_entity', selector: { entity: { domain: 'sensor' } } },
{ name: 'radar_local', selector: bool },
{ name: 'nowcast_entity', selector: { entity: { domain: 'sensor' } } }
] },
{ type: 'expandable', name: 'g_bolt', title: 'Blitze und Gewitter', flatten: true, schema: [
{ name: 'lightning_minutes', selector: num(5, 60, 5, 'min') },
{ name: 'lightning_range_km', selector: num(5, 150, 5, 'km') },
{ name: 'storm_radius_km', selector: num(5, 50, 1, 'km') },
{ name: 'flash_radius_km', selector: num(0, 30, 1, 'km') }
] },
{ type: 'expandable', name: 'g_exp', title: 'Experten', flatten: true, schema: [
{ name: 'rv_factor', selector: num(1, 24, 1) },
{ name: 'radar_blur', selector: num(0, 6, 0.5, 'px') },
{ name: 'debug', selector: bool }
] }
],
computeLabel: s => L[s.name] || s.title || s.name
};
}
set hass(h) {
this._hass = h;
if (!this._built) this._build();
const se = this._cfg.wx_entity ? h.states[this._cfg.wx_entity] : null;
if (se !== this._wxSt) { this._wxSt = se; if (this._map && se) this._loadWx().catch(() => {}); }
const rse = h.states[this._cfg.radar_entity || 'sensor.elmo_radar_bilder'];
if (rse && rse.state !== this._rSt) { const first = this._rSt == null; this._rSt = rse.state; if (!first && this._map) this._loadRadar().catch(() => {}); }
this._syncStrikes();
this._syncFlights();
}
connectedCallback() {
this._running = true;
if (!this._visH) { this._visH = () => { if (document.visibilityState === 'visible') this._freshen(); }; document.addEventListener('visibilitychange', this._visH); }
this._freshen();
if (this._map) requestAnimationFrame(() => requestAnimationFrame(() => { if (!this._map) return; this._map.invalidateSize(); this._resize(); this._layout(); this._kickN = 0; this._kick(); this._start(); }));
}
disconnectedCallback() { this._running = false; this._stop(); clearTimeout(this._kickT); if (this._map) { this._setLock(true); this._setPause(false); } }
_build() {
this._built = true;
const root = this.attachShadow({ mode: 'open' });
root.innerHTML = `
<style id="lcss"></style>
<style>
ha-card{padding:12px;overflow:hidden;font-family:var(--primary-font-family, inherit)}
ha-card.noattr .leaflet-control-attribution{display:none!important}
.hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:8px}
.hd.stack{flex-direction:column;align-items:stretch;gap:6px}
.hd.stack .bd{justify-content:space-between}
.ttl{font-family:var(--primary-font-family, inherit);font-size:var(--title-font-size, var(--ha-card-header-font-size, 22px));font-weight:400;line-height:1.25;color:var(--primary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-left:2px}
.bdw{display:flex;flex-direction:column;align-items:stretch;gap:4px;flex:none;min-width:96px}
.bdw .ck{align-self:flex-end;margin-top:calc((var(--title-font-size, var(--ha-card-header-font-size, 22px)) * 1.25 - 20px) / 2)}
ha-card.cmp .bdw .ck{margin-top:calc((var(--title-font-size, var(--ha-card-header-font-size, 22px)) * 1.25 - 18px) / 2)}
.chs{display:flex;flex-wrap:wrap;gap:4px;margin:-2px 0 8px}
.cdr{font-size:11px;line-height:14px;color:var(--secondary-text-color);text-align:right;white-space:nowrap;margin-top:-3px}
.cdr:empty{display:none}
ha-card.cmp .cdr{font-size:10px;line-height:12px}
.gx{display:none!important}
.chs.hasg .gx{display:flex!important}
.bd{font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.08);display:flex;align-items:center;gap:4px;font-variant-numeric:tabular-nums;white-space:nowrap;color:#fff}
.bd ha-icon{--mdc-icon-size:13px;display:flex}
.sep{width:1px;height:11px;background:rgba(255,255,255,.22);margin:0 2px}
.bx{display:none!important}
.chs.hasb .bx{display:flex!important}
.tkr{display:flex;align-items:center;gap:6px}
.trk{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.12);overflow:hidden}
.trk div{height:100%;width:100%;background:#8E8E93;transform-origin:0 50%;transform:scaleX(0);will-change:transform;transition:background .2s}
.trk.pz div{background:#fff}
.spn{flex:none;width:9px;height:9px;border-radius:50%;border:1.5px solid rgba(255,255,255,.22);border-top-color:#fff;animation:erSpin .8s linear infinite;transition:opacity .4s}
.spn.done{opacity:0;width:0;border-width:0;margin-right:-6px}
@keyframes erSpin{to{transform:rotate(360deg)}}
.mw{position:relative;border-radius:16px;overflow:hidden;background:#0e1620}
#map{position:absolute;inset:0;background:#0e1620;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.leaflet-container{font:inherit;background:#0e1620}
.er-sat{filter:brightness(var(--er-bright,.6)) contrast(var(--er-con,1.12)) saturate(var(--er-satu,.9))}
.leaflet-control-attribution{background:rgba(0,0,0,.45)!important;color:#8e8e93!important;font-size:8px!important;padding:0 4px!important}
.leaflet-control-attribution a{color:#aeaeb2!important}
.leaflet-control-zoom a{background:rgba(28,28,30,.85)!important;color:#fff!important;border-color:rgba(255,255,255,.12)!important}
.er-ov{position:absolute;left:0;top:0;pointer-events:none}
.er-hl{color:#fff;font-size:13px;font-weight:700;text-shadow:0 0 3px #000,0 0 3px #000,0 0 6px #000;white-space:nowrap;position:absolute;left:8px;top:-7px;line-height:16px}
.hb{position:absolute;top:8px;left:8px;z-index:1000;width:32px;height:32px;border-radius:50%;border:0;padding:0;display:flex;align-items:center;justify-content:center;background:rgba(28,28,30,.78);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;cursor:pointer;--mdc-icon-size:18px;-webkit-tap-highlight-color:transparent}
.fb{top:46px}
.fb.off{color:#8e8e93}
.lk{top:84px}
.ps{position:absolute;top:8px;left:50%;z-index:1000;transform:translate(-50%,-4px);display:flex;align-items:center;gap:4px;padding:4px 10px 4px 8px;border-radius:999px;background:rgba(28,28,30,.78);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;font-size:11px;font-weight:600;--mdc-icon-size:13px;opacity:0;transition:opacity .18s,transform .18s;pointer-events:none}
.ps ha-icon{display:flex}
.ps.on{opacity:1;transform:translate(-50%,0)}
.er-home{position:relative;width:4px;height:4px;border-radius:50%;background:#30d158;box-shadow:0 0 2px rgba(0,0,0,.7)}
.er-home::before{content:'';position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:radial-gradient(circle,rgba(48,209,88,.75),rgba(48,209,88,0) 70%);animation:erBreath 3s ease-in-out infinite;z-index:-1}
@keyframes erBreath{0%,100%{transform:scale(.7);opacity:.6}50%{transform:scale(1.4);opacity:1}}
.msg{position:absolute;left:8px;bottom:74px;z-index:900;font-size:11px;color:#fff;background:rgba(0,0,0,.55);padding:3px 7px;border-radius:6px;display:none}
.lg{position:absolute;left:8px;right:8px;bottom:var(--er-lgb,18px);z-index:900;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:5px 8px 4px;border-radius:8px;background:rgba(28,28,30,.74);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#e5e5ea;pointer-events:none}
.lh{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;margin-bottom:3px;white-space:nowrap}
.lh ha-icon{--mdc-icon-size:13px;display:flex}
.bar{height:4px;border-radius:2px}
.tk{display:flex;justify-content:space-between;font-size:9px;line-height:11px;color:#aeaeb2;margin-top:2px}
.lft{display:flex;flex-direction:column;gap:0;min-width:0;flex:1 1 auto}
.cdn .seg{white-space:nowrap}
.cdn{min-height:16px;line-height:16px;font-size:12px;font-weight:400;color:var(--secondary-text-color);white-space:normal;overflow-wrap:break-word;font-variant-numeric:tabular-nums;margin-left:2px}
.er-night{mix-blend-mode:screen;filter:blur(5px) saturate(.75);transition:opacity 2s linear}
.wa{display:none!important;--mdc-icon-size:13px}
.wa.on{display:flex!important}
.fs{position:absolute;left:8px;right:8px;bottom:var(--er-lgb,18px);z-index:950;background:rgba(28,28,30,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:12px;color:#f2f2f7;padding:10px 12px;font-size:12px;transform:translateY(130%);transition:transform .28s ease;font-variant-numeric:tabular-nums;--fc:#FFC400}
.fs.on{transform:none}
.fs-h{display:flex;gap:10px;align-items:center}
img.fs-ph{height:auto;max-height:60px;background:none;object-fit:contain;align-self:center}
.fs-ph{width:76px;height:50px;border-radius:7px;object-fit:contain;background:linear-gradient(135deg,#3a4a5c,#1d2733);flex:none;display:flex;align-items:center;justify-content:center;color:var(--fc);--mdc-icon-size:22px}
.fs-ph.r{width:44px;height:44px;border-radius:50%}
.fs-tt{min-width:0}
.fs-t1{font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fs-t2{color:#aeaeb2;font-size:11px;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fs-t3{color:#30D158;font-size:11px;font-weight:600;margin-top:2px;white-space:nowrap}
.fs-x{margin-left:auto;align-self:flex-start;flex:none;width:26px;height:26px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#d1d1d6;font-size:13px;line-height:26px;cursor:pointer;padding:0}
.fs-rt{display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px}
.fs-ap{font-size:20px;font-weight:600;letter-spacing:.5px}
.fs-ap small{display:flex;align-items:center;gap:4px;font-size:10px;font-weight:400;color:#aeaeb2;letter-spacing:0}
.fs-r small{justify-content:flex-end}
.fs-ap{min-width:0;max-width:49%}
.fs-on{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fs-fl{width:14px;height:10px;border-radius:1.5px;object-fit:cover;box-shadow:0 0 0 .5px rgba(255,255,255,.35);flex:none}
ha-card.cmp .fs-fl{width:12px;height:9px}
.fs-r{text-align:right}
.fs-bar{position:relative;height:4px;border-radius:2px;background:rgba(255,255,255,.14);margin:10px 0 6px}
.fs-bar i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:2px;background:var(--fc)}
.fs-bar span{position:absolute;left:0;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;color:var(--fc);--mdc-icon-size:16px;display:flex;align-items:center;justify-content:center;transform:rotate(45deg);filter:drop-shadow(0 0 1px rgba(0,0,0,.95)) drop-shadow(0 0 1.5px rgba(0,0,0,.7))}
.fs-bar span ha-icon{display:flex}
.fs-tm{display:flex;justify-content:space-between;color:#aeaeb2;font-size:10px}
.fs-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:10px}
.fs-g div{background:rgba(255,255,255,.07);border-radius:7px;padding:5px 6px;min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:2px}
.fs-g small{display:block;color:#8e8e93;font-size:9px;line-height:11px;white-space:normal;hyphens:none;-webkit-hyphens:none;word-break:normal;overflow-wrap:normal}
.fs-g b{font-weight:600;font-size:12px;white-space:nowrap}
ha-card.cmp .bd{font-size:10px;padding:2px 8px;gap:3px;border-radius:999px}
ha-card.cmp .bd ha-icon,ha-card.cmp .wa{--mdc-icon-size:11px}
ha-card.cmp .sep{height:9px;margin:0 1px}
ha-card.cmp .cdn{font-size:11px}
ha-card.cmp .ps{font-size:10px;--mdc-icon-size:11px;padding:3px 8px 3px 6px}
ha-card.cmp .lg{left:6px;right:6px;gap:8px;padding:3px 6px 2px;border-radius:6px}
ha-card.cmp .lh{font-size:9.5px;gap:3px;margin-bottom:2px}
ha-card.cmp .lh ha-icon{--mdc-icon-size:10px}
ha-card.cmp .bar{height:3px}
ha-card.cmp .tk{font-size:8px;line-height:9px;margin-top:1px}
.lgf{grid-column:1/-1;display:flex;align-items:center;gap:5px;font-size:9px;line-height:11px;color:#8e8e93;margin-top:-6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
.lgf i{flex:none;width:4px;height:4px;border-radius:50%;background:#8e8e93;opacity:.7;margin-right:-1px}
#lgdw,#lgsq{margin-left:6px}
ha-card.cmp .lgf{font-size:8px;line-height:9px;margin-top:-5px}
ha-card.cmp .fs{left:6px;right:6px;padding:8px 10px;border-radius:10px}
ha-card.cmp .fs-h{gap:8px}
ha-card.cmp img.fs-ph{height:auto;max-height:42px}
ha-card.cmp .fs-ph{width:52px;height:34px;border-radius:5px;--mdc-icon-size:17px}
ha-card.cmp .fs-ph.r{width:34px;height:34px}
ha-card.cmp .fs-t1{font-size:13px}
ha-card.cmp .fs-t2,ha-card.cmp .fs-t3{font-size:10px}
ha-card.cmp .fs-x{width:22px;height:22px;line-height:22px;font-size:11px}
ha-card.cmp .fs-rt{margin-top:6px}
ha-card.cmp .fs-ap{font-size:15px}
ha-card.cmp .fs-ap small{font-size:9px}
ha-card.cmp .fs-bar{height:3px;margin:7px 0 4px}
ha-card.cmp .fs-bar span{--mdc-icon-size:13px;width:13px;height:13px;margin:-6.5px 0 0 -6.5px}
ha-card.cmp .fs-tm{font-size:9px}
ha-card.cmp .fs-g{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding-top:6px;border-top:1px solid rgba(255,255,255,.1)}
ha-card.cmp .fs-g div{background:none;padding:0;gap:0;border-radius:0;justify-content:flex-start;min-width:0}
ha-card.cmp .fs-g small{font-size:8.5px;line-height:10px;white-space:nowrap}
ha-card.cmp .fs-g b{font-size:11px}
</style>
<ha-card>
<div class="hd" id="hd">
<div class="lft" id="lft"><span class="ttl" id="ttl"></span><div class="cdn" id="cdn"></div></div>
<div class="bdw" id="bdw">
<div class="bd ck"><ha-icon class="wa" id="wa" icon="mdi:alert"></ha-icon><span id="tm">--:--</span></div>
<div class="tkr"><span class="spn" id="spn" title="Lädt …"></span><div class="trk" id="trk"><div id="pb"></div></div></div>
<div class="cdr" id="cdr"></div>
</div>
</div>
<div class="chs" id="chs">
<div class="bd"><ha-icon id="wic" icon="mdi:weather-cloudy"></ha-icon><span id="mm"></span></div>
<div class="bd"><ha-icon id="wi" icon="mdi:weather-windy"></ha-icon><span id="wd">– km/h</span></div>
<div class="bd gx" id="gc"><ha-icon id="gi" icon="mdi:weather-windy-variant"></ha-icon><span id="gd"></span></div>
<div class="bd bx" id="bc"><ha-icon id="bi" icon="mdi:lightning-bolt"></ha-icon><span id="bk"></span></div>
</div>
<div class="mw" id="mw"><div id="map"></div><div class="msg" id="msg"></div><button class="hb" id="hb" title="Zuhause zentrieren"><ha-icon icon="mdi:home-map-marker"></ha-icon></button><button class="hb fb" id="fb" title="Flugzeuge ein/aus"><ha-icon icon="mdi:airplane"></ha-icon></button><button class="hb lk" id="lk" title="Karte entsperren"><ha-icon icon="mdi:lock"></ha-icon></button>
<div class="ps" id="ps"><ha-icon icon="mdi:pause"></ha-icon><span>Pausiert</span></div>
<div class="lg" id="lg">
<div><div class="lh"><ha-icon id="lgRi" icon="mdi:water"></ha-icon><span id="lgRt">Regen</span></div><div class="bar" id="rb"></div><div class="tk"><span>leicht</span><span>stark</span></div></div>
<div><div class="lh"><ha-icon icon="mdi:weather-windy"></ha-icon><span id="lgWt">Wind</span></div><div class="bar" style="background:linear-gradient(90deg,rgba(216,232,255,.45),#E5ECF5 25%,#FFD60A 50%,#FF9F0A 75%,#FF453A)"></div><div class="tk"><span>schwach</span><span>stark</span></div></div>
<div><div class="lh"><ha-icon icon="mdi:lightning-bolt"></ha-icon><span>Blitze</span></div><div class="bar" style="background:linear-gradient(90deg,#FFFFFF 0%,#FFFFFF 12%,#FFD60A 40%,#FFD60A 55%,#BF5AF2 85%,#BF5AF2)"></div><div class="tk"><span>neu</span><span>alt</span></div></div>
<div class="lgf" id="lgf"><i id="lgdr"></i><span id="lgsr">Radar lädt …</span><i id="lgdw"></i><span id="lgsw">Wolken laden …</span><span id="lgsq"></span></div>
</div>
<div class="fs" id="sh"></div></div>
</ha-card>`;
this.$ = id => root.getElementById(id);
try { this._flOn = localStorage.getItem('er_flights') !== '0'; } catch (e) { this._flOn = true; }
const sh = this.$('sh');
['pointerdown', 'touchstart', 'mousedown', 'dblclick', 'wheel'].forEach(t => sh.addEventListener(t, e => e.stopPropagation(), { passive: true }));
sh.addEventListener('click', e => { e.stopPropagation(); if (e.target.closest && e.target.closest('.fs-x')) this._closeSheet(); });
this._applyCfg();
this._snow = null; this._setScale(false);
this._boot();
}
async _boot() {
let L, css;
for (let i = 0; i < 3 && !L; i++) {
try { [L, css] = await Promise.all([erLoadL(), erLoadCss()]); }
catch (e) { if (i === 2) { this._msg('Kartenbibliothek nicht ladbar – bitte neu laden'); return; } await new Promise(z => setTimeout(z, 1500)); }
}
LL = L;
this.shadowRoot.getElementById('lcss').textContent = css;
await new Promise(res => { const chk = () => (this.$('mw').offsetWidth > 0 && this.$('mw').offsetHeight > 0) ? res() : requestAnimationFrame(chk); chk(); });
this._initMap();
}
_applyCfg() {
const c = this._cfg;
this.$('ttl').textContent = c.title;
this.$('mw').style.height = c.height + 'px';
const mw = this.$('mw');
mw.style.setProperty('--er-bright', c.map_brightness);
mw.style.setProperty('--er-con', c.map_contrast);
mw.style.setProperty('--er-satu', c.map_saturation);
this.$('lg').style.display = c.show_legend === false ? 'none' : '';
this.$('cdn').style.display = c.show_status === false ? 'none' : '';
this.$('fb').style.display = c.show_flights === false ? 'none' : '';
this.$('lk').style.top = c.show_flights === false ? '46px' : '';
this.$('sh').style.setProperty('--fc', this._flColors().Y);
const card = this.shadowRoot.querySelector('ha-card'); if (card) card.classList.toggle('noattr', c.show_attribution !== true);
this._fbState();
this._flSt = null; this._adSt = null; this._hdKey = null; this._lgK = null;
if (this._cvR) { this._cvR.style.opacity = c.radar_opacity; this._cvR.style.filter = c.radar_blur ? 'blur(' + c.radar_blur + 'px)' : ''; }
if (this._map) {
if (this._lastZoom !== undefined && this._lastZoom !== c.zoom) this._map.setView(this._home(), c.zoom);
this._cRef = null; this._cPrev = null; this._nAt = 0; this._nK = null; this._nP = null; this._drawPlaces(); this._resize();
if (this._night) { const on = c.night_lights !== false; if (on && !this._map.hasLayer(this._night)) this._night.addTo(this._map); if (!on && this._map.hasLayer(this._night)) this._map.removeLayer(this._night); }
if (this._lastFc !== undefined && this._lastFc !== c.forecast_minutes) this._loadRadar().catch(() => {});
if (c.show_places !== false) this._loadPlaces();
this._loadRoads();
this._loadDem();
}
this._lastZoom = c.zoom; this._lastFc = c.forecast_minutes;
this._layout();
}
/* Kompaktmodus für schmale Karten auf großen Bildschirmen (iPad, mehrspaltige Dashboards)
+ Legende und Infokarte direkt über dem Quellenhinweis bzw. am unteren Rand, wenn er ausgeblendet ist */
_layout() {
const card = this.shadowRoot && this.shadowRoot.querySelector('ha-card'), mw = this.$('mw');
if (!card || !mw) return;
const w = mw.offsetWidth;
if (w) {
const cmp = w < 560 && window.innerWidth >= 700;
if (card.classList.contains('cmp') !== cmp) { card.classList.toggle('cmp', cmp); this._hdKey = null; }
}
if (this._cfg.show_attribution !== true) { mw.style.setProperty('--er-lgb', '6px'); return; }
if (this._map && this._map.attributionControl) {
const a = this._map.attributionControl.getContainer(), h = a && a.offsetHeight ? a.offsetHeight : 12;
mw.style.setProperty('--er-lgb', (h + 4) + 'px');
}
}
/* Kopfzeile: Balken neben der Überschrift; erst wenn Überschrift/Statuszeile und Balken
nicht mehr mit mindestens 16 px Luft nebeneinander passen, rutscht der Balken in voller Breite darunter */
_fitHead() {
const hd = this.$('hd'), bd = this.$('chs'), cdn = this.$('cdn');
const key = bd.textContent + '|' + bd.className + '|' + this.$('wa').className + '|' + this.$('mm').style.display + '|' + hd.offsetWidth + '|' + cdn.textContent;
if (key === this._hdKey || !hd.offsetWidth) return;
this._hdKey = key;
this._layout();
hd.classList.remove('stack');
const textW = this.$('ttl').scrollWidth + 2;
const need = textW + 16 + this.$('bdw').offsetWidth;
hd.classList.remove('stack'); void need;
}
_flColors() {
const v = this._cfg.flight_color;
let rgb = Array.isArray(v) && v.length >= 3 ? v.slice(0, 3).map(n => Math.max(0, Math.min(255, Math.round(+n || 0))))
: (typeof v === 'string' && /^#?[0-9a-f]{6}$/i.test(v.trim()) ? hx('#' + v.trim().replace('#', '')) : [255, 196, 0]);
const k = rgb.join(',');
if (this._flcK === k) return this._flc;
const mix = (t, to) => rgb.map(c => Math.round(c + (to - c) * t)).join(',');
this._flcK = k;
return this._flc = { Y: 'rgb(' + k + ')', E: 'rgb(' + rgb.map(c => Math.round(c * 0.79)).join(',') + ')', R: 'rgba(' + mix(0.45, 255) + ',.85)', L: 'rgba(' + mix(0.35, 255) + ',.95)', a: al => 'rgba(' + k + ',' + al + ')' };
}
_fbState() {
const fb = this.$('fb'); if (!fb) return;
fb.classList.toggle('off', !this._flOn);
fb.querySelector('ha-icon').setAttribute('icon', this._flOn ? 'mdi:airplane' : 'mdi:airplane-off');
}
_msg(t) { const m = this.$('msg'); if (!m) return; m.textContent = t || ''; m.style.display = t ? 'block' : 'none'; }
_home() {
const c = this._cfg, h = this._hass;
return [c.latitude != null ? c.latitude : h.config.latitude, c.longitude != null ? c.longitude : h.config.longitude];
}
_initMap() {
const L = LL, el = this.$('map'), home = this._home();
const map = this._map = L.map(el, { zoomControl: false, attributionControl: true, zoomAnimation: false, scrollWheelZoom: false, dragging: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, zoomSnap: 0.25, zoomDelta: 0.5, minZoom: 6, maxZoom: 12 }).setView(home, this._cfg.zoom);
map.attributionControl.setPrefix(false);
const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, maxNativeZoom: 18, className: 'er-sat', attribution: 'Esri' }).addTo(map);
const mk = (name, z) => { const p = map.createPane(name); p.style.zIndex = z; p.style.pointerEvents = 'none'; return p; };
const ovPane = mk('erOv', 410), labPane = mk('erLab', 440), fxPane = mk('erFx', 460), homePane = mk('erHome', 470);
this._night = L.tileLayer('https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png', { maxNativeZoom: 8, maxZoom: 18, className: 'er-night', opacity: 0, attribution: 'NASA' });
if (this._cfg.night_lights !== false) this._night.addTo(map);
this._baseLayers = [sat];
sat.on('load tileload', () => { this._tilesOk = true; });
this._lockSetup(el, map);
this._holdSetup(el);
const hb = this.$('hb'), fb = this.$('fb');
for (const b of [hb, fb]) ['pointerdown', 'touchstart', 'touchmove', 'mousedown', 'dblclick', 'wheel'].forEach(t => b.addEventListener(t, e => e.stopPropagation(), { passive: true }));
hb.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); map.setView(this._home(), this._cfg.zoom); });
fb.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this._flOn = !this._flOn; try { localStorage.setItem('er_flights', this._flOn ? '1' : '0'); } catch (x) {} this._fbState(); if (!this._flOn) this._closeSheet(); });
map.on('click', e => {
if (this._lpAt && Date.now() - this._lpAt < 500) return;
const p = e.containerPoint; let best = null, bd = 24;
if (this._fl && this._flOn && this._cfg.show_flights !== false) for (const [id, f] of this._fl) if (f.vis) { const d = Math.hypot(f.px - p.x, f.py - p.y); if (d < bd) { bd = d; best = id; } }
if (best) this._openSheet(best); else this._closeSheet();
});
map.attributionControl.addAttribution('DWD · Open-Meteo (ICON-D2) · Blitzortung · Flightradar24 · AWS Terrain Tiles · © OSM');
const cv = () => { const c = document.createElement('canvas'); c.className = 'er-ov'; return c; };
this._cvS = cv(); this._cvG = cv(); this._cvM = cv(); this._cvC = cv(); this._cvI = cv(); this._cvR = cv(); this._cvW = cv(); this._cvA = cv(); this._cvF = cv(); this._cvT = cv();
if (this._cfg.radar_blur) this._cvR.style.filter = 'blur(' + this._cfg.radar_blur + 'px)';
this._cvR.style.opacity = this._cfg.radar_opacity;
labPane.appendChild(this._cvT);
ovPane.appendChild(this._cvS); ovPane.appendChild(this._cvG); ovPane.appendChild(this._cvM); ovPane.appendChild(this._cvC); ovPane.appendChild(this._cvI); ovPane.appendChild(this._cvR); ovPane.appendChild(this._cvW);
fxPane.appendChild(this._cvA); fxPane.appendChild(this._cvF);
this._cvL = cv(); this._cvY = cv();
this._cvL.style.mixBlendMode = 'soft-light'; this._cvL.style.zIndex = 50;
this._cvY.style.mixBlendMode = 'screen'; this._cvY.style.zIndex = 51;
this._cvN = cv(); this._cvNt = cv();
this._cvN.style.mixBlendMode = 'screen'; this._cvN.style.zIndex = 40;
this._cvNt.style.mixBlendMode = 'screen'; this._cvNt.style.zIndex = 41;
const tp = map.getPane('tilePane'); tp.appendChild(this._cvN); tp.appendChild(this._cvNt); tp.appendChild(this._cvL); tp.appendChild(this._cvY);
L.marker(home, { pane: 'erHome', interactive: false, icon: L.divIcon({ className: '', iconSize: [4, 4], iconAnchor: [2, 2], html: '<div class="er-home"></div><div class="er-hl">' + this._cfg.home_label + '</div>' }) }).addTo(map);
this._ro = new ResizeObserver(() => {
this._layout();
const w = this.$('mw').offsetWidth, h = this.$('mw').offsetHeight;
if (!w || (w === this._W && h === this._H)) return;
map.invalidateSize(); this._resize(); this._drawPlaces(); if (!this._tilesOk) this._kick();
});
this._ro.observe(this.$('mw'));
this._io = new IntersectionObserver(es => { this._visible = es.some(e => e.isIntersecting); });
this._io.observe(this.$('mw')); this._visible = true;
map.on('moveend', () => { this._resize(); this._drawPlaces(); this._afterMove(); });
this._parts = null; this._frames = []; this._wx = null; this._strikes = new Map(); this._seeded = false;
this._resize();
this._layout(); requestAnimationFrame(() => this._layout());
this._syncStrikes(); this._syncFlights();
this._loadWx().catch(() => {});
this._loadDem();
this._loadPlaces();
this._loadRoads();
setTimeout(() => this._loadRadar().catch(() => this._msg('Radar nicht verfügbar')), 400);
this._start();
this._kickN = 0; this._kick();
}
_holdSetup(el) {
let t = null, sx = 0, sy = 0;
const clear = () => { clearTimeout(t); t = null; };
el.addEventListener('pointerdown', e => {
if (e.button > 0 || (e.target.closest && e.target.closest('.hb'))) return;
sx = e.clientX; sy = e.clientY; clear();
t = setTimeout(() => { t = null; this._setPause(true); }, 400);
});
el.addEventListener('pointermove', e => { if (t && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) clear(); });
const up = () => { clear(); if (this._paused) { this._setPause(false); this._lpAt = Date.now(); } };
['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, up));
el.addEventListener('contextmenu', e => e.preventDefault());
}
_setPause(on) {
if (on === !!this._paused) return;
const now = performance.now();
if (on) this._pauseAt = now; else this._t0 += now - (this._pauseAt || now);
this._paused = on;
const ps = this.$('ps'), tk = this.$('trk');
if (ps) ps.classList.toggle('on', on);
if (tk) tk.classList.toggle('pz', on);
}
_lockSetup(el, map) {
const lk = this.$('lk');
['pointerdown', 'touchstart', 'touchmove', 'mousedown', 'dblclick', 'wheel'].forEach(t => lk.addEventListener(t, e => e.stopPropagation(), { passive: true }));
lk.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); this._setLock(!this._locked); });
el.addEventListener('touchmove', e => { if (!this._locked) { e.preventDefault(); this._touchAt = Date.now(); } }, { passive: false });
el.addEventListener('touchstart', () => { if (!this._locked) this._touchAt = Date.now(); }, { passive: true });
this._setLock(true);
}
_setLock(on) {
const map = this._map, el = this.$('map'), lk = this.$('lk');
this._locked = on;
if (on) { map.dragging.disable(); map.touchZoom.disable(); el.style.touchAction = 'auto'; clearInterval(this._lkT); }
else {
map.dragging.enable(); map.touchZoom.enable(); el.style.touchAction = 'none'; this._touchAt = Date.now();
clearInterval(this._lkT); this._lkT = setInterval(() => { if (Date.now() - this._touchAt > 60000) this._setLock(true); }, 5000);
}
lk.querySelector('ha-icon').setAttribute('icon', on ? 'mdi:lock' : 'mdi:lock-open-variant');
}
_afterMove() {
clearTimeout(this._mvT);
this._mvT = setTimeout(() => {
if (this._gesture || !this._map) return;
const b = this._map.getBounds(), G = this._grid, z = this._map.getZoom();
if (!G || z !== G.z || !LL.latLngBounds(LL.latLng(G.se.lat, G.nw.lng), LL.latLng(G.nw.lat, G.se.lng)).contains(b)) this._loadRadar().catch(() => {});
if (!this._wxBounds || !this._wxBounds.contains(b)) this._loadWx().catch(() => {});
this._loadPlaces();
this._loadRoads();
this._loadDem();
}, 1500);
}
async _loadPlaces(attempt = 0) {
if (this._cfg.show_places === false) return;
const map = this._map, b = map.getBounds();
if (this._plLoading || (this._plB && this._plB.contains(b))) return;
const R = { city: 3, town: 2, village: 1 };
const use = (c) => {
const h = this._home(), dk = (a, o) => (a - h[0]) ** 2 + ((o - h[1]) * 0.64) ** 2;
this._places = c.els.map(e => ({ lat: e[0], lng: e[1], name: e[2], r: e[3], pop: e[4], d: dk(e[0], e[1]) })).sort((x, y) => y.r - x.r || y.pop - x.pop || x.d - y.d);
this._plB = LL.latLngBounds([c.b[0], c.b[1]], [c.b[2], c.b[3]]);
if (this._esriLab) { map.removeLayer(this._esriLab); this._esriLab = null; }
this._drawPlaces();
};
if (!this._plHA) { this._plHA = 1; try { const r = await erFetch('/local/radar/places.json?_=' + Math.floor(Date.now() / 864e5), 6000); if (r.ok) { const hc = await r.json(); if (hc && hc.els && hc.els.length) this._plHAd = hc; } } catch (e) {} }
if (this._plHAd && LL.latLngBounds([this._plHAd.b[0], this._plHAd.b[1]], [this._plHAd.b[2], this._plHAd.b[3]]).contains(b)) { use(this._plHAd); return; }
let cache = null;
try { cache = JSON.parse(localStorage.getItem('erpl2') || 'null'); } catch (e) {}
if (cache && cache.els && LL.latLngBounds([cache.b[0], cache.b[1]], [cache.b[2], cache.b[3]]).contains(b)) {
use(cache);
if (Date.now() - cache.t < 30 * 864e5) return;
} else if (!this._places && !this._esriLab) {
this._esriLab = LL.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { pane: 'erLab', maxZoom: 18 }).addTo(map);
}
this._plLoading = true;
const pb = b.pad(0.6), bb = [pb.getSouth(), pb.getWest(), pb.getNorth(), pb.getEast()].map(v => +v.toFixed(2));
const q = '[out:json][timeout:25];node["place"~"^(city|town|village)$"](' + bb.join(',') + ');out body qt;';
let j = null;
for (const host of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']) {
try { const r = await erFetch(host + '?data=' + encodeURIComponent(q), 30000); if (r.ok) { j = await r.json(); if (j && j.elements) break; j = null; } } catch (e) {}
}
this._plLoading = false;
if (j) {
const c = { t: Date.now(), b: bb, els: j.elements.filter(e => e.tags && e.tags.name).map(e => [+e.lat.toFixed(4), +e.lon.toFixed(4), e.tags.name, R[e.tags.place] || 1, parseInt(e.tags.population) || 0]) };
try { localStorage.setItem('erpl2', JSON.stringify(c)); } catch (e) {}
use(c);
} else if (attempt < 4) {
clearTimeout(this._plRT); this._plRT = setTimeout(() => this._loadPlaces(attempt + 1), 8000 * (attempt + 1));
}
}
_drawPlaces() {
const cvT = this._cvT, map = this._map; if (!cvT || !map || !this._W) return;
const dpr = this._dpr, W = this._W, H = this._H, z = map.getZoom();
LL.DomUtil.setPosition(cvT, map.containerPointToLayerPoint([0, 0]));
const ctx = cvT.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
if (!this._places || this._cfg.show_places === false) return;
const boxes = [], hp = map.latLngToContainerPoint(this._home());
boxes.push([hp.x - 8, hp.y - 18, hp.x + 42, hp.y + 8], [0, 0, 44, 122]); if (this._cfg.show_legend !== false) boxes.push([0, H - 86, W, H]);
const hit = r => boxes.some(q => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1]);
ctx.lineJoin = 'round'; ctx.textBaseline = 'middle';
let n = 0; const max = z >= 11 ? 34 : z >= 10 ? 28 : z >= 9 ? 24 : 16;
for (const p of this._places) {
if (n >= max) break;
if (p.r <= 1 && z < 8.5) continue;
const pt = map.latLngToContainerPoint([p.lat, p.lng]);
if (pt.x < -20 || pt.y < -10 || pt.x > W + 20 || pt.y > H + 10) continue;
const big = p.r >= 2, fs = p.r === 3 ? 12 : big ? 11 : 9;
ctx.font = (big ? '600 ' : '500 ') + fs + 'px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
const tw = ctx.measureText(p.name).width, r = [pt.x - 6, pt.y - fs / 2 - 4, pt.x + 5 + tw + 6, pt.y + fs / 2 + 4];
if (hit(r)) continue;
boxes.push(r); n++;
ctx.fillStyle = big ? 'rgba(242,242,247,.95)' : 'rgba(210,212,220,.8)';
ctx.beginPath(); ctx.arc(pt.x, pt.y, big ? 1.8 : 1.2, 0, 7); ctx.fill();
ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = big ? 3 : 2.5; ctx.strokeText(p.name, pt.x + 5, pt.y);
ctx.fillText(p.name, pt.x + 5, pt.y);
}
}
_kick() {
clearTimeout(this._kickT);
this._kickT = setTimeout(() => {
if (this._tilesOk || !this._map || !this.$('mw').offsetWidth) return;
this._map.invalidateSize(); this._resize();
(this._baseLayers || []).forEach(l => l.redraw());
this._kickN = (this._kickN || 0) + 1;
if (this._kickN < 4) this._kick();
}, 2500);
}
async _loadDem() {
const map = this._map, c = this._cfg;
if (!map || this._demLoading || c.sun_layer === false || !(+c.relief_strength > 0)) return;
const z = Math.max(6, Math.min(11, Math.floor(map.getZoom()))), b = map.getBounds().pad(0.2);
const nw = map.project(b.getNorthWest(), z), se = map.project(b.getSouthEast(), z);
const x0 = Math.floor(nw.x / 256), x1 = Math.floor(se.x / 256), y0 = Math.floor(nw.y / 256), y1 = Math.floor(se.y / 256);
const D = this._dem;
if (D && D.z === z && D.x0 <= x0 && D.x1 >= x1 && D.y0 <= y0 && D.y1 >= y1) return;
const nx = x1 - x0 + 1, ny = y1 - y0 + 1;
if (nx * ny > 24) return;
this._demLoading = true;
try {
const cv = document.createElement('canvas'); cv.width = nx * 256; cv.height = ny * 256;
const cx = cv.getContext('2d', { willReadFrequently: true }), tiles = [];
for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles.push([x, y]);
let ok = 0;
await erPool(tiles, 4, async t => {
try {
const im = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; let loc = true; i.onload = () => res(i); i.onerror = () => { if (loc) { loc = false; i.src = DEM_URL(z, t[0], t[1]); } else rej(); }; i.src = '/local/radar/dem/' + z + '/' + t[0] + '/' + t[1] + '.png'; });
cx.drawImage(im, (t[0] - x0) * 256, (t[1] - y0) * 256); ok++;
} catch (e) {}
});
if (ok < tiles.length) { clearTimeout(this._demRT); this._demRT = setTimeout(() => this._loadDem(), 60000); return; }
const d = cx.getImageData(0, 0, cv.width, cv.height).data, S = 2, w = cv.width / S, h = cv.height / S, Z = new Float32Array(w * h);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const p = ((y * S) * cv.width + x * S) * 4; Z[y * w + x] = d[p] * 256 + d[p + 1] + d[p + 2] / 256 - 32768; }
const lat = map.getCenter().lat;
this._dem = { z, x0, x1, y0, y1, w, h, Z, mpp: 156543.03 * Math.cos(lat * Math.PI / 180) / Math.pow(2, z) * S,
nw: map.unproject([x0 * 256, y0 * 256], z), se: map.unproject([(x1 + 1) * 256, (y1 + 1) * 256], z) };
this._shK = null; this._lgK = null;
} catch (e) {} finally { this._demLoading = false; }
}
_shade(el, az) {
const D = this._dem, w = D.w, h = D.h, Z = D.Z, k = 3 / (2 * D.mpp);
const r = az * Math.PI / 180, e = Math.max(0.5, el) * Math.PI / 180;
const lx = Math.sin(r) * Math.cos(e), ly = -Math.cos(r) * Math.cos(e), lz = Math.sin(e), col = erSunCol(el, az);
const cv = this._shCv || (this._shCv = document.createElement('canvas'));
if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; this._shImg = null; }
const img = this._shImg || (this._shImg = cv.getContext('2d').createImageData(w, h)), d = img.data;
for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
const i = y * w + x, dx = (Z[i + 1] - Z[i - 1]) * k, dy = (Z[i + w] - Z[i - w]) * k;
const v = (-dx * lx - dy * ly + lz) / Math.sqrt(dx * dx + dy * dy + 1) - lz, o = i * 4;
if (v > 0) { d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = Math.min(120, v * 240); }
else { d[o] = 8; d[o + 1] = 12; d[o + 2] = 28; d[o + 3] = Math.min(150, -v * 280); }
}
cv.getContext('2d').putImageData(img, 0, 0);
}
_drawLight() {
const map = this._map, c = this._cfg, cv = this._cvS; if (!cv || !this._W) return;
const sun = this._hass.states['sun.sun'], el = sun ? parseFloat(sun.attributes.elevation) : -90, az = sun ? parseFloat(sun.attributes.azimuth) : 180;
const rf = c.sun_layer === false ? 0 : Math.max(0, Math.min(1, el / 3));
const tl = map.containerPointToLayerPoint([0, 0]), W = this._W, H = this._H, dpr = this._dpr, ov = Math.round((this._ovc || 0) * 20), D = this._dem;
const key = [tl.x, tl.y, map.getZoom(), W, H, cv.width, Math.round(el * 4), Math.round(az * 2), ov, D ? D.z + ':' + D.x0 + ':' + D.y0 : '', c.sun_strength, c.relief_strength].join('|');
if (key === this._lgK) return;
this._lgK = key;
LL.DomUtil.setPosition(cv, tl);
const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
if (!(rf > 0) || !isFinite(az)) return;
const str = rf * (+c.sun_strength) * (1 - 0.65 * ov / 20);
if (D && +c.relief_strength > 0) {
const sk = Math.round(el * 4) + '|' + Math.round(az * 2) + '|' + D.z + ':' + D.x0 + ':' + D.y0;
if (sk !== this._shK) { this._shK = sk; this._shade(el, az); }
const a = map.latLngToContainerPoint(D.nw), b = map.latLngToContainerPoint(D.se);
x.globalAlpha = Math.min(1, str * (+c.relief_strength)); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
x.drawImage(this._shCv, a.x, a.y, b.x - a.x, b.y - a.y); x.globalAlpha = 1;
}
}
async _loadRoads(attempt = 0) {
const c = this._cfg, map = this._map;
if (!map || c.night_lights === false || c.night_roads === false || this._rdLoading) return;
const b = map.getBounds();
if (this._rdB && this._rdB.contains(b)) return;
const use = cc => { this._roads = cc.ways; this._rdB = LL.latLngBounds([cc.b[0], cc.b[1]], [cc.b[2], cc.b[3]]); this._nP = null; this._nK = null; };
if (!this._rdHA) { this._rdHA = 1; try { const r = await erFetch('/local/radar/roads.json?_=' + Math.floor(Date.now() / 864e5), 15000); if (r.ok) { const hc = await r.json(); if (hc && hc.ways && hc.ways.length) this._rdHAd = hc; } } catch (e) {} }
if (this._rdHAd && LL.latLngBounds([this._rdHAd.b[0], this._rdHAd.b[1]], [this._rdHAd.b[2], this._rdHAd.b[3]]).contains(b)) { use(this._rdHAd); return; }
let cache = null;
try { cache = JSON.parse(localStorage.getItem('erroad1') || 'null'); } catch (e) {}
if (cache && cache.ways && LL.latLngBounds([cache.b[0], cache.b[1]], [cache.b[2], cache.b[3]]).contains(b)) { use(cache); if (Date.now() - cache.t < 60 * 864e5) return; }
this._rdLoading = true;
const pb = b.pad(0.4), bb = [pb.getSouth(), pb.getWest(), pb.getNorth(), pb.getEast()].map(v => +v.toFixed(2));
const q = '[out:json][timeout:45];way["highway"~"^(motorway|trunk|primary)$"](' + bb.join(',') + ');out geom qt;';
let j = null;
for (const host of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']) {
try { const r = await erFetch(host + '?data=' + encodeURIComponent(q), 50000); if (r.ok) { j = await r.json(); if (j && j.elements) break; j = null; } } catch (e) {}
}
this._rdLoading = false;
if (j) {
const ways = [];
for (const e of j.elements) {
const g = e.geometry; if (!g || g.length < 2) continue;
const out = []; let lp = null;
for (const p of g) { if (lp && Math.abs(p.lat - lp[0]) < 0.0012 && Math.abs(p.lon - lp[1]) < 0.0018) continue; lp = [p.lat, p.lon]; out.push(+p.lat.toFixed(4), +p.lon.toFixed(4)); }
const la = g[g.length - 1]; if (lp[0] !== la.lat || lp[1] !== la.lon) out.push(+la.lat.toFixed(4), +la.lon.toFixed(4));
if (out.length >= 4) { const hw = e.tags && e.tags.highway; ways.push([hw === 'motorway' ? 2 : hw === 'trunk' ? 1 : 0, out]); }
}
const cc = { t: Date.now(), b: bb, ways };
try { localStorage.setItem('erroad1', JSON.stringify(cc)); } catch (e) {}
use(cc);
} else if (attempt < 3) { clearTimeout(this._rdRT); this._rdRT = setTimeout(() => this._loadRoads(attempt + 1), 15000 * (attempt + 1)); }
}
_nightPts(z) {
const P = this._places; if (!P || !P.length) return null;
const key = z + '|' + P.length + '|' + (this._plB ? this._plB.toBBoxString() : '') + '|' + (this._roads ? this._roads.length : 0);
if (this._nP && this._nP.key === key) return this._nP;
const map = this._map, mpp = 40075016.686 * Math.cos(this._home()[0] * Math.PI / 180) / Math.pow(2, z + 8);
const towns = [];
for (const p of P) {
const s = p.pop > 0 ? Math.max(0.7, Math.min(9, Math.sqrt(p.pop) / 40)) : (p.r === 3 ? 6 : p.r === 2 ? 2.5 : 1);
const w = map.project([p.lat, p.lng], z);
towns.push({ x: w.x, y: w.y, s });
}
let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
for (const t of towns) { x0 = Math.min(x0, t.x); y0 = Math.min(y0, t.y); x1 = Math.max(x1, t.x); y1 = Math.max(y1, t.y); }
const cs = 16, pad = 2000 / mpp + 160, ox = x0 - pad, oy = y0 - pad, lw = Math.ceil((x1 - x0 + 2 * pad) / cs), lh = Math.ceil((y1 - y0 + 2 * pad) / cs);
const lf = { ox, oy, cs, w: lw, h: lh, d: new Float32Array(Math.max(1, lw * lh)) };
for (const t of towns) {
const Rr = t.s * 1800 / mpp, gx = (t.x - ox) / cs, gy = (t.y - oy) / cs, rc = Math.ceil(Rr / cs);
for (let yy = Math.max(0, Math.floor(gy - rc)); yy <= Math.min(lh - 1, Math.ceil(gy + rc)); yy++) for (let xx = Math.max(0, Math.floor(gx - rc)); xx <= Math.min(lw - 1, Math.ceil(gx + rc)); xx++) {
const dd = Math.hypot((xx - gx) * cs, (yy - gy) * cs); if (dd < Rr) lf.d[yy * lw + xx] += (1 - dd / Rr) * t.s / 5;
}
}
const lfAt = (wx, wy) => { const gx = Math.floor((wx - ox) / cs), gy = Math.floor((wy - oy) / cs); return gx < 0 || gy < 0 || gx >= lw || gy >= lh ? 0 : Math.min(1, lf.d[gy * lw + gx]); };
const rpts = [];
if (this._roads) {
let sd = 99991; const r2 = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
for (const [cl, f] of this._roads) {
const cf = cl === 2 ? 1 : cl === 1 ? 0.85 : 0.6;
let prev = null, carry = 0;
for (let i = 0; i < f.length; i += 2) {
const w = map.project([f[i], f[i + 1]], z);
if (prev) {
const dx = w.x - prev.x, dy = w.y - prev.y, L = Math.hypot(dx, dy);
let d = carry;
while (d <= L) { const px = prev.x + dx * d / L + (r2() - 0.5) * 1.2, py = prev.y + dy * d / L + (r2() - 0.5) * 1.2; rpts.push({ x: px, y: py, a: (0.12 + 0.2 * lfAt(px, py)) * cf * (0.6 + 0.4 * r2()) }); d += 6; }
carry = d - L;
}
prev = w;
}
}
}
return this._nP = { key, z, towns, rpts, lf, mpp };
}
/* Nachtlichter wie auf ISS-Nachtaufnahmen: leuchtende Straßenbänder (bernstein), leichter Schein über größeren Orten,
NASA-Nachtbild als schwache Grundlage; bewusst zurückhaltend */
_drawNight(now) {
const c = this._cfg, cv = this._cvN, map = this._map; if (!cv || !this._W) return;
const W = this._W, H = this._H, dpr = this._dpr, nf = this._nf || 0, z = map.getZoom();
const on = c.night_lights !== false && nf > 0.01 && (c.night_points !== false || c.night_roads !== false || c.night_glow !== false);
const d0 = new Date(), hh = d0.getHours() + d0.getMinutes() / 60;
const late = hh >= 0.5 && hh < 1.5 ? hh - 0.5 : hh >= 1.5 && hh < 4.5 ? 1 : hh >= 4.5 && hh < 5.5 ? 5.5 - hh : 0;
const N = on ? this._nightPts(z) : null, tl = map.containerPointToLayerPoint([0, 0]);
const key = [on, tl.x, tl.y, z, W, H, cv.width, Math.round(nf * 20), Math.round(late * 10), N ? N.key : '', c.night_brightness, c.night_points, c.night_roads, c.night_glow, c.night_colors, c.night_town_level, c.night_road_level].join('|');
if (key === this._nK) return;
this._nK = key; LL.DomUtil.setPosition(cv, tl);
const x = cv.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
if (this._cvNt) this._cvNt.getContext('2d').clearRect(0, 0, this._cvNt.width, this._cvNt.height);
if (!on || !N) return;
const k = nf * Math.min(1.6, +c.night_brightness / 0.55) * (1 - 0.35 * late), kt = k * (c.night_town_level == null ? 1 : +c.night_town_level), kr = k * (c.night_road_level == null ? 1 : +c.night_road_level), cols = c.night_colors !== false, spr = erGlowSprites();
const org = map.project(map.containerPointToLatLng([0, 0]), z);
const put = (sp, px, py, r, a) => { if (a < 0.004) return; const sx = px - org.x, sy = py - org.y; if (sx < -r || sy < -r || sx > W + r || sy > H + r) return; x.globalAlpha = Math.min(1, a); x.drawImage(sp, sx - r, sy - r, 2 * r, 2 * r); };
x.setTransform(dpr, 0, 0, dpr, 0, 0); x.globalCompositeOperation = 'lighter';
if (c.night_glow !== false) for (const t of N.towns) put(spr.halo, t.x, t.y, t.s * 1600 / N.mpp, 0.07 * kt * Math.min(1, t.s / 4));
if (c.night_points !== false) { for (const t of N.towns) if (t.s >= 2.5) put(cols ? spr.amb : spr.yel, t.x, t.y, t.s * 900 / N.mpp, Math.min(0.22, 0.03 * t.s) * kt); }
else for (const t of N.towns) put(cols ? spr.warm : spr.yel, t.x, t.y, t.s * 750 / N.mpp, Math.min(0.32, 0.07 + t.s * 0.035) * kt);
if (c.night_roads !== false) for (const p of N.rpts) put(spr.road, p.x, p.y, 2.6, p.a * kr * 2.2);
x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
}
_resize() {
if (!this._map) return;
const s = this._map.getSize(), dpr = Math.min(1.5, window.devicePixelRatio || 1);
this._W = s.x; this._H = s.y; this._dpr = dpr;
const tl = this._map.containerPointToLayerPoint([0, 0]);
for (const c of [this._cvS, this._cvG, this._cvN, this._cvNt, this._cvL, this._cvY, this._cvM, this._cvC, this._cvI, this._cvR, this._cvW, this._cvA, this._cvF, this._cvT]) {
const wantW = Math.round(s.x * dpr), wantH = Math.round(s.y * dpr);
if (c.width !== wantW || c.height !== wantH) { c.width = wantW; c.height = wantH; }
c.style.width = s.x + 'px'; c.style.height = s.y + 'px';
LL.DomUtil.setPosition(c, tl);
}
this._lgK = null;
this._cvW.getContext('2d').clearRect(0, 0, this._cvW.width, this._cvW.height);
const n = Math.round(this._cfg.particles);
if (!this._parts || this._parts.length !== n) this._parts = Array.from({ length: n }, () => ({ x: Math.random()*s.x, y: Math.random()*s.y, a: Math.random()*80, g: Math.random() < 0.2 }));
}
_start() {
if (!this._map || this._raf) return;
this._last = performance.now(); this._t0 = performance.now();
const loop = now => { this._raf = requestAnimationFrame(loop); if (!this._visible || document.hidden || now - (this._lastDraw || 0) < 1000 / this._cfg.fps - 2) return; this._lastDraw = now; this._tick(now); };
this._raf = requestAnimationFrame(loop);
clearInterval(this._iv); this._iv = setInterval(() => this._reloadAll(), 5 * 60 * 1000);
}
_stop() { cancelAnimationFrame(this._raf); this._raf = null; clearInterval(this._iv); }
_haRefresh(ent) {
const h = this._hass; if (!h || !ent || !h.states[ent]) return;
this._haRef = this._haRef || {}; if (Date.now() - (this._haRef[ent] || 0) < 3 * 60000) return;
this._haRef[ent] = Date.now();
try { h.callService('homeassistant', 'update_entity', { entity_id: ent }); } catch (e) {}
}
_freshen() {
if (this._map && Date.now() - (this._lastReload || 0) > 30 * 1000) this._reloadAll();
}
async _reloadAll() {
if (!this._map) return;
this._lastReload = Date.now();
this._loadRadar().catch(() => this._msg('Radar nicht verfügbar'));
const now = Date.now();
if (!this._wxAt || now - this._wxAt > 30 * 60 * 1000 || !this._wxBounds || !this._wxBounds.contains(this._map.getBounds())) this._loadWx().catch(() => {});
}
async _legend() {
if (this._leg !== undefined) return this._leg;
try { const c = JSON.parse(localStorage.getItem('erleg1') || 'null'); if (c && c.list && Date.now() - c.t < 7 * 864e5) { this._leg = c.list; this._legLay = c.lay; this._legCache = new Map(); return this._leg; } } catch (e) {}
for (const lay of [DWD_LAYER, 'dwd:Niederschlagsradar']) try {
const j = await (await erFetch(DWD_LEG(lay))).json();
let entries = null, type = 'intervals';
const walk = o => { if (!o || typeof o !== 'object' || entries) return;
if (o.colormap && Array.isArray(o.colormap.entries)) { entries = o.colormap.entries; type = o.colormap.type || type; return; }
for (const k in o) walk(o[k]); };
walk(j);
if (!entries) throw 0;
const list = entries.filter(e => e.color && e.quantity != null && (e.opacity == null || parseFloat(e.opacity) > 0))
.map(e => ({ q: parseFloat(e.quantity), c: hx(e.color) })).filter(e => isFinite(e.q)).sort((a, b) => a.q - b.q);
for (let i = 0; i < list.length; i++) {
const lo = i ? list[i-1].q : 0, hi = list[i].q;
list[i].v = /interval/i.test(type) ? (lo > 0 ? Math.sqrt(lo * hi) : hi * 0.5) : hi;
}
this._leg = list.length ? list : null;
if (this._leg) { this._legLay = lay; try { localStorage.setItem('erleg1', JSON.stringify({ t: Date.now(), lay, list: this._leg })); } catch (x) {} break; }
} catch (e) { this._leg = null; }
this._legCache = new Map();
return this._leg;
}
_decodeColor(r, g, b) {
const key = (r << 16) | (g << 8) | b, cache = this._legCache;
if (cache.has(key)) return cache.get(key);
let best = 1e9, v = 0;
for (const e of this._leg) { const d = (e.c[0]-r)**2 + (e.c[1]-g)**2 + (e.c[2]-b)**2; if (d < best) { best = d; v = e.v; } }
if (best > 1600) v = 0;
cache.set(key, v); return v;
}
async _times() {
try {
const txt = await (await erFetch(DWD_CAP, 5000)).text();
const doc = new DOMParser().parseFromString(txt, 'text/xml');
const dims = [...doc.getElementsByTagName('Dimension'), ...doc.getElementsByTagName('Extent')].filter(d => /^time$/i.test(d.getAttribute('name') || ''));
if (!dims.length) throw 0;
const out = [];
for (const part of dims[dims.length - 1].textContent.trim().split(',')) {
const p = part.trim().split('/');
if (p.length === 3) {
const s = Date.parse(p[0]), e = Date.parse(p[1]), m = /PT(\d+)M/.exec(p[2]), step = (m ? +m[1] : 5) * 60000;
for (let t = Math.max(s, e - 6 * 3600000); t <= e; t += step) out.push(t);
} else if (p[0]) out.push(Date.parse(p[0]));
}
return out.filter(isFinite).sort((a, b) => a - b);
} catch (e) {
const base = Math.floor((Date.now() - 10 * 60000) / 300000) * 300000;
return Array.from({ length: 25 }, (_, i) => base + i * 300000);
}
}
/* Bewegungsfeld zwischen zwei Radarbildern (Blockvergleich): wohin wandern die Regenzellen in 5 Minuten?
Ergebnis: grobes Vektorfeld (Blöcke à 24 px), Lücken ohne Regen mit dem Mittelwert gefüllt, 3×3 geglättet */
_calcFlow(a, b) {
const G = this._grid; if (!G || !a.g || !b.g) return null;
const w = G.gw, h = G.gh, A = a.g, B = b.g, BSZ = 24, R = 6, ST = 3;
const nx = Math.ceil(w / BSZ), ny = Math.ceil(h / BSZ), n = nx * ny;
const bu = new Float32Array(n), bv = new Float32Array(n), ok = new Uint8Array(n);
let su = 0, sv = 0, sn = 0;
for (let by = 0; by < ny; by++) for (let bx = 0; bx < nx; bx++) {
const x0 = bx * BSZ, y0 = by * BSZ, x1 = Math.min(w, x0 + BSZ), y1 = Math.min(h, y0 + BSZ);
let mass = 0, cnt = 0;
for (let y = y0; y < y1; y += ST) for (let x = x0; x < x1; x += ST) { mass += A[y * w + x]; cnt++; }
if (!cnt || mass / cnt < 0.05) continue;
let best = Infinity, du = 0, dv = 0;
for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
let s = 0;
for (let y = y0; y < y1; y += ST) {
const yy = y + dy, ry = y * w;
if (yy < 0 || yy >= h) { s += mass; continue; }
const rr = yy * w;
for (let x = x0; x < x1; x += ST) { const xx = x + dx; s += (xx < 0 || xx >= w) ? A[ry + x] : Math.abs(A[ry + x] - B[rr + xx]); }
if (s >= best) break;
}
s += (dx * dx + dy * dy) * 0.002 * mass;
if (s < best) { best = s; du = dx; dv = dy; }
}
const k = by * nx + bx; bu[k] = du; bv[k] = dv; ok[k] = 1; su += du; sv += dv; sn++;
}
if (!sn) return null;
const mu = su / sn, mv = sv / sn;
for (let k = 0; k < n; k++) if (!ok[k]) { bu[k] = mu; bv[k] = mv; }
const su2 = new Float32Array(n), sv2 = new Float32Array(n);
for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
let a1 = 0, a2 = 0, c = 0;
for (let yy = Math.max(0, y - 1); yy <= Math.min(ny - 1, y + 1); yy++) for (let xx = Math.max(0, x - 1); xx <= Math.min(nx - 1, x + 1); xx++) { const k = yy * nx + xx, wt = (xx === x && yy === y) ? 2 : 1; a1 += bu[k] * wt; a2 += bv[k] * wt; c += wt; }
su2[y * nx + x] = a1 / c; sv2[y * nx + x] = a2 / c;
}
return { nx, ny, bs: BSZ, u: su2, v: sv2 };
}
_queueFlows() {
const job = (this._fjob = (this._fjob || 0) + 1);
let k = 0;
const step = () => {
if (job !== this._fjob || this._raw) return;
const fs = this._frames; if (!fs || k >= fs.length - 1) return;
if (fs[k].flow === undefined) fs[k].flow = this._calcFlow(fs[k], fs[k + 1]);
k++; setTimeout(step, 20);
};
setTimeout(step, 60);
}
_denseFlow(fl) {
const G = this._grid, w = G.gw, h = G.gh, n = w * h;
if (!this._fu || this._fu.length !== n) { this._fu = new Float32Array(n); this._fv = new Float32Array(n); }
const U = this._fu, V = this._fv, nx = fl.nx, ny = fl.ny, bs = fl.bs;
for (let y = 0; y < h; y++) {
const gy = Math.max(0, Math.min(ny - 1, (y + 0.5) / bs - 0.5)), y0 = Math.min(ny - 1, gy | 0), y1 = Math.min(ny - 1, y0 + 1), fy = gy - y0;
for (let x = 0; x < w; x++) {
const gx = Math.max(0, Math.min(nx - 1, (x + 0.5) / bs - 0.5)), x0 = Math.min(nx - 1, gx | 0), x1 = Math.min(nx - 1, x0 + 1), fx = gx - x0;
const a = y0 * nx + x0, b = y0 * nx + x1, c = y1 * nx + x0, d = y1 * nx + x1, k = y * w + x;
U[k] = (fl.u[a] * (1 - fx) + fl.u[b] * fx) * (1 - fy) + (fl.u[c] * (1 - fx) + fl.u[d] * fx) * fy;
V[k] = (fl.v[a] * (1 - fx) + fl.v[b] * fx) * (1 - fy) + (fl.v[c] * (1 - fx) + fl.v[d] * fx) * fy;
}
}
}
async _loadRadar(remote) {
const map = this._map, L = LL, now = Date.now(), nT = Math.max(2, Math.round((+this._cfg.forecast_minutes || 120) / 5) + 1);
let loc = null;
if (this._cfg.radar_local !== false && !remote) try {
const r = await erFetch('/local/radar/index.json?_=' + now, 4000);
if (r.ok) {
const j = await r.json(), vb = map.getBounds().pad(0.15), a = L.CRS.EPSG3857.project(vb.getSouthWest()), z2 = L.CRS.EPSG3857.project(vb.getNorthEast());
if (j && Array.isArray(j.t) && j.t.length > 1 && now - j.made < 6 * 3600000 && now - j.t[0] < 90 * 60000 && a.x >= j.b[0] && a.y >= j.b[1] && z2.x <= j.b[2] && z2.y <= j.b[3]) loc = j;
}
} catch (e) {}
const stale = loc && now - loc.made > 15 * 60000;
if (stale || (!loc && this._cfg.radar_local !== false)) this._haRefresh(this._cfg.radar_entity || 'sensor.elmo_radar_bilder');
let times, sw, ne, gw, gh;
if (loc) { times = loc.t.slice(0, nT); sw = L.point(loc.b[0], loc.b[1]); ne = L.point(loc.b[2], loc.b[3]); gw = loc.w; gh = loc.h; }
else {
const all = await this._times();
let i0 = -1; for (let i = 0; i < all.length; i++) if (all[i] <= now) i0 = i;
if (i0 < 0) i0 = 0;
const t0 = all.length ? all[Math.max(0, i0)] : Math.floor((now - 10 * 60000) / 300000) * 300000;
times = Array.from({ length: nT }, (_, k) => t0 + k * 300000);
const b = map.getBounds().pad(0.35); sw = L.CRS.EPSG3857.project(b.getSouthWest()); ne = L.CRS.EPSG3857.project(b.getNorthEast());
const kmPx = 1.1 * 1000 / Math.cos(map.getCenter().lat * Math.PI / 180);
gw = Math.max(40, Math.min(Math.round(this._W * 0.7), Math.round((ne.x - sw.x) / kmPx))); gh = Math.max(40, Math.min(Math.round(this._H * 0.7), Math.round((ne.y - sw.y) / kmPx)));
}
const leg = await this._legend(), fac = this._legLay === DWD_LAYER ? (+this._cfg.rv_factor || 1) : 1;
const job = (this._job = (this._job || 0) + 1);
const cvs = document.createElement('canvas'); cvs.width = gw; cvs.height = gh;
const cx = cvs.getContext('2d', { willReadFrequently: true });
const url = (t, lay) => loc && lay === DWD_LAYER ? '/local/radar/' + loc.v + '_' + times.indexOf(t) + '.png' : DWD_WMS + '?service=WMS&version=1.1.1&request=GetMap&layers=' + lay + '&styles=&format=image/png&transparent=true&srs=EPSG:3857'
+ '&bbox=' + [sw.x, sw.y, ne.x, ne.y].map(v => v.toFixed(0)).join(',') + '&width=' + gw + '&height=' + gh + '&time=' + new Date(t).toISOString();
const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
let f = [], usedLay = '', stand = 0;
const grid = { z: map.getZoom(), gw, gh, nw: L.CRS.EPSG3857.unproject(LL.point(sw.x, ne.y)), se: L.CRS.EPSG3857.unproject(LL.point(ne.x, sw.y)), sw, ne };
const apply = (fs, raw) => {
for (const o of (this._frames || [])) if (o.ou && !fs.includes(o)) URL.revokeObjectURL(o.ou);
this._frames = fs; this._raw = raw; this._grid = grid; this._fpair = -1; this._radarSrc = loc ? 'ha' : 'dwd'; this._radarStand = stand || (fs[0] ? fs[0].t : 0);
this._rcv = this._rcv || document.createElement('canvas');
if (this._rcv.width !== gw || this._rcv.height !== gh || !this._rimg) { this._rcv.width = gw; this._rcv.height = gh; this._rimg = this._rcv.getContext('2d').createImageData(gw, gh); }
this._t0 = performance.now(); if (this._paused) this._pauseAt = this._t0; this._pending = null; this._lastEl = 0;
this._series = null; this._cdAt = 0;
if (!raw) {
const hp = L.CRS.EPSG3857.project(L.latLng(this._home()[0], this._home()[1]));
const hx_ = Math.floor((hp.x - sw.x) / (ne.x - sw.x) * gw), hy_ = Math.floor((ne.y - hp.y) / (ne.y - sw.y) * gh);
this._series = fs.map(fr => { let s = 0, m = 0; for (let yy = -1; yy <= 1; yy++) for (let xx = -1; xx <= 1; xx++) { const X = hx_ + xx, Y = hy_ + yy; if (X < 0 || Y < 0 || X >= gw || Y >= gh) continue; s += fr.g[Y * gw + X]; m++; } return { t: fr.t, v: m ? s / m : 0 }; });
if (fs.length > 1) this._queueFlows();
}
};
const first = !this._frames || !this._frames.length;
for (const lay of [DWD_LAYER, 'dwd:Niederschlagsradar']) {
const frames = new Array(times.length);
let okCount = 0;
/* Open-Data-Bilder aus Home Assistant: Grauwert = Regen (mm/h = 2^(Wert/40) - 1), keine Farblegende nötig */
const encL = !!(loc && loc.enc === 'log40' && lay === DWD_LAYER);
await erPool(times, 6, async (t, i) => {
try {
if (leg || encL) {
const r = await erFetch(url(t, lay)); if (!r.ok || !/image/.test(r.headers.get('content-type') || '')) throw 0;
const blob = await r.blob();
const ou = URL.createObjectURL(blob), im = await loadImg(ou);
cx.clearRect(0, 0, gw, gh); cx.drawImage(im, 0, 0, gw, gh);
const d = cx.getImageData(0, 0, gw, gh).data, g = new Float32Array(gw * gh);
let nt = 0, mx = 0;
for (let k = 0, p = 0; k < g.length; k++, p += 4) { if (d[p+3] < 20 || (encL && d[p] === 0)) { g[k] = 0; continue; } nt++; const v = encL ? Math.pow(2, d[p] / 40) - 1 : this._decodeColor(d[p], d[p+1], d[p+2]) * fac; g[k] = v; if (v > mx) mx = v; }
const g0 = g.slice(); erSmooth(g, gw, gh); erSmooth(g, gw, gh); erSmooth(g, gw, gh);
for (let k = 0; k < g.length; k++) { const o = g0[k] * 0.85; if (o > g[k]) g[k] = o; }
frames[i] = { t, g, img: im, ou, nt, mx }; okCount++;
if (i === 0 && first && job === this._job && !(this._frames && this._frames.length) && Math.abs(t - now) < 10 * 60000) { this._msg(''); apply([frames[0]], !(nt <= 30 || mx >= 0.1)); }
} else {
frames[i] = { t, img: await loadImg(url(t, lay)) }; okCount++;
if (i === 0 && first && job === this._job && !(this._frames && this._frames.length) && Math.abs(t - now) < 10 * 60000) { this._msg(''); apply([frames[0]], true); }
}
} catch (e) { frames[i] = null; }
});
if (job !== this._job) return;
let ff = frames.filter(Boolean);
if (ff.length && (!stand || ff.length > f.length)) stand = ff[0].t;
if (ff.length > 2) { let k = 0; for (let q = 1; q < ff.length; q++) if (Math.abs(ff[q].t - now) < Math.abs(ff[k].t - now)) k = q; if (ff.length - k >= 2) ff = ff.slice(k); }
if (ff.length > f.length) { f = ff; usedLay = lay; }
if (f.length >= 2) break;
}
if (!f.length && remote && this._frames && this._frames.length) return;
if (!f.length) { this._msg('Radar nicht verfügbar' + (this._cfg.debug ? ' (Legende ' + (leg ? leg.length : 0) + ', t0 ' + new Date(t0).toISOString().slice(11, 16) + 'Z)' : '')); this._loadFail = true; return; }
this._msg('');
const encUsed = !!(loc && loc.enc === 'log40' && usedLay === DWD_LAYER);
let raw = !leg && !encUsed, nt = 0, mx = 0;
if (leg && !encUsed) { for (const fr of f) { nt += fr.nt; mx = Math.max(mx, fr.mx); } if (nt > 30 && mx < 0.1) raw = true; }
if (this._cfg.debug) this._msg((usedLay || '').replace('dwd:', '') + ' · ' + f.length + ' Bilder · Legende ' + (leg ? leg.length : 0) + ' · px ' + nt + ' · max ' + mx.toFixed(1) + (raw ? ' · ROH' : '') + ' · ab ' + new Date(f[0].t).toISOString().slice(11, 16) + 'Z');
const cur = this._frames || [];
/* sofort übernehmen, wenn noch nichts da ist oder die bisherigen Bilder veraltet sind (Messung über 15 min alt bzw. Vorhersage reicht keine Stunde mehr);
   sonst weich am Ende des Durchlaufs */
const curStale = cur.length > 1 && ((Date.now() - (this._radarStand || cur[0].t)) > 20 * 60000 || cur[cur.length - 1].t < Date.now() + 5 * 60000);
if (cur.length <= 1 || !this._grid || this._grid.z !== grid.z || curStale) { apply(f, raw); this._pending = null; }
else this._pending = () => apply(f, raw);
if (stale && job === this._job) this._loadRadar(true).catch(() => {});
}
async _loadWx(attempt = 0) {
if (this._wxLoading) return;
this._wxLoading = true;
try { await this._loadWxOnce(); this._wxTry = 0; this._wxErr = ''; }
catch (e) {
const lim = /limit/i.test(this._wxErr || '');
clearTimeout(this._wxRT);
if (lim) this._wxRT = setTimeout(() => this._loadWx(0).catch(() => {}), 30 * 60000);
else if (attempt < 5) this._wxRT = setTimeout(() => this._loadWx(attempt + 1).catch(() => {}), 3000 * (attempt + 1));
}
finally { this._wxLoading = false; }
}
async _loadWxOnce() {
const map = this._map, cols = 6, rows = 5, vb = map.getBounds(), now = Date.now();
const se = this._cfg.wx_entity && this._hass ? this._hass.states[this._cfg.wx_entity] : null, A = se && se.attributes;
if (A && Array.isArray(A.p) && Array.isArray(A.t) && Array.isArray(A.b)) {
const hb = LL.latLngBounds([A.b[1], A.b[2]], [A.b[0], A.b[3]]), at = erTs(se.last_updated), tEnd = Date.parse(A.t[A.t.length - 1] + 'Z');
if (hb.contains(vb) && (!this._wx || at >= (this._wxAt || 0) - 60000)) {
this._wx = { cols: A.c, rows: A.r, n: A.b[0], s: A.b[1], w: A.b[2], e: A.b[3], times: A.t.map(x => Date.parse(x + 'Z')),
pts: A.p.map(o => o[0].map((_, i) => erWxPt(o[0][i], o[1][i], o[2][i], o[3][i], o[4][i], o[5][i], o[6] && o[6][i], o[7] && o[7][i], o[8] && o[8][i], o[9] && o[9][i], o[10] && o[10][i], o[11] && o[11][i]))) };
this._wxBounds = hb; this._wxAt = at; this._wxErr = ''; this._wxSrc = 'ha';
if (now - at < 60 * 60000 || tEnd >= now + 110 * 60000) return;
}
}
let cache = null;
try { cache = JSON.parse(localStorage.getItem('erwx1') || 'null'); } catch (e) {}
const cb = cache && cache.wx ? LL.latLngBounds([cache.wx.s, cache.wx.w], [cache.wx.n, cache.wx.e]) : null;
const useCache = () => { this._wx = cache.wx; this._wxBounds = cb; this._wxAt = cache.at; this._wxSrc = 'web'; };
if (cb && cb.intersects(vb) && now - cache.at < 12 * 3600000 && (!this._wx || cache.at > (this._wxAt || 0))) {
useCache();
if (now - cache.at < 20 * 60000 && cb.contains(vb)) return;
}
const b = vb.pad(0.25);
const lats = [], lons = [];
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
lats.push((b.getNorth() - (b.getNorth() - b.getSouth()) * r / (rows - 1)).toFixed(3));
lons.push((b.getWest() + (b.getEast() - b.getWest()) * c / (cols - 1)).toFixed(3));
}
const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + lats.join(',') + '&longitude=' + lons.join(',')
+ '&hourly=wind_speed_10m,wind_direction_10m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,sunshine_duration,visibility,snowfall_height,wind_gusts_10m,temperature_2m,dew_point_2m&models=icon_d2&past_hours=1&forecast_hours=4&timezone=GMT&wind_speed_unit=kmh';
let j = null, arr = [];
for (const m of ['icon_d2', 'icon_seamless']) {
try {
const r = await erFetch(u.replace('models=icon_d2', 'models=' + m)); j = await r.json();
if (j && j.error) { this._wxErr = String(j.reason || 'Fehler'); if (/limit/i.test(this._wxErr)) break; continue; }
arr = Array.isArray(j) ? j : [j];
if (arr[0] && arr[0].hourly && arr[0].hourly.time) break;
this._wxErr = 'keine Daten (' + m + ')'; arr = [];
} catch (e) { this._wxErr = 'nicht erreichbar'; }
}
if (!arr.length) throw 0;
const times = arr[0].hourly.time.map(s => Date.parse(s + 'Z'));
const H_ = k => o => o.hourly[k] || [];
const pts = arr.map(o => o.hourly.time.map((_, i) => erWxPt(H_('wind_speed_10m')(o)[i], H_('wind_direction_10m')(o)[i], H_('cloud_cover')(o)[i], (o.hourly.cloud_cover_low || [])[i], (o.hourly.cloud_cover_mid || [])[i], (o.hourly.cloud_cover_high || [])[i], H_('sunshine_duration')(o)[i], H_('visibility')(o)[i], H_('snowfall_height')(o)[i], H_('wind_gusts_10m')(o)[i], H_('temperature_2m')(o)[i], H_('dew_point_2m')(o)[i])));
this._wx = { cols, rows, n: b.getNorth(), s: b.getSouth(), w: b.getWest(), e: b.getEast(), times, pts };
this._wxBounds = b; this._wxAt = Date.now(); this._wxSrc = 'web'; this._wxErr = '';
this._haRefresh(this._cfg.wx_entity);
try { localStorage.setItem('erwx1', JSON.stringify({ at: this._wxAt, wx: this._wx })); } catch (e) {}
}
_moon() {
const S = this._hass ? this._hass.states : {}, n = id => { const v = S[id] ? parseFloat(S[id].state) : NaN; return isFinite(v) ? v : null; };
let az = n('sensor.sol_moon_azimuth'), el = n('sensor.sol_moon_elevation');
if (az == null || el == null) { const m = S['sensor.moon_api'], a = m && m.attributes; if (a) { az = parseFloat(a.moon_azimuth); el = parseFloat(a.moon_altitude); } }
if (!isFinite(az) || !isFinite(el)) return null;
let il = n('sensor.astroweather_moon_phase'); il = il == null ? 0.5 : Math.max(0, Math.min(1, il / 100));
return { az, el, il };
}
_demAt(lat, lng) {
const D = this._dem; if (!D || !this._map) return NaN;
const p = this._map.project([lat, lng], D.z), x = (p.x - D.x0 * 256) / 2, y = (p.y - D.y0 * 256) / 2;
return x < 0 || y < 0 || x >= D.w - 1 || y >= D.h - 1 ? NaN : erBil(D.Z, D.w, D.h, x, y);
}
_radarAt(lat, lng) {
const G = this._grid, Rv = this._rv; if (!G || !Rv || Rv.length !== G.gw * G.gh) return 0;
const p = LL.CRS.EPSG3857.project(LL.latLng(lat, lng)), x = (p.x - G.sw.x) / (G.ne.x - G.sw.x) * G.gw, y = (G.ne.y - p.y) / (G.ne.y - G.sw.y) * G.gh;
return x < 0 || y < 0 || x >= G.gw - 1 || y >= G.gh - 1 ? 0 : erBil(Rv, G.gw, G.gh, x, y);
}
_drawFog(map, W, H, dpr, tNow, now, sEl) {
const cv = this._cvG; if (!cv) return;
const x = cv.getContext('2d');
let fmax = 0; if (this._wx) { const T = this._wx.times; let ti = 0; while (ti < T.length - 2 && T[ti + 1] <= tNow) ti++; for (const p of this._wx.pts) { const a0 = p[ti] ? p[ti].fog : 0, a1 = p[ti + 1] ? p[ti + 1].fog : 0; if (a0 > fmax) fmax = a0; if (a1 > fmax) fmax = a1; } }
if (!this._wx || this._cfg.show_fog === false || fmax < 0.05 || !this._dem) { if (this._fogDrawn) { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); this._fogDrawn = false; } this._fogAny = false; return; }
x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); this._fogAny = false; this._fogDrawn = true;
const CS = 10, cw = Math.ceil(W / CS), ch = Math.ceil(H / CS), z = map.getZoom(), nw = map.containerPointToLatLng([0, 0]), se = map.containerPointToLatLng([W, H]);
const q = this._fgC || (this._fgC = document.createElement('canvas'));
if (q.width !== cw || q.height !== ch) { q.width = cw; q.height = ch; q._img = q.getContext('2d').createImageData(cw, ch); }
const d = q._img.data; d.fill(0);
const key = [z, W, H, Math.round(nw.lat * 1e4), Math.round(nw.lng * 1e4), this._dem ? this._dem.z + ':' + this._dem.x0 + ':' + this._dem.y0 : ''].join('|');
if (this._fgK !== key || !this._fgE || this._fgE.length !== cw * ch) {
this._fgK = key; this._fgE = new Float32Array(cw * ch); let mn = Infinity;
for (let yy = 0; yy < ch; yy++) for (let xx = 0; xx < cw; xx++) { const e = this._demAt(nw.lat + (se.lat - nw.lat) * (yy + 0.5) / ch, nw.lng + (se.lng - nw.lng) * (xx + 0.5) / cw); this._fgE[yy * cw + xx] = e; if (isFinite(e) && e < mn) mn = e; }
this._fgMin = isFinite(mn) ? mn : NaN;
}
const E = this._fgE, mn = this._fgMin, nightF = 1 - Math.max(0, Math.min(1, (sEl + 6) / 7)), nk = 0.45 + 0.55 * (1 - nightF), ts = now / 1000;
const NL = nightF > 0 && this._nP && this._nP.z === z && this._cfg.night_lights !== false ? this._nP.lf : null, org = map.project(nw, z);
const lfAt = (wx, wy) => erLfAt(NL, wx, wy);
const mo = nightF > 0 ? this._moon() : null, mK = mo ? nightF * mo.il * erSm(0, 12, mo.el) : 0;
for (let yy = 0; yy < ch; yy++) {
const lat = nw.lat + (se.lat - nw.lat) * (yy + 0.5) / ch;
for (let xx = 0; xx < cw; xx++) {
const wv = this._wxAt2(lat, nw.lng + (se.lng - nw.lng) * (xx + 0.5) / cw, tNow), f = wv ? wv.fog : 0;
if (!(f > 0.05)) continue;
const i = yy * cw + xx, e = E[i], top = isFinite(mn) && isFinite(e) ? mn + 120 + 220 * f : NaN;
const lay = isFinite(top) ? 1 - erSm(top - 20, top + 20, e) : 1, tex = 0.92 + 0.08 * fbm(xx * 0.15 - ts * 0.01, yy * 0.15), a = Math.min(0.5, 0.55 * f * lay * tex);
if (a < 0.01) continue; if (a > 0.18) this._fogAny = true;
let fr = 205, fg = 212, fb = 220, fa = a;
if (nightF > 0) {
const gl = NL ? Math.min(1, lfAt(org.x + (xx + 0.5) * CS, org.y + (yy + 0.5) * CS) * 0.8) : 0;
const nr = 70 + 130 * gl + 40 * mK, ng = 76 + 78 * gl + 44 * mK, nb = 86 + 24 * gl + 56 * mK;
fr += (nr - fr) * nightF; fg += (ng - fg) * nightF; fb += (nb - fb) * nightF; fa = Math.min(0.7, a * (1 + 0.25 * nightF));
}
const o = i * 4; d[o] = fr * (nightF > 0 ? 1 : nk); d[o + 1] = fg * (nightF > 0 ? 1 : nk); d[o + 2] = fb * (nightF > 0 ? 1 : nk); d[o + 3] = fa * 255;
}
}
q.getContext('2d').putImageData(q._img, 0, 0);
x.setTransform(dpr, 0, 0, dpr, 0, 0); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(q, 0, 0, cw * CS, ch * CS);
}
_wxAt2(lat, lng, t) {
const W = this._wx; if (!W) return null;
const T = W.times; let i = 0; while (i < T.length - 2 && T[i+1] <= t) i++;
const ft = Math.min(1, Math.max(0, (t - T[i]) / (T[i+1] - T[i])));
const gx = Math.min(W.cols - 1.001, Math.max(0, (lng - W.w) / (W.e - W.w) * (W.cols - 1)));
const gy = Math.min(W.rows - 1.001, Math.max(0, (W.n - lat) / (W.n - W.s) * (W.rows - 1)));
const x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0;
const at = (x, y, k) => { const p = W.pts[y * W.cols + x]; const a = p[i], b = p[i+1]; return a[k] + (b[k] - a[k]) * ft; };
const bil = k => at(x0, y0, k)*(1-fx)*(1-fy) + at(x0+1, y0, k)*fx*(1-fy) + at(x0, y0+1, k)*(1-fx)*fy + at(x0+1, y0+1, k)*fx*fy;
const u = bil('u'), v = bil('v');
return { u, v, s: Math.hypot(u, v), c: bil('c'), b: bil('b'), l: bil('l'), h: bil('h'), lo: bil('lo'), mi: bil('mi'), sd: bil('sd'), sh: bil('sh'), g: bil('g'), fog: bil('fog') };
}
_syncStrikes() {
if (!this._hass || !this._strikes) return;
const st = this._hass.states, now = Date.now(), seen = new Set(), maxAge = this._cfg.lightning_minutes * 60000;
for (const id in st) {
if (!id.startsWith('geo_location.')) continue;
const s = st[id], a = s.attributes || {};
if (!(a.source === 'blitzortung' || /lightning|blitz/i.test(id))) continue;
if (a.latitude == null || a.longitude == null) continue;
const t = Date.parse(a.publication_date || s.last_changed);
if (!isFinite(t) || now - t > maxAge) continue;
seen.add(id);
if (!this._strikes.has(id)) this._strikes.set(id, { lat: a.latitude, lng: a.longitude, t, born: this._seeded ? performance.now() : null, b: null });
}
for (const id of [...this._strikes.keys()]) if (!seen.has(id) && now - this._strikes.get(id).t > maxAge) this._strikes.delete(id);
this._seeded = true;
}
_syncFlights() {
if (!this._hass || this._cfg.show_flights === false) return;
const c = this._cfg, st = this._hass.states[c.flights_entity], sa = c.adsb_entity ? this._hass.states[c.adsb_entity] : null;
if (st === this._flSt && sa === this._adSt) return;
this._flSt = st; this._adSt = sa;
const map = this._fl || (this._fl = new Map()), seen = new Set(), now = Date.now(), calls = new Set(), hexes = new Set(), regs = new Set();
const upd = (id, rec) => {
seen.add(id);
const o = map.get(id);
if (!o) { map.set(id, Object.assign({ t: now, dLat: rec.lat, dLng: rec.lng, dHdg: rec.hdg, rot: Math.random() * 6, tr: [], trAt: 0 }, rec)); return; }
const moved = o.lat !== rec.lat || o.lng !== rec.lng;
if (!moved) { delete rec.lat; delete rec.lng; delete rec.hdg; delete rec.mps; Object.assign(o, rec); }
else Object.assign(o, rec, { t: now });
};
const ads = sa && Array.isArray(sa.attributes.aircraft) ? sa.attributes.aircraft : [];
const list = st && Array.isArray(st.attributes.flights) ? st.attributes.flights : [];
const regKind = r => { r = String(r || '').replace('-', '').toUpperCase(); return /^D[EFKM][A-Z]{3}$/.test(r) ? 'p1' : /^D[GI][A-Z]{3}$/.test(r) ? 'p2' : ''; };
const frPos = [];
for (const f of list) {
const lat = num(f.latitude), lng = num(f.longitude); if (lat == null || lng == null) continue;
const id = 'fr:' + String(f.id || f.flight_number || f.callsign || f.aircraft_registration);
const altFt = num(f.altitude), spdKt = num(f.ground_speed), hdg = num(f.heading);
const code = String(f.aircraft_code || '').toUpperCase(), cat = String(f.aircraft_category || '');
let kind = 'jet';
if (/heli|rotor/i.test(cat) || HELI_RE.test(code)) kind = 'heli';
else if (P4_RE.test(code)) kind = 'p4';
else if (HEAVY_RE.test(code)) kind = 'heavy';
else if (WIDE_RE.test(code)) kind = 'wide';
else if (P2_RE.test(code)) kind = 'p2';
else if (regKind(f.aircraft_registration || f.callsign)) kind = regKind(f.aircraft_registration || f.callsign);
else if (/glider|balloon/i.test(cat) || GLIDER_RE.test(code)) kind = 'ga';
else if (/light|small|ultra/i.test(cat) || GA_RE.test(code) || (!f.airline_icao && !f.airport_origin_code_iata && !f.airport_destination_code_iata && altFt != null && altFt < 10000) || (!f.airline_icao && !code && spdKt != null && spdKt < 150 && altFt != null && altFt < 12000)) kind = 'p1';
const o = f.airport_origin_code_iata || f.airport_origin_code_icao || '', d = f.airport_destination_code_iata || f.airport_destination_code_icao || '';
for (const k of [f.callsign, f.flight_number]) if (k) calls.add(String(k).trim().toUpperCase());
const fh = [f.aircraft_icao_24bit, f.icao_24bit, f.hex, f.mode_s].filter(Boolean).map(k => String(k).trim().toLowerCase());
for (const k of fh) hexes.add(k);
const mil = !code && kind !== 'heli' ? erMil(fh[0], f.airline || f.airline_short) : '';
if (mil) kind = 'mil';
if (f.aircraft_registration) regs.add(String(f.aircraft_registration).replace('-', '').toUpperCase());
const oLL = [num(f.airport_origin_latitude), num(f.airport_origin_longitude)], dLL = [num(f.airport_destination_latitude), num(f.airport_destination_longitude)];
const rec = { lat, lng, altM: altFt == null ? null : altFt * 0.3048, mps: spdKt == null ? 0 : spdKt * 0.514444, hdg: hdg == null ? (map.get(id) ? map.get(id).hdg : 0) : hdg,
label: f.callsign || f.flight_number || f.aircraft_registration || '', route: o && d ? o + '–' + d : '', kind, mil, antId: false, ground: f.on_ground === 1 || f.on_ground === true, src: 'fr',
vs: num(f.vertical_speed),
info: { fn: f.flight_number || '', al: f.airline_short || f.airline || '', model: f.aircraft_model || f.aircraft_code || '', reg: f.aircraft_registration || '', photo: f.aircraft_photo_medium || f.aircraft_photo_small || '',
oC: o, oCity: f.airport_origin_city || '', oCc: f.airport_origin_country_code || '', oCn: f.airport_origin_country_name || '', dC: d, dCity: f.airport_destination_city || '', dCc: f.airport_destination_country_code || '', dCn: f.airport_destination_country_name || '',
oLL: oLL[0] != null && oLL[1] != null ? oLL : null, dLL: dLL[0] != null && dLL[1] != null ? dLL : null,
dep: num(f.time_real_departure), depS: num(f.time_scheduled_departure), arr: num(f.time_estimated_arrival) || num(f.time_real_arrival) || num(f.time_scheduled_arrival), arrEst: !!f.time_estimated_arrival && !f.time_real_arrival } };
if (Array.isArray(f.coordinates)) rec.tr = f.coordinates.slice(-14).map(q => [num(q[0]), num(q[1])]).filter(q => q[0] != null && q[1] != null);
upd(id, rec);
frPos.push({ id, lat, lng, alt: altFt, hdg: hdg, blind: !(f.callsign && f.callsign !== 'Blocked') && !f.aircraft_registration && !fh.length });
}
const pref = String(c.adsb_filter || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
for (const a of ads) {
const cs = String(a.flight || '').trim().toUpperCase(), hex = String(a.hex || '').trim().toLowerCase(), reg = String(a.r || '').replace('-', '').toUpperCase();
if (pref.length && (!cs || !pref.some(p => cs.startsWith(p)))) continue;
if ((cs && calls.has(cs)) || (hex && hexes.has(hex)) || (reg && regs.has(reg))) continue;
const lat = num(a.lat), lng = num(a.lon); if (lat == null || lng == null) continue;
if (num(a.seen_pos) != null && num(a.seen_pos) > 60) continue;
const gnd = a.alt_baro === 'ground', altFt = gnd ? 0 : num(a.alt_baro != null ? a.alt_baro : a.alt_geom), spdKt = num(a.gs), hdg = num(a.track != null ? a.track : a.true_heading);
/* Doppelt? Flightradar24 zeigt manche Flieger ohne Kennung („Blocked“) – dann über Position, Höhe und Kurs abgleichen.
Treffer: FR24-Eintrag behält Symbol und Route, bekommt aber die Kennung vom eigenen Empfänger; kein zweites Symbol */
const dup = frPos.find(q => {
const dy = (q.lat - lat) * 111.32, dx = (q.lng - lng) * 111.32 * Math.cos(lat * Math.PI / 180), dk = Math.hypot(dx, dy);
const da = q.alt != null && altFt != null ? Math.abs(q.alt - altFt) : 0, dh = q.hdg != null && hdg != null ? Math.abs(((q.hdg - hdg + 540) % 360) - 180) : 0;
return dk < (q.blind ? 8 : 3) && da < 1200 && dh < 25;
});
if (dup) {
const o = map.get(dup.id);
if (o && dup.blind && cs) { o.label = cs; o.antId = true; o.info = Object.assign({}, o.info, { hex: hex.toUpperCase(), fn: cs }); }
continue;
}
const cat = String(a.category || '').toUpperCase(), tc = String(a.t || '').toUpperCase();
let kind;
if (cat === 'A7' || HELI_RE.test(tc) || /^(IBIS|CHX|CHRISTOPH|HUMMEL|SAR|POLICE|POL)/.test(cs)) kind = 'heli';
else if (P4_RE.test(tc)) kind = 'p4';
else if (cat === 'A5' || HEAVY_RE.test(tc)) kind = 'heavy';
else if (WIDE_RE.test(tc)) kind = 'wide';
else if (P2_RE.test(tc)) kind = 'p2';
else if (regKind(a.r || cs)) kind = regKind(a.r || cs);
else if (cat === 'B1' || cat === 'B2' || GLIDER_RE.test(tc)) kind = 'ga';
else if (cat === 'A3' || cat === 'A4' || cat === 'A6') kind = 'jet';
else if (/^(A1|B4|B6)$/.test(cat) || GA_RE.test(tc)) kind = 'p1';
else if (cat === 'A2') kind = altFt != null && altFt > 20000 ? 'jet' : (spdKt != null && spdKt < 260 ? 'p2' : 'jet');
else kind = altFt != null && altFt < 10000 && (spdKt == null || spdKt < 200) ? 'p1' : 'jet';
const mil = !tc && kind !== 'heli' ? erMil(hex, '', a.dbFlags & 1) : '';
if (mil) kind = 'mil';
const id = 'ad:' + hex, old = map.get(id);
upd(id, { lat, lng, altM: altFt == null ? null : altFt * 0.3048, mps: spdKt == null ? 0 : spdKt * 0.514444, hdg: hdg == null ? (old ? old.hdg : 0) : hdg,
label: cs || (a.r ? String(a.r) : hex.toUpperCase()), route: '', kind, mil, ground: gnd, src: 'ad', ant: true,
vs: num(a.baro_rate != null ? a.baro_rate : a.geom_rate), info: { model: a.desc || a.t || '', reg: a.r || '', hex: hex.toUpperCase() } });
}
for (const id of [...map.keys()]) if (!seen.has(id)) map.delete(id);
if (this._sel && !map.has(this._sel)) this._closeSheet();
}
_openSheet(id) {
const f = this._fl && this._fl.get(id); if (!f) return;
this._sel = id; this._shT = 0;
const I = f.info || {}, sh = this.$('sh');
let t1, t2, t3 = '', ph;
if (f.src === 'ad') {
const m = /^CHX0*(\d+)/.exec(f.label), pol = /^IBIS/.test(f.label);
t1 = esc(f.label) + (m ? ' · Christoph ' + m[1] : pol ? ' · Polizeihubschrauber' : '');
const what = m ? 'Rettungshubschrauber' : pol ? 'Polizei' : f.kind === 'heli' ? 'Hubschrauber' : f.kind === 'mil' ? 'Militär · Typ unbekannt' : (I.model || 'Luftfahrzeug');
t2 = esc([what, I.reg].filter(Boolean).join(' · '));
t3 = '<div class="fs-t3">nur über eigene Antenne geortet</div>';
ph = '<div class="fs-ph r"><ha-icon icon="' + (f.kind === 'heli' ? 'mdi:helicopter' : 'mdi:airplane') + '"></ha-icon></div>';
} else {
t1 = esc([I.fn || f.label, I.al].filter(Boolean).join(' · '));
if (f.antId) t3 = '<div class="fs-t3">Kennung über eigene Antenne (bei Flightradar24 anonym)</div>';
t2 = esc(f.kind === 'mil' ? [I.al, 'Militär · Typ unbekannt'].filter(Boolean).join(' · ') : [I.model, I.reg].filter(Boolean).join(' · ') || f.label);
ph = I.photo ? '<img class="fs-ph" src="' + esc(I.photo) + '" alt="" onerror="this.style.visibility=\'hidden\'">'
: '<div class="fs-ph' + (f.kind === 'heli' ? ' r' : '') + '"><ha-icon icon="' + (f.kind === 'heli' ? 'mdi:helicopter' : 'mdi:airplane') + '"></ha-icon></div>';
}
let route = '';
if (I.oC && I.dC) {
const dep = I.dep ? 'Ab ' + hhmm(I.dep) + (I.depS && Math.abs(I.dep - I.depS) > 120 ? ' (plan ' + hhmm(I.depS) + ')' : '') : I.depS ? 'Plan ab ' + hhmm(I.depS) : '';
const arr = I.arr ? 'An ' + hhmm(I.arr) + (I.arrEst ? ' erwartet' : '') : '';
const flg = cc => /^[A-Za-z]{2}$/.test(cc || '') ? '<img class="fs-fl" src="https://flagcdn.com/w40/' + cc.toLowerCase() + '.png" alt="" onerror="this.remove()">' : '';
const KURZ = { GB: 'Großbritannien', US: 'USA', AE: 'VAE', BA: 'Bosnien', CD: 'Kongo', DO: 'Dom. Rep.' };
const land = (cc, nm) => { const C = (cc || '').toUpperCase(); if (KURZ[C]) return KURZ[C]; try { if (/^[A-Z]{2}$/.test(C)) return new Intl.DisplayNames(['de'], { type: 'region' }).of(C) || nm; } catch (e) {} return nm || ''; };
const ort = (city, cc, nm) => { const l = land(cc, nm); return '<span class="fs-on">' + esc(city ? city + (l ? ' (' + l + ')' : '') : l) + '</span>'; };
route = '<div class="fs-rt"><div class="fs-ap">' + esc(I.oC) + '<small>' + flg(I.oCc) + ort(I.oCity, I.oCc, I.oCn) + '</small></div><div class="fs-ap fs-r">' + esc(I.dC) + '<small>' + flg(I.dCc) + ort(I.dCity, I.dCc, I.dCn) + '</small></div></div>'
+ (I.oLL && I.dLL ? '<div class="fs-bar"><i id="fsp"></i><span id="fsa"><ha-icon icon="mdi:airplane"></ha-icon></span></div>' : '')
+ (dep || arr ? '<div class="fs-tm"><span>' + dep + '</span><span>' + arr + '</span></div>' : '');
}
sh.innerHTML = '<div class="fs-h">' + ph + '<div class="fs-tt"><div class="fs-t1">' + t1 + '</div><div class="fs-t2">' + t2 + '</div>' + t3 + '</div><button class="fs-x" title="Schließen">✕</button></div>' + route
+ '<div class="fs-g"><div><small>Höhe</small><b id="fsh"></b></div><div><small>Tempo</small><b id="fss"></b></div><div><small>Steigen/<wbr>Sinken</small><b id="fsv"></b></div><div><small>Entfernung ' + esc(this._cfg.home_label) + '</small><b id="fsd"></b></div></div>';
this._updSheet(f);
sh.classList.add('on');
}
_updSheet(f) {
const sh = this.$('sh'), q = s => sh.querySelector(s), I = f.info || {};
const set = (s, v) => { const e = q(s); if (e && e.textContent !== v) e.textContent = v; };
set('#fsh', altTxt(f));
set('#fss', f.ground && f.mps < 5 ? '–' : f.mps ? Math.round(f.mps * 3.6) + ' km/h' : '–');
const vms = f.vs != null ? f.vs * 0.00508 : null;
set('#fsv', vms == null ? '–' : (vms > 0.5 ? '↗ ' : vms < -0.5 ? '↘ ' : '→ ') + Math.abs(vms).toFixed(1).replace('.', ',') + ' m/s');
const cur = LL.latLng(f.dLat, f.dLng), dk = LL.latLng(this._home()[0], this._home()[1]).distanceTo(cur) / 1000;
set('#fsd', (dk < 10 ? dk.toFixed(1).replace('.', ',') : Math.round(dk)) + ' km');
if (I.oLL && I.dLL) {
const a = LL.latLng(I.oLL[0], I.oLL[1]).distanceTo(cur), b = cur.distanceTo(LL.latLng(I.dLL[0], I.dLL[1]));
const pct = Math.max(0, Math.min(100, a / Math.max(1, a + b) * 100)).toFixed(1) + '%';
const p = q('#fsp'), pl = q('#fsa');
if (p) p.style.width = pct; if (pl) pl.style.left = pct;
}
}
_closeSheet() { this._sel = null; const s = this.$('sh'); if (s) s.classList.remove('on'); }
_flPos(f, now) {
const dt = Math.min(90, Math.max(0, (now - f.t) / 1000)), d = f.mps * dt, r = f.hdg * Math.PI / 180;
return [f.lat + d * Math.cos(r) / 111320, f.lng + d * Math.sin(r) / (111320 * Math.cos(f.lat * Math.PI / 180))];
}
_drawCraft(ac, f, x, y, dt, C) {
const Y = C.Y, O = 'rgba(20,16,0,.9)', s = AC_SCALE[f.kind] || 1;
ac.save(); ac.translate(x, y); ac.rotate(f.dHdg * Math.PI / 180); ac.scale(s, s);
if (f.kind === 'mil') {
ac.beginPath(); ac.arc(0, 0, 8.5, 0, 7); ac.fillStyle = 'rgba(14,22,30,.88)'; ac.fill(); ac.lineWidth = 1.6; ac.strokeStyle = Y; ac.stroke();
ac.beginPath(); ac.moveTo(0, -16); ac.lineTo(3.8, -9.5); ac.lineTo(-3.8, -9.5); ac.closePath(); ac.fillStyle = Y; ac.fill(); ac.strokeStyle = O; ac.lineWidth = 0.7; ac.stroke();
ac.rotate(-f.dHdg * Math.PI / 180);
if (f.mil === 'de') {
const k = 5.2, q = 0.35;
ac.beginPath(); ac.moveTo(-k, -k); ac.lineTo(-k * q, -k * q); ac.lineTo(k * q, -k * q); ac.lineTo(k, -k); ac.lineTo(k * q, 0); ac.lineTo(k, k); ac.lineTo(k * q, k * q); ac.lineTo(-k * q, k * q); ac.lineTo(-k, k); ac.lineTo(-k * q, 0); ac.closePath();
ac.fillStyle = '#f2f2ec'; ac.fill();
ac.fillStyle = '#121212'; ac.fillRect(-1.1, -3.8, 2.2, 7.6); ac.fillRect(-3.8, -1.1, 7.6, 2.2);
} else {
ac.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.4 : 5.6, a = -Math.PI / 2 + i * Math.PI / 5; i ? ac.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ac.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ac.closePath();
ac.fillStyle = '#f2f2ec'; ac.fill();
}
} else if (f.kind === 'heli') {
ac.lineCap = 'round';
ac.beginPath(); ac.moveTo(0, 3); ac.lineTo(0, 10.5); ac.strokeStyle = O; ac.lineWidth = 2.6; ac.stroke(); ac.strokeStyle = Y; ac.lineWidth = 1.3; ac.stroke();
ac.beginPath(); ac.moveTo(-2.4, 10.5); ac.lineTo(2.4, 10.5); ac.strokeStyle = O; ac.lineWidth = 2.4; ac.stroke(); ac.strokeStyle = Y; ac.lineWidth = 1.1; ac.stroke();
ac.beginPath(); ac.ellipse(0, 0, 3.2, 4.6, 0, 0, 7); ac.fillStyle = Y; ac.fill(); ac.strokeStyle = O; ac.lineWidth = 1; ac.stroke();
ac.beginPath(); ac.ellipse(0, -1.6, 1.6, 1.7, 0, 0, 7); ac.fillStyle = 'rgba(30,30,30,.5)'; ac.fill();
ac.beginPath(); ac.arc(0, 0, 8.5, 0, 7); ac.fillStyle = C.a(0.13); ac.fill();
f.rot = (f.rot + dt * 18) % 6.2832; ac.rotate(f.rot);
ac.beginPath(); ac.moveTo(-8.5, 0); ac.lineTo(8.5, 0); ac.moveTo(0, -8.5); ac.lineTo(0, 8.5);
ac.strokeStyle = C.R; ac.lineWidth = 0.9; ac.stroke();
} else if (AC_PROP[f.kind]) {
const p = acPaths()[f.kind], D = AC_PROP[f.kind];
ac.lineJoin = 'round';
ac.save(); ac.translate(0.5, 0.8); ac.fillStyle = 'rgba(0,0,0,.28)'; ac.fill(p); ac.restore();
ac.strokeStyle = O; ac.lineWidth = 1.2; ac.stroke(p); ac.fillStyle = Y; ac.fill(p);
ac.beginPath(); ac.moveTo(0, -7.5); ac.lineTo(0, 7); ac.strokeStyle = 'rgba(255,255,255,.35)'; ac.lineWidth = 0.5; ac.stroke();
f.rot = (f.rot + dt * 22) % 6.2832;
D.pr.forEach(([px, py, r], i) => {
if (f.kind !== 'p1') { ac.beginPath(); ac.ellipse(px, py + 1.7, 1, 2.2, 0, 0, 7); ac.fillStyle = C.E; ac.fill(); ac.strokeStyle = O; ac.lineWidth = 0.6; ac.stroke(); }
ac.beginPath(); ac.arc(px, py, r, 0, 7); ac.fillStyle = 'rgba(255,255,255,.16)'; ac.fill();
ac.save(); ac.translate(px, py); ac.rotate(f.rot + i * 0.9);
ac.beginPath(); ac.moveTo(-r, 0); ac.lineTo(r, 0); ac.lineCap = 'round';
ac.strokeStyle = 'rgba(20,16,0,.55)'; ac.lineWidth = 1.6; ac.stroke();
ac.strokeStyle = 'rgba(255,255,255,.85)'; ac.lineWidth = 0.8; ac.stroke();
ac.restore();
});
} else {
const P = acPaths(), p = f.kind === 'heavy' ? P.heavy : f.kind === 'ga' ? P.ga : P.jet;
ac.translate(-12, -12); ac.lineJoin = 'round';
ac.save(); ac.translate(0.5, 0.8); ac.fillStyle = 'rgba(0,0,0,.28)'; ac.fill(p); ac.restore();
for (const [ex, ey] of (AC_ENG[f.kind] || [])) {
ac.beginPath(); ac.ellipse(ex, ey, 0.9, 1.9, 0, 0, 7); ac.fillStyle = C.E; ac.fill(); ac.strokeStyle = O; ac.lineWidth = 0.6; ac.stroke();
ac.beginPath(); ac.ellipse(ex, ey - 1.55, 0.62, 0.32, 0, 0, 7); ac.fillStyle = 'rgba(20,20,20,.85)'; ac.fill();
}
ac.strokeStyle = O; ac.lineWidth = 1.2; ac.stroke(p); ac.fillStyle = Y; ac.fill(p);
ac.beginPath(); ac.moveTo(12, 3.2); ac.lineTo(12, 17); ac.strokeStyle = 'rgba(255,255,255,.35)'; ac.lineWidth = 0.5; ac.stroke();
if (f.kind === 'ga') { ac.beginPath(); ac.moveTo(10.2, 2.3); ac.lineTo(13.8, 2.3); ac.strokeStyle = O; ac.lineWidth = 0.9; ac.stroke(); }
}
ac.restore();
}
/* Positionslichter: farbiger Doppelblitz an den Flügelspitzen (links rot, rechts grün), Schein nur mit dem Blitz,
klingt in einem Sekundenbruchteil ab; nachts etwas größer und heller (weicher Übergang über den Sonnenstand) */
_navLights(ac, f, x, y, nf) {
const NAV = { jet: [9.7, 2.6], wide: [9.7, 2.6], heavy: [11.3, 3.5], ga: [9.2, -3.4], p1: [9, -1.8], p2: [11, -1.8], p4: [12.5, -1.8], heli: [3.4, 0] };
const pos = NAV[f.kind]; if (!pos) return;
if (f.navOff == null) { let h = 0; const id = String(f.id || f.label || ''); for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 1500; f.navOff = h / 1000; }
const ph = (Date.now() / 1000 + f.navOff) % 1.5, flash = ph < 0.07 || (ph > 0.16 && ph < 0.23);
const glow = ph < 0.16 ? Math.exp(-ph / 0.09) : Math.exp(-(ph - 0.16) / 0.11);
if (glow < 0.02 && !flash) return;
const s = AC_SCALE[f.kind] || 1, r = f.dHdg * Math.PI / 180, ca = Math.cos(r), sa = Math.sin(r);
const halo = 3.5 + 2.5 * nf, ga = (0.5 + 0.25 * nf) * glow;
const lamp = (lx, col) => {
const px = x + (lx * ca - pos[1] * sa) * s, py = y + (lx * sa + pos[1] * ca) * s;
ac.save(); ac.globalCompositeOperation = 'lighter';
const g = ac.createRadialGradient(px, py, 0, px, py, halo); g.addColorStop(0, 'rgba(' + col + ',' + (ga * 0.5).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
ac.fillStyle = g; ac.beginPath(); ac.arc(px, py, halo, 0, 7); ac.fill(); ac.restore();
if (flash) { ac.beginPath(); ac.arc(px, py, 1, 0, 7); ac.fillStyle = 'rgba(' + col + ',.95)'; ac.fill(); }
};
lamp(-pos[0], '255,59,48'); lamp(pos[0], '48,209,88');
}
_drawAnt(ac, x, y) {
const G = '#30D158';
ac.save(); ac.translate(x, y);
ac.beginPath(); ac.arc(0, 0, 5.5, 0, 7); ac.fillStyle = 'rgba(14,22,30,.92)'; ac.fill(); ac.strokeStyle = G; ac.lineWidth = 1; ac.stroke();
ac.translate(0, 0.5); ac.scale(0.62, 0.62);
ac.strokeStyle = G; ac.fillStyle = G; ac.lineWidth = 1.1; ac.lineCap = 'round';
ac.beginPath(); ac.moveTo(0, 4); ac.lineTo(0, -0.5); ac.stroke();
ac.beginPath(); ac.arc(0, -1.5, 1, 0, 7); ac.fill();
for (const r of [2.8, 4.6]) {
ac.beginPath(); ac.arc(0, -1.5, r, -0.7, 0.7); ac.stroke();
ac.beginPath(); ac.arc(0, -1.5, r, Math.PI - 0.7, Math.PI + 0.7); ac.stroke();
}
ac.restore();
}
_drawFlights(map, W, H, dpr, perf) {
const ac = this._cvA.getContext('2d'); ac.setTransform(dpr, 0, 0, dpr, 0, 0); ac.clearRect(0, 0, W, H);
const c = this._cfg, dt = Math.min(0.25, Math.max(0, (perf - (this._flT || perf)) / 1000)); this._flT = perf;
if (c.show_flights === false || !this._flOn || !this._fl || !this._fl.size) { if (this._sel) this._closeSheet(); return; }
const now = Date.now(), maxAlt = +c.flight_max_alt_m || 0, C = this._flColors();
const snN = this._hass && this._hass.states['sun.sun'], elN = snN ? parseFloat(snN.attributes.elevation) : 10, nfN = Math.max(0, Math.min(1, (2 - elN) / 8));
const kPos = 1 - Math.exp(-dt / 3), kHdg = 1 - Math.exp(-dt / 1.5);
const z = map.getZoom(), org = map.project(map.containerPointToLatLng([0, 0]), z);
const toPx = ll => { const p = map.project(ll, z); return { x: p.x - org.x, y: p.y - org.y }; };
ac.lineJoin = 'round'; ac.lineCap = 'round';
for (const [id, f] of this._fl) {
f.vis = false;
const tg = this._flPos(f, now), cosL = Math.cos(f.dLat * Math.PI / 180);
const rr = f.dHdg * Math.PI / 180, sinH = Math.sin(rr), cosH = Math.cos(rr);
const ey = (tg[0] - f.dLat) * 111320, ex = (tg[1] - f.dLng) * 111320 * cosL;
if (Math.hypot(ex, ey) > 4000) { f.dLat = tg[0]; f.dLng = tg[1]; f.dHdg = f.hdg; }
else {
const along = ex * sinH + ey * cosH, cross = ex * cosH - ey * sinH;
const slow = along < 0 ? Math.max(0.25, 1 + along / 1500) : 1;
const A = f.mps * dt * slow + (along > 0 ? along * kPos : 0), Cr = cross * kPos;
f.dLat += (A * cosH - Cr * sinH) / 111320; f.dLng += (A * sinH + Cr * cosH) / (111320 * cosL);
}
const dh = ((f.hdg - f.dHdg + 540) % 360) - 180; f.dHdg = (f.dHdg + dh * kHdg + 360) % 360;
if (f.src === 'ad' && now - f.trAt > 5000) { f.tr.push([f.dLat, f.dLng]); f.trAt = now; if (f.tr.length > 14) f.tr.shift(); }
if (maxAlt > 0 && f.altM != null && f.altM > maxAlt) continue;
const pt = toPx([f.dLat, f.dLng]);
if (pt.x < -40 || pt.y < -40 || pt.x > W + 40 || pt.y > H + 40) continue;
f.vis = true; f.px = pt.x; f.py = pt.y;
if (f.tr.length > 1) {
ac.beginPath();
f.tr.forEach((q, i) => { const p = toPx(q); i ? ac.lineTo(p.x, p.y) : ac.moveTo(p.x, p.y); });
ac.lineTo(pt.x, pt.y);
ac.strokeStyle = C.a(id === this._sel ? 0.45 : 0.1); ac.lineWidth = 1.2; ac.stroke();
}
if (id === this._sel) {
ac.beginPath(); ac.arc(pt.x, pt.y, 15 * (AC_SCALE[f.kind] || 1), 0, 7);
ac.strokeStyle = C.a(0.9); ac.lineWidth = 1.6; ac.stroke();
ac.fillStyle = C.a(0.12); ac.fill();
}
this._drawCraft(ac, f, pt.x, pt.y, dt, C);
if (c.show_nav_lights !== false && !f.ground) this._navLights(ac, f, pt.x, pt.y, nfN);
if (f.ant) { const sc = AC_SCALE[f.kind] || 1; this._drawAnt(ac, pt.x + 9 * sc, pt.y - 9 * sc); }
if (c.show_flight_labels !== false || c.show_flight_route !== false) {
const l1 = c.show_flight_labels !== false ? [f.label, altTxt(f) === '–' ? '' : altTxt(f)].filter(Boolean).join(' · ') : '';
const l2 = c.show_flight_route !== false ? f.route : '';
const lines = [l1, l2].filter(Boolean);
if (lines.length) {
ac.font = '500 10px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'; ac.textBaseline = 'middle';
const w = Math.max(...lines.map(t => ac.measureText(t).width)) + 10, h = lines.length * 12 + 4;
const bx = pt.x + 4 + 12 * (AC_SCALE[f.kind] || 1) + (id === this._sel ? 4 : 0), by = pt.y - h / 2;
ac.fillStyle = 'rgba(16,16,20,.6)'; ac.beginPath();
if (ac.roundRect) ac.roundRect(bx, by, w, h, 5); else ac.rect(bx, by, w, h);
ac.fill();
lines.forEach((t, i) => { ac.fillStyle = t === l2 && t !== l1 ? C.L : 'rgba(240,240,245,.95)'; ac.fillText(t, bx + 5, by + 8 + i * 12); });
}
}
}
if (this._sel) {
const f = this._fl.get(this._sel);
if (!f) this._closeSheet();
else if (perf - (this._shT || 0) > 1000) { this._shT = perf; this._updSheet(f); }
}
}
_setScale(snow) {
if (this._snow === snow) return; this._snow = snow;
const P = snow ? SP : RP, n = P.length, first = snow ? 'rgba(229,244,255,.45)' : 'rgba(100,210,255,.45)';
this.$('rb').style.background = 'linear-gradient(90deg,' + P.map((p, i) => (i ? p[1] : first) + ' ' + (i / (n - 1) * 100) + '%').join(',') + ')';
this.$('lgRt').textContent = snow ? 'Schnee' : 'Regen';
this.$('lgRi').setAttribute('icon', snow ? 'mdi:snowflake' : 'mdi:water');
}
_tick(now) {
if (!this._map || !this._W) return;
const dt = Math.min(50, now - this._last); this._last = now;
const c = this._cfg, L = LL, map = this._map, dpr = this._dpr, W = this._W, H = this._H;
const tl = map.containerPointToLayerPoint([0, 0]);
for (const cv of [this._cvG, this._cvNt, this._cvL, this._cvY, this._cvM, this._cvC, this._cvI, this._cvR, this._cvW, this._cvA, this._cvF]) L.DomUtil.setPosition(cv, tl);
const cyc = (c.loop_seconds + c.hold_seconds) * 1000;
const tq = this._paused ? this._pauseAt : now;
let el = Math.max(0, tq - this._t0) % cyc;
if (!this._paused && this._pending && el < (this._lastEl || 0)) { this._pending(); el = 0; }
this._lastEl = el;
const fr = this._frames, nF = fr.length;
const prog = Math.min(1, Math.max(0, el - c.hold_seconds * 1000) / (c.loop_seconds * 1000));
const nowT = Date.now();
let tNow, tBase, i0 = 0, i1 = 0, f = 0;
if (nF > 1) {
const tEndF = fr[nF - 1].t, tS = Math.max(fr[0].t, Math.min(nowT, tEndF - 5 * 60000));
tBase = tS; tNow = tS + (tEndF - tS) * prog;
while (i0 < nF - 2 && fr[i0 + 1].t <= tNow) i0++;
i1 = Math.min(nF - 1, i0 + 1); f = fr[i1].t > fr[i0].t ? Math.max(0, Math.min(1, (tNow - fr[i0].t) / (fr[i1].t - fr[i0].t))) : 0;
} else { tBase = nF ? fr[0].t : nowT; tNow = tBase + (+c.forecast_minutes || 120) * 60000 * prog; }
const pos = i0 + f;
const mins = Math.round((tNow - tBase) / 60000);
const ready = (nF >= 1 || this._loadFail) && !!this._wx;
if (ready !== this._ready) { this._ready = ready; this.$('spn').classList.toggle('done', ready); }
let snow = false;
const hmS = this._home(), whS = this._wx ? this._wxAt2(hmS[0], hmS[1], tNow) : null, eH = this._demAt(hmS[0], hmS[1]);
if (whS && isFinite(whS.sh) && isFinite(eH)) snow = eH > whS.sh;
else if (c.temperature_entity && this._hass.states[c.temperature_entity]) { const tv = parseFloat(this._hass.states[c.temperature_entity].state); snow = isFinite(tv) && tv <= c.snow_below; }
this._setScale(snow);
const P = snow ? SPX : RPX;
if (now - (this._nAt || 0) > 5000) {
this._nAt = now;
const sn = this._hass.states['sun.sun'], se = sn ? parseFloat(sn.attributes.elevation) : 0;
const nf = c.night_lights === false ? 0 : Math.max(0, Math.min(1, (2 - se) / 8));
this._nf = nf;
if (this._night) this._night.setOpacity((+c.night_brightness) * nf);
const hm = this._home(), wh = this._wx ? this._wxAt2(hm[0], hm[1], Date.now()) : null;
this._ovc = wh ? Math.max(0, Math.min(1, wh.l)) : 0;
const sunny = c.sun_layer === false || c.sun_spots === false ? 0 : Math.max(0, Math.min(1, (se + 1) / 4)) * (wh && isFinite(wh.sd) ? wh.sd : 1 - this._ovc) * Math.min(1, +c.sun_strength);
const wo = wh ? Math.max(wh.lo, wh.mi) : 0, cst = c.show_clouds === false ? 0 : Math.min(1, +c.cloud_strength * 1.6), dull = 1 - 0.2 * erSm(0.5, 1, wo) * cst;
this.$('mw').style.setProperty('--er-bright', (c.map_brightness * (1 - 0.4 * nf) * (1 + 0.12 * sunny) * dull).toFixed(3));
this.$('mw').style.setProperty('--er-satu', (c.map_saturation * (1 + 0.35 * sunny)).toFixed(3));
}
this._drawLight();
this._drawNight(now);
const home = this._home();
const mppL = 40075016.686 * Math.cos(home[0] * Math.PI / 180) / Math.pow(2, map.getZoom() + 8);
let wxHome = null;
if (this._wx) wxHome = this._wxAt2(home[0], home[1], tNow);
if (this._wx) {
const z = map.getZoom(), mpp = mppL, CS = 6, PAD = 48;
const hrs = (tNow - (this._wx.times[1] || tNow)) / 3600000;
const offX = (wxHome ? wxHome.u : 0) * hrs * 1000 / mpp, offY = -(wxHome ? wxHome.v : 0) * hrs * 1000 / mpp;
const sun = this._hass.states['sun.sun'], sEl = sun ? parseFloat(sun.attributes.elevation) : -90, sAz = sun ? parseFloat(sun.attributes.azimuth) : 180;
const sOn = c.sun_layer !== false, day = sOn ? Math.max(0, Math.min(1, (sEl + 1) / 4)) : 0, gold = Math.max(0, Math.min(1, (14 - sEl) / 14));
const spots = day > 0 && c.sun_spots !== false, grade = sOn && c.sun_grade !== false, ss = +c.sun_strength;
const blue = grade && sEl < 1 ? Math.min(1, (1 - sEl) / 7) * Math.max(0, Math.min(1, (sEl + 9) / 3)) : 0;
const pOn = map.project(map.containerPointToLatLng([0, 0]), z);
const FADE = 800;
let CR = this._cRef;
const fading = !!CR && !!this._cPrev && now - CR.at < CR.fade, lim = fading ? PAD * 0.95 : PAD * 0.75;
if (!CR || now - CR.at > (CR.fade || FADE) || CR.z !== z || CR.W !== W || CR.H !== H || Math.abs(offX - CR.offX) > lim || Math.abs(offY - CR.offY) > lim || Math.abs(pOn.x - CR.px) > PAD * 0.5 || Math.abs(pOn.y - CR.py) > PAD * 0.5) {
const same = !!CR && CR.z === z && CR.W === W && CR.H === H && Math.abs(pOn.x - CR.px) <= PAD * 0.5 && Math.abs(pOn.y - CR.py) <= PAD * 0.5;
const keep = same && Math.abs(offX - CR.offX) < PAD && Math.abs(offY - CR.offY) < PAD;
const wrap = same && !keep && this._cLast && CR.frz == null;
const sets = this._cSets || (this._cSets = [{}, {}]), slot = CR && CR.slot === 0 ? 1 : 0, S = sets[slot];
const cw = Math.ceil((W + 2 * PAD) / CS), ch = Math.ceil((H + 2 * PAD) / CS), nC = cw * ch;
const mkc = k => { let q = S[k]; if (!q || q.width !== cw || q.height !== ch) { q = S[k] = document.createElement('canvas'); q.width = cw; q.height = ch; q._img = q.getContext('2d').createImageData(cw, ch); } return q; };
const cvLo = mkc('lo'), cvMi = mkc('mi'), cvCi = mkc('ci'), cvLi = mkc('li');
const dLo = cvLo._img.data, dMi = cvMi._img.data, dCi = cvCi._img.data, ld = cvLi._img.data;
const sc = 0.012 * Math.pow(2, 9 - z);
const nwLL = map.containerPointToLatLng([0, 0]), seLL = map.containerPointToLatLng([W, H]);
const layers = c.cloud_layers !== false;
if (!this._cV || this._cV.length !== nC) { this._cV = new Float32Array(nC); this._cM = new Float32Array(nC); this._cI = new Float32Array(nC); this._cSF = new Float32Array(nC); }
const V = this._cV, Mv = this._cM, Ci = this._cI, SF = this._cSF;
const wd0 = wxHome ? wxHome.u : 1, wd1 = wxHome ? -wxHome.v : 0, wl = Math.hypot(wd0, wd1) || 1, wdx = wd0 / wl, wdy = wd1 / wl;
for (let y = 0; y < ch; y++) {
const lat = nwLL.lat + (seLL.lat - nwLL.lat) * ((y * CS - PAD) / H);
for (let x = 0; x < cw; x++) {
const lng = nwLL.lng + (seLL.lng - nwLL.lng) * ((x * CS - PAD) / W), i = y * cw + x;
const wv = this._wxAt2(lat, lng, tNow), X = pOn.x - PAD + x * CS, Y = pOn.y - PAD + y * CS;
const tex = fbm((X - offX) * sc, (Y - offY) * sc), cov = wv ? (layers ? wv.lo : wv.l) : 0, thr = 0.74 - cov * 0.55;
V[i] = erSm(thr, thr + 0.16, tex);
SF[i] = (wv && isFinite(wv.sd) ? wv.sd : 1) * (1 - erSm(0.1, 0.6, this._radarAt(lat, lng)));
if (layers) {
const mi = wv ? wv.mi : 0, hi = wv ? wv.h : 0, tM = 0.8 - mi * 0.75;
Mv[i] = erSm(tM, tM + 0.25, fbm((X - offX * 0.8) * sc * 0.8 + 20, (Y - offY * 0.8) * sc * 0.8 + 9)) * erSm(0.1, 0.45, mi) * (0.35 + 0.65 * mi);
const qx = X - offX * 1.6, qy = Y - offY * 1.6, ax = qx * wdx + qy * wdy, ay = -qx * wdy + qy * wdx;
Ci[i] = erSm(0.55, 0.8, nz(ax * sc * 0.5 + 3, ay * sc * 4 + 1) * 0.6 + nz(ax * sc * 1.2 + 5, ay * sc * 8) * 0.4) * erSm(0.1, 0.5, hi);
} else { Mv[i] = 0; Ci[i] = 0; }
}
}
const cs = c.show_clouds === false ? 0 : Math.min(1.5, Math.max(0, +c.cloud_strength));
const rc0 = sAz * Math.PI / 180, sux = Math.sin(rc0), suy = -Math.cos(rc0);
const Lc = Math.min(60, 1500 / Math.tan(Math.max(3, sEl) * Math.PI / 180) / mpp) / CS;
const hl = day > 0 ? (grade ? erSunCol(sEl, sAz) : [255, 255, 255]) : [200, 205, 215];
const hR = 200 + (hl[0] - 200) * day, hG = 205 + (hl[1] - 205) * day, hB = 215 + (hl[2] - 215) * day;
const nightF = 1 - Math.max(0, Math.min(1, (sEl + 6) / 7)), nk = 0.42 + 0.58 * (1 - nightF), na0 = 1 + 0.35 * nightF;
const ownShadow = day > 0 && !spots;
const NL = c.night_lights !== false && c.night_glow !== false && this._nP && this._nP.z === z ? this._nP.lf : null;
const gK = NL ? (1 - Math.max(0, Math.min(1, (sEl + 6) / 7))) * Math.min(1.6, +c.night_brightness / 0.55) * 0.7 : 0;
const lfAt = (wx, wy) => erLfAt(NL, wx, wy);
let r0, g0, b0, a0;
const ovc = (tr, tg, tb, ta) => { if (ta <= 0.002) return; const na = ta + a0 * (1 - ta); r0 = (tr * ta + r0 * a0 * (1 - ta)) / na; g0 = (tg * ta + g0 * a0 * (1 - ta)) / na; b0 = (tb * ta + b0 * a0 * (1 - ta)) / na; a0 = na; };
for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
const i = y * cw + x, o = i * 4;
r0 = 0; g0 = 0; b0 = 0; a0 = 0;
let am = 0, ai = 0;
const lg = gK > 0 ? lfAt(pOn.x - PAD + x * CS, pOn.y - PAD + y * CS) * gK : 0;
if (cs > 0) {
if (ownShadow) ovc(10, 16, 30, 0.35 * erBil(V, cw, ch, x + sux * Lc, y + suy * Lc) * day * SF[i] * Math.min(1, cs * 2));
const dl = V[i];
if (dl > 0.002) {
let mnV = 1; for (let jy = -3; jy <= 3; jy += 3) for (let jx = -3; jx <= 3; jx += 3) { const vv = V[Math.min(ch - 1, Math.max(0, y + jy)) * cw + Math.min(cw - 1, Math.max(0, x + jx))]; if (vv < mnV) mnV = vv; }
const sunC = SF[i] * (1 - erSm(0.3, 0.7, mnV));
const lowS = 1 - erSm(5, 35, sEl), Lk = 1.2 + 2 * lowS, dt = erBil(V, cw, ch, x + sux * Lk, y + suy * Lk), core = erSm(0.6, 1, dl);
const face = day > 0 ? Math.max(0, Math.min(1, (dl - dt) * 3.2)) * sunC * (0.7 + 0.3 * lowS) : 0;
const shade = day > 0 ? Math.max(0, Math.min(1, (dt - dl) * 2.5)) * SF[i] * day * 0.6 : 0;
const bR = 150 - 25 * core - 36 * shade, bG = 160 - 25 * core - 36 * shade, bB = 182 - 20 * core - 30 * shade;
let cR = (bR + (hR - bR) * face) * nk, cG = (bG + (hG - bG) * face) * nk, cB = (bB + (hB - bB) * face) * nk;
/* Nachtwolken von unten beleuchtet: leicht heller, schwach warm-grau; dichtere Teile etwas heller,
über Orten je nach Größe und Helligkeit der Nachtlichter wärmer – aber nicht dominierend */
if (nightF > 0) {
const gl = Math.pow(Math.min(1, lg * 1.4), 1.4), up = 0.6 + 0.4 * core;
const nR = 64 + 8 * core + (4 + 58 * gl) * up, nG = 68 + 8 * core + (3 + 32 * gl) * up, nB = 78 + 7 * core + (2 + 8 * gl) * up;
cR += (nR - cR) * nightF; cG += (nG - cG) * nightF; cB += (nB - cB) * nightF;
}
ovc(cR, cG, cB, Math.min(1, Math.pow(dl, 0.75) * 0.92 * Math.min(1.25, cs * 2) * na0));
}
am = Mv[i] > 0 ? Math.min(1, Mv[i] * (c.mid_cloud_opacity == null ? 0.6 : +c.mid_cloud_opacity) * Math.min(1.25, cs * 2) * na0) : 0;
ai = Ci[i] > 0 ? Math.min(1, 0.38 * Ci[i] * cs * na0) : 0;
}
dLo[o] = r0; dLo[o+1] = g0; dLo[o+2] = b0; dLo[o+3] = Math.round(a0 * 255);
dMi[o] = 200 * nk + 100 * lg; dMi[o+1] = 205 * nk + 42 * lg; dMi[o+2] = 215 * nk + 6 * lg; dMi[o+3] = Math.round(am * 255);
dCi[o] = 250 * nk; dCi[o+1] = 250 * nk; dCi[o+2] = 255 * nk; dCi[o+3] = Math.round(ai * 255);
}
cvLo.getContext('2d').putImageData(cvLo._img, 0, 0);
if (layers) { cvMi.getContext('2d').putImageData(cvMi._img, 0, 0); cvCi.getContext('2d').putImageData(cvCi._img, 0, 0); }
/* Sonnenflecken + Farbstimmung (weiches Licht über dem Satellitenbild):
Wolkenlücken warm aufgehellt, Wolkenschatten (versetzt je nach Sonnenstand) bläulich abgedunkelt,
Grundton nach Tageszeit (morgens kühl-rosé, mittags neutral, abends golden, Dämmerung blau) */
const lightOn = spots || (grade && (day > 0 || blue > 0));
if (lightOn) {
const sk = erSunCol(sEl, sAz), hc = grade ? sk : [255, 255, 255];
const Ls = Math.min(60, 1500 / Math.tan(Math.max(3, sEl) * Math.PI / 180) / mpp) / CS;
const wA = grade ? day * (0.10 + 0.30 * gold) : 0;
const ov = (tr, tg, tb, ta) => { if (ta <= 0) return; const na = ta + a0 * (1 - ta); r0 = (tr * ta + r0 * a0 * (1 - ta)) / na; g0 = (tg * ta + g0 * a0 * (1 - ta)) / na; b0 = (tb * ta + b0 * a0 * (1 - ta)) / na; a0 = na; };
for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
const i = y * cw + x, o = i * 4;
r0 = sk[0]; g0 = sk[1]; b0 = sk[2]; a0 = wA;
if (blue > 0) ov(60, 90, 170, 0.35 * blue);
if (spots) {
const qx = Math.max(0, Math.min(cw - 1, Math.round(x + sux * Ls))), qy = Math.max(0, Math.min(ch - 1, Math.round(y + suy * Ls)));
const lit = (1 - V[i]) * (1 - 0.8 * V[qy * cw + qx]);
let mxN = 0; for (let jy = -2; jy <= 2; jy += 2) for (let jx = -2; jx <= 2; jx += 2) { const vv = V[Math.min(ch - 1, Math.max(0, y + jy)) * cw + Math.min(cw - 1, Math.max(0, x + jx))]; if (vv > mxN) mxN = vv; }
if (lit > 0.5) ov(hc[0], hc[1], hc[2], Math.min(1, (lit - 0.5) * 2 * 0.45 * ss * day * SF[i] * (1 - erSm(0.1, 0.5, mxN))));
else ov(20, 30, 60, Math.min(1, (0.5 - lit) * 2 * 0.5 * ss * day * SF[i]));
}
ld[o] = r0; ld[o+1] = g0; ld[o+2] = b0; ld[o+3] = Math.round(a0 * 255);
}
cvLi.getContext('2d').putImageData(cvLi._img, 0, 0);
}
if (wrap) CR.frz = [this._cLast[0] - CR.offX, this._cLast[1] - CR.offY];
this._cPrev = keep || wrap ? CR : null;
CR = this._cRef = { at: now, slot, set: S, z, W, H, offX, offY, px: pOn.x, py: pOn.y, cw, ch, light: lightOn, layers, fade: wrap ? 1800 : FADE };
}
/* Jedes Bild: vorberechnete Ebenen subpixelgenau mit dem Wind (und der Karte) verschieben;
Überblendung altes → neues Bild additiv ('lighter' = exakte lineare Mischung, kein Aufhellen/Abdunkeln in der Mitte) */
this._cLast = [offX, offY];
const PR = this._cPrev, kf = PR ? Math.min(1, (now - CR.at) / CR.fade) : 1;
const drawL = (cv, key, s, use) => {
const x = cv.getContext('2d');
x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
x.setTransform(dpr, 0, 0, dpr, 0, 0); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
const put = (Rf, al) => { if (al <= 0.001 || !use(Rf) || !Rf.set[key]) return; x.globalAlpha = al; const ddx = Rf.frz ? Rf.frz[0] : offX - Rf.offX, ddy = Rf.frz ? Rf.frz[1] : offY - Rf.offY; x.drawImage(Rf.set[key], Rf.px - PAD - pOn.x + ddx * s, Rf.py - PAD - pOn.y + ddy * s, Rf.cw * CS, Rf.ch * CS); };
if (PR && kf < 1) { put(PR, 1 - kf); x.globalCompositeOperation = 'lighter'; put(CR, kf); }
else put(CR, 1);
x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
};
drawL(this._cvM, 'mi', 0.8, Rf => Rf.layers);
drawL(this._cvC, 'lo', 1, () => true);
drawL(this._cvI, 'ci', 1.6, Rf => Rf.layers);
drawL(this._cvL, 'li', 1, Rf => Rf.light);
if (now - (this._ryAt || 0) > 60) {
this._ryAt = now;
const yc = this._cvY.getContext('2d'); yc.setTransform(dpr, 0, 0, dpr, 0, 0); yc.clearRect(0, 0, W, H);
if (day > 0 && c.sun_rays !== false) {
const rr = sAz * Math.PI / 180, ux = Math.sin(rr), uy = -Math.cos(rr), tt = Math.min(ux ? W / 2 / Math.abs(ux) : 1e9, uy ? H / 2 / Math.abs(uy) : 1e9);
const px = W / 2 + ux * tt, py = H / 2 + uy * tt, base = Math.atan2(-uy, -ux), len = Math.hypot(W, H), ts = now / 1000;
const cov = wxHome ? Math.max(0, Math.min(1, wxHome.l)) : 0, sdH = wxHome && isFinite(wxHome.sd) ? wxHome.sd : null, rainH = (this._here || 0) >= 0.1 ? 1 : 0;
const k = sdH != null ? day * ss * 4 * sdH * (1 - sdH) * (1 - rainH) * (sEl < 12 ? 1 : 0.7) : day * ss * Math.max(0.25, Math.min(1, cov * 1.4)) * (sEl < 12 ? 1 : 0.7) * (cov > 0.9 ? 0.4 : 1);
const scs = erSunCol(sEl, sAz).join(',');
for (let i = -5; i <= 5; i++) {
const an = base + i * 0.09 + Math.sin(ts * 0.3 + i) * 0.015, w = 0.018 + 0.012 * Math.sin(ts * 0.5 + i * 1.9);
const al = (0.16 + 0.1 * Math.max(0, Math.sin(i * 2.3 + ts * 0.4))) * k;
const g = yc.createRadialGradient(px, py, 0, px, py, len);
g.addColorStop(0, 'rgba(' + scs + ',' + al.toFixed(3) + ')'); g.addColorStop(0.6, 'rgba(' + scs + ',' + (al * 0.35).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + scs + ',0)');
yc.fillStyle = g; yc.beginPath(); yc.moveTo(px, py); yc.arc(px, py, len, an - w, an + w); yc.closePath(); yc.fill();
}
}
}
}
const rc = this._cvR.getContext('2d'); rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, this._cvR.width, this._cvR.height);
let here = null;
const G = this._grid;
if (G && nF) {
const a = map.latLngToContainerPoint(G.nw), b = map.latLngToContainerPoint(G.se);
rc.imageSmoothingEnabled = true; rc.imageSmoothingQuality = 'high';
if (this._raw) {
rc.globalAlpha = 1 - f; rc.drawImage(fr[i0].img, a.x * dpr, a.y * dpr, (b.x - a.x) * dpr, (b.y - a.y) * dpr);
if (f > 0.01) { rc.globalAlpha = f; rc.drawImage(fr[i1].img, a.x * dpr, a.y * dpr, (b.x - a.x) * dpr, (b.y - a.y) * dpr); }
rc.globalAlpha = 1;
} else {
const A = fr[i0].g, B = fr[i1].g, d = this._rimg.data, n = A.length, gw = G.gw, gh = G.gh;
if (!this._rv || this._rv.length !== n) this._rv = new Float32Array(n);
const RV = this._rv;
let SM = null;
if (this._dem && this._wx) {
const gk = gw + 'x' + gh + '|' + G.sw.x + '|' + G.sw.y + '|' + this._dem.z + ':' + this._dem.x0 + ':' + this._dem.y0;
if (this._smK !== gk) {
this._smK = gk; this._smE = new Float32Array(n);
for (let yy = 0; yy < gh; yy++) for (let xx = 0; xx < gw; xx++) { const ll = LL.CRS.EPSG3857.unproject(LL.point(G.sw.x + (xx + 0.5) / gw * (G.ne.x - G.sw.x), G.ne.y - (yy + 0.5) / gh * (G.ne.y - G.sw.y))); this._smE[yy * gw + xx] = this._demAt(ll.lat, ll.lng); }
}
if (now - (this._smAt || 0) > 1000 || !this._sm || this._sm.length !== n) {
this._smAt = now; const SMa = this._sm && this._sm.length === n ? this._sm : (this._sm = new Float32Array(n)); let any = false;
for (let yy = 0; yy < gh; yy += 6) for (let xx = 0; xx < gw; xx += 6) {
const ll = LL.CRS.EPSG3857.unproject(LL.point(G.sw.x + (xx + 3) / gw * (G.ne.x - G.sw.x), G.ne.y - (yy + 3) / gh * (G.ne.y - G.sw.y))), q = this._wxAt2(ll.lat, ll.lng, tNow), sh = q ? q.sh : NaN;
for (let y2 = yy; y2 < Math.min(gh, yy + 6); y2++) for (let x2 = xx; x2 < Math.min(gw, xx + 6); x2++) { const kk = y2 * gw + x2, e = this._smE[kk]; SMa[kk] = isFinite(sh) && isFinite(e) ? erSm(sh - 100, sh + 100, e) : -1; if (SMa[kk] >= 0) any = true; }
}
this._smOk = any;
}
if (this._smOk) SM = this._sm;
}
let nS = 0, nR = 0;
const colAt = (k, v) => {
if (SM[k] < 0) return palCol(v, P);
const sv = SM[k]; if (v >= 0.1) { if (sv > 0.5) nS++; else nR++; }
if (sv <= 0.02) return palCol(v, RPX); if (sv >= 0.98) return palCol(v, SPX);
const a1 = palCol(v, RPX), b1 = palCol(v, SPX); if (!a1) return b1; if (!b1) return a1;
return [a1[0] + (b1[0] - a1[0]) * sv, a1[1] + (b1[1] - a1[1]) * sv, a1[2] + (b1[2] - a1[2]) * sv, a1[3] + (b1[3] - a1[3]) * sv];
};
const fl = i1 > i0 ? fr[i0].flow : null;
if (fl && i0 !== this._fpair) { this._denseFlow(fl); this._fpair = i0; }
if (fl && f > 0.002) {
const U = this._fu, V = this._fv, f1 = 1 - f;
for (let y = 0, k = 0, p = 0; y < gh; y++) for (let x = 0; x < gw; x++, k++, p += 4) {
const u = U[k], w = V[k];
const v = erBil(A, gw, gh, x - f * u, y - f * w) * f1 + erBil(B, gw, gh, x + f1 * u, y + f1 * w) * f;
RV[k] = v >= 0.1 ? v : 0; const col = v > 0 ? (SM ? colAt(k, v) : palCol(v, P)) : null;
if (col) { d[p] = col[0]; d[p+1] = col[1]; d[p+2] = col[2]; d[p+3] = col[3]; } else d[p+3] = 0;
}
} else {
for (let k = 0, p = 0; k < n; k++, p += 4) {
const v = A[k] + (B[k] - A[k]) * f; RV[k] = v >= 0.1 ? v : 0; const col = v > 0 ? (SM ? colAt(k, v) : palCol(v, P)) : null;
if (col) { d[p] = col[0]; d[p+1] = col[1]; d[p+2] = col[2]; d[p+3] = col[3]; } else d[p+3] = 0;
}
}
this._rcv.getContext('2d').putImageData(this._rimg, 0, 0);
rc.drawImage(this._rcv, a.x * dpr, a.y * dpr, (b.x - a.x) * dpr, (b.y - a.y) * dpr);
const hp = LL.CRS.EPSG3857.project(LL.latLng(home[0], home[1]));
const hx_ = Math.floor((hp.x - G.sw.x) / (G.ne.x - G.sw.x) * G.gw), hy_ = Math.floor((G.ne.y - hp.y) / (G.ne.y - G.sw.y) * G.gh);
let s = 0, m = 0;
for (let yy = -1; yy <= 1; yy++) for (let xx = -1; xx <= 1; xx++) {
const X = hx_ + xx, Y = hy_ + yy; if (X < 0 || Y < 0 || X >= G.gw || Y >= G.gh) continue;
const kk = Y * G.gw + X; s += A[kk] + (B[kk] - A[kk]) * f; m++;
}
here = m ? s / m : 0;
this._nSnow = nS; this._nRain = nR;
}
}
this._here = here;
if (now - (this._fgAt || 0) > 1000) { this._fgAt = now; const sn2 = this._hass.states['sun.sun']; this._drawFog(map, W, H, dpr, tNow, now, sn2 ? parseFloat(sn2.attributes.elevation) : 0); }
const wc = this._cvW.getContext('2d');
wc.setTransform(dpr, 0, 0, dpr, 0, 0);
wc.globalCompositeOperation = 'destination-out'; wc.fillStyle = 'rgba(0,0,0,0.12)'; wc.fillRect(0, 0, W, H); wc.globalCompositeOperation = 'source-over';
if (this._wx && c.show_wind !== false && c.particles > 0) {
wc.lineCap = 'round';
const z = map.getZoom(), pxPerKmh = 0.04 * Math.pow(2, (z - 9) * 0.5);
/* Böen-Rhythmus: alle Windpartikel frischen alle paar Sekunden gemeinsam kurz auf (schneller, nach Böenstärke gefärbt).
Nur solange der Böen-Chip steht; je stärker die Böen über dem Mittelwind liegen, desto kräftiger */
const gH = wxHome && isFinite(wxHome.g) ? wxHome.g : 0, gx = gH - (wxHome ? wxHome.s : 0);
const pulse = this._gOn ? Math.pow(Math.max(0, Math.sin(now / 1000 * 1.4)), 6) * Math.min(1, gx / 25) : 0;
for (const p of this._parts) {
const ll = map.containerPointToLatLng([p.x, p.y]), w = this._wxAt2(ll.lat, ll.lng, tNow);
if (!w) continue;
const bo = pulse;
const k = w.s + (isFinite(w.g) ? Math.max(0, w.g - w.s) : 0) * bo, ws = Math.max(1, w.s), len = (0.6 + k / 50) * pxPerKmh * 25;
const nx = p.x + w.u / ws * len, ny = p.y - w.v / ws * len;
wc.beginPath(); wc.moveTo(p.x, p.y); wc.lineTo(nx, ny);
wc.strokeStyle = 'rgba(8,12,18,' + (k < 30 ? 0.12 : 0.35) + ')'; wc.lineWidth = 1.8 + k / 45; wc.stroke();
wc.strokeStyle = windCol(k); wc.lineWidth = 0.7 + k / 45; wc.stroke();
p.x = nx; p.y = ny;
if (--p.a < 0 || p.x < 0 || p.y < 0 || p.x > W || p.y > H) { p.x = Math.random() * W; p.y = Math.random() * H; p.a = 40 + Math.random() * 80; }
}
}
this._drawFlights(map, W, H, dpr, now);
const fc = this._cvF.getContext('2d'); fc.setTransform(dpr, 0, 0, dpr, 0, 0); fc.clearRect(0, 0, W, H);
const nowMs = Date.now(), list = c.show_lightning === false ? [] : [...this._strikes.values()].sort((x, y) => x.t - y.t);
let stormNear = false, near = null;
const homeLL = LL.latLng(home[0], home[1]), glowR = (+c.flash_radius_km || 0) * 1000 / mppL;
for (const s of list) {
const ageMin = (nowMs - s.t) / 60000; if (ageMin > c.lightning_minutes) continue;
const pt = map.latLngToContainerPoint([s.lat, s.lng]), x = pt.x, y = pt.y;
const distKm = homeLL.distanceTo([s.lat, s.lng]) / 1000;
if (distKm < c.storm_radius_km && ageMin < 15) stormNear = true;
if (distKm <= c.lightning_range_km && (!near || distKm < near.d)) near = { d: distKm, a: ageMin };
const anim = s.born != null ? (now - s.born) / 1000 : 99;
if (anim < 1) {
if (!s.b) s.b = mkBolt();
const B = s.b, tr = q => [x + q[0], y + q[1]];
const poly = (pts, n) => { fc.beginPath(); const m = n == null ? pts.length : n; for (let i = 0; i < m; i++) { const q = tr(pts[i]); i ? fc.lineTo(q[0], q[1]) : fc.moveTo(q[0], q[1]); } fc.stroke(); };
fc.lineJoin = 'round'; fc.lineCap = 'round';
if (anim < 0.14) {
const n = Math.max(2, Math.floor(anim / 0.14 * B.pts.length));
fc.strokeStyle = 'rgba(200,190,255,0.4)'; fc.lineWidth = 0.8; poly(B.pts, n);
for (const br of B.br) if (br.k < n) { fc.strokeStyle = 'rgba(200,190,255,0.25)'; fc.lineWidth = 0.6; poly(br.p, Math.min(br.p.length, n - br.k + 1)); }
} else {
const I = pulseI(anim);
if (I > 0.01) {
if (glowR > 2) this._glow(fc, x, y, glowR, [225,220,255], 0.5 * I);
const top = tr(B.pts[0]);
this._glow(fc, x, y, 58, [215,205,255], 0.3 * I); this._glow(fc, top[0], top[1], 44, [215,205,255], 0.22 * I);
for (const [w, al, cl] of [[7,0.18,'170,150,255'],[3,0.5,'220,215,255'],[1.1,1,'255,255,255']]) {
fc.strokeStyle = 'rgba(' + cl + ',' + al * I + ')'; fc.lineWidth = w; poly(B.pts);
fc.strokeStyle = 'rgba(' + cl + ',' + al * Math.pow(I, 1.6) * 0.8 + ')'; fc.lineWidth = w * 0.55; for (const br of B.br) poly(br.p);
}
}
}
if (anim < 0.4) continue;
}
const a = ageMin < 5 ? 1 : ageMin < 25 ? 1 - 0.3 * (ageMin - 5) / 20 : 0.7 * (1 - (ageMin - 25) / 5);
const base = ageMin < 5 ? 4.2 : ageMin < 15 ? 3.6 : 3, col = boltCol(ageMin);
const sz = anim < 0.8 ? base * easeBack((anim - 0.4) / 0.4) : base;
this._glow(fc, x, y, sz * 2, col, 0.4 * a);
fc.save(); fc.translate(x, y); fc.scale(sz, sz); fc.beginPath();
BOLT_SHAPE.forEach((q, i) => i ? fc.lineTo(q[0], q[1]) : fc.moveTo(q[0], q[1])); fc.closePath();
fc.lineJoin = 'round'; fc.strokeStyle = 'rgba(8,12,18,' + a * 0.85 + ')'; fc.lineWidth = 2 / sz; fc.stroke();
fc.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a + ')'; fc.fill(); fc.restore();
}
this._thunder = list.some(s => (nowMs - s.t) < 20 * 60000 && homeLL.distanceTo([s.lat, s.lng]) < c.storm_radius_km * 2000);
this._header(tNow, mins, prog, here, wxHome, stormNear && mins <= 30, snow, near);
}
_glow(ctx, x, y, r, c3, a) {
const g = ctx.createRadialGradient(x, y, 0, x, y, r);
g.addColorStop(0, 'rgba(' + c3[0] + ',' + c3[1] + ',' + c3[2] + ',' + a + ')');
g.addColorStop(0.4, 'rgba(' + c3[0] + ',' + c3[1] + ',' + c3[2] + ',' + a * 0.4 + ')');
g.addColorStop(1, 'rgba(' + c3[0] + ',' + c3[1] + ',' + c3[2] + ',0)');
ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
}
/* Vorhergesagte Bewölkung (DWD ICON-D2) am Heimatort zum gerade animierten Zeitpunkt.
Prozent = tiefe/mittlere (dichte) Wolken; hohe Schleierwolken (Cirrus) werden als Zusatz genannt statt mitgezählt */
_cloudTxt(wx, night) {
if (!wx) return null;
const lm = Math.max(0, Math.min(1, wx.l)), hi = Math.max(0, Math.min(1, wx.h)), veil = hi >= 0.4 && hi - lm >= 0.25, v = veil ? ' · Schleierwolken' : '';
const w = lm < 0.15 ? (night ? 'Klar' : 'Sonnig') : lm < 0.35 ? (night ? 'Überwiegend klar' : 'Überwiegend sonnig') : lm < 0.6 ? 'Leicht bewölkt' : lm < 0.85 ? 'Stark bewölkt' : 'Bedeckt';
return { text: w + v, pct: Math.round(lm * 100), lvl: lm < 0.15 ? (veil ? 1 : 0) : lm < 0.7 ? 1 : 2 };
}
_header(tNow, mins, prog, here, wx, storm, snow, near) {
const d = new Date(tNow), hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
this._set('tm', hm);
const we = this._cfg.warning_entity && this._hass.states[this._cfg.warning_entity], lv = we ? parseInt(we.state) || 0 : 0;
if (lv !== this._wl) {
this._wl = lv; const wa = this.$('wa'), wc = ['', '#ffd60a', '#f56300', '#ff453a', '#880e4f'][Math.min(4, Math.max(0, lv))];
wa.classList.toggle('on', lv > 0);
if (lv > 0) { wa.style.color = wc; wa.style.filter = 'drop-shadow(0 0 2.5px ' + wc + 'cc) drop-shadow(0 0 4px ' + wc + '73)'; }
}
this.$('pb').style.transform = 'scaleX(' + prog.toFixed(4) + ')';
if (Date.now() - (this._cdAt || 0) > 10000 || this._cdSnow !== snow || this._cdTh !== this._thunder) { this._cdAt = Date.now(); this._cdSnow = snow; this._cdTh = this._thunder; this._countdown(snow); }
const night = this._hass.states['sun.sun'] && this._hass.states['sun.sun'].state === 'below_horizon';
const cl = this._cloudTxt(wx, night);
if (Date.now() - (this._exAt || 0) > 3000) {
this._exAt = Date.now(); const ex = [], hm = this._home();
if (this._wx) {
const fh = this._wxAt2(hm[0], hm[1], tNow);
if (this._cfg.show_fog !== false) { if (fh && fh.fog > 0.5) ex.push('Nebel'); else if (this._fogAny) ex.push('Nebel in Tälern'); }
if ((this._nSnow || 0) > 20 && (this._nRain || 0) > 20 && fh && isFinite(fh.sh)) ex.push('Schnee ab ' + Math.round(fh.sh / 50) * 50 + ' m');
}
this._extra = ex.join(' · ');
}
this._set('cdr', this._cdH || '');
const line0 = (cl ? cl.text : (this._wxErr ? 'Wolkendaten nicht verfügbar' + (/limit/i.test(this._wxErr) ? ' (Abruf-Limit)' : this._cfg.debug ? ' (' + this._wxErr + ')' : '') : ''));
const line = [line0, this._extra].filter(Boolean).join(' · ');
if ((line || '') !== this._lineH) { this._lineH = line || ''; const sg = this._lineH ? this._lineH.split(' · ') : []; this.$('cdn').innerHTML = sg.map((t, i) => '<span class="seg">' + esc(t) + (i < sg.length - 1 ? ' ·' : '') + '</span>').join(' '); }
const rain = here != null && here >= 0.1, P = snow ? SPX : RPX;
let icon, color = '#fff';
if (storm) { icon = rain ? 'mdi:weather-lightning-rainy' : 'mdi:weather-lightning'; color = '#BF5AF2'; }
else if (rain) { icon = snow ? 'mdi:weather-snowy' : (here >= 2.5 ? 'mdi:weather-pouring' : 'mdi:weather-rainy'); const k = palCol(here, P); color = 'rgb(' + k.slice(0, 3).map(Math.round).join(',') + ')'; }
else { const lvl = cl ? cl.lvl : 1; icon = lvl === 0 ? (night ? 'mdi:weather-night' : 'mdi:weather-sunny') : lvl === 1 ? (night ? 'mdi:weather-night-partly-cloudy' : 'mdi:weather-partly-cloudy') : 'mdi:weather-cloudy'; }
const wic = this.$('wic');
if (wic.icon !== icon) wic.icon = icon;
wic.style.color = color;
const mm = this.$('mm');
mm.style.display = rain || cl ? 'inline' : 'none';
if (rain) this._set('mm', here.toFixed(1).replace('.', ',') + (snow ? ' cm/h' : ' mm/h'));
else if (cl) this._set('mm', cl.pct + ' %');
if (wx) { this._set('wd', Math.round(wx.s) + ' km/h'); this.$('wi').style.color = windCol(wx.s, true); }
const bd = this.$('chs');
bd.classList.toggle('hasb', !!near);
const gOn = !!(wx && isFinite(wx.g) && wx.g >= 30 && wx.g >= wx.s + 8);
bd.classList.toggle('hasg', gOn); this._gOn = gOn;
this._set('lgWt', gOn ? 'Wind · Böen' : 'Wind');
if (gOn) { this._set('gd', 'Böen ' + Math.round(wx.g) + ' km/h'); this.$('gi').style.color = windCol(wx.g, true); }
if (near) {
this._set('bk', (near.d < 10 ? near.d.toFixed(1).replace('.', ',') : Math.round(near.d)) + ' km');
const c3 = boltCol(near.a); this.$('bi').style.color = 'rgb(' + c3.join(',') + ')';
}
this._fitHead();
if (Date.now() - (this._dsAt || 0) > 5000) {
this._dsAt = Date.now();
const fr = this._frames || [], now = Date.now(), hm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const rT = fr.length ? (this._radarStand || fr[0].t) : 0, _st = rT && now - rT > 20 * 60000 && now - (this._lastReload || 0) > 60000 ? this._reloadAll() : 0, wT = this._wx ? this._wxAt : 0, rA = rT ? (now - rT) / 60000 : 1e9, wA = wT ? (now - wT) / 60000 : 1e9;
const C3 = ['#30D158', '#FFD60A', '#FF453A'], rs = this._radarSrc === 'ha', ws = this._wxSrc === 'ha';
const ago = T => { const m = Math.max(0, Math.round((now - T) / 60000)); return m < 1 ? 'gerade eben' : m < 60 ? 'vor ' + m + ' min' : 'vor ' + Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : ''); };
this._set('lgsr', rT ? 'Radar ' + ago(rT) + (rs === ws ? '' : rs ? ' (HA)' : ' (DWD)') : 'Radar lädt …');
this._set('lgsw', wT ? 'Wolken ' + ago(wT) + (rs === ws ? '' : ws ? ' (HA)' : ' (Open-Meteo)') : (this._wxErr ? 'Wolken fehlen' : 'Wolken laden …'));
this._set('lgsq', rT && wT && rs === ws ? '▸ ' + (rs ? 'aus Home Assistant' : 'direkt abgerufen') : '');
this.$('lgdr').style.background = rT ? C3[rA <= 15 ? 0 : rA <= 30 ? 1 : 2] : '#8e8e93';
this.$('lgdw').style.background = wT ? C3[wA <= 40 ? 0 : wA <= 90 ? 1 : 2] : '#8e8e93';
}
}
_countdown(snow) {
const now = Date.now(), th = 0.1, thd = this._thunder && !snow;
/* Zeitreihe für den Heimatort: zuerst der minütliche DWD-Nowcast (gleiche Quelle und Schwelle 0,1 mm/h wie der Sensor
„Beginn Niederschlag“), danach – jenseits seiner 60 Minuten – die Radarbilder */
let S = this._series;
const ne = this._cfg.nowcast_entity && this._hass ? this._hass.states[this._cfg.nowcast_entity] : null, NF = ne && ne.attributes && Array.isArray(ne.attributes.forecast) ? ne.attributes.forecast : null;
if (NF && NF.length > 1) {
const nc = NF.map(x => ({ t: Date.parse(x.datetime), v: +x.precipitation || 0 })).filter(x => isFinite(x.t)).sort((a, b) => a.t - b.t);
if (nc.length > 1 && nc[nc.length - 1].t > now) { const tEnd = nc[nc.length - 1].t; S = nc.concat((this._series || []).filter(x => x.t > tEnd)); }
}
let txt = '';
if (S && S.length > 1) {
let k = 0; for (let i = 0; i < S.length; i++) if (S[i].t <= now) k = i;
const word = snow ? 'Schnee' : thd ? 'Gewitter' : 'Regen';
if (S[k].v >= th) {
let end = null; for (let i = k + 1; i < S.length; i++) if (S[i].v < th) { end = S[i].t; break; }
txt = end ? word + ' noch ' + Math.max(1, Math.round((end - now) / 60000)) + ' min' : word + ' hält an';
} else {
for (let i = k + 1; i < S.length; i++) if (S[i].v >= th) {
txt = word + ' in ' + Math.max(1, Math.round((S[i].t - now) / 60000)) + ' min'; break;
}
}
}
if (!txt && thd) txt = 'Gewitter in der Nähe';
this._cdH = txt;
}
_set(id, txt) { const e = this.$(id); if (e.textContent !== txt) e.textContent = txt; }
}
class ElmoRadarCardEditor extends HTMLElement {
setConfig(config) { this._config = Object.assign({}, config); this._render(); }
set hass(h) { this._hass = h; if (this._form) this._form.hass = h; }
_full(v) {
const out = { type: this._config.type || 'custom:elmo-radar-card' };
for (const k in ER_DEFAULTS) {
const val = (v && k in v) ? v[k] : (k in this._config ? this._config[k] : ER_DEFAULTS[k]);
if (val !== undefined && val !== null && (val !== '' || k === 'adsb_filter')) out[k] = val;
}
for (const k in this._config) if (!(k in out) && k !== 'type' && !(k in ER_DEFAULTS)) out[k] = this._config[k];
return out;
}
_render() {
if (!this._form) {
const f = ElmoRadarCard._form();
this._form = document.createElement('ha-form');
this._form.schema = f.schema; this._form.computeLabel = f.computeLabel;
this._form.addEventListener('value-changed', e => {
const out = this._full(e.detail.value);
this._config = out;
this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: out }, bubbles: true, composed: true }));
});
this.appendChild(this._form);
}
if (this._hass) this._form.hass = this._hass;
this._form.data = Object.assign({}, ER_DEFAULTS, this._config);
}
}
if (!customElements.get('elmo-radar-card-editor')) customElements.define('elmo-radar-card-editor', ElmoRadarCardEditor);
if (!customElements.get('elmo-radar-card')) customElements.define('elmo-radar-card', ElmoRadarCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'elmo-radar-card')) window.customCards.push({ type: 'elmo-radar-card', name: 'ELMO Radar Card', preview: true, description: 'DWD-Nowcast-Radar mit Wind, Wolken, Sonnenlicht und Relief, Blitzen, Flugzeugen und Unwetterwarnung' });
console.info('%c ELMO-RADAR-CARD %c ' + ER_VERSION, 'background:#0A84FF;color:#fff;border-radius:3px 0 0 3px;padding:1px 4px', 'background:#1c1c1e;color:#fff;border-radius:0 3px 3px 0;padding:1px 4px');
