import type { Card, SetInfo, Rarity } from '../types';
import {
  calculatePullProbability,
  calculateExpectedCopies,
  formatProbability
} from '../utils/probability';
import './ProbabilityDisplay.css';

interface ProbabilityDisplayProps {
  card: Card;
  setInfo: SetInfo;
  setCode: string;
  packs: number;
  packPrice: number;
}

const chartWidth = 720;
const chartHeight = 280;
const chartPadding = 40;

function OddsChart({ setInfo, rarity, packs }: { setInfo: SetInfo; rarity: Rarity; packs: number }) {
  const maxPacks = Math.max(72, packs * 2);
  const points = Array.from({ length: maxPacks + 1 }, (_, index) => ({
    packs: index,
    probability: calculatePullProbability(setInfo, rarity, index)
  }));

  const scaleX = (value: number) => (
    chartPadding + (value / maxPacks) * (chartWidth - chartPadding * 2)
  );

  const scaleY = (value: number) => (
    chartHeight - chartPadding - value * (chartHeight - chartPadding * 2)
  );

  const path = points
    .map((point, index) => {
      const x = scaleX(point.packs);
      const y = scaleY(point.probability);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const markerX = scaleX(packs);
  const markerProbability = calculatePullProbability(setInfo, rarity, packs);
  const markerY = scaleY(markerProbability);

  return (
    <div className="odds-chart">
      <div className="chart-header">
        <div>
          <h3>Chance to pull ≥1</h3>
          <p>Curve for {maxPacks} packs • Marker at {packs}</p>
        </div>
        <div className="chart-highlight">
          {formatProbability(markerProbability)}
        </div>
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Odds curve">
        <defs>
          <linearGradient id="curve" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6C7BFF" />
            <stop offset="100%" stopColor="#B58BFF" />
          </linearGradient>
        </defs>
        <rect
          x={chartPadding}
          y={chartPadding}
          width={chartWidth - chartPadding * 2}
          height={chartHeight - chartPadding * 2}
          rx="16"
          fill="rgba(14, 16, 28, 0.6)"
          stroke="rgba(255, 255, 255, 0.08)"
        />
        <path d={path} fill="none" stroke="url(#curve)" strokeWidth="3" />
        <line
          x1={markerX}
          x2={markerX}
          y1={chartPadding}
          y2={chartHeight - chartPadding}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeDasharray="6 6"
        />
        <circle cx={markerX} cy={markerY} r="6" fill="#EDE8FF" />
        <text x={markerX} y={markerY - 12} textAnchor="middle" className="chart-marker">
          {formatProbability(markerProbability)}
        </text>
        <text x={chartPadding} y={chartHeight - 12} className="chart-axis">
          0 packs
        </text>
        <text x={chartWidth - chartPadding} y={chartHeight - 12} textAnchor="end" className="chart-axis">
          {maxPacks} packs
        </text>
        <text x={chartPadding} y={chartPadding - 10} className="chart-axis">
          100%
        </text>
      </svg>
    </div>
  );
}

export default function ProbabilityDisplay({ card, setInfo, setCode, packs, packPrice }: ProbabilityDisplayProps) {
  const rarity = card.r as Rarity;
  const probability = calculatePullProbability(setInfo, rarity, packs);
  const expectedCopies = calculateExpectedCopies(setInfo, rarity, packs);
  const cost = packs * packPrice;
  const singlePrice = card.p?.eur ? parseFloat(card.p.eur) : card.p?.usd ? parseFloat(card.p.usd) : null;
  const priceLabel = card.p?.eur ? `€${parseFloat(card.p.eur).toFixed(2)}` : card.p?.usd ? `$${parseFloat(card.p.usd).toFixed(2)}` : 'N/A';
  const dealLabel = singlePrice && cost > singlePrice ? 'Singles cheaper' : singlePrice ? 'Close call' : 'No price';

  return (
    <section className="probability-display">
      <div className="probability-main">
        <div className="card-hero">
          <img src={card.i} alt={card.n} className="card-image" />
          <div className="card-meta">
            <div>
              <h2>{card.n}</h2>
              <div className="card-meta-row">
                <span className={`rarity-pill rarity-${rarity}`}>{rarity.toUpperCase()}</span>
                <span className="set-pill">{setCode.toUpperCase()} • {setInfo.name}</span>
              </div>
            </div>
            <div className="card-price">{priceLabel}</div>
          </div>
        </div>

        <div className="stats-panel">
          <div className="stat-block">
            <p>Chance to pull ≥1</p>
            <h3>{formatProbability(probability)}</h3>
            <span>in {packs} packs</span>
          </div>
          <div className="stat-block">
            <p>Expected copies</p>
            <h3>{expectedCopies.toFixed(2)}</h3>
            <span>based on play booster odds</span>
          </div>
          <div className="stat-block">
            <p>Cost comparison</p>
            <h3>€{cost.toFixed(2)}</h3>
            <span>Open vs {priceLabel} single</span>
          </div>
          <div className="deal-tag">
            {dealLabel}
          </div>
        </div>
      </div>

      <OddsChart setInfo={setInfo} rarity={rarity} packs={packs} />
    </section>
  );
}
