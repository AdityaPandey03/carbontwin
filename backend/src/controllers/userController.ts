import { Request, Response } from 'express';
import { User } from '../models/User';

export const listUsers = async (_req: Request, res: Response) => {
  const users = await User.find().sort({ ecoScore: -1 });
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, company } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  const u = await User.create({ name, email, company });
  res.status(201).json(u);
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const u = await User.findById(id);
  if (!u) return res.status(404).json({ error: 'not found' });
  res.json(u);
};
