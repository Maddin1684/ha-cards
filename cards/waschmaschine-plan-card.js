// waschmaschine-plan-card v0.7 (27.11.2026): nur noch Pille 'Planen' (gruen) oben rechts, Hinweis-Pille entfernt.
// v0.6 (27.11.2026): Programm wie in der App in der Karte waehlen (Liste von Miele bei aktivem MobileStart); Dauer aus den eigenen Waschgaengen der letzten 60 Tage, sonst Schaetzung; an der Maschine gewaehltes Programm wird weiter direkt uebernommen.
// v0.5 (27.11.2026): wie in der Miele-App – Programm an der Maschine waehlen (+ MobileStart),
// Programm und Dauer kommen direkt von der Maschine; in der Karte nur 'Start um' oder 'Fertig um' festlegen, die andere Zeit wird berechnet.
// Gestartet wird von der Automation 'Waschmaschine geplanter Start (MobileStart)' per Start-Knopf der Maschine; Plan verfaellt 2 h nach Startzeit.
// Zweite Pille: Hinweis 'Waschmaschine leeren' (Alexa/TV-Ansage) an/aus.
// v0.4: Dauer-Schaetzung je Programm; v0.3/v0.2: Morgen-Vorgaben, Schnellwahl; v0.1: Testkarte mit Programmliste aus der Miele-Cloud.
(() => {
  const TAG = 'waschmaschine-plan-card';
  if (customElements.get(TAG)) return;
  const C = { green: '#30d158', yellow: '#ffd60a', red: '#ff453a', orange: '#f56300', gray: '#8e8e93' };
  const DEF = {
    title: 'Waschmaschine', device_id: '4c973b1146d6b7f4db803425c41c4cc0', status: 'sensor.waschmaschine', mobile: 'binary_sensor.waschmaschine_mobiler_start',
    program: 'sensor.waschmaschine_programm', remaining: 'sensor.waschmaschine_verbleibende_zeit', ende: 'sensor.waschmaschine_ende',
    notify_automation: 'automation.waschmaschine_leeren', aktiv: 'input_boolean.waschmaschine_plan_aktiv', p_id: 'input_number.waschmaschine_plan_programm',
    p_name: 'input_text.waschmaschine_plan_name', p_start: 'input_datetime.waschmaschine_plan_start', p_end: 'input_datetime.waschmaschine_plan_ende',
  };
  const DE = { cottons: 'Baumwolle', eco_40_60: 'ECO 40-60', minimum_iron: 'Pflegeleicht', delicates: 'Feinwäsche', woollens: 'Wolle', silks: 'Seide', quick_power_wash: 'QuickPowerWash',
    express_20: 'Express 20', automatic_plus: 'Automatic plus', shirts: 'Oberhemden', denim: 'Jeans', dark_jeans: 'Dunkle Jeans', sportswear: 'Sportwäsche', outerwear: 'Outdoor',
    bed_linen: 'Bettwäsche', towels: 'Handtücher', dark_garments: 'Dunkle Wäsche', down_duvets: 'Daunen', down_filled_items: 'Daunen', pillows: 'Kopfkissen', rinse: 'Spülen',
    drain_spin: 'Abpumpen/Schleudern', clean_machine: 'Maschine reinigen', cottons_hygiene: 'Baumwolle Hygiene', baby_clothes: 'Babywäsche', curtains: 'Gardinen',
    hand_wash: 'Handwäsche', steam_care: 'Dampfglätten', freshen_up: 'Auffrischen', trainers: 'Sportschuhe', first_wash: 'Erstwäsche', table_linen: 'Tischwäsche',
    stuffed_toys: 'Kuscheltiere', starch: 'Stärken', proofing: 'Imprägnieren', express: 'Express', normal: 'Normal', smartmatic: 'SmartMatic' };
  // Schaetzwerte (Minuten), nur falls ein Programm hier noch nie gelaufen ist
  const DUR = { cottons: 159, eco_40_60: 199, minimum_iron: 109, delicates: 59, woollens: 39, silks: 44, quick_power_wash: 59, express_20: 20, automatic_plus: 99,
    shirts: 89, denim: 110, sportswear: 79, outerwear: 79, bed_linen: 119, towels: 129, dark_garments: 89, dark_jeans: 89, down_duvets: 99, pillows: 109, rinse: 29,
    drain_spin: 15, clean_machine: 89, baby_clothes: 129, curtains: 79, hand_wash: 49, cottons_hygiene: 169 };
  const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
  const keyOf = (name) => { const n = norm(name); if (DE[name]) return name;
    for (const [k, v] of Object.entries(DE)) if (norm(v) === n || norm(k) === n) return k;
    for (const [k, v] of Object.entries(DE)) { const w = norm(v); if (w.length > 3 && (n.includes(w) || w.includes(n))) return k; }
    return n; };
  const STAT = { off: 'Aus', on: 'An', idle: 'Bereit', in_use: 'Läuft', programmed: 'Programmiert', waiting_to_start: 'Wartet auf Start', pause: 'Pause',
    program_ended: 'Fertig', program_interrupted: 'Unterbrochen', failure: 'Störung', not_connected: 'Nicht verbunden' };
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const p2 = (n) => String(n).padStart(2, '0');
  const hm = (d) => p2(d.getHours()) + ':' + p2(d.getMinutes());
  const hmin = (m) => Math.floor(m / 60) + ':' + p2(Math.round(m % 60)) + ' h';
  const pname = (k) => DE[k] || String(k || '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  const tag = (d) => { const t = new Date(); t.setHours(0, 0, 0, 0); const x = new Date(d); x.setHours(0, 0, 0, 0); const k = Math.round((x - t) / 864e5); return k === 0 ? 'heute' : k === 1 ? 'morgen' : `${d.getDate()}.${d.getMonth() + 1}.`; };
  const iso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:00`;
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
    .pl.on { background:rgba(48,209,88,.2); }
    .pn { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; }
    .pn.on { grid-template-rows:1fr; }
    .pn > div { overflow:hidden; min-height:0; }
    .box { background:rgba(118,118,128,.12); border-radius:10px; padding:10px 10px 12px; margin:4px -8px 8px; }
    .du { display:flex; align-items:center; gap:10px; background:rgba(118,118,128,.18); border-radius:10px; padding:8px 10px; margin-bottom:10px; min-height:24px; }
    .du ha-icon { --mdc-icon-size:20px; color:${C.orange}; display:flex; }
    .du span { flex:1; font-size:14px; } .du b { font-weight:500; } .du small { font-size:11px; color:var(--secondary-text-color); }
    .pg { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; max-height:136px; overflow-y:auto; } .pg .hn { font-size:12px; color:var(--secondary-text-color); }
    .pg button { border:0; font:inherit; font-size:13px; padding:6px 11px; border-radius:15px; background:rgba(118,118,128,.24); color:var(--primary-text-color); cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .pg button.on { background:${C.orange}; color:#fff; }
    .du .dr { flex:0 0 auto; color:var(--secondary-text-color); } .du .dr b { color:var(--primary-text-color); }
    .sg { display:flex; padding:2px; border-radius:9px; background:rgba(118,118,128,.18); margin-bottom:8px; }
    .sg button { flex:1; border:0; background:none; color:var(--secondary-text-color); font:inherit; font-size:13px; padding:5px 8px; border-radius:7px; cursor:pointer; }
    .sg button.on { background:rgba(118,118,128,.36); color:var(--primary-text-color); font-weight:500; }
    .qk { display:flex; gap:6px; margin-bottom:8px; flex-wrap:wrap; }
    .qk button { border:0; font:inherit; font-size:13px; padding:5px 11px; border-radius:15px; background:rgba(118,118,128,.24); color:var(--primary-text-color); cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .qk button.on { background:rgba(245,99,0,.3); }
    .tm { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
    .tm label, .cv { display:block; border-radius:10px; padding:6px 10px; }
    .tm label { background:rgba(118,118,128,.18); } .cv { background:rgba(118,118,128,.1); }
    .tm span { display:block; font-size:11px; color:var(--secondary-text-color); }
    .tm input { width:100%; box-sizing:border-box; border:0; background:none; color:var(--primary-text-color); font:inherit; font-size:20px; padding:2px 0; color-scheme:dark; }
    .cv b { display:block; font-size:20px; font-weight:400; padding:2px 0; }
    .tm i { display:block; font-style:normal; font-size:11px; color:var(--secondary-text-color); min-height:13px; }
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
  `;

  class WaschmaschinePlanCard extends HTMLElement {
    setConfig(c) { this._c = Object.assign({}, DEF, c || {}); }
    getCardSize() { return 4; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    set hass(h) { this._hass = h; this._render(); }
    _s(k) { return this._hass.states[this._c[k]]; }
    _v(k) { const s = this._s(k); return s ? s.state : ''; }
    // Programm und Dauer, wie an der Maschine vorgewaehlt (Miele meldet beides sofort nach der Auswahl)
    // Dauer je Programm aus den letzten 60 Tagen (Prognose der Maschine beim Programmstart)
    async _hist() {
      if (this._hBusy || this._H) return; this._hBusy = true; const D = {};
      try { const now = new Date(), r = await this._hass.callWS({ type: 'history/history_during_period', start_time: new Date(now - 60 * 864e5).toISOString(), end_time: now.toISOString(),
          entity_ids: [this._c.program, this._c.remaining], minimal_response: true, no_attributes: true, significant_changes_only: false });
        const ts = (x) => (x.lu || x.lc || 0) * 1000, P = (r[this._c.program] || []), R = (r[this._c.remaining] || []).map((x) => [ts(x), +x.s]).filter((x) => x[1] > 0);
        P.forEach((x) => { const k = x.s; if (!k || ['no_program', 'unknown', 'unavailable'].includes(k)) return; const t = ts(x), m = R.find((y) => y[0] >= t - 5e3 && y[0] < t + 6e5); if (m) D[k] = m[1]; });
      } catch (e) {}
      this._H = D; this._hBusy = false; this._render();
    }
    async _programs() {
      if (this._pBusy) return; this._pBusy = true;
      try { const r = await this._hass.callService('miele', 'get_programs', { device_id: this._c.device_id }, undefined, false, true);
        const res = (r && r.response) || r || {}, arr = Array.isArray(res) ? res : Array.isArray(res.programs) ? res.programs : Object.values(res).find(Array.isArray) || [];
        this._list = arr.map((p) => ({ id: p.program_id ?? p.programId ?? p.id, name: p.program ?? p.name ?? p.programName })).filter((p) => p.id != null && p.id !== 0 && p.name);
        this._lerr = this._list.length ? '' : 'Miele liefert keine Programme.';
      } catch (e) { this._list = []; this._lerr = 'Programme erst abrufbar, wenn MobileStart aktiv ist.'; }
      this._pBusy = false; this._render();
    }
    _durOf(name) { const k = keyOf(name), H = this._H || {}; return H[k] ? { m: H[k], src: 'letzter Waschgang' } : DUR[k] ? { m: DUR[k], src: 'Schätzung' } : { m: 0, src: '' }; }
    _pre() { const k = this._v('program'), rm = +this._v('remaining');
      return k && !['no_program', 'unknown', 'unavailable', ''].includes(k) ? { key: k, name: pname(k), dur: rm > 0 ? rm : 0 } : null; }

    _render() {
      const H = this._hass; if (!H || !this._c) return;
      if (!this.shadowRoot) {
        const r = this.attachShadow({ mode: 'open' });
        r.innerHTML = `<style>${CSS}</style><ha-card><div class="hd"><div class="ttl"></div><span class="pls" style="display:flex;gap:8px"></span></div>
          <div class="pn"><div><div class="box"></div></div></div><div class="rows"></div></ha-card>`;
        r.querySelector('ha-card').addEventListener('click', (e) => this._click(e));
        r.querySelector('ha-card').addEventListener('change', (e) => { if (e.target.dataset.t && e.target.value) { this._f.time = e.target.value; this._render(); } });
      }
      const r = this.shadowRoot, set = (sel, html) => { const e = r.querySelector(sel); if (e && e.innerHTML !== html) e.innerHTML = html; };
      const mob = this._v('mobile') === 'on', akt = this._v('aktiv') === 'on', nt = this._v('notify_automation') === 'on';
      const pStart = akt ? new Date(this._v('p_start').replace(' ', 'T')) : null;
      set('.ttl', esc(this._c.title));
      const showPlan = mob || akt || this._c.test !== false;
      set('.pls', (showPlan ? `<button class="pl${this._open || akt ? ' on' : ''}" data-a="open"><ha-icon icon="mdi:calendar-clock" style="color:${C.green}"></ha-icon>${akt ? 'Start ' + (tag(pStart) === 'heute' ? '' : tag(pStart) + ' ') + hm(pStart) : 'Planen'}</button>` : '')
);
      r.querySelector('.pn').classList.toggle('on', !!this._open);
      if (this._open) {
        const now = new Date();
        if (!this._f) { let ls = null; try { ls = JSON.parse(localStorage.getItem('wpc-last') || 'null'); } catch (e) {} this._f = { mode: (ls && ls.mode) || 'start', time: (ls && ls.time) || '06:00' }; }
        const f = this._f, PM = this._pre(), sel = !PM && f.name ? this._durOf(f.name) : null;
        const P = PM || (f.name ? { name: f.name, dur: sel.m, src: sel.src, id: f.id } : null), dur = P ? P.dur : 0;
        let ds, fe;
        if (f.mode === 'start') { ds = next(f.time, new Date(now.getTime() - 6e4)); fe = new Date(ds.getTime() + dur * 6e4); }
        else { fe = next(f.time, new Date(now.getTime() + dur * 6e4 - 6e4)); ds = new Date(fe.getTime() - dur * 6e4); }
        this._calc = { ds, P };
        const can = !!(P && dur && mob && (PM || f.id != null));
        const QK = f.mode === 'start' ? ['05:00', '06:00', '07:00', '08:00'] : ['06:00', '07:00', '08:00', '09:00'];
        const own = f.mode === 'start' ? ds : fe, oth = f.mode === 'start' ? fe : ds;
        const L = this._list || [];
        set('.box', (!PM ? `<div class="pg">${this._pBusy ? '<span class="hn">Programme werden geladen …</span>' : L.length ? L.map((p) => `<button data-p="${esc(p.id)}" data-n="${esc(p.name)}" class="${p.id === f.id ? 'on' : ''}">${esc(p.name)}</button>`).join('') : `<span class="hn">${esc(this._lerr || '')}</span>`}</div>` : '')
          + (P ? `<div class="du"><ha-icon icon="mdi:washing-machine"></ha-icon><span><b>${esc(P.name)}</b>${P.src && P.src !== 'letzter Waschgang' ? '<small> ' + P.src + '</small>' : ''}</span><span class="dr">${dur ? 'Dauer <b>' + (P.src === 'Schätzung' ? 'ca. ' : '') + hmin(dur) + '</b>' : 'Dauer unbekannt'}</span></div>` : '')
          + `<div class="sg"><button data-m="start" class="${f.mode === 'start' ? 'on' : ''}">Start um</button><button data-m="end" class="${f.mode === 'end' ? 'on' : ''}">Fertig um</button></div>
          <div class="qk">${QK.map((t) => `<button data-q="${t}" class="${f.time === t ? 'on' : ''}">${t}</button>`).join('')}${f.mode === 'start' ? '<button data-q="now">Sofort</button>' : ''}</div>
          <div class="tm"><label><span>${f.mode === 'start' ? 'Start um' : 'Fertig um'}</span><input type="time" data-t="time" value="${f.time}"><i>${tag(own)}</i></label>
            <div class="cv"><span>${f.mode === 'start' ? 'Fertig um' : 'Start um'}</span><b>${dur ? hm(oth) : '–'}</b><i>${dur ? tag(oth) : ''}</i></div></div>
          <div class="ac"><span class="hn">${P && !mob ? 'MobileStart ist nicht aktiv.' : ''}</span>
            ${akt ? '<button class="bt del" data-a="del"><ha-icon icon="mdi:close"></ha-icon>Plan löschen</button>' : ''}
            <button class="bt ok" data-a="save"${can ? '' : ' disabled'}><ha-icon icon="mdi:check"></ha-icon>${akt ? 'Ändern' : 'Planen'}</button></div>`);
        r.querySelectorAll('input[data-t]').forEach((i) => { if (i !== r.activeElement && i.value !== f.time) i.value = f.time; });
      }
      // Zeilen: Plan, Status, MobileStart, Programmende
      const st = this._s('status'), rem = +this._v('remaining'), ende = this._s('ende');
      const row = (ic, col, nm, sub, val, bg) => `<div class="r"${bg ? ` style="background:${bg}"` : ''}><div class="bd"><ha-icon icon="${ic}"${col ? ` style="color:${col}"` : ''}></ha-icon></div><div class="nm">${nm}${sub ? `<small>${sub}</small>` : ''}</div><div class="st">${val}</div></div>`;
      let h = '';
      if (akt) h += row('mdi:calendar-clock', C.orange, `<span style="color:${C.orange};font-weight:500">${esc(this._v('p_name') || 'Programm')}</span>`,
        `Start ${tag(pStart)} ${hm(pStart)}` + (rem > 0 ? ` · fertig ${hm(new Date(pStart.getTime() + rem * 6e4))}` : ''), mob ? '<span style="color:#30d158">bereit</span>' : '<span style="color:var(--secondary-text-color)">wartet auf MobileStart</span>', 'rgba(245,99,0,.16)');
      const P = this._pre();
      h += row('mdi:washing-machine', st && st.state === 'in_use' ? C.green : '', 'Status', P && !akt && st && st.state !== 'in_use' ? `${esc(P.name)}${rem > 0 ? ' · Dauer ' + hmin(rem) : ''}` : '', esc(STAT[st && st.state] || (st ? st.state : '–')));
      h += row(mob ? 'mdi:cellphone-check' : 'mdi:cellphone-off', mob ? C.green : '', 'MobileStart', mob ? 'Programm kann aus der Ferne gestartet werden' : 'an der Maschine wählen, um zu planen', mob ? 'Aktiv' : 'Aus');
      if (st && st.state === 'in_use' && ende && !['unknown', 'unavailable'].includes(ende.state)) { const d = new Date(ende.state); if (!isNaN(d)) h += row('mdi:flag-checkered', '', 'Programmende', rem > 0 ? `noch ${hmin(rem)}` : '', tag(d) + ' ' + hm(d)); }
      if (h !== this._rows) { this._rows = h; r.querySelector('.rows').innerHTML = h; }
    }

    _click(e) {
      const H = this._hass, c = this._c, b = e.target.closest('[data-a],[data-q],[data-m],[data-p]'); if (!b) return;
      if (b.dataset.p !== undefined) { this._f.id = +b.dataset.p; this._f.name = b.dataset.n; this._render(); return; }
      if (b.dataset.q) { this._f.time = b.dataset.q === 'now' ? hm(new Date(Date.now() + 6e4)) : b.dataset.q; this._render(); return; }
      if (b.dataset.m) { const k = this._calc, dur = k && k.P ? k.P.dur : 0; this._f.mode = b.dataset.m;
        if (k) this._f.time = hm(b.dataset.m === 'start' ? k.ds : new Date(k.ds.getTime() + dur * 6e4)); this._render(); return; }
      const a = b.dataset.a;
      if (a === 'notify') { H.callService('automation', this._v('notify_automation') === 'on' ? 'turn_off' : 'turn_on', { entity_id: c.notify_automation }); return; }
      if (a === 'open') { this._open = !this._open; this._f = null; if (this._open) { this._hist(); if (!this._pre()) this._programs(); } this._render(); return; }
      if (a === 'del') { H.callService('input_boolean', 'turn_off', { entity_id: c.aktiv }); this._open = false; this._render(); return; }
      if (a === 'save' && !b.disabled) {
        const { ds, P } = this._calc, de = new Date(ds.getTime() + 2 * 36e5); // Plan verfaellt 2 h nach der Startzeit
        try { localStorage.setItem('wpc-last', JSON.stringify({ mode: this._f.mode, time: this._f.time })); } catch (e) {}
        Promise.all([
          H.callService('input_number', 'set_value', { entity_id: c.p_id, value: this._pre() ? 0 : this._f.id }), // 0 = an der Maschine vorgewaehlt -> nur Start-Knopf
          H.callService('input_text', 'set_value', { entity_id: c.p_name, value: P.name.slice(0, 100) }),
          H.callService('input_datetime', 'set_datetime', { entity_id: c.p_start, datetime: iso(ds) }),
          H.callService('input_datetime', 'set_datetime', { entity_id: c.p_end, datetime: iso(de) }),
        ]).then(() => H.callService('input_boolean', 'turn_on', { entity_id: c.aktiv }));
        this._open = false; this._render();
      }
    }
  }
  customElements.define(TAG, WaschmaschinePlanCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Waschmaschine Plan (Test)', description: 'Miele MobileStart: Start- oder Fertigzeit für das an der Maschine gewählte Programm' });
})();
