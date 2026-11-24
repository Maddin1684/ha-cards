// beleuchtung-card v1.2 (25.11.2026: Knopf 'Alle aus' neben dem Titel – schaltet alle eingeschalteten Lampen der Karte aus, blass wenn keine an ist; v1.1: Raum-Icons immer weiss, Status bricht um statt den Raumnamen zu kuerzen, Lampen-Karten ohne eigenen Rahmen/Hintergrund; v1.0: Beleuchtung als Liste im Stil der wetterstation-liste-card – jeder Raum ein Kaestchen im Apple-Grau,
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
    .hd { display:flex; align-items:center; justify-content:space-between; gap:12px; }
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
      this._c = c; this._cards = {}; this._last = '';
      try { this._open = JSON.parse(localStorage.getItem('blc-open') || 'null') || {}; } catch (e) { this._open = {}; }
    }
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
      if (this._c.title !== false) out.push(`<div class="hd"><span>${esc(this._c.title || 'Beleuchtung')}</span><button class="off${anyOn ? '' : ' none'}" data-alloff="1" aria-label="Alle Lichter aus"><ha-icon icon="mdi:lightbulb-group-off-outline"></ha-icon>Alle aus</button></div>`);
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
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Beleuchtung', description: 'Raeume mit Lichtstatus, aufklappbar mit den Lampen-Karten' });
})();
