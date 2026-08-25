import { describe, it, expect } from "vitest";
import {
  RegisterSchema,
  PrayerSchema,
  PrayerPatchSchema,
  EventSchema,
  SermonSchema,
  formatZodError,
} from "../lib/validators";

// ── RegisterSchema ───────────────────────────────────────────────────────────
describe("RegisterSchema", () => {
  const valid = {
    name: "Abebe Kebede",
    email: "abebe@yabbok.org",
    phone: "+251911223344",
    password: "Secure123",
    gender: "male",
    dob: "1998-05-12",
    churchId: "507f1f77bcf86cd799439011",
    churchBranch: "Central Youth",
    region: "Addis Ababa",
    profilePhoto: "https://example.com/photo.jpg",
    educationalStatus: "Graduate",
  };

  it("accepts a valid registration payload", () => {
    expect(RegisterSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short name", () => {
    const r = RegisterSchema.safeParse({ ...valid, name: "A" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const r = RegisterSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects password with no uppercase", () => {
    const r = RegisterSchema.safeParse({ ...valid, password: "alllower1" });
    expect(r.success).toBe(false);
  });

  it("rejects password with no number", () => {
    const r = RegisterSchema.safeParse({ ...valid, password: "NoNumber!" });
    expect(r.success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const r = RegisterSchema.safeParse({ ...valid, password: "Ab1" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid gender enum", () => {
    const r = RegisterSchema.safeParse({ ...valid, gender: "other" });
    expect(r.success).toBe(false);
  });

  it("rejects non-URL profilePhoto", () => {
    const r = RegisterSchema.safeParse({ ...valid, profilePhoto: "not-a-url" });
    expect(r.success).toBe(false);
  });
});

// ── PrayerSchema ─────────────────────────────────────────────────────────────
describe("PrayerSchema", () => {
  const valid = {
    title: "Prayer for my exams",
    description: "Please pray for wisdom and peace during my final exams.",
    category: "guidance",
  };

  it("accepts a valid prayer payload", () => {
    expect(PrayerSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults isAnonymous to false", () => {
    const r = PrayerSchema.safeParse(valid);
    expect(r.success && r.data.isAnonymous).toBe(false);
  });

  it("rejects title shorter than 3 chars", () => {
    const r = PrayerSchema.safeParse({ ...valid, title: "Hi" });
    expect(r.success).toBe(false);
  });

  it("rejects description shorter than 10 chars", () => {
    const r = PrayerSchema.safeParse({ ...valid, description: "Short" });
    expect(r.success).toBe(false);
  });

  it("rejects unknown category", () => {
    const r = PrayerSchema.safeParse({ ...valid, category: "unknown" });
    expect(r.success).toBe(false);
  });

  it("accepts all valid categories", () => {
    const cats = ["healing", "guidance", "thanksgiving", "intercession", "spiritual_growth", "family", "other"];
    cats.forEach((cat) => {
      expect(PrayerSchema.safeParse({ ...valid, category: cat }).success).toBe(true);
    });
  });
});

// ── PrayerPatchSchema ────────────────────────────────────────────────────────
describe("PrayerPatchSchema", () => {
  it("accepts pray action", () => {
    const r = PrayerPatchSchema.safeParse({ prayerId: "abc123", action: "pray" });
    expect(r.success).toBe(true);
  });

  it("accepts testimony action with text", () => {
    const r = PrayerPatchSchema.safeParse({ prayerId: "abc123", action: "testimony", testimony: "God answered!" });
    expect(r.success).toBe(true);
  });

  it("rejects missing prayerId", () => {
    const r = PrayerPatchSchema.safeParse({ action: "pray" });
    expect(r.success).toBe(false);
  });

  it("rejects unknown action", () => {
    const r = PrayerPatchSchema.safeParse({ prayerId: "abc123", action: "delete" });
    expect(r.success).toBe(false);
  });
});

// ── EventSchema ──────────────────────────────────────────────────────────────
describe("EventSchema", () => {
  const valid = {
    title: "National Youth Conference 2026",
    description: "A 3-day spiritual retreat for youth leaders across Ethiopia.",
    date: "2026-10-15",
    location: "Hawassa Convention Hall",
    category: "Retreat",
  };

  it("accepts a valid event payload", () => {
    expect(EventSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title, ...rest } = valid;
    expect(EventSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid date", () => {
    const r = EventSchema.safeParse({ ...valid, date: "not-a-date" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid liveMeetingUrl", () => {
    const r = EventSchema.safeParse({ ...valid, liveMeetingUrl: "not-a-url" });
    expect(r.success).toBe(false);
  });

  it("accepts empty liveMeetingUrl", () => {
    const r = EventSchema.safeParse({ ...valid, liveMeetingUrl: "" });
    expect(r.success).toBe(true);
  });
});

// ── SermonSchema ─────────────────────────────────────────────────────────────
describe("SermonSchema", () => {
  const valid = {
    title: "Walking in Divine Purpose",
    speaker: "Pastor Dawit Abrham",
    category: "Discipleship",
    date: "2026-08-01",
  };

  it("accepts a valid sermon payload", () => {
    expect(SermonSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short speaker name", () => {
    const r = SermonSchema.safeParse({ ...valid, speaker: "A" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid audioUrl", () => {
    const r = SermonSchema.safeParse({ ...valid, audioUrl: "not-a-url" });
    expect(r.success).toBe(false);
  });

  it("accepts empty audioUrl", () => {
    const r = SermonSchema.safeParse({ ...valid, audioUrl: "" });
    expect(r.success).toBe(true);
  });
});

// ── formatZodError ───────────────────────────────────────────────────────────
describe("formatZodError", () => {
  it("returns flat field-to-message map", () => {
    const result = RegisterSchema.safeParse({ name: "A", email: "bad" });
    if (!result.success) {
      const errors = formatZodError(result.error);
      expect(typeof errors).toBe("object");
      expect(errors["name"]).toBeDefined();
      expect(errors["email"]).toBeDefined();
    }
  });
});