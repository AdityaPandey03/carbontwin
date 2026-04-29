import { Schema, model, Document, Types } from 'mongoose';

export type AlertType = 'warning' | 'critical' | 'spike' | 'info';

export interface IAlert extends Document {
  userId: Types.ObjectId;
  type: AlertType;
  message: string;
  read: boolean;
  timestamp: Date;
}

const AlertSchema = new Schema<IAlert>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['warning', 'critical', 'spike', 'info'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: () => new Date() },
});

export const Alert = model<IAlert>('Alert', AlertSchema);
