// waschmaschine-plan-card v0.4 (27.11.2026): Dauer je Programm (Schaetzung, mit +/- anpassbar, lernt die echte Prognose der Maschine), wahlweise 'Start um' oder 'Fertig um' – die andere Zeit wird berechnet; Plan verfaellt 2 h nach Startzeit.
// v0.3 (27.11.2026): Vorgabe 06:00–09:00, solange noch nie geplant wurde (neue Helfer stehen auf 00:00).
// v0.2 (27.11.2026): Vorgabe = zuletzt genutzte Zeiten (sonst 06:00–09:00, typisch abends beladen, morgens starten), Schnellwahl 05–08 Uhr / Sofort.
// v0.1 (27.11.2026, Testkarte): Miele MobileStart mit Programm-Vorwahl.
// Pille oben rechts 'Programm planen' (Programm, Startzeit, Endzeit) – gespeichert in Helfern, gestartet von der Automation
// 'Waschmaschine geplanter Start (MobileStart)': ab Startzeit, sobald MobileStart aktiv ist, bis spaetestens Endzeit (danach verfaellt der Plan).
// Zweite Pille: Hinweis 'Waschmaschine leeren' (Alexa/TV-Ansage) an/aus.
(() => {
  const TAG = 'waschmaschine-plan-card';
  if (customElements.get(TAG)) return;
  const C = { green: '#30d158', yellow: '#ffd60a', red: '#ff453a', orange: '#f56300', gray: '#8e8e93', blue: '#0a84ff' };
  const DEF = {
    title: 'Waschmaschine', device_id: '4c973b1146d6b7f4db803425c41c4cc0', status: 'sensor.waschmaschine', mobile: 'binary_sensor.waschmaschine_mobiler_start',
    program: 'sensor.waschmaschine_programm', ende: 'sensor.waschmaschine_ende', remaining: 'sensor.waschmaschine_verbleibende_zeit',
    notify_automation: 'automation.waschmaschine_leeren', aktiv: 'input_boolean.waschmaschine_plan_aktiv', p_id: 'input_number.waschmaschine_plan_programm',
    p_name: 'input_text.waschmaschine_plan_name', p_start: 'input_datetime.waschmaschine_plan_start', p_end: 'input_datetime.waschmaschine_plan_ende',
  };
  // Anzeige-Namen fuer die Vorschau-Liste (wenn die Maschine aus ist, liefert Miele keine Programmliste)
  const DE = { cottons: 'Baumwolle', eco_40_60: 'ECO 40-60', minimum_iron: 'Pflegeleicht', delicates: 'Feinwäsche', woollens: 'Wolle', silks: 'Seide', quick_power_wash: 'QuickPowerWash',
    express_20: 'Express 20', automatic_plus: 'Automatic plus', shirts: 'Oberhemden', denim: 'Jeans', sportswear: 'Sportwäsche', outerwear: 'Outdoor', bed_linen: 'Bettwäsche',
    towels: 'Handtücher', dark_garments: 'Dunkle Wäsche', down_duvets: 'Daunen', pillows: 'Kopfkissen', rinse: 'Spülen', drain_spin: 'Abpumpen/Schleudern', clean_machine: 'Maschine reinigen' };
  // typische Laufzeiten in Minuten (Miele W1, Standardoptionen) – Schaetzung, bis die Karte die echte Prognose der Maschine gelernt hat
  const DUR = { cottons: 159, eco_40_60: 199, minimum_iron: 109, delicates: 59, woollens: 39, silks: 44, quick_power_wash: 59, express_20: 20, automatic_plus: 99,
    shirts: 89, denim: 89, sportswear: 79, outerwear: 79, bed_linen: 119, towels: 129, dark_garments: 89, dark_jeans: 89, down_duvets: 99, pillows: 109, rinse: 29,
    drain_spin: 15, clean_machine: 89, baby_clothes: 129, curtains: 79, hand_wash: 49, cottons_hygiene: 169, steam_care: 50, freshen_up: 30, trainers: 70, first_wash: 70 };
  const keyOf = (name) => { const n = String(name || '').toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
    for (const [k, v] of Object.entries(DE)) if (v.toLowerCase().replace(/[^a-z0-9äöüß]/g, '') === n) return k;
    for (const [k, v] of Object.entries(DE)) { const w = v.toLowerCase().replace(/[^a-z0-9äöüß]/g, ''); if (n.includes(w) || w.includes(n)) return k; }
    return n.replace(/ /g, '_'); };
  const hmin = (m) => Math.floor(m / 60) + ':' + p2(m % 60) + ' h';
  const PREVIEW = ['cottons', 'eco_40_60', 'minimum_iron', 'delicates', 'quick_power_wash', 'express_20', 'automatic_plus', 'bed_linen', 'towels', 'sportswear', 'woollens', 'shirts'];
  const STAT = { off: 'Aus', on: 'An', idle: 'Bereit', in_use: 'Läuft', programmed: 'Programmiert', waiting_to_start: 'Wartet auf Start', pause: 'Pause',
    program_ended: 'Fertig', program_interrupted: 'Unterbrochen', failure: 'Störung', not_connected: 'Nicht verbunden' };
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const p2 = (n) => String(n).padStart(2, '0');
  const hm = (d) => p2(d.getHours()) + ':' + p2(d.getMinutes());
  const tag = (d) => { const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(d); x.setHours(0, 0, 0, 0); const k = Math.round((x - t) / 864e5); return k === 0 ? 'heute' : k === 1 ? 'morgen' : `${d.getDate()}.${d.getMonth() + 1}.`; };
  const iso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:00`;
  // Uhrzeit (HH:MM) -> naechster Zeitpunkt ab 'ab'
  const next = (t, ab) => { const [h, m] = t.split(':').map(Number), d = new Date(ab); d.setHours(h, m, 0, 0); if (d <= ab) d.setDate(d.getDate() + 1); return d; };

  const CSS = `
    :host { display:block; }
    ha-card { padding:4px 16px 12px; overflow:visible; }
    .hd { display:flex; align-items:center; gap:8px; padding:12px 0 4px; }
    .ttl { flex:1; min-width:0; font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; color:var(--ha-card-header-color, var(--primary-text-color)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .pl { flex:0 0 auto; display:inline-flex; align-items:center; gap:6px; height:30px; box-sizing:border-box; padding:0 12px 0 10px; border:0; border-radius:15px; background:rgba(118,118,128,.24);
      color:var(--primary-text-color); font:inherit; font-size:13px; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; white-space:nowrap; transition:opacity .2s, background .2s; }
    .pl ha-icon { --mdc-icon-size:16px; display:flex; }
    .pl:active { opacity:.6; }
    .pl.on { background:rgba(245,99,0,.22); }
    .pn { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; }
    .pn.on { grid-template-rows:1fr; }
    .pn > div { overflow:hidden; min-height:0; }
    .box { background:rgba(118,118,128,.12); border-radius:10px; padding:10px 10px 12px; margin:4px -8px 8px; }
    .lb { font-size:11px; font-weight:500; letter-spacing:.05em; text-transform:uppercase; color:var(--secondary-text-color); margin:2px 2px 6px; }
    .lb small { text-transform:none; letter-spacing:0; font-weight:400; margin-left:6px; }
    .pg { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; max-height:132px; overflow-y:auto; }
    .pg button { border:0; font:inherit; font-size:13px; padding:6px 11px; border-radius:15px; background:rgba(118,118,128,.24); color:var(--primary-text-color); cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .pg button.on { background:${C.orange}; color:#fff; }
    .qk { display:flex; gap:6px; margin-bottom:8px; flex-wrap:wrap; }
    .qk button { border:0; font:inherit; font-size:13px; padding:5px 11px; border-radius:15px; background:rgba(118,118,128,.24); color:var(--primary-text-color); cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .qk button.on { background:rgba(245,99,0,.3); }
    .du { display:flex; align-items:center; gap:8px; background:rgba(118,118,128,.18); border-radius:10px; padding:6px 6px 6px 10px; margin-bottom:10px; }
    .du ha-icon { --mdc-icon-size:18px; color:${C.orange}; display:flex; }
    .du span { flex:1; font-size:14px; } .du b { font-weight:500; } .du small { margin-left:6px; font-size:11px; color:var(--secondary-text-color); }
    .du button { width:30px; height:30px; border:0; border-radius:15px; background:rgba(118,118,128,.28); color:var(--primary-text-color); font:inherit; font-size:18px; line-height:1; cursor:pointer; }
    .sg { display:flex; padding:2px; border-radius:9px; background:rgba(118,118,128,.18); margin-bottom:8px; }
    .sg button { flex:1; border:0; background:none; color:var(--secondary-text-color); font:inherit; font-size:13px; padding:5px 8px; border-radius:7px; cursor:pointer; }
    .sg button.on { background:rgba(118,118,128,.36); color:var(--primary-text-color); font-weight:500; }
    .cv { background:rgba(118,118,128,.1); border-radius:10px; padding:6px 10px; }
    .cv span { display:block; font-size:11px; color:var(--secondary-text-color); } .cv b { display:block; font-size:20px; font-weight:400; padding:2px 0; }
    .cv i { display:block; font-style:normal; font-size:11px; color:var(--secondary-text-color); }
    .tm { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
    .tm label { display:block; background:rgba(118,118,128,.18); border-radius:10px; padding:6px 10px; }
    .tm label span { display:block; font-size:11px; color:var(--secondary-text-color); }
    .tm input { width:100%; box-sizing:border-box; border:0; background:none; color:var(--primary-text-color); font:inherit; font-size:20px; padding:2px 0; color-scheme:dark; }
    .tm label i { display:block; font-style:normal; font-size:11px; color:var(--secondary-text-color); }
    .ac { display:flex; gap:8px; justify-content:flex-end; align-items:center; }
    .ac .hn { flex:1; font-size:12px; color:var(--secondary-text-color); }
    .bt { border:0; border-radius:15px; height:30px; padding:0 14px; font:inherit; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; -webkit-tap-highlight-color:transparent; }
    .bt ha-icon { --mdc-icon-size:16px; display:flex; }
    .bt.ok { background:${C.green}; color:#000; } .bt.ok[disabled] { opacity:.35; cursor:default; }
    .bt.del { background:rgba(255,69,58,.2); color:${C.red}; }
    .r { display:flex; align-items:center; gap:16px; min-height:40px; padding:2px 8px; margin:0 -8px 4px; border-radius:10px; background:rgba(118,118,128,.12); }
    .r .bd { flex:0 0 40px; height:40px; display:flex; align-items:center; justify-content:center; }
    .r .bd ha-icon { --mdc-icon-size:24px; color:var(--state-icon-color, #44739e); display:flex; }
    .r .nm { flex:1; min-width:0; font-size:14px; line-height:1.3; padding:4px 0; }
    .r .nm small { display:block; font-size:12px; color:var(--secondary-text-color); }
    .r .st { font-size:14px; white-space:nowrap; text-align:right; }
    .msg { font-size:12px; color:var(--secondary-text-color); padding:4px 2px 8px; }
  `;

  class WaschmaschinePlanCard extends HTMLElement {
    setConfig(c) { this._c = Object.assign({}, DEF, c || {}); }
    getCardSize() { return 4; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    set hass(h) { this._hass = h; this._render(); }
    _s(k) { return this._hass.states[this._c[k]]; }
    _durs() { if (!this._D) { try { this._D = JSON.parse(localStorage.getItem('wpc-dur') || '{}'); } catch (e) { this._D = {}; } } return this._D; }
    _dur(name) { const k = keyOf(name), D = this._durs(); if (D[k]) return { m: D[k].m, src: D[k].src || 'gemessen' }; return { m: DUR[k] || 120, src: DUR[k] ? 'Schätzung' : 'unbekannt' }; }
    _learn(k, m, src) { const D = this._durs(); if (!k || !(m > 5) || (D[k] && D[k].m === m && D[k].src === src)) return; D[k] = { m, src }; try { localStorage.setItem('wpc-dur', JSON.stringify(D)); } catch (e) {} }
    _v(k) { const s = this._s(k); return s ? s.state : ''; }

    async _programs() {
      if (this._pBusy) return; this._pBusy = true; this._pErr = '';
      try {
        const r = await this._hass.callService('miele', 'get_programs', { device_id: this._c.device_id }, undefined, false, true);
        const res = (r && r.response) || r || {};
        const arr = Array.isArray(res) ? res : Array.isArray(res.programs) ? res.programs : Object.values(res).find(Array.isArray) || [];
        const list = arr.map((p) => ({ id: p.program_id ?? p.programId ?? p.id, name: p.program ?? p.name ?? p.programName ?? String(p.program_id ?? p.id) }))
          .filter((p) => p.id != null && p.id !== 0);
        if (list.length) { this._list = list; this._live = true; } else this._pErr = 'Miele liefert keine Programme';
      } catch (e) { this._pErr = 'Programmliste nur abrufbar, wenn die Maschine an ist (MobileStart aktiv)'; }
      if (!this._list) { this._list = PREVIEW.map((k) => ({ id: null, name: DE[k] || k })); this._live = false; }
      this._pBusy = false; this._last = ''; this._render();
    }

    _render() {
      const H = this._hass; if (!H || !this._c) return;
      if (!this.shadowRoot) {
        const r = this.attachShadow({ mode: 'open' });
        r.innerHTML = `<style>${CSS}</style><ha-card><div class="hd"><div class="ttl"></div><span class="pls" style="display:flex;gap:8px"></span></div>
          <div class="pn"><div><div class="box"></div></div></div><div class="rows"></div></ha-card>`;
        r.querySelector('ha-card').addEventListener('click', (e) => this._click(e));
        r.querySelector('ha-card').addEventListener('change', (e) => { if (e.target.dataset.t && e.target.value) { this._f[e.target.dataset.t] = e.target.value; this._last = ''; this._render(); } });
      }
      const r = this.shadowRoot, set = (sel, html) => { const e = r.querySelector(sel); if (e && e.innerHTML !== html) e.innerHTML = html; };
      const mob = this._v('mobile') === 'on', akt = this._v('aktiv') === 'on', nt = this._v('notify_automation') === 'on';
      const pStart = akt ? new Date(this._v('p_start').replace(' ', 'T')) : null, pEnd = akt ? new Date(this._v('p_end').replace(' ', 'T')) : null;
      set('.ttl', esc(this._c.title));
      // Pillen oben rechts: Plan (nur mit MobileStart, aktivem Plan oder in der Testkarte) und Hinweis 'Wäsche leeren'
      const showPlan = mob || akt || this._c.test !== false;
      set('.pls', (showPlan ? `<button class="pl${this._open || akt ? ' on' : ''}" data-a="open"><ha-icon icon="mdi:calendar-clock" style="color:${C.orange}"></ha-icon>${akt ? 'Start ' + (tag(pStart) === 'heute' ? '' : tag(pStart) + ' ') + hm(pStart) : 'Planen'}</button>` : '')
        + `<button class="pl" data-a="notify" aria-label="Hinweis Wäsche leeren"><ha-icon icon="${nt ? 'mdi:bell-ring' : 'mdi:bell-off-outline'}" style="color:${nt ? C.green : C.gray}"></ha-icon>Hinweis</button>`);
      // Planungsfeld
      r.querySelector('.pn').classList.toggle('on', !!this._open);
      if (this._open) {
        const now = new Date();
        // Vorgabe: zuletzt genutzte Uhrzeiten (meist morgens), sonst 06:00 – 09:00; Programm ebenfalls vom letzten Plan
        // Vorgabe: zuletzt genutzte Art (Start um / Fertig um) und Uhrzeit, sonst Start 06:00
        if (!this._f) { let ls = null; try { ls = JSON.parse(localStorage.getItem('wpc-last') || 'null'); } catch (e) {}
          const id = +this._v('p_id') || null, name = this._v('p_name') || '';
          this._f = { id, name, mode: (ls && ls.mode) || 'start', time: (ls && ls.time) || '06:00', dur: this._dur(name).m }; }
        const f = this._f, L = this._list || [], d = this._dur(f.name), dur = f.dur || d.m;
        let ds, fe;
        if (f.mode === 'start') { ds = next(f.time, new Date(now.getTime() - 6e4)); fe = new Date(ds.getTime() + dur * 6e4); }
        else { fe = next(f.time, new Date(now.getTime() + dur * 6e4 - 6e4)); ds = new Date(fe.getTime() - dur * 6e4); }
        this._calc = { ds, fe, dur };
        const can = this._live && f.id != null && f.name;
        const QK = f.mode === 'start' ? ['05:00', '06:00', '07:00', '08:00'] : ['06:00', '07:00', '08:00', '09:00'];
        set('.box', `<div class="lb">Programm${this._pBusy ? '<small>wird geladen …</small>' : !this._live && L.length ? '<small>Vorschau – Maschine aus</small>' : ''}</div>
          <div class="pg">${L.map((p) => `<button data-p="${esc(p.id)}" data-n="${esc(p.name)}" class="${(p.id != null ? p.id === f.id : p.name === f.name) ? 'on' : ''}">${esc(p.name)}</button>`).join('')}</div>
          ${f.name ? `<div class="du"><ha-icon icon="mdi:timer-outline"></ha-icon><span>Dauer <b>${f.dur !== d.m ? '' : d.src === 'gemessen' ? '' : 'ca. '}${hmin(dur)}</b><small>${f.dur !== d.m ? 'angepasst' : d.src}</small></span>
            <button data-d="-5" aria-label="5 Minuten weniger">−</button><button data-d="5" aria-label="5 Minuten mehr">+</button></div>` : ''}
          <div class="sg"><button data-m="start" class="${f.mode === 'start' ? 'on' : ''}">Start um</button><button data-m="end" class="${f.mode === 'end' ? 'on' : ''}">Fertig um</button></div>
          <div class="qk">${QK.map((t) => `<button data-q="${t}" class="${f.time === t ? 'on' : ''}">${t}</button>`).join('')}${f.mode === 'start' ? '<button data-q="now">Sofort</button>' : ''}</div>
          <div class="tm"><label><span>${f.mode === 'start' ? 'Start um' : 'Fertig um'}</span><input type="time" data-t="time" value="${f.time}"><i>${tag(f.mode === 'start' ? ds : fe)}</i></label>
            <div class="cv"><span>${f.mode === 'start' ? 'Fertig ca.' : 'Start um'}</span><b>${hm(f.mode === 'start' ? fe : ds)}</b><i>${tag(f.mode === 'start' ? fe : ds)}</i></div></div>
          <div class="ac"><span class="hn">${esc(this._pErr || (mob ? 'MobileStart ist aktiv.' : 'Startet nur, wenn MobileStart an der Maschine aktiv ist.'))}</span>
            ${akt ? '<button class="bt del" data-a="del"><ha-icon icon="mdi:close"></ha-icon>Plan löschen</button>' : ''}
            <button class="bt ok" data-a="save"${can ? '' : ' disabled'}><ha-icon icon="mdi:check"></ha-icon>${akt ? 'Ändern' : 'Planen'}</button></div>`);
        r.querySelectorAll('input[data-t]').forEach((i) => { if (i !== r.activeElement && i.value !== this._f[i.dataset.t]) i.value = this._f[i.dataset.t]; });
      }
      // Zeilen: Plan, Status, MobileStart
      const st = this._s('status'), rem = this._s('remaining'), ende = this._s('ende'), el = H.states['sensor.waschmaschine_verstrichene_zeit'];
      if (st && st.state === 'in_use' && rem && el && !isNaN(+rem.state) && !isNaN(+el.state) && +el.state < 0.25) this._learn(this._v('program'), Math.round((+rem.state + +el.state) * 60), 'gemessen');
      const row = (ic, col, nm, sub, val, bg) => `<div class="r"${bg ? ` style="background:${bg}"` : ''}><div class="bd"><ha-icon icon="${ic}"${col ? ` style="color:${col}"` : ''}></ha-icon></div><div class="nm">${nm}${sub ? `<small>${sub}</small>` : ''}</div><div class="st">${val}</div></div>`;
      let h = '';
      if (akt) h += row('mdi:calendar-clock', C.orange, `<span style="color:${C.orange};font-weight:500">${esc(this._v('p_name') || 'Programm')}</span>`,
        `Start ${tag(pStart)} ${hm(pStart)} · fertig ca. ${hm(new Date(pStart.getTime() + this._dur(this._v('p_name')).m * 6e4))}`, mob ? '<span style="color:#30d158">bereit</span>' : '<span style="color:var(--secondary-text-color)">wartet auf MobileStart</span>', 'rgba(245,99,0,.16)');
      h += row('mdi:washing-machine', st && st.state === 'in_use' ? C.green : '', 'Status', '', esc(STAT[st && st.state] || (st ? st.state : '–')));
      h += row(mob ? 'mdi:cellphone-check' : 'mdi:cellphone-off', mob ? C.green : '', 'MobileStart', mob ? 'Programm kann aus der Ferne gestartet werden' : 'an der Maschine wählen, um zu planen', mob ? 'Aktiv' : 'Aus');
      if (st && st.state === 'in_use' && ende && !['unknown', 'unavailable'].includes(ende.state)) { const d = new Date(ende.state); if (!isNaN(d)) h += row('mdi:flag-checkered', '', 'Programmende', rem && !isNaN(+rem.state) ? `noch ${Math.round(+rem.state * 60)} min` : '', tag(d) + ' ' + hm(d)); }
      if (h !== this._rows) { this._rows = h; r.querySelector('.rows').innerHTML = h; }
    }

    _click(e) {
      const H = this._hass, c = this._c, b = e.target.closest('[data-a],[data-p],[data-q],[data-m],[data-d]'); if (!b) return;
      if (b.dataset.q) { this._f.time = b.dataset.q === 'now' ? hm(new Date(Date.now() + 6e4)) : b.dataset.q; this._render(); return; }
      if (b.dataset.m) { const k = this._calc; this._f.mode = b.dataset.m; if (k) this._f.time = hm(b.dataset.m === 'start' ? k.ds : k.fe); this._render(); return; }
      if (b.dataset.d) { this._f.dur = Math.max(10, (this._f.dur || this._dur(this._f.name).m) + +b.dataset.d); this._render(); return; }
      if (b.dataset.p !== undefined) { this._f.id = b.dataset.p === '' ? null : +b.dataset.p; this._f.name = b.dataset.n; this._f.dur = this._dur(b.dataset.n).m; this._render(); return; }
      const a = b.dataset.a;
      if (a === 'notify') { H.callService('automation', this._v('notify_automation') === 'on' ? 'turn_off' : 'turn_on', { entity_id: c.notify_automation }); return; }
      if (a === 'open') { this._open = !this._open; this._f = null; if (this._open && !this._live) this._programs(); this._render(); return; }
      if (a === 'del') { H.callService('input_boolean', 'turn_off', { entity_id: c.aktiv }); this._open = false; this._render(); return; }
      if (a === 'save' && !b.disabled) {
        const { ds } = this._calc, de = new Date(ds.getTime() + 2 * 36e5); // Plan verfaellt 2 h nach der Startzeit
        try { localStorage.setItem('wpc-last', JSON.stringify({ mode: this._f.mode, time: this._f.time })); } catch (e) {}
        if (this._f.dur !== this._dur(this._f.name).m) this._learn(keyOf(this._f.name), this._f.dur, 'angepasst');
        Promise.all([
          H.callService('input_number', 'set_value', { entity_id: c.p_id, value: this._f.id }),
          H.callService('input_text', 'set_value', { entity_id: c.p_name, value: this._f.name.slice(0, 100) }),
          H.callService('input_datetime', 'set_datetime', { entity_id: c.p_start, datetime: iso(ds) }),
          H.callService('input_datetime', 'set_datetime', { entity_id: c.p_end, datetime: iso(de) }),
        ]).then(() => H.callService('input_boolean', 'turn_on', { entity_id: c.aktiv }));
        this._open = false; this._render();
      }
    }
  }
  customElements.define(TAG, WaschmaschinePlanCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Waschmaschine Plan (Test)', description: 'Miele MobileStart mit Programm-Vorwahl, Start- und Endzeit' });
})();
