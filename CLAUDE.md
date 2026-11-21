# Regeln für dieses Repo (bubatzbande.de)

## Mario arbeitet NUR an seinem Spiel – über den Branch `mario`

Mario (Ronans Kollege) programmiert „Die Legenden der Kräuterhöhle“ (`site/kraeuterhoehle/`).
**Wenn Mario schreibt oder die Arbeit an der Kräuterhöhle für Mario ist, gilt:**

1. Nur Dateien in `site/kraeuterhoehle/` und `warteschlange/` ändern. Nichts anderes anfassen (Startseite, `bb.js`, `api/`, andere Spiele, Workflows, Skripte, diese Datei).
2. **Nie direkt auf `master` pushen.** Immer so arbeiten:
   ```bash
   git fetch origin master
   git checkout -B mario origin/master        # frisch vom aktuellen Stand
   # … nur in site/kraeuterhoehle/ ändern, committen …
   git push -f origin mario
   ```
3. Die GitHub-Action **Mario-Schleuse** übernimmt dann automatisch NUR `site/kraeuterhoehle/` nach `master` und deployt. Änderungen außerhalb werden ignoriert.
4. **Neues Spiel von Mario → Warteschlange.** Nicht in `site/` anlegen und nicht auf die Startseite bauen, sondern:
   ```
   warteschlange/<spielname>/index.html      # das komplette Spiel (Bilder usw. daneben im selben Ordner)
   warteschlange/<spielname>/LIESMICH.md     # Name, 1–2 Sätze Beschreibung, Wunsch-Code, Version
   ```
   Ganz normal über Branch `mario` pushen (Schritt 2). Die Schleuse übernimmt es nach `master`, **live geht es aber noch nicht** (liegt außerhalb von `site/`). Mario sagt danach: „Liegt in der Warteschlange, Ronan muss es umsetzen.“
5. Will Mario etwas anderes außerhalb seines Ordners geändert haben (z. B. Startseite, gemeinsames Konto-System), nicht selbst machen, sondern sagen: „Das muss Ronan freigeben.“

## Warteschlange umsetzen (nur auf Ronans Ansage)

Spiel aus `warteschlange/<spielname>/` nach `site/<spielname>/` verschieben, als Geheim-Spiel mit Code einbauen (SECRET-Liste in `site/index.html`, Code in `site/api/bb.php` und `site/bb.js`, Code-Sperre oben im Spiel wie bei den anderen Testspielen), Startbild `key.jpg` dazu, testen, pushen. Danach den Ordner aus `warteschlange/` löschen.

Ronan selbst darf wie bisher alles ändern und direkt auf `master` pushen.
