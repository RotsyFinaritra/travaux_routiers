import { apiFetch, ApiError } from '@/lib/apiClient';

export type MinimalUserDto = {
  id: number;
  username?: string;
  email?: string;
};

export type MinimalStatusDto = {
  id: number;
  name: string;
  description?: string | null;
};

export type MinimalEntrepriseDto = {
  id: number;
  name: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
};

export type MinimalValidationStatusDto = {
  id: number;
  name: string;
  description?: string | null;
};

export type MinimalValidationDto = {
  id: number;
  status: MinimalValidationStatusDto;
  validatedAt?: string | null;
  note?: string | null;
};

export type SignalementDto = {
  id: number;
  user: MinimalUserDto;
  status: MinimalStatusDto;
  entreprise?: MinimalEntrepriseDto | null;
  validation?: MinimalValidationDto | null;
  latitude: number;
  longitude: number;
  description: string;
  dateSignalement?: string;
  surfaceArea?: number | null;
  budget?: number | null;
  photoUrls?: string[] | null; // Changement : tableau pour multiples photos
};

export type CreateSignalementInput = {
  userId: number;
  statusId: number;
  entrepriseId?: number | null;
  latitude: number;
  longitude: number;
  description: string;
  surfaceArea?: number | null;
  budget?: number | null;
  photoUrls?: string[] | null; // Changement : tableau
};

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.payload === 'string' && error.payload.trim()) return error.payload;
    if (error.payload && typeof error.payload === 'object') {
      const maybe = error.payload as { message?: unknown; error?: unknown };
      if (typeof maybe.message === 'string' && maybe.message.trim()) return maybe.message;
      if (typeof maybe.error === 'string' && maybe.error.trim()) return maybe.error;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'Erreur inconnue';
}

export async function listSignalements(): Promise<
  { success: true; signalements: SignalementDto[] } | { success: false; message: string }
> {
  try {
    const signalements = await apiFetch<SignalementDto[]>('/signalements', { method: 'GET' });
    return { success: true, signalements };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}

export async function createSignalement(
  input: CreateSignalementInput,
): Promise<{ success: true; signalement: SignalementDto } | { success: false; message: string }> {
  try {
    const signalement = await apiFetch<SignalementDto>('/signalements', {
      method: 'POST',
      data: {
        user: { id: input.userId },
        status: { id: input.statusId },
        entreprise: input.entrepriseId ? { id: input.entrepriseId } : null,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description,
        surfaceArea: input.surfaceArea ?? null,
        budget: input.budget ?? null,
        photoUrls: input.photoUrls ?? null, // Changement : tableau
      },
    });
    return { success: true, signalement };
  } catch (error) {
    return { success: false, message: messageFromError(error) };
  }
}