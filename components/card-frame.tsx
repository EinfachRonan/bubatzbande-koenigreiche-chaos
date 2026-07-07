"use client";

import { CardDefinition, DeckCard, UnitInstance } from "@/types/cards";

type CardLike = CardDefinition | DeckCard | UnitInstance;

function rarityClass(rarity: CardLike["rarity"]) {
  return `rarity-${rarity}`;
}

type CardFrameProps = {
  card: CardLike;
  selected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  targetable?: boolean;
  footer?: React.ReactNode;
  onClick?: () => void;
};

export function CardFrame({
  card,
  selected = false,
  selectable = false,
  disabled = false,
  targetable = false,
  footer,
  onClick
}: CardFrameProps) {
  const isUnit = "maxHealth" in card;

  return (
    <article
      className={[
        "card-frame",
        selectable ? "selectable" : "",
        selected ? "selected" : "",
        disabled ? "disabled" : "",
        targetable ? "targetable" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      role={selectable ? "button" : undefined}
      aria-disabled={disabled}
    >
      <div className="card-head">
        <span className="card-cost">Gold {card.cost}</span>
        <span className={`card-rarity ${rarityClass(card.rarity)}`}>{card.rarity}</span>
      </div>
      <h3 className="card-name">{card.name}</h3>
      <div className="card-art">{card.image.replace("/images/cards/", "").replace(".png", "")}</div>
      <p className="card-effect">{card.effect}</p>
      <div className="card-stats">
        <span className="card-badge">{card.type}</span>
        {isUnit ? (
          <>
            <span className="card-badge">ATK {card.attack}</span>
            <span className="card-badge">HP {card.health}/{card.maxHealth}</span>
          </>
        ) : "attack" in card && card.attack !== undefined ? (
          <>
            <span className="card-badge">ATK {card.attack}</span>
            <span className="card-badge">HP {card.health}</span>
          </>
        ) : null}
      </div>
      <div className="card-tags">
        {card.tags.map((tag) => (
          <span className="mini-badge" key={`${card.name}-${tag}`}>
            {tag}
          </span>
        ))}
      </div>
      {footer}
    </article>
  );
}
