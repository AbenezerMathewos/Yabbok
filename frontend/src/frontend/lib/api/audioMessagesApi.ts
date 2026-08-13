import { requestJson, toQueryString } from "@/frontend/lib/api/client";
import { AudioMessageDto, CreateAudioMessageInput } from "@/frontend/types/media";

export function fetchAudioMessages(options: { category?: string } = {}) {
  return requestJson<AudioMessageDto[]>(`/api/audio-messages${toQueryString(options)}`);
}

export function createAudioMessage(input: CreateAudioMessageInput) {
  return requestJson<AudioMessageDto>("/api/audio-messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
