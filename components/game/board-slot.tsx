"use client";

import Image from "next/image";
import { MatchState } from "@/lib/game";

type BoardSlotProps = {
  side: "player" | "bot";
  unit?: MatchState["player"]["board"][number];
  selected?: boolean;
  highlighted?: boolean;
  targetable?: boolean;
  statusText?: string;
  onClick?: () => void;
};

export function BoardSlot({
  side,
  unit,
  selected = false,
  highlighted = false,
  targetable = false,
  statusText,
  onClick
}: BoardSlotProps) {
  const shownAttack = unit ? Math.max(0, unit.attack - unit.temporaryAttackPenalty) : 0;
  const artFit = unit?.imageFit ?? "cover";
  const artPosition = unit?.imagePosition ?? "center center";

  if (!unit) {
    return (
      <button className="kh-board-slot kh-board-slot-empty" type="button" onClick={onClick}>
        <span className="kh-slot-watermark" aria-hidden="true" />
        <span className="kh-slot-diamond" aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      className={[
        "kh-board-mini-card",
        side === "player" ? "is-player" : "is-enemy",
        selected ? "is-selected" : "",
        highlighted ? "is-highlighted" : "",
        targetable ? "is-targetable" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      type="button"
      onClick={onClick}
    >
      <div className="kh-board-mini-head">
        <h3>{unit.name}</h3>
      </div>
      <div className="kh-board-mini-art">
        <Image
          src={unit.image}
          alt={unit.name}
          fill
          sizes="(max-width: 900px) 18vw, 180px"
          className="kh-board-mini-art-image"
          style={{ objectFit: artFit, objectPosition: artPosition }}
        />
      </div>
      <div className="kh-board-mini-stats">
        <span className="kh-board-mini-stat attack" title="Angriff = Schaden eines Charakters">
          <strong>{shownAttack}</strong>
          <small>ANG</small>
        </span>
        <span className="kh-board-mini-stat health" title="Leben = Trefferpunkte eines Charakters">
          <strong>{unit.health}</strong>
          <small>LP</small>
        </span>
      </div>
      {statusText ? <span className="kh-board-mini-status">{statusText}</span> : null}
    </button>
  );
}
