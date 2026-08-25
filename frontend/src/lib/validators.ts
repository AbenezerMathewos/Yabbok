import { z } from "zod";

// Registration
export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone number too short")
    .max(20, "Phone number too long")
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  gender: z.enum(["male", "female"]),
  dob: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date of birth"),
  churchId: z.string().min(1, "Church is required"),
  churchBranch: z.string().min(1, "Church branch is required"),
  region: z.string().min(1, "Region is required"),
  profilePhoto: z.string().url("Profile photo must be a valid URL"),
  ministryAreas: z.array(z.string()).optional(),
  educationalStatus: z.string().min(1, "Educational status is required"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// Prayer Request
export const PrayerSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be under 120 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be under 1000 characters"),
  category: z.enum([
    "healing",
    "guidance",
    "thanksgiving",
    "intercession",
    "spiritual_growth",
    "family",
    "other",
  ]),
  isAnonymous: z.boolean().optional().default(false),
});

export type PrayerInput = z.infer<typeof PrayerSchema>;

// Prayer PATCH (pray / testimony)
export const PrayerPatchSchema = z.object({
  prayerId: z.string().min(1, "Prayer ID is required"),
  action: z.enum(["pray", "testimony"]),
  testimony: z.string().max(500).optional(),
});

export type PrayerPatchInput = z.infer<typeof PrayerPatchSchema>;

// Event
export const EventSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(10).max(2000),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid event date"),
  location: z.string().min(2).max(200),
  category: z.enum(['Conference', 'Youth Meeting', 'Prayer Night', 'Retreat', 'Bible Study']),
  isLive: z.boolean().optional().default(false),
  livePlatform: z.enum(['Zoom', 'Google Meet', 'YouTube Live', 'None']).optional(),
  liveMeetingUrl: z.string().url().optional().or(z.literal("")),
});

export type EventInput = z.infer<typeof EventSchema>;

// Sermon
export const SermonSchema = z.object({
  title: z.string().min(3).max(150),
  speaker: z.string().min(2).max(100),
  category: z.string().min(1),
  audioUrl: z.string().url("Audio URL must be a valid URL").optional().or(z.literal("")),
  videoUrl: z.string().url("Video URL must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(2000).optional(),
  date: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid sermon date"),
});

export type SermonInput = z.infer<typeof SermonSchema>;

// Format Zod errors into a flat field -> message map
// Uses .issues (Zod v3+) with explicit typing to avoid implicit any
export function formatZodError(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue: z.ZodIssue) => [issue.path.join("."), issue.message])
  );
}