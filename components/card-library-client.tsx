"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CardFrame } from "@/components/card-frame";
import { cardRarities, cards, cardTypes } from "@/lib/cards";
import {
  DECK_SIZE_MAX,
  DECK_SIZE_MIN,
  PLAYER_DECK_STORAGE_KEY,
  canAddCardToDeck,
  getDeckCardsForDisplay,
  normalizeDeckIds,
  starterDeckIds,
  validateDeckIds
} from "@/lib/decks";
import { CardRarity, CardType } from "@/types/cards";

const typeLabels: Record<CardType, string> = {
  character: "Charakter",
  action: "Aktion",
  chaos: "Chaos",
  equipment: "Ausrüstung"
};

const rarityLabels: Record<CardRarity, string> = {
  common: "Gewöhnlich",
  rare: "Selten",
  epic: "Episch",
  legendary: "Legendär"
};

export function CardLibraryClient() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<CardType | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<CardRarity | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(cards[0]?.id ?? "");
  const [deckIds, setDeckIds] = useState<string[]>(starterDeckIds);
  const [statusMessage, setStatusMessage] = useState<string>("Starterdeck geladen.");

  useEffect(() => {
    const rawDeck = window.localStorage.getItem(PLAYER_DECK_STORAGE_KEY);
    if (!rawDeck) {
      window.localStorage.setItem(PLAYER_DECK_STORAGE_KEY, JSON.stringify(starterDeckIds));
      return;
    }

    try {
      const parsed = JSON.parse(rawDeck);
      if (!Array.isArray(parsed)) {
        return;
      }
      const normalized = normalizeDeckIds(parsed.filter((entry): entry is string => typeof entry === "string"));
      if (normalized.length >= DECK_SIZE_MIN) {
        setDeckIds(normalized);
        setStatusMessage("Gespeichertes Deck geladen.");
      }
    } catch {
      window.localStorage.setItem(PLAYER_DECK_STORAGE_KEY, JSON.stringify(starterDeckIds));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PLAYER_DECK_STORAGE_KEY, JSON.stringify(deckIds));
  }, [deckIds]);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return cards.filter((card) => {
      const typeMatch = typeFilter === "all" || card.type === typeFilter;
      const rarityMatch = rarityFilter === "all" || card.rarity === rarityFilter;
      const searchMatch =
        normalized.length === 0 ||
        card.name.toLowerCase().includes(normalized) ||
        card.effect.toLowerCase().includes(normalized) ||
        card.tags.some((tag) => tag.toLowerCase().includes(normalized));
      return typeMatch && rarityMatch && searchMatch;
    });
  }, [rarityFilter, search, typeFilter]);

  const selectedCard = cards.find((card) => card.id === selectedId) ?? filtered[0] ?? cards[0];
  const addState = canAddCardToDeck(deckIds, selectedCard);
  const deckView = getDeckCardsForDisplay(deckIds);
  const deckValidation = validateDeckIds(deckIds);
  const canPlayWithDeck = deckValidation.isValid && deckIds.length >= DECK_SIZE_MIN;

  const deckCurve = useMemo(() => {
    const counts = new Map<number, number>();
    deckView.forEach(({ card, count }) => {
      counts.set(card.cost, (counts.get(card.cost) ?? 0) + count);
    });
    return Array.from(counts.entries())
      .sort(([left], [right]) => left - right)
      .map(([cost, count]) => ({ cost, count }));
  }, [deckView]);

  const deckTypeDistribution = useMemo(() => {
    const counts = new Map<CardType, number>();
    deckView.forEach(({ card, count }) => {
      counts.set(card.type, (counts.get(card.type) ?? 0) + count);
    });
    return cardTypes
      .map((type) => ({
        type,
        label: typeLabels[type],
        count: counts.get(type) ?? 0
      }))
      .filter((entry) => entry.count > 0);
  }, [deckView]);

  const highestCurveCount = Math.max(1, ...deckCurve.map((entry) => entry.count));
  const highestTypeCount = Math.max(1, ...deckTypeDistribution.map((entry) => entry.count));

  function addSelectedCard() {
    if (!addState.allowed) {
      setStatusMessage(addState.reason ?? "Diese Karte kann nicht mehr hinzugefügt werden.");
      return;
    }
    setDeckIds((current) => [...current, selectedCard.id]);
    setStatusMessage(`${selectedCard.name} wurde zum Deck hinzugefügt.`);
  }

  function removeCard(cardId: string) {
    const cardName = cards.find((entry) => entry.id === cardId)?.name ?? "Die Karte";
    setDeckIds((current) => {
      const index = current.lastIndexOf(cardId);
      if (index === -1) {
        return current;
      }
      const next = [...current];
      next.splice(index, 1);
      return next;
    });
    setStatusMessage(`${cardName} wurde aus dem Deck entfernt.`);
  }

  return (
    <section className="library-shell">
      <div className="library-layout">
        <div className="library-panel">
          <div className="library-toolbar">
            <div className="library-toolbar-copy">
              <p className="eyebrow">Archiv des Starter-Sets</p>
              <h2 className="section-title">Kartenbibliothek &amp; Deckbuilder</h2>
            </div>
            <div className="filter-row">
              <input
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nach Name, Effekt oder Tag suchen"
              />
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as CardType | "all")}
              >
                <option value="all">Alle Typen</option>
                {cardTypes.map((type) => (
                  <option value={type} key={type}>
                    {typeLabels[type]}
                  </option>
                ))}
              </select>
              <select
                className="filter-select"
                value={rarityFilter}
                onChange={(event) => setRarityFilter(event.target.value as CardRarity | "all")}
              >
                <option value="all">Alle Seltenheiten</option>
                {cardRarities.map((rarity) => (
                  <option value={rarity} key={rarity}>
                    {rarityLabels[rarity]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="library-empty">Keine Karte passt auf die aktuelle Suche.</p>
          ) : (
            <div className="library-grid">
              {filtered.map((card) => (
                <CardFrame
                  key={card.id}
                  card={card}
                  selectable
                  selected={selectedCard?.id === card.id}
                  footer={
                    <p className="hint-text">
                      {canAddCardToDeck(deckIds, card).allowed ? "Zum Deck hinzufügbar" : "Kopienlimit erreicht"}
                    </p>
                  }
                  onClick={() => setSelectedId(card.id)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="detail-panel deckbuilder-panel">
          <p className="eyebrow">Deckbuilder</p>
          <h2>{selectedCard.name}</h2>
          <div className="detail-hero-card">
            <CardFrame card={selectedCard} />
          </div>
          <div className="detail-meta">
            <span className="card-badge">{typeLabels[selectedCard.type]}</span>
            <span className={`card-badge rarity-${selectedCard.rarity}`}>{rarityLabels[selectedCard.rarity]}</span>
          </div>
          <p className="detail-text">{selectedCard.effect}</p>
          <p className="detail-text">
            Deckstatus: <strong>{deckIds.length}</strong> / {DECK_SIZE_MAX}
          </p>
          <p className="detail-text">{statusMessage}</p>
          {!addState.allowed ? <p className="detail-text deck-warning">{addState.reason}</p> : null}
          {!canPlayWithDeck ? (
            <p className="detail-text deck-warning">
              Für ein Match brauchst du mindestens {DECK_SIZE_MIN} regelkonforme Karten.
            </p>
          ) : null}
          <div className="detail-actions">
            <button className="primary-button" onClick={addSelectedCard}>
              Karte hinzufügen
            </button>
            <button className="ghost-button" onClick={() => removeCard(selectedCard.id)}>
              Karte entfernen
            </button>
          </div>

          <div className="deckbuilder-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setDeckIds(starterDeckIds);
                setStatusMessage("Starterdeck wurde geladen.");
              }}
            >
              Starterdeck verwenden
            </button>
            <button
              className="ghost-button"
              onClick={() => {
                setDeckIds([]);
                setStatusMessage("Deck wurde zurückgesetzt.");
              }}
            >
              Deck zurücksetzen
            </button>
            <button
              className="action-button"
              disabled={!canPlayWithDeck}
              onClick={() => router.push("/game")}
            >
              Mit diesem Deck spielen
            </button>
          </div>

          <div className="deck-list-panel deck-insights">
            <h3 className="section-title">Deck-Analyse</h3>
            <div className="deck-insight-grid">
              <div className="deck-insight-block">
                <p className="eyebrow">Goldkurve</p>
                <div className="deck-curve-list">
                  {deckCurve.map((entry) => (
                    <div key={`curve-${entry.cost}`} className="deck-curve-row">
                      <span className="deck-insight-label">{entry.cost} Gold</span>
                      <div className="deck-insight-bar">
                        <span style={{ width: `${(entry.count / highestCurveCount) * 100}%` }} aria-hidden="true" />
                      </div>
                      <strong>{entry.count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="deck-insight-block">
                <p className="eyebrow">Kartentypen</p>
                <div className="deck-type-list">
                  {deckTypeDistribution.map((entry) => (
                    <div key={`type-${entry.type}`} className="deck-type-row">
                      <span className="deck-insight-label">{entry.label}</span>
                      <div className="deck-insight-bar">
                        <span style={{ width: `${(entry.count / highestTypeCount) * 100}%` }} aria-hidden="true" />
                      </div>
                      <strong>{entry.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="deck-list-panel">
            <h3 className="section-title">Aktuelles Deck</h3>
            <p className="hint-text">
              Regeln: Gewöhnlich/Selten/Episch max. 2x, Legendär max. 1x, mindestens {DECK_SIZE_MIN} Karten.
            </p>
            <ul className="deck-list">
              {deckView.map(({ card, count }) => (
                <li key={card.id} className="deck-list-item">
                  <div>
                    <strong>{card.name}</strong>
                    <p className="hint-text">
                      {count}x · {card.cost} Gold
                    </p>
                  </div>
                  <button className="ghost-button deck-remove-button" onClick={() => removeCard(card.id)}>
                    -1
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-actions">
            <Link href="/game" className="secondary-button">
              Zum Match
            </Link>
            <Link href="/" className="ghost-button">
              Zur Startseite
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
