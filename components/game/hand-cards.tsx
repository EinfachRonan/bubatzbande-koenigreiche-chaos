"use client";

import { FocusEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { CardFrame } from "@/components/card-frame";
import { MatchState } from "@/lib/game";

type HandCard = MatchState["player"]["hand"][number];

type HandCardsProps = {
  cards: HandCard[];
  deckCount: number;
  currentGold: number;
  maxGold: number;
  selectedId: string | null;
  locked?: boolean;
  getPlayIssue: (card: HandCard) => string | null;
  getPlayableCostText: (card: HandCard) => string;
  onSelect: (cardId: string) => void;
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
  const closeTimeoutRef = useRef<number | null>(null);
  const previewCard = cards.find((card) => card.uid === previewId) ?? null;
  const previewIssue = previewCard ? getPlayIssue(previewCard) : null;

  useEffect(() => {
    if (previewId && !previewCard) {
      setPreviewId(null);
    }
  }, [previewCard, previewId]);

  useEffect(() => {
    if (locked) {
      setPreviewId(null);
    }
  }, [locked]);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    []
  );

  function openPreview(cardId: string) {
    if (locked) {
      return;
    }
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setPreviewId(cardId);
  }

  function closePreviewSoon() {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setPreviewId(null);
      closeTimeoutRef.current = null;
    }, 900);
  }

  function isInsidePreviewZone(target: EventTarget | null) {
    return target instanceof HTMLElement && Boolean(target.closest("[data-hand-preview-zone='true']"));
  }

  function handleCardLeave(event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) {
    if (isInsidePreviewZone(event.relatedTarget)) {
      return;
    }
    closePreviewSoon();
  }

  function handlePreviewLeave(event: MouseEvent<HTMLDivElement> | FocusEvent<HTMLDivElement>) {
    if (isInsidePreviewZone(event.relatedTarget)) {
      return;
    }
    closePreviewSoon();
  }

  return (
    <section className="kh-hand-shell">
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
            <strong>{currentGold}</strong>
            <span>/ {maxGold} Gold</span>
          </div>
        </div>
      </div>

      <div className="kh-hand-fan">
        {cards.map((card) => {
          const playIssue = getPlayIssue(card);
          const hasStats = typeof card.attack === "number" && typeof card.health === "number";
          const canPlay = !playIssue;

          return (
            <button
              type="button"
              className={[
                "kh-hand-mini-card",
                selectedId === card.uid || previewId === card.uid ? "selected" : "",
                locked ? "locked" : "",
                playIssue ? "disabled" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={card.uid}
              data-hand-preview-zone="true"
              onMouseEnter={() => openPreview(card.uid)}
              onMouseLeave={handleCardLeave}
              onFocus={() => openPreview(card.uid)}
              onBlur={handleCardLeave}
              onClick={() => openPreview(card.uid)}
              aria-pressed={previewId === card.uid}
              aria-label={`${card.name}. ${playIssue ?? getPlayableCostText(card)}`}
              disabled={locked}
            >
              <span
                className="kh-hand-mini-art"
                aria-hidden="true"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <span
                className={[
                  "kh-hand-mini-cost",
                  canPlay ? "is-affordable" : "is-unaffordable"
                ].join(" ")}
                title={getPlayableCostText(card)}
              >
                <small>G</small>
                {card.cost}
              </span>
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
            </button>
          );
        })}
      </div>

      {previewCard && !locked ? (
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

      {!locked ? (
        <p className="kh-hand-instruction">Karte anhovern: Vorschau. In der Vorschau ausspielen.</p>
      ) : null}
    </section>
  );
}
