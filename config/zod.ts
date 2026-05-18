import * as z from "zod";

const timeRegex =
  /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/i;

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Title is required" })
    .max(100, { error: "Title cannot exceed 100 characters" }),

  description: z
    .string()
    .trim()
    .min(1, { error: "Description is required" })
    .max(1000, { error: "Description cannot exceed 1000 characters" }),

  overview: z
    .string()
    .trim()
    .min(1, { error: "Overview is required" })
    .max(2000, { error: "Overview cannot exceed 2000 characters" }),

  image: z
    .instanceof(File, { message: "Image must be a file" })
    .refine((file) => file.size > 0, {
      error: "Image is required",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      error: "Image must be less than 5MB",
    }),
  venue: z
    .string()
    .trim()
    .min(1, { error: "Venue is required" })
    .max(500, { error: "Venue cannot exceed 500 characters" }),

  location: z
    .string()
    .trim()
    .min(1, { error: "Location is required" })
    .max(500, { error: "Location cannot exceed 500 characters" }),

  date: z.coerce.date({
    error: "Invalid date format",
  }),

  time: z
    .string()
    .trim()
    .regex(timeRegex, {
      error: "Invalid time format. Use HH:MM or HH:MM AM/PM",
    })
    .max(50, { error: "Time cannot exceed 50 characters" }),

  mode: z.enum(["Online", "In-Person", "Hybrid"], {
    error: "Mode must be either Online, In-Person, or Hybrid",
  }),

  audience: z.enum(
    ["Students", "Developers", "Professionals", "Researchers", "Everyone"],
    {
      error:
        "Audience must be one of: Students, Developers, Professionals, Researchers, Everyone",
    },
  ),

  agenda: z
    .array(
      z.string().trim().min(1, {
        error: "Agenda item cannot be empty",
      }),
    )
    .min(1, { error: "Agenda must have at least one item" })
    .transform((items) => items.map((item) => item.trim())),

  organizer: z
    .string()
    .trim()
    .min(1, { error: "Organizer is required" })
    .max(1000, { error: "Organizer cannot exceed 1000 characters" }),

  tags: z
    .array(
      z.string().trim().min(1, {
        error: "Tag cannot be empty",
      }),
    )
    .min(1, { error: "At least one tag is required" })
    .transform((tags) => [
      ...new Set(tags.map((tag) => tag.trim().toLowerCase())),
    ]),
});

export type EventInput = z.infer<typeof eventSchema>;
