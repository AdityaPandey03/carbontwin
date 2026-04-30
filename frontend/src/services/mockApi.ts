/**
 * Real-API client (with fallback to mock data).
 *
 * Talks to the Carbon Twin backend at VITE_API_URL (default: http://localhost:4000).
 * If the backend is unreachable, every call falls back to the original mock data
 * so the UI keeps working in offline / demo-only mode.
 */

import {
  MOCK_USER,
  MOCK_CHART_DATA,
  MOCK_LEADERBOARD,
  MOCK_SUGGESTIONS,
  MOCK_ACTIVITY_LOG,
} from './mockData';
import { authStore } from './auth';

/** Same-origin in production (Vercel rewrites /api/* to Render). Localhost gets the dev URL. */
const API_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ((import.meta as any).env?.VITE_API_URL || 'http://localhost:4000')
    : '';

let cachedUserId: string | null = null;
let backendAvailable: boolean | null = null;

/** Reset cached user — call after login/logout. */
export const resetApiUser = () => {
  cachedUserId = null;
};

const fetchJson = async (path: string, init?: RequestInit) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const tok = authStore.getToken();
  if (tok) headers.Authorization = `Bearer ${tok}`;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

const probe = async () => {
  if (backendAvailable !== null) return backendAvailable;
  try {
    await fetchJson('/health');
    backendAvailable = true;
  } catch {
    backendAvailable = false;
    console.warn('[mockApi] backend unreachable — using mock data');
  }
  return backendAvailable;
};

