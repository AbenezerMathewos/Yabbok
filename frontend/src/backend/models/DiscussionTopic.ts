import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscussionReply {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IDiscussionTopic extends Document {
  title: string;
  content: string;
  user: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  category: 'Faith' | 'Bible Study' | 'Prayer' | 'Evangelism' | 'Christian Living' | 'Education' | 'Career' | 'Relationships' | 'Ministry';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  deletedAt?: Date;
  replies: IDiscussionReply[];
  likes: mongoose.Types.ObjectId[];
  bookmarks: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionTopicSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    category: { 
      type: String, 
      enum: ['Faith', 'Bible Study', 'Prayer', 'Evangelism', 'Christian Living', 'Education', 'Career', 'Relationships', 'Ministry'], 
      required: true 
    },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'archived'], default: 'pending' },
    moderationNote: { type: String, default: "" },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    deletedAt: { type: Date },
    replies: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const DiscussionTopic: Model<IDiscussionTopic> = 
  mongoose.models.DiscussionTopic || mongoose.model<IDiscussionTopic>("DiscussionTopic", DiscussionTopicSchema);

export default DiscussionTopic;
