"use client";

import { ReactNode } from "react";

type KraeuterhoehleMapProps = {
  topLeft: ReactNode;
  bottomLeft: ReactNode;
  topHand: ReactNode;
  topDeck: ReactNode;
  enemyBoard: ReactNode;
  playerBoard: ReactNode;
  rightTop: ReactNode;
  rightMiddle: ReactNode;
  rightBottom: ReactNode;
  hand: ReactNode;
  statusBanner?: ReactNode;
};

export function KraeuterhoehleMap({
  topLeft,
  bottomLeft,
  topHand,
  topDeck,
  enemyBoard,
  playerBoard,
  rightTop,
  rightMiddle,
  rightBottom,
  hand,
  statusBanner
}: KraeuterhoehleMapProps) {
  return (
    <section className="kh-shell">
      <div className="kh-background" aria-hidden="true" />
      <div className="kh-overlay" aria-hidden="true" />
      <div className="kh-orientation-warning">
        <div className="kh-orientation-card">
          <h2>Bitte drehe dein Geraet ins Querformat.</h2>
          <p>Die Kraeuterhoehle ist fuer Landscape optimiert.</p>
        </div>
      </div>

      {statusBanner ? <div className="kh-status-banner">{statusBanner}</div> : null}

      <div className="kh-layout">
        <aside className="kh-left-rail">
          {topLeft}
          {bottomLeft}
        </aside>

        <main className="kh-center-stage">
          <div className="kh-top-strip">
            <div className="kh-opponent-hand">{topHand}</div>
            <div className="kh-opponent-deck">{topDeck}</div>
          </div>

          <div className="kh-board-shell">
            <section className="kh-board-row kh-board-row-top">{enemyBoard}</section>

            <div className="kh-board-center">
              <span className="kh-divider-line kh-divider-left" aria-hidden="true" />
              <div className="kh-map-badge">
                <strong>Kraeuterhoehle</strong>
                <span>Ruhe. Kraeuter. Kontrolle.</span>
              </div>
              <span className="kh-divider-line kh-divider-right" aria-hidden="true" />
            </div>

            <section className="kh-board-row kh-board-row-bottom">{playerBoard}</section>
          </div>

          {hand}
        </main>

        <aside className="kh-right-rail">
          {rightTop}
          {rightMiddle}
          {rightBottom}
        </aside>
      </div>
    </section>
  );
}
