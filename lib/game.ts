import { createStarterDeck } from "@/lib/cards";
import { CardDefinition, DeckCard, DeckCard as PlayedCard, EffectId, UnitInstance } from "@/types/cards";

export type PlayerSide = "player" | "bot";
export type AttackTarget =
  | { kind: "leader"; side: PlayerSide }
  | { kind: "unit"; side: PlayerSide; unitId: string };

export type PlayerState = {
  side: PlayerSide;
  honor: number;
  gold: number;
  maxGold: number;
  deck: DeckCard[];
  hand: DeckCard[];
  board: UnitInstance[];
  discard: DeckCard[];
};

export type TargetMode = {
  handCardId: string;
  prompt: string;
  target: "ally-unit" | "enemy-unit";
};

export type MatchState = {
  turn: number;
  activeSide: PlayerSide;
  winner: PlayerSide | null;
  player: PlayerState;
  bot: PlayerState;
  log: string[];
  targetMode: TargetMode | null;
};

const HONOR_CAP = 30;
const GOLD_CAP = 10;
const BOARD_LIMIT = 5;

function clonePlayer(player: PlayerState): PlayerState {
  return {
    ...player,
    deck: [...player.deck],
    hand: [...player.hand],
    board: player.board.map((unit) => ({ ...unit, tags: [...unit.tags] })),
    discard: [...player.discard]
  };
}

function logLine(state: MatchState, message: string) {
  state.log = [...state.log.slice(-19), message];
}

function drawCard(player: PlayerState, amount = 1) {
  for (let count = 0; count < amount; count += 1) {
    const next = player.deck.shift();
    if (!next) {
      return;
    }
    player.hand.push(next);
  }
}

function createPlayer(side: PlayerSide): PlayerState {
  return {
    side,
    honor: HONOR_CAP,
    gold: 0,
    maxGold: 0,
    deck: createStarterDeck(side),
    hand: [],
    board: [],
    discard: []
  };
}

function createUnit(card: CardDefinition, owner: PlayerSide, turn: number): UnitInstance {
  return {
    instanceId: `${owner}-${card.id}-${Math.random().toString(36).slice(2, 9)}`,
    baseCardId: card.id,
    type: "character",
    name: card.name,
    owner,
    cost: card.cost,
    attack: card.attack ?? 0,
    health: card.health ?? 0,
    maxHealth: card.health ?? 0,
    effect: card.effect,
    effectId: card.effectId,
    image: card.image,
    rarity: card.rarity,
    tags: [...card.tags],
    exhausted: true,
    summonedTurn: turn,
    sleepForTurns: 0,
    stunForTurns: 0,
    untargetableForTurns: card.effectId === "untargetable-every-other-round" ? 1 : 0,
    shielded: false,
    bonusStrikeDamage: 0
  };
}

export function createInitialMatchState(): MatchState {
  const player = createPlayer("player");
  const bot = createPlayer("bot");

  drawCard(player, 3);
  drawCard(bot, 3);

  const state: MatchState = {
    turn: 1,
    activeSide: "player",
    winner: null,
    player,
    bot,
    log: ["Die Königreiche geraten ins Chaos."],
    targetMode: null
  };

  startTurn(state, "player", true);
  return state;
}

function getStatePlayer(state: MatchState, side: PlayerSide) {
  return side === "player" ? state.player : state.bot;
}

function getOpponentSide(side: PlayerSide): PlayerSide {
  return side === "player" ? "bot" : "player";
}

function removeCardFromHand(player: PlayerState, handCardId: string) {
  const index = player.hand.findIndex((card) => card.uid === handCardId);
  if (index === -1) {
    return null;
  }
  const [card] = player.hand.splice(index, 1);
  return card;
}

function getModifiedCardCost(player: PlayerState, card: PlayedCard) {
  const spellDiscount = player.board.some((unit) => unit.effectId === "spells-cost-less") &&
    (card.type === "action" || card.type === "chaos")
      ? 1
      : 0;
  return Math.max(0, card.cost - spellDiscount);
}

function changeHonor(player: PlayerState, amount: number) {
  player.honor = Math.max(0, Math.min(HONOR_CAP, player.honor + amount));
}

