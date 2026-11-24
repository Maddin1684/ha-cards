// arbeitsweg-route-card v14 – Option theme: auto|dark|light (Grundkarte erzwungen dunkel/hell)
const LJS = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet-src.esm.js';
const LCSS = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
let _lp = null, _cp = null;
const LOCAL = '/local/leaflet/';
const txt = u => fetch(u).then(r => r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)));
const loadL = () => _lp || (_lp = import(LOCAL + 'leaflet-src.esm.js').catch(() => import(LJS)).catch(e => { _lp = null; throw e; }));
const loadCss = () => _cp || (_cp = txt(LOCAL + 'leaflet.css').catch(() => txt(LCSS)).catch(e => { _cp = null; throw e; }));
loadL().catch(() => {}); loadCss().catch(() => {});   // sofort vorladen, nicht erst beim ersten Kartenaufbau
const CACHE = {};
const GREEN = '#30d158', YELLOW = '#ffd60a', ORANGE = '#ff9f0a', RED = '#ff453a', BLUE = '#0a84ff';
const delayColor = s => s < 120 ? GREEN : s < 480 ? YELLOW : RED;
const secColor = m => ['#8e8e93', YELLOW, ORANGE, RED, '#b00020'][m] || ORANGE;
const CAT = { JAM: 'Stau', ROAD_WORK: 'Baustelle', ROAD_CLOSURE: 'Sperrung', OTHER: 'Störung' };
const today = () => new Date().toDateString();
const hhmm = d => d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
const distM = (a, b) => { const dx = (a[1] - b[1]) * 71500, dy = (a[0] - b[0]) * 111320; return Math.sqrt(dx * dx + dy * dy); };
const ls = {
  get(k) { try { return JSON.parse(localStorage.getItem('awrc_' + k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem('awrc_' + k, JSON.stringify(v)); } catch (e) {} }
};

class ArbeitswegRouteCard extends HTMLElement {
  setConfig(c) {
    if (!c || !c.api_key) throw new Error('api_key fehlt');
    this._c = Object.assign({ home: 'zone.home', car: null, start_from_car: true, direction: 'auto',
      switch_hour: 12, refresh: 600, height: 480, map_type: 'map', theme: 'auto' }, c);
    this._works = c.works || [{ zone: c.work || 'zone.arbeit', name: 'Arbeit', days: [1, 2, 3, 4, 5] }];
  }
  getCardSize() { return 8; }
  getGridOptions() { return { columns: 12, rows: 8, min_rows: 6 }; }
  _isDark(h) {
    const t = this._c.theme;
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return !!(h && h.themes && h.themes.darkMode);
  }
  set hass(h) {
    this._hass = h;
    if (!this._built) { this._build(); return; }
    const dark = this._isDark(h);
    if (this._map && dark !== this._dark) { this._dark = dark; this._setBase(); }
    this._markers();
    // Fahrzeug hat sich deutlich bewegt -> Route neu (max. alle 2 min)
    const car = this._carPos();
    if (car && this._lastOrigin && this._c.start_from_car && distM(car, this._lastOrigin) > 400 &&
        Date.now() - (this._lastFetch || 0) > 120000) this._load(true);
  }
  _waitSize() {
    return new Promise(res => {
      const chk = () => (this.offsetWidth > 0 && this.offsetHeight > 0) ? res() : requestAnimationFrame(chk);
      chk();
    });
  }
  // Watchdog: laden die Grundkarten-Kacheln nicht, Größe neu messen und Kacheln neu anfordern
  _kick() {
    clearTimeout(this._kickT);
    this._tilesOk = false;
    this._kickT = setTimeout(() => {
      if (this._tilesOk || !this._map || !this.offsetWidth) return;
      this._map.invalidateSize();
      (this._baseLayers || []).forEach(l => l.redraw());
      this._kickN = (this._kickN || 0) + 1;
      if (this._kickN < 4) this._kick();
    }, 2500);
  }
  connectedCallback() {
    if (this._map) requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!this._map) return;
      this._map.invalidateSize(); this._kickN = 0; this._kick();
      if (this._routeFit) this._fit(this._routeFit[0], this._routeFit[1]);
    }));
    if (!this._timer && this._c) this._timer = setInterval(() => this._load(true), this._c.refresh * 1000);
  }
  disconnectedCallback() { clearInterval(this._timer); this._timer = null; }

  _pos(id) {
    const s = id && this._hass && this._hass.states[id];
    if (!s || s.attributes.latitude == null) return null;
    return [s.attributes.latitude, s.attributes.longitude];
  }
  _carPos() {
    const p = this._pos(this._c.car);
    if (p) { const l = ls.get('carpos'); if (!l || l.p[0] !== p[0] || l.p[1] !== p[1]) ls.set('carpos', { p, t: Date.now() }); }
    return p;
  }
  // Kein Standort bekannt und nichts gespeichert -> letzte Position aus der HA-Historie (72 h) holen
  async _seedCarPos() {
    if (!this._c.car || this._carPos() || this._carLast()) return;
    try {
      const res = await this._hass.callWS({ type: 'history/history_during_period', entity_ids: [this._c.car],
        start_time: new Date(Date.now() - 72 * 3600e3).toISOString(), minimal_response: false, no_attributes: false });
      const list = (res && res[this._c.car]) || [];
      for (let i = list.length - 1; i >= 0; i--) {
        const a = list[i].a || list[i].attributes || {};
        if (a.latitude != null) {
          const t = list[i].lu ? list[i].lu * 1000 : Date.parse(list[i].last_updated || '') || Date.now();
          ls.set('carpos', { p: [a.latitude, a.longitude], t }); this._markers(true); return;
        }
      }
    } catch (e) {}
  }
  _carLast() { const l = ls.get('carpos'); return l && l.p ? l : null; }
  _carZones() { const s = this._c.car && this._hass && this._hass.states[this._c.car]; return (s && s.attributes.in_zones) || []; }
  _dirNow() {
    const m = ls.get('dir');
    if (m && m.day === today()) return m.v;
    const d = this._c.direction;
    if (d === 'hin' || d === 'zurueck') return d;
    const z = this._carZones();
    if (z.includes(this._c.home)) return 'hin';
    if (this._works.some(w => z.includes(w.zone))) return 'zurueck';
    return new Date().getHours() < this._c.switch_hour ? 'hin' : 'zurueck';
  }
  _workIdx() {
    const m = ls.get('work');
    if (m && m.day === today() && this._works[m.v]) return m.v;
    const z = this._carZones(), iz = this._works.findIndex(w => z.includes(w.zone));
    if (iz >= 0) return iz;
    const wd = new Date().getDay() || 7;
    const i = this._works.findIndex(w => (w.days || []).includes(wd));
    return i >= 0 ? i : 0;
  }
  _mapType() { return ls.get('maptype4') || this._c.map_type; }

  async _build() {
    this._built = true;
    const r = this.attachShadow({ mode: 'open' });
    const chips = this._works.map((w, i) => `<button class="chip" data-w="${i}">${w.name}</button>`).join('');
    r.innerHTML = `<style id="lcss"></style>
<style>
ha-card{overflow:hidden;position:relative;height:${this._c.height}px;font-family:var(--ha-font-family-body,system-ui)}
#map{position:absolute;inset:0;background:#1c1c1e;z-index:0}
.ui{position:absolute;z-index:2000;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.glass{background:rgba(28,28,30,.84);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 2px 12px rgba(0,0,0,.35);color:#fff}
button{border:0;background:transparent;color:#fff;font-size:13px;padding:7px 12px;border-radius:15px;cursor:pointer;white-space:nowrap;
 font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
button.on{background:#fff;color:#000;font-weight:600}
.seg{display:flex;border-radius:18px;padding:3px;gap:2px}
.topbar{top:10px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none}
.topbar>*{pointer-events:auto}
.layer{width:38px;height:38px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;--mdc-icon-size:20px}
.panel{left:10px;right:10px;bottom:22px;border-radius:16px;padding:10px 12px;display:flex;align-items:center;gap:10px}
.inf{flex:1;min-width:0}
.t{font-size:12px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.m{font-size:26px;font-weight:600;line-height:1.15}
.d{padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600;color:#000}
.s{font-size:11px;opacity:.7;margin-top:3px}
.ev{font-size:11px;margin-top:3px;color:${YELLOW};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dirs{flex-direction:column;background:rgba(255,255,255,.12)}
.pin{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;
 border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.5);color:#fff;--mdc-icon-size:18px}
.pin.off{opacity:.55;transform:scale(.8)}
.car{width:42px;height:42px;border-radius:50%;background:#15101f;border:2px solid ${BLUE};box-shadow:0 1px 6px rgba(0,0,0,.55);
 display:flex;align-items:center;justify-content:center;overflow:hidden;box-sizing:border-box}
.car{color:#fff;--mdc-icon-size:20px}
.car.stale{opacity:.6;filter:grayscale(1);border-style:dashed}
.dk .leaflet-control-attribution{background:rgba(28,28,30,.7)!important;color:#8e8e93}
.dk .leaflet-control-attribution a{color:#aeaeb2}
.dk .leaflet-tooltip{background:#1c1c1e;color:#fff;border-color:#1c1c1e}
.dk .leaflet-tooltip-top:before{border-top-color:#1c1c1e}
</style>
<ha-card><div id="map"></div>
<div class="ui topbar">
 ${this._works.length > 1 ? `<div class="seg glass">${chips}</div>` : '<span></span>'}
 <button class="layer glass"><ha-icon></ha-icon></button>
</div>
<div class="ui panel glass">
 <div class="inf"><div class="t">Lade Route…</div></div>
 <div class="seg dirs"><button class="dir" data-d="hin">Zur Arbeit</button><button class="dir" data-d="zurueck">Nach Hause</button></div>
</div>
</ha-card>`;
    this._info = r.querySelector('.inf');
    const tap = (el, fn) => {
      el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); fn(); });
      ['pointerdown', 'touchstart', 'mousedown', 'dblclick', 'wheel'].forEach(t => el.addEventListener(t, e => e.stopPropagation(), { passive: true }));
    };
    r.querySelectorAll('.dir').forEach(b => tap(b, () => { ls.set('dir', { day: today(), v: b.dataset.d }); this._fitted = null; this._load(false); }));
    r.querySelectorAll('.chip').forEach(b => tap(b, () => { ls.set('work', { day: today(), v: +b.dataset.w }); this._fitted = null; this._markers(true); this._load(false); }));
    tap(r.querySelector('.layer'), () => { ls.set('maptype4', this._mapType() === 'satellite' ? 'map' : 'satellite'); this._setBase(); });
    let L, css;
    for (let i = 0; i < 3 && !L; i++) {
      try { [L, css] = await Promise.all([loadL(), loadCss()]); }
      catch (e) { if (i === 2) { this._err('Kartenbibliothek nicht ladbar – bitte neu laden'); return; } await new Promise(z => setTimeout(z, 1500)); }
    }
    r.getElementById('lcss').textContent = css;
    this._L = L;
    await this._waitSize();
    this._map = L.map(r.getElementById('map'), { zoomControl: false, attributionControl: false, fadeAnimation: false })
      .setView(this._carPos() || this._pos(this._c.home) || [50.3, 9.4], 11);
    L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(this._map);
    this._dark = this._isDark(this._hass);
    const k = this._c.api_key;
    L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${k}`, { opacity: 0.55, maxZoom: 20, zIndex: 3 }).addTo(this._map);
    L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png?key=${k}`, { maxZoom: 20, zIndex: 4 }).addTo(this._map);
    this._setBase();
    this._routeLayer = L.layerGroup().addTo(this._map);
    this._pinLayer = L.layerGroup().addTo(this._map);
    new ResizeObserver(() => { if (this._map && this.offsetWidth) { this._map.invalidateSize(); this._kick(); } }).observe(r.querySelector('ha-card'));
    this._markers(true);
    this._load(false);
    this.connectedCallback();
    this._seedCarPos();
  }
  _setBase() {
    const L = this._L; if (!L) return;
    (this._baseLayers || []).forEach(l => this._map.removeLayer(l));
    const k = this._c.api_key, sat = this._mapType() === 'satellite';
    this._baseLayers = sat ? [
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20, maxNativeZoom: 19, zIndex: 1, attribution: 'Bilder &copy; Esri' }),
      L.tileLayer(`https://api.tomtom.com/map/1/tile/hybrid/main/{z}/{x}/{y}.png?key=${k}`, { maxZoom: 20, zIndex: 2, attribution: '&copy; TomTom' })
    ] : [L.tileLayer(`https://api.tomtom.com/map/1/tile/basic/${this._dark ? 'night' : 'main'}/{z}/{x}/{y}.png?key=${k}`,
      { maxZoom: 20, zIndex: 1, attribution: '&copy; TomTom' })];
    this._baseLayers.forEach(l => { l.on('load tileload', () => { this._tilesOk = true; }); l.addTo(this._map); });
    this._kickN = 0; this._kick();
    const card = this.shadowRoot.querySelector('ha-card'); if (card) card.classList.toggle('dk', !!this._dark);
    this.shadowRoot.querySelector('.layer ha-icon').setAttribute('icon', sat ? 'mdi:map-outline' : 'mdi:satellite-variant');
  }
  _pin(pos, icon, color, off) {
    const L = this._L;
    return L.marker(pos, { icon: L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15],
      html: `<div class="pin${off ? ' off' : ''}" style="background:${color}"><ha-icon icon="${icon}"></ha-icon></div>` }) });
  }
  _carMarker(pos, stale) {
    const L = this._L, s = this._hass.states[this._c.car];
    const pic = s && s.attributes.entity_picture;
    // Bild einmalig testen; schlägt es fehl, Auto-Icon statt Foto
    if (pic && this._picSrc !== pic) {
      this._picSrc = pic; this._picFail = false;
      const probe = new Image();
      probe.onerror = () => { this._picFail = true; this._markers(true); };
      probe.src = pic;
    }
    const html = pic && !this._picFail
      ? `<div class="car${stale ? ' stale' : ''}" style="background:#15101f url('${pic}') center / 88% auto no-repeat"></div>`
      : `<div class="car${stale ? ' stale' : ''}"><ha-icon icon="mdi:car-electric"></ha-icon></div>`;
    const m = L.marker(pos, { zIndexOffset: 1000, icon: L.divIcon({ className: '', iconSize: [42, 42], iconAnchor: [21, 21], html }) });
    if (stale) { const l = this._carLast(); m.bindTooltip('Letzte bekannte Position' + (l ? ' · ' + new Date(l.t).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''), { direction: 'top', offset: [0, -20] }); }
    return m;
  }
  _markers(force) {
    if (!this._pinLayer) return;
    const wi = this._workIdx();
    const ids = [this._c.home, this._c.car, ...this._works.map(w => w.zone)];
    const cl = this._carLast();
    const sig = wi + '|' + ids.map(id => (this._pos(id) || []).join(',')).join('|') + '|' + (cl ? cl.p.join(',') : '');
    if (!force && sig === this._pinSig) return;
    this._pinSig = sig;
    this._pinLayer.clearLayers();
    const h = this._pos(this._c.home), c = this._carPos();
    if (h) this._pin(h, 'mdi:home', GREEN).addTo(this._pinLayer);
    this._works.forEach((w, i) => { const p = this._pos(w.zone);
      if (p) this._pin(p, w.icon || 'mdi:briefcase', i === wi ? BLUE : '#8e8e93', i !== wi).addTo(this._pinLayer); });
    if (c) this._carMarker(c).addTo(this._pinLayer);
    else if (cl) this._carMarker(cl.p, true).addTo(this._pinLayer);
  }
  async _load(force) {
    if (!this._map) return;
    const seq = this._seq = (this._seq || 0) + 1;
    const dir = this._dirNow(), wi = this._workIdx(), work = this._works[wi];
    const sr = this.shadowRoot;
    sr.querySelectorAll('.dir').forEach(b => b.classList.toggle('on', b.dataset.d === dir));
    sr.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', +b.dataset.w === wi));
    const h = this._pos(this._c.home), w = this._pos(work.zone), car = this._carPos();
    if (!h || !w) { this._err('Zone Zuhause/Arbeit fehlt'); return; }
    const fromCar = !!(car && this._c.start_from_car);
    const a = fromCar ? car : (dir === 'hin' ? h : w), b = dir === 'hin' ? w : h;
    if (distM(a, b) < 300) { this._routeLayer.clearLayers(); this._info.innerHTML =
      `<div class="t">${dir === 'hin' ? work.name : 'Zuhause'}</div><div class="m">Am Ziel</div><div class="s">Der Enyaq steht bereits dort</div>`; return; }
    const key = `${wi}_${dir}_${a[0].toFixed(3)},${a[1].toFixed(3)}`, c = CACHE[key];
    let data;
    try {
      if (!force && c && Date.now() - c.t < this._c.refresh * 1000) data = c.data;
      else {
        const t = this._info.querySelector('.t'); if (t) t.textContent = 'Aktualisiere…';
        const url = `https://api.tomtom.com/routing/1/calculateRoute/${a[0]},${a[1]}:${b[0]},${b[1]}/json` +
          `?key=${this._c.api_key}&traffic=true&travelMode=car&routeType=fastest&sectionType=traffic`;
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
        let res;
        try { res = await fetch(url, { signal: ctl.signal, cache: 'no-store' }); }
        catch (e) { throw new Error(e.name === 'AbortError' ? 'Zeitüberschreitung' : 'Netzwerk: ' + e.message); }
        finally { clearTimeout(to); }
        if (!res.ok) { let m = ''; try { m = (await res.json()).detailedError?.message || ''; } catch (e) {} throw new Error('HTTP ' + res.status + (m ? ' – ' + m : '')); }
        data = await res.json();
        CACHE[key] = { t: Date.now(), data };
        this._lastFetch = Date.now();
      }
      this._lastOrigin = a;
      if (seq !== this._seq) return;
      this._draw(data, dir, work, key, fromCar);
    } catch (e) {
      if (seq === this._seq) this._err(e.message || String(e));
    }
  }
  _err(m) { this._info.innerHTML = `<div class="t">Route nicht verfügbar</div><div class="s" style="opacity:.9">${m}</div>`; }
  _fit(pts, key) {
    if (!this._map.getSize().x) this._map.invalidateSize();
    const s = this._map.getSize();
    if (!s.x || !s.y) { setTimeout(() => this._fit(pts, key), 300); return; }
    const panel = this.shadowRoot.querySelector('.panel');
    const pb = (panel ? panel.offsetHeight : 110) + 40;
    this._map.fitBounds(this._L.latLngBounds(pts), { paddingTopLeft: [30, 64], paddingBottomRight: [30, pb] });
    this._fitted = key;
  }
  _draw(data, dir, work, key, fromCar) {
    const L = this._L, route = data.routes && data.routes[0];
    if (!route) { this._err('Keine Route gefunden'); return; }
    const pts = route.legs.flatMap(l => l.points.map(p => [p.latitude, p.longitude]));
    const sm = route.summary, delay = sm.trafficDelayInSeconds || 0, col = delayColor(delay);
    this._routeLayer.clearLayers();
    L.polyline(pts, { color: '#ffffff', weight: 9, opacity: 0.9 }).addTo(this._routeLayer);
    L.polyline(pts, { color: col, weight: 5, opacity: 1 }).addTo(this._routeLayer);
    const evs = [];
    (route.sections || []).filter(s => s.sectionType === 'TRAFFIC').forEach(s => {
      const seg = pts.slice(s.startPointIndex, s.endPointIndex + 1);
      if (seg.length > 1) L.polyline(seg, { color: secColor(s.magnitudeOfDelay), weight: 6,
        dashArray: s.simpleCategory === 'ROAD_CLOSURE' ? '6 6' : null }).addTo(this._routeLayer);
      evs.push(`${CAT[s.simpleCategory] || 'Störung'}${s.delayInSeconds ? ' +' + Math.round(s.delayInSeconds / 60) + ' min' : ''}`);
    });
    const fk = dir + '_' + work.zone;
    this._routeFit = [pts, fk];
    if (this._fitted !== fk) this._fit(pts, fk);
    const min = Math.round(sm.travelTimeInSeconds / 60), km = (sm.lengthInMeters / 1000).toFixed(1).replace('.', ',');
    const dm = Math.round(delay / 60);
    const ziel = dir === 'hin' ? 'Nach ' + work.name : 'Nach Hause';
    const ab = fromCar ? 'ab Standort Enyaq' : (dir === 'hin' ? 'ab Zuhause' : 'ab ' + work.name) + (this._c.car && this._c.start_from_car ? ' (Enyaq-Standort unbekannt)' : '');
    this._info.innerHTML = `<div class="t">${ziel} · ${ab}</div>
<div class="row"><span class="m">${min} min</span><span class="d" style="background:${col}">${dm > 0 ? '+' + dm + ' min' : 'frei'}</span></div>
<div class="s">${km} km · an ${hhmm(new Date(Date.now() + sm.travelTimeInSeconds * 1000))} · Stand ${hhmm(new Date())}</div>
${evs.length ? `<div class="ev">${evs.slice(0, 3).join(' · ')}</div>` : ''}`;
  }
}
if (!customElements.get('arbeitsweg-route-card')) customElements.define('arbeitsweg-route-card', ArbeitswegRouteCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'arbeitsweg-route-card', name: 'Arbeitsweg Route', description: 'TomTom-Route mit Verkehr' });