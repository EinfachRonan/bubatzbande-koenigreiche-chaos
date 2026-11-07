# Bubatzbande · Spiele

bubatzbande.de zeigt eine Spielauswahl mit fünf Spielen:

- **Schlagabtausch** (`site/schach/`): Schach im 3D-Wohnzimmer gegen Herrn Holz. Jedes Schlagen wird als Ego-Duell ausgekämpft. Three.js über CDN, Online-Modus über `net.php`.
- **Bandenkrieg** (`site/krieg/`): Strategie im Stil von Age of War. Die Bubatzbande gegen die Spießer, drei Zeitalter, Allan als Turm, „König ruft" als Spezialangriff.

- **Kräuter-Match** (`site/match/`): Match-3 mit Bande-Helfern, 12 Level und dann endlos.
- **Bubatz-Quiz** (`site/quiz/`): Party-Quiz mit Raum-Code (Host am TV, Antworten am Handy über `room.php`), Solo, Ein-Gerät-Modus, eigene Fragen.
- **Kneipen-Duell** (`site/duell/`): 1 gegen 1 an einem Handy oder gegen den Wirt: Bier zapfen, Krug schieben, Prost-Duell, Armdrücken.

**Konten & Bestenliste:** `site/bb.js` (Anmeldung, Profil mit Name und Profilbild, Erfolge, Bestenlisten) und `site/api/bb.php`. Konten liegen auf dem Server in `site/api/data/` (nicht im Repo, wird beim Deploy nicht gelöscht).

Die Startseite ist `site/index.html`. Alles ist statisch, ohne Build-Schritt.

Jeder Push auf `master` lädt den Ordner `site/` per SFTP auf STRATO hoch (siehe `.github/workflows/deploy-strato.yml`).
Das alte Bubatzbande-Kartenspiel liegt im Branch `bubatzbande-backup`.
