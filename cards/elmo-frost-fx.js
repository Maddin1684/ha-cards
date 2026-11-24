// ELMO Frost-Effekte v2 (31.10.2026; v2: sonniges Frostbild, Lichtschein nur auf dem Pflaster): <elmo-frost-fx data-key="day|night" data-stage="1|2" data-dev="desktop|ipad">
// Liegt in der ELMO-Karte (Desktop + iPad) exakt ueber dem Frost-Hausbild.
// day = haus-bewoelkt-frost-tag.png (640x617), sun = haus-sonnig-frost-tag.png (640x619),
// night = haus-frost-nacht.png (640x598).
// Eisblumen, Masken und Rauschen werden einmal per Canvas erzeugt und zwischengespeichert;
// Animation nur per CSS/SMIL mit negativer Startzeit nach Uhrzeit (kein Neustart beim Neuzeichnen).
(() => {
  if (customElements.get('elmo-frost-fx')) return;
  const IMG = {
    day: { W: 640, H: 617,
      win: [[[300, 338], [358, 322], [358, 503], [300, 517]], [[375, 318], [427, 305], [427, 477], [375, 492]]],
      col: '236,246,255', amax: 0.65,
      roof: [[64.1,3.2],[63.1,2.3],[60.3,3.2],[58.1,3.2],[22.5,11.4],[28.7,27.6],[29.4,27.9],[29.7,29.9],[32.5,29.2],[32.5,28.2],[31.6,27.6],[31.6,26.0],[30.3,23.7],[30.3,22.4],[29.4,21.1],[29.7,18.2],[33.4,18.8],[36.2,17.5],[37.5,15.3],[39.7,15.3],[40.9,16.2],[43.4,16.2],[48.4,14.9],[50.3,13.3],[50.6,12.3],[55.9,13.3],[58.8,12.3],[59.1,10.4],[60.3,10.4],[64.4,13.6],[65.9,14.0],[66.2,14.9],[67.5,15.6],[67.5,26.6],[71.9,25.6],[72.2,24.4],[70.3,20.8],[69.7,17.9],[66.9,11.7],[66.6,9.7],[65.9,9.4],[65.9,8.1]],
      pts: [[15.6,68.7],[47.5,91.9],[64.4,87.8],[32.8,82.0],[77.5,63.5],[55.6,88.0],[13.8,71.2],[75.3,83.3],[67.5,85.2],[12.0,65.5],[87.2,76.7],[60.9,86.2],[12.8,61.4],[8.9,63.9],[8.3,66.8],[44.8,95.6],[20.2,70.5],[80.3,80.7],[76.9,78.9],[21.4,74.7],[68.8,88.2],[12.7,68.2],[83.3,79.9],[27.8,80.5],[49.5,94.5],[24.8,77.6],[21.9,77.5],[86.6,73.9],[14.1,63.9],[79.2,71.2],[58.1,86.7],[33.6,87.5],[59.7,90.3],[76.9,75.5],[83.4,67.6],[84.5,76.8],[27.2,76.7],[31.1,79.2],[73.0,84.9],[51.2,89.3],[31.9,84.9],[54.1,90.9],[30.2,82.8],[23.8,71.2],[85.0,71.8],[78.8,67.9],[16.4,73.9],[62.3,89.5],[57.0,90.9],[80.9,77.3],[86.4,80.2],[80.9,73.9],[34.8,84.6],[70.5,84.4],[41.7,93.3],[18.8,68.1],[19.1,73.7],[38.6,89.8],[54.2,94.0],[73.3,78.6],[81.9,70.3],[72.3,81.8],[29.4,75.4],[89.8,79.1],[18.8,76.3],[5.2,63.2],[63.6,84.8],[78.0,82.5],[51.4,92.4],[47.7,96.8],[50.2,8.8],[50.5,5.8],[45.5,9.9],[35.2,14.6],[33.0,18.0],[30.8,10.4],[54.5,5.2],[29.2,13.8],[36.9,11.8],[56.2,9.9],[61.4,8.4],[28.4,16.7],[39.5,8.4],[69.5,21.9],[64.8,10.4],[39.4,13.9],[68.3,25.1],[26.2,14.4],[60.9,3.6],[27.0,19.3],[53.4,8.1],[58.6,6.8],[28.9,22.2],[53.0,11.0]] },
    sun: { W: 640, H: 619,
      win: [[[291, 350], [340, 340], [340, 493], [291, 510]], [[364, 327], [413, 317], [413, 475], [364, 487]]],
      col: '236,246,255', amax: 0.65,
      roof: [[62.2,2.9],[21.7,11.8],[25.6,22.6],[26.9,23.6],[26.7,25.2],[28.3,25.4],[28.4,26.8],[29.5,27.8],[29.5,28.8],[28.7,29.4],[29.8,29.9],[31.1,28.4],[28.4,21.2],[28.6,18.7],[30.2,18.4],[32.3,19.2],[35.3,17.8],[36.6,16.2],[41.2,17.1],[45.6,16.0],[48.6,14.4],[49.8,12.9],[54.5,14.1],[57.2,12.8],[57.7,11.1],[59.1,11.1],[65.8,16.2],[65.6,27.3],[67.0,27.3],[67.0,28.6],[69.2,29.9],[70.3,27.8],[68.4,27.8],[68.3,26.7],[70.3,26.0],[70.5,24.7]],
      pts: [[75.6,72.5],[57.2,85.0],[50.5,92.1],[78.6,66.1],[68.1,84.8],[81.9,68.5],[76.4,76.7],[81.4,73.5],[61.7,83.8],[43.4,94.5],[75.2,80.1],[76.1,67.2],[71.1,80.0],[83.8,75.6],[80.2,80.9],[87.0,78.4],[66.4,86.9],[63.7,86.6],[53.8,86.9],[75.0,83.2],[46.9,93.7],[65.2,84.0],[84.1,72.7],[50.6,88.7],[44.7,92.1],[66.4,80.9],[53.0,91.0],[47.2,89.5],[61.6,89.0],[73.6,77.2],[79.7,75.4],[49.5,85.1],[73.3,64.6],[76.1,64.5],[80.6,78.2],[53.1,84.2],[78.6,70.9],[39.2,92.2],[10.8,67.4],[58.3,88.0],[83.1,78.4],[72.5,84.3],[55.8,90.3],[21.7,78.4],[68.6,82.2],[78.0,82.4],[78.1,78.8],[84.7,69.6],[16.9,68.5],[13.6,71.7],[81.9,64.9],[19.2,71.7],[59.4,82.6],[41.9,92.2],[63.4,81.7],[7.8,65.8],[60.2,86.3],[26.9,81.9],[58.8,90.6],[75.9,70.0],[49.4,94.5],[78.0,73.5],[45.6,96.0],[25.9,15.0],[68.1,24.4],[48.8,9.2],[38.8,14.1],[53.4,8.4],[59.4,9.7],[51.6,11.1],[41.4,11.1],[43.6,13.2],[33.0,12.8],[45.0,9.9],[25.9,20.4],[65.9,22.5],[30.9,10.3],[61.6,11.6],[67.7,20.0],[34.8,10.2],[54.4,12.9],[31.9,18.1],[25.9,11.8],[46.6,12.8],[50.9,6.0],[29.7,16.2],[54.4,5.7]] },
    night: { W: 640, H: 598,
      win: [[[297, 337], [350, 327], [350, 500], [297, 510]], [[372, 316], [422, 306], [422, 478], [372, 490]]],
      col: '255,238,212', amax: 0.59,
      roof: [[61.6,1.0],[60.6,1.0],[60.3,1.7],[54.4,2.3],[48.1,4.0],[47.5,4.7],[45.6,4.7],[45.3,5.4],[41.9,5.7],[41.2,6.4],[38.8,6.7],[38.4,7.4],[35.6,7.4],[29.7,9.7],[27.2,9.7],[23.1,11.0],[30.0,29.4],[32.5,29.8],[36.6,29.4],[37.8,28.8],[43.1,29.1],[50.9,28.4],[30.9,28.8],[30.6,16.7],[35.6,11.7],[52.8,8.7],[55.3,8.7],[65.0,14.7],[65.3,26.4],[70.6,24.7],[70.6,23.4],[67.8,16.7],[67.5,14.7],[65.3,10.4],[62.8,2.7],[61.9,2.3]],
      pts: [[32.3,87.8],[14.5,70.6],[73.0,84.6],[65.9,91.5],[20.8,71.7],[78.3,74.2],[27.0,81.4],[6.4,65.2],[58.9,86.3],[69.1,86.0],[56.1,90.8],[79.1,81.3],[13.9,65.2],[49.5,96.2],[15.9,74.2],[78.1,84.8],[81.4,74.4],[63.9,85.5],[11.4,67.1],[88.4,83.3],[24.1,76.8],[84.4,74.9],[75.3,66.6],[83.8,79.1],[8.9,61.9],[82.0,85.6],[58.9,89.1],[3.3,62.2],[74.1,89.0],[41.2,95.5],[44.4,97.3],[71.4,87.6],[63.0,88.1],[10.8,70.2],[8.9,67.7],[18.8,75.9],[80.0,71.7],[86.2,78.1],[80.3,78.6],[61.1,91.3],[26.6,77.6],[13.0,62.5],[68.6,90.3],[23.4,72.1],[83.3,71.6],[23.9,80.4],[50.8,92.6],[74.8,82.6],[50.3,89.0],[53.4,88.6],[77.8,67.1],[86.4,81.1],[18.3,72.2],[21.2,78.3],[55.2,94.5],[77.2,88.3],[65.9,88.6],[17.8,66.0],[82.3,81.4],[77.3,77.6],[57.3,93.1],[56.2,87.8],[11.1,64.4],[63.6,92.8],[84.5,84.0],[11.7,59.9],[53.6,91.6],[5.9,61.0],[77.5,70.9],[29.8,83.3],[60.0,1.7],[30.2,25.2],[35.3,11.4],[29.7,16.1],[28.8,20.2],[38.3,10.9]] }
  };
  const CACHE = {};
  const rng = (seed) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  // Fenster in 4 Scheiben teilen (Mittelpfosten, Querstrebe) -> [bl, br, tl, tr]
  const panes = (win) => {
    const [TL, TR, BR, BL] = win, out = [];
    [[0, 0.41], [0.49, 1]].forEach(([c0, c1]) => [[0, 0.475], [0.525, 1]].forEach(([r0, r1]) => {
      const P = (c, r) => lerp(lerp(TL, TR, c), lerp(BL, BR, c), r);
      out.push([P(c0, r1), P(c1, r1), P(c0, r0), P(c1, r0)]);
    }));
    return out;
  };
  const frostURL = (key, stage) => {
    const id = key + stage;
    if (CACHE[id]) return CACHE[id];
    const I = IMG[key], S = 3;
    const xs = I.win.flat().map((p) => p[0]), ys = I.win.flat().map((p) => p[1]);
    const bx = Math.min(...xs) - 2, by = Math.min(...ys) - 2, bw = Math.max(...xs) - bx + 2, bh = Math.max(...ys) - by + 2;
    const cv = document.createElement('canvas'); cv.width = Math.round(bw * S); cv.height = Math.round(bh * S);
    const c = cv.getContext('2d');
    c.setTransform(S, 0, 0, S, -bx * S, -by * S);
    const P = I.win.flatMap(panes);
    c.save(); c.beginPath();
    P.forEach(([bl, br, tl, tr]) => { c.moveTo(tl[0], tl[1]); c.lineTo(tr[0], tr[1]); c.lineTo(br[0], br[1]); c.lineTo(bl[0], bl[1]); c.closePath(); });
    c.clip();
    const strength = stage >= 2 ? 1.15 : 0.7, L0 = stage >= 2 ? 7.5 : 5.5, depth = stage >= 2 ? 6 : 4, haze = stage >= 2 ? 0.45 : 0.28;
    const R = rng(stage >= 2 ? 12 : 11), U = (a, b) => a + (b - a) * R();
    // milchiger Reifrand unten in jeder Scheibe
    P.forEach(([bl, br, tl, tr]) => {
      const m = lerp(bl, br, 0.5), up = [tl[0] - bl[0], tl[1] - bl[1]];
      const g = c.createLinearGradient(m[0], m[1], m[0] + up[0] * 0.38, m[1] + up[1] * 0.38);
      g.addColorStop(0, `rgba(${I.col},${(haze * I.amax).toFixed(3)})`); g.addColorStop(1, `rgba(${I.col},0)`);
      c.fillStyle = g; c.beginPath(); c.moveTo(tl[0], tl[1]); c.lineTo(tr[0], tr[1]); c.lineTo(br[0], br[1]); c.lineTo(bl[0], bl[1]); c.closePath(); c.fill();
    });
    const line = (x0, y0, x1, y1, a, w) => { c.globalAlpha = Math.min(1, a * 1.5) * I.amax; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
    c.strokeStyle = `rgb(${I.col})`; c.lineCap = 'round';
    const seeds = [];
    P.forEach(([bl, br, tl, tr]) => {
      const ux = br[0] - bl[0], uy = br[1] - bl[1], up = Math.atan2(tl[1] - bl[1], tl[0] - bl[0]), along = Math.atan2(uy, ux);
      seeds.push([bl[0] + 1, bl[1] - 1, (up + along) / 2, strength]);
      seeds.push([br[0] - 1, br[1] - 1, Math.atan2(tr[1] - br[1], tr[0] - br[0]) - 0.6, strength]);
      [0.33, 0.66].forEach((t) => seeds.push([bl[0] + ux * t, bl[1] + uy * t - 1, up + U(-0.25, 0.25), 0.7 * strength]));
      seeds.push([tl[0] + 1, tl[1] + 1, Math.atan2(br[1] - tl[1], br[0] - tl[0]), 0.28 * strength]);
      seeds.push([tr[0] - 1, tr[1] + 1, Math.atan2(bl[1] - tr[1], bl[0] - tr[0]), 0.28 * strength]);
    });
    seeds.forEach(([x, y, ang, st]) => {
      const nst = st > 0.6 ? 3 + Math.floor(R() * 3) : 2 + Math.floor(R() * 2);
      for (let j = 0; j < nst; j++) {
        let a = ang + U(-0.65, 0.65), px = x, py = y;
        const steps = Math.floor(L0 * st * U(3, 5) * (depth / 5)), curv = U(-0.05, 0.05);
        for (let i = 0; i < steps; i++) {
          const f = 1 - i / Math.max(1, steps);
          a += curv + U(-0.06, 0.06);
          const nx = px + Math.cos(a) * 1.5, ny = py + Math.sin(a) * 1.5;
          line(px, py, nx, ny, 0.92 * (0.35 + 0.65 * f), 0.5);
          if (R() < 0.75) {
            const side = i % 2 === 0 ? 1 : -1;
            const sl = (1.2 + 4.2 * f * U(0.6, 1.1)) * Math.min(1.4, st + 0.2);
            const sa = a + side * U(52, 68) * Math.PI / 180;
            const ex = nx + Math.cos(sa) * sl, ey = ny + Math.sin(sa) * sl;
            line(nx, ny, ex, ey, 0.78 * (0.3 + 0.7 * f), 0.28);
            if (sl > 3 && R() < 0.5) {
              const mx = nx + (ex - nx) * 0.55, my = ny + (ey - ny) * 0.55, ma = sa - side * Math.PI / 3;
              line(mx, my, mx + Math.cos(ma) * sl * 0.35, my + Math.sin(ma) * sl * 0.35, (160 * f + 40) / 255, 0.25);
            }
          }
          px = nx; py = ny;
        }
      }
    });
    c.restore();
    return (CACHE[id] = { url: cv.toDataURL('image/png'), box: [bx / I.W * 100, by / I.H * 100, bw / I.W * 100, bh / I.H * 100] });
  };
  const roofURL = (key) => {
    if (CACHE['r' + key]) return CACHE['r' + key];
    const I = IMG[key], cv = document.createElement('canvas'); cv.width = 240; cv.height = Math.round(240 * I.H / I.W);
    const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.beginPath();
    I.roof.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0] / 100 * cv.width, p[1] / 100 * cv.height));
    c.closePath(); c.fill();
    return (CACHE['r' + key] = cv.toDataURL('image/png'));
  };
  // nahtlose Rauschkacheln fuer den Lichtschein (fein = Reifkoernung, grob = Dunstschwaden)
  const noiseURL = (n, base, count, rMin, rMax, alpha, seed) => {
    if (CACHE['n' + seed]) return CACHE['n' + seed];
    const R = rng(seed), cv = document.createElement('canvas'); cv.width = cv.height = n;
    const c = cv.getContext('2d'); c.fillStyle = `rgb(${base},${base},${base})`; c.fillRect(0, 0, n, n);
    for (let i = 0; i < count; i++) {
      const x = R() * n, y = R() * n, r = rMin + R() * (rMax - rMin);
      for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) {
        const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
      }
    }
    return (CACHE['n' + seed] = cv.toDataURL('image/png'));
  };
  // Lichtschein der Fenster auf dem Hof (nur Nachtbild, Koordinaten 640x598)
  // Umriss der Bodenplatte (leicht nach innen versetzt) - Lichtschein endet an der Plattenkante
  const SLAB = [[392,6],[374,14],[147,70],[89,145],[93,148],[92,335],[10,371],[237,593],[237,597],[369,597],[369,593],[639,471],[639,390],[625,389],[623,393],[611,396],[609,404],[601,404],[598,393],[592,389],[592,381],[586,377],[586,369],[580,366],[582,338],[579,218],[455,159]];
  const PANE_X = [[[298, 320], [327, 350]], [[373, 395], [400, 422]]], FAR = ['#ff6a32', '#4d86ff'];
  const yF = (x) => 523 - 0.22 * (x - 297), pt = (x, t) => [x + 0.8 * t, yF(x) + 0.6 * t];
  const poolSvg = (neg) => {
    let g = '', polys = '';
    PANE_X.forEach((win, w) => {
      const mx = (win[0][0] + win[1][1]) / 2, b = pt(mx, 0), f = pt(mx, 100);
      g += `<linearGradient id="pn${w}" gradientUnits="userSpaceOnUse" x1="${b[0]}" y1="${b[1]}" x2="${f[0]}" y2="${f[1]}"><stop offset="0" stop-color="#ffc070"/><stop offset=".45" stop-color="#ffa850" stop-opacity=".6"/></linearGradient>`
        + `<linearGradient id="pf${w}" gradientUnits="userSpaceOnUse" x1="${b[0]}" y1="${b[1]}" x2="${f[0]}" y2="${f[1]}"><stop offset=".45" stop-color="${FAR[w]}" stop-opacity=".9"/><stop offset="1" stop-color="${FAR[w]}" stop-opacity="0"/></linearGradient>`;
      win.forEach((p) => [[2, 38, 'pn'], [46, 100, 'pf']].forEach((s) => {
        const q = [pt(p[0], s[0]), pt(p[1], s[0]), pt(p[1], s[1]), pt(p[0], s[1])];
        polys += `<polygon fill="url(#${s[2]}${w})" points="${q.map((v) => v[0].toFixed(1) + ',' + v[1].toFixed(1)).join(' ')}"/>`;
      }));
    });
    const nA = noiseURL(64, 158, 70, 1.5, 4, 0.55, 101), nB = noiseURL(150, 153, 22, 18, 42, 0.45, 202);
    const spl = 'calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"';
    return `<svg class="pool" viewBox="0 0 640 598" preserveAspectRatio="none" aria-hidden="true"><defs>${g}`
      + `<clipPath id="slab" clipPathUnits="userSpaceOnUse"><polygon points="${SLAB.map((p) => p.join(',')).join(' ')}"/></clipPath>`
      + `<filter id="pb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>`
      + `<pattern id="nA" patternUnits="userSpaceOnUse" width="34" height="34"><image href="${nA}" width="34" height="34" preserveAspectRatio="none"/></pattern>`
      + `<pattern id="nB" patternUnits="userSpaceOnUse" width="150" height="150"><image href="${nB}" width="150" height="150" preserveAspectRatio="none"/></pattern>`
      + `<mask id="mA" color-interpolation="sRGB" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="598"><rect x="-200" y="-200" width="1040" height="1000" fill="url(#nA)"><animateTransform attributeName="transform" type="translate" from="0 0" to="34 34" dur="15s" begin="${neg(15)}" repeatCount="indefinite"/></rect></mask>`
      + `<mask id="mB" color-interpolation="sRGB" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="598"><rect x="-200" y="-200" width="1040" height="1000" fill="url(#nB)"><animateTransform attributeName="transform" type="translate" from="0 0" to="-150 150" dur="40s" begin="${neg(40)}" repeatCount="indefinite"/></rect></mask>`
      + `</defs><g clip-path="url(#slab)"><g class="flick"><g mask="url(#mB)"><g mask="url(#mA)"><g><animate attributeName="opacity" values="0.6;1;0.6" dur="11.4s" begin="${neg(11.4)}" repeatCount="indefinite" ${spl}/>`
      + `<g transform="translate(360 508)"><g><animateTransform attributeName="transform" type="scale" values="0.83;1.17;0.83" dur="11.4s" begin="${neg(11.4)}" repeatCount="indefinite" ${spl}/>`
      + `<g transform="translate(-360 -508)"><g filter="url(#pb)">${polys}</g></g></g></g></g></g></g></g></g></svg>`;
  };
  const PERIODS = [7, 9, 11, 13];
  const KF = PERIODS.map((p) => {
    const a = (60 / p).toFixed(2), b = (90 / p).toFixed(2), e = (200 / p).toFixed(2);
    return `@keyframes tw${p}d{0%{opacity:0}${a}%{opacity:1}${b}%{opacity:1}${e}%{opacity:0}100%{opacity:0}}@keyframes tw${p}n{0%{opacity:.04}${a}%{opacity:.85}${b}%{opacity:.85}${e}%{opacity:.04}100%{opacity:.04}}`;
  }).join('');
  class ElmoFrostFx extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const key = this.dataset.key, stage = Number(this.dataset.stage) || 0, ipad = this.dataset.dev === 'ipad';
      const I = IMG[key];
      if (!I || stage < 1) return;
      const night = key === 'night', now = Date.now() / 1000;
      const neg = (dur, off) => '-' + ((((now + (off || 0)) % dur) + dur) % dur).toFixed(2) + 's';
      const fr = frostURL(key, stage), roof = roofURL(key), box = fr.box;
      const rc = night ? '190,212,255' : '255,255,255', ra = night ? 0.28 : 0.5, rper = night ? 20 : 18;
      const fc = night ? '255,236,205' : '255,255,255', fa = night ? 0.75 : 0.9, fper = night ? 10 : 11;
      let dots = '';
      I.pts.forEach((p, i) => {
        if ((i % 5 < 2 ? 1 : 2) > stage || (ipad && i % 2)) return;
        const per = PERIODS[i % 4];
        dots += `<i style="left:${p[0]}%;top:${p[1]}%;animation:tw${per}${night ? 'n' : 'd'} ${per}s linear ${neg(per, i * 2.7)} infinite;"></i>`;
      });
      this.attachShadow({ mode: 'open' }).innerHTML = `<style>
:host{display:block;pointer-events:none}
.l{position:absolute;inset:0;overflow:hidden;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;mix-blend-mode:screen}
.band{position:absolute;top:-20%;height:140%;left:0;will-change:transform}
.roof .band{width:35%;background:linear-gradient(90deg,rgba(${rc},0),rgba(${rc},${ra}),rgba(${rc},0));animation:elfSweep ${rper}s linear ${neg(rper)} infinite}
@keyframes elfSweep{0%{transform:translateX(-120%) skewX(-25deg)}50%,100%{transform:translateX(320%) skewX(-25deg)}}
.fb{position:absolute;left:${box[0].toFixed(3)}%;top:${box[1].toFixed(3)}%;width:${box[2].toFixed(3)}%;height:${box[3].toFixed(3)}%}
.fb img{position:absolute;inset:0;width:100%;height:100%;display:block;${night ? 'mix-blend-mode:screen;' : ''}}
.fb .band{width:45%;background:linear-gradient(90deg,rgba(${fc},0),rgba(${fc},${fa}),rgba(${fc},0));animation:elfGlim ${fper}s linear ${neg(fper, 3)} infinite}
@keyframes elfGlim{0%{transform:translateX(-130%) skewX(20deg)}24%,100%{transform:translateX(260%) skewX(20deg)}}
.pool{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen}
.flick{animation:elfFlick 4.7s ease-in-out ${neg(4.7)} infinite}
@keyframes elfFlick{0%,100%{opacity:.9}17%{opacity:.97}33%{opacity:.86}52%{opacity:.99}70%{opacity:.88}86%{opacity:.95}}
i{position:absolute;width:1.1px;height:1.1px;margin:-.55px 0 0 -.55px;border-radius:50%;opacity:0;background:${night ? '#e9f0ff' : '#fff'};box-shadow:${night ? '0 0 2px .4px rgba(150,190,255,.8)' : '0 0 1.8px .4px rgba(185,218,255,.95)'}}
${KF}</style>${night ? poolSvg(neg) : ''}<div class="l roof" style="-webkit-mask-image:url(${roof});mask-image:url(${roof})"><div class="band"></div></div><div class="fb"><img src="${fr.url}" alt=""><div class="l" style="-webkit-mask-image:url(${fr.url});mask-image:url(${fr.url})"><div class="band"></div></div></div>${dots}`;
    }
  }
  customElements.define('elmo-frost-fx', ElmoFrostFx);
})();
