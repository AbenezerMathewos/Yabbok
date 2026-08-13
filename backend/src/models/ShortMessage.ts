import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShortMessage extends Document {
  title: string;
  content?: string;
  voiceUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  category?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShortMessageSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    voiceUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    category: { type: String, default: "General" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'archived'], default: 'pending' },
    moderationNote: { type: String, default: "" },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const ShortMessage: Model<IShortMessage> =
  mongoose.models.ShortMessage || mongoose.model<IShortMessage>("ShortMessage", ShortMessageSchema);

export default ShortMessage;
