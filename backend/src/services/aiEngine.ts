/**
 * Pattern-detection AI recommendation engine.
 * Looks at recent activities and emits ranked, contextual suggestions.
 */

import type { IActivity } from '../models/Activity';

export interface Recommendation {
  title: string;
  description: string;
  carbonSaving: number; // kg CO2 / week
  costSaving: number;   // ₹ / week
  confidenceScore: number; // 0-1
  priorityScore: number;   // 0-100
  category: string;
}

const RATE = 850;

export const generateRecommendations = (activities: IActivity[]): Recommendation[] => {
  if (activities.length === 0) return defaultRecs();
  const recs: Recommendation[] = [];

  const byType = group(activities, (a) => a.type);
  const byHour = group(activities, (a) => String(new Date(a.timestamp).getHours()));
  const byDow = group(activities, (a) => String(new Date(a.timestamp).getDay()));

  const totalCarbon = sum(activities.map((a) => a.carbon));

  // Late-night AI usage
  const lateNightAi = activities.filter((a) => {
    const h = new Date(a.timestamp).getHours();
    return a.type === 'ai_query' && (h >= 22 || h < 5);
  });
  if (lateNightAi.length >= 3) {
    const carbon = sum(lateNightAi.map((a) => a.carbon));
    const saving = carbon * 0.15;
    recs.push({
      title: 'Reduce late-night AI usage by 15%',
      description: `Detected ${lateNightAi.length} AI queries between 10 PM and 5 AM. Schedule heavy reasoning tasks earlier — grids run cleaner during the day.`,
      carbonSaving: round(saving),
      costSaving: round(saving * RATE, 2),
      confidenceScore: Math.min(1, 0.6 + lateNightAi.length / 30),
      priorityScore: 80,
      category: 'AI usage',
    });
  }

  // Email batching (weekday-heavy)
  const weekdayEmails = activities.filter((a) => {
    const d = new Date(a.timestamp).getDay();
    return a.type === 'email' && d >= 1 && d <= 5;
  });
  if (weekdayEmails.length >= 20) {
    const saving = sum(weekdayEmails.map((a) => a.carbon)) * 0.2;
    recs.push({
      title: 'Batch your emails',
      description: `You sent ${weekdayEmails.length} emails this week, mostly during weekdays. Batching into 2–3 send windows reduces context-switch energy and server roundtrips.`,
      carbonSaving: round(saving),
      costSaving: round(saving * RATE, 2),
      confidenceScore: 0.7,
      priorityScore: 55,
      category: 'Email',
    });
  }

  // Streaming as biggest contributor
  const streamCarbon = sum((byType.get('streaming') ?? []).map((a) => a.carbon));
  if (streamCarbon > totalCarbon * 0.3) {
    const saving = streamCarbon * 0.25;
    recs.push({
      title: 'Drop video quality from 4K → 1080p',
      description: `Streaming accounts for ${pct(streamCarbon, totalCarbon)}% of your footprint. 1080p uses ~25% less bandwidth and energy with imperceptible quality loss on most screens.`,
      carbonSaving: round(saving),
      costSaving: round(saving * RATE, 2),
      confidenceScore: 0.85,
      priorityScore: 75,
      category: 'Streaming',
    });
  }

  // Video calls > x hours
  const callHours = sum((byType.get('video_call') ?? []).map((a) => a.usage));
  if (callHours > 10) {
    const saving = (callHours * 0.157 * 1.2 * 0.71) * 0.4;
    recs.push({
      title: 'Audio-only for status meetings',
      description: `${round(callHours, 1)} hours on video calls this week. Switching status check-ins to audio cuts ~95% of call energy; reserve video for first meets and design reviews.`,
      carbonSaving: round(saving),
      costSaving: round(saving * RATE, 2),
      confidenceScore: 0.75,
      priorityScore: 65,
      category: 'Meetings',
    });
  }

  // Peak hour cluster
  const peakHour = pickPeak(byHour);
  if (peakHour && peakHour.carbon > totalCarbon * 0.18) {
    recs.push({
      title: `Shift workload off ${peakHour.label}:00`,
      description: `Your usage spikes around ${peakHour.label}:00 with ${round(peakHour.carbon, 2)} kg CO₂. Spreading it ±2 hours flattens grid load and reduces per-kWh emissions.`,
      carbonSaving: round(peakHour.carbon * 0.08),
      costSaving: round(peakHour.carbon * 0.08 * RATE, 2),
      confidenceScore: 0.6,
      priorityScore: 45,
      category: 'Behavior',
    });
  }

  // Cloud storage cleanup
  const storage = byType.get('cloud_storage') ?? [];
  if (storage.length > 0) {
    const c = sum(storage.map((a) => a.carbon));
    if (c > 0.05) {
      const saving = c * 0.3;
      recs.push({
        title: 'Archive cold cloud storage',
        description: 'Move files older than 90 days to cold-tier storage — same access pattern, ~70% lower idle energy.',
        carbonSaving: round(saving),
        costSaving: round(saving * RATE, 2),
        confidenceScore: 0.65,
        priorityScore: 40,
        category: 'Storage',
      });
    }
  }

  if (recs.length === 0) return defaultRecs();

  return recs.sort((a, b) => b.priorityScore - a.priorityScore);
};

const defaultRecs = (): Recommendation[] => [
  {
    title: 'Start tracking AI usage',
    description: 'Log a few activities to unlock personalised recommendations.',
    carbonSaving: 0,
    costSaving: 0,
    confidenceScore: 0.5,
    priorityScore: 30,
    category: 'Onboarding',
  },
];

const group = <T, K>(arr: T[], by: (t: T) => K) => {
  const m = new Map<K, T[]>();
  for (const x of arr) {
    const k = by(x);
    const v = m.get(k) ?? [];
    v.push(x);
    m.set(k, v);
  }
  return m;
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
const round = (n: number, d = 4) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

const pickPeak = (byHour: Map<string, IActivity[]>) => {
  let best: { label: string; carbon: number } | null = null;
  for (const [label, acts] of byHour) {
    const c = sum(acts.map((a) => a.carbon));
    if (!best || c > best.carbon) best = { label, carbon: c };
  }
  return best;
};
