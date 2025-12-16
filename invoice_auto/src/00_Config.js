/**
 * @file 00_Config.js
 * @description Centralized configuration for automatic invoice generation system
 *              Configuration centralisee pour le systeme de generation de factures automatiques
 * @version 2.0 (Multi-Country Edition - FR/CM/US)
 * @date 2025-12-14
 * @author InvoiceFlash - One-Click Invoice Generator
 */

// ============================================================================
// MAIN CONFIGURATION / CONFIGURATION PRINCIPALE
// ============================================================================

const INVOICE_CONFIG = {

  // ---------------------------------------------------------------------------
  // SHEET NAMES / NOMS DES FEUILLES GOOGLE SHEET
  // ---------------------------------------------------------------------------
  SHEETS: {
    INVOICES: 'Invoices',              // Sheet containing invoice data / Feuille contenant les factures
    SETTINGS: 'Settings',               // Sheet containing configuration / Feuille de configuration
    CLIENTS: 'Clients',                // Sheet containing clients data / Feuille de la base des clients
    SERVICES: 'Services'               // Sheet containing services/products catalog / Catalogue des services/produits
  },

  // ---------------------------------------------------------------------------
  // COLUMN INDEXES (0-based) IN "INVOICES" SHEET
  // INDEX DES COLONNES (base 0) DANS LA FEUILLE "INVOICES"
  // ---------------------------------------------------------------------------
  COLUMNS: {
    INVOICE_ID: 0,       // Column A - Unique invoice ID (ex: INV2025-001)
    DATE: 1,             // Column B - Invoice date
    CLIENT_NAME: 2,      // Column C - Client full name
    CLIENT_EMAIL: 3,     // Column D - Client email address
    CLIENT_PHONE: 4,     // Column E - Client phone number
    CLIENT_ADDRESS: 5,   // Column F - Client full address
    DESCRIPTION: 6,      // Column G - Product/service description
    QUANTITY: 7,         // Column H - Quantity sold
    UNIT_PRICE: 8,       // Column I - Unit price
    TVA: 9,              // Column J - TVA/VAT percentage or amount
    TOTAL_AMOUNT: 10,    // Column K - Total amount = Qty × Unit Price + TVA
    STATUS: 11,          // Column L - Invoice status
    PDF_URL: 12,         // Column M - Generated PDF link (auto-filled)
    CREATED_AT: 13,      // Column N - Date/time when invoice was created (Draft)
    GENERATED_AT: 14,    // Column O - Date/time when invoice was generated (PDF)
    SENT_AT: 15          // Column P - Date/time when invoice was sent by email
  },

  // ---------------------------------------------------------------------------
  // CLIENT COLUMN INDEXES (0-based) IN "CLIENTS" SHEET
  // INDEX DES COLONNES (base 0) DANS LA FEUILLE "CLIENTS"
  // ---------------------------------------------------------------------------
  CLIENT_COLUMNS: {
    CLIENT_ID: 0,           // Column A - Unique client ID (ex: CLI-001)
    CLIENT_NAME: 1,         // Column B - Client name
    CLIENT_EMAIL: 2,        // Column C - Client email
    CLIENT_PHONE: 3,        // Column D - Client phone
    CLIENT_ADDRESS: 4,      // Column E - Client address
    CLIENT_COUNTRY: 5,      // Column F - Client country (FR, CM, US)
    CLIENT_SIRET: 6,        // Column G - Client SIRET (France)
    CLIENT_VAT_NUMBER: 7,   // Column H - Client VAT number (France)
    CLIENT_NIU: 8,          // Column I - Client NIU (Cameroon)
    CLIENT_TAX_ID: 9,       // Column J - Client Tax ID (USA)
    PAYMENT_TERMS: 10,      // Column K - Payment terms (e.g., "30 days")
    NOTES: 11,              // Column L - Internal notes
    ACTIVE: 12              // Column M - Is client active (TRUE/FALSE)
  },

  // ---------------------------------------------------------------------------
  // SERVICE COLUMN INDEXES (0-based) IN "SERVICES" SHEET
  // INDEX DES COLONNES (base 0) DANS LA FEUILLE "SERVICES"
  // ---------------------------------------------------------------------------
  SERVICE_COLUMNS: {
    SERVICE_ID: 0,       // Column A - Unique service ID (ex: SRV-001)
    SERVICE_NAME: 1,     // Column B - Service/Product name
    DESCRIPTION: 2,      // Column C - Full description
    DEFAULT_PRICE: 3,    // Column D - Default unit price
    CATEGORY: 4,         // Column E - Category (optional)
    VAT_RATE: 5,         // Column F - VAT rate for this service (%)
    UNIT: 6,             // Column G - Unit (hour, day, piece, etc.)
    ACTIVE: 7            // Column H - Is active (TRUE/FALSE)
  },

  // ---------------------------------------------------------------------------
  // COLUMN HEADERS (for validation) / EN-TÊTES DES COLONNES (pour validation)
  // ---------------------------------------------------------------------------
  HEADERS: {
    INVOICE_ID: 'InvoiceID',
    DATE: 'InvoiceDate',
    CLIENT_NAME: 'ClientName',
    CLIENT_EMAIL: 'ClientEmail',
    CLIENT_PHONE: 'ClientPhone',
    CLIENT_ADDRESS: 'ClientAddress',
    DESCRIPTION: 'Description',
    QUANTITY: 'Quantity',
    UNIT_PRICE: 'UnitPrice',
    TVA: 'TVA',
    TOTAL_AMOUNT: 'TotalAmount',
    STATUS: 'Status',
    PDF_URL: 'PDFUrl',
    CREATED_AT: 'CreatedAt',
    GENERATED_AT: 'GeneratedAt',
    SENT_AT: 'SentAt'
  },

  // ---------------------------------------------------------------------------
  // INVOICE STATUSES / STATUTS DES FACTURES
  // ---------------------------------------------------------------------------
  STATUSES: {
    DRAFT: 'Draft',            // Invoice awaiting generation / Facture en attente
    GENERATED: 'Generated',    // Invoice generated, not sent / Facture générée, non envoyée
    SENT: 'Sent'              // Invoice generated and sent / Facture générée et envoyée
  },

  // ---------------------------------------------------------------------------
  // PARAMETER KEYS FOR "SETTINGS" SHEET
  // CLES POUR LA FEUILLE "SETTINGS"
  // ---------------------------------------------------------------------------
  PARAM_KEYS: {
    // General / General
    TEMPLATE_DOCS_ID: 'TEMPLATE_DOCS_ID',           // Google Docs template ID
    DRIVE_FOLDER_ID: 'DRIVE_FOLDER_ID',             // Drive destination folder ID
    SENDER_EMAIL: 'SENDER_EMAIL',                   // Email for sending invoices
    AUTO_SEND_EMAIL: 'AUTO_SEND_EMAIL',             // Auto-send flag (true/false)
    INVOICE_PREFIX: 'INVOICE_PREFIX',               // Invoice number prefix (ex: INV2025-)
    LAST_INVOICE_NUMBER: 'LAST_INVOICE_NUMBER',     // Last used invoice number (auto-increment)

    // Country & Currency / Pays et Devise
    COUNTRY: 'COUNTRY',                             // Country code (FR, CM, US)
    CURRENCY_SYMBOL: 'CURRENCY_SYMBOL',             // Currency symbol (ex: EUR, $, FCFA)
    CURRENCY_CODE: 'CURRENCY_CODE',                 // Currency code (ex: EUR, USD, XAF)
    DATE_FORMAT: 'DATE_FORMAT',                     // Date format (DD/MM/YYYY or MM/DD/YYYY)

    // Company Basic Info / Infos Entreprise de Base
    COMPANY_NAME: 'COMPANY_NAME',                   // Company name
    COMPANY_ADDRESS: 'COMPANY_ADDRESS',             // Company address
    COMPANY_PHONE: 'COMPANY_PHONE',                 // Company phone
    COMPANY_EMAIL: 'COMPANY_EMAIL',                 // Company email
    COMPANY_WEBSITE: 'COMPANY_WEBSITE',             // Company website
    COMPANY_LOGO_URL: 'COMPANY_LOGO_URL',           // Company logo URL

    // France (FR) Legal IDs / Identifiants Legaux France
    COMPANY_SIRET: 'COMPANY_SIRET',                 // SIRET (14 digits)
    COMPANY_SIREN: 'COMPANY_SIREN',                 // SIREN (9 digits)
    COMPANY_VAT_FR: 'COMPANY_VAT_FR',               // N TVA Intracommunautaire
    COMPANY_RCS: 'COMPANY_RCS',                     // RCS + City
    COMPANY_CAPITAL: 'COMPANY_CAPITAL',             // Capital social
    COMPANY_LEGAL_FORM: 'COMPANY_LEGAL_FORM',       // Forme juridique (SARL, SAS, etc.)
    COMPANY_APE_CODE: 'COMPANY_APE_CODE',           // Code APE/NAF
    IS_AUTO_ENTREPRENEUR: 'IS_AUTO_ENTREPRENEUR',   // Auto-entrepreneur regime (true/false)

    // Cameroon (CM) Legal IDs / Identifiants Legaux Cameroun
    COMPANY_NIU: 'COMPANY_NIU',                     // NIU (Numero Identifiant Unique)
    COMPANY_RCCM: 'COMPANY_RCCM',                   // RCCM (Registre Commerce)
    COMPANY_TAX_CENTER: 'COMPANY_TAX_CENTER',       // Centre des impots de rattachement

    // USA (US) Legal IDs / Identifiants Legaux USA
    COMPANY_EIN: 'COMPANY_EIN',                     // EIN (Employer Identification Number)
    COMPANY_STATE_ID: 'COMPANY_STATE_ID',           // State Tax ID
    SALES_TAX_RATE: 'SALES_TAX_RATE',               // Sales tax rate (%)

    // Bank Details / Coordonnees Bancaires
    BANK_NAME: 'BANK_NAME',                         // Bank name
    BANK_IBAN: 'BANK_IBAN',                         // IBAN
    BANK_BIC: 'BANK_BIC',                           // BIC/SWIFT
    BANK_ACCOUNT_NAME: 'BANK_ACCOUNT_NAME',         // Account holder name

    // VAT/Tax Settings / Parametres TVA
    DEFAULT_VAT_RATE: 'DEFAULT_VAT_RATE',           // Default VAT rate
    VAT_RATES_LIST: 'VAT_RATES_LIST',               // Comma-separated VAT rates (e.g., "20,10,5.5,0")

    // Payment Terms / Conditions de Paiement
    DEFAULT_PAYMENT_TERMS: 'DEFAULT_PAYMENT_TERMS', // Default payment terms text
    DEFAULT_PAYMENT_DAYS: 'DEFAULT_PAYMENT_DAYS',   // Default payment days (e.g., 30)

    // Customizable Legal Footer / Footer Legal Personnalisable
    // These fields can be auto-generated at setup OR manually edited after
    LEGAL_FOOTER_CUSTOM: 'LEGAL_FOOTER_CUSTOM',     // Full legal footer text (editable)
    BANK_DETAILS_CUSTOM: 'BANK_DETAILS_CUSTOM',     // Bank details text (editable)
    USE_CUSTOM_FOOTER: 'USE_CUSTOM_FOOTER',         // true = use custom, false = auto-generate

    // Folder Organization / Organisation des Dossiers
    DOCUMENTS_FOLDER_NAME: 'DOCUMENTS_FOLDER_NAME'  // Parent folder name for all client docs (default: DOCUMENTS)
  },

  // ---------------------------------------------------------------------------
  // MARKERS USED IN GOOGLE DOCS TEMPLATE
  // MARQUEURS UTILISES DANS LE TEMPLATE GOOGLE DOCS
  // Changed from <<>> to {{}} for market standard / Change de <<>> vers {{}}
  // ---------------------------------------------------------------------------
  MARKERS: {
    // =========================================================================
    // COMPANY INFORMATION / INFORMATIONS ENTREPRISE
    // =========================================================================
    COMPANY_NAME: '{{COMPANY_NAME}}',
    COMPANY_ADDRESS: '{{COMPANY_ADDRESS}}',
    COMPANY_PHONE: '{{COMPANY_PHONE}}',
    COMPANY_EMAIL: '{{COMPANY_EMAIL}}',
    COMPANY_WEBSITE: '{{COMPANY_WEBSITE}}',
    COMPANY_LOGO: '{{COMPANY_LOGO}}',

    // Company Legal IDs Block (generated dynamically based on country)
    COMPANY_LEGAL_IDS: '{{COMPANY_LEGAL_IDS}}',

    // France (FR) Company IDs
    COMPANY_SIRET: '{{COMPANY_SIRET}}',
    COMPANY_SIREN: '{{COMPANY_SIREN}}',
    COMPANY_VAT_FR: '{{COMPANY_VAT_FR}}',
    COMPANY_RCS: '{{COMPANY_RCS}}',
    COMPANY_CAPITAL: '{{COMPANY_CAPITAL}}',
    COMPANY_LEGAL_FORM: '{{COMPANY_LEGAL_FORM}}',
    COMPANY_APE_CODE: '{{COMPANY_APE_CODE}}',

    // Cameroon (CM) Company IDs
    COMPANY_NIU: '{{COMPANY_NIU}}',
    COMPANY_RCCM: '{{COMPANY_RCCM}}',
    COMPANY_TAX_CENTER: '{{COMPANY_TAX_CENTER}}',

    // USA (US) Company IDs
    COMPANY_EIN: '{{COMPANY_EIN}}',
    COMPANY_STATE_ID: '{{COMPANY_STATE_ID}}',

    // =========================================================================
    // CLIENT INFORMATION / INFORMATIONS CLIENT
    // =========================================================================
    CLIENT_NAME: '{{CLIENT_NAME}}',
    CLIENT_EMAIL: '{{CLIENT_EMAIL}}',
    CLIENT_PHONE: '{{CLIENT_PHONE}}',
    CLIENT_ADDRESS: '{{CLIENT_ADDRESS}}',

    // Client Legal IDs Block (generated dynamically based on country)
    CLIENT_LEGAL_IDS: '{{CLIENT_LEGAL_IDS}}',

    // France (FR) Client IDs
    CLIENT_SIRET: '{{CLIENT_SIRET}}',
    CLIENT_VAT_NUMBER: '{{CLIENT_VAT_NUMBER}}',

    // Cameroon (CM) Client IDs
    CLIENT_NIU: '{{CLIENT_NIU}}',

    // USA (US) Client IDs
    CLIENT_TAX_ID: '{{CLIENT_TAX_ID}}',

    // =========================================================================
    // INVOICE INFORMATION / INFORMATIONS FACTURE
    // =========================================================================
    INVOICE_ID: '{{INVOICE_ID}}',
    INVOICE_DATE: '{{INVOICE_DATE}}',
    INVOICE_DUE_DATE: '{{INVOICE_DUE_DATE}}',
    DELIVERY_DATE: '{{DELIVERY_DATE}}',
    PO_NUMBER: '{{PO_NUMBER}}',
    PAYMENT_TERMS: '{{PAYMENT_TERMS}}',

    // =========================================================================
    // LINE ITEMS / LIGNES DE FACTURE
    // =========================================================================
    DESCRIPTION: '{{DESCRIPTION}}',
    QUANTITY: '{{QUANTITY}}',
    UNIT_PRICE: '{{UNIT_PRICE}}',
    LINE_VAT_RATE: '{{LINE_VAT_RATE}}',
    LINE_VAT_AMOUNT: '{{LINE_VAT_AMOUNT}}',
    LINE_TOTAL: '{{LINE_TOTAL}}',

    // Items Table (for multi-line invoices - generated dynamically)
    ITEMS_TABLE: '{{ITEMS_TABLE}}',

    // =========================================================================
    // TOTALS AND AMOUNTS / TOTAUX ET MONTANTS
    // =========================================================================
    SUBTOTAL_HT: '{{SUBTOTAL_HT}}',
    TVA: '{{TVA}}',
    TVA_SUMMARY: '{{TVA_SUMMARY}}',
    TOTAL_TVA: '{{TOTAL_TVA}}',
    TOTAL_TTC: '{{TOTAL_TTC}}',
    TOTAL_AMOUNT: '{{TOTAL_AMOUNT}}',
    DISCOUNT: '{{DISCOUNT}}',
    DEPOSIT_PAID: '{{DEPOSIT_PAID}}',
    BALANCE_DUE: '{{BALANCE_DUE}}',

    // Amount in words (required for Cameroon)
    AMOUNT_IN_WORDS: '{{AMOUNT_IN_WORDS}}',
    AMOUNT_IN_WORDS_BLOCK: '{{AMOUNT_IN_WORDS_BLOCK}}',

    // =========================================================================
    // BANK DETAILS / COORDONNEES BANCAIRES
    // =========================================================================
    BANK_DETAILS: '{{BANK_DETAILS}}',
    BANK_NAME: '{{BANK_NAME}}',
    BANK_IBAN: '{{BANK_IBAN}}',
    BANK_BIC: '{{BANK_BIC}}',
    BANK_ACCOUNT_NAME: '{{BANK_ACCOUNT_NAME}}',

    // =========================================================================
    // LEGAL FOOTER / MENTIONS LEGALES
    // =========================================================================
    LEGAL_FOOTER: '{{LEGAL_FOOTER}}',
    VAT_EXEMPTION_NOTICE: '{{VAT_EXEMPTION_NOTICE}}',
    LATE_PAYMENT_NOTICE: '{{LATE_PAYMENT_NOTICE}}',
    SALES_TAX_NOTICE: '{{SALES_TAX_NOTICE}}',

    // =========================================================================
    // LABELS (TRANSLATED) / ETIQUETTES (TRADUITES)
    // =========================================================================
    LABEL_INVOICE: '{{LABEL_INVOICE}}',
    LABEL_INVOICE_NUMBER: '{{LABEL_INVOICE_NUMBER}}',
    LABEL_DATE: '{{LABEL_DATE}}',
    LABEL_DUE_DATE: '{{LABEL_DUE_DATE}}',
    LABEL_DELIVERY_DATE: '{{LABEL_DELIVERY_DATE}}',
    LABEL_BILLED_TO: '{{LABEL_BILLED_TO}}',
    LABEL_DESCRIPTION: '{{LABEL_DESCRIPTION}}',
    LABEL_QTY: '{{LABEL_QTY}}',
    LABEL_UNIT_PRICE: '{{LABEL_UNIT_PRICE}}',
    LABEL_TVA: '{{LABEL_TVA}}',
    LABEL_TVA_RATE: '{{LABEL_TVA_RATE}}',
    LABEL_TOTAL: '{{LABEL_TOTAL}}',
    LABEL_SUBTOTAL: '{{LABEL_SUBTOTAL}}',
    LABEL_TOTAL_VAT: '{{LABEL_TOTAL_VAT}}',
    LABEL_TOTAL_TTC: '{{LABEL_TOTAL_TTC}}',
    LABEL_TOTAL_DUE: '{{LABEL_TOTAL_DUE}}',
    LABEL_PAYMENT_TERMS: '{{LABEL_PAYMENT_TERMS}}',
    LABEL_BANK_DETAILS: '{{LABEL_BANK_DETAILS}}',
    LABEL_NOTES: '{{LABEL_NOTES}}',
    LABEL_FOOTER: '{{LABEL_FOOTER}}'
  },

  // ---------------------------------------------------------------------------
  // SUPPORTED CURRENCIES / DEVISES SUPPORTÉES
  // ---------------------------------------------------------------------------
  CURRENCIES: {
    EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
    USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
    GBP: { symbol: '£', code: 'GBP', name: 'British Pound' },
    XAF: { symbol: 'FCFA', code: 'XAF', name: 'Franc CFA' },
    CHF: { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc' },
    CAD: { symbol: 'CAD $', code: 'CAD', name: 'Canadian Dollar' },
    MAD: { symbol: 'DH', code: 'MAD', name: 'Moroccan Dirham' },
    XOF: { symbol: 'FCFA', code: 'XOF', name: 'Franc CFA (West Africa)' }
  },

  // ---------------------------------------------------------------------------
  // FORMATTING OPTIONS / OPTIONS DE FORMATAGE
  // ---------------------------------------------------------------------------
  FORMAT: {
    DATE_LOCALE: 'en-US',           // Date formatting locale (en-US or fr-FR)
    DECIMAL_PLACES: 2               // Number of decimal places
  },

  // ---------------------------------------------------------------------------
  // MESSAGES AND TEXTS (English/French)
  // MESSAGES ET TEXTES (Anglais/Français)
  // ---------------------------------------------------------------------------
  MESSAGES: {
    EN: {
      SUCCESS_GENERATION: '✅ Invoice generated successfully',
      SUCCESS_EMAIL: '✅ Invoice sent by email',
      ERROR_NO_DATA: '❌ No data found for this ID',
      ERROR_MISSING_PARAMS: '❌ Missing parameters in Settings sheet',
      ERROR_TEMPLATE_NOT_FOUND: '❌ Google Docs template not found',
      ERROR_FOLDER_NOT_FOUND: '❌ Drive folder not found',
      NO_PENDING_INVOICES: 'ℹ️ No draft invoices to generate'
    },
    FR: {
      SUCCESS_GENERATION: '✅ Facture générée avec succès',
      SUCCESS_EMAIL: '✅ Facture envoyée par email',
      ERROR_NO_DATA: '❌ Aucune donnée trouvée pour cet ID',
      ERROR_MISSING_PARAMS: '❌ Paramètres manquants dans la feuille Parametres',
      ERROR_TEMPLATE_NOT_FOUND: '❌ Template Google Docs introuvable',
      ERROR_FOLDER_NOT_FOUND: '❌ Dossier Drive introuvable',
      NO_PENDING_INVOICES: 'ℹ️ Aucune facture en brouillon à générer'
    }
  },

  // ---------------------------------------------------------------------------
  // APPLICATION INFO / INFORMATIONS APPLICATION
  // ---------------------------------------------------------------------------
  APP: {
    NAME: 'InvoiceFlash',
    VERSION: '2.0',
    TAGLINE: 'Multi-Country Invoice Generator (FR/CM/US)',
    AUTHOR: 'Nelly TCHIENGUE',
    LICENSE: 'Commercial - Single User License',
    SUPPORT_EMAIL: 'nelly@tpmn.app'
  }
};

// ============================================================================
// HELPER FUNCTIONS / FONCTIONS D'AIDE
// ============================================================================

/**
 * Returns the complete configuration
 * Retourne la configuration complète
 * @returns {Object} INVOICE_CONFIG
 */
function getInvoiceConfig() {
  return INVOICE_CONFIG;
}

/**
 * Gets messages in the specified language
 * Récupère les messages dans la langue spécifiée
 * @param {string} lang - Language code ('EN' or 'FR')
 * @returns {Object} Messages object
 */
function getMessages(lang = 'EN') {
  return INVOICE_CONFIG.MESSAGES[lang] || INVOICE_CONFIG.MESSAGES.EN;
}

/**
 * Detects the user's preferred language from spreadsheet locale
 * Détecte la langue préférée de l'utilisateur depuis les paramètres régionaux
 * @returns {string} Language code ('EN' or 'FR')
 */
function detectUserLanguage() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const locale = ss.getSpreadsheetLocale();

    // French locales
    if (locale.startsWith('fr')) return 'FR';

    // Default to English
    return 'EN';
  } catch (error) {
    return 'EN';
  }
}

