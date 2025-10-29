/**
 * Google Maps Distance Matrix API Service
 * Calcule automatiquement la distance entre deux points
 */

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      status: string;
      distance?: {
        text: string;
        value: number; // Distance en mètres
      };
      duration?: {
        text: string;
        value: number; // Durée en secondes
      };
    }>;
  }>;
  status: string;
}

interface DistanceResult {
  distanceKm: number;
  distanceText: string;
  durationMinutes: number;
  durationText: string;
}

/**
 * Calcule la distance et la durée entre deux adresses
 * @param origin Adresse de départ
 * @param destination Adresse d'arrivée
 * @returns Distance en km et durée en minutes
 */
export async function calculateDistance(
  origin: string,
  destination: string
): Promise<DistanceResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY non configurée");
    return null;
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.append("origins", origin);
    url.searchParams.append("destinations", destination);
    url.searchParams.append("key", apiKey);
    url.searchParams.append("mode", "driving");
    url.searchParams.append("language", "fr");

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error("Erreur Google Maps API:", response.statusText);
      return null;
    }

    const data: DistanceMatrixResponse = await response.json();

    if (data.status !== "OK") {
      console.error("Erreur Google Maps API status:", data.status);
      console.error("Google Maps response data:", JSON.stringify(data));
      return null;
    }

    const element = data.rows[0]?.elements[0];

    if (!element || element.status !== "OK") {
      console.error("Pas de résultat pour ce trajet");
      return null;
    }

    if (!element.distance || !element.duration) {
      console.error("Données de distance/durée manquantes");
      return null;
    }

    // Convertir mètres en kilomètres
    const distanceKm = element.distance.value / 1000;
    
    // Convertir secondes en minutes
    const durationMinutes = Math.ceil(element.duration.value / 60);

    return {
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      distanceText: element.distance.text,
      durationMinutes,
      durationText: element.duration.text,
    };
  } catch (error) {
    console.error("Erreur lors du calcul de distance:", error);
    return null;
  }
}

/**
 * Calcule le prix d'un transfer pour un véhicule donné
 * @param basePrice Prix de base du véhicule
 * @param pricePerKm Prix par kilomètre du véhicule
 * @param distanceKm Distance du trajet en km
 * @returns Prix total du transfer
 */
export function calculateTransferPrice(
  basePrice: number,
  pricePerKm: number,
  distanceKm: number
): number {
  const total = basePrice + (pricePerKm * distanceKm);
  return parseFloat(total.toFixed(2));
}
