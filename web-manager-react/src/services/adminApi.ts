import { apiFetch, ApiError } from "../lib/apiClient";

export type CreateUserRole = "USER" | "MANAGER";

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  role: CreateUserRole;
};

export type CreateUserResponse = {
  success: boolean;
  message?: string;
  userId?: number;
  firebaseUid?: string;
  username?: string;
  email?: string;
  typeName?: string;
};

export type UnblockUserResponse = {
  success: boolean;
  message?: string;
  userId?: number;
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

function getAdminApiKey(): string | null {
  const raw = import.meta.env.VITE_ADMIN_API_KEY as string | undefined;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : null;
}

export async function adminCreateUser(input: CreateUserInput): Promise<CreateUserResponse> {
  const adminKey = getAdminApiKey();
  if (!adminKey) {
    return { success: false, message: "VITE_ADMIN_API_KEY manquant (fichier .env)" };
  }

  try {
    return await apiFetch<CreateUserResponse>("/admin/users", {
      method: "POST",
      headers: {
        "X-ADMIN-KEY": adminKey,
      },
      data: input,
    });
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}

export async function adminUnblockUser(userId: number): Promise<UnblockUserResponse> {
  const adminKey = getAdminApiKey();
  if (!adminKey) {
    return { success: false, message: "VITE_ADMIN_API_KEY manquant (fichier .env)" };
  }

  try {
    return await apiFetch<UnblockUserResponse>(`/admin/users/${userId}/unblock`, {
      method: "POST",
      headers: {
        "X-ADMIN-KEY": adminKey,
      },
    });
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}
