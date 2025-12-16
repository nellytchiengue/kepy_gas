/**
 * @file 10_CountryConfig.js
 * @description Configuration specifique par pays pour facturation multi-pays (FR/CM/US)
 *              Country-specific configuration for multi-country invoicing
 * @version 1.0
 * @date 2025-12-14
 * @author InvoiceFlash - Multi-Country Edition
 */

// ============================================================================
// COUNTRY CONFIGURATIONS / CONFIGURATIONS PAR PAYS
// ============================================================================

const COUNTRY_CONFIG = {

  // ==========================================================================
  // FRANCE (FR)
  // ==========================================================================
  FR: {
    name: 'France',
    nameEN: 'France',
    code: 'FR',

    // Currency / Devise
    currency: {
      code: 'EUR',
      symbol: 'EUR',
      symbolPosition: 'after', // 100.00 EUR
      decimalSeparator: ',',
      thousandsSeparator: ' ',
      decimals: 2,
      locale: 'fr-FR'
    },

    // Date format
    dateFormat: {
      display: 'DD/MM/YYYY',
      locale: 'fr-FR',
      options: { day: '2-digit', month: '2-digit', year: 'numeric' }
    },

    // VAT / TVA
    vat: {
      name: 'TVA',
      nameEN: 'VAT',
      rates: [20, 10, 5.5, 2.1, 0],
      defaultRate: 20,
      displayFormat: '{rate}%', // "20%"
      // Taux par categorie (pour reference)
      rateCategories: {
        20: 'Taux normal',
        10: 'Taux intermediaire (travaux, restauration)',
        5.5: 'Taux reduit (alimentaire, energie)',
        2.1: 'Taux super-reduit (medicaments, presse)',
        0: 'Exonere / Export'
      }
    },

    // Required company fields / Champs entreprise obligatoires
    companyFields: {
      required: ['SIRET'],
      recommended: ['RCS', 'VAT_FR'],
      optional: ['SIREN', 'CAPITAL', 'LEGAL_FORM', 'APE_CODE']
    },

    // Required client fields / Champs client
    clientFields: {
      required: [],
      optional: ['SIRET', 'VAT_NUMBER']
    },

    // Invoice requirements / Exigences facture
    invoiceRequirements: {
      amountInWords: false,           // Optionnel en France
      amountInWordsRequired: false,
      dueDateRequired: true,
      deliveryDateRecommended: true,
      vatBreakdownRequired: true,     // Recapitulatif TVA obligatoire
      latePaymentMentionRequired: true
    },

    // Legal mentions / Mentions legales
    legalMentions: {
      // Mention auto-entrepreneur
      vatExemption: 'TVA non applicable, art. 293 B du CGI',

      // Penalites de retard (obligatoire)
      latePayment: 'En cas de retard de paiement, une penalite de 3 fois le taux d\'interet legal sera appliquee, ainsi qu\'une indemnite forfaitaire de 40 EUR pour frais de recouvrement (Art. L441-10 Code de commerce).',
      latePaymentShort: 'Penalites: 3x taux legal + 40 EUR indemnite forfaitaire',

      // Escompte
      noDiscount: 'Pas d\'escompte pour paiement anticipe.',

      // Delai de paiement par defaut
      defaultPaymentTerms: 'Paiement a reception',
      defaultPaymentDays: 30,

      // Footer generique
      footer: 'Merci pour votre confiance.'
    },

    // Labels / Etiquettes (Francais)
    labels: {
      // Document
      invoice: 'FACTURE',
      quote: 'DEVIS',
      creditNote: 'AVOIR',
      proforma: 'FACTURE PROFORMA',

      // Dates
      date: 'Date',
      invoiceDate: 'Date de facture',
      dueDate: 'Date d\'echeance',
      deliveryDate: 'Date de livraison',

      // Parties
      billedTo: 'Facture a',
      from: 'De',
      to: 'A',
      client: 'Client',

      // Table headers
      description: 'DESIGNATION',
      quantity: 'QTE',
      unit: 'Unite',
      unitPrice: 'PRIX U. HT',
      unitPriceShort: 'P.U. HT',
      vatRate: 'TVA %',
      vat: 'TVA',
      lineTotal: 'TOTAL HT',
      lineTotalTTC: 'TOTAL TTC',

      // Totals
      subtotal: 'Sous-total HT',
      subtotalHT: 'Total HT',
      discount: 'Remise',
      totalVat: 'Total TVA',
      totalTTC: 'Total TTC',
      totalDue: 'NET A PAYER',
      amountInWords: 'Montant en lettres',

      // Payment
      paymentTerms: 'Conditions de paiement',
      paymentMethod: 'Mode de reglement',
      bankDetails: 'Coordonnees bancaires',

      // Other
      notes: 'Notes',
      reference: 'Reference',
      poNumber: 'N de commande',
      page: 'Page',
      of: 'sur',

      // Footer
      footer: 'Merci pour votre confiance.',
      legalMentions: 'Mentions legales'
    },

    // Number to words configuration
    numberToWords: {
      currency: 'euro',
      currencyPlural: 'euros',
      cents: 'centime',
      centsPlural: 'centimes',
      conjunction: 'et'
    }
  },

  // ==========================================================================
  // CAMEROUN (CM)
  // ==========================================================================
  CM: {
    name: 'Cameroun',
    nameEN: 'Cameroon',
    code: 'CM',

    // Currency / Devise
    currency: {
      code: 'XAF',
      symbol: 'FCFA',
      symbolPosition: 'after', // 100 000 FCFA
      decimalSeparator: ',',
      thousandsSeparator: ' ',
      decimals: 0, // Pas de centimes en FCFA
      locale: 'fr-CM'
    },

    // Date format
    dateFormat: {
      display: 'DD/MM/YYYY',
      locale: 'fr-CM',
      options: { day: '2-digit', month: '2-digit', year: 'numeric' }
    },

    // VAT / TVA
    vat: {
      name: 'TVA',
      nameEN: 'VAT',
      rates: [19.25, 0],
      defaultRate: 19.25,
      displayFormat: '{rate}%',
      rateCategories: {
        19.25: 'Taux normal (TVA 17.5% + CAC 10% = 19.25%)',
        0: 'Exonere'
      },
      // Note: Au Cameroun, TVA = 17.5% + CAC (Centimes Additionnels Communaux) 10% de la TVA = 19.25% total
      breakdown: {
        baseTVA: 17.5,
        CAC: 1.75, // 10% de 17.5%
        total: 19.25
      }
    },

    // Required company fields
    companyFields: {
      required: ['NIU', 'RCCM', 'TAX_CENTER'],
      recommended: [],
      optional: ['CONTRIBUABLE']
    },

    // Required client fields
    clientFields: {
      required: [],
      optional: ['NIU']
    },

    // Invoice requirements - OHADA
    invoiceRequirements: {
      amountInWords: true,           // OBLIGATOIRE au Cameroun (OHADA)
      amountInWordsRequired: true,
      dueDateRequired: true,
      deliveryDateRecommended: false,
      vatBreakdownRequired: true,
      latePaymentMentionRequired: false
    },

    // Legal mentions
    legalMentions: {
      // Mention montant en lettres (OBLIGATOIRE)
      amountInWordsPrefix: 'Arretee la presente facture a la somme de:',
      amountInWordsSuffix: '',

      // TVA
      vatNote: 'TVA incluse au taux de 19,25% (TVA 17,5% + CAC 1,75%)',

      // Paiement
      defaultPaymentTerms: 'Paiement comptant',
      defaultPaymentDays: 30,

      // Footer
      footer: 'Merci pour votre confiance.',

      // Contact
      contactPrefix: 'Pour toute reclamation:'
    },

    // Labels (Francais - usage au Cameroun)
    labels: {
      // Document
      invoice: 'FACTURE',
      quote: 'DEVIS',
      creditNote: 'AVOIR',
      proforma: 'FACTURE PROFORMA',

      // Dates
      date: 'Date',
      invoiceDate: 'Date de facture',
      dueDate: 'Echeance',
      deliveryDate: 'Date de livraison',

      // Parties
      billedTo: 'Facture a',
      from: 'De',
      to: 'A',
      client: 'Client',

      // Table headers
      description: 'DESIGNATION',
      quantity: 'QTE',
      unit: 'Unite',
      unitPrice: 'PRIX UNITAIRE',
      unitPriceShort: 'P.U.',
      vatRate: 'TVA %',
      vat: 'TVA',
      lineTotal: 'MONTANT',
      lineTotalTTC: 'MONTANT TTC',

      // Totals
      subtotal: 'Sous-total HT',
      subtotalHT: 'Total HT',
      discount: 'Remise',
      totalVat: 'Total TVA',
      totalTTC: 'Total TTC',
      totalDue: 'NET A PAYER',
      amountInWords: 'Montant en lettres',

      // Payment
      paymentTerms: 'Conditions de reglement',
      paymentMethod: 'Mode de paiement',
      bankDetails: 'Coordonnees bancaires',

      // Other
      notes: 'Observations',
      reference: 'Reference',
      poNumber: 'N de commande',
      page: 'Page',
      of: 'sur',

      // Footer
      footer: 'Merci pour votre confiance.',
      legalMentions: 'Mentions legales'
    },

    // Number to words configuration
    numberToWords: {
      currency: 'franc CFA',
      currencyPlural: 'francs CFA',
      cents: 'centime',
      centsPlural: 'centimes',
      conjunction: 'et'
    }
  },

  // ==========================================================================
  // UNITED STATES (US)
  // ==========================================================================
  US: {
    name: 'United States',
    nameEN: 'United States',
    code: 'US',

    // Currency / Devise
    currency: {
      code: 'USD',
      symbol: '$',
      symbolPosition: 'before', // $100.00
      decimalSeparator: '.',
      thousandsSeparator: ',',
      decimals: 2,
      locale: 'en-US'
    },

    // Date format
    dateFormat: {
      display: 'MM/DD/YYYY',
      locale: 'en-US',
      options: { month: '2-digit', day: '2-digit', year: 'numeric' }
    },

    // Sales Tax (pas de TVA federale)
    vat: {
      name: 'Sales Tax',
      nameEN: 'Sales Tax',
      rates: [], // Varie par etat, configure dans Settings
      defaultRate: 0,
      displayFormat: '{rate}%',
      rateCategories: {},
      // Note: Sales tax varie enormement par etat (0% a ~10%)
      // L'utilisateur doit configurer selon son etat
      stateRates: {
        'CA': 7.25, // Californie (base, peut etre plus avec local)
        'TX': 6.25, // Texas
        'NY': 4,    // New York (base)
        'FL': 6,    // Floride
        'WA': 6.5,  // Washington
        'OR': 0,    // Oregon (pas de sales tax)
        'MT': 0,    // Montana
        'NH': 0,    // New Hampshire
        'DE': 0,    // Delaware
        'AK': 0     // Alaska (pas de sales tax d'etat)
      }
    },

    // Required company fields
    companyFields: {
      required: [],
      recommended: ['EIN'],
      optional: ['STATE_ID', 'DUNS']
    },

    // Required client fields
    clientFields: {
      required: [],
      optional: ['TAX_ID', 'EIN']
    },

    // Invoice requirements
    invoiceRequirements: {
      amountInWords: false,
      amountInWordsRequired: false,
      dueDateRequired: true,
      deliveryDateRecommended: false,
      vatBreakdownRequired: false, // Sales tax optionnel
      latePaymentMentionRequired: false
    },

    // Legal mentions
    legalMentions: {
      // Sales tax
      salesTaxNote: 'Sales tax applied where applicable.',
      noSalesTax: 'No sales tax applicable.',

      // Payment
      defaultPaymentTerms: 'Payment due upon receipt',
      netTerms: 'Net {days}', // Net 30, Net 15, etc.
      defaultPaymentDays: 30,

      // Late payment (optionnel, a la discretion du vendeur)
      latePaymentOptional: 'Late payments may be subject to a {rate}% monthly finance charge.',

      // Footer
      footer: 'Thank you for your business.',

      // Contact
      contactPrefix: 'For questions regarding this invoice:'
    },

    // Labels (English)
    labels: {
      // Document
      invoice: 'INVOICE',
      quote: 'QUOTE',
      creditNote: 'CREDIT NOTE',
      proforma: 'PROFORMA INVOICE',

      // Dates
      date: 'Date',
      invoiceDate: 'Invoice Date',
      dueDate: 'Due Date',
      deliveryDate: 'Delivery Date',

      // Parties
      billedTo: 'Bill To',
      from: 'From',
      to: 'To',
      client: 'Client',

      // Table headers
      description: 'DESCRIPTION',
      quantity: 'QTY',
      unit: 'Unit',
      unitPrice: 'UNIT PRICE',
      unitPriceShort: 'RATE',
      vatRate: 'TAX %',
      vat: 'TAX',
      lineTotal: 'AMOUNT',
      lineTotalTTC: 'TOTAL',

      // Totals
      subtotal: 'Subtotal',
      subtotalHT: 'Subtotal',
      discount: 'Discount',
      totalVat: 'Sales Tax',
      totalTTC: 'Total',
      totalDue: 'TOTAL DUE',
      amountInWords: 'Amount in words',

      // Payment
      paymentTerms: 'Payment Terms',
      paymentMethod: 'Payment Method',
      bankDetails: 'Bank Details',

      // Other
      notes: 'Notes',
      reference: 'Reference',
      poNumber: 'PO Number',
      page: 'Page',
      of: 'of',

      // Footer
      footer: 'Thank you for your business.',
      legalMentions: 'Terms & Conditions'
    },

    // Number to words configuration
    numberToWords: {
      currency: 'dollar',
      currencyPlural: 'dollars',
      cents: 'cent',
      centsPlural: 'cents',
      conjunction: 'and'
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS / FONCTIONS D'AIDE
// ============================================================================

/**
 * Retrieves the complete configuration for the current country
 * Recupere la configuration complete du pays actuel
 * @returns {Object} Country configuration object
 */
function getCountryConfig() {
  const country = getParam('COUNTRY') || 'FR';
  return COUNTRY_CONFIG[country] || COUNTRY_CONFIG.FR;
}

/**
 * Retrieves the configuration for a specific country
 * Recupere la configuration d'un pays specifique
 * @param {string} countryCode - Country code (FR, CM, US)
 * @returns {Object} Country configuration object
 */
function getCountryConfigByCode(countryCode) {
  return COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG.FR;
}

/**
 * Gets labels in the current country's language
 * Recupere les labels dans la langue du pays actuel
 * @returns {Object} Labels object
 */
function getCountryLabels() {
  return getCountryConfig().labels;
}

/**
 * Gets a specific label
 * Recupere un label specifique
 * @param {string} key - Label key
 * @returns {string} Label text
 */
function getLabel(key) {
  const labels = getCountryLabels();
  return labels[key] || key;
}

/**
 * Gets currency configuration for the current country
 * Recupere la configuration devise du pays actuel
 * @returns {Object} Currency configuration
 */
function getCountryCurrency() {
  return getCountryConfig().currency;
}

/**
 * Gets VAT/Tax configuration for the current country
 * Recupere la configuration TVA du pays actuel
 * @returns {Object} VAT configuration
 */
function getCountryVat() {
  return getCountryConfig().vat;
}

/**
 * Gets default VAT rate for the current country
 * Recupere le taux de TVA par defaut du pays actuel
 * @returns {number} Default VAT rate
 */
function getDefaultVatRate() {
  return getCountryVat().defaultRate;
}

/**
 * Gets available VAT rates for the current country
 * Recupere les taux de TVA disponibles du pays actuel
 * @returns {Array} Array of available VAT rates
 */
function getAvailableVatRates() {
  return getCountryVat().rates;
}

/**
 * Gets legal mentions for the current country
 * Recupere les mentions legales du pays actuel
 * @returns {Object} Legal mentions object
 */
function getCountryLegalMentions() {
  return getCountryConfig().legalMentions;
}

/**
 * Checks if amount in words is required for the current country
 * Verifie si le montant en lettres est obligatoire pour le pays actuel
 * @returns {boolean} True if required
 */
function isAmountInWordsRequired() {
  return getCountryConfig().invoiceRequirements.amountInWordsRequired;
}

/**
 * Gets required company fields for the current country
 * Recupere les champs entreprise obligatoires pour le pays actuel
 * @returns {Array} Array of required field keys
 */
function getRequiredCompanyFields() {
  return getCountryConfig().companyFields.required;
}

/**
 * Gets all company fields (required + recommended + optional) for the current country
 * @returns {Object} Object with required, recommended, and optional arrays
 */
function getAllCompanyFields() {
  return getCountryConfig().companyFields;
}

/**
 * Checks if a company field is required for the current country
 * @param {string} fieldKey - Field key (e.g., 'SIRET', 'NIU', 'EIN')
 * @returns {boolean} True if required
 */
function isCompanyFieldRequired(fieldKey) {
  return getRequiredCompanyFields().includes(fieldKey);
}

// ============================================================================
// FORMATTING FUNCTIONS / FONCTIONS DE FORMATAGE
// ============================================================================

/**
 * Formats an amount according to the current country's currency settings
 * Formate un montant selon les parametres de devise du pays actuel
 * @param {number} amount - Amount to format
 * @param {boolean} includeSymbol - Include currency symbol (default: true)
 * @returns {string} Formatted amount
 */
function formatAmountForCountry(amount, includeSymbol = true) {
  const currency = getCountryCurrency();

  // Round to appropriate decimals
  const rounded = Number(amount).toFixed(currency.decimals);

  // Format with separators
  const parts = rounded.split('.');
  let intPart = parts[0];
  const decPart = parts[1];

  // Add thousands separators
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);

  // Combine
  let formatted = currency.decimals > 0
    ? intPart + currency.decimalSeparator + decPart
    : intPart;

  // Add symbol
  if (includeSymbol) {
    if (currency.symbolPosition === 'before') {
      formatted = currency.symbol + formatted;
    } else {
      formatted = formatted + ' ' + currency.symbol;
    }
  }

  return formatted;
}

/**
 * Formats a date according to the current country's format
 * Formate une date selon le format du pays actuel
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
function formatDateForCountry(date) {
  if (!date) return '';

  const dateFormat = getCountryConfig().dateFormat;
  const dateObj = (date instanceof Date) ? date : new Date(date);

  if (isNaN(dateObj.getTime())) return '';

  try {
    return dateObj.toLocaleDateString(dateFormat.locale, dateFormat.options);
  } catch (error) {
    // Fallback to manual formatting
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    if (dateFormat.display === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    }
    return `${day}/${month}/${year}`;
  }
}

/**
 * Formats a VAT rate for display
 * Formate un taux de TVA pour affichage
 * @param {number} rate - VAT rate (e.g., 20)
 * @returns {string} Formatted rate (e.g., "20%")
 */
function formatVatRate(rate) {
  const vatConfig = getCountryVat();

  // Handle decimal rates (e.g., 5.5%, 19.25%)
  const rateStr = rate % 1 === 0 ? rate.toString() : rate.toFixed(2);

  return vatConfig.displayFormat.replace('{rate}', rateStr);
}

// ============================================================================
// VALIDATION FUNCTIONS / FONCTIONS DE VALIDATION
// ============================================================================

/**
 * Validates a SIRET number (France)
 * @param {string} siret - SIRET to validate
 * @returns {boolean} True if valid
 */
function validateSIRET(siret) {
  if (!siret) return false;
  const cleaned = siret.replace(/\s/g, '');
  return /^\d{14}$/.test(cleaned);
}

/**
 * Validates a SIREN number (France)
 * @param {string} siren - SIREN to validate
 * @returns {boolean} True if valid
 */
function validateSIREN(siren) {
  if (!siren) return false;
  const cleaned = siren.replace(/\s/g, '');
  return /^\d{9}$/.test(cleaned);
}

/**
 * Validates a French VAT number
 * @param {string} vatNumber - VAT number to validate
 * @returns {boolean} True if valid
 */
function validateFrenchVAT(vatNumber) {
  if (!vatNumber) return false;
  const cleaned = vatNumber.replace(/\s/g, '').toUpperCase();
  // Format: FR + 2 caracteres (chiffres ou lettres sauf O et I) + 9 chiffres (SIREN)
  return /^FR[0-9A-HJ-NP-Z]{2}\d{9}$/.test(cleaned);
}

/**
 * Validates a NIU number (Cameroun)
 * Format: M + 12 chiffres + 1 lettre
 * @param {string} niu - NIU to validate
 * @returns {boolean} True if valid
 */
function validateNIU(niu) {
  if (!niu) return false;
  const cleaned = niu.replace(/\s/g, '').toUpperCase();
  return /^M\d{12}[A-Z]$/.test(cleaned);
}

/**
 * Validates a RCCM number (Cameroun)
 * Format varies: RC/VILLE/ANNEE/TYPE/NUMERO
 * @param {string} rccm - RCCM to validate
 * @returns {boolean} True if appears valid (basic check)
 */
function validateRCCM(rccm) {
  if (!rccm) return false;
  // Basic validation - should contain RC and have reasonable length
  const cleaned = rccm.replace(/\s/g, '').toUpperCase();
  return cleaned.includes('RC') && cleaned.length >= 10;
}

/**
 * Validates an EIN (US)
 * Format: XX-XXXXXXX
 * @param {string} ein - EIN to validate
 * @returns {boolean} True if valid
 */
function validateEIN(ein) {
  if (!ein) return false;
  const cleaned = ein.replace(/\s/g, '');
  return /^\d{2}-?\d{7}$/.test(cleaned);
}

/**
 * Validates company legal IDs based on country
 * @param {Object} companyData - Company data object
 * @param {string} country - Country code
 * @returns {Object} {isValid: boolean, errors: Array, warnings: Array}
 */
function validateCompanyLegalIds(companyData, country) {
  const config = getCountryConfigByCode(country);
  const result = { isValid: true, errors: [], warnings: [] };

  // Check required fields
  config.companyFields.required.forEach(field => {
    const value = companyData[field] || companyData[field.toLowerCase()];
    if (!value || value.trim() === '') {
      result.isValid = false;
      result.errors.push(`${field} is required for ${country}`);
    }
  });

  // Validate specific formats
  switch(country) {
    case 'FR':
      if (companyData.SIRET && !validateSIRET(companyData.SIRET)) {
        result.isValid = false;
        result.errors.push('Invalid SIRET format (must be 14 digits)');
      }
      if (companyData.VAT_FR && !validateFrenchVAT(companyData.VAT_FR)) {
        result.warnings.push('VAT number format may be invalid');
      }
      break;

    case 'CM':
      if (companyData.NIU && !validateNIU(companyData.NIU)) {
        result.isValid = false;
        result.errors.push('Invalid NIU format (must be M + 12 digits + 1 letter)');
      }
      break;

    case 'US':
      if (companyData.EIN && !validateEIN(companyData.EIN)) {
        result.warnings.push('EIN format may be invalid (expected XX-XXXXXXX)');
      }
      break;
  }

  return result;
}

// ============================================================================
// COUNTRY LIST FOR UI / LISTE DES PAYS POUR L'INTERFACE
// ============================================================================

/**
 * Gets list of supported countries for dropdown menus
 * @returns {Array} Array of {code, name, nameEN}
 */
function getSupportedCountries() {
  return Object.keys(COUNTRY_CONFIG).map(code => ({
    code: code,
    name: COUNTRY_CONFIG[code].name,
    nameEN: COUNTRY_CONFIG[code].nameEN
  }));
}

/**
 * Gets country name by code
 * @param {string} code - Country code
 * @param {string} lang - Language ('FR' or 'EN')
 * @returns {string} Country name
 */
function getCountryName(code, lang = 'FR') {
  const config = COUNTRY_CONFIG[code];
  if (!config) return code;
  return lang === 'EN' ? config.nameEN : config.name;
}

// ============================================================================
// EXPORT FOR OTHER MODULES
// ============================================================================

// Make COUNTRY_CONFIG available globally
if (typeof globalThis !== 'undefined') {
  globalThis.COUNTRY_CONFIG = COUNTRY_CONFIG;
}
