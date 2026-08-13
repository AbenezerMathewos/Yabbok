export type ApprovalStatus = "pending" | "approved" | "rejected" | "archived";

export interface PopulatedUserRef {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
  churchBranch?: string;
}

export interface PopulatedChurchRef {
  _id: string;
  name: string;
  city?: string;
  region?: string;
}
