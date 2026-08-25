import mongoose, { Schema, Document } from "mongoose";

export interface IBadge extends Document {
  user: mongoose.Types.ObjectId;
  badgeId: string;
  nameEn: string;
  nameAm: string;
  descriptionEn: string;
  descriptionAm: string;
  icon: string;
  category: "quiz" | "prayer" | "devotional" | "fellowship";
  earnedAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  badgeId: { type: String, required: true },
  nameEn: { type: String, required: true },
  nameAm: { type: String, required: true },
  descriptionEn: { type: String, required: true },
  descriptionAm: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ["quiz", "prayer", "devotional", "fellowship"], default: "quiz" },
  earnedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Badge || mongoose.model<IBadge>("Badge", BadgeSchema);
