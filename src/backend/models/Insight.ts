import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInsightComment {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IInsightReaction {
  user: mongoose.Types.ObjectId;
  type: 'like' | 'love' | 'amen' | 'praise_god' | 'pray';
}

export interface IInsight extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  bibleReferences: string[];
  reactions: IInsightReaction[];
  comments: IInsightComment[];
  createdAt: Date;
  updatedAt: Date;
}

const InsightSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    bibleReferences: [{ type: String }],
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
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Insight: Model<IInsight> = 
  mongoose.models.Insight || mongoose.model<IInsight>("Insight", InsightSchema);

export default Insight;
