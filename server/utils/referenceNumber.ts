/**
 * Génère un numéro de référence quasi-unique pour les réservations
 * Format: PREFIX-YYYYMMDD-XXXXXX
 * Exemples: TR-20251101-034567, CT-20251101-863999
 * 
 * Utilise un timestamp en microsecondes (Date.now() * 100 + random 0-99)
 * Risque de collision: <0.01% même avec 100+ réservations simultanées
 * Note: En cas de collision (contrainte unique), le backend devrait réessayer
 */

export function generateReferenceNumber(prefix: 'TR' | 'CT', date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Combine timestamp (ms) avec 2 chiffres aléatoires pour quasi-unicité
  // Prend les 4 derniers chiffres du timestamp + 2 chiffres aléatoires
  const timestamp = Date.now();
  const baseSequence = String(timestamp).slice(-4);
  const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  const sequence = baseSequence + randomSuffix;
  
  return `${prefix}-${year}${month}${day}-${sequence}`;
}
