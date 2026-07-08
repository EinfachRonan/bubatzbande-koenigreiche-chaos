import { CardLibraryClient } from "@/components/card-library-client";

export default function DeckbuilderPage() {
  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Deckbuilder</p>
          <h1>Deckbuilder &amp; Kartenarchiv</h1>
        </div>
      </div>
      <CardLibraryClient />
    </main>
  );
}
