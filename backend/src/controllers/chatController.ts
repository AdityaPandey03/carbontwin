import { Request, Response } from 'express';
import { chat } from '../services/chatService';

export const handleChat = async (req: Request, res: Response) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: 'userId and message required' });
  const reply = await chat(userId, String(message));
  res.json(reply);
};
