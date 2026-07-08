"use client";

import { CSSProperties } from "react";
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
  return (
    <section className="kh-hand-shell">
      <div className="kh-hand-rail" aria-hidden="true" />
      <div className="kh-deck-box">
        <span className="kh-card-back kh-card-back-stack" aria-hidden="true" />
        <div className="kh-deck-copy">
          <strong>{deckCount}</strong>
          <span>DECK</span>
        </div>
      </div>
      <div className="kh-hand-fan">
        {cards.map((card, index) => {
          const playIssue = getPlayIssue(card);
          const angle = (index - (cards.length - 1) / 2) * 4.5;
          const lift = Math.abs(index - (cards.length - 1) / 2) * -2;

          return (
            <div
              className="kh-hand-card"
              key={card.uid}
              style={
                {
                  "--fan-angle": `${angle}deg`,
                  "--fan-lift": `${lift}px`
                } as CSSProperties
              }
            >
              <CardFrame
                card={card}
                selectable
                compact
                emphasis="player"
                selected={selectedId === card.uid}
                disabled={Boolean(playIssue)}
                footer={<p className="hint-text">{playIssue ?? getPlayableCostText(card)}</p>}
                onClick={() => onSelect(card.uid)}
              />
            </div>
          );
        })}
      </div>
      <p className="kh-hand-instruction">Ziehe Karten • Spiele aus • Greife an • Beende deinen Zug</p>
    </section>
  );
}