function damageUnit(unit: UnitInstance, amount: number) {
  if (amount <= 0) {
    return;
  }
  if (unit.shielded) {
    unit.shielded = false;
    return;
  }
  unit.health -= amount;
}

function healUnit(unit: UnitInstance, amount: number) {
  unit.health = Math.min(unit.maxHealth, unit.health + amount);
}

function cleanupDeaths(state: MatchState) {
  const died: UnitInstance[] = [];

  for (const side of ["player", "bot"] as const) {
    const player = getStatePlayer(state, side);
    const survivors: UnitInstance[] = [];
    for (const unit of player.board) {
      if (unit.health > 0) {
        survivors.push(unit);
      } else {
        died.push(unit);
      }
    }
    player.board = survivors;
  }

  for (const unit of died) {
    logLine(state, `${unit.name} fällt auf der Seite von ${unit.owner === "player" ? "dir" : "dem Bot"}.`);
    if (unit.effectId === "summon-tree-spirit-on-death") {
      const owner = getStatePlayer(state, unit.owner);
      if (owner.board.length < BOARD_LIMIT) {
        owner.board.push({
          instanceId: `${unit.owner}-baumgeist-${Math.random().toString(36).slice(2, 8)}`,
          baseCardId: "baumgeist-token",
          type: "character",
          name: "Baumgeist",
          owner: unit.owner,
          cost: 0,
          attack: 2,
          health: 2,
          maxHealth: 2,
          effect: "Ein zäher Waldgeist aus den Resten von LG3.",
          effectId: "attack-bonus",
          image: "/images/cards/baumgeist.png",
          rarity: "common",
          tags: ["Token", "Natur"],
          exhausted: true,
          summonedTurn: state.turn,
          sleepForTurns: 0,
          stunForTurns: 0,
          untargetableForTurns: 0,
          shielded: false,
          bonusStrikeDamage: 0
        });
        logLine(state, "LG3 hinterlässt einen Baumgeist.");
      }
    }
    const allies = getStatePlayer(state, unit.owner).board;
    allies
      .filter((ally) => ally.effectId === "gain-attack-on-ally-death")
      .forEach((ally) => {
        ally.attack += 1;
      });
  }
}

function checkWinner(state: MatchState) {
  if (state.player.honor <= 0) {
    state.winner = "bot";
  } else if (state.bot.honor <= 0) {
    state.winner = "player";
  }
}

function applyEndTurnEffects(state: MatchState, side: PlayerSide) {
  const player = getStatePlayer(state, side);
  const healer = player.board.find((unit) => unit.effectId === "heal-all-allies-end-turn");
  if (healer) {
    player.board.forEach((unit) => healUnit(unit, 1));
    logLine(state, `${healer.name} heilt alle Verbündeten um 1.`);
  }
}

function applyStartTurnBoardEffects(state: MatchState, side: PlayerSide) {
  const player = getStatePlayer(state, side);

  let bonusGold = 0;
  player.board.forEach((unit) => {
    unit.exhausted = false;
    if (unit.sleepForTurns > 0) {
      unit.sleepForTurns -= 1;
    }
    if (unit.stunForTurns > 0) {
      unit.stunForTurns -= 1;
    }
    if (unit.untargetableForTurns > 0) {
      unit.untargetableForTurns -= 1;
    } else if (unit.effectId === "untargetable-every-other-round") {
      unit.untargetableForTurns = 1;
    }
    if (unit.effectId === "extra-gold-each-turn") {
      bonusGold += 1;
    }
    if (unit.effectId === "build-random-tool" && state.turn % 2 === 0) {
      unit.attack += 1;
      unit.maxHealth += 1;
      unit.health += 1;
      logLine(state, `${unit.name} zimmert sich ein improvisiertes Werkzeug (+1/+1).`);
    }
  });

  player.gold = Math.min(GOLD_CAP, player.gold + bonusGold);
}

