import mongoose, { Schema, Document } from 'mongoose';

export interface IPrayer extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'healing' | 'family' | 'faith' | 'provision' | 'guidance' | 'other';
  isAnonymous: boolean;
  prayedCount: number;
  prayedUsers: string[];
  status: 'active' | 'answered';
  testimony?: string;
  createdAt: Date;
}

const PrayerSchema = new Schema<IPrayer>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['healing', 'family', 'faith', 'provision', 'guidance', 'other'], 
    default: 'other' 
  },
  isAnonymous: { type: Boolean, default: false },
  prayedCount: { type: Number, default: 0 },
  prayedUsers: [{ type: String }],
  status: { type: String, enum: ['active', 'answered'], default: 'active' },
  testimony: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Prayer || mongoose.model<IPrayer>('Prayer', PrayerSchema);
