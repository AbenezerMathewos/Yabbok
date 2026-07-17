import { requestJson, toQueryString } from "@/frontend/lib/api/client";
import { ChurchDto, ChurchInput } from "@/frontend/types/churches";

export function fetchChurches(options: { includeAll?: boolean } = {}) {
  return requestJson<ChurchDto[]>(`/api/churches${toQueryString(options)}`);
}

export function createChurch(input: ChurchInput) {
  return requestJson<ChurchDto>("/api/churches", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateChurch(churchId: string, input: ChurchInput) {
  return requestJson<ChurchDto>("/api/churches", {
    method: "PATCH",
    body: JSON.stringify({ churchId, ...input }),
  });
}

export function approveChurchChange(churchId: string) {
  return requestJson<ChurchDto>("/api/churches", {
    method: "PATCH",
    body: JSON.stringify({ churchId, action: "approve" }),
  });
}

export function rejectChurchChange(churchId: string) {
  return requestJson<ChurchDto>("/api/churches", {
    method: "PATCH",
    body: JSON.stringify({ churchId, action: "reject" }),
  });
}

export function deleteChurch(churchId: string) {
  return requestJson<ChurchDto>("/api/churches", {
    method: "DELETE",
    body: JSON.stringify({ churchId }),
  });
}
