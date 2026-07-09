import { cards, getCardById } from "@/lib/cards";
import { CardDefinition, CardRarity, DeckCard } from "@/types/cards";

export const PLAYER_DECK_STORAGE_KEY = "bubatzbande-player-deck-v1";
export const DECK_SIZE_MAX = 30;
export const DECK_SIZE_MIN = 20;

export const starterDeckIds: string[] = [
  "der-gruene-kobold",
  "der-gruene-kobold",
  "mr-mollymann",
  "kleine-nille",
  "fokuhilamann",
  "allan-king-kebab",
  "allan-king-kebab",
  "artur-king-kebab",
  "lg3",
  "donpatron",
  "der-graue-geist",
  "der-kraeuterkoenig",
  "der-runenmutant",
  "doenerpause",
  "doenerpause",
  "goldsack-gepluendert",
  "goldsack-gepluendert",
  "koeniglicher-befehl",
  "kraeuternebel",
  "kraeuternebel",
  "pionier-werkzeug",
  "pionier-werkzeug",
  "grauer-fluch",
  "kebab-koma",
  "kebab-koma",
  "kraeuterexplosion",
  "goldregen",
  "goldene-krone",
  "kebab-spiess",
  "schmiedehammer"
];

export const botStarterDeckIds: string[] = [
  "der-gruene-kobold",
  "der-gruene-kobold",
  "mr-mollymann",
  "kleine-nille",
  "fokuhilamann",
  "allan-king-kebab",
  "artur-king-kebab",
  "artur-king-kebab",
  "lg3",
  "der-graue-geist",
  "donpatron",
  "doenerpause",
  "doenerpause",
  "goldsack-gepluendert",
  "koeniglicher-befehl",
  "kraeuternebel",
  "pionier-werkzeug",
  "pionier-werkzeug",
  "grauer-fluch",
  "kebab-koma",
  "kraeuterexplosion",
  "goldregen",
  "goldene-krone",
  "kebab-spiess",
  "kebab-spiess",
  "pionier-zirkel",
  "schmiedehammer",
  "schmiedehammer",
  "der-runenmutant",
  "der-koenig-von-deutschland"
];

export function getDeckCopyLimit(rarity: CardRarity) {
  return rarity === "legendary" ? 1 : 2;
}

export function getDeckCounts(cardIds: string[]) {
  return cardIds.reduce<Record<string, number>>((result, cardId) => {
    result[cardId] = (result[cardId] ?? 0) + 1;
    return result;
  }, {});
}

export function normalizeDeckIds(cardIds: string[]) {
  const normalized: string[] = [];
  const counts: Record<string, number> = {};

  for (const cardId of cardIds) {
    const card = cards.find((entry) => entry.id === cardId);
    if (!card) {
      continue;
    }
    const nextCount = (counts[cardId] ?? 0) + 1;
    if (nextCount > getDeckCopyLimit(card.rarity)) {
      continue;
    }
    if (normalized.length >= DECK_SIZE_MAX) {
      break;
    }
    counts[cardId] = nextCount;
    normalized.push(cardId);
  }

  return normalized;
}

export function validateDeckIds(cardIds: string[]) {
  const errors: string[] = [];
  const counts = getDeckCounts(cardIds);

  if (cardIds.length > DECK_SIZE_MAX) {
    errors.push(`Ein Deck darf maximal ${DECK_SIZE_MAX} Karten enthalten.`);
  }

  for (const [cardId, count] of Object.entries(counts)) {
    const card = cards.find((entry) => entry.id === cardId);
    if (!card) {
      errors.push(`Unbekannte Karte im Deck: ${cardId}`);
      continue;
    }
    const limit = getDeckCopyLimit(card.rarity);
    if (count > limit) {
      errors.push(`${card.name} darf nur ${limit}x im Deck liegen.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function canAddCardToDeck(deckIds: string[], card: CardDefinition) {
  if (deckIds.length >= DECK_SIZE_MAX) {
    return { allowed: false, reason: `Deck ist voll (${DECK_SIZE_MAX}/${DECK_SIZE_MAX}).` };
  }

  const count = deckIds.filter((cardId) => cardId === card.id).length;
  const limit = getDeckCopyLimit(card.rarity);
  if (count >= limit) {
    return {
      allowed: false,
      reason: `${card.name} darf als ${rarityName(card.rarity)} nur ${limit}x ins Deck.`
    };
  }

  return { allowed: true, reason: null };
}

export function getDeckCardsForDisplay(deckIds: string[]) {
  const counts = getDeckCounts(deckIds);
  return Object.entries(counts)
    .map(([cardId, count]) => ({
      card: getCardById(cardId),
      count
    }))
    .sort((left, right) => {
      if (left.card.cost !== right.card.cost) {
        return left.card.cost - right.card.cost;
      }
      return left.card.name.localeCompare(right.card.name);
    });
}

export function buildDeckFromIds(cardIds: string[], ownerSeed: string): DeckCard[] {
  return shuffle(
    cardIds.map((cardId, index) => ({
      ...getCardById(cardId),
      uid: `${ownerSeed}-${cardId}-${index + 1}`
    }))
  );
}

function rarityName(rarity: CardRarity) {
  switch (rarity) {
    case "common":
      return "gewöhnliche Karte";
    case "rare":
      return "seltene Karte";
    case "epic":
      return "epische Karte";
    case "legendary":
      return "legendäre Karte";
    default:
      return "Karte";
  }
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
