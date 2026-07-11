import Link from "next/link";

export function HomepageLanding() {
  return (
    <main className="home-splash">
      <div className="home-splash-frame">
        <div className="home-splash-artboard">
          <div className="home-splash-image" aria-hidden="true" />
          <div className="home-splash-shade" aria-hidden="true" />

          <div className="home-splash-hotspots">
            <Link href="/cards" className="home-splash-hotspot is-cards" aria-label="Kartenset ansehen">
              <span className="sr-only">Kartenset ansehen</span>
            </Link>
            <Link href="/game" className="home-splash-hotspot is-play" aria-label="Spiel starten">
              <span className="sr-only">Spiel starten</span>
            </Link>
            <Link href="/deckbuilder" className="home-splash-hotspot is-deckbuilder" aria-label="Deckbuilder">
              <span className="sr-only">Deckbuilder</span>
            </Link>
          </div>
        </div>

        <div className="home-splash-mobile-panel" aria-label="Schnellzugriff">
          <div className="home-splash-mobile-actions">
            <Link href="/cards" className="home-splash-mobile-button">
              Kartenset ansehen
            </Link>
            <Link href="/game" className="home-splash-mobile-button home-splash-mobile-button-primary">
              Spiel starten
            </Link>
            <Link href="/deckbuilder" className="home-splash-mobile-button">
              Deckbuilder
            </Link>
          </div>

          <div className="home-splash-mobile-features">
            <Link href="/cards" className="home-splash-mobile-feature">
              <strong>Über 180 Karten</strong>
              <span>Entdecke Helden, Chaos und Ausrüstung aus dem Starter-Set.</span>
            </Link>
            <Link href="/#fraktionen" className="home-splash-mobile-feature">
              <strong>4 Fraktionen</strong>
              <span>Stelle dein Deck zusammen und finde deinen Spielstil.</span>
            </Link>
            <Link href="/game" className="home-splash-mobile-feature">
              <strong>Strategie &amp; Taktik</strong>
              <span>Führe deine Bande in kompakte, taktische Runden.</span>
            </Link>
            <Link href="/deckbuilder" className="home-splash-mobile-feature">
              <strong>Deckbuilder</strong>
              <span>Optimiere dein Deck für den nächsten Run.</span>
            </Link>
          </div>
        </div>

        <h1 className="sr-only">BubatzBande: Königreiche &amp; Chaos</h1>
      </div>
    </main>
  );
}
