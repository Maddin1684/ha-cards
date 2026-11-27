// waschmaschine-plan-card v0.1 (27.11.2026, Testkarte): Miele MobileStart mit Programm-Vorwahl.
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
        r.querySelector('ha-card').addEventListener('change', (e) => { if (e.target.dataset.t) { this._f[e.target.dataset.t] = e.target.value; this._last = ''; this._render(); } });
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
        if (!this._f) { const s0 = akt ? pStart : new Date(Math.ceil((now.getTime() + 10 * 6e4) / 9e5) * 9e5), e0 = akt ? pEnd : new Date(s0.getTime() + 6 * 36e5);
          this._f = { start: hm(s0), end: hm(e0), id: akt ? +this._v('p_id') : null, name: akt ? this._v('p_name') : '' }; }
        const ds = next(this._f.start, new Date(now.getTime() - 6e4)), de = next(this._f.end, ds), L = this._list || [];
        const can = this._live && this._f.id != null && this._f.name;
        set('.box', `<div class="lb">Programm${this._pBusy ? '<small>wird geladen …</small>' : !this._live && L.length ? '<small>Vorschau – Maschine aus</small>' : ''}</div>
          <div class="pg">${L.map((p) => `<button data-p="${esc(p.id)}" data-n="${esc(p.name)}" class="${(p.id != null ? p.id === this._f.id : p.name === this._f.name) ? 'on' : ''}">${esc(p.name)}</button>`).join('')}</div>
          <div class="tm"><label><span>Start frühestens</span><input type="time" data-t="start" value="${this._f.start}"><i>${tag(ds)}</i></label>
            <label><span>Ende – Plan verfällt</span><input type="time" data-t="end" value="${this._f.end}"><i>${tag(de)}</i></label></div>
          <div class="ac"><span class="hn">${esc(this._pErr || (mob ? 'MobileStart ist aktiv – Start zur Startzeit.' : 'Startet, sobald MobileStart an der Maschine aktiv ist.'))}</span>
            ${akt ? '<button class="bt del" data-a="del"><ha-icon icon="mdi:close"></ha-icon>Plan löschen</button>' : ''}
            <button class="bt ok" data-a="save"${can ? '' : ' disabled'}><ha-icon icon="mdi:check"></ha-icon>${akt ? 'Ändern' : 'Planen'}</button></div>`);
        r.querySelectorAll('input[data-t]').forEach((i) => { if (i !== r.activeElement && i.value !== this._f[i.dataset.t]) i.value = this._f[i.dataset.t]; });
      }
      // Zeilen: Plan, Status, MobileStart
      const st = this._s('status'), rem = this._s('remaining'), ende = this._s('ende');
      const row = (ic, col, nm, sub, val, bg) => `<div class="r"${bg ? ` style="background:${bg}"` : ''}><div class="bd"><ha-icon icon="${ic}"${col ? ` style="color:${col}"` : ''}></ha-icon></div><div class="nm">${nm}${sub ? `<small>${sub}</small>` : ''}</div><div class="st">${val}</div></div>`;
      let h = '';
      if (akt) h += row('mdi:calendar-clock', C.orange, `<span style="color:${C.orange};font-weight:500">${esc(this._v('p_name') || 'Programm')}</span>`,
        `Start ab ${tag(pStart)} ${hm(pStart)} · verfällt ${tag(pEnd)} ${hm(pEnd)}`, mob ? '<span style="color:#30d158">bereit</span>' : '<span style="color:var(--secondary-text-color)">wartet auf MobileStart</span>', 'rgba(245,99,0,.16)');
      h += row('mdi:washing-machine', st && st.state === 'in_use' ? C.green : '', 'Status', '', esc(STAT[st && st.state] || (st ? st.state : '–')));
      h += row(mob ? 'mdi:cellphone-check' : 'mdi:cellphone-off', mob ? C.green : '', 'MobileStart', mob ? 'Programm kann aus der Ferne gestartet werden' : 'an der Maschine wählen, um zu planen', mob ? 'Aktiv' : 'Aus');
      if (st && st.state === 'in_use' && ende && !['unknown', 'unavailable'].includes(ende.state)) { const d = new Date(ende.state); if (!isNaN(d)) h += row('mdi:flag-checkered', '', 'Programmende', rem && !isNaN(+rem.state) ? `noch ${Math.round(+rem.state * 60)} min` : '', tag(d) + ' ' + hm(d)); }
      if (h !== this._rows) { this._rows = h; r.querySelector('.rows').innerHTML = h; }
    }

    _click(e) {
      const H = this._hass, c = this._c, b = e.target.closest('[data-a],[data-p]'); if (!b) return;
      if (b.dataset.p !== undefined) { this._f.id = b.dataset.p === '' ? null : +b.dataset.p; this._f.name = b.dataset.n; this._render(); return; }
      const a = b.dataset.a;
      if (a === 'notify') { H.callService('automation', this._v('notify_automation') === 'on' ? 'turn_off' : 'turn_on', { entity_id: c.notify_automation }); return; }
      if (a === 'open') { this._open = !this._open; this._f = null; if (this._open && !this._live) this._programs(); this._render(); return; }
      if (a === 'del') { H.callService('input_boolean', 'turn_off', { entity_id: c.aktiv }); this._open = false; this._render(); return; }
      if (a === 'save' && !b.disabled) {
        const now = new Date(), ds = next(this._f.start, new Date(now.getTime() - 6e4)), de = next(this._f.end, ds);
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
