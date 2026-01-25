import { apiFetch, ApiError } from "../lib/apiClient";

export type ValidateSignalementInput = {
  signalementId: number;
  statusId: number;
  userId: number;
  note?: string | null;
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

function getAdminKey(): string | undefined {
  const raw = import.meta.env.VITE_ADMIN_API_KEY as string | undefined;
  const v = typeof raw === "string" ? raw.trim() : "";
  return v ? v : undefined;
}

export async function validateSignalement(
  input: ValidateSignalementInput,
): Promise<{ success: true } | { success: false; message: string }> {
  try {
    const adminKey = getAdminKey();
    if (!adminKey) {
      return { success: false, message: "VITE_ADMIN_API_KEY manquant (actions manager non configurées)" };
    }

    await apiFetch(`/signalements/${input.signalementId}/validate`, {
      method: "POST",
      headers: {
        "X-ADMIN-KEY": adminKey,
      },
      data: {
        statusId: input.statusId,
        userId: input.userId,
        note: input.note ?? null,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}