// ============================================================================
// UI MESSAGES (BILINGUAL)
// ============================================================================

const UI_MESSAGES = {
  EN: {
    // Menu
    MENU_TITLE: '📄 Invoices',
    MENU_GENERATE_ALL: '✨ Generate all invoices',
    MENU_GENERATE_SINGLE: '🔍 Generate specific invoice',
    MENU_SEND_EMAIL: '📧 Send invoice by email',
    MENU_STATISTICS: '📈 View statistics',
    MENU_SETUP_INSTALLATION: '⚙️ Settings setup for first installation',
    MENU_TEST_PERMISSIONS: '⚙️ Test permissions',
    MENU_ABOUT: 'ℹ️ About',

    // Dialogs
    GENERATE_ALL_TITLE: 'Generate Invoices',
    GENERATE_ALL_CONFIRM: 'Do you want to generate all draft invoices?',
    OPERATION_CANCELLED: 'Operation cancelled',
    PROCESSING: 'Processing...',
    PLEASE_WAIT: 'Please wait',

    // Prompts
    ENTER_INVOICE_ID: 'Enter the invoice ID to generate (e.g., INV2025-001):',
    INVOICE_ID_MISSING: 'Invoice ID missing',
    ENTER_INVOICE_ID_SEND: 'Enter the invoice ID to send (e.g., INV2025-001):',

    // Results
    RESULT_TITLE: 'Result',
    SUCCESS_TITLE: 'Success',
    ERROR_TITLE: 'Error',
    INFO_TITLE: 'Information',
    DETAILS_LABEL: 'Details:',

    // Statistics
    STATS_TITLE: '📈 INVOICE STATISTICS',
    STATS_TOTAL: 'Total invoices',
    STATS_BY_STATUS: 'By status:',
    STATS_DRAFT: 'Draft',
    STATS_GENERATED: 'Generated',
    STATS_SENT: 'Sent',
    STATS_ERROR: 'Unable to retrieve statistics',

    // Test Permissions
    TEST_IN_PROGRESS: 'Test in progress...',
    TEST_VERIFYING: 'Verifying permissions',
    TEST_TITLE: 'Test Results',
    TEST_SUCCESS: '✅ ALL TESTS PASSED',
    TEST_FAILURE: '❌ SOME TESTS FAILED',
    TEST_ERROR: 'Error during tests',

    // About
    ABOUT_TITLE: 'About',
    ABOUT_SYSTEM: '📄 AUTOMATIC INVOICE GENERATION SYSTEM',
    ABOUT_VERSION: 'Version',
    ABOUT_DATE: 'Date',
    ABOUT_FEATURES: 'Features:',
    ABOUT_FEATURE_1: '✨ Automatic PDF invoice generation',
    ABOUT_FEATURE_2: '📧 Automatic email sending (optional)',
    ABOUT_FEATURE_3: '📈 Statistics and tracking',
    ABOUT_FEATURE_4: '🔐 Data validation',
    ABOUT_README: 'For any questions, consult the README.md',

    // Summary
    SUMMARY_COMPLETED: '✅ Generation completed',
    SUMMARY_SUCCESS: 'successful',
    SUMMARY_FAILED: 'failed',
    SUMMARY_OUT_OF: 'out of',
    SUMMARY_INVOICES: 'invoice(s)'
  },

  FR: {
    // Menu
    MENU_TITLE: '📄 Factures',
    MENU_GENERATE_ALL: '✨ Générer toutes les factures',
    MENU_GENERATE_SINGLE: '🔍 Générer une facture spécifique',
    MENU_SEND_EMAIL: '📧 Envoyer une facture par email',
    MENU_STATISTICS: '📈 Voir les statistiques',
    MENU_SETUP_INSTALLATION: '⚙️ Mise en place des paramètres avant première utilisation',
    MENU_TEST_PERMISSIONS: '⚙️ Tester les permissions',
    MENU_ABOUT: 'ℹ️ À propos',

    // Dialogs
    GENERATE_ALL_TITLE: 'Générer les factures',
    GENERATE_ALL_CONFIRM: 'Voulez-vous générer toutes les factures en brouillon ?',
    OPERATION_CANCELLED: 'Opération annulée',
    PROCESSING: 'Génération en cours...',
    PLEASE_WAIT: 'Veuillez patienter',

    // Prompts
    ENTER_INVOICE_ID: 'Entrez l\'ID de la facture à générer (ex: INV2025-001):',
    INVOICE_ID_MISSING: 'ID de facture manquant',
    ENTER_INVOICE_ID_SEND: 'Entrez l\'ID de la facture à envoyer (ex: INV2025-001):',

    // Results
    RESULT_TITLE: 'Résultat',
    SUCCESS_TITLE: 'Succès',
    ERROR_TITLE: 'Erreur',
    INFO_TITLE: 'Information',
    DETAILS_LABEL: 'Détails:',

    // Statistics
    STATS_TITLE: '📈 STATISTIQUES DES FACTURES',
    STATS_TOTAL: 'Total de factures',
    STATS_BY_STATUS: 'Par statut:',
    STATS_DRAFT: 'Brouillon',
    STATS_GENERATED: 'Générée',
    STATS_SENT: 'Envoyée',
    STATS_ERROR: 'Impossible de récupérer les statistiques',

    // Test Permissions
    TEST_IN_PROGRESS: 'Test en cours...',
    TEST_VERIFYING: 'Vérification des permissions',
    TEST_TITLE: 'Résultats des tests',
    TEST_SUCCESS: '✅ TOUS LES TESTS SONT PASSÉS',
    TEST_FAILURE: '❌ CERTAINS TESTS ONT ÉCHOUÉ',
    TEST_ERROR: 'Erreur lors des tests',

    // About
    ABOUT_TITLE: 'À propos',
    ABOUT_SYSTEM: '📄 SYSTÈME DE GÉNÉRATION AUTOMATIQUE DE FACTURES',
    ABOUT_VERSION: 'Version',
    ABOUT_DATE: 'Date',
    ABOUT_FEATURES: 'Fonctionnalités:',
    ABOUT_FEATURE_1: '✨ Génération automatique de factures PDF',
    ABOUT_FEATURE_2: '📧 Envoi automatique par email (optionnel)',
    ABOUT_FEATURE_3: '📈 Statistiques et suivi',
    ABOUT_FEATURE_4: '🔐 Validation des données',
    ABOUT_README: 'Pour toute question, consultez le README.md',

    // Summary
    SUMMARY_COMPLETED: '✅ Génération terminée',
    SUMMARY_SUCCESS: 'réussie(s)',
    SUMMARY_FAILED: 'échouée(s)',
    SUMMARY_OUT_OF: 'sur',
    SUMMARY_INVOICES: 'facture(s)'
  }
};

