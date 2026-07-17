import { ApprovalStatus, PopulatedChurchRef, PopulatedUserRef } from "@/frontend/types/common";

export type GalleryCategory = "worship" | "conference" | "education" | "outreach";

export interface GalleryItemDto {
  _id: string;
  title: string;
  description: string;
  category: GalleryCategory;
  imageUrl: string;
  uploadedBy?: PopulatedUserRef;
  churchId?: PopulatedChurchRef;
  approvalStatus: ApprovalStatus;
  moderationNote?: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGalleryItemInput {
  title: string;
  description?: string;
  category: GalleryCategory;
  imageUrl: string;
  churchId?: string;
  date?: string;
}

export interface SermonDto {
  _id: string;
  title: string;
  speaker: string;
  date: string;
  description: string;
  audioUrl?: string;
  videoUrl?: string;
  notes?: string;
  category?: string;
  uploadedBy?: PopulatedUserRef;
  churchId?: PopulatedChurchRef;
  approvalStatus: ApprovalStatus;
  moderationNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSermonInput {
  title: string;
  speaker: string;
  date: string;
  description: string;
  audioUrl?: string;
  videoUrl?: string;
  notes?: string;
  category?: string;
  churchId?: string;
}

export interface BookDto {
  _id: string;
  title: string;
  author?: string;
  description: string;
  coverUrl?: string;
  pdfUrl?: string;
  category?: string;
  uploadedBy?: PopulatedUserRef;
  churchId?: PopulatedChurchRef;
  approvalStatus: ApprovalStatus;
  moderationNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookInput {
  title: string;
  author?: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  category?: string;
  churchId?: string;
}

export interface AudioMessageDto {
  _id: string;
  title: string;
  speaker?: string;
  description: string;
  audioUrl: string;
  category?: string;
  uploadedBy?: PopulatedUserRef;
  churchId?: PopulatedChurchRef;
  approvalStatus: ApprovalStatus;
  moderationNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAudioMessageInput {
  title: string;
  speaker?: string;
  description?: string;
  audioUrl: string;
  category?: string;
  churchId?: string;
}
