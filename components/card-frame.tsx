"use client";

import { CardDefinition, DeckCard, UnitInstance } from "@/types/cards";

type CardLike = CardDefinition | DeckCard | UnitInstance;

function rarityClass(rarity: CardLike["rarity"]) {
  return `rarity-${rarity}`;
}

const typeLabel: Record<CardLike["type"], string> = {
  action: "Aktion",
  chaos: "Chaos",
  character: "Charakter",
  equipment: "Ausrüstung"
};

const rarityLabel: Record<CardLike["rarity"], string> = {
  common: "Gewöhnlich",
  rare: "Selten",
  epic: "Episch",
  legendary: "Legendär"
};

type CardFrameProps = {
  card: CardLike;
  selected?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  targetable?: boolean;
  compact?: boolean;
  emphasis?: "neutral" | "player" | "enemy";
  footer?: React.ReactNode;
  onClick?: () => void;
};

export function CardFrame({
  card,
  selected = false,
  selectable = false,
  disabled = false,
  targetable = false,
  compact = false,
  emphasis = "neutral",
  footer,
  onClick
}: CardFrameProps) {
  const isUnit = "maxHealth" in card;
  const shownAttack =
    isUnit && "temporaryAttackPenalty" in card ? Math.max(0, card.attack - card.temporaryAttackPenalty) : card.attack;
  const artLabel = card.image.replace("/images/cards/", "").replace(".png", "").replaceAll("-", " ");

  return (
    <article
      className={[
        "card-frame",
        `card-${emphasis}`,
        selectable ? "selectable" : "",
        selected ? "selected" : "",
        disabled ? "disabled" : "",
        targetable ? "targetable" : "",
        compact ? "compact" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      role={selectable ? "button" : undefined}
      aria-disabled={disabled}
    >
      <div className="card-crest" aria-hidden="true" />
      <div className="card-head">
        <span className="card-cost-orb" title="Gold = Ressource zum Ausspielen von Karten">
          <span className="card-orb-value">{card.cost}</span>
          <span className="card-orb-label">Gold</span>
        </span>
        <div className="card-head-copy">
          <p className="card-type-line" title={`${typeLabel[card.type]} = Kartentyp`}>
            {typeLabel[card.type]}
          </p>
          <h3 className="card-name">{card.name}</h3>
        </div>
        <span
          className={`card-rarity card-ribbon ${rarityClass(card.rarity)}`}
          title={`${rarityLabel[card.rarity]} = Seltenheitsstufe`}
        >
          {rarityLabel[card.rarity]}
        </span>
      </div>
      <div className="card-art-frame">
        <div className="card-art">
          <span className="card-art-label">Bildslot</span>
          <strong>{artLabel}</strong>
        </div>
      </div>
      <div className="card-script-box">
        <p className="card-effect">{card.effect}</p>
      </div>
      <div className="card-stats">
        <span className="card-badge" title={`${typeLabel[card.type]} = Kartentyp`}>
          {typeLabel[card.type]}
        </span>
        {isUnit ? (
          <>
            <span className="stat-seal attack-seal" title="Angriff = Schaden eines Charakters">
              <span className="stat-value">{shownAttack}</span>
              <span className="stat-label">Angriff</span>
            </span>
            <span className="stat-seal health-seal" title="Leben = Trefferpunkte eines Charakters">
              <span className="stat-value">
                {card.health}/{card.maxHealth}
              </span>
              <span className="stat-label">Leben</span>
            </span>
          </>
        ) : "attack" in card && card.attack !== undefined ? (
          <>
            <span className="stat-seal attack-seal" title="Angriff = Schaden eines Charakters">
              <span className="stat-value">{shownAttack}</span>
              <span className="stat-label">Angriff</span>
            </span>
            <span className="stat-seal health-seal" title="Leben = Trefferpunkte eines Charakters">
              <span className="stat-value">{card.health}</span>
              <span className="stat-label">Leben</span>
            </span>
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
