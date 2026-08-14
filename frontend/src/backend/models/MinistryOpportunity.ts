import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMinistryOpportunity extends Document {
  title: string;
  description: string;
  skillsRequired: string[];
  date?: Date;
  churchBranch?: string;
  createdBy: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const MinistryOpportunitySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillsRequired: [{ type: String }],
    date: { type: Date },
    churchBranch: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const MinistryOpportunity: Model<IMinistryOpportunity> = 
  mongoose.models.MinistryOpportunity || mongoose.model<IMinistryOpportunity>("MinistryOpportunity", MinistryOpportunitySchema);

export default MinistryOpportunity;
