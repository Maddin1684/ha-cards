// ELMO Kalibrierungs-Karte v2.5 (24.11.2026, Wunsch Martin: Abschnitt Schatten zeigt die letzte Meldung der Schatten-Automatik und offene Kandidaten als Chips - lila Schatten, gelb wieder frei)
// v2.4 (23.11.2026, Wunsch Martin: Pills Kamera/Station in den Runden auf gleicher Hoehe - Kurzgrund als eigene Rasterzeile darunter)
// v2.3 (23.11.2026, Wunsch Martin: Trefferquote fuer iPad-Breite - Runden als Raster statt Tabelle, Kurzgrund unter dem Station-Urteil statt eigener Spalte, kompaktere Kacheln; Messpunkte 42 statt 46)
// v2.2 (23.11.2026, Wunsch Martin: weicht die Station von Kamera/Meldung ab, steht im Kasten 'So entscheidet die Station' der Grund - z. B. heller Dunst/Nebelreste bei Feuchte ab 95 %, kein Messpunkt; in der Trefferquote-Tabelle Kurzgrund bei falschen Runden)
// v2.1 (23.11.2026, Wunsch Martin: Einstufung als dezenter Chip statt grosser gelber Schrift; Schwellen-Kasten in Klartext - was die Zahl bedeutet, Rangliste der Nachbarwerte, was sie verschieben wuerde (echte Simulation mit der Regel von sensor.sonnen_stufengrenzen), welche Punkte nicht passen, letzter Lern-Grund)
// v2.0 (23.11.2026: MODELL 3.0 "Sonnenmoment" - Entscheidung Martin)
// Die Station lernt nur noch EINE Zahl: die Sonnenmoment-Schwelle S (sensor.sonnen_stufengrenzen, t2). Bloecke:
//  1) Jetzt: Stufe, wer entscheidet, Balken hellster Wert 20 Min gegen S und Mittel 10 Min gegen Sonnig-Schwelle (S x 0,9)
//  2) Mini-Diagramm der letzten 20 Min (Rohstrahlung als Index, alle ~16 s) mit Linie S - zeigt Hell/Dunkel-Wechsel
//  3) Die drei Regeln der Station, die gerade greifende hervorgehoben
//  4) Gelernte Schwelle: Messpunkte (input_text.sonnenmoment_proben_a/_b) + Kurve 'richtig liegende Punkte je Schwelle'
//  5) Ehrliche Trefferquote: Station allein (Logbuch-Feld sx) gegen Kamera, heute und 7 Tage, letzte Runden
//  6) Heute entschieden von, Was zuletzt gelernt wurde, Station im Schatten (aus v1.8 uebernommen)
//  7) Warum Modell 3.0 (aufklappbar)
// v1.8 (19.11.2026) und frueher: Helligkeits-Grenzen je Sonnenhoehen-Band - Code-Backup im Projekt (claude/backup-kalibrierung-v1.8-2026-11-23.md).
const EKC_IC = (d, c) => '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
const EKC_ICON = {
  bew: EKC_IC('<path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z"/>', '#c4c4ca'),
  teil: EKC_IC('<circle cx="9" cy="9" r="3"/><path d="M9 2v1.5M3.5 9H2M4.8 4.8l1 1M13 6l1-1"/><path d="M9 19h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.5 1.3A2.9 2.9 0 0 0 9 19z"/>', '#ffd60a'),
  son: EKC_IC('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', '#ff9f0a')
};
const EKC_STUFE = { 'Bewölkt': ['bew', 'Bewölkt'], 'Nebel': ['bew', 'Nebel'], 'Teilweise': ['teil', 'Teilweise'], 'Teilweise bewölkt, etwas Sonne': ['teil', 'Teilweise'], 'Sonnig': ['son', 'Sonnig'] };
const EKC_SKALA = 1.2; // Balken und Diagramme bis Index 1,2 (0,8 = blauer Himmel)

class ElmoKalibrierungCard extends HTMLElement {
  setConfig(c) { this._cfg = c || {}; }
  getCardSize() { return 12; }

