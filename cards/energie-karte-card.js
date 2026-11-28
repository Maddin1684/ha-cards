// energie-karte-card v4.0 (28.11.2026: Haus-Modus: Hausverbrauch-Kachel gleich transparent wie die anderen, mit Titel 'Hausverbrauch'; v3.9 (28.11.2026: Haus-Modus: Seitenkacheln schmaler (Haus gleich gross), mehr sichtbare Linie; v3.8 (28.11.2026: Linien Netz/Batterie enden genau an der Hausaussenkante; v3.7 (28.11.2026: Haus wieder groesser; Netz/Batterie nur noch eine Linie (Netz->Akku laeuft auf gleicher Hoehe hinter dem Haus und erscheint nur, wenn aktiv); v3.6 (28.11.2026: Haus kleiner, damit die Linien zu Netz/Batterie mit Flussrichtung sichtbar sind; v3.5 (28.11.2026: optional Hausbild als Mittelpunkt (haus_bild_tag / haus_bild_nacht, wechselt mit sun.sun): Kacheln rundherum, Fluesse enden am Haus, Solar laeuft hinter das Dach (Gaube hinten), Enyaq-Fluss startet am Auto (links), Wasser zur Garage (rechts), Haus-Werte als Chip unter dem Haus; v3.4: Schieberegler noch dezenter (2px Linie, 11px Knopf); v3.3: Schieberegler mit eigener Endstufe 'Gesamt' (Standard), links davon Stunden/Tage; kein x mehr am Regler; v3.2: Schieberegler ohne Auswahl ohne Knopf (ganze Linie = ganzer Zeitraum, Hinweis), Knopf erst beim Tippen/Ziehen; Zeitmarken mit 'Uhr'; v3.1: Zeitmarken unter dem Schieberegler, Anzahl je nach Breite, gewaehlte Marke hervorgehoben; v3.0: kleines x auch rechts neben dem Schieberegler (setzt Auswahl zurueck); v2.9: Schieberegler endet bei der laufenden Stunde / dem heutigen Tag (keine Zukunft), Zukunftsbalken nicht waehlbar; v2.8: Schieberegler dezenter (kleiner, duenner, gedaempft); v2.7: Schieberegler unter den Mini-Kacheln zum Waehlen von Stunde/Tag; v2.6: kleines x neben gewaehlter Stunde/Tag setzt auf Gesamt zurueck; v2.5: Verlauf enthaelt die laufende Stunde bzw. den laufenden Tag (Live-Zaehlerstand minus letzter Statistikstand), aktualisiert jede Minute; v2.4: Umschalter bleibt rechts, Ueberschrift bricht bei Platzmangel um; v2.3: Verlauf-Kopf bricht um statt abzuschneiden; v2.2: Verlauf-Ueberschrift wie andere Karten (Icon-Kachel, 14px, Trennlinie); v2.1: Balken der Mini-Kacheln mit Verlauf schwach (unten) zu kraeftig (oben); v2.0: Kachel-Flaeche passt sich der Kartenbreite an (iPad/schmale Spalten: Schrift bleibt lesbar statt alles zu verkleinern), Zeitachse Mini-Kacheln kuerzer; v1.9: Mini-Kacheln mit Zeitachse (Uhrzeit, Wochentag, Datum); v1.8: Verlauf unten als Mini-Kacheln (Netz, Solar, Akku, Wasser) mit Tagessumme und Balken, ein Umschalter Tag/Woche/Monat; Kachel-Namen weiss und groesser; v1.7: Netz-Titel bleibt 'Netz', darunter Bezug/Einspeisung; v1.6: Netz zeigt Bezug/Einspeisung mit Strommast-Import/Export-Icon und Titel; v1.5: Icons wie Energiefluss-Karte (mdi), Kachel-Hintergrund wie andere Karten (Apple-Grau .12); v1.4: Batterie-Balken in Kachelfarbe (gruen laedt, lila entlaedt, grau Ruhe), Kacheln noch transparenter; v1.3: Ladestandsbalken einfarbig nach Stand (rot < 20, gelb < 40, gruen) mit Verlauf schwach zu kraeftig; v1.2: Wasser-Balken im Blau der Kachel, Kacheln noch transparenter; v1.1: drehende Sonne weiter links oben, Tagesdaten-Pille standardmaessig aus, Ladestandsbalken als Verlauf rot-gelb-gruen, Kacheln transparenter; v1.0: erste Version – Live-Energiefluss als Kacheln mit atmenden Linien und weichem Lichtschweif (Farben und Glow-Regeln wie Energiefluss-Karte),
// Solar aufgeteilt in Dachgaube/Gartenhaus, Haus-Herkunft jetzt, Batterie- und Enyaq-Ladestand als Balken, Wasser fliesst zum Haus; einklappbare Diagramme Strom und Wasser
// (Tag/Woche/Monat aus der Langzeitstatistik); Simulations-Schalter zum Testen; grafischer Editor fuer alle Entitaeten)
(() => {
  const TAG = 'energie-karte-card';
  if (customElements.get(TAG)) return;

  const C = { red: '#ff453a', green: '#30d158', solar: '#fbbf24', solar2: '#ffe08a', lila: '#bf5af2', blue: '#0a84ff', cyan: 'rgb(64,200,224)', orange: '#f56300', yellow: '#ffd60a', t2: 'rgba(235,235,245,.6)' };
  const DEF = {
    title: 'Energie', link: '', link_label: 'Tagesdaten', simulation: false, charts: true,
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

  // Geometrie: Breite Wd passt sich der Karte an (330–440 px), erst darueber/darunter wird skaliert
  const VH = 350, TH = 94, FKEYS = [['sToHome', C.solar], ['sToGrid', C.green], ['sToBat', C.solar], ['gToHome', C.red], ['gToBat', C.red], ['bToHome', C.lila], ['water', C.blue], ['wall', C.cyan]];
  function geo(Wd, house) {
    if (house) return geoHouse(Wd);
    const m = 4, tw = Math.max(90, Math.min(110, (Wd - 2 * m - 2 * 30) / 3)), xl = m + tw / 2, xr = Wd - m - tw / 2, xc = Wd / 2;
    const sw = Math.min(220, Wd - 2 * m - tw - 24), sL = xc - sw / 2, sR = xc + sw / 2, h = tw / 2;
    const T = { solar: [xc, 46, sw], grid: [xl, 180, tw], home: [xc, 180, tw], bat: [xr, 180, tw], water: [xl, 302, tw], car: [xr, 302, tw] };
    const f = (v) => v.toFixed(1);
    const P = [
      `M${f(xc)},93 L${f(xc)},133`,
      `M${f(sL)},46 C${f(sL - (sL - xl) * 0.74)},46 ${f(xl)},80 ${f(xl)},133`,
      `M${f(sR)},46 C${f(sR + (xr - sR) * 0.74)},46 ${f(xr)},80 ${f(xr)},133`,
      `M${f(xl + h)},180 L${f(xc - h)},180`,
      `M${f(xl)},227 C${f(xl)},250 ${f(xc - 60)},246 ${f(xc)},246 C${f(xc + 60)},246 ${f(xr)},250 ${f(xr)},227`,
      `M${f(xr - h)},180 L${f(xc + h)},180`,
      `M${f(xl + h)},302 C${f(xl + h + 52)},302 ${f(xc - 18)},276 ${f(xc - 18)},227`,
      `M${f(xc + 18)},227 C${f(xc + 18)},276 ${f(xr - h - 52)},302 ${f(xr - h)},302`];
    return { Wd, VH, T, flows: FKEYS.map(([k, col], i) => [P[i], k, col]) };
  }
  // Haus-Modus: Hausbild 'Hof' (1131 x 1391, freigestellt) in der Mitte, Kacheln rundherum.
  // Bildmasse als Anteil: Waende links/rechts, Dachfirst (Solar kommt von hinten), Auto (links unten), Garage (rechts unten)
  const HOF = { ar: 1131 / 1391, wl: 0.046, wr: 0.98, wy: 0.45, roof: [0.6, 0.05], car: [0.2, 0.86], water: [0.78, 0.9] };
  function geoHouse(Wd) {
    const P0 = HOF, m = 4, tw0 = Math.max(90, Math.min(110, (Wd - 2 * m - 2 * 30) / 3)), tw = Math.max(86, tw0 - 14), xl = m + tw / 2, xr = Wd - m - tw / 2, xc = Wd / 2, h = tw / 2;
    const sw = Math.min(220, Wd - 2 * m - tw0 - 24), sL = xc - sw / 2, sR = xc + sw / 2;
    // Hausbreite wie bisher (aus der normalen Kachelbreite), Kacheln schmaler -> mehr Linie sichtbar
    const HW = Math.max(120, Math.min(230, (Wd - 2 * (m + tw0) - 30) / (P0.wr - P0.wl))), HH = HW / P0.ar, x0 = xc - HW * (P0.wl + P0.wr) / 2, y0 = 112;
    const X = (fx) => x0 + fx * HW, Y = (fy) => y0 + fy * HH, f = (v) => v.toFixed(1);
    const gy = Math.round(Y(P0.wy)), by = Math.round(Math.max(y0 + HH - 22, gy + TH + 10)), ih = 72, iy = Math.max(y0 + HH + 4, by + TH / 2 - ih);
    const VHh = Math.round(Math.max(by + TH / 2, iy + ih) + 6);
    // Enyaq links unten (Auto steht links), Wasser rechts unten (Garage)
    const T = { solar: [xc, 46, sw], grid: [xl, gy, tw], bat: [xr, gy, tw], car: [xl, by, tw], water: [xr, by, tw], home: [xc, iy + ih / 2, Math.min(150, Wd - 2 * (m + tw) - 14), ih] };
    const P = [
      `M${f(xc)},93 L${f(xc)},${f(Y(0.12))}`,
      `M${f(sL)},46 C${f(sL - (sL - xl) * 0.74)},46 ${f(xl)},${f(gy - 80)} ${f(xl)},${f(gy - TH / 2)}`,
      `M${f(sR)},46 C${f(sR + (xr - sR) * 0.74)},46 ${f(xr)},${f(gy - 80)} ${f(xr)},${f(gy - TH / 2)}`,
      `M${f(xl + h)},${gy} L${f(X(P0.wl) - 1)},${gy}`,
      `M${f(xl + h)},${gy} L${f(xr - h)},${gy}`,
      `M${f(xr - h)},${gy} L${f(X(P0.wr) + 1)},${gy}`,
      `M${f(xr - h)},${by} C${f(xr - h - 24)},${by} ${f(X(P0.water[0]))},${f(Y(P0.water[1]) + 14)} ${f(X(P0.water[0]))},${f(Y(P0.water[1]))}`,
      `M${f(X(P0.car[0]))},${f(Y(P0.car[1]))} C${f(X(P0.car[0]) - 10)},${f(Y(P0.car[1]) + 18)} ${f(xl + h + 18)},${by} ${f(xl + h)},${by}`];
    // Solar (0) und Netz->Akku (4) laufen hinter dem Haus
    return { Wd, VH: VHh, T, house: { x: x0, y: y0, w: HW, h: HH }, back: [0, 4], flows: FKEYS.map(([k, col], i) => [P[i], k, col]) };
  }
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
    .tflow { position:relative; height:${VH}px; margin:2px 0 4px; transform-origin:0 0; }
    .tln { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
    .hbild { position:absolute; object-fit:contain; pointer-events:none; filter:drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
    /* Haus-Modus: Haus-Werte als kompakter Chip unter dem Haus */
    .hm .tk.hs { flex-direction:column; align-items:center; justify-content:center; padding:6px 10px; border-radius:16px; background:rgba(118,118,128,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.06); }
    .hm .tk.hs .th { justify-content:center; font-size:11.5px; } .hm .tk.hs .th ha-icon { --mdc-icon-size:15px; width:15px; height:15px; } .hm .tk.hs .tv { margin:0; font-size:16px; line-height:20px; } .hm .tk.hs .td { width:100%; text-align:center; margin:0; font-size:10px; line-height:12px; }
    .hm .tk.hs .jr { margin:2px 0 1px; }
    .hm .tk:not(.hs) { padding:8px 8px 7px; } .hm .tk:not(.hs) .td { font-size:9.5px; letter-spacing:-.01em; } .hm .tk:not(.hs) .soc2 { left:8px; right:8px; } .hm.nar .tk:not(.hs) { padding:8px 6px 7px; } .hm.nar .tk:not(.hs) .td { font-size:9px; letter-spacing:-.02em; }
    @keyframes comet { from { stroke-dashoffset:100; } to { stroke-dashoffset:0; } }
    @keyframes breath { 0%,100% { stroke-opacity:.4; } 50% { stroke-opacity:.65; } }
    .tk { position:absolute; border-radius:16px; padding:9px 10px 8px; overflow:hidden; background:rgba(118,118,128,.12); box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);
      display:flex; flex-direction:column; transition:background .4s, box-shadow .4s; cursor:pointer; box-sizing:border-box; color:#fff; }
    .tk.on { background:linear-gradient(155deg, color-mix(in srgb, var(--c) 22%, rgba(118,118,128,.12)) 0%, rgba(118,118,128,.12) 65%); box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--c) 40%, transparent); }
    .tk.hs { background:linear-gradient(155deg, rgba(255,255,255,.14), rgba(118,118,128,.12) 65%); box-shadow:inset 0 0 0 1px rgba(255,255,255,.18); }
    .tk.gl { animation:tglow 1.6s ease-in-out infinite; }
    @keyframes tglow { 0%,100% { box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--gc) 50%, transparent), 0 0 0 transparent; } 50% { box-shadow:inset 0 0 0 1px var(--gc), 0 0 22px color-mix(in srgb, var(--gc) 55%, transparent); } }
    .tk .th { position:relative; z-index:1; display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:500; white-space:nowrap; color:#fff; }
    .tk .th ha-icon { --mdc-icon-size:18px; width:18px; height:18px; display:inline-flex; transition:color .4s; }
    .tk .tv { position:relative; z-index:1; font-size:18px; font-weight:600; letter-spacing:-.01em; line-height:22px; margin-top:auto; font-variant-numeric:tabular-nums; white-space:nowrap; transition:color .4s; }
    .tk .td { position:relative; z-index:1; font-size:10.5px; line-height:13px; color:rgba(235,235,245,.6); white-space:nowrap; font-variant-numeric:tabular-nums; margin-top:1px; overflow:hidden; text-overflow:ellipsis; }
    .tk.bt .td, .tk.cr .td { margin-bottom:5px; }
    .nar .tk { padding:8px 8px 7px; } .nar .tk .td { font-size:10px; } .nar .tk .tv { font-size:17px; } .nar .tk .gs { left:32px; }
    .nar .tk .soc2 { left:8px; right:8px; }
    .tk .gs { position:absolute; left:34px; top:28px; z-index:1; font-size:10px; line-height:12px; font-weight:500; transition:color .4s; }
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
    /* Verlauf als Mini-Kacheln */
    .vh { display:flex; align-items:center; gap:12px; min-height:44px; padding:8px 0; box-sizing:border-box; border-bottom:0.5px solid var(--divider-color, rgba(128,128,128,.3)); margin:8px 0 10px; }
    .vh .ft { flex:0 0 28px; width:28px; height:28px; border-radius:7px; background:rgba(118,118,128,.28); display:flex; align-items:center; justify-content:center; }
    .vh .vx { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; margin-left:8px; border-radius:50%; background:rgba(118,118,128,.32); font-size:11px; line-height:1; vertical-align:2px; cursor:pointer; text-transform:none; }
    .slw { margin:8px 2px 0; }
    .slr { display:flex; align-items:center; gap:10px; }
    .slw input { -webkit-appearance:none; appearance:none; width:100%; height:20px; margin:0; background:transparent; cursor:pointer; touch-action:none; }
    .slw input::-webkit-slider-runnable-track { height:2px; border-radius:1px; background:linear-gradient(90deg, rgba(255,255,255,.32) var(--p, 0%), rgba(118,118,128,.2) var(--p, 0%)); }
    .slw input::-moz-range-track { height:2px; border-radius:1px; background:linear-gradient(90deg, rgba(255,255,255,.32) var(--p, 0%), rgba(118,118,128,.2) var(--p, 0%)); }
    .slw input::-webkit-slider-thumb { -webkit-appearance:none; width:11px; height:11px; margin-top:-4.5px; border-radius:50%; background:rgba(255,255,255,.92); box-shadow:0 0.5px 2px rgba(0,0,0,.35), 0 0 0 0.5px rgba(0,0,0,.08); transition:transform .15s, opacity .3s; }
    .slw input::-moz-range-thumb { width:11px; height:11px; border:0; border-radius:50%; background:rgba(255,255,255,.92); box-shadow:0 0.5px 2px rgba(0,0,0,.35); }
    .slw input:active::-webkit-slider-thumb { transform:scale(1.3); }
    .slw .sll { position:relative; height:14px; margin:2px 0 0; font-size:10px; line-height:14px; color:var(--secondary-text-color); font-variant-numeric:tabular-nums; }
    .slw .sll span { position:absolute; top:0; transform:translateX(-50%); white-space:nowrap; transition:color .2s; }
    .slw .sll span.l { transform:translateX(-5.5px); } .slw .sll span.r { transform:translateX(calc(-100% + 5.5px)); }
    .slw .sll span.on { color:var(--primary-text-color); font-weight:500; }
    .vh .ft ha-icon { --mdc-icon-size:20px; color:#fff; display:flex; }
    .vh .t { flex:1 1 auto; min-width:0; line-height:17px; font-weight:500; font-size:14px; text-transform:uppercase; letter-spacing:.04em; color:var(--primary-text-color); }
    .seg { display:flex; background:rgba(118,118,128,.2); border-radius:8px; padding:2px; flex:none; margin-left:auto; }
    .seg span { text-align:center; font-size:11px; line-height:16px; padding:2px 9px; border-radius:6px; color:var(--secondary-text-color); cursor:pointer; user-select:none; }
    .seg span.on { background:rgba(255,255,255,.18); color:var(--primary-text-color); }
    .g4 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .mt { border-radius:14px; padding:9px 11px 10px; background:linear-gradient(155deg, color-mix(in srgb, var(--c) 16%, rgba(118,118,128,.12)), rgba(118,118,128,.12) 65%); box-shadow:inset 0 0 0 1px rgba(255,255,255,.06); min-width:0; }
    .mt .n { display:flex; align-items:center; gap:6px; font-size:12.5px; font-weight:500; color:#fff; }
    .mt .n ha-icon { --mdc-icon-size:18px; width:18px; height:18px; display:inline-flex; color:var(--c); }
    .mt .v { font-size:18px; font-weight:600; color:var(--c); margin:2px 0 6px; font-variant-numeric:tabular-nums; white-space:nowrap; }
    .mt .v span { font-size:11px; color:var(--secondary-text-color); font-weight:500; margin-left:3px; }
    .mc { position:relative; height:40px; }
    .bars { position:absolute; inset:0; display:flex; align-items:flex-end; }
    .bc { flex:1; height:100%; position:relative; cursor:pointer; }
    .bc .st { position:absolute; left:0; right:0; bottom:0; border-radius:3px; transition:height .5s, opacity .2s; background:linear-gradient(to top, color-mix(in srgb, var(--c) 35%, transparent), var(--c)); background-size:100% 40px; background-position:bottom; }
    .bc.e .st { background:rgba(118,118,128,.22) !important; }
    .bars.sel .bc .st { opacity:.3; } .bars.sel .bc.on .st { opacity:1; }
    .mxa { position:relative; height:12px; margin-top:4px; font-size:9.5px; line-height:12px; color:var(--secondary-text-color); font-variant-numeric:tabular-nums; }
    .mxa span { position:absolute; top:0; transform:translateX(-50%); white-space:nowrap; }
    .mxa span.l { transform:none; } .mxa span.r { transform:translateX(-100%); }
    .ld { font-size:12px; color:var(--secondary-text-color); padding:20px 0; text-align:center; }
  `;

  class EnergieKarteCard extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({}, DEF, c || {});
      if (!Array.isArray(this._c.stat_solar)) this._c.stat_solar = this._c.stat_solar ? [this._c.stat_solar] : [];
      this._rng = this._rng || 'tag'; this._sel = null;
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
    set hass(h) { const first = !this._hass; this._hass = h; if (!this._root) this._build(); if (first) this._loadStats(); this._render(); if (Date.now() - (this._chAt || 0) > 60000) { this._chAt = Date.now(); const hk = new Date().getHours(); if (this._hk != null && hk !== this._hk) { this._statAt = {}; this._loadStats(); } this._hk = hk; this._chart(); } }

    _build() {
      const r = this.shadowRoot || this.attachShadow({ mode: 'open' });
      this._root = r; this._last = {}; this._fl = []; this._Wd = null; this._k = null;
      const c = this._c;
      const tile = (k, nm, cls, inner) => {
        return `<div class="tk ${cls}" id="t-${k}" data-k="${k}" style="height:${TH}px">${inner}<div class="th"><ha-icon id="i-${k}"></ha-icon><span id="n-${k}">${nm}</span></div><div class="tv" id="v-${k}"></div><div class="td" id="d-${k}"></div></div>`;
      };
      // untere Linien-Ebene (Netz -> Akku laeuft hinter dem Haus), Hausbild, obere Linien-Ebene, Kacheln
      const hm = !!(c.haus_bild || c.haus_bild_tag || c.haus_bild_nacht), back = hm ? [0, 4] : [4];
      const flowSvg = `<svg class="tln" id="tln0">${back.map((i) => `<g id="f${i}"></g>`).join('')}</svg>${hm ? `<img class="hbild" id="hbild" alt="">` : ''}<svg class="tln" id="tln"><defs><filter id="gl" filterUnits="userSpaceOnUse" x="0" y="0" width="600" height="600"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${FKEYS.map((_, i) => back.includes(i) ? '' : `<g id="f${i}"></g>`).join('')}</svg>`;
      const tiles = tile('solar', 'Solar', 'sol', `<span class="rays off" id="rays"></span><span class="sp"><span class="spr"><span><i class="dot" style="background:${C.solar}"></i>Dachgaube</span><b id="sd"></b></span><span class="spr"><span><i class="dot" style="background:${C.solar2}"></i>Gartenhaus</span><b id="sg"></b></span><span class="spb"><i id="sdb" style="background:${C.solar};flex-grow:0"></i><i id="sgb" style="background:${C.solar2};flex-grow:0"></i></span></span>`)
        + tile('grid', 'Netz', '', '<span class="gs" id="gs"></span>')
        + tile('home', 'Haus', 'hs', '')
        + tile('bat', 'Batterie', 'bt', `<span class="fill" id="bfill"><svg class="wave" viewBox="0 0 120 10" preserveAspectRatio="none"><path d="M0,5 Q15,0 30,5 T60,5 T90,5 T120,5 V10 H0Z"/></svg></span><span class="soc2"><i id="bsoc"></i></span>`)
        + tile('water', 'Wasser', '', `<span class="rip off" id="rip"><svg viewBox="0 0 120 12" preserveAspectRatio="none"><path d="M0,6 Q10,0 20,6 T40,6 T60,6 T80,6 T100,6 T120,6 V12 H0Z"/></svg></span>`)
        + tile('car', 'Enyaq', 'cr', `<span class="soc2"><i id="csoc"></i></span>`);
      r.innerHTML = `<style>${CSS}</style><ha-card>
        <div class="hd"><div class="ttl">${c.title || ''}</div>${c.link ? `<span class="pl" id="lnk">${ic('chart', 'currentColor')}${c.link_label || ''}</span>` : ''}</div>
        ${c.simulation ? `<div class="sim" id="sim"></div>` : ''}
        <div class="fw" id="fw"><div class="tflow" id="tf">${flowSvg}${tiles}</div></div>
        ${c.charts ? `<div class="vh"><span class="ft"><ha-icon icon="mdi:chart-bar"></ha-icon></span><span class="t" id="vt">Heute</span><span class="seg" id="vseg"></span></div><div class="g4" id="g4"><div class="ld" style="grid-column:1/-1">Lade Verlauf …</div></div><div class="slw idle" id="slw"><div class="slr"><input type="range" id="sl" min="0" max="23" step="1" value="0" aria-label="Zeit wählen"></div><div class="sll" id="sll"></div></div>` : ''}
      </ha-card>`;
      const card = r.querySelector('ha-card');
      card.addEventListener('click', (ev) => {
        const sm = ev.target.closest('[data-sim]'); if (sm) { this._sim = sm.dataset.sim; this._render(); return; }
        if (ev.target.closest('#lnk')) { history.pushState(null, '', c.link); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); return; }
        const sg = ev.target.closest('[data-rng]'); if (sg) { this._rng = sg.dataset.rng; this._sel = null; this._loadStats(); this._chart(); return; }
        if (ev.target.closest('[data-clr]')) { this._sel = null; this._chart(); return; }
        const bc = ev.target.closest('.bc'); if (bc) { const i = +bc.dataset.i; if (this._cur != null && i > this._cur) return; this._sel = this._sel === i ? null : i; this._chart(); return; }
        const t = ev.target.closest('.tk'); if (t) { const id = { solar: c.solar_power, grid: c.grid_power, home: c.home_day, bat: c.battery_power, water: c.water_flow, car: c.car_power }[t.dataset.k]; if (id) this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: id }, bubbles: true, composed: true })); }
      });
      // feste 400er-Flaeche auf Kartenbreite skalieren (Schrift waechst mit)
      if (this._ro) this._ro.disconnect();
      this._ro = new ResizeObserver(() => this._fit()); this._ro.observe(r.getElementById('fw'));
      this._fit();
      const sl = r.getElementById('sl');
      if (sl) {
        sl.addEventListener('input', () => { const v = +sl.value; this._sel = this._cur != null && v > this._cur ? null : v; this._chart(); });
        sl.addEventListener('pointerdown', () => { this._drag = true; }); sl.addEventListener('pointerup', () => { this._drag = false; });
      }
      if (this._hass) this._render();
      if (c.charts) this._chart();
    }
    _fit() {
      const fw = this._root && this._root.getElementById('fw'), tf = this._root && this._root.getElementById('tf'); if (!fw || !tf) return;
      const cw = fw.clientWidth || 400, Wd = Math.round(Math.max(330, Math.min(500, cw))), k = Math.min(1.2, cw / Wd);
      if (this._Wd !== Wd) {
        this._Wd = Wd; this._g = geo(Wd, !!(this._c.haus_bild || this._c.haus_bild_tag || this._c.haus_bild_nacht)); this._fl = []; this._k = null;
        const G = this._g; tf.style.width = Wd + 'px'; tf.style.height = G.VH + 'px'; tf.classList.toggle('nar', Wd < 380); tf.classList.toggle('hm', !!G.house);
        ['tln', 'tln0'].forEach((id) => this._root.getElementById(id).setAttribute('viewBox', `0 0 ${Wd} ${G.VH}`));
        const hb = this._root.getElementById('hbild'); if (hb && G.house) Object.assign(hb.style, { left: G.house.x + 'px', top: G.house.y + 'px', width: G.house.w + 'px', height: G.house.h + 'px' });
        Object.entries(G.T).forEach(([key, [x, y, w, hh]]) => { const e = this._root.getElementById('t-' + key); if (e) { const th = hh || TH; e.style.left = (x - w / 2) + 'px'; e.style.top = (y - th / 2) + 'px'; e.style.width = w + 'px'; e.style.height = th + 'px'; } });
        if (this._hass) this._render();
      }
      if (this._c.charts) requestAnimationFrame(() => this._chart());
      if (this._k === k) return; this._k = k;
      tf.style.transform = `scale(${k})`; tf.style.marginLeft = Math.max(0, (cw - Wd * k) / 2) + 'px'; fw.style.height = (this._g.VH * k + 6) + 'px';
    }
    _set(id, prop, val) { const key = id + '|' + prop; if (this._last[key] === val) return; this._last[key] = val; const e = this._root.getElementById(id); if (!e) return; if (prop === 'html') e.innerHTML = val; else if (prop === 'cls') e.className = val; else if (prop === 'icon') e.setAttribute('icon', val); else if (prop === 'src') e.setAttribute('src', val); else if (prop.startsWith('--')) e.style.setProperty(prop, val); else e.style[prop] = val; }
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
      if (!this._g) return;
      this._g.flows.forEach(([d, key, col], i) => {
        const w = W[key], on = w > 0.5, t = on ? durOf(w) : 0, sig = on ? 'a' + t : 'z';
        if (this._fl[i] === sig) return; this._fl[i] = sig;
        let h;
        if (on) {
          const short = !d.includes('C');
          const [tl, ld, n, op] = short ? [58, 40, 28, 0.032] : [70, 22, 16, 0.07];
          h = `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linecap="round" style="animation:breath ${(t * 1.2).toFixed(2)}s ease-in-out infinite"/><g filter="url(#gl)">`
            + Array.from({ length: n }, (_, j) => [tl * (1 - j / n), ld * (1 - j / n)]).map(([a, b]) => `<path d="${d}" pathLength="100" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="2.2" stroke-dasharray="${(a + b).toFixed(2)} ${(100 - a - b).toFixed(2)}" style="animation:comet ${t}s linear infinite;animation-delay:-${(t * (tl - a) / 100).toFixed(3)}s"/>`).join('') + '</g>';
        } else h = this._g.house && key === 'gToBat' ? '' : `<path d="${d}" fill="none" stroke="rgba(189,189,189,.35)" stroke-width="1" stroke-dasharray="2 4"/>`;
        this._set('f' + i, 'html', h);
      });
      // Hausbild Tag/Nacht nach sun.sun
      if (c.haus_bild || c.haus_bild_tag || c.haus_bild_nacht) {
        const nacht = this._sim ? false : this._st('sun.sun') === 'below_horizon';
        this._set('hbild', 'src', (nacht ? c.haus_bild_nacht : c.haus_bild_tag) || c.haus_bild || c.haus_bild_tag || c.haus_bild_nacht);
      }
      // Kacheln
      const tk = (k, col, active, cls) => { this._set('t-' + k, 'cls', `tk ${cls}${active ? ' on' : ''}${G[k] ? ' gl' : ''}`); this._set('t-' + k, '--c', col); this._set('t-' + k, '--gc', G[k] || 'transparent'); };
      const val = (k, txt, col) => { this._set('v-' + k, 'html', txt); this._set('v-' + k, 'color', col); };
      const MDI = { solar: 'mdi:solar-power-variant', grid: s.grid > 0 ? 'mdi:transmission-tower-import' : s.grid < 0 ? 'mdi:transmission-tower-export' : 'mdi:transmission-tower', home: 'mdi:home', water: 'mdi:water', car: 'mdi:car-electric', ev: 'mdi:ev-station',
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
      val('grid', fmtW(s.grid), gCol); this._set('d-grid', 'html', `${dc(s.gday)} kWh heute`);
      this._set('gs', 'html', s.grid > 0 ? 'Bezug' : s.grid < 0 ? 'Einspeisung' : ''); this._set('gs', 'color', gCol);
      // Haus: Herkunft jetzt
      tk('home', '#fff', false, 'hs'); this._set('n-home', 'html', this._g && this._g.house ? 'Hausverbrauch' : 'Haus'); icon('home', 'home', '#fff'); val('home', fmtW(f.home), '#fff');
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
      const rng = this._rng;
      if (this._statAt[rng] && Date.now() - this._statAt[rng] < 600000) { this._chart(); return; }
      this._statAt[rng] = Date.now();
      const R = this._range(rng);
      const ids = [c.stat_grid, ...c.stat_solar, c.stat_discharge, c.stat_water].filter(Boolean);
      try {
        // eine Periode frueher starten, damit der Zaehlerstand vor dem ersten Balken bekannt ist
        const pre = new Date(+R.start - (R.period === 'hour' ? 3600e3 : 864e5));
        const res = await this._hass.callWS({ type: 'recorder/statistics_during_period', start_time: pre.toISOString(), statistic_ids: ids, period: R.period, types: ['change', 'state'] });
        const base = {}, last = {};
        ids.forEach((id) => {
          const out = Array(R.n).fill(0);
          (res[id] || []).forEach((p) => {
            const t = typeof p.start === 'number' ? p.start : Date.parse(p.start);
            if (p.state != null) last[id] = p.state;
            for (let i = 0; i < R.n; i++) { if (t >= +R.step(i) && t < +R.step(i + 1)) { out[i] += Math.max(0, p.change || 0); break; } }
          });
          base[id] = out;
        });
        this._stat[rng] = { R, base, last };
      } catch (e) { this._stat[rng] = { err: String(e && e.message || e) }; }
      this._chart();
    }
    // Werte je Kachel: abgeschlossene Perioden aus der Statistik + laufende Periode aus dem Live-Zaehler
    _series(D) {
      const c = this._c, R = D.R, now = Date.now();
      let cur = -1; for (let i = 0; i < R.n; i++) if (now >= +R.step(i) && now < +R.step(i + 1)) cur = i;
      const v = (id) => { const out = (D.base[id] || Array(R.n).fill(0)).slice(); const st = this._st(id);
        if (cur >= 0 && D.last[id] != null && st != null && !isNaN(parseFloat(st))) out[cur] += Math.max(0, parseFloat(st) - D.last[id]); return out; };
      const sol = Array(R.n).fill(0); c.stat_solar.forEach((id) => v(id).forEach((x, i) => { sol[i] += x; }));
      const st = this._hass.states[c.stat_water], fac = st && st.attributes.unit_of_measurement === 'm³' ? 1000 : 1;
      return [
        { k: 'grid', n: 'Netz', icon: 'mdi:transmission-tower-import', c: C.red, unit: 'kWh', dec: 1, v: v(c.stat_grid) },
        { k: 'solar', n: 'Solar', icon: 'mdi:solar-power-variant', c: C.solar, unit: 'kWh', dec: 1, v: sol },
        { k: 'bat', n: 'Akku', icon: 'mdi:battery-arrow-down', c: C.lila, unit: 'kWh', dec: 1, v: v(c.stat_discharge) },
        { k: 'water', n: 'Wasser', icon: 'mdi:water', c: C.blue, unit: 'L', dec: 0, v: v(c.stat_water).map((x) => x * fac) }];
    }
    _chart() {
      if (!this._root || !this._c.charts) return;
      const rng = this._rng, D = this._stat[rng], sel = this._sel;
      this._set('vseg', 'html', [['tag', 'Tag'], ['woche', 'Woche'], ['monat', 'Monat']].map(([v, l]) => `<span data-rng="${v}" class="${rng === v ? 'on' : ''}">${l}</span>`).join(''));
      if (!D || D.err) { this._set('g4', 'html', `<div class="ld" style="grid-column:1/-1">${D ? 'Statistik nicht verfügbar' : 'Lade Verlauf …'}</div>`); return; }
      const R = D.R, tiles = this._series(D), n = R.n, gap = n > 24 ? 1 : n > 7 ? 2 : 4;
      const lab = (i) => { const d = R.step(i); return R.period === 'hour' ? `${i}–${i + 1} Uhr` : `${WD[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`; };
      this._set('vt', 'html', sel != null ? `${lab(sel)}<span class="vx" data-clr="1">✕</span>` : rng === 'tag' ? 'Heute' : rng === 'woche' ? 'Letzte 7 Tage' : MON[R.start.getMonth()]);
      // Zeitachse: Uhrzeit (Tag), Wochentag (Woche), Datum (Monat)
      const ctr = (i) => ((i + 0.5) / n * 100).toFixed(2);
      const ax = R.period === 'hour' ? [[0, '0', 'l'], [6, '6'], [12, '12'], [18, '18']].map(([i, l, k]) => `<span class="${k || ''}" style="left:${(i / 24 * 100).toFixed(2)}%">${l}</span>`).join('')
        : n === 7 ? Array.from({ length: 7 }, (_, i) => `<span style="left:${ctr(i)}%">${WD[R.step(i).getDay()]}</span>`).join('')
        : [0, 7, 14, 21, 28].filter((i) => i < n).map((i) => `<span style="left:${ctr(i)}%">${i + 1}.</span>`).join('');
      const html = tiles.map((t) => {
        const mx = Math.max(...t.v), val = sel == null ? sum(t.v) : t.v[sel];
        const bars = t.v.map((v, i) => `<div class="bc${v > 0 ? '' : ' e'}${sel === i ? ' on' : ''}" data-i="${i}" style="margin:0 ${gap / 2}px"><div class="st" style="height:${v > 0 && mx > 0 ? Math.max(3, v / mx * 40) : 3}px"></div></div>`).join('');
        const vt = t.unit === 'L' && val >= 1000 && sel == null ? `${dc(val / 1000, 2)}<span>m³</span>` : `${dc(val, t.dec)}<span>${t.unit}</span>`;
        return `<div class="mt" style="--c:${t.c}"><div class="n"><ha-icon icon="${t.icon}"></ha-icon>${t.n}</div><div class="v">${vt}</div><div class="mc"><div class="bars${sel != null ? ' sel' : ''}">${bars}</div></div><div class="mxa">${ax}</div></div>`;
      }).join('');
      this._set('g4', 'html', html);
      // Schieberegler: letzte Stufe = Gesamt (Standard), davor die Stunden / Tage bis jetzt
      const sl = this._root.getElementById('sl');
      if (sl) {
        let cur = n - 1; const now = Date.now(); for (let i = 0; i < n; i++) if (now >= +R.step(i) && now < +R.step(i + 1)) cur = i;
        const v = sel != null ? sel : cur + 1;
        this._cur = cur;
        if (sl.max !== String(cur + 1)) sl.max = String(cur + 1);
        if (!this._drag && sl.value !== String(v)) sl.value = String(v);
        sl.style.setProperty('--p', (+sl.value / (cur + 1) * 100) + '%');
        this._set('slw', 'cls', 'slw' + (sel == null ? ' idle' : ''));
        // Zeitmarken: so viele wie Platz (ca. 34 px je Marke), immer auf runden Schritten
        const w = Math.max(80, (sl.clientWidth || 280) - 11), steps = R.period === 'hour' ? [1, 2, 3, 4, 6, 12] : [1, 2, 3, 5, 7, 10, 14];
        const fit = Math.max(1, Math.floor(w / (R.period === 'hour' ? 46 : 38)));
        const N = cur + 1, st = steps.find((x) => N / x <= fit) || steps[steps.length - 1];
        const txt = (i) => R.period === 'hour' ? `${i} Uhr` : n === 7 ? WD[R.step(i).getDay()] : `${R.step(i).getDate()}.`;
        const gap = R.period === 'hour' ? 44 : 30;
        const marks = []; for (let i = 0; i <= cur; i += st) marks.push(i);
        while (marks.length > 1 && (N - marks[marks.length - 1]) / N * w < 58) marks.pop();
        const pos = (i) => 5.5 + i / N * w;
        if (sel != null && !marks.includes(sel)) for (let j = marks.length - 1; j >= 0; j--) if (Math.abs(marks[j] - sel) / N * w < gap) marks.splice(j, 1);
        let h = marks.map((i) => `<span class="${i === 0 ? 'l' : ''}${sel === i ? ' on' : ''}" style="left:${pos(i).toFixed(1)}px">${txt(i)}</span>`).join('');
        h += `<span class="r${sel == null ? ' on' : ''}" style="left:${pos(N).toFixed(1)}px">Gesamt</span>`;
        if (sel != null && !marks.includes(sel) && (N - sel) / N * w >= 58) h += `<span class="on" style="left:${pos(sel).toFixed(1)}px;background:var(--ha-card-background, rgba(28,28,30,.95));padding:0 3px;border-radius:4px">${txt(sel)}</span>`;
        this._set('sll', 'html', h);
      }
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
      { name: 'stat_discharge', selector: E('sensor') }, { name: 'stat_water', selector: E('sensor') },
    ] },
    { type: 'expandable', name: '', title: 'Hausbild (optional, als Mittelpunkt)', schema: [{ name: 'haus_bild_tag', selector: { text: {} } }, { name: 'haus_bild_nacht', selector: { text: {} } }] },
    { type: 'expandable', name: '', title: 'Test', schema: [{ name: 'simulation', selector: { boolean: {} } }] },
  ];
  const LBL = {
    title: 'Titel', link: 'Link (Pille oben rechts)', link_label: 'Beschriftung Link',
    solar_power: 'Solar gesamt (W)', solar_dachgaube: 'Solar Dachgaube (W)', solar_gartenhaus: 'Solar Gartenhaus (W)', solar_day: 'Solar heute (kWh)',
    grid_power: 'Netz (W, + Bezug / − Einspeisung)', grid_day: 'Netz heute (kWh)', home_day: 'Haus heute (kWh)',
    battery_power: 'Batterie (W, + lädt / − entlädt)', battery_soc: 'Batterie Ladestand (%)', battery_invert: 'Vorzeichen Batterie umkehren',
    water_flow: 'Wasser Durchfluss (L/min)', water_day: 'Wasser heute (L)',
    car_power: 'Wallbox Ladeleistung (W)', car_grid_power: 'Enyaq Netzladeleistung (W)', car_day: 'Wallbox heute (kWh)', car_soc: 'Enyaq Ladestand (%)',
    charts: 'Verlauf (Mini-Kacheln) anzeigen', stat_grid: 'Netzbezug (kWh-Zähler)', stat_solar: 'Solarertrag (kWh-Zähler)', stat_charge: 'Akku geladen (kWh-Zähler)',
    stat_discharge: 'Akku entladen (kWh-Zähler)', stat_water: 'Wasserzähler (m³ oder L)',
    simulation: 'Simulations-Schalter anzeigen', haus_bild_tag: 'Hausbild Tag (z. B. /local/elmo/hof-tag.png)', haus_bild_nacht: 'Hausbild Nacht (z. B. /local/elmo/hof-nacht.png)',
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
