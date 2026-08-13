import { requestJson, toQueryString } from "@/frontend/lib/api/client";
import { BookDto, CreateBookInput } from "@/frontend/types/media";

export function fetchBooks(options: { category?: string } = {}) {
  return requestJson<BookDto[]>(`/api/books${toQueryString(options)}`);
}

export function createBook(input: CreateBookInput) {
  return requestJson<BookDto>("/api/books", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
