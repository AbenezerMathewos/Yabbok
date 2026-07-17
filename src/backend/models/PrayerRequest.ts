import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrayerComment {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPrayerReaction {
  user: mongoose.Types.ObjectId;
  type: 'like' | 'love' | 'amen' | 'praise_god' | 'pray';
}

export interface IPrayerRequest extends Document {
  user: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  content: string;
  isAnonymous: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  deletedAt?: Date;
  prayedForBy: mongoose.Types.ObjectId[];
  comments: IPrayerComment[];
  reactions: IPrayerReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const PrayerRequestSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    content: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'archived'], default: 'pending' },
    moderationNote: { type: String, default: "" },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    deletedAt: { type: Date },
    prayedForBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { 
          type: String, 
          enum: ['like', 'love', 'amen', 'praise_god', 'pray'], 
          required: true 
        },
      },
    ],
  },
  { timestamps: true }
);

const PrayerRequest: Model<IPrayerRequest> = 
  mongoose.models.PrayerRequest || mongoose.model<IPrayerRequest>("PrayerRequest", PrayerRequestSchema);

export default PrayerRequest;
