import mongoose, { Schema, Document } from 'mongoose';

export interface IDevotional extends Document {
  date: string;
  verseRef: string;
  verseEn: string;
  verseAm: string;
  reflectionEn: string;
  reflectionAm: string;
  author: string;
  completedUsers: string[];
}

const DevotionalSchema = new Schema<IDevotional>({
  date: { type: String, required: true, unique: true },
  verseRef: { type: String, required: true },
  verseEn: { type: String, required: true },
  verseAm: { type: String, required: true },
  reflectionEn: { type: String, required: true },
  reflectionAm: { type: String, required: true },
  author: { type: String, default: "YSF Pastoral Team" },
  completedUsers: [{ type: String }],
});

export default mongoose.models.Devotional || mongoose.model<IDevotional>('Devotional', DevotionalSchema);
