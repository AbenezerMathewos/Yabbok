import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatReaction {
  user: mongoose.Types.ObjectId;
  type: string;
}

export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient?: mongoose.Types.ObjectId;
  chatType: 'private' | 'church' | 'fellowship' | 'ministry' | 'global';
  chatGroupId?: string; // identifier for groups e.g. "church_id"
  content: string;
  mediaUrl?: string;
  reactions: IChatReaction[];
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema: Schema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User" },
    chatType: { 
      type: String, 
      enum: ['private', 'church', 'fellowship', 'ministry', 'global'], 
      required: true 
    },
    chatGroupId: { type: String },
    content: { type: String, required: true },
    mediaUrl: { type: String, default: "" },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, required: true },
      },
    ],
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const ChatMessage: Model<IChatMessage> = 
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessage;
