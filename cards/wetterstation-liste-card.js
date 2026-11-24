// wetterstation-liste-card v1.56 (24.11.2026: Trennlinien zwischen den Zeilen entfernt; v1.55: Kategorien als eigene, leicht aufgehellte Kaesten (5 % Weiss, Radius 12), Ueberschrift im Kasten, Zeilen durch feine Linien ab dem Namen getrennt; v1.54: Plus/Minus 13 px, etwas tiefer; v1.53: Plus/Minus ohne zusaetzlichen Abstand (naeher am Wert, beim Polarlicht in der Hinweiszeile statt eigener Zeile); v1.52: Ueberschrift-Kachel 28 px mit 20-px-Icon, Zeilen-Icons mittig darunter, Plus/Minus 15 px; v1.51: Zeilen-Icons buendig unter dem Ueberschrift-Icon, Namen buendig unter dem Ueberschrift-Text; dezentes Plus/Minus im Kreis statt 'Karte'/'Verlauf'; v1.50: Ueberschriften 14 px in Grossbuchstaben, rechts 'Einklappen' / 'Anzeigen' statt Pfeil; v1.49: Ueberschriften mit grauer Icon-Kachel, 15 px, Trennlinie darunter; aufklappbare Zeilen mit Kapsel 'Karte' / 'Verlauf' statt Pfeil; v1.48: Sonne aufklappbar mit Tagesbogen als duenne Verlaufslinie (Nacht grau, Blaue Stunde blau, Goldene Stunde orange, Tag gelb), Sonnenpunkt, Hoechststand, 'noch … hell' und Zeiten der Goldenen/Blauen Stunde; v1.47: Polarlicht-Karte klappt nur noch selbst auf, wenn bei dir (Elm) etwas sichtbar ist; v1.46: Polarlicht-Karte klappt ueber 'Karte' am Ende der Hinweiszeile auf (Pfeil nicht mehr an der Skala), Elm-Puls kleiner; v1.45: Polarlicht-Zeile aufklappbar mit kleiner Deutschlandkarte – Helligkeitsklassen aus Theusners Karte (camera.aurora_mtwetter_de) pixelgenau ausgelesen, in Martins Farben (fotografisch gelb, schwach gruen, deutlich lila halb, hell lila), dezent; 'Bei dir' am Elm-Punkt; klappt bei Polarlicht in Deutschland selbst auf; Tipp auf die Karte oeffnet das Originalbild; v1.44: ISS 'jetzt sichtbar' nur noch nach dem Ueberflug-Sensor (auch waehrend die Integration den Start weiterschiebt), sonst 'zu tief am Horizont'; v1.43: Skalen 6 px hoch, rund, 3 px Luecke, Dreieck mit weichem Schatten, Max-Linie 16 px; v1.42: Tendenz-Bilder (Temperatur, Luftdruck) 3 px tiefer, auf Hoehe der uebrigen Icons; v1.41: Puls-Animation am Elm-Punkt laeuft nur bei aufgeklappter ISS-Karte (zugeklappt kein Dauer-Neuzeichnen mehr); v1.40: animierte Tendenz-Bilder (Pfeile) als eigene Grafikebene gegen Ruckeln auf dem iPad, ISS-Takt aendert nur noch bei offener Karte bzw. echter Aenderung; v1.39: ISS-Untertext direkt unter dem Namen wie bei Sonne/Taupunkt, Pfeil rechts unter dem Zeitpunkt, 'bei dir zu hell' heisst 'im Tageslicht'; v1.38: zusammengefuehrt mit der Parallel-Version: ISS-Bodenspur ein voller Umlauf ohne Luecken am Kartenrand; v1.37: schmale Karte (iPad): ISS-Zeitpunkt zweizeilig rechtsbuendig ('Heute' / 'um 16:11'), Grund in eigener Zeile; v1.36: ISS-Zeitpunkt rechtsbuendig ohne Umbruch, Aufklapp-Pfeil rechts unter dem Zeitpunkt, 'gerade ueber … · Grund' mit Trennpunkt; v1.35: Grund (Erdschatten usw.) in eigener Zeile unter 'gerade ueber'; v1.34: ISS-Karte mit Nachtseite, Untertext nennt den Grund (Erdschatten / bei dir zu hell / zu weit weg / jetzt sichtbar mit Blickrichtung); v1.33: Elm-Punkt wieder gruen, Beschriftung weiss; v1.32: v1.31: ISS laeuft live weiter (Bahnmodell, alle 2 s), 'gerade ueber' immer sichtbar, Beschriftung Elm; v1.30: ISS-Zeile aufklappbar mit Weltkarte – ISS-Position als Raumstation-Symbol mit Bodenspur +-45 min, Elm gruen pulsierend, 'gerade ueber ...'; klappt 30 min vor bis Ende eines sichtbaren Ueberflugs selbst auf; v1.29: Wind und Boeen ohne Nachkommastellen, aktuelle Windgeschwindigkeit farbig; v1.28: UV-Index mit Tagesmaximum (gestrichelt), nur Stufen, die mind. 5 min gehalten wurden; v1.27: Legenden ersetzt durch Inline-Symbol vor dem gestrichelt markierten Wert; v1.26: Legenden rechtsbuendig; v1.25: Legenden klein und dezent direkt unter der Skala (Luftdruck, Wind); v1.24: Tendenz-Aenderung farbig nach Vorzeichen, Luftdruck-Legende unter dem Hinweis; v1.23: 12-h-Wert farbig, Legende jetzt/vor 3 h, History-Werte gecacht gegen Nachrutschen; v1.22: Luftdruck mit 12-h-Aenderung, Marke Stand vor 3 h, Hinweis Wetterumschwung/Sturmgefahr/Hoch; v1.21: Pollen-Stufenstriche mit Abstand zum Icon; v1.20: UV-Beschriftung linksbuendig am Stufenbeginn; v1.19: Positions-Skalen (Luftdruck, Luftfeuchte, Blitz-Entfernung) nur aktiver Bereich hell, Rest 35 % statt 25 %; v1.18: kein Springen mehr – DOM wird nur noch gezielt aktualisiert, Pollen-Icons mit fester Hoehe; v1.17: Skalen mit Farbverlauf ueber die Stufen (ausser Polarlicht); v1.16: Umbruch nur an Wortgrenzen ohne Trennstriche, Wert/Status immer auf Hoehe der ersten Namenszeile; v1.15: lange Namen umbrechen; v1.14: Luftfeuchte-Icon immer weiss; v1.13: Untertext bei einzeiligem Wert ueber volle Breite, Warnmarken-Text weg, Kp schmal nebeneinander mit Kurzlabels, Sonne schmal zweizeilig; v1.12: schmale Karte (iPad): kleinere Zusatztexte, Umbruch nur zwischen Textbloecken, Kp-Werte 2x2, Skalen ohne doppelte Einheiten; v1.11: Mond-Icon optisch zentriert; v1.10: Ovation -> Sichtbarkeit Elm; v1.9: Glaette wieder entfernt (DWD-Warnung vorhanden); v1.8: Icons bei mehrzeiligen Zeilen neben dem Namen; v1.7: Pegel cm/h + Tagesmax (gestrichelt), Luftdruck-Skala Tief/normal/Hoch; v1.6: Skalen hoeher, Wert/Zeit bei mehrzeiligen Zeilen oben buendig, Kp-Werte als Spalten in Farbe + Schwellen; v1.5: Windstaerke-Max mit Umbruch, Pollen kompakt, Sonne mit Tageslaengen-Aenderung, Polarlicht Kp-Werte, Pegel-Pfeil animiert; v1.4: Boee + max. Boee zusammengefasst mit Legende, Max-Werte mit Uhrzeit, Pegel als Saeule, Pollen als senkrechte Pillen; v1.3: Grenzwerte linksbuendig, Tendenz-Aenderung unter dem Namen (Temp 1 h, Druck 3 h), Luftfeuchte-Skala Nebel/feucht/trocken, Pegel mit Tendenz, Pollen als fuellende Pillen, Haus in Blitz-Skala) – Wetterstation als Entitaetenliste wie die Ursprungskarte (Himmel/Klima/Niederschlag/Blitze/Wind aufklappbar),
// Farben und Animationen der bisherigen uix-Styles; bei UV, Polarlicht, Temperatur am Windmesser, Taupunkt, Wind und Blitz-Entfernung rechts eine Stufenskala
// (erreichte Stufen kraeftig, Rest blass, Dreieck = aktuell, gestrichelt = max. heute).
(() => {
  const TAG = 'wetterstation-liste-card';
  if (customElements.get(TAG)) return;

  const C = { green: '#30d158', yellow: '#ffd60a', orange: '#ff9f0a', red: '#ff453a', purple: '#bf5af2', blue: '#0a84ff', white: '#f2f2f7', gray: '#8e8e93', gray2: '#636366', gray3: '#aeaeb2' };
  const DEF = {
    sun: 'sun.sun', uv: 'sensor.gw1100a_v2_2_5_uv_index', uv_text: 'sensor.uv_index_werte',
    moon: 'sensor.moon_api', moon_phase_text: 'sensor.mondphasen', moon_phase: 'sensor.moon_phase',
    iss: 'sensor.iss_nachster_uberflug', iss_warning: 'binary_sensor.international_space_station_iss_10_minute_pass_warning',
    iss_pos: 'device_tracker.international_space_station_iss', iss_pass: 'sensor.international_space_station_iss_pass_0',
    aurora: 'sensor.polarlicht_wahrscheinlichkeit', aurora_camera: 'camera.aurora_mtwetter_de',
    temp_trend: 'sensor.temperaturtendenz', pressure_trend: 'sensor.luftdrucktendenz',
    temp_main: 'sensor.wohnen_wohnen_wohnen_aussen_temperature', pressure: 'sensor.gw1100a_v2_2_5_relative_pressure',
    temp: 'sensor.gw1100a_v2_2_5_outdoor_temperature', dewpoint: 'sensor.gw1100a_dewpoint_1', humidity: 'sensor.gw1100a_v2_2_5_humidity',
    rain_prob: 'sensor.regenwahrscheinlichkeit', rain_start: 'sensor.beginn_niederschlag', rain_hour: 'sensor.gw1100a_v2_2_5_hourly_rain_rate',
    pegel: 'sensor.elm_elmbach_pegelstand', pegel_trend: 'sensor.pegelstand_statistik',
    lightning: 'sensor.blitze', lightning_anim: 'input_boolean.blitze',
    lightning_last: 'sensor.gw1100a_v2_2_5_last_lightning_strike', lightning_dist: 'sensor.gw1100a_v2_2_5_lightning_strike_distance',
    wind_text: 'sensor.windstarke2', wind: 'sensor.gw1100a_v2_2_5_wind_speed', wind_max: 'input_number.wind_max_heute',
    gust: 'sensor.gw1100a_v2_2_5_wind_gust', gust_max: 'sensor.gw1100a_v2_2_5_max_daily_gust',
  };
  const POLLEN = [
    ['sensor.pollenflug_ambrosia_91', 'fapro:ambrosia'], ['sensor.pollenflug_beifuss_91', 'fapro:beifuss'], ['sensor.pollenflug_birke_91', 'fapro:birke'],
    ['sensor.pollenflug_erle_91', 'fapro:erle'], ['sensor.pollenflug_esche_91', 'fapro:esche'], ['sensor.pollenflug_graeser_91', 'fapro:gras'],
    ['sensor.pollenflug_hasel_91', 'fapro:hasel'], ['sensor.pollenflug_roggen_91', 'fapro:roggen'],
  ];
  const STUFEN = ['sehr gering', 'gering', 'mäßig', 'Vorwarnung', 'hoch', 'sehr hoch', 'extrem hoch'];
  const STUFEN_C = [C.gray, C.gray, C.gray3, C.yellow, C.green, C.purple, C.purple];

  const CSS = `
    :host { display:block; container-type:inline-size; }
    ha-card { padding:4px 0 8px; overflow:hidden; }
    .nw { white-space:nowrap; }
    .sx { flex:0 0 calc(100% - 44px); min-width:0; margin:-12px 0 4px 44px; font-size:12px; line-height:1.35; color:var(--secondary-text-color); }
    .kg .s { display:none; }
    .wn { flex:0 0 calc(100% - 44px); box-sizing:border-box; margin:-3px 0 8px 44px; border-radius:10px; padding:5px 10px; font-size:12px; line-height:1.35; display:flex; gap:8px; align-items:center; }
    .dsh { display:inline-block; width:2px; height:10px; background:repeating-linear-gradient(to bottom,#fff 0 2px,transparent 2px 4px); margin:0 4px -1px 1px; }
    .lgw { flex:0 0 calc(100% - 44px); margin:-2px 0 8px 44px; }
    .wn ha-icon { --mdc-icon-size:16px; flex:0 0 16px; display:flex; }
    .wn b { font-weight:600; }
    .hd { font-size:24px; font-weight:400; letter-spacing:-.012em; line-height:48px; padding:12px 16px 4px; color:var(--ha-card-header-color, var(--primary-text-color)); }
    .fold { margin:0 10px 8px; padding:0 12px; border-radius:12px; background:rgba(255,255,255,.05); }
    .fh { display:flex; align-items:center; gap:16px; height:48px; cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent; }
    .fi { padding-bottom:2px; }
    .fh .ft { flex:0 0 28px; width:28px; height:28px; border-radius:7px; background:rgba(118,118,128,.28); display:flex; align-items:center; justify-content:center; }
    .fh .ft ha-icon { --mdc-icon-size:20px; color:#fff; display:flex; }
    .fh .lbl { flex:1; font-weight:500; font-size:14px; text-transform:uppercase; letter-spacing:.04em; color:var(--primary-text-color); }
    .fh .fx { font-size:11px; color:var(--secondary-text-color); }
    .fh .fx::after { content:'Einklappen'; }
    .fold.closed .fh .fx::after { content:'Anzeigen'; }
    .fb { display:grid; grid-template-rows:1fr; transition:grid-template-rows .3s ease; }
    .fold.closed .fb { grid-template-rows:0fr; }
    .fi { overflow:hidden; min-height:0; }
    .r { display:flex; flex-wrap:wrap; align-items:flex-start; min-height:40px; column-gap:16px; cursor:pointer; -webkit-tap-highlight-color:transparent; }
    .bar { flex:0 0 calc(100% - 44px); min-width:0; margin:-4px 0 8px 44px; }
    .r.top > .bar, .sx + .bar { margin-top:4px; }
    .r > .st, .r > .cols { padding-top:10px; }
    .r > svg { margin-top:1px; }
    .kg { display:grid; grid-template-columns:repeat(4,auto); justify-content:space-between; margin-top:8px; }
    .kg div { display:flex; flex-direction:column; font-size:10px; color:var(--secondary-text-color); }
    .kg b { font-size:13px; font-weight:500; font-variant-numeric:tabular-nums; margin-top:1px; }
    .kh { font-size:10px; color:var(--secondary-text-color); margin-top:6px; display:flex; flex-wrap:nowrap; justify-content:space-between; align-items:flex-end; column-gap:6px; }
    .kh > span:first-child { min-width:0; }
    .kh .akt { margin:0 -1px 0 auto; flex:0 0 auto; line-height:0; display:inline-flex; align-items:center; gap:1px; white-space:nowrap; }
    .kh .akt .ich { display:inline-flex; width:16px; --mdc-icon-size:16px; margin:0 -3px 0 0; }
    .lgd { display:flex; gap:10px; font-size:9px; line-height:10px; color:var(--secondary-text-color); opacity:.6; margin-top:3px; align-items:center; justify-content:flex-end; }
    .lgd .t { display:inline-block; width:0; height:0; border-left:3px solid transparent; border-right:3px solid transparent; border-bottom:4px solid #fff; margin-right:3px; vertical-align:1px; }
    .lgd i { display:inline-block; width:1.5px; height:8px; background:repeating-linear-gradient(to bottom,#fff 0 1.5px,transparent 1.5px 3px); margin:0 3px -1px 1px; }
    .vp { display:flex; justify-content:space-between; gap:4px; }
    .vp > div { display:flex; flex-direction:column; align-items:center; gap:5px; min-width:0; }
    .vp ha-icon { --mdc-icon-size:20px; display:flex; align-items:center; justify-content:center; width:24px; height:24px; }
    .vp .dt { display:flex; gap:2px; }
    .vp .dt i { width:5px; height:3px; border-radius:1.5px; background:rgba(128,128,128,.35); }
    .bar .seg { margin-bottom:2px; }
    .bd { flex:0 0 28px; width:28px; height:40px; display:flex; align-items:center; justify-content:center; }
    .bd ha-icon { --mdc-icon-size:24px; color:var(--state-icon-color, var(--paper-item-icon-color, #44739e)); display:inline-flex; }
    .bd img { flex:0 0 40px; margin:0 -6px; width:40px; height:40px; object-fit:contain; border-radius:50%; transform:translateZ(0); will-change:transform; }
    .bd img.tr { transform:translate3d(0,3px,0); }
    .bd img.sm { flex-basis:24px; margin:0; width:24px; height:24px; }
    .nm { flex:1; min-width:0; font-size:14px; line-height:1.3; padding:10px 0 4px; color:var(--primary-text-color); }
    .nm .sec { display:block; font-size:12px; color:var(--secondary-text-color); white-space:normal; line-height:1.35; }
    .kp { font-size:11px; color:var(--secondary-text-color); margin-top:4px; }
    .kp b { color:var(--primary-text-color); font-weight:500; }
    .st { font-size:14px; line-height:1.3; color:var(--primary-text-color); text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }
    .st small { font-size:12px; color:var(--secondary-text-color); margin-left:3px; }
    .cols { display:flex; gap:18px; text-align:center; }
    .cols div { display:flex; flex-direction:column; font-size:14px; line-height:1.3; color:var(--primary-text-color); }
    .cols span { font-size:12px; color:var(--secondary-text-color); }
    .mini { width:132px; flex:0 0 132px; display:flex; flex-direction:column; align-items:flex-end; gap:5px; padding:4px 0 6px; }
    .mini .v { font-size:14px; color:var(--primary-text-color); white-space:nowrap; font-variant-numeric:tabular-nums; }
    .mini .v small { font-size:12px; color:var(--secondary-text-color); margin-left:2px; }
    .seg { position:relative; width:100%; height:6px; display:flex; gap:3px; margin-bottom:2px; }
    .tk { position:relative; width:100%; height:12px; margin-top:12px; font-size:10px; line-height:12px; color:var(--secondary-text-color); }
    .tk.two { height:24px; }
    .tk span { position:absolute; top:0; white-space:nowrap; }
    .tk ha-icon { --mdc-icon-size:13px; margin-top:-1px; }
    .tk span.l { transform:none; } .tk span.r { transform:translateX(-100%); }
    .st2 { display:flex; flex-direction:column; align-items:flex-end; }
    .st2 small { font-size:12px; color:var(--secondary-text-color); white-space:nowrap; }
    .st2 small b { font-weight:500; }
    .seg > div { height:100%; border-radius:3px; opacity:.25; }
    .seg > div.pz { opacity:.35; }
    .seg > div.on { opacity:1; }
    .seg > .tri { position:absolute; top:8px; width:0; height:0; border-left:4px solid transparent; border-right:4px solid transparent; border-bottom:6px solid #fff;
      transform:translateX(-50%); filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.45)); opacity:1; border-radius:0; }
    .seg > .mx { position:absolute; top:-5px; height:16px; width:2px; opacity:1; border-radius:0; transform:translateX(-1px);
      background:repeating-linear-gradient(to bottom,#fff 0 2px,transparent 2px 4px); }
    .chips { display:flex; gap:6px; flex-wrap:nowrap; overflow-x:auto; scrollbar-width:none; -webkit-overflow-scrolling:touch; padding-bottom:2px; }
    .chips::-webkit-scrollbar { display:none; }
    .chips div { flex:0 0 auto; display:flex; align-items:center; gap:4px; font-size:12px; font-weight:500; padding:3px 10px 3px 6px; border-radius:14px; border:1px solid; color:var(--primary-text-color); }
    .chips div span { font-weight:400; }
    .chips ha-icon { --mdc-icon-size:16px; }
    .ich { display:block; width:18px; --mdc-icon-size:18px; color:var(--secondary-text-color); margin:2px -3px 0 auto; transition:transform .25s; }
    .r.iopen .ich, .r.aopen .ich, .r.sopen .ich { transform:rotate(180deg); }
    .pw { display:block; text-align:right; margin:3px -1px -2px 0; line-height:0; }
    .pc { display:inline-flex; color:var(--secondary-text-color); opacity:.7; }
    .pc ha-icon { --mdc-icon-size:13px; display:flex; }
    .pc .m, .r.iopen .pc .p, .r.aopen .pc .p, .r.sopen .pc .p { display:none !important; }
    .r.iopen .pc .m, .r.aopen .pc .m, .r.sopen .pc .m { display:flex !important; }
    .r > .sst { padding-top:10px; }
    .sm { flex:0 0 calc(100% - 44px); margin:0 0 0 44px; display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; }
    .r.sopen .sm { grid-template-rows:1fr; }
    .sm > div { overflow:hidden; min-height:0; }
    .sarc { display:block; width:100%; max-width:420px; height:auto; margin-top:2px; }
    .sin { display:flex; flex-wrap:wrap; gap:3px 12px; font-size:11px; line-height:1.35; color:var(--secondary-text-color); margin:2px 0 10px; }
    .sin b { font-weight:500; color:var(--primary-text-color); }
    .am { flex:0 0 calc(100% - 44px); margin:0 0 0 44px; display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; }
    .r.aopen .am { grid-template-rows:1fr; }
    .am > div { overflow:hidden; min-height:0; display:flex; gap:14px; align-items:flex-start; }
    .amap { position:relative; flex:0 0 150px; width:150px; aspect-ratio:611/790; margin:4px 0 10px; border-radius:8px; background:rgba(255,255,255,.06); overflow:hidden; }
    .amap svg { position:absolute; inset:0; width:100%; height:100%; }
    .amap .ie { position:absolute; width:6px; height:6px; margin:-3px 0 0 -3px; border-radius:50%; background:${C.green}; }
    .amap .ie::after { content:''; position:absolute; inset:-3px; border-radius:50%; border:1.5px solid ${C.green}; animation:apulse 2s ease-out infinite; }
    @keyframes apulse { 0% { transform:scale(.6); opacity:1; } 100% { transform:scale(1.8); opacity:0; } }
    .r:not(.aopen) .amap .ie::after { animation:none; }
    .amap .il { position:absolute; transform:translate(7px,-50%); font-size:10px; line-height:12px; color:#fff; text-shadow:0 0 2px #000; font-style:normal; }
    .alg { display:flex; flex-direction:column; gap:4px; padding-top:6px; font-size:11px; line-height:1.3; color:var(--secondary-text-color); min-width:0; }
    .alg b { font-weight:500; }
    .alg > span:first-child { font-size:12px; margin-bottom:4px; }
    .alg .nw { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .alg i { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; vertical-align:0; }
    .alg .ast { font-size:10px; opacity:.7; margin-top:4px; }
    .im { flex:0 0 calc(100% - 44px); margin:0 0 0 44px; display:grid; grid-template-rows:0fr; transition:grid-template-rows .3s ease; }
    .r.iopen .im { grid-template-rows:1fr; }
    .im > div { overflow:hidden; min-height:0; }
    .imap { position:relative; margin:2px 0 10px; border-radius:8px; background:rgba(255,255,255,.06); aspect-ratio:360/145; overflow:hidden; }
    .imap svg { position:absolute; inset:0; width:100%; height:100%; }
    .imap .ip { position:absolute; transform:translate(-50%,-50%); display:flex; }
    .imap .ip ha-icon { --mdc-icon-size:18px; color:#fff; filter:drop-shadow(0 0 2px #000) drop-shadow(0 0 1px #000); }
    .imap .il { position:absolute; transform:translate(7px,-50%); font-size:10px; line-height:12px; color:#fff; text-shadow:0 0 2px #000; font-style:normal; }
    .imap .ie { position:absolute; width:6px; height:6px; margin:-3px 0 0 -3px; border-radius:50%; background:${C.green}; }
    .imap .ie::after { content:''; position:absolute; inset:-3px; border-radius:50%; border:1.5px solid ${C.green}; animation:ipulse 2s ease-out infinite; }
    .r:not(.iopen) .imap .ie::after { animation:none; }
    @keyframes ipulse { 0% { transform:scale(.6); opacity:1; } 100% { transform:scale(3.2); opacity:0; } }

    @container (max-width: 400px) {
      .nm .sec { font-size:11px; }
      .tk { font-size:9px; }
      .cols { gap:12px; }
      .sx { font-size:11px; }
      .kg { font-size:9px; }
      .kg b { font-size:12px; }
      .kg .l { display:none; } .kg .s { display:inline; }
      .dot, .lg { display:none; } .dl2 { display:block; }
      .kh { font-size:9px; }
      .amap { flex-basis:128px; width:128px; } .am > div { gap:10px; } .alg { font-size:10px; } .alg > span:first-child { font-size:11px; }
      .iu, .iq { display:block; } .isep { display:none; }
    }
    @keyframes sunny { 70% { transform:rotate(360deg) scale(1); } 80% { transform:scale(1); } 90% { transform:scale(1.15); } 100% { transform:scale(1); } }
    .a-sunny { animation:sunny 1s ease-in-out infinite alternate; }
    @keyframes sparkle { 0%,69%,74%,79%,85% { clip-path:inset(0 0 0 0); } 70% { clip-path:polygon(0 100%,0 76%,75% 0,100% 0,100% 100%); } 75% { clip-path:polygon(0 100%,0 0,39% 0,100% 62%,100% 100%); } 80% { clip-path:polygon(0 100%,0 0,100% 0,100% 26%,25% 100%); } }
    @keyframes kadabra { 0%,80%,100% { transform:rotate(-10deg); } 70% { transform:rotate(10deg); } 75% { transform:rotate(5deg); } 80% { transform:rotate(15deg); } }
    .a-sock { animation:sparkle 1.8s linear infinite, kadabra 1.8s ease-in-out infinite; transform-origin:10% 90%; }
    @keyframes gusty { 0%,100% { transform:scaleX(1.2); } 30% { transform:scaleX(.9); } 45% { transform:scaleX(1.1); } 75% { transform:scaleX(.8); } }
    .a-gust { animation:gusty 3s ease-in-out infinite; transform-origin:15% 50%; }
    @keyframes cloudy { 0%,100% { transform:translateX(3px); } 30% { transform:translateX(-1px); } 45% { transform:translateX(1.5px); } 75% { transform:translateX(-3.2px); } }
    @keyframes rain { 0%,50%,100% { clip-path:inset(0 0 0 0); } 25% { clip-path:polygon(0 0,100% 0,100% 83%,54% 83%,62% 47%,47% 46%,38% 83%,0 83%); } 75% { clip-path:polygon(100% 2%,94% 91%,69% 70%,73% 61%,73% 50%,35% 44%,27% 63%,2% 76%,0 4%); } }
    .a-rain { animation:cloudy 10s ease-in-out infinite, rain 1s infinite; }
    @keyframes lightning { 10%,15% { clip-path:polygon(100% 2%,94% 91%,63% 70%,67% 56%,65% 45%,50% 44%,34% 70%,2% 76%,0 4%); transform:scale(1.1); } 10.1%,15.1% { clip-path:inset(0 0 0 0); transform:scale(1); } }
    .a-bolt { animation:cloudy 6s ease-in-out infinite, lightning 1.5s infinite; }
    @keyframes arrowUp { 0% { transform:translateY(6px); opacity:0; } 50% { opacity:1; } 100% { transform:translateY(0); opacity:1; } }
    @keyframes arrowDown { 0% { transform:translateY(-6px); opacity:0; } 50% { opacity:1; } 100% { transform:translateY(0); opacity:1; } }
    .a-up { animation:arrowUp 1.2s ease-in-out infinite; }
    .a-down { animation:arrowDown 1.2s ease-in-out infinite; }
    @keyframes focus { 50% { filter:blur(10px); } }
    .a-f2 { animation:focus 2s linear infinite alternate; }
    .a-f3 { animation:focus 3s linear infinite alternate; }
    .a-f4 { animation:focus 4s linear infinite alternate; }
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
  const fmt = (v, d = 1) => num(v).toFixed(d).replace('.', ',');
  const hhmm = (dt) => String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
  const ico = (icon, cls = '', col = '') => `<ha-icon icon="${icon}"${cls ? ` class="${cls}"` : ''}${col ? ` style="color:${col}"` : ''}></ha-icon>`;
  const rel = (d) => { if (!d) return ''; const m = Math.round((Date.now() - d) / 60000); return m < 1 ? 'Gerade eben' : m < 60 ? `Vor ${m} Minute${m === 1 ? '' : 'n'}` : m < 1440 ? `Vor ${Math.round(m / 60)} Stunde${Math.round(m / 60) === 1 ? '' : 'n'}` : `Vor ${Math.round(m / 1440)} Tag${Math.round(m / 1440) === 1 ? '' : 'en'}`; };

  class WetterstationListeCard extends HTMLElement {
    setConfig(c) {
      this._c = c || {};
      this._e = Object.assign({}, DEF, this._c.entities || {});
      this._sig = '';
      try { this._open = JSON.parse(localStorage.getItem('wslc-open') || 'null') || {}; } catch (e) { this._open = {}; }
      // letzte History-Werte sofort zeigen (kein Nachrutschen beim Laden), werden danach frisch geholt
      try { const h = JSON.parse(localStorage.getItem('wslc-hist') || 'null'); if (h && Date.now() - h.t < 1800000) { this._d3 = h.d3; this._p12 = h.p12; if (h.pm) this._pmax = { v: h.pm.v, t: new Date(h.pm.t) }; if (h.um) this._uvmax = { v: h.um.v, t: new Date(h.um.t) }; } } catch (e) {}
    }
    getCardSize() { return 14; }
    getGridOptions() { return { columns: 12, rows: 'auto' }; }
    connectedCallback() { this._iv = setInterval(() => { this._sig = ''; this._render(); }, 60000); this._iv2 = setInterval(() => this._issTick(), 2000); this._loadLand(); this._loadDE(); }
    disconnectedCallback() { clearInterval(this._iv); clearInterval(this._iv2); }
    set hass(h) { this._hass = h; this._hist(); this._loadAur(); this._render(); }

    _s(k) { const id = this._e[k]; return id ? this._hass.states[id] : undefined; }
    _v(k) { const s = this._s(k); return s ? s.state : ''; }
    _a(k, a) { const s = this._s(k); return s && s.attributes ? s.attributes[a] : undefined; }
    _u(k) { return this._a(k, 'unit_of_measurement') || ''; }

    _render() {
      const H = this._hass; if (!H || !this._c) return;
      const ids = Object.values(this._e).filter(Boolean).concat(POLLEN.map((p) => p[0]));
      const sig = ids.map((id) => { const s = H.states[id]; return s ? s.state + '|' + (s.last_changed || '') : '-'; }).join(';') + '|' + new Date().getMinutes();
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
      } catch (e) {
        console.error(TAG, e);
        (this.shadowRoot || this.attachShadow({ mode: 'open' })).innerHTML = `<ha-card style="padding:12px;color:#ff453a">${TAG} Fehler: ${esc(e && e.message || e)}</ha-card>`;
      }
    }

    _click(ev) {
      const fh = ev.target.closest('.fh');
      if (fh) {
        const f = fh.parentElement; f.classList.toggle('closed');
        this._open[f.dataset.id] = f.classList.contains('closed') ? 'zu' : 'auf';
        try { localStorage.setItem('wslc-open', JSON.stringify(this._open)); } catch (e) {}
        return;
      }
      const su = ev.target.closest('[data-sun]');
      if (su) { const o = su.classList.contains('sopen'); su.classList.toggle('sopen', !o); this._sunMan = !o;
        try { localStorage.setItem('wslc-sun', !o ? '1' : '0'); } catch (e) {} this._sig = ''; this._render(); return; }
      const it = ev.target.closest('[data-iss]');
      if (it) { const o = it.classList.contains('iopen'); it.classList.toggle('iopen', !o); this._issMan = { open: !o, key: this._issKey(), soon: !!this._issSoon };
        try { localStorage.setItem('wslc-iss', JSON.stringify(this._issMan)); } catch (e) {} this._sig = ''; this._render(); return; }
      if (ev.target.closest('[data-aurcam]')) { const cam = this._e.aurora_camera; if (cam && this._hass.services.browser_mod) this._hass.callService('browser_mod', 'more_info', { entity: cam, large: false, ignore_popup_card: false }); else this._more(cam); return; }
      const ar = ev.target.closest('[data-aurora]');
      if (ar && this._de) { const o = ar.classList.contains('aopen'); ar.classList.toggle('aopen', !o); this._aurMan = { open: !o, auto: !!this._aurAuto };
        try { localStorage.setItem('wslc-aur', JSON.stringify(this._aurMan)); } catch (e) {} this._sig = ''; this._render(); return; }
      const t = ev.target.closest('[data-more],[data-aurora]'); if (!t) return;
      if (t.dataset.aurora) {
        const cam = this._e.aurora_camera;
        if (cam && this._hass.services.browser_mod) this._hass.callService('browser_mod', 'more_info', { entity: cam, large: false, ignore_popup_card: false });
        else this._more(this._e.aurora);
        return;
      }
      this._more(t.dataset.more);
    }
    _more(id) { if (id) this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: id }, bubbles: true, composed: true })); }

    /* Mini-Skala rechts: Wert oben, Stufenbalken darunter */
    _mini(valHtml, { min, max, zones, value, maxValue, activeOnly, ticks }) {
      const span = max - min, pct = (v) => Math.max(0, Math.min(100, (v - min) / span * 100)), pos = (v) => Math.max(1, Math.min(99, pct(v)));
      let prev = min;
      let p0 = min; const G = 'linear-gradient(90deg,' + zones.map((z) => { const a = (p0 - min) / span * 100, b = (Math.min(z.to, max) - min) / span * 100; p0 = z.to; return `${z.c} ${((a + b) / 2).toFixed(1)}%`; }).join(',') + ')';
      const gs = (s, w) => `background-image:${G};background-size:${(10000 / Math.max(w, 0.1)).toFixed(1)}% 100%;background-position:${w >= 99.9 ? 0 : (s / (100 - w) * 100).toFixed(2)}% 0`;
      const segs = zones.map((z, i) => {
        const w = (Math.min(z.to, max) - prev) / span * 100, s0 = (prev - min) / span * 100;
        const on = activeOnly ? (value >= prev && (value < z.to || i === zones.length - 1)) && activeOnly !== 'none' : (i === 0 || value > prev);
        prev = z.to;
        return `<div class="${on ? 'on' : ''}${activeOnly ? ' pz' : ''}" style="flex:0 0 calc(${w.toFixed(2)}% - 3px);${gs(s0, w)}"></div>`;
      }).join('');
      return `<div class="st">${valHtml}</div>` + this._bar(`${segs}${maxValue != null ? `<div class="mx" style="left:${pct(maxValue)}%"></div>` : ''}<i class="tri" style="left:${pos(value)}%"></i>`, ticks ? ticks.map(([v, t, col]) => [pct(v), t, col]) : null);
    }
    _bar(segHtml, ticks) {
      const two = ticks && ticks.some(([, t]) => String(t).includes('<br>'));
      const tk = ticks ? `<div class="tk${two ? ' two' : ''}">${ticks.map(([x, t, col]) => `<span style="${x >= 97 ? 'right:0;text-align:right' : `left:${x}%`};${col ? `color:${col}` : ''}">${t}</span>`).join('')}</div>` : '';
      return `<div class="bar"><div class="seg">${segHtml}</div>${tk}</div>`;
    }
    _row(ent, badge, name, right, extra = '') {
      const si = name.indexOf('<span class="sec">');
      if (si > 0 && ent !== 'iss' && right.startsWith('<div class="st"') && badge.startsWith('<ha-icon')) {
        const e = right.indexOf('</div>') + 6, sec = name.slice(si + 18, name.lastIndexOf('</span>'));
        name = name.slice(0, si); right = right.slice(0, e) + `<div class="sx">${sec}</div>` + right.slice(e);
      }
      const top = name.includes('class="sec"');
      return `<div class="r${top ? ' top' : ''}${top && badge.startsWith('<ha-icon') ? ' ti' : ''}" ${ent === 'aurora' ? 'data-aurora="1"' : ent === 'iss' ? 'data-iss="1"' : `data-more="${esc(ent)}"`}${extra}><div class="bd">${badge}</div><div class="nm">${name}</div>${right}</div>`;
    }
    _fold(id, label, rows) {
      return `<div class="fold${this._open[id] === 'zu' ? ' closed' : ''}" data-id="${id}"><div class="fh"><span class="ft">${ico(({ himmel: 'mdi:weather-night', klima: 'mdi:thermometer', niederschlag: 'mdi:weather-rainy', blitze: 'mdi:weather-lightning', wind: 'mdi:weather-windy' })[id] || 'mdi:circle-small')}</span><span class="lbl">${label}</span><span class="fx"></span></div>
        <div class="fb"><div class="fi">${rows}</div></div></div>`;
    }
    _ring(pct, color) {
      const r = 15, c = 2 * Math.PI * r;
      return `<svg width="38" height="38" viewBox="0 0 38 38" style="flex:0 0 38px"><circle cx="19" cy="19" r="${r}" fill="none" stroke="rgba(128,128,128,.3)" stroke-width="4"/>
        <circle cx="19" cy="19" r="${r}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${c * Math.max(0, Math.min(100, pct)) / 100} ${c}" transform="rotate(-90 19 19)"/>
        <text x="19" y="22.5" text-anchor="middle" fill="var(--primary-text-color)" font-size="10" font-weight="600">${Math.round(pct)}%</text></svg>`;
    }
    async _hist() {
      if (!this._hass || this._histBusy || Date.now() - (this._histAt || 0) < 600000) return;
      this._histBusy = true; this._histAt = Date.now();
      const ids = [this._e.temp_main, this._e.pressure, this._e.pegel, this._e.uv].filter(Boolean);
      const mid = new Date(); mid.setHours(0, 0, 0, 0);
      try {
        const r = await this._hass.callWS({ type: 'history/history_during_period', start_time: new Date(Math.min(mid, Date.now() - 12 * 3600000)).toISOString(),
          entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
        const d = {};
        ids.forEach((id) => {
          const rows = ((r && r[id]) || []).map((x) => [x.lu * 1000, parseFloat(x.s)]).filter((x) => !isNaN(x[1]));
          const cur = parseFloat(this._hass.states[id] && this._hass.states[id].state);
          const h = id === this._e.pressure ? 3 : 1, cut = Date.now() - h * 3600000;
          let ref = null; rows.forEach(([t, v]) => { if (t <= cut || ref == null) ref = v; });
          if (ref != null && !isNaN(cur)) d[id] = { d: cur - ref, h };
          if (id === this._e.pressure && !isNaN(cur)) { const c12 = Date.now() - 12 * 3600000; let r12 = null; rows.forEach(([t, v]) => { if (t <= c12 || r12 == null) r12 = v; }); if (r12 != null) this._p12 = cur - r12; }
          if (id === this._e.pegel) {
            let mx = null, mt = null; rows.concat(isNaN(cur) ? [] : [[Date.now(), cur]]).forEach(([t, v]) => { if (t >= +mid && (mx == null || v > mx)) { mx = v; mt = t; } });
            if (mx != null) this._pmax = { v: mx, t: new Date(mt) };
          }
          if (id === this._e.uv) {
            // Tatsaechliches Tagesmaximum: hoechste Stufe, die mindestens 5 Minuten am Stueck gehalten wurde (kurze Spruenge bei Sonnenluecken zaehlen nicht)
            const seg = rows.filter(([t]) => t >= +mid - 86400000).map(([t, v], k, a) => [Math.max(t, +mid), k + 1 < a.length ? a[k + 1][0] : Date.now(), v]).filter(([a, b]) => b > a);
            let um = null;
            for (let L = 12; L >= 1 && !um; L--) {
              let st = null;
              for (const [a, b, v] of seg) { if (v >= L) { if (st == null) st = a; if (b - st >= 300000) { um = { v: L, t: new Date(st) }; break; } } else st = null; }
            }
            this._uvmax = um || { v: 0, t: null };
          }
        });
        this._d3 = d; this._sig = ''; this._render();
        try { localStorage.setItem('wslc-hist', JSON.stringify({ t: Date.now(), d3: d, p12: this._p12, pm: this._pmax ? { v: this._pmax.v, t: +this._pmax.t } : null, um: this._uvmax ? { v: this._uvmax.v, t: +this._uvmax.t } : null })); } catch (e) {}
      } catch (e) { /* History nicht verfuegbar */ }
      this._histBusy = false;
    }
    /* ---------- ISS-Weltkarte ---------- */
    async _loadLand() {
      if (this._land || this._landBusy) return;
      try { const c = localStorage.getItem('wslc-land1'); if (c) { this._setLand(JSON.parse(c)); return; } } catch (e) {}
      this._landBusy = true;
      try {
        const topo = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json')).json();
        const { scale: k, translate: tr } = topo.transform;
        const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [+(x * k[0] + tr[0]).toFixed(2), +(y * k[1] + tr[1]).toFixed(2)]; }); });
        const arc = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
        const ring = (r) => r.reduce((pts, i, n) => pts.concat(n ? arc(i).slice(1) : arc(i)), []);
        const polys = [];
        (topo.objects.land.geometries || [topo.objects.land]).forEach((g) => { if (g.type === 'Polygon') polys.push(ring(g.arcs[0])); if (g.type === 'MultiPolygon') g.arcs.forEach((pp) => polys.push(ring(pp[0]))); });
        try { localStorage.setItem('wslc-land1', JSON.stringify(polys)); } catch (e) {}
        this._setLand(polys);
      } catch (e) { /* keine Karte verfuegbar */ }
      this._landBusy = false;
    }
    _setLand(polys) {
      this._land = polys;
      this._landPath = polys.map((r) => 'M' + r.map(([x, y]) => `${(x + 180).toFixed(1)},${(90 - y).toFixed(1)}`).join('L') + 'Z').join('');
      this._sig = ''; this._render();
    }
    _onLand(lon, lat) {
      return (this._land || []).some((r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) c = !c; } return c; });
    }
    _region(lon, lat) {
      if (lat < -60) return this._onLand(lon, lat) ? 'der Antarktis' : 'dem Südpolarmeer';
      if (this._land && this._onLand(lon, lat)) {
        if (lon >= -170 && lon <= -50 && lat >= 7) return 'Nordamerika';
        if (lon >= -92 && lon <= -30 && lat < 13) return 'Südamerika';
        if (lon >= -25 && lon <= 45 && lat >= 36) return 'Europa';
        if (lon >= -20 && lon <= 52 && lat < 37) return 'Afrika';
        if (lon >= 110 && lon <= 180 && lat < -10) return 'Australien';
        return 'Asien';
      }
      if (lat > 66) return 'dem Nordpolarmeer';
      if (lat >= 30 && lat <= 46 && lon >= -5 && lon <= 36) return 'dem Mittelmeer';
      const atl = lat >= 10 ? (lon >= -100 && lon <= 0) || (lon > 0 && lon <= 20 && lat < 60) || (lon > -10 && lon <= 30 && lat >= 60) : lon >= -70 && lon <= 20;
      if (atl) return 'dem Atlantik';
      if (lon > 20 && lon <= 120 && lat < 30) return 'dem Indischen Ozean';
      return 'dem Pazifik';
    }
    /* ---------- Polarlicht-Deutschlandkarte (Daten: Theusner-Bild ueber camera.aurora_mtwetter_de) ---------- */
    // Kartenausschnitt (Grad) und Umrechnung in SVG-Koordinaten (laengentreu skaliert mit cos 51 Grad)
    static get AB() { return { lo0: 5.6, lo1: 15.3, la0: 47.2, la1: 55.1, k: 63 }; }
    async _loadDE() {
      if (this._de || this._deBusy) return;
      try { const c = localStorage.getItem('wslc-de1'); if (c) { this._de = JSON.parse(c); this._sig = ''; this._render(); return; } } catch (e) {}
      this._deBusy = true;
      try {
        const topo = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')).json();
        const { scale: k, translate: tr } = topo.transform, B = WetterstationListeCard.AB;
        const arcs = topo.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [+(x * k[0] + tr[0]).toFixed(3), +(y * k[1] + tr[1]).toFixed(3)]; }); });
        const arc = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
        const ring = (r) => r.reduce((pts, i, n) => pts.concat(n ? arc(i).slice(1) : arc(i)), []);
        const near = (r) => r.some(([x, y]) => x > B.lo0 - 3 && x < B.lo1 + 3 && y > B.la0 - 3 && y < B.la1 + 3);
        const de = [], nb = [];
        topo.objects.countries.geometries.forEach((g) => {
          const polys = g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : [];
          polys.forEach((pp) => { const r = ring(pp[0]); if (!near(r)) return; (String(g.id) === '276' ? de : nb).push(r); });
        });
        this._de = { de, nb };
        try { localStorage.setItem('wslc-de1', JSON.stringify(this._de)); } catch (e) {}
        this._sig = ''; this._render();
      } catch (e) { /* keine Umrisse verfuegbar */ }
      this._deBusy = false;
    }
    // Theusner-Bild laden und je Kartenzelle die Helligkeitsklasse auslesen (0 keine, 1 fotografisch, 2 schwach, 3 deutlich, 4 hell)
    async _loadAur() {
      const s = this._s('aurora_camera'), url = s && s.attributes.entity_picture;
      if (!url || this._aurBusy || (this._aurUrl === url && Date.now() - (this._aurAt || 0) < 600000)) return;
      if (Date.now() - (this._aurAt || 0) < 240000 && this._aurGrid) return;
      this._aurBusy = true; this._aurUrl = url;
      try {
        const bmp = await createImageBitmap(await (await fetch(url)).blob());
        const cv = document.createElement('canvas'); cv.width = bmp.width; cv.height = bmp.height;
        const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0);
        const W = bmp.width, H = bmp.height, px = cx.getImageData(0, 0, W, H).data, f = W / 768;
        const REF = [[248, 181, 0, 1], [120, 193, 33, 1], [255, 70, 0, 3], [132, 0, 71, 4], [248, 181, 0, 2]];
        // Theusner-Farben: gruen = fotografisch, gelb = schwach, orange = deutlich, weinrot = hell
        const CLS = [[120, 193, 33, 1], [248, 181, 0, 2], [255, 70, 0, 3], [132, 0, 71, 4]];
        const at = (x, y) => { x = Math.round(x * f); y = Math.round(y * f); if (x < 0 || y < 0 || x >= W || y >= H) return 0;
          if ((x < 152 * f && y < 342 * f) || y < 58 * f || y > 1012 * f) return 0;
          const i = (y * W + x) * 4, r = px[i], g = px[i + 1], b = px[i + 2]; if (Math.abs(r - g) < 14 && Math.abs(g - b) < 14) return 0;
          let best = 0, bd = 4000; CLS.forEach(([R, G, B2, c]) => { const d = (r - R) ** 2 + (g - G) ** 2 + (b - B2) ** 2; if (d < bd) { bd = d; best = c; } }); return best; };
        // Bild-Projektion (aus Grenzlinien eingemessen): x = 205 + (lon - 7,6) * 59,1 ; y = 443 + (52,5 - lat) * 98,4
        const ix = (lo) => 205 + (lo - 7.6) * 59.1, iy = (la) => 443 + (52.5 - la) * 98.4;
        const B = WetterstationListeCard.AB, GW = 97, GH = 132, grid = new Uint8Array(GW * GH);
        for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
          const lo = B.lo0 + (i + 0.5) / GW * (B.lo1 - B.lo0), la = B.la1 - (j + 0.5) / GH * (B.la1 - B.la0);
          const x = ix(lo), y = iy(la); let m = 0;
          for (let dy = -2; dy <= 2; dy += 2) for (let dx = -2; dx <= 2; dx += 2) { const c = at(x + dx, y + dy); if (c > m) m = c; }
          grid[j * GW + i] = m;
        }
        this._aurGrid = { grid, GW, GH }; this._aurAt = Date.now();
        const H2 = this._hass, el = H2.config && H2.config.latitude != null ? H2.config.latitude : 50.3, eo = H2.config && H2.config.longitude != null ? H2.config.longitude : 9.45;
        let me = 0; for (let dy = -3; dy <= 3; dy += 3) for (let dx = -3; dx <= 3; dx += 3) me = Math.max(me, at(ix(eo) + dx, iy(el) + dy));
        let top = 0; grid.forEach((c, n) => { if (c > top) { const i = n % GW, j = (n - i) / GW; if (this._inDE(B.lo0 + (i + 0.5) / GW * (B.lo1 - B.lo0), B.la1 - (j + 0.5) / GH * (B.la1 - B.la0))) top = c; } });
        this._aurElm = me; this._aurTop = top;
        // Farbflaeche als kleines Bild (wird in der Karte weich hochskaliert)
        const oc = document.createElement('canvas'); oc.width = GW; oc.height = GH; const o = oc.getContext('2d'), od = o.createImageData(GW, GH);
        const COL = [null, [255, 214, 10, 255], [48, 209, 88, 255], [191, 90, 242, 150], [191, 90, 242, 255]];
        grid.forEach((c, n) => { if (!c) return; const q = COL[c]; od.data.set(q, n * 4); });
        o.putImageData(od, 0, 0); this._aurImg = oc.toDataURL();
        this._sig = ''; this._render();
      } catch (e) { /* Bild nicht lesbar */ }
      this._aurBusy = false;
    }
    _inDE(lo, la) {
      return ((this._de && this._de.de) || []).some((r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > la) !== (yj > la) && lo < (xj - xi) * (la - yi) / (yj - yi) + xi) c = !c; } return c; });
    }
    _aurOpen() {
      const auto = (this._aurElm || 0) > 0;
      if (this._aurMan === undefined) { try { this._aurMan = JSON.parse(localStorage.getItem('wslc-aur') || 'null'); } catch (e) { this._aurMan = null; } }
      const m = this._aurMan; this._aurAuto = auto;
      // automatisch offen, sobald bei dir (Elm) laut Theusner etwas sichtbar ist, ausser du hast es in dieser Lage selbst zugeklappt
      if (auto) return m && m.auto ? m.open : true;
      return !!(m && !m.auto && m.open);
    }
    _aurMap() {
      if (!this._de) return '';
      const B = WetterstationListeCard.AB, X = (lo) => ((lo - B.lo0) * B.k).toFixed(1), Y = (la) => ((B.la1 - la) * 100).toFixed(1);
      const VW = Math.round((B.lo1 - B.lo0) * B.k), VH = Math.round((B.la1 - B.la0) * 100);
      const P = (r) => 'M' + r.map(([x, y]) => `${X(x)},${Y(y)}`).join('L') + 'Z';
      const de = this._de.de.map(P).join(''), nb = this._de.nb.map(P).join('');
      const H = this._hass, el = H.config && H.config.latitude != null ? H.config.latitude : 50.3, eo = H.config && H.config.longitude != null ? H.config.longitude : 9.45;
      const img = this._aurImg ? `<image href="${this._aurImg}" x="0" y="0" width="${VW}" height="${VH}" preserveAspectRatio="none"/>` : '';
      const NM = ['nicht sichtbar', 'fotografisch', 'schwach sichtbar', 'deutlich sichtbar', 'hell'], NC = ['', C.yellow, C.green, C.purple, C.purple];
      const me = this._aurElm || 0, t = this._aurAt ? hhmm(new Date(this._aurAt)) : '';
      return `<div class="am"><div><div class="amap" data-aurcam="1"><svg viewBox="0 0 ${VW} ${VH}">
        <defs><clipPath id="wdeclip"><path d="${de}"/></clipPath></defs>
        <path d="${nb}" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.18)" stroke-width="1" vector-effect="non-scaling-stroke"/>
        <g opacity=".1">${img}</g><g clip-path="url(#wdeclip)" opacity=".32">${img}</g>
        <path d="${de}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
        <i class="ie" style="left:${(X(eo) / VW * 100).toFixed(2)}%;top:${(Y(el) / VH * 100).toFixed(2)}%"></i><i class="il" style="left:${(X(eo) / VW * 100).toFixed(2)}%;top:${(Y(el) / VH * 100).toFixed(2)}%">Elm</i></div>
        <div class="alg"><span>Bei dir: <b style="color:${NC[me] || 'var(--primary-text-color)'}">${NM[me]}</b></span>
        <span class="nw"><i style="background:${C.yellow}"></i>fotografisch</span><span class="nw"><i style="background:${C.green}"></i>schwach</span><span class="nw"><i style="background:${C.purple};opacity:.6"></i>deutlich</span><span class="nw"><i style="background:${C.purple}"></i>hell</span>
        <span class="ast">Theusner${t ? ' · ' + t : ''}</span></div></div></div>`;
    }
    /* ---------- Sonnenbogen (aufklappbar unter 'Sonne') ---------- */
    _sunEl(ms) {
      const r = Math.PI / 180, H = this._hass, la = (H.config && H.config.latitude != null ? H.config.latitude : 50.3) * r, lo = H.config && H.config.longitude != null ? H.config.longitude : 9.45;
      const s = this._sun(ms);
      return Math.asin(Math.sin(la) * Math.sin(s.lat * r) + Math.cos(la) * Math.cos(s.lat * r) * Math.cos((lo - s.lon) * r)) / r;
    }
    _sunOpen() {
      if (this._sunMan === undefined) { try { this._sunMan = localStorage.getItem('wslc-sun') === '1'; } catch (e) { this._sunMan = false; } }
      return this._sunMan;
    }
    _sunArc() {
      const now = Date.now(), m0 = new Date(); m0.setHours(0, 0, 0, 0); const t0 = +m0, DAY = 86400000, N = 288;
      const pts = []; for (let i = 0; i <= N; i++) { const t = t0 + i * DAY / N; pts.push([t, this._sunEl(t)]); }
      let emax = -90, tn = t0; pts.forEach(([t, e]) => { if (e > emax) { emax = e; tn = t; } });
      if (emax <= 1) return '';
      // Uhrzeit, zu der die Sonnenhoehe die Schwelle a kreuzt (auf = morgens steigend, sonst abends fallend)
      const cross = (a, up) => { for (let i = 0; i < N; i++) { const [ta, ea] = pts[i], [tb, eb] = pts[i + 1]; if (up ? ea < a && eb >= a : ea >= a && eb < a) return ta + (a - ea) / (eb - ea) * (tb - ta); } return null; };
      const rise = cross(-0.833, true), set = cross(-0.833, false), g1 = cross(6, true), g2 = cross(6, false), b0 = cross(-6, true), b1 = cross(-4, true), b2 = cross(-4, false), b3 = cross(-6, false);
      if ([rise, set, g1, g2, b0, b1, b2, b3].some((v) => v == null)) return '';
      const W = 300, y0 = 56, X = (t) => ((t - t0) / DAY * W), ys = (e) => y0 - e / emax * 44, Y = (e) => (e >= 0 ? ys(e) : Math.min(84, y0 - e / 70 * 26)), f = (v) => v.toFixed(1);
      const d = pts.map(([t, e], i) => (i ? 'L' : 'M') + f(X(t)) + ',' + f(Y(e))).join('');
      const o = (t) => Math.max(0, Math.min(100, (t - t0) / DAY * 100)).toFixed(2) + '%', HR = 3600000;
      const st = [[b0 - 0.4 * HR, '#48484a'], [b0, C.blue], [b1, C.blue], [(b1 + rise) / 2, C.orange], [g1, C.orange], [g1 + 0.6 * HR, C.yellow], [g2 - 0.6 * HR, C.yellow], [g2, C.orange], [(set + b2) / 2, C.orange], [b2, C.blue], [b3, C.blue], [b3 + 0.4 * HR, '#48484a']];
      const T = (t) => hhmm(new Date(t)), en = this._sunEl(now), tx = 'font-size="9" fill="rgba(235,235,245,.6)" text-anchor="middle"';
      const dur = (ms) => { const m = Math.round(ms / 60000); return `${Math.floor(m / 60)} h ${m % 60} min`; };
      const rest = now >= rise && now < set ? `noch <b>${dur(set - now)}</b> hell` : `hell in <b>${dur((now < rise ? rise : rise + DAY) - now)}</b>`;
      return `<div class="sm"><div><svg class="sarc" viewBox="0 0 ${W} 88"><defs><linearGradient id="wsunv" gradientUnits="userSpaceOnUse" x1="0" x2="${W}" y1="0" y2="0">${st.map(([t, c]) => `<stop offset="${o(t)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>
        <line x1="0" x2="${W}" y1="${y0}" y2="${y0}" stroke="rgba(255,255,255,.3)" stroke-width=".6"/>
        <path d="${d}" fill="none" stroke="url(#wsunv)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="${f(X(rise))}" y="${y0 + 11}" ${tx}>${T(rise)}</text><text x="${f(X(set))}" y="${y0 + 11}" ${tx}>${T(set)}</text><text x="${f(X(tn))}" y="${f(ys(emax) - 5)}" ${tx}>${Math.round(emax)}°</text>
        <circle cx="${f(X(now))}" cy="${f(Y(en))}" r="4" fill="${en > 0 ? C.yellow : C.gray}" stroke="var(--ha-card-background, var(--card-background-color, #1c1c1e))" stroke-width="1.5"/></svg>
        <div class="sin"><span>${rest}</span><span class="nw" style="color:${C.orange}">Goldene Stunde ${T(b1)}–${T(g1)} · ${T(g2)}–${T(b2)}</span><span class="nw" style="color:#64a8ff">Blaue Stunde ${T(b0)}–${T(b1)} · ${T(b2)}–${T(b3)}</span></div></div></div>`;
    }
    _issKey() { return String(this._a('iss_pass', 'pass_start_unix') || ''); }
    _issOpen() {
      const s0 = +this._a('iss_pass', 'pass_start_unix') || 0, s1 = +this._a('iss_pass', 'pass_end_unix') || 0, now = Date.now() / 1000;
      const soon = (s0 && now >= s0 - 1800 && now <= (s1 || s0 + 900)) || this._v('iss_warning') === 'on';
      if (this._issMan === undefined) { try { this._issMan = JSON.parse(localStorage.getItem('wslc-iss') || 'null'); } catch (e) { this._issMan = null; } }
      const m = this._issMan; this._issSoon = soon;
      // im Ueberflug-Fenster automatisch offen, ausser du hast es in diesem Fenster selbst zugeklappt
      if (soon) return m && m.soon && m.key === this._issKey() ? m.open : true;
      return !!(m && !m.soon && m.open);
    }
    // Bahnmodell ab der letzten gemeldeten Position: liefert Position t Minuten spaeter (ISS laeuft live weiter, auch zwischen den Updates)
    _issModel() {
      const s = this._s('iss_pos'); if (!s) return null;
      const lat = num(s.attributes.latitude), lon = num(s.attributes.longitude), t0 = new Date(s.last_updated || Date.now()).getTime();
      if (!this._issLast || this._issLast.lat !== lat) {
        let prev = this._issLast; if (!prev) { try { prev = JSON.parse(localStorage.getItem('wslc-issl') || 'null'); } catch (e) { prev = null; } }
        if (prev && prev.lat !== lat && t0 - prev.t < 600000 && t0 > prev.t) this._issAsc = lat > prev.lat;
        this._issLast = { lat, lon, t: t0 }; try { localStorage.setItem('wslc-issl', JSON.stringify(this._issLast)); } catch (e) {}
      }
      const asc = this._issAsc !== undefined ? this._issAsc : true;
      const inc = 51.64 * Math.PI / 180, P = 92.7, rot = 360 / 1436, sl = Math.max(-1, Math.min(1, Math.sin(lat * Math.PI / 180) / Math.sin(inc)));
      const u0 = asc ? Math.asin(sl) : Math.PI - Math.asin(sl);
      const n0 = lon - Math.atan2(Math.cos(inc) * Math.sin(u0), Math.cos(u0)) * 180 / Math.PI;
      const pt = (t) => { const u = u0 + 2 * Math.PI * t / P; const la = Math.asin(Math.sin(inc) * Math.sin(u)) * 180 / Math.PI; let lo = n0 + Math.atan2(Math.cos(inc) * Math.sin(u), Math.cos(u)) * 180 / Math.PI - rot * t; lo = ((lo + 540) % 360 + 360) % 360 - 180; return [lo, la]; };
      return { pt, dt: Math.max(0, Math.min(15, (Date.now() - t0) / 60000)) };
    }
    // Sonnenstand: Bildpunkt der Sonne (Breite = Deklination, Laenge aus UTC + Zeitgleichung)
    _sun(now = Date.now()) {
      const r = Math.PI / 180, d = now / 86400000 - 10957.5;
      const g = (357.529 + 0.98560028 * d) * r, q = 280.459 + 0.98564736 * d, L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * r, e = (23.439 - 3.6e-7 * d) * r;
      const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / r, dec = Math.asin(Math.sin(e) * Math.sin(L)) / r;
      const eot = ((q - ra) % 360 + 540) % 360 - 180, ut = (now % 86400000) / 3600000;
      return { lat: dec, lon: ((-15 * (ut - 12) - eot) % 360 + 540) % 360 - 180 };
    }
    // Warum (nicht) sichtbar: Erdschatten, bei dir zu hell, zu weit weg, oder jetzt sichtbar mit Blickrichtung
    _issWhy(lo, la) {
      const r = Math.PI / 180, s = this._sun(), H = this._hass, elat = H.config && H.config.latitude != null ? H.config.latitude : 50.3, elon = H.config && H.config.longitude != null ? H.config.longitude : 9.45;
      const ca = (a1, o1, a2, o2) => Math.acos(Math.max(-1, Math.min(1, Math.sin(a1 * r) * Math.sin(a2 * r) + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.cos((o1 - o2) * r)))) / r;
      const by = Math.sin((lo - elon) * r) * Math.cos(la * r), bx = Math.cos(elat * r) * Math.sin(la * r) - Math.sin(elat * r) * Math.cos(la * r) * Math.cos((lo - elon) * r);
      const dir = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'][Math.round(((Math.atan2(by, bx) / r + 360) % 360) / 45) % 8];
      const s0 = +this._a('iss_pass', 'pass_start_unix') || 0, s1 = +this._a('iss_pass', 'pass_end_unix') || 0, now = Date.now() / 1000;
      // sichtbar nur, wenn der Ueberflug-Sensor es sagt (die Integration schiebt den Start waehrend des Ueberflugs jede Minute weiter)
      if (/^ISS am Himmel/.test(this._v('iss')) || (s0 && now >= s0 - 60 && now <= s1)) return { t: 'jetzt sichtbar – Blick nach ' + dir, c: C.yellow };
      if (ca(la, lo, s.lat, s.lon) > 110) return { t: 'im Erdschatten' };
      if (90 - ca(elat, elon, s.lat, s.lon) > -3) return { t: 'im Tageslicht' };
      if (ca(elat, elon, la, lo) > 14) return { t: 'zu weit weg' };
      return { t: 'zu tief am Horizont' };
    }
    _issTick() {
      const r = this.shadowRoot, ip = r && r.querySelector('.imap .ip'), w = r && r.querySelector('.iw'); if (!ip && !w) return;
      const m = this._issModel(); if (!m) return; const [lo, la] = m.pt(m.dt);
      // nur bewegen, wenn die Karte offen ist, und nur bei echter Aenderung (spart Neuberechnungen, kein Ruckeln anderer Animationen)
      if (ip && ip.closest('.r.iopen')) { const L = ((lo + 180) / 360 * 100).toFixed(1) + '%', T = ((90 - la - 10) / 145 * 100).toFixed(1) + '%'; if (ip.style.left !== L) ip.style.left = L; if (ip.style.top !== T) ip.style.top = T; }
      if (w) { const t = 'gerade über ' + this._region(lo, la); if (w.textContent !== t) w.textContent = t; }
      const wq = r && r.querySelector('.iq'); if (wq) { const q = this._issWhy(lo, la); if (wq.textContent !== q.t) wq.textContent = q.t; if ((wq.dataset.c || '') !== (q.c || '')) { wq.dataset.c = q.c || ''; wq.style.color = q.c || ''; } }
    }
    _issMap() {
      const M = this._issModel(); if (!M) return { html: '', where: '' };
      const [lon, lat] = M.pt(M.dt);
      if (!this._landPath) return { html: '', where: this._region(lon, lat), lo: lon, la: lat };
      // Bodenspur: ein voller Umlauf (92,7 min, halb Vergangenheit, halb Zukunft), Bahnneigung 51,6 Grad.
      // Am Kartenrand (Datumsgrenze) wird bis genau an den Rand weitergezeichnet und auf der anderen Seite fortgesetzt -> keine Luecken.
      const pt = (t) => M.pt(M.dt + t), HP = 92.7 / 2;
      const X = (lo) => (lo + 180).toFixed(1), Y = (la) => (90 - la).toFixed(1);
      const segs = []; let cur = '', prev = null;
      for (let t = -HP; t <= HP + 1e-6; t += 0.5) {
        const [lo, la] = pt(t);
        if (prev && Math.abs(lo - prev[0]) > 180) {
          const edge = prev[0] > 0 ? 180 : -180, lo2 = lo + (prev[0] > 0 ? 360 : -360), f = (edge - prev[0]) / (lo2 - prev[0]), lae = prev[1] + f * (la - prev[1]);
          cur += `L${X(edge)},${Y(lae)}`; segs.push(cur); cur = `M${X(-edge)},${Y(lae)}`;
        }
        cur += (cur ? 'L' : 'M') + `${X(lo)},${Y(la)}`; prev = [lo, la];
      }
      segs.push(cur);
      const H = this._hass, elat = H.config ? H.config.latitude : 50.3, elon = H.config ? H.config.longitude : 9.45;
      const px = (lo) => ((lo + 180) / 360 * 100).toFixed(2), py = (la) => ((90 - la - 10) / 145 * 100).toFixed(2);
      const sn = this._sun(), dc = Math.abs(sn.lat) < 0.5 ? (sn.lat < 0 ? -0.5 : 0.5) : sn.lat, ye = dc < 0 ? 0 : 180;
      let np = `M0,${ye}`; for (let o = -180; o <= 180; o += 3) { const a = Math.atan(-Math.cos((o - sn.lon) * Math.PI / 180) / Math.tan(dc * Math.PI / 180)) * 180 / Math.PI; np += `L${(o + 180).toFixed(1)},${(90 - a).toFixed(1)}`; } np += `L360,${ye}Z`;
      const html = `<div class="im"><div><div class="imap"><svg viewBox="0 10 360 145" preserveAspectRatio="none"><path d="${this._landPath}" fill="rgba(255,255,255,.2)"/><path d="${np}" fill="rgba(0,0,0,.35)"/>
        ${segs.map((d) => `<path d="${d}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1" stroke-dasharray="3 3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}</svg>
        <i class="ie" style="left:${px(elon)}%;top:${py(elat)}%"></i><i class="il" style="left:${px(elon)}%;top:${py(elat)}%">Elm</i><span class="ip" style="left:${px(lon)}%;top:${py(lat)}%"><ha-icon icon="mdi:space-station"></ha-icon></span></div></div></div>`;
      return { html, where: this._region(lon, lat), lo: lon, la: lat };
    }
    _trendSec(k, src, unit, pre = '', post = '', mk = false) {
      const x = this._d3 && src ? this._d3[src] : undefined, col = x && x.d >= 0.05 ? C.red : x && x.d <= -0.05 ? C.blue : 'var(--primary-text-color)';
      if (!x) return pre ? `<span class="sec">${pre}</span>` : '';
      return `<span class="sec">${pre ? `<span class="nw">${pre}</span> · ` : ''}<span class="nw">${mk ? '<i class="dsh"></i>' : ''}<b style="color:${col};font-weight:500">${x.d > 0 ? '+' : x.d < 0 ? '−' : '±'}${fmt(Math.abs(x.d))} ${unit}</b> in ${x.h} h</span>${post}</span>`;
    }
    _dayLen() {
      const H = this._hass, lat = H.config && H.config.latitude, lon = H.config && H.config.longitude;
      if (lat == null) return '';
      const t = (d) => { const r = Math.PI / 180, noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12), n = Math.ceil(noon / 86400000 + 2440587.5 - 2451545.0008), js = n - lon / 360,
        M = (357.5291 + 0.98560028 * js) % 360, L = (M + 1.9148 * Math.sin(M * r) + 0.02 * Math.sin(2 * M * r) + 180 + 102.9372) % 360,
        sd = Math.sin(L * r) * Math.sin(23.4397 * r), cw = (Math.sin(-0.833 * r) - Math.sin(lat * r) * sd) / (Math.cos(lat * r) * Math.cos(Math.asin(sd)));
        return Math.abs(cw) > 1 ? null : 2 * Math.acos(cw) / r / 360 * 24 * 60; };
      const now = new Date(), a = t(now), b = t(new Date(now - 86400000)); if (a == null || b == null) return '';
      const m = Math.round(a), dd = Math.round(a) - Math.round(b);
      return `<span class="sec"><span class="nw">Tag: ${Math.floor(m / 60)} h ${m % 60} min</span><span class="dot"> · </span><span class="nw dl2"><b style="color:var(--primary-text-color);font-weight:500">${dd === 0 ? 'gleich lang' : `${Math.abs(dd)} min ${dd > 0 ? 'länger' : 'kürzer'}`}</b><span class="lg"> als gestern</span></span></span>`;
    }
    _pegel(v, mx) {
      const H = 52, y = (x) => H - (Math.min(x, 100) / 100) * H, col = v >= 70 ? C.red : v >= 50 ? C.yellow : C.blue;
      return `<svg width="40" height="58" viewBox="0 0 40 58" style="flex:0 0 40px"><rect x="8" y="2" width="12" height="${H}" rx="6" fill="rgba(128,128,128,.3)"/>
        <clipPath id="wlp"><rect x="8" y="2" width="12" height="${H}" rx="6"/></clipPath>
        <rect clip-path="url(#wlp)" x="8" y="${2 + y(v)}" width="12" height="${H - y(v)}" fill="${col}"/>
        <line x1="5" x2="23" y1="${2 + y(70)}" y2="${2 + y(70)}" stroke="${C.red}" stroke-width="1.2" stroke-dasharray="2 2"/>
        <line x1="5" x2="23" y1="${2 + y(50)}" y2="${2 + y(50)}" stroke="${C.yellow}" stroke-width="1.2" stroke-dasharray="2 2"/>
        ${mx != null && mx > v ? `<line x1="6" x2="22" y1="${2 + y(mx)}" y2="${2 + y(mx)}" stroke="#fff" stroke-width="1.5" stroke-dasharray="2 2"/>` : ''}
        <text x="25" y="${5 + y(70)}" fill="${C.red}" font-size="7">70</text><text x="25" y="${5 + y(50)}" fill="${C.yellow}" font-size="7">50</text></svg>`;
    }
    _trendSt(k) { const t = this._v(k); return `<div class="st" style="color:${this._trendCol(t)}">${esc(t)}</div>`; }
    _trendCol(t) { return /Fallend/i.test(t) ? C.blue : /Steigend/i.test(t) ? C.red : 'var(--primary-text-color)'; }

    _html() {
      const H = this._hass, E = this._e, out = [];
      if (this._c.title !== false) out.push(`<div class="hd">${esc(this._c.title || 'Wetterstation')}</div>`);

      /* ---------- Himmel ---------- */
      const tm = (iso) => { const d = iso ? new Date(iso) : null; return d && !isNaN(d) ? hhmm(d) : '–'; };
      const uv = num(this._v('uv'));
      const uvCol = (x) => x <= 2 ? C.green : x <= 5 ? C.yellow : x <= 7 ? C.orange : x <= 10 ? C.red : C.purple;
      const uvC = uvCol(uv); let um = this._uvmax && this._uvmax.t && new Date(this._uvmax.t).toDateString() === new Date().toDateString() ? this._uvmax : null;
      { const lcu = this._s('uv') && new Date(this._s('uv').last_changed); if (uv > 0 && lcu && Date.now() - lcu >= 300000 && (!um || uv > um.v)) um = { v: uv, t: lcu }; }
      const uvIc = uv <= 2 ? '' : uvC;
      const uvTxt = String(this._v('uv_text')).replace(/^[\d.,]+\s*/, '');
      const iss = this._v('iss');
      const issSoon = iss.startsWith('Heute') || iss.startsWith('ISS am Himmel') || iss.includes('Minute');
      const im = this._issMap(), iOpen = this._issOpen(), iq = im.where ? this._issWhy(im.lo, im.la) : null;
      let aS = this._v('aurora'); if (aS === 'hoch - sehr hoch') aS = 'sehr hoch';
      const aI = Math.max(0, STUFEN.indexOf(aS));
      const aCol = aS === 'Vorwarnung' ? C.yellow : aS === 'hoch' ? C.green : aI >= 5 ? C.purple : '';
      const aAnim = aS === 'Vorwarnung' ? 'a-f3' : aI >= 4 ? 'a-f2' : '';
      const mPic = this._a('moon_phase_text', 'entity_picture');
      const full = this._v('moon_phase') === 'full_moon';
      const aOpen = this._aurOpen(), aMap = this._aurMap();
      const auroraMini = `<div class="st" style="color:${aCol || 'var(--primary-text-color)'}">${esc(aS)}</div>` + this._bar(
        STUFEN.map((x, i) => `<div class="${i <= aI ? 'on' : ''}" style="flex:1;background:${STUFEN_C[i]}"></div>`).join('') + `<i class="tri" style="left:${(aI + 0.5) / 7 * 100}%"></i>`,
        [[0, 'sehr<br>gering'], [3 / 7 * 100, 'Vorwarnung', C.yellow], [5 / 7 * 100, 'sehr<br>hoch', C.purple], [100, 'extrem', C.purple]])
        .replace(/<\/div>$/, () => {
          const kc = (v) => (v >= 7 ? C.purple : v >= 6 ? C.green : v >= 5 ? C.yellow : 'var(--primary-text-color)');
          const k = (a) => { const v = num(this._a('aurora', a)); return `<b style="color:${kc(v)}">${fmt(v)}</b>`; };
          const ov = num(this._a('aurora', 'ovation_elm_prozent')), oc = ov >= 50 ? C.purple : ov >= 30 ? C.green : ov >= 10 ? C.yellow : 'var(--primary-text-color)';
          return `<div class="kg"><div>Kp jetzt${k('kp_aktuell')}</div><div><span class="l">Kp in 3 h</span><span class="s">in 3 h</span>${k('kp_prognose_3h')}</div><div><span class="l">Kp max. 24 h</span><span class="s">max. 24 h</span>${k('kp_max_24h')}</div><div><span class="l">Sichtbarkeit Elm</span><span class="s">Sichtbar</span><b style="color:${oc}">${ov} %</b></div></div>
            <div class="kh"><span><span style="color:${C.yellow}">Vorwarnung</span> ab Kp 5 · <span style="color:${C.green}">sichtbar</span> ab Kp 6 · <span style="color:${C.purple}">stark</span> ab Kp 7</span>${aMap ? '<span class="akt"><span class="pc"><ha-icon class="p" icon="mdi:plus-circle-outline"></ha-icon><ha-icon class="m" icon="mdi:minus-circle-outline"></ha-icon></span></span>' : ''}</div></div>`;
        });
      out.push(this._fold('himmel', 'Himmel',
        (() => { const sa = this._sunArc(); return this._row(E.sun, ico('mdi:white-balance-sunny'), `Sonne${this._dayLen()}`, `<div class="sst"><div class="cols"><div>${tm(this._a('sun', 'next_setting'))}<span>Untergang</span></div><div>${tm(this._a('sun', 'next_rising'))}<span>Aufgang</span></div></div>${sa ? '<span class="pw"><span class="pc"><ha-icon class="p" icon="mdi:plus-circle-outline"></ha-icon><ha-icon class="m" icon="mdi:minus-circle-outline"></ha-icon></span></span>' : ''}</div>${sa}`, sa ? ' data-sun="1"' : '').replace('class="r', sa && this._sunOpen() ? 'class="r sopen' : 'class="r'); })() +
        this._row(E.uv, ico('mdi:sun-wireless', uv >= 8 ? 'a-sunny' : '', uvIc),
          `UV-Index${um && um.v > 0 ? `<span class="sec"><span class="nw">max. heute <i class="dsh"></i><b style="color:${uvCol(um.v)};font-weight:500">${um.v}</b></span>${um.t ? ` <span class="nw">um ${hhmm(um.t)}</span>` : ''}</span>` : ''}`,
          this._mini(`<span style="color:${uvC}">${uv} ${esc(uvTxt)}</span>`, { min: 0, max: 12, value: uv + 0.5, maxValue: um && um.v > 0 ? um.v + 0.5 : null,
            zones: Array.from({ length: 12 }, (_, i) => ({ to: i + 1, c: i <= 2 ? C.green : i <= 5 ? C.yellow : i <= 7 ? C.orange : i <= 10 ? C.red : C.purple })),
            ticks: [[0, 'UV 0'], [3, '3'], [6, '6'], [8, '8'], [11, '11+']] })) +
        this._row(E.moon, '<ha-icon icon="mdi:moon-waning-crescent" style="transform:translateX(4px)"></ha-icon>', 'Mond', `<div class="cols"><div>${esc(this._a('moon', 'moonset') || '–')}<span>Untergang</span></div><div>${esc(this._a('moon', 'moonrise') || '–')}<span>Aufgang</span></div></div>`) +
        this._row(E.moon_phase_text, mPic ? `<img src="${esc(mPic)}" alt="" style="transform:scale(.6)">` : ico('mdi:moon-waning-crescent'), 'Mondphase',
          `<div class="st" style="color:${full ? C.yellow : 'var(--primary-text-color)'}">${esc(this._v('moon_phase_text'))}</div>`) +
        this._row('iss', ico('mdi:space-station', this._v('iss_warning') === 'on' ? 'a-f4' : ''), `ISS Überflug${im.where ? `<span class="sec"><span class="iw">gerade über ${esc(im.where)}</span><span class="isep"> · </span><span class="iq nw"${iq.c ? ` style="color:${iq.c}"` : ''}>${iq.t}</span></span>` : ''}`,
          `<div class="st" style="color:${issSoon ? C.yellow : 'var(--primary-text-color)'}">${(() => { const k = iss.indexOf(' um '); return k > 0 ? `${esc(iss.slice(0, k))} <span class="iu">${esc(iss.slice(k + 1))}</span>` : esc(iss); })()}${im.html ? '<span class="pw"><span class="pc"><ha-icon class="p" icon="mdi:plus-circle-outline"></ha-icon><ha-icon class="m" icon="mdi:minus-circle-outline"></ha-icon></span></span>' : ''}</div>${im.html}`).replace('class="r', iOpen && im.html ? 'class="r iopen' : 'class="r') +
        this._row('aurora', ico('mdi:creation', aAnim, aCol), 'Chance Polarlichter', auroraMini + aMap).replace('class="r', aOpen && aMap ? 'class="r aopen' : 'class="r')));

      /* ---------- Klima ---------- */
      const tT = this._v('temp_trend'), pT = this._v('pressure_trend');
      const tPic = this._a('temp_trend', 'entity_picture'), pPic = this._a('pressure_trend', 'entity_picture');
      const temp = num(this._v('temp')), dew = num(this._v('dewpoint')), spread = Math.max(0, temp - dew), hum = num(this._v('humidity'));
      const prs = num(this._v('pressure')), rh0 = num(this._v('rain_hour'));
      const p3 = this._d3 && this._d3[E.pressure] ? this._d3[E.pressure].d : null;
      const pw = p3 != null && p3 <= -6 ? ['Sturmgefahr', 'Sturmböen möglich', C.red, 'mdi:alert-outline']
        : p3 != null && p3 <= -3 ? ['Wetterumschwung', 'Regen und Wind wahrscheinlich', C.orange, 'mdi:alert-outline']
        : this._p12 != null && this._p12 >= 5 && (p3 == null || p3 >= 0) ? ['Hoch baut sich auf', 'meist ruhig und trocken', C.green, 'mdi:weather-sunny'] : null;
      const pHint = pw ? `<div class="wn" style="color:${pw[2]};background:${pw[2]}22">${ico(pw[3])}<span><b>${pw[0]}</b> · ${pw[1]}</span></div>` : '';
      const rh = rh0;
      const tC = temp <= 0 ? C.blue : temp <= 25 ? C.green : temp <= 30 ? C.yellow : C.red;
      const pc = (v) => (v <= 1 ? C.green : v < 3 ? C.yellow : C.red);
      const pv = POLLEN.map(([id, icon]) => [id, icon, num(H.states[id] && H.states[id].state), (H.states[id] && H.states[id].attributes.friendly_name) || '']);
      const polMax = Math.max(...pv.map((p) => p[2]));
      const chips = pv.map(([id, icon, v, n]) => { const c = pc(v), f = Math.max(0, Math.min(100, v / 3 * 100));
        return `<div data-more="${id}" title="${esc(n)}">${ico(icon, '', v === 0 ? 'var(--secondary-text-color)' : c)}<span class="dt">${[1, 2, 3].map((k) => `<i style="${v >= k - 0.5 ? `background:${c}` : ''}"></i>`).join('')}</span></div>`; }).join('');
      out.push(this._fold('klima', 'Klima',
        this._row(E.temp_trend, tPic ? `<img class="tr" src="${esc(tPic)}" alt="">` : ico('mdi:thermometer'), `Temperaturtendenz${this._trendSec('temp_trend', E.temp_main, '°C')}`, this._trendSt('temp_trend')) +
        this._row(E.temp, ico('mdi:wind-turbine'), 'Temperatur am Windmesser', `<div class="st">${fmt(temp)} °C</div>`) +
        this._row(E.dewpoint, ico('mdi:water-opacity'), `Taupunkt<span class="sec"><span class="nw">Abstand ${fmt(spread)} °C</span> · <span class="nw">${spread <= 1.5 ? (temp <= 0 ? 'Reif / Nebel bildet sich' : 'Nebel / Tau bildet sich') : spread <= 4 ? 'feuchte Luft' : 'trockene Luft'}</span></span>`,
          `<div class="st">${fmt(dew)} °C</div>`) +
        this._row(E.humidity, ico('mdi:water-percent'), 'Luftfeuchte Außen',
          this._mini(`<span style="color:${hum >= 90 ? C.blue : 'var(--primary-text-color)'}">${hum}</span><small>%</small>`, { min: 0, max: 3, value: spread <= 1.5 ? spread / 1.5 : spread <= 4 ? 1 + (spread - 1.5) / 2.5 : 2 + Math.min(spread - 4, 6) / 6, activeOnly: 'zone',
            zones: [{ to: 1, c: C.blue }, { to: 2, c: C.gray3 }, { to: 3, c: C.gray2 }], ticks: [[0, temp <= 0 ? 'Reif / Nebel' : 'Nebel / Tau', C.blue], [1, 'feucht'], [2, 'trocken']] })) +
        this._row(E.pressure_trend, pPic ? `<img class="tr" src="${esc(pPic)}" alt="">` : ico('mdi:gauge'), `Luftdrucktendenz${this._trendSec('pressure_trend', E.pressure, 'hPa', `${fmt(prs)} hPa`, this._p12 != null ? ` · <span class="nw"><b style="color:${this._p12 > 0 ? C.red : this._p12 < 0 ? C.blue : 'var(--primary-text-color)'};font-weight:500">${this._p12 > 0 ? '+' : this._p12 < 0 ? '−' : '±'}${fmt(Math.abs(this._p12))} hPa</b> in 12 h</span>` : '', true)}`,
          this._mini(`<span style="color:${this._trendCol(pT)}">${esc(pT)}</span>`, { min: 980, max: 1040, value: Math.max(980, Math.min(1040, prs)), activeOnly: 'zone',
            maxValue: p3 != null ? Math.max(980, Math.min(1040, prs - p3)) : null,
            zones: [{ to: 1000, c: C.blue }, { to: 1020, c: C.gray3 }, { to: 1040, c: C.yellow }], ticks: [[980, '980 hPa · Tief'], [1000, '1000 · normal'], [1020, '1020 · Hoch']] }) + pHint) +
        `<div class="r" data-more="${POLLEN[0][0]}"><div class="bd">${ico('mdi:flower-pollen')}</div><div class="nm">Pollen-Index</div>
          <div class="st" style="color:${pc(polMax)}">${polMax === 0 ? 'keine Belastung' : polMax <= 1 ? 'geringe Belastung' : polMax < 3 ? 'mittlere Belastung' : 'hohe Belastung'}</div>
          <div class="bar"><div class="vp">${chips}</div></div></div>`));

      /* ---------- Niederschlag ---------- */
      const st = this._v('rain_start');
      const peg = num(this._v('pegel')), pTr = num(this._v('pegel_trend'));
      const pRate = this._d3 && this._d3[E.pegel] ? this._d3[E.pegel].d : null, pm = this._pmax;
      const pegC = peg >= 70 ? C.red : peg >= 50 ? C.yellow : '';
      out.push(this._fold('niederschlag', 'Niederschlag',
        this._row(E.rain_prob, ico('mdi:weather-partly-rainy'), 'Wahrscheinlichkeit Niederschlag', this._ring(num(this._v('rain_prob')), C.blue)) +
        this._row(E.rain_start, ico('mdi:cloud-clock'), 'Beginn Niederschlag', `<div class="st" style="color:${/regnet|schneit/.test(st) ? C.blue : 'var(--primary-text-color)'}">${esc(st)}</div>`) +
        this._row(E.rain_hour, ico('mdi:weather-pouring', rh >= 7 ? 'a-rain' : '', rh >= 7 ? C.blue : ''), 'Regen letzte Stunde',
          this._mini(`<span style="color:${rh >= 7 ? C.blue : 'var(--primary-text-color)'}">${fmt(rh)}</span><small>mm</small>`, { min: 0, max: 25, value: rh, zones: [{ to: 7, c: C.gray3 }, { to: 25, c: C.blue }], ticks: [[0, '0 mm'], [7, '7 mm'], [25, '25 mm']] })) +
        this._row(E.pegel, ico(pTr > 0 ? 'mdi:waves-arrow-up' : pTr < 0 ? 'mdi:wave-arrow-down' : 'mdi:waves', pTr > 0 ? 'a-up' : pTr < 0 ? 'a-down' : '', pegC),
          `Pegelstand Elmbach${pm ? `<span class="sec"><span class="nw">max. heute <i class="dsh"></i><b style="color:${pm.v >= 70 ? C.red : pm.v >= 50 ? C.yellow : 'var(--primary-text-color)'};font-weight:500">${fmt(pm.v)} cm</b></span> <span class="nw">um ${hhmm(pm.t)}</span></span>` : ''}`,
          `<div class="st2" style="flex-direction:row;align-items:flex-start;gap:10px;padding:10px 0 4px"><div style="text-align:right"><div class="st"><span style="color:${pegC || 'var(--primary-text-color)'}">${fmt(peg)}</span><small>cm</small></div>
            <div style="font-size:12px;color:${pTr > 0 ? C.red : pTr < 0 ? C.blue : 'var(--secondary-text-color)'}"><span class="${pTr > 0 ? 'a-up' : pTr < 0 ? 'a-down' : ''}" style="display:inline-block">${pTr > 0 ? '▲' : pTr < 0 ? '▼' : '▶'}</span> ${pTr > 0 ? 'steigt' : pTr < 0 ? 'fällt' : 'gleich'}</div>${pRate != null ? `<div style="font-size:12px;color:var(--secondary-text-color);font-variant-numeric:tabular-nums">${pRate > 0 ? '+' : pRate < 0 ? '−' : '±'}${fmt(Math.abs(pRate))} cm/h</div>` : ''}</div>${this._pegel(peg, pm ? pm.v : null)}</div>`)));

      /* ---------- Blitze ---------- */
      const cnt = num(this._v('lightning')), act = cnt >= 1, dist = num(this._v('lightning_dist'));
      const li = this._v('lightning_last'); let lt = '–';
      if (li && !isNaN(Date.parse(li))) { const d = new Date(li); lt = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} ${hhmm(d)}`; }
      out.push(this._fold('blitze', 'Blitze',
        this._row(E.lightning, ico('mdi:weather-lightning', this._v('lightning_anim') === 'on' ? 'a-bolt' : '', act ? C.blue : ''), 'Blitze',
          `<div class="st" style="color:${act ? C.blue : 'var(--primary-text-color)'}">${esc(this._a('lightning', 'sprechender_status') || this._v('lightning'))}</div>`) +
        this._row(E.lightning_last, ico('mdi:flash'), 'Letzter Blitz', `<div class="st">${lt}</div>`) +
        this._row(E.lightning_dist, ico('mdi:signal-distance-variant'), 'Entfernung Blitze',
          this._mini(`<span style="color:${act ? (dist < 10 ? C.red : dist < 20 ? C.orange : dist < 30 ? C.yellow : 'var(--primary-text-color)') : 'var(--primary-text-color)'}">${dist}<small>km</small></span>`,
            { min: 0, max: 40, value: Math.min(dist, 40), activeOnly: act ? 'zone' : 'none', zones: [{ to: 10, c: C.red }, { to: 20, c: C.orange }, { to: 30, c: C.yellow }, { to: 40, c: C.gray }], ticks: [[0, '<ha-icon icon="mdi:home"></ha-icon>'], [10, '10 km'], [20, '20'], [30, '30'], [40, '40']] }))));

      /* ---------- Wind ---------- */
      const ws = num(this._v('wind')), wmax = E.wind_max && this._s('wind_max') ? num(this._v('wind_max')) : null;
      const g = num(this._v('gust')), gm = num(this._v('gust_max'));
      const wC = ws <= 28 ? C.green : ws <= 61 ? C.yellow : ws <= 117 ? C.red : C.purple;
      const gC = (v) => (v <= 59 ? C.green : v <= 99 ? C.yellow : C.red);
      const lc = (k) => { const s = this._s(k); return s && s.last_changed ? new Date(s.last_changed) : null; };
      const wz = [{ to: 28, c: C.green }, { to: 61, c: C.yellow }, { to: 117, c: C.red }, { to: 130, c: C.purple }], wt = [[0, '0 km/h'], [28, '28'], [61, '61'], [117, '117']];
      const gz = [{ to: 60, c: C.green }, { to: 100, c: C.yellow }, { to: 130, c: C.red }], gt = [[0, '0 km/h'], [60, '60'], [100, '100'], [130, '130']];
      out.push(this._fold('wind', 'Wind',
        this._row(E.wind, ico('mdi:windsock', ws >= 50 ? 'a-sock' : '', ws > 28 ? wC : ''), `Windstärke<span class="sec"><b style="color:${wC};font-weight:500">${fmt(ws, 0)} km/h</b>${wmax != null ? `<br><span class="nw">max. heute <i class="dsh"></i><b style="color:${wmax <= 28 ? C.green : wmax <= 61 ? C.yellow : wmax <= 117 ? C.red : C.purple};font-weight:500">${fmt(wmax, 0)} km/h</b></span>${lc('wind_max') ? ' <span class="nw">um ' + hhmm(lc('wind_max')) + '</span>' : ''}` : ''}</span>`,
          this._mini(`<span style="color:${wC}">${esc(this._v('wind_text'))}</span>`, { min: 0, max: 130, value: ws, maxValue: wmax, zones: wz, ticks: wt })) +
        this._row(E.gust, ico('mdi:weather-dust', g >= 60 || gm >= 100 ? 'a-gust' : '', g > 59 ? gC(g) : ''),
          `Windböe<span class="sec"><span class="nw">max. heute <i class="dsh"></i><b style="color:${gC(gm)};font-weight:500">${fmt(gm, 0)} km/h</b></span>${lc('gust_max') ? ' <span class="nw">um ' + hhmm(lc('gust_max')) + '</span>' : ''}</span>`,
          this._mini(`<span style="color:${gC(g)}">${fmt(g, 0)}</span><small>km/h</small>`, { min: 0, max: 130, value: g, maxValue: gm, zones: gz, ticks: gt }))));
      return out.join('');
    }
  }

  customElements.define(TAG, WetterstationListeCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: TAG, name: 'Wetterstation Liste', description: 'Wetterstation als Entitaetenliste mit Mini-Skalen' });
})();
