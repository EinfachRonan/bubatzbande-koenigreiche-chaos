import Link from "next/link";

const heroFigures = [
  {
    src: "/images/cards/der-gruene-kobold.png",
    alt: "Der grüne Kobold",
    className: "home-figure is-left-edge"
  },
  {
    src: "/images/cards/der-koenig-von-deutschland.png",
    alt: "Der König von Deutschland",
    className: "home-figure is-left-king"
  },
  {
    src: "/images/cards/allan-king-kebab.png",
    alt: "Allan King Kebab",
    className: "home-figure is-center-alpha"
  },
  {
    src: "/images/cards/der-kraeuterkoenig.png",
    alt: "Der Kräuterkönig",
    className: "home-figure is-right-queen"
  },
  {
    src: "/images/cards/mr-mollymann.png",
    alt: "Mr Mollymann",
    className: "home-figure is-right-edge"
  }
];

const featureLinks = [
  {
    eyebrow: "Archiv",
    title: "Über 180 Karten",
    description: "Entdecke Helden, Zauber, Ausrüstung und Chaos-Effekte im aktuellen Set.",
    href: "#kartenarchiv"
  },
  {
    eyebrow: "Fraktionen",
    title: "4 Fraktionen",
    description: "Wähle deine Seite und lerne, wie sich jedes Reich anders anfühlt.",
    href: "#fraktionen"
  },
  {
    eyebrow: "Mastery",
    title: "Strategie & Taktik",
    description: "Nutze Gold, Tempo und Positionierung, um das Chaos auf deine Seite zu ziehen.",
    href: "#strategie"
  },
  {
    eyebrow: "Arenen",
    title: "Ranglisten & Events",
    description: "Bereite dein Deck für kommende Modi, Community-Abende und Wettkämpfe vor.",
    href: "#events"
  }
];

const factionCards = [
  {
    title: "Kobolde & Schurken",
    text: "Listige Goldräuber, schnelle Vorstöße und frühe Tempowechsel."
  },
  {
    title: "Königshäuser",
    text: "Standhafte Anführer, aurenstarke Buffs und langlebige Fronten."
  },
  {
    title: "Nebel & Geister",
    text: "Kontrolle, Flüche und schwer greifbare Bedrohungen aus dem Schatten."
  },
  {
    title: "Pioniere & Schmiede",
    text: "Werkzeuge, Wert über Zeit und stetig wachsende Kampfkraft."
  }
];

const strategyPoints = [
  "Baue dein Deck um klare Siegpläne statt um einzelne Lieblingskarten.",
  "Plane Goldkurve, Board-Slots und Wiedereinstiege nach Chaos-Effekten mit ein.",
  "Nutze Kartenbibliothek und Deckbuilder als Vorbereitung für die Kräuterhöhle."
];

