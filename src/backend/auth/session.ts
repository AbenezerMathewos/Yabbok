import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/backend/lib/auth";
import { hasAnyPermission, hasPermission, Permission, Role } from "@/backend/auth/roles";

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  status?: string;
  churchId?: string;
  profilePhoto?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as Partial<AuthUser> | undefined;

  if (!user?.id || !user.role) {
    return null;
  }

  return user as AuthUser;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError("Unauthorized", 401);
  }

  if (user.status && user.status !== "active") {
    throw new ApiError("Account is not active", 403);
  }

  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireUser();

  if (!hasPermission(user.role, permission)) {
    throw new ApiError("Forbidden", 403);
  }

  return user;
}

export async function requireAnyPermission(permissions: Permission[]) {
  const user = await requireUser();

  if (!hasAnyPermission(user.role, permissions)) {
    throw new ApiError("Forbidden", 403);
  }

  return user;
}

export function handleApiError(error: unknown, fallback = "Internal Server Error") {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export function canManageChurchScopedResource(
  user: AuthUser,
  resourceChurchId: string | undefined | null,
  globalPermission: Permission
) {
  if (hasPermission(user.role, globalPermission)) {
    return true;
  }

  return Boolean(user.churchId && resourceChurchId && user.churchId === resourceChurchId);
}
