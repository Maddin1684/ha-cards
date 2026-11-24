// ELMO Sonnen-Kamera-Karte v1.44 (24.11.2026) – Kennzeichen Reif (Logbuch rf): eigener Chip statt Schnee, Hof-Bild heisst 'Hof · Schnee/Reif'
// v1.43 (19.11.2026) – Hoehe halten gegen Springen, grosses Bild mit fester 16:9-Flaeche
// v1.42 (17.11.2026) – Treffsicherheit: Runden unter der Schattengrenze zaehlen gar nicht mehr (vorher nur Treffer ausgenommen, Widersprueche gezaehlt - drueckte die Quote)
// v1.41 (16.11.2026) – bei Regen-Nowcast Chip 'Runden pausiert' statt 'naechste in xx Min' (binary_sensor.sonnen_regen_nowcast)
// v1.40 (15.11.2026) – Extra-Runde bei Lichtwechsel markiert (Logbuch xr)
// v1.39 (14.11.2026) – Sicherheit im Verlauf farbig (gruen/gelb/rot), Chip-Symbol Haken
// v1.38 (13.11.2026) – Sicherheit der Runde (Mittel der Bilder) auch im Verlauf, bei Gruppen als Ø
// v1.37 (13.11.2026) – KI-Sicherheit je Bild als Chip in der Auswertung (gruen ab 80, gelb 70-79, rot darunter = zaehlt nicht)
// v1.36 (11.11.2026) – Runden-Chips zweizeilig (Uhrzeit/Ergebnis in zweiter Zeile), umbrechend
// v1.35 (11.11.2026) – Runden-Zeile als Chips mit Icon
// v1.34 (11.11.2026) – Zeile 'Letzte Runde vor xx Min · naechste in xx Min' unter dem Kopf, minuetlich aktualisiert
// v1.33 (08.11.2026) – Giebel (Sueden) als erstes Himmelsbild, Reihenfolge Giebel · Schluechtern · Kohlewald, Hof nur bei Schnee-Auswertung (hf); Bilder waagerecht scrollbar in fester Groesse (3 sichtbar)
// v1.32 (04.11.2026) – Runden mit nur einem ausgewerteten Himmelsbild (ez): Hinweis-Chip, 'ein Bild' in der Kamerazeile, ueber der Grenze 'KI hat notiert' statt 'an die Kalibrierung uebergeben'
// v1.31 (04.11.2026) – Wolkenton und Glutfarbe je Runde (Chips mit Farbpunkt, Ton je Bild); Detailflaeche und markierte Zeile leicht dunkler
// v1.30 (03.11.2026) – Detailflaeche in der Farbe der markierten Zeile, nahtlos verbunden; Zeitlinie pro Zeile, unterbrochen hinter den Details
// Zeigt die Runden von automation.sonnen_cam_abgleich (Logbuch-Eintraege "Sonnen-Cam" an
// input_text.sonnen_cam_letzte_runde) und laesst Widersprueche nachtraeglich bewerten
// (script.sonnen_cam_bewertung). Bilder: /media/sonnen_cam/<f oder id>_{std,him,gar}.jpg, erst beim Aufklappen geladen.
const SCC_ENTITY = 'input_text.sonnen_cam_letzte_runde';
const SCC_BILANZ = 'input_text.sonnen_cam_bilanz';
const SCC_SONNE = 'input_boolean.sonnen_cam_sonnenfall_bestatigt';
const SCC_FREI = 'binary_sensor.sonnen_cam_lernen_freigeschaltet';
const SCC_ZIEL = 5;
const SCC_VIEWS = [['std', 'Hof', '', 0], ['him', 'Schlüchtern', 'W', 278], ['gar', 'Kohlewald', 'O', 75]];
// Seit 08.11.2026 (Runden mit gi): Giebel zuerst, Hof nur wenn fuer Schnee ausgewertet (hf)
const SCC_VIEWS_NEU = [['gie', 'Giebel', 'S', 180], ['him', 'Schlüchtern', 'W', 278], ['gar', 'Kohlewald', 'O', 75]];
const SCC_HOF = ['std', 'Hof · Schnee/Reif', '', 0];
const SCC_KOR = ['Sonnig', 'Teilweise bewölkt, etwas Sonne', 'Bewölkt', 'Nebel'];
// Einheitliche Farbskala (wie Jetzt-Zeile und Systemeinstufung): grau -> blassgelb -> gelb -> orange, Nebel lavendel
const SCC_FARBE = { 'klar': '#ffd60a', 'leicht bewölkt': '#e6d37a', 'teilweise bewölkt': '#d1cba0', 'überwiegend bewölkt': '#aaa89c', 'bedeckt': '#8e8e93', 'Nebel oder Dunst': '#a08cc8' };
// Wolkenton (v1.31): Farbpunkt in der Farbe, die auch die ELMO-Karte fuer die Wolken nutzt
const SCC_TON = { 'weiß': '#ffffff', 'hellgrau': '#e8e8ec', 'grau': '#bec0c6', 'dunkelgrau': '#96989f', 'schiefer': '#788091', 'gelblich': '#ecdebe' };

class ElmoSonnenCamCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._open = new Set();
    this._wahl = new Set();
    this._gross = {};
    this._urls = {};
    this._rounds = [];
    this._urteile = {};
    this._lokal = {};
    this._key = '';
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    const key = [SCC_ENTITY, SCC_BILANZ, SCC_SONNE, SCC_FREI].map((e) => (hass.states[e] ? hass.states[e].last_changed + hass.states[e].state : '')).join('|');
    if (key !== this._key) {
      this._key = key;
      this._load();
    }
    const au = hass.states['automation.sonnen_cam_abgleich'];
    const mk = Math.floor(Date.now() / 60000) + '|' + (au && au.attributes ? au.attributes.current : '');
    if (mk !== this._minRunde) {
      this._minRunde = mk;
      const el = this.shadowRoot && this.shadowRoot.querySelector('.runde');
      if (el) el.innerHTML = this._kamChips();
    }
  }

  getCardSize() { return 3; }

  // Kamera-Runde: wann zuletzt, wann als naechstes (v1.34, 11.11.2026). Bildet die Ausloeser von automation.sonnen_cam_abgleich nach:
  // :00 immer, :20/:40 nur unter 20 Grad, im Schattenfenster (+2 Grad) oder bei unruhigem Licht; nur ab -4 Grad und im Tagmodus beider Kameras.
  _st(id) { const e = this._hass && this._hass.states[id]; return e ? e.state : ''; }

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
    return Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha)) * 180 / Math.PI;
  }

  _dauer(min) { return min < 60 ? min + ' Min' : Math.floor(min / 60) + ' Std ' + (min % 60) + ' Min'; }

  _kamRunde() {
    const h = this._hass;
    if (!h) return '';
    const lr = this._st(SCC_ENTITY).split('|');
    const t0 = Date.parse(lr[0]);
    const vor = isNaN(t0) ? null : Math.max(0, Math.round((Date.now() - t0) / 60000));
    const zuletzt = vor === null ? 'Noch keine Runde' : 'Letzte Runde vor ' + this._dauer(vor) + ' (' + this._zeit(t0) + (lr[1] ? ', ' + lr[1] : '') + ')';
    const auto = h.states['automation.sonnen_cam_abgleich'];
    if (auto && auto.attributes && auto.attributes.current > 0) return zuletzt + ' · Runde läuft gerade';
    const cfg = h.config || {};
    const lat = cfg.latitude || 50.36, lon = cfg.longitude || 9.56;
    const unruhig = this._st('binary_sensor.sonnenstrahlung_wechselhaft') === 'on' || this._st('binary_sensor.sonnen_helle_wolken') === 'on';
    const gr = parseFloat(this._st('sensor.sonnen_schattengrenze'));
    const grenze = isNaN(gr) ? 8 : gr;
    const jetzt = new Date();
    let t = new Date(jetzt); t.setSeconds(0, 0); t.setMinutes(Math.floor(t.getMinutes() / 20) * 20 + 20);
    let naechste = null, takt = '';
    for (let i = 0; i < 80; i++) {
      const el = this._sonne(t, lat, lon);
      if (el > -4) {
        const zwanzig = el < 20 || unruhig || el < grenze + 2;
        if (t.getMinutes() === 0 || zwanzig) { naechste = t; takt = zwanzig ? '20-Min-Takt' : 'stündlich'; break; }
      }
      t = new Date(t.getTime() + 20 * 60000);
    }
    if (!naechste) return zuletzt;
    const inMin = Math.max(1, Math.ceil((naechste - jetzt) / 60000));
    const morgen = naechste.toDateString() !== jetzt.toDateString();
    let wann = morgen ? 'morgen um ' + this._zeit(naechste) : (inMin <= 90 ? 'in ' + inMin + ' Min (' + this._zeit(naechste) + ', ' + takt + ')' : 'um ' + this._zeit(naechste));
    const tagmodus = this._st('sensor.hof_tag_nacht_zustand') === 'day' && this._st('sensor.garten_tag_nacht_zustand_2') === 'day';
    if (!tagmodus) wann = 'sobald die Kameras auf Tagmodus schalten' + (morgen ? '' : ' (frühestens ' + this._zeit(naechste) + ')');
    const person = this._st('binary_sensor.reolink_trackmix_poe_person') === 'on' || this._st('binary_sensor.garten_person_2') === 'on';
    return zuletzt + ' · nächste ' + wann + (person ? ' – wartet, solange jemand im Bild ist' : '');
  }

  // Chips (v1.35): letzte Runde, naechste Runde, ggf. Hinweis - gleiche Logik wie _kamRunde
  _kamChips() {
    const txt = this._kamRunde();
    if (!txt) return '';
    const teile = txt.split(' · ');
    const ch = (ic, t, f) => {
      // v1.36: zweizeilig - Hauptzeile, Klammerinhalt als zweite Zeile (sonst zu breit fuer die Karte)
      const m = /^(.*?) \((.*)\)$/.exec(t);
      const inhalt = m ? '<span class="rz"><span>' + this._esc(m[1]) + '</span><small>' + this._esc(m[2].replace(', ', ' · ')) + '</small></span>' : '<span class="rz"><span>' + this._esc(t) + '</span></span>';
      return '<span class="kc rc"' + (f ? ' style="background:' + f + '2e;color:' + f + '"' : '') + '><ha-icon icon="' + ic + '"></ha-icon>' + inhalt + '</span>';
    };
    let html = ch('mdi:history', teile[0].replace('Letzte Runde ', 'letzte Runde '), '');
    const rest = teile.slice(1).join(' · ');
    if (/läuft gerade/.test(rest)) html += ch('mdi:progress-clock', 'Runde läuft gerade', '#32ade6');
    else if (this._st('binary_sensor.sonnen_regen_nowcast') === 'on') html += ch('mdi:weather-pouring', 'Runden pausiert (Regen-Nowcast, weiter nach dem Regen)', '#0a84ff');
    else if (rest) {
      const p = rest.split(' – ');
      html += ch(/Tagmodus/.test(p[0]) ? 'mdi:weather-night' : 'mdi:timer-sand', p[0], '');
      if (p[1]) html += ch('mdi:account-alert', p[1], '#ff9f0a');
    }
    return html;
  }

  _views(r) {
    if (!r || !r.gi) return SCC_VIEWS;
    return r.hf ? SCC_VIEWS_NEU.concat([SCC_HOF]) : SCC_VIEWS_NEU;
  }

  // Sicherheit der Runde (v1.38): Mittel der KI-Sicherheit aller beurteilbaren Himmelsbilder
  _sicher(r) {
    if (!r || !r.v) return null;
    const w = ['gie', 'him', 'gar'].map((k) => r.v[k]).filter((d) => d && typeof d.sicherheit === 'number' && d.himmel_zustand !== 'nicht beurteilbar').map((d) => d.sicherheit);
    return w.length ? Math.round(w.reduce((a, b) => a + b, 0) / w.length) : null;
  }

  _sicherGrp(liste) {
    const w = liste.map((r) => this._sicher(r)).filter((x) => x !== null);
    return w.length ? Math.round(w.reduce((a, b) => a + b, 0) / w.length) : null;
  }

  // v1.39: Sicherheit im Verlauf farbig - gruen ab 80, gelb 70-79, rot darunter
  _siSpan(v, vor) {
    const f = v >= 80 ? '#30d158' : (v >= 70 ? '#ffd60a' : '#ff453a');
    return '<span style="color:' + f + ';font-weight:500">' + (vor || '') + v + ' % sicher</span>';
  }

  async _load() {
    if (!this._hass) return;
    const ende = new Date();
    const start = new Date(); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
    let ev = [];
    try {
      ev = await this._hass.callWS({ type: 'logbook/get_events', start_time: start.toISOString(), end_time: ende.toISOString(), entity_ids: [SCC_ENTITY, 'input_text.sonnen_schwellen_grund'] });
    } catch (e) { ev = []; }
    const rounds = [];
    const urteile = {};
    const lern = [];
    for (const x of ev || []) {
      if (x.entity_id === 'input_text.sonnen_schwellen_grund' && x.state && /^(\d\d:\d\d\s+)?Kamera[^:]*:/.test(x.state)) {
        const w = x.state.split('→').slice(1).join('→');
        let art = 'info';
        if (/gelernt/.test(w)) art = 'gelernt'; else if (/[Pp]asst/.test(w)) art = 'passt'; else if (/notiert/.test(w)) art = 'notiert'; else if (/Pause/.test(w)) art = 'pause';
        lern.push({ when: new Date(typeof x.when === 'number' ? x.when * 1000 : x.when).getTime(), art: art, text: w.trim() });
        continue;
      }
      if (!x.message) continue;
      let d = null;
      try { d = JSON.parse(x.message); } catch (e) { continue; }
      if (x.name === 'Sonnen-Cam' && d && d.id) rounds.push(d);
      else if (x.name === 'Sonnen-Cam Bewertung' && d && d.id) urteile[d.id] = d;
    }
    rounds.sort((a, b) => (a.t < b.t ? 1 : -1));
    const grenze = start.getTime();
    this._rounds = rounds.filter((r) => new Date(r.t).getTime() >= grenze);
    for (const id of Object.keys(this._lokal)) {
      if (urteile[id]) delete this._lokal[id];
      else urteile[id] = this._lokal[id];
    }
    this._urteile = urteile;
    this._lern = lern;
    if (this._rounds.length && !this._init) {
      this._init = true;
      const off = this._rounds.find((r) => r.s === 'widerspruch' && !urteile[r.id]);
      if (!off) this._open.add(this._rounds[0].id);
    }
    this._render();
  }

  async _url(id, v, f) {
    const k = id + '_' + v;
    if (this._urls[k]) return this._urls[k];
    this._pend = this._pend || {};
    if (this._pend[k]) return this._pend[k];
    this._pend[k] = this._resolve(k, (f || id) + '_' + v);
    return this._pend[k];
  }

  async _resolve(k, datei) {
    try {
      const r = await this._hass.callWS({ type: 'media_source/resolve_media', media_content_id: 'media-source://media_source/local/sonnen_cam/' + datei + '.jpg' });
      this._urls[k] = this._hass.hassUrl(r.url);
    } catch (e) { this._urls[k] = 'x'; }
    return this._urls[k];
  }

  _zeit(t) {
    const d = new Date(t);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  _kurz(e) {
    if (!e) return '–';
    if (e.startsWith('Teilweise')) return 'Teilweise';
    return e;
  }

  _kam(r) {
    const k = r.k === 'unklar' ? 'unklar' : r.k.toLowerCase();
    return 'Kamera ' + k + (r.m !== null && r.m !== undefined && r.k !== 'unklar' ? ' · ' + r.m + ' % Wolken' : '') + (r.ez ? ' · ein Bild' : '') + (r.xr ? ' · Extra-Runde' : '');
  }

  _wirkung(r) {
    if (r.s !== 'widerspruch') return null;
    const gr = r.kx && r.kx.gr !== undefined ? r.kx.gr : 8;
    if (r.el < gr) return { art: 'uebernommen', text: 'Sonne unter der Berggrenze – hier setzt die Kamera die Einstufung direkt.' };
    if (r.ez) return { art: 'notiert', text: 'Nur ein Himmelsbild ausgewertet (für das andere hat die KI nicht geantwortet) – nur notiert, die Kalibrierung lernt daraus nicht.' };
    const t0 = new Date(r.t).getTime();
    const e = (this._lern || []).filter((x) => x.when >= t0 - 60000 && x.when <= t0 + 15 * 60000).sort((a, b) => a.when - b.when)[0];
    if (e) return { art: e.art, text: e.text };
    if (r.el < 20) return { art: 'uebernommen', text: 'Zwischen Berggrenze und 20° korrigiert die Kamera die Einstufung direkt, wenn die Messung zwei Stufen daneben liegt.' };
    return { art: 'uebernommen', text: 'An die Kalibrierung übergeben.' };
  }

  _chip(z) {
    const f = SCC_FARBE[z];
    if (!f) return '<span class="kc" style="background:var(--secondary-background-color);color:var(--secondary-text-color)">' + this._esc(z) + '</span>';
    return '<span class="kc" style="background:' + f + '2e;color:' + f + '">' + this._esc(z) + '</span>';
  }

  _esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  // Farbpunkt-Chip (v1.31) fuer Wolkenton und Glutfarbe
  _farbChip(farbe, text) {
    return '<span class="kc fc"><span class="sw" style="background:' + farbe + '"></span>' + this._esc(text) + '</span>';
  }

  _wetter(r, ur) {
    if (!ur && (r.s === 'unklar' || r.s === 'ausfall')) return null;
    let e = ur ? (ur.kor || (ur.u === 'kamera' ? r.k : r.e)) : (r.s === 'widerspruch' ? r.k : r.e);
    if (!e || e === 'unklar') return null;
    if (e.startsWith('Teilweise')) e = 'Teilweise';
    const m = {
      'Bewölkt': ['#8e8e93', 'mdi:weather-cloudy', '#fff'],
      'Teilweise': ['#d1cba0', 'mdi:weather-partly-cloudy', '#1c1c1e'],
      'Sonnig': ['#ffd60a', 'mdi:weather-sunny', '#1c1c1e'],
      'Sehr sonnig': ['#ffab00', 'mdi:weather-sunny', '#1c1c1e'],
      'Außergewöhnlich sonnig': ['#ff6f00', 'mdi:weather-sunny', '#1c1c1e'],
      'Nebel': ['#a08cc8', 'mdi:weather-fog', '#fff'],
      'Nacht': ['#636366', 'mdi:weather-night', '#fff'],
    };
    return m[e] || null;
  }

  _wetterName(r, ur) {
    if (!ur && (r.s === 'unklar' || r.s === 'ausfall')) return '';
    let e = ur ? (ur.kor || (ur.u === 'kamera' ? r.k : r.e)) : (r.s === 'widerspruch' ? r.k : r.e);
    if (!e || e === 'unklar' || r.s === 'farbe') return '';
    if (e.startsWith('Teilweise')) return 'Teilweise';
    return e;
  }

  _kamEnt(r) {
    const gr = r.kx && r.kx.gr !== undefined ? r.kx.gr : 8;
    return r.s === 'treffer' && r.el > 1 && r.el < gr;
  }

  // v1.42: unter der Schattengrenze entscheidet die Kamera selbst - Treffer UND Widerspruch zaehlen dort nicht fuer die Treffsicherheit
  _unterGr(r) {
    const gr = r.kx && r.kx.gr !== undefined ? r.kx.gr : 8;
    return r.el > 1 && r.el < gr;
  }

  _ausfall(r) {
    return r.s === 'ausfall' || (r.s === 'unklar' && r.v && !r.v.std && !r.v.him && !r.v.gar && !r.v.gie);
  }

  _render() {
    if (!this.shadowRoot) return;
    const rs = this._rounds;
    const u = this._urteile;
    const eindeutig = rs.filter((r) => (r.s === 'treffer' || r.s === 'widerspruch') && !this._unterGr(r));
    const treffer = rs.filter((r) => r.s === 'treffer' && !this._unterGr(r)).length;
    const eingriffe = rs.filter((r) => r.s === 'widerspruch' && !u[r.id]).length;
    const vonDir = rs.filter((r) => (r.s === 'widerspruch' || r.s === 'unklar') && u[r.id]).length;
    const heuteS = new Date().toDateString();
    const quoteVon = (liste) => { const e = liste.filter((r) => (r.s === 'treffer' || r.s === 'widerspruch') && !this._unterGr(r)); return e.length ? e.filter((r) => r.s === 'treffer').length / e.length : null; };
    const qGes = eindeutig.length ? treffer / eindeutig.length : null;
    const qHeute = quoteVon(rs.filter((r) => new Date(r.t).toDateString() === heuteS));
    const qGestern = quoteVon(rs.filter((r) => new Date(r.t).toDateString() !== heuteS));
    let trend = '';
    if (qHeute !== null && qGestern !== null) {
      const dq = qHeute - qGestern;
      trend = dq >= 0.05 ? '<ha-icon class="tr" style="color:#30d158" icon="mdi:trending-up" title="heute besser als gestern"></ha-icon>' : (dq <= -0.05 ? '<ha-icon class="tr" style="color:#ff9f0a" icon="mdi:trending-down" title="heute schlechter als gestern"></ha-icon>' : '<ha-icon class="tr" style="color:var(--secondary-text-color)" icon="mdi:trending-neutral" title="gleich wie gestern"></ha-icon>');
    }
    const balken = qGes === null ? '' : '<div class="ts"><span class="tsl">Treffsicherheit</span><div class="tsb"><div class="tsf" style="width:' + Math.max(1, Math.round(qGes * 100)) + '%;--w:' + Math.max(1, Math.round(qGes * 100)) + '"></div></div><span class="tsw">' + Math.round(qGes * 100) + ' %</span>' + trend + '</div>';
    const bl = this._hass.states[SCC_BILANZ];
    const marken = (bl ? bl.state : '').split(',').filter((x) => /^[A-Za-z]{3}_[0-9]{4}:(k|ks|e|b)$/.test(x)).map((x) => x.split(':')[1]);
    const nb = marken.length;
    const nk = marken.filter((m) => m === 'k' || m === 'ks').length;
    const quote = nb ? Math.round(nk / nb * 100) : 0;
    const sonnenfall = this._hass.states[SCC_SONNE] && this._hass.states[SCC_SONNE].state === 'on';
    const frei = this._hass.states[SCC_FREI] && this._hass.states[SCC_FREI].state === 'on';
    if (!this._manuell || !rs.find((r) => r.id === this._sel)) { this._sel = rs.length ? rs[0].id : null; this._manuell = false; }
    if (this._auf === undefined) this._auf = true;
    const zeigen = rs.filter((r) => r.id === this._sel);
    const glutFarbe = { 'keine': '#8e8e93', 'golden': '#f0a500', 'leicht': '#ff7a90', 'kräftig': '#ff3b30' };
    const punkt = (r) => {
      if (r.s === 'farbe') return [glutFarbe[r.gl] || '#8e8e93', r.kx && r.kx.auf === false ? 'mdi:weather-sunset-down' : 'mdi:weather-sunset-up'];
      if (u[r.id]) return ['#ff453a', 'mdi:account'];
      if (this._ausfall(r)) return ['#8e8e93', 'mdi:cloud-alert'];
      if (this._kamEnt(r)) return ['#bf5af2', 'mdi:camera'];
      return { treffer: ['#30d158', 'mdi:check-bold'], widerspruch: ['#32ade6', 'mdi:robot'], unklar: ['#8e8e93', 'mdi:close-thick'] }[r.s] || ['#8e8e93', 'mdi:close-thick'];
    };
    const heute = new Date().toDateString();
    const tage = [['Heute', rs.filter((r) => new Date(r.t).toDateString() === heute).reverse()], ['Gestern', rs.filter((r) => new Date(r.t).toDateString() !== heute).reverse()]];
    let leiste = '';
    const anzahl = { Heute: tage[0][1].length, Gestern: tage[1][1].length };
    if (!this._tag || !anzahl[this._tag]) this._tag = anzahl.Heute ? 'Heute' : 'Gestern';
    if (anzahl.Heute || anzahl.Gestern) {
      leiste += '<div class="seg">' + ['Heute', 'Gestern'].map((t) => {
        const l = tage[t === 'Heute' ? 0 : 1][1];
        const dd = l.length ? new Date(l[0].t) : null;
        const sub = dd ? ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][dd.getDay()] + ', ' + dd.getDate() + '.' + (dd.getMonth() + 1) + '. · ' + l.length + (l.length === 1 ? ' Runde' : ' Runden') : 'keine Runden';
        return '<button class="sg' + (this._tag === t ? ' an' : '') + '"' + (l.length ? ' data-act="tag" data-t="' + t + '"' : ' disabled') + '><b>' + t + '</b><span>' + sub + '</span></button>';
      }).join('') + '</div>';
    }
    const sunSt = this._hass.states['sun.sun'];
    const sunTag = (attr, tagStr) => {
      if (!sunSt || !sunSt.attributes[attr]) return null;
      let t = new Date(sunSt.attributes[attr]).getTime();
      for (let i = 0; i < 3 && new Date(t).toDateString() !== tagStr; i++) t -= 24 * 3600 * 1000;
      return new Date(t).toDateString() === tagStr ? t : null;
    };
    const glutName = { 'keine': 'grau', 'golden': 'golden', 'leicht': 'rosa', 'kräftig': 'rot' };
    const label = (r) => {
      if (r.s === 'farbe') return 'Himmel ' + (glutName[r.gl] || 'grau');
      if (u[r.id]) return 'von dir ' + (u[r.id].u === 'kamera' ? 'bestätigt' : 'korrigiert');
      if (this._ausfall(r)) return 'KI nicht erreichbar';
      if (this._kamEnt(r)) return 'Kamera entscheidet';
      if (r.s === 'treffer') return 'Übereinstimmung';
      if (r.s === 'unklar') return 'unklar';
      const wk = this._wirkung(r);
      return { gelernt: 'KI hat gelernt', uebernommen: 'Kamera übernimmt', notiert: 'KI hat notiert', pause: 'KI: Pause', passt: 'KI-Eingriff', info: 'KI-Eingriff' }[wk ? wk.art : 'info'];
    };
    const art = (r) => (r.s === 'farbe' ? 'f:' + r.gl : (u[r.id] || this._ausfall(r) || r.s === 'widerspruch' || r.s === 'unklar') ? 'e:' + r.id : (this._kamEnt(r) ? 'k' : 't'));
    const kreis = (r, gross) => {
      const pp = punkt(r);
      const wz = r.s === 'farbe' ? null : this._wetter(r, u[r.id]);
      return '<span class="pk2' + (gross ? '' : ' kl2') + '" style="background:' + pp[0] + '"><ha-icon icon="' + pp[1] + '"></ha-icon>' + (wz ? '<span class="wb2" style="background:' + wz[0] + ';color:' + wz[2] + '"><ha-icon icon="' + wz[1] + '"></ha-icon></span>' : '') + '</span>';
    };
    this._gx = this._gx || new Set();
    this._platz = false;
    for (const [name, liste] of tage) {
      if (!liste.length || name !== this._tag) continue;
      const gruppen = [];
      for (const r of liste) {
        const g = gruppen[gruppen.length - 1];
        const a = art(r);
        const wn = this._wetterName(r, u[r.id]);
        if (g && g.a === a && !a.startsWith('e:') && g.w === wn) g.r.push(r);
        else gruppen.push({ a: a, w: wn, r: [r] });
      }
      const tagStr = new Date(liste[0].t).toDateString();
      const ev = gruppen.map((g) => ({ t: new Date(g.r[0].t).getTime(), g: g }));
      const auf = sunTag('next_rising', tagStr);
      const unter = sunTag('next_setting', tagStr);
      if (auf) ev.push({ t: auf, m: 'auf' });
      if (unter) ev.push({ t: unter, m: 'unter' });
      ev.forEach((e) => { if (e.g) e.t = new Date(e.g.r[e.g.r.length - 1].t).getTime(); });
      ev.sort((x, y) => y.t - x.t);
      let html = '';
      for (const e of ev) {
        if (e.m) {
          const kommt = e.t > Date.now();
          html += '<div class="vr sm' + (kommt ? ' kommt' : '') + '"><span class="vz"><ha-icon icon="' + (e.m === 'auf' ? 'mdi:weather-sunset-up' : 'mdi:weather-sunset-down') + '"></ha-icon>' + this._zeit(e.t) + '</span><span class="vk"></span><span class="vt">' + (e.m === 'auf' ? 'Sonnenaufgang' : 'Sonnenuntergang') + (kommt ? ' · kommt noch' : '') + '</span></div>';
          continue;
        }
        const g = e.g;
        const n = g.r.length;
        const r0 = g.r[0];
        const rN = g.r[n - 1];
        const offen = n > 1 && this._gx.has(r0.id);
        const istSel = g.r.some((r) => r.id === this._sel);
        const sq = r0.s === 'farbe' ? null : this._sicherGrp(g.r);
        const zusatz = [g.w || '', n > 1 ? '×' + n + ' seit ' + this._zeit(r0.t) : '', sq !== null ? this._siSpan(sq, n > 1 ? 'Ø ' : '') : ''].filter((x) => x).join(' · ');
        const einzelAuf = n === 1 && istSel && this._auf;
        html += '<div class="vr' + (istSel && !offen ? ' an' : '') + '" data-act="' + (n > 1 ? 'grp' : 'pt') + '" data-id="' + (n > 1 ? r0.id : rN.id) + '"><span class="vz">' + this._zeit(rN.t) + '</span><span class="vk">' + kreis(rN, true) + '</span><span class="vt"><span class="vt1">' + label(rN) + '</span>' + (zusatz ? '<span class="vt2">' + zusatz + '</span>' : '') + '</span><ha-icon class="vch" icon="mdi:chevron-' + ((offen || einzelAuf) ? 'up' : 'down') + '"></ha-icon></div>';
        if (offen) {
          for (const r of g.r.slice().reverse()) {
            html += '<div class="vr sub' + (r.id === this._sel ? ' an' : '') + '" data-act="pt" data-id="' + r.id + '"><span class="vz">' + this._zeit(r.t) + '</span><span class="vk">' + kreis(r, false) + '</span><span class="vt"><span class="vt2">' + label(r) + (this._wetterName(r, u[r.id]) ? ' · ' + this._wetterName(r, u[r.id]) : '') + (r.s !== 'farbe' && this._sicher(r) !== null ? ' · ' + this._siSpan(this._sicher(r), '') : '') + '</span></span></div>';
            if (r.id === this._sel && !this._platz) { html += '%%DETAIL%%'; this._platz = true; }
          }
        } else if (istSel && !this._platz) { html += '%%DETAIL%%'; this._platz = true; }
      }
      html = html.replace(/<div class="vr([^"]*)"(?![\s\S]*<div class="vr)/, '<div class="vr$1 letzte"');
      leiste += '<div class="vl">' + html + '</div>';
    }

    let rows = '';
    for (const r of zeigen) {
      const ur = u[r.id];
      let rechts;
      if (this._kamEnt(r)) rechts = '<span class="chip indigo">Kamera entscheidet</span>';
      else if (r.s === 'treffer') rechts = '<ha-icon class="ok" icon="mdi:check-circle-outline"></ha-icon>';
      else if (r.s === 'farbe') rechts = '<span class="chip grau">nur Farbe</span>';
      else if (ur) rechts = '<span class="chip blau">von dir ' + (ur.u === 'kamera' ? 'bestätigt' : 'korrigiert') + '</span>';
      else if (this._ausfall(r)) rechts = '<span class="chip grau">KI nicht erreichbar</span>';
      else if (r.s === 'unklar') rechts = '<span class="chip grau">unklar</span>';
      else {
        const wk = this._wirkung(r);
        const wt = { gelernt: 'KI hat gelernt', uebernommen: 'Kamera übernimmt', notiert: 'KI hat notiert', pause: 'KI: Pause', passt: 'passt', info: 'verarbeitet' }[wk.art];
        rechts = '<span class="chip ' + (wk.art === 'gelernt' || wk.art === 'uebernommen' ? 'cyan' : 'grau') + '">' + wt + '</span>';
      }
      const trenn = r.s === 'widerspruch' ? '↔' : '·';
      const auf = !!this._auf;
      let det = '';
      if (auf) {
        let th = '';
        let info = '';
        for (const [v, name, ri, grad] of this._views(r)) {
          const kompass = ri ? ' <span class="ri"><ha-icon icon="mdi:navigation" style="transform:rotate(' + grad + 'deg)"></ha-icon>' + ri + '</span>' : '';
          const url = this._urls[r.id + '_' + v];
          const d = r.v ? r.v[v] : null;
          const bild = url && url !== 'x' ? '<img src="' + url + '" alt="' + name + '" onerror="this.outerHTML=\'<div class=&quot;leer&quot;>kein Bild</div>\'">' : '<div class="leer">' + (url === 'x' ? 'kein Bild' : '…') + '</div>';
          th += '<div class="th" data-act="gross" data-id="' + r.id + '" data-v="' + v + '">' + bild + '<span class="lab">' + name + kompass + '</span></div>';
          if (!url) this._url(r.id, v, r.f).then(() => this._render());
          // Wolkenton je Bild (v1.31), nur Himmelsbilder, nur wenn beurteilbar
          const tonBild = d && v !== 'std' && SCC_TON[d.wolkenton] ? ' ' + this._farbChip(SCC_TON[d.wolkenton], d.wolkenton) : '';
          // Sicherheit der KI je Bild (v1.37): ab 80 gruen, 70-79 gelb, darunter rot = zaehlt nicht
          const si = d && d.sicherheit !== undefined ? Math.round(d.sicherheit) : null;
          const siF = si === null ? '' : (si >= 80 ? '#30d158' : (si >= 70 ? '#ffd60a' : '#ff453a'));
          const sichChip = si === null ? '' : ' <span class="kc" title="' + (si >= 70 ? 'Sicherheit der KI' : 'unter 70 % – Bild zählt nicht') + '" style="background:' + siF + '2e;color:' + siF + '"><ha-icon icon="mdi:check-circle-outline"></ha-icon>' + si + ' % sicher</span>';
          info += '<div class="info"><b>' + name + kompass + ':</b> ' + (d ? this._chip(d.himmel_zustand) + ' ' + Math.round(d.bewoelkung_prozent) + ' % Wolken' + tonBild + (d.sonne_direkt ? ' <span class="kc" style="background:#f0a5002e;color:#f0a500"><ha-icon icon="mdi:weather-sunny"></ha-icon>Sonne</span>' : '') + sichChip + ' · ' + this._esc(d.begruendung) : 'keine Auswertung') + '</div>';
        }
        const g = this._gross[r.id];
        const gross = g && this._urls[r.id + '_' + g] && this._urls[r.id + '_' + g] !== 'x' ? '<img class="gross" data-act="gross" data-id="' + r.id + '" data-v="' + g + '" src="' + this._urls[r.id + '_' + g] + '" onerror="this.remove()">' : '';
        let knopf = '';
        const korr = this._wahl.has(r.id)
          ? '<div class="hinweis">Nur falls die Kamera danebenlag – was war richtig?</div><div class="btns">' + SCC_KOR.map((k) => '<button data-act="kor2" data-id="' + r.id + '" data-k="' + k + '">' + this._kurz(k) + '</button>').join('') + '</div>'
          : '<div class="btns"><button class="klein" data-act="beide" data-id="' + r.id + '"><ha-icon icon="mdi:pencil-outline"></ha-icon> Korrigieren (optional)</button></div>';
        if (r.s === 'widerspruch' && !ur) {
          knopf = '<div class="hinweis">Automatisch verarbeitet: ' + this._esc(this._wirkung(r).text) + '</div>' + korr;
        } else if (r.s === 'farbe') {
          knopf = '<div class="hinweis">Sonne unter 1° – diese Runde prüft nur Himmelsfarbe und Schnee, sie zählt nicht für Abgleich und Lernen.</div>';
        } else if (this._kamEnt(r)) {
          knopf = '<div class="hinweis">Sonne unter der Berggrenze – hier setzt die Kamera die Einstufung selbst. Ein Abgleich ist nicht nötig, die Runde zählt nicht für die Treffsicherheit.</div>';
        } else if (r.s === 'treffer') {
          knopf = '<div class="hinweis">Übereinstimmung – Kamera und Einstufung sagen dasselbe, kein Eingriff nötig.</div>';
        } else if (this._ausfall(r) && !ur) {
          knopf = '<div class="hinweis">Die KI hat bei keinem der drei Bilder geantwortet (Google überlastet), auch nicht bei den Wiederholungen nach 3 und 10 Minuten. Die Runde zählt nicht.</div>' + korr;
        } else if (r.s === 'unklar' && !ur) {
          knopf = '<div class="hinweis">Weniger als zwei Himmelsbilder sicher erkannt (Sicherheit ab 70 %) – bis 13.11. reichte auch ein Abstand von mehr als 30 Punkten zwischen zwei Bildern. Die Runde zählt nicht.</div>' + korr;
        } else if (ur && (ur.u === 'beide' || ur.u === 'manuell')) {
          knopf = '<div class="hinweis">' + (ur.u === 'manuell' ? 'Bewertet: ' : 'Korrigiert auf: ') + this._esc(ur.kor) + '</div>';
        }
        const extra = [];
        if (r.gl && r.gl !== 'keine') extra.push('<span class="kc" style="background:#ff6f002e;color:#ff6f00"><ha-icon icon="mdi:weather-sunset"></ha-icon>' + (r.gl === 'golden' ? 'goldenes Licht' : (r.gl === 'kräftig' ? 'kräftiges' : 'leichtes') + ' ' + (r.kx && r.kx.auf ? 'Morgenrot' : 'Abendrot')) + '</span>');
        // Wolkenton und Glutfarbe der Runde (v1.31, Konsens der Himmelsbilder, so wie die ELMO-Karte sie nutzt)
        if (r.wt && SCC_TON[r.wt]) extra.push(this._farbChip(SCC_TON[r.wt], 'Wolken ' + r.wt + (r.wd ? ' · ' + r.wd + ' dunkel' : '')));
        if (r.gf && /^#[0-9a-f]{6}$/i.test(r.gf)) extra.push(this._farbChip(r.gf, 'Glutfarbe ' + r.gf.toLowerCase()));
        if (r.ez) extra.push(this._farbChip('#8e8e93', 'nur ein Himmelsbild'));
        if (r.xr) extra.push('<span class="kc" style="background:#64d2ff2e;color:#64d2ff"><ha-icon icon="mdi:camera-flip-outline"></ha-icon>Extra-Runde: Licht geändert</span>');
        if (r.sf === true) extra.push('<span class="kc" style="background:#81d4fa2e;color:#4fa3e0"><ha-icon icon="mdi:weather-snowy-heavy"></ha-icon>Schneefall</span>');
        if (r.rf === true) extra.push('<span class="kc" style="background:#bfe3ff2e;color:#9fd0ff" title="Reif oder Raureif erkannt – kein Schnee"><ha-icon icon="mdi:snowflake-variant"></ha-icon>Reif</span>');
        if (r.sd && r.sd !== 'keine') extra.push('<span class="kc" style="background:#81d4fa2e;color:#4fa3e0"><ha-icon icon="mdi:snowflake"></ha-icon>Schnee ' + r.sd + '</span>');
        const extraHtml = extra.length ? '<div class="info">' + extra.join(' ') + '</div>' : '';
        det = '<div class="det"><div class="thumbs">' + th + '</div>' + gross + extraHtml + info + knopf + '</div>';
      }
      rows += '<div class="row"><span class="txt">Einstufung ' + this._esc(this._kurz(r.e)) + ' <span class="mut">' + trenn + '</span> ' + this._esc(this._kam(r)) + '</span>' + rechts + '</div>' + det;
    }
    if (!rs.length) rows = '<div class="hinweis pad">Noch keine Kamera-Runde seit gestern.</div>';
    if (leiste.includes('%%DETAIL%%')) { leiste = leiste.replace('%%DETAIL%%', this._auf && rs.length ? '<div class="inl">' + rows + '</div>' : ''); rows = rs.length ? '' : rows; }

    // Flaeche der markierten Zeile und der Details (v1.31: leicht abgedunkelt, beide gleich fuer den nahtlosen Anschluss)
    const SCC_FL = 'linear-gradient(rgba(0,0,0,.1),rgba(0,0,0,.1)),rgba(127,127,127,.16)';
    /* v1.43 (19.11.2026): Hoehe 1,5 s halten - beim Neuaufbau (Bilder laden neu) sprang die Seite */
    try { const hh = this.getBoundingClientRect().height; if (hh > 0) { this.style.minHeight = Math.ceil(hh) + 'px'; clearTimeout(this._haltT); this._haltT = setTimeout(() => { this.style.minHeight = ''; }, 1500); } } catch (e) { /* egal */ }
    this.shadowRoot.innerHTML = '<style>' +
      ':host{display:block}ha-card{padding:12px 16px}' +
      '.runde{display:flex;flex-wrap:wrap;gap:6px;margin:-2px 0 8px}.kc.rc{font-size:12px;padding:4px 9px;border-radius:8px;background:rgba(127,127,127,.18);color:var(--primary-text-color);gap:6px;white-space:normal;max-width:100%;box-sizing:border-box;line-height:1.25}.kc.rc ha-icon{--mdc-icon-size:16px;flex:none}.rz{display:flex;flex-direction:column;min-width:0}.rz small{font-size:10.5px;opacity:.75;font-weight:400}.kopf{display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap}.titel{flex:1;font-size:16px;font-weight:500}' +
      '.chip{font-size:12px;padding:2px 8px;border-radius:8px;white-space:nowrap}' +
      '.gruen{background:rgba(48,209,88,.2);color:#30d158}.cyan{background:rgba(50,173,230,.22);color:#32ade6}' +
      '.gelb{background:rgba(var(--rgb-warning-color,255,166,0),.18);color:var(--warning-color,#ffa600)}' +
      '.grau{background:rgba(127,127,127,.2);color:var(--secondary-text-color)}.blau{background:#ff453a;color:#fff}.indigo{background:rgba(191,90,242,.22);color:#bf5af2}button.klein{font-size:12px;padding:3px 8px;color:var(--secondary-text-color)}' +
      '.lern{font-size:12px;color:var(--secondary-text-color);margin-bottom:4px}' +
      '.bar{height:4px;background:var(--divider-color);border-radius:2px;margin-bottom:6px}.bar div{height:4px;border-radius:2px;background:#30d158}' +
      '.row{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--divider-color);cursor:pointer}' +
      '.zeit{font-size:13px;color:var(--secondary-text-color);width:40px;flex:none}.txt{flex:1;font-size:14px;min-width:0}' +
      '.mut{color:var(--secondary-text-color)}.pf{--mdc-icon-size:18px}.ok{color:#30d158;--mdc-icon-size:20px}' +
      '.det{padding:0 0 10px}.thumbs{display:flex;gap:6px;margin-bottom:8px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin;padding-bottom:2px}' +
      '.th{position:relative;flex:0 0 calc((100% - 12px) / 3);height:64px;border-radius:6px;overflow:hidden;background:var(--secondary-background-color);cursor:zoom-in;scroll-snap-align:start}' +
      '.th img{width:100%;height:100%;object-fit:cover;display:block}.th .lab{position:absolute;left:3px;bottom:2px;right:3px;font-size:8.5px;line-height:1.1;color:rgba(255,255,255,.88);text-shadow:0 0 2px rgba(0,0,0,.9);display:inline-flex;align-items:center;gap:2px;white-space:nowrap;overflow:hidden}.ri{display:inline-flex;align-items:center;gap:1px;font-weight:400}.ri ha-icon{--mdc-icon-size:12px;display:inline-flex}.th .lab .ri ha-icon{--mdc-icon-size:8px}' +
      '.leer{display:flex;align-items:center;justify-content:center;height:100%;font-size:11px;color:var(--secondary-text-color)}' +
      'img.gross{width:100%;aspect-ratio:16/9;object-fit:contain;background:var(--secondary-background-color);border-radius:8px;margin-bottom:8px;cursor:zoom-out;display:block}' +
      '.info{font-size:12px;color:var(--secondary-text-color);margin-bottom:5px;line-height:1.5}.kc{display:inline-flex;align-items:center;gap:2px;font-size:11px;font-weight:500;padding:0 6px;border-radius:6px;white-space:nowrap;vertical-align:1px}.kc ha-icon{--mdc-icon-size:12px}.info b{font-weight:500;color:var(--primary-text-color)}' +
      '.kc.fc{gap:4px;background:rgba(127,127,127,.18);color:var(--primary-text-color)}.sw{display:inline-block;width:9px;height:9px;border-radius:50%;flex:none;box-shadow:0 0 0 1px rgba(127,127,127,.55)}' +
      '.hinweis{font-size:12px;color:var(--secondary-text-color);margin-top:6px}.pad{padding:10px 0;border-top:1px solid var(--divider-color)}' +
      '.btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}' +
      'button{font:inherit;font-size:13px;padding:6px 10px;border-radius:8px;border:1px solid var(--divider-color);background:transparent;color:var(--primary-text-color);cursor:pointer;display:inline-flex;align-items:center;gap:4px}' +
      'button ha-icon{--mdc-icon-size:16px}button:active{transform:scale(.98)}' +
      '.zl{padding:6px 0 8px;border-top:1px solid var(--divider-color)}' +
      '.seg{display:flex;gap:2px;padding:2px;border-radius:9px;background:rgba(127,127,127,.1);margin:4px 0 8px}.sg{flex:1;display:flex;flex-direction:column;align-items:center;gap:0;border:none;border-radius:7px;padding:4px 6px;background:transparent;color:var(--secondary-text-color);font-size:13px;line-height:1.2}.sg b{font-weight:600}.sg span{font-size:10px}.sg.an{background:rgba(127,127,127,.28);color:var(--primary-text-color)}.sg:disabled{opacity:.4;cursor:default}' +
      '.ts{display:flex;align-items:center;gap:8px;margin:2px 0 8px;font-size:12px;color:var(--secondary-text-color)}.tsl{flex:none}.tsb{flex:1;height:6px;border-radius:3px;background:var(--divider-color);overflow:hidden}.tsf{height:100%;border-radius:3px;background:linear-gradient(90deg,#ff453a,#ff9f0a 45%,#30d158 85%);background-size:calc(100% * 100 / var(--w,100)) 100%}.tsw{font-weight:500;color:var(--primary-text-color);flex:none}.tr{--mdc-icon-size:18px;flex:none}' +
      '.vl{position:relative;padding:2px 0}.vr::before{content:"";position:absolute;left:66px;top:0;bottom:0;width:2px;background:var(--divider-color)}.vl > .vr:first-child::before{top:50%}.vr.letzte::before{bottom:50%}' +
      '.vr{position:relative;display:flex;align-items:center;gap:6px;padding:5px 6px;margin:0 -6px;border-radius:8px;cursor:pointer;min-height:30px}.vr.an{background:' + SCC_FL + '}.vr.sub{min-height:24px;padding-left:24px}.vr.sm{cursor:default;min-height:22px}.vr.kommt{opacity:.5}' +
      '.vz{width:44px;flex:none;font-size:12px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums}.vr.sub .vz{width:26px;font-size:11px}' +
      '.vk{width:22px;flex:none;display:flex;justify-content:center;position:relative;z-index:1}.vt{flex:1;min-width:0;font-size:14px;line-height:1.25}.vt1{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vt2{display:block;font-size:12px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vr.sm .vt{font-size:12px;color:var(--secondary-text-color)}.vch{--mdc-icon-size:18px;color:var(--secondary-text-color)}' +
      '.pk2{position:relative;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff}.pk2 > ha-icon{--mdc-icon-size:14px;display:inline-flex}.pk2.kl2{width:17px;height:17px}.pk2.kl2 > ha-icon{--mdc-icon-size:11px}' +
      '.wb2{position:absolute;left:-6px;top:-6px;width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 0 0 1px rgba(0,0,0,.35)}.wb2 ha-icon{--mdc-icon-size:11px;display:inline-flex}.pk2.kl2 .wb2{width:11px;height:11px;left:-5px;top:-5px}.pk2.kl2 .wb2 ha-icon{--mdc-icon-size:8px}' +
      '.vr.sm .vz{display:flex;align-items:center;gap:2px;color:#ff9f0a}.vr.sm .vz ha-icon{--mdc-icon-size:13px}.vr.sm{min-height:18px;padding-top:2px;padding-bottom:2px}' +
      '.inl{position:relative;z-index:2;margin:0 -6px 8px;padding:6px 10px 2px;border-radius:0 0 10px 10px;background:' + SCC_FL + '}.vr.an:has(+ .inl){border-radius:10px 10px 0 0}.inl .row{border-top:none;padding:2px 0 6px;cursor:default}.inl .txt{font-size:12px;color:var(--secondary-text-color)}.inl .det{padding-bottom:6px}' +
      '.fuss{border-top:1px solid var(--divider-color);padding-top:8px;font-size:12px;color:var(--secondary-text-color)}' +
      '</style><ha-card>' +
      '<div class="kopf"><ha-icon icon="mdi:camera-iris"></ha-icon><span class="titel">Sonnen-Kamera</span>' +
      (eindeutig.length ? '<span class="chip gruen" title="Runden von gestern und heute, in denen Kamera und Einstufung übereinstimmen">' + treffer + ' von ' + eindeutig.length + ' übereinstimmend</span>' : '') +
      (eingriffe ? '<span class="chip cyan" title="Runden, in denen die KI selbst eingegriffen hat (gelernt oder Einstufung übernommen)">' + eingriffe + ' KI-Eingriff' + (eingriffe === 1 ? '' : 'e') + '</span>' : '') +
      (vonDir ? '<span class="chip blau" title="Runden, die du selbst bewertet hast">' + vonDir + ' von dir</span>' : '') +
      '</div><div class="runde">' + this._kamChips() + '</div>' + balken +
      (frei
        ? '<div class="lern">Kamera kalibriert selbstständig mit vollem Gewicht · unklare Runden werden nach 3 Min. wiederholt</div>'
        : '<div class="lern">Kamera-Lernen: ' + Math.min(nb, SCC_ZIEL) + ' von ' + SCC_ZIEL + ' bewertet' + (nb ? ' · Kamera ' + quote + ' % richtig (nötig 80 %)' : '') + ' · Sonnenfall ' + (sonnenfall ? 'bestätigt' : 'fehlt noch') + '</div><div class="bar"><div style="width:' + Math.round(Math.min(nb, SCC_ZIEL) / SCC_ZIEL * 100) + '%"></div></div>') +
      (leiste ? '<div class="zl">' + leiste + '</div>' : '') +
      rows +
      '</ha-card>';

    this.shadowRoot.querySelectorAll('[data-act]').forEach((el) => {
      el.addEventListener('click', (ev) => { ev.stopPropagation(); this._klick(el.dataset); });
    });
  }

  async _klick(d) {
    const id = d.id;
    if (d.act === 'tg') {
      this._auf = !this._auf;
      this._render();
    } else if (d.act === 'grp') {
      if (this._gx.has(id)) this._gx.delete(id); else this._gx.add(id);
      this._render();
    } else if (d.act === 'pt') {
      if (this._sel === id && this._auf) { this._auf = false; this._render(); return; }
      this._sel = id;
      this._manuell = id !== (this._rounds[0] && this._rounds[0].id);
      this._auf = true;
      this._render();
    } else if (d.act === 'tag') {
      this._tag = d.t;
      const heute = new Date().toDateString();
      const liste = this._rounds.filter((r) => (new Date(r.t).toDateString() === heute) === (d.t === 'Heute'));
      if (liste.length) { this._sel = liste[0].id; this._manuell = this._sel !== (this._rounds[0] && this._rounds[0].id); }
      this._render();
    } else if (d.act === 'gross') {
      this._gross[id] = this._gross[id] === d.v ? null : d.v;
      this._render();
    } else if (d.act === 'beide') {
      this._wahl.add(id);
      this._render();
    } else if (d.act === 'kor2') {
      if (this._urteile[id] || this._lokal[id]) return;
      const rr = this._rounds.find((x) => x.id === id);
      if (!rr) return;
      const grp = (x) => (!x ? '' : x.startsWith('Teilweise') ? 'Teilweise' : (['Sonnig', 'Sehr sonnig', 'Außergewöhnlich sonnig'].includes(x) ? 'Sonnig' : x));
      const wahl = grp(d.k);
      let urteil;
      if (rr.s === 'widerspruch' && wahl === rr.k) urteil = 'kamera';
      else if (wahl === grp(rr.e)) urteil = 'einstufung';
      else urteil = (rr.s === 'unklar' || rr.s === 'ausfall') ? 'manuell' : 'beide';
      const daten = { id: id, urteil: urteil, kamera_klasse: rr.k, einstufung: rr.e, elevation: rr.el, zeit: rr.t };
      if (urteil !== 'kamera' && rr.kx) daten.kontext = rr.kx;
      if (urteil === 'beide' || urteil === 'manuell') daten.korrektur = d.k;
      this._lokal[id] = { id: id, u: daten.urteil, kor: d.k || '' };
      this._urteile[id] = this._lokal[id];
      this._wahl.delete(id);
      this._open.delete(id);
      this._render();
      try { await this._hass.callService('script', 'sonnen_cam_bewertung', daten); } catch (e) { delete this._lokal[id]; delete this._urteile[id]; this._render(); }
      setTimeout(() => this._load(), 2000);
    }
  }
}

if (!customElements.get('elmo-sonnen-cam-card')) {
  customElements.define('elmo-sonnen-cam-card', ElmoSonnenCamCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'elmo-sonnen-cam-card', name: 'ELMO Sonnen-Kamera', description: 'Kamera-Abgleich der Sonnenklassifikation mit nachträglicher Bewertung' });
}
