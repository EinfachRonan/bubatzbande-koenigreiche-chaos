import Link from "next/link";
import { CardLibraryClient } from "@/components/card-library-client";
import { BackButton } from "@/components/back-button";

export default function DeckbuilderPage() {
  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Deckbuilder</p>
          <h1>Deckbuilder &amp; Kartenarchiv</h1>
        </div>
        <div className="page-header-actions">
          <Link href="/" className="secondary-button">
            Startseite
          </Link>
          <BackButton className="ghost-button" />
        </div>
      </div>
      <CardLibraryClient />
    </main>
  );
}
