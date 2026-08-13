import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISuggestion extends Document {
  user: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: 'Fellowship Idea' | 'Ministry Suggestion' | 'Improvement' | 'Other';
  status: 'review' | 'approved' | 'archived';
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Fellowship Idea', 'Ministry Suggestion', 'Improvement', 'Other'],
      default: 'Other'
    },
    deletedAt: { type: Date },
    status: { 
      type: String, 
      enum: ['review', 'approved', 'archived'], 
      default: 'review' 
    },
  },
  { timestamps: true }
);

const Suggestion: Model<ISuggestion> = 
  mongoose.models.Suggestion || mongoose.model<ISuggestion>("Suggestion", SuggestionSchema);

export default Suggestion;
