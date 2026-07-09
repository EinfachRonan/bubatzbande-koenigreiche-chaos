"use client";

import { useEffect, useState } from "react";
import { CardFrame } from "@/components/card-frame";
import { MatchState } from "@/lib/game";

type HandCard = MatchState["player"]["hand"][number];

type HandCardsProps = {
  cards: HandCard[];
  deckCount: number;
  selectedId: string | null;
  getPlayIssue: (card: HandCard) => string | null;
  getPlayableCostText: (card: HandCard) => string;
  onSelect: (cardId: string) => void;
};

export function HandCards({
  cards,
  deckCount,
  selectedId,
  getPlayIssue,
  getPlayableCostText,
  onSelect
}: HandCardsProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewCard = cards.find((card) => card.uid === previewId) ?? null;
  const previewIssue = previewCard ? getPlayIssue(previewCard) : null;

  useEffect(() => {
    if (previewId && !previewCard) {
      setPreviewId(null);
    }
  }, [previewCard, previewId]);

  return (
    <section className="kh-hand-shell">
      <div className="kh-hand-rail" aria-hidden="true" />
      <div className="kh-deck-box kh-hand-deck-box">
        <span className="kh-card-back kh-card-back-stack" aria-hidden="true" />
        <div className="kh-deck-copy">
          <strong>{deckCount}</strong>
          <span>DECK</span>
        </div>
      </div>

      <div className="kh-hand-fan">
        {cards.map((card) => {
          const playIssue = getPlayIssue(card);
          const hasStats = typeof card.attack === "number" && typeof card.health === "number";

          return (
            <button
              type="button"
              className={[
                "kh-hand-mini-card",
                selectedId === card.uid || previewId === card.uid ? "selected" : "",
                playIssue ? "disabled" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={card.uid}
              onClick={() => setPreviewId((current) => (current === card.uid ? null : card.uid))}
              aria-pressed={previewId === card.uid}
            >
              <span className="kh-hand-mini-cost">{card.cost}</span>
              <span className="kh-hand-mini-name">{card.name}</span>
              {hasStats ? (
                <span className="kh-hand-mini-stats" aria-hidden="true">
                  <span className="kh-hand-mini-stat attack">
                    <strong>{card.attack}</strong>
                    <small>ANG</small>
                  </span>
                  <span className="kh-hand-mini-stat health">
                    <strong>{card.health}</strong>
                    <small>LP</small>
                  </span>
                </span>
              ) : null}
              <span className="kh-hand-mini-meta">{playIssue ?? getPlayableCostText(card)}</span>
            </button>
          );
        })}
      </div>

      {previewCard ? (
        <div className="kh-card-preview-backdrop" onClick={() => setPreviewId(null)}>
          <div
            className="kh-card-preview"
            role="dialog"
            aria-label={`Kartenvorschau ${previewCard.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="kh-card-preview-close"
              type="button"
              onClick={() => setPreviewId(null)}
              aria-label="Kartenvorschau schliessen"
            >
              x
            </button>
            <div className="kh-card-preview-frame">
              <CardFrame
                card={previewCard}
                compact
                emphasis="player"
                disabled={Boolean(previewIssue)}
                footer={<p className="hint-text">{previewIssue ?? getPlayableCostText(previewCard)}</p>}
              />
            </div>
            <button
              className="kh-card-preview-play"
              type="button"
              disabled={Boolean(previewIssue)}
              onClick={() => {
                onSelect(previewCard.uid);
                setPreviewId(null);
              }}
            >
              Karte ausspielen
            </button>
          </div>
        </div>
      ) : null}

      <p className="kh-hand-instruction">Karte anklicken: Vorschau. In der Vorschau ausspielen.</p>
    </section>
  );
}