/**
 * Gets UI messages in the configured locale
 * @returns {Object} Messages object
 */
function getUIMessages() {
  // Try to get configured locale from Settings first
  const configuredLocale = getParam('LOCALE');
  if (configuredLocale === 'EN' || configuredLocale === 'FR') {
    return UI_MESSAGES[configuredLocale];
  }

  // Fallback to auto-detection
  const detectedLang = detectUserLanguage();
  return UI_MESSAGES[detectedLang] || UI_MESSAGES.EN;
}

// ============================================================================
// INVOICE LABELS (BILINGUAL)
// ============================================================================

const INVOICE_LABELS = {
  EN: {
    LABEL_INVOICE: 'INVOICE',
    LABEL_INVOICE_NUMBER: 'Invoice #',
    LABEL_DATE: 'Date',
    LABEL_DUE_DATE: 'Due Date',
    LABEL_BILLED_TO: 'Billed To / Client',
    LABEL_DESCRIPTION: 'DESCRIPTION',
    LABEL_QTY: 'QUANTITY',
    LABEL_UNIT_PRICE: 'UNIT PRICE',
    LABEL_TVA: 'VAT',
    LABEL_TOTAL: 'LINE TOTAL',
    LABEL_FOOTER: 'Thank you for your business.'
  },

  FR: {
    LABEL_INVOICE: 'FACTURE',
    LABEL_INVOICE_NUMBER: 'Facture n°',
    LABEL_DATE: 'Date',
    LABEL_DUE_DATE: "Date d'échéance",
    LABEL_BILLED_TO: 'Facturé à / Client',
    LABEL_DESCRIPTION: 'DÉSIGNATION',
    LABEL_QTY: 'QUANTITÉ',
    LABEL_UNIT_PRICE: 'PRIX UNITAIRE',
    LABEL_TVA: 'TVA',
    LABEL_TOTAL: 'TOTAL',
    LABEL_FOOTER: 'Merci pour votre confiance.'
  }
};

