"use client";

type TurnPanelProps = {
  turn: number;
  activeSide: "player" | "bot";
};

export function TurnPanel({ turn, activeSide }: TurnPanelProps) {
  return (
    <section className="kh-turn-panel">
      <div className="kh-turn-grid">
        <div className="kh-turn-cell">
          <span className="kh-turn-label">Runde</span>
          <strong>{turn}</strong>
        </div>
        <div className="kh-turn-cell">
          <span className="kh-turn-label">Zug</span>
          <strong className={activeSide === "player" ? "is-player" : "is-bot"}>
            {activeSide === "player" ? "DU" : "BOT"}
          </strong>
        </div>
      </div>
      <div className="kh-phase-panel">
        <span className="kh-turn-label">Phase</span>
        <strong>Hauptphase</strong>
        <div className="kh-phase-track" aria-hidden="true">
          <span />
          <span className={activeSide === "player" ? "is-active" : ""} />
          <span />
        </div>
      </div>
    </section>
  );
}
