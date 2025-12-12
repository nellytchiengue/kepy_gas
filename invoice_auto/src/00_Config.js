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
    SETTINGS: 'Settings'               // Sheet containing configuration / Feuille de configuration
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
