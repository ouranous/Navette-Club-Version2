import { storage } from "./storage";
import type { VehicleSeasonalPrice, VehicleHourlyPrice } from "@shared/schema";

export interface SeasonalPriceResult {
  pricePerKm?: number;
  pricePerHour?: number;
  season: string;
  validFrom: Date;
  validTo: Date;
}

/**
 * Détermine la saison active pour une date donnée parmi les prix disponibles
 * @param prices Liste des prix saisonniers (km ou horaires)
 * @param date Date pour laquelle trouver la saison (défaut: aujourd'hui)
 * @returns Prix saisonnier actif ou undefined si aucune saison active
 */
function findActiveSeason<T extends { seasonName: string; startDate: string; endDate: string }>(
  prices: T[],
  date: Date = new Date()
): T | undefined {
  const requestYear = date.getFullYear();
  
  return prices.find((price) => {
    // Compose full dates: startDate/endDate are "MM-DD" format (e.g., "06-01", "08-31")
    const validFromStr = `${requestYear}-${price.startDate}`;
    const validToStr = `${requestYear}-${price.endDate}`;
    
    const validFrom = new Date(validFromStr);
    const validTo = new Date(validToStr);
    
    // Handle seasons that wrap around year-end (e.g., Dec 1 - Feb 28)
    if (validTo < validFrom) {
      // Season spans year boundary (e.g., 12-01 to 02-28)
      // Date must be either:
      // 1. In late current year: date >= validFrom (e.g., Dec 15, 2025 >= Dec 1, 2025)
      // 2. In early next year: date <= validTo (e.g., Jan 15, 2025 <= Feb 28, 2025)
      const isInLateSeason = date >= validFrom;
      const isInEarlySeason = date <= validTo;
      
      return isInLateSeason || isInEarlySeason;
    }
    
    // Normal season within same year
    return date >= validFrom && date <= validTo;
  });
}

/**
 * Helper pour construire les dates de retour avec année complète
 * Gère correctement les saisons qui traversent l'année (wrap-around)
 */
function buildSeasonDates(
  seasonName: string,
  startDate: string,
  endDate: string,
  requestDate: Date
): { validFrom: Date; validTo: Date } {
  const requestYear = requestDate.getFullYear();
  const validFromCurrentYear = new Date(`${requestYear}-${startDate}`);
  const validToCurrentYear = new Date(`${requestYear}-${endDate}`);
  
  // Check if season wraps around year-end (e.g., Dec 1 - Feb 28)
  if (validToCurrentYear < validFromCurrentYear) {
    // Determine which year-pair the request date falls into
    // If request date is in "early season" (Jan-Feb), validFrom is in prior year
    // If request date is in "late season" (Dec), validFrom is in current year
    
    if (requestDate <= validToCurrentYear) {
      // Request is in early part of season (e.g., Jan 15)
      // validFrom is in PRIOR year, validTo is in current year
      return {
        validFrom: new Date(`${requestYear - 1}-${startDate}`),
        validTo: validToCurrentYear,
      };
    } else {
      // Request is in late part of season (e.g., Dec 15)
      // validFrom is in current year, validTo is in NEXT year
      return {
        validFrom: validFromCurrentYear,
        validTo: new Date(`${requestYear + 1}-${endDate}`),
      };
    }
  }
  
  // Normal season within same year (e.g., Jun 1 - Aug 31)
  return {
    validFrom: validFromCurrentYear,
    validTo: validToCurrentYear,
  };
}

/**
 * Calcule le prix d'un transfer (prix au kilomètre) pour une date donnée
 * @param vehicleId ID du véhicule
 * @param date Date du transfer (défaut: aujourd'hui)
 * @returns Prix au km et informations de saison, ou null si aucun prix trouvé
 */
