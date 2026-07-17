import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITestimonyComment {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface ITestimonyReaction {
  user: mongoose.Types.ObjectId;
  type: 'like' | 'love' | 'amen' | 'praise_god' | 'pray';
}

export interface ITestimony extends Document {
  user: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  media: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  deletedAt?: Date;
  comments: ITestimonyComment[];
  reactions: ITestimonyReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const TestimonySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    media: [{ type: String }],
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'archived'], default: 'pending' },
    moderationNote: { type: String, default: "" },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    deletedAt: { type: Date },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { 
          type: String, 
          enum: ['like', 'love', 'amen', 'praise_god', 'pray'], 
          required: true 
        },
      },
    ],
  },
  { timestamps: true }
);

const Testimony: Model<ITestimony> = 
  mongoose.models.Testimony || mongoose.model<ITestimony>("Testimony", TestimonySchema);

export default Testimony;
