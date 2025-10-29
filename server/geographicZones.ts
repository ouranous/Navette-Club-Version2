/**
 * Service de gestion des zones géographiques en Tunisie
 * Permet de déterminer la zone géographique d'une adresse
 */

export type GeographicZone =
  | "Tunis et Nord"
  | "Sousse et Sahel"
  | "Djerba et Sud"
  | "Tozeur et Désert"
  | "Sfax"
  | "Kairouan"
  | "Monastir et Mahdia";

/**
 * Mapping des villes/régions tunisiennes vers les zones géographiques
 */
const CITY_TO_ZONE_MAP: Record<string, GeographicZone> = {
  // Tunis et Nord
  "tunis": "Tunis et Nord",
  "carthage": "Tunis et Nord",
  "la marsa": "Tunis et Nord",
  "sidi bou said": "Tunis et Nord",
  "ariana": "Tunis et Nord",
  "ben arous": "Tunis et Nord",
  "manouba": "Tunis et Nord",
  "bizerte": "Tunis et Nord",
  "nabeul": "Tunis et Nord",
  "hammamet": "Tunis et Nord",
  "tunis-carthage": "Tunis et Nord",
  "enfidha": "Sousse et Sahel", // Aéroport Enfidha - zone Sousse

  // Sousse et Sahel
  "sousse": "Sousse et Sahel",
  "monastir": "Monastir et Mahdia",
  "mahdia": "Monastir et Mahdia",
  "port el kantaoui": "Sousse et Sahel",

  // Sfax
  "sfax": "Sfax",

  // Kairouan
  "kairouan": "Kairouan",

  // Djerba et Sud
  "djerba": "Djerba et Sud",
  "zarzis": "Djerba et Sud",
  "houmt souk": "Djerba et Sud",
  "midoun": "Djerba et Sud",
  "medenine": "Djerba et Sud",
  "gabès": "Djerba et Sud",
  "gabes": "Djerba et Sud",
  "tataouine": "Djerba et Sud",

  // Tozeur et Désert
  "tozeur": "Tozeur et Désert",
  "nefta": "Tozeur et Désert",
  "douz": "Tozeur et Désert",
  "kebili": "Tozeur et Désert",
  "gafsa": "Tozeur et Désert",
};

/**
 * Mots-clés pour identifier les zones dans les adresses
 */
const ZONE_KEYWORDS: Record<GeographicZone, string[]> = {
  "Tunis et Nord": ["tunis", "carthage", "ariana", "bizerte", "nabeul", "hammamet", "la marsa"],
  "Sousse et Sahel": ["sousse", "port el kantaoui", "enfidha"],
  "Monastir et Mahdia": ["monastir", "mahdia"],
  "Sfax": ["sfax"],
  "Kairouan": ["kairouan"],
  "Djerba et Sud": ["djerba", "zarzis", "houmt", "midoun", "medenine", "gabès", "gabes", "tataouine"],
  "Tozeur et Désert": ["tozeur", "nefta", "douz", "kebili", "gafsa", "désert", "desert"],
};

/**
 * Normalise une chaîne de caractères pour faciliter la comparaison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .trim();
}

/**
 * Détermine la zone géographique d'une adresse
 * @param address - Adresse complète (ex: "Aéroport Djerba Zarzis, Djerba, Tunisia")
 * @returns Zone géographique ou null si non identifiée
 */
export function getGeographicZone(address: string): GeographicZone | null {
  if (!address) return null;

  const normalizedAddress = normalizeString(address);

  // Vérifier d'abord les correspondances exactes de villes
  for (const [city, zone] of Object.entries(CITY_TO_ZONE_MAP)) {
    const normalizedCity = normalizeString(city);
    if (normalizedAddress.includes(normalizedCity)) {
      return zone;
    }
  }

  // Vérifier les mots-clés de zones
  for (const [zone, keywords] of Object.entries(ZONE_KEYWORDS) as [GeographicZone, string[]][]) {
    for (const keyword of keywords) {
      if (normalizedAddress.includes(normalizeString(keyword))) {
        return zone;
      }
    }
  }

  // Par défaut, si contient "aéroport" ou "airport", essayer de deviner
  if (normalizedAddress.includes("aeroport") || normalizedAddress.includes("airport")) {
    if (normalizedAddress.includes("tunis")) return "Tunis et Nord";
    if (normalizedAddress.includes("enfidha")) return "Sousse et Sahel";
    if (normalizedAddress.includes("djerba")) return "Djerba et Sud";
    if (normalizedAddress.includes("tozeur")) return "Tozeur et Désert";
    if (normalizedAddress.includes("sfax")) return "Sfax";
    if (normalizedAddress.includes("monastir")) return "Monastir et Mahdia";
  }

  return null;
}

/**
 * Vérifie si un transporteur dessert une zone donnée
 * @param providerZones - Zones desservies par le transporteur
 * @param targetZone - Zone cible
 * @returns true si le transporteur dessert la zone
 */
export function providerServesZone(
  providerZones: string[] | null | undefined,
  targetZone: GeographicZone | null
): boolean {
  if (!providerZones || providerZones.length === 0) {
    // Si aucune zone n'est spécifiée, le transporteur dessert toutes les zones
    return true;
  }

  if (!targetZone) {
    // Si la zone cible n'est pas identifiée, on accepte le transporteur
    return true;
  }

  return providerZones.includes(targetZone);
}

/**
 * Calcule un score de pertinence pour un transporteur par rapport à un trajet
 * @param providerZones - Zones desservies par le transporteur
 * @param originZone - Zone d'origine
 * @param destinationZone - Zone de destination
 * @returns Score de 0 à 2 (2 = meilleur match)
 */
export function calculateProviderRelevanceScore(
  providerZones: string[] | null | undefined,
  originZone: GeographicZone | null,
  destinationZone: GeographicZone | null
): number {
  if (!providerZones || providerZones.length === 0) {
    // Transporteur sans restriction de zone = score moyen
    return 1;
  }

  let score = 0;

  // +1 si dessert l'origine
  if (originZone && providerZones.includes(originZone)) {
    score += 1;
  }

  // +1 si dessert la destination
  if (destinationZone && providerZones.includes(destinationZone)) {
    score += 1;
  }

  return score;
}

/**
 * Filtre les véhicules par zones géographiques et retourne ceux qui sont pertinents
 * avec un tri par pertinence et prix
 */
export function filterAndSortVehiclesByZones<
  T extends { providerId: string; price: number }
>(
  vehicles: T[],
  providersMap: Map<string, { serviceZones: string[] | null }>,
  originZone: GeographicZone | null,
  destinationZone: GeographicZone | null
): T[] {
  // Calculer le score de pertinence pour chaque véhicule
  const vehiclesWithScores = vehicles.map((vehicle) => {
    const provider = providersMap.get(vehicle.providerId);
    const score = calculateProviderRelevanceScore(
      provider?.serviceZones,
      originZone,
      destinationZone
    );
    return { vehicle, score };
  });

  // Filtrer les véhicules non pertinents (score 0)
  const relevantVehicles = vehiclesWithScores.filter((item) => item.score > 0);

  // Trier par score (desc) puis par prix (asc)
  relevantVehicles.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score; // Score plus élevé d'abord
    }
    return a.vehicle.price - b.vehicle.price; // Puis prix plus bas
  });

  return relevantVehicles.map((item) => item.vehicle);
}
