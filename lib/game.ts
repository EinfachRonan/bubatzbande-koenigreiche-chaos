import { getCardById } from "@/lib/cards";
import { botStarterDeckIds, buildDeckFromIds, starterDeckIds } from "@/lib/decks";
import { CardDefinition, DeckCard, EffectId, UnitInstance } from "@/types/cards";

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
  requiredBaseCardId?: string;
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

type MatchSetup = {
  botDeckIds?: string[];
  playerDeckIds?: string[];
};

const HONOR_CAP = 30;
const GOLD_CAP = 10;
const BOARD_LIMIT = 5;
const MAX_LOG_LINES = 14;

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
  state.log = [...state.log.slice(-(MAX_LOG_LINES - 1)), message];
}

function drawCard(state: MatchState, side: PlayerSide, amount = 1, reason = "zieht eine Karte") {
  const player = getStatePlayer(state, side);
  for (let count = 0; count < amount; count += 1) {
    const next = player.deck.shift();
    if (!next) {
      logLine(state, `${formatSide(side)} kann keine weitere Karte ziehen.`);
      return;
    }
    player.hand.push(next);
    logLine(state, `${formatSide(side)} ${reason}.`);
  }
}

function createPlayer(side: PlayerSide, deckIds: string[]) {
  return {
    side,
    honor: HONOR_CAP,
    gold: 0,
    maxGold: 0,
    deck: buildDeckFromIds(deckIds, side),
    hand: [] as DeckCard[],
    board: [] as UnitInstance[],
    discard: [] as DeckCard[]
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
    imageFit: card.imageFit,
    imagePosition: card.imagePosition,
    rarity: card.rarity,
    tags: [...card.tags],
    exhausted: true,
    summonedTurn: turn,
    sleepForTurns: 0,
    stunForTurns: 0,
    untargetableForTurns: card.effectId === "untargetable-every-other-round" ? 1 : 0,
    temporaryAttackPenalty: 0,
    temporaryAttackBonus: 0,
    temporaryAttackBonusTurns: 0,
    shielded: false,
    bonusStrikeDamage: 0,
    nextAttackShieldBreakBonus: 0
  };
}

