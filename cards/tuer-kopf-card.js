// tuer-kopf-card v1.1 (26.11.2026, Wunsch Martin): 'Abbrechen' steht rechts an der Stelle der Pille, 'Wirklich öffnen?' links – ein versehentlicher Doppeltipp bricht ab statt zu oeffnen.
// v1.0 (26.11.2026, Wunsch Martin): Kopf der Karte 'Tueren und Fenster' wie Beleuchtung/Rollos/Sauger – Titel links,
// rechts Pille 'Haustür öffnen' mit gruenem Schluessel-Symbol. Schutz vor versehentlichem Druecken: erster Tipp zeigt
// 'Wirklich öffnen?' + 'Abbrechen' (geht nach 5 s von selbst zurueck), erst der zweite Tipp drueckt input_button.turoffner.
// Ein Dienstaufruf passiert nur beim Tippen, nie beim Anzeigen.
// Konfiguration: title, button (Standard input_button.turoffner), name, icon, color.
(() => {
  const TAG = 'tuer-kopf-card';
  if (customElements.get(TAG)) return;
  const CSS = `
    :host { display:block; }
    ha-card { background:none; box-shadow:none; border:none; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 4px; color:var(--ha-card-header-color, var(--primary-text-color));
      display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:48px; }
    .hd > span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .bt { display:flex; gap:8px; flex:0 0 auto; }
    .off { flex:0 0 auto; display:flex; align-items:center; gap:6px; height:30px; padding:0 12px 0 10px; border:0; border-radius:15px; background:rgba(118,118,128,.24);
      color:var(--primary-text-color); font:inherit; font-size:13px; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:opacity .2s, background .2s; white-space:nowrap; }
    .off ha-icon { --mdc-icon-size:16px; display:flex; }
    .off:active { opacity:.6; }
    .off.ask { background:rgba(48,209,88,.28); }
  `;
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  class TuerKopfCard extends HTMLElement {
    setConfig(c) { this._c = Object.assign({ title: 'Türen und Fenster', button: 'input_button.turoffner', name: 'Haustür öffnen', icon: 'mdi:key-wireless', color: '#30d158' }, c || {}); this._mode = ''; this._last = ''; }
    getCardSize() { return 1; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    set hass(h) { this._hass = h; this._render(); }
    _render() {
      if (!this._c) return;
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      if (!root.querySelector('ha-card')) {
        root.innerHTML = `<style>${CSS}</style><ha-card></ha-card>`;
        root.querySelector('ha-card').addEventListener('click', (ev) => this._click(ev));
      }
      const C = this._c, ic = (i, col) => `<ha-icon icon="${i}" style="color:${col}"></ha-icon>`;
      let bt;
      if (this._mode === 'ask') bt = `<button class="off ask" data-a="yes" aria-label="Wirklich öffnen">${ic(C.icon, C.color)}Wirklich öffnen?</button><button class="off" data-a="no" aria-label="Abbrechen">${ic('mdi:close', '#ff453a')}Abbrechen</button>`; // Abbrechen rechts = wo die Pille war (Doppeltipp bricht ab)
      else if (this._mode === 'done') bt = `<button class="off" data-a="" aria-label="Geöffnet">${ic('mdi:check', C.color)}Geöffnet</button>`;
      else bt = `<button class="off" data-a="ask" aria-label="${esc(C.name)}">${ic(C.icon, C.color)}${esc(C.name)}</button>`;
      const html = `<div class="hd"><span>${esc(C.title)}</span><div class="bt">${bt}</div></div>`;
      if (html !== this._last) { root.querySelector('ha-card').innerHTML = html; this._last = html; }
    }
    _set(m, ms) { clearTimeout(this._t); this._mode = m; this._render(); if (ms) this._t = setTimeout(() => { this._mode = ''; this._render(); }, ms); }
    _click(ev) {
      const b = ev.target.closest('[data-a]'); if (!b || !this._hass) return;
      const a = b.dataset.a;
      if (a === 'ask') this._set('ask', 5000);
      else if (a === 'no') this._set('', 0);
      else if (a === 'yes') { const [d] = this._c.button.split('.'); this._hass.callService(d === 'lock' ? 'lock' : d, d === 'lock' ? 'open' : 'press', { entity_id: this._c.button }); this._set('done', 2500); }
    }
  }
  customElements.define(TAG, TuerKopfCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Tür-Kopf', description: 'Titel mit Pille Haustür öffnen (mit Bestätigung)' });
})();
