Original prompt: Bitte setze die beigefuegte Bilddatei als exakte Design- und Layout-Referenz fuer die erste Spielmap in meinem Projekt um. Match-Seite als interaktive Kraeuterhoehle nachbauen, bestehende Spiellogik behalten, Querformat-Mobile beachten, danach typecheck/build/pruefen und nur bei Erfolg committen/pushen.

- 2026-07-08: Phase 4 / Kraeuterhoehle-Match-Layout gestartet.
- Referenzbild und zusaetzliche Layout-Vorgaben gelesen.
- Bestehende Match-Komponente und CSS gesichtet.
- Match-UI in praesentationale Game-Komponenten aufgeteilt.
- Fullscreen-Kraeuterhoehle mit linker Spielerleiste, zentralem Board, rechter Status-/Logspalte und gefaecherter Hand umgesetzt.
- Referenzbild nach public/images/maps/kraeuterhoehle-reference.png kopiert und als dezenter Hintergrund eingebunden.
- Mobile-Portrait-Hinweis hinzugefuegt, Landscape kompakter abgestimmt.
- Verifikation: npm run typecheck erfolgreich, npm run build erfolgreich, lokale Seitenchecks fuer /, /game und /cards erfolgreich.
- Offener Punkt fuer spaeter: visuelles Feintuning kann noch weiter an die Referenz angenaehert werden, falls wir danach noch eine Polishing-Runde wollen.
- 2026-07-08: Kartenassets aus dem exportierten Sheet nach public/images/cards uebernommen (29 PNGs).
- CardFrame von Art-Platzhalter auf echte Kartenbilder umgestellt; eager loading verhindert leere Slots in langen Bibliotheks-Views.
- Match-Token Baumgeist auf vorhandenes LG3-Art umgelegt, damit kein kaputter Bildpfad entsteht.
- Verifikation Runde 2: npm run typecheck erfolgreich, npm run build erfolgreich, Browser-Checks fuer /, /cards und /game auf Desktop erfolgreich; Mobile-Checks fuer / und /cards erfolgreich, /game zeigt den erwarteten Landscape-Hinweis.
- 2026-07-08: Baumgeist als eigenes Kartenasset aus finaler Illustration nach public/images/cards/baumgeist.png uebernommen und zusaetzlich lokal nach %USERPROFILE%\Pictures\Card Sheets\BubatzBande Kartenspiel\baumgeist.png exportiert.
- LG3-Todeseffekt auf eine echte Baumgeist-Kartendefinition umgestellt, damit Beschwoerungen denselben Bildpfad und dieselben Basisdaten wie die restlichen Karten nutzen.
- Verifikation Runde 3: LG3-Beschwoerung lokal per Spielszenario getestet; npm run typecheck erfolgreich, npm run build erfolgreich, Asset-Request fuer /images/cards/baumgeist.png auf dem lokalen Next-Server erfolgreich.
