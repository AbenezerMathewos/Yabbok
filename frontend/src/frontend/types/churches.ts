import { PopulatedUserRef } from "@/frontend/types/common";

export type ChurchStatus = "pending" | "verified" | "archived";
export type ChurchPendingAction = "create" | "update" | "delete" | null;

export interface ChurchInput {
  name: string;
  city: string;
  region: string;
  description: string;
  leaderId?: string | null;
  memberCount?: number;
}

export interface ChurchDto extends ChurchInput {
  _id: string;
  memberCount: number;
  status: ChurchStatus;
  pendingAction?: ChurchPendingAction;
  pendingChanges?: Partial<ChurchInput> | null;
  submittedBy?: PopulatedUserRef;
  submittedAt?: string;
  verifiedBy?: PopulatedUserRef;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