export function HomepageLanding() {
  return (
    <main className="home-page">
      <section className="home-hero-shell">
        <div className="home-hero-frame">
          <div className="home-reference-wash" aria-hidden="true" />
          <div className="home-vignette" aria-hidden="true" />
          <div className="home-banner home-banner-left" aria-hidden="true" />
          <div className="home-banner home-banner-right" aria-hidden="true" />
          <div className="home-hero-inner">
            <div className="home-title-stack">
              <div className="home-crest" aria-hidden="true" />
              <p className="home-kicker">Fantasy-Kartenspiel</p>
              <h1 className="home-title">
                <span>BubatzBande</span>
                <span>Königreiche &amp; Chaos</span>
              </h1>
              <p className="home-tagline">
                Ein episches Kartenspiel voller Strategie, Magie und Machtkämpfe.
                Baue dein Deck. Beherrsche deine Fraktion. Schreibe deine Legende.
              </p>
            </div>

            <div className="home-figure-row" aria-label="Charaktere aus BubatzBande">
              {heroFigures.map((figure) => (
                <div className={figure.className} key={figure.alt}>
                  <div className="home-figure-frame">
                    <img src={figure.src} alt={figure.alt} className="home-figure-image" />
                  </div>
                </div>
              ))}
            </div>

            <div className="home-action-row">
              <Link href="/cards" className="home-cta home-cta-secondary">
                Kartenset ansehen
              </Link>
              <Link href="/game" className="home-cta home-cta-primary">
                Spiel starten
              </Link>
              <Link href="/deckbuilder" className="home-cta home-cta-secondary">
                Deckbuilder
              </Link>
            </div>

            <div className="home-scroll-row">
              <a href="#erkunden" className="home-scroll-link">
                Mehr erfahren
              </a>
            </div>
          </div>
        </div>

        <div className="home-feature-ribbon" id="erkunden">
          {featureLinks.map((item) => (
            <a key={item.title} href={item.href} className="home-feature-card">
              <p className="home-feature-eyebrow">{item.eyebrow}</p>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="kartenarchiv" className="home-detail-section">
        <div className="home-section-heading">
          <p className="eyebrow">Kartenarchiv</p>
          <h2 className="section-title">Ein wachsendes Set für jedes Reich</h2>
          <p className="home-section-copy">
            Die Startkollektion verbindet Charaktere, Aktionen, Chaos-Karten und Ausrüstung
            in einer gemeinsamen dunklen Fantasy-Welt. Bibliothek und Deckbuilder bleiben
            direkt miteinander verbunden.
          </p>
        </div>
        <div className="home-detail-card-grid">
          <article className="home-detail-card">
            <h3>Charaktere</h3>
            <p>Helden, Herrscher und Kreaturen mit klaren Rollen auf dem Brett.</p>
          </article>
          <article className="home-detail-card">
            <h3>Aktionen</h3>
            <p>Soforteffekte für Heilung, Kontrolle, Tempo und Goldvorteile.</p>
          </article>
          <article className="home-detail-card">
            <h3>Chaos</h3>
            <p>Unberechenbare Wendungen, die jedes Match plötzlich kippen lassen.</p>
          </article>
        </div>
        <div className="home-section-actions">
          <Link href="/cards" className="primary-button">
            Zur Kartenbibliothek
          </Link>
          <Link href="/deckbuilder" className="ghost-button">
            Deckbuilder öffnen
          </Link>
        </div>
      </section>

      <section id="fraktionen" className="home-detail-section">
        <div className="home-section-heading">
          <p className="eyebrow">Fraktionen</p>
          <h2 className="section-title">Vier Seiten, vier Spielweisen</h2>
          <p className="home-section-copy">
            Jede Gruppe setzt andere Schwerpunkte. Die Fraktionsübersicht ist als lebendiger
            Einstieg gedacht und führt direkt in Sammlung und Matches.
          </p>
        </div>
        <div className="home-faction-grid">
          {factionCards.map((card) => (
            <article key={card.title} className="home-faction-card">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="strategie" className="home-detail-section">
        <div className="home-section-heading">
          <p className="eyebrow">Strategie</p>
          <h2 className="section-title">Entscheidungen mit Gewicht</h2>
          <p className="home-section-copy">
            Zwischen Goldkurve, Todeseffekten, Ausrüstung und direkten Angriffen lebt das
            Spiel davon, dass jede Runde einen klaren Plan braucht.
          </p>
        </div>
        <div className="home-strategy-panel">
          <ul className="home-strategy-list">
            {strategyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="home-section-actions">
            <Link href="/game" className="primary-button">
              In die Kräuterhöhle
            </Link>
            <Link href="/cards" className="secondary-button">
              Karten studieren
            </Link>
          </div>
        </div>
      </section>

      <section id="events" className="home-detail-section">
        <div className="home-section-heading">
          <p className="eyebrow">Events</p>
          <h2 className="section-title">Ranglisten und Sonderformate im Aufbau</h2>
          <p className="home-section-copy">
            Die Arena wächst weiter. Bis Ranglisten live gehen, kannst du Decks vorbereiten,
            Matchups testen und deine Kartenbasis ausbauen.
          </p>
        </div>
        <div className="home-event-panel">
          <div>
            <h3>Bereit für kommende Wettkämpfe</h3>
            <p>
              Nutze den aktuellen MVP, optimiere dein Deck lokal und trainiere deine Züge
              schon jetzt in der Spielansicht.
            </p>
          </div>
          <div className="home-section-actions">
            <Link href="/deckbuilder" className="primary-button">
              Deck vorbereiten
            </Link>
            <Link href="/game" className="ghost-button">
              Match testen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
