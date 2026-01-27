import { apiFetch, ApiError } from "../lib/apiClient";

export type EntrepriseDto = {
  id: number;
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
};

export type CreateEntrepriseInput = {
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
};

export type UpdateEntrepriseInput = CreateEntrepriseInput;

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

export async function getEntreprise(id: number): Promise<
  { success: true; entreprise: EntrepriseDto } | { success: false; message: string }
> {
  try {
    const entreprise = await apiFetch<EntrepriseDto>(`/entreprises/${id}`, { method: "GET" });
    return { success: true, entreprise };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}

export async function createEntreprise(input: CreateEntrepriseInput): Promise<
  { success: true; entreprise: EntrepriseDto } | { success: false; message: string }
> {
  try {
    const entreprise = await apiFetch<EntrepriseDto>("/entreprises", {
      method: "POST",
      data: input,
    });
    return { success: true, entreprise };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}

export async function updateEntreprise(id: number, input: UpdateEntrepriseInput): Promise<
  { success: true; entreprise: EntrepriseDto } | { success: false; message: string }
> {
  try {
    const entreprise = await apiFetch<EntrepriseDto>(`/entreprises/${id}`, {
      method: "PUT",
      data: input,
    });
    return { success: true, entreprise };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}

export async function deleteEntreprise(id: number): Promise<
  { success: true } | { success: false; message: string }
> {
  try {
    await apiFetch<void>(`/entreprises/${id}`, { method: "DELETE" });
    return { success: true };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}
