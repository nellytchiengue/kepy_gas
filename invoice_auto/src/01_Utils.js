/**
 * @file 01_Utils.js
 * @description Fonctions utilitaires réutilisables
 * @version 1.0
 * @date 2025-12-11
 */

// ============================================================================
// GESTION DES PARAMÈTRES
// ============================================================================

/**
 * Récupère un paramètre depuis la feuille "Parametres"
 * @param {string} key - La clé du paramètre à récupérer
 * @returns {string|null} La valeur du paramètre ou null si non trouvé
 */
function getParam(key) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const paramSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.PARAMETRES);

    if (!paramSheet) {
      Logger.log('Erreur: Feuille Parametres introuvable');
      return null;
    }

    const data = paramSheet.getDataRange().getValues();

    // Parcourt les lignes pour trouver la clé (colonne A)
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) {
        return data[i][1]; // Retourne la valeur en colonne B
      }
    }

    Logger.log(`Paramètre ${key} non trouvé dans la feuille Parametres`);
    return null;

  } catch (error) {
    Logger.log(`Erreur lors de la récupération du paramètre ${key}: ${error}`);
    return null;
  }
}

/**
 * Récupère tous les paramètres de l'entreprise
 * @returns {Object} Objet contenant toutes les infos de l'entreprise
 */
function getEntrepriseParams() {
  return {
    nom: getParam(INVOICE_CONFIG.PARAM_KEYS.ENTREPRISE_NOM) || 'Entreprise',
    adresse: getParam(INVOICE_CONFIG.PARAM_KEYS.ENTREPRISE_ADRESSE) || 'Adresse non renseignée',
    tel: getParam(INVOICE_CONFIG.PARAM_KEYS.ENTREPRISE_TEL) || 'N/A',
    email: getParam(INVOICE_CONFIG.PARAM_KEYS.ENTREPRISE_EMAIL) || 'N/A'
  };
}

// ============================================================================
// FORMATAGE DE DATES
// ============================================================================

/**
 * Formate une date au format français (JJ/MM/AAAA)
 * @param {Date|string} date - La date à formater
 * @returns {string} Date formatée en français
 */
function formatDate(date) {
  if (!date) {
    return new Date().toLocaleDateString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  }

  try {
    const dateObj = (date instanceof Date) ? date : new Date(date);
    return dateObj.toLocaleDateString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  } catch (error) {
    Logger.log(`Erreur lors du formatage de la date: ${error}`);
    return new Date().toLocaleDateString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  }
}

// ============================================================================
// FORMATAGE DE MONTANTS
// ============================================================================

/**
 * Formate un montant avec le nombre de décimales configuré
 * @param {number} amount - Le montant à formater
 * @returns {string} Montant formaté avec la devise
 */
function formatAmount(amount) {
  const formatted = Number(amount).toFixed(INVOICE_CONFIG.FORMAT.DECIMAL_PLACES);
  return `${formatted} ${INVOICE_CONFIG.FORMAT.CURRENCY}`;
}

// ============================================================================
// CONVERSION NOMBRES EN LETTRES (FRANÇAIS)
// ============================================================================

/**
 * Convertit un nombre en toutes lettres (français)
 * Supporte les montants avec deux décimales (centimes)
 * @param {number} n - Le montant à convertir
 * @returns {string} Le montant en toutes lettres
 */
