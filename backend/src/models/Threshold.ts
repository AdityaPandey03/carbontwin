import { Schema, model, Document, Types } from 'mongoose';

export interface IThreshold extends Document {
  userId: Types.ObjectId;
  dailyLimit: number;
  weeklyLimit: number;
  updatedAt: Date;
}

const ThresholdSchema = new Schema<IThreshold>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dailyLimit: { type: Number, default: 0.5 },
    weeklyLimit: { type: Number, default: 3 },
  },
  { timestamps: true }
);

export const Threshold = model<IThreshold>('Threshold', ThresholdSchema);
