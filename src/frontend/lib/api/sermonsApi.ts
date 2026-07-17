import { requestJson } from "@/frontend/lib/api/client";
import { CreateSermonInput, SermonDto } from "@/frontend/types/media";

export function fetchSermons() {
  return requestJson<SermonDto[]>("/api/sermons");
}

export function createSermon(input: CreateSermonInput) {
  return requestJson<SermonDto>("/api/sermons", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
