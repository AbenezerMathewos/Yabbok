import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBenevolenceRequest extends Document {
  applicant: mongoose.Types.ObjectId;
  amountRequested: number;
  category: 'Housing/Rent' | 'Medical' | 'Food/Groceries' | 'Utilities' | 'Other';
  description: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'funded';
  amountApproved?: number;
  reviewerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BenevolenceRequestSchema: Schema = new Schema(
  {
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amountRequested: { type: Number, required: true },
    category: {
      type: String,
      enum: ['Housing/Rent', 'Medical', 'Food/Groceries', 'Utilities', 'Other'],
      required: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'approved', 'rejected', 'funded'],
      default: 'pending',
    },
    amountApproved: { type: Number },
    reviewerNotes: { type: String },
  },
  { timestamps: true }
);

const BenevolenceRequest: Model<IBenevolenceRequest> = 
  mongoose.models.BenevolenceRequest || mongoose.model<IBenevolenceRequest>("BenevolenceRequest", BenevolenceRequestSchema);

export default BenevolenceRequest;
