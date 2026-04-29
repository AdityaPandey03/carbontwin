/**
 * Eco-Score (0–100):
 *   - 60% threshold compliance
 *   - 25% improvement vs prior period
 *   - 15% baseline (rewards low absolute usage)
 */

export interface ScoreInputs {
  weeklyCarbon: number;
  weeklyLimit: number;
  prevWeeklyCarbon: number;
  thresholdComplianceRatio: number; // 0-1, days under daily limit / total days
}

export const computeEcoScore = (i: ScoreInputs): number => {
  const compliance = clamp01(i.thresholdComplianceRatio) * 60;

  let improvement = 0;
  if (i.prevWeeklyCarbon > 0) {
    const delta = (i.prevWeeklyCarbon - i.weeklyCarbon) / i.prevWeeklyCarbon;
    improvement = clamp(delta, -0.5, 0.5) * 50; // ±25 points
    improvement = Math.max(0, improvement + 12.5); // re-base to 0-25
  } else {
    improvement = 12.5;
  }

  const ratio = i.weeklyLimit > 0 ? i.weeklyCarbon / i.weeklyLimit : 1;
  const baseline = (1 - clamp01(ratio)) * 15;

  return Math.round(clamp(compliance + improvement + baseline, 0, 100));
};

export const scoreLevel = (score: number) => {
  if (score >= 80) return { level: 'Green Champion', emoji: '🌱', color: 'green' };
  if (score >= 50) return { level: 'Eco Contributor', emoji: '🌿', color: 'amber' };
  return { level: 'Needs Improvement', emoji: '🔴', color: 'red' };
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const clamp01 = (n: number) => clamp(n, 0, 1);
