# BubatzBande: Königreiche & Chaos

Lokaler Next.js-MVP eines eigenstaendigen Fantasy-Browser-Kartenspiels mit Chaos-Faktor. Das Projekt laeuft komplett ohne Backend, Accounts oder Multiplayer und ist auf schnelle lokale Spielbarkeit ausgelegt.

Repository-Name: `bubatzbande-koenigreiche-chaos`

## Projektstart

```bash
npm install
npm run dev
```

Danach im Browser `http://localhost:3000` oeffnen.

## Online Deployment

Das Projekt ist fuer GitHub Pages als statischen Next.js-Export vorbereitet. Nach dem Push nach GitHub veroeffentlicht der Workflow unter `.github/workflows/deploy-pages.yml` automatisch die aktuelle Version.

## Projektstruktur

```text
app/
  page.tsx              Startseite
  game/page.tsx         Match-Screen
  cards/page.tsx        Kartenbibliothek und Deckbuilder
  globals.css           Globales UI und Responsive-Design
components/
  card-frame.tsx
  match-client.tsx
  card-library-client.tsx
lib/
  cards.ts              Kartendaten
  decks.ts              Deckregeln, Starterdecks, Deck-Utilities
  game.ts               Match-State und Regel-Engine
  bot.ts                Bot-KI
types/
  cards.ts
docs/
  balancing.md          Kurznotizen zum aktuellen Set
```

## Aktuell fertige Features

- Startseite mit Branding und Referenzbild
- Spielbarer 1v1-Match-Screen
- Kartenbibliothek mit Filtern und Suche
- Deckbuilder mit LocalStorage-Speicherung
- Regelkonforme Deckgrenzen:
  - maximal 30 Karten
  - mindestens 20 Karten zum Starten
  - gewoehnlich/selten/episch maximal 2x
  - legendaer maximal 1x
- Starterdeck und Bot-Starterdeck
- Smartere Bot-KI
- Sichtbares Ereignisprotokoll
- GitHub-Pages-Deployment

## Deckbuilder benutzen

Die Kartenbibliothek unter `/cards` ist gleichzeitig der Deckbuilder.

Moeglich ist dort:

- Karten zum Deck hinzufuegen
- Karten wieder entfernen
- Starterdeck laden
- Deck zuruecksetzen
- Deckstand `X / 30` sehen
- Grenzen pro Karte direkt erkennen
- Deck automatisch im Browser per `localStorage` speichern
- Mit dem aktuellen Deck direkt ein Match starten

Beim Oeffnen wird zuerst ein gespeichertes Deck geladen. Falls keines vorhanden ist, steht das Starterdeck bereit.

## Wie Deckregeln funktionieren

- Ein Deck darf maximal `30` Karten enthalten.
- Ein Match darf mit mindestens `20` Karten gestartet werden.
- `common`, `rare` und `epic` duerfen jeweils maximal `2x` enthalten sein.
- `legendary` darf maximal `1x` enthalten sein.
- Ist ein gespeichertes Deck ungueltig oder zu klein, faellt das Spiel automatisch auf das Starterdeck zurueck.

## Neue Karten hinzufuegen

Neue Karten werden zentral in [lib/cards.ts](C:/Users/Test/Documents/Bubatzbande.de/lib/cards.ts) angelegt.

Jede Karte braucht mindestens:

- `id`
- `name`
- `type`
- `rarity`
- `cost`
- `attack` und `health` bei Charakteren
- `effect`
- `effectId`
- `image`
- `tags`

Wenn ein neuer Effekt neues Verhalten braucht, dann erweitere:

- [types/cards.ts](C:/Users/Test/Documents/Bubatzbande.de/types/cards.ts)
- [lib/game.ts](C:/Users/Test/Documents/Bubatzbande.de/lib/game.ts)
- optional [lib/bot.ts](C:/Users/Test/Documents/Bubatzbande.de/lib/bot.ts)

## Kartenbilder einbinden

Die Karten nutzen lokale Bildpfade wie:

- `/images/cards/der-gruene-kobold.png`
- `/images/cards/donpatron.png`

Lege finale Bilder einfach in `public/images/cards/` mit den passenden Dateinamen ab.

## Geplante spaetere Ausbaustufen

- Mehr Karten und weitere Sets
- Tiefere Chaos-Effekte
- Besserer visueller Kampf-Feedback-Layer
- Weitere KI-Persoenlichkeiten
- Zusätzliche Matchmodi

## Lokale Qualitaetspruefung

```bash
npm run typecheck
npm run build
```
