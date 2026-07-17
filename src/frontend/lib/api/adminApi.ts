import { requestJson, toQueryString } from "@/frontend/lib/api/client";
import {
  AdminStatsDto,
  AdminUserDto,
  AnnouncementDto,
  AuditLogDto,
  ModerationEntryDto,
  ReportDto,
} from "@/frontend/types/admin";
import { ApprovalStatus } from "@/frontend/types/common";

export function fetchAdminStats() {
  return requestJson<AdminStatsDto>("/api/admin/stats");
}

export function fetchAdminUsers() {
  return requestJson<AdminUserDto[]>("/api/admin/users");
}

export function updateAdminUser(userId: string, input: { role?: string; status?: string; suspensionReason?: string }) {
  return requestJson<AdminUserDto>("/api/admin/users", {
    method: "PUT",
    body: JSON.stringify({ userId, ...input }),
  });
}

export function fetchModerationQueue(options: { status?: ApprovalStatus; type?: string } = {}) {
  return requestJson<ModerationEntryDto[]>(`/api/admin/moderation${toQueryString(options)}`);
}

export function moderateContent(input: {
  type: string;
  id: string;
  status: ApprovalStatus;
  note?: string;
}) {
  return requestJson<unknown>("/api/admin/moderation", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function fetchReports() {
  return requestJson<ReportDto[]>("/api/admin/reports");
}

export function updateReport(reportId: string, status: string, resolutionNote = "") {
  return requestJson<ReportDto>("/api/admin/reports", {
    method: "PATCH",
    body: JSON.stringify({ reportId, status, resolutionNote }),
  });
}

export function fetchAnnouncements() {
  return requestJson<AnnouncementDto[]>("/api/admin/announcements");
}

export function sendAnnouncement(input: {
  title: string;
  message: string;
  audience: string;
  role?: string;
  churchId?: string;
  userId?: string;
}) {
  return requestJson<{ announcement: AnnouncementDto; recipientCount: number }>("/api/admin/announcements", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchAuditLogs() {
  return requestJson<AuditLogDto[]>("/api/admin/logs");
}
