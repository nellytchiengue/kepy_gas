/**
 * @file 01_Utils.gs
 * @description Fonctions utilitaires générales (formatage, nettoyage, etc.).
 */

// ============================================================================
// KEPY - UTILITAIRES
// ============================================================================

/**
 * Nettoie une chaîne de caractères (trim + gestion null/undefined)
 * @param {*} value - Valeur à nettoyer
 * @returns {string} Chaîne nettoyée
 */
function cleanString_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * Parse un nombre depuis une valeur (gère les formats avec espaces, virgules, etc.)
 * @param {*} value - Valeur à parser
 * @returns {number} Nombre parsé (0 si invalide)
 */
function parseNumber_(value) {
  if (value === null || value === undefined || value === '') return 0;
  
  // Si déjà un nombre
  if (typeof value === 'number') return value;
  
  // Nettoie la chaîne
  let str = String(value)
    .replace(/\s/g, '')      // Supprime les espaces
    .replace(/,/g, '.')      // Remplace virgules par points
    .replace(/[^\d.-]/g, ''); // Garde uniquement chiffres, point, moins
  
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Retourne le timestamp actuel formaté
 * @returns {string} Timestamp au format "YYYY-MM-DD HH:mm:ss"
 */
function getCurrentTimestamp_() {
  return Utilities.formatDate(
    new Date(), 
    Session.getScriptTimeZone(), 
    'yyyy-MM-dd HH:mm:ss'
  );
}

/**
 * Retourne la date actuelle formatée
 * @returns {string} Date au format "YYYY-MM-DD"
 */
function getCurrentDate_() {
  return Utilities.formatDate(
    new Date(), 
    Session.getScriptTimeZone(), 
    'yyyy-MM-dd'
  );
}

/**
 * Formate une date en chaîne lisible
 * @param {Date|string} date - Date à formater
 * @param {string} format - Format souhaité (défaut: 'yyyy-MM-dd')
 * @returns {string} Date formatée
 */
function formatDate_(date, format = 'yyyy-MM-dd') {
  if (!date) return '';
  
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  return Utilities.formatDate(d, Session.getScriptTimeZone(), format);
}

/**
 * Génère un UUID unique
 * @returns {string} UUID
 */
function generateUUID_() {
  return Utilities.getUuid();
}

/**
 * Vérifie si une valeur est vide (null, undefined, chaîne vide)
 * @param {*} value - Valeur à vérifier
 * @returns {boolean} true si vide
 */
function isEmpty_(value) {
  return value === null || value === undefined || cleanString_(value) === '';
}

/**
 * Capitalise la première lettre d'une chaîne
 * @param {string} str - Chaîne à capitaliser
 * @returns {string} Chaîne capitalisée
 */
function capitalize_(str) {
  str = cleanString_(str);
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formate un montant avec séparateur de milliers
 * @param {number} amount - Montant à formater
 * @param {string} currency - Code devise (défaut: 'XAF')
 * @returns {string} Montant formaté (ex: "1 234 567 XAF")
 */
function formatAmount_(amount, currency = 'XAF') {
  const num = parseNumber_(amount);
  const formatted = num.toLocaleString('fr-FR');
  return `${formatted} ${currency}`;
}

/**
 * Calcule un hash SHA-256 encodé en base64
 * @param {string} input - Chaîne à hasher
 * @returns {string} Hash encodé
 */
function hashString_(input) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    input
  );
  return Utilities.base64EncodeWebSafe(digest);
}

/**
 * Log avec timestamp
 * @param {string} message - Message à logger
 * @param {string} level - Niveau (INFO, WARN, ERROR)
 */
function log_(message, level = 'INFO') {
  const timestamp = getCurrentTimestamp_();
  Logger.log(`[${timestamp}] [${level}] ${message}`);
}

