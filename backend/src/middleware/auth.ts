import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthedRequest extends Request {
  userId?: string;
}

const SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export const signToken = (userId: string) =>
  jwt.sign({ userId }, SECRET, { expiresIn: '30d' });

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, SECRET) as { userId: string };
};

/** Optional middleware — attaches userId if a valid Bearer token is present, never fails. */
export const attachUser = (req: AuthedRequest, _res: Response, next: NextFunction) => {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) {
    try {
      const { userId } = verifyToken(h.slice(7));
      req.userId = userId;
    } catch {
      /* ignore — handler can still operate without auth for demo endpoints */
    }
  }
  next();
};

/** Strict middleware — requires a valid Bearer token. */
export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  try {
    const { userId } = verifyToken(h.slice(7));
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
};