function nombreEnToutesLettres(n) {
  if (isNaN(n) || n === 0) return "zéro franc CFA";

  const unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizaine = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  const dix = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];

  function numberToWords(num) {
    if (num < 10) return unite[num];
    if (num < 20) return dix[num - 10];
    if (num < 70) {
      if (num % 10 === 0) return dizaine[Math.floor(num / 10)];
      if (num % 10 === 1 && Math.floor(num / 10) !== 7) return dizaine[Math.floor(num / 10)] + '-et-' + unite[1];
      return dizaine[Math.floor(num / 10)] + '-' + unite[num % 10];
    }
    if (num < 80) { // 70-79
      if (num % 10 === 0) return 'soixante-dix';
      return 'soixante-' + dix[num - 70];
    }
    if (num < 100) { // 80-99
      if (num === 80) return 'quatre-vingts';
      if (num % 10 === 0) return dizaine[Math.floor(num / 10)] + (num > 80 ? 't' : '') + unite[num % 10];
      if (num > 80 && num < 90) return 'quatre-vingt-' + dix[num - 80];
      return dizaine[Math.floor(num / 10)] + (num % 10 === 1 && Math.floor(num / 10) !== 7 ? '-et-' : '-') + unite[num % 10];
    }
    if (num < 1000) {
      const cent = (Math.floor(num / 100) === 1) ? 'cent' : unite[Math.floor(num / 100)] + '-cents';
      const reste = num % 100;
      if (reste === 0) return cent.replace(/s$/, '');
      return cent.replace(/s$/, '') + (Math.floor(num / 100) > 1 && reste === 0 ? 's' : '') + ' ' + numberToWords(reste);
    }
    return '';
  }

  // Gérer la partie entière et la partie décimale (Centimes)
  const [fParts, cParts] = String(n).split('.');
  const francs = parseInt(fParts);
  const centimes = cParts ? parseInt(cParts.padEnd(2, '0').slice(0, 2)) : 0;

  let result = '';

  if (francs > 0) {
    if (francs < 1000) {
      result = numberToWords(francs);
    } else if (francs < 1000000) {
      const milliers = Math.floor(francs / 1000);
      const reste = francs % 1000;
      result = (milliers === 1 ? 'mille' : numberToWords(milliers) + '-mille');
      if (reste > 0) result += ' ' + numberToWords(reste);
    } else if (francs < 1000000000) {
      const millions = Math.floor(francs / 1000000);
      const reste = francs % 1000000;
      result = numberToWords(millions) + (millions > 1 ? '-millions' : '-million');
      if (reste > 0) result += ' ' + nombreEnToutesLettres(reste).split(' francs CFA')[0];
    }

    result += (francs > 1 ? ' francs CFA' : ' franc CFA');
  }

  if (centimes > 0) {
    if (francs > 0) result += ' et ';
    result += numberToWords(centimes);
    result += (centimes > 1 ? ' centimes' : ' centime');
  } else if (francs === 0) {
    return "zéro franc CFA";
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Valide une adresse email
 * @param {string} email - L'email à valider
 * @returns {boolean} true si l'email est valide
 */
function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide qu'un montant est un nombre positif
 * @param {number} amount - Le montant à valider
 * @returns {boolean} true si le montant est valide
 */
function validateAmount(amount) {
  return !isNaN(amount) && Number(amount) > 0;
}

// ============================================================================
// GESTION DES ERREURS ET LOGS
// ============================================================================

/**
 * Log une erreur avec contexte
 * @param {string} functionName - Nom de la fonction où l'erreur s'est produite
 * @param {string} errorMessage - Message d'erreur
 * @param {Error} error - Objet erreur (optionnel)
 */
function logError(functionName, errorMessage, error = null) {
  const timestamp = new Date().toLocaleString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  let logMessage = `[${timestamp}] ❌ ${functionName}: ${errorMessage}`;

  if (error) {
    logMessage += `\nDétails: ${error.message}`;
    if (error.stack) {
      logMessage += `\nStack: ${error.stack}`;
    }
  }

  Logger.log(logMessage);
}

/**
 * Log un succès avec contexte
 * @param {string} functionName - Nom de la fonction
 * @param {string} successMessage - Message de succès
 */
function logSuccess(functionName, successMessage) {
  const timestamp = new Date().toLocaleString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  Logger.log(`[${timestamp}] ✅ ${functionName}: ${successMessage}`);
}

// ============================================================================
// UTILITAIRES DIVERS
// ============================================================================

/**
 * Nettoie une chaîne de caractères (trim, suppression caractères spéciaux)
 * @param {string} str - La chaîne à nettoyer
 * @returns {string} Chaîne nettoyée
 */
function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

/**
 * Génère un nom de fichier sécurisé (sans caractères spéciaux)
 * @param {string} invoiceId - ID de la facture
 * @param {string} clientName - Nom du client
 * @returns {string} Nom de fichier sécurisé
 */
function generateSafeFileName(invoiceId, clientName) {
  const safeName = cleanString(clientName).replace(/[^a-z0-9]/gi, '_');
  return `Facture_${invoiceId}_${safeName}`;
}

/**
 * Vérifie si une valeur est vide ou nulle
 * @param {*} value - La valeur à vérifier
 * @returns {boolean} true si la valeur est vide
 */
function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === '';
}
