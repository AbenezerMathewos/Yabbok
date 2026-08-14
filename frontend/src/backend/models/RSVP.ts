import mongoose, { Schema, Document } from 'mongoose';

export interface IRSVP extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  ticketCode: string;
  checkedIn: boolean;
  createdAt: Date;
}

const RSVPSchema = new Schema<IRSVP>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketCode: { type: String, required: true, unique: true },
  checkedIn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.RSVP || mongoose.model<IRSVP>('RSVP', RSVPSchema);
