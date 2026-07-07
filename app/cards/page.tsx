import { CardLibraryClient } from "@/components/card-library-client";

export default function CardsPage() {
  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Starter Set</p>
          <h1>Kartenbibliothek &amp; Deckbuilder</h1>
        </div>
      </div>
      <CardLibraryClient />
    </main>
  );
}
