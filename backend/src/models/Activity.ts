import { Schema, model, Document, Types } from 'mongoose';

export type ActivityType =
  | 'ai_query'
  | 'email'
  | 'streaming'
  | 'video_call'
  | 'cloud_storage'
  | 'web_browsing'
  | 'compute'
  | 'other';

export interface IActivity extends Document {
  userId: Types.ObjectId;
  type: ActivityType;
  usage: number;
  carbon: number;
  cost: number;
  meta?: Record<string, unknown>;
  timestamp: Date;
}

const ActivitySchema = new Schema<IActivity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['ai_query', 'email', 'streaming', 'video_call', 'cloud_storage', 'web_browsing', 'compute', 'other'],
    required: true,
  },
  usage: { type: Number, required: true },
  carbon: { type: Number, required: true },
  cost: { type: Number, required: true },
  meta: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: () => new Date(), index: true },
});

export const Activity = model<IActivity>('Activity', ActivitySchema);
