/**
 * @file 00_Config.js
 * @description Centralized configuration for automatic invoice generation system
 *              Configuration centralisée pour le système de génération de factures automatiques
 * @version 1.1 (Gumroad Edition)
 * @date 2025-12-11
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
    CLIENTS: 'Clients'                 // Sheet containing clients data / Feuille de la base des clients
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
    TOTAL_AMOUNT: 9,     // Column J - Total amount = Qty × Unit Price
    STATUS: 10,          // Column K - Invoice status
    PDF_URL: 11          // Column L - Generated PDF link (auto-filled)
  },

  CLIENT_COLUMNS: {
    CLIENT_ID: 0,
    CLIENT_NAME: 1,
    CLIENT_EMAIL: 2,
    CLIENT_PHONE: 3,
    CLIENT_ADDRESS: 4
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
    TOTAL_AMOUNT: 'TotalAmount',
    STATUS: 'Status',
    PDF_URL: 'PDFUrl'
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
  // CLÉS POUR LA FEUILLE "SETTINGS"
  // ---------------------------------------------------------------------------
  PARAM_KEYS: {
    TEMPLATE_DOCS_ID: 'TEMPLATE_DOCS_ID',           // Google Docs template ID
    DRIVE_FOLDER_ID: 'DRIVE_FOLDER_ID',             // Drive destination folder ID
    SENDER_EMAIL: 'SENDER_EMAIL',                   // Email for sending invoices
    AUTO_SEND_EMAIL: 'AUTO_SEND_EMAIL',             // Auto-send flag (true/false)
    COMPANY_NAME: 'COMPANY_NAME',                   // Company name
    COMPANY_ADDRESS: 'COMPANY_ADDRESS',             // Company address
    COMPANY_PHONE: 'COMPANY_PHONE',                 // Company phone
    COMPANY_EMAIL: 'COMPANY_EMAIL',                 // Company email
    INVOICE_PREFIX: 'INVOICE_PREFIX',               // Invoice number prefix (ex: INV2025-)
    LAST_INVOICE_NUMBER: 'LAST_INVOICE_NUMBER'      // Last used invoice number (auto-increment)
  },

  // ---------------------------------------------------------------------------
  // MARKERS USED IN GOOGLE DOCS TEMPLATE
  // MARQUEURS UTILISÉS DANS LE TEMPLATE GOOGLE DOCS
  // Changed from <<>> to {{}} for market standard / Changé de <<>> vers {{}}
  // ---------------------------------------------------------------------------
  MARKERS: {
    // Company information / Informations entreprise
    COMPANY_NAME: '{{COMPANY_NAME}}',
    COMPANY_ADDRESS: '{{COMPANY_ADDRESS}}',
    COMPANY_PHONE: '{{COMPANY_PHONE}}',
    COMPANY_EMAIL: '{{COMPANY_EMAIL}}',

    // Invoice information / Informations facture
    INVOICE_ID: '{{INVOICE_ID}}',
    INVOICE_DATE: '{{INVOICE_DATE}}',

    // Client information / Informations client
    CLIENT_NAME: '{{CLIENT_NAME}}',
    CLIENT_EMAIL: '{{CLIENT_EMAIL}}',
    CLIENT_PHONE: '{{CLIENT_PHONE}}',
    CLIENT_ADDRESS: '{{CLIENT_ADDRESS}}',

    // Transaction details / Détails de la transaction
    DESCRIPTION: '{{DESCRIPTION}}',
    QUANTITY: '{{QUANTITY}}',
    UNIT_PRICE: '{{UNIT_PRICE}}',
    TOTAL_AMOUNT: '{{TOTAL_AMOUNT}}',
    AMOUNT_IN_WORDS: '{{AMOUNT_IN_WORDS}}'
  },

  // ---------------------------------------------------------------------------
  // FORMATTING OPTIONS / OPTIONS DE FORMATAGE
  // ---------------------------------------------------------------------------
  FORMAT: {
    DATE_LOCALE: 'en-US',           // Date formatting locale (en-US or fr-FR)
    CURRENCY: '$',                  // Currency symbol ($ or € or FCFA)
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
    VERSION: '1.1',
    TAGLINE: 'One-Click Invoice Generator',
    AUTHOR: 'Nelly Tchiengue',
    LICENSE: 'Commercial - Single User License',
    SUPPORT_EMAIL: 'support@invoiceflash.com'
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
    MENU_STATISTICS: '📊 View statistics',
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
    STATS_TITLE: '📊 INVOICE STATISTICS',
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
    ABOUT_FEATURE_3: '📊 Statistics and tracking',
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
    MENU_STATISTICS: '📊 Voir les statistiques',
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
    STATS_TITLE: '📊 STATISTIQUES DES FACTURES',
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
    ABOUT_FEATURE_3: '📊 Statistiques et suivi',
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

Détails de la facture:
- Date: ${data.dateFormatted}
- Désignation: ${data.description}
- Quantité: ${data.quantity}
- Prix unitaire: ${data.unitPriceFormatted}

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
