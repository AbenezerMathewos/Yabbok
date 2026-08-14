import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICounselingRequest extends Document {
  user: mongoose.Types.ObjectId;
  counselor?: mongoose.Types.ObjectId;
  topic: 'Spiritual' | 'Mental Health' | 'Addiction' | 'Family/Relationships' | 'Other';
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'referred';
  isAnonymous: boolean;
  messages: {
    senderId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CounselingRequestSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    counselor: { type: Schema.Types.ObjectId, ref: "User" },
    topic: {
      type: String,
      enum: ['Spiritual', 'Mental Health', 'Addiction', 'Family/Relationships', 'Other'],
      required: true,
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'referred'],
      default: 'open',
    },
    isAnonymous: { type: Boolean, default: false },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

const CounselingRequest: Model<ICounselingRequest> = mongoose.models.CounselingRequest || mongoose.model<ICounselingRequest>("CounselingRequest", CounselingRequestSchema);

export default CounselingRequest;
