# Bubatzbande · Spiele

bubatzbande.de zeigt eine Spielauswahl mit zwei Spielen:

- **Schlagabtausch** (`site/schach/`): Schach im 3D-Wohnzimmer gegen Herrn Holz. Jedes Schlagen wird als Ego-Duell ausgekämpft. Three.js über CDN, Online-Modus über `net.php`.
- **Bandenkrieg** (`site/krieg/`): Strategie im Stil von Age of War. Die Bubatzbande gegen die Spießer, drei Zeitalter, Allan als Turm, „König ruft" als Spezialangriff.

Die Startseite ist `site/index.html`. Alles ist statisch, ohne Build-Schritt.

Jeder Push auf `master` lädt den Ordner `site/` per SFTP auf STRATO hoch (siehe `.github/workflows/deploy-strato.yml`).
Das alte Bubatzbande-Kartenspiel liegt im Branch `bubatzbande-backup`.
