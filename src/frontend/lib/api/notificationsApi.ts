import { requestJson } from "@/frontend/lib/api/client";
import { NotificationDto } from "@/frontend/types/notifications";

export function fetchNotifications() {
  return requestJson<NotificationDto[]>("/api/notifications");
}

export function setNotificationRead(notificationId: string, read = true) {
  return requestJson<NotificationDto>("/api/notifications", {
    method: "PATCH",
    body: JSON.stringify({ notificationId, read }),
  });
}