export function createInitialMatchState(setup: MatchSetup = {}): MatchState {
  const player = createPlayer("player", setup.playerDeckIds ?? starterDeckIds);
  const bot = createPlayer("bot", setup.botDeckIds ?? botStarterDeckIds);

  const state: MatchState = {
    turn: 1,
    activeSide: "player",
    winner: null,
    player,
    bot,
    log: ["Die Königreiche geraten ins Chaos."],
    targetMode: null
  };

  drawCard(state, "player", 3, "zieht eine Starthandkarte");
  drawCard(state, "bot", 3, "zieht eine Starthandkarte");

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

function getModifiedCardCost(player: PlayerState, card: DeckCard) {
  const spellDiscount = player.board.some((unit) => unit.effectId === "spells-cost-less") &&
    (card.type === "action" || card.type === "chaos")
      ? 1
      : 0;
  return Math.max(0, card.cost - spellDiscount);
}

function changeHonor(player: PlayerState, amount: number) {
  player.honor = Math.max(0, Math.min(HONOR_CAP, player.honor + amount));
}

function getUnitAttack(unit: UnitInstance) {
  return Math.max(0, unit.attack + unit.temporaryAttackBonus - unit.temporaryAttackPenalty);
}

function isRunenmutantEnraged(unit: UnitInstance) {
  return unit.effectId === "mutant-rage" && unit.health <= Math.ceil(unit.maxHealth / 2);
}

function damageUnit(unit: UnitInstance, amount: number, options?: { ignoreShield?: boolean }) {
  if (amount <= 0) {
    return 0;
  }
  if (unit.shielded && !options?.ignoreShield) {
    unit.shielded = false;
    return 0;
  }
  if (unit.shielded && options?.ignoreShield) {
    unit.shielded = false;
  }
  const actualDamage = isRunenmutantEnraged(unit) ? Math.max(1, amount - 1) : amount;
  unit.health -= actualDamage;
  return actualDamage;
}

function healUnit(unit: UnitInstance, amount: number) {
  unit.health = Math.min(unit.maxHealth, unit.health + amount);
}

function createTokenUnit(cardId: string, owner: PlayerSide, turn: number) {
  const token = createUnit(getCardById(cardId), owner, turn);
  token.exhausted = true;
  return token;
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
    logLine(state, `${unit.name} wurde besiegt.`);
    if (unit.effectId === "summon-tree-spirit-on-death") {
      const owner = getStatePlayer(state, unit.owner);
      if (owner.board.length < BOARD_LIMIT) {
        owner.board.push(createTokenUnit("baumgeist", unit.owner, state.turn));
        logLine(state, "LG3 hinterlässt einen Baumgeist.");
      }
    }

    const allies = getStatePlayer(state, unit.owner).board;
    allies
      .filter((ally) => ally.effectId === "gain-attack-on-ally-death")
      .forEach((ally) => {
        ally.attack += 1;
        logLine(state, `${ally.name} wird durch den Verlust eines Verbündeten stärker (+1 Angriff).`);
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

  player.board.forEach((unit) => {
    if (unit.temporaryAttackPenalty > 0) {
      unit.temporaryAttackPenalty = 0;
    }
    if (unit.temporaryAttackBonusTurns > 0) {
      unit.temporaryAttackBonusTurns -= 1;
      if (unit.temporaryAttackBonusTurns === 0) {
        unit.temporaryAttackBonus = 0;
        logLine(state, `${unit.name} verliert die zusaetzliche Runenwut.`);
      }
    }
  });
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
    if (unit.effectId === "mutant-rage") {
      unit.attack += 1;
      logLine(state, `${unit.name} verfaellt dem Mutationsrausch und erhaelt +1 Angriff.`);
    }
    if (unit.effectId === "build-random-tool" && state.turn % 2 === 0) {
      // MVP-Variante: Marwin verbessert sich selbst statt ein separates Werkzeug-Objekt zu erzeugen.
      unit.attack += 1;
      unit.maxHealth += 1;
      unit.health += 1;
      logLine(state, `${unit.name} baut ein improvisiertes Werkzeug (+1/+1).`);
    }
  });

  if (bonusGold > 0) {
    player.gold = Math.min(GOLD_CAP, player.gold + bonusGold);
    logLine(state, `${formatSide(side)} erhält ${bonusGold} Bonus-Gold durch laufende Effekte.`);
  }
}

function startTurn(state: MatchState, side: PlayerSide, initial = false) {
  const player = getStatePlayer(state, side);
  state.activeSide = side;
  player.maxGold = Math.min(GOLD_CAP, initial ? 1 : player.maxGold + 1);
  player.gold = player.maxGold;
  applyStartTurnBoardEffects(state, side);
  if (!initial) {
    drawCard(state, side, 1);
  }
  logLine(state, `${formatSide(side)} beginnt Zug ${state.turn}.`);
}

function canTargetUnit(unit: UnitInstance) {
  return unit.untargetableForTurns <= 0;
}

export function getTargetModeForCard(card: DeckCard): TargetMode | null {
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
    case "runenwut":
      return {
        handCardId: card.uid,
        prompt: "Waehle den Runenmutanten.",
        target: "ally-unit",
        requiredBaseCardId: "der-runenmutant"
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
  card: DeckCard,
  target?: AttackTarget
) {
  const player = getStatePlayer(state, side);
  const opponent = getStatePlayer(state, getOpponentSide(side));

  switch (card.effectId) {
    case "steal-gold-on-play": {
      const stolen = Math.min(1, opponent.gold);
      opponent.gold -= stolen;
      player.gold = Math.min(GOLD_CAP, player.gold + stolen);
      logLine(state, `${card.name} klaut ${stolen} Gold.`);
      break;
    }
    case "allies-plus-health": {
      player.board.forEach((unit) => {
        if (unit.name !== card.name) {
          unit.maxHealth += 1;
          unit.health += 1;
        }
      });
      logLine(state, `${card.name} stärkt alle Verbündeten mit +1 Leben.`);
      break;
    }
    case "draw-two-or-gain-three": {
      const shouldDraw = side === "player" ? player.hand.length <= 5 && player.deck.length >= 2 : player.gold >= 5 ? false : player.deck.length >= 2;
      if (shouldDraw) {
        drawCard(state, side, 2);
        logLine(state, `${card.name} bringt 2 Karten Nachschub.`);
      } else {
        player.gold = Math.min(GOLD_CAP, player.gold + 3);
        logLine(state, `${card.name} bringt 3 Gold Extrareserven.`);
      }
      break;
    }
    case "heal-leader": {
      changeHonor(player, 4);
      logLine(state, `${card.name} heilt ${formatSide(side)} um 4 Ehre.`);
      break;
    }
    case "plunder-gold": {
      const lostGold = Math.min(2, opponent.gold);
      opponent.gold -= lostGold;
      player.gold = Math.min(GOLD_CAP, player.gold + 2);
      logLine(state, `${card.name} plündert Gold. Gegner verliert ${lostGold}.`);
      break;
    }
    case "ready-ally": {
      if (target?.kind === "unit") {
        const unit = findUnit(player, target.unitId);
        if (unit) {
          unit.exhausted = false;
          logLine(state, `${unit.name} erhält durch ${card.name} einen weiteren Angriff.`);
        }
      }
      break;
    }
    case "fog-weaken": {
      opponent.board.forEach((unit) => {
        unit.temporaryAttackPenalty = Math.max(unit.temporaryAttackPenalty, 1);
      });
      logLine(state, `${card.name} senkt den Angriff aller Gegner für deren nächsten Zug.`);
      break;
    }
    case "ally-attack-buff": {
      if (target?.kind === "unit") {
        const unit = findUnit(player, target.unitId);
        if (unit) {
          unit.attack += 2;
          logLine(state, `${unit.name} erhält +2 Angriff durch ${card.name}.`);
        }
      }
      break;
    }
    case "runenwut": {
      if (target?.kind === "unit") {
        const unit = findUnit(player, target.unitId);
        if (unit && unit.baseCardId === "der-runenmutant") {
          unit.temporaryAttackBonus = 4;
          unit.temporaryAttackBonusTurns = Math.max(unit.temporaryAttackBonusTurns, 2);
          unit.nextAttackShieldBreakBonus = 3;
          logLine(state, `${unit.name} entfesselt mit ${card.name} rohe Mutationsenergie.`);
        }
      }
      break;
    }
    case "stun-enemy": {
      if (target?.kind === "unit") {
        const unit = findUnit(opponent, target.unitId);
        if (unit) {
          unit.stunForTurns = Math.max(unit.stunForTurns, 2);
          unit.exhausted = true;
          logLine(state, `${unit.name} wird durch ${card.name} ausgebremst.`);
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
      logLine(state, `${card.name} verteilt das gesamte Feld neu.`);
      break;
    }
    case "both-discard": {
      [player, opponent].forEach((actor) => {
        for (let count = 0; count < 2; count += 1) {
          if (actor.hand.length === 0) {
            continue;
          }
          const randomIndex = Math.floor(Math.random() * actor.hand.length);
          const [discarded] = actor.hand.splice(randomIndex, 1);
          actor.discard.push(discarded);
        }
      });
      logLine(state, `${card.name} zwingt beide Spieler zum Abwerfen von 2 Karten.`);
      break;
    }
    case "random-sleep": {
      const everyone = [...player.board, ...opponent.board];
      if (everyone.length > 0) {
        const selected = everyone[Math.floor(Math.random() * everyone.length)];
        selected.sleepForTurns = Math.max(selected.sleepForTurns, 2);
        selected.exhausted = true;
        logLine(state, `${selected.name} fällt durch ${card.name} für eine Runde aus.`);
      }
      break;
    }
    case "board-blast": {
      [...player.board, ...opponent.board].forEach((unit) => damageUnit(unit, 2));
      logLine(state, `${card.name} verursacht 2 Schaden an allen Charakteren.`);
      break;
    }
    case "swap-weakest-strongest": {
      if (player.board.length > 0 && opponent.board.length > 0) {
        const weakest = [...player.board].sort((a, b) => getUnitAttack(a) + a.health - (getUnitAttack(b) + b.health))[0];
        const strongest = [...opponent.board].sort((a, b) => getUnitAttack(b) + b.health - (getUnitAttack(a) + a.health))[0];
        weakest.owner = opponent.side;
        strongest.owner = player.side;
        player.board = player.board.filter((unit) => unit.instanceId !== weakest.instanceId).concat(strongest);
        opponent.board = opponent.board.filter((unit) => unit.instanceId !== strongest.instanceId).concat(weakest);
        logLine(state, `${card.name} vertauscht ${weakest.name} und ${strongest.name}.`);
      }
      break;
    }
    case "both-gain-gold": {
      player.gold = Math.min(GOLD_CAP, player.gold + 5);
      opponent.gold = Math.min(GOLD_CAP, opponent.gold + 5);
      logLine(state, `${card.name} lässt auf beide Seiten 5 Gold regnen.`);
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
          logLine(state, `${card.name} wird an ${unit.name} angelegt.`);
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
  if (card.effectId === "runenwut" && target?.kind === "unit") {
    const unit = findUnit(player, target.unitId);
    if (!unit || unit.baseCardId !== "der-runenmutant") {
      return source;
    }
  }

  player.gold -= realCost;
  removeCardFromHand(player, handCardId);
  player.discard.push(card);

  if (card.type === "character") {
    const unit = createUnit(card, side, state.turn);
    player.board.push(unit);
    logLine(state, `${card.name} wurde ausgespielt.`);
    applyCardEffect(state, side, card);
  } else {
    logLine(state, `${card.name} wird eingesetzt.`);
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

  const isMutantRaging = isRunenmutantEnraged(attacker);
  const shieldBreakBonus = attacker.nextAttackShieldBreakBonus;
  const ignoreShield = isMutantRaging || shieldBreakBonus > 0;
  const attackerDamage =
    getUnitAttack(attacker) +
    attacker.bonusStrikeDamage +
    (isMutantRaging ? 1 : 0) +
    shieldBreakBonus;
  if (target.kind === "unit") {
    const defender = findUnit(opponent, target.unitId);
    if (!defender || !canTargetUnit(defender)) {
      return source;
    }

    damageUnit(defender, attackerDamage, { ignoreShield });
    damageUnit(attacker, getUnitAttack(defender));

    if (attacker.effectId === "heal-self-on-attack") {
      healUnit(attacker, 1);
    }

    if (isMutantRaging) {
      opponent.board
        .filter((unit) => unit.instanceId !== defender.instanceId)
        .forEach((unit) => {
          damageUnit(unit, 1, { ignoreShield: true });
        });
      logLine(
        state,
        `${attacker.name} entfesselt Seelenspalter und trifft die uebrigen Gegner fuer 1 Schaden.`
      );
    }
    if (shieldBreakBonus > 0) {
      attacker.nextAttackShieldBreakBonus = 0;
      logLine(state, `${attacker.name} zertruemmert mit Runenwut Schutz und Ruestung.`);
    }

    attacker.exhausted = true;
    logLine(
      state,
      `${attacker.name} greift ${defender.name} an und verursacht ${attackerDamage} Schaden.`
    );
  } else {
    changeHonor(opponent, -attackerDamage);
    if (attacker.effectId === "heal-self-on-attack") {
      healUnit(attacker, 1);
    }
    if (shieldBreakBonus > 0) {
      attacker.nextAttackShieldBreakBonus = 0;
      logLine(state, `${attacker.name} entlaedt Runenwut in einem vernichtenden Schlag.`);
    }
    attacker.exhausted = true;
    logLine(
      state,
      attacker.effectId === "can-attack-leader"
        ? `${attacker.name} greift direkt den gegnerischen Anführer an.`
        : `${attacker.name} trifft direkt die Ehre des Gegners.`
    );
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

  logLine(state, `${formatSide(state.activeSide)} beendet den Zug.`);
  applyEndTurnEffects(state, state.activeSide);
  const nextSide = getOpponentSide(state.activeSide);
  if (nextSide === "player") {
    state.turn += 1;
  }
  startTurn(state, nextSide);
  checkWinner(state);
  return state;
}

export function getPlayableCost(state: MatchState, side: PlayerSide, card: DeckCard) {
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

export function getCardPlayIssue(state: MatchState, side: PlayerSide, card: DeckCard) {
  const player = getStatePlayer(state, side);
  if (state.winner) {
    return "Das Spiel ist bereits beendet.";
  }
  if (state.activeSide !== side) {
    return "Du bist gerade nicht am Zug.";
  }
  if (player.gold < getModifiedCardCost(player, card)) {
    return "Nicht genug Gold.";
  }
  if (card.type === "character" && player.board.length >= BOARD_LIMIT) {
    return "Dein Feld ist voll.";
  }
  if (card.type === "equipment" && player.board.length === 0) {
    return "Du brauchst erst einen verbündeten Charakter.";
  }
  if (card.effectId === "ready-ally" && player.board.length === 0) {
    return "Kein Verbündeter für diesen Befehl vorhanden.";
  }
  if (card.effectId === "runenwut" && !player.board.some((unit) => unit.baseCardId === "der-runenmutant")) {
    return "Du brauchst den Runenmutanten auf dem Feld.";
  }
  if (card.effectId === "stun-enemy" && getStatePlayer(state, getOpponentSide(side)).board.length === 0) {
    return "Es gibt kein gegnerisches Ziel.";
  }
  return null;
}

export function canPlayCard(state: MatchState, side: PlayerSide, card: DeckCard) {
  return getCardPlayIssue(state, side, card) === null;
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

function formatSide(side: PlayerSide) {
  return side === "player" ? "Spieler" : "Bot";
}
