"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CardFrame } from "@/components/card-frame";
import { runBotTurn } from "@/lib/bot";
import {
  AttackTarget,
  MatchState,
  attackWithUnit,
  cancelTargetMode,
  canPlayCard,
  createInitialMatchState,
  describeWinner,
  endTurn,
  getCardByUid,
  getPlayableCost,
  getValidAttackTargets,
  playCard
} from "@/lib/game";

export function MatchClient() {
  const [state, setState] = useState<MatchState>(() => createInitialMatchState());
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);

  useEffect(() => {
    if (state.winner || state.activeSide !== "bot") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setState((current) => runBotTurn(current));
      setSelectedAttackerId(null);
      setSelectedHandCardId(null);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [state.activeSide, state.winner]);

  const winnerText = describeWinner(state);

  function selectHandCard(handCardId: string) {
    if (state.activeSide !== "player" || state.winner) {
      return;
    }

    const card = getCardByUid(state, "player", handCardId);
    if (!card) {
      return;
    }

    if (!canPlayCard(state, "player", card)) {
      return;
    }

    const nextState = playCard(state, "player", handCardId);
    if (nextState.targetMode) {
      setState(nextState);
      setSelectedHandCardId(handCardId);
      setSelectedAttackerId(null);
      return;
    }

    if (nextState !== state) {
      setState(nextState);
      setSelectedHandCardId(null);
      setSelectedAttackerId(null);
      return;
    }

    setSelectedHandCardId((current) => (current === handCardId ? null : handCardId));
    setSelectedAttackerId(null);
  }

  function onBoardClick(unitId: string, side: "player" | "bot") {
    if (state.activeSide !== "player" || state.winner) {
      return;
    }

    if (state.targetMode && selectedHandCardId) {
      if (state.targetMode.target === "ally-unit" && side === "player") {
        setState((current) =>
          playCard(current, "player", selectedHandCardId, {
            kind: "unit",
            side: "player",
            unitId
          })
        );
        setSelectedHandCardId(null);
        return;
      }

      if (state.targetMode.target === "enemy-unit" && side === "bot") {
        setState((current) =>
          playCard(current, "player", selectedHandCardId, {
            kind: "unit",
            side: "bot",
            unitId
          })
        );
        setSelectedHandCardId(null);
        return;
      }
    }

    if (side === "player") {
      setSelectedAttackerId((current) => (current === unitId ? null : unitId));
      setSelectedHandCardId(null);
      return;
    }

    if (selectedAttackerId) {
      setState((current) =>
        attackWithUnit(current, "player", selectedAttackerId, {
          kind: "unit",
          side: "bot",
          unitId
        })
      );
      setSelectedAttackerId(null);
    }
  }

  function attackLeader(side: "player" | "bot") {
    if (!selectedAttackerId || side !== "bot") {
      return;
    }
    setState((current) =>
      attackWithUnit(current, "player", selectedAttackerId, { kind: "leader", side: "bot" })
    );
    setSelectedAttackerId(null);
  }

  function getTargetableClass(target: AttackTarget) {
    if (!selectedAttackerId) {
      return false;
    }
    return getValidAttackTargets(state, "player", selectedAttackerId).some((entry) => {
      if (entry.kind !== target.kind) {
        return false;
      }
      if (entry.kind === "leader" && target.kind === "leader") {
        return true;
      }
      return entry.kind === "unit" && target.kind === "unit" && entry.unitId === target.unitId;
    });
  }

  const selectedCard = selectedHandCardId ? getCardByUid(state, "player", selectedHandCardId) : null;

  return (
    <section className="match-shell">
      <div className="status-banner">
        {winnerText ??
          (state.targetMode?.prompt ||
            (state.activeSide === "player"
              ? "Dein Zug. Spiele Karten aus oder schicke deine Bande in den Kampf."
              : "Der Bot schmiedet gerade seinen nächsten fragwürdigen Plan."))}
      </div>

      <div className="top-row">
        <div className="turn-pill">Runde {state.turn}</div>
        <div className="turn-actions">
          <button
            className="ghost-button"
            onClick={() => {
              setState(createInitialMatchState());
              setSelectedHandCardId(null);
              setSelectedAttackerId(null);
            }}
          >
            Neues Match
          </button>
          <button
            className="action-button"
            onClick={() => {
              setState((current) => endTurn(current));
              setSelectedAttackerId(null);
              setSelectedHandCardId(null);
            }}
            disabled={state.activeSide !== "player" || Boolean(state.winner)}
          >
            Zug beenden
          </button>
        </div>
      </div>

      <div className="match-grid">
        <div className="arena-column">
          <PlayerHud
            side="bot"
            name="Chaos-Bot"
            honor={state.bot.honor}
            gold={state.bot.gold}
            maxGold={state.bot.maxGold}
            deck={state.bot.deck.length}
            hand={state.bot.hand.length}
            board={state.bot.board.length}
            onLeaderClick={() => attackLeader("bot")}
            leaderTargetable={getTargetableClass({ kind: "leader", side: "bot" })}
          />

          <BoardRow
            title="Bot-Spielfeld"
            units={state.bot.board}
            selectedId={selectedAttackerId}
            onUnitClick={(unitId) => onBoardClick(unitId, "bot")}
            isTargetable={(unitId) => getTargetableClass({ kind: "unit", side: "bot", unitId })}
          />

          <BoardRow
            title="Dein Spielfeld"
            units={state.player.board}
            selectedId={selectedAttackerId}
            onUnitClick={(unitId) => onBoardClick(unitId, "player")}
            isTargetable={() => state.targetMode?.target === "ally-unit"}
          />

          <PlayerHud
            side="player"
            name="Dein Reich"
            honor={state.player.honor}
            gold={state.player.gold}
            maxGold={state.player.maxGold}
            deck={state.player.deck.length}
            hand={state.player.hand.length}
            board={state.player.board.length}
          />

          <section className="hand-row">
            <h2 className="section-title">Deine Hand</h2>
            <div className="hand-cards">
              {state.player.hand.map((card) => (
                <CardFrame
                  key={card.uid}
                  card={card}
                  selectable
                  selected={selectedHandCardId === card.uid}
                  disabled={!canPlayCard(state, "player", card) || state.activeSide !== "player"}
                  footer={<p className="hint-text">Spielkosten: {getPlayableCost(state, "player", card)}</p>}
                  onClick={() => selectHandCard(card.uid)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="log-panel">
          <div>
            <h2 className="section-title">Zugprotokoll</h2>
            <p className="hint-text">
              Direkte Angriffe sind nur erlaubt, wenn kein Gegner steht oder Kleine Nille lossprintet.
            </p>
          </div>
          {selectedCard ? (
            <div>
              <h3 className="section-title">Ausgewählte Karte</h3>
              <p className="hint-text">{selectedCard.name}</p>
              <p className="hint-text">{selectedCard.effect}</p>
              {state.targetMode ? (
                <button
                  className="ghost-button"
                  onClick={() => {
                    setState((current) => cancelTargetMode(current));
                    setSelectedHandCardId(null);
                  }}
                >
                  Zielwahl abbrechen
                </button>
              ) : null}
            </div>
          ) : null}
          <ul className="log-list">
            {state.log.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ul>
          <Link href="/cards" className="secondary-button">
            Kartenbibliothek
          </Link>
        </aside>
      </div>
    </section>
  );
}

type PlayerHudProps = {
  side: "player" | "bot";
  name: string;
  honor: number;
  gold: number;
  maxGold: number;
  deck: number;
  hand: number;
  board: number;
  onLeaderClick?: () => void;
  leaderTargetable?: boolean;
};

function PlayerHud({
  side,
  name,
  honor,
  gold,
  maxGold,
  deck,
  hand,
  board,
  onLeaderClick,
  leaderTargetable = false
}: PlayerHudProps) {
  return (
    <section
      className={`hud-card ${leaderTargetable ? "leader-target" : ""}`}
      onClick={leaderTargetable ? onLeaderClick : undefined}
    >
      <div className="hud-title">
        <h2>{name}</h2>
        <span className="card-badge">{side === "player" ? "Mensch" : "Bot"}</span>
      </div>
      <div className="hud-stats">
        <div className="stat-chip">
          <span>Ehre</span>
          <strong>{honor}</strong>
        </div>
        <div className="stat-chip">
          <span>Gold</span>
          <strong>
            {gold}/{maxGold}
          </strong>
        </div>
        <div className="stat-chip">
          <span>Deck</span>
          <strong>{deck}</strong>
        </div>
        <div className="stat-chip">
          <span>Hand / Feld</span>
          <strong>
            {hand} / {board}
          </strong>
        </div>
      </div>
    </section>
  );
}

type BoardRowProps = {
  title: string;
  units: MatchState["player"]["board"];
  selectedId: string | null;
  onUnitClick: (unitId: string) => void;
  isTargetable: (unitId: string) => boolean;
};

function BoardRow({ title, units, selectedId, onUnitClick, isTargetable }: BoardRowProps) {
  return (
    <section className="board-row">
      <h2 className="section-title">{title}</h2>
      <div className="board-slots">
        {Array.from({ length: 5 }).map((_, index) => {
          const unit = units[index];
          if (!unit) {
            return (
              <div className="board-slot" key={`${title}-slot-${index}`}>
                <span className="empty-slot">Freier Platz</span>
              </div>
            );
          }

          return (
            <div className="board-unit" key={unit.instanceId}>
              <CardFrame
                card={unit}
                selectable
                selected={selectedId === unit.instanceId}
                targetable={isTargetable(unit.instanceId)}
                footer={
                  <p className="hint-text">
                    {unit.sleepForTurns > 0
                      ? "Schläft"
                      : unit.stunForTurns > 0
                        ? "Betäubt"
                        : unit.exhausted
                          ? "Erschöpft"
                          : "Bereit"}
                  </p>
                }
                onClick={() => onUnitClick(unit.instanceId)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
