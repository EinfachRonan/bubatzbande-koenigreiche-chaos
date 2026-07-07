"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CardFrame } from "@/components/card-frame";
import { cardRarities, cards, cardTypes } from "@/lib/cards";
import { CardRarity, CardType } from "@/types/cards";

export function CardLibraryClient() {
  const [typeFilter, setTypeFilter] = useState<CardType | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<CardRarity | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(cards[0]?.id ?? "");

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

  return (
    <section className="library-shell">
      <div className="library-layout">
        <div className="library-panel">
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
                  {type}
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
                  {rarity}
                </option>
              ))}
            </select>
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
                  onClick={() => setSelectedId(card.id)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="detail-panel">
          <p className="eyebrow">Karten-Detail</p>
          <h2>{selectedCard.name}</h2>
          <div className="detail-meta">
            <span className="card-badge">{selectedCard.type}</span>
            <span className={`card-badge rarity-${selectedCard.rarity}`}>{selectedCard.rarity}</span>
          </div>
          <p className="detail-text">{selectedCard.effect}</p>
          <p className="detail-text">Kosten: {selectedCard.cost} Gold</p>
          {selectedCard.attack !== undefined ? (
            <p className="detail-text">
              Werte: {selectedCard.attack} Angriff / {selectedCard.health} Leben
            </p>
          ) : null}
          <p className="detail-text">Bildpfad: {selectedCard.image}</p>
          <div className="card-tags">
            {selectedCard.tags.map((tag) => (
              <span className="mini-badge" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className="detail-actions">
            <Link href="/game" className="primary-button">
              Direkt spielen
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
