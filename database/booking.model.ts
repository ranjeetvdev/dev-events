import { Document, model, models, Schema, Types } from "mongoose";
import Event from "./event.model";

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      immutable: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to validate events exists before saving a booking
BookingSchema.pre<IBooking>("save", async function () {
  // Only validate if the eventId is new or modified
  if (this.isModified("eventId") || this.isNew) {
    const eventExists = await Event.exists({ _id: this.eventId });

    if (!eventExists)
      throw new Error(`Event with ID ${this.eventId} does not exist`);
  }
});

// Create compound index for common queries (e.g., find bookings by eventId and date)
BookingSchema.index({ eventId: 1, createdAt: -1 });

// Create index on email for faster lookups
BookingSchema.index({ email: 1 });

// Enforce unique booking per user per event
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: "unique_booking_per_user_per_event" },
);

const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