function startTurn(state: MatchState, side: PlayerSide, initial = false) {
  const player = getStatePlayer(state, side);
  state.activeSide = side;
  player.maxGold = Math.min(GOLD_CAP, initial ? 1 : player.maxGold + 1);
  player.gold = player.maxGold;
  drawCard(player, 1);
  applyStartTurnBoardEffects(state, side);
  logLine(state, `${side === "player" ? "Du" : "Der Bot"} beginnst Zug ${state.turn}.`);
}

function canTargetUnit(unit: UnitInstance) {
  return unit.untargetableForTurns <= 0;
}

export function getTargetModeForCard(card: PlayedCard): TargetMode | null {
  switch (card.effectId) {
    case "ready-ally":
    case "ally-attack-buff":
    case "crown-guard":
    case "attack-bonus":
    case "extra-strike-damage":
    case "shadow-cloak":
    case "forge-buff":
      return {
        handCardId: card.uid,
        prompt: "Wähle einen verbündeten Charakter.",
        target: "ally-unit"
      };
    case "stun-enemy":
      return {
        handCardId: card.uid,
        prompt: "Wähle einen gegnerischen Charakter.",
        target: "enemy-unit"
      };
    default:
      return null;
  }
}

function findUnit(player: PlayerState, unitId: string) {
  return player.board.find((unit) => unit.instanceId === unitId);
}

function applyCardEffect(
  state: MatchState,
  side: PlayerSide,
  card: PlayedCard,
  target?: AttackTarget
) {
  const player = getStatePlayer(state, side);
  const opponent = getStatePlayer(state, getOpponentSide(side));

  switch (card.effectId) {
    case "steal-gold-on-play": {
      const stolen = Math.min(1, opponent.gold);
      opponent.gold -= stolen;
      player.gold = Math.min(GOLD_CAP, player.gold + stolen);
      break;
    }
    case "allies-plus-health": {
      player.board.forEach((unit) => {
        if (unit.name !== card.name) {
          unit.maxHealth += 1;
          unit.health += 1;
        }
      });
      break;
    }
    case "draw-two-or-gain-three": {
      if (player.hand.length <= 5 && player.deck.length >= 2) {
        drawCard(player, 2);
        logLine(state, `${card.name} bringt 2 Karten Nachschub.`);
      } else {
        player.gold = Math.min(GOLD_CAP, player.gold + 3);
        logLine(state, `${card.name} bringt 3 Gold Extrareserven.`);
      }
      break;
    }
    case "heal-leader": {
      changeHonor(player, 4);
      break;
    }
    case "plunder-gold": {
      const stolen = Math.min(2, opponent.gold);
      opponent.gold -= stolen;
      player.gold = Math.min(GOLD_CAP, player.gold + 2);
      break;
    }
    case "ready-ally": {
      if (target?.kind === "unit") {
        const unit = findUnit(player, target.unitId);
        if (unit) {
          unit.exhausted = false;
        }
      }
      break;
    }
    case "fog-weaken": {
      opponent.board.forEach((unit) => {
        unit.attack = Math.max(0, unit.attack - 1);
      });
      break;
    }
    case "ally-attack-buff": {
      if (target?.kind === "unit") {
        const unit = findUnit(player, target.unitId);
        if (unit) {
          unit.attack += 2;
        }
      }
      break;
    }
    case "stun-enemy": {
      if (target?.kind === "unit") {
        const unit = findUnit(opponent, target.unitId);
        if (unit) {
          unit.stunForTurns = 1;
          unit.exhausted = true;
        }
      }
      break;
    }
    case "redistribute-board": {
      const everyone = [...player.board, ...opponent.board]
        .sort(() => Math.random() - 0.5)
        .map((unit) => ({ ...unit }));
      player.board = [];
      opponent.board = [];
      everyone.forEach((unit) => {
        const preferred = Math.random() > 0.5 ? player : opponent;
        const fallback = preferred.side === "player" ? opponent : player;
        const destination =
          preferred.board.length < BOARD_LIMIT
            ? preferred
            : fallback.board.length < BOARD_LIMIT
              ? fallback
              : null;
        if (destination) {
          unit.owner = destination.side;
          destination.board.push(unit);
        }
      });
      break;
    }
    case "both-discard": {
      [player, opponent].forEach((actor) => {
        for (let count = 0; count < 2; count += 1) {
          if (actor.hand.length === 0) {
            return;
          }
          const randomIndex = Math.floor(Math.random() * actor.hand.length);
          const [discarded] = actor.hand.splice(randomIndex, 1);
          actor.discard.push(discarded);
        }
      });
      break;
    }
    case "random-sleep": {
      const everyone = [...player.board, ...opponent.board];
      if (everyone.length > 0) {
        const selected = everyone[Math.floor(Math.random() * everyone.length)];
        selected.sleepForTurns = 1;
        selected.exhausted = true;
      }
      break;
    }
    case "board-blast": {
      [...player.board, ...opponent.board].forEach((unit) => damageUnit(unit, 2));
      break;
    }
    case "swap-weakest-strongest": {
      if (player.board.length > 0 && opponent.board.length > 0) {
        const weakest = [...player.board].sort((a, b) => a.attack + a.health - (b.attack + b.health))[0];
        const strongest = [...opponent.board].sort((a, b) => b.attack + b.health - (a.attack + a.health))[0];
        weakest.owner = opponent.side;
        strongest.owner = player.side;
        player.board = player.board.filter((unit) => unit.instanceId !== weakest.instanceId).concat(strongest);
        opponent.board = opponent.board.filter((unit) => unit.instanceId !== strongest.instanceId).concat(weakest);
      }
      break;
    }
    case "both-gain-gold": {
      player.gold = Math.min(GOLD_CAP, player.gold + 5);
      opponent.gold = Math.min(GOLD_CAP, opponent.gold + 5);
      break;
    }
    case "crown-guard":
    case "attack-bonus":
    case "extra-strike-damage":
    case "shadow-cloak":
    case "forge-buff": {
      if (target?.kind === "unit") {
        const unit = findUnit(player, target.unitId);
        if (unit) {
          applyEquipment(unit, card.effectId);
        }
      }
      break;
    }
    default:
      break;
  }

  cleanupDeaths(state);
  checkWinner(state);
}

