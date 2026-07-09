import Link from "next/link";

export function HomepageLanding() {
  return (
    <main className="home-splash">
      <div className="home-splash-frame">
        <div className="home-splash-artboard">
          <div className="home-splash-image" aria-hidden="true" />
          <div className="home-splash-shade" aria-hidden="true" />

          <div className="home-splash-hotspots">
            <Link href="/cards" className="home-splash-hotspot is-cards">
              <span>Kartenset ansehen</span>
            </Link>
            <Link href="/game" className="home-splash-hotspot is-play">
              <span>Spiel starten</span>
            </Link>
            <Link href="/deckbuilder" className="home-splash-hotspot is-deckbuilder">
              <span>Deckbuilder</span>
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
              <strong>Ueber 180 Karten</strong>
              <span>Entdecke Helden, Chaos und Ausruestung aus dem Starter-Set.</span>
            </Link>
            <Link href="/#fraktionen" className="home-splash-mobile-feature">
              <strong>4 Fraktionen</strong>
              <span>Stelle dein Deck zusammen und finde deinen Spielstil.</span>
            </Link>
            <Link href="/game" className="home-splash-mobile-feature">
              <strong>Strategie &amp; Taktik</strong>
              <span>Fuehre deine Bande in kompakte, taktische Runden.</span>
            </Link>
            <Link href="/deckbuilder" className="home-splash-mobile-feature">
              <strong>Deckbuilder</strong>
              <span>Optimiere dein Deck fuer den naechsten Run.</span>
            </Link>
          </div>
        </div>

        <h1 className="sr-only">BubatzBande: Koenigreiche &amp; Chaos</h1>
      </div>
    </main>
  );
}
