import Link from "next/link";

export default function HomePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <main className="landing-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Lokaler MVP Prototyp</p>
          <h1>BubatzBande: Königreiche &amp; Chaos</h1>
          <p className="hero-text">
            Ein eigenständiges Fantasy-Kartenspiel mit schnellen Duellen, schrägen
            Chaos-Effekten und einer düster-grün-goldenen Welt voller fragwürdiger
            Herrscher, Kobolde und Kebab-Legenden.
          </p>
          <div className="hero-actions">
            <Link href="/game" className="primary-button">
              Spiel starten
            </Link>
            <Link href="/cards" className="secondary-button">
              Kartenset ansehen
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <img
            src={`${basePath}/images/starter-set-reference.png`}
            alt="Starter-Set Referenz"
            className="hero-image"
          />
        </div>
      </section>

      <section className="feature-strip">
        <article className="feature-card">
          <h2>Taktik mit Tempo</h2>
          <p>1v1-Duelle mit fünf Board-Slots, klarer Goldkurve und direkt lesbaren Zügen.</p>
        </article>
        <article className="feature-card">
          <h2>Chaos als Würze</h2>
          <p>Karten wie &quot;Bubatz-Alarm&quot; oder &quot;Falscher König&quot; drehen Matches abrupt.</p>
        </article>
        <article className="feature-card">
          <h2>Leicht erweiterbar</h2>
          <p>Neue Karten, Bilder und Effekte lassen sich sauber über zentrale Daten ergänzen.</p>
        </article>
      </section>
    </main>
  );
}
