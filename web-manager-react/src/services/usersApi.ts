import { apiFetch, ApiError } from "../lib/apiClient";

export type UserType = {
  id: number;
  name: string;
};

export type UserDto = {
  id: number;
  username: string;
  email: string;
  typeUser?: UserType;
  loginAttempts?: number;
  isBlocked?: boolean;
  blockedAt?: string | null;
  lastLogin?: string | null;
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

export async function listUsers(): Promise<{ success: true; users: UserDto[] } | { success: false; message: string }> {
  try {
    const users = await apiFetch<UserDto[]>("/users", { method: "GET" });
    return { success: true, users };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}

export async function deleteUser(userId: number): Promise<{ success: true } | { success: false; message: string }> {
  try {
    await apiFetch<void>(`/users/${userId}`, { method: "DELETE" });
    return { success: true };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}
