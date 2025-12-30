/**
 * @file 01_Utils.js
 * @description Reusable utility functions / Fonctions utilitaires reutilisables
 * @version 2.0 (Multi-Country Edition - FR/CM/US)
 * @date 2025-12-14
 * @author InvoiceFlash - One-Click Invoice Generator
 */

// ============================================================================
// PARAMETER MANAGEMENT / GESTION DES PARAMÈTRES
// ============================================================================

/**
 * Retrieves a parameter from the "Settings" sheet
 * Récupère un paramètre depuis la feuille "Settings"
 * @param {string} key - The parameter key / La clé du paramètre
 * @returns {string|null} Parameter value or null if not found
 */
function getParam(key) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SETTINGS);

    if (!settingsSheet) {
      Logger.log('Error: Settings sheet not found / Erreur: Feuille Settings introuvable');
      return null;
    }

    const data = settingsSheet.getDataRange().getValues();

    // Loop through rows to find the key (column A)
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) {
        return data[i][1]; // Return value in column B
      }
    }

    Logger.log(`Parameter ${key} not found in Settings sheet / Paramètre ${key} non trouvé`);
    return null;

  } catch (error) {
    Logger.log(`Error retrieving parameter ${key}: ${error}`);
    return null;
  }
}

/**
 * Retrieves all company parameters including legal IDs based on country
 * Recupere tous les parametres de l'entreprise incluant les identifiants legaux selon le pays
 * @returns {Object} Object containing all company info
 */
function getCompanyParams() {
  const country = getParam(INVOICE_CONFIG.PARAM_KEYS.COUNTRY) || 'FR';

  // Basic company info (all countries)
  const params = {
    // Country
    country: country,

    // Basic Info
    name: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_NAME) || 'Company Name',
    address: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_ADDRESS) || 'Address not provided',
    phone: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_PHONE) || '',
    email: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_EMAIL) || '',
    website: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_WEBSITE) || '',
    logoUrl: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_LOGO_URL) || '',

    // France (FR) Legal IDs
    siret: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_SIRET) || '',
    siren: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_SIREN) || '',
    vatFR: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_VAT_FR) || '',
    rcs: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_RCS) || '',
    capital: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_CAPITAL) || '',
    legalForm: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_LEGAL_FORM) || '',
    apeCode: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_APE_CODE) || '',
    isAutoEntrepreneur: String(getParam(INVOICE_CONFIG.PARAM_KEYS.IS_AUTO_ENTREPRENEUR)).toLowerCase() === 'true',

    // Cameroon (CM) Legal IDs
    niu: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_NIU) || '',
    rccm: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_RCCM) || '',
    taxCenter: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_TAX_CENTER) || '',

    // USA (US) Legal IDs
    ein: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_EIN) || '',
    stateId: getParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_STATE_ID) || '',
    salesTaxRate: parseFloat(getParam(INVOICE_CONFIG.PARAM_KEYS.SALES_TAX_RATE)) || 0,

    // Bank Details
    bankName: getParam(INVOICE_CONFIG.PARAM_KEYS.BANK_NAME) || '',
    bankIban: getParam(INVOICE_CONFIG.PARAM_KEYS.BANK_IBAN) || '',
    bankBic: getParam(INVOICE_CONFIG.PARAM_KEYS.BANK_BIC) || '',
    bankAccountName: getParam(INVOICE_CONFIG.PARAM_KEYS.BANK_ACCOUNT_NAME) || '',

    // VAT/Tax Settings
    defaultVatRate: parseFloat(getParam(INVOICE_CONFIG.PARAM_KEYS.DEFAULT_VAT_RATE)) || 0,
    vatRatesList: getParam(INVOICE_CONFIG.PARAM_KEYS.VAT_RATES_LIST) || '',

    // Payment Terms
    defaultPaymentTerms: getParam(INVOICE_CONFIG.PARAM_KEYS.DEFAULT_PAYMENT_TERMS) || '',
    defaultPaymentDays: parseInt(getParam(INVOICE_CONFIG.PARAM_KEYS.DEFAULT_PAYMENT_DAYS)) || 30
  };

  return params;
}

/**
 * Gets company legal IDs formatted as a string for the current country
 * Recupere les identifiants legaux de l'entreprise formates selon le pays
 * @param {Object} companyParams - Company parameters (optional, will be fetched if not provided)
 * @returns {string} Formatted legal IDs string
 */
