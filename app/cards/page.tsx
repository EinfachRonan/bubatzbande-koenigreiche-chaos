import Link from "next/link";
import { CardLibraryClient } from "@/components/card-library-client";
import { BackButton } from "@/components/back-button";

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
      <CardLibraryClient />
    </main>
  );
}
