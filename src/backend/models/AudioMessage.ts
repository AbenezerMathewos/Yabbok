import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAudioMessage extends Document {
  title: string;
  speaker?: string;
  description: string;
  audioUrl: string;
  category?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  approvalStatus: "pending" | "approved" | "rejected" | "archived";
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AudioMessageSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    speaker: { type: String, default: "" },
    description: { type: String, default: "" },
    audioUrl: { type: String, required: true },
    category: { type: String, default: "Audio Message" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected", "archived"], default: "pending" },
    moderationNote: { type: String, default: "" },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const AudioMessage: Model<IAudioMessage> =
  mongoose.models.AudioMessage || mongoose.model<IAudioMessage>("AudioMessage", AudioMessageSchema);

export default AudioMessage;
