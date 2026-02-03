import { apiFetch } from "../lib/apiClient";

// Interface pour les statistiques de statut
export interface StatusStatistic {
  statusName: string;
  count: number;
  totalSurface: number;
  totalBudget: number;
  percentage: number;
}

// Interface pour les statistiques de traitement
export interface TreatmentStatistic {
  signalementId: number;
  description: string;
  dateCreation: string;
  dateDebutTravaux?: string;
  dateFin?: string;
  treatmentDays: number;
  currentStatus: string;
}

// Interface principale pour les statistiques
export interface StatisticsDto {
  totalPoints: number;
  totalSurfaceArea: number;
  totalBudget: number;
  progressPercent: number;
  countNouveau: number;
  countEnCours: number;
  countTermine: number;
  statusStats: StatusStatistic[];
  treatmentStats: TreatmentStatistic[];
  averageTreatmentDays: number;
}

// Fonction pour récupérer les statistiques globales
export const getGlobalStatistics = async (): Promise<StatisticsDto> => {
  console.log("🌐 Appel API: /statistics/global");
  
  // Timeout de 10 secondes
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Timeout: L'API n'a pas répondu dans les 10 secondes")), 10000);
  });
  
  try {
    const resultPromise = apiFetch<StatisticsDto>("/statistics/global");
    const result = await Promise.race([resultPromise, timeoutPromise]);
    console.log("📊 Données reçues:", result);
    return result;
  } catch (error) {
    console.error("🚫 Erreur API statistiques:", error);
    
    // Retourner des données par défaut en cas d'erreur
    console.warn("⚠️ Retour de données par défaut");
    return {
      totalPoints: 0,
      totalSurfaceArea: 0,
      totalBudget: 0,
      progressPercent: 0,
      countNouveau: 0,
      countEnCours: 0,
      countTermine: 0,
      statusStats: [],
      treatmentStats: [],
      averageTreatmentDays: 0
    };
  }
};

// Fonction de test pour vérifier la connectivité
export const testApiConnectivity = async (): Promise<boolean> => {
  try {
    console.log("🧪 Test de connectivité API...");
    const response = await fetch("/api/statistics/test");
    const isOk = response.ok;
    console.log(isOk ? "✅ API accessible" : "❌ API inaccessible");
    return isOk;
  } catch (error) {
    console.error("❌ Erreur de connectivité:", error);
    return false;
  }
};