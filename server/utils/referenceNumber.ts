/**
 * Génère un numéro de référence unique pour les réservations
 * Format: PREFIX-YYYYMMDD-XXX
 * Exemples: TR-20251101-001, CT-20251101-042
 */

export function generateReferenceNumber(prefix: 'TR' | 'CT', date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Génère un nombre aléatoire entre 001 et 999 pour éviter les collisions
  // En production, on pourrait utiliser un compteur en base de données
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  const sequence = String(randomNumber).padStart(3, '0');
  
  return `${prefix}-${year}${month}${day}-${sequence}`;
}