function getCompanyLegalIdsFormatted(companyParams = null) {
  const params = companyParams || getCompanyParams();
  const country = params.country || 'FR';

  switch (country) {
    case 'FR':
      const frIds = [];
      if (params.siret) frIds.push(`SIRET: ${params.siret}`);
      if (params.vatFR && !params.isAutoEntrepreneur) frIds.push(`TVA: ${params.vatFR}`);
      if (params.rcs) frIds.push(`RCS: ${params.rcs}`);
      return frIds.join(' | ');

    case 'CM':
      const cmIds = [];
      if (params.niu) cmIds.push(`NIU: ${params.niu}`);
      if (params.rccm) cmIds.push(`RCCM: ${params.rccm}`);
      if (params.taxCenter) cmIds.push(`Centre: ${params.taxCenter}`);
      return cmIds.join(' | ');

    case 'US':
      const usIds = [];
      if (params.ein) usIds.push(`EIN: ${params.ein}`);
      if (params.stateId) usIds.push(`State ID: ${params.stateId}`);
      return usIds.join(' | ');

    default:
      return '';
  }
}

/**
 * Gets bank details formatted as a string
 * Recupere les coordonnees bancaires formatees
 * @param {Object} companyParams - Company parameters (optional)
 * @returns {string} Formatted bank details
 */
function getBankDetailsFormatted(companyParams = null) {
  const params = companyParams || getCompanyParams();
  const lines = [];

  if (params.bankName) lines.push(params.bankName);
  if (params.bankIban) lines.push(`IBAN: ${params.bankIban}`);
  if (params.bankBic) lines.push(`BIC: ${params.bankBic}`);
  if (params.bankAccountName) lines.push(`Titulaire: ${params.bankAccountName}`);

  return lines.join('\n');
}

// Backward compatibility / Retrocompatibilite
function getEntrepriseParams() {
  return getCompanyParams();
}

/**
 * Gets the configured locale (EN or FR) from Settings
 * Récupère la locale configurée (EN ou FR) depuis Settings
 * @returns {string} Locale code ('EN' or 'FR')
 */
function getConfiguredLocale() {
  const locale = getParam('LOCALE');
  if (locale === 'FR') return 'FR';
  if (locale === 'EN') return 'EN';

  // Fallback to auto-detection
  return detectUserLanguage();
}

// ============================================================================
// DATE FORMATTING / FORMATAGE DE DATES
// ============================================================================

/**
 * Formats a date according to configured locale
 * Formate une date selon la locale configurée
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!date) {
    return new Date().toLocaleDateString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  }

  try {
    const dateObj = (date instanceof Date) ? date : new Date(date);
    return dateObj.toLocaleDateString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  } catch (error) {
    Logger.log(`Date formatting error / Erreur formatage date: ${error}`);
    return new Date().toLocaleDateString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  }
}

// ============================================================================
// AMOUNT FORMATTING / FORMATAGE DE MONTANTS
// ============================================================================

/**
 * Formats an amount with configured decimal places and currency
 * Formate un montant avec les décimales et devise configurées
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount with currency
 */
function formatAmount(amount) {
  const formatted = Number(amount).toFixed(INVOICE_CONFIG.FORMAT.DECIMAL_PLACES);
  const currencySymbol = getCurrencySymbol();
  return `${formatted} ${currencySymbol}`;
}

/**
 * Gets the currency symbol from Settings
 * Récupère le symbole de devise depuis Settings
 * @returns {string} Currency symbol (default: €)
 */
function getCurrencySymbol() {
  const symbol = getParam(INVOICE_CONFIG.PARAM_KEYS.CURRENCY_SYMBOL);
  return symbol || '€'; // Default to Euro if not set
}

/**
 * Gets the currency code from Settings
 * Récupère le code de devise depuis Settings
 * @returns {string} Currency code (default: EUR)
 */
function getCurrencyCode() {
  const code = getParam(INVOICE_CONFIG.PARAM_KEYS.CURRENCY_CODE);
  return code || 'EUR'; // Default to Euro if not set
}

// ============================================================================
// NUMBER TO WORDS CONVERSION / CONVERSION NOMBRES EN LETTRES
// ============================================================================

