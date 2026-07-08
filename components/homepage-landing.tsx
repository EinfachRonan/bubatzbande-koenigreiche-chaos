import Link from "next/link";

export function HomepageLanding() {
  return (
    <main className="home-splash">
      <section className="home-splash-frame">
        <div className="home-splash-image" aria-hidden="true" />
        <div className="home-splash-shade" aria-hidden="true" />

        <div className="home-splash-content">
          <h1 className="sr-only">BubatzBande: Königreiche &amp; Chaos</h1>

          <div className="home-splash-actions">
            <Link href="/game" className="home-splash-button home-splash-button-primary">
              Spiel starten
            </Link>
            <Link href="/cards" className="home-splash-button home-splash-button-secondary">
              Kartenset ansehen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
