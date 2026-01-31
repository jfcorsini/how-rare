import { useState, useEffect } from 'react'
import CardSelector from './components/CardSelector'
import ProbabilityDisplay from './components/ProbabilityDisplay'
import type { SetsData, Card, SetInfo, CardNamesData } from './types'
import './App.css'

function App() {
  const [sets, setSets] = useState<SetsData | null>(null)
  const [cardNames, setCardNames] = useState<CardNamesData | null>(null)
  const [selectedSetInfo, setSelectedSetInfo] = useState<SetInfo | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load sets and card names data on mount
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



  const handleCardSelect = (card: Card, fromSearch?: boolean) => {
    // Clear any previous errors
    setError(null)
    
    // Simply select the card directly (card-names.json now has all needed data)
    setSelectedCard(card)
    
    // Update the selected set info if the card has a set
    if (card.s) {
      setSelectedSetInfo(sets?.[card.s] || null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🎰 How Rare Is It?</h1>
        <p className="app-subtitle">
          Discover the true cost of chasing cards in booster packs
        </p>
      </header>

      <main className="app-main">
        {!sets && !cardNames && !error && (
          <div className="loading">Loading data...</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {sets && cardNames && (
          <div className="selection-container">
            <CardSelector 
              cardNames={cardNames}
              onSelectCard={handleCardSelect}
              disabled={loading}
            />
          </div>
        )}

        {selectedCard && selectedSetInfo && (
          <ProbabilityDisplay card={selectedCard} setInfo={selectedSetInfo} />
        )}
      </main>

      <footer className="app-footer">
        <p>Data from Scryfall • Remember: Opening packs is gambling!</p>
      </footer>
    </div>
  )
}

export default App
