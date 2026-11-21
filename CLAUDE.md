# Regeln für dieses Repo (bubatzbande.de)

## Mario arbeitet NUR an seinem Spiel – über den Branch `mario`

Mario (Ronans Kollege) programmiert „Die Legenden der Kräuterhöhle“ (`site/kraeuterhoehle/`).
**Wenn Mario schreibt oder die Arbeit an der Kräuterhöhle für Mario ist, gilt:**

1. Nur Dateien in `site/kraeuterhoehle/` ändern. Nichts anderes anfassen (Startseite, `bb.js`, `api/`, andere Spiele, Workflows, Skripte, diese Datei).
2. **Nie direkt auf `master` pushen.** Immer so arbeiten:
   ```bash
   git fetch origin master
   git checkout -B mario origin/master        # frisch vom aktuellen Stand
   # … nur in site/kraeuterhoehle/ ändern, committen …
   git push -f origin mario
   ```
3. Die GitHub-Action **Mario-Schleuse** übernimmt dann automatisch NUR `site/kraeuterhoehle/` nach `master` und deployt. Änderungen außerhalb werden ignoriert.
4. Will Mario etwas außerhalb seines Ordners geändert haben (z. B. Startseite, gemeinsames Konto-System), nicht selbst machen, sondern sagen: „Das muss Ronan freigeben.“

Ronan selbst darf wie bisher alles ändern und direkt auf `master` pushen.
