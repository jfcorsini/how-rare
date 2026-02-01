import { useState, useEffect, useRef } from 'react'
import CardSelector from './components/CardSelector'
import ProbabilityDisplay from './components/ProbabilityDisplay'
import SetSelector from './components/SetSelector'
import type { SetsData, Card, SetInfo, CardNamesData } from './types'
import './App.css'

type ChipKey = 'set' | 'packs' | 'price' | 'model'

function App() {
  const [sets, setSets] = useState<SetsData | null>(null)
  const [cardNames, setCardNames] = useState<CardNamesData | null>(null)
  const [selectedSetInfo, setSelectedSetInfo] = useState<SetInfo | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedSetCode, setSelectedSetCode] = useState<string | null>(null)
  const [packs, setPacks] = useState(36)
  const [packPrice, setPackPrice] = useState(6)
  const [model, setModel] = useState('Play Booster')
  const [query, setQuery] = useState('')
  const [activeChip, setActiveChip] = useState<ChipKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/sets.json').then(res => res.json()),
      fetch('/card-names.json').then(res => res.json())
    ])
      .then(([setsData, namesData]) => {
        setSets(setsData)
        setCardNames(namesData)
      })
      .catch(err => {
        console.error('Error loading data:', err)
        setError('Failed to load data')
      })
  }, [])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isInputFocused = activeElement === inputRef.current
      const isSlash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey
      const isCommandK = (event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)

      if ((isSlash || isCommandK) && !isInputFocused) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleCardSelect = (card: Card) => {
    setError(null)
    setSelectedCard(card)
    setQuery(card.n)

    if (card.s) {
      setSelectedSetCode(card.s)
      setSelectedSetInfo(sets?.[card.s] || null)
    }
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (!value.trim()) {
      setSelectedCard(null)
      setSelectedSetInfo(null)
    }
  }

  const handleSetChange = (code: string) => {
    const normalized = code || null
    setSelectedSetCode(normalized)
    setActiveChip(null)

    if (!normalized) return
    if (selectedCard && selectedCard.s !== normalized) {
      setSelectedCard(null)
      setSelectedSetInfo(null)
    }
  }

  const setLabel = selectedSetCode && sets
    ? sets[selectedSetCode]?.name ?? selectedSetCode.toUpperCase()
    : 'Any set'

  return (
    <div className="app">
      <main className={`app-main ${selectedCard ? 'has-selection' : 'is-empty'}`}>
        {!sets && !cardNames && !error && (
          <div className="loading">Loading data...</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {sets && cardNames && (
          <div className="spotlight-shell">
            <div className="spotlight-input"> 
              <CardSelector
                cardNames={cardNames}
                setFilter={selectedSetCode}
                onSelectCard={handleCardSelect}
                onInputChange={handleQueryChange}
                value={query}
                inputRef={inputRef}
                disabled={loading}
              />
              <div className="chips-bar">
                <div className="chip-wrap">
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setActiveChip(activeChip === 'set' ? null : 'set')}
                  >
                    Set: <span>{setLabel}</span>
                  </button>
                  {activeChip === 'set' && (
                    <div className="chip-popover">
                      <SetSelector
                        sets={sets}
                        onSelectSet={handleSetChange}
                        selectedSetCode={selectedSetCode}
                        compact
                      />
                    </div>
                  )}
                </div>
                <div className="chip-wrap">
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setActiveChip(activeChip === 'packs' ? null : 'packs')}
                  >
                    Packs: <span>{packs}</span>
                  </button>
                  {activeChip === 'packs' && (
                    <div className="chip-popover">
                      <div className="chip-control">
                        <label htmlFor="packs-input">Number of packs</label>
                        <div className="stepper">
                          <button
                            type="button"
                            className="stepper-button"
                            onClick={() => setPacks(Math.max(1, packs - 1))}
                          >
                            −
                          </button>
                          <input
                            id="packs-input"
                            type="number"
                            min={1}
                            value={packs}
                            onChange={(event) => {
                              const next = Number(event.target.value)
                              setPacks(Number.isNaN(next) ? 1 : Math.max(1, next))
                            }}
                          />
                          <button
                            type="button"
                            className="stepper-button"
                            onClick={() => setPacks(packs + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="chip-wrap">
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setActiveChip(activeChip === 'price' ? null : 'price')}
                  >
                    Pack: <span>€{packPrice.toFixed(2)}</span>
                  </button>
                  {activeChip === 'price' && (
                    <div className="chip-popover">
                      <div className="chip-control">
                        <label htmlFor="price-input">Pack price (€)</label>
                        <input
                          id="price-input"
                          type="number"
                          min={0}
                          step={0.1}
                          value={packPrice}
                          onChange={(event) => {
                            const next = Number(event.target.value)
                            setPackPrice(Number.isNaN(next) ? 0 : Math.max(0, next))
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="chip-wrap">
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setActiveChip(activeChip === 'model' ? null : 'model')}
                  >
                    Model: <span>{model}</span>
                  </button>
                  {activeChip === 'model' && (
                    <div className="chip-popover">
                      <div className="chip-control">
                        <p className="chip-title">Booster model</p>
                        {['Simplified', 'Play Booster', 'Draft-like'].map(option => (
                          <button
                            key={option}
                            type="button"
                            className={`chip-option ${option === model ? 'is-active' : ''}`}
                            onClick={() => {
                              setModel(option)
                              setActiveChip(null)
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="spotlight-hint">Press ⌘K or / to focus • Esc to close</div>
            </div>

            {selectedCard && selectedSetInfo ? (
              <div className="selection-panel">
                <ProbabilityDisplay
                  card={selectedCard}
                  setInfo={selectedSetInfo}
                  setCode={selectedCard.s}
                  packs={packs}
                  packPrice={packPrice}
                />
              </div>
            ) : (
              <div className="empty-state">
                <p>Search a card to see odds, expected copies, and the pack curve.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Data from Scryfall • Simplified odds</p>
      </footer>
    </div>
  )
}

export default App