function applyEquipment(unit: UnitInstance, effectId: EffectId) {
  switch (effectId) {
    case "crown-guard":
      unit.maxHealth += 2;
      unit.health += 2;
      unit.shielded = true;
      break;
    case "attack-bonus":
      unit.attack += 2;
      break;
    case "extra-strike-damage":
      unit.bonusStrikeDamage += 1;
      break;
    case "shadow-cloak":
      unit.untargetableForTurns = Math.max(unit.untargetableForTurns, 1);
      break;
    case "forge-buff":
      unit.attack += 1;
      unit.maxHealth += 1;
      unit.health += 1;
      break;
    default:
      break;
  }
}

export function playCard(
  source: MatchState,
  side: PlayerSide,
  handCardId: string,
  target?: AttackTarget
) {
  const state: MatchState = {
    ...source,
    player: clonePlayer(source.player),
    bot: clonePlayer(source.bot),
    log: [...source.log],
    targetMode: null
  };

  if (state.winner || state.activeSide !== side) {
    return source;
  }

  const player = getStatePlayer(state, side);
  const card = player.hand.find((entry) => entry.uid === handCardId);
  if (!card) {
    return source;
  }

  const realCost = getModifiedCardCost(player, card);
  if (player.gold < realCost) {
    return source;
  }
  if (card.type === "character" && player.board.length >= BOARD_LIMIT) {
    return source;
  }

  const requiresTarget = getTargetModeForCard(card);
  if (requiresTarget && !target) {
    state.targetMode = requiresTarget;
    return state;
  }

  player.gold -= realCost;
  removeCardFromHand(player, handCardId);
  player.discard.push(card);

  if (card.type === "character") {
    const unit = createUnit(card, side, state.turn);
    player.board.push(unit);
    logLine(state, `${side === "player" ? "Du spielst" : "Der Bot spielt"} ${card.name}.`);
    applyCardEffect(state, side, card);
  } else {
    logLine(state, `${side === "player" ? "Du wirkst" : "Der Bot wirkt"} ${card.name}.`);
    applyCardEffect(state, side, card, target);
  }

  return state;
}

export function cancelTargetMode(source: MatchState) {
  return { ...source, targetMode: null };
}

