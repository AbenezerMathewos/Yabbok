import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMentorProfile extends Document {
  user: mongoose.Types.ObjectId;
  expertise: string[];
  maxMentees: number;
  currentMentees: number;
  isAvailable: boolean;
  isApproved: boolean; // Must be true to show up in the mentor list
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorProfileSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    expertise: [{ type: String, required: true }],
    maxMentees: { type: Number, default: 3 },
    currentMentees: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false }, // Admins must approve
    bio: { type: String, default: "" },
  },
  { timestamps: true }
);

const MentorProfile: Model<IMentorProfile> = mongoose.models.MentorProfile || mongoose.model<IMentorProfile>("MentorProfile", MentorProfileSchema);

export default MentorProfile;
