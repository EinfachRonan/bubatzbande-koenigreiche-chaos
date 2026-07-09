export type CardType = "character" | "action" | "chaos" | "equipment";
export type CardRarity = "common" | "rare" | "epic" | "legendary";
export type EffectId =
  | "steal-gold-on-play"
  | "allies-plus-health"
  | "heal-self-on-attack"
  | "extra-gold-each-turn"
  | "build-random-tool"
  | "spells-cost-less"
  | "can-attack-leader"
  | "summon-tree-spirit-on-death"
  | "draw-two-or-gain-three"
  | "untargetable-every-other-round"
  | "heal-all-allies-end-turn"
  | "gain-attack-on-ally-death"
  | "mutant-rage"
  | "runenwut"
  | "heal-leader"
  | "plunder-gold"
  | "ready-ally"
  | "fog-weaken"
  | "ally-attack-buff"
  | "stun-enemy"
  | "redistribute-board"
  | "both-discard"
  | "random-sleep"
  | "board-blast"
  | "swap-weakest-strongest"
  | "both-gain-gold"
  | "crown-guard"
  | "attack-bonus"
  | "extra-strike-damage"
  | "shadow-cloak"
  | "forge-buff"
  | "token-vanilla";

export type CardDefinition = {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  attack?: number;
  health?: number;
  effect: string;
  effectId: EffectId;
  image: string;
  imageFit?: "cover" | "contain";
  imagePosition?: string;
  tags: string[];
};

export type DeckCard = CardDefinition & {
  uid: string;
};

export type UnitInstance = {
  instanceId: string;
  baseCardId: string;
  type: "character";
  name: string;
  owner: "player" | "bot";
  cost: number;
  attack: number;
  health: number;
  maxHealth: number;
  effect: string;
  effectId: EffectId;
  image: string;
  imageFit?: "cover" | "contain";
  imagePosition?: string;
  rarity: CardRarity;
  tags: string[];
  exhausted: boolean;
  summonedTurn: number;
  sleepForTurns: number;
  stunForTurns: number;
  untargetableForTurns: number;
  temporaryAttackPenalty: number;
  temporaryAttackBonus: number;
  temporaryAttackBonusTurns: number;
  shielded: boolean;
  bonusStrikeDamage: number;
  nextAttackShieldBreakBonus: number;
};
