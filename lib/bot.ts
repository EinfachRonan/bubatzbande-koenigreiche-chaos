import { AttackTarget } from "@/lib/game";
import {
  MatchState,
  attackWithUnit,
  canPlayCard,
  endTurn,
  getPlayableCost,
  getValidAttackTargets,
  playCard
} from "@/lib/game";

function scoreEnemyUnit(unit: MatchState["player"]["board"][number]) {
  return unit.attack * 2 + unit.health;
}

function scoreBotUnit(unit: MatchState["bot"]["board"][number]) {
  return unit.attack * 2 + unit.health + unit.bonusStrikeDamage;
}

function getPreferredCardOrder(state: MatchState) {
  return [...state.bot.hand].sort((left, right) => {
    const leftCost = getPlayableCost(state, "bot", left);
    const rightCost = getPlayableCost(state, "bot", right);

    const leftWeight = getBotCardPriority(state, left) + leftCost;
    const rightWeight = getBotCardPriority(state, right) + rightCost;

    return rightWeight - leftWeight;
  });
}

function getBotCardPriority(state: MatchState, card: MatchState["bot"]["hand"][number]) {
  switch (card.type) {
    case "character":
      return 40 + (card.attack ?? 0) + (card.health ?? 0);
    case "equipment":
      return state.bot.board.length > 0 ? 28 : -10;
    case "action":
      if (card.effectId === "heal-leader") {
        return state.bot.honor < 24 ? 18 : -6;
      }
      if (card.effectId === "stun-enemy") {
        return state.player.board.length > 0 ? 24 : -8;
      }
      return 20;
    case "chaos":
      return shouldBotPlayChaos(state, card.effectId) ? 14 : -12;
    default:
      return 0;
  }
}

function shouldBotPlayChaos(state: MatchState, effectId: MatchState["bot"]["hand"][number]["effectId"]) {
  switch (effectId) {
    case "board-blast":
      return state.player.board.length >= state.bot.board.length;
    case "both-gain-gold":
      return state.bot.gold <= 3;
    case "both-discard":
      return state.player.hand.length >= state.bot.hand.length;
    case "redistribute-board":
      return state.player.board.length > state.bot.board.length;
    case "swap-weakest-strongest":
      return state.player.board.length > 0 && state.bot.board.length > 0;
    case "random-sleep":
      return state.player.board.length > 0;
    default:
      return true;
  }
}

function scoreTarget(state: MatchState, target: AttackTarget) {
  if (target.kind === "leader") {
    return 999;
  }
  const unit = state.player.board.find((entry) => entry.instanceId === target.unitId);
  if (!unit) {
    return 0;
  }
  return scoreEnemyUnit(unit);
}

export function runBotTurn(initial: MatchState) {
  let state = initial;

  for (const card of getPreferredCardOrder(state)) {
    if (!canPlayCard(state, "bot", card)) {
      continue;
    }

    if (card.type === "character" && state.bot.board.length < 5) {
      state = playCard(state, "bot", card.uid);
      continue;
    }

    if (card.type === "equipment" || card.effectId === "ready-ally" || card.effectId === "ally-attack-buff") {
      const bestAlly = [...state.bot.board].sort((left, right) => scoreBotUnit(right) - scoreBotUnit(left))[0];
      if (!bestAlly) {
        continue;
      }
      state = playCard(state, "bot", card.uid, {
        kind: "unit",
        side: "bot",
        unitId: bestAlly.instanceId
      });
      continue;
    }

    if (card.effectId === "stun-enemy") {
      const bestEnemy = [...state.player.board].sort((left, right) => scoreEnemyUnit(right) - scoreEnemyUnit(left))[0];
      if (!bestEnemy) {
        continue;
      }
      state = playCard(state, "bot", card.uid, {
        kind: "unit",
        side: "player",
        unitId: bestEnemy.instanceId
      });
      continue;
    }

    if (card.effectId === "heal-leader" && state.bot.honor >= 30) {
      continue;
    }

    if (card.type === "chaos" && !shouldBotPlayChaos(state, card.effectId)) {
      continue;
    }

    state = playCard(state, "bot", card.uid);
  }

  const attackers = [...state.bot.board].filter(
    (unit) => !unit.exhausted && unit.sleepForTurns <= 0 && unit.stunForTurns <= 0
  );

  for (const attacker of attackers) {
    const targets = getValidAttackTargets(state, "bot", attacker.instanceId);
    if (targets.length === 0) {
      continue;
    }
    const target = [...targets].sort((left, right) => scoreTarget(state, right) - scoreTarget(state, left))[0];
    state = attackWithUnit(state, "bot", attacker.instanceId, target);
    if (state.winner) {
      return state;
    }
  }

  return endTurn(state);
}
