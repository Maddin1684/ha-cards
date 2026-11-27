// beleuchtung-card v1.6 (27.11.2026: statt Stift in der Karte ein grafischer Karten-Editor (Karte bearbeiten) – Kategorien und Lampen hinzufuegen, entfernen, umbenennen, sortieren; YAML bleibt ueber den Code-Editor; v1.5: Stift-Bearbeiten in der Karte; v1.4 (26.11.2026: Knopf heisst jetzt 'Alle ausschalten'; v1.3 (25.11.2026: Knopf 'Alle aus' nur sichtbar, wenn mindestens ein Licht an ist; v1.2: Knopf 'Alle aus' neben dem Titel – schaltet alle eingeschalteten Lampen der Karte aus, blass wenn keine an ist; v1.1: Raum-Icons immer weiss, Status bricht um statt den Raumnamen zu kuerzen, Lampen-Karten ohne eigenen Rahmen/Hintergrund; v1.0: Beleuchtung als Liste im Stil der wetterstation-liste-card – jeder Raum ein Kaestchen im Apple-Grau,
// Status rechts ('alle ausgeschaltet' / 'x Lichter an' gelb), dezentes Plus/Minus im Kreis zum Aufklappen, aufgeklappt die bisherigen
// Lampen-Karten (mushroom-light-card) des Raums; ersetzt die Entitaetenkarte mit fold-entity-row).
// Konfiguration: title, rooms: [{ name, icon, cards: [Karten-Konfigurationen] }] – die Lampen werden aus cards[].entity gelesen.
(() => {
  const TAG = 'beleuchtung-card';
  if (customElements.get(TAG)) return;

  const C = { yellow: '#ffd60a' };
  const CSS = `
    :host { display:block; container-type:inline-size; }
    ha-card { padding:4px 0 8px; overflow:hidden; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 4px; color:var(--ha-card-header-color, var(--primary-text-color)); }
    .hd { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:48px; }
    .off { flex:0 0 auto; display:flex; align-items:center; gap:6px; height:30px; padding:0 12px 0 10px; border:0; border-radius:15px; background:rgba(118,118,128,.24); color:var(--primary-text-color); font:inherit; font-size:13px; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:opacity .2s; }
    .off ha-icon { --mdc-icon-size:16px; display:flex; color:${C.yellow}; }
    .off.none { opacity:.4; cursor:default; }
    .off.none ha-icon { color:var(--secondary-text-color); }
    .body { padding:0 16px 4px; }
    .room { padding:0 8px 2px; margin:0 -8px 4px; border-radius:10px; background:rgba(118,118,128,.12); }
    .room:last-child { margin-bottom:4px; }
    .r { display:flex; align-items:flex-start; min-height:40px; column-gap:16px; cursor:pointer; -webkit-tap-highlight-color:transparent; user-select:none; }
    .bd { flex:0 0 40px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; }
    .bd ha-icon { --mdc-icon-size:24px; color:#fff; display:inline-flex; }
    .nm { flex:0 0 auto; max-width:60%; font-size:14px; line-height:1.3; padding:10px 0 4px; color:var(--primary-text-color); }
    .st { flex:1 1 auto; min-width:0; padding:10px 0 4px; font-size:14px; line-height:1.3; text-align:right; color:var(--primary-text-color); }
    .pc { flex:0 0 14px; padding-top:13px; color:var(--secondary-text-color); opacity:.7; display:flex; justify-content:flex-end; }
    .pc ha-icon { --mdc-icon-size:13px; display:flex; }
    .pc .m, .room.open .pc .p { display:none !important; }
    .room.open .pc .m { display:flex !important; }
    .fb { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; }
    .room.open .fb { grid-template-rows:1fr; }
    .fi { overflow:hidden; min-height:0; }
    .hb { display:flex; gap:8px; }
    .fi > * { display:block; margin:0 0 4px; --ha-card-background:transparent; --card-background-color:transparent; --ha-card-box-shadow:none; --ha-card-border-width:0; --ha-card-border-color:transparent; --ha-card-backdrop-filter:none; }
  `;

  const morph = (a, b) => {
    const an = Array.from(a.childNodes), bn = Array.from(b.childNodes);
    bn.forEach((y, i) => {
      const x = an[i];
      if (!x) { a.appendChild(y); return; }
      if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName) { a.replaceChild(y, x); return; }
      if (x.nodeType !== 1) { if (x.nodeValue !== y.nodeValue) x.nodeValue = y.nodeValue; return; }
      if (!x.localName.includes('-')) Array.from(x.attributes).forEach((at) => { if (!y.hasAttribute(at.name)) x.removeAttribute(at.name); });
      Array.from(y.attributes).forEach((at) => { if (x.getAttribute(at.name) !== at.value) x.setAttribute(at.name, at.value); });
      if (!x.hasAttribute('data-keep')) morph(x, y);
    });
    for (let i = an.length - 1; i >= bn.length; i--) a.removeChild(an[i]);
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

  class BeleuchtungCard extends HTMLElement {
    setConfig(c) {
      if (!c || !Array.isArray(c.rooms)) throw new Error('rooms fehlt');
      Object.values(this._cards || {}).forEach((l) => (l || []).forEach((el) => el && el.remove()));
      this._c = c; this._cards = {}; this._last = '';
      try { this._open = JSON.parse(localStorage.getItem('blc-open') || 'null') || {}; } catch (e) { this._open = {}; }
    }
    static getConfigElement() { return document.createElement(TAG + '-editor'); }
    static getStubConfig() { return { title: 'Beleuchtung', rooms: [{ name: 'Wohnen', icon: 'mdi:sofa', cards: [] }] }; }
    getCardSize() { return 2 + this._c.rooms.length; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    set hass(h) {
      this._hass = h; this._render();
      Object.values(this._cards).forEach((list) => (list || []).forEach((el) => { if (el) el.hass = h; }));
    }
    _lights(r) { return (r.lights || (r.cards || []).map((k) => k.entity)).filter(Boolean); }
    _render() {
      const H = this._hass; if (!H || !this._c) return;
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      if (!root.querySelector('ha-card')) {
        root.innerHTML = `<style>${CSS}</style><ha-card></ha-card>`;
        root.querySelector('ha-card').addEventListener('click', (ev) => this._click(ev));
      }
      const html = this._html();
      if (html !== this._last) { const t = document.createElement('template'); t.innerHTML = html; morph(root.querySelector('ha-card'), t.content); this._last = html; }
      this._mount(root);
    }
    async _mount(root) {
      for (const [i, r] of this._c.rooms.entries()) {
        if (!this._open[i] || this._cards[i] !== undefined) continue;
        this._cards[i] = null;
        const helpers = await window.loadCardHelpers();
        this._cards[i] = (r.cards || []).map((cfg) => { const el = helpers.createCardElement(cfg); el.hass = this._hass; return el; });
      }
      Object.entries(this._cards).forEach(([i, list]) => {
        const slot = root.querySelector(`[data-slot="${i}"]`);
        if (slot && list) list.forEach((el) => { if (el.parentNode !== slot) slot.appendChild(el); });
      });
    }
    _click(ev) {
      const off = ev.target.closest('[data-alloff]');
      if (off) { const ids = this._c.rooms.flatMap((r) => this._lights(r)).filter((id) => this._hass.states[id] && this._hass.states[id].state === 'on');
        if (ids.length) this._hass.callService('light', 'turn_off', { entity_id: ids }); return; }
      const row = ev.target.closest('.r'); if (!row) return;
      const i = +row.dataset.i;
      this._open[i] = !this._open[i];
      try { localStorage.setItem('blc-open', JSON.stringify(this._open)); } catch (e) {}
      row.parentElement.classList.toggle('open', !!this._open[i]);
      this._last = ''; this._render();
    }
    _html() {
      const H = this._hass, out = [];
      const anyOn = this._c.rooms.some((r) => this._lights(r).some((id) => H.states[id] && H.states[id].state === 'on'));
      if (this._c.title !== false) out.push(`<div class="hd"><span>${esc(this._c.title || 'Beleuchtung')}</span><span class="hb">${anyOn ? '<button class="off" data-alloff="1" aria-label="Alle Lichter ausschalten"><ha-icon icon="mdi:lightbulb-group-off-outline"></ha-icon>Alle ausschalten</button>' : ''}</span></div>`);
      const rows = this._c.rooms.map((r, i) => {
        const on = this._lights(r).filter((id) => H.states[id] && H.states[id].state === 'on').length;
        const txt = on === 0 ? 'alle ausgeschaltet' : on === 1 ? '1 Licht an' : `${on} Lichter an`;
        return `<div class="room${this._open[i] ? ' open' : ''}"><div class="r" data-i="${i}"><div class="bd"><ha-icon icon="${esc(r.icon || 'mdi:lightbulb-group')}"></ha-icon></div>
          <div class="nm">${esc(r.name)}</div><div class="st"${on ? ` style="color:${C.yellow}"` : ''}>${txt}</div>
          <div class="pc"><ha-icon class="p" icon="mdi:plus-circle-outline"></ha-icon><ha-icon class="m" icon="mdi:minus-circle-outline"></ha-icon></div></div>
          <div class="fb"><div class="fi" data-slot="${i}" data-keep></div></div></div>`;
      });
      out.push(`<div class="body">${rows.join('')}</div>`);
      return out.join('');
    }
  }

  customElements.define(TAG, BeleuchtungCard);
  /* ---------- Grafischer Editor: Kategorien und Lampen hinzufuegen, entfernen, umbenennen, sortieren ---------- */
  const ECSS = `
    :host { display:block; }
    .row { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
    .row label { font-size:13px; color:var(--secondary-text-color); flex:0 0 auto; }
    .ed { flex:0 0 auto; display:flex; align-items:center; gap:6px; height:30px; padding:0 12px 0 10px; border:0; border-radius:15px; background:rgba(118,118,128,.24); color:var(--primary-text-color); font:inherit; font-size:13px; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .ed ha-icon { --mdc-icon-size:16px; display:flex; }
    .ed.sv { background:#30d158; color:#000; } .ed.sv[disabled] { opacity:.5; }
    .eroom { padding:6px 8px 8px; margin:0 -8px 6px; border-radius:10px; background:rgba(118,118,128,.12); }
    .eh { display:flex; align-items:center; gap:6px; }
    .eh input { min-width:0; height:32px; box-sizing:border-box; border:0; border-radius:8px; background:rgba(118,118,128,.24); color:var(--primary-text-color); font:inherit; font-size:14px; padding:0 8px; }
    .eh input.n { flex:1; } .eh input.i { flex:0 0 34%; font-size:12px; }
    .eh .ic { flex:0 0 32px; display:flex; justify-content:center; } .eh .ic ha-icon { --mdc-icon-size:22px; color:#fff; }
    .ib { flex:0 0 30px; width:30px; height:30px; border:0; border-radius:15px; background:rgba(118,118,128,.24); color:var(--primary-text-color); display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0; -webkit-tap-highlight-color:transparent; }
    .ib ha-icon { --mdc-icon-size:16px; display:flex; } .ib.del { background:rgba(255,69,58,.2); color:#ff453a; } .ib[disabled] { opacity:.25; cursor:default; }
    .el { display:flex; align-items:center; gap:8px; padding:6px 0 0 38px; font-size:13px; }
    .el span { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .el small { color:var(--secondary-text-color); margin-left:6px; }
    .el .ib { flex-basis:26px; width:26px; height:26px; }
    .add { display:flex; padding:8px 0 0 38px; }
    .add select { flex:1; min-width:0; height:32px; border:0; border-radius:8px; background:rgba(118,118,128,.24); color:var(--primary-text-color); font:inherit; font-size:13px; padding:0 8px; color-scheme:dark; }
    .nk { display:flex; justify-content:center; padding:4px 0; }
    .msg { font-size:12px; color:#ff453a; padding:0 16px 6px; }
    .eroom { margin:0 0 8px; background:var(--secondary-background-color, rgba(118,118,128,.12)); }
    input.t { flex:1; height:36px; box-sizing:border-box; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); color:var(--primary-text-color); font:inherit; font-size:14px; padding:0 10px; }
    .eh input { background:var(--card-background-color); border:1px solid var(--divider-color); }
    .eh .ic ha-icon { color:var(--primary-text-color); }
    .add select { background:var(--card-background-color); border:1px solid var(--divider-color); }
    .ed { background:var(--secondary-background-color, rgba(118,118,128,.24)); }
  `;
  class BeleuchtungCardEditor extends HTMLElement {
    setConfig(c) { const j = JSON.stringify(c); if (j === this._sent) return; this._c = JSON.parse(j); if (!Array.isArray(this._c.rooms)) this._c.rooms = []; this._draw(); }
    set hass(h) { const first = !this._hass; this._hass = h; if (first) this._draw(); }
    _emit(redraw) { this._sent = JSON.stringify(this._c); this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: JSON.parse(this._sent) }, bubbles: true, composed: true })); if (redraw) this._draw(); }
    _tpl() { const all = this._c.rooms.flatMap((r) => r.cards || []), t = all.find((k) => k.type) || {}; const o = JSON.parse(JSON.stringify(t)); delete o.entity; delete o.name; delete o.icon; return o; }
    _draw() {
      if (!this._c || !this._hass) return;
      const r = this.shadowRoot || this.attachShadow({ mode: 'open' });
      if (!r.querySelector('.wrap')) {
        r.innerHTML = `<style>${ECSS}</style><div class="wrap"></div>`;
        r.addEventListener('click', (ev) => this._click(ev));
        r.addEventListener('input', (ev) => { const t = ev.target;
          if (t.dataset.title !== undefined) { this._c.title = t.value; return this._emit(); }
          if (!t.dataset.f) return; this._c.rooms[+t.dataset.r][t.dataset.f] = t.value;
          if (t.dataset.f === 'icon') { const ic = t.closest('.eh').querySelector('.ic ha-icon'); if (ic) ic.setAttribute('icon', t.value || 'mdi:lightbulb-group'); }
          this._emit(); });
        r.addEventListener('change', (ev) => { const t = ev.target; if (t.dataset.add === undefined || !t.value) return;
          const rm = this._c.rooms[+t.dataset.add]; rm.cards = rm.cards || []; rm.cards.push(Object.assign(this._tpl(), { entity: t.value })); this._emit(true); });
      }
      const H = this._hass, D = this._c.rooms, fn = (id) => (H.states[id] && H.states[id].attributes.friendly_name) || id;
      const lights = Object.keys(H.states).filter((id) => id.startsWith('light.')).sort((a, b) => fn(a).localeCompare(fn(b), 'de'));
      r.querySelector('.wrap').innerHTML = `<div class="row"><label>Titel</label><input class="t" data-title value="${esc(this._c.title || '')}" placeholder="Beleuchtung"></div>`
        + D.map((rm, i) => { const used = (rm.cards || []).map((k) => k.entity);
          return `<div class="eroom"><div class="eh"><div class="ic"><ha-icon icon="${esc(rm.icon || 'mdi:lightbulb-group')}"></ha-icon></div>
            <input class="n" data-f="name" data-r="${i}" value="${esc(rm.name || '')}" placeholder="Name"><input class="i" data-f="icon" data-r="${i}" value="${esc(rm.icon || '')}" placeholder="mdi:…">
            <button class="ib" data-e="up" data-r="${i}"${i ? '' : ' disabled'} title="nach oben"><ha-icon icon="mdi:chevron-up"></ha-icon></button>
            <button class="ib" data-e="down" data-r="${i}"${i < D.length - 1 ? '' : ' disabled'} title="nach unten"><ha-icon icon="mdi:chevron-down"></ha-icon></button>
            <button class="ib del" data-e="delroom" data-r="${i}" title="Kategorie entfernen"><ha-icon icon="mdi:trash-can-outline"></ha-icon></button></div>
            ${(rm.cards || []).map((k, l) => `<div class="el"><span>${esc(k.name || fn(k.entity))}<small>${esc(k.entity || '')}</small></span><button class="ib del" data-e="dellamp" data-r="${i}" data-l="${l}" title="Lampe entfernen"><ha-icon icon="mdi:close"></ha-icon></button></div>`).join('')}
            <div class="add"><select data-add="${i}"><option value="">+ Lampe hinzufügen …</option>${lights.filter((id) => !used.includes(id)).map((id) => `<option value="${esc(id)}">${esc(fn(id))}</option>`).join('')}</select></div></div>`; }).join('')
        + `<div class="nk"><button class="ed" data-e="addroom"><ha-icon icon="mdi:plus"></ha-icon>Kategorie hinzufügen</button></div>`;
    }
    _click(ev) {
      const b = ev.target.closest('[data-e]'); if (!b || b.disabled) return; const D = this._c.rooms, i = +b.dataset.r, a = b.dataset.e;
      if (a === 'up' && i > 0) [D[i - 1], D[i]] = [D[i], D[i - 1]];
      else if (a === 'down' && i < D.length - 1) [D[i + 1], D[i]] = [D[i], D[i + 1]];
      else if (a === 'delroom') { if (!confirm(`Kategorie „${D[i].name}" entfernen?`)) return; D.splice(i, 1); }
      else if (a === 'dellamp') D[i].cards.splice(+b.dataset.l, 1);
      else if (a === 'addroom') D.push({ name: 'Neue Kategorie', icon: 'mdi:lightbulb-group', cards: [] });
      else return;
      this._emit(true);
    }
  }
  if (!customElements.get(TAG + '-editor')) customElements.define(TAG + '-editor', BeleuchtungCardEditor);

  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Beleuchtung', description: 'Raeume mit Lichtstatus, aufklappbar mit den Lampen-Karten' });
})();
