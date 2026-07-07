import { CardDefinition, CardRarity, CardType } from "@/types/cards";

export const cards: CardDefinition[] = [
  {
    id: "der-gruene-kobold",
    name: "Der grüne Kobold",
    type: "character",
    rarity: "rare",
    cost: 2,
    attack: 2,
    health: 3,
    effect: "Beim Ausspielen klaut er 1 Gold vom Gegner.",
    effectId: "steal-gold-on-play",
    image: "/images/cards/der-gruene-kobold.png",
    tags: ["Dieb", "Gold", "Frühspiel"]
  },
  {
    id: "der-koenig-von-deutschland",
    name: "Der König von Deutschland",
    type: "character",
    rarity: "legendary",
    cost: 7,
    attack: 3,
    health: 8,
    effect: "Verbündete erhalten +1 Leben.",
    effectId: "allies-plus-health",
    image: "/images/cards/der-koenig-von-deutschland.png",
    tags: ["König", "Aura", "Late Game"]
  },
  {
    id: "artur-king-kebab",
    name: "Artur King Kebab",
    type: "character",
    rarity: "epic",
    cost: 5,
    attack: 4,
    health: 5,
    effect: "Wenn er angreift, heilt er sich um 1.",
    effectId: "heal-self-on-attack",
    image: "/images/cards/artur-king-kebab.png",
    tags: ["Bestie", "Sustain"]
  },
  {
    id: "allan-king-kebab",
    name: "Allan King Kebab",
    type: "character",
    rarity: "epic",
    cost: 4,
    attack: 2,
    health: 5,
    effect: "Erzeugt jede Runde 1 Gold extra.",
    effectId: "extra-gold-each-turn",
    image: "/images/cards/allan-king-kebab.png",
    tags: ["Ökonomie", "Motor"]
  },
  {
    id: "marwin-der-pionier",
    name: "Marwin der Pionier",
    type: "character",
    rarity: "legendary",
    cost: 6,
    attack: 3,
    health: 6,
    effect: "Baut alle 2 Runden ein zufälliges Werkzeug.",
    effectId: "build-random-tool",
    image: "/images/cards/marwin-der-pionier.png",
    tags: ["Werkzeug", "Langspiel"]
  },
  {
    id: "mr-mollymann",
    name: "Mr Mollymann",
    type: "character",
    rarity: "rare",
    cost: 3,
    attack: 3,
    health: 4,
    effect: "Zauber kosten 1 Gold weniger.",
    effectId: "spells-cost-less",
    image: "/images/cards/mr-mollymann.png",
    tags: ["Zauber", "Tempo"]
  },
  {
    id: "kleine-nille",
    name: "Kleine Nille",
    type: "character",
    rarity: "rare",
    cost: 4,
    attack: 5,
    health: 2,
    effect: "Kann direkt den gegnerischen Anführer angreifen.",
    effectId: "can-attack-leader",
    image: "/images/cards/kleine-nille.png",
    tags: ["Assassine", "Direktschaden"]
  },
  {
    id: "lg3",
    name: "LG3",
    type: "character",
    rarity: "epic",
    cost: 5,
    attack: 2,
    health: 7,
    effect: "Beschwört beim Tod einen Baumgeist.",
    effectId: "summon-tree-spirit-on-death",
    image: "/images/cards/lg3.png",
    tags: ["Natur", "Todesröcheln"]
  },
  {
    id: "donpatron",
    name: "DonPatron",
    type: "character",
    rarity: "legendary",
    cost: 6,
    attack: 4,
    health: 6,
    effect: "Beim Ausspielen ziehst du 2 Karten oder erhältst 3 Gold.",
    effectId: "draw-two-or-gain-three",
    image: "/images/cards/donpatron.png",
    tags: ["Wert", "Flexibel"]
  },
  {
    id: "der-graue-geist",
    name: "Der Graue Geist",
    type: "character",
    rarity: "epic",
    cost: 5,
    attack: 4,
    health: 3,
    effect: "Kann nur jede zweite Runde angegriffen werden.",
    effectId: "untargetable-every-other-round",
    image: "/images/cards/der-graue-geist.png",
    tags: ["Geist", "Schutz"]
  },
  {
    id: "der-kraeuterkoenig",
    name: "Der KräuterKönig",
    type: "character",
    rarity: "legendary",
    cost: 7,
    attack: 3,
    health: 7,
    effect: "Am Ende deiner Runde heilt er alle Verbündeten um 1.",
    effectId: "heal-all-allies-end-turn",
    image: "/images/cards/der-kraeuterkoenig.png",
    tags: ["Heilung", "König"]
  },
  {
    id: "fokuhilamann",
    name: "Fokuhilamann",
    type: "character",
    rarity: "rare",
    cost: 4,
    attack: 5,
    health: 4,
    effect: "Wenn ein Verbündeter stirbt, bekommt er +1 Angriff.",
    effectId: "gain-attack-on-ally-death",
    image: "/images/cards/fokuhilamann.png",
    tags: ["Schmied", "Wachsend"]
  },
  {
    id: "doenerpause",
    name: "Dönerpause",
    type: "action",
    rarity: "common",
    cost: 2,
    effect: "Heile 4 Leben.",
    effectId: "heal-leader",
    image: "/images/cards/doenerpause.png",
    tags: ["Heilung"]
  },
  {
    id: "goldsack-gepluendert",
    name: "Goldsack geplündert",
    type: "action",
    rarity: "rare",
    cost: 3,
    effect: "Gegner verliert 2 Gold, du erhältst 2 Gold.",
    effectId: "plunder-gold",
    image: "/images/cards/goldsack-gepluendert.png",
    tags: ["Gold", "Diebstahl"]
  },
  {
    id: "koeniglicher-befehl",
    name: "Königlicher Befehl",
    type: "action",
    rarity: "epic",
    cost: 4,
    effect: "Ein Verbündeter darf sofort erneut angreifen.",
    effectId: "ready-ally",
    image: "/images/cards/koeniglicher-befehl.png",
    tags: ["Tempo", "Befehl"]
  },
  {
    id: "kraeuternebel",
    name: "Kräuternebel",
    type: "action",
    rarity: "rare",
    cost: 3,
    effect: "Alle gegnerischen Charaktere erhalten für 1 Runde -1 Angriff.",
    effectId: "fog-weaken",
    image: "/images/cards/kraeuternebel.png",
    tags: ["Debuff", "Nebel"]
  },
  {
    id: "pionier-werkzeug",
    name: "Pionier-Werkzeug",
    type: "action",
    rarity: "common",
    cost: 2,
    effect: "Ein Verbündeter erhält +2 Angriff.",
    effectId: "ally-attack-buff",
    image: "/images/cards/pionier-werkzeug.png",
    tags: ["Buff", "Werkzeug"]
  },
  {
    id: "grauer-fluch",
    name: "Grauer Fluch",
    type: "action",
    rarity: "epic",
    cost: 4,
    effect: "Ein gegnerischer Charakter kann nächste Runde nicht angreifen.",
    effectId: "stun-enemy",
    image: "/images/cards/grauer-fluch.png",
    tags: ["Kontrolle", "Fluch"]
  },
  {
    id: "bubatz-alarm",
    name: "Bubatz-Alarm",
    type: "chaos",
    rarity: "legendary",
    cost: 5,
    effect: "Alle Charaktere auf dem Feld werden zufällig neu verteilt.",
    effectId: "redistribute-board",
    image: "/images/cards/bubatz-alarm.png",
    tags: ["Chaos", "Board"]
  },
  {
    id: "der-zoll-kommt",
    name: "Der Zoll kommt",
    type: "chaos",
    rarity: "rare",
    cost: 3,
    effect: "Beide Spieler müssen 2 Handkarten abwerfen.",
    effectId: "both-discard",
    image: "/images/cards/der-zoll-kommt.png",
    tags: ["Chaos", "Hand"]
  },
  {
    id: "kebab-koma",
    name: "Kebab-Koma",
    type: "chaos",
    rarity: "common",
    cost: 2,
    effect: "Ein zufälliger Charakter schläft 1 Runde und kann nicht angreifen.",
    effectId: "random-sleep",
    image: "/images/cards/kebab-koma.png",
    tags: ["Chaos", "Schlaf"]
  },
  {
    id: "kraeuterexplosion",
    name: "Kräuterexplosion",
    type: "chaos",
    rarity: "epic",
    cost: 4,
    effect: "Alle Charaktere erhalten 2 Schaden.",
    effectId: "board-blast",
    image: "/images/cards/kraeuterexplosion.png",
    tags: ["Chaos", "Schaden"]
  },
  {
    id: "falscher-koenig",
    name: "Falscher König",
    type: "chaos",
    rarity: "legendary",
    cost: 5,
    effect: "Tausche den schwächsten eigenen Charakter mit dem stärksten gegnerischen Charakter.",
    effectId: "swap-weakest-strongest",
    image: "/images/cards/falscher-koenig.png",
    tags: ["Chaos", "Tausch"]
  },
  {
    id: "goldregen",
    name: "Goldregen",
    type: "chaos",
    rarity: "rare",
    cost: 3,
    effect: "Beide Spieler erhalten 5 Gold.",
    effectId: "both-gain-gold",
    image: "/images/cards/goldregen.png",
    tags: ["Chaos", "Gold"]
  },
  {
    id: "goldene-krone",
    name: "Goldene Krone",
    type: "equipment",
    rarity: "epic",
    cost: 3,
    effect: "+2 Leben und Schutz vor dem ersten Schaden.",
    effectId: "crown-guard",
    image: "/images/cards/goldene-krone.png",
    tags: ["Ausrüstung", "Schutz"]
  },
  {
    id: "kebab-spiess",
    name: "Kebab-Spieß",
    type: "equipment",
    rarity: "common",
    cost: 2,
    effect: "+2 Angriff.",
    effectId: "attack-bonus",
    image: "/images/cards/kebab-spiess.png",
    tags: ["Ausrüstung", "Angriff"]
  },
  {
    id: "pionier-zirkel",
    name: "Pionier-Zirkel",
    type: "equipment",
    rarity: "rare",
    cost: 2,
    effect: "Verursacht bei Angriffen +1 Extraschaden.",
    effectId: "extra-strike-damage",
    image: "/images/cards/pionier-zirkel.png",
    tags: ["Ausrüstung", "Werkzeug"]
  },
  {
    id: "schattenmantel",
    name: "Schattenmantel",
    type: "equipment",
    rarity: "epic",
    cost: 3,
    effect: "Der Träger ist 1 Runde nicht angreifbar.",
    effectId: "shadow-cloak",
    image: "/images/cards/schattenmantel.png",
    tags: ["Ausrüstung", "Schutz"]
  },
  {
    id: "schmiedehammer",
    name: "Schmiedehammer",
    type: "equipment",
    rarity: "common",
    cost: 2,
    effect: "+1 Angriff, +1 Leben.",
    effectId: "forge-buff",
    image: "/images/cards/schmiedehammer.png",
    tags: ["Ausrüstung", "Schmiede"]
  }
];

export const cardTypes: CardType[] = ["character", "action", "chaos", "equipment"];
export const cardRarities: CardRarity[] = ["common", "rare", "epic", "legendary"];

export function getCardById(cardId: string) {
  const card = cards.find((entry) => entry.id === cardId);
  if (!card) {
    throw new Error(`Unknown card id: ${cardId}`);
  }
  return card;
}
