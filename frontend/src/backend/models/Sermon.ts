import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISermon extends Document {
  title: string;
  speaker: string;
  date: Date;
  description: string;
  audioUrl?: string;
  videoUrl?: string;
  notes?: string;
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

const SermonSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    speaker: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    audioUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    category: { type: String, default: "Sermon" },
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

const Sermon: Model<ISermon> = mongoose.models.Sermon || mongoose.model<ISermon>("Sermon", SermonSchema);

export default Sermon;
