import type { SetInfo, Rarity } from '../types';

/**
 * Calculate the probability of pulling a specific card in a single pack
 * based on the play booster structure:
 * - 1-4 rare/mythic slots (1: ~70%, 2: 27%, 3: 2%, 4: <1%)
 * - 3-5 uncommon slots (average 4)
 * - 6-9 common slots (average 7.5)
 */
function probabilityPerPack(
  setInfo: SetInfo,
  rarity: Rarity
): number {
  const { rare = 0, mythic = 0, uncommon = 0, common = 0 } = setInfo;

  // Distribution of rare/mythic slots in play boosters
  const rareSlotDistribution = [
    { slots: 1, probability: 0.70 },
    { slots: 2, probability: 0.27 },
    { slots: 3, probability: 0.02 },
    { slots: 4, probability: 0.01 }
  ];

  switch (rarity) {
    case 'mythic': {
      // Mythics appear in ~1/8 of rare slots
      if (mythic === 0) return 0;
      const mythicRate = 1 / 8;
      const chancePerSlot = mythicRate * (1 / mythic);
      
      // Calculate probability across all possible rare slot configurations
      let totalProb = 0;
      for (const { slots, probability } of rareSlotDistribution) {
        // Probability of getting the mythic in at least one of the slots
        const probNotGetting = Math.pow(1 - chancePerSlot, slots);
        totalProb += probability * (1 - probNotGetting);
      }
      return totalProb;
    }
    case 'rare': {
      // Rares appear in ~7/8 of rare slots
      if (rare === 0) return 0;
      const rareRate = 7 / 8;
      const chancePerSlot = rareRate * (1 / rare);
      
      // Calculate probability across all possible rare slot configurations
      let totalProb = 0;
      for (const { slots, probability } of rareSlotDistribution) {
        // Probability of getting the rare in at least one of the slots
        const probNotGetting = Math.pow(1 - chancePerSlot, slots);
        totalProb += probability * (1 - probNotGetting);
      }
      return totalProb;
    }
    case 'uncommon': {
      // Average 4 uncommon slots per pack (3-5 range)
      if (uncommon === 0) return 0;
      const avgUncommonSlots = 4;
      const chancePerSlot = 1 / uncommon;
      return 1 - Math.pow(1 - chancePerSlot, avgUncommonSlots);
    }
    case 'common': {
      // Average 7.5 common slots per pack (6-9 range)
      if (common === 0) return 0;
      const avgCommonSlots = 7.5;
      const chancePerSlot = 1 / common;
      return 1 - Math.pow(1 - chancePerSlot, avgCommonSlots);
    }
    default:
      return 0;
  }
}

/**
 * Calculate the probability of pulling at least one copy of a card
 * based on rarity and number of packs opened
 */
export function calculatePullProbability(
  setInfo: SetInfo,
  rarity: Rarity,
  numPacks: number
): number {
  const probPerPack = probabilityPerPack(setInfo, rarity);
  
  if (probPerPack === 0) return 0;

  // Probability of NOT pulling it in N packs
  const probNotPullingInN = Math.pow(1 - probPerPack, numPacks);
  
  // Probability of pulling at least once
  return 1 - probNotPullingInN;
}

/**
 * Calculate expected number of copies after opening N packs
 */
export function calculateExpectedCopies(
  setInfo: SetInfo,
  rarity: Rarity,
  numPacks: number
): number {
  const probPerPack = probabilityPerPack(setInfo, rarity);
  
  if (probPerPack === 0) return 0;

  // Expected value = numPacks * probability per pack
  return numPacks * probPerPack;
}

/**
 * Calculate the number of packs needed for a target probability
 */
export function calculatePacksNeeded(
  setInfo: SetInfo,
  rarity: Rarity,
  targetProbability: number
): number {
  const probPerPack = probabilityPerPack(setInfo, rarity);
  
  if (probPerPack === 0) return Infinity;

  // P(at least one) = 1 - (1 - probPerPack)^n
  // targetProbability = 1 - (1 - probPerPack)^n
  // (1 - targetProbability) = (1 - probPerPack)^n
  // log(1 - targetProbability) = n * log(1 - probPerPack)
  // n = log(1 - targetProbability) / log(1 - probPerPack)
  
  const n = Math.log(1 - targetProbability) / Math.log(1 - probPerPack);
  
  return Math.ceil(n);
}

/**
 * Calculate number of booster boxes needed (assuming 30 packs per box)
 */
export function calculateBoxesNeeded(
  setInfo: SetInfo,
  rarity: Rarity,
  targetProbability: number
): number {
  const packsNeeded = calculatePacksNeeded(setInfo, rarity, targetProbability);
  return Math.ceil(packsNeeded / 30);
}

/**
 * Format probability as percentage
 */
export function formatProbability(probability: number): string {
  return (probability * 100).toFixed(2) + '%';
}

/**
 * Format price
 */
export function formatPrice(price: string | undefined): string {
  if (!price) return 'N/A';
  return '$' + parseFloat(price).toFixed(2);
}
