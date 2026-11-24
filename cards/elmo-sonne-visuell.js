// ELMO Sonne visuell v1.24 (23.11.2026: Nacht als erstes Glied der Kette - 8 Kreise, nachts leuchtet jetzt einer)
// v1.23 (23.11.2026: Modell 3.0 - Lichtskala ohne gelernte Bewoelkt-Grenze, Kamera gilt ueber der Schattengrenze bis 60 Min, Wechsel-Modus nicht mehr in der Kette, Meldung = Messpunkt)
// v1.22 (19.11.2026: Wiese vorne, Berge mit Kammlinie, freier Himmel hinter dem Haus, 8°-Linie statt Schraffur; v1.21 Sterne nachts, farbiger Horizont; v1.20 kleine erkennbare Baeume auf den Bergen; v1.19 Hindernisse als Berge mit Wald statt Haeuser; v1.18 Gelaende, Nachbarhaeuser; v1.17 Strasse unter dem Haus; v1.16 Station kleiner; v1.15 Station auf dem Dach als Ecowitt-Station gezeichnet, Hoehe halten gegen Springen; v1.14 Sonne gelb; v1.13 Dorf; v1.12 weiche Flaeche; v1.11: Sonnenbogen als Panorama nach Himmelsrichtung - Haeuser/Baeume je Richtung, Haus mit Station, Messfenster heute; Klappe-Karte seit v1.10a)
// v1.8 (16.11.2026: Kette kompakter - Bubbles 30 px, Beschriftung ohne Fettdruck; schmaler Bildschirm: zwei Reihen a 4, nichts ueberlappt)
// v1.7 (16.11.2026: Regen-Bubble in der Kette, Regen in der Zeitleiste (Anzeige schraffiert, Wer blau), Melden bei Regen und nachts gesperrt)
// v1.6 (16.11.2026: Regen-Nowcast - Hinweis, Jetzt-Karte ausgegraut, Meldungen nur notiert, Regen-Spur in der Zeitleiste)
// v1.5 (16.11.2026: Mini-Anzeigen mit Kurzerklaerung, Spitze-Balken gruen ab Sonnenmoment)
// v1.4 (16.11.2026: Kamera-Ring zeigt Restzeit 'noch xx Min'; ausgesetztes Kamerabild nach Lichtwechsel als gestrichelter Rahmen + Kasten)
// v1.3 (16.11.2026: 'noch xx Min' statt 'bis', Kamera-Fenster auf der Lichtskala, wann die Station uebernimmt und wann eine Extra-Runde kommt)
// v1.2 (16.11.2026: ohne Sonnenmoment Teilweise/Sonnig schraffiert + Erklaerung; Melden mit Bestaetigung; Wirkungs-Chips umbrechend; Legende fuer die Anzeige-Farben)
// v1.1 (16.11.2026: Legende unter der Lichtskala erklaert Pfeil jetzt, Spitze und Sonnenmoment-Linie)
// v1.0 (16.11.2026): elmo-jetzt-card (Jetzt-Kopf) und elmo-feedback-card (Melden + Zeitleiste)
// fuer das WetterKI Admin Portal. Logik wie sensor.sonnenklassifikation_heute / sensor.sonnen_entscheidung (Modell 2.3).
const EV_FARBE = { 'Nebel': '#a08cc8', 'Bewölkt': '#8e8e93', 'Teilweise bewölkt, etwas Sonne': '#d1cba0', 'Sonnig': '#ffd60a', 'Nacht': '#3a3a40' };
const EV_KURZ = { 'Bewölkt': 'Bewölkt', 'Teilweise bewölkt, etwas Sonne': 'Teilweise', 'Sonnig': 'Sonnig', 'Nebel': 'Nebel', 'Nacht': 'Nacht' };
const EV_NAMEN = ['Bewölkt', 'Teilweise bewölkt, etwas Sonne', 'Sonnig'];
const EV_ZONE = ['#55555b', '#77714f', '#9a8714'];
const STREIF = 'repeating-linear-gradient(135deg,#0a84ffd9 0 3px,#0a84ff40 3px 6px)';
const SPERR = 'repeating-linear-gradient(135deg,rgba(127,127,127,.42) 0 4px,rgba(127,127,127,.14) 4px 8px)';
const LILA = '#bf5af2', BLAU = '#32ade6', GRUEN = '#30d158', ORANGE = '#ff9f0a', NEBEL = '#a08cc8', GRAU = '#8e8e93', SCHATTEN = '#6f5a8a';
const IC = {
  du: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  kamera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  vorhersage: '<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 12l6-6"/><circle cx="12" cy="12" r="1.5"/>',
  nebel: '<path d="M3 9h18M5 13h14M3 17h18"/>',
  wechsel: '<path d="M2 12c2.5-5 5-5 7.5 0s5 5 7.5 0 3.5-3 5-2"/>',
  keinmoment: '<path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z"/>',
  messung: '<path d="M3 17l5-5 4 3 8-8"/>',
  sonne: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  teilweise: '<circle cx="9" cy="9" r="3"/><path d="M9 2v1.5M3.5 9H2M4.8 4.8l1 1M13 6l1-1"/><path d="M9 19h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.5 1.3A2.9 2.9 0 0 0 9 19z"/>',
  nacht: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  ok: '<path d="M5 12l5 5 9-10"/>', auf: '<path d="M12 19V5M6 11l6-6 6 6"/>', ab: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  regen: '<path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
  notiz: '<path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6"/>', schatten: '<path d="M3 20h18M6 20l4-9 3 5 2-3 3 7"/>'
};
const ico = (n, c, s) => '<svg width="' + (s || 18) + '" height="' + (s || 18) + '" viewBox="0 0 24 24" fill="none" stroke="' + (c || 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>';
const uhr = (t) => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// v1.15: haelt die aktuelle Hoehe eines Elements 1,5 s als Mindesthoehe, damit ein Neuaufbau (oder nachladende Inhalte) die Seite nicht verschiebt
const halten = (el, ms) => { try { const h = el.getBoundingClientRect().height; if (h > 0) { el.style.minHeight = Math.ceil(h) + 'px'; clearTimeout(el._haltT); el._haltT = setTimeout(() => { el.style.minHeight = ''; }, ms || 1500); } } catch (e) { /* egal */ } };

const BASIS_CSS = ':host{display:block}ha-card{background:none;box-shadow:none;border:none;container-type:inline-size}'
  + '.w{padding:16px 16px 8px;display:flex;flex-direction:column;gap:16px;color:var(--primary-text-color)}'
  + '.kopf{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.h{font-size:var(--ha-card-header-font-size,24px);font-weight:400;line-height:32px}'
  + '.pill{display:inline-flex;align-items:center;gap:7px;padding:5px 13px;border-radius:999px;font-size:16px;font-weight:600}'
  + '.lab{font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--secondary-text-color)}'
  + '.sek{font-size:12px;color:var(--secondary-text-color);line-height:1.35}'
  + '.box{background:rgba(127,127,127,.12);border-radius:12px;padding:12px}'
  + '.leg{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:11.5px;color:var(--secondary-text-color)}.leg span{display:inline-flex;align-items:center;gap:5px}.leg i{display:inline-block;width:10px;height:10px;border-radius:3px}';

// Gemeinsame Lesehilfen
class EvBasis extends HTMLElement {
  setConfig(c) { this._cfg = c || {}; }
  getCardSize() { return 6; }
  _s(e) { const x = this._hass && this._hass.states[e]; return x ? x.state : ''; }
  _f(e, d) { const v = parseFloat(this._s(e)); return isNaN(v) ? d : v; }
  _el() { const s = this._hass.states['sun.sun']; return s ? Number(s.attributes.elevation) || 0 : 0; }
  _grenzen() {
    const g = this._s('sensor.sonnen_stufengrenzen').split('|').map(parseFloat);
    return g.length >= 4 && !g.slice(0, 3).some(isNaN) ? g.slice(0, 3) : [0.32, 0.52, 0.68];
  }
  _ent() { return this._s('sensor.sonnen_entscheidung'); }
  _regen() { return this._s('binary_sensor.sonnen_regen_nowcast') === 'on'; }
  _regenBox() { return '<div class="box sm" style="border:1px solid #0a84ff80;background:#0a84ff1f">' + ico('regen', '#5eb0ff', 22) + '<span style="font-size:13px;line-height:1.4"><b>Regen-Nowcast aktiv</b> – der DWD meldet Regen in den nächsten 10 Min oder die Station misst Regen. Solange <b>keine Kamera-Runden</b> und <b>keine Messpunkte</b>; ELMO zeigt Regen. <b>Meldungen sind gesperrt</b>, bis der Regen vorbei ist.</span></div>'; }
  _pct(v) { return Math.round(v / 0.8 * 100); }
  _wer(e) {
    if (!e || e === 'Nacht') return 'nacht';
    if (e.startsWith('Regen')) return 'regen';
    if (e.startsWith('Deine')) return 'du';
    if (e.startsWith('Kamera')) return 'kamera';
    if (e.startsWith('Vorhersage')) return 'vorhersage';
    if (e.includes('Nebel')) return 'nebel';
    if (e.includes('Wechsel')) return 'wechsel';
    if (e.includes('kein Sonnenmoment')) return 'keinmoment';
    return 'messung';
  }
  _cam() {
    const cam = this._s('input_text.sonnen_cam_letzte_runde').split('|');
    const g0 = (cam.length >= 4 && ['einig', 'einzeln'].includes(cam[2])) ? cam : this._s('input_text.sonnen_cam_letzte_gueltige_runde').split('|');
    const t = g0.length >= 4 ? new Date(g0[0]).getTime() : NaN;
    const alter = isNaN(t) ? Infinity : (Date.now() - t) / 60000;
    const ex = new Date(this._s('input_datetime.sonnen_cam_extra_runde_zuletzt').replace(' ', 'T')).getTime();
    /* v1.23 (23.11.2026, Modell 3.0): ueber der Schattengrenze gilt die Kamera bis 60 Min (Licht gleich), darunter 30 Min */
    const lim = this._el() >= this._f('sensor.sonnen_schattengrenze', 8) ? 60 : 30;
    return { r: g0, neu: cam, t: t, alter: alter, lim: lim, ok: g0.length >= 4 && ['einig', 'einzeln'].includes(g0[2]) && alter <= lim, extra: !isNaN(ex) && !isNaN(t) && Math.abs(ex - t) < 120000 };
  }
  _stil() { return '<style>' + BASIS_CSS + (this._css ? this._css() : '') + '</style>'; }
  _zeigen(html) {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    // v1.15: Hoehe kurz halten - die Seite (v. a. in der iOS-App ohne Scroll-Anker) springt sonst, wenn die Karte beim Neuaufbau kurz schrumpft
    halten(this);
    this.shadowRoot.innerHTML = this._stil() + '<ha-card><div class="w">' + html + '</div></ha-card>';
  }
}

// ---------- 1 · Jetzt-Kopf ----------
const KETTE = [['nacht', 'Nacht', '#5e5ce6'], ['regen', 'Regen', '#0a84ff'], ['du', 'Du', GRUEN], ['kamera', 'Kamera', LILA], ['vorhersage', 'Schatten', SCHATTEN], ['nebel', 'Nebel', NEBEL], ['keinmoment', 'Kein Moment', BLAU], ['messung', 'Messung', '#e5e5ea']];
const KETTE_SATZ = {
  regen: 'Regen-Nowcast aktiv – ELMO zeigt Regen; Kamera-Runden, Messpunkte und Meldungen pausieren.',
  du: 'Deine Meldung gilt – sie ist Realität.',
  kamera: 'Das Kamerabild gilt – es ist Realität und gewinnt gegen die Station.',
  vorhersage: 'Die Station steht im Schatten, ohne frische Kamera-Runde gilt die Vorhersage.',
  nebel: 'Feuchte und Taupunkt zeigen Nebel.',
  wechsel: 'Wolken ziehen vor der Sonne durch – nur „Teilweise“ oder „Sonnig“.',
  keinmoment: 'Kein Sonnenmoment in 20 Min – deshalb „Bewölkt“.',
  messung: 'Die Station misst Sonnenmomente – Sonne kommt und geht: „Teilweise“, Sonne durchgehend bei ruhigem Licht: „Sonnig“.',
  nacht: 'Sonne unter dem Horizont – keine Einstufung, Meldungen und Kamera-Runden ruhen.'
};
class ElmoJetztCard extends EvBasis {
  set hass(h) {
    this._hass = h;
    const k = ['sensor.sonnenklassifikation_heute', 'sensor.sonnen_entscheidung', 'sensor.sonnen_index_10min', 'sensor.sonnen_spitzenindex_20min', 'sensor.sonnen_stufengrenzen', 'input_text.sonnen_cam_letzte_runde', 'input_text.sonnen_cam_letzte_gueltige_runde', 'sensor.sonnen_schattengrenze', 'sensor.sonnen_qualitaet', 'input_datetime.sonnen_cam_extra_runde_zuletzt', 'binary_sensor.sonnen_regen_nowcast'].map((e) => this._s(e)).join('|') + '|' + Math.round(this._el() * 10) + '|' + Math.floor(Date.now() / 60000);
    if (k !== this._key) { this._key = k; this._render(); }
  }
  connectedCallback() { if (!this._tick) this._tick = setInterval(() => { this._key = ''; if (this._hass) this.hass = this._hass; }, 60000); }
  disconnectedCallback() { clearInterval(this._tick); this._tick = null; }
  _css() {
    return '.kette{position:relative;display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:2px}.kette .ln{position:absolute;left:6%;right:6%;top:15px;height:2px;background:rgba(127,127,127,.3)}'
      + '.kn{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;opacity:.38;min-width:0}.kn.an{opacity:1}.kn b{width:30px;height:30px;border-radius:50%;background:var(--card-background-color,#1c1c1e);border:1.5px solid rgba(127,127,127,.35);display:flex;align-items:center;justify-content:center}'
      + '.kn span{font-size:10.5px;text-align:center;line-height:1.15;white-space:nowrap}.kn.an span{font-weight:500}@container (max-width:640px){.kette{grid-template-columns:repeat(4,minmax(0,1fr));row-gap:10px}.kette .ln{display:none}}'
      + '.skala{position:relative;height:56px}.bar{position:absolute;left:0;right:0;top:20px;height:14px;border-radius:7px;overflow:hidden;display:flex}'
      + '.mk{position:absolute;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;font-size:11.5px;white-space:nowrap}'
      + '.mom{position:absolute;top:14px;height:26px;border-left:2px dashed ' + BLAU + '}'
      + '.zn{display:grid;font-size:11px;color:var(--secondary-text-color)}'
      + '.sm{display:flex;gap:10px;align-items:flex-start}.sm>svg{flex:none;margin-top:1px}.chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px}'
      + '.zwei{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}@container (max-width:560px){.zwei{grid-template-columns:1fr}}'
      + '.cam{display:flex;gap:12px;align-items:center}';
  }
  _render() {
    if (!this._hass) return;
    const el = this._el(), gr = this._f('sensor.sonnen_schattengrenze', 8), st = this._s('sensor.sonnenklassifikation_heute');
    const ent = this._ent(), wer = el <= 0 ? 'nacht' : this._wer(ent), g = this._grenzen();
    const idx = this._f('sensor.sonnen_index_10min', 0), spx = this._f('sensor.sonnen_spitzenindex_20min', 0);
    const farbe = EV_FARBE[st] || GRAU;
    // v1.3: Halte-Fenster - solange das Licht innerhalb +-35 % vom Bezugswert bleibt, gilt Kamera/Meldung (wie sensor.sonnenklassifikation_heute)
    let halt = null;
    const bst = this._s('input_text.sonnen_bestaetigt').split('|'), bstOk = bst.length >= 4 && new Date(bst[1]).getTime() > Date.now();
    const hc = (e) => { const s = Math.sin(Math.max(e, 0.5) * Math.PI / 180); return 1098 * s * Math.exp(-0.057 / s); };
    if (el > 0 && bstOk && (wer === 'du' || ent.startsWith('Kamera-Widerspruch'))) {
      const ref = parseFloat(bst[2]);
      halt = { du: bst[3] === 'Du', rest: (new Date(bst[1]).getTime() - Date.now()) / 60000, ref: ref > 0.05 ? ref : null, basis: bst[3] === 'Du' ? 'bei deiner Meldung' : 'beim Foto', kw: bst[3] !== 'Du', cam: bst[3] !== 'Du' ? this._cam() : null };
    } else if (el > 0 && wer === 'kamera') {
      const c = this._cam(), m = (c.r[14] || '').split(':').map(parseFloat);
      let ref = null;
      if (m.length === 2 && !m.some(isNaN)) { const r0 = m[0] / hc(m[1]), r1 = this._f('sensor.gw1100a_solar_radiation_mittel_10min', 0) / hc(el); if (r0 > 0.01 && r1 > 0) ref = idx / (r1 / r0); }
      halt = { du: false, rest: c.lim - c.alter, ref: ref, basis: 'beim Foto', cam: c };
    }
    if (halt) {
      halt.rest = Math.max(0, Math.round(halt.rest));
      halt.satz = (halt.du ? 'Deine Meldung gilt' : 'Das Kamerabild gilt') + ' – <b>noch ' + halt.rest + ' Min</b>.';
      if (halt.ref) { halt.lo = halt.ref * 0.65; halt.hi = halt.ref * 1.35; }
    }
    // v1.4: Kamera-Runde noch jung, aber Licht hat sich stark geaendert -> ausgesetzt, Station rechnet
    let ausg = null;
    if (!halt && !this._regen() && el > 0 && el >= this._f('sensor.sonnen_schattengrenze', 8) && this._s('binary_sensor.sonnen_licht_geaendert') === 'on') {
      const c = this._cam(), m = (c.r[14] || '').split(':').map(parseFloat);
      if (c.alter <= c.lim && ['einig', 'einzeln'].includes(c.r[2]) && m.length === 2 && !m.some(isNaN)) { const r0 = m[0] / hc(m[1]), r1 = this._f('sensor.gw1100a_solar_radiation_mittel_10min', 0) / hc(el); if (r0 > 0.01 && r1 > 0) { const ref = idx / (r1 / r0); ausg = { c: c, ref: ref, lo: ref * 0.65, hi: ref * 1.35, dif: Math.round((r1 / r0 - 1) * 100) }; } }
    }
    const icon = st === 'Sonnig' ? 'sonne' : (st.startsWith('Teilweise') ? 'teilweise' : (st === 'Nebel' ? 'nebel' : (st === 'Nacht' || el <= 0 ? 'nacht' : 'keinmoment')));
    let h = '<div class="kopf"><span class="h">Jetzt</span><span class="pill" style="background:' + farbe + '2e;color:' + farbe + '">' + ico(icon, farbe) + esc(EV_KURZ[st] || st || '–') + '</span></div>';
    const rg = this._regen() && el > 0;
    if (rg) h += this._regenBox();
    // Kette: wer entscheidet
    h += '<div style="display:flex;flex-direction:column;gap:8px"><span class="lab">Wer entscheidet</span><div class="kette"><div class="ln"></div>'
      + KETTE.map(([id, n, c]) => '<div class="kn' + (id === wer ? ' an' : '') + '"><b' + (id === wer ? ' style="background:' + c + ';border-color:' + c + ';box-shadow:0 0 0 4px ' + c + '40"' : '') + '>' + ico(id, id === wer ? (id === 'messung' ? '#1c1c1e' : '#fff') : c, 14) + '</b><span' + (id === wer ? ' style="color:' + c + '"' : '') + '>' + n + '</span></div>').join('')
      + '</div><span class="sek">' + (halt ? halt.satz : KETTE_SATZ[wer]) + '</span></div>';
    if (rg) h += '<div style="opacity:.45;display:flex;flex-direction:column;gap:16px">';
    // Lichtskala + Sonnenmoment
    if (el > 0 && el < gr) h += '<div class="box sm" style="padding:10px 12px">' + ico('schatten', SCHATTEN, 18) + '<span style="font-size:12.5px;line-height:1.4"><b>Keine Licht-Werte unter ' + Math.round(gr) + '°</b> – die Sonne steht unter der Schattengrenze. Dort misst die Station nur Streulicht, und weil der Vergleichswert „blauer Himmel“ bei tiefer Sonne sehr klein ist, kämen unsinnige Prozente heraus (über 100 %). Hier entscheiden Kamera bzw. Vorhersage.</span></div>';
    if (el >= gr) {
      const schatten = el < gr;
      const p = (v) => Math.max(0, Math.min(100, v / 1.0 * 100)); /* v1.23: Skala bis 125 % von blauem Himmel, damit die Sonnenmoment-Linie (gelernt, z. B. 106 %) sichtbar bleibt */
      /* v1.23 (23.11.2026, Modell 3.0): Bewoelkt haengt nur am Sonnenmoment (Spitze), Sonnig = Mittel ab t1 und ruhiges Licht */
      const z0 = 0, z1 = p(g[1]), zm = p(g[2]);
      const stNr = spx < g[2] ? 0 : ((idx >= g[1] && spx <= idx * 1.2) ? 2 : 1);
      const moment = spx >= g[2];
      h += '<div style="display:flex;flex-direction:column;gap:6px' + (schatten ? ';opacity:.45' : '') + '"><div class="kopf"><span class="lab">Licht · % von blauem Himmel</span><span class="sek">' + (schatten ? 'Station im Schatten – zählt nicht' : 'Station allein sagt <b style="color:' + EV_FARBE[EV_NAMEN[stNr]] + '">' + EV_KURZ[EV_NAMEN[stNr]] + '</b>') + '</span></div>'
        + '<div class="skala"><div class="bar"><div style="width:' + z0 + '%;background:' + EV_ZONE[0] + '"></div><div style="width:' + (z1 - z0) + '%;background:' + (moment ? EV_ZONE[1] : SPERR) + '"></div><div style="flex:1;background:' + (moment ? EV_ZONE[2] : SPERR) + '"></div></div>'
        + (halt && halt.lo !== undefined && !schatten ? '<div style="position:absolute;top:15px;height:24px;left:' + p(halt.lo) + '%;width:' + Math.max(1, p(halt.hi) - p(halt.lo)) + '%;border:2px solid ' + LILA + ';border-radius:6px;box-sizing:border-box;background:#bf5af21a"></div>' : '')
        + (ausg ? '<div style="position:absolute;top:15px;height:24px;left:' + p(ausg.lo) + '%;width:' + Math.max(1, p(ausg.hi) - p(ausg.lo)) + '%;border:2px dashed ' + LILA + ';border-radius:6px;box-sizing:border-box;opacity:.7"></div>' : '')
        + '<div class="mom" style="left:' + zm + '%"></div>'
        + '<div class="mk" style="left:' + p(idx) + '%;top:0"><b>' + this._pct(idx) + ' %</b><span style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid var(--primary-text-color)"></span></div>'
        + '<div class="mk" style="left:' + p(spx) + '%;top:36px;color:' + BLAU + '"><span style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:6px solid ' + BLAU + '"></span>Spitze ' + this._pct(spx) + ' %</div></div>'
        + '<div class="zn" style="grid-template-columns:' + (z1 - z0) + 'fr ' + (100 - z1) + 'fr"><span' + (moment ? '' : ' style="opacity:.45;text-decoration:line-through"') + '>Teilweise</span><span' + (moment ? '' : ' style="opacity:.45;text-decoration:line-through"') + '>Sonnig</span></div>'
        + '<div class="leg" style="margin-top:2px"><span><i style="width:0;height:0;border-radius:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid var(--primary-text-color)"></i><b style="color:var(--primary-text-color);white-space:nowrap">' + this._pct(idx) + ' %</b>&nbsp;= Licht jetzt: Mittel der letzten 10 Min, verglichen mit wolkenlosem Himmel bei dieser Sonnenhöhe (100 %)</span><span><i style="width:0;height:0;border-radius:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:7px solid ' + BLAU + '"></i>Spitze = hellster Wert der letzten 20 Min</span><span><i style="width:0;height:12px;border-radius:0;border-left:2px dashed ' + BLAU + '"></i>Sonnenmoment-Linie</span>' + (ausg ? '<span><i style="width:16px;height:10px;border-radius:3px;border:2px dashed ' + LILA + ';box-sizing:border-box"></i>Bereich des Kamerabilds – verlassen</span>' : '') + (halt && halt.lo !== undefined && !schatten ? '<span><i style="width:16px;height:10px;border-radius:3px;border:2px solid ' + LILA + ';box-sizing:border-box"></i>' + (halt.du ? 'deine Meldung' : 'Kamerabild') + ' gilt, solange der Pfeil hier bleibt</span>' : '') + '</div>'
        + (halt && !schatten ? (() => { const c = halt.cam; let ex = ''; if (c && isFinite(c.t) && !this._regen()) { const lx = new Date(this._s('input_datetime.sonnen_cam_extra_runde_zuletzt').replace(' ', 'T')).getTime(); const ab = Math.max(c.t + 600000, isNaN(lx) ? 0 : lx + 1200000, Date.now()); ex = '<span>' + ico('kamera', ORANGE, 14) + ' Ändert sich das Licht so stark und bleibt 5 Min so, macht die Kamera eine <b>Extra-Runde</b> – ' + (ab <= Date.now() + 30000 ? 'ab sofort möglich' : 'frühestens ' + uhr(ab)) + '.</span>'; } return '<div class="box" style="display:flex;flex-direction:column;gap:7px;font-size:12.5px;line-height:1.4;border:1px solid #bf5af255"><b style="font-size:13px">Wann übernimmt die Station wieder?</b><span>⏱ Nach Ablauf: <b>in ' + halt.rest + ' Min</b>' + (halt.du ? ' (Meldung gilt 30 Min)' : (halt.kw ? ' (Kamera-Widerspruch gilt 25 Min)' : ' (jede Runde gilt 30 Min)')) + '.</span>' + (halt.lo !== undefined ? '<span>↕ Früher, wenn das Licht mehr als 35 % vom Wert ' + halt.basis + ' (' + this._pct(halt.ref) + ' %) abweicht: <b>unter ' + this._pct(halt.lo) + ' %</b> oder <b>über ' + this._pct(halt.hi) + ' %</b>. Jetzt: ' + this._pct(idx) + ' %.</span>' : '') + ex + '</div>'; })() : '')
        + (ausg ? (() => { const lx = new Date(this._s('input_datetime.sonnen_cam_extra_runde_zuletzt').replace(' ', 'T')).getTime(); const ab = Math.max(ausg.c.t + 600000, isNaN(lx) ? 0 : lx + 1200000, Date.now()); return '<div class="box" style="display:flex;flex-direction:column;gap:7px;font-size:12.5px;line-height:1.4;border:1px dashed #bf5af280"><b style="font-size:13px">Kamerabild von ' + uhr(ausg.c.t) + ' ausgesetzt – die Station rechnet wieder</b><span>↕ Der Pfeil hat den gestrichelten Rahmen verlassen: Das Licht ist ' + (ausg.dif < 0 ? 'um ' + (-ausg.dif) + ' % dunkler' : 'um ' + ausg.dif + ' % heller') + ' als beim Foto (' + this._pct(ausg.ref) + ' % → jetzt ' + this._pct(idx) + ' %; erlaubt sind ' + this._pct(ausg.lo) + '–' + this._pct(ausg.hi) + ' %).</span><span>' + ico('kamera', ORANGE, 14) + ' Bleibt das 5 Min so, macht die Kamera eine <b>Extra-Runde</b> – ' + (ab <= Date.now() + 30000 ? 'ab sofort möglich' : 'frühestens ' + uhr(ab)) + ' (mind. 10 Min nach der letzten Runde, 20 Min nach der letzten Extra-Runde). Sonst kommt die nächste Runde im normalen 20-Min-Takt.</span></div>'; })() : '')
        + (moment || schatten ? '' : '<div class="box sm" style="padding:10px 12px"><i style="flex:none;width:22px;height:14px;border-radius:3px;margin-top:2px;background:' + SPERR + '"></i><span style="font-size:12.5px;line-height:1.4"><b>Teilweise und Sonnig sind ausgegraut</b>, weil es in den letzten 20 Min keinen Sonnenmoment gab (Spitze ' + this._pct(spx) + ' % – nötig sind ' + this._pct(g[2]) + ' %). Solange sagt die Station „Bewölkt“, egal wo der weiße Pfeil steht: helles, aber gleichmäßiges Licht kommt von einer hellen Wolkendecke, nicht von der Sonne. Sobald die Spitze die Linie erreicht, werden die Bereiche wieder farbig.</span></div>')
        + '<div class="box sm">' + ico('info', BLAU, 18) + '<div style="display:flex;flex-direction:column;gap:6px"><span style="font-size:13px;line-height:1.4"><b>Sonnenmoment</b> = die Sonne war in den letzten 20 Minuten mindestens einmal richtig da – der hellste Wert (blauer Pfeil) hat die gestrichelte Linie bei ' + this._pct(g[2]) + ' % erreicht. Ohne Sonnenmoment bleibt es „Bewölkt“, auch wenn eine helle Wolkendecke viel Licht durchlässt.</span>'
        + '<span><span class="chip" style="background:' + (moment ? '#30d15826;color:#7ee29a' : '#32ade626;color:#9fd3ff') + '">' + ico(moment ? 'ok' : 'x', 'currentColor', 13) + (moment ? 'Sonnenmoment da' : 'kein Sonnenmoment') + ' · Spitze ' + this._pct(spx) + ' %</span></span></div></div></div>';
    }
    if (rg) h += '</div>';
    // Kamera + Sonnenbogen
    const c = this._cam();
    let camH = '<span class="sek">Noch keine Kamera-Runde.</span>';
    if (c.r.length >= 4 && isFinite(c.alter)) {
      const a = Math.min(c.alter, c.lim), u = 2 * Math.PI * 21;
      const aus = el >= gr && this._s('binary_sensor.sonnen_licht_geaendert') === 'on', rest = Math.max(0, Math.round(c.lim - c.alter)), gilt = c.ok && !aus && rest > 0;
      const rc = gilt ? LILA : GRAU, kf = EV_FARBE[c.r[1]] || GRAU;
      const zus = { treffer: 'bestätigt die Station', widerspruch: 'widerspricht – gewinnt', ausfall: 'KI nicht erreichbar', unklar: 'unklar', farbe: 'nur Himmelsfarbe' }[c.neu[3]] || c.neu[3] || '';
      camH = '<div class="cam"><svg width="52" height="52" viewBox="0 0 52 52" role="img" aria-label="' + (gilt ? 'Kamerabild gilt noch ' + rest + ' Minuten' : 'Kamerabild gilt nicht') + '"><circle cx="26" cy="26" r="21" fill="none" stroke="rgba(127,127,127,.3)" stroke-width="5"/>'
        + (c.alter <= c.lim ? '<circle cx="26" cy="26" r="21" fill="none" stroke="' + rc + '"' + (gilt ? '' : ' stroke-opacity=".5"') + ' stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (u * (1 - a / c.lim)).toFixed(1) + ' ' + u.toFixed(1) + '" transform="rotate(-90 26 26)"/>' : '')
        + (gilt ? '<text x="26" y="27" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">' + rest + '</text><text x="26" y="38" text-anchor="middle" font-size="8.5" fill="currentColor" opacity=".75">Min</text>' : '<text x="26" y="30" text-anchor="middle" font-size="14" font-weight="600" fill="currentColor" opacity=".6">–</text>') + '</svg>'
        + '<div style="display:flex;flex-direction:column;gap:3px;min-width:0"><span style="font-size:15px;font-weight:600;color:' + kf + '">' + esc(EV_KURZ[c.r[1]] || c.r[1]) + '</span>'
        + '<span class="sek">Foto ' + uhr(c.t) + ' (vor ' + Math.round(c.alter) + ' Min)' + (c.extra ? ' · Extra-Runde' : '') + ' · ' + (c.r[2] === 'einzeln' ? 'ein Bild' : '2 Bilder einig') + '</span>'
        + '<span class="sek">' + (c.alter > c.lim ? 'älter als ' + c.lim + ' Min – gilt nicht mehr' : (aus ? '<b style="color:var(--primary-text-color)">ausgesetzt</b> – Licht hat sich stark geändert' : 'Ring = Restzeit: gilt noch <b style="color:var(--primary-text-color)">' + rest + ' Min</b> · ' + esc(zus))) + '</span></div></div>';
    }
    h += '<div class="zwei"><div class="box">' + camH + '</div><div class="box" style="padding:8px 12px">' + this._bogen(el, gr) + '</div></div>';
    this._zeigen(h);
  }
  // v1.11 (19.11.2026, Wunsch Martin): Panorama statt Zeitbogen - waagerecht die Himmelsrichtung wie beim Blick von der Station nach
  // Sueden, Silhouette = Haeuser und Baeume aus der Schattenkarte (je Richtung, nicht eine Zahl fuer den ganzen Tag), schraffiert = unter 8°
  // (Sonne zu tief), vorne Martins Haus mit der Station auf dem Dach. Darunter Klartext und "Station misst heute hh:mm-hh:mm".
  _karte() {
    const lies = (id) => (this._s(id) || '').split(',').map((p) => p.split(':').map(Number)).filter((p) => p.length === 2 && isFinite(p[0]) && isFinite(p[1])).sort((a, b) => a[0] - b[0]);
    return { m: lies('input_text.sonnen_schattenkarte_morgen'), a: lies('input_text.sonnen_schattenkarte_abend') };
  }
  _grenzeBei(az, k) {
    const l = az < 180 ? k.m : k.a;
    if (!l.length) return 8;
    for (let i = 0; i < l.length - 1; i++) if (az >= l[i][0] && az <= l[i + 1][0]) return l[i][1] + (l[i + 1][1] - l[i][1]) * (az - l[i][0]) / Math.max(l[i + 1][0] - l[i][0], 0.001);
    const n = l.reduce((b, p) => (Math.abs(p[0] - az) < Math.abs(b[0] - az) ? p : b), l[0]);
    return Math.abs(n[0] - az) <= 3 ? n[1] : 8;
  }
  _bogen(el, gr) {
    const sun = this._hass.states['sun.sun'], lat = ((this._hass.states['zone.home'] && Number(this._hass.states['zone.home'].attributes.latitude)) || 50.36) * Math.PI / 180;
    const j = new Date(), doy = Math.floor((j - new Date(j.getFullYear(), 0, 0)) / 86400000);
    const dek = 23.44 * Math.sin(2 * Math.PI * (284 + doy) / 365) * Math.PI / 180;
    let noon = sun ? new Date(sun.attributes.next_noon).getTime() : NaN; if (noon - Date.now() > 12 * 3600000) noon -= 86400000;
    if (isNaN(noon)) { const m = new Date(); m.setHours(12, 10, 0, 0); noon = m.getTime(); }
    const ha = (t) => (t - noon) / 3600000 * 15 * Math.PI / 180;
    const elv = (t) => Math.asin(Math.sin(lat) * Math.sin(dek) + Math.cos(lat) * Math.cos(dek) * Math.cos(ha(t))) * 180 / Math.PI;
    const azv = (t) => { const h = ha(t); return (Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(lat) - Math.tan(dek) * Math.cos(lat)) * 180 / Math.PI + 540) % 360; };
    const k = this._karte(), g = (az) => this._grenzeBei(az, k);
    // Tagbahn (alle 5 Min) und Bildausschnitt nach Himmelsrichtung
    const bahn = [];
    for (let t = noon - 9 * 3600000; t <= noon + 9 * 3600000; t += 300000) { const e = elv(t); if (e >= 0) bahn.push({ t: t, az: azv(t), e: e }); }
    if (bahn.length < 2) return '<span class="sek">Sonnenbahn nicht berechenbar.</span>';
    const a0 = bahn[0].az - 10, a1 = bahn[bahn.length - 1].az + 10;
    let gmax = 8; for (let a = a0; a <= a1; a += 1) gmax = Math.max(gmax, g(a));
    const emax = Math.max(elv(noon), gmax) + 3;
    const W = 300, HS = 92, G = 42, H = HS + G, x = (a) => ((a - a0) / (a1 - a0) * W), y = (e) => (HS - Math.max(e, 0) / emax * (HS - 6));
    const f = (v) => v.toFixed(1), y0 = y(0);
    // Silhouette Haeuser und Baeume (nur wo die Karte ueber 8° liegt)
    // v1.12: weich gezeichnet - Profil alle 0,5° und mit +-2° geglaettet (Gauss), damit Kanten wie Dach- und Baumkronenlinien
    // statt Treppen aussehen; die Farbe der Sonnenbahn rechnet weiter mit der ungeglaetteten Grenze.
    const roh = [], az = [];
    for (let a = a0; a <= a1 + 0.01; a += 0.5) { const v = g(a); az.push(a); roh.push(v > 8.5 ? v : 0); }
    const wk = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((o) => [o, Math.exp(-(o * o) / (2 * 2.2 * 2.2))]);
    const glatt = roh.map((_, i) => { let s = 0, w = 0; wk.forEach(([o, q]) => { const r = roh[Math.min(Math.max(i + o, 0), roh.length - 1)]; s += r * q; w += q; }); return s / w; });
    let sil = 'M0 ' + f(y0);
    // sanft gewellte Oberkante (Kronen, Dachfirste) - hoechstens 0,9°, nur wo wirklich etwas steht
    glatt.forEach((v, i) => { const a = az[i], w = v > 9 ? Math.min(1, (v - 9) / 3) * 0.9 * (0.5 + 0.5 * Math.sin(a * 0.75) * Math.cos(a * 0.29)) : 0; sil += ' L' + f(x(a)) + ' ' + f(y(v + w)); });
    sil += ' L' + W + ' ' + f(y0) + ' Z';
    // v1.13 (Wunsch Martin): als kleines Dorf - hinten Baeume (Laub- und Nadelbaeume), deren Spitzen der Schattenkarte folgen,
    // vorne niedrigere Haeuser mit Satteldach. Welche Richtung Haus oder Baum ist, weiss die Karte nicht - das Bild ist nur Symbol;
    // die hinterlegte Flaeche (glatt) zeigt die echte Hoehe.
    const laeufe = []; let st = null;
    roh.forEach((v, i) => { if (v > 8.5 && st === null) st = i; if ((v <= 8.5 || i === roh.length - 1) && st !== null) { laeufe.push([az[st], az[v > 8.5 ? i : i - 1]]); st = null; } });
    const px = W / (a1 - a0), baeume = [], haeuser = [];
    // v1.18 (Wunsch Martin): Gelaende - sanfte Huegel, unter Haeusern und Baeumen etwas hoeher, damit nichts in der Luft haengt
    // v1.19 (Martin: Station steht hoch am Giebel, Haeuser koennen keinen Schatten werfen - es sind Berge, Gelaende, Baeume):
    // das Gelaende steigt unter den Hindernissen zu Bergruecken an (72 % der Schattengrenze), darauf Wald bis zur echten Grenze.
    const wk2 = []; for (let o = -14; o <= 14; o++) wk2.push([o, Math.exp(-(o * o) / (2 * 7 * 7))]);
    const breit = roh.map((_, i) => { let s = 0, w = 0; wk2.forEach(([o, q]) => { const r = roh[Math.min(Math.max(i + o, 0), roh.length - 1)]; s += r * q; w += q; }); return s / w; });
    const gl = (a) => breit[Math.min(Math.max(Math.round((a - a0) / 0.5), 0), breit.length - 1)];
    const TH = 3.4;
    // v1.22 (Variante B, Martin): zwischen den Bergen sinkt das Gelaende hinter die Wiese ab - hinter dem Haus freier Himmel, Station ragt hinein
    const hg = (a) => { let b = -5; laeufe.forEach(([q0, q1]) => { const d = a < q0 ? q0 - a : (a > q1 ? a - q1 : 0); b = Math.max(b, 5 * Math.exp(-(d * d) / 40) - 4.5); }); return Math.max(b, gl(a) - TH); };
    let gel = 'M0 ' + f(H - 9) + ' L0 ' + f(y(hg(a0)));
    for (let a = a0; a <= a1 + 0.01; a += 1) gel += ' L' + f(x(a)) + ' ' + f(HS - hg(a) / emax * (HS - 6));
    gel += ' L' + W + ' ' + f(H - 9) + ' Z';
    const gelaende = '<path d="' + gel + '" fill="#2a2340" stroke="#c99bff" stroke-opacity=".8" stroke-width="1.2" stroke-linejoin="round"/>';
    // v1.22: Wiese im Vordergrund (eigene, hellere Ebene) - darauf das Haus, die Nachbarn und der Baum
    let vp = 'M0 ' + f(H - 9) + ' L0 ' + f(y0 + 8);
    for (let xx = 0; xx <= W; xx += 6) vp += ' L' + xx + ' ' + f(y0 + 8 - 2.2 * Math.sin(xx * 0.021 + 0.6) - 1.2 * Math.sin(xx * 0.057));
    vp += ' L' + W + ' ' + f(H - 9) + ' Z';
    const vorne = '<path d="' + vp + '" fill="#433b5c" stroke="rgba(255,255,255,.18)" stroke-width=".8"/>';
    // v1.20 (Wunsch Martin): kleine, klar erkennbare Baeume auf dem Bergruecken - Tannen (zwei Stufen) und Laubbaeume mit Stamm,
    // feste Hoehe (TH), der Berg traegt den Rest bis zur Schattengrenze
    for (let a = a0 + 1, n = 0; a <= a1 - 1; a += 2.6, n++) {
      if (gl(a) < 9.5) continue;
      const cx = x(a + 0.6 * Math.sin(a * 1.3)), fuss = y(hg(a)) + 1.2, hp = (y(0) - y(TH)) * (0.85 + 0.15 * Math.sin(a * 0.9));
      if (n % 3 !== 1) {
        const b = hp * 0.34;
        baeume.push('<path d="M' + f(cx) + ' ' + f(fuss - hp) + ' L' + f(cx + b * 0.75) + ' ' + f(fuss - hp * 0.5) + ' H' + f(cx + b * 0.35) + ' L' + f(cx + b) + ' ' + f(fuss - hp * 0.18) + ' H' + f(cx + 0.7) + ' V' + f(fuss) + ' H' + f(cx - 0.7) + ' V' + f(fuss - hp * 0.18) + ' H' + f(cx - b) + ' L' + f(cx - b * 0.35) + ' ' + f(fuss - hp * 0.5) + ' H' + f(cx - b * 0.75) + ' Z"/>');
      } else {
        const r = hp * 0.3;
        baeume.push('<rect x="' + f(cx - 0.7) + '" y="' + f(fuss - hp * 0.42) + '" width="1.4" height="' + f(hp * 0.42) + '"/><circle cx="' + f(cx) + '" cy="' + f(fuss - hp + r) + '" r="' + f(r) + '"/>');
      }
    }
    const dorf = '<g fill="#6c4a9e" stroke="none">' + baeume.join('') + '</g>'
      + '<g fill="#5d3f8a" stroke="' + LILA + '" stroke-opacity=".7" stroke-width=".9" stroke-linejoin="round">' + haeuser.join('').replace(/<rect class="fe"/g, '<rect fill="#ffd60a" fill-opacity=".35" stroke="none"') + '</g>';
    // Sonnenbahn: gelb = Station misst, lila gestrichelt = Sonne hinter Haeusern/Baeumen oder unter 8°
    const segs = [];
    bahn.forEach((s) => { const hell = s.e >= g(s.az), p = f(x(s.az)) + ' ' + f(y(s.e)), last = segs[segs.length - 1]; if (last && last.hell === hell) last.p.push(p); else segs.push({ hell: hell, p: (last ? [last.p[last.p.length - 1]] : []).concat([p]) }); });
    const linien = segs.filter((s) => s.p.length > 1).map((s) => '<path d="M' + s.p.join(' L') + '" fill="none" stroke="' + (s.hell ? '#ffd60a' : LILA) + '" stroke-width="' + (s.hell ? 3 : 2) + '" stroke-linecap="round"' + (s.hell ? '' : ' stroke-dasharray="4 3"') + '/>').join('');
    // Messfenster heute
    const fenster = []; let auf = null;
    bahn.forEach((s, i) => { const hell = s.e >= g(s.az); if (hell && auf === null) auf = s.t; if ((!hell || i === bahn.length - 1) && auf !== null) { fenster.push([auf, s.t]); auf = null; } });
    const fText = fenster.length ? fenster.map((w) => uhr(w[0]) + '–' + uhr(w[1])).join(', ') : 'gar nicht';
    // Himmelsrichtungen am Boden
    const ri = [[90, 'O'], [135, 'SO'], [225, 'SW'], [270, 'W']].filter((r) => r[0] > a0 + 6 && r[0] < a1 - 6).map((r) => '<text x="' + f(x(r[0])) + '" y="' + f(y0 + 13) + '" text-anchor="middle" font-size="11" fill="currentColor" opacity=".6">' + r[1] + '</text>').join('');
    // Martins Haus mit der Station auf dem Dach, vorne in der Mitte (Blick nach Sueden)
    const c = x(180), hb = H - 15;
    // v1.18: Nachbarhaeuser links und rechts vom eigenen Haus (kleiner, blasser) und ein Baum - liegen unter dem Horizont, also kein Hindernis
    const nachbar = (dx, k) => { const cx = c + dx, b = hb, w = 15 * k, wa = 13 * k, da = 24 * k;
      return '<path d="M' + f(cx - w) + ' ' + b + ' V' + f(b - wa) + ' L' + f(cx) + ' ' + f(b - da) + ' L' + f(cx + w) + ' ' + f(b - wa) + ' V' + b + ' Z" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.32)" stroke-width="1" stroke-linejoin="round"/>'
        + '<rect x="' + f(cx - 3 * k) + '" y="' + f(b - wa * 0.55) + '" width="' + f(5 * k) + '" height="' + f(5 * k) + '" fill="#ffd60a" fill-opacity=".3"/>'; };
    const nachbarn = nachbar(-36, 0.7) + nachbar(-60, 0.55) + nachbar(38, 0.62)
      + '<rect x="' + f(c + 60) + '" y="' + f(hb - 8) + '" width="1.6" height="8" fill="rgba(255,255,255,.28)"/><ellipse cx="' + f(c + 60.8) + '" cy="' + f(hb - 12) + '" rx="5" ry="6" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.3)" stroke-width="1"/>';
    // v1.17 (Wunsch Martin): Strasse unter dem Haus - Asphaltband mit Mittellinie, kurze Einfahrt von der Haustuer
    const strasse = '<rect x="0" y="' + f(H - 9) + '" width="' + W + '" height="7" fill="#3a3a40"/>'
      + '<line x1="0" y1="' + f(H - 5.5) + '" x2="' + W + '" y2="' + f(H - 5.5) + '" stroke="#e5e5ea" stroke-opacity=".55" stroke-width=".8" stroke-dasharray="6 5"/>'
      + '<rect x="' + f(c - 4) + '" y="' + f(hb) + '" width="8" height="' + f(H - 9 - hb) + '" fill="#4a4a50"/>';
    const haus = '<g aria-hidden="true">'
      + '<path d="M' + f(c - 15) + ' ' + hb + ' V' + f(hb - 13) + ' L' + f(c) + ' ' + f(hb - 24) + ' L' + f(c + 15) + ' ' + f(hb - 13) + ' V' + hb + ' Z" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.55)" stroke-width="1.2" stroke-linejoin="round"/>'
      + '<rect x="' + f(c - 4) + '" y="' + f(hb - 9) + '" width="8" height="9" rx="1" fill="rgba(255,255,255,.28)"/>'
      // Wetterstation (Ecowitt, weiss) auf dem Dach: Mast, Querarm, links Windmesser mit Schalen und Windfahne, rechts Regentrichter mit Strahlungsschutz
      + (() => { const sx = c + 5, sy = hb - 37, W1 = '#f2f2f5', R = 'rgba(0,0,0,.45)', D = '#2c2c30';
        // v1.16: auf 60 % verkleinert (Proportion zum Dach), Fusspunkt bleibt auf dem Dach
        return '<g transform="translate(' + f(sx) + ' ' + f(hb - 20.3) + ') scale(.6) translate(' + f(-sx) + ' ' + f(-(hb - 20.3)) + ')">'
          + '<line x1="' + f(sx) + '" y1="' + f(hb - 20) + '" x2="' + f(sx) + '" y2="' + f(sy) + '" stroke="#c7c7cc" stroke-width="1.4" stroke-linecap="round"/>'
          + '<rect x="' + f(sx - 9) + '" y="' + f(sy - 1) + '" width="19" height="2.4" rx="1.2" fill="' + W1 + '" stroke="' + R + '" stroke-width=".4"/>'
          + '<rect x="' + f(sx - 10.6) + '" y="' + f(sy - 7) + '" width="3.4" height="11" rx="1.7" fill="' + W1 + '" stroke="' + R + '" stroke-width=".4"/>'
          + '<line x1="' + f(sx - 14.5) + '" y1="' + f(sy - 8) + '" x2="' + f(sx - 3.3) + '" y2="' + f(sy - 8) + '" stroke="' + D + '" stroke-width=".8"/>'
          + '<circle cx="' + f(sx - 14.5) + '" cy="' + f(sy - 8) + '" r="1.9" fill="' + D + '"/><circle cx="' + f(sx - 3.3) + '" cy="' + f(sy - 8) + '" r="1.9" fill="' + D + '"/><circle cx="' + f(sx - 8.9) + '" cy="' + f(sy - 9.6) + '" r="1.5" fill="' + D + '"/>'
          + '<path d="M' + f(sx - 8.9) + ' ' + f(sy + 4) + ' V' + f(sy + 7) + ' M' + f(sx - 8.9) + ' ' + f(sy + 6) + ' L' + f(sx - 14) + ' ' + f(sy + 7.5) + ' L' + f(sx - 12.5) + ' ' + f(sy + 5) + ' Z" fill="' + D + '" stroke="' + D + '" stroke-width=".6" stroke-linejoin="round"/>'
          + '<path d="M' + f(sx + 3.5) + ' ' + f(sy - 6.5) + ' H' + f(sx + 12.5) + ' L' + f(sx + 11.5) + ' ' + f(sy - 1.2) + ' H' + f(sx + 4.5) + ' Z" fill="' + W1 + '" stroke="' + R + '" stroke-width=".4"/>'
          + '<ellipse cx="' + f(sx + 8) + '" cy="' + f(sy - 6.5) + '" rx="4.5" ry="1" fill="' + D + '"/>'
          + [2.2, 4, 5.8].map((d) => '<rect x="' + f(sx + 5) + '" y="' + f(sy + d) + '" width="6" height="1.3" rx=".6" fill="' + W1 + '" stroke="' + R + '" stroke-width=".3"/>').join('') + '</g>';
      })()
      + '</g>';
    const now = Date.now(), azn = sun ? Number(sun.attributes.azimuth) : azv(now);
    const punkt = el > -2 && azn >= a0 && azn <= a1 ? '<circle cx="' + f(x(azn)) + '" cy="' + f(y(Math.max(el, 0))) + '" r="6" fill="' + (el >= gr ? '#ffd60a' : (el > 0 ? '#b08d10' : GRAU)) + '" stroke="var(--card-background-color,#1c1c1e)" stroke-width="1.5"/>' : '';
    const richt = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'][Math.round((((azn % 360) + 360) % 360) / 45) % 8];
    const tief = el > 0 && el < 8.5 && gr <= 8.5;
    const jetzt = el <= 0 ? 'Nacht' : ('Jetzt <b style="color:var(--primary-text-color)">' + el.toFixed(0) + '°</b> hoch, Richtung ' + richt + ' (' + Math.round(azn) + '°): '
      + (gr > 8.5 ? 'Berg/Bäume bis <b style="color:var(--primary-text-color)">' + Math.round(gr) + '°</b>' : (tief ? 'Sonne unter 8°' : 'frei'))
      + (el >= gr ? ' → Station misst' : ' → Kamera entscheidet'));
    const pid = 'st' + Math.round(Math.random() * 1e6);
    // v1.21 (Wunsch Martin): Himmel - um Auf- und Untergang (Sonne zwischen -6° und +6°) leicht farbiger Horizont auf der Seite
    // der Sonne, nach Sonnenuntergang einfache Sterne (werden mit der Daemmerung kraeftiger)
    const glutSt = el > -6 && el < 6 ? Math.max(0, 1 - Math.abs(el) / 6) : 0;
    const gx = f(x(Math.min(Math.max(azn, a0), a1)));
    const glowDef = glutSt > 0 ? '<radialGradient id="' + pid + 'h" cx="' + gx + '" cy="' + f(y0) + '" r="' + f(W * 0.55) + '" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff9f0a" stop-opacity="' + (0.5 * glutSt).toFixed(2) + '"/><stop offset=".45" stop-color="#ff6482" stop-opacity="' + (0.22 * glutSt).toFixed(2) + '"/><stop offset="1" stop-color="#ff6482" stop-opacity="0"/></radialGradient>' : '';
    let himmel = glutSt > 0 ? '<rect x="0" y="0" width="' + W + '" height="' + f(y0) + '" fill="url(#' + pid + 'h)"/>' : '';
    if (el <= 0) {
      const so = Math.min(1, 0.35 + (-el) / 8), obere = Math.max(y(gmax + 1), 20);
      for (let i = 0; i < 22; i++) {
        const sx = (i * 61.7 + 13) % W, sy = 4 + ((i * 37.9 + 7) % (obere - 6)), r = i % 5 === 0 ? 1.15 : (i % 3 === 0 ? 0.85 : 0.6);
        himmel += '<circle cx="' + f(sx) + '" cy="' + f(sy) + '" r="' + r + '" fill="#ffffff" fill-opacity="' + (so * (i % 4 === 0 ? 0.95 : 0.6)).toFixed(2) + '"/>';
      }
    }
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="display:block;width:100%;height:auto;max-height:170px" role="img" aria-label="Blick von der Station nach Süden: Sonnenbahn heute, Berge und Bäume">'
      + '<defs><pattern id="' + pid + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="rgba(142,142,147,.08)"/><rect width="3" height="6" fill="rgba(142,142,147,.2)"/></pattern><linearGradient id="' + pid + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3f99"/><stop offset="1" stop-color="#2a1f3f"/></linearGradient>' + glowDef + '</defs>'
      + himmel + '<line x1="0" x2="' + W + '" y1="' + f(y(8)) + '" y2="' + f(y(8)) + '" stroke="rgba(235,235,245,.35)" stroke-width=".8" stroke-dasharray="3 3"/><text x="' + (W - 2) + '" y="' + f(y(8) - 3) + '" text-anchor="end" font-size="9" fill="currentColor" opacity=".55">8°</text>'
      + '<path d="' + sil + '" fill="url(#' + pid + 'g)" fill-opacity=".38"/>' + gelaende + dorf
      + vorne + strasse + nachbarn + (el <= 0 ? '<g opacity=".45">' + linien + '</g>' : linien) + punkt + ri + haus
      + '</svg>'
      + '<div class="sek" style="display:flex;flex-direction:column;gap:4px;margin-top:4px">'
      + '<span>' + jetzt + '</span>'
      + '<span style="display:flex;flex-wrap:wrap;gap:4px 12px">'
      + '<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:14px;height:3px;border-radius:2px;background:#ffd60a"></i>Station misst heute ' + fText + '</span>'
      + '<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:12px;height:9px;border-radius:2px;background:#3b2a55;border:1px solid ' + LILA + '99"></i>Berge und Bäume</span>'
      + '<span style="display:inline-flex;align-items:center;gap:5px"><i style="width:14px;height:0;border-top:1.5px dashed rgba(235,235,245,.6)"></i>8°-Linie: darunter Sonne zu tief</span>'
      + '</span></div>';
  }
}

// ---------- 2 · Feedback ----------
const KNOPF = [['Bewölkt', 'Bewölkt', 'keinmoment', GRAU], ['Teilweise bewölkt, etwas Sonne', 'Teilweise', 'teilweise', '#d1cba0'], ['Sonnig', 'Sonnig', 'sonne', '#ffd60a']];
const WIRK = { passt: ['ok', 'passt', '#30d15826', '#7ee29a'], grenze: ['auf', 'Messpunkt', '#32ade626', '#9fd3ff'], cam: ['kamera', 'überstimmt Kamera', '#bf5af22e', '#e2b8fb'], notiz: ['notiz', 'nur notiert', 'rgba(127,127,127,.2)', 'var(--secondary-text-color)'], wechsel: ['wechsel', 'Wechsel-Grenze', '#ff9f0a26', '#ffc46b'], aus: ['x', 'Wechsel aus', '#ff9f0a26', '#ffc46b'], schatten: ['schatten', 'Schattenfenster', '#6f5a8a40', '#d6c4f0'], sperre: ['x', 'gesperrt', 'rgba(127,127,127,.2)', 'var(--secondary-text-color)'] };
class ElmoFeedbackCard extends EvBasis {
  set hass(h) {
    this._hass = h;
    const k = ['sensor.sonnenklassifikation_heute', 'sensor.sonnen_entscheidung', 'sensor.sonnen_index_10min', 'sensor.sonnen_spitzenindex_20min', 'input_select.sonnen_feedback', 'input_text.sonnen_bestaetigt', 'sensor.sonnen_qualitaet', 'binary_sensor.sonnenstrahlung_wechselhaft', 'binary_sensor.sonnen_tiefsonne_vorhersage', 'sensor.tageseinstufung_abend_rueckblick', 'input_text.sonnen_cam_letzte_runde', 'binary_sensor.sonnen_regen_nowcast'].map((e) => this._s(e)).join('|') + '|' + Math.round(this._el());
    if (k !== this._key) { this._key = k; this._render(); }
    if (!this._hT || Date.now() - this._hT > 300000 || this._hK !== this._s('sensor.sonnen_entscheidung') + this._s('input_text.sonnen_cam_letzte_runde') + this._s('sensor.sonnenklassifikation_heute')) {
      this._hT = Date.now(); this._hK = this._s('sensor.sonnen_entscheidung') + this._s('input_text.sonnen_cam_letzte_runde') + this._s('sensor.sonnenklassifikation_heute'); this._lade();
    }
  }
  _css() {
    return '.kn3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}'
      + '.kn3 button{font-family:inherit;background:rgba(127,127,127,.12);border:1.5px solid rgba(127,127,127,.28);border-radius:14px;padding:12px 6px;display:flex;flex-direction:column;align-items:center;gap:7px;color:var(--primary-text-color);cursor:pointer;min-height:44px}'
      + '.kn3 button.akt{border:2px solid ' + GRUEN + ';padding:11.5px 5.5px}.kn3 button.du{box-shadow:0 0 0 3px ' + GRUEN + '55}.kn3 button:disabled{opacity:.45;cursor:default}'
      + '.kn3 .n{font-size:14px;font-weight:600}.wk{display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:10.5px;line-height:1.15;padding:3px 7px;border-radius:9px;white-space:normal;text-align:center;max-width:100%;box-sizing:border-box}.wk svg{flex:none}.kn3 button.pend{border:2px solid ' + ORANGE + ';padding:11.5px 5.5px}'
      + '.ok{display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:12px;background:#ff9f0a1f;border:1px solid #ff9f0a66}.ok .r{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}.ok button{font-family:inherit;font-size:14px;font-weight:600;min-height:40px;padding:8px 16px;border-radius:10px;border:1px solid rgba(127,127,127,.4);background:rgba(127,127,127,.15);color:var(--primary-text-color);cursor:pointer}.ok button.ja{background:' + GRUEN + ';border-color:' + GRUEN + ';color:#06240f}'
      + '.zl{display:flex;flex-direction:column;gap:4px}.zr{display:flex;align-items:center;gap:8px}.zr>span:first-child{width:58px;flex:none;font-size:11.5px;color:var(--secondary-text-color)}'
      + '.sp{position:relative;flex:1;height:16px;border-radius:5px;overflow:hidden;background:rgba(127,127,127,.12)}.sp i{position:absolute;top:0;bottom:0}'
      + '.cp{position:relative;flex:1;height:16px}.cp:before{content:"";position:absolute;left:0;right:0;top:7px;height:2px;background:rgba(127,127,127,.3)}.cp i{position:absolute;top:3px;width:10px;height:10px;margin-left:-5px;border-radius:50%}.cp i.x{border-radius:2px;transform:rotate(45deg)}'
      + '.ti{flex:1;display:flex;justify-content:space-between;font-size:10.5px;color:var(--secondary-text-color)}'
      + '.g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.g3 .v{font-size:19px;font-weight:600}.mb{position:relative;height:6px;border-radius:3px;background:rgba(127,127,127,.3)}.mb i{position:absolute;left:0;top:0;height:6px;border-radius:3px}';
  }
  _wirkung(u) {
    const st = this._s('sensor.sonnenklassifikation_heute'), lvl = EV_NAMEN.indexOf(st), el = this._el(), gr = this._f('sensor.sonnen_schattengrenze', 8);
    const ent = this._ent(), wx = this._s('binary_sensor.sonnenstrahlung_wechselhaft') === 'on', ts = this._s('binary_sensor.sonnen_tiefsonne_vorhersage') === 'on';
    const hum = this._f('sensor.gw1100a_v2_2_5_humidity', 0), spr = this._f('sensor.gw1100a_v2_2_5_outdoor_temperature', 15) - this._f('sensor.gw1100a_v2_2_5_dewpoint', 12);
    const rn = st === 'Sonnig' && hum >= 97 && spr <= 0.4 && this._f('sensor.gw1100a_windgeschwindigkeit_10min', 0) < 5;
    const idx = this._f('sensor.sonnen_index_10min', 0), spx = this._f('sensor.sonnen_spitzenindex_20min', 0), cam = ent.startsWith('Kamera');
    if (this._regen()) return ['notiz'];
    if (u === lvl) return ['passt'];
    if (st === 'Nebel' || el < gr || rn || ts) return ['notiz'];
    /* v1.23 (Modell 3.0): Wechsel-Modus lernt nichts mehr - jede Meldung wird Sonnenmoment-Messpunkt */
    if (cam) return ['cam'];
    if (u === 2 && idx < 0.40 && spx < 0.50) return ['schatten'];
    return ['grenze', u > lvl];
  }
  _melde(opt) { this._hass.callService('input_select', 'select_option', { entity_id: 'input_select.sonnen_feedback', option: opt }); }
  async _lade() {
    const ids = ['sensor.sonnenklassifikation_heute', 'sensor.sonnen_entscheidung', 'input_text.sonnen_cam_letzte_runde', 'input_datetime.sonnen_cam_extra_runde_zuletzt', 'binary_sensor.sonnen_regen_nowcast'];
    const start = new Date(Date.now() - 3 * 3600000);
    try {
      const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
      const r = {}; ids.forEach((e) => { r[e] = ((res && res[e]) || []).map((x) => ({ s: x.s, t: (x.lc || x.lu) * 1000 })); });
      this._hist = r;
    } catch (e) { this._hist = null; }
    this._render();
  }
  _spur(arr, farbe, t0) {
    if (!arr || !arr.length) return '';
    const T = Date.now() - t0;
    return arr.map((x, i) => {
      const a = Math.max(x.t, t0), b = i + 1 < arr.length ? arr[i + 1].t : Date.now();
      if (b <= a) return '';
      return '<i style="left:' + ((a - t0) / T * 100).toFixed(2) + '%;width:' + ((b - a) / T * 100 + 0.15).toFixed(2) + '%;background:' + farbe(x.s) + '" title="' + esc(uhr(a) + ' ' + x.s) + '"></i>';
    }).join('');
  }
  _render() {
    if (!this._hass) return;
    const el = this._el(), st = this._s('sensor.sonnenklassifikation_heute'), lvl = EV_NAMEN.indexOf(st);
    const tag = this._s('sensor.tageseinstufung_abend_rueckblick');
    const bst = this._s('input_text.sonnen_bestaetigt').split('|');
    const bstOk = bst.length >= 4 && new Date(bst[1]).getTime() > Date.now();
    const duSt = bstOk && bst[3] === 'Du' ? bst[0] : '';
    let h = '<div class="kopf"><span class="h">Wie ist der Himmel?</span>' + (tag && tag !== 'unknown' ? '<span class="sek">Tag bisher: <b style="color:' + (EV_FARBE[tag] || GRAU) + '">' + esc(EV_KURZ[tag] || tag) + '</b></span>' : '') + '</div>';
    if (this._regen() && el > 0) h += this._regenBox();
    h += '<div class="kn3">' + KNOPF.map(([opt, n, ic, c], u) => {
      const w = (el <= 0 || this._regen()) ? ['sperre'] : this._wirkung(u), d = WIRK[w[0]];
      const pfeil = (w[0] === 'grenze' || w[0] === 'wechsel') ? (w[1] ? 'auf' : 'ab') : d[0];
      return '<button type="button" data-o="' + esc(opt) + '" class="' + (u === lvl ? 'akt' : '') + (duSt === opt ? ' du' : '') + (this._pend === opt ? ' pend' : '') + '"' + (el <= 0 || this._regen() ? ' disabled' : '') + '>' + ico(ic, c, 28) + '<span class="n">' + n + '</span>'
        + '<span class="wk" style="background:' + d[2] + ';color:' + d[3] + '">' + ico(pfeil, 'currentColor', 12) + d[1] + '</span></button>';
    }).join('') + '</div>';
    if (this._pend) { const u = EV_NAMEN.indexOf(this._pend), k = KNOPF[u], w = this._wirkung(u), d = WIRK[w[0]]; const pfeil = (w[0] === 'grenze' || w[0] === 'wechsel') ? (w[1] ? 'auf' : 'ab') : d[0];
      h += '<div class="ok"><span style="font-size:14px;line-height:1.4">Wirklich <b style="color:' + k[3] + '">„' + k[1] + '“</b> melden? Die Anzeige wechselt sofort für 30 Min. <span class="wk" style="background:' + d[2] + ';color:' + d[3] + '">' + ico(pfeil, 'currentColor', 12) + d[1] + '</span></span><div class="r"><button type="button" data-x="nein">Abbrechen</button><button type="button" data-x="ja" class="ja">Ja, melden</button></div></div>'; }
    h += '<div class="leg"><span><i style="background:' + GRUEN + ';border-radius:50%"></i>passt · Messpunkt</span><span><i style="background:' + BLAU + ';border-radius:50%"></i>Messpunkt für die Sonnenmoment-Schwelle</span><span><i style="background:' + LILA + ';border-radius:50%"></i>überstimmt die Kamera</span><span><i style="background:' + GRAU + ';border-radius:50%"></i>gilt, nur notiert</span></div>';
    if (bstOk) h += '<span class="sek">' + ico(bst[3] === 'Du' ? 'du' : 'kamera', bst[3] === 'Du' ? GRUEN : LILA, 13) + ' ' + (bst[3] === 'Du' ? 'Deine Meldung' : 'Kamera') + ' „' + esc(EV_KURZ[bst[0]] || bst[0]) + '“ gilt noch ' + Math.max(0, Math.round((new Date(bst[1]).getTime() - Date.now()) / 60000)) + ' Min. Jede Meldung gilt sofort für 30 Min.</span>';
    else if (el <= 0) h += '<span class="sek">' + ico('nacht', GRAU, 13) + ' Nachts gesperrt – ohne Sonne gibt es nichts zu melden.</span>';
    else if (!this._regen()) h += '<span class="sek">Jede Meldung gilt sofort für 30 Minuten (früher vorbei, wenn sich das Licht stark ändert).</span>';
    // Zeitleiste 3 h
    const t0 = Date.now() - 3 * 3600000, H = this._hist;
    if (H) {
      const werF = (s) => ({ regen: '#0a84ff', du: GRUEN, kamera: LILA, vorhersage: SCHATTEN, nebel: NEBEL, wechsel: ORANGE, keinmoment: BLAU, messung: BLAU, nacht: 'rgba(127,127,127,.25)' }[this._wer(s)]);
      const runden = (H['input_text.sonnen_cam_letzte_runde'] || []).map((x) => { const f = (x.s || '').split('|'); return { t: new Date(f[0]).getTime(), ok: ['einig', 'einzeln'].includes(f[2]) }; }).filter((x) => !isNaN(x.t) && x.t >= t0);
      const extra = (H['input_datetime.sonnen_cam_extra_runde_zuletzt'] || []).map((x) => new Date((x.s || '').replace(' ', 'T')).getTime()).filter((t) => !isNaN(t));
      const T = Date.now() - t0;
      const cp = runden.map((r) => { const ex = extra.some((e) => Math.abs(e - r.t) < 120000); return '<i class="' + (ex ? 'x' : '') + '" style="left:' + ((r.t - t0) / T * 100).toFixed(2) + '%;background:' + (ex ? ORANGE : (r.ok ? LILA : GRAU)) + '" title="' + uhr(r.t) + (ex ? ' Extra-Runde' : ' Kamera-Runde') + '"></i>'; }).join('');
      const tl = (ms) => uhr(Date.now() - ms);
      h += '<div style="display:flex;flex-direction:column;gap:8px"><span class="lab">Letzte 3 Stunden</span><div class="zl">'
        + '<div class="zr"><span>Anzeige</span><div class="sp">' + this._spur(H['sensor.sonnenklassifikation_heute'], (s) => EV_FARBE[s] || 'rgba(127,127,127,.3)', t0) + this._spur(H['binary_sensor.sonnen_regen_nowcast'], (s) => s === 'on' ? STREIF : 'transparent', t0) + '</div></div>'
        + '<div class="zr"><span>Wer</span><div class="sp">' + this._spur(H['sensor.sonnen_entscheidung'], werF, t0) + '</div></div>'
        + '<div class="zr"><span>Kamera</span><div class="cp">' + cp + '</div></div>'
        + '<div class="zr"><span></span><div class="ti"><span>' + tl(3 * 3600000) + '</span><span>' + tl(2 * 3600000) + '</span><span>' + tl(3600000) + '</span><span>jetzt</span></div></div></div>'
        + '<div class="leg"><b style="width:52px">Anzeige</b>' + [['Bewölkt', 'keinmoment'], ['Teilweise bewölkt, etwas Sonne', 'teilweise'], ['Sonnig', 'sonne'], ['Nebel', 'nebel'], ['Nacht', 'nacht']].map((x) => '<span>' + ico(x[1], EV_FARBE[x[0]] === '#3a3a40' ? '#8e8e93' : EV_FARBE[x[0]], 13) + EV_KURZ[x[0]] + '</span>').join('') + '<span><i style="background:' + STREIF + '"></i>Regen-Nowcast</span></div>'
        + '<div class="leg"><b style="width:52px">Wer</b><span><i style="background:' + LILA + '"></i>Kamera</span><span><i style="background:' + BLAU + '"></i>Station</span><span><i style="background:' + GRUEN + '"></i>du</span><span><i style="background:' + ORANGE + '"></i>Wechsel</span><span><i style="background:' + SCHATTEN + '"></i>Schatten</span><span><i style="background:' + ORANGE + ';transform:rotate(45deg);border-radius:2px;width:9px;height:9px"></i>Extra-Runde</span>' + ((H['binary_sensor.sonnen_regen_nowcast'] || []).some((x) => x.s === 'on') ? '<span><i style="background:#0a84ff"></i>Regen-Nowcast (keine Runden)</span>' : '') + '</div></div>';
    } else if (H === null) h += '<span class="sek">Verlauf konnte nicht geladen werden.</span>';
    // Mini-Anzeigen (v1.9: nur ueber der Schattengrenze - darunter waeren die Prozente unsinnig)
    if (el > 0 && el >= this._f('sensor.sonnen_schattengrenze', 8)) {
      const g = this._grenzen(), idx = this._f('sensor.sonnen_index_10min', 0), spx = this._f('sensor.sonnen_spitzenindex_20min', 0);
      const q = this._s('sensor.sonnen_qualitaet'), qn = { 'keine Sonne': 0, 'diesig': 1, 'normal': 2, 'klar': 3, 'sehr klar': 4 }[q];
      const zf = spx < g[2] ? GRAU : (idx >= g[1] ? '#ffd60a' : '#d1cba0');
      const mp = Math.min(100, g[2] * 100); /* v1.23: Balken bis 125 % */
      h += '<div class="g3"><div class="box" style="display:flex;flex-direction:column;gap:6px"><span class="sek">Licht jetzt</span><span class="v">' + this._pct(idx) + ' %</span><div class="mb"><i style="width:' + Math.min(100, this._pct(idx)) + '%;background:' + zf + '"></i></div><span class="sek" style="font-size:10.5px;line-height:1.3">Mittel 10 Min · 100 % = blauer Himmel</span></div>'
        + '<div class="box" style="display:flex;flex-direction:column;gap:6px"><span class="sek">Spitze 20 Min</span><span class="v">' + this._pct(spx) + ' %</span><div class="mb"><i style="width:' + Math.min(100, spx * 100) + '%;background:' + (spx >= g[2] ? GRUEN : BLAU) + '"></i><span style="position:absolute;left:' + mp + '%;top:-3px;width:2px;height:12px;background:var(--primary-text-color)" title="Sonnenmoment ab ' + this._pct(g[2]) + ' %"></span></div><span class="sek" style="font-size:10.5px;line-height:1.3">hellster Wert der letzten 20 Min · <b style="color:var(--primary-text-color)">|</b> = Sonnenmoment ab ' + this._pct(g[2]) + ' %</span></div>'
        + '<div class="box" style="display:flex;flex-direction:column;gap:6px"><span class="sek">Luft</span><span class="v" style="color:#9fd3ff' + ((q || '').length > 6 ? ';font-size:15px;line-height:1.25' : '') + '">' + esc(q || '–') + '</span><div style="display:flex;gap:3px">' + [1, 2, 3, 4].map((i) => '<span style="flex:1;height:6px;border-radius:3px;background:' + (qn !== undefined && i <= qn ? '#9fd3ff' : 'rgba(127,127,127,.3)') + '"></span>').join('') + '</div></div></div>';
    }
    this._zeigen(h);
    this.shadowRoot.querySelectorAll('button[data-o]').forEach((b) => b.addEventListener('click', () => { this._pend = b.getAttribute('data-o'); clearTimeout(this._pendT); this._pendT = setTimeout(() => { this._pend = null; this._render(); }, 15000); this._render(); }));
    this.shadowRoot.querySelectorAll('button[data-x]').forEach((b) => b.addEventListener('click', () => { clearTimeout(this._pendT); if (b.getAttribute('data-x') === 'ja' && this._pend) this._melde(this._pend); this._pend = null; this._render(); }));
  }
}

// ---------- 3 · Klappe (v1.11, 19.11.2026) ----------
// Aufklappbarer Textblock, der bei Entitaets-Updates NICHT zuklappt. Ein Markdown-Karte mit <details> baut ihr HTML bei jeder
// Aenderung neu auf und schliesst dabei jedes <details>. Hier steckt das Markdown (mit Templates) in einer inneren
// Markdown-Karte; die Klappe selbst wird nur einmal gebaut und merkt sich offen/zu (auch ueber Neuladen, je Titel).
// Konfiguration: type: custom:elmo-klappe-card, title: '...', card: {beliebige Karte, z. B. markdown mit uix} ODER content: '<markdown>', offen: false
class ElmoKlappeCard extends HTMLElement {
  setConfig(c) {
    if (!c || !c.title) throw new Error('title fehlt');
    this._c = c;
    this._key = 'elmo-klappe:' + c.title;
    if (this._root) { this._kopf(); if (this._inner) { this._inner.remove(); this._inner = null; } if (this._offen) this._fuellen(); }
  }
  set hass(h) {
    this._hass = h;
    if (!this._root) this._bauen();
    if (this._inner) { if (this._offen) halten(this._body); this._inner.hass = h; }
  }
  _bauen() {
    this._root = this.attachShadow({ mode: 'open' });
    let o = !!this._c.offen;
    try { const v = localStorage.getItem(this._key); if (v !== null) o = v === '1'; } catch (e) { /* ohne Speicher: Standard */ }
    this._offen = o;
    this._root.innerHTML = '<style>:host{display:block}.k{display:flex;align-items:center;gap:8px;width:100%;padding:10px 16px;background:none;border:none;color:var(--primary-text-color);font:inherit;font-size:15px;font-weight:600;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}'
      + '.k svg{flex:none;transition:transform .2s ease;color:var(--secondary-text-color)}.k.an svg{transform:rotate(90deg)}.k span{flex:1;min-width:0}.b{padding:0 4px 6px}.b[hidden]{display:none}</style>'
      + '<button class="k" type="button" aria-expanded="false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg><span></span></button><div class="b" hidden></div>';
    this._btn = this._root.querySelector('.k');
    this._body = this._root.querySelector('.b');
    this._btn.addEventListener('click', () => this._setzen(!this._offen));
    this._kopf();
    if (this._offen) this._fuellen();
  }
  _kopf() {
    if (!this._btn) return;
    this._btn.querySelector('span').textContent = this._c.title;
    this._btn.classList.toggle('an', this._offen);
    this._btn.setAttribute('aria-expanded', this._offen ? 'true' : 'false');
    this._body.hidden = !this._offen;
  }
  _setzen(o) {
    this._offen = o;
    clearTimeout(this._body._haltT); this._body.style.minHeight = '';
    try { localStorage.setItem(this._key, o ? '1' : '0'); } catch (e) { /* egal */ }
    this._kopf();
    if (o) this._fuellen();
  }
  async _fuellen() {
    if (this._inner || this._baut) return;
    this._baut = true;
    try {
      const helpers = await window.loadCardHelpers();
      const el = helpers.createCardElement(this._c.card || { type: 'markdown', text_only: true, content: this._c.content || '' });
      if (this._hass) el.hass = this._hass;
      this._inner = el;
      this._body.appendChild(el);
    } finally { this._baut = false; }
  }
  getCardSize() { return this._offen ? 6 : 1; }
}


if (!customElements.get('elmo-jetzt-card')) customElements.define('elmo-jetzt-card', ElmoJetztCard);
if (!customElements.get('elmo-feedback-card')) customElements.define('elmo-feedback-card', ElmoFeedbackCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'elmo-jetzt-card', name: 'ELMO Jetzt (Sonne)', description: 'Wer entscheidet, Licht, Sonnenmoment, Kamera' });
window.customCards.push({ type: 'elmo-feedback-card', name: 'ELMO Sonnen-Feedback', description: 'Melden mit Wirkung, 3-Stunden-Zeitleiste' });
if (!customElements.get('elmo-klappe-card')) customElements.define('elmo-klappe-card', ElmoKlappeCard);
