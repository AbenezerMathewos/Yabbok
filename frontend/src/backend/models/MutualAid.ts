import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMutualAid extends Document {
  user: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  type: 'need' | 'offer';
  category: 'meals' | 'transportation' | 'labor' | 'prayer' | 'financial' | 'other';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'fulfilled';
  fulfilledBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MutualAidSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    type: { 
      type: String, 
      enum: ['need', 'offer'], 
      required: true 
    },
    category: { 
      type: String, 
      enum: ['meals', 'transportation', 'labor', 'prayer', 'financial', 'other'], 
      required: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'fulfilled'], 
      default: 'open' 
    },
    fulfilledBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const MutualAid: Model<IMutualAid> = 
  mongoose.models.MutualAid || mongoose.model<IMutualAid>("MutualAid", MutualAidSchema);

export default MutualAid;