export function attackWithUnit(
  source: MatchState,
  side: PlayerSide,
  attackerId: string,
  target: AttackTarget
) {
  const state: MatchState = {
    ...source,
    player: clonePlayer(source.player),
    bot: clonePlayer(source.bot),
    log: [...source.log]
  };

  if (state.winner || state.activeSide !== side) {
    return source;
  }

  const attacker = findUnit(getStatePlayer(state, side), attackerId);
  if (!attacker || attacker.exhausted || attacker.sleepForTurns > 0 || attacker.stunForTurns > 0) {
    return source;
  }

  const opponent = getStatePlayer(state, getOpponentSide(side));
  const canDirectAttack = attacker.effectId === "can-attack-leader" || opponent.board.length === 0;
  if (target.kind === "leader" && !canDirectAttack) {
    return source;
  }

  if (target.kind === "unit") {
    const defender = findUnit(opponent, target.unitId);
    if (!defender || !canTargetUnit(defender)) {
      return source;
    }

    damageUnit(defender, attacker.attack + attacker.bonusStrikeDamage);
    damageUnit(attacker, defender.attack);

    if (attacker.effectId === "heal-self-on-attack") {
      healUnit(attacker, 1);
    }

    attacker.exhausted = true;
    logLine(state, `${attacker.name} kämpft gegen ${defender.name}.`);
  } else {
    changeHonor(opponent, -attacker.attack);
    if (attacker.effectId === "heal-self-on-attack") {
      healUnit(attacker, 1);
    }
    attacker.exhausted = true;
    logLine(state, `${attacker.name} trifft direkt die Ehre des Gegners.`);
  }

  cleanupDeaths(state);
  checkWinner(state);
  return state;
}

export function endTurn(source: MatchState) {
  const state: MatchState = {
    ...source,
    player: clonePlayer(source.player),
    bot: clonePlayer(source.bot),
    log: [...source.log],
    targetMode: null
  };

  if (state.winner) {
    return source;
  }

  applyEndTurnEffects(state, state.activeSide);
  const nextSide = getOpponentSide(state.activeSide);
  if (nextSide === "player") {
    state.turn += 1;
  }
  startTurn(state, nextSide);
  checkWinner(state);
  return state;
}

export function getPlayableCost(state: MatchState, side: PlayerSide, card: PlayedCard) {
  return getModifiedCardCost(getStatePlayer(state, side), card);
}

export function getValidAttackTargets(state: MatchState, side: PlayerSide, attackerId: string) {
  const attacker = findUnit(getStatePlayer(state, side), attackerId);
  if (!attacker) {
    return [];
  }
  const opponent = getStatePlayer(state, getOpponentSide(side));
  const targets: AttackTarget[] = opponent.board
    .filter(canTargetUnit)
    .map((unit) => ({ kind: "unit" as const, side: opponent.side, unitId: unit.instanceId }));
  if (attacker.effectId === "can-attack-leader" || opponent.board.length === 0) {
    targets.push({ kind: "leader" as const, side: opponent.side });
  }
  return targets;
}

export function canPlayCard(state: MatchState, side: PlayerSide, card: PlayedCard) {
  const player = getStatePlayer(state, side);
  if (player.gold < getModifiedCardCost(player, card)) {
    return false;
  }
  if (card.type === "character" && player.board.length >= BOARD_LIMIT) {
    return false;
  }
  if (card.type === "equipment" && player.board.length === 0) {
    return false;
  }
  if (card.effectId === "ready-ally" && player.board.length === 0) {
    return false;
  }
  if (card.effectId === "stun-enemy" && getStatePlayer(state, getOpponentSide(side)).board.length === 0) {
    return false;
  }
  return true;
}

export function describeWinner(state: MatchState) {
  if (state.winner === "player") {
    return "Sieg. Dein Reich behält die Ehre.";
  }
  if (state.winner === "bot") {
    return "Niederlage. Das Chaos hat deinen Hof verschlungen.";
  }
  return null;
}

export function getCardByUid(state: MatchState, side: PlayerSide, handCardId: string) {
  return getStatePlayer(state, side).hand.find((card) => card.uid === handCardId) ?? null;
}
