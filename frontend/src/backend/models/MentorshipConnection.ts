import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMentorshipConnection extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'completed' | 'declined';
  goals: string[];
  meetingNotes: {
    date: Date;
    notes: string;
    actionItems: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MentorshipConnectionSchema: Schema = new Schema(
  {
    mentorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    menteeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'declined'],
      default: 'pending',
    },
    goals: [{ type: String }],
    meetingNotes: [
      {
        date: { type: Date, default: Date.now },
        notes: { type: String, required: true },
        actionItems: [{ type: String }],
      }
    ],
  },
  { timestamps: true }
);

const MentorshipConnection: Model<IMentorshipConnection> = mongoose.models.MentorshipConnection || mongoose.model<IMentorshipConnection>("MentorshipConnection", MentorshipConnectionSchema);

export default MentorshipConnection;
