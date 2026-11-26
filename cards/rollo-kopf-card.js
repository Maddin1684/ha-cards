// rollo-kopf-card v1.1 (26.11.2026: Icons wie in den Rollo-Zeilen - phu:blind-tilt-open / phu:blind-tilt-closed); v1.0 (26.11.2026, Wunsch Martin: Kopf der Rollo-Karte wie die Beleuchtung-Karte – Titel links, rechts Knoepfe
// 'Alle oeffnen' (weisses offenes Rollo, sichtbar wenn mindestens ein Rollo nicht ganz offen ist) und 'Alle schliessen' (Apple-rotes
// geschlossenes Rollo, sichtbar wenn mindestens ein Rollo nicht ganz zu ist). Faehrt ein Rollo, heissen beide Knoepfe 'Anhalten'.
// Der Knopf ruft nur script.rollos_alle (richtung auf/zu) auf – das Skript haelt an, wenn etwas faehrt, sonst faehrt es alle Rollos.
// Konfiguration: title, covers: [cover.*], script (Standard script.rollos_alle).
(() => {
  const TAG = 'rollo-kopf-card';
  if (customElements.get(TAG)) return;
  const CSS = `
    :host { display:block; }
    ha-card { background:none; box-shadow:none; border:none; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 4px; color:var(--ha-card-header-color, var(--primary-text-color));
      display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:48px; }
    .bt { display:flex; gap:8px; flex:0 0 auto; }
    .off { flex:0 0 auto; display:flex; align-items:center; gap:6px; height:30px; padding:0 12px 0 10px; border:0; border-radius:15px; background:rgba(118,118,128,.24);
      color:var(--primary-text-color); font:inherit; font-size:13px; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:opacity .2s; }
    .off ha-icon { --mdc-icon-size:16px; display:flex; }
    .off:active { opacity:.6; }
  `;
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  class RolloKopfCard extends HTMLElement {
    setConfig(c) { if (!c || !Array.isArray(c.covers) || !c.covers.length) throw new Error('covers fehlt'); this._c = c; this._last = ''; }
    getCardSize() { return 1; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    set hass(h) { this._hass = h; this._render(); }
    _render() {
      const H = this._hass; if (!H || !this._c) return;
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      if (!root.querySelector('ha-card')) {
        root.innerHTML = `<style>${CSS}</style><ha-card></ha-card>`;
        root.querySelector('ha-card').addEventListener('click', (ev) => this._click(ev));
      }
      const st = this._c.covers.map((id) => H.states[id]).filter(Boolean);
      const pos = (s) => { const p = s.attributes.current_position; return p == null ? (s.state === 'closed' ? 0 : 100) : Number(p); };
      const fahrt = st.some((s) => s.state === 'opening' || s.state === 'closing');
      const zeigAuf = fahrt || st.some((s) => pos(s) < 100);
      const zeigZu = fahrt || st.some((s) => pos(s) > 0);
      const knopf = (r, txt, icon, col) => `<button class="off" data-r="${r}" aria-label="${txt}"><ha-icon icon="${icon}" style="color:${col}"></ha-icon>${txt}</button>`;
      const html = `<div class="hd"><span>${esc(this._c.title || 'Rollos')}</span><div class="bt">`
        + (fahrt ? knopf('zu', 'Anhalten', 'mdi:stop', '#ff453a')
          : (zeigAuf ? knopf('auf', 'Alle öffnen', 'phu:blind-tilt-open', '#ffffff') : '') + (zeigZu ? knopf('zu', 'Alle schließen', 'phu:blind-tilt-closed', '#ff453a') : ''))
        + '</div></div>';
      if (html !== this._last) { root.querySelector('ha-card').innerHTML = html; this._last = html; }
    }
    _click(ev) {
      const b = ev.target.closest('[data-r]'); if (!b || !this._hass) return;
      const [d, s] = (this._c.script || 'script.rollos_alle').split('.');
      this._hass.callService(d, s, { richtung: b.dataset.r });
    }
  }
  customElements.define(TAG, RolloKopfCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Rollo-Kopf', description: 'Titel mit Knoepfen Alle oeffnen / Alle schliessen / Anhalten' });
})();
