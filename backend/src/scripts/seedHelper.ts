import { User } from '../models/User';
import { Activity, ActivityType } from '../models/Activity';
import { Threshold } from '../models/Threshold';
import { computeCarbon } from '../services/carbonEngine';

interface SeedUser {
  name: string;
  email: string;
  company: string;
  ecoScore: number;
  carbonSaved: number;
  streakDays: number;
  badges: string[];
}

const SEED_USERS: SeedUser[] = [
  { name: 'Aarav Sharma', email: 'aarav@greenco.in', company: 'GreenCo', ecoScore: 88, carbonSaved: 4.2, streakDays: 12, badges: ['3-Day Starter', '7-Day Bonus'] },
  { name: 'Priya Iyer', email: 'priya@greenco.in', company: 'GreenCo', ecoScore: 76, carbonSaved: 2.6, streakDays: 5, badges: ['3-Day Starter'] },
  { name: 'Kabir Singh', email: 'kabir@greenco.in', company: 'GreenCo', ecoScore: 64, carbonSaved: 1.4, streakDays: 2, badges: [] },
  { name: 'Anushka Verma', email: 'anushka@brightlabs.io', company: 'BrightLabs', ecoScore: 92, carbonSaved: 5.8, streakDays: 21, badges: ['3-Day Starter', '7-Day Bonus'] },
  { name: 'Rohan Mehta', email: 'rohan@brightlabs.io', company: 'BrightLabs', ecoScore: 58, carbonSaved: 1.0, streakDays: 0, badges: [] },
  { name: 'Maya Pillai', email: 'maya@brightlabs.io', company: 'BrightLabs', ecoScore: 47, carbonSaved: 0.4, streakDays: 0, badges: [] },
];

const TYPES: ActivityType[] = ['ai_query', 'email', 'streaming', 'video_call', 'cloud_storage', 'web_browsing', 'compute'];

const usageRange: Record<ActivityType, [number, number]> = {
  ai_query: [2, 25],
  email: [1, 12],
  streaming: [0.1, 1.2],
  video_call: [0.1, 0.8],
  cloud_storage: [5, 60],
  web_browsing: [5, 80],
  compute: [0.05, 0.6],
  other: [1, 4],
};

const seededRand = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

export const seedIfEmpty = async () => {
  const existing = await User.countDocuments();
  if (existing > 0) return;

  console.log('🌱 Seeding demo data…');
  const rand = seededRand(42);

  for (const u of SEED_USERS) {
    const user = await User.create(u);
    await Threshold.create({
      userId: user._id,
      dailyLimit: u.ecoScore >= 80 ? 0.5 : u.ecoScore >= 60 ? 0.6 : 0.7,
      weeklyLimit: u.ecoScore >= 80 ? 3 : u.ecoScore >= 60 ? 3.5 : 4,
    });

    // 14 days of mixed activities
    const acts = [];
    for (let day = 13; day >= 0; day--) {
      const dayBase = new Date();
      dayBase.setDate(dayBase.getDate() - day);

      // higher emitters generate more activities + heavier per-event usage
      const intensity = u.ecoScore >= 80 ? 0.25 : u.ecoScore >= 60 ? 0.55 : 1.0;
      const events = Math.floor(4 + rand() * 10 * intensity);

      for (let e = 0; e < events; e++) {
        const t = TYPES[Math.floor(rand() * TYPES.length)];
        const [lo, hi] = usageRange[t];
        // High-ecoScore users land near the low end; low-ecoScore users near the high end.
        const bias =
          u.ecoScore >= 80 ? 0.2 + rand() * 0.3 :
          u.ecoScore >= 60 ? 0.3 + rand() * 0.5 :
          0.5 + rand() * 0.5;
        const usage = Math.round((lo + bias * (hi - lo)) * 100) / 100;

        // Bias hours: low ecoScore users have late-night spikes
        let hour: number;
        if (u.ecoScore < 60 && rand() < 0.4) hour = 22 + Math.floor(rand() * 5); // late
        else hour = 9 + Math.floor(rand() * 12);
        hour = hour % 24;

        const ts = new Date(dayBase);
        ts.setHours(hour, Math.floor(rand() * 60), 0, 0);

        const { carbon, cost } = computeCarbon(t, usage);
        acts.push({
          userId: user._id,
          type: t,
          usage,
          carbon,
          cost,
          timestamp: ts,
        });
      }
    }
    await Activity.insertMany(acts);
  }

  console.log(`🌱 Seeded ${SEED_USERS.length} users with 14 days of activity each`);
};
