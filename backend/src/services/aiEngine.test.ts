import { describe, it, expect } from 'vitest';
import { generateRecommendations } from './aiEngine';
import type { IActivity } from '../models/Activity';
import { computeCarbon } from './carbonEngine';
import { Types } from 'mongoose';

const make = (type: IActivity['type'], usage: number, hour: number, daysAgo = 0): IActivity => {
  const ts = new Date();
  ts.setDate(ts.getDate() - daysAgo);
  ts.setHours(hour, 0, 0, 0);
  const { carbon, cost } = computeCarbon(type, usage);
  return {
    userId: new Types.ObjectId(),
    type,
    usage,
    carbon,
    cost,
    timestamp: ts,
  } as unknown as IActivity;
};

describe('aiEngine.generateRecommendations', () => {
  it('returns onboarding rec when there are no activities', () => {
    const r = generateRecommendations([]);
    expect(r).toHaveLength(1);
    expect(r[0].category).toBe('Onboarding');
  });

  it('flags late-night AI usage when ≥3 queries between 22:00–05:00', () => {
    const acts: IActivity[] = [
      make('ai_query', 20, 23),
      make('ai_query', 20, 23, 1),
      make('ai_query', 20, 1),
      make('ai_query', 5, 14),
    ];
    const r = generateRecommendations(acts);
    expect(r.some((x) => x.title.toLowerCase().includes('late-night ai'))).toBe(true);
  });

  it('flags streaming when it is >30% of total carbon', () => {
    const acts: IActivity[] = [
      make('streaming', 5, 20),
      make('streaming', 5, 21, 1),
      make('streaming', 5, 22, 2),
      make('email', 1, 10),
    ];
    const r = generateRecommendations(acts);
    expect(r.some((x) => x.title.toLowerCase().includes('1080p') || x.title.toLowerCase().includes('streaming') || x.category === 'Streaming')).toBe(true);
  });

  it('returns recommendations sorted by priority (desc)', () => {
    const acts: IActivity[] = [
      make('ai_query', 20, 23),
      make('ai_query', 20, 0),
      make('ai_query', 20, 1),
      make('streaming', 3, 21),
      make('streaming', 3, 22, 1),
      make('streaming', 3, 23, 2),
    ];
    const r = generateRecommendations(acts);
    for (let i = 1; i < r.length; i++) {
      expect(r[i - 1].priorityScore).toBeGreaterThanOrEqual(r[i].priorityScore);
    }
  });

  it('every recommendation has the expected shape', () => {
    const acts: IActivity[] = [
      make('streaming', 3, 21),
      make('streaming', 3, 22, 1),
      make('streaming', 3, 23, 2),
    ];
    const r = generateRecommendations(acts);
    for (const rec of r) {
      expect(rec.title).toBeTypeOf('string');
      expect(rec.description).toBeTypeOf('string');
      expect(rec.carbonSaving).toBeGreaterThanOrEqual(0);
      expect(rec.costSaving).toBeGreaterThanOrEqual(0);
      expect(rec.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(rec.confidenceScore).toBeLessThanOrEqual(1);
      expect(rec.priorityScore).toBeGreaterThanOrEqual(0);
      expect(rec.priorityScore).toBeLessThanOrEqual(100);
    }
  });
});
