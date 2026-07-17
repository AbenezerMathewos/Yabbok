import mongoose, { Schema, Document, Model } from "mongoose";
import { Role, UserStatus } from "@/backend/auth/roles";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  gender: 'male' | 'female';
  dob: Date;
  churchId: mongoose.Types.ObjectId;
  churchBranch: string;
  region: string;
  profilePhoto: string;
  ministryAreas: string[];
  educationalStatus: string;
  bio: string;
  role: Role;
  status: UserStatus;
  suspensionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  lastLoginAt?: Date;
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showChurch: boolean;
  };
  emailVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true },
    password: { type: String },
    gender: { type: String, enum: ['male', 'female'], required: true },
    dob: { type: Date, required: true },
    churchId: { type: Schema.Types.ObjectId, ref: "Church", required: true },
    churchBranch: { type: String, required: true },
    region: { type: String, required: true },
    profilePhoto: { type: String, default: "" },
    ministryAreas: [{ type: String }],
    educationalStatus: { type: String, required: true },
    bio: { type: String, default: "" },
    role: { 
      type: String, 
      enum: ['visitor', 'member', 'youth_leader', 'church_leader', 'moderator', 'admin', 'super_admin'], 
      default: 'member' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'verified_by_leader', 'active', 'suspended'], 
      default: 'pending' 
    },
    suspensionReason: { type: String, default: "" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    lastLoginAt: { type: Date },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      showChurch: { type: Boolean, default: true },
    },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
