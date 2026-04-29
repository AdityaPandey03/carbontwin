import { describe, it, expect } from 'vitest';
import { computeCarbon, baseEnergy, CARBON_RATE_INR_PER_KG } from './carbonEngine';

describe('carbonEngine', () => {
  it('applies the formula: usage × baseEnergy × 1.2 × 0.71', () => {
    const r = computeCarbon('ai_query', 100);
    const expected = 100 * baseEnergy.ai_query * 1.2 * 0.71;
    expect(r.carbon).toBeCloseTo(expected, 5);
  });

  it('cost is carbon × ₹850/kg', () => {
    const r = computeCarbon('streaming', 10);
    expect(r.cost).toBeCloseTo(r.carbon * CARBON_RATE_INR_PER_KG, 1);
  });

  it('zero usage produces zero carbon and cost', () => {
    const r = computeCarbon('email', 0);
    expect(r.carbon).toBe(0);
    expect(r.cost).toBe(0);
  });

  it('higher-energy activities produce more carbon per unit', () => {
    const a = computeCarbon('email', 100);
    const b = computeCarbon('streaming', 100);
    expect(b.carbon).toBeGreaterThan(a.carbon);
  });

  it('falls back to "other" baseEnergy for unknown types', () => {
    // @ts-expect-error -- intentional unknown type
    const r = computeCarbon('unknown_type', 5);
    const expected = 5 * baseEnergy.other * 1.2 * 0.71;
    expect(r.carbon).toBeCloseTo(expected, 5);
  });
});
