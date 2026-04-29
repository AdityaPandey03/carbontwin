import { describe, it, expect } from 'vitest';
import { computeEcoScore, scoreLevel } from './ecoScore';

describe('ecoScore', () => {
  it('returns 100 for perfect compliance, large improvement, low usage', () => {
    const s = computeEcoScore({
      weeklyCarbon: 0.5,
      weeklyLimit: 5,
      prevWeeklyCarbon: 5,
      thresholdComplianceRatio: 1,
    });
    expect(s).toBeGreaterThanOrEqual(80);
    expect(s).toBeLessThanOrEqual(100);
  });

  it('returns lower score for poor compliance and worsening usage', () => {
    const s = computeEcoScore({
      weeklyCarbon: 8,
      weeklyLimit: 5,
      prevWeeklyCarbon: 4,
      thresholdComplianceRatio: 0,
    });
    expect(s).toBeLessThan(40);
  });

  it('clamps scores to [0, 100]', () => {
    const high = computeEcoScore({
      weeklyCarbon: 0,
      weeklyLimit: 100,
      prevWeeklyCarbon: 100,
      thresholdComplianceRatio: 1,
    });
    expect(high).toBeLessThanOrEqual(100);

    const low = computeEcoScore({
      weeklyCarbon: 1000,
      weeklyLimit: 1,
      prevWeeklyCarbon: 0,
      thresholdComplianceRatio: 0,
    });
    expect(low).toBeGreaterThanOrEqual(0);
  });
});

describe('scoreLevel', () => {
  it.each([
    [95, 'Green Champion'],
    [80, 'Green Champion'],
    [79, 'Eco Contributor'],
    [50, 'Eco Contributor'],
    [49, 'Needs Improvement'],
    [0, 'Needs Improvement'],
  ])('%i → %s', (score, level) => {
    expect(scoreLevel(score).level).toBe(level);
  });
});
