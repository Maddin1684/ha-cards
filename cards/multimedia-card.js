// multimedia-card v1.18 (23.11.2026: YouTube-Rot blieb faelschlich als 'dunkel' erkannt – jetzt nur Grau/Schwarz wird weiss; v1.17: YouTube-Schriftzug mit rotem Logo (SVG wird hell umgefaerbt statt invertiert), bei Live TV keine Zeile 'Live TV' mehr – Senderlogo + Sendername reichen, 'Default Media Receiver' heisst 'Webradio', Status 'buffering' heisst 'lädt', Lautstaerke in der Skala des Geraets (Option volume_max, Soundbar 40); v1.16: Akku-/Sleeptimer-Zeile noch 4 px hoeher; v1.15: Akku-/Sleeptimer-Zeile naeher am Tonie-Block; v1.14: Tonie-/Cover-Bild ohne Kreis-Hintergrund, Figur buendig links unter dem Namen; v1.13: Tonie-/Cover-Bild linksbuendig unter dem Geraetenamen, Texte rechts daneben ueber die volle Kartenbreite; v1.12: Bild in der Icon-Spalte (verworfen); v1.11: Tonie-/Cover-Bild gross (34 px) links neben Titel und Folge/Interpret; v1.10: Sleeptimer als Mond-Symbol + 'noch x min' in derselben Zeile wie der Akku, App-Schriftzug 13 px; v1.9: Untertext zeilenweise (Titel/Sender oben mit Logo, darunter Folge/Interpret, darunter App), Sleeptimer 'noch x min' ohne Farbe, Schriftzug-Logos fuer Netflix/Prime Video/YouTube/Disney+ aus /local/applogos/; v1.8: Senderlogos mit Namens-Zuordnung (ProSieben, RTL Zwei, hr-fernsehen, Sat.1 ...), Live-TV auch per app_id erkannt; v1.7: links immer Geraete-Icon; Cover, Tonie-Bild, Senderlogo, Radiosender und App-Icon klein (18 px) vor dem Text darunter; v1.6: kleines App-Icon vor dem Text; v1.4: App-Name aus app_id, wenn der TV keine Quelle meldet; v1.3: Toniebox-Akku nur bei laufender Box, beim Laden oder kritisch; v1.2: Radiosender auch bei ausgeschalteter Soundbar im aufgeklappten Bereich; v1.1: Senderlogos bei Live TV aus /local/senderlogos/, automatische Dateinamen-Suche; v1.0) – Multimedia als Liste im Stil der wetterstation-liste-card:
// Status rechts (gruen bei an/Wiedergabe), darunter was laeuft, Bild der aktuellen Wiedergabe (App-Icon/Cover/Tonie) statt Geraete-Icon,
// Radiosender + Lautstaerke (1er-Schritte) bei der Soundbar, Akku/Sleeptimer bei der Toniebox, jede Zeile aufklappbar mit der bisherigen Steuer-Karte.
(() => {
  const TAG = 'multimedia-card';
  if (customElements.get(TAG)) return;

  const C = { green: '#30d158', yellow: '#ffd60a', orange: '#ff9f0a', red: '#ff453a', gray3: '#aeaeb2' };
  const STATE = { off: 'ausgeschaltet', on: 'eingeschaltet', playing: 'Wiedergabe', paused: 'pausiert', buffering: 'lädt', idle: 'Ruhezustand', standby: 'standby', unavailable: 'ausgeschaltet', unknown: 'ausgeschaltet' };
  const ACTIVE = ['on', 'playing', 'paused', 'buffering', 'idle'];

  const CSS = `
    :host { display:block; container-type:inline-size; }
    ha-card { padding:4px 0 8px; overflow:hidden; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 4px; color:var(--ha-card-header-color, var(--primary-text-color)); }
    .body { padding:0 16px; }
    .nw { white-space:nowrap; }
    .r { display:flex; align-items:flex-start; min-height:40px; column-gap:16px; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .bd { flex:0 0 40px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; }
    .bd ha-icon { --mdc-icon-size:24px; color:var(--state-icon-color, var(--paper-item-icon-color, #44739e)); display:inline-flex; }
    .bd img { width:34px; height:34px; object-fit:cover; border-radius:8px; background:rgba(255,255,255,.06); }
    .bd img.rnd { border-radius:50%; }
    .bd img.logo { object-fit:contain; background:none; border-radius:0; width:38px; }
    .nm { flex:1; min-width:0; font-size:14px; line-height:1.3; padding:10px 0 4px; color:var(--primary-text-color); }
    .nm .sec { display:block; font-size:12px; color:var(--secondary-text-color); line-height:1.35; }
    .nm .sec b { font-weight:500; }
    .th { width:18px; height:18px; object-fit:cover; border-radius:4px; vertical-align:-4px; margin-right:5px; background:rgba(255,255,255,.06); }
    .th.rnd { border-radius:50%; }
    .th.logo { width:auto; max-width:30px; object-fit:contain; background:none; border-radius:0; }
    .th.wm { width:auto; height:13px; max-width:76px; object-fit:contain; background:none; border-radius:0; vertical-align:-1px; }
    .th.inv { filter:invert(1) hue-rotate(180deg); }
    .r.wide { flex-wrap:wrap; }
    .sub { flex:0 0 calc(100% - 56px); min-width:0; margin:-8px 0 6px 56px; font-size:12px; line-height:1.35; color:var(--secondary-text-color); }
    .sub .sec { display:block; }
    .sub .sec b { font-weight:500; }
    .sub .sec.blk { display:flex; align-items:center; gap:10px; margin:4px 0 -4px; }
    .tb { flex:0 0 38px; width:38px; height:38px; object-fit:cover; border-radius:6px; }
    .tb.rnd { flex:0 0 24px; width:24px; height:40px; object-fit:cover; object-position:center; border-radius:0; }
    .bt { display:flex; flex-direction:column; min-width:0; }
    .st { padding-top:10px; font-size:14px; line-height:1.3; text-align:right; white-space:nowrap; color:var(--primary-text-color); }
    .chev { flex:0 0 22px; padding-top:9px; color:var(--secondary-text-color); display:flex; justify-content:center; }
    .chev ha-icon { --mdc-icon-size:22px; transition:transform .25s; }
    .dev.open .chev ha-icon { transform:rotate(180deg); }
    .ex { margin:2px 0 10px 56px; display:flex; flex-direction:column; gap:10px; }
    .rad { display:flex; justify-content:space-between; align-items:center; gap:4px; }
    .rad button { width:36px; height:36px; border-radius:50%; border:0; padding:0; background:rgba(255,255,255,.1); cursor:pointer; display:flex; align-items:center; justify-content:center; overflow:hidden; flex:0 0 36px; }
    .rad button img { width:36px; height:36px; object-fit:contain; }
    .rad button.on { box-shadow:0 0 0 2px ${C.green}; }
    .rad button.off { background:rgba(255,69,58,.18); }
    .rad button.off ha-icon { --mdc-icon-size:18px; color:${C.red}; }
    .vh { display:flex; justify-content:space-between; align-items:baseline; font-size:12px; color:var(--secondary-text-color); }
    .vh b { font-size:14px; font-weight:400; color:var(--primary-text-color); font-variant-numeric:tabular-nums; }
    .vol { display:flex; align-items:center; gap:10px; margin-top:6px; }
    .vol button { width:32px; height:32px; border-radius:16px; border:0; background:rgba(255,255,255,.1); color:var(--primary-text-color); font-size:18px; line-height:1; cursor:pointer; padding:0; flex:0 0 32px; }
    .vb { flex:1; min-width:0; }
    .seg { position:relative; width:100%; height:4px; display:flex; gap:2px; }
    .seg > div { height:100%; border-radius:2px; opacity:.25; }
    .seg > div.on { opacity:1; }
    .seg > .tri { position:absolute; top:5px; width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:6px solid #fff; transform:translateX(-50%); filter:drop-shadow(0 0 1px #000); }
    .tk { position:relative; height:12px; margin-top:10px; font-size:10px; line-height:12px; color:var(--secondary-text-color); }
    .tk span { position:absolute; top:0; white-space:nowrap; }
    .fb { display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; }
    .dev.open .fb { grid-template-rows:1fr; }
    .fi { overflow:hidden; min-height:0; }
    @container (max-width: 400px) { .nm .sec { font-size:11px; } .tk { font-size:9px; } }
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
  const ico = (icon, col = '') => `<ha-icon icon="${esc(icon)}"${col ? ` style="color:${col}"` : ''}></ha-icon>`;
  // Senderlogo-Kandidaten aus dem Sendernamen (Dateinamen wie im Paket tv-logo/tv-logos: klein, Bindestriche, -de)
  const slug = (n) => String(n || '').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/\+/g, ' plus ').replace(/&/g, ' and ').replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // Sendernamen, die anders heissen als die Logo-Datei (Schluessel: Name klein ohne Bindestriche/HD)
  const ALIAS = { pro7: 'pro-sieben', prosieben: 'pro-sieben', pro7maxx: 'pro-sieben-maxx', prosiebenmaxx: 'pro-sieben-maxx', prosiebenfun: 'pro-sieben-fun',
    rtl2: 'rtl-zwei', rtlzwei: 'rtl-zwei', rtltelevision: 'rtl', superrtl: 'rtl-super', rtlsuper: 'rtl-super', rtlup: 'rtl-up', rtlnitro: 'nitro', nitro: 'nitro',
    sat1: 'sat-1', sat1gold: 'sat-1-gold', sat1emotions: 'sat-1-emotions', kabel1: 'kabel-eins', kabeleins: 'kabel-eins', kabel1doku: 'kabel-eins-doku', kabeleinsdoku: 'kabel-eins-doku',
    hr: 'hr', hrfernsehen: 'hr', hessischerrundfunk: 'hr', br: 'br-fernsehen', brfernsehen: 'br-fernsehen', ard: 'das-erste', daserste: 'das-erste', erste: 'das-erste',
    zdfneo: 'zdf-neo', zdfinfo: 'zdf-info', ntv: 'ntv', tele5: 'tele-5', servustv: 'servus-tv-deutchland', swrfernsehen: 'swr', swr: 'swr', swrbw: 'swr-bw',
    ndrfernsehen: 'ndr', wdrfernsehen: 'wdr', mdrfernsehen: 'mdr', rbbfernsehen: 'rbb-fernsehen', srfernsehen: 'sr-fernsehen', eurosport: 'eurosport-1', eurosport1: 'eurosport-1',
    eurosport2: 'eurosport-2', sport1: 'sport1', '3sat': '3sat', kika: 'kika', arte: 'arte', phoenix: 'phoenix', welt: 'welt', n24doku: 'n24-doku', weltdoku: 'n24-doku',
    tagesschau24: 'tagesschau24', ardalpha: 'ard-alpha', one: 'one', dmax: 'dmax', sixx: 'sixx', vox: 'vox', voxup: 'vox-up', tlc: 'tlc', comedycentral: 'comedy-central', disneychannel: 'disney-channel', toggoplus: 'toggo-plus' };
  const logoCands = (name, base) => {
    const full = slug(name), nohd = slug(String(name).replace(/\b(u?hd|sd)\b/ig, ' ')), nodot = slug(String(name).replace(/\b(u?hd|sd)\b/ig, ' ').replace(/[.\s]+(?=\d)/g, ''));
    const out = [];
    const key = nohd.replace(/-/g, '').replace(/de$/, ''), first = nohd.split('-')[0];
    [ALIAS[key], nohd, nodot, full, nohd.replace(/-/g, ''), ALIAS[first], first].forEach((x) => { if (x && !out.includes(x)) out.push(x); });
    return out.map((x) => `${base}${x}-de.png`);
  };
  // App-Namen, wenn der TV weder source noch app_name liefert (nur app_id)
  const APPS = { 'com.webos.app.recordings': 'Aufnahmen ansehen', 'com.webos.app.livetv': 'Live TV', 'com.webos.app.tvguide': 'TV-Programm', 'com.webos.app.home': 'Startseite',
    'com.webos.app.hdmi1': 'HDMI 1', 'com.webos.app.hdmi2': 'HDMI 2', 'com.webos.app.hdmi3': 'HDMI 3', 'com.webos.app.hdmi4': 'HDMI 4', 'com.webos.app.mediadiscovery': 'Media Player',
    'com.webos.app.photovideo': 'Media Player', 'com.webos.app.music': 'Musik', 'com.webos.app.browser': 'Browser', 'com.webos.app.screensaver': 'Bildschirmschoner',
    'netflix': 'Netflix', 'youtube.leanback.v4': 'YouTube', 'amazon': 'Prime Video', 'com.disney.disneyplus-prod': 'Disney+', 'de.ard.mediathek': 'ARD Mediathek' };
  // Kleines Icon vor dem App-Text, wenn der TV nur app_id meldet
  const APPICON = { 'com.webos.app.recordings': ['mdi:record-circle-outline', '#ff453a'], 'com.webos.app.livetv': ['mdi:television-classic', ''], 'com.webos.app.tvguide': ['mdi:television-guide', ''],
    'com.webos.app.hdmi1': ['mdi:hdmi-port', ''], 'com.webos.app.hdmi2': ['mdi:hdmi-port', ''], 'com.webos.app.hdmi3': ['mdi:hdmi-port', ''], 'com.webos.app.hdmi4': ['mdi:hdmi-port', ''],
    'com.webos.app.mediadiscovery': ['mdi:folder-play-outline', ''], 'com.webos.app.photovideo': ['mdi:folder-play-outline', ''], 'com.webos.app.music': ['mdi:music', ''], 'com.webos.app.browser': ['mdi:web', ''] };
  const appName = (id) => { if (!id) return ''; if (APPS[id]) return APPS[id]; const t = String(id).split('.').pop().replace(/[-_]+/g, ' '); return t.charAt(0).toUpperCase() + t.slice(1); };
  // Schriftzug-Logos der Apps (Dateien in /local/applogos/, .svg oder .png)
  const WORDMARK = { netflix: 'netflix', amazon: 'prime-video', 'prime video': 'prime-video', 'youtube.leanback.v4': 'youtube', youtube: 'youtube', 'com.disney.disneyplus-prod': 'disney-plus', 'disney+': 'disney-plus' };
  const hhmm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

  class MultimediaCard extends HTMLElement {
    setConfig(c) {
      if (!c || !Array.isArray(c.devices)) throw new Error('devices fehlt');
      this._c = c; this._cards = {}; this._last = ''; this._badWm = this._badWm || new Set();
      try { this._open = JSON.parse(localStorage.getItem('mmc-open') || 'null') || {}; } catch (e) { this._open = {}; }
    }
    getCardSize() { return 6; }
    connectedCallback() { this._iv = setInterval(() => { this._last = ''; this._render(); }, 60000); }
    disconnectedCallback() { clearInterval(this._iv); }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    set hass(h) {
      this._hass = h; this._render();
      Object.values(this._cards).forEach((el) => { if (el) el.hass = h; });
    }

    // Schriftzug mit dunkler Schrift (YouTube) hell machen: SVG laden, dunkle Fuellfarben -> weiss, Rot bleibt rot
    _wmLight(url) {
      const m = this._wmL || (this._wmL = {});
      if (url in m) return m[url];
      m[url] = '';
      fetch(url).then((r) => (r.ok ? r.text() : Promise.reject())).then((t) => {
        const dark = (c) => { if (/^black$/i.test(c)) return true; let h = c.slice(1); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h, 16); return Math.max(n >> 16, (n >> 8) & 255, n & 255) < 90; };
        t = t.replace(/(fill\s*[=:]\s*["']?)(#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|black)/gi, (x, pre, c) => (dark(c) ? pre + '#fff' : x)).replace(/<svg\b(?![^>]*\sfill=)/i, '<svg fill="#fff"');
        m[url] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(t); this._last = ''; this._render();
      }).catch(() => { m[url] = null; this._last = ''; this._render(); });
      return '';
    }
    _render() {
      const H = this._hass; if (!H || !this._c) return;
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      if (!root.querySelector('ha-card')) {
        root.innerHTML = `<style>${CSS}</style><ha-card></ha-card>`;
        root.querySelector('ha-card').addEventListener('click', (ev) => this._click(ev));
        // Senderlogo nicht gefunden -> naechsten Kandidaten probieren
        root.addEventListener('error', (ev) => { const im = ev.target; if (!im || im.tagName !== 'IMG' || !im.dataset.alt) return;
          const alt = im.dataset.alt.split('|').filter(Boolean); if (!alt.length) { if (im.dataset.wm) { this._badWm.add(im.dataset.wm); this._last = ''; this._render(); return; } im.style.visibility = 'hidden'; return; } im.dataset.alt = alt.slice(1).join('|'); im.src = alt[0]; }, true);
      }
      let html;
      try { html = this._html(); } catch (e) { console.error(TAG, e); html = `<div style="padding:12px;color:${C.red}">${TAG} Fehler: ${esc(e && e.message || e)}</div>`; }
      if (html !== this._last) { const t = document.createElement('template'); t.innerHTML = html; morph(root.querySelector('ha-card'), t.content); this._last = html; }
      this._mountCards(root);
    }

    async _mountCards(root) {
      for (const [i, d] of this._c.devices.entries()) {
        if (!d.card || !this._open[i] || this._cards[i]) continue;
        this._cards[i] = null;
        const helpers = await window.loadCardHelpers();
        const el = helpers.createCardElement(d.card);
        el.hass = this._hass;
        this._cards[i] = el;
      }
      Object.entries(this._cards).forEach(([i, el]) => {
        const slot = root.querySelector(`[data-slot="${i}"]`);
        if (el && slot && el.parentNode !== slot) slot.appendChild(el);
      });
    }

    _click(ev) {
      const H = this._hass, t = ev.target;
      const radio = t.closest('[data-radio]');
      if (radio) {
        ev.stopPropagation();
        const d = this._c.devices[+radio.dataset.dev], r = d.radio[+radio.dataset.radio];
        if (r.automation) H.callService('automation', 'trigger', { entity_id: r.automation });
        if (this._c.radio_helper) H.callService('input_text', 'set_value', { entity_id: this._c.radio_helper, value: r.station === false ? '' : r.name });
        return;
      }
      const off = t.closest('[data-off]');
      if (off) {
        ev.stopPropagation();
        H.callService('media_player', 'turn_off', { entity_id: off.dataset.off });
        if (this._c.radio_helper) H.callService('input_text', 'set_value', { entity_id: this._c.radio_helper, value: '' });
        return;
      }
      const vol = t.closest('[data-vol]');
      if (vol) {
        ev.stopPropagation();
        const id = vol.dataset.ent, s = H.states[id], cur = s && s.attributes.volume_level != null ? +s.attributes.volume_level : 0;
        const vm = +vol.dataset.max || 100, nv = Math.max(0, Math.min(1, (Math.round(cur * vm) + (+vol.dataset.vol)) / vm));
        H.callService('media_player', 'volume_set', { entity_id: id, volume_level: nv });
        return;
      }
      const row = t.closest('.r'); if (!row) return;
      const i = +row.dataset.i, d = this._c.devices[i];
      const ht = d.head_tap === 'card' ? d.card && d.card.tap_action : d.head_tap;
      if (ht && !t.closest('.chev')) { this._action(ht, d.entity); return; }
      this._open[i] = !this._open[i];
      try { localStorage.setItem('mmc-open', JSON.stringify(this._open)); } catch (e) {}
      row.parentElement.classList.toggle('open', !!this._open[i]);
      this._last = ''; this._render();
    }
    _action(a, ent) {
      const H = this._hass;
      if (a.action === 'fire-dom-event' && a.browser_mod) { H.callService('browser_mod', a.browser_mod.service.split('.')[1] || 'popup', a.browser_mod.data || {}); return; }
      if (a.action === 'perform-action' || a.action === 'call-service') { const [dm, sv] = (a.perform_action || a.service).split('.'); H.callService(dm, sv, a.data || a.service_data || {}, a.target); return; }
      this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: a.entity || ent }, bubbles: true, composed: true }));
    }

    _html() {
      const H = this._hass, out = [];
      if (this._c.title !== false) out.push(`<div class="hd">${esc(this._c.title || 'Multimedia')}</div>`);
      const sender = this._c.radio_helper && H.states[this._c.radio_helper] ? H.states[this._c.radio_helper].state : '';
      const rows = this._c.devices.map((d, i) => {
        const s = H.states[d.entity], st = s ? s.state : 'unavailable', a = (s && s.attributes) || {};
        const act = ACTIVE.includes(st), green = st === 'on' || st === 'playing';
        // Bild der aktuellen Wiedergabe
        const pic = act && a.entity_picture ? a.entity_picture : '';
        const live = act && d.channel_logos && (/live\s*tv/i.test(String(a.source || a.app_name || '')) || a.app_id === 'com.webos.app.livetv') && a.media_title && a.media_title !== a.source;
        const ai = act && !(a.app_name || a.source) && APPICON[a.app_id];
        // Links immer das Geraete-Icon; was laeuft, kommt klein vor den Text darunter
        const badge = ico(d.icon || a.icon || 'mdi:speaker');
        let th = pic ? `<img class="th${d.round_picture ? ' rnd' : ''}" src="${esc(pic)}" alt="">` : '';
        if (live) {
          const cands = (d.logo_map && d.logo_map[a.media_title] ? [d.channel_logos + d.logo_map[a.media_title]] : []).concat(logoCands(a.media_title, d.channel_logos));
          th = `<img class="th logo" src="${esc(cands[0])}" data-alt="${esc(cands.slice(1).concat(pic ? [pic] : []).join('|'))}" alt="">`;
        }
        if (!th && ai) th = `<ha-icon icon="${ai[0]}" style="--mdc-icon-size:13px;vertical-align:1px;margin-right:4px;color:${ai[1] || 'var(--secondary-text-color)'}"></ha-icon>`;
        // Was laeuft
        const lines = [];
        if (act) {
          if (d.radio && sender && sender !== 'unknown') { const rs = d.radio.find((r) => r.name === sender); lines.push((rs && rs.image ? `<img class="th" src="${esc(rs.image)}" alt="">` : th) + `Radio · ${esc(sender)}`); }
          else {
            // Zeile 1: Logo + Titel/Sender, darunter Interpret bzw. Folge, darunter App/Quelle
            const app0 = a.app_name || a.source || appName(a.app_id), app = /^default media receiver$/i.test(app0) ? 'Webradio' : app0;
            const wk = !live && (WORDMARK[a.app_id] || WORDMARK[String(app).toLowerCase()]);
            let t1 = th;
            if (wk && !this._badWm.has(wk)) { const base = d.app_logos || '/local/applogos/';
              const lt = wk === 'youtube' ? this._wmLight(base + wk + '.svg') : undefined;
              t1 = `<img class="th wm${lt === null ? ' inv' : ''}" src="${esc(lt || base + wk + '.svg')}"${lt === '' ? ' style="opacity:0"' : ''} data-alt="${esc(base + wk)}.png" data-wm="${wk}" alt="${esc(app)}">`; }
            const title = a.media_title && a.media_title !== app ? a.media_title : '';
            const artist = a.media_artist && a.media_artist !== title && a.media_artist !== app ? a.media_artist : '';
            const hasWm = wk && !this._badWm.has(wk);
            // Bild (Tonie/Cover) gross links neben Titel + Folge/Interpret
            if (title && pic && !live && !hasWm && th.startsWith('<img')) { lines.push({ blk: `<img class="tb${d.round_picture ? ' rnd' : ''}" src="${esc(pic)}" alt=""><span class="bt"><span>${esc(title)}</span>${artist ? `<span>${esc(artist)}</span>` : ''}${app ? `<span>${esc(app)}</span>` : ''}</span>` }); }
            else if (title) { lines.push(t1 + esc(title)); if (artist) lines.push(esc(artist)); if (app && !hasWm && !live) lines.push(esc(app)); }
            else if (hasWm) { lines.push(t1); if (artist) lines.push(esc(artist)); }
            else if (app || t1) { lines.push(t1 + esc(app)); if (artist) lines.push(esc(artist)); }
          }
        }
        // Akku nur bei laufender Box, beim Laden oder wenn kritisch (≤ 20 %)
        const bv = d.battery && H.states[d.battery] ? parseFloat(H.states[d.battery].state) : NaN;
        const bShow = act || bv <= 20 || (d.charging && H.states[d.charging] && H.states[d.charging].state === 'on');
        if (d.battery && H.states[d.battery] && bShow) {
          const b = Math.round(parseFloat(H.states[d.battery].state)), ch = d.charging && H.states[d.charging] && H.states[d.charging].state === 'on';
          const bc = b <= 20 ? C.red : b <= 50 ? C.yellow : C.green;
          let ln = isNaN(b) ? '' : `<span class="nw"><b style="color:${bc}">Akku ${b} %</b>${ch ? ` <ha-icon icon="mdi:lightning-bolt" style="--mdc-icon-size:11px;vertical-align:-1px;color:${bc}"></ha-icon>` : ''}</span>`;
          const sl = d.sleeptimer && H.states[d.sleeptimer];
          if (sl && sl.state === 'on') { const u = sl.attributes.sleep_until ? new Date(sl.attributes.sleep_until) : null, m = u && !isNaN(u) ? Math.max(0, Math.ceil((u - Date.now()) / 60000)) : null;
            ln += `${ln ? ' · ' : ''}<ha-icon icon="mdi:sleep" style="--mdc-icon-size:12px;vertical-align:-1px;margin-right:2px"></ha-icon>${m != null ? `noch ${m} min` : 'aktiv'}`; }
          if (ln) lines.push(`<span class="nw">${ln}</span>`);
        }
        const sec = lines.map((l) => (l && l.blk ? `<span class="sec blk">${l.blk}</span>` : `<span class="sec">${l}</span>`)).join('');
        // Mit grossem Bild (Tonie/Cover): Untertext ueber die volle Breite unter Name + Status
        const wide = lines.some((l) => l && l.blk);
        const row = `<div class="r${wide ? ' wide' : ''}" data-i="${i}"><div class="bd">${badge}</div><div class="nm">${esc(d.name || a.friendly_name || d.entity)}${wide ? '' : sec}</div>
          <div class="st" style="${green ? `color:${C.green}` : ''}">${esc(STATE[st] || st)}</div><div class="chev">${ico('mdi:chevron-down')}</div>${wide ? `<div class="sub">${sec}</div>` : ''}</div>`;
        // Radio + Lautstaerke (nur wenn an)
        let ex = '';
        if ((act && (d.radio || d.volume)) || (d.radio && this._open[i])) {
          let rad = '';
          if (d.radio) rad = `<div class="rad">${d.radio.map((r, k) => `<button data-dev="${i}" data-radio="${k}" class="${act && sender === r.name ? 'on' : ''}" aria-label="${esc(r.name)}"><img src="${esc(r.image)}" alt=""></button>`).join('')}
${act ? `<button class="off" data-off="${esc(d.entity)}" aria-label="Aus">${ico('mdi:power')}</button>` : ''}</div>`;
          let vol = '';
          if (act && d.volume && a.volume_level != null) {
            // Lautstaerke in der Skala des Geraets (z. B. LG-Soundbar 0–40), Balken weiter in Prozent
            const vm = d.volume_max || 100, v = Math.round(a.volume_level * 100), vv = Math.round(a.volume_level * vm);
            const zones = [[0, 30, C.green], [30, 60, C.yellow], [60, 100, C.red]];
            const G = `linear-gradient(90deg,${C.green} 15%,${C.yellow} 45%,${C.orange} 70%,${C.red} 90%)`;
            const segs = zones.map(([f, to], k) => { const w = to - f; return `<div class="${k === 0 || v > f ? 'on' : ''}" style="flex:0 0 calc(${w}% - 2px);background-image:${G};background-size:${(10000 / w).toFixed(1)}% 100%;background-position:${w >= 99.9 ? 0 : (f / (100 - w) * 100).toFixed(2)}% 0"></div>`; }).join('');
            vol = `<div><div class="vh"><span>Lautstärke</span><b>${vv}</b></div><div class="vol"><button data-vol="-1" data-max="${vm}" data-ent="${esc(d.entity)}" aria-label="Leiser">−</button>
              <div class="vb"><div class="seg">${segs}<i class="tri" style="left:${Math.max(1, Math.min(99, v))}%"></i></div>
              <div class="tk"><span style="left:0">0</span><span style="left:30%">${Math.round(vm * 0.3)}</span><span style="left:60%">${Math.round(vm * 0.6)}</span><span style="right:0">${vm}</span></div></div>
              <button data-vol="1" data-max="${vm}" data-ent="${esc(d.entity)}" aria-label="Lauter">+</button></div></div>`;
          }
          ex = `<div class="ex">${rad}${vol}</div>`;
        }
        const fold = d.card ? `<div class="fb"><div class="fi" data-slot="${i}" data-keep></div></div>` : '';
        return `<div class="dev${this._open[i] ? ' open' : ''}">${row}${ex}${fold}</div>`;
      });
      out.push(`<div class="body">${rows.join('')}</div>`);
      return out.join('');
    }
  }

  customElements.define(TAG, MultimediaCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Multimedia', description: 'Mediengeraete mit Status, aktueller Wiedergabe, Radio und Lautstaerke' });
})();
