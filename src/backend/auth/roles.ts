export const ROLES = [
  "visitor",
  "member",
  "youth_leader",
  "church_leader",
  "moderator",
  "admin",
  "super_admin",
] as const;

export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["pending", "verified_by_leader", "active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const APPROVAL_STATUSES = ["pending", "approved", "rejected", "archived"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const PERMISSIONS = [
  "analytics:view",
  "announcement:create",
  "church:create",
  "church:update:any",
  "church:update:own",
  "church:verify",
  "content:moderate",
  "content:report:view",
  "event:create:any",
  "event:create:own",
  "event:rsvp:view",
  "media:manage",
  "notification:send",
  "settings:update",
  "user:approve",
  "user:assign-role",
  "user:manage:any",
  "user:manage:church",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const rolePermissions: Record<Role, Permission[]> = {
  visitor: [],
  member: [],
  youth_leader: ["event:create:own", "announcement:create"],
  church_leader: [
    "analytics:view",
    "announcement:create",
    "church:update:own",
    "content:moderate",
    "event:create:own",
    "event:rsvp:view",
    "media:manage",
    "user:manage:church",
  ],
  moderator: [
    "analytics:view",
    "announcement:create",
    "content:moderate",
    "content:report:view",
    "event:rsvp:view",
    "media:manage",
    "user:approve",
  ],
  admin: [
    "analytics:view",
    "announcement:create",
    "church:create",
    "church:update:any",
    "church:verify",
    "content:moderate",
    "content:report:view",
    "event:create:any",
    "event:rsvp:view",
    "media:manage",
    "notification:send",
    "settings:update",
    "user:approve",
    "user:manage:any",
  ],
  super_admin: [...PERMISSIONS],
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ROLES.includes(value as Role);
}

export function isUserStatus(value: unknown): value is UserStatus {
  return typeof value === "string" && USER_STATUSES.includes(value as UserStatus);
}

export function isApprovalStatus(value: unknown): value is ApprovalStatus {
  return typeof value === "string" && APPROVAL_STATUSES.includes(value as ApprovalStatus);
}

export function hasPermission(role: Role | undefined, permission: Permission) {
  return Boolean(role && rolePermissions[role]?.includes(permission));
}

export function hasAnyPermission(role: Role | undefined, permissions: Permission[]) {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function isPlatformAdmin(role: Role | undefined) {
  return role === "super_admin" || role === "admin" || role === "moderator";
}
