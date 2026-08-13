import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBook extends Document {
  title: string;
  author?: string;
  description: string;
  coverUrl?: string;
  pdfUrl?: string;
  category?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  approvalStatus: "pending" | "approved" | "rejected" | "archived";
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, default: "" },
    description: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    category: { type: String, default: "Book" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected", "archived"], default: "pending" },
    moderationNote: { type: String, default: "" },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;
