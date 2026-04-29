import { Schema, model, Document, Types } from 'mongoose';

export interface IStreak extends Document {
  userId: Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastUnderThresholdDate?: Date;
  badges: string[];
}

const StreakSchema = new Schema<IStreak>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastUnderThresholdDate: { type: Date },
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Streak = model<IStreak>('Streak', StreakSchema);
