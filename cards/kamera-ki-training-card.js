// kamera-ki-training-card v1.6 (25.11.2026: reine Tier-Clips mit bis zu 5 Min Luecke bilden eine Gruppe (Katze sitzt dauerhaft = eine Zeile); v1.5 (23.11.2026: SD-Clips ohne KI-Text der letzten 2 Tage als Zeile Keine KI-Beschreibung (korrigierbar/ausblendbar); v1.4: Button KI-Beschreibung nachholen beim neuesten Clip je Kamera; 18.11.2026, nur Meldungen mit SD-Aufnahme, Vorschaubilder, Fehlalarme) – Kamera-KI Training fuer wetter-doku (ELMO-Admin-Portal).
// Zeigt die KI-Texte aus todo.kamera_ki, Korrektur per Stift (script.kamera_ki_korrektur), feste Hinweise
// (todo.kamera_ki_hinweise, script.kamera_ki_hinweis). Sichtbar/bedienbar nur fuer config.user (Martin).
// Clip-Wiedergabe ueber die Reolink-Aufnahmen (media_source, cameras[].media {entry, channel}).
(() => {
  const TAG = 'kamera-ki-training-card';
  if (customElements.get(TAG)) return;

  const QUICK = ['Person geht Treppe hinunter', 'Person geht Treppe hinauf', 'Person steigt ins Auto ein', 'Person steigt aus dem Auto aus', 'Person steht auf Treppe'];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const FA_RE = /^(✓\s*)?Fehlalarm/i;
  const GRUENDE = [['Regen', '🌧'], ['Schnee', '❄️'], ['Nebel', '🌫'], ['Insekt / Spinne', '🕷'], ['Licht / Schatten', '💡'], ['Sonstiges', '…']];

  const CSS = `
    :host { display:block; }
    ha-card { padding:16px; color:var(--primary-text-color,#fff); }
    .hd { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
    .h1 { font-size:18px; font-weight:600; }
    .lock { display:inline-flex; align-items:center; gap:4px; font-size:11px; color:rgba(255,255,255,.6); padding:3px 9px; border-radius:999px; background:rgba(255,255,255,.08); white-space:nowrap; }
    .lock ha-icon { --mdc-icon-size:13px; }
    .kpi { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; margin-bottom:10px; }
    .kpi div { padding:7px 8px; border-radius:14px; background:rgba(255,255,255,.06); display:flex; flex-direction:column; min-width:0; }
    .kpi b { font-size:18px; font-weight:600; }
    .kpi span { font-size:10px; color:rgba(255,255,255,.55); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sub { font-size:11px; color:rgba(255,255,255,.6); line-height:1.4; margin:4px 0 8px; display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .tg { all:unset; cursor:pointer; padding:4px 10px; border-radius:999px; font-size:11px; color:rgba(255,255,255,.85); background:rgba(255,255,255,.08); white-space:nowrap; }
    .list { display:flex; flex-direction:column; gap:6px; }
    .row { display:grid; grid-template-columns:52px minmax(0,1fr) auto; column-gap:10px; align-items:start; padding:8px; box-sizing:border-box; width:100%; border-radius:14px; background:rgba(255,255,255,.04); }
    .th { all:unset; cursor:pointer; flex:0 0 52px; height:38px; border-radius:8px; background:linear-gradient(135deg,#3a3f44,#1d2023) center/cover no-repeat; display:flex; align-items:center; justify-content:center; -webkit-tap-highlight-color:transparent; }
    .th span { width:24px; height:24px; border-radius:50%; background:rgba(0,0,0,.45); display:inline-flex; align-items:center; justify-content:center; }
    .th ha-icon { --mdc-icon-size:15px; color:#fff; }
    .mid { min-width:0; display:flex; flex-direction:column; gap:3px; }
    .meta { font-size:11px; color:rgba(255,255,255,.55); }
    .txt { font-size:13px; line-height:1.3; overflow-wrap:anywhere; }
    .old { font-size:12px; color:rgba(255,255,255,.4); text-decoration:line-through; overflow-wrap:anywhere; }
    .new { display:flex; align-items:flex-start; gap:5px; font-size:13px; line-height:1.3; overflow-wrap:anywhere; }
    .new ha-icon { --mdc-icon-size:15px; color:#ffd60a; flex:0 0 auto; margin-top:1px; }
    .pen { all:unset; cursor:pointer; box-sizing:border-box; flex:none; width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:#ffd60a; background:rgba(255,214,10,.16); -webkit-tap-highlight-color:transparent; }
    .pen ha-icon { --mdc-icon-size:15px; display:flex; align-items:center; justify-content:center; width:var(--mdc-icon-size); height:var(--mdc-icon-size); line-height:0; margin:0; }
    .edit { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
    .edit input, .hadd input { box-sizing:border-box; width:100%; height:34px; padding:0 12px; border-radius:999px; border:1px solid rgba(255,255,255,.2); background:rgba(0,0,0,.25); color:#fff; font:inherit; font-size:13px; outline:none; }
    .qa { display:flex; flex-wrap:wrap; gap:5px; }
    .q { all:unset; cursor:pointer; padding:4px 10px; border-radius:999px; background:rgba(255,255,255,.08); font-size:11px; color:rgba(255,255,255,.85); }
    .act { display:flex; justify-content:flex-end; gap:6px; }
    .cx, .sv { all:unset; cursor:pointer; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:600; }
    .cx { color:rgba(255,255,255,.75); background:rgba(255,255,255,.08); }
    .sv { color:#fff; background:#f56300; }
    .sv[disabled] { opacity:.5; pointer-events:none; }
    .hl { display:flex; flex-direction:column; gap:6px; }
    .hint { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; column-gap:8px; padding:6px 6px 6px 12px; box-sizing:border-box; width:100%; border-radius:14px; background:rgba(255,255,255,.05); font-size:12px; }
    .ht { all:unset; cursor:pointer; min-width:0; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.35; -webkit-tap-highlight-color:transparent; }
    .hint.open .ht { white-space:normal; overflow-wrap:anywhere; }
    .hint.open { align-items:start; }
    .htg { all:unset; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; box-sizing:border-box; margin-top:14px; padding:8px 10px 8px 12px; border-radius:14px; background:rgba(255,255,255,.05); font-size:12px; color:rgba(255,255,255,.8); -webkit-tap-highlight-color:transparent; }
    .htg b { font-weight:600; color:#fff; }
    .htg ha-icon { --mdc-icon-size:18px; color:rgba(255,255,255,.6); transition:transform .2s; }
    .htg.open ha-icon { transform:rotate(180deg); }
    .hbox { margin-top:8px; }
    .hx { all:unset; cursor:pointer; box-sizing:border-box; flex:none; width:26px; height:26px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:rgba(255,255,255,.08); color:rgba(255,255,255,.7); }
    .hx ha-icon { --mdc-icon-size:14px; display:flex; align-items:center; justify-content:center; width:var(--mdc-icon-size); height:var(--mdc-icon-size); line-height:0; margin:0; }
    .hadd { display:flex; gap:6px; margin-top:6px; }
    .add { all:unset; cursor:pointer; flex:0 0 auto; padding:0 14px; height:34px; display:inline-flex; align-items:center; border-radius:999px; font-size:12px; font-weight:600; color:#fff; background:#f56300; }
    .foot { font-size:10px; color:rgba(255,255,255,.45); margin-top:10px; line-height:1.4; }
    .warn { display:flex; gap:6px; align-items:center; font-size:11px; color:#ffd60a; background:rgba(255,214,10,.1); border-radius:14px; padding:7px 10px; margin-bottom:10px; }
    .warn ha-icon { --mdc-icon-size:15px; flex:none; }
    .btns { display:flex; flex-direction:column; gap:6px; }
    .x { all:unset; cursor:pointer; box-sizing:border-box; flex:none; width:28px; height:28px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; color:#ff453a; background:rgba(255,69,58,.16); -webkit-tap-highlight-color:transparent; }
    .x ha-icon { --mdc-icon-size:15px; display:flex; align-items:center; justify-content:center; width:var(--mdc-icon-size); height:var(--mdc-icon-size); line-height:0; margin:0; }
    .x.on { color:#fff; background:#ff453a; }
    .nh { all:unset; cursor:pointer; box-sizing:border-box; display:inline-flex; align-items:center; gap:3px; margin-left:6px; padding:1px 8px 1px 6px; border-radius:999px; font-size:10.5px; font-weight:600; color:#0a84ff; background:rgba(10,132,255,.16); vertical-align:middle; -webkit-tap-highlight-color:transparent; }
    .nh ha-icon { --mdc-icon-size:12px; display:flex; width:12px; height:12px; line-height:0; }
    .nh.run ha-icon { animation:kktspin 1s linear infinite; }
    @keyframes kktspin { to { transform:rotate(360deg); } }
    .pick { display:flex; flex-direction:column; gap:6px; margin-top:4px; }
    .q.sel { background:rgba(255,69,58,.22); color:#fff; box-shadow:inset 0 0 0 1px rgba(255,69,58,.6); }
    .sv.fa { background:#ff453a; }
    .sv.fa[disabled] { opacity:.5; pointer-events:none; }
    .row.dim { opacity:.6; }
    .tag { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:999px; background:rgba(255,69,58,.18); color:#ff9f97; font-size:11px; }
    .auto { font-size:10px; color:rgba(255,255,255,.45); margin-left:6px; }
    .toast { display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 8px 7px 12px; border-radius:999px; background:rgba(0,0,0,.35); font-size:12px; margin-bottom:8px; }
    .tu { all:unset; cursor:pointer; color:#64d2ff; font-weight:600; padding:2px 6px; }
    .tgs { display:inline-flex; gap:5px; flex:none; }
    .tg.on { background:rgba(255,69,58,.22); color:#fff; }
    .txt.muted { color:rgba(255,255,255,.45); font-style:italic; }
    .empty { font-size:12px; color:rgba(255,255,255,.55); padding:8px; }
    .pl { display:none; margin:0 0 10px; }
    .pl.on { display:block; }
    .pv { position:relative; width:100%; border-radius:14px; overflow:hidden; background:#000; aspect-ratio:16/9; }
    .pv video { display:block; width:100%; height:100%; object-fit:contain; background:#000; }
    .pt { position:absolute; top:0; left:0; right:0; padding:8px 44px 8px 10px; font-size:12px; color:#fff; background:linear-gradient(rgba(0,0,0,.6),transparent); pointer-events:none; }
    .px { all:unset; cursor:pointer; position:absolute; top:6px; right:6px; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.5); }
    .px ha-icon { --mdc-icon-size:18px; color:#fff; }
    .pm { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:13px; color:rgba(255,255,255,.8); pointer-events:none; }
  `;

  class KameraKiTrainingCard extends HTMLElement {
    setConfig(c) {
      this._c = Object.assign({
        todo: 'todo.kamera_ki', korrekturen: 'todo.kamera_ki_korrekturen', hinweise: 'todo.kamera_ki_hinweise',
        script_korrektur: 'kamera_ki_korrektur', script_hinweis: 'kamera_ki_hinweis', user: '', cameras: [],
      }, c || {});
      let hzu = true; try { hzu = localStorage.getItem('kkt:hinweise') !== 'auf'; } catch (e) {}
      this._s = { items: [], korr: [], hinw: [], all: false, edit: null, val: '', busy: false, loaded: false, hzu, hopen: {} };
    }
    getCardSize() { return 8; }
    getGridOptions() { return { columns: 'full', rows: 'auto' }; }

    set hass(h) {
      this._hass = h;
      const ok = !this._c.user || (h.user && h.user.id === this._c.user);
      if (!ok) { this.style.display = 'none'; return; }
      this.style.display = '';
      if (!this._root) { this._build(); this._render(); }
      if (!this._s.loaded) { this._s.loaded = true; this._load(); }
      const v = h.states[this._c.todo] && h.states[this._c.todo].last_changed;
      const w = h.states[this._c.hinweise] && h.states[this._c.hinweise].last_changed;
      const x = h.states[this._c.korrekturen] && h.states[this._c.korrekturen].last_changed;
      const rk = (this._c.cameras || []).map((c) => c.record && h.states[c.record] ? h.states[c.record].state : '').join(',');
      const key = v + '|' + w + '|' + x + '|' + rk;
      if (this._lastKey && this._lastKey !== key) this._load();
      this._lastKey = key;
    }

    _build() {
      this._root = this.attachShadow({ mode: 'open' });
      this._root.innerHTML = `<style>${CSS}</style><ha-card><div class="pl"><div class="pv"><video controls playsinline></video><div class="pm"></div><div class="pt"></div><button class="px" aria-label="Schliessen"><ha-icon icon="mdi:close"></ha-icon></button></div></div><div class="body"></div></ha-card>`;
      this._body = this._root.querySelector('.body');
      this._pl = this._root.querySelector('.pl');
      this._root.querySelector('.px').addEventListener('click', () => this._closeClip());
      this._body.addEventListener('click', (e) => this._click(e));
      this._body.addEventListener('input', (e) => { if (e.target.matches('.edit input')) { this._s.val = e.target.value; this._syncSave(); } });
      this._body.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        if (e.target.matches('.edit input')) this._save();
        if (e.target.matches('.hadd input')) this._addHint();
      });
    }

    async _list(entity) {
      try { const r = await this._hass.callWS({ type: 'todo/item/list', entity_id: entity }); return (r.items || []).filter((i) => i.status !== 'completed'); }
      catch (e) { return []; }
    }

    _day(cam, d) {
      const key = cam.name + '|' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      const today = new Date().toDateString() === d.toDateString();
      this._dc = this._dc || {};
      const c = this._dc[key];
      if (c && c.p) return c.p;
      if (c && c.ok && (!today || Date.now() - c.at < 60000)) return Promise.resolve(c.list);
      const id = `media-source://reolink/DAY|${cam.media.entry}|${cam.media.channel || 0}|${this._c.clip_resolution || 'sub'}|${d.getFullYear()}|${d.getMonth() + 1}|${d.getDate()}`;
      const prev = c && c.list;
      const p = (async () => {
        try {
          const r = await Promise.race([
            this._hass.callWS({ type: 'media_source/browse_media', media_content_id: id }),
            new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000)),
          ]);
          const list = [];
          (r.children || []).forEach((ch) => {
            const m = /^(\d\d):(\d\d):(\d\d)\s+(\d+):(\d\d):(\d\d)/.exec(ch.title || ''); if (!m) return;
            list.push({ st: (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]), du: (+m[4]) * 3600 + (+m[5]) * 60 + (+m[6]), id: ch.media_content_id, ty: ch.title || '' });
          });
          this._dc[key] = { at: Date.now(), list, ok: true };
          return list;
        } catch (e) {
          this._dc[key] = { at: Date.now(), list: prev || [], ok: false };
          return prev || [];
        }
      })();
      this._dc[key] = { at: Date.now(), list: prev, p };
      return p;
    }

    async _ohneKi(matched) {
      const out = [];
      const jetzt = Date.now() / 1000;
      for (const cam of (this._c.cameras || [])) {
        if (!cam.media) continue;
        for (let k = 0; k < 2; k++) {
          const d = new Date(); d.setDate(d.getDate() - k); d.setHours(12, 0, 0, 0);
          const d0 = new Date(d); d0.setHours(0, 0, 0, 0);
          const base = d0.getTime() / 1000;
          const list = (await this._day(cam, d)).slice().sort((a, b) => a.st - b.st);
          const groups = [];
          list.forEach((c) => {
            const g = groups[groups.length - 1];
            const tierNur = (t) => /Animal/.test(t) && !/Person|Vehicle/.test(t);
            if (g && (c.st <= g.end + 30 || (tierNur(g.ty) && tierNur(c.ty || '') && c.st <= g.end + 300))) { g.end = Math.max(g.end, c.st + c.du); g.ids.push(c.id); g.ty += ' ' + c.ty; }
            else groups.push({ st: c.st, end: c.st + c.du, ids: [c.id], ty: c.ty || '' });
          });
          groups.forEach((g) => {
            if (!/Person|Animal/.test(g.ty)) return;
            const ts = Math.round(base + g.st);
            if (jetzt - ts > 2 * 86400) return;
            const hit = matched.some((it) => it.cam === cam.name && (g.ids.includes(it.clip) || (it.ts >= ts - 20 && it.ts <= base + g.end + 60)));
            if (!hit) out.push({ summary: cam.name + '|' + ts, cam: cam.name, ts, text: '', clip: g.ids[0], synth: true });
          });
        }
      }
      return out;
    }

    async _clipFor(it) {
      const cam = (this._c.cameras || []).find((c) => c.name === it.cam);
      if (!cam || !cam.media) return null;
      const d = new Date(it.ts * 1000);
      const day = new Date(d); day.setHours(0, 0, 0, 0);
      const t = it.ts - day.getTime() / 1000;
      let best = null, bd = 1e9;
      (await this._day(cam, d)).forEach((c) => {
        const dd = t - c.st; if (dd < -20 || dd > c.du + 60) return;
        if (Math.abs(dd) < bd) { bd = Math.abs(dd); best = c.id; }
      });
      return best;
    }

    async _load() {
      if (this._loading) { this._again = true; return; }
      this._loading = true;
      try { await this._load2(); } catch (e) { console.error(TAG, e); }
      this._loading = false;
      if (this._again) { this._again = false; this._load(); }
    }

    async _load2() {
      const [items, korr, hinw] = await Promise.all([this._list(this._c.todo), this._list(this._c.korrekturen), this._list(this._c.hinweise)]);
      const all = items.map((i) => {
        const p = String(i.summary || '').split('|');
        return { summary: i.summary, cam: p[0], ts: Number(p[1]) || 0, text: i.description || '' };
      }).filter((i) => i.ts).sort((a, b) => b.ts - a.ts);
      const clips = await Promise.all(all.map((it) => this._clipFor(it)));
      all.forEach((it, n) => { it.clip = clips[n]; });
      const matched = all.filter((it) => it.clip);
      let synth = [];
      try { synth = await this._ohneKi(matched); } catch (e) { synth = []; }
      this._s.items = matched.concat(synth).sort((a, b) => b.ts - a.ts);
      this._s.ohne = all.length - this._s.items.length;
      this._s.korr = korr; this._s.hinw = hinw;
      this._s.ready = true;
      if (!this._s.edit) this._render();
    }

    _quick() {
      const seen = new Set(), out = [];
      const add = (t) => { t = String(t || '').trim(); const k = t.toLowerCase(); if (t.length < 2 || seen.has(k) || /^fehlalarm/i.test(t)) return; seen.add(k); out.push(t); };
      (this._s.korr || []).slice().reverse().forEach((k) => add(k.summary));
      QUICK.forEach(add);
      return out.slice(0, 10);
    }

    _origFor(it) {
      const k = this._s.korr.find((x) => String(x.description || '').indexOf('key=' + it.summary) >= 0);
      return k ? String(k.description).split(' · ')[0].replace(/^KI: /, '') : '';
    }

    _fmt(ts) {
      const d = new Date(ts * 1000), n = new Date();
      const t = pad(d.getHours()) + ':' + pad(d.getMinutes());
      if (d.toDateString() === n.toDateString()) return t;
      const y = new Date(n); y.setDate(n.getDate() - 1);
      if (d.toDateString() === y.toDateString()) return 'gestern ' + t;
      return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '. ' + t;
    }

    _render() {
      const S = this._s;
      const isFa = (i) => FA_RE.test(i.text);
      const real = S.items.filter((i) => !i.synth);
      const total = real.length;
      const fehl = real.filter(isFa).length;
      const korrigiert = real.filter((i) => i.text.startsWith('✓')).length;
      const korrN = real.filter((i) => i.text.startsWith('✓') && !isFa(i)).length;
      const quote = total ? Math.round((total - korrigiert) / total * 100) + ' %' : '–';
      const since = Date.now() / 1000 - 86400;
      const aus = (this._c.cameras || []).filter((c) => c.record && this._hass.states[c.record] && this._hass.states[c.record].state !== 'on').map((c) => c.name);
      const zeit = S.all ? S.items : S.items.filter((i) => i.ts >= since);
      const faZeit = zeit.filter(isFa).length;
      const shown = zeit.filter((i) => S.showFa ? isFa(i) : !isFa(i));
      const xIc = '<ha-icon icon="mdi:close"></ha-icon>';
      const newest = {};
      real.forEach((i) => { if (!newest[i.cam] || i.ts > newest[i.cam].ts) newest[i.cam] = i; });
      const rows = shown.map((it) => {
        const corr = it.text.startsWith('✓');
        const cur = corr ? it.text.replace(/^✓\s*/, '') : it.text;
        const fa = isFa(it);
        const ed = S.edit === it.summary;
        const pk = S.fa === it.summary;
        let mid, btns;
        if (ed) {
          mid = `<div class="txt">${esc(cur)}</div><div class="edit"><input value="${esc(S.val)}" placeholder="Was ist wirklich passiert?" aria-label="Korrektur">
            <div class="qa">${this._quick().map((q) => `<button class="q" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
            <div class="act"><button class="cx">Abbrechen</button><button class="sv"${S.val.trim().length > 1 && !S.busy ? '' : ' disabled'}>${S.busy ? 'Speichere …' : 'Speichern'}</button></div></div>`;
          btns = '';
        } else if (fa) {
          const g = cur.replace(FA_RE, '').replace(/^\s*[–-]\s*/, '') || 'Sonstiges';
          mid = `<div class="txt"><span class="tag">✕ Fehlalarm · ${esc(g)}</span>${corr ? '' : '<span class="auto">automatisch</span>'}</div>`;
          btns = corr
            ? `<button class="x" data-undo="${esc(it.summary)}" aria-label="Zurückholen"><ha-icon icon="mdi:restore"></ha-icon></button>`
            : `<button class="pen" data-edit="${esc(it.summary)}" aria-label="Korrigieren"><ha-icon icon="mdi:pencil"></ha-icon></button>`;
        } else {
          if (corr) {
            const orig = this._origFor(it);
            mid = `${orig ? `<div class="old">${esc(orig)}</div>` : ''}<div class="new" title="von dir korrigiert"><ha-icon icon="mdi:account-edit"></ha-icon><span>${esc(cur)}</span></div>`;
          } else {
            mid = cur ? `<div class="txt">${esc(cur)}</div>` : '<div class="txt muted">Keine KI-Beschreibung</div>';
          }
          if (pk) {
            mid += `<div class="pick"><div class="qa">${GRUENDE.map((g) => `<button class="q${S.grund === g[0] ? ' sel' : ''}" data-grund="${esc(g[0])}">${g[1]} ${esc(g[0])}</button>`).join('')}</div>
              <div class="act"><button class="cx" data-facx="1">Abbrechen</button><button class="sv fa"${S.grund && !S.busy ? '' : ' disabled'} data-fasv="1">${S.busy ? 'Speichere …' : 'Als Fehlalarm ausblenden'}</button></div></div>`;
            btns = `<button class="x on" data-fa="${esc(it.summary)}" aria-label="Fehlalarm">${xIc}</button>`;
          } else {
            btns = `<button class="pen" data-edit="${esc(it.summary)}" aria-label="Korrigieren"><ha-icon icon="mdi:pencil"></ha-icon></button><button class="x" data-fa="${esc(it.summary)}" aria-label="Als Fehlalarm markieren">${xIc}</button>`;
          }
        }
        let nhb = '';
        if (!ed && !pk && newest[it.cam] === it) {
          const run = S.nh === it.summary;
          nhb = `<button class="nh${run ? ' run' : ''}" data-nh="${esc(it.summary)}" aria-label="KI-Beschreibung neu erstellen"><ha-icon icon="${run ? 'mdi:loading' : 'mdi:refresh'}"></ha-icon>${run ? 'KI arbeitet …' : 'KI neu'}</button>`;
        }
        const tb = this._thumb(it.clip);
        return `<div class="row${fa && !ed ? ' dim' : ''}"><button class="th" data-play="${esc(it.summary)}" data-clip="${esc(it.clip)}"${tb ? ` style="background-image:url('${tb}')"` : ''} aria-label="Clip abspielen"><span><ha-icon icon="mdi:play"></ha-icon></span></button>
          <div class="mid"><div class="meta">${this._fmt(it.ts)} · ${esc(it.cam)}${nhb}</div>${mid}</div>
          ${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;
      }).join('');
      const hints = S.hinw.map((h) => `<div class="hint${S.hopen[h.summary] ? ' open' : ''}"><button class="ht" data-ht="${esc(h.summary)}" title="${esc(h.summary)}">${esc(h.summary)}</button><button class="hx" data-rm="${esc(h.summary)}" aria-label="Hinweis entfernen"><ha-icon icon="mdi:close"></ha-icon></button></div>`).join('');
      const toast = S.toast && S.toast.until > Date.now() ? `<div class="toast"><span>Fehlalarm – ${esc(S.toast.grund)} · ausgeblendet</span><button class="tu" data-undo="${esc(S.toast.summary)}">Rückgängig</button></div>` : '';
      const leer = S.showFa ? 'Keine Fehlalarme in diesem Zeitraum.' : 'Keine Meldungen mit Aufnahme in diesem Zeitraum.';
      this._body.innerHTML = `
        <div class="hd"><span class="h1">Kamera-KI Training</span><span class="lock"><ha-icon icon="mdi:lock-outline"></ha-icon>nur Martin</span></div>
        <div class="kpi"><div><b>${korrN}</b><span>Korrekturen</span></div><div><b>${fehl}</b><span>Fehlalarme</span></div><div><b>${total}</b><span>mit Clip</span></div><div><b>${quote}</b><span>stimmen</span></div></div>
        ${aus.length ? `<div class="warn"><ha-icon icon="mdi:record-rec"></ha-icon><span>Aufzeichnen ist aus bei ${aus.join(' und ')}. Dort wertet die KI nichts aus, bis es wieder an ist.</span></div>` : ''}
        ${toast}
        <div class="sub"><span>${S.all ? 'Alle (14 Tage)' : 'Letzte 24 Stunden'} · ${S.showFa ? 'nur Fehlalarme' : 'ohne Fehlalarme · ✎ korrigieren · ✕ Fehlalarm'}</span><span class="tgs"><button class="tg${S.showFa ? ' on' : ''}" data-showfa="1">Fehlalarme (${faZeit})</button><button class="tg" data-all="1">${S.all ? '24 Std' : 'Alle'}</button></span></div>
        <div class="list">${rows || (S.ready ? `<div class="empty">${leer}</div>` : '<div class="empty">Prüfe Aufnahmen auf der SD-Karte …</div>')}</div>
        <button class="htg${S.hzu ? '' : ' open'}" data-htg="1" aria-expanded="${S.hzu ? 'false' : 'true'}"><span>Feste Hinweise für die KI · <b>${S.hinw.length}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>
        ${S.hzu ? '' : `<div class="hbox"><div class="hl">${hints || '<div class="empty">Noch keine Hinweise.</div>'}</div>
        <div class="hadd"><input maxlength="500" placeholder="Neuer Hinweis, z. B. Die graue Katze gehört den Nachbarn" aria-label="Neuer Hinweis"><button class="add">Hinzufügen</button></div></div>`}
        <div class="foot">Bei jedem neuen Clip bekommt die KI alle Hinweise und deine letzten 10 Korrekturen (auch Fehlalarme) als Beispiele mit. Fehlalarme verschwinden auch aus der Aufnahmen-Liste der Haupt-Dashboards. „KI neu“ beim jeweils neuesten Clip einer Kamera lässt die KI den Clip neu beschreiben, z. B. wenn Google überlastet war.</div>`;
      if (S.edit) { const i = this._body.querySelector('.edit input'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }
      this._body.querySelectorAll('.th[data-clip]').forEach((b) => { if (!this._thumb(b.dataset.clip)) this._queue(b.dataset.clip); });
    }

    _syncSave() {
      const b = this._body.querySelector('.sv:not(.fa)');
      if (b) b.toggleAttribute('disabled', !(this._s.val.trim().length > 1) || this._s.busy);
    }

    _click(e) {
      const b = e.target.closest('button'); if (!b) return;
      const S = this._s;
      if (b.dataset.all) { S.all = !S.all; this._render(); return; }
      if (b.dataset.showfa) { S.showFa = !S.showFa; this._render(); return; }
      if (b.dataset.fa) { S.fa = S.fa === b.dataset.fa ? null : b.dataset.fa; S.grund = ''; S.edit = null; this._render(); return; }
      if (b.dataset.grund) { S.grund = b.dataset.grund; this._render(); return; }
      if (b.dataset.facx) { S.fa = null; S.grund = ''; this._render(); return; }
      if (b.dataset.fasv) { this._saveFa(); return; }
      if (b.dataset.undo) { this._undo(b.dataset.undo); return; }
      if (b.dataset.nh) { this._nachholen(b.dataset.nh); return; }
      if (b.dataset.edit) { const it = S.items.find((i) => i.summary === b.dataset.edit); S.fa = null; S.edit = b.dataset.edit; S.val = it && it.text.startsWith('✓') ? it.text.replace(/^✓\s*/, '') : ''; this._render(); return; }
      if (b.dataset.q) { S.val = b.dataset.q; const i = this._body.querySelector('.edit input'); if (i) i.value = S.val; this._syncSave(); return; }
      if (b.classList.contains('cx')) { S.edit = null; S.val = ''; this._render(); return; }
      if (b.classList.contains('sv')) { this._save(); return; }
      if (b.dataset.htg) { S.hzu = !S.hzu; try { localStorage.setItem('kkt:hinweise', S.hzu ? 'zu' : 'auf'); } catch (e) {} this._render(); return; }
      if (b.dataset.ht) { const k = b.dataset.ht; if (S.hopen[k]) delete S.hopen[k]; else S.hopen[k] = true; const r = b.closest('.hint'); if (r) r.classList.toggle('open', !!S.hopen[k]); return; }
      if (b.dataset.rm) { this._callHint('entfernen', b.dataset.rm); return; }
      if (b.classList.contains('add')) { this._addHint(); return; }
      if (b.dataset.play) { const it = S.items.find((i) => i.summary === b.dataset.play); if (it) this._playClip(it); }
    }

    async _saveFa() {
      const S = this._s;
      const it = S.items.find((i) => i.summary === S.fa);
      if (!it || !S.grund || S.busy) return;
      S.busy = true; this._render();
      const alt = it.text.startsWith('✓') ? (this._origFor(it) || it.text.replace(/^✓\s*/, '')) : it.text;
      const neu = 'Fehlalarm – ' + S.grund;
      try {
        await this._hass.callService('script', this._c.script_korrektur, { item: it.summary, alt, neu, zeit: this._fmt(it.ts) });
        it.text = '✓ ' + neu;
        S.toast = { summary: it.summary, grund: S.grund, until: Date.now() + 8000 };
        clearTimeout(this._tt); this._tt = setTimeout(() => { S.toast = null; if (!S.edit) this._render(); }, 8100);
      } catch (err) { console.error(TAG, err); }
      S.busy = false; S.fa = null; S.grund = '';
      this._render();
      setTimeout(() => this._load(), 1500);
    }

    async _nachholen(summary) {
      const S = this._s;
      const it = S.items.find((i) => i.summary === summary);
      if (!it || S.nh) return;
      const before = it.text;
      const d = new Date(it.ts * 1000);
      S.nh = summary; this._render();
      try {
        await this._hass.callService('script', 'turn_on', { entity_id: 'script.' + (this._c.script_nachholen || 'kamera_ki_nachholen'), variables: { kamera: String(it.cam).toLowerCase(), item: it.summary, uhr: pad(d.getHours()) + ':' + pad(d.getMinutes()) } });
      } catch (err) { console.error(TAG, err); S.nh = null; this._render(); return; }
      let n = 0;
      clearInterval(this._nhT);
      this._nhT = setInterval(async () => {
        n++;
        await this._load();
        const cur = S.items.find((i) => i.summary === summary);
        if ((cur && cur.text !== before) || n >= 30) { clearInterval(this._nhT); S.nh = null; this._render(); }
      }, 10000);
    }

    async _undo(summary) {
      const S = this._s;
      const it = S.items.find((i) => i.summary === summary);
      if (!it) return;
      const alt = this._origFor(it) || it.text.replace(/^✓\s*/, '');
      try {
        await this._hass.callService('script', this._c.script_korrektur, { item: it.summary, alt, zuruecksetzen: true });
        it.text = alt;
      } catch (err) { console.error(TAG, err); }
      S.toast = null;
      this._render();
      setTimeout(() => this._load(), 1500);
    }

    async _save() {
      const S = this._s;
      const it = S.items.find((i) => i.summary === S.edit);
      if (!it || S.val.trim().length < 2 || S.busy) return;
      S.busy = true; this._syncSave();
      const alt = it.text.startsWith('✓') ? (this._origFor(it) || it.text.replace(/^✓\s*/, '')) : it.text;
      try {
        await this._hass.callService('script', this._c.script_korrektur, { item: it.summary, alt, neu: S.val.trim(), zeit: this._fmt(it.ts) });
        it.text = '✓ ' + S.val.trim();
      } catch (err) { console.error(TAG, err); }
      S.busy = false; S.edit = null; S.val = '';
      this._render();
      setTimeout(() => this._load(), 1500);
    }

    _addHint() {
      const i = this._body.querySelector('.hadd input');
      const t = i ? i.value.trim() : '';
      if (t.length < 2) return;
      this._callHint('hinzufuegen', t);
    }

    async _callHint(aktion, text) {
      try { await this._hass.callService('script', this._c.script_hinweis, { aktion, text }); } catch (err) { console.error(TAG, err); }
      setTimeout(() => this._load(), 1200);
    }

    async _playClip(it) {
      const P = this._pl, v = P.querySelector('video'), msg = P.querySelector('.pm');
      P.querySelector('.pt').textContent = it.cam + ' · ' + this._fmt(it.ts) + ' · ' + it.text.replace(/^✓\s*/, '');
      msg.textContent = 'Clip wird von der Kamera geladen …';
      P.classList.add('on');
      try { P.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      if (!it.clip) { msg.textContent = 'Kein passender Clip auf der SD-Karte gefunden.'; return; }
      try {
        const res = await this._hass.callWS({ type: 'media_source/resolve_media', media_content_id: it.clip, expires: 3600 });
        v.src = this._hass.hassUrl ? this._hass.hassUrl(res.url) : res.url;
        v.onplaying = () => { msg.textContent = ''; };
        v.onerror = () => { msg.textContent = 'Clip konnte nicht geladen werden.'; };
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      } catch (err) { msg.textContent = 'Clip nicht verfügbar: ' + (err && err.message || err); }
    }

    _tkey(clip) { const m = /([^/|]+\.mp4)/.exec(clip || ''); return m ? m[1] : String(clip || ''); }

    _tstore() {
      if (!this._tc) { try { this._tc = JSON.parse(localStorage.getItem('kkt:thumbs') || '{}') || {}; } catch (e) { this._tc = {}; } }
      return this._tc;
    }

    _thumb(clip) { return clip ? this._tstore()[this._tkey(clip)] || '' : ''; }

    _queue(clip) {
      this._tq = this._tq || []; this._tw = this._tw || new Set();
      const k = this._tkey(clip);
      if (this._tw.has(k)) return;
      this._tw.add(k); this._tq.push(clip);
      if (!this._trun) this._tnext();
    }

    async _tnext() {
      const clip = this._tq.shift();
      if (!clip) { this._trun = false; return; }
      this._trun = true;
      let img = '';
      try { img = await this._grabThumb(clip); } catch (e) { img = ''; }
      if (img) {
        const c = this._tstore(), k = this._tkey(clip);
        c[k] = img;
        const keys = Object.keys(c); if (keys.length > 80) keys.slice(0, keys.length - 80).forEach((x) => delete c[x]);
        try { localStorage.setItem('kkt:thumbs', JSON.stringify(c)); } catch (e) {}
        this._body.querySelectorAll('.th[data-clip]').forEach((b) => { if (this._tkey(b.dataset.clip) === k) b.style.backgroundImage = `url('${img}')`; });
      }
      this._tnext();
    }

    async _grabThumb(clip) {
      const res = await this._hass.callWS({ type: 'media_source/resolve_media', media_content_id: clip, expires: 600 });
      const url = this._hass.hassUrl ? this._hass.hassUrl(res.url) : res.url;
      return new Promise((done) => {
        const v = document.createElement('video');
        let fin = false;
        const end = (r) => { if (fin) return; fin = true; clearTimeout(to); try { v.pause(); v.removeAttribute('src'); v.load(); v.remove(); } catch (e) {} done(r); };
        const to = setTimeout(() => end(''), 25000);
        v.muted = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
        v.style.cssText = 'position:absolute;width:2px;height:2px;opacity:0;pointer-events:none;left:0;top:0';
        this._root.appendChild(v);
        v.addEventListener('loadedmetadata', () => { try { v.pause(); v.currentTime = Math.min(3, (v.duration || 6) / 3); } catch (e) { end(''); } });
        v.addEventListener('seeked', () => {
          try {
            const w = 160, h = Math.round(w * (v.videoHeight || 9) / (v.videoWidth || 16));
            const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
            cv.getContext('2d').drawImage(v, 0, 0, w, h);
            end(cv.toDataURL('image/jpeg', 0.6));
          } catch (e) { end(''); }
        });
        v.addEventListener('error', () => end(''));
        v.src = url;
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      });
    }

    _closeClip() {
      const v = this._pl.querySelector('video');
      try { v.pause(); } catch (e) {}
      v.removeAttribute('src'); try { v.load(); } catch (e) {}
      this._pl.classList.remove('on');
    }
  }

  customElements.define(TAG, KameraKiTrainingCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Kamera-KI Training', description: 'KI-Texte der Kameras korrigieren und Hinweise pflegen (nur ein Benutzer)' });
})();
