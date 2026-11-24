# ha-cards

Eigene Lovelace-Karten für Martins Home Assistant (Elm).

**Ablauf:** Claude legt geänderte Karten hier unter `cards/` ab. Home Assistant lädt sie über die Integration
„Downloader“ (`downloader.download_file`, Zielordner `/config/www`, Unterordner `cards`, überschreiben) von
`https://raw.githubusercontent.com/Maddin1684/ha-cards/main/cards/<datei>` und die Dashboard-Ressource
`/local/cards/<datei>?v=<version>` wird hochgezählt.

Enthält nur Karten-Code und Entitätsnamen, keine Zugangsdaten.

## Karten

| Datei | Ressource in HA |
|---|---|
| elmo-sonne-visuell.js | /local/cards/elmo-sonne-visuell.js |
| elmo-sonnen-cam-card.js | /local/cards/elmo-sonnen-cam-card.js |
| elmo-kalibrierung-card.js | /local/cards/elmo-kalibrierung-card.js |
| elmo-frost-fx.js | /local/cards/elmo-frost-fx.js |
| wetterstation-card.js | /local/cards/wetterstation-card.js |
| wetterstation-liste-card.js | /local/cards/wetterstation-liste-card.js |
| luftqualitaet-card.js | /local/cards/luftqualitaet-card.js |
| multimedia-card.js | /local/cards/multimedia-card.js |
| kamera-live-card.js | /local/cards/kamera-live-card.js |
| kamera-ki-training-card.js | /local/cards/kamera-ki-training-card.js |
| arbeitsweg-route-card.js | /local/cards/arbeitsweg-route-card.js (TomTom-Schlüssel steht in der Karten-Konfiguration, nicht hier) |

## Weitere Dateien

| Ordner | Inhalt | Ziel in HA |
|---|---|---|
| `leaflet/` | `elmo-radar-card.js` (eigene Karte) sowie Leaflet 1.9.4 (`leaflet-src.esm.js`, `leaflet.css`, unverändert) | `/config/www/leaflet/` – Downloader-Unterordner `leaflet` |
| `python_scripts/` | `set_state.py` | `/config/python_scripts/` – **nicht** über den Downloader (der schreibt nur nach `www`, und `www` ist ohne Login abrufbar); von Hand kopieren, danach `python_script.reload` |