export async function calculateSeasonalTransferPrice(
  vehicleId: string,
  date: Date = new Date()
): Promise<SeasonalPriceResult | null> {
  const prices = await storage.getVehicleSeasonalPrices(vehicleId);
  
  if (prices.length === 0) {
    return null;
  }

  const activePrice = findActiveSeason(prices, date);
  
  if (!activePrice) {
    return null;
  }

  const { validFrom, validTo } = buildSeasonDates(
    activePrice.seasonName,
    activePrice.startDate,
    activePrice.endDate,
    date
  );

  return {
    pricePerKm: activePrice.pricePerKm ? parseFloat(activePrice.pricePerKm) : undefined,
    season: activePrice.seasonName,
    validFrom,
    validTo,
  };
}

/**
 * Calcule le prix d'une mise à disposition (prix horaire) pour une date donnée
 * @param vehicleId ID du véhicule
 * @param date Date de la mise à disposition (défaut: aujourd'hui)
 * @returns Prix horaire et informations de saison, ou null si aucun prix trouvé
 */
export async function calculateSeasonalHourlyPrice(
  vehicleId: string,
  date: Date = new Date()
): Promise<SeasonalPriceResult | null> {
  const prices = await storage.getVehicleHourlyPrices(vehicleId);
  
  if (prices.length === 0) {
    return null;
  }

  const activePrice = findActiveSeason(prices, date);
  
  if (!activePrice) {
    return null;
  }

  const { validFrom, validTo } = buildSeasonDates(
    activePrice.seasonName,
    activePrice.startDate,
    activePrice.endDate,
    date
  );

  return {
    pricePerHour: parseFloat(activePrice.pricePerHour),
    season: activePrice.seasonName,
    validFrom,
    validTo,
  };
}

/**
 * Calcule le coût total d'un transfer
 * @param vehicleId ID du véhicule
 * @param distanceKm Distance en kilomètres
 * @param date Date du transfer (défaut: aujourd'hui)
 * @returns Coût total et détails de calcul, ou null si aucun prix trouvé
 */
export async function calculateTransferCost(
  vehicleId: string,
  distanceKm: number,
  date: Date = new Date()
): Promise<{ total: number; pricePerKm: number; distance: number; season: string } | null> {
  const priceInfo = await calculateSeasonalTransferPrice(vehicleId, date);
  
  if (!priceInfo || !priceInfo.pricePerKm) {
    return null;
  }

  return {
    total: priceInfo.pricePerKm * distanceKm,
    pricePerKm: priceInfo.pricePerKm,
    distance: distanceKm,
    season: priceInfo.season,
  };
}

/**
 * Calcule le coût total d'une mise à disposition
 * @param vehicleId ID du véhicule
 * @param hours Nombre d'heures
 * @param date Date de la mise à disposition (défaut: aujourd'hui)
 * @returns Coût total et détails de calcul, ou null si aucun prix trouvé
 */
export async function calculateDisposalCost(
  vehicleId: string,
  hours: number,
  date: Date = new Date()
): Promise<{ total: number; pricePerHour: number; hours: number; season: string } | null> {
  const priceInfo = await calculateSeasonalHourlyPrice(vehicleId, date);
  
  if (!priceInfo || !priceInfo.pricePerHour) {
    return null;
  }

  return {
    total: priceInfo.pricePerHour * hours,
    pricePerHour: priceInfo.pricePerHour,
    hours,
    season: priceInfo.season,
  };
}

/**
 * Récupère tous les prix disponibles pour un véhicule (km et horaires)
 * @param vehicleId ID du véhicule
 * @returns Objets avec les prix au km et horaires
 */
export async function getVehicleAllPrices(vehicleId: string): Promise<{
  seasonalPrices: VehicleSeasonalPrice[];
  hourlyPrices: VehicleHourlyPrice[];
}> {
  const [seasonalPrices, hourlyPrices] = await Promise.all([
    storage.getVehicleSeasonalPrices(vehicleId),
    storage.getVehicleHourlyPrices(vehicleId),
  ]);

  return {
    seasonalPrices,
    hourlyPrices,
  };
}
