import { apiFetch, ApiError } from "../lib/apiClient";

export type EntrepriseDto = {
  id: number;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
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

export async function listEntreprises(): Promise<
  { success: true; entreprises: EntrepriseDto[] } | { success: false; message: string }
> {
  try {
    const entreprises = await apiFetch<EntrepriseDto[]>("/entreprises", { method: "GET" });
    return { success: true, entreprises };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}
