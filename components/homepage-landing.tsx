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
              <span className="sr-only">Kartenset ansehen</span>
            </Link>
            <Link href="/game" className="home-splash-hotspot is-play">
              <span className="sr-only">Spiel starten</span>
            </Link>
            <Link href="/deckbuilder" className="home-splash-hotspot is-deckbuilder">
              <span className="sr-only">Deckbuilder</span>
            </Link>
          </div>
        </div>

        <h1 className="sr-only">BubatzBande: Koenigreiche &amp; Chaos</h1>
      </div>
    </main>
  );
}
