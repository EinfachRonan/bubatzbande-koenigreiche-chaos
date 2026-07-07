# BubatzBande: Königreiche & Chaos

Lokaler MVP-Prototyp eines eigenständigen Fantasy-Browser-Kartenspiels mit Chaos-Faktor. Die erste Version läuft komplett lokal im Browser, ohne Backend, ohne Accounts und ohne Multiplayer.

Repository-Name: `bubatzbande-koenigreiche-chaos`

## Projektstart

```bash
npm install
npm run dev
```

Danach im Browser `http://localhost:3000` öffnen.

## Online Deployment

Das Projekt ist für GitHub Pages als statischen Next.js-Export vorbereitet. Nach dem Push auf GitHub kann es über die Actions-Workflow-Datei automatisch veröffentlicht werden.

## Projektstruktur

```text
app/
  page.tsx              Startseite
  game/page.tsx         Spielansicht
  cards/page.tsx        Kartenbibliothek
  globals.css           Globales Fantasy-UI
components/
  card-frame.tsx        Wiederverwendbare Kartendarstellung
  match-client.tsx      Client-Matchscreen mit Spielinteraktion
  card-library-client.tsx
lib/
  cards.ts              Kartendaten und Starter-Deck
  game.ts               Match-State und Regel-Engine
  bot.ts                Einfache Gegner-KI
types/
  cards.ts              Zentrale Typen
public/
  images/
    starter-set-reference.png
    cards/
      ...
```

## Was im MVP enthalten ist

- Startseite mit Hero-Bild und Navigation
- Spielbarer lokaler Match-Screen
- 30-Karten-Starterdeck auf Basis des Referenzsets
- Vier Kartentypen: Charaktere, Aktionen, Chaos, Ausrüstung
- Gold-, Zieh- und Kampf-Logik
- Maximal 5 Charaktere pro Spielfeld
- Einfache Bot-KI
- Kartenbibliothek mit Suche und Filtern

## Neue Karten hinzufügen

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

Beispiel:

```ts
{
  id: "neue-karte",
  name: "Neue Karte",
  type: "action",
  rarity: "rare",
  cost: 3,
  effect: "Beschreibe hier den Effekt.",
  effectId: "plunder-gold",
  image: "/images/cards/neue-karte.png",
  tags: ["Test", "Gold"]
}
```

Wenn ein neuer Effekt wirklich neues Verhalten braucht, ergänze ihn in:

- [types/cards.ts](C:/Users/Test/Documents/Bubatzbande.de/types/cards.ts)
- [lib/game.ts](C:/Users/Test/Documents/Bubatzbande.de/lib/game.ts)
- optional [lib/bot.ts](C:/Users/Test/Documents/Bubatzbande.de/lib/bot.ts), falls der Bot ihn sinnvoll nutzen soll

## Echte Kartenbilder einbinden

Die Karten sind bereits auf lokale Bildpfade vorbereitet:

- `/images/cards/der-gruene-kobold.png`
- `/images/cards/donpatron.png`
- usw.

Lege deine finalen Bilder einfach in `public/images/cards/` mit den passenden Dateinamen. Die UI nutzt diese Pfade bereits als vorbereitete Referenz.

## Hinweise zum aktuellen Regelstand

- Die Version ist bewusst ein MVP und priorisiert Lesbarkeit vor maximaler Systemtiefe.
- Einige komplexe Karteneffekte sind vereinfacht, aber funktional umgesetzt.
- Der Fokus liegt auf einer spielbaren lokalen Match-Ansicht, sauberer Datenstruktur und leichter Erweiterbarkeit.
