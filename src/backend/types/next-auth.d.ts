import { Role } from "@/backend/auth/roles";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    status: string;
    churchId: string;
    profilePhoto: string;
  }

  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      status: string;
      churchId: string;
      profilePhoto: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    status?: string;
    churchId?: string;
    profilePhoto?: string;
  }
}
