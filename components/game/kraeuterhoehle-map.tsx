"use client";

import { ReactNode, useEffect, useState } from "react";

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
  centerOverlay?: ReactNode;
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
  statusBanner,
  centerOverlay
}: KraeuterhoehleMapProps) {
  const [hideOrientationWarning, setHideOrientationWarning] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId: number | null = null;

    const syncOrientationWarning = () => {
      const isSmallScreen = window.innerWidth <= 960 || window.innerHeight <= 620;
      const isLandscape = window.innerWidth > window.innerHeight;

      if (!isSmallScreen || !isLandscape) {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        setHideOrientationWarning(false);
        return;
      }

      setHideOrientationWarning(false);
      timeoutId = window.setTimeout(() => {
        setHideOrientationWarning(true);
        timeoutId = null;
      }, 2000);
    };

    syncOrientationWarning();
    window.addEventListener("resize", syncOrientationWarning);
    window.addEventListener("orientationchange", syncOrientationWarning);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", syncOrientationWarning);
      window.removeEventListener("orientationchange", syncOrientationWarning);
    };
  }, []);

  return (
    <section className="kh-shell">
      <div className={`kh-orientation-warning${hideOrientationWarning ? " is-hidden" : ""}`}>
        <div className="kh-orientation-card">
          <h2>Bitte drehe dein Geraet ins Querformat.</h2>
          <p>Die Kraeuterhoehle ist fuer Landscape optimiert.</p>
        </div>
      </div>

      <div className="kh-map-stage">
        <div className="kh-background" aria-hidden="true" />
        <div className="kh-overlay" aria-hidden="true" />

        {statusBanner ? <div className="kh-status-banner">{statusBanner}</div> : null}
        {centerOverlay ? <div className="kh-center-overlay">{centerOverlay}</div> : null}

        <div className="kh-anchor kh-anchor-top-left">{topLeft}</div>
        <div className="kh-anchor kh-anchor-bottom-left">{bottomLeft}</div>
        <div className="kh-anchor kh-anchor-top-hand">{topHand}</div>
        <div className="kh-anchor kh-anchor-top-deck">{topDeck}</div>
        <div className="kh-anchor kh-anchor-enemy-board">{enemyBoard}</div>
        <div className="kh-anchor kh-anchor-player-board">{playerBoard}</div>
        <div className="kh-anchor kh-anchor-right-top">{rightTop}</div>
        <div className="kh-anchor kh-anchor-right-middle">{rightMiddle}</div>
        <div className="kh-anchor kh-anchor-right-bottom">{rightBottom}</div>
        <div className="kh-anchor kh-anchor-hand">{hand}</div>
      </div>
    </section>
  );
}
