"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CardFrame } from "@/components/card-frame";
import { runBotTurn } from "@/lib/bot";
import { botStarterDeckIds, DECK_SIZE_MIN, PLAYER_DECK_STORAGE_KEY, starterDeckIds, validateDeckIds } from "@/lib/decks";
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
  getCardPlayIssue,
  getPlayableCost,
  getValidAttackTargets,
  playCard
} from "@/lib/game";

function createStateFromStorage() {
  if (typeof window === "undefined") {
    return createInitialMatchState({
      playerDeckIds: starterDeckIds,
      botDeckIds: botStarterDeckIds
    });
  }

  const rawDeck = window.localStorage.getItem(PLAYER_DECK_STORAGE_KEY);
  if (!rawDeck) {
    return createInitialMatchState({
      playerDeckIds: starterDeckIds,
      botDeckIds: botStarterDeckIds
    });
  }

  try {
    const parsed = JSON.parse(rawDeck);
    if (!Array.isArray(parsed)) {
      throw new Error("invalid");
    }
    const deckIds = parsed.filter((entry): entry is string => typeof entry === "string");
    const validation = validateDeckIds(deckIds);
    if (!validation.isValid || deckIds.length < DECK_SIZE_MIN) {
      return createInitialMatchState({
        playerDeckIds: starterDeckIds,
        botDeckIds: botStarterDeckIds
      });
    }
    return createInitialMatchState({
      playerDeckIds: deckIds,
      botDeckIds: botStarterDeckIds
    });
  } catch {
    return createInitialMatchState({
      playerDeckIds: starterDeckIds,
      botDeckIds: botStarterDeckIds
    });
  }
}

