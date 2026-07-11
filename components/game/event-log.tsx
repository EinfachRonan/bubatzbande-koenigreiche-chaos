"use client";

import Link from "next/link";

type EventLogProps = {
  entries: string[];
  collapsed: boolean;
  onToggle: () => void;
  selectedCardName?: string | null;
  selectedCardEffect?: string | null;
  canCancelTarget?: boolean;
  onCancelTarget?: () => void;
};

export function EventLog({
  entries,
  collapsed,
  onToggle,
  selectedCardName,
  selectedCardEffect,
  canCancelTarget = false,
  onCancelTarget
}: EventLogProps) {
  return (
    <section className={`kh-log-panel ${collapsed ? "collapsed" : ""}`}>
      <div className="kh-log-head">
        <div>
          <h2 className="section-title">Ereignis-Log</h2>
        </div>
        <button className="ghost-button log-toggle" type="button" onClick={onToggle}>
          {collapsed ? "Log öffnen" : "Log einklappen"}
        </button>
      </div>

      {selectedCardName ? (
        <div className="kh-selected-card">
          <h3 className="section-title">Ausgewählte Karte</h3>
          <p className="hint-text">{selectedCardName}</p>
          {selectedCardEffect ? <p className="hint-text">{selectedCardEffect}</p> : null}
          {canCancelTarget ? (
            <button className="ghost-button" type="button" onClick={onCancelTarget}>
              Zielwahl abbrechen
            </button>
          ) : null}
        </div>
      ) : null}

      <ul className="kh-log-list">
        {entries.map((entry, index) => (
          <li key={`${entry}-${index}`}>{entry}</li>
        ))}
      </ul>

      <Link href="/cards" className="secondary-button kh-log-link">
        Deckbuilder öffnen
      </Link>
    </section>
  );
}
