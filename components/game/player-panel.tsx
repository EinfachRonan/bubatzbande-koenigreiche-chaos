"use client";

type PlayerPanelProps = {
  side: "player" | "bot";
  name: string;
  honor: number;
  gold: number;
  maxGold: number;
  pulse?: boolean;
  targetable?: boolean;
  onLeaderClick?: () => void;
};

export function PlayerPanel({
  side,
  name,
  honor,
  gold,
  maxGold,
  pulse = false,
  targetable = false,
  onLeaderClick
}: PlayerPanelProps) {
  return (
    <button
      className={[
        "kh-player-panel",
        `kh-player-panel-${side}`,
        pulse ? "leader-pulse" : "",
        targetable ? "leader-target" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      type="button"
      onClick={targetable ? onLeaderClick : undefined}
    >
      <span className="kh-player-avatar" aria-hidden="true" />
      <div className="kh-player-copy">
        <div className="kh-player-headline">
          <strong>{name}</strong>
          <span className="kh-player-crest" aria-hidden="true" />
        </div>
        <div className="kh-player-stats">
          <span title="Ehre = Leben des Spielers">
            <em className="kh-heart" aria-hidden="true" />
            {honor}
          </span>
          <span title="Gold = Ressource zum Ausspielen von Karten">
            <em className="kh-coin" aria-hidden="true" />
            {gold}/{maxGold}
          </span>
        </div>
      </div>
    </button>
  );
}
