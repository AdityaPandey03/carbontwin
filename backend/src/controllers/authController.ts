import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Threshold } from '../models/Threshold';
import { signToken, AuthedRequest } from '../middleware/auth';

const sanitize = (u: any) => ({
  id: u.id,
  _id: u.id,
  name: u.name,
  email: u.email,
  company: u.company,
  ecoScore: u.ecoScore,
  carbonSaved: u.carbonSaved,
  streakDays: u.streakDays,
  badges: u.badges,
});

export const signup = async (req: Request, res: Response) => {
  const { name, email, password, company } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, password required' });
  }
  if (String(password).length < 4) {
    return res.status(400).json({ error: 'password must be at least 4 characters' });
  }

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) return res.status(409).json({ error: 'email already registered' });

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    name,
    email: String(email).toLowerCase().trim(),
    passwordHash,
    company: company || 'Independent',
    ecoScore: 70,
  });
  await Threshold.create({ userId: user._id, dailyLimit: 0.5, weeklyLimit: 3 });

  const token = signToken(user.id);
  res.status(201).json({ token, user: sanitize(user) });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid credentials' });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  const token = signToken(user.id);
  res.json({ token, user: sanitize(user) });
};

export const me = async (req: AuthedRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ error: 'not authenticated' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'user not found' });
  res.json({ user: sanitize(user) });
};
