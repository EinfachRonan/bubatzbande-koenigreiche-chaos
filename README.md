# Schlagabtausch

Schach im 3D-Wohnzimmer gegen Herrn Holz. Jedes Schlagen wird als Ego-Duell zwischen den beiden Figuren ausgekämpft.

- Das ganze Spiel steckt in `site/index.html` (Three.js über CDN, kein Build nötig).
- Jeder Push auf `master` lädt den Ordner `site/` per SFTP auf STRATO hoch (siehe `.github/workflows/deploy-strato.yml`).
- Das alte Bubatzbande-Kartenspiel liegt im Branch `bubatzbande-backup`.
