/**
 * Auth client + simple persisted store.
 * The token is kept in localStorage; mockApi.ts reads it via getToken().
 */

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'carbontwin.token';
const USER_KEY = 'carbontwin.user';

export interface AuthUser {
  id: string;
  _id: string;
  name: string;
  email: string;
  company: string;
  ecoScore: number;
  carbonSaved: number;
  streakDays: number;
  badges: string[];
}

/**
 * POST with retry-on-network-error.
 * Render's free dyno can take ~30 s to wake on the first request after idle;
 * the browser fetch occasionally errors out as "Failed to fetch" when the
 * connection is slow to establish. We absorb that by retrying once after a
 * short wait (which gives the dyno time to come up) before bubbling the error.
 */
const post = async (path: string, body: unknown, attempt = 0): Promise<any> => {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  } catch (e: any) {
    const isNetwork =
      e?.name === 'TypeError' ||
      String(e?.message || '').toLowerCase().includes('failed to fetch') ||
      String(e?.message || '').toLowerCase().includes('network');
    if (isNetwork && attempt < 2) {
      // Best-effort wake the dyno, then wait a bit and retry.
      fetch(`${API_URL}/health`).catch(() => {});
      await new Promise((r) => setTimeout(r, 6000 + attempt * 4000));
      return post(path, body, attempt + 1);
    }
    throw e;
  }
};

export const authStore = {
  getToken: (): string | null =>
    typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY),

  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  set: (token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const authApi = {
  signup: (input: { name: string; email: string; password: string; company?: string }) =>
    post('/api/auth/signup', input) as Promise<{ token: string; user: AuthUser }>,

  login: (input: { email: string; password: string }) =>
    post('/api/auth/login', input) as Promise<{ token: string; user: AuthUser }>,

  me: async (token: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user as AuthUser;
    } catch {
      return null;
    }
  },
};
