import { ApprovalStatus, PopulatedUserRef } from "@/frontend/types/common";

export interface AdminStatsDto {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalChurches: number;
  totalEvents: number;
  totalPrayers: number;
  totalTestimonies: number;
  totalSuggestions: number;
  totalDiscussions?: number;
  pendingContent: number;
  openReports: number;
  totalAnnouncements: number;
}

export interface AdminUserDto {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  churchBranch?: string;
  createdAt?: string;
}

export interface ModerationEntryDto {
  type: "prayers" | "testimonies" | "discussions" | "gallery" | "sermons" | "events";
  item: {
    _id: string;
    title?: string;
    category?: string;
    content?: string;
    description?: string;
    location?: string;
    approvalStatus?: ApprovalStatus;
    moderationNote?: string;
    user?: PopulatedUserRef;
    uploadedBy?: PopulatedUserRef;
    organizer?: PopulatedUserRef;
  };
}

export interface ReportDto {
  _id: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  reason?: string;
  details?: string;
  createdAt?: string;
}

export interface AnnouncementDto {
  _id: string;
  title: string;
  message: string;
  audience: string;
  createdBy?: PopulatedUserRef;
  createdAt: string;
}

export interface AuditLogDto {
  _id: string;
  actor?: PopulatedUserRef;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
