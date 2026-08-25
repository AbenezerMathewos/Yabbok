import { NextResponse } from "next/server";
import { connectToDatabase } from "@/backend/lib/mongodb";
import User from "@/backend/models/User";
import Church from "@/backend/models/Church";
import bcrypt from "bcryptjs";
import { RegisterSchema, formatZodError } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  // Rate limit: 5 registrations per 15 minutes per IP
  const limited = rateLimit(req, { windowMs: 15 * 60 * 1000, max: 5 });
  if (limited) return limited;

  try {
    const body = await req.json();

    // Validate input with Zod
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", fields: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      password,
      gender,
      dob,
      churchId,
      churchBranch,
      region,
      profilePhoto,
      ministryAreas,
      educationalStatus,
      bio,
    } = parsed.data;

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Verify church exists
    const church = await Church.findById(churchId);
    if (!church) {
      return NextResponse.json({ error: "Affiliated church not found" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      gender,
      dob: new Date(dob),
      churchId,
      churchBranch,
      region,
      profilePhoto: profilePhoto || "",
      ministryAreas: ministryAreas || [],
      educationalStatus,
      bio: bio || "",
      role: "member", // default role
      status: "pending", // must be approved by church leader & admin
    });

    // Increment church member count
    await Church.findByIdAndUpdate(churchId, { $inc: { memberCount: 1 } });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(
      { message: "Registration successful. Pending approval.", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
