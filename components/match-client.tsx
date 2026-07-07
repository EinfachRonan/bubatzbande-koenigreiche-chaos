"use client";

import { useEffect, useState } from "react";
import { BoardSlot } from "@/components/game/board-slot";
import { EventLog } from "@/components/game/event-log";
import { HandCards } from "@/components/game/hand-cards";
import { KraeuterhoehleMap } from "@/components/game/kraeuterhoehle-map";
import { PlayerPanel } from "@/components/game/player-panel";
import { TurnPanel } from "@/components/game/turn-panel";
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

function getUnitStatus(unit: MatchState["player"]["board"][number]) {
  if (unit.sleepForTurns > 0) {
    return "Schlaeft";
  }
  if (unit.stunForTurns > 0) {
    return "Betaeubt";
  }
  if (unit.exhausted) {
    return "Erschoepft";
  }
  return "Bereit";
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
    setPulseLeaderSide(null);
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
    <KraeuterhoehleMap
      statusBanner={
        winnerText ??
        (state.targetMode?.prompt ||
          (state.activeSide === "player"
            ? "Dein Zug. Spiele Karten aus oder schicke deine Bande in den Kampf."
            : "Der Bot schmiedet gerade seinen naechsten fragwuerdigen Plan."))
      }
      topLeft={
        <PlayerPanel
          side="bot"
          name="Gegner"
          honor={state.bot.honor}
          gold={state.bot.gold}
          maxGold={state.bot.maxGold}
          pulse={pulseLeaderSide === "bot"}
          targetable={getTargetableClass({ kind: "leader", side: "bot" })}
          onLeaderClick={() => attackLeader("bot")}
        />
      }
      bottomLeft={
        <PlayerPanel
          side="player"
          name="Du"
          honor={state.player.honor}
          gold={state.player.gold}
          maxGold={state.player.maxGold}
          pulse={pulseLeaderSide === "player"}
        />
      }
      topHand={
        <div className="kh-mini-hand" aria-label={`Gegnerhand mit ${state.bot.hand.length} Karten`}>
          {state.bot.hand.map((card) => (
            <span className="kh-card-back" key={card.uid} aria-hidden="true" />
          ))}
        </div>
      }
      topDeck={
        <div className="kh-deck-box kh-deck-box-top">
          <span className="kh-card-back kh-card-back-stack" aria-hidden="true" />
          <div className="kh-deck-copy">
            <strong>{state.bot.deck.length}</strong>
            <span>DECK</span>
          </div>
        </div>
      }
      enemyBoard={
        <div className="kh-slot-grid">
          {Array.from({ length: 5 }).map((_, index) => {
            const unit = state.bot.board[index];
            return (
              <BoardSlot
                key={`bot-slot-${index}`}
                side="bot"
                unit={unit}
                highlighted={highlightedUnitId === unit?.instanceId}
                targetable={unit ? getTargetableClass({ kind: "unit", side: "bot", unitId: unit.instanceId }) : false}
                statusText={unit ? getUnitStatus(unit) : undefined}
                onClick={unit ? () => onBoardClick(unit.instanceId, "bot") : undefined}
              />
            );
          })}
        </div>
      }
      playerBoard={
        <div className="kh-slot-grid">
          {Array.from({ length: 5 }).map((_, index) => {
            const unit = state.player.board[index];
            return (
              <BoardSlot
                key={`player-slot-${index}`}
                side="player"
                unit={unit}
                selected={selectedAttackerId === unit?.instanceId}
                highlighted={highlightedUnitId === unit?.instanceId}
                targetable={Boolean(unit && state.targetMode?.target === "ally-unit")}
                statusText={unit ? getUnitStatus(unit) : undefined}
                onClick={unit ? () => onBoardClick(unit.instanceId, "player") : undefined}
              />
            );
          })}
        </div>
      }
      rightTop={<TurnPanel turn={state.turn} activeSide={state.activeSide} />}
      rightMiddle={
        <EventLog
          entries={state.log}
          collapsed={logCollapsed}
          onToggle={() => setLogCollapsed((current) => !current)}
          selectedCardName={selectedCard?.name ?? null}
          selectedCardEffect={selectedCard?.effect ?? null}
          canCancelTarget={Boolean(state.targetMode)}
          onCancelTarget={() => {
            setState((current) => cancelTargetMode(current));
            setSelectedHandCardId(null);
          }}
        />
      }
      rightBottom={
        <div className="kh-action-stack">
          <button
            className="kh-end-turn-button"
            onClick={() => {
              setState((current) => endTurn(current));
              setSelectedAttackerId(null);
              setSelectedHandCardId(null);
            }}
            disabled={state.activeSide !== "player" || Boolean(state.winner)}
          >
            {state.winner ? "Neues Spiel" : "Zug beenden"}
          </button>

          <div className="kh-gold-bar" title="Gold = Ressource zum Ausspielen von Karten">
            <div className="kh-gold-pips" aria-hidden="true">
              {Array.from({ length: Math.max(10, state.player.maxGold) }).map((_, index) => (
                <span key={`gold-${index}`} className={index < state.player.gold ? "is-filled" : ""} />
              ))}
            </div>
            <strong>
              {state.player.gold}/{state.player.maxGold}
            </strong>
          </div>

          <button className="ghost-button kh-reset-button" onClick={resetMatch}>
            {state.winner ? "Match neu starten" : "Match zuruecksetzen"}
          </button>
        </div>
      }
      hand={
        <HandCards
          cards={state.player.hand}
          deckCount={state.player.deck.length}
          selectedId={selectedHandCardId}
          getPlayIssue={(card) => getCardPlayIssue(state, "player", card)}
          getPlayableCostText={(card) => `Spielkosten: ${getPlayableCost(state, "player", card)}`}
          onSelect={selectHandCard}
        />
      }
    />
  );
}
