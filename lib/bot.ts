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

function scoreTarget(state: MatchState, target: AttackTarget) {
  if (target.kind === "leader") {
    return 999;
  }
  const unit = state.player.board.find((entry) => entry.instanceId === target.unitId);
  if (!unit) {
    return 0;
  }
  return unit.attack + unit.health;
}

export function runBotTurn(initial: MatchState) {
  let state = initial;

  const botHand = [...state.bot.hand].sort((a, b) => {
    const scoreA = getPlayableCost(state, "bot", a) + (a.attack ?? 0) + (a.health ?? 0);
    const scoreB = getPlayableCost(state, "bot", b) + (b.attack ?? 0) + (b.health ?? 0);
    return scoreB - scoreA;
  });

  for (const card of botHand) {
    if (!canPlayCard(state, "bot", card)) {
      continue;
    }

    if (
      ["ready-ally", "ally-attack-buff", "crown-guard", "attack-bonus", "extra-strike-damage", "shadow-cloak", "forge-buff"].includes(
        card.effectId
      )
    ) {
      const bestAlly = [...state.bot.board].sort((a, b) => b.attack + b.health - (a.attack + a.health))[0];
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
      const bestEnemy = [...state.player.board].sort((a, b) => b.attack - a.attack)[0];
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
    const target = [...targets].sort((a, b) => scoreTarget(state, b) - scoreTarget(state, a))[0];
    state = attackWithUnit(state, "bot", attacker.instanceId, target);
    if (state.winner) {
      return state;
    }
  }

  return endTurn(state);
}