/**
 * Gets invoice labels in the configured locale
 * @returns {Object} Labels object
 */
function getInvoiceLabels() {
  const configuredLocale = getParam('LOCALE');
  if (configuredLocale === 'EN' || configuredLocale === 'FR') {
    return INVOICE_LABELS[configuredLocale];
  }
  const detectedLang = detectUserLanguage();
  return INVOICE_LABELS[detectedLang] || INVOICE_LABELS.EN;
}

// ============================================================================
// EMAIL TEMPLATES (BILINGUAL)
// ============================================================================

const EMAIL_TEMPLATES = {
  EN: {
    subject: (invoiceId, companyName) => `Invoice #${invoiceId} - ${companyName}`,
    body: (data) => `Dear ${data.clientName},

Please find attached your invoice #${data.invoiceId} for the amount of ${data.totalAmountFormatted}.

Invoice details:
- Date: ${data.dateFormatted}
- Description: ${data.description}
- Quantity: ${data.quantity}
- Unit price: ${data.unitPriceFormatted}

Please feel free to contact us if you have any questions.

Best regards,
${data.companyName}
${data.companyPhone}
${data.companyEmail}`
  },

  FR: {
    subject: (invoiceId, companyName) => `Facture n°${invoiceId} - ${companyName}`,
    body: (data) => `Bonjour ${data.clientName},

Veuillez trouver ci-joint votre facture n°${data.invoiceId} d'un montant de ${data.totalAmountFormatted}.

Détails de la facture :
- Date : ${data.dateFormatted}
- Désignation : ${data.description}
- Quantité : ${data.quantity}
- Prix unitaire : ${data.unitPriceFormatted}

Nous restons à votre disposition pour toute question.

Cordialement,
${data.companyName}
${data.companyPhone}
${data.companyEmail}`
  }
};

/**
 * Gets email template in the configured locale
 * @returns {Object} Email template object with subject and body functions
 */
function getEmailTemplate() {
  // Try to get configured locale from Settings first
  const configuredLocale = getParam('LOCALE');
  if (configuredLocale === 'EN' || configuredLocale === 'FR') {
    return EMAIL_TEMPLATES[configuredLocale];
  }

  // Fallback to auto-detection
  const detectedLang = detectUserLanguage();
  return EMAIL_TEMPLATES[detectedLang] || EMAIL_TEMPLATES.EN;
}