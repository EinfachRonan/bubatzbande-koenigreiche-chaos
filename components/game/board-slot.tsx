"use client";

import { CardFrame } from "@/components/card-frame";
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
  if (!unit) {
    return (
      <button className="kh-board-slot kh-board-slot-empty" type="button" onClick={onClick}>
        <span className="kh-slot-watermark" aria-hidden="true" />
        <span className="kh-slot-diamond" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="kh-board-card-wrap">
      <CardFrame
        card={unit}
        compact
        selectable
        emphasis={side === "player" ? "player" : "enemy"}
        selected={selected}
        targetable={targetable || highlighted}
        footer={statusText ? <p className="hint-text unit-state-text">{statusText}</p> : undefined}
        onClick={onClick}
      />
    </div>
  );
}
