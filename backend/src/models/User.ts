import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  company?: string;
  ecoScore: number;
  carbonSaved: number;
  streakDays: number;
  badges: string[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    company: { type: String, default: 'Independent' },
    ecoScore: { type: Number, default: 70 },
    carbonSaved: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