export function MatchClient() {
  const [state, setState] = useState<MatchState>(() => createStateFromStorage());
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [selectedAttackerId, setSelectedAttackerId] = useState<string | null>(null);
  const [highlightedUnitId, setHighlightedUnitId] = useState<string | null>(null);
  const [pulseLeaderSide, setPulseLeaderSide] = useState<"player" | "bot" | null>(null);
  const [logCollapsed, setLogCollapsed] = useState(false);

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

  useEffect(() => {
    if (!highlightedUnitId) {
      return;
    }

    const timeout = window.setTimeout(() => setHighlightedUnitId(null), 520);
    return () => window.clearTimeout(timeout);
  }, [highlightedUnitId]);

  useEffect(() => {
    if (!pulseLeaderSide) {
      return;
    }

    const timeout = window.setTimeout(() => setPulseLeaderSide(null), 520);
    return () => window.clearTimeout(timeout);
  }, [pulseLeaderSide]);

  const winnerText = describeWinner(state);

  function flashUnit(unitId: string) {
    setHighlightedUnitId(null);
    window.setTimeout(() => setHighlightedUnitId(unitId), 10);
  }

  function resetMatch() {
    setState(createStateFromStorage());
    setSelectedHandCardId(null);
    setSelectedAttackerId(null);
    setHighlightedUnitId(null);
  }

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
        flashUnit(unitId);
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
        flashUnit(unitId);
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
      flashUnit(selectedAttackerId);
      flashUnit(unitId);
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
    flashUnit(selectedAttackerId);
    setPulseLeaderSide("bot");
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
        <div className="turn-state-panel">
          <div className="turn-pill" title="Aktuelle Runde des Duells">
            Runde {state.turn}
          </div>
          <div className={`active-side-badge ${state.activeSide === "player" ? "is-player" : "is-bot"}`}>
            {state.activeSide === "player" ? "Aktiver Spieler: Du" : "Aktiver Spieler: Bot"}
          </div>
        </div>
        <div className="turn-actions">
          <button className="ghost-button" onClick={resetMatch}>
            {state.winner ? "Neues Spiel" : "Match zurücksetzen"}
          </button>
          <button
            className="action-button action-button-hero"
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
            pulse={pulseLeaderSide === "bot"}
          />

          <BoardRow
            title="Bot-Spielfeld"
            side="bot"
            units={state.bot.board}
            selectedId={selectedAttackerId}
            highlightedId={highlightedUnitId}
            onUnitClick={(unitId) => onBoardClick(unitId, "bot")}
            isTargetable={(unitId) => getTargetableClass({ kind: "unit", side: "bot", unitId })}
          />

          <BoardRow
            title="Dein Spielfeld"
            side="player"
            units={state.player.board}
            selectedId={selectedAttackerId}
            highlightedId={highlightedUnitId}
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
            pulse={pulseLeaderSide === "player"}
          />

          <section className="hand-row">
            <div className="hand-header">
              <h2 className="section-title">Deine Hand</h2>
              <p className="hint-text">
                Nicht spielbare Karten sind gedimmt. Wähle erst eine Karte oder einen Angreifer.
              </p>
            </div>
            <div className="hand-cards">
              {state.player.hand.map((card) => {
                const playIssue = getCardPlayIssue(state, "player", card);
                return (
                  <CardFrame
                    key={card.uid}
                    card={card}
                    selectable
                    emphasis="player"
                    selected={selectedHandCardId === card.uid}
                    disabled={Boolean(playIssue)}
                    footer={
                      <p className="hint-text">
                        {playIssue ?? `Spielkosten: ${getPlayableCost(state, "player", card)}`}
                      </p>
                    }
                    onClick={() => selectHandCard(card.uid)}
                  />
                );
              })}
            </div>
          </section>
        </div>

        <aside className={`log-panel ${logCollapsed ? "collapsed" : ""}`}>
          <div className="log-header">
            <div>
              <h2 className="section-title">Ereignisprotokoll</h2>
              <p className="hint-text">Die letzten 14 Ereignisse bleiben sichtbar.</p>
            </div>
            <button className="ghost-button log-toggle" onClick={() => setLogCollapsed((current) => !current)}>
              {logCollapsed ? "Log öffnen" : "Log einklappen"}
            </button>
          </div>
          {selectedCard ? (
            <div className="selected-card-panel">
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
            Deckbuilder öffnen
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
  pulse?: boolean;
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
  leaderTargetable = false,
  pulse = false
}: PlayerHudProps) {
  return (
    <section
      className={`hud-card ${leaderTargetable ? "leader-target" : ""} ${pulse ? "leader-pulse" : ""}`}
      onClick={leaderTargetable ? onLeaderClick : undefined}
    >
      <div className="hud-title">
        <h2>{name}</h2>
        <span className="card-badge">{side === "player" ? "Mensch" : "Bot"}</span>
      </div>
      <div className="hud-stats">
        <div className="stat-chip" title="Ehre = Leben des Spielers">
          <span>Ehre</span>
          <strong>{honor}</strong>
        </div>
        <div className="stat-chip" title="Gold = Ressource zum Ausspielen von Karten">
          <span>Gold</span>
          <strong>
            {gold}/{maxGold}
          </strong>
        </div>
        <div className="stat-chip" title="Anzahl verbleibender Karten im Deck">
          <span>Deck</span>
          <strong>{deck}</strong>
        </div>
        <div className="stat-chip" title="Handkarten und Charaktere auf dem Feld">
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
  side: "player" | "bot";
  units: MatchState["player"]["board"];
  selectedId: string | null;
  highlightedId: string | null;
  onUnitClick: (unitId: string) => void;
  isTargetable: (unitId: string) => boolean;
};

function BoardRow({
  title,
  side,
  units,
  selectedId,
  highlightedId,
  onUnitClick,
  isTargetable
}: BoardRowProps) {
  return (
    <section className={`board-row ${side === "bot" ? "enemy-lane" : "player-lane"}`}>
      <div className="board-row-header">
        <h2 className="section-title">{title}</h2>
        <span className="board-lane-chip">{side === "bot" ? "Gegnerseite" : "Deine Seite"}</span>
      </div>
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
                compact
                emphasis={side === "bot" ? "enemy" : "player"}
                selected={selectedId === unit.instanceId}
                targetable={isTargetable(unit.instanceId) || highlightedId === unit.instanceId}
                footer={
                  <p className="hint-text unit-state-text">
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
