import { Document, model, models, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: Date;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Invalid slug format"],
      maxLength: [100, "Slug cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },

    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
      maxLength: [2000, "Overview cannot exceed 2000 characters"],
    },

    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
      match: [
        /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i,
        "Invalid image URL format. Must be a valid URL ending with an image extension (png, jpg, jpeg, gif, svg, webp).",
      ],
    },

    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
      maxLength: [500, "Venue cannot exceed 500 characters"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxLength: [500, "Location cannot exceed 500 characters"],
    },

    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    time: {
      type: String,
      required: [true, "Time is required"],
      trim: true,
      maxLength: [50, "Time cannot exceed 50 characters"],
    },

    mode: {
      type: String,
      required: [true, "Mode is required"],
      enum: {
        values: ["Online", "In-Person", "Hybrid"],
        message: "Mode must be either Online, In-Person, or Hybrid",
      },
    },

    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
      enum: {
        values: [
          "Students",
          "Developers",
          "Professionals",
          "Researchers",
          "Everyone",
        ],
        message:
          "Audience must be one of the following: Students, Developers, Professionals, Researchers, Everyone",
      },
      maxLength: [200, "Audience cannot exceed 200 characters"],
    },

    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "Agenda must have at least one item",
      },
      set: (agenda: string[]) => agenda.map((item) => item.trim()),
    },

    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
      maxLength: [1000, "Organizer cannot exceed 1000 characters"],
    },

    tags: {
      type: [String],
      required: [true, "At least one tag is required"],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "At least one tag is required",
      },
      set: (tags: string[]) => [
        ...new Set(tags.map((tag) => tag.trim().toLowerCase())),
      ],
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to generate slug from title
EventSchema.pre<IEvent>("save", function () {
  const event = this as IEvent;

  if (event.isModified("title") || event.isNew)
    event.slug = generateSlug(event.title);

  if (event.isModified("time")) event.time = normalizeTime(event.time);
});

function generateSlug(title: string): string {
  return title
    .normalize("NFD") // Decomposes accented characters (é → e + accent)
    .replace(/[\u0300-\u036f]/g, "") // Removes accent marks/diacritics
    .toLowerCase() // Converts all characters to lowercase
    .trim() // Removes leading and trailing whitespace
    .replace(/[^a-z0-9\s-]/g, "") // Removes special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replaces one or more spaces with a single hyphen
    .replace(/-+/g, "-") // Replaces multiple consecutive hyphens with one
    .replace(/^-+|-+$/g, ""); // Removes hyphens from the start and end
}

function normalizeTime(timeString: string): string {
  // Matches time in HH:MM or HH:MM AM/PM format
  const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;

  const match = timeString.trim().match(timeRegex); // Removes extra spaces and matches against regex

  if (!match) {
    throw new Error("Invalid time format. Use HH:MM or HH:MM AM/PM"); // Throws error if input doesn't match expected format
  }

  let hours = parseInt(match[1]); // Converts hour string to number
  const minutes = parseInt(match[2]); // Extracts minutes
  const period = match[4]?.toUpperCase(); // Converts AM/PM to uppercase if provided

  if (period) {
    // Converts 12-hour format to 24-hour format
    if (period === "PM" && hours !== 12) hours += 12; // Adds 12 for PM times except 12 PM
    if (period === "AM" && hours === 12) hours = 0; // Converts 12 AM to 00
  }

  // validates hour and minute ranges
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Invalid time values"); // Throws error for invalid numeric values
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`; // Formats result as HH:MM
}

EventSchema.index({ slug: 1 }, { unique: true });

EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
