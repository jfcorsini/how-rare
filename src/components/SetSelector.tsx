import { useState, useMemo } from 'react';
import type { SetsData } from '../types';
import './SetSelector.css';

interface SetSelectorProps {
  sets: SetsData;
  onSelectSet: (setCode: string) => void;
  selectedSetCode: string | null;
}

export default function SetSelector({ sets, onSelectSet, selectedSetCode }: SetSelectorProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSets = useMemo(() => {
    if (!input.trim()) return [];
    
    const searchTerm = input.toLowerCase();
    return Object.entries(sets)
      .filter(([code, info]) => 
        info.name.toLowerCase().includes(searchTerm) || 
        code.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);
  }, [input, sets]);

  const handleSelect = (setCode: string, setName: string) => {
    setInput(setName);
    setIsOpen(false);
    onSelectSet(setCode);
  };

  const handleClear = () => {
    setInput('');
    onSelectSet('');
  };

  return (
    <div className="set-selector">
      <label htmlFor="set-input">Filter by Set (Optional)</label>
      <div className="set-input-wrapper">
        <input
          id="set-input"
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Any set..."
          className="set-input"
        />
        {selectedSetCode && (
          <button 
            className="clear-button" 
            onClick={handleClear}
            title="Clear set filter"
          >
            ✕
          </button>
        )}
      </div>
      
      {isOpen && filteredSets.length > 0 && (
        <div className="set-dropdown">
          {filteredSets.map(([code, info]) => (
            <div
              key={code}
              className="set-option"
              onClick={() => handleSelect(code, info.name)}
            >
              <div className="set-name">{info.name}</div>
              <div className="set-code">{code.toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
