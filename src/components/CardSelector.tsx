import { useState, useMemo, useRef, useEffect } from 'react';
import type { Card, CardsData, CardNamesData } from '../types';
import './CardSelector.css';

interface CardSelectorProps {
  cards: CardsData | null;
  cardNames: CardNamesData;
  onSelectCard: (card: Card, fromSearch?: boolean) => void;
  disabled?: boolean;
}

export default function CardSelector({ cards, cardNames, onSelectCard, disabled }: CardSelectorProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    if (!input.trim()) return [];
    
    const searchTerm = input.toLowerCase();
    
    // If a specific set is selected, search within that set
    if (cards) {
      return Object.values(cards)
        .filter(card => card.n.toLowerCase().includes(searchTerm))
        .slice(0, 8);
    }
    
    // Otherwise search all cards from card-names.json
    return cardNames
      .filter(entry => entry.n.toLowerCase().includes(searchTerm))
      .slice(0, 8)
      .map(entry => ({
        n: entry.n,
        s: entry.s,
        r: entry.r,
        f: [],
        i: entry.i,
        p: entry.p
      } as Card));
  }, [input, cards, cardNames]);

  const handleSelect = (card: Card) => {
    console.log('Card selected:', card.n, 'fromSearch:', !cards);
    setInput(card.n);
    setIsOpen(false);
    onSelectCard(card, !cards); // fromSearch = true if no specific set selected
  };

  return (
    <div className="card-selector" ref={containerRef}>
      <label htmlFor="card-input">Choose a Card</label>
      <input
        id="card-input"
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={cards ? "Type card name..." : "Type any card name (from all sets)..."}
        className="card-input"
        disabled={disabled}
      />
      
      {isOpen && filteredResults.length > 0 && (
        <div className="card-dropdown">
          {filteredResults.map((card) => (
            <div
              key={card.n + card.s}
              className="card-option"
              onClick={() => handleSelect(card)}
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
                  {card.p?.usd && (
                    <span className="card-price">
                      ${parseFloat(card.p.usd).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
