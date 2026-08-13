import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChurch extends Document {
  name: string;
  city: string;
  region: string;
  description: string;
  leaderId?: mongoose.Types.ObjectId;
  memberCount: number;
  status: "pending" | "verified" | "archived";
  pendingAction?: "create" | "update" | "delete" | null;
  pendingChanges?: Partial<{
    name: string;
    city: string;
    region: string;
    description: string;
    leaderId: mongoose.Types.ObjectId | string | null;
    memberCount: number;
  }> | null;
  submittedBy?: mongoose.Types.ObjectId | string;
  submittedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId | string;
  verifiedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChurchSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    description: { type: String, required: true },
    leaderId: { type: Schema.Types.ObjectId, ref: "User" },
    memberCount: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "verified", "archived"], default: "verified" },
    pendingAction: { type: String, enum: ["create", "update", "delete", null], default: null },
    pendingChanges: { type: Schema.Types.Mixed, default: null },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" },
    submittedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent compiling model if it's already compiled
const Church: Model<IChurch> = mongoose.models.Church || mongoose.model<IChurch>("Church", ChurchSchema);

export default Church;
