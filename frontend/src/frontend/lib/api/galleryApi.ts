import { requestJson, toQueryString } from "@/frontend/lib/api/client";
import { CreateGalleryItemInput, GalleryItemDto } from "@/frontend/types/media";

export function fetchGalleryItems(options: { category?: string } = {}) {
  return requestJson<GalleryItemDto[]>(`/api/gallery${toQueryString(options)}`);
}

export function createGalleryItem(input: CreateGalleryItemInput) {
  return requestJson<GalleryItemDto>("/api/gallery", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteGalleryItem(id: string) {
  return requestJson<{ success: true }>("/api/gallery", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}
