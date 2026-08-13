import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  targetType: "PrayerRequest" | "Testimony" | "DiscussionTopic" | "GalleryItem" | "Sermon" | "Event" | "User";
  targetId: mongoose.Types.ObjectId;
  reason: string;
  details?: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  assignedTo?: mongoose.Types.ObjectId;
  resolutionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: {
      type: String,
      enum: ["PrayerRequest", "Testimony", "DiscussionTopic", "GalleryItem", "Sermon", "Event", "User"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    details: { type: String, default: "" },
    status: { type: String, enum: ["open", "reviewing", "resolved", "dismissed"], default: "open" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    resolutionNote: { type: String, default: "" },
  },
  { timestamps: true }
);

ReportSchema.index({ targetType: 1, targetId: 1, status: 1 });

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
