import { MatchClient } from "@/components/match-client";

export default function GamePage() {
  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">Spielmodus</p>
          <h1>Königreiche &amp; Chaos</h1>
        </div>
      </div>
      <MatchClient />
    </main>
  );
}
