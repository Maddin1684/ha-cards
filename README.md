# ha-cards

Eigene Lovelace-Karten für Martins Home Assistant (Elm).

**Ablauf:** Claude legt geänderte Karten hier unter `cards/` ab. Home Assistant lädt sie über die Integration
„Downloader“ (`downloader.download_file`, Zielordner `/config/www`, Unterordner `cards`, überschreiben) von
`https://raw.githubusercontent.com/Maddin1684/ha-cards/main/cards/<datei>` und die Dashboard-Ressource
`/local/cards/<datei>?v=<version>` wird hochgezählt.

Enthält nur Karten-Code und Entitätsnamen, keine Zugangsdaten.
