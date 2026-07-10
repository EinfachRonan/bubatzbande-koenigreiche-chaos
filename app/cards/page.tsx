import Image from "next/image";
import Link from "next/link";
import { CardLibraryClient } from "@/components/card-library-client";
import { BackButton } from "@/components/back-button";

const characterCuts = [
  "der-gruene-kobold",
  "der-koenig-von-deutschland",
  "artur-king-kebab",
  "allan-king-kebab",
  "marvin-der-pionier",
  "mr-mollymann",
  "der-runenmutant",
  "kleine-nille",
  "lg3",
  "donpatron",
  "der-graue-geist",
  "der-kraeuterkoenig",
  "fokuhilamann"
] as const;

export default function CardsPage() {
  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Starter Set</p>
          <h1>Kartenbibliothek &amp; Deckbuilder</h1>
        </div>
        <div className="page-header-actions">
          <Link href="/" className="secondary-button">
            Startseite
          </Link>
          <BackButton className="ghost-button" />
        </div>
      </div>

      <section className="asset-sheet-panel">
        <div className="asset-sheet-frame">
          <Image
            src="/images/home/asset-overview-reference.png"
            alt="Asset-Uebersicht von BubatzBande: Koenigreiche & Chaos"
            width={1448}
            height={1086}
            className="asset-sheet-image"
            priority
          />
        </div>

        <div className="asset-cut-grid">
          {characterCuts.map((characterId) => (
            <figure key={characterId} className="asset-cut-card">
              <Image
                src={`/images/sheet-cuts/characters/${characterId}.png`}
                alt={characterId}
                width={214}
                height={170}
                className="asset-cut-image"
              />
              <figcaption>{characterId}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <CardLibraryClient />
    </main>
  );
}
