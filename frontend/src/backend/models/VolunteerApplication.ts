import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVolunteerApplication extends Document {
  opportunity: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "declined";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerApplicationSchema: Schema = new Schema(
  {
    opportunity: { type: Schema.Types.ObjectId, ref: "MinistryOpportunity", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const VolunteerApplication: Model<IVolunteerApplication> = 
  mongoose.models.VolunteerApplication || mongoose.model<IVolunteerApplication>("VolunteerApplication", VolunteerApplicationSchema);

export default VolunteerApplication;
