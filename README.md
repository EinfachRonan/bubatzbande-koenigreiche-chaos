# Bubatzbande · Spiele

bubatzbande.de zeigt eine Spielauswahl mit sieben Spielen:

- **Schlagabtausch** (`site/schach/`): Schach im 3D-Wohnzimmer gegen Herrn Holz. Jedes Schlagen wird als Ego-Duell ausgekämpft. Three.js über CDN, Online-Modus über `net.php`.
- **Bandenkrieg** (`site/krieg/`): Strategie im Stil von Age of War. Die Bubatzbande gegen die Spießer, drei Zeitalter, Allan als Turm, „König ruft" als Spezialangriff.

- **Kräuter-Match** (`site/match/`): Match-3 mit Bande-Helfern, 12 Level und dann endlos.
- **Bubatz-Quiz** (`site/quiz/`): Party-Quiz mit Raum-Code (Host am TV, Antworten am Handy über `room.php`), Solo, Ein-Gerät-Modus, eigene Fragen.
- **Kobold-Runner** (`site/runner/`): Endlos-Runner in der Kräuterhöhle (Canvas, 3 Spuren).
- **Bandenhof** (`site/hof/`): Idle-Aufbau mit Offline-Ertrag, Spielstand auch im Konto.
- **Erntezeit** (`site/ernte/`, Testphase, noch nicht auf der Startseite): Zombie-Shooter auf dem Bauernhof und Friedhof, Klassenwahl, Nahkampfwaffen, Shop zwischen den Wellen, Traktor-Boss. Three.js über CDN.
- **Kneipen-Duell** (`site/duell/`): 1 gegen 1 an einem Handy oder gegen den Wirt: Bier zapfen, Krug schieben, Prost-Duell, Armdrücken.

- **Die Legenden der Kräuterhöhle** (`site/kraeuterhoehle/`, Geheim-Testphase v0.5, von Mario): Höhlenverteidigung mit Paketen, Bande-Helden und Skilltree. Nur spielbar nach „Code eingeben“ in den Einstellungen der Startseite. Mit Konto liegt die Freischaltung im Profil (nur bei diesem Konto), ohne Konto nur auf dem Gerät. Codes stehen als Hash in `site/api/bb.php` (`$SECRET`).

**Einstellungen (Zahnrad auf der Startseite):** Sound- und Musik-Lautstärke für alle Spiele (`BB.vol()` / `BB.setVol()`, gespeichert in `bb_vol`, Event `bb-vol`), dazu „Code eingeben“.

**Konten & Bestenliste:** `site/bb.js` (Anmeldung, Profil mit Name und Profilbild, Erfolge, Bestenlisten) und `site/api/bb.php`. Konten liegen auf dem Server in `site/api/data/` (nicht im Repo, wird beim Deploy nicht gelöscht).

Die Titelbilder aller Spiele kommen aus `site/art.js` (Startseite und Spielmenüs).

Die Startseite ist `site/index.html`. Alles ist statisch, ohne Build-Schritt.

Jeder Push auf `master` lädt den Ordner `site/` per SFTP auf STRATO hoch (siehe `.github/workflows/deploy-strato.yml`).
Das alte Bubatzbande-Kartenspiel liegt im Branch `bubatzbande-backup`.
