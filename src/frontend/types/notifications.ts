export interface NotificationDto {
  _id: string;
  title: string;
  message: string;
  type: "message" | "announcement" | "event" | "prayer" | "comment" | "reaction" | "sermon" | "approval" | "system";
  referenceId?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
}