const ensureUserId = async (): Promise<string> => {
  if (cachedUserId) return cachedUserId;
  // Prefer the logged-in user's id from the auth store.
  const authed = authStore.getUser();
  if (authed?._id) {
    cachedUserId = authed._id;
    return authed._id;
  }
  // Fallback for landing page / unauthenticated flows: highest eco-score seeded user.
  const users = await fetchJson('/api/users');
  if (!Array.isArray(users) || users.length === 0) throw new Error('no users');
  const top = [...users].sort((a, b) => b.ecoScore - a.ecoScore)[0];
  cachedUserId = top._id;
  return top._id;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  dashboard: {
    getMetrics: async () => {
      if (!(await probe())) {
        await delay(300);
        return { user: MOCK_USER, chartData: MOCK_CHART_DATA, recentActivity: MOCK_ACTIVITY_LOG };
      }
      try {
        const userId = await ensureUserId();
        const d = await fetchJson(`/api/dashboard/${userId}`);

        const user = {
          id: d.user.id,
          name: d.user.name,
          email: d.user.email,
          organizationId: d.user.company,
          totalCarbonSaved: Number((d.totalCarbon ?? 0).toFixed(2)),
          totalRupeesSaved: Number((d.totalCost ?? 0).toFixed(2)),
          ecoScore: d.ecoScore,
          currentStreak: d.streak?.currentStreak ?? 0,
          avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(d.user.email)}`,
        };

        const chartData = (d.dailyTrend ?? []).map((p: any) => ({
          date: formatDate(p.date),
          co2: Number(p.carbon.toFixed(2)),
          cost: Number(p.cost.toFixed(2)),
          saved: Number(((p.carbon * -1 + 1.5) * 0.5).toFixed(2)),
        }));

        const recentActivity = (d.alerts ?? []).slice(0, 6).map((a: any, i: number) => ({
          id: a._id ?? `a_${i}`,
          category: a.type === 'critical' || a.type === 'warning' ? 'Threshold' : 'System',
          actionName: a.message,
          carbonImpact: 0,
          costImpact: 0,
          timestamp: a.timestamp,
        }));

        return { user, chartData, recentActivity, raw: d };
      } catch (e) {
        console.warn('[mockApi.getMetrics] fallback', e);
        return { user: MOCK_USER, chartData: MOCK_CHART_DATA, recentActivity: MOCK_ACTIVITY_LOG };
      }
    },

    getLeaderboard: async () => {
      if (!(await probe())) {
        await delay(200);
        return MOCK_LEADERBOARD;
      }
      try {
        const userId = await ensureUserId();
        const rows = await fetchJson('/api/leaderboard');
        return rows.map((r: any) => ({
          id: r.userId,
          name: r.name,
          score: r.ecoScore,
          trend: r.streak >= 3 ? 'up' : r.streak === 0 ? 'down' : 'same',
          avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(r.userId)}`,
          isCurrentUser: r.userId === userId,
        }));
      } catch (e) {
        console.warn('[mockApi.getLeaderboard] fallback', e);
        return MOCK_LEADERBOARD;
      }
    },
  },

  suggestions: {
    getDaily: async () => {
      if (!(await probe())) {
        await delay(400);
        return MOCK_SUGGESTIONS;
      }
      try {
        const userId = await ensureUserId();
        const recs = await fetchJson(`/api/recommendations/${userId}`);
        return recs.map((r: any, i: number) => ({
          id: `rec_${i}_${r.title.replace(/\s+/g, '_').slice(0, 16)}`,
          text: `${r.title}. ${r.description}`,
          potentialSavingsKg: Number((r.carbonSaving ?? 0).toFixed(2)),
          potentialSavingsInr: Number((r.costSaving ?? 0).toFixed(0)),
          category: r.category,
          status: 'pending',
          confidence: r.confidenceScore,
          priority: r.priorityScore,
        }));
      } catch (e) {
        console.warn('[mockApi.getDaily] fallback', e);
        return MOCK_SUGGESTIONS;
      }
    },
    actionSuggestion: async (id: string, action: 'accept' | 'dismiss') => {
      await delay(200);
      return { success: true, id, action };
    },
  },

  simulator: {
    whatIf: async (habit: string, value: number) => {
      // Stateless local calculation — fast for sliders.
      let savingsPercent = 0;
      let carbonSaved = 0;
      let rupeesSaved = 0;
      switch (habit) {
        case 'videoQuality':
          savingsPercent = value * 0.4;
          carbonSaved = value * 0.05;
          rupeesSaved = value * 0.8;
          break;
        case 'acTemp':
          savingsPercent = value * 0.6;
          carbonSaved = value * 0.12;
          rupeesSaved = value * 1.5;
          break;
        case 'zombieTabs':
          savingsPercent = value * 0.15;
          carbonSaved = value * 0.02;
          rupeesSaved = value * 0.3;
          break;
      }
      return { savingsPercent, carbonSavedKg: carbonSaved, rupeesSavedInr: rupeesSaved };
    },

    /** Run the real simulation against the backend. */
    runReal: async (changes: Array<{ type: string; reductionPercent: number }>) => {
      if (!(await probe())) return null;
      try {
        const userId = await ensureUserId();
        return await fetchJson('/api/simulate', {
          method: 'POST',
          body: JSON.stringify({ userId, changes }),
        });
      } catch (e) {
        console.warn('[mockApi.runReal] error', e);
        return null;
      }
    },
  },

  threshold: {
    get: async () => {
      if (!(await probe())) return null;
      try {
        const userId = await ensureUserId();
        return await fetchJson(`/api/threshold/${userId}`);
      } catch {
        return null;
      }
    },
    set: async (dailyLimit: number, weeklyLimit: number) => {
      if (!(await probe())) return null;
      const userId = await ensureUserId();
      return fetchJson('/api/threshold', {
        method: 'POST',
        body: JSON.stringify({ userId, dailyLimit, weeklyLimit }),
      });
    },
  },

  alerts: {
    list: async () => {
      if (!(await probe())) return [];
      try {
        const userId = await ensureUserId();
        return await fetchJson(`/api/alerts/${userId}`);
      } catch {
        return [];
      }
    },
  },

  activities: {
    log: async (type: string, usage: number) => {
      if (!(await probe())) return null;
      const userId = await ensureUserId();
      return fetchJson('/api/activities', {
        method: 'POST',
        body: JSON.stringify({ userId, type, usage }),
      });
    },
    list: async () => {
      if (!(await probe())) return [];
      try {
        const userId = await ensureUserId();
        return await fetchJson(`/api/activities/${userId}?limit=100`);
      } catch {
        return [];
      }
    },
  },

  chat: {
    sendMessage: async (message: string) => {
      if (await probe()) {
        try {
          const userId = await ensureUserId();
          const r = await fetchJson('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ userId, message }),
          });
          return r;
        } catch (e) {
          console.warn('[mockApi.chat] fallback', e);
        }
      }
      // offline / fallback
      await delay(400);
      const m = message.toLowerCase();
      if (m.includes('score') && m.includes('drop')) {
        return {
          text:
            "Your eco-score is shaped by threshold compliance, week-over-week improvement, and absolute usage. Look at your daily threshold meter — that's almost always the culprit.",
          timestamp: new Date().toISOString(),
        };
      }
      if (m.includes('hi') || m.includes('hello')) {
        return {
          text: "I'm your AI Eco-Coach. Ask me about your score, streak, threshold, or recommendations.",
          timestamp: new Date().toISOString(),
        };
      }
      return {
        text: 'Backend unreachable — start the API to see live coaching.',
        timestamp: new Date().toISOString(),
      };
    },
  },
};
