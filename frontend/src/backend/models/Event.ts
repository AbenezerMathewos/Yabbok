import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: 'Conference' | 'Youth Meeting' | 'Prayer Night' | 'Retreat' | 'Bible Study';
  date: Date;
  endDate?: Date;
  location: string;
  isLive: boolean;
  liveMeetingUrl?: string;
  livePlatform: 'Zoom' | 'Google Meet' | 'YouTube Live' | 'None';
  organizer?: mongoose.Types.ObjectId;
  churchId?: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  images: string[];
  photoAdUrl?: string;
  videoAdUrl?: string;
  voiceAdUrl?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  moderationNote?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Conference', 'Youth Meeting', 'Prayer Night', 'Retreat', 'Bible Study'], 
      required: true 
    },
    date: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, required: true },
    isLive: { type: Boolean, default: false },
    liveMeetingUrl: { type: String, default: "" },
    livePlatform: { 
      type: String, 
      enum: ['Zoom', 'Google Meet', 'YouTube Live', 'None'], 
      default: 'None' 
    },
    organizer: { type: Schema.Types.ObjectId, ref: "User" },
    churchId: { type: Schema.Types.ObjectId, ref: "Church" },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    images: [{ type: String }],
    photoAdUrl: { type: String, default: "" },
    videoAdUrl: { type: String, default: "" },
    voiceAdUrl: { type: String, default: "" },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'archived'], default: 'approved' },
    moderationNote: { type: String, default: "" },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
