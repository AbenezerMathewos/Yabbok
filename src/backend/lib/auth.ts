import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/backend/lib/mongodb";
import User from "@/backend/models/User";
import bcrypt from "bcryptjs";
import { Role } from "@/backend/auth/roles";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "");

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Only allow active users to login
        if (user.status === "pending") {
          throw new Error("Your account is pending review. A church leader will verify your registration soon.");
        }
        if (user.status === "verified_by_leader") {
          throw new Error("Your account has been verified by your church leader and is awaiting final activation by an admin.");
        }
        if (user.status === "suspended") {
          throw new Error("Your account has been suspended. Please contact a fellowship administrator for assistance.");
        }
        if (user.status !== "active") {
          throw new Error("Your account is not yet active. Please contact your church leader.");
        }

        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          churchId: user.churchId?.toString() || "",
          profilePhoto: user.profilePhoto || "",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.churchId = user.churchId;
        token.profilePhoto = user.profilePhoto;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.profilePhoto !== undefined) token.profilePhoto = session.profilePhoto;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id || "";
        session.user.role = (token.role || "member") as Role;
        session.user.status = token.status || "";
        session.user.churchId = token.churchId || "";
        session.user.profilePhoto = token.profilePhoto || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "yabbok-super-secret-key-12345",
};
