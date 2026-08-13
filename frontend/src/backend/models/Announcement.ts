import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  audience: "all" | "role" | "church" | "user";
  role?: string;
  churchId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  approvalStatus: "pending" | "approved" | "rejected";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ["all", "role", "church", "user"], default: "all" },
    role: { type: String },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