  set hass(h) {
    this._hass = h;
    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); }
    const keys = ['sensor.sonnenklassifikation_heute', 'sensor.sonnen_stufengrenzen', 'sensor.sonnen_entscheidung', 'sensor.sonnen_spitzenindex_20min', 'sensor.sonnen_index_10min',
      'input_text.sonnenmoment_proben_a', 'input_text.sonnenmoment_proben_b', 'input_text.sonnen_letzte_lernaenderung', 'input_text.sonnen_schwellen_grund', 'input_text.sonnen_cam_letzte_runde',
      'input_text.sonnen_schattenkarte_morgen', 'input_text.sonnen_schattenkarte_abend', 'input_text.sonnen_schatten_kandidaten', 'sensor.sonnen_schattengrenze', 'input_text.sonnen_bestaetigt',
      'input_text.sonnen_frei_kandidaten', 'input_text.sonnen_schatten_letzte_erkennung'];
    const sig = keys.map((k) => (h.states[k] ? h.states[k].state : '')).join('§') + '§' + Math.floor(Date.now() / 60000) + '§' + (this._offen ? 1 : 0);
    if (sig === this._sig) return;
    this._sig = sig;
    this._render();
    const lern = h.states['input_text.sonnen_letzte_lernaenderung'];
    const lk = lern ? lern.last_changed : '';
    if (lk !== this._logKey) { this._logKey = lk; this._ladeLog(); }
    const rd = h.states['input_text.sonnen_cam_letzte_runde'];
    const rk = rd ? rd.last_changed : '';
    if (rk !== this._rdKey) { this._rdKey = rk; this._ladeRunden(); }
    if (!this._entT || Date.now() - this._entT > 600000) { this._entT = Date.now(); this._ladeEnt(); }
    if (!this._vT || Date.now() - this._vT > 60000) { this._vT = Date.now(); this._ladeVerlauf(); }
  }

  async _ladeEnt() {
    /* v1.5: Anteile von sensor.sonnen_entscheidung heute (wer hat die Anzeige bestimmt) */
    const eid = 'sensor.sonnen_entscheidung';
    const start = new Date(); start.setHours(0, 0, 0, 0);
    try {
      const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), entity_ids: [eid], minimal_response: true, no_attributes: true, significant_changes_only: false });
      const r = ((res && res[eid]) || []).map((x) => ({ s: x.s, t: (x.lc || x.lu) * 1000 }));
      const sum = { Kamera: 0, Station: 0, Vorhersage: 0, Du: 0 };
      r.forEach((x, i) => {
        const bis = i + 1 < r.length ? r[i + 1].t : Date.now();
        const d = Math.max(0, bis - Math.max(x.t, start.getTime()));
        const s = x.s || '';
        const k = s.startsWith('Kamera') ? 'Kamera' : (s.startsWith('Deine') ? 'Du' : (s.startsWith('Station') ? 'Station' : (s.startsWith('Vorhersage') ? 'Vorhersage' : null)));
        if (k) sum[k] += d;
      });
      this._ent = sum;
    } catch (e) { this._ent = null; }
    this._render();
  }

  async _ladeVerlauf() {
    /* Rohstrahlung der letzten 20 Min (alle ~16 s) -> Index wie sensor.sonnen_spitzenindex_20min (Haurwitz x Stationskurve K) */
    const eid = 'sensor.gw1100a_v2_2_5_solar_radiation';
    const start = new Date(Date.now() - 20 * 60000);
    try {
      const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), entity_ids: [eid], minimal_response: true, no_attributes: true, significant_changes_only: false });
      const cfg = this._hass.config || {};
      const lat = cfg.latitude || 50.36, lon = cfg.longitude || 9.56;
      const auf = !!(this._hass.states['sun.sun'] || { attributes: {} }).attributes.rising;
      this._verlauf = ((res && res[eid]) || []).map((x) => {
        const t = Math.max((x.lu || x.lc) * 1000, start.getTime());
        const el = this._sonne(new Date(t), lat, lon).el;
        const hk = this._hk(el, auf);
        const w = parseFloat(x.s);
        return { t: t, v: hk > 0 && !isNaN(w) ? w / hk : null };
      }).filter((p) => p.v !== null);
    } catch (e) { this._verlauf = null; }
    this._render();
  }

  async _ladeRunden() {
    /* Kamera-Runden der letzten 7 Tage aus dem Logbuch; sx = Station allein (seit 23.11.2026 in jeder Runde) */
    const start = new Date(Date.now() - 7 * 86400000);
    try {
      const res = await this._hass.callWS({ type: 'logbook/get_events', start_time: start.toISOString(), entity_ids: ['input_text.sonnen_cam_letzte_runde'] });
      const r = [];
      (res || []).forEach((e) => {
        if (!e.message || e.message[0] !== '{') return;
        try {
          const j = JSON.parse(e.message);
          if (!j.sx || j.sx === 'Schatten' || ['farbe', 'ausfall', 'unklar'].includes(j.s)) return;
          if (!['Bewölkt', 'Nebel', 'Teilweise', 'Sonnig'].includes(j.k)) return;
          r.push({ t: Date.parse(j.t), kam: j.k === 'Nebel' ? 'Bewölkt' : j.k, st: j.sx, spx: (j.kx && j.kx.spx) || 0, hum: (j.kx && j.kx.hum) || 0, S: parseFloat(j.sS) || null });
        } catch (x) { /* kein JSON */ }
      });
      this._runden = r.sort((a, b) => a.t - b.t);
    } catch (e) { this._runden = null; }
    this._render();
  }

  _s(id) { const e = this._hass.states[id]; return e ? e.state : ''; }
  _f(id, d) { const v = parseFloat(this._s(id)); return isNaN(v) ? d : v; }
  _esc(t) { return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  _z(v, n) { return Number(v).toFixed(n === undefined ? 2 : n).replace('.', ','); }
  _x(v) { return Math.max(0, Math.min(v / EKC_SKALA, 1)) * 100; }

  /* Klarhimmel-Strahlung x Stationskurve K bei Sonnenhoehe el (gleiche Formel wie die Sensoren) */
  _hk(el, auf) {
    const raw = this._s(auf ? 'input_text.sonnen_korrektur_morgen' : 'input_text.sonnen_korrektur_abend');
    let kl = raw.split(',').map(parseFloat); if (kl.length !== 9 || kl.some(isNaN)) kl = [1, 1, 1, 1, 1, 1, 1, 1, 1];
    const pos = Math.min(Math.max((el - 7.5) / 5, 0), 8), i = Math.min(Math.floor(pos), 7), fr = pos - i;
    const k = kl[i] * (1 - fr) + kl[i + 1] * fr;
    const s = Math.sin(Math.max(el, 0.5) * Math.PI / 180);
    return 1098 * s * Math.exp(-0.057 / s) * k;
  }

  /* Messpunkte wie sensor.sonnen_stufengrenzen: Spitze%  J/N  k/m  TTHHMM */
  _punkte() {
    const raw = (this._s('input_text.sonnenmoment_proben_a') + ',' + this._s('input_text.sonnenmoment_proben_b')).split(',');
    return raw.map((x) => /^([0-9]{1,3})([JN])([km])([0-9]{6})$/.exec(x)).filter(Boolean).map((m) => ({
      v: parseInt(m[1], 10) / 100, j: m[2] === 'J', du: m[3] === 'm', t: m[4].slice(0, 2) + '. ' + m[4].slice(2, 4) + ':' + m[4].slice(4, 6)
    }));
  }

  // Sonnenstand (vereinfachte Formel, genuegt fuer Minuten-Genauigkeit)
  _sonne(date, lat, lon) {
    const d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
    const g = ((357.529 + 0.98560028 * d) % 360) * Math.PI / 180;
    const q = (280.459 + 0.98564736 * d) % 360;
    const L = ((q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) % 360) * Math.PI / 180;
    const e = (23.439 - 0.00000036 * d) * Math.PI / 180;
    const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
    const dec = Math.asin(Math.sin(e) * Math.sin(L));
    const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
    const ha = ((gmst * 15 + lon) * Math.PI / 180) - ra;
    const la = lat * Math.PI / 180;
    const el = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha));
    const az = Math.atan2(-Math.sin(ha), Math.tan(dec) * Math.cos(la) - Math.sin(la) * Math.cos(ha));
    return { az: ((az * 180 / Math.PI) + 360) % 360, el: el * 180 / Math.PI };
  }

  _karte(raw) {
    if (!raw || raw === 'unknown') return [];
    return raw.split(',').map((x) => x.split(':').map(parseFloat)).filter((p) => p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])).sort((a, b) => a[0] - b[0]);
  }

  _grenzeAz(az, pts) {
    if (pts.length >= 2 && az >= pts[0][0] && az <= pts[pts.length - 1][0]) {
      for (let k = 0; k < pts.length - 1; k++) {
        if (az >= pts[k][0] && az <= pts[k + 1][0]) { const sp = pts[k + 1][0] - pts[k][0]; return pts[k][1] + (sp > 0 ? (az - pts[k][0]) / sp : 0) * (pts[k + 1][1] - pts[k][1]); }
      }
    }
    let best = null;
    pts.forEach((p) => { const dd = Math.abs(p[0] - az); if (dd <= 3 && (!best || dd < best[0])) best = [dd, p[1]]; /* 3 Grad wie sensor.sonnen_schattengrenze (seit 10.11.2026) */ });
    return Math.max(8, best ? best[1] : 8);
  }

  _schattenHeute() {
    const cfg = this._hass.config || {};
    const lat = cfg.latitude || 50.36, lon = cfg.longitude || 9.56;
    const km = this._karte(this._s('input_text.sonnen_schattenkarte_morgen'));
    const ka = this._karte(this._s('input_text.sonnen_schattenkarte_abend'));
    const heute = new Date(); heute.setHours(0, 0, 0, 0);
    const ivs = []; let cur = null; let tag = false;
    for (let m = 5 * 60; m <= 19 * 60; m += 5) {
      const t = new Date(heute.getTime() + m * 60000);
      const p = this._sonne(t, lat, lon);
      const hm = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
      if (p.el <= 0) { if (cur) { cur.bisSU = true; ivs.push(cur); cur = null; } if (tag) break; continue; }
      const erster = !tag; tag = true;
      const sch = p.el < this._grenzeAz(p.az, p.az < 180 ? km : ka);
      if (sch && !cur) cur = { von: hm, bis: hm, abSA: erster };
      else if (sch && cur) cur.bis = hm;
      else if (!sch && cur) { ivs.push(cur); cur = null; }
    }
    if (cur) ivs.push(cur);
    return ivs;
  }

  async _ladeLog() {
    /* 12.11.2026: ueber den WebSocket-Verlauf (wie die HA-Oberflaeche selbst) statt REST - REST lieferte in der App nichts */
    const eid = 'input_text.sonnen_letzte_lernaenderung';
    const start = new Date(Date.now() - 14 * 86400000);
    let roh = [];
    try {
      const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), entity_ids: [eid], minimal_response: false, no_attributes: true, significant_changes_only: false });
      roh = ((res && res[eid]) || []).map((x) => ({ state: x.s, t: (x.lc || x.lu) * 1000 }));
    } catch (e) {
      try {
        const res = await this._hass.callApi('GET', 'history/period/' + start.toISOString() + '?filter_entity_id=' + eid + '&no_attributes');
        roh = ((res && res[0]) || []).map((x) => ({ state: x.state, t: Date.parse(x.last_changed) }));
      } catch (e2) { roh = null; }
    }
    if (roh === null) { this._log = null; this._logFehler = true; this._render(); return; }
    this._logFehler = false;
    this._log = roh.filter((x) => x.state && !['unknown', 'unavailable', ''].includes(x.state) && !/^TEST/.test(x.state) && !isNaN(x.t)).slice(-6).reverse().map((x) => {
      const d = new Date(x.t);
      const tag = d.toDateString() === new Date().toDateString() ? '' : String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '. ';
      const text = x.state.replace(/^(\d{2}\.\d{2}\. )?\d{1,2}:\d{2} /, '');
      return { zeit: tag + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), text: text };
    });
    this._render();
  }


  _render() {
    if (!this._hass || !this.shadowRoot) return;
    const sun = (this._hass.states['sun.sun'] || { attributes: {} }).attributes;
    const el = parseFloat(sun.elevation) || 0;
    const grenze = this._f('sensor.sonnen_schattengrenze', 8);
    const anzeige = this._s('sensor.sonnenklassifikation_heute');
    const ent = this._s('sensor.sonnen_entscheidung');
    const sg = this._s('sensor.sonnen_stufengrenzen').split('|');
    const S = parseFloat(sg[2]) || 0.8, t1 = parseFloat(sg[1]) || S * 0.9;
    const spx = this._f('sensor.sonnen_spitzenindex_20min', 0), i10 = this._f('sensor.sonnen_index_10min', 0);
    const stCls = (EKC_STUFE[anzeige] || ['', anzeige])[0];

    /* Was wuerde die Station allein sagen? (gleiche Regel wie sensor.sonnenklassifikation_heute) */
    const stationRegel = spx < S ? 0 : ((i10 >= t1 && spx <= i10 * 1.2) ? 2 : 1);
    const stationEntscheidet = ent.startsWith('Station');
    const imSchatten = el < grenze;

    // 1) Jetzt
    const cam = this._s('input_text.sonnen_cam_letzte_runde').split('|');
    const camT = Date.parse(cam[0]);
    const camTxt = !isNaN(camT) && cam.length >= 4 ? 'Letzte Kamera-Runde ' + new Date(camT).toTimeString().slice(0, 5) + ' (vor ' + Math.round((Date.now() - camT) / 60000) + ' Min): ' + this._esc(cam[1]) + (cam[2] === 'einig' || cam[2] === 'einzeln' ? '' : ' – ' + this._esc(cam[3])) + '. Sie gilt ' + (imSchatten ? 'bis 30 Min.' : 'bis 60 Min, solange das Licht gleich bleibt.') : '';
    const balken = (lab, v, ziel, zielLab, farbe) => '<div class="mess"><div class="ml"><span>' + lab + '</span><b>' + this._z(v) + '</b></div>'
      + '<div class="bar"><div class="fill" style="width:' + this._x(v).toFixed(1) + '%;background:' + farbe + '"></div><div class="tick" style="left:' + this._x(ziel).toFixed(1) + '%"></div>'
      + '<div class="tl" style="left:' + this._x(ziel).toFixed(1) + '%">' + zielLab + '</div></div></div>';
    const jetzt = el <= 0 ? '<div class="box"><div class="kopf">Jetzt <span>Nacht</span></div><span class="sek">Die Sonne ist untergegangen – keine Einstufung.</span></div>'
      : '<div class="box"><div class="kopf">Jetzt <span>' + new Date().toTimeString().slice(0, 5) + ' · Sonne ' + this._z(el, 1) + '° · ' + (imSchatten ? 'Station im Schatten (frei ab ' + this._z(grenze, 1) + '°)' : 'über der Schattengrenze (' + this._z(grenze, 1) + '°)') + '</span></div>'
      + '<span class="chip ' + stCls + 'c">' + (EKC_ICON[stCls] || '') + this._esc(anzeige) + '</span>'
      + '<div class="wer">Entscheidet: <b>' + this._esc(ent) + '</b>' + (camTxt ? '<br><span class="sek">' + camTxt + '</span>' : '') + '</div>'
      + balken('Hellster Wert der letzten 20 Min', spx, S, 'Sonnenmoment ab ' + this._z(S), spx >= S ? '#ffd60a' : '#8e8e93')
      + balken('Mittel der letzten 10 Min', i10, t1, 'Sonnig ab ' + this._z(t1), i10 >= t1 ? '#ff9f0a' : '#8e8e93')
      + '<span class="sek" style="margin-top:12px">Skala 0 bis 1,2 · 0,80 = blauer Himmel am Klartag (05.11.)' + (imSchatten ? ' · Station im Schatten: Werte zählen gerade nicht' : '') + '</span></div>';

    // 2) Mini-Diagramm 20 Min
    let dia = '';
    if (el > 0) {
      const V = this._verlauf;
      if (V === undefined) dia = '<span class="sek">Lade Verlauf …</span>';
      else if (!V || V.length < 2) dia = '<span class="sek">Kein Verlauf verfügbar.</span>';
      else {
        const t0 = Date.now() - 20 * 60000, W = 520, H = 120, X = (t) => 6 + (t - t0) / (20 * 60000) * (W - 12), Y = (v) => 100 - Math.min(v, EKC_SKALA) / EKC_SKALA * 90;
        const pts = V.map((p) => X(p.t).toFixed(1) + ',' + Y(p.v).toFixed(1));
        pts.push(X(Date.now()).toFixed(1) + ',' + Y(V[V.length - 1].v).toFixed(1));
        let sonneMs = 0, wechsel = 0;
        V.forEach((p, i) => { const bis = i + 1 < V.length ? V[i + 1].t : Date.now(); if (p.v >= S) sonneMs += bis - p.t; if (i > 0 && (V[i - 1].v >= S) !== (p.v >= S)) wechsel++; });
        const anteil = Math.round(sonneMs / (Date.now() - Math.max(t0, V[0].t)) * 100);
        const flaeche = X(V[0].t).toFixed(1) + ',100 ' + pts.join(' ') + ' ' + X(Date.now()).toFixed(1) + ',100';
        const ys = Y(S).toFixed(1);
        dia = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="Licht der letzten 20 Minuten">'
          + '<defs><clipPath id="ob"><rect x="0" y="0" width="' + W + '" height="' + ys + '"/></clipPath></defs>'
          + '<polygon points="' + flaeche + '" fill="rgba(255,255,255,.07)"/>'
          + '<polygon points="' + flaeche + '" fill="rgba(255,214,10,.45)" clip-path="url(#ob)"/>'
          + '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#e5e5ea" stroke-width="1.6"/>'
          + '<line x1="6" x2="' + (W - 6) + '" y1="' + ys + '" y2="' + ys + '" stroke="#64d2ff" stroke-width="1.5" stroke-dasharray="5 4"/>'
          + '<text x="' + (W - 8) + '" y="' + (Y(S) - 5).toFixed(1) + '" fill="#64d2ff" font-size="11" text-anchor="end">Sonnenmoment ' + this._z(S) + '</text>'
          + '<text x="6" y="116" fill="#98989f" font-size="10.5">vor 20 Min</text><text x="' + (W / 2) + '" y="116" fill="#98989f" font-size="10.5" text-anchor="middle">vor 10 Min</text><text x="' + (W - 6) + '" y="116" fill="#98989f" font-size="10.5" text-anchor="end">jetzt</text>'
          + '</svg><span class="sek">Gelb = direkte Sonne. In den letzten 20 Min: <b>' + anteil + ' %</b> der Zeit Sonne' + (wechsel ? ', <b>' + wechsel + '×</b> Wechsel zwischen Sonne und Wolke' : '') + '.'
          + (anteil === 0 ? ' Kein Sonnenmoment → Bewölkt.' : (wechsel >= 2 || anteil < 90 ? ' Sonne kommt und geht → Teilweise.' : ' Sonne fast durchgehend.')) + '</span>';
      }
      dia = '<div class="box"><div class="kopf">Licht der letzten 20 Minuten <span>Messwert alle ~16 s</span></div>' + dia + '</div>';
    }

    // 3) Regeln
    const regeln = [
      ['bew', 'Bewölkt', 'Kein Sonnenmoment in 20 Min – der hellste Wert blieb unter <b>' + this._z(S) + '</b>. Egal wie hell: Hochnebel und Schleier landen hier.'],
      ['teil', 'Teilweise', 'Die Sonne war da (Spitze ab ' + this._z(S) + '), aber nicht durchgehend oder mit Wolkenrändern – <i>Sonne kommt und geht, Wolken sind zu sehen.</i>'],
      ['son', 'Sonnig', 'Sonne fast durchgehend (10-Min-Mittel ab <b>' + this._z(t1) + '</b> = 90 % der Schwelle) und ruhiges Licht (Spitze höchstens 20 % über dem Mittel).']
    ].map((r, i) => '<div class="regel' + (el > 0 && i === stationRegel ? ' an' : '') + '"><span class="pill ' + r[0] + '">' + r[1] + '</span><span>' + r[2] + '</span></div>').join('');
    const regelHinweis = el <= 0 ? '' : (stationEntscheidet ? 'Gerade greift die markierte Regel.' : 'Die Station würde gerade <b>' + ['Bewölkt', 'Teilweise', 'Sonnig'][stationRegel] + '</b> sagen – entscheidend ist aber: ' + this._esc(ent) + '.');
    /* v2.2 (23.11.2026, Wunsch Martin): Warum weicht die Station gerade ab? - sichtbar, statt nur im Chat erklaert */
    const stN = ['Bewölkt', 'Teilweise', 'Sonnig'][stationRegel];
    let real = (EKC_STUFE[anzeige] || ['', ''])[1]; if (real === 'Nebel') real = 'Bewölkt';
    const humJ = this._f('sensor.gw1100a_v2_2_5_humidity', 0);
    let abw = '';
    if (el > 0 && !imSchatten && !stationEntscheidet && real && real !== stN) {
      const pz = Math.round(spx / 0.8 * 100);
      let w;
      if (stN === 'Bewölkt') {
        w = 'Der hellste Wert der letzten 20 Min liegt bei <b>' + this._z(spx) + '</b> (' + pz + ' % von blauem Himmel) und damit unter der Schwelle ' + this._z(S) + ' – die Station sieht keinen Sonnenmoment, obwohl die Sonne da ist. '
          + (humJ >= 95 ? '<b>Grund: heller Dunst bzw. Nebelreste</b> (Feuchte ' + Math.round(humJ) + ' %) – die Sonne kommt nur gedämpft an der Station an. Bei so hoher Feuchte entsteht bewusst <b>kein Messpunkt</b>: die Schwelle bleibt, wie sie ist, und die Kamera entscheidet. Du musst nichts tun.'
            : '<b>Grund: die Sonne kommt nur gedämpft an</b> (Schleier oder Sonne am Wolkenrand). Die Kamera-Runde legt dafür einen Messpunkt ab – passiert das öfter, sinkt die Schwelle.');
      } else if (real === 'Bewölkt') {
        w = 'Der hellste Wert liegt bei <b>' + this._z(spx) + '</b> (' + pz + ' % von blauem Himmel) über der Schwelle ' + this._z(S) + ', die Sonne scheint aber nicht direkt. <b>Grund: grell-weiße Wolken</b> oder ein kurzer Lichtblitz. Die Kamera-Runde legt dafür einen Messpunkt ab – passiert das öfter, steigt die Schwelle.';
      } else if (stN === 'Sonnig') {
        w = 'Das Licht ist hell und ruhig – <b>Wolken am Himmel sieht die Station nicht</b>, die Kamera schon. Nach deiner Definition ist das Teilweise.';
      } else {
        w = 'Das Licht schwankt (Spitze ' + this._z(spx) + ' mehr als 20 % über dem Mittel ' + this._z(i10) + ') – <b>Grund: helle Wolkenränder</b> spiegeln zusätzlich Licht auf die Station, obwohl die Sonne durchgehend scheint.';
      }
      abw = '<div class="hinweis"><b>Warum die Station gerade „' + stN + '“ sagt, aber „' + real + '“ richtig ist:</b> ' + w + '</div>';
    }
    const regelBox = '<div class="box"><div class="kopf">So entscheidet die Station <span>wenn keine Kamera-Runde gilt</span></div><div class="regeln">' + regeln + '</div>' + abw
      + '<span class="sek">' + regelHinweis + ' Vorrang vor der Station: deine Meldung (30 Min) · Kamera-Widerspruch (25 Min) · Kamera-Runde (bis 60 Min bei gleichem Licht) · unter der Schattengrenze Kamera bzw. Vorhersage · Nebel.</span></div>';

    // 4) Gelernte Schwelle
    const P = this._punkte();
    const richtig = (s) => P.reduce((a, p) => a + (((p.v >= s) === p.j) ? 1 : 0), 0);
    const okS = richtig(S);
    const W2 = 520, XP = (v) => 20 + (Math.min(Math.max(v, 0.2), 1.2) - 0.2) / 1.0 * 480;
    let ps = '<line x1="20" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,.15)"/>'
      + '<rect x="' + XP(S).toFixed(1) + '" y="8" width="' + (500 - XP(S)).toFixed(1) + '" height="96" fill="rgba(255,214,10,.06)"/>'
      + '<line x1="' + XP(S).toFixed(1) + '" y1="4" x2="' + XP(S).toFixed(1) + '" y2="104" stroke="#64d2ff" stroke-width="2"/>'
      + '<text x="' + (XP(S) + (S > 1.0 ? -4 : 4)).toFixed(1) + '" y="14" fill="#64d2ff" font-size="11" font-weight="600" text-anchor="' + (S > 1.0 ? 'end' : 'start') + '">Schwelle ' + this._z(S) + '</text>'
      + '<text x="22" y="28" fill="#ffd60a" font-size="10.5">J – Sonne gesehen</text><text x="22" y="100" fill="#98989f" font-size="10.5">N – keine Sonne</text>';
    [0.2, 0.4, 0.6, 0.8, 1.0, 1.2].forEach((t) => { ps += '<text x="' + XP(t).toFixed(1) + '" y="118" fill="#98989f" font-size="10" text-anchor="middle">' + this._z(t, 1) + '</text>'; });
    const stapel = {};
    P.forEach((p) => {
      const key = Math.round(XP(p.v) / 7) + (p.j ? 'J' : 'N'); stapel[key] = (stapel[key] || 0) + 1; const n = stapel[key];
      if (n > 5) return;
      const x = XP(p.v), y = p.j ? 52 - (n - 1) * 8 : 68 + (n - 1) * 8, falsch = (p.v >= S) !== p.j, col = p.j ? '#ffd60a' : '#8e8e93';
      const ring = falsch ? ' stroke="#ff453a" stroke-width="2"' : '';
      const tip = '<title>' + (p.du ? 'Du' : 'Kamera') + ' · ' + p.t + ' · Spitze ' + this._z(p.v) + ' · ' + (p.j ? 'Sonne gesehen' : 'keine Sonne') + (falsch ? ' – liegt bei dieser Schwelle falsch' : ' – passt') + '</title>';
      ps += p.du ? '<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="4.5" fill="' + col + '"' + ring + '>' + tip + '</circle>'
        : '<rect x="' + (x - 3.5).toFixed(1) + '" y="' + (y - 3.5) + '" width="7" height="7" fill="' + col + '"' + ring + '>' + tip + '</rect>';
    });
    let kurve = '';
    if (P.length) {
      const werte = []; for (let i = 60; i <= 100; i++) werte.push(richtig(i / 100));
      const kx = (i) => 20 + i / 40 * 480, ky = (v) => 92 - v / P.length * 78;
      const si = Math.round((S - 0.6) * 100);
      kurve = '<svg viewBox="0 0 ' + W2 + ' 112" width="100%" role="img" aria-label="Richtig liegende Punkte je Schwelle">'
        + '<rect x="' + kx(10) + '" y="12" width="' + (kx(35) - kx(10)) + '" height="80" fill="rgba(255,255,255,.04)"/>'
        + '<text x="20" y="9" fill="#98989f" font-size="10.5">Richtig liegende Punkte je möglicher Schwelle (gesucht wird im hellen Feld 0,70–0,95)</text>'
        + '<polyline fill="none" stroke="#64d2ff" stroke-width="2" points="' + werte.map((v, i) => kx(i).toFixed(1) + ',' + ky(v).toFixed(1)).join(' ') + '"/>'
        + (si >= 0 && si <= 40 ? '<circle cx="' + kx(si).toFixed(1) + '" cy="' + ky(werte[si]).toFixed(1) + '" r="4" fill="#64d2ff"/><text x="' + kx(si).toFixed(1) + '" y="' + (ky(werte[si]) - 8).toFixed(1) + '" fill="#64d2ff" font-size="10.5" text-anchor="middle">' + werte[si] + '</text>' : '')
        + [0.6, 0.7, 0.8, 0.9, 1.0].map((t) => '<text x="' + kx(Math.round((t - 0.6) * 100)).toFixed(1) + '" y="108" fill="#98989f" font-size="10" text-anchor="middle">' + this._z(t, 1) + '</text>').join('')
        + '</svg>';
    }
    const nDu = P.filter((p) => p.du).length;
    /* v2.1: Klartext - gleiche Regel wie sensor.sonnen_stufengrenzen (0,70-0,95, deine Punkte 3x, Gleichstand -> naechste an 0,80, unter 12 Punkten fest 0,80) */
    const wert = (L, i) => L.reduce((a, p) => a + (((Math.round(p.v * 100) >= i) === p.j) ? (p.du ? 3 : 1) : 0), 0);
    const wahl = (L) => { if (L.length < 12) return 80; let b = 80, bo = -1, bd = 99; for (let i = 70; i <= 95; i++) { const o = wert(L, i), d = Math.abs(i - 80); if (o > bo || (o === bo && d < bd)) { b = i; bo = o; bd = d; } } return b; };
    const Si = Math.round(S * 100);
    const zz = (i) => this._z(i / 100);
    const schieb = (j) => { for (let k = 1; k <= 12; k++) { const neu = P.slice(); for (let m = 0; m < k; m++) neu.push({ v: (j ? Si - 1 : Si) / 100, j: j, du: false }); const w = wahl(neu); if (w !== Si) return { k: k, w: w }; } return null; };
    let klar = '';
    if (P.length >= 12) {
      const reihen = [...new Set([80, Si - 5, Si - 3, Si, Si + 3, Si + 5].filter((i) => i >= 70 && i <= 95))].sort((a, b) => a - b);
      const maxW = Math.max(...reihen.map((i) => wert(P, i)), 1);
      const ab = schieb(true), auf = schieb(false);
      const satzS = (r, j) => {
        if (!r) return '';
        const mel = Math.ceil(r.k / 3);
        const von = j ? r.w : Si, bis = j ? Si - 1 : r.w - 1;
        return '<div class="pf"><span>' + (j ? '↓' : '↑') + '</span><span>Auf <b>' + zz(r.w) + '</b>, sobald <b>' + r.k + ' Kamera-Runde' + (r.k > 1 ? 'n' : '') + '</b> (oder ' + mel + ' Meldung' + (mel > 1 ? 'en' : '') + ' von dir) „' + (j ? 'Sonne gesehen' : 'keine Sonne') + '“ bei einer Spitze ' + (von === bis ? 'von ' + zz(von) : 'zwischen ' + zz(von) + ' und ' + zz(bis)) + ' bring' + (r.k > 1 ? 'en' : 't') + '.</span></div>';
      };
      const fJ = P.filter((p) => p.j && p.v < S).sort((a, b) => a.v - b.v), fN = P.filter((p) => !p.j && p.v >= S).sort((a, b) => a.v - b.v);
      const chips = fJ.map((p, i) => '<span title="' + (p.du ? 'Du' : 'Kamera') + ' · ' + p.t + '">' + (i === 0 ? 'Sonne gesehen, Spitze ' : '') + this._z(p.v) + '</span>').join('')
        + fN.map((p, i) => '<span title="' + (p.du ? 'Du' : 'Kamera') + ' · ' + p.t + '">' + (i === 0 ? 'keine Sonne, Spitze ' : '') + this._z(p.v) + '</span>').join('');
      const heute = String(new Date().getDate()).padStart(2, '0');
      const nHeute = P.filter((p) => p.t.slice(0, 2) === heute).length;
      const grund = this._s('input_text.sonnen_schwellen_grund');
      const keinP = /Kein Messpunkt/.test(grund);
      klar = '<div class="satz">Erreicht der hellste Wert der letzten 20 Min <b>' + this._z(S) + '</b> (= ' + Math.round(S / 0.8 * 100) + ' % von blauem Himmel), hat die Sonne direkt geschienen. Darunter: <b>Bewölkt</b>.</div>'
        + '<div><h4>Warum gerade ' + this._z(S) + '? – richtig liegende Punkte je Schwelle' + (nDu ? ' (deine zählen 3×)' : '') + '</h4><div class="leiter">'
        + reihen.map((i) => { const w = wert(P, i); return '<div class="st' + (i === Si ? ' an' : '') + '"><span>' + zz(i) + '</span><i style="width:' + (w / maxW * 100).toFixed(0) + '%"></i><span>' + w + '</span></div>'; }).join('') + '</div></div>'
        + ((ab || auf) ? '<div><h4>Was würde sie verschieben?</h4><div style="display:flex;flex-direction:column;gap:6px">' + satzS(ab, true) + satzS(auf, false) + '</div><span class="sek" style="display:block;margin-top:6px">Gerechnet mit der echten Regel. Bei Gleichstand gewinnt der Wert näher an 0,80.</span></div>' : '')
        + ((fJ.length + fN.length) ? '<div><h4>Diese ' + (fJ.length + fN.length) + ' Punkte passen nicht zu ' + this._z(S) + '</h4><div class="falsch">' + chips + '</div><span class="sek" style="display:block;margin-top:6px">' + (fJ.length ? 'Sonne gesehen, aber dunkler: die Station hat die Sonne kaum gemerkt (Schleier, Sonne am Rand). ' : '') + (fN.length ? 'Keine Sonne, aber heller: grell-weiße Wolken ohne direkte Sonne.' : '') + '</span></div>' : '')
        + '<div class="hinweis' + (nHeute ? ' ok' : '') + '">' + (nHeute ? 'Heute ' + nHeute + ' neue' + (nHeute > 1 ? '' : 'r') + ' Punkt' + (nHeute > 1 ? 'e' : '') + '. ' : 'Heute noch kein neuer Punkt. ') + (grund ? 'Zuletzt: ' + this._esc(grund) : '') + (!nHeute && keinP ? ' Die Schwelle bleibt deshalb unverändert.' : '') + '</div>';
    }
    const schwelleBox = '<div class="box"><div class="kopf">Gelernte Schwelle: ' + this._z(S) + ' <span>' + P.length + ' Messpunkte · ' + okS + ' liegen richtig</span></div>' + klar
      + (P.length ? '<svg viewBox="0 0 ' + W2 + ' 122" width="100%" role="img" aria-label="Messpunkte">' + ps + '</svg>'
        + '<div class="lg"><span><i style="background:#ffd60a"></i>Sonne gesehen</span><span><i style="background:#8e8e93"></i>keine Sonne</span><span><i style="background:#fff"></i>eckig Kamera · <i style="background:#fff;border-radius:50%"></i>rund du (zählt 3×)</span><span><i style="background:transparent;box-shadow:inset 0 0 0 2px #ff453a"></i>liegt falsch</span></div>' + kurve : '<span class="sek">Noch keine Messpunkte – bis 12 Punkte gilt fest 0,80.</span>')
      + '<span class="sek">Die Schwelle ist der Wert, bei dem die meisten Punkte richtig liegen; bei Gleichstand der nächste an 0,80 (= blauer Himmel). Neue Punkte kommen mit jeder Kamera-Runde über der Schattengrenze und mit jeder deiner Meldungen dazu; es zählen die letzten 42 (' + nDu + ' von dir).</span></div>';

    // 5) Ehrliche Trefferquote
    const R = this._runden;
    let quote;
    const cls = { 'Bewölkt': 'bew', 'Teilweise': 'teil', 'Sonnig': 'son' };
    if (R === undefined) quote = '<span class="sek">Lade Kamera-Runden …</span>';
    else if (R === null) quote = '<span class="sek">Logbuch konnte nicht geladen werden.</span>';
    else {
      const heute0 = new Date(); heute0.setHours(0, 0, 0, 0);
      const H = R.filter((r) => r.t >= heute0.getTime());
      const q = (L) => L.length ? L.filter((r) => r.kam === r.st).length + '/' + L.length : '–';
      quote = '<div class="quote"><div class="q"><b>' + q(H) + '</b><small>heute<br>live</small></div><div class="q"><b>' + q(R) + '</b><small>7 Tage<br>live</small></div>'
        + '<div class="q"><b>31/40</b><small>Nachrechnung 18.–23.11.<br><span style="color:#98989f">altes Modell 23/40</span></small></div></div>'
        + (R.length ? '<div class="rl"><div class="rd rh"><span>Runde</span><span>Kamera</span><span>Station allein</span><span class="sp">Spitze</span><span></span></div>' + R.slice(-8).reverse().map((r) => {
          const d = new Date(r.t), ok = r.kam === r.st;
          const zeit = (d.toDateString() === new Date().toDateString() ? '' : String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '. ') + d.toTimeString().slice(0, 5);
          const gr = ok ? '' : (r.st === 'Bewölkt' ? (r.hum >= 95 ? 'Dunst' : 'Sonne gedämpft') : (r.kam === 'Bewölkt' ? 'grelle Wolken' : (r.st === 'Sonnig' ? 'Wolken nicht gesehen' : 'Lichtzacken')));
          return '<div class="rd"><span class="z">' + zeit + '</span><span><span class="pill ' + cls[r.kam] + '">' + r.kam + '</span></span><span><span class="pill ' + (cls[r.st] || '') + '">' + this._esc(r.st) + '</span></span><span class="sp">' + this._z(r.spx) + '</span><span class="' + (ok ? 'ok' : 'nok') + '">' + (ok ? '✓' : '✗') + '</span>' + (gr ? '<em class="' + (gr === 'Dunst' ? 'du' : '') + '">' + gr + '</em>' : '') + '</div>';
        }).join('') + '</div>' : '<span class="sek">Noch keine Runde mit Station-Urteil – kommt ab der nächsten Kamera-Runde über der Schattengrenze.</span>');
    }
    const quoteBox = '<div class="box"><div class="kopf">Ehrliche Trefferquote <span>Station allein gegen Kamera</span></div>' + quote
      + '<span class="sek">Zählt nur Runden über der Schattengrenze. „Station allein“ = was die Station ohne Kamera gesagt hätte (Logbuch-Feld sx). Vorher bestätigte sich die Kamera in der Quote oft selbst.</span></div>';

    // 3) Protokoll
    const log = this._log === undefined ? '<div class="leer">Lade …</div>' : (!this._log || !this._log.length ? '<div class="leer">' + (this._logFehler ? 'Verlauf konnte nicht geladen werden.' : 'In den letzten 14 Tagen noch nichts gelernt.') + '</div>'
      : this._log.map((e) => '<div class="ev"><span class="zt">' + e.zeit + '</span><span>' + this._esc(e.text) + '</span></div>').join(''));

    // 4) Schatten
    const iv = this._schattenHeute();
    const ivTxt = iv.length ? iv.map((x) => (x.abSA ? 'bis ' + x.bis + ' Uhr' : (x.bisSU ? 'ab ' + x.von + ' Uhr' : x.von + '–' + x.bis + ' Uhr'))).join(' und ') : 'Heute keine Schattenzeiten';
    /* v2.5 (24.11.2026): Kandidaten als Chips - lila = moeglicher Schatten, gelb = Stelle wird evtl. wieder frei (script.sonnen_schatten_freigeben) */
    const tagesteil = (ph, az) => (az >= 160 && az <= 200 ? 'mittags' : (ph === 'm' ? 'morgens' : 'nachmittags'));
    const kandL = (id) => this._s(id).split(',').filter((k) => /^[ma]\d+:[\d.]+:\d{8}$/.test(k)).map((k) => {
      const p = k.slice(1).split(':');
      return { teil: tagesteil(k[0], parseFloat(p[0])), az: p[0], el: Math.round(parseFloat(p[1])), seit: p[2].slice(6, 8) + '.' + p[2].slice(4, 6) + '.' };
    });
    const kand = kandL('input_text.sonnen_schatten_kandidaten');
    const frei = kandL('input_text.sonnen_frei_kandidaten');
    const icSch = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18M6 20l4-9 3 5 2-3 3 7"/></svg>';
    const icSon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    const chips = kand.map((k) => '<span class="skc sks">' + icSch + 'Schatten · ' + k.teil + ' ' + k.az + '° bis ' + k.el + '° <small>seit ' + k.seit + '</small></span>').join('')
      + frei.map((k) => '<span class="skc skf">' + icSon + 'wieder frei · ' + k.teil + ' ' + k.az + '° bei ' + k.el + '° <small>seit ' + k.seit + '</small></span>').join('');
    const meldRaw = this._s('input_text.sonnen_schatten_letzte_erkennung');
    const meldM = /^(\d{2})\.(\d{2})\. (\d{2}:\d{2}) (?:Morgen|Abend): (.*)$/.exec(meldRaw || '');
    const heuteDM = String(new Date().getDate()).padStart(2, '0') + '.' + String(new Date().getMonth() + 1).padStart(2, '0');
    const meld = meldM ? '<div class="skm">' + icSch.replace('width="14" height="14"', 'width="18" height="18"').replace('currentColor', '#9fe1ff') + '<div><div class="skt">Letzte Meldung · ' + (meldM[1] + '.' + meldM[2] === heuteDM ? 'heute ' : meldM[1] + '.' + meldM[2] + '. ') + meldM[3] + '</div><div class="skx">' + this._esc(meldM[4]) + '</div></div></div>'
      : (meldRaw && !['unknown', 'unavailable', ''].includes(meldRaw) ? '<div class="skm"><div class="skx">' + this._esc(meldRaw) + '</div></div>' : '');
    const kandBlock = meld + '<div class="skg"><span class="lab">Wartet auf einen zweiten Tag</span>'
      + (chips ? '<div class="skcs">' + chips + '</div><span class="sek">Lila = neu gesehener Schatten, gelb = Stelle, an der die Station im Schattenfenster volles Licht gemessen hat. Bestätigt ein zweiter Tag, ändert sich die Schattenkarte; nach 30 Tagen ohne Bestätigung verfällt ein Kandidat.</span>' : '<span class="leer">Nichts offen.</span>') + '</div>';

    const warum = '<details class="warum"' + (this._offen ? ' open' : '') + '><summary>Warum Modell 3.0?</summary>'
      + '<p>Die Station misst nur Helligkeit. Heller Hochnebel und Sonne zwischen Wolken liefern dieselbe Helligkeit (Index 0,5–0,7) – die bis 22.11. gelernten Grenzen Bewölkt|Teilweise und Teilweise|Sonnig je Sonnenhöhe überlappten deshalb, egal wie lange gelernt wurde (18.–23.11.: Station allein 23 von 40 Kamera-Runden richtig).</p>'
      + '<p>Was die Station sicher erkennt: ob die Sonne <b>direkt</b> scheint – dann springt der hellste Wert über die Klarhimmel-Linie. Darum lernt sie seit 23.11.2026 nur noch diese eine Schwelle (Nachrechnung: 31 von 40). Wie viele Wolken am Himmel sind, beurteilt die Kamera. Deine Definition: Sonne scheint durch und Wolken sind zu sehen = Teilweise; Sonnig nur ohne nennenswerte Wolken.</p>'
      + '<p>Abgeschaltet: Messpunkte je Sonnenhöhen-Band (bleiben als Archiv in input_text.sonnen_proben_b1–b5), „neueste Meldung gewinnt“, Schleier-Code, Wechsel-Modus als Entscheider und seine Grenzen, Helle-Wolken-Grenze.</p></details>';

    /* Hoehe 1,5 s halten - beim Neuaufbau sprang die Seite (iOS-App hat keinen Scroll-Anker, v1.8) */
    try { const hh = this.getBoundingClientRect().height; if (hh > 0) { this.style.minHeight = Math.ceil(hh) + 'px'; clearTimeout(this._haltT); this._haltT = setTimeout(() => { this.style.minHeight = ''; }, 1500); } } catch (e) { /* egal */ }
    this.shadowRoot.innerHTML = '<style>'
      + ':host{display:block}ha-card{padding:16px 18px;display:flex;flex-direction:column;gap:16px}'
      + 'h3{margin:0;font-size:16px;font-weight:600}.sek{font-size:12.5px;color:var(--secondary-text-color);line-height:1.45}'
      + '.ko{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.ko h2{margin:0;font-size:var(--ha-card-header-font-size,24px);font-weight:400}.amp{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:600;background:rgba(100,210,255,.14);color:#9fe1ff}'
      + '.box{padding:12px 14px 14px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;gap:10px}'
      + '.kopf{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;font-size:13.5px;font-weight:600;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.12)}.kopf span{font-weight:400;color:var(--secondary-text-color);font-size:12.5px}'
      + '.chip{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;padding:5px 11px 5px 8px;border-radius:999px;font-size:13px;font-weight:600;background:rgba(127,127,135,.22);color:#c4c4ca}.teilc{background:rgba(255,214,10,.14);color:#ffd60a}.sonc{background:rgba(255,159,10,.18);color:#ff9f0a}.bewc{background:rgba(127,127,135,.22);color:#c4c4ca}.satz{font-size:14px;line-height:1.5}.satz b{color:#64d2ff}.leiter{display:flex;flex-direction:column;gap:3px}.st{display:grid;grid-template-columns:44px 1fr 30px;gap:8px;align-items:center;font-size:12.5px;font-variant-numeric:tabular-nums}.st i{display:block;height:8px;border-radius:4px;background:rgba(255,255,255,.14)}.st.an{color:#64d2ff;font-weight:600}.st.an i{background:#64d2ff}.st span:last-child{text-align:right}.pf{display:grid;grid-template-columns:18px 1fr;gap:8px;font-size:13px;line-height:1.45;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03)}.falsch{display:flex;flex-wrap:wrap;gap:6px}.falsch span{font-size:12px;padding:3px 8px;border-radius:7px;background:rgba(255,69,58,.14);color:#ff9f95}.hinweis{font-size:12.5px;line-height:1.45;padding:8px 10px;border-radius:10px;background:rgba(160,140,200,.12);color:#cfc3ea}.hinweis.ok{background:rgba(48,209,88,.1);color:#9be9ae}h4{margin:0 0 6px;font-size:12px;color:var(--secondary-text-color);font-weight:500}.bewt{color:#c4c4ca}.teilt{color:#ffd60a}.sont{color:#ff9f0a}.wer{font-size:14px;line-height:1.5}'
      + '.mess{display:flex;flex-direction:column;gap:4px;margin-bottom:14px}.ml{display:flex;justify-content:space-between;font-size:12.5px}'
      + '.bar{position:relative;height:10px;border-radius:5px;background:rgba(255,255,255,.08)}.fill{position:absolute;left:0;top:0;bottom:0;border-radius:5px}'
      + '.tick{position:absolute;top:-4px;height:18px;width:2px;margin-left:-1px;background:#fff;border-radius:1px}.tl{position:absolute;top:16px;font-size:10.5px;color:var(--secondary-text-color);transform:translateX(-50%);white-space:nowrap}'
      + '.regeln{display:flex;flex-direction:column;gap:6px}.regel{display:grid;grid-template-columns:96px 1fr;gap:10px;align-items:center;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);font-size:12.5px;line-height:1.4}'
      + '.regel.an{background:rgba(100,210,255,.12);outline:1.5px solid rgba(100,210,255,.55)}'
      + '.pill{display:inline-block;font-weight:600;font-size:12px;padding:3px 8px;border-radius:7px;text-align:center}.bew{color:#c4c4ca;background:rgba(127,127,135,.22)}.teil{color:#ffd60a;background:rgba(255,214,10,.14)}.son{color:#ff9f0a;background:rgba(255,159,10,.18)}'
      + 'svg text{font-family:inherit}'
      + '.skm{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.05);margin-top:8px}.skm svg{flex:none;margin-top:1px}.skt{font-size:12px;color:var(--secondary-text-color)}.skx{font-size:13px;line-height:1.4}'
      + '.skg{margin-top:10px;display:flex;flex-direction:column;gap:6px}.skcs{display:flex;flex-wrap:wrap;gap:6px}.skc{display:inline-flex;align-items:center;gap:6px;padding:5px 11px 5px 8px;border-radius:999px;font-size:12.5px;font-weight:600}.skc small{font-weight:400;opacity:.75}.sks{background:rgba(111,90,138,.35);color:#d6c4f0}.skf{background:rgba(255,214,10,.14);color:#ffd60a}'
      + '.quote{display:flex;gap:10px}.q{flex:1;min-width:0;padding:8px 6px;border-radius:12px;background:rgba(255,255,255,.04);text-align:center}.q b{display:block;font-size:20px;font-variant-numeric:tabular-nums}.q small{display:block;font-size:11px;line-height:1.35;color:var(--secondary-text-color)}.rl{display:flex;flex-direction:column}.rd{display:grid;grid-template-columns:minmax(40px,auto) 1fr 1fr 34px 16px;gap:6px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:12.5px;font-variant-numeric:tabular-nums}.rd>span{min-width:0}.rd .pill{font-size:11.5px;padding:2px 7px}.rd em{grid-column:3 / span 3;display:block;font-style:normal;font-size:11px;color:#98989f;margin-top:-4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rd em.du{color:#cfc3ea}.rd .sp{text-align:right}.rd .ok,.rd .nok{text-align:center}.rh{font-size:11.5px;color:var(--secondary-text-color);padding-top:2px}.z{white-space:nowrap}'
      + 'table{width:100%;border-collapse:collapse;font-size:12.5px}td,th{padding:5px 4px;text-align:left;border-bottom:1px solid rgba(255,255,255,.06)}th{color:var(--secondary-text-color);font-weight:500}.ok{color:#30d158;font-weight:600}.nok{color:#ff453a;font-weight:600}'
      + '.block{display:flex;flex-direction:column;gap:4px}.lab{font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--secondary-text-color)}'
      + '.eb{display:flex;height:26px;border-radius:8px;overflow:hidden;font-size:11.5px;font-weight:600}.eb span{display:flex;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap}'
      + '.lg{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:11.5px;color:var(--secondary-text-color)}.lg span{display:inline-flex;align-items:center;gap:5px}.lg i{display:inline-block;width:10px;height:10px;border-radius:3px}'
      + '.ev{display:flex;gap:10px;padding:7px 0;border-top:1px solid var(--divider-color,#333);font-size:13.5px;line-height:1.45}.zt{flex:none;width:86px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums}.leer{font-size:13px;color:var(--secondary-text-color)}'
      + '.warum{font-size:12.5px;line-height:1.55}.warum summary{cursor:pointer;font-weight:600;font-size:13.5px}'
      + '@media(max-width:420px){.regel{grid-template-columns:1fr}.quote{gap:6px}.q small{font-size:10.5px}}'
      + '</style><ha-card>'
      + '<div class="ko"><h2>Kalibrierung</h2><span class="amp">Modell 3.0 · Schwelle ' + this._z(S) + '</span></div>'
      + jetzt + dia + regelBox
      + (() => { const e = this._ent; if (!e) return ''; const tot = e.Kamera + e.Station + e.Vorhersage + e.Du; if (tot < 60000) return ''; const pc = (v) => Math.round(v / tot * 100); const teil = [['Kamera', e.Kamera, '#bf5af2', '#fff'], ['Station', e.Station, '#32ade6', '#08202c'], ['Schatten', e.Vorhersage, '#6f5a8a', '#fff'], ['du', e.Du, '#30d158', '#06240f']].filter((x) => x[1] > 0); return '<div class="block" style="gap:8px"><span class="lab">Heute entschieden von</span><div class="eb">' + teil.map((x) => '<span title="' + x[0] + ' ' + pc(x[1]) + ' %" style="width:' + (x[1] / tot * 100).toFixed(1) + '%;background:' + x[2] + ';color:' + x[3] + '">' + (pc(x[1]) >= 18 ? x[0] + ' ' + pc(x[1]) + ' %' : (pc(x[1]) >= 8 ? pc(x[1]) + ' %' : '')) + '</span>').join('') + '</div><div class="lg">' + teil.map((x) => '<span><i style="background:' + x[2] + '"></i>' + x[0] + ' ' + pc(x[1]) + ' %</span>').join('') + '</div></div>'; })()
      + schwelleBox + quoteBox
      + '<div class="block"><h3>Was die KI zuletzt gelernt hat</h3>' + log + '</div>'
      + '<div class="block"><h3>Station im Schatten – heute</h3>' + (() => { const sun = (this._hass.states['sun.sun'] || { attributes: {} }).attributes; let sa = Date.parse(sun.next_rising), su = Date.parse(sun.next_setting); if (isNaN(sa) || isNaN(su)) return ''; if (sa > su) sa -= 86400000; if (su - sa > 86400000) su -= 86400000; const T = su - sa, m = (h) => { const d = new Date(sa); const p = h.split(':'); d.setHours(+p[0], +p[1], 0, 0); return d.getTime(); }; const pos = (t) => Math.max(0, Math.min(100, (t - sa) / T * 100)); const jetzt = Date.now(); return '<div style="position:relative;height:18px;border-radius:5px;overflow:hidden;background:rgba(255,214,10,.55);margin:4px 0 2px">' + iv.map((x) => { const a = x.abSA ? sa : m(x.von), b = x.bisSU ? su : m(x.bis); return '<span style="position:absolute;top:0;bottom:0;left:' + pos(a).toFixed(1) + '%;width:' + Math.max(0.8, pos(b) - pos(a)).toFixed(1) + '%;background:#6f5a8a"></span>'; }).join('') + (jetzt > sa && jetzt < su ? '<span style="position:absolute;top:0;bottom:0;width:3px;left:calc(' + pos(jetzt).toFixed(1) + '% - 1px);background:#64d2ff"></span>' : '') + '</div><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--secondary-text-color)"><span>' + new Date(sa).toTimeString().slice(0, 5) + '</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:#6f5a8a"></i> Schatten – Kamera entscheidet · <i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:rgba(255,214,10,.55)"></i> Station misst</span><span>' + new Date(su).toTimeString().slice(0, 5) + '</span></div>'; })() + '<span class="sek">' + ivTxt + '</span>'
      + kandBlock + '</div>'
      + warum
      + '</ha-card>';
    const det = this.shadowRoot.querySelector('details.warum');
    if (det) det.addEventListener('toggle', () => { this._offen = det.open; });
  }
}
if (!customElements.get('elmo-kalibrierung-card')) customElements.define('elmo-kalibrierung-card', ElmoKalibrierungCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'elmo-kalibrierung-card', name: 'ELMO Kalibrierung', description: 'Modell 3.0: Sonnenmoment-Schwelle, Licht der letzten 20 Min, ehrliche Trefferquote, Schatten' });
