// kamera-live-card v3.27 (25.11.2026: reine Tier-Clips (ohne Person/Fahrzeug) einer Kamera mit Luecke <= merge_gap_tier_s (Standard 300 s) gelten als ein Ablauf - Katze, die dauerhaft da sitzt, ist ein Eintrag statt vieler; v3.26 (23.11.2026: Tiere wieder Gelb in Liste, Zeitleiste und Zaehler-Pillen, Personen Rot; v3.24: Aufnahmen-Symbol mdi:motion-play-outline, Erkennungs-Chip hoeher (direkt unter Kamera-Uhr), Tier-Zaehler Apple-Rot; v3.23: Aufnahmen-Zaehler erscheinen sofort aus dem Geraete-Speicher und werden nach 1,5 s aufgefrischt (statt erst nach 4 s); v3.22: Erkennungs-Chip tiefer (unter Kamera-Zeitstempel), deckendes Apple-Rot; v3.21: Hauptbild loest das Standbild ab, sobald das erste helle Live-Bild da ist (wie die Kacheln), reveal_after Standard 0,3 s, Ueberblendung 0,25 s; v3.20: SD-Dateien einer Kamera mit Luecke <= merge_gap_s (Standard 30 s) gelten als ein Ablauf; v3.19: zusammengefasst werden zu einer Zeile zusammengefasst und nacheinander abgespielt; korrigierte KI-Texte ohne Haken; v3.18: Fehlalarme aus todo.kamera_ki (Text beginnt mit 'Fehlalarm') werden in Aufnahmen-Liste und Zaehlern ausgeblendet; v3.17: Haptik) – Hof/Garten-Kamerakarte: beide Streams (HA-WebRTC) laufen im Hintergrund,
// Kachelbilder = Einzelbilder aus den laufenden Streams (1x/s), Wechsel ohne Ladezeit.
(() => {
  const TAG = 'kamera-live-card';
  if (customElements.get(TAG)) return;

  const CSS = `
    :host { display:block; }
    ha-card { padding:4px; overflow:hidden; }
    .tiles { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
    .tile { all:unset; box-sizing:border-box; cursor:pointer; display:grid; grid-template-columns:var(--kl-pw) minmax(0,1fr);
      grid-template-areas:"pic n" "pic st" "pic l"; column-gap:10px; row-gap:2px; align-content:center; align-items:center;
      padding:7px 10px; border-radius:12px; -webkit-tap-highlight-color:transparent; }
    .pic { grid-area:pic; position:relative; width:var(--kl-pw); height:var(--kl-ph); border-radius:6px; overflow:hidden;
      background:#1c1c1e center/cover no-repeat; }
    .pic canvas { position:absolute; inset:0; width:100%; height:100%; opacity:0; transition:opacity .3s; }
    .pic canvas.on { opacity:1; }
    .pic.det { animation:kl-ring 1.4s ease-in-out infinite; }
    .pic.det::after { content:""; position:absolute; inset:0; border-radius:6px; box-shadow:inset 0 0 0 1.5px #ff453a; }
    @keyframes kl-ring { 0%,100% { box-shadow:0 0 7px 1px rgba(255,69,58,.75); } 50% { box-shadow:0 0 2px 0 rgba(255,69,58,.2); } }
    .n { grid-area:n; font-size:var(--kl-fn); line-height:1; color:#fff; white-space:nowrap; align-self:end; }
    .st { grid-area:st; display:inline-flex; align-items:center; gap:4px; font-size:var(--kl-fs); line-height:1; white-space:nowrap; overflow:hidden; min-width:0; }
    .l { grid-area:l; font-size:var(--kl-fs); line-height:1; color:rgba(255,255,255,.6); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; align-self:start; }
    .l ha-icon { --mdc-icon-size:calc(var(--kl-fs) + 3px); color:rgba(255,255,255,.6); margin-right:4px; vertical-align:-1px; }
    .st ha-icon { display:inline-flex; }
    .main { position:relative; margin-top:6px; border-radius:var(--kl-main-radius, var(--ha-card-border-radius, 12px)); -webkit-mask-image:-webkit-radial-gradient(white, black); overflow:hidden; background:#1c1c1e center/cover no-repeat; }
    .layer { position:absolute; inset:0; opacity:0; pointer-events:none; transition:opacity .15s; }
    .layer.sel { opacity:1; }
    .layer > .cardwrap { position:absolute; inset:0; }
    .layer > .cardwrap > * { display:block; height:100%; --ha-card-border-radius:0; --ha-card-box-shadow:none; --ha-card-border-width:0; }
    .poster { position:absolute; inset:0; background:#1c1c1e center/cover no-repeat; pointer-events:none; transition:opacity .25s; }
    .poster.off { opacity:0; }
    .ov { position:absolute; inset:0; pointer-events:auto; -webkit-tap-highlight-color:transparent; }
    .layer:not(.sel) .ov, .layer:not(.sel) .ov * { pointer-events:none !important; }
    .snd { all:unset; position:absolute; top:6px; left:6px; cursor:pointer; padding:6px; border-radius:50%; background:rgba(0,0,0,.35); display:inline-flex; -webkit-tap-highlight-color:transparent; }
    .snd ha-icon { --mdc-icon-size:18px; color:#fff; }
    .detic { position:absolute; top:max(24px, 9%); right:10px; z-index:2; display:flex; flex-direction:column; align-items:flex-end; gap:6px; pointer-events:none; }
    .kc { display:inline-flex; align-items:center; height:26px; box-sizing:border-box; padding:0 4px; border-radius:999px; overflow:hidden; white-space:nowrap;
      color:#fff; font-size:12px; font-weight:600; background:rgba(0,0,0,.75); border:1px solid rgba(255,255,255,.18);
      -webkit-backdrop-filter:blur(10px) saturate(1.4); backdrop-filter:blur(10px) saturate(1.4); opacity:0; transform:scale(.6);
      transition:background-color .5s, box-shadow .5s, opacity .3s, transform .4s cubic-bezier(.3,1.4,.5,1); }
    .kc.show { opacity:1; transform:none; }
    .kc.red { background:#ff453a; border-color:transparent; -webkit-backdrop-filter:none; backdrop-filter:none; box-shadow:0 3px 10px rgba(0,0,0,.35); }
    .kc .sg { display:inline-flex; align-items:center; max-width:0; opacity:0; overflow:hidden; margin-left:0; transition:max-width .45s cubic-bezier(.4,0,.2,1), opacity .3s, margin-left .45s; }
    .kc .sg.in { max-width:200px; opacity:1; }
    .kc .sg.in ~ .sg.in { margin-left:6px; }
    .kc .sg ha-icon { --mdc-icon-size:15px; flex:0 0 16px; width:16px; display:inline-flex; justify-content:center; color:#fff; }
    .kc .sg span { max-width:0; padding:0; opacity:0; overflow:hidden; transition:max-width .55s cubic-bezier(.4,0,.2,1), padding .55s, opacity .2s; }
    .kc .sg.open span { max-width:130px; padding:0 4px 0 6px; opacity:1; transition:max-width .55s cubic-bezier(.4,0,.2,1), padding .55s, opacity .3s .2s; }
    .bar { position:absolute; left:50%; bottom:8px; transform:translate(-50%,6px); max-width:calc(100% - 16px); box-sizing:border-box; display:flex; align-items:center; gap:2px;
      padding:4px 6px; border-radius:999px; background:rgba(40,40,44,.45); -webkit-backdrop-filter:blur(18px) saturate(1.6); backdrop-filter:blur(18px) saturate(1.6);
      border:1px solid rgba(255,255,255,.14); box-shadow:0 6px 20px rgba(0,0,0,.25); overflow:hidden; opacity:0; pointer-events:none; transition:opacity .3s, transform .3s; }
    .bar.open { opacity:1; transform:translate(-50%,0); pointer-events:auto; }
    .bar button { all:unset; cursor:pointer; flex:0 0 auto; width:var(--kb,32px); height:var(--kb,32px); border-radius:50%; display:inline-flex; align-items:center; justify-content:center;
      transition:background-color .2s; -webkit-tap-highlight-color:transparent; }
    .bar button:active { background-color:rgba(255,255,255,.18) !important; }
    .bar ha-icon { --mdc-icon-size:var(--ki,18px); display:inline-flex; }
    .bar .sep { flex:0 0 1px; width:1px; height:calc(var(--kb,32px) * .55); background:rgba(255,255,255,.22); margin:0 3px; }
    .bar .prog { position:absolute; left:16px; right:16px; bottom:2px; height:2px; border-radius:1px; background:rgba(255,255,255,.5); transform-origin:left; transform:scaleX(0); }
    .bar .prog { display:none; }
    @keyframes kl-prog { from { transform:scaleX(1); } to { transform:scaleX(0); } }
    .tl { margin-top:6px; }
    .tlt { all:unset; box-sizing:border-box; cursor:pointer; width:100%; display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:10px; font-size:13px; color:#fff; -webkit-tap-highlight-color:transparent; }
    .tlt ha-icon { --mdc-icon-size:18px; color:rgba(255,255,255,.8); }
    .tlt .cnt { display:inline-flex; align-items:center; gap:6px; margin-left:2px; min-width:0; overflow:hidden; }
    .tlt .cap { display:inline-flex; align-items:center; gap:4px; padding:4px 9px; border-radius:999px; background:rgba(255,255,255,.08); font-size:12px; color:rgba(255,255,255,.75); white-space:nowrap; }
    .tlt .cap b { font-weight:600; color:#fff; margin-right:2px; }
    .tlt .cap b.z { color:rgba(255,255,255,.35); }
    .tlt .cap ha-icon { --mdc-icon-size:13px; }
    .tlt .cap ha-icon.z { opacity:.35; }
    ha-card.compact .tlt { gap:6px; padding:8px 6px; }
    ha-card.compact .tlt .lbl, ha-card.compact .tlt > ha-icon { display:none; }
    ha-card.compact .tlt .cnt { gap:5px; }
    ha-card.compact .tlt .cap { padding:3px 7px; gap:3px; font-size:11px; }
    ha-card.compact .tlt .cap ha-icon { --mdc-icon-size:12px; }
    .tlt .chev { margin-left:auto; transition:transform .2s; }
    .tl.open .tlt .chev { transform:rotate(180deg); }
    .tlb { display:none; padding:0 6px 6px; }
    .tl.open .tlb { display:block; }
    .tlnav { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:2px 0 8px; }
    .chip { all:unset; cursor:pointer; padding:6px 10px; border-radius:999px; font-size:12px; color:rgba(255,255,255,.75); background:rgba(255,255,255,.08); -webkit-tap-highlight-color:transparent; }
    .chip.on { color:#fff; background:#f56300; }
    .chip.nav { padding:6px 9px; }
    .day { font-size:13px; color:#fff; min-width:74px; text-align:center; }
    .tlg { display:grid; grid-template-columns:44px minmax(0,1fr); align-items:stretch; margin:22px 4px 4px 0; }
    .lanes { display:flex; flex-direction:column; justify-content:space-around; font-size:10px; color:rgba(255,255,255,.6); padding-right:4px; text-align:right; }
    .lanes span { display:flex; align-items:center; justify-content:flex-end; gap:4px; height:16px; }
    .lanes i { flex:0 0 5px; width:5px; height:5px; border-radius:50%; display:inline-block; }
    .bar24 { position:relative; border-radius:6px; background:rgba(255,255,255,.06); }
    .bar24 .lane { position:absolute; left:0; right:0; height:1px; background:rgba(255,255,255,.07); }
    .bar24 .tick { position:absolute; top:0; bottom:0; width:1px; background:rgba(255,255,255,.12); }
    .bar24 .tick span { position:absolute; top:calc(100% + 3px); left:0; transform:translateX(-50%); font-size:9px; color:rgba(255,255,255,.45); white-space:nowrap; }
    .bar24 .tick.first span { transform:none; }
    .bar24 .tick.last span { left:auto; right:0; transform:none; }
    .bar24 .dot { all:unset; cursor:pointer; position:absolute; height:16px; width:14px; margin-left:-7px; }
    .bar24 .dot::after { content:""; position:absolute; left:6px; top:2px; bottom:2px; width:2px; border-radius:1px; background:var(--c); }
    .bar24 .now { position:absolute; bottom:calc(100% - 4px); transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; line-height:1; color:#f56300; pointer-events:none; }
    .bar24 .now span { font-size:10px; font-weight:600; }
    .bar24 .now ha-icon { --mdc-icon-size:16px; margin-top:-3px; }
    .bar24 .now.r { transform:translateX(calc(-100% + 8px)); align-items:flex-end; }
    .bar24 .now.l { transform:translateX(-8px); align-items:flex-start; }
    .list { margin-top:18px; max-height:280px; overflow-y:auto; -webkit-overflow-scrolling:touch; display:flex; flex-direction:column; gap:2px; }
    .row { all:unset; box-sizing:border-box; cursor:pointer; display:grid; grid-template-columns:44px minmax(0,1fr) auto; grid-template-areas:"t ty du" "c ty du"; align-items:center; column-gap:8px; row-gap:2px; padding:6px 8px; border-radius:8px; font-size:12px; color:#fff; -webkit-tap-highlight-color:transparent; }
    .row > span:first-child { grid-area:t; font-variant-numeric:tabular-nums; line-height:1.1; }
    .row:nth-child(odd) { background:rgba(255,255,255,.04); }
    .row.play { background:rgba(245,99,0,.32); }
    .row .cam { grid-area:c; display:inline-flex; align-items:center; gap:4px; font-size:10px; line-height:1.1; color:rgba(255,255,255,.6); }
    .row .cam i { flex:0 0 5px; width:5px; height:5px; border-radius:50%; display:inline-block; }
    .row .ty { grid-area:ty; display:flex; align-items:center; gap:3px; min-width:0; }
    .row .ics { flex:0 0 33px; width:33px; display:inline-flex; gap:3px; }
    .row .ty ha-icon { flex:0 0 auto; }
    .row .ki { margin-left:6px; font-size:11px; line-height:1.3; color:rgba(255,255,255,.82); white-space:normal; overflow:hidden; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; min-width:0; overflow-wrap:anywhere; }
    .row .ty ha-icon { --mdc-icon-size:15px; }
    .row .du { grid-area:du; font-size:11px; color:rgba(255,255,255,.5); font-variant-numeric:tabular-nums; }
    .empty { padding:12px 8px; font-size:12px; color:rgba(255,255,255,.55); }
    .player { position:absolute; inset:0; z-index:5; background:#000; display:none; }
    .player.on { display:block; }
    .player video { width:100%; height:100%; object-fit:contain; background:#000; }
    .player .pt { position:absolute; top:0; left:0; right:0; display:flex; align-items:center; gap:8px; padding:8px 44px 8px 8px; font-size:12px; color:#fff; background:linear-gradient(rgba(0,0,0,.6),transparent); pointer-events:none; }
    .player .px { all:unset; position:absolute; top:4px; right:4px; cursor:pointer; padding:6px; border-radius:50%; background:rgba(0,0,0,.45); display:inline-flex; }
    .player .px ha-icon { --mdc-icon-size:18px; color:#fff; }
    .player .pc { position:absolute; left:0; right:0; bottom:0; height:13%; min-height:38px; box-sizing:border-box; display:flex; align-items:center; gap:6px; padding:0 8px;
      background:rgba(60,60,60,.45); -webkit-backdrop-filter:blur(4px); backdrop-filter:blur(4px); }
    .player .pc button { all:unset; cursor:pointer; padding:6px; display:inline-flex; -webkit-tap-highlight-color:transparent; }
    .player .pc ha-icon { --mdc-icon-size:20px; color:#fff; }
    .player .pc .tm { font-size:11px; color:rgba(255,255,255,.85); font-variant-numeric:tabular-nums; min-width:28px; text-align:center; }
    .player .pc .sk { flex:1; min-width:0; margin:0 4px; accent-color:#f56300; height:4px; }
    .player .pl { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:rgba(255,255,255,.8); font-size:13px; pointer-events:none; }
  `;

  const deepFind = (root, sel, depth = 0) => {
    if (!root || depth > 12) return null;
    if (root.shadowRoot) { const r0 = deepFind(root.shadowRoot, sel, depth + 1); if (r0) return r0; }
    const hit = root.querySelector ? root.querySelector(sel) : null;
    if (hit) return hit;
    const kids = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (const k of kids) {
      if (k.shadowRoot) { const r = deepFind(k.shadowRoot, sel, depth + 1); if (r) return r; }
    }
    return null;
  };

  class KameraLiveCard extends HTMLElement {
    setConfig(c) {
      if (!c || !Array.isArray(c.cameras) || !c.cameras.length) throw new Error('cameras fehlt');
      if (!c.select_entity) throw new Error('select_entity fehlt');
      this._c = c;
      this._built = false;
      if (this.shadowRoot) this.shadowRoot.innerHTML = '';
    }
    getCardSize() { return 6; }
    getGridOptions() { return { columns: 'full', rows: 'auto' }; }

    connectedCallback() {
      this._vis = () => { if (!document.hidden) (this._cams || []).forEach((m) => { m.lastAdv = Date.now(); }); };
      document.addEventListener('visibilitychange', this._vis);
      const fps = Math.min(30, Math.max(1, Number(this._c && this._c.thumb_fps) || 5));
      this._iv = setInterval(() => this._grab(), Math.round(1000 / fps));
      this._iv2 = setInterval(() => { this._update(); this._tlBg(); }, 30000);
    }
    disconnectedCallback() { clearInterval(this._iv); clearInterval(this._iv2); document.removeEventListener('visibilitychange', this._vis); }

    set hass(h) {
      this._hass = h;
      if (!this._c) return;
      try {
        if (!this._built) this._build();
        (this._cams || []).forEach((m) => { if (m.card) m.card.hass = h; if (m.warmCard) m.warmCard.hass = h; });
        this._update();
      } catch (e) {
        console.error('kamera-live-card', e);
        const r = this.shadowRoot || this.attachShadow({ mode: 'open' });
        r.innerHTML = `<ha-card style="padding:12px;color:#ff6961;font-size:13px">kamera-live-card Fehler: ${String(e && e.message || e)}</ha-card>`;
        this._built = true; this._cams = null;
      }
    }

    _sel() {
      const s = this._hass && this._hass.states[this._c.select_entity];
      const real = s ? s.state : this._c.cameras[0].name;
      if (this._pending && this._pending !== real && Date.now() - this._pendingAt < 4000) return this._pending;
      this._pending = null;
      return real;
    }

    _ts(e) {
      const s = this._hass.states[e];
      return s && s.attributes && s.attributes.timestamp ? s.attributes.timestamp * 1000 : 0;
    }
    _on(e) { const s = e && this._hass.states[e]; return !!s && s.state === 'on'; }

    _build() {
      this._built = true;
      const c = this._c;
      const compact = !!c.compact;
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>${CSS}</style><ha-card><div class="tiles"></div><div class="main"><div class="player"><video playsinline></video><div class="pl"></div><div class="pt"></div><button class="px" aria-label="Clip schliessen"><ha-icon icon="mdi:close"></ha-icon></button><div class="pc"><button class="pp" aria-label="Wiedergabe/Pause"><ha-icon icon="mdi:play"></ha-icon></button><span class="tm t1">0:00</span><input class="sk" type="range" min="0" max="1000" value="0" aria-label="Position"><span class="tm t2">0:00</span><button class="fs" aria-label="Vollbild"><ha-icon icon="mdi:fullscreen"></ha-icon></button></div></div></div><div class="tl"></div><div class="dbg" style="font-size:10px;color:rgba(255,255,255,.55);padding:4px 6px 2px"></div></ha-card>`;
      this._dbgEl = c.debug ? root.querySelector('.dbg') : null;
      this._bornAt = Date.now();
      const card = root.querySelector('ha-card');
      if (compact) card.classList.add('compact');
      if (c.main_radius) card.style.setProperty('--kl-main-radius', c.main_radius);
      card.style.setProperty('--kl-pw', compact ? '54px' : '66px');
      card.style.setProperty('--kl-ph', compact ? '38px' : '46px');
      card.style.setProperty('--kl-fn', compact ? '12px' : '13px');
      card.style.setProperty('--kl-fs', compact ? '10px' : '11px');
      if (c.transparent) {
        [['background', 'none'], ['box-shadow', 'none'], ['border', 'none'], ['backdrop-filter', 'none'], ['-webkit-backdrop-filter', 'none']]
          .forEach(([k, v]) => card.style.setProperty(k, v, 'important'));
      }
      const main = root.querySelector('.main');
      main.style.aspectRatio = (c.aspect_ratio || '14/8').replace(':', '/');
      const tiles = root.querySelector('.tiles');

      this._cams = c.cameras.map((cam) => {
        const m = { cam };
        const t = document.createElement('button');
        t.className = 'tile';
        t.setAttribute('aria-label', cam.name + ' anzeigen');
        t.innerHTML = `<div class="pic"><canvas width="${compact ? 108 : 132}" height="${compact ? 76 : 92}"></canvas></div><span class="n"></span><span class="st"></span><span class="l"></span>`;
        t.querySelector('.n').textContent = cam.name;
        t.addEventListener('click', () => { this._haptic(); this._select(cam.name); });
        tiles.appendChild(t);
        m.tile = t; m.pic = t.querySelector('.pic'); m.canvas = t.querySelector('canvas');
        m.ctx = m.canvas.getContext('2d');

        const layer = document.createElement('div');
        layer.className = 'layer';
        layer.innerHTML = `<div class="cardwrap"></div><div class="poster"></div><div class="ov">${c.audio ? '<button class="snd" aria-label="Ton ein/aus"><ha-icon icon="mdi:volume-off"></ha-icon></button>' : ''}<div class="detic"></div><div class="bar"></div></div>`;
        main.appendChild(layer);
        m.poster = layer.querySelector('.poster');
        if (!cam.snapshot_hd && !cam.snapshot) m.poster.classList.add('off');
        m.layer = layer; m.detic = layer.querySelector('.detic'); m.bar = layer.querySelector('.bar');
        m.snd = layer.querySelector('.snd');
        if (m.snd) m.snd.addEventListener('click', (ev) => { ev.stopPropagation(); this._toggleAudio(); });
        layer.querySelector('.ov').addEventListener('click', (ev) => {
          if (ev.target.closest('button')) return;
          if (this._resumeNow) { this._resumeNow(); return; }
          if (m.bar.classList.contains('open')) this._barHide(m); else this._barShow(m);
        });
        m.btns = [];
        const grp = (ctl) => (ctl.url || ctl.more_info ? 0 : ctl.state_entity ? 2 : 1);
        const ctls = (cam.controls || []).map((ctl, i) => ({ ctl, i })).sort((a, b) => grp(a.ctl) - grp(b.ctl) || a.i - b.i).map((x) => x.ctl);
        let lastG = null;
        m.nSep = 0;
        ctls.forEach((ctl) => {
          if (lastG !== null && grp(ctl) !== lastG) { const sp = document.createElement('span'); sp.className = 'sep'; m.bar.appendChild(sp); m.nSep++; }
          lastG = grp(ctl);
          const b = document.createElement('button');
          b.setAttribute('aria-label', ctl.name || ctl.icon);
          b.innerHTML = '<ha-icon></ha-icon>';
          b.addEventListener('click', (ev) => { ev.stopPropagation(); this._haptic(); if (ctl.more_info) this._barHide(m); else this._barKick(m); this._run(ctl); });
          m.bar.appendChild(b);
          m.btns.push({ ctl, b });
        });
        m.prog = document.createElement('i'); m.prog.className = 'prog'; m.bar.appendChild(m.prog);
        if (cam.snapshot) main.style.backgroundImage = main.style.backgroundImage || `url(${cam.snapshot})`;
        m.ck = 'klc:' + cam.camera;
        try { m.cache = JSON.parse(localStorage.getItem(m.ck) || 'null'); } catch (e) { m.cache = null; }
        if (m.cache && m.cache.p) {
          m.poster.classList.remove('off');
          m.poster.style.backgroundImage = `url(${m.cache.p})`;
          if (!main.dataset.cached) { main.style.backgroundImage = `url(${m.cache.p})`; main.dataset.cached = '1'; }
        }
        if (m.cache && m.cache.t) m.pic.style.backgroundImage = `url(${m.cache.t})`;
        this._makeStream(m);
        return m;
      });
      this._player = root.querySelector('.player');
      this._player.querySelector('.px').addEventListener('click', (ev) => { ev.stopPropagation(); this._closeClip(); });
      main.appendChild(this._player);
      this._pcInit(this._player);
      if (c.timeline) this._tlInit(root.querySelector('.tl'));
    }

    async _makeStream(m) {
      const cam = m.cam;
      m.t0 = Date.now();
      try {
      const useW = this._c.live_source === 'webrtc_camera' && !m.forceHa;
      let wOk = false;
      if (useW) {
        if (!customElements.get('webrtc-camera')) {
          try { await Promise.race([customElements.whenDefined('webrtc-camera'), new Promise((r) => setTimeout(r, 4000))]); } catch (e) {}
        }
        wOk = !!customElements.get('webrtc-camera');
      }
      m.mode = wOk ? 'go2rtc' : 'ha';
      const cfg = { type: 'picture-entity', entity: cam.camera, camera_image: cam.camera, camera_view: 'live',
        show_name: false, show_state: false, fit_mode: 'cover', aspect_ratio: (this._c.aspect_ratio || '14:8').replace('/', ':'),
        tap_action: { action: 'none' }, hold_action: { action: 'none' }, double_tap_action: { action: 'none' } };
      if (wOk) {
        m.card = document.createElement('webrtc-camera');
        const src = cam.restream ? { url: 'rtsp://127.0.0.1:18554/' + cam.restream + '?video' } : { entity: cam.camera };
        m.card.setConfig({ ...src, media: 'video', muted: true, ui: false, background: true, intersection: 0, digital_ptz: false,
          style: ':host,ha-card,video-rtc{display:block;height:100%;background:#1c1c1e} video{width:100%!important;height:100%!important;object-fit:cover!important}' +
            ' .header,.mode,.screenshot,.fullscreen,.pictureinpicture,.ptz,.shortcuts,.controls{display:none!important}' +
            ' video::-webkit-media-controls,video::-webkit-media-controls-panel,video::-webkit-media-controls-start-playback-button,video::-webkit-media-controls-overlay-play-button{display:none!important;-webkit-appearance:none;opacity:0!important}' });
      } else {
        try {
          const helpers = await window.loadCardHelpers();
          m.card = helpers.createCardElement(cfg);
        } catch (e) {
          m.card = document.createElement('hui-picture-entity-card');
          m.card.setConfig(cfg);
        }
      }
      if (this._hass) m.card.hass = this._hass;
      const wrap = m.layer.querySelector('.cardwrap');
      wrap.innerHTML = '';
      wrap.appendChild(m.card);
      m.video = null; m.lastT = -1; m.lastAdv = Date.now(); m.startedAt = Date.now();
      const lb = (m.cache && m.cache.p) || cam.snapshot;
      if (lb) m.layer.style.background = `#1c1c1e url(${lb}) center/cover no-repeat`;
      } catch (e) { console.error('kamera-live-card stream', e); }
    }

    _grab() {
      const now = Date.now();
      if (this._audio && now - (this._lastGrab || 0) < 200) return;
      this._lastGrab = now;
      (this._cams || []).forEach((m) => {
        if (!m.card) { m.dbg = m.susp ? 'pausiert (Vollbild offen)' : 'Karte fehlt'; return this._dbgShow(); }
        if (!m.video || !m.video.isConnected || (m.kind !== 'webrtc' && !m.rtcAt && now - (m.pickAt || 0) > 500)) this._pick(m, now);
        const v = m.video;
        if (v && m.mode === 'go2rtc' && v.tagName === 'VIDEO' && (v.controls || v.hasAttribute('controls'))) { v.controls = false; v.removeAttribute('controls'); v.setAttribute('playsinline', ''); }
        this._watch(m, v);
        if (!v) { m.dbg = 'kein Video gefunden'; return this._dbgShow(); }
        const isImg = v.tagName === 'IMG';
        const vw = isImg ? v.naturalWidth : v.videoWidth, vh = isImg ? v.naturalHeight : v.videoHeight;
        if (!vw || (!isImg && v.readyState < 2)) { m.dbg = (isImg ? 'Bild' : 'Video') + ' wartet (rs=' + (isImg ? '-' : v.readyState) + ')'; return this._dbgShow(); }
        try {
          const cw = m.canvas.width, ch = m.canvas.height;
          const s = Math.max(cw / vw, ch / vh);
          const w = vw * s, h = vh * s;
          m.ctx.drawImage(v, (cw - w) / 2, (ch - h) / 2, w, h);
          if (!m.canvas.classList.contains('on') && this._dark(m) && now - (m.t0 || 0) < 10000) { m.dbg = 'Bild noch dunkel'; return this._dbgShow(); }
          m.canvas.classList.add('on');
          const waitRtc = m.hasRtc && m.kind !== 'webrtc' && now - (m.startedAt || now) < (this._c.webrtc_wait || 20) * 1000;
          if (!m.ready && !waitRtc && (isImg || (v.readyState >= 2 && v.currentTime >= (this._c.reveal_after != null ? Number(this._c.reveal_after) : 0.3)))) {
            m.ready = true; m.poster.classList.add('off');
          }
          if (m.ready && now - (m.savedAt || 0) > 30000) { m.savedAt = now; this._save(m, v, vw, vh); }
          const so = !isImg && v.srcObject;
          const at = so && so.getAudioTracks ? so.getAudioTracks().length : '?';
          m.dbg = (m.mode === 'go2rtc' ? 'go2rtc ' : '') + ({ webrtc: 'WebRTC', hls: 'HLS', img: 'MJPEG-Bild' }[m.kind] || 'Video') + (m.rtcAt ? ' (nach ' + (m.rtcAt / 1000).toFixed(1) + ' s)' : waitRtc ? ' · warte auf WebRTC' : '') + ' ' + vw + 'x' + vh + (isImg ? '' : ' · Audio-Spuren ' + at + ' · ' + (v.muted ? 'stumm' : 'Ton an') + (m.audErr ? ' (' + m.audErr + ')' : ''));
        } catch (e) { m.dbg = 'Fehler: ' + (e && e.name || e); }
        this._dbgShow();
      });
    }

    _dark(m) {
      try {
        const d = m.ctx.getImageData(0, 0, m.canvas.width, m.canvas.height).data;
        let s = 0, n = 0;
        for (let i = 0; i < d.length; i += 64) { s += d[i] + d[i + 1] + d[i + 2]; n++; }
        return s / (n * 3) < 12;
      } catch (e) { return false; }
    }

    _save(m, v, vw, vh) {
      try {
        if (this._dark(m)) return;
        const c = document.createElement('canvas');
        c.width = 640; c.height = Math.round(640 * vh / vw);
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        m.cache = { ts: Date.now(), p: c.toDataURL('image/jpeg', 0.7), t: m.canvas.toDataURL('image/jpeg', 0.75) };
        localStorage.setItem(m.ck, JSON.stringify(m.cache));
      } catch (e) { /* Speicher nicht verfuegbar */ }
    }

    _pick(m, now) {
      m.pickAt = now;
      const w = deepFind(m.card, 'ha-web-rtc-player');
      const wv = w && deepFind(w, 'video');
      m.hasRtc = !!w;
      let v = null, kind = null;
      if (wv && wv.readyState >= 2 && wv.videoWidth) { v = wv; kind = 'webrtc'; }
      if (!v) { const h = deepFind(m.card, 'ha-hls-player'); const hv = h && deepFind(h, 'video'); if (hv) { v = hv; kind = 'hls'; } }
      if (!v && wv) { v = wv; kind = 'webrtc'; }
      if (!v) { v = deepFind(m.card, 'video') || deepFind(m.card, 'img'); kind = v ? (v.tagName === 'IMG' ? 'img' : 'video') : null; }
      if ((kind === 'webrtc' || (m.mode === 'go2rtc' && kind === 'video')) && v.videoWidth && v.readyState >= 2 && !m.rtcAt) m.rtcAt = now - (m.t0 || m.startedAt || now);
      if (v !== m.video) m.lastT = -1;
      m.video = v; m.kind = kind;
    }

    _watch(m, v) {
      const now = Date.now();
      if (document.hidden) { m.lastAdv = now; return; }
      if (m.hasRtc && m.kind !== 'webrtc' && now - (m.startedAt || now) < (this._c.webrtc_wait || 20) * 1000) { m.lastAdv = now; return; }
      if (v && v.tagName === 'VIDEO') {
        if (v.currentTime !== m.lastT) { m.lastT = v.currentTime; m.lastAdv = now; return; }
        if (v.paused && v.readyState >= 2) { try { v.play(); } catch (e) {} }
      }
      const limit = (v ? (this._c.freeze_after || 8) : (this._c.missing_after || 15)) * 1000;
      if (now - Math.max(m.lastAdv || 0, m.startedAt || 0) < limit) return;
      m.restarts = (m.restarts || 0) + 1;
      m.ready = false; m.poster.classList.remove('off');
      m.canvas.classList.remove('on');
      m.kind = null; m.rtcAt = 0; m.hasRtc = false;
      if (m.mode === 'go2rtc' && m.restarts >= 2) m.forceHa = true;
      m.card = null;
      this._makeStream(m);
    }

    _toggleAudio() {
      this._audio = !this._audio;
      this._applyAudio(true);
    }

    _applyAudio(fromTap) {
      const sel = this._sel();
      (this._cams || []).forEach((m) => {
        const on = !!this._audio && m.cam.name === sel;
        if (m.snd) m.snd.querySelector('ha-icon').setAttribute('icon', this._audio ? 'mdi:volume-high' : 'mdi:volume-off');
        if (!m.card) return;
        const key = on + '|' + (m.video ? m.video.currentSrc || 'v' : '-') + '|' + (m.restarts || 0);
        if (!fromTap && m.audKey === key) return;
        m.audKey = key;
        ['ha-camera-stream', 'ha-web-rtc-player', 'ha-hls-player'].forEach((tag) => {
          const el = deepFind(m.card, tag);
          if (el && el.muted !== !on) el.muted = !on;
        });
        const v = m.video;
        if (v && v.tagName === 'VIDEO') {
          if (v.muted === on) v.muted = !on;
          if (on && fromTap) { try { v.volume = 1; const pr = v.play(); if (pr && pr.catch) pr.catch((e) => { m.audErr = e && e.name; }); } catch (e) { m.audErr = e && e.name; } }
        }
      });
    }

    _dbgShow() {
      if (!this._c.debug || !this._dbgEl) return;
      if (Date.now() - (this._lastDbg || 0) < 1000) return;
      this._lastDbg = Date.now();
      this._dbgEl.textContent = (this._cams || []).map((m) => m.cam.name + ': ' + (m.dbg || '–') + (m.restarts ? ' (Neustarts: ' + m.restarts + ')' : '')).join('  ·  ');
    }

    _select(name) {
      this._pending = name; this._pendingAt = Date.now();
      this._update();
      this._hass.callService('input_select', 'select_option', { entity_id: this._c.select_entity, option: name });
    }

    async _warm(m) {
      const box = document.createElement('div');
      box.style.cssText = 'position:absolute;left:0;top:0;width:4px;height:4px;overflow:hidden;opacity:0;pointer-events:none;';
      m.warm = box;
      m.layer.appendChild(box);
      const cfg = { type: 'picture-entity', entity: m.cam.camera, camera_image: m.cam.camera, camera_view: 'live', show_name: false, show_state: false,
        tap_action: { action: 'none' }, hold_action: { action: 'none' }, double_tap_action: { action: 'none' } };
      try {
        const helpers = await window.loadCardHelpers();
        if (m.warm !== box) return;
        const card = helpers.createCardElement(cfg);
        if (this._hass) card.hass = this._hass;
        box.appendChild(card);
        m.warmCard = card;
      } catch (e) { console.error('kamera-live-card warm', e); }
    }

    _haptic(type) {
      const t = type || this._c.haptic || 'light';
      if (t === 'none') return;
      try { window.dispatchEvent(new CustomEvent('haptic', { detail: t })); } catch (e) {}
      try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
    }

    _tint(hex, a) {
      const h = String(hex).replace('#', '');
      if (!/^[0-9a-f]{6}$/i.test(h)) return '';
      return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${a})`;
    }

    _barShow(m) {
      const n = m.btns.length || 1;
      const avail = (m.layer.clientWidth || 360) - 16 - 14 - m.nSep * 9 - (n - 1) * 2;
      const kb = Math.max(20, Math.min(34, Math.floor(avail / n)));
      m.bar.style.setProperty('--kb', kb + 'px');
      m.bar.style.setProperty('--ki', Math.max(14, Math.round(kb * 0.58)) + 'px');
      m.bar.classList.add('open');
      this._barKick(m);
    }

    _barKick(m) {
      clearTimeout(m.barT);
      const sec = Number(this._c.bar_hide_s) || 4;
      m.bar.style.setProperty('--kh', sec + 's');
      m.prog.classList.remove('run'); void m.prog.offsetWidth; m.prog.classList.add('run');
      m.barT = setTimeout(() => this._barHide(m), sec * 1000);
    }

    _barHide(m) {
      clearTimeout(m.barT);
      m.bar.classList.remove('open');
      if (m.prog) m.prog.classList.remove('run');
    }

    _suspend() {
      const hit = (this._cams || []).filter((m) => m.mode === 'go2rtc' && m.card);
      if (!hit.length) return;
      hit.forEach((m) => { try { m.card.remove(); } catch (e) {} m.card = null; m.video = null; m.susp = true; });
      const done = () => {
        window.removeEventListener('dialog-closed', onClose);
        clearTimeout(this._suspT);
        this._resume();
      };
      const onClose = (e) => { const d = e && e.detail && e.detail.dialog; if (!d || /more-info/.test(String(d))) done(); };
      window.addEventListener('dialog-closed', onClose);
      clearTimeout(this._suspT);
      this._suspT = setTimeout(done, 15 * 60000);
      this._resumeNow = done;
    }

    _resume() {
      this._resumeNow = null;
      (this._cams || []).forEach((m) => {
        if (!m.susp) return;
        m.susp = false; m.ready = false; m.kind = null; m.rtcAt = 0;
        m.poster.classList.remove('off');
        this._makeStream(m);
      });
    }

    _run(ctl) {
      if (ctl.url) { window.open(ctl.url, '_blank'); return; }
      if (ctl.more_info) {
        this._suspend();
        this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: ctl.more_info }, bubbles: true, composed: true }));
        return;
      }
      if (ctl.service) {
        const [d, s] = ctl.service.split('.');
        this._hass.callService(d, s, { entity_id: ctl.entity });
      }
    }

    _tlInit(el) {
      this._tl = { el, open: false, day: 0, cam: 'alle', all: false, clips: [], cache: {} };
      el.innerHTML = `<button class="tlt"><ha-icon icon="mdi:motion-play-outline"></ha-icon><span class="lbl">Aufnahmen</span><span class="cnt"></span></button><div class="tlb"></div>`;
      el.querySelector('.tlt').addEventListener('click', () => {
        this._tl.open = !this._tl.open;
        el.classList.toggle('open', this._tl.open);
        if (this._tl.open) this._tlLoad();
      });
      el.querySelector('.tlb').addEventListener('click', (ev) => this._tlClick(ev));
      try {
        const sv = JSON.parse(localStorage.getItem('klc:tl:' + (this._c.title || 'k')) || 'null');
        const k = this._tlDate().toDateString();
        if (sv && sv.key === k && Array.isArray(sv.clips)) { this._tl.cache[k] = { at: 0, clips: sv.clips }; this._tl.clips = sv.clips; this._tlRender(); }
      } catch (e) {}
      setTimeout(() => this._tlBg(), 1500);
    }

    _tlBg() {
      const T = this._tl; if (!T || T.open || T.day !== 0) return;
      if (!this._hass) { setTimeout(() => this._tlBg(), 1000); return; }
      const k = this._tlDate().toDateString();
      if (T.cache[k] && Date.now() - T.cache[k].at < 300000) return;
      this._tlLoad();
    }

    _tlDate() { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - this._tl.day); return d; }

    async _tlLoad(force) {
      const T = this._tl; const d = this._tlDate();
      const key = d.toDateString();
      const fresh = T.cache[key] && (Date.now() - T.cache[key].at < (T.day === 0 ? 60000 : 3600000));
      if (!fresh || force) {
        T.loading = true; this._tlRender();
        const res = this._c.clip_resolution || 'sub';
        const all = [];
        await Promise.all(this._cams.map(async (m, ci) => {
          const md = m.cam.media; if (!md) return;
          const id = `media-source://reolink/DAY|${md.entry}|${md.channel || 0}|${res}|${d.getFullYear()}|${d.getMonth() + 1}|${d.getDate()}`;
          try {
            const r = await this._hass.callWS({ type: 'media_source/browse_media', media_content_id: id });
            (r.children || []).forEach((ch) => {
              const mt = /^(\d\d):(\d\d):(\d\d)\s+(\d+):(\d\d):(\d\d)\s*(.*)$/.exec(ch.title || '');
              if (!mt) return;
              const start = (+mt[1]) * 3600 + (+mt[2]) * 60 + (+mt[3]);
              const dur = (+mt[4]) * 3600 + (+mt[5]) * 60 + (+mt[6]);
              const types = (mt[7] || '').split(/\s+/).filter(Boolean);
              all.push({ id: ch.media_content_id, ci, cam: m.cam.name, start, dur, time: mt[1] + ':' + mt[2], types });
            });
          } catch (e) { /* kein Tag oder keine Aufnahmen */ }
        }));
        const asc = all.slice().sort((a, b) => a.ci - b.ci || a.start - b.start);
        const merged = [];
        asc.forEach((c) => {
          const p = merged[merged.length - 1];
          const tierNur = (x) => x.types.includes('Animal') && !x.types.includes('Person') && !x.types.includes('Vehicle');
          const gap = p ? c.start - (p.start + p.dur) : 0;
          if (p && p.ci === c.ci && (gap <= (this._c.merge_gap_s != null ? Number(this._c.merge_gap_s) : 30) || (tierNur(p) && tierNur(c) && gap <= (this._c.merge_gap_tier_s != null ? Number(this._c.merge_gap_tier_s) : 300)))) {
            p.parts.push(c.id);
            p.dur = Math.max(p.dur, c.start + c.dur - p.start);
            c.types.forEach((t) => { if (!p.types.includes(t)) p.types.push(t); });
          } else { c.parts = [c.id]; merged.push(c); }
        });
        all.length = 0;
        merged.sort((a, b) => b.start - a.start).forEach((c) => all.push(c));
        if (this._c.ki_todo) {
          try {
            const r = await this._hass.callWS({ type: 'todo/item/list', entity_id: this._c.ki_todo });
            const ki = (r.items || []).map((i) => { const p = String(i.summary || '').split('|'); return { cam: p[0], ts: Number(p[1]) || 0, text: i.description || '' }; }).filter((k) => k.ts && k.text);
            const base = d.getTime() / 1000;
            all.forEach((c) => {
              const t0 = base + c.start;
              let best = null, bd = 1e9;
              ki.forEach((k) => {
                if (k.cam !== c.cam) return;
                const dd = k.ts - t0;
                if (dd < -20 || dd > c.dur + 60) return;
                const ad = Math.abs(dd); if (ad < bd) { bd = ad; best = k; }
              });
              if (best) { c.fa = /^(✓\s*)?Fehlalarm/i.test(best.text); c.ki = String(best.text).replace(/^✓\s*/, ''); }
            });
          } catch (e) { /* keine KI-Liste */ }
        }
        T.cache[key] = { at: Date.now(), clips: all };
        T.loading = false;
        if (T.day === 0) { try { localStorage.setItem('klc:tl:' + (this._c.title || 'k'), JSON.stringify({ key, clips: all })); } catch (e) {} }
      }
      T.clips = T.cache[key].clips;
      this._tlRender();
    }

    _tlColor(ci) { const cols = ['#64d2ff', '#30d158', '#ffd60a', '#bf5af2']; return (this._cams[ci].cam.color) || cols[ci % cols.length]; }

    _tlVisible() {
      const T = this._tl;
      return T.clips.filter((c) => !c.fa && (T.cam === 'alle' || c.cam === T.cam) &&
        c.types.some((t) => t === 'Person' || t === 'Animal'));
    }

    _tlRender() {
      const T = this._tl; if (!T) return;
      const vis = this._tlVisible();
      const det = T.clips.filter((c) => !c.fa && c.types.some((t) => t === 'Person' || t === 'Animal'));
      const nP = det.filter((c) => c.types.includes('Person')).length;
      const nT = det.filter((c) => c.types.includes('Animal')).length;
      const ic = (i, col, n) => `<ha-icon icon="${i}" class="${n ? '' : 'z'}" style="color:${col}"></ha-icon><b class="${n ? '' : 'z'}">${n}</b>`;
      T.el.querySelector('.cnt').innerHTML = T.clips.length || T.cache[this._tlDate().toDateString()] ?
        this._cams.map((m, ci) => {
          const own = det.filter((c) => c.ci === ci);
          return `<span class="cap">${m.cam.name} ${ic('phu:camera-person', '#ff453a', own.filter((c) => c.types.includes('Person')).length)}${ic('phu:camera-pet', '#ffd60a', own.filter((c) => c.types.includes('Animal')).length)}</span>`;
        }).join('') : '';
      const b = T.el.querySelector('.tlb');
      if (!T.open) return;
      const d = this._tlDate();
      const dayLbl = T.day === 0 ? 'Heute' : T.day === 1 ? 'Gestern' : d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
      const tyIcon = { Person: ['phu:camera-person', '#ff6961'], Animal: ['phu:camera-pet', '#ffd60a'], Vehicle: ['mdi:car', '#64d2ff'], Motion: ['mdi:motion-sensor', 'rgba(255,255,255,.55)'] };
      const camChips = ['alle'].concat(this._cams.map((m) => m.cam.name))
        .map((n) => `<button class="chip${T.cam === n ? ' on' : ''}" data-cam="${n}">${n === 'alle' ? 'Alle' : n}</button>`).join('');
      const ticks = [0, 6, 12, 18, 24].map((h) => `<div class="tick${h === 0 ? ' first' : h === 24 ? ' last' : ''}" style="left:${h / 24 * 100}%"><span>${String(h).padStart(2, '0')}:00</span></div>`).join('');
      const nd = new Date();
      const nowPos = T.day === 0 ? (nd.getHours() * 3600 + nd.getMinutes() * 60) / 864 : null;
      const nowLbl = String(nd.getHours()).padStart(2, '0') + ':' + String(nd.getMinutes()).padStart(2, '0');
      const lanes = this._cams.map((m, ci) => ci).filter((ci) => T.cam === 'alle' || this._cams[ci].cam.name === T.cam);
      const laneH = 18;
      const tcol = (c) => (c.types.includes('Person') ? '#ff6961' : '#ffd60a');
      const dots = vis.map((c) => `<button class="dot" data-id="${encodeURIComponent(c.id)}" aria-label="${c.cam} ${c.time}" style="left:${c.start / 864}%;top:${lanes.indexOf(c.ci) * laneH + 3}px;--c:${tcol(c)}"></button>`).join('');
      const laneLines = lanes.slice(1).map((ci, i) => `<div class="lane" style="top:${(i + 1) * laneH + 2}px"></div>`).join('');
      const laneLbl = lanes.map((ci) => `<span><i style="background:${this._tlColor(ci)}"></i>${this._cams[ci].cam.name}</span>`).join('');
      const fmt = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
      const rows = vis.map((c) => `<button class="row${T.playing === c.id ? ' play' : ''}" data-id="${encodeURIComponent(c.id)}"><span>${c.time}</span><span class="cam"><i style="background:${this._tlColor(c.ci)}"></i>${c.cam}</span><span class="ty"><span class="ics">${['Person', 'Animal'].filter((t) => c.types.includes(t)).map((t) => `<ha-icon icon="${tyIcon[t][0]}" style="color:${tyIcon[t][1]}"></ha-icon>`).join('')}</span>${c.ki ? `<span class="ki">${String(c.ki).replace(/[<>&]/g, '')}</span>` : ''}</span><span class="du">${fmt(c.dur)}</span></button>`).join('');
      b.innerHTML = `<div class="tlnav"><button class="chip nav" data-nav="1" aria-label="Tag zurueck">‹</button><span class="day">${dayLbl}</span><button class="chip nav" data-nav="-1" aria-label="Tag vor"${T.day === 0 ? ' disabled style="opacity:.3"' : ''}>›</button>${camChips}</div>
        <div class="tlg"><div class="lanes">${laneLbl}</div><div class="bar24" style="height:${lanes.length * laneH + 4}px">${ticks}${laneLines}${nowPos !== null ? `<div class="now${nowPos > 93 ? ' r' : nowPos < 7 ? ' l' : ''}" style="left:${nowPos}%"><span>jetzt</span><ha-icon icon="mdi:chevron-down"></ha-icon></div>` : ''}${dots}</div></div>
        <div class="list">${T.loading ? '<div class="empty">Lade Aufnahmen …</div>' : (rows || '<div class="empty">Keine Aufnahmen an diesem Tag.</div>')}</div>`;
    }

    _tlClick(ev) {
      const T = this._tl;
      const t = ev.target.closest('button'); if (!t) return;
      if (t.dataset.nav) { const n = T.day + Number(t.dataset.nav); if (n < 0) return; T.day = n; this._tlLoad(); return; }
      if (t.dataset.cam) { T.cam = t.dataset.cam; this._tlRender(); return; }
      if (t.dataset.all) { T.all = !T.all; this._tlRender(); return; }
      if (t.dataset.id) {
        const id = decodeURIComponent(t.dataset.id);
        const clip = T.clips.find((c) => c.id === id);
        if (clip) this._playClip(clip);
      }
    }

    async _playClip(clip) {
      const P = this._player; const v = P.querySelector('video');
      if (this._pcReset) this._pcReset();
      const tyDe = { Person: 'Person', Animal: 'Tier', Vehicle: 'Fahrzeug', Motion: 'Bewegung' };
      P.querySelector('.pt').textContent = clip.cam + ' · ' + clip.time + ' · ' + (clip.ki || clip.types.filter((t) => t !== 'Motion').map((t) => tyDe[t] || t).join(', ') || 'Bewegung');
      P.querySelector('.pl').textContent = 'Clip wird von der Kamera geladen …';
      P.classList.add('on');
      this._tl.playing = clip.id; this._tlRender();
      const q = this._pq = { ids: clip.parts && clip.parts.length ? clip.parts : [clip.id], i: 0 };
      v.onended = () => { if (this._pq === q && q.i < q.ids.length - 1) { q.i++; this._playPart(q); } };
      this._playPart(q);
    }

    async _playPart(q) {
      const P = this._player; const v = P.querySelector('video');
      try {
        const r = await this._hass.callWS({ type: 'media_source/resolve_media', media_content_id: q.ids[q.i], expires: 3600 });
        if (this._pq !== q) return;
        const url = this._hass.hassUrl ? this._hass.hassUrl(r.url) : r.url;
        v.src = url;
        v.onplaying = () => { P.querySelector('.pl').textContent = ''; };
        v.onerror = () => { P.querySelector('.pl').textContent = 'Clip konnte nicht geladen werden.'; };
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      } catch (e) {
        P.querySelector('.pl').textContent = 'Clip nicht verfuegbar: ' + (e && e.message || e);
      }
    }

    _pcInit(P) {
      const v = P.querySelector('video'), pp = P.querySelector('.pp ha-icon'), sk = P.querySelector('.sk');
      const t1 = P.querySelector('.t1'), t2 = P.querySelector('.t2');
      const f = (x) => { x = Math.max(0, Math.floor(x || 0)); return Math.floor(x / 60) + ':' + String(x % 60).padStart(2, '0'); };
      let drag = false;
      const tog = () => { if (v.paused || v.ended) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); } else v.pause(); };
      P.querySelector('.pp').addEventListener('click', (ev) => { ev.stopPropagation(); tog(); });
      v.addEventListener('click', tog);
      P.querySelector('.fs').addEventListener('click', (ev) => {
        ev.stopPropagation();
        try { if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); else if (v.requestFullscreen) v.requestFullscreen(); } catch (e) {}
      });
      v.addEventListener('play', () => pp.setAttribute('icon', 'mdi:pause'));
      v.addEventListener('pause', () => pp.setAttribute('icon', 'mdi:play'));
      v.addEventListener('ended', () => pp.setAttribute('icon', 'mdi:replay'));
      v.addEventListener('loadedmetadata', () => { t2.textContent = f(v.duration); });
      v.addEventListener('timeupdate', () => {
        t1.textContent = f(v.currentTime);
        if (!drag && v.duration) sk.value = String(Math.round(v.currentTime / v.duration * 1000));
      });
      sk.addEventListener('input', () => { drag = true; if (v.duration) { v.currentTime = sk.value / 1000 * v.duration; t1.textContent = f(v.currentTime); } });
      sk.addEventListener('change', () => { drag = false; });
      sk.addEventListener('click', (ev) => ev.stopPropagation());
      this._pcReset = () => { pp.setAttribute('icon', 'mdi:play'); sk.value = '0'; t1.textContent = '0:00'; t2.textContent = '0:00'; };
    }

    _closeClip() {
      const P = this._player; const v = P.querySelector('video');
      try { v.pause(); } catch (e) {}
      v.removeAttribute('src'); try { v.load(); } catch (e) {}
      this._pq = null; v.onended = null;
      P.classList.remove('on');
      if (this._tl) { this._tl.playing = null; this._tlRender(); }
    }

    _chips(m, act) {
      if (!m.kchip) { m.kchip = document.createElement('div'); m.kchip.className = 'kc'; m.detic.appendChild(m.kchip); m.kseg = {}; }
      const C = m.kchip, S = m.kseg;
      const keys = act.map((d) => d.entity);
      const order = (m.cam.detections || []).map((x) => x.entity);
      const raf2 = (f) => requestAnimationFrame(() => requestAnimationFrame(f));
      (m.cam.detections || []).forEach((d) => {
        if (!keys.includes(d.entity) || S[d.entity]) return;
        const el = document.createElement('span');
        el.className = 'sg';
        el.innerHTML = `<ha-icon icon="${d.icon}"></ha-icon><span>${String(d.label || 'Bewegung').replace(/[<>&]/g, '')} erkannt</span>`;
        const next = order.slice(order.indexOf(d.entity) + 1).map((e) => S[e]).find(Boolean);
        C.insertBefore(el, next ? next.el : null);
        const k = { el, t: [] };
        S[d.entity] = k;
        const first = !m.kOn; m.kOn = true;
        if (first) { clearTimeout(m.kHide); C.classList.remove('red'); raf2(() => C.classList.add('show')); }
        raf2(() => el.classList.add('in'));
        const now = Date.now();
        const at = Math.max(now + (first ? 300 : 50), m.kBusy || 0);
        m.kBusy = at + 1500;
        k.t.push(setTimeout(() => {
          C.classList.add('red');
          Object.values(S).forEach((o) => { if (o !== k) o.el.classList.remove('open'); });
          el.classList.add('open');
        }, at - now));
        k.t.push(setTimeout(() => el.classList.remove('open'), at - now + (Number(this._c.chip_text_s) || 4) * 1000));
      });
      const gone = Object.keys(S).filter((e) => !keys.includes(e));
      if (!gone.length) return;
      const last = gone.length === Object.keys(S).length;
      gone.forEach((e) => {
        const k = S[e]; delete S[e];
        k.t.forEach(clearTimeout);
        if (!last) k.el.classList.remove('open', 'in');
        setTimeout(() => k.el.remove(), last ? 400 : 550);
      });
      if (last) {
        m.kOn = false; m.kBusy = 0;
        C.classList.remove('show');
        m.kHide = setTimeout(() => { if (!m.kOn) C.classList.remove('red'); }, 400);
      }
    }

    _rel(t) {
      const m = Math.round((Date.now() - t) / 60000);
      if (m < 1) return 'gerade';
      if (m < 60) return 'vor ' + m + ' Min';
      const h = Math.round(m / 60);
      if (h < 24) return 'vor ' + h + ' Std';
      const d = Math.round(h / 24);
      return 'vor ' + d + (d === 1 ? ' Tag' : ' Tagen');
    }

    _update() {
      if (!this._hass || !this._cams) return;
      const H = this._hass;
      const sel = this._sel();
      const fs = this._c.compact ? 10 : 11;
      const ic = (i, col, s) => `<ha-icon icon="${i}" style="--mdc-icon-size:${s}px;color:${col}"></ha-icon>`;
      const lt = (H.states[this._c.snapshot_version_entity] || { attributes: {} }).attributes.last_triggered;
      const ver = lt ? new Date(lt).getTime() : 0;

      this._applyAudio(false);
      this._cams.forEach((m) => {
        const cam = m.cam;
        const isSel = cam.name === sel;
        m.layer.classList.toggle('sel', isSel);
        if (!isSel && m.bar.classList.contains('open')) this._barHide(m);
        if (this._c.live_source === 'webrtc_camera' && this._c.warm_fullscreen !== false) {
          const keep = isSel || Date.now() - (this._bornAt || 0) < 30000;
          if (keep && !m.warm) this._warm(m);
          if (!keep && m.warm) { m.warm.remove(); m.warm = null; m.warmCard = null; }
        }
        m.tile.querySelector('.n').style.fontWeight = isSel ? '600' : '400';
        const cTs = (m.cache && m.cache.ts) || 0;
        if (cam.snapshot && m.thumbVer !== ver && !m.canvas.classList.contains('on') && (!cTs || ver > cTs)) {
          m.thumbVer = ver;
          const u = `${cam.snapshot}?v=${ver}`;
          if (!cTs) m.pic.style.backgroundImage = `url(${u})`;
          else { const im = new Image(); im.onload = () => { if (!m.canvas.classList.contains('on')) m.pic.style.backgroundImage = `url(${u})`; }; im.src = u; }
        }
        if (!m.ready && m.posterVer !== ver && (cam.snapshot_hd || cam.snapshot) && (!cTs || ver > cTs)) {
          m.posterVer = ver;
          const u = `${cam.snapshot_hd || cam.snapshot}?v=${ver}`;
          if (!cTs) m.poster.style.backgroundImage = `url(${u})`;
          else { const im = new Image(); im.onload = () => { if (!m.ready) m.poster.style.backgroundImage = `url(${u})`; }; im.src = u; }
        }

        const dets = cam.detections || [];
        const hold = (d) => this._on(d.entity) || (Date.now() - this._ts(d.ts)) < 60000;
        const act = dets.filter(hold);
        m.pic.classList.toggle('det', act.length > 0);

        const st = m.tile.querySelector('.st');
        if (act.length) {
          st.innerHTML = act.map((d) => ic(d.icon, '#ff453a', fs + 2)).join('') +
            (act.length === 1 ? `<span style="color:#ff6961">${act[0].label}</span>` : '');
        } else {
          const s = cam.status || {};
          const off = !H.states[cam.camera] || H.states[cam.camera].state === 'unavailable';
          st.innerHTML = ic('mdi:shield-check-outline', '#30d158', fs) +
            '<span style="color:rgba(255,255,255,.7);margin-left:-3px">ruhig</span>' +
            (this._on(s.rec) ? ic('mdi:cctv', '#ff453a', fs + 1) : '') +
            (this._on(s.patrol) ? ic('mdi:map-marker-path', '#ff453a', fs + 1) : '') +
            (this._on(s.light) ? ic('mdi:track-light', '#ffd60a', fs + 1) : '') +
            (off ? ic('mdi:wifi-off', '#8e8e93', fs + 1) : '');
        }

        const last = dets.map((d) => [d, this._ts(d.ts)]).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1])[0];
        m.tile.querySelector('.l').innerHTML = last ? `<ha-icon icon="${last[0].icon}"></ha-icon>${this._rel(last[1])}` : '';

        this._chips(m, act);

        m.btns.forEach(({ ctl, b }) => {
          const on = ctl.state_entity ? this._on(ctl.state_entity) : false;
          const icon = on || !ctl.icon_off ? ctl.icon : ctl.icon_off;
          const el = b.querySelector('ha-icon');
          if (el.getAttribute('icon') !== icon) el.setAttribute('icon', icon);
          el.style.color = on && ctl.color_on ? ctl.color_on : '#fff';
          const bg = on && ctl.color_on ? this._tint(ctl.color_on, 0.24) : '';
          if (b.style.backgroundColor !== bg) b.style.backgroundColor = bg;
        });
      });
    }
  }

  customElements.define(TAG, KameraLiveCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Kamera Live Card', description: 'Hof/Garten mit Live-Kacheln aus den laufenden Streams' });
})();
