/**
 * Rule-based AI Eco-Coach.
 * Pulls real user context (eco-score, threshold status, recent activity) and
 * answers in the platform's signature aggressive-coach voice.
 */

import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { generateRecommendations } from './aiEngine';
import { getThresholdStatus, startOfDay } from './thresholdService';
import { Types } from 'mongoose';

export interface ChatReply {
  text: string;
  context?: {
    ecoScore?: number;
    weeklyCarbon?: number;
    thresholdStatus?: string;
  };
  timestamp: string;
}

const lower = (s: string) => s.toLowerCase();

export const chat = async (userId: string | Types.ObjectId, message: string): Promise<ChatReply> => {
  const user = await User.findById(userId);
  if (!user) {
    return {
      text: "I can't find you in the system. Are you sure you're logged in?",
      timestamp: new Date().toISOString(),
    };
  }

  const m = lower(message);
  const status = await getThresholdStatus(userId);
  const since = startOfDay(new Date(Date.now() - 7 * 86400_000));
  const recent = await Activity.find({ userId, timestamp: { $gte: since } });
  const weeklyCarbon = round(recent.reduce((s, a) => s + a.carbon, 0));

  const ctx = {
    ecoScore: user.ecoScore,
    weeklyCarbon,
    thresholdStatus: status.weekly.status,
  };

  // ── intent matching, ordered most→least specific ──
  if (m.includes('score') && (m.includes('drop') || m.includes('down') || m.includes('low') || m.includes('bad'))) {
    const reasons: string[] = [];
    if (status.daily.percentageUsed > 75) reasons.push(`daily usage is at ${status.daily.percentageUsed}% of limit`);
    if (status.weekly.percentageUsed > 75) reasons.push(`weekly is at ${status.weekly.percentageUsed}%`);
    const heavy = topType(recent);
    if (heavy) reasons.push(`${heavy} is your biggest carbon source this week`);
    return reply(
      reasons.length
        ? `Listen — your eco-score is ${user.ecoScore} because ${reasons.join('; ')}. Stop scrolling, start cutting.`
        : `Your score is ${user.ecoScore}. Not bad. But "not bad" doesn't save the planet.`,
      ctx,
    );
  }

  if (m.includes('how') && (m.includes('improve') || m.includes('reduce') || m.includes('better'))) {
    const recs = generateRecommendations(recent).slice(0, 2);
    if (recs.length === 0) {
      return reply("Log more activities first. I can't coach what I can't see.", ctx);
    }
    const lines = recs.map((r, i) => `${i + 1}. ${r.title} → save ${r.carbonSaving} kg / ₹${Math.round(r.costSaving)} per week`);
    return reply(`Two things to do today:\n${lines.join('\n')}\n\nExecute them. We'll talk again tomorrow.`, ctx);
  }

  if (m.includes('streak')) {
    return reply(
      user.streakDays > 0
        ? `${user.streakDays} day${user.streakDays === 1 ? '' : 's'} under your daily limit. Don't ruin it now.`
        : `No streak right now. Start one today — stay under your daily limit and I'll stop nagging.`,
      ctx,
    );
  }

  if (m.includes('threshold') || m.includes('limit') || m.includes('budget')) {
    return reply(
      `You're at ${status.daily.percentageUsed}% of today's limit (${status.daily.status}) and ${status.weekly.percentageUsed}% of this week's (${status.weekly.status}). Want me to do the math for you, or are you going to act?`,
      ctx,
    );
  }

  if (m.includes('total') || m.includes('how much')) {
    return reply(
      `${weeklyCarbon} kg CO₂ this week. That's ₹${Math.round(weeklyCarbon * 850)} of social cost. Add it to your conscience.`,
      ctx,
    );
  }

  if (m.includes('recommend') || m.includes('suggestion') || m.includes('tip') || m.includes('advice')) {
    const recs = generateRecommendations(recent).slice(0, 3);
    const lines = recs.map((r) => `• ${r.title} — saves ${r.carbonSaving} kg/week`);
    return reply(`Here's what the AI engine flagged:\n${lines.join('\n') || '• Log more activities — I have nothing yet'}`, ctx);
  }

  if (m.includes('hi') || m.includes('hello') || m.includes('hey')) {
    const greet = user.ecoScore >= 80
      ? `${user.name.split(' ')[0]}. Eco-score ${user.ecoScore} — keep it up.`
      : `${user.name.split(' ')[0]}. Eco-score ${user.ecoScore}. We need to talk.`;
    return reply(`${greet} What do you need?`, ctx);
  }

  if (m.includes('thanks') || m.includes('thank you')) {
    return reply("Don't thank me. Thank the planet. Next.", ctx);
  }

  if (m.includes('help')) {
    return reply(
      "Try asking: 'why is my score dropping?', 'how do I improve?', 'what's my streak?', or 'show recommendations'. I don't do small talk.",
      ctx,
    );
  }

  // generic fallback — still uses live data
  return reply(
    `Every action has a carbon cost. You're at ${weeklyCarbon} kg this week (${status.weekly.status}). Stop chatting, start optimising.`,
    ctx,
  );
};

const reply = (text: string, context: ChatReply['context']): ChatReply => ({
  text,
  context,
  timestamp: new Date().toISOString(),
});

const topType = (acts: { type: string; carbon: number }[]) => {
  const sums = new Map<string, number>();
  acts.forEach((a) => sums.set(a.type, (sums.get(a.type) ?? 0) + a.carbon));
  let best: { t: string; c: number } | null = null;
  for (const [t, c] of sums) if (!best || c > best.c) best = { t, c };
  return best ? best.t.replace('_', ' ') : null;
};

const round = (n: number, d = 3) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};
