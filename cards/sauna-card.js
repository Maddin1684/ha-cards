// sauna-card v1.9 (26.11.2026): Duftrichtung Fichtenessenz ergaenzt; Zeilen wie Wetterstation (oben buendig, 40 px, Werte auf Hoehe der ersten Namenszeile).
// v1.8 (26.11.2026): Sauna-Kuebel als Symbol bei 'Heute', Aufguss wieder mit Wassertropfen.
// v1.7 (26.11.2026): bei 'Kein Aufguss' wieder das durchgestrichene Tropfen-Symbol statt Kuebel.
// v1.6 (26.11.2026): Sauna-Kuebel (phu:sauna-bucket) als Symbol des Bereichs Aufguss.
// v1.5 (26.11.2026): Orange ueberall Martins #f56300 (Gaenge, Heizen, Aufheiz-Symbol, gewaehlter Aufguss).
// v1.4 (26.11.2026): Apple-Orange fuer Gaenge; beim Aufheizen eigene Zeile mit animiertem Pfeil-Symbol, Restzeit und Fortschrittsbalken; Zielmarke entfernt, Hoechstwert direkt in der Kurve; Abkuehlpause mit sich fuellendem Glas, laufender Gang pulsiert; Symbole wie in der Originalkarte.
// v1.3 (26.11.2026): Aufguss mit Duftrichtung statt Hinweistext; Kurve bei kalter Sauna eng skaliert (Verlauf sichtbar statt flacher Linie bei 0), ohne Zielmarke.
// v1.2 (26.11.2026): Ziel 80 °C; Kurve hoeher, Aufguss-Bild dahinter weniger beschnitten (Text oben sichtbar); Aufguss-Kacheln ohne grauen Rand; Hinweis auch, wenn der Praesenzmelder nicht verfuegbar ist.
// v1.1 (26.11.2026): Aufguss-Kacheln im Format der Originalkarte (100 x 66, Bild oben buendig, nicht mehr abgeschnitten); Heiz-Symbol (pressure-high) neben dem Titel, solange die Sauna heizt.
// v1.0 (26.11.2026): Sauna als aufklappbare Liste im Stil der Wetterstation – Jetzt (Temperatur mit Kurve, Gaenge als orange Felder, Zielmarke;
// klappt beim Heizen/Saunieren selbst auf), aktueller Gang, Heute (Ablauf Gang/Pause, Gaenge, Saunazeit), Aufguss (gewaehlter Aufguss, aufgeklappt alle als Bildkacheln),
// Licht und Ambiente, Saison (Saunatage, letzte Sauna). Hinweis, wenn der Praesenzmelder ausfaellt.
// Konfiguration (alles optional): title, ziel (Zieltemperatur, Standard 80), entities: { ... } zum Ueberschreiben der Standard-Entitaeten.
(() => {
  const TAG = 'sauna-card';
  if (customElements.get(TAG)) return;
  const C = { green: '#30d158', yellow: '#ffd60a', orange: '#f56300', red: '#ff453a', blue: '#0a84ff', gang: '#f56300' }; // Orange = Martins Orange #f56300
  const DEF = {
    temp: 'sensor.saunatemp_sauna', heizt: 'binary_sensor.sauna_heizt', aufheiz: 'sensor.sauna_aufheizzeit', test: 'input_boolean.sauna_prognose_test',
    gang_aktiv: 'input_boolean.sauna_gang_aktiv', gang_start: 'input_text.sauna_aktueller_gang_start', gang_dauer: 'sensor.sauna_gang_dauer',
    session: 'input_boolean.saunazeit', ablauf: 'input_text.sauna_ablauf_heute', gaenge: 'counter.sauna_gange_heute', zeit: 'sensor.saunazeit_heute',
    aufguss: 'input_select.sauna_aufguss_hintergrund', bank: 'light.cob_strip_sauna', lampe: 'light.sauna', ambiente: 'input_select.ambiente',
    tage: 'counter.uber20', letzte: 'sensor.letzte_sauna', melder_offline: 'binary_sensor.prasenzmelder_sauna_offline', melder: 'binary_sensor.prasenzmelder_sauna_presence',
  };
  const BILD = { 'Johannisbeere': 'johannisbeere', 'Sanibel': 'sanibel', 'Süße Wüstenbrise': 'wuestenbrise', '1001 Nacht': '1001nacht', 'Ruhequelle': 'ruhequelle', 'Wohlfühlzauber': 'wohlfuehlzauber',
    'Quartett der Sinne': 'quartettdersinne', 'Alpenkräuter Symphonie': 'alpenkraeuter', 'Frischekick': 'frischekick', 'Tropenmelodie': 'tropenmelodie', 'Sommerwald': 'sommerwald',
    'Fichtenessenz': 'fichtenessenz', 'Russische Banja': 'banja', 'Lappland': 'lappland', 'Waldsauna': 'waldsauna', 'Wellness': 'wellness', 'Waldbeere': 'waldbeere',
    'Frostiger Beerenzauber': 'frostigerbeerenzauber', 'Eisminze': 'eisminze', 'Herbal Setri': 'herbalsetri', 'Höllenfeuer': 'hoellenfeuer', 'Maracuja': 'maracuja', 'Blutorange': 'blutorange', 'Zitrone-Orange': 'zitroneorange' };
  // Duftrichtung der Aufguesse (aus dem Popup 'Sauna Aufguesse')
  const DUFT = { 'Russische Banja': 'Zedernholz, Menthol, Latschenkiefer, Eukalyptus', 'Lappland': 'Pinie, Tannenöl, Menthol', 'Waldsauna': 'Fichtennadel, Latschenkiefer', 'Wellness': 'Melisse, Lemongrass',
    'Waldbeere': 'Waldfrüchte, Menthol', 'Frostiger Beerenzauber': 'Menthol, Brombeere, Erdbeere, Heidelbeere', 'Eisminze': 'Gletschereis, Menthol, Pfefferminze', 'Herbal Setri': 'Alpenkräuter, Zitrone, Zedernholz',
    'Höllenfeuer': 'Eukalyptus, Japanische Pfefferminze, Birke, Wacholder, Myrte, Zedernholz, Zitrone', 'Maracuja': 'Maracuja', 'Blutorange': 'Blutorange', 'Zitrone-Orange': 'Zitrone, Orange', 'Johannisbeere': 'Johannisbeere',
    'Sanibel': 'Zitrone, Limette, Menthol', 'Süße Wüstenbrise': 'Pfirsichblüten, Waldhonig', '1001 Nacht': 'Zeder, Patschuli, Zitrone, Eukalyptus', 'Ruhequelle': 'Lavendel, Mandarine, Zeder', 'Wohlfühlzauber': 'Lavendel, Orange',
    'Quartett der Sinne': 'Lavendel, Eukalyptus, Johannisbeere, Zeder', 'Alpenkräuter Symphonie': 'Alpenkräuter-Mix', 'Frischekick': 'Zitrone, Limette, Minze, Menthol', 'Tropenmelodie': 'Kiwi, Passionsfrucht', 'Sommerwald': 'Zitrone, Brombeere', 'Fichtenessenz': 'Fichtennadel' };
  const img = (o) => (BILD[o] ? `/local/sauna/${BILD[o]}.png` : '');

  const CSS = `
    :host { display:block; }
    ha-card { padding:4px 0 8px; overflow:hidden; }
    .hd .hz { height:44px; width:44px; vertical-align:middle; margin:-6px 0 0 8px; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 4px; color:var(--ha-card-header-color, var(--primary-text-color)); }
    .fold { padding:0 16px; }
    .fh { display:flex; align-items:center; gap:16px; height:44px; cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; border-bottom:0.5px solid var(--divider-color, rgba(128,128,128,.3)); margin-bottom:4px; }
    .fold + .fold .fh { margin-top:8px; }
    .fh .ft { flex:0 0 28px; width:28px; height:28px; border-radius:7px; background:rgba(118,118,128,.28); display:flex; align-items:center; justify-content:center; }
    .fh .ft ha-icon { --mdc-icon-size:20px; color:#fff; display:flex; }
    .fh .lbl { flex:1; font-weight:500; font-size:14px; text-transform:uppercase; letter-spacing:.04em; color:var(--primary-text-color); }
    .fh .fx { font-size:11px; color:var(--secondary-text-color); }
    .fh .fx::after { content:'Einklappen'; }
    .fold.closed .fh .fx::after { content:'Anzeigen'; }
    .fb { display:grid; grid-template-rows:1fr; transition:grid-template-rows .3s ease; }
    .fold.closed .fb { grid-template-rows:0fr; }
    .fi { overflow:hidden; min-height:0; margin:0 -8px; }
    .r { display:flex; flex-wrap:wrap; align-items:flex-start; min-height:40px; column-gap:16px; padding:0 8px; margin-bottom:4px; border-radius:10px; background:rgba(118,118,128,.12); cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .fi > .r:last-child, .fi > .wn:last-child { margin-bottom:8px; }
    .bd { flex:0 0 28px; width:28px; height:40px; display:flex; align-items:center; justify-content:center; }
    .bd ha-icon { --mdc-icon-size:24px; color:var(--state-icon-color, var(--paper-item-icon-color, #44739e)); display:inline-flex; }
    .bd .th { width:28px; height:28px; border-radius:7px; background:rgba(118,118,128,.3) center/cover no-repeat; }
    .nm { flex:1; min-width:0; font-size:14px; line-height:1.3; padding:10px 0; color:var(--primary-text-color); }
    .nm .sec { display:block; font-size:12px; color:var(--secondary-text-color); line-height:1.35; }
    .r > .st { padding-top:10px; }
    .st { font-size:14px; line-height:1.3; color:var(--primary-text-color); text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }
    .st small { font-size:12px; color:var(--secondary-text-color); margin-left:2px; }
    .pw { display:block; text-align:right; margin:3px -1px -2px 0; line-height:0; }
    .pc { display:inline-flex; color:var(--secondary-text-color); opacity:.7; }
    .pc ha-icon { --mdc-icon-size:13px; display:flex; }
    .pc .m, .r.open .pc .p { display:none !important; }
    .r.open .pc .m { display:flex !important; }
    .ex { flex:0 0 100%; display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; }
    .r.open .ex { grid-template-rows:1fr; }
    .ex > div { overflow:hidden; min-height:0; }
    .ch { position:relative; margin:2px 0 4px; border-radius:8px; overflow:hidden; }
    .ch .bg { position:absolute; inset:0; background:25% 18%/cover no-repeat; opacity:.42; }
    .ch svg { position:relative; display:block; width:100%; height:auto; }
    .ci { display:flex; justify-content:space-between; gap:8px; font-size:11px; color:var(--secondary-text-color); padding:0 0 10px; }
    .bar { display:flex; gap:2px; height:8px; border-radius:4px; overflow:hidden; margin-top:2px; }
    .bar i { display:block; height:100%; }
    .ab { flex:0 0 100%; padding:6px 0 4px; }
    .ab .lg { display:flex; justify-content:space-between; font-size:11px; color:var(--secondary-text-color); margin-top:5px; }
    .tl { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; padding:4px 0 10px; }
    .tl::-webkit-scrollbar { display:none; }
    .tl button { flex:0 0 100px; border:0; padding:0; background:none; font:inherit; font-size:11px; line-height:1.2; color:var(--secondary-text-color); text-align:center; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .tl button i { display:block; width:100px; height:66px; border-radius:12px; margin-bottom:4px; background:center top/cover no-repeat; background-clip:padding-box; box-sizing:border-box; border:2px solid transparent; }
    .tl button i.no { background-color:rgba(118,118,128,.24); }
    .tl button.on i { border-color:${C.orange}; }
    .tl button.on { color:var(--primary-text-color); }
    .tl button i ha-icon { --mdc-icon-size:22px; display:flex; height:100%; align-items:center; justify-content:center; color:var(--secondary-text-color); }
    .r > .seg, .r > .pg, .r > .ab, .r > .ex { align-self:stretch; }
    .seg { flex:0 0 100%; display:flex; padding:2px; border-radius:9px; background:rgba(118,118,128,.12); margin:0 0 10px; }
    .seg button { flex:1; border:0; background:none; color:var(--secondary-text-color); font:inherit; font-size:12px; padding:5px 2px; border-radius:7px; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .seg button.on { background:rgba(118,118,128,.26); color:var(--primary-text-color); }
    .wn { border-radius:10px; padding:7px 10px; margin-bottom:4px; font-size:12px; line-height:1.35; display:flex; gap:8px; align-items:center; color:${C.red}; background:rgba(255,69,58,.14); }
    @keyframes sacup { 0% { transform:translateY(5px); opacity:0; } 50% { opacity:1; } 100% { transform:translateY(0); opacity:1; } }
    .a-up { animation:sacup 1.4s ease-in-out infinite; }
    @keyframes sacfill { 0% { clip-path:inset(100% 0 0 0); } 60%, 100% { clip-path:inset(0 0 0 0); } }
    .a-fill { animation:sacfill 2.4s ease-in-out infinite; }
    @keyframes sacpulse { 0%, 100% { opacity:1; } 50% { opacity:.45; } }
    .a-pulse { animation:sacpulse 2s ease-in-out infinite; }
    .pg { flex:0 0 100%; height:6px; border-radius:3px; background:rgba(118,118,128,.3); overflow:hidden; margin:-4px 0 10px; }
    .pg i { display:block; height:100%; border-radius:3px; transition:width .6s; }
    .wn ha-icon { --mdc-icon-size:16px; flex:0 0 16px; display:flex; }
  `;

  const morph = (a, b) => {
    const an = Array.from(a.childNodes), bn = Array.from(b.childNodes);
    bn.forEach((y, i) => {
      const x = an[i];
      if (!x) { a.appendChild(y); return; }
      if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName) { a.replaceChild(y, x); return; }
      if (x.nodeType !== 1) { if (x.nodeValue !== y.nodeValue) x.nodeValue = y.nodeValue; return; }
      if (x.localName === 'ha-icon' && (x.getAttribute('style') !== y.getAttribute('style') || x.getAttribute('class') !== y.getAttribute('class'))) { a.replaceChild(y, x); return; }
      if (!x.localName.includes('-')) Array.from(x.attributes).forEach((at) => { if (!y.hasAttribute(at.name)) x.removeAttribute(at.name); });
      Array.from(y.attributes).forEach((at) => { if (x.getAttribute(at.name) !== at.value) x.setAttribute(at.name, at.value); });
      morph(x, y);
    });
    for (let i = an.length - 1; i >= bn.length; i--) a.removeChild(an[i]);
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const num = (v, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const fmt = (v, d = 1) => num(v).toFixed(d).replace('.', ',');
  const hhmm = (dt) => String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
  const ok = (v) => v != null && !['', 'unknown', 'unavailable'].includes(v);
  const ico = (icon, col = '', cls = '') => `<ha-icon icon="${icon}"${cls ? ` class="${cls}"` : ''}${col ? ` style="color:${col}"` : ''}></ha-icon>`;
  const PM = '<span class="pw"><span class="pc"><ha-icon class="p" icon="mdi:plus-circle-outline"></ha-icon><ha-icon class="m" icon="mdi:minus-circle-outline"></ha-icon></span></span>';

  class SaunaCard extends HTMLElement {
    setConfig(c) {
      this._c = c || {}; this._e = Object.assign({}, DEF, this._c.entities || {}); this._sig = '';
      try { this._open = JSON.parse(localStorage.getItem('sac-open') || 'null') || {}; } catch (e) { this._open = {}; }
    }
    getCardSize() { return 10; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    connectedCallback() { this._iv = setInterval(() => { this._sig = ''; this._render(); }, 60000); }
    disconnectedCallback() { clearInterval(this._iv); }
    set hass(h) { this._hass = h; this._render(); }
    _s(k) { const id = this._e[k]; return id ? this._hass.states[id] : undefined; }
    _v(k) { const s = this._s(k); return s ? s.state : ''; }
    _on(k) { return this._v(k) === 'on'; }

    _render() {
      const H = this._hass; if (!H || !this._c) return;
      const sig = Object.values(this._e).map((id) => { const s = H.states[id]; return s ? s.state + '|' + (s.last_changed || '') + '|' + ((s.attributes || {}).brightness || '') : '-'; }).join(';') + '|' + new Date().getMinutes() + '|' + (this._histAt || 0);
      if (sig === this._sig) return; this._sig = sig;
      try {
        const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
        if (!root.querySelector('ha-card')) { root.innerHTML = `<style>${CSS}</style><ha-card></ha-card>`; root.querySelector('ha-card').addEventListener('click', (ev) => this._click(ev)); }
        if (this._chartOpen()) this._hist();
        const html = this._html();
        if (html !== this._last) { const t = document.createElement('template'); t.innerHTML = html; morph(root.querySelector('ha-card'), t.content); this._last = html; }
      } catch (e) { console.error(TAG, e); (this.shadowRoot || this.attachShadow({ mode: 'open' })).innerHTML = `<ha-card style="padding:12px;color:#ff453a">${TAG} Fehler: ${esc(e && e.message || e)}</ha-card>`; }
    }

    // Kurve: Verlauf holen (alle 2 Minuten, solange die Kurve offen ist)
    async _hist() {
      if (this._hBusy || Date.now() - (this._hTry || 0) < 120000) return;
      this._hBusy = true; this._hTry = Date.now();
      try {
        const id = this._e.temp, r = await this._hass.callWS({ type: 'history/history_during_period', start_time: new Date(Date.now() - 8 * 3600000).toISOString(), entity_ids: [id], minimal_response: true, no_attributes: true, significant_changes_only: false });
        this._pts = ((r && r[id]) || []).map((x) => [(x.lu || x.lc) * 1000, parseFloat(x.s)]).filter((x) => !isNaN(x[1]));
        this._histAt = Date.now(); this._sig = ''; this._render();
      } catch (e) { /* kein Verlauf */ }
      this._hBusy = false;
    }
    _active() { return this._on('heizt') || this._on('test') || this._on('session') || this._on('gang_aktiv') || num(this._v('temp')) >= 50; }
    _chartOpen() { return this._chartMan != null ? this._chartMan : this._active(); }

    // Gaenge heute aus 'HH:MM-HH:MM;...' plus laufender Gang -> [[start, ende, live], ...] als Zeitstempel
    _gangs() {
      const raw = String(this._v('ablauf')).trim(), now = new Date(), d0 = new Date(now); d0.setHours(0, 0, 0, 0);
      const at = (s) => { const [h, m] = s.split(':').map(Number); return +d0 + (h * 60 + m) * 60000; };
      const g = ok(raw) ? raw.split(';').filter((x) => x.includes('-')).map((x) => { const [a, b] = x.split('-'); let s = at(a), e = at(b); if (e < s) e += 86400000; return [s, e, false]; }) : [];
      const cs = this._v('gang_start');
      if (this._on('gang_aktiv') && ok(cs) && !isNaN(Date.parse(cs))) g.push([Date.parse(cs), Date.now(), true]);
      return g;
    }

    _chart() {
      const pts = (this._pts || []).slice(), cur = num(this._v('temp')), now = Date.now(), ziel = num(this._c.ziel, 80);
      pts.push([now, cur]);
      if (pts.length < 3) return '<div class="ci"><span>Verlauf wird geladen …</span></div>';
      // Zeitfenster: ab etwa 20 min vor dem Aufheizen (erster Wert deutlich ueber dem Tiefststand), mindestens 90 min, hoechstens 8 h
      const lo = Math.min(...pts.map((p) => p[1])), rise = pts.find((p) => p[1] > lo + 5);
      let t0 = rise ? rise[0] - 20 * 60000 : now - 3 * 3600000; t0 = Math.max(now - 8 * 3600000, Math.min(t0, now - 90 * 60000));
      const P = pts.filter((p) => p[0] >= t0); const pre = pts.filter((p) => p[0] < t0).pop(); if (pre) P.unshift([t0, pre[1]]);
      const vmin = Math.min(...P.map((p) => p[1])), vmax = Math.max(...P.map((p) => p[1])), kalt = vmax < 40;
      // kalt (Sauna aus): Achse eng um die Werte, damit man den Verlauf sieht; sonst 0 bis Ziel + 10
      const stp = kalt ? [0.5, 1, 2, 5, 10].find((q) => (vmax - vmin + 2) / q <= 5) || 10 : 20;
      const W = 300, Hh = 150, top = 8, bot = 134, ymin = kalt ? Math.floor(vmin / stp) * stp - stp : Math.min(0, Math.floor(vmin / 10) * 10), ymax = kalt ? Math.ceil(vmax / stp) * stp + stp : Math.max(ziel + 10, Math.ceil(vmax / 10) * 10);
      const X = (t) => (t - t0) / (now - t0) * W, Y = (v) => bot - (v - ymin) / (ymax - ymin) * (bot - top), f = (v) => v.toFixed(1);
      let d = ''; P.forEach(([t, v], i) => { d += (i ? 'L' : 'M') + f(X(t)) + ',' + f(Y(v)); });
      const col = kalt ? 'rgba(235,235,245,.85)' : cur >= 80 ? C.red : C.orange;
      let s = `<svg viewBox="0 0 ${W} ${Hh + 14}"><defs><linearGradient id="sacf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>`;
      // Gaenge als orange Felder mit Nummer
      this._gangs().forEach(([a, b, live], i) => { if (b < t0) return; const x1 = X(Math.max(a, t0)), x2 = X(Math.min(b, now));
        s += `<rect x="${f(x1)}" y="${top - 2}" width="${f(Math.max(1.5, x2 - x1))}" height="${bot - top + 2}" fill="${C.gang}" opacity="${live ? 0.1 : 0.16}"/><text x="${f((x1 + x2) / 2)}" y="${top + 6}" text-anchor="middle" font-size="9" fill="${C.gang}">${i + 1}</text>`; });
      for (let v = Math.ceil(ymin / stp) * stp; v <= ymax + 1e-9; v += stp) s += `<line x1="0" x2="${W}" y1="${f(Y(v))}" y2="${f(Y(v))}" stroke="rgba(235,235,245,.1)" stroke-width=".6"/><text x="2" y="${f(Y(v) - 2)}" font-size="9" fill="rgba(235,235,245,.45)">${stp < 1 ? fmt(v) : Math.round(v)}°</text>`;
      s += `<path d="${d}L${f(X(now))},${bot}L0,${bot}Z" fill="url(#sacf)"/><path d="${d}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${f(X(now))}" cy="${f(Y(cur))}" r="3" fill="${col}"/>`;
      const span = now - t0, step = span > 4 * 3600000 ? 7200000 : span > 2 * 3600000 ? 3600000 : 1800000;
      for (let t = Math.ceil(t0 / step) * step; t < now - span * 0.12; t += step) if (X(t) > 14) s += `<text x="${f(X(t))}" y="${Hh + 10}" text-anchor="middle" font-size="9" fill="rgba(235,235,245,.5)">${hhmm(new Date(t))}</text>`;
      s += `<text x="${W}" y="${Hh + 10}" text-anchor="end" font-size="9" fill="rgba(235,235,245,.5)">jetzt</text></svg>`;
      // Hoechstwert und Aufheizdauer (bis zum ersten Erreichen des Ziels)
      const mx = P.reduce((m, p) => (p[1] > m[1] ? p : m), P[0]), hit = !kalt && rise && P.find((p) => p[0] >= rise[0] && p[1] >= ziel);
      { const mxX = X(mx[0]), mxY = Y(mx[1]), an = mxX > W - 40 ? 'end' : mxX < 30 ? 'start' : 'middle';
        s = s.replace(/<\/svg>$/, `<circle cx="${f(mxX)}" cy="${f(mxY)}" r="2.4" fill="#fff"/><text x="${f(mxX + (an === 'end' ? -4 : an === 'start' ? 4 : 0))}" y="${f(Math.max(9, mxY - 6))}" text-anchor="${an}" font-size="10" fill="#fff">max. ${fmt(mx[1])}°</text></svg>`); }
      const info = `<div class="ci"><span>max. um ${hhmm(new Date(mx[0]))}</span>${hit ? `<span>aufgeheizt in ${Math.round((hit[0] - rise[0]) / 60000)} min</span>` : ''}</div>`;
      const bg = img(this._v('aufguss'));
      return `<div class="ch">${bg ? `<div class="bg" style="background-image:url('${bg}')"></div>` : ''}${s}</div>${info}`;
    }

    _row(ent, badge, name, right, extra = '', attrs = '') {
      return `<div class="r${extra}" ${attrs || `data-more="${esc(ent)}"`}><div class="bd">${badge}</div><div class="nm">${name}</div>${right}</div>`;
    }
    _fold(id, label, icon, rows) {
      if (!rows) return '';
      return `<div class="fold${this._open[id] === 'zu' ? ' closed' : ''}" data-id="${id}"><div class="fh"><span class="ft">${ico(icon)}</span><span class="lbl">${label}</span><span class="fx"></span></div><div class="fb"><div class="fi">${rows}</div></div></div>`;
    }

    _html() {
      const E = this._e, out = [];
      const t = num(this._v('temp')), heizt = this._on('heizt') || this._on('test'), active = this._active();
      if (this._c.title !== false) out.push(`<div class="hd">${esc(this._c.title || 'Sauna')}${heizt ? `<img class="hz" src="${esc(this._c.heiz_icon || '/local/icons2/pressure-high.svg')}" alt="heizt">` : ''}</div>`);

      /* ---------- Jetzt ---------- */
      let jetzt = '';
      const mv = this._v('melder'), mo = this._on('melder_offline') || (this._s('melder') && ['unavailable', 'unknown'].includes(mv));
      if (mo) jetzt += `<div class="wn">${ico('mdi:access-point-network-off')}<span><b>Präsenzmelder offline</b> · Gänge werden nicht erkannt</span></div>`;
      const az = this._v('aufheiz'), m = /^(\d+)\s*Minuten?\s*\((\d{1,2}:\d{2})\)/.exec(az);
      const reached = /erreicht/i.test(az) || (heizt && t >= num(this._c.ziel, 80));
      const sub = reached && (heizt || t >= 40) ? 'Temperatur erreicht' : heizt ? 'heizt' : t >= 40 ? 'kühlt ab' : 'aus';
      const tc = t >= 80 ? C.red : heizt || t >= 40 ? C.orange : '';
      const open = this._chartOpen();
      jetzt += this._row(E.temp, ico('mdi:thermometer', tc), `Temperatur<span class="sec"${sub === 'Temperatur erreicht' ? ` style="color:${C.green}"` : ''}>${esc(sub)}</span>`,
        `<div class="st"><span${tc ? ` style="color:${tc}"` : ''}>${fmt(t)}</span><small>°C</small>${PM}</div><div class="ex"><div>${open || this._chartHad ? this._chart() : ''}</div></div>`,
        open ? ' open' : '', 'data-chart="1"');
      if (open) this._chartHad = true;
      // Aufheizen: Restzeit mit animiertem Pfeil-Symbol und Fortschrittsbalken (Farbverlauf gruen - gelb - rot wie bisher)
      if (heizt && !reached) {
        const ziel = num(this._c.ziel, 80), pts = this._pts || [], lo = pts.length ? Math.min(...pts.filter((p) => p[0] > Date.now() - 4 * 3600000).map((p) => p[1]).concat([t])) : Math.min(t, 0);
        const pr = Math.max(0, Math.min(100, (t - lo) / Math.max(1, ziel - lo) * 100)), w = Math.max(1, pr);
        jetzt += this._row(E.aufheiz, ico('mdi:sort-clock-descending', C.orange, 'a-up'), `Aufheizzeit${m ? `<span class="sec">bereit um ${m[2]}</span>` : ''}`,
          `<div class="st">${m ? `${m[1]} <small>min</small>` : esc(az)}</div><div class="pg"><i style="width:${w.toFixed(1)}%;background:linear-gradient(90deg,${C.green} 0%,${C.yellow} 50%,${C.red} 100%);background-size:${(10000 / w).toFixed(1)}% 100%"></i></div>`);
      }
      const gd = this._v('gang_dauer'), gm = /^(\d+)\.\s*Gang\D*(\d+)/.exec(gd), pm = /^Abkühlpause\D*(\d+)/.exec(gd);
      if (gm || pm || this._on('gang_aktiv')) jetzt += this._row(E.gang_dauer, ico(pm ? 'mdi:cup-water' : 'mdi:timer-play-outline', pm ? C.blue : C.gang, pm ? 'a-fill' : 'a-pulse'), pm ? 'Abkühlpause' : 'Aktueller Gang',
        `<div class="st" style="color:${pm ? C.blue : C.gang}">${gm ? `Gang ${gm[1]} · ${gm[2]} min` : pm ? `${pm[1]} min` : esc(gd)}</div>`);
      out.push(this._fold('jetzt', 'Jetzt', 'mdi:fire', jetzt));

      /* ---------- Heute ---------- */
      const G = this._gangs(), gn = num(this._v('gaenge')), zt = this._v('zeit');
      if (G.length || gn > 0 || this._on('session')) {
        let heute = '';
        if (G.length) {
          const blocks = []; G.forEach((g, i) => { if (i > 0 && g[0] > G[i - 1][1]) blocks.push(['p', G[i - 1][1], g[0], false]); blocks.push(['g', g[0], g[1], g[2]]); });
          const last = G[G.length - 1]; if (!last[2] && this._on('session')) blocks.push(['p', last[1], Date.now(), true]);
          let gs = 0, ps = 0; const tot = blocks.reduce((a, b) => a + Math.max(b[2] - b[1], 60000), 0);
          const bar = blocks.map(([k, a, b, live]) => { const d = Math.max(0, Math.round((b - a) / 60000)); if (k === 'g') gs += d; else ps += d;
            return `<i style="flex:${(Math.max(b - a, 60000) / tot * 100).toFixed(2)};background:${k === 'g' ? C.gang : C.blue};opacity:${live ? 0.55 : 1}"></i>`; }).join('');
          heute += `<div class="r" data-more="${esc(E.ablauf)}"><div class="ab"><div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px"><span>Ablauf</span><span style="font-size:12px;color:var(--secondary-text-color)">seit ${hhmm(new Date(G[0][0]))}</span></div>
            <div class="bar">${bar}</div><div class="lg"><span><span style="color:${C.gang}">●</span> ${gs} min Gang · <span style="color:${C.blue}">●</span> ${ps} min Pause</span><span>${this._on('session') || last[2] ? 'jetzt' : hhmm(new Date(blocks[blocks.length - 1][2]))}</span></div></div></div>`;
        }
        heute += this._row(E.gaenge, ico('fas:person-walking-arrow-right'), 'Saunagänge', `<div class="st">${gn}</div>`);
        if (ok(zt) && zt !== 'nicht gestartet') heute += this._row(E.zeit, ico('mdi:timer-sand'), 'Saunazeit', `<div class="st">${esc(zt.replace(/Stunden?/, 'h').replace(/Minuten?/, 'min'))}</div>`);
        out.push(this._fold('heute', 'Heute', 'phu:sauna-bucket', heute));
      }

      /* ---------- Aufguss ---------- */
      const as = this._s('aufguss');
      if (as) {
        const cur = as.state, opts = (as.attributes.options || []), aOpen = this._aufMan != null ? this._aufMan : false, b = img(cur);
        const tiles = opts.map((o) => `<button class="${o === cur ? 'on' : ''}" data-aufguss="${esc(o)}"><i${img(o) ? ` style="background-image:url('${img(o)}')"` : ' class="no"'}>${img(o) ? '' : ico('mdi:cancel')}</i>${esc(o || 'Kein')}</button>`).join('');
        out.push(this._fold('aufguss', 'Aufguss', 'mdi:water-outline',
          this._row(E.aufguss, b ? `<span class="th" style="background-image:url('${b}')"></span>` : ico('mdi:water-off-outline'), `${esc(cur || 'Kein Aufguss')}<span class="sec">${cur ? esc(DUFT[cur] || '') : 'antippen zum Auswählen'}</span>`,
            `<div class="st">${PM}</div><div class="ex"><div><div class="tl">${tiles}</div></div></div>`, aOpen ? ' open' : '', 'data-auf="1"')));
      }

      /* ---------- Licht und Ambiente ---------- */
      let licht = '';
      [['bank', 'LED Bankbeleuchtung', 'phu:light-strip'], ['lampe', 'Lampe', 'mdi:bulkhead-light']].forEach(([k, n, ic]) => {
        const s = this._s(k); if (!s) return; const on = s.state === 'on', br = on && s.attributes.brightness != null ? Math.round(s.attributes.brightness / 2.55) + ' %' : on ? 'an' : 'aus';
        licht += this._row(E[k], ico(ic, on ? C.yellow : ''), n, `<div class="st"${on ? '' : ' style="color:var(--secondary-text-color)"'}>${br}</div>`, '', `data-toggle="${esc(E[k])}"`);
      });
      const am = this._s('ambiente');
      if (am) licht += `<div class="r" data-more="${esc(E.ambiente)}"><div class="bd">${ico('phu:twinkly-spritzer')}</div><div class="nm">Ambiente</div><div class="seg">${(am.attributes.options || []).map((o) => `<button class="${o === am.state ? 'on' : ''}" data-amb="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
      out.push(this._fold('licht', 'Licht und Ambiente', 'mdi:lightbulb-outline', licht));

      /* ---------- Saison ---------- */
      const ts = this._s('tage'), le = this._v('letzte');
      if (ts) out.push(this._fold('saison', 'Saison ' + new Date().getFullYear(), 'mdi:chart-bar',
        this._row(E.tage, ico('mdi:home-roof'), `Saunatage${ok(le) ? `<span class="sec">letzte Sauna ${esc(le)}</span>` : ''}`, `<div class="st">${esc(ts.state)}</div>`)));
      return out.join('');
    }

    _click(ev) {
      const H = this._hass, fh = ev.target.closest('.fh');
      if (fh) { const f = fh.parentElement; f.classList.toggle('closed'); this._open[f.dataset.id] = f.classList.contains('closed') ? 'zu' : 'auf'; try { localStorage.setItem('sac-open', JSON.stringify(this._open)); } catch (e) {} return; }
      const au = ev.target.closest('[data-aufguss]'); if (au) { H.callService('input_select', 'select_option', { entity_id: this._e.aufguss, option: au.dataset.aufguss }); return; }
      const amb = ev.target.closest('[data-amb]'); if (amb) { H.callService('input_select', 'select_option', { entity_id: this._e.ambiente, option: amb.dataset.amb }); return; }
      if (ev.target.closest('.ex')) return;
      const ch = ev.target.closest('[data-chart]'); if (ch) { this._chartMan = !this._chartOpen(); this._hTry = 0; this._sig = ''; this._render(); return; }
      const af = ev.target.closest('[data-auf]'); if (af) { this._aufMan = !af.classList.contains('open'); this._sig = ''; this._render(); return; }
      const tg = ev.target.closest('[data-toggle]'); if (tg) { H.callService('light', 'toggle', { entity_id: tg.dataset.toggle }); return; }
      const t = ev.target.closest('[data-more]'); if (t) this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: t.dataset.more }, bubbles: true, composed: true }));
    }
  }
  customElements.define(TAG, SaunaCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Sauna', description: 'Sauna als aufklappbare Liste mit Temperaturkurve, Ablauf, Aufguss und Licht' });
})();
