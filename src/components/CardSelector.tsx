import { useState, useMemo, useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import type { Card, CardNamesData } from '../types';
import './CardSelector.css';

interface CardSelectorProps {
  cardNames: CardNamesData;
  setFilter?: string | null;
  onSelectCard: (card: Card) => void;
  onInputChange: (value: string) => void;
  value: string;
  inputRef?: RefObject<HTMLInputElement>;
  disabled?: boolean;
}

export default function CardSelector({
  cardNames,
  setFilter,
  onSelectCard,
  onInputChange,
  value,
  inputRef,
  disabled
}: CardSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = useMemo(() => {
    if (!value.trim()) return [];

    const searchTerm = value.toLowerCase();

    return cardNames
      .filter(entry => entry.n.toLowerCase().includes(searchTerm))
      .filter(entry => (setFilter ? entry.s === setFilter : true))
      .slice(0, 8)
      .map(entry => ({
        n: entry.n,
        s: entry.s,
        r: entry.r,
        f: [],
        i: entry.i,
        p: entry.p
      } as Card));
  }, [value, cardNames, setFilter]);

  useEffect(() => {
    if (!value.trim()) {
      setIsOpen(false);
      setActiveIndex(0);
      return;
    }

    if (filteredResults.length > 0 && isOpen) {
      setActiveIndex(0);
    }
  }, [value, filteredResults.length, isOpen]);

  const handleSelect = (card: Card) => {
    setIsOpen(false);
    onSelectCard(card);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredResults.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const activeCard = filteredResults[activeIndex];
      if (activeCard) {
        handleSelect(activeCard);
      }
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const formatPrice = (card: Card) => {
    if (card.p?.eur) {
      return `€${parseFloat(card.p.eur).toFixed(2)}`;
    }
    if (card.p?.usd) {
      return `$${parseFloat(card.p.usd).toFixed(2)}`;
    }
    return null;
  };

  return (
    <div className="card-selector" ref={containerRef}>
      <label htmlFor="card-input" className="card-label">Search a card</label>
      <input
        id="card-input"
        type="text"
        value={value}
        onChange={(e) => {
          onInputChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search a card… (e.g. ‘Sheoldred’, ‘Lightning Bolt’)"
        className="card-input"
        disabled={disabled}
        ref={inputRef}
        autoComplete="off"
      />

      {isOpen && filteredResults.length > 0 && (
        <div className="card-dropdown" role="listbox">
          {filteredResults.map((card, index) => {
            const priceLabel = formatPrice(card);
            return (
              <div
                key={`${card.n}-${card.s}`}
                className={`card-option ${index === activeIndex ? 'is-active' : ''}`}
                onClick={() => handleSelect(card)}
                role="option"
                aria-selected={index === activeIndex}
              >
                {card.i && (
                  <img
                    src={card.i}
                    alt={card.n}
                    className="card-thumbnail"
                  />
                )}
                <div className="card-info">
                  <div className="card-name">{card.n}</div>
                  <div className="card-details">
                    {card.s && (
                      <span className="card-set">
                        {card.s.toUpperCase()}
                      </span>
                    )}
                    {card.r && (
                      <span className={`card-rarity rarity-${card.r}`}>
                        {card.r.toUpperCase()}
                      </span>
                    )}
                    {priceLabel && (
                      <span className="card-price">
                        {priceLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
