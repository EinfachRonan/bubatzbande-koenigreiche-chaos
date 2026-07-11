"use client";

import { useEffect, useState } from "react";
import { CardFrame } from "@/components/card-frame";
import { DeckCard } from "@/types/cards";

type HandCard = DeckCard;

type HandCardsProps = {
  cards: HandCard[];
  deckCount: number;
  currentGold: number;
  maxGold: number;
  selectedId: string | null;
  locked?: boolean;
  getPlayIssue: (card: HandCard) => string | null;
  getPlayableCostText: (card: HandCard) => string;
  onSelect: (handCardId: string) => void;
};

export function HandCards({
  cards,
  deckCount,
  currentGold,
  maxGold,
  selectedId,
  locked = false,
  getPlayIssue,
  getPlayableCostText,
  onSelect
}: HandCardsProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!previewId) {
      return;
    }

    const exists = cards.some((card) => card.uid === previewId);
    if (!exists) {
      setPreviewId(null);
    }
  }, [cards, previewId]);

  useEffect(() => {
    if (selectedId) {
      setPreviewId(selectedId);
    }
  }, [selectedId]);

  const previewCard = cards.find((card) => card.uid === previewId) ?? null;
  const previewIssue = previewCard ? getPlayIssue(previewCard) : null;

  function openPreview(handCardId: string) {
    setPreviewId(handCardId);
  }

  function handlePreviewLeave(event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>) {
    const relatedTarget = event.relatedTarget;
    if (!(relatedTarget instanceof HTMLElement)) {
      return;
    }
    if (relatedTarget.closest("[data-hand-preview-zone='true']")) {
      return;
    }
    setPreviewId(null);
  }

  return (
    <div className="kh-hand-shell">
      <div className="kh-hand-rail" aria-hidden="true" />
      <div className="kh-hand-side-stack">
        <div className="kh-deck-box kh-hand-deck-box">
          <span className="kh-card-back kh-card-back-stack" aria-hidden="true" />
          <div className="kh-deck-copy">
            <strong>{deckCount}</strong>
            <span>DECK</span>
          </div>
        </div>
        <div className="kh-hand-gold-box" title="Gold = Ressource zum Ausspielen von Karten">
          <span className="kh-hand-gold-icon" aria-hidden="true">
            G
          </span>
          <div className="kh-hand-gold-copy">
            <strong>
              {currentGold}/{maxGold}
            </strong>
            <span>Gold</span>
          </div>
        </div>
      </div>

      <div className="kh-hand-fan">
        {cards.map((card) => {
          const playIssue = getPlayIssue(card);
          const isSelected = selectedId === card.uid;
          const canPlay = !playIssue;
          const isAffordable = card.cost <= currentGold;

          return (
            <button
              key={card.uid}
              type="button"
              className={[
                "kh-hand-mini-card",
                isSelected ? "selected" : "",
                locked ? "locked" : "",
                playIssue ? "disabled" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              data-hand-preview-zone="true"
              onMouseEnter={() => openPreview(card.uid)}
              onMouseLeave={handlePreviewLeave}
              onFocus={() => openPreview(card.uid)}
              onBlur={handlePreviewLeave}
              onClick={() => onSelect(card.uid)}
              aria-label={`${card.name}. ${playIssue ?? getPlayableCostText(card)}`}
            >
              <span
                className="kh-hand-mini-art"
                aria-hidden="true"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <span
                className={[
                  "kh-hand-mini-cost",
                  isAffordable ? "is-affordable" : "is-unaffordable"
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {card.cost}
                <small>G</small>
              </span>
              <span className="kh-hand-mini-name">{card.name}</span>
              {"attack" in card && card.attack !== undefined ? (
                <span className="kh-hand-mini-stats" aria-hidden="true">
                  <span className="kh-hand-mini-stat">
                    <strong>{card.attack}</strong>
                    <small>ANG</small>
                  </span>
                  <span className="kh-hand-mini-stat">
                    <strong>{card.health}</strong>
                    <small>LP</small>
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="kh-hand-instruction">Karte auswählen für Vorschau und Ausspielen.</p>

      {previewCard ? (
        <div
          className="kh-card-preview-backdrop"
          data-hand-preview-zone="true"
          onMouseEnter={() => openPreview(previewCard.uid)}
          onMouseLeave={handlePreviewLeave}
          onClick={() => setPreviewId(null)}
        >
          <div
            className="kh-card-preview"
            role="dialog"
            aria-label={`Kartenvorschau ${previewCard.name}`}
            data-hand-preview-zone="true"
            onMouseEnter={() => openPreview(previewCard.uid)}
            onMouseLeave={handlePreviewLeave}
            onBlur={handlePreviewLeave}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="kh-card-preview-close"
              type="button"
              onClick={() => setPreviewId(null)}
              aria-label="Kartenvorschau schließen"
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
              Ausspielen
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
