// sauger-karte-card v3.0 (27.11.2026, Wunsch Martin): Reinigungsspur genauer – gereinigte Flaeche je Raum ueber dessen Grundfarbe erkannt (auch gelbe Raeume wie Esszimmer/Spielzimmer), Beschriftungen und Nadeln exakt ausmaskiert statt grosser Kaesten; Bereiche per Konfig 'ausblenden' entfernbar (Terrasse); Hindernis-Pille oeffnet scrollbare Galerie (Foto, was erkannt wurde, Raum, Trefferquote); grosse Partikel mit Staub-Symbol in Apple-Gelb.
// v2.9 (27.11.2026, Wunsch Martin): am Tag einer erfolgreichen Reinigung gruener Kasten mit Zusammenfassung (Uhrzeit von–bis, Flaeche, Dauer, CleanGenius, nicht erreichte Raeume mit Grund).
// v2.8 (26.11.2026, Wunsch Martin): Pillen Modus/Akku/Hindernisse gleich gross wie die Kopf-Pillen (13 px, 30 px hoch, Symbol 16 px).
// v2.7 (26.11.2026, Wunsch Martin): Steuerung als Pille oben rechts wie Beleuchtung/Rollos – Alle reinigen (gruenes Sauger-Symbol), waehrend der Reinigung Pausieren (gelb) und Zur Station (rot), pausiert Fortsetzen (gruen); Akku als Pille neben dem Reinigungsmodus.
// v2.6 (26.11.2026): Karte erscheint auch, wenn die Integration die Kalibrierung verworfen hat (wird je Karte gemerkt; sonst Bild abrufen, damit sie neu gemeldet wird).
// v2.5 (25.11.2026): Kachelwerte in normaler Schrift statt fett (passend zu den anderen Karten).
// v2.4 (25.11.2026): Wischflaeche in tieferem Blau (#0058e6, dunkler als Apple-Blau) statt Hellblau.
// v2.3 (25.11.2026): Wischflaeche etwas kraeftiger in hellem Apple-Wasserblau (#64d2ff).
// v2.2 (25.11.2026): ausgewaehlte Raeume dezent in Orange #f56300 statt Blau.
// v2.1 (25.11.2026): Wischband nur noch ein Hauch Blau; Etagenschalter dezent (zarte Spur, ausgewaehlte Etage leicht grau, andere in Sekundaerfarbe).
// v2.0 (25.11.2026): Hindernisse als dezente rot getoente Mini-Kapsel mit kleinem Symbol (groessere unsichtbare Tippflaeche).
// v1.9 (25.11.2026): Reinigungsspur dezenter (Saugspur zartgrau, Wischband nur ein Hauch blau).
// v1.8 (25.11.2026): Raumnamen ohne Schatten, in leicht transparenter grauer Kapsel.
// v1.7 (25.11.2026): Raumnamen kleiner und dezent (ohne Kapsel, gedaempftes Grau).
// v1.6 (25.11.2026): kompakter – Karte hoechstens 280 px hoch (mittig), engere Abstaende, flachere Kacheln/Knoepfe.
// v1.5 (25.11.2026): Kachelwerte (z. B. Zustand) brechen um statt abgeschnitten zu werden.
// v1.4 (25.11.2026): Kopf wie die anderen Karten (z. B. Luftqualitaet): Titel 'Saugroboter' 24 px ohne Symbol, Akku rechts; Untertitel entfaellt (Zustand steht in den Kacheln).
// v1.3 (25.11.2026): letzte Hindernisse (mit Fotos) und letzte Reinigungsspur werden je Etage gemerkt und weiter gezeigt, wenn die Integration die Karte neu laedt und sie dabei verwirft.
// v1.2 (25.11.2026): Raeume einfarbig dezent (ausgewaehlt blau, aktueller Raum pulsiert), Reinigungsspur aus dem Kartenbild (gesaugt feine weisse Linie, gewischt zartblaues Band), Hindernisse in Apple-Rot, Fortschritt als Farbverlauf-Balken, Modus-Kapsel antippen = Modus waehlen (nur einstellen, startet nicht).
// v1.1 (25.11.2026): alles auf einen Blick statt 3 Tabs – Status-Kacheln (Zustand, letzte Reinigung, Fortschritt/Trocknung als Balken, Wassertank/Fehler nur bei Bedarf), Etagenwahl (input_select.karte) als Segmentschalter; Teppiche und 'Ignorieren' entfernt.
// v1.0 (25.11.2026): Saugroboter-Karte im Apple-Stil – Raumformen aus der Dreame-Karte (camera.*_map)
// neu gezeichnet (runde Ecken, Apple-Farben halbtransparent, feiner weisser Rand), Teppiche gepunktet, Basis und Roboter,
// Hindernisse als orange Symbole: Antippen oeffnet direkt das Foto des Saugers (Art, Trefferquote, Raum) mit 'Ignorieren';
// Raeume antippen = auswaehlen, Knopf startet nur diese Raeume (dreame_vacuum.vacuum_clean_segment), sonst 'Alle reinigen'.
// Konfiguration: entity (vacuum.*), map (camera.*_map), optional title.
(() => {
  const TAG = 'sauger-karte-card';
  if (customElements.get(TAG)) return;
  const C = { green: '#30d158', yellow: '#ffd60a', orange: '#ff9f0a', red: '#ff453a', purple: '#bf5af2', blue: '#0a84ff', teal: '#64d2ff', pink: '#ff375f' };
  const SELC = '#f56300'; // ausgewaehlte Raeume (Martins Orange)
  const ROOMC = [C.green, C.blue, C.yellow, C.teal, C.orange, C.purple, C.pink, C.red]; // nach Reinigungsreihenfolge (order)
  const OBST = [[/partikel|particle|dust|krümel/i, 'mdi:grain'], [/stecker|kabel|cable|wire/i, 'mdi:power-socket-eu'], [/textil|socke|sock|kleid|cloth/i, 'mdi:tshirt-crew-outline'], [/schuh|shoe/i, 'mdi:shoe-sneaker'],
    [/basis|möbel|fuß|base|furniture/i, 'mdi:table-furniture'], [/kot|poop|exkrement/i, 'mdi:emoticon-poop-outline'], [/haustier|pet|hund|katze/i, 'mdi:paw'], [/waage|scale/i, 'mdi:scale-bathroom'], [/.*/, 'mdi:alert-outline']];
  const STATE = { docked: 'Angedockt', cleaning: 'Reinigt', returning: 'Fährt zur Basis', paused: 'Pausiert', idle: 'Bereit', error: 'Fehler' };
  const MODE = { 'Sweeping': 'Saugen', 'Mopping': 'Wischen', 'Sweeping and mopping': 'Saugen + Wischen', 'Mopping after sweeping': 'Erst saugen, dann wischen' };
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const f1 = (v) => (Math.round(v * 10) / 10).toString();

  const CSS = `
    :host { display:block; }
    ha-card { padding:2px 14px 12px; overflow:hidden; }
    .hd { display:flex; align-items:center; gap:12px; padding:6px 0 0; margin-bottom:4px; }
    .ttl { flex:1; min-width:0; font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; color:var(--ha-card-header-color, var(--primary-text-color)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tl { flex:0 0 34px; height:34px; border-radius:9px; background:rgba(118,118,128,.28); display:flex; align-items:center; justify-content:center; }
    .tl ha-icon { --mdc-icon-size:22px; color:#fff; display:flex; }
    .nm { flex:1; min-width:0; }
    .nm b { display:block; font-size:15px; font-weight:500; color:var(--primary-text-color); }
    .nm span { display:block; font-size:12px; color:var(--secondary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .fl { display:flex; padding:2px; border-radius:9px; background:rgba(118,118,128,.12); margin-bottom:8px; }
    .fl:empty { display:none; }
    .fl button { flex:1; border:0; background:none; color:var(--primary-text-color); font:inherit; font-size:13px; padding:4px 8px; border-radius:7px; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .fl button { color:var(--secondary-text-color); }
    .fl button.on { background:rgba(118,118,128,.26); color:var(--primary-text-color); font-weight:500; }
    .tiles { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; margin-bottom:8px; }
    .tile { background:rgba(118,118,128,.12); border-radius:10px; padding:6px 9px; min-width:0; }
    .tile.w { grid-column:1 / -1; }
    .tile small { display:flex; align-items:center; gap:5px; font-size:11px; color:var(--secondary-text-color); }
    .tile small ha-icon { --mdc-icon-size:14px; display:flex; }
    .tile b { display:block; font-size:14px; font-weight:400; line-height:1.3; color:var(--primary-text-color); margin-top:2px; overflow-wrap:anywhere; }
    .tile .sx { display:block; font-size:11px; color:var(--secondary-text-color); margin-top:1px; }
    .tile .bar { height:6px; border-radius:3px; background:rgba(118,118,128,.3); margin-top:6px; overflow:hidden; }
    .tile .bar i { display:block; height:100%; border-radius:3px; transition:width .6s; }
    .tile.al { background:rgba(255,69,58,.16); }
    .tile.ok { background:rgba(48,209,88,.16); }
    .tile.ok small, .tile.ok small ha-icon { color:${C.green}; }
    .tile.ok .sx { color:var(--secondary-text-color); }
    .tile.al b, .tile.al small { color:${C.red}; }
    .tile.al ha-icon { animation:skbl 1s steps(1) infinite; }
    @keyframes skbl { 50% { opacity:0; } }
    .mm { position:relative; display:inline-flex; }
    .menu { position:absolute; top:calc(100% + 6px); left:0; z-index:6; min-width:210px; background:#2c2c2e; border-radius:12px; padding:4px; box-shadow:0 8px 24px rgba(0,0,0,.45); display:none; }
    .menu.on { display:block; }
    .menu button { display:flex; align-items:center; gap:8px; width:100%; border:0; background:none; color:#f2f2f7; font:inherit; font-size:13px; padding:8px 10px; border-radius:8px; cursor:pointer; text-align:left; }
    .menu button:hover { background:rgba(118,118,128,.24); }
    .menu button ha-icon { --mdc-icon-size:16px; display:flex; }
    .menu button .ck { margin-left:auto; color:${C.blue}; }
    .menu small { display:block; font-size:11px; color:#8e8e93; padding:6px 10px 4px; }
    .chips { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px; }
    .chip.btnc { border:0; font:inherit; font-size:13px; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .chip { display:inline-flex; align-items:center; gap:6px; height:30px; box-sizing:border-box; padding:0 12px 0 10px; border-radius:15px; background:rgba(118,118,128,.24); font-size:13px; line-height:1; color:var(--primary-text-color); white-space:nowrap; }
    .chip ha-icon { --mdc-icon-size:16px; display:flex; }
    .mw { position:relative; width:100%; margin:0 auto; }
    .mw svg { position:absolute; inset:0; width:100%; height:100%; display:block; }
    .mw path.rm { cursor:pointer; transition:fill-opacity .25s, stroke-width .25s; -webkit-tap-highlight-color:transparent; }
    .mw path.cur { animation:skrm 2.4s ease-in-out infinite; }
    @keyframes skrm { 0%,100% { fill-opacity:.07; } 50% { fill-opacity:.2; } }
    .lbl { position:absolute; transform:translate(-50%,-50%); font-size:9.5px; font-weight:500; line-height:12px; letter-spacing:.02em; color:rgba(235,235,245,.7); padding:1px 6px; border-radius:999px; background:rgba(118,118,128,.28); white-space:nowrap; pointer-events:none; }
    .lbl i { width:6px; height:6px; border-radius:50%; }
    .pin { position:absolute; transform:translate(-50%,-50%); height:16px; padding:0 5px; border-radius:999px; background:rgba(255,69,58,.2); color:${C.red}; border:0; display:flex; align-items:center; justify-content:center; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .pin::before { content:''; position:absolute; inset:-8px -6px; }
    .pin ha-icon { --mdc-icon-size:11px; display:flex; }
    .pin.gy { background:rgba(255,214,10,.22); color:${C.yellow}; }
    .og { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; margin:-4px 0 0; }
    .og.on { grid-template-rows:1fr; margin-bottom:10px; }
    .og > div { overflow:hidden; min-height:0; }
    .ogs { display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; padding:2px 0; }
    .ogs::-webkit-scrollbar { display:none; }
    .ogt { flex:0 0 132px; border:0; padding:0; background:rgba(118,118,128,.12); border-radius:12px; overflow:hidden; text-align:left; font:inherit; color:var(--primary-text-color); cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .ogt .im { height:88px; background:rgba(118,118,128,.3) center/cover no-repeat; display:flex; align-items:center; justify-content:center; color:#8e8e93; }
    .ogt .im ha-icon { --mdc-icon-size:30px; }
    .ogt .tx { padding:6px 8px 8px; }
    .ogt b { display:flex; align-items:center; gap:4px; font-size:12px; font-weight:400; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .ogt b ha-icon { --mdc-icon-size:13px; flex:0 0 13px; display:flex; }
    .ogt span { display:block; font-size:11px; color:var(--secondary-text-color); margin-top:1px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .msg { font-size:12px; color:var(--secondary-text-color); padding:24px 0; text-align:center; }
    .lb { position:absolute; inset:0; background:rgba(0,0,0,.62); border-radius:12px; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity .2s; z-index:5; }
    .lb.on { opacity:1; pointer-events:auto; }
    .lbx { width:90%; max-width:420px; background:#2c2c2e; border-radius:16px; overflow:hidden; }
    .lbp { position:relative; aspect-ratio:4/3; background:rgba(118,118,128,.3); display:flex; align-items:center; justify-content:center; color:#8e8e93; }
    .lbp img { width:100%; height:100%; object-fit:cover; display:block; }
    .lbp .x { position:absolute; top:8px; right:8px; width:28px; height:28px; border-radius:50%; border:0; background:rgba(0,0,0,.55); color:#fff; padding:0; cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .lbp .x ha-icon { --mdc-icon-size:16px; display:flex; }
    .lbi { padding:10px 12px; display:flex; align-items:center; gap:8px; }
    .lbi div { flex:1; min-width:0; }
    .lbi b { display:block; font-size:15px; font-weight:500; color:#f2f2f7; }
    .lbi span { display:block; font-size:12px; color:#8e8e93; }
    .btn { border:0; border-radius:10px; padding:7px 12px; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; -webkit-tap-highlight-color:transparent; font-family:inherit; }
    .btn ha-icon { --mdc-icon-size:16px; display:flex; }
    .g { background:rgba(118,118,128,.24); color:var(--primary-text-color); }
    .ft { display:flex; gap:8px; margin-top:8px; align-items:center; }
    .ft .sel { flex:1; min-width:0; font-size:12px; color:var(--secondary-text-color); }
    .ft .sel:empty { display:none; }
    .ft:has(.sel:empty) { display:none; }
    .hb { flex:0 0 auto; display:flex; gap:8px; }
    .off { flex:0 0 auto; display:flex; align-items:center; gap:6px; height:30px; padding:0 12px 0 10px; border:0; border-radius:15px; background:rgba(118,118,128,.24); color:var(--primary-text-color); font:inherit; font-size:13px; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:opacity .2s; white-space:nowrap; }
    .off ha-icon { --mdc-icon-size:16px; display:flex; }
    .off:active { opacity:.6; }
  `;

  class SaugerKarteCard extends HTMLElement {
    setConfig(c) { this._c = Object.assign({ entity: 'vacuum.p70_pro_ultra', map: 'camera.p70_pro_ultra_map' }, c || {}); this._sel = new Set(); }
    getCardSize() { return 10; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    set hass(h) { this._hass = h; this._render(); }

    _render() {
      const H = this._hass; if (!H || !this._c) return;
      const v = H.states[this._c.entity], m = H.states[this._c.map];
      if (!this.shadowRoot) {
        const r = this.attachShadow({ mode: 'open' });
        r.innerHTML = `<style>${CSS}</style><ha-card><div class="hd"><div class="ttl"></div><span class="hb"></span></div>
          <div class="fl"></div><div class="tiles"></div><div class="chips"></div><div class="og"><div><div class="ogs"></div></div></div><div class="mw"><div class="msg">Karte wird geladen …</div></div><div class="ft"><span class="sel"></span><span class="acts"></span></div></ha-card>`;
        r.querySelector('ha-card').addEventListener('click', (e) => this._click(e));
      }
      if (!v || !m) { this.shadowRoot.querySelector('.mw').innerHTML = '<div class="msg">Sauger oder Karte nicht gefunden</div>'; return; }
      const A = m.attributes || {}, V = v.attributes || {};
      const mapKey = JSON.stringify(this._c.ausblenden || []) + '|' + (A.map_id || '') + '|' + JSON.stringify(A.rooms || {}) + '|' + (A.calibration_points ? JSON.stringify(A.calibration_points) : (this._calKey(A) || ''));
      if (mapKey !== this._mapKey && !this._busy) this._loadMap(A, mapKey);
      this._head(v, V, A);
      if (this._geo) { this._overlay(v, V, A); if (m.state + A.entity_picture !== this._trKey && !this._trBusy && !this._busy) this._loadTrail(A, m.state + A.entity_picture); }
    }

    _head(v, V, A) {
      const r = this.shadowRoot, st = v.state, run = st === 'cleaning' || st === 'returning';
      const hist = Object.keys(A.cleaning_history_picture || {})[0] || '';
      const hm = /^\d+:\s*(\d+)\/(\d+)\s+(\d+:\d+)/.exec(hist), last = hm ? `zuletzt ${+hm[2]}.${+hm[1]}. ${hm[3]}` : '';
      const sub = run || v.state === 'paused' ? [V.cleaning_progress != null ? V.cleaning_progress + ' %' : '', V.cleaned_area != null ? V.cleaned_area + ' m²' : '', this._roomName(V.current_segment, A)].filter(Boolean).join(' · ') : '';
      const set = (sel, html) => { const e = r.querySelector(sel); if (e.innerHTML !== html) e.innerHTML = html; };
      set('.ttl', esc(this._c.title || 'Saugroboter')); void sub;
      const b = V.battery_level != null ? V.battery_level : V.battery, bc = b > 50 ? C.green : b > 20 ? C.yellow : C.red;
      const batChip = b != null ? `<span class="chip"><ha-icon icon="${V.charging ? 'mdi:battery-charging' : 'mdi:battery'}" style="color:${bc}"></ha-icon>${b} %</span>` : '';
      this._tiles(v, V);
      const obs = this._obstacles(A).length;
      const OL = this._obstacles(A);
      set('.chips', (obs ? `<button class="chip btnc" data-og="1"><ha-icon icon="mdi:alert-outline" style="color:${C.red}"></ha-icon>${obs} Hindernis${obs === 1 ? '' : 'se'}<ha-icon icon="mdi:chevron-${this._og ? 'up' : 'down'}" style="--mdc-icon-size:14px;opacity:.6"></ha-icon></button>` : '') +
        this._modeChip(V) + batChip);
      // Galerie aller Hindernisse (nach Raum sortiert): Foto, was erkannt wurde, wo, Trefferquote
      const ogEl = r.querySelector('.og'); if (ogEl) { ogEl.classList.toggle('on', !!this._og && obs > 0);
        set('.ogs', obs && this._og ? OL.slice().sort((a, b) => String(a.room).localeCompare(String(b.room)) || (+a.id - +b.id)).map((o) => `<button class="ogt" data-obs="${o.id}"><div class="im"${o.pic ? ` style="background-image:url('${esc(o.pic)}')"` : ''}>${o.pic ? '' : `<ha-icon icon="${o.icon}"></ha-icon>`}</div>
          <div class="tx"><b><ha-icon icon="${o.icon}" style="color:${o.gelb ? C.yellow : C.red}"></ha-icon>${esc(o.type)}</b><span>${esc([o.room, o.p != null ? o.p + ' %' : ''].filter(Boolean).join(' · '))}</span></div></button>`).join('') : ''); }
      const n = this._sel.size;
      set('.sel', n ? esc([...this._sel].map((id) => this._roomName(id, A)).join(', ')) : (run ? '' : 'Räume antippen zum Auswählen'));
      // v2.7: Steuerung als Pillen oben rechts wie Beleuchtung/Rollos (Sauger-Symbol gruen = reinigen, gelb = pausieren, rot = zur Station)
      const pill = (act, txt, icon, col) => `<button class="off" data-act="${act}" aria-label="${txt}"><ha-icon icon="${icon}" style="color:${col}"></ha-icon>${txt}</button>`;
      let acts;
      if (st === 'cleaning') acts = pill('pause', 'Pausieren', 'mdi:robot-vacuum', C.yellow) + pill('home', 'Zur Station', 'mdi:robot-vacuum', C.red);
      else if (st === 'paused') acts = pill('start', 'Fortsetzen', 'mdi:robot-vacuum', C.green) + pill('home', 'Zur Station', 'mdi:robot-vacuum', C.red);
      else if (st === 'returning') acts = pill('pause', 'Anhalten', 'mdi:robot-vacuum', C.yellow);
      else acts = pill(n ? 'rooms' : 'start', n ? (n === 1 ? 'Raum' : n + ' Räume') + ' reinigen' : 'Alle reinigen', 'mdi:robot-vacuum', C.green);
      set('.hb', acts);
      set('.acts', '');
    }

    _st(k) { return this._hass.states[this._c.entity.replace('vacuum.', 'sensor.') + '_' + k]; }
    _tiles(v, V) {
      const H = this._hass, r = this.shadowRoot, ok = (o) => o && !['unavailable', 'unknown', ''].includes(o.state), fmt = (o) => (H.formatEntityState ? H.formatEntityState(o) : o.state);
      const tile = (ic, lbl, val, x = '', cls = '') => `<div class="tile ${cls}"><small><ha-icon icon="${ic}"></ha-icon>${esc(lbl)}</small><b>${esc(val)}</b>${x}</div>`;
      const bar = (p, c) => { const w = Math.max(0.5, Math.min(100, p)); return `<div class="bar"><i style="width:${w}%;background:${c === 'grad' ? `linear-gradient(90deg,${C.red} 0%,${C.yellow} 50%,${C.green} 80%);background-size:${(10000 / w).toFixed(1)}% 100%` : c}"></i></div>`; };
      const zs = this._st('state'), hi = this._st('cleaning_history'), ar = this._st('cleaned_area'), ct = this._st('cleaning_time');
      const pr = this._st('cleaning_progress'), dp = this._st('drying_progress'), dl = this._st('drying_left'), lw = this._st('low_water_warning'), er = this._st('error');
      let h = tile('mdi:information-outline', 'Zustand', ok(zs) ? fmt(zs) : (STATE[v.state] || v.state));
      let last = '–'; if (ok(hi)) { const d = new Date(hi.state); if (!isNaN(d)) { const t = new Date(); last = (d.toDateString() === t.toDateString() ? 'heute' : d.toDateString() === new Date(t - 864e5).toDateString() ? 'gestern' : `${d.getDate()}.${d.getMonth() + 1}.`) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); } }
      const extra = [ok(ar) ? ar.state + ' m²' : '', ok(ct) ? ct.state + ' min' : ''].filter(Boolean).join(' · ');
      h += tile('mdi:history', 'Letzte Reinigung', last, extra ? `<span class="sx">${esc(extra)}</span>` : '');
      if (ok(pr) && (v.state === 'cleaning' || v.state === 'paused' || v.state === 'returning')) { const p = +pr.state; h += tile('mdi:timelapse', 'Reinigungsfortschritt', p + ' %' + (extra ? ' · ' + extra : ''), bar(p, 'grad'), 'w'); }
      if (ok(dp) && +dp.state < 100) { const p = +dp.state; h += tile('mdi:hair-dryer', 'Trocknung', (ok(dl) ? 'noch ' + dl.state + ' min' : p + ' %'), bar(p, C.blue), 'w'); }
      if (ok(lw) && lw.state !== 'no_warning') h += tile('mdi:water-alert', 'Wassertank', fmt(lw), '', 'al w');
      if (ok(er) && er.state !== 'no_error') h += tile('mdi:alert-circle-outline', 'Fehler', fmt(er), '', 'al w');
      // v2.9: am Tag einer erfolgreichen Reinigung gruener Kasten mit kurzer Zusammenfassung (aus dem Reinigungsverlauf)
      if (ok(hi) && !['cleaning', 'paused', 'returning'].includes(v.state)) {
        const L = Object.values(hi.attributes || {}).filter((x) => x && typeof x === 'object' && x.timestamp).sort((a, b) => b.timestamp - a.timestamp)[0];
        const d0 = L && new Date(L.timestamp * 1000), td = new Date();
        if (L && L.completed && d0.toDateString() === td.toDateString() && parseFloat(L.cleaned_area) > 0) {
          const hm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
          const d1 = L.multiple_cleaning_time && L.multiple_cleaning_time > L.timestamp ? new Date(L.multiple_cleaning_time * 1000) : null;
          const MA = (H.states[this._c.map] || {}).attributes || {};
          const WHY = (t) => /carpet/i.test(t) ? 'Teppich' : /door/i.test(t) ? 'Tür zu' : /threshold/i.test(t) ? 'Schwelle' : /obstacle/i.test(t) ? 'Hindernis' : 'nicht erreichbar';
          const bl = Object.entries(L.blocked_rooms || {}).map(([id, t]) => (this._roomName(id, MA) || 'Raum ' + id) + ' (' + WHY(t) + ')');
          const sub = [L.cleaned_area, L.cleaning_time, /clean ?genius/i.test(L.cleanup_method || '') ? 'CleanGenius' : ''].filter(Boolean).join(' · ');
          h += tile('mdi:check-circle-outline', 'Reinigung erfolgreich', 'heute ' + hm(d0) + (d1 ? '–' + hm(d1) : '') + ' · ' + sub,
            bl.length ? `<span class="sx">nicht gereinigt: ${esc(bl.join(', '))}</span>` : '', 'ok w');
        }
      }
      if (r.querySelector('.tiles').innerHTML !== h) r.querySelector('.tiles').innerHTML = h;
      const ks = H.states[this._c.floor || 'input_select.karte'];
      const fl = ks && (ks.attributes.options || []).length > 1 ? ks.attributes.options.map((o) => `<button class="${o === ks.state ? 'on' : ''}" data-floor="${esc(o)}">${esc(o)}</button>`).join('') : '';
      if (r.querySelector('.fl').innerHTML !== fl) r.querySelector('.fl').innerHTML = fl;
    }
    // Reinigungsmodus: mit CleanGenius ueber dessen Modus, sonst ueber select.*_cleaning_mode; 'Saugen'/'Wischen' schalten CleanGenius aus
    _sel2(k) { return this._hass.states[this._c.entity.replace('vacuum.', 'select.') + '_' + k]; }
    _modeNow(V) { const cg = this._sel2('cleangenius'), on = cg && cg.state !== 'off' && cg.state !== 'unavailable', cm = this._sel2('cleangenius_mode');
      if (on && cm) return cm.state === 'mop_after_vacuum' ? 'after' : 'both';
      return { 'Sweeping': 'vac', 'Mopping': 'mop', 'Sweeping and mopping': 'both', 'Mopping after sweeping': 'after' }[V.cleaning_mode] || 'both'; }
    _modeChip(V) {
      const M = [['vac', 'Saugen', 'mdi:broom'], ['mop', 'Wischen', 'mdi:water-outline'], ['both', 'Saugen + Wischen', 'mdi:water-plus-outline'], ['after', 'Erst saugen, dann wischen', 'mdi:debug-step-over']];
      const now = this._modeNow(V), cur = M.find((m) => m[0] === now), cg = this._sel2('cleangenius'), gen = cg && cg.state !== 'off' && cg.state !== 'unavailable';
      return `<span class="mm"><button class="chip btnc" data-menu="1"><ha-icon icon="${cur[2]}" style="color:${C.blue}"></ha-icon>${esc(cur[1])}<ha-icon icon="mdi:chevron-down" style="--mdc-icon-size:14px;opacity:.6"></ha-icon></button>
        <span class="menu${this._menu ? ' on' : ''}"><small>Modus für die nächste Reinigung${gen ? ' · CleanGenius an' : ''}</small>${M.map((m) => `<button data-mode="${m[0]}"><ha-icon icon="${m[2]}"></ha-icon>${m[1]}${m[0] === now ? '<ha-icon class="ck" icon="mdi:check"></ha-icon>' : ''}</button>`).join('')}</span></span>`;
    }
    _setMode(m) {
      const H = this._hass, base = this._c.entity.replace('vacuum.', 'select.') + '_', cg = this._sel2('cleangenius'), gen = cg && cg.state !== 'off' && cg.state !== 'unavailable';
      const sel = (k, o) => H.callService('select', 'select_option', { entity_id: base + k, option: o });
      const plain = () => { const opts = ((this._sel2('cleaning_mode') || {}).attributes || {}).options || [], want = { vac: 'sweeping', mop: 'mopping', both: 'sweeping_and_mopping', after: 'mopping_after_sweeping' }[m];
        sel('cleaning_mode', opts.find((o) => o.toLowerCase().replace(/ /g, '_') === want) || want); };
      if ((m === 'both' || m === 'after') && gen) sel('cleangenius_mode', m === 'both' ? 'vacuum_and_mop' : 'mop_after_vacuum');
      else if (gen) { sel('cleangenius', 'off'); setTimeout(plain, 2500); }
      else plain();
    }
    _roomName(id, A) { const r = (A.rooms || {})[id]; return r ? (r.custom_name || r.name) : ''; }
    _obstacles(A) {
      const O = A.obstacles || {}, P = A.obstacle_picture || {};
      const live = Object.keys(O).filter((k) => O[k].possibility != null && O[k].ignore_status !== 'Ignored').map((k) => {
        const o = O[k], pk = Object.keys(P).find((p) => p.split(':')[0].trim() === k);
        return { id: k, x: o.x, y: o.y, type: o.type || 'Hindernis', p: o.possibility, room: o.room || '', pic: pk ? P[pk] : '', icon: OBST.find(([re]) => re.test(o.type || ''))[1], gelb: /partikel|particle|dust|krümel/i.test(o.type || '') };
      });
      const ck = 'skc-obs-' + (A.map_id || '');
      if (live.length) { this._cacheObs(ck, live); return live; }
      // Karte wurde neu geladen und hat die Hindernisse verworfen: letzte gemerkte zeigen
      if (!this._obsC || this._obsC.k !== ck) { let c = null; try { c = JSON.parse(localStorage.getItem(ck) || 'null'); } catch (e) {} this._obsC = { k: ck, list: (c && c.list) || [] }; }
      return this._obsC.list;
    }
    async _cacheObs(ck, live) {
      const sig = ck + JSON.stringify(live.map((o) => [o.id, o.x, o.y, o.pic]));
      if (sig === this._obsSig || this._obsBusy) return; this._obsSig = sig; this._obsBusy = true;
      const list = [];
      for (const o of live) { let pic = o.pic;
        if (pic) try { const bm = await createImageBitmap(await (await fetch(pic)).blob()), k = Math.min(1, 480 / bm.width), c = document.createElement('canvas');
          c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k); c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); pic = c.toDataURL('image/jpeg', 0.72); } catch (e) {}
        list.push(Object.assign({}, o, { pic })); }
      try { localStorage.setItem(ck, JSON.stringify({ t: Date.now(), list })); } catch (e) {}
      this._obsC = { k: ck, list }; this._obsBusy = false;
    }
    // Saugerkoordinaten (mm) -> Kartenbild-Pixel ueber die drei Kalibrierpunkte
    _calKey(A) { try { return localStorage.getItem('skc-cal-' + (A.map_id || '')) || ''; } catch (e) { return ''; } }
    // Umkehrung: Kartenbild-Pixel -> Saugerkoordinaten (mm)
    _itf(A) {
      const cp = (A.calibration_points && A.calibration_points.length ? A.calibration_points : (() => { try { return JSON.parse(this._calKey(A) || 'null'); } catch (e) { return null; } })()) || [];
      const g = (vx, vy) => cp.find((p) => p.vacuum.x === vx && p.vacuum.y === vy), a = g(0, 0), b = g(1000, 0), c = g(0, 1000); if (!a || !b || !c) return null;
      const m11 = (b.map.x - a.map.x) / 1000, m12 = (c.map.x - a.map.x) / 1000, m21 = (b.map.y - a.map.y) / 1000, m22 = (c.map.y - a.map.y) / 1000, det = m11 * m22 - m12 * m21;
      return (px, py) => { const dx = px - a.map.x, dy = py - a.map.y; return [(m22 * dx - m12 * dy) / det, (-m21 * dx + m11 * dy) / det]; };
    }
    _tf(A) {
      // Kalibrierung je Karte merken: die Integration liefert sie erst, nachdem das Kartenbild einmal gezeichnet wurde
      const ck = 'skc-cal-' + (A.map_id || '');
      let cp = A.calibration_points;
      if (cp && cp.length) { if (this._calSig !== ck + JSON.stringify(cp)) { this._calSig = ck + JSON.stringify(cp); try { localStorage.setItem(ck, JSON.stringify(cp)); } catch (e) {} } }
      else { try { cp = JSON.parse(localStorage.getItem(ck) || 'null'); } catch (e) { cp = null; } cp = cp || []; }
      const g = (vx, vy) => cp.find((p) => p.vacuum.x === vx && p.vacuum.y === vy);
      const a = g(0, 0), b = g(1000, 0), c = g(0, 1000);
      if (!a || !b || !c) return null;
      return (x, y) => [a.map.x + (b.map.x - a.map.x) * x / 1000 + (c.map.x - a.map.x) * y / 1000, a.map.y + (b.map.y - a.map.y) * x / 1000 + (c.map.y - a.map.y) * y / 1000];
    }

    async _loadMap(A, key) {
      const tf = this._tf(A), url = A.entity_picture;
      if (!tf || !url) {
        // Bild einmal abrufen: dadurch zeichnet die Integration die Karte und meldet danach die Kalibrierung
        if (url && this._kick !== url) { this._kick = url; fetch(url).catch(() => {}); }
        this.shadowRoot.querySelector('.mw').innerHTML = `<div class="msg">${url ? 'Karte wird geladen …' : 'Keine Karte vorhanden'}</div>`; return; }
      let cache = null; try { cache = JSON.parse(localStorage.getItem('skc-geo2') || 'null'); } catch (e) {}
      if (cache && cache.key === key) { this._geo = cache.geo; this._mapKey = key; this._sig = ''; this._build(); this._render(); return; }
      this._busy = true;
      try {
        const bmp = await createImageBitmap(await (await fetch(url)).blob());
        const W = bmp.width, Hh = bmp.height, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
        const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0);
        const px = cx.getImageData(0, 0, W, Hh).data, S = 2, gw = Math.floor(W / S), gh = Math.floor(Hh / S), N = gw * gh;
        // Boden: alles Nicht-Transparente (Halbauflösung)
        let fl = new Uint8Array(N);
        for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { let on = 0; for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) if (px[((y * S + dy) * W + x * S + dx) * 4 + 3] > 0) on = 1; fl[y * gw + x] = on; }
        // Luecken schliessen (Bahnen, Symbole) und Kanten glaetten
        const morph = (src, r, max) => { const t = new Uint8Array(N), o = new Uint8Array(N);
          for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { let v = max ? 0 : 1; for (let d = -r; d <= r; d++) { const xx = x + d; const s = xx < 0 || xx >= gw ? 0 : src[y * gw + xx]; if (max ? s : !s) { v = max ? 1 : 0; break; } } t[y * gw + x] = v; }
          for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { let v = max ? 0 : 1; for (let d = -r; d <= r; d++) { const yy = y + d; const s = yy < 0 || yy >= gh ? 0 : t[yy * gw + x]; if (max ? s : !s) { v = max ? 1 : 0; break; } } o[y * gw + x] = v; } return o; };
        const smooth = (src, r, th) => { const t = new Float32Array(N), o = new Uint8Array(N);
          for (let y = 0; y < gh; y++) { let s = 0; for (let x = -r; x < gw + r; x++) { const a = x + r < gw && x + r >= 0 ? src[y * gw + x + r] : 0, b = x - r - 1 >= 0 && x - r - 1 < gw ? src[y * gw + x - r - 1] : 0; s += a - b; if (x >= 0 && x < gw) t[y * gw + x] = s / (2 * r + 1); } }
          for (let x = 0; x < gw; x++) { let s = 0; for (let y = -r; y < gh + r; y++) { const a = y + r < gh && y + r >= 0 ? t[(y + r) * gw + x] : 0, b = y - r - 1 >= 0 && y - r - 1 < gh ? t[(y - r - 1) * gw + x] : 0; s += a - b; if (y >= 0 && y < gh) o[y * gw + x] = s / (2 * r + 1) > th ? 1 : 0; } } return o; };
        fl = smooth(morph(morph(fl, 2, true), 2, false), 2, 0.5);
        // Raumzuordnung ueber die Raumrechtecke (kleinstes passendes gewinnt), dann in Luecken hinein ausbreiten
        const rooms = A.rooms || {}, ids = Object.keys(rooms).filter((k) => rooms[k].visibility !== 'Hidden').sort((a, b) => (rooms[a].order || 99) - (rooms[b].order || 99));
        const lab = new Uint8Array(N), best = new Float32Array(N).fill(1e18);
        ids.forEach((k, i) => { const r = rooms[k], pts = [tf(r.x0, r.y0), tf(r.x1, r.y0), tf(r.x0, r.y1), tf(r.x1, r.y1)];
          const X0 = Math.min(...pts.map((p) => p[0])) / S - 3, X1 = Math.max(...pts.map((p) => p[0])) / S + 3, Y0 = Math.min(...pts.map((p) => p[1])) / S - 3, Y1 = Math.max(...pts.map((p) => p[1])) / S + 3, ar = (X1 - X0) * (Y1 - Y0);
          for (let y = Math.max(0, Math.floor(Y0)); y <= Math.min(gh - 1, Math.ceil(Y1)); y++) for (let x = Math.max(0, Math.floor(X0)); x <= Math.min(gw - 1, Math.ceil(X1)); x++) { const q = y * gw + x; if (fl[q] && ar < best[q]) { best[q] = ar; lab[q] = i + 1; } } });
        for (let it = 0; it < 10; it++) { const L2 = lab.slice(); for (let q = 0; q < N; q++) if (!lab[q] && fl[q]) { const x = q % gw; const n = (x > 0 && lab[q - 1]) || (x < gw - 1 && lab[q + 1]) || (q >= gw && lab[q - gw]) || (q + gw < N && lab[q + gw]); if (n) L2[q] = n; } lab.set(L2); }
        // Bereiche ausblenden (z. B. Terrasse, die durch grosse Fenster als Raum erkannt wurde): Konfig 'ausblenden' = [{karte, raum, x0, x1, y0, y1}] in mm
        { const itf = this._itf(A), AUS = (this._c.ausblenden || []).filter((z) => z.karte == null || String(z.karte) === String(A.map_id));
          if (itf && AUS.length) for (let q = 0; q < N; q++) { if (!lab[q]) continue; const rid = ids[lab[q] - 1], x = q % gw, y = (q - x) / gw, [vx, vy] = itf((x + 0.5) * S, (y + 0.5) * S);
            if (AUS.some((z) => (z.raum == null || String(z.raum) === rid) && vx >= (z.x0 ?? -1e9) && vx <= (z.x1 ?? 1e9) && vy >= (z.y0 ?? -1e9) && vy <= (z.y1 ?? 1e9))) lab[q] = 0; } }
        // je Raum: glaetten, 1 px Abstand zum Nachbarraum, Umriss verfolgen, vereinfachen
        const trace = (mk) => { const seen = new Uint8Array(N), out = [], D = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
          const on = (x, y) => x >= 0 && y >= 0 && x < gw && y < gh && mk[y * gw + x];
          for (let q = 0; q < N; q++) { if (!mk[q] || seen[q]) continue; const sx = q % gw, sy = (q - sx) / gw;
            const st = [q]; seen[q] = 1; let area = 0; while (st.length) { const p = st.pop(); area++; const x = p % gw; for (const n of [p - 1, p + 1, p - gw, p + gw]) { if (n < 0 || n >= N || seen[n] || !mk[n]) continue; if ((n === p - 1 && x === 0) || (n === p + 1 && x === gw - 1)) continue; seen[n] = 1; st.push(n); } }
            if (area < 120) continue;
            const pts = [[sx, sy]]; let cxp = sx, cyp = sy, b = 0;
            for (let s = 0; s < 40000; s++) { let moved = false; for (let i = 1; i <= 8; i++) { const k = (b + i) % 8, nx = cxp + D[k][0], ny = cyp + D[k][1]; if (on(nx, ny)) { cxp = nx; cyp = ny; b = (k + 4) % 8; moved = true; break; } }
              if (!moved || (cxp === sx && cyp === sy)) break; pts.push([cxp, cyp]); }
            out.push(pts); }
          return out; };
        const rdp = (p, e) => { if (p.length < 3) return p; let dm = 0, idx = 0; const [ax, ay] = p[0], [bx, by] = p[p.length - 1], L = Math.hypot(bx - ax, by - ay) || 1;
          for (let i = 1; i < p.length - 1; i++) { const d = Math.abs((bx - ax) * (ay - p[i][1]) - (ax - p[i][0]) * (by - ay)) / L; if (d > dm) { dm = d; idx = i; } }
          return dm > e ? rdp(p.slice(0, idx + 1), e).slice(0, -1).concat(rdp(p.slice(idx), e)) : [p[0], p[p.length - 1]]; };
        const geo = { w: gw, h: gh, rooms: [] };
        ids.forEach((k, i) => { let mk = new Uint8Array(N); for (let q = 0; q < N; q++) mk[q] = lab[q] === i + 1 ? 1 : 0;
          mk = morph(smooth(mk, 2, 0.55), 1, false);
          const d = trace(mk).map((pts) => { const h = Math.floor(pts.length / 2), s = rdp(pts.slice(0, h + 1), 1.1).concat(rdp(pts.slice(h), 1.1).slice(1)); return 'M' + s.map(([x, y]) => (x + 0.5) + ',' + (y + 0.5)).join('L') + 'Z'; }).join('');
          if (d) geo.rooms.push({ id: k, d, c: ROOMC[i % ROOMC.length] }); });
        let x0 = gw, y0 = gh, x1 = 0, y1 = 0; for (let q = 0; q < N; q++) if (lab[q]) { const x = q % gw, y = (q - x) / gw; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        geo.vb = [x0 - 8, y0 - 8, x1 - x0 + 16, y1 - y0 + 16]; geo.S = S;
        this._geo = geo; this._mapKey = key;
        try { localStorage.setItem('skc-geo2', JSON.stringify({ key, geo })); } catch (e) {}
        this._sig = ''; this._build();
      } catch (e) { this.shadowRoot.querySelector('.mw').innerHTML = `<div class="msg">Karte nicht ladbar (${esc(e && e.message || e)})</div>`; }
      this._busy = false; this._render();
    }

    // Reinigungsspur aus dem Kartenbild: weisse Linie = gesaugt, aufgehellter Saum = gewischt (Beschriftungen/Symbole der Vorlage ausgespart)
    async _loadTrail(A, key) {
      const tf = this._tf(A), G = this._geo; if (!tf || !A.entity_picture) return;
      this._trBusy = true;
      try {
        const bmp = await createImageBitmap(await (await fetch(A.entity_picture)).blob());
        const W = bmp.width, Hh = bmp.height, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
        const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0); const id = cx.getImageData(0, 0, W, Hh), d = id.data;
        const NP = W * Hh, skip = new Uint8Array(NP), box = (x0, y0, x1, y1, m = skip) => { for (let y = Math.max(0, y0 | 0); y < Math.min(Hh, y1); y++) for (let x = Math.max(0, x0 | 0); x < Math.min(W, x1); x++) m[y * W + x] = 1; };
        const dil = (m, r) => { const t = new Uint8Array(NP), o = new Uint8Array(NP);
          for (let y = 0; y < Hh; y++) { let c = 0; for (let x = -r; x < W + r; x++) { if (x + r < W && m[y * W + x + r]) c++; if (x - r - 1 >= 0 && m[y * W + x - r - 1]) c--; if (x >= 0 && x < W && c) t[y * W + x] = 1; } }
          for (let x = 0; x < W; x++) { let c = 0; for (let y = -r; y < Hh + r; y++) { if (y + r < Hh && t[(y + r) * W + x]) c++; if (y - r - 1 >= 0 && t[(y - r - 1) * W + x]) c--; if (y >= 0 && y < Hh && c) o[y * W + x] = 1; } } return o; };
        // Grundfarbe je Raum (ungereinigt): kraeftigste haeufige Farbe im Raumrechteck, ohne Beschriftung
        const rooms = Object.values(A.rooms || {}).filter((r) => r.visibility !== 'Hidden'), bases = [], lbx = [];
        rooms.forEach((r) => { const pts = [tf(r.x0, r.y0), tf(r.x1, r.y1)], X0 = Math.max(0, Math.min(pts[0][0], pts[1][0]) | 0), X1 = Math.min(W, Math.max(pts[0][0], pts[1][0]) | 0), Y0 = Math.max(0, Math.min(pts[0][1], pts[1][1]) | 0), Y1 = Math.min(Hh, Math.max(pts[0][1], pts[1][1]) | 0);
          const L = r.x != null ? tf(r.x, r.y) : null; if (L) lbx.push([L[0] - 95, L[1] - 70, L[0] + 95, L[1] + 42]);
          const cnt = new Map(); let tot = 0;
          for (let y = Y0; y < Y1; y += 1) for (let x = X0; x < X1; x += 1) { if (L && x > L[0] - 95 && x < L[0] + 95 && y > L[1] - 70 && y < L[1] + 42) continue; const i = (y * W + x) * 4; if (d[i + 3] < 250) continue;
            const rr = d[i], gg = d[i + 1], bb = d[i + 2], mn = Math.min(rr, gg, bb), mx = Math.max(rr, gg, bb); if (mn >= 240 || mx - mn < 12 || (mx - mn) / mx >= 0.7) continue; const k = (rr << 16) | (gg << 8) | bb; cnt.set(k, (cnt.get(k) || 0) + 1); tot++; }
          const sat = (k) => { const c = [k >> 16 & 255, k >> 8 & 255, k & 255]; return (Math.max(...c) - Math.min(...c)) / Math.max(...c); };
          const cand = [...cnt].filter(([, n]) => n >= tot * 0.015); if (!cand.length) return; const ms = Math.max(...cand.map(([k]) => sat(k)));
          const b = cand.filter(([k]) => sat(k) >= ms - 0.04).sort((a, c) => c[1] - a[1])[0][0]; if (!bases.includes(b)) bases.push(b); });
        const BS = bases.map((k) => [k >> 16 & 255, k >> 8 & 255, k & 255]);
        // gereinigt = Grundfarbe mit Weiss aufgehellt (in allen Farbkanaelen gleich stark, 18-85 %)
        const clean = (rr, gg, bb) => { for (const b of BS) { let lo = 9, hi = -9; const c = [rr, gg, bb]; for (let k = 0; k < 3; k++) { const den = 255 - b[k]; if (den <= 25) continue; const f = (c[k] - b[k]) / den; if (f < lo) lo = f; if (f > hi) hi = f; } if (lo >= 0.18 && hi <= 0.85 && hi - lo < 0.2) return true; } return false; };
        const near = (rr, gg, bb) => BS.some((b) => (rr - b[0]) ** 2 + (gg - b[1]) ** 2 + (bb - b[2]) ** 2 < 900);
        // Beschriftungen (Nummer + Name) und kraeftig farbige Symbole/Nadeln genau ausmaskieren statt grosser Kaesten
        const seedL = new Uint8Array(NP), seedP = new Uint8Array(NP), inL = new Uint8Array(NP); lbx.forEach(([a, b, c, e]) => box(a, b, c, e, inL));
        for (let q = 0; q < NP; q++) { const i = q * 4; if (d[i + 3] < 250) continue; const rr = d[i], gg = d[i + 1], bb = d[i + 2], mn = Math.min(rr, gg, bb), mx = Math.max(rr, gg, bb);
          if (mx > 0 && (mx - mn) / mx > 0.62) seedP[q] = 1; else if (inL[q] && mn < 240 && mx - mn >= 12 && !near(rr, gg, bb) && !clean(rr, gg, bb)) seedL[q] = 1; }
        const mL = dil(seedL, 4), mP = dil(seedP, 3); for (let q = 0; q < NP; q++) if (mL[q] || mP[q]) skip[q] = 1;
        Object.values(A.obstacles || {}).forEach((o) => { const [x, y] = tf(o.x, o.y); box(x - 17, y - 46, x + 17, y + 3); });
        [A.vacuum_position, A.charger_position].forEach((q) => { if (q) { const [x, y] = tf(q.x, q.y); box(x - 24, y - 24, x + 24, y + 24); } });
        const pth = cx.createImageData(W, Hh), mop = cx.createImageData(W, Hh), o = pth.data, mo = mop.data; let n = 0;
        for (let q = 0; q < NP; q++) { const i = q * 4; if (d[i + 3] < 200 || skip[q]) continue; const r = d[i], g = d[i + 1], b = d[i + 2], mn = Math.min(r, g, b);
          if (mn >= 246) { o[i] = 235; o[i + 1] = 235; o[i + 2] = 245; o[i + 3] = 95; n++; }
          else if (d[i + 3] > 250 && clean(r, g, b)) { mo[i] = 0; mo[i + 1] = 88; mo[i + 2] = 230; mo[i + 3] = 255; n++; } }
        // Wischband weich (Kachelfugen verschwinden), Saugspur scharf darueber
        const c2 = document.createElement('canvas'); c2.width = W; c2.height = Hh; c2.getContext('2d').putImageData(mop, 0, 0);
        const c3 = document.createElement('canvas'); c3.width = W; c3.height = Hh; c3.getContext('2d').putImageData(pth, 0, 0);
        cx.clearRect(0, 0, W, Hh); cx.filter = 'blur(3px)'; cx.globalAlpha = 0.26; cx.drawImage(c2, 0, 0); cx.filter = 'none'; cx.globalAlpha = 1; cx.drawImage(c3, 0, 0);
        const tk = 'skc-tr-' + (A.map_id || ''), v = this._hass.states[this._c.entity], running = v && ['cleaning', 'paused', 'returning'].includes(v.state);
        if (n > 50) { this._trail = cv.toDataURL(); try { const h = document.createElement('canvas'); h.width = W / 2; h.height = Hh / 2; h.getContext('2d').drawImage(cv, 0, 0, W / 2, Hh / 2); localStorage.setItem(tk, h.toDataURL()); } catch (e) {} }
        else if (!running) { try { this._trail = localStorage.getItem(tk) || ''; } catch (e) { this._trail = ''; } } // Spur der letzten Reinigung
        else this._trail = '';
        this._trKey = key;
        const g = this.shadowRoot.querySelector('.tr');
        if (g) g.innerHTML = this._trail ? `<image href="${this._trail}" x="0" y="0" width="${W / G.S}" height="${Hh / G.S}" preserveAspectRatio="none"/>` : '';
      } catch (e) { this._trKey = key; }
      this._trBusy = false;
    }

    // feste Ebene: Raeume (nur bei neuer Karte), Rest in _overlay
    _build() {
      this._trKey = '';
      const G = this._geo, mw = this.shadowRoot.querySelector('.mw');
      mw.style.aspectRatio = `${G.vb[2]} / ${G.vb[3]}`; mw.style.width = `min(100%, ${Math.round(280 * G.vb[2] / G.vb[3])}px)`; // Karte hoechstens 280 px hoch
      mw.innerHTML = `<svg viewBox="${G.vb.join(' ')}"><defs><pattern id="skp" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".8" fill="#fff" fill-opacity=".28"/></pattern></defs>` +
        G.rooms.map((r) => `<path class="rm" data-room="${r.id}" d="${r.d}" fill="#ffffff" fill-opacity=".07" stroke="rgba(235,235,245,.35)" stroke-width="1" stroke-linejoin="round"/>`).join('') +
        `<g class="tr" style="pointer-events:none"></g><g class="ov" style="pointer-events:none"></g></svg><div class="hl"></div><div class="lb"></div>`;
    }

    _overlay(v, V, A) {
      const G = this._geo, tf = this._tf(A); if (!tf) return;
      const P = (x, y) => { const p = tf(x, y); return [p[0] / G.S, p[1] / G.S]; };
      const pct = (p) => `left:${f1((p[0] - G.vb[0]) / G.vb[2] * 100)}%;top:${f1((p[1] - G.vb[1]) / G.vb[3] * 100)}%`;
      const obs = this._obstacles(A), vp = A.vacuum_position, cpos = A.charger_position, run = v.state === 'cleaning';
      const sig = JSON.stringify([obs.map((o) => [o.id, o.x, o.y, o.pic]), vp, cpos, [...this._sel], run && V.current_segment, A.rooms && Object.keys(A.rooms)]);
      if (sig === this._sig) return; this._sig = sig;
      const r = this.shadowRoot;
      r.querySelectorAll('path.rm').forEach((p) => { const id = p.dataset.room, s = this._sel.has(id), cur = run && String(V.current_segment) === id;
        p.setAttribute('fill', s ? SELC : '#ffffff'); p.setAttribute('fill-opacity', s ? '.18' : '.07'); p.setAttribute('stroke', s ? 'rgba(245,99,0,.6)' : 'rgba(235,235,245,.35)'); p.classList.toggle('cur', cur && !s); });
      let s = '';
      if (cpos && !(vp && Math.hypot(vp.x - cpos.x, vp.y - cpos.y) < 150)) { const [x, y] = P(cpos.x, cpos.y); s += `<rect x="${f1(x - 4)}" y="${f1(y - 4)}" width="8" height="8" rx="2.5" fill="#f2f2f7" stroke="#1c1c1e" stroke-width="1.2"/><path d="M${f1(x - 2)},${f1(y + .6)}L${f1(x)},${f1(y - 1.6)}L${f1(x + 2)},${f1(y + .6)}" fill="none" stroke="#1c1c1e" stroke-width=".9"/>`; }
      if (vp) { const [x, y] = P(vp.x, vp.y), pa = P(vp.x + 300 * Math.cos(((vp.a || 0)) * Math.PI / 180), vp.y + 300 * Math.sin(((vp.a || 0)) * Math.PI / 180)), dx = pa[0] - x, dy = pa[1] - y, dl = Math.hypot(dx, dy) || 1;
        s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="${C.green}" fill-opacity=".25"/><circle cx="${f1(x)}" cy="${f1(y)}" r="5.5" fill="#f2f2f7" stroke="#1c1c1e" stroke-width="1.5"/><circle cx="${f1(x + dx / dl * 3)}" cy="${f1(y + dy / dl * 3)}" r="1.4" fill="${C.green}"/>`; }
      r.querySelector('.ov').innerHTML = s;
      const rooms = A.rooms || {}, col = {}; G.rooms.forEach((q) => { col[q.id] = q.c; });
      r.querySelector('.hl').innerHTML = Object.keys(rooms).filter((k) => col[k] && rooms[k].x != null).map((k) => `<span class="lbl" style="${pct(P(rooms[k].x, rooms[k].y))}">${esc(rooms[k].custom_name || rooms[k].name)}</span>`).join('') +
        obs.map((o) => `<button class="pin${o.gelb ? ' gy' : ''}" data-obs="${o.id}" style="${pct(P(o.x, o.y))}" aria-label="${esc(o.type)}"><ha-icon icon="${o.icon}"></ha-icon></button>`).join('');
    }

    _call(d, s, data) { this._hass.callService(d, s, Object.assign({ entity_id: this._c.entity }, data || {})); }
    _click(e) {
      const A = (this._hass.states[this._c.map] || {}).attributes || {}, r = this.shadowRoot, lb = r.querySelector('.lb');
      if (e.target.closest('[data-og]')) { this._og = !this._og; this._render(); return; }
      const pin = e.target.closest('.pin, .ogt');
      if (pin) { const o = this._obstacles(A).find((q) => q.id === pin.dataset.obs); if (!o) return;
        lb.innerHTML = `<div class="lbx"><div class="lbp">${o.pic ? `<img src="${esc(o.pic)}" alt="">` : `<ha-icon icon="${o.icon}" style="--mdc-icon-size:44px"></ha-icon>`}<button class="x" data-close="1" aria-label="Schließen"><ha-icon icon="mdi:close"></ha-icon></button></div>
          <div class="lbi"><div><b>${esc(o.type)}</b><span>${esc([o.room, o.p != null ? o.p + ' %' : ''].filter(Boolean).join(' · '))}</span></div></div></div>`;
        lb.classList.add('on'); return; }
      if (e.target.closest('[data-close]') || e.target === lb) { lb.classList.remove('on'); return; }
      const mb = e.target.closest('[data-mode]');
      if (mb) { this._menu = false; this._setMode(mb.dataset.mode); this._render(); return; }
      if (e.target.closest('[data-menu]')) { this._menu = !this._menu; r.querySelector('.menu').classList.toggle('on', this._menu); return; }
      if (this._menu) { this._menu = false; const mn = r.querySelector('.menu'); if (mn) mn.classList.remove('on'); }
      const fb = e.target.closest('[data-floor]');
      if (fb) { this._hass.callService('input_select', 'select_option', { entity_id: this._c.floor || 'input_select.karte', option: fb.dataset.floor }); this._sel.clear(); return; }
      const rm = e.target.closest('path.rm');
      if (rm) { const id = rm.dataset.room; if (this._sel.has(id)) this._sel.delete(id); else this._sel.add(id); this._sig = ''; this._render(); return; }
      const act = e.target.closest('[data-act]');
      if (act) { const a = act.dataset.act;
        if (a === 'start') this._call('vacuum', 'start');
        else if (a === 'pause') this._call('vacuum', 'pause');
        else if (a === 'home') this._call('vacuum', 'return_to_base');
        else if (a === 'rooms') { this._call('dreame_vacuum', 'vacuum_clean_segment', { segments: [...this._sel].map(Number) }); this._sel.clear(); this._sig = ''; this._render(); } }
    }
  }
  customElements.define(TAG, SaugerKarteCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Sauger-Karte', description: 'Saugroboter-Karte im Apple-Stil mit antippbaren Räumen und Hindernisfotos' });
})();
