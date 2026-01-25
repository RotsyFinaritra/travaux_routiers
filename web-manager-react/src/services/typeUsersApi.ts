import { apiFetch, ApiError } from "../lib/apiClient";

export type TypeUserDto = {
  id: number;
  name: string;
};

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.payload === "string" && error.payload.trim()) return error.payload;
    if (error.payload && typeof error.payload === "object") {
      const maybe = error.payload as { message?: unknown; error?: unknown };
      if (typeof maybe.message === "string" && maybe.message.trim()) return maybe.message;
      if (typeof maybe.error === "string" && maybe.error.trim()) return maybe.error;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : "Erreur inconnue";
}

export async function listTypeUsers(): Promise<
  | { success: true; types: TypeUserDto[] }
  | { success: false; message: string }
> {
  try {
    const types = await apiFetch<TypeUserDto[]>("/type-users", { method: "GET" });
    return { success: true, types };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}
