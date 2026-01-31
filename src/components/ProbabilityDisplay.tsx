import type { Card, SetInfo, Rarity } from '../types';
import {
  calculatePullProbability,
  calculateExpectedCopies,
  calculateBoxesNeeded,
  formatProbability,
  formatPrice,
} from '../utils/probability';
import './ProbabilityDisplay.css';

interface ProbabilityDisplayProps {
  card: Card;
  setInfo: SetInfo;
}

export default function ProbabilityDisplay({ card, setInfo }: ProbabilityDisplayProps) {
  const rarity = card.r as Rarity;
  
  // Calculate probabilities
  const prob1Pack = calculatePullProbability(setInfo, rarity, 1);
  const prob1Box = calculatePullProbability(setInfo, rarity, 30);
  const prob10Boxes = calculatePullProbability(setInfo, rarity, 300);
  
  // Calculate expected copies
  const expected1Pack = calculateExpectedCopies(setInfo, rarity, 1);
  const expected1Box = calculateExpectedCopies(setInfo, rarity, 30);
  const expected10Boxes = calculateExpectedCopies(setInfo, rarity, 300);
  
  // Calculate boxes needed for 50% chance
  const boxesFor50Percent = calculateBoxesNeeded(setInfo, rarity, 0.5);
  const packsFor50Percent = boxesFor50Percent * 30;
  
  // Price calculations (assuming $4 per pack)
  const packPrice = 4;
  const costFor50Percent = packsFor50Percent * packPrice;
  const singlePrice = card.p?.usd ? parseFloat(card.p.usd) : null;
  
  return (
    <div className="probability-display">
      <div className="card-showcase">
        <img src={card.img} alt={card.n} className="card-large" />
        <div className="card-title">
          <h2>{card.n}</h2>
          <span className={`rarity-badge rarity-${rarity}`}>
            {rarity.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="gambling-section">
        <h3 className="section-title">🎰 Your Odds of Pulling This Card</h3>
        
        <div className="odds-grid">
          <div className="odds-card">
            <div className="odds-label">1 Pack</div>
            <div className="odds-probability">{formatProbability(prob1Pack)}</div>
            <div className="odds-expected">
              Expected: {expected1Pack.toFixed(4)} copies
            </div>
            <div className="odds-cost">${packPrice.toFixed(2)}</div>
          </div>

          <div className="odds-card highlight">
            <div className="odds-label">1 Box (30 Packs)</div>
            <div className="odds-probability">{formatProbability(prob1Box)}</div>
            <div className="odds-expected">
              Expected: {expected1Box.toFixed(2)} copies
            </div>
            <div className="odds-cost">${(packPrice * 30).toFixed(2)}</div>
          </div>

          <div className="odds-card">
            <div className="odds-label">10 Boxes (300 Packs)</div>
            <div className="odds-probability">{formatProbability(prob10Boxes)}</div>
            <div className="odds-expected">
              Expected: {expected10Boxes.toFixed(2)} copies
            </div>
            <div className="odds-cost">${(packPrice * 300).toFixed(2)}</div>
          </div>
        </div>

        <div className="fifty-percent-section">
          <h3 className="section-title">🎯 For a 50% Chance of Success</h3>
          <div className="fifty-percent-card">
            <div className="stat-row">
              <span className="stat-label">Boxes Needed:</span>
              <span className="stat-value">{boxesFor50Percent} boxes</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Packs Needed:</span>
              <span className="stat-value">{packsFor50Percent} packs</span>
            </div>
            <div className="stat-row highlight-row">
              <span className="stat-label">Total Cost:</span>
              <span className="stat-value cost-highlight">
                ${costFor50Percent.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {singlePrice !== null && (
          <div className="comparison-section">
            <h3 className="section-title">💰 Smart Money Decision</h3>
            <div className="comparison-grid">
              <div className="comparison-card gambling">
                <div className="comparison-label">Opening Packs (50% chance)</div>
                <div className="comparison-price">${costFor50Percent.toFixed(2)}</div>
                <div className="comparison-note">Gambling, uncertain</div>
              </div>
              
              <div className="vs-divider">VS</div>
              
              <div className="comparison-card single">
                <div className="comparison-label">Buy Single Card</div>
                <div className="comparison-price">{formatPrice(card.p?.usd)}</div>
                <div className="comparison-note">Guaranteed, smart</div>
              </div>
            </div>
            
            {costFor50Percent > singlePrice && (
              <div className="savings-alert">
                <strong>💡 You save ${(costFor50Percent - singlePrice).toFixed(2)}</strong> by buying the single card!
                <br />
                That's <strong>{((costFor50Percent / singlePrice)).toFixed(1)}x</strong> more expensive to gamble!
              </div>
            )}
          </div>
        )}

        <div className="warning-message">
          ⚠️ Remember: These odds show how <strong>pack opening is gambling</strong>. 
          Even with hundreds of dollars spent, you're not guaranteed to get the card you want!
        </div>
      </div>
    </div>
  );
}
