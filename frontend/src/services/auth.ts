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

const post = async (path: string, body: unknown) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
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