/**
 * Converts a number to words (French)
 * Convertit un nombre en toutes lettres (français)
 * Supports amounts with two decimal places (centimes)
 * @param {number} n - Amount to convert
 * @returns {string} Amount in words (French)
 */
function numberToWordsFR(n) {
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
    if (num < 80) {
      if (num % 10 === 0) return 'soixante-dix';
      return 'soixante-' + dix[num - 70];
    }
    if (num < 100) {
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
      if (reste > 0) result += ' ' + numberToWordsFR(reste).split(' francs CFA')[0];
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

/**
 * Converts a number to words (English)
 * Convertit un nombre en toutes lettres (anglais)
 * @param {number} n - Amount to convert
 * @returns {string} Amount in words (English)
 */
function numberToWordsEN(n) {
  if (isNaN(n) || n === 0) return "zero dollars";

  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  function convertLessThanThousand(num) {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
    }
    return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 !== 0 ? ' and ' + convertLessThanThousand(num % 100) : '');
  }

  const [wholePart, decimalPart] = String(n).split('.');
  const dollars = parseInt(wholePart);
  const cents = decimalPart ? parseInt(decimalPart.padEnd(2, '0').slice(0, 2)) : 0;

  let result = '';

  if (dollars >= 1000000) {
    const millions = Math.floor(dollars / 1000000);
    result += convertLessThanThousand(millions) + ' million ';
    const remainder = dollars % 1000000;
    if (remainder > 0) result += numberToWordsEN(remainder).split(' dollars')[0];
  } else if (dollars >= 1000) {
    const thousands = Math.floor(dollars / 1000);
    result += convertLessThanThousand(thousands) + ' thousand ';
    const remainder = dollars % 1000;
    if (remainder > 0) result += convertLessThanThousand(remainder);
  } else {
    result = convertLessThanThousand(dollars);
  }

  result += dollars === 1 ? ' dollar' : ' dollars';

  if (cents > 0) {
    result += ' and ' + convertLessThanThousand(cents) + (cents === 1 ? ' cent' : ' cents');
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Converts amount to words based on current language
 * Convertit un montant en lettres selon la langue actuelle
 * @param {number} amount - Amount to convert
 * @returns {string} Amount in words
 */
function convertAmountToWords(amount) {
  const lang = detectUserLanguage();
  return lang === 'FR' ? numberToWordsFR(amount) : numberToWordsEN(amount);
}

/**
 * Converts amount to words based on country (with correct currency)
 * Convertit un montant en lettres selon le pays (avec la devise correcte)
 * @param {number} amount - Amount to convert
 * @param {string} country - Country code (FR, CM, US) - optional, uses Settings if not provided
 * @returns {string} Amount in words with currency
 */
function convertAmountToWordsForCountry(amount, country = null) {
  const countryCode = country || getParam(INVOICE_CONFIG.PARAM_KEYS.COUNTRY) || 'FR';

  switch (countryCode) {
    case 'FR':
      return numberToWordsEUR(amount);
    case 'CM':
      return numberToWordsFR(amount); // Already returns FCFA
    case 'US':
      return numberToWordsEN(amount); // Already returns USD
    default:
      return numberToWordsFR(amount);
  }
}

/**
 * Converts a number to words for EURO currency (French)
 * Convertit un nombre en lettres pour la devise EURO (francais)
 * @param {number} n - Amount to convert
 * @returns {string} Amount in words (French with euros)
 */
function numberToWordsEUR(n) {
  if (isNaN(n) || n === 0) return "zero euro";

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
    if (num < 80) {
      if (num % 10 === 0) return 'soixante-dix';
      return 'soixante-' + dix[num - 70];
    }
    if (num < 100) {
      if (num === 80) return 'quatre-vingts';
      if (num % 10 === 0) return dizaine[Math.floor(num / 10)] + (num > 80 ? 't' : '') + unite[num % 10];
      if (num > 80 && num < 90) return 'quatre-vingt-' + dix[num - 80];
      return dizaine[Math.floor(num / 10)] + (num % 10 === 1 && Math.floor(num / 10) !== 7 ? '-et-' : '-') + unite[num % 10];
    }
    if (num < 1000) {
      const cent = (Math.floor(num / 100) === 1) ? 'cent' : unite[Math.floor(num / 100)] + '-cents';
      const reste = num % 100;
      if (reste === 0) return cent.replace(/s$/, '');
      return cent.replace(/s$/, '') + ' ' + numberToWords(reste);
    }
    return '';
  }

  const [euroParts, centParts] = String(n).split('.');
  const euros = parseInt(euroParts);
  const centimes = centParts ? parseInt(centParts.padEnd(2, '0').slice(0, 2)) : 0;

  let result = '';

  if (euros > 0) {
    if (euros < 1000) {
      result = numberToWords(euros);
    } else if (euros < 1000000) {
      const milliers = Math.floor(euros / 1000);
      const reste = euros % 1000;
      result = (milliers === 1 ? 'mille' : numberToWords(milliers) + '-mille');
      if (reste > 0) result += ' ' + numberToWords(reste);
    } else if (euros < 1000000000) {
      const millions = Math.floor(euros / 1000000);
      const reste = euros % 1000000;
      result = numberToWords(millions) + (millions > 1 ? '-millions' : '-million');
      if (reste > 0) result += ' ' + numberToWordsEUR(reste).split(' euro')[0];
    }

    result += (euros > 1 ? ' euros' : ' euro');
  }

  if (centimes > 0) {
    if (euros > 0) result += ' et ';
    result += numberToWords(centimes);
    result += (centimes > 1 ? ' centimes' : ' centime');
  } else if (euros === 0) {
    return "zero euro";
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Backward compatibility / Retrocompatibilite
function nombreEnToutesLettres(n) {
  return numberToWordsFR(n);
}

// ============================================================================
// VALIDATION / VALIDATION
// ============================================================================

/**
 * Validates an email address
 * Valide une adresse email
 * @param {string} email - Email to validate
 * @returns {boolean} true if email is valid
 */
function validateEmail(email) {
  if (!email) return false;

  // Clean and trim email
  const trimmedEmail = String(email).trim();

  // More permissive regex that accepts:
  // - Standard TLDs (.com, .fr, .org, etc.)
  // - New TLDs (.app, .tech, .cloud, etc.)
  // - Custom/internal TLDs (.appp, .local, etc.)
  // - Subdomains (user@mail.example.com)
  // Format: local-part@domain.tld where TLD can be 2-10 characters
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;

  return emailRegex.test(trimmedEmail);
}

/**
 * Validates that an amount is a positive number
 * Valide qu'un montant est un nombre positif
 * @param {number} amount - Amount to validate
 * @returns {boolean} true if amount is valid
 */
function validateAmount(amount) {
  return !isNaN(amount) && Number(amount) > 0;
}

// ============================================================================
// ERROR HANDLING AND LOGGING / GESTION D'ERREURS ET LOGS
// ============================================================================

/**
 * Logs an error with context
 * Enregistre une erreur avec contexte
 * @param {string} functionName - Function name where error occurred
 * @param {string} errorMessage - Error message
 * @param {Error} error - Error object (optional)
 */
function logError(functionName, errorMessage, error = null) {
  const timestamp = new Date().toLocaleString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  let logMessage = `[${timestamp}] ❌ ${functionName}: ${errorMessage}`;

  if (error) {
    logMessage += `\nDetails / Détails: ${error.message}`;
    if (error.stack) {
      logMessage += `\nStack: ${error.stack}`;
    }
  }

  Logger.log(logMessage);
}

/**
 * Logs a success with context
 * Enregistre un succès avec contexte
 * @param {string} functionName - Function name
 * @param {string} successMessage - Success message
 */
function logSuccess(functionName, successMessage) {
  const timestamp = new Date().toLocaleString(INVOICE_CONFIG.FORMAT.DATE_LOCALE);
  Logger.log(`[${timestamp}] ✅ ${functionName}: ${successMessage}`);
}

// ============================================================================
// MISCELLANEOUS UTILITIES / UTILITAIRES DIVERS
// ============================================================================

/**
 * Cleans a string (trim, remove extra spaces)
 * Nettoie une chaîne de caractères (trim, espaces multiples)
 * @param {string} str - String to clean
 * @returns {string} Cleaned string
 */
function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

/**
 * Generates a safe filename (no special characters)
 * Génère un nom de fichier sécurisé (sans caractères spéciaux)
 * @param {string} invoiceId - Invoice ID
 * @param {string} clientName - Client name
 * @returns {string} Safe filename
 */
function generateSafeFileName(invoiceId, clientName) {
  const safeName = cleanString(clientName).replace(/[^a-z0-9]/gi, '_');
  return `Invoice_${invoiceId}_${safeName}`;
}

/**
 * Checks if a value is empty or null
 * Vérifie si une valeur est vide ou nulle
 * @param {*} value - Value to check
 * @returns {boolean} true if value is empty
 */
function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

/**
 * Initializes the UI context for sidebar display
 * Forces spreadsheet operations to ensure authorization is complete
 * This fixes the "first click doesn't open sidebar" bug
 * @returns {Object} Object containing ss (spreadsheet) and ui references
 */
function initSidebarContext() {
  // IMPORTANT: Get UI reference FIRST before any spreadsheet operations
  // This ensures the UI context is established early in the execution
  const ui = SpreadsheetApp.getUi();

  // Now get spreadsheet reference
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Force multiple read operations to ensure authorization is complete
  ss.getName();
  const activeSheet = ss.getActiveSheet();
  if (activeSheet) {
    activeSheet.getName();
  }

  // Force flush
  SpreadsheetApp.flush();

  // Longer delay for first-time authorization (200ms)
  Utilities.sleep(200);

  return { ss: ss, ui: ui };
}

/**
 * Forces pending Spreadsheet changes to commit and replaces the default
 * "Working" spinner with a short toast notification. This avoids leaving the
 * Google Sheets UI blocked after long-running scripts.
 * @param {string} message - Optional message to display in the toast
 */
function showCompletionToast(message) {
  try {
    SpreadsheetApp.flush();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      const title = (INVOICE_CONFIG.APP && INVOICE_CONFIG.APP.NAME) || 'InvoiceFlash';
      const toastMessage = message || '✅ Done';
      ss.toast(toastMessage, title, 4);
    }
  } catch (error) {
    Logger.log('showCompletionToast error: ' + error);
  }
}

/**
 * Generates the next invoice number automatically by scanning existing invoices
 * Génère le prochain numéro de facture automatiquement en scannant les factures existantes
 * Format: INV2025-CLI-001-0009 (Prefix-ClientID-InvoiceNumber)
 * @param {string} clientId - Client ID (e.g., CLI-001)
 * @returns {string} Next invoice ID (e.g., INV2025-CLI-001-0009)
 */
function generateNextInvoiceId(clientId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const prefix = getParam(INVOICE_CONFIG.PARAM_KEYS.INVOICE_PREFIX) || 'INV2025-';

    // Validate clientId
    if (!clientId || clientId.trim() === '') {
      logError('generateNextInvoiceId', 'ClientID is required');
      return 'INV-ERROR-NO-CLIENT-' + Date.now();
    }

    // Get Invoices sheet
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) {
      // If no Invoices sheet exists, start with 0001
      const newInvoiceId = `${prefix}${clientId}-0001`;
      logSuccess('generateNextInvoiceId', `No Invoices sheet found, starting with ${newInvoiceId}`);
      return newInvoiceId;
    }

    // Get all data from column A (InvoiceID)
    const data = invoicesSheet.getDataRange().getValues();
    let maxNumber = 0;

    // Build the pattern to search: prefix + clientId (e.g., "INV2025-CLI-001-")
    const searchPattern = `${prefix}${clientId}-`;

    // Scan all invoice IDs to find the highest number for THIS client
    for (let i = 1; i < data.length; i++) { // Start at 1 to skip header
      const invoiceId = String(data[i][INVOICE_CONFIG.COLUMNS.INVOICE_ID]).trim();

      if (invoiceId && invoiceId.startsWith(searchPattern)) {
        // Extract the number after the pattern (e.g., "INV2025-CLI-001-0015" → "0015" → 15)
        const numberPart = invoiceId.substring(searchPattern.length);
        const number = parseInt(numberPart, 10);

        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    }

    // Next number is max + 1
    const nextNumber = maxNumber + 1;

    // Format with leading zeros (0001, 0002, etc.) - now 4 digits
    const paddedNumber = String(nextNumber).padStart(4, '0');
    const newInvoiceId = `${prefix}${clientId}-${paddedNumber}`;

    logSuccess('generateNextInvoiceId', `Generated new invoice ID: ${newInvoiceId} (max found for ${clientId}: ${maxNumber})`);
    return newInvoiceId;

  } catch (error) {
    logError('generateNextInvoiceId', 'Failed to generate invoice ID', error);
    return 'INV-ERROR-' + Date.now();
  }
}
