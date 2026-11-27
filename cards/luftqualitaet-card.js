// luftqualitaet-card v1.13 (27.11.2026: Hinweis 'Bitte lüften' als erste Zeile unter dem Titel, gelb bzw. rot ab 1600 ppm; v1.12 (24.11.2026: jede Zeile als leicht aufgehelltes Kaestchen im Apple-Grau (118,118,128 / 12 %, Radius 10, 4 px Abstand) wie in der Wetterstation; v1.11: Skalen 6 px hoch, rund, 3 px Luecke, Dreieck mit weichem Schatten, Max-Linie 16 px; v1.10 (23.11.2026): Schalter 80 %, gleich gross wie die Schalter der Entitaetenkarten; v1.9: Schalter 68 %; v1.8: Schalter als ha-switch im Theme-Stil wie die uebrigen Karten; v1.7: Legende ersetzt durch Inline-Symbol vor dem Max-Wert; v1.6: Max-Werte gecacht gegen Nachrutschen beim Laden; v1.5: kein Springen mehr – DOM wird nur noch gezielt aktualisiert; v1.4: Skalen mit Farbverlauf ueber die Stufen; v1.3: Umbruch ohne Trennstriche, Wert immer auf Hoehe der ersten Namenszeile; v1.2: lange Namen umbrechen; v1.1: Untertext ueber volle Breite, schmale Karte (iPad) mit kleineren Zusatztexten und sauberen Umbruechen; v1.0) – Luftqualitaet Wohnen als Entitaetenliste im Stil der wetterstation-liste-card:
// Schalter fuer Luftbefeuchter/Luftreiniger, Wassertank, Feinstaub und CO2 mit Stufenskala
// (erreichte Stufen kraeftig, Rest blass, Dreieck = aktuell, gestrichelt = max. heute), Bewertungstext als Untertext.
(() => {
  const TAG = 'luftqualitaet-card';
  if (customElements.get(TAG)) return;

  const C = { green: '#30d158', yellow: '#ffd60a', orange: '#ff9f0a', red: '#ff453a', purple: '#bf5af2', blue: '#0a84ff', gray: '#8e8e93', gray2: '#636366', gray3: '#aeaeb2' };
  const DEF = {
    humidifier: 'input_boolean.luftbefeuchter', tank: 'binary_sensor.luftbefeuchter_wohnen_water_empty',
    purifier: 'fan.zhimi_mb3_0651_air_purifier_2', pm25: 'sensor.zhimi_mb3_0651_pm25_2', pm25_text: 'sensor.luftqualitat_pm2_5',
    co2: 'sensor.wohnen_co2', co2_text: 'sensor.luftqualitat_co2', luften: 'input_boolean.luften',
  };

  const CSS = `
    :host { display:block; container-type:inline-size; }
    .nw { white-space:nowrap; }
    .dsh { display:inline-block; width:2px; height:10px; background:repeating-linear-gradient(to bottom,#fff 0 2px,transparent 2px 4px); margin:0 4px -1px 1px; }
    .sx { flex:0 0 calc(100% - 56px); min-width:0; margin:-12px 0 4px 56px; font-size:12px; line-height:1.35; color:var(--secondary-text-color); }
    ha-card { padding:4px 0 8px; overflow:hidden; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 4px; color:var(--ha-card-header-color, var(--primary-text-color)); }
    .body { padding:0 16px 4px; }
    .body > .r { padding:0 8px; margin:0 -8px 4px; border-radius:10px; background:rgba(118,118,128,.12); }
    .body > .r:last-child { margin-bottom:4px; }
    .body > .r.al { cursor:default; }
    .r { display:flex; flex-wrap:wrap; align-items:flex-start; min-height:40px; column-gap:16px; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .r > .st { padding-top:10px; }
    .r > .sw { margin-top:5px; }
    .bd { flex:0 0 40px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; }
    .bd ha-icon { --mdc-icon-size:24px; color:var(--state-icon-color, var(--paper-item-icon-color, #44739e)); display:inline-flex; }
    .nm { flex:1; min-width:0; font-size:14px; line-height:1.3; padding:10px 0 4px; color:var(--primary-text-color); }
    .nm .sec { display:block; font-size:12px; color:var(--secondary-text-color); white-space:normal; line-height:1.35; }
    .st { font-size:14px; line-height:1.3; color:var(--primary-text-color); text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }
    .st small { font-size:12px; color:var(--secondary-text-color); margin-left:3px; }
    .bar { flex:0 0 calc(100% - 56px); min-width:0; margin:-4px 0 8px 56px; }
    .r.top > .bar, .sx + .bar { margin-top:4px; }
    .seg { position:relative; width:100%; height:6px; display:flex; gap:3px; margin-bottom:2px; }
    .seg > div { height:100%; border-radius:3px; opacity:.25; }
    .seg > div.on { opacity:1; }
    .seg > .tri { position:absolute; top:8px; width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:6px solid #fff;
      transform:translateX(-50%); filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.45)); opacity:1; border-radius:0; }
    .seg > .mx { position:absolute; top:-5px; height:16px; width:2px; opacity:1; border-radius:0; transform:translateX(-1px);
      background:repeating-linear-gradient(to bottom,#fff 0 2px,transparent 2px 4px); }
    .tk { position:relative; width:100%; height:12px; margin-top:12px; font-size:10px; line-height:12px; color:var(--secondary-text-color); }
    .tk span { position:absolute; top:0; white-space:nowrap; }
    .lgd { display:flex; gap:14px; font-size:10px; color:var(--secondary-text-color); margin-top:6px; align-items:center; }
    .lgd .t { display:inline-block; width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:6px solid #fff; margin-right:4px; }
    .lgd i { display:inline-block; width:2px; height:11px; background:repeating-linear-gradient(to bottom,#fff 0 2px,transparent 2px 4px); margin:0 4px -1px 2px; }
    .sw { flex:0 0 auto; transform:scale(.8); transform-origin:right center; }
    @container (max-width: 400px) {
      .nm .sec, .sx { font-size:11px; }
      .tk, .lgd { font-size:9px; }
    }
    @keyframes blinker { 50% { opacity:0; } }
    .a-blink { animation:blinker 1s linear infinite; }
  `;

  // DOM nur dort aendern, wo sich etwas geaendert hat (kein Neuaufbau -> kein Springen/Flackern)
  const morph = (a, b) => {
    const an = Array.from(a.childNodes), bn = Array.from(b.childNodes);
    bn.forEach((y, i) => {
      const x = an[i];
      if (!x) { a.appendChild(y); return; }
      if (x.nodeType !== y.nodeType || x.nodeName !== y.nodeName) { a.replaceChild(y, x); return; }
      if (x.nodeType !== 1) { if (x.nodeValue !== y.nodeValue) x.nodeValue = y.nodeValue; return; }
      if (!x.localName.includes('-')) Array.from(x.attributes).forEach((at) => { if (!y.hasAttribute(at.name)) x.removeAttribute(at.name); });
      Array.from(y.attributes).forEach((at) => { if (x.getAttribute(at.name) !== at.value) x.setAttribute(at.name, at.value); });
      morph(x, y);
    });
    for (let i = an.length - 1; i >= bn.length; i--) a.removeChild(an[i]);
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const num = (v, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n; };
  const hhmm = (dt) => String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
  const ico = (icon, cls = '', col = '') => `<ha-icon icon="${icon}"${cls ? ` class="${cls}"` : ''}${col ? ` style="color:${col}"` : ''}></ha-icon>`;
  const cap = (t) => { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); };

  class LuftqualitaetCard extends HTMLElement {
    setConfig(c) {
      this._c = c || {}; this._e = Object.assign({}, DEF, this._c.entities || {}); this._sig = '';
      try { const h = JSON.parse(localStorage.getItem('lqc-hist') || 'null'); const mid = new Date(); mid.setHours(0, 0, 0, 0);
        if (h && h.t > +mid) { this._mx = {}; Object.keys(h.mx).forEach((k) => { this._mx[k] = { v: h.mx[k].v, t: new Date(h.mx[k].t) }; }); } } catch (e) {}
    }
    getCardSize() { return 6; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    connectedCallback() { this._iv = setInterval(() => { this._sig = ''; this._render(); }, 60000); }
    disconnectedCallback() { clearInterval(this._iv); }
    set hass(h) { this._hass = h; this._hist(); this._render(); }

    _s(k) { const id = this._e[k]; return id ? this._hass.states[id] : undefined; }
    _v(k) { const s = this._s(k); return s ? s.state : ''; }
    _a(k, a) { const s = this._s(k); return s && s.attributes ? s.attributes[a] : undefined; }

    async _hist() {
      if (!this._hass || this._histBusy || Date.now() - (this._histAt || 0) < 300000) return;
      this._histBusy = true; this._histAt = Date.now();
      const ids = [this._e.pm25, this._e.co2].filter(Boolean), mid = new Date(); mid.setHours(0, 0, 0, 0);
      try {
        const r = await this._hass.callWS({ type: 'history/history_during_period', start_time: mid.toISOString(), entity_ids: ids,
          minimal_response: true, no_attributes: true, significant_changes_only: false });
        const mx = {};
        ids.forEach((id) => {
          const cur = parseFloat(this._hass.states[id] && this._hass.states[id].state);
          const rows = ((r && r[id]) || []).map((x) => [x.lu * 1000, parseFloat(x.s)]).filter((x) => !isNaN(x[1]));
          if (!isNaN(cur)) rows.push([Date.now(), cur]);
          let m = null; rows.forEach(([t, v]) => { if (t >= +mid && (!m || v > m.v)) m = { v, t: new Date(t) }; });
          if (m) mx[id] = m;
        });
        this._mx = mx; this._sig = ''; this._render();
        try { const o = {}; Object.keys(mx).forEach((k) => { o[k] = { v: mx[k].v, t: +mx[k].t }; }); localStorage.setItem('lqc-hist', JSON.stringify({ t: Date.now(), mx: o })); } catch (e) {}
      } catch (e) { /* History nicht verfuegbar */ }
      this._histBusy = false;
    }

    _render() {
      const H = this._hass; if (!H || !this._c) return;
      const sig = Object.values(this._e).map((id) => { const s = H.states[id]; return s ? s.state + '|' + (s.attributes.preset_mode || '') : '-'; }).join(';') + '|' + new Date().getMinutes();
      if (sig === this._sig) return;
      this._sig = sig;
      try {
        const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
        if (!root.querySelector('ha-card')) {
          root.innerHTML = `<style>${CSS}</style><ha-card></ha-card>`;
          root.querySelector('ha-card').addEventListener('click', (ev) => this._click(ev));
        }
        const html = this._html();
        if (html !== this._last) { const t = document.createElement('template'); t.innerHTML = html; morph(root.querySelector('ha-card'), t.content); this._last = html; }
        root.querySelectorAll('ha-switch[data-on]').forEach((w) => { const on = w.dataset.on === '1'; if (w.checked !== on) w.checked = on; });
      } catch (e) {
        console.error(TAG, e);
        (this.shadowRoot || this.attachShadow({ mode: 'open' })).innerHTML = `<ha-card style="padding:12px;color:#ff453a">${TAG} Fehler: ${esc(e && e.message || e)}</ha-card>`;
      }
    }
    _click(ev) {
      const sw = ev.target.closest('[data-toggle]');
      if (sw) { ev.stopPropagation(); this._hass.callService('homeassistant', 'toggle', { entity_id: sw.dataset.toggle }); return; }
      const t = ev.target.closest('[data-more]');
      if (t) this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: t.dataset.more }, bubbles: true, composed: true }));
    }

    _row(ent, badge, name, right) {
      const si = name.indexOf('<span class="sec">');
      if (si > 0 && right.startsWith('<div class="st"')) {
        const e = right.indexOf('</div>') + 6, sec = name.slice(si + 18, name.lastIndexOf('</span>'));
        name = name.slice(0, si); right = right.slice(0, e) + `<div class="sx">${sec}</div>` + right.slice(e);
      }
      const top = name.includes('class="sec"');
      return `<div class="r${top ? ' top' : ''}" data-more="${esc(ent)}"><div class="bd">${badge}</div><div class="nm">${name}</div>${right}</div>`;
    }
    _scale(min, max, zones, value, maxValue, ticks) {
      const span = max - min, pct = (v) => Math.max(0, Math.min(100, (v - min) / span * 100));
      let prev = min;
      let p0 = min; const G = 'linear-gradient(90deg,' + zones.map((z) => { const a = (p0 - min) / span * 100, b = (Math.min(z.to, max) - min) / span * 100; p0 = z.to; return `${z.c} ${((a + b) / 2).toFixed(1)}%`; }).join(',') + ')';
      const gs = (s, w) => `background-image:${G};background-size:${(10000 / Math.max(w, 0.1)).toFixed(1)}% 100%;background-position:${w >= 99.9 ? 0 : (s / (100 - w) * 100).toFixed(2)}% 0`;
      const segs = zones.map((z, i) => { const w = (z.to - prev) / span * 100, s0 = (prev - min) / span * 100, on = i === 0 || value > prev; prev = z.to;
        return `<div class="${on ? 'on' : ''}" style="flex:0 0 calc(${w.toFixed(2)}% - 3px);${gs(s0, w)}"></div>`; }).join('');
      const tk = ticks.map(([v, t]) => { const x = pct(v); return `<span style="${x >= 97 ? 'right:0;text-align:right' : `left:${x}%`}">${t}</span>`; }).join('');
      return `<div class="bar"><div class="seg">${segs}${maxValue != null ? `<div class="mx" style="left:${pct(maxValue)}%"></div>` : ''}<i class="tri" style="left:${Math.max(1, Math.min(99, pct(value)))}%"></i></div><div class="tk">${tk}</div></div>`;
    }
    _maxLine(k, unit, col, d = 0) {
      const m = this._mx && this._mx[this._e[k]]; if (!m) return '';
      return `<br><span class="nw">max. heute <i class="dsh"></i><b style="color:${col(m.v)};font-weight:500">${m.v.toFixed(d).replace('.', ',')} ${unit}</b></span> <span class="nw">um ${hhmm(m.t)}</span>`;
    }

    _html() {
      const E = this._e, out = [];
      if (this._c.title !== false) out.push(`<div class="hd">${esc(this._c.title || 'Luftqualität Wohnen')}</div>`);
      const rows = [];
      // Hinweis 'Bitte lüften' als erste Zeile unter dem Titel: gelb, ab 1600 ppm rot (wie Waschgang-Hinweis)
      if (this._v('luften') === 'on') {
        const v = num(this._v('co2')), rot = v >= 1600, cc = rot ? C.red : C.yellow, rgb = rot ? '255,69,58' : '255,214,10';
        const ls = this._s('luften'), min = ls ? Math.max(0, Math.round((Date.now() - new Date(ls.last_changed)) / 60000)) : null;
        const seit = min == null ? '' : min < 60 ? min + ' Min.' : min < 2880 ? Math.round(min / 60) + ' Std.' : Math.round(min / 1440) + ' Tagen';
        rows.push(`<div class="r al" style="background:rgba(${rgb},.16)"><div class="bd">${ico('mdi:window-open-variant', rot ? 'a-blink' : '', cc)}</div>`
          + `<div class="nm"><span style="color:${cc};font-weight:500">Bitte lüften!</span><span class="sec">Hoher CO₂-Gehalt${isNaN(v) ? '' : ' · ' + Math.round(v) + ' ppm'}</span></div>`
          + (seit ? `<div class="st" style="color:var(--secondary-text-color);font-size:12px">seit ${seit}</div>` : '') + '</div>');
      }
      const sw = (k) => `<ha-switch class="sw" data-on="${this._v(k) === 'on' ? 1 : 0}" data-toggle="${esc(E[k])}"></ha-switch>`;

      if (this._s('humidifier')) {
        const on = this._v('humidifier') === 'on';
        rows.push(this._row(E.humidifier, ico(this._a('humidifier', 'icon') || 'mdi:air-humidifier', '', on ? C.green : ''), esc(this._a('humidifier', 'friendly_name') || 'Luftbefeuchter'), sw('humidifier')));
      }
      if (this._s('tank')) {
        const empty = this._v('tank') === 'on';
        rows.push(this._row(E.tank, ico(empty ? 'mdi:water-alert' : (this._a('tank', 'icon') || 'mdi:water-check'), '', empty ? C.red : ''), esc(this._a('tank', 'friendly_name') || 'Wassertank'),
          `<div class="st" style="color:${empty ? C.red : 'var(--primary-text-color)'}">${empty ? 'Leer' : 'OK'}</div>`));
      }
      if (this._s('purifier')) {
        const on = this._v('purifier') === 'on', pm = this._a('purifier', 'preset_mode');
        rows.push(this._row(E.purifier, ico(this._a('purifier', 'icon') || 'mdi:air-purifier', '', on ? C.green : ''),
          `Luftreiniger${on && pm && pm !== 'None' ? `<span class="sec">Modus ${esc(pm)}</span>` : ''}`, sw('purifier')));
      }
      if (this._s('pm25')) {
        const v = num(this._v('pm25')), col = (x) => (x <= 35 ? C.green : x <= 75 ? C.yellow : C.red), m = this._mx && this._mx[E.pm25];
        const txt = this._v('pm25_text');
        rows.push(this._row(E.pm25, ico('phu:pm2-5', '', v > 35 ? col(v) : ''),
          `Feinstaub<span class="sec">${txt ? `Luftqualität <b style="color:${col(v)};font-weight:500">${esc(txt)}</b>` : ''}${this._maxLine('pm25', 'µg/m³', col)}</span>`,
          `<div class="st"><span style="color:${col(v)}">${Math.round(v)}</span><small>µg/m³</small></div>` +
          this._scale(0, 150, [{ to: 35, c: C.green }, { to: 75, c: C.yellow }, { to: 150, c: C.red }], Math.min(v, 150), m ? Math.min(m.v, 150) : null,
            [[0, '0 µg/m³'], [35, '35'], [75, '75'], [150, '150+']])));
      }
      if (this._s('co2')) {
        const v = num(this._v('co2')), col = (x) => (x <= 1099 ? C.green : x <= 1599 ? C.yellow : C.red), m = this._mx && this._mx[E.co2];
        const txt = this._v('co2_text');
        rows.push(this._row(E.co2, ico('phu:co2', v >= 1600 ? 'a-blink' : '', v > 1099 ? col(v) : ''),
          `CO₂<span class="sec">${txt ? `Luftqualität <b style="color:${col(v)};font-weight:500">${esc(txt)}</b>` : ''}${this._maxLine('co2', 'ppm', col)}</span>`,
          `<div class="st"><span style="color:${col(v)}">${Math.round(v)}</span><small>ppm</small></div>` +
          this._scale(400, 2000, [{ to: 1100, c: C.green }, { to: 1600, c: C.yellow }, { to: 2000, c: C.red }], Math.min(Math.max(v, 400), 2000), m ? Math.min(Math.max(m.v, 400), 2000) : null,
            [[400, '400 ppm'], [1100, '1100'], [1600, '1600'], [2000, '2000+']])));
      }
      out.push(`<div class="body">${rows.join('')}</div>`);
      return out.join('');
    }
  }

  customElements.define(TAG, LuftqualitaetCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Luftqualität', description: 'Luftqualitaet mit Schaltern und Stufenskalen fuer Feinstaub und CO2' });
})();
