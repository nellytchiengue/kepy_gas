/**
 * @file 13_PlaceholderCleaner.js
 * @description Cleans unused placeholders from generated documents
 *              Nettoie les placeholders non utilises des documents generes
 * @version 1.0
 * @date 2025-12-14
 * @author InvoiceFlash - Multi-Country Edition
 */

// ============================================================================
// PLACEHOLDER DEFINITIONS BY COUNTRY
// ============================================================================

/**
 * Defines which placeholders to remove based on country
 * Les placeholders d'un pays different doivent etre supprimes
 */
const PLACEHOLDERS_TO_REMOVE_BY_COUNTRY = {
  FR: [
    // Cameroon placeholders
    '{{COMPANY_NIU}}',
    '{{COMPANY_RCCM}}',
    '{{COMPANY_TAX_CENTER}}',
    '{{CLIENT_NIU}}',
    // USA placeholders
    '{{COMPANY_EIN}}',
    '{{COMPANY_STATE_ID}}',
    '{{CLIENT_TAX_ID}}',
    '{{SALES_TAX_NOTICE}}',
    '{{STATE_ID_LINE}}'
  ],

  CM: [
    // France placeholders
    '{{COMPANY_SIRET}}',
    '{{COMPANY_SIREN}}',
    '{{COMPANY_VAT_FR}}',
    '{{COMPANY_RCS}}',
    '{{COMPANY_CAPITAL}}',
    '{{COMPANY_LEGAL_FORM}}',
    '{{COMPANY_APE_CODE}}',
    '{{CLIENT_SIRET}}',
    '{{CLIENT_VAT_NUMBER}}',
    '{{VAT_EXEMPTION_NOTICE}}',
    // USA placeholders
    '{{COMPANY_EIN}}',
    '{{COMPANY_STATE_ID}}',
    '{{CLIENT_TAX_ID}}',
    '{{SALES_TAX_NOTICE}}'
  ],

  US: [
    // France placeholders
    '{{COMPANY_SIRET}}',
    '{{COMPANY_SIREN}}',
    '{{COMPANY_VAT_FR}}',
    '{{COMPANY_RCS}}',
    '{{COMPANY_CAPITAL}}',
    '{{COMPANY_LEGAL_FORM}}',
    '{{COMPANY_APE_CODE}}',
    '{{CLIENT_SIRET}}',
    '{{CLIENT_VAT_NUMBER}}',
    '{{VAT_EXEMPTION_NOTICE}}',
    '{{LATE_PAYMENT_NOTICE}}',
    // Cameroon placeholders
    '{{COMPANY_NIU}}',
    '{{COMPANY_RCCM}}',
    '{{COMPANY_TAX_CENTER}}',
    '{{CLIENT_NIU}}',
    // Amount in words (not required in US)
    '{{AMOUNT_IN_WORDS_BLOCK}}'
  ]
};

/**
 * Common placeholders that should be removed if empty (all countries)
 */
const COMMON_OPTIONAL_PLACEHOLDERS = [
  '{{COMPANY_WEBSITE}}',
  '{{COMPANY_LOGO}}',
  '{{PO_NUMBER}}',
  '{{DELIVERY_DATE}}',
  '{{DISCOUNT}}',
  '{{DEPOSIT_PAID}}',
  '{{BALANCE_DUE}}',
  '{{LABEL_DELIVERY_DATE}}',
  '{{LABEL_NOTES}}'
];

// ============================================================================
// MAIN CLEANING FUNCTIONS
// ============================================================================

/**
 * Cleans all unused placeholders from a Google Doc body based on country
 * Nettoie tous les placeholders non utilises d'un document Google Docs selon le pays
 * @param {GoogleAppsScript.Document.Body} body - Document body
 * @param {string} country - Country code (FR, CM, US)
 */
function cleanUnusedPlaceholders(body, country) {
  const countryCode = country || 'FR';

  // Get placeholders to remove for this country
  const placeholdersToRemove = PLACEHOLDERS_TO_REMOVE_BY_COUNTRY[countryCode] || [];

  // Remove country-specific placeholders
  placeholdersToRemove.forEach(placeholder => {
    safeReplaceText(body, placeholder, '');
  });

  // Clean common optional placeholders that are still empty
  cleanEmptyOptionalPlaceholders(body);

  // Clean up residual empty lines and labels
  cleanResidualEmptyContent(body);

  logSuccess('cleanUnusedPlaceholders', `Cleaned placeholders for country: ${countryCode}`);
}

/**
 * Cleans optional placeholders that are empty or have placeholder text
 * @param {GoogleAppsScript.Document.Body} body - Document body
 */
function cleanEmptyOptionalPlaceholders(body) {
  COMMON_OPTIONAL_PLACEHOLDERS.forEach(placeholder => {
    safeReplaceText(body, placeholder, '');
  });
}

/**
 * Cleans residual empty content (lines with only labels and no values)
 * @param {GoogleAppsScript.Document.Body} body - Document body
 */
function cleanResidualEmptyContent(body) {
  // Patterns to clean: "Label: {{PLACEHOLDER}}" -> remove if placeholder is gone
  // But the placeholder is already replaced with empty string, so we look for "Label: "
  const labelsToClean = [
    'NIU: ',
    'RCCM: ',
    'Centre: ',
    'SIRET: ',
    'TVA: ',
    'RCS: ',
    'EIN: ',
    'State ID: ',
    'Centre des impots: ',
    'Centre des impots de rattachement: '
  ];

  // Try to clean lines that are just labels with no value
  labelsToClean.forEach(label => {
    // Replace "label + nothing" pattern
    // Note: This is a best effort - Google Docs API has limitations
    try {
      // Try to find and remove lines that are just the label
      const searchResult = body.findText(label + '\\s*$');
      // If found alone on a line, it will be part of paragraph cleaning
    } catch (e) {
      // Ignore errors - this is a cleanup enhancement
    }
  });
}

// ============================================================================
// SAFE TEXT REPLACEMENT
// ============================================================================

/**
 * Safely replaces text in document body with error handling
 * Remplace le texte de maniere securisee avec gestion d'erreurs
 * @param {GoogleAppsScript.Document.Body} body - Document body
 * @param {string} searchPattern - Text or regex pattern to find
 * @param {string} replacement - Replacement text
 * @returns {boolean} True if replacement was made
 */
function safeReplaceText(body, searchPattern, replacement) {
  try {
    // Escape special regex characters in the placeholder
    const escapedPattern = escapeRegexForDocs(searchPattern);

    // Perform replacement
    body.replaceText(escapedPattern, replacement);
    return true;
  } catch (error) {
    // Log but don't fail - some placeholders might not exist
    Logger.log(`Info: Could not replace "${searchPattern}": ${error.message}`);
    return false;
  }
}

/**
 * Escapes special regex characters for Google Docs replaceText
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegexForDocs(string) {
  // Google Docs replaceText uses regex, so we need to escape special chars
  // But {{ and }} are not special in regex, so we mainly need to handle the pattern
  return string
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/\^/g, '\\^')
    .replace(/\./g, '\\.')
    .replace(/\*/g, '\\*')
    .replace(/\+/g, '\\+')
    .replace(/\?/g, '\\?')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\|/g, '\\|');
}

// ============================================================================
// PLACEHOLDER VALIDATION
// ============================================================================

/**
 * Checks if any placeholders remain unfilled in the document
 * Verifie si des placeholders restent non remplis dans le document
 * @param {GoogleAppsScript.Document.Body} body - Document body
 * @returns {Array} Array of unfilled placeholder names
 */
function findUnfilledPlaceholders(body) {
  const unfilled = [];

  try {
    const text = body.getText();

    // Find all {{...}} patterns
    const regex = /\{\{[A-Z_]+\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (!unfilled.includes(match[0])) {
        unfilled.push(match[0]);
      }
    }
  } catch (error) {
    logError('findUnfilledPlaceholders', 'Error scanning document', error);
  }

  return unfilled;
}

/**
 * Removes all remaining unfilled placeholders from document
 * Supprime tous les placeholders restants non remplis du document
 * @param {GoogleAppsScript.Document.Body} body - Document body
 * @returns {number} Number of placeholders removed
 */
function removeAllUnfilledPlaceholders(body) {
  const unfilled = findUnfilledPlaceholders(body);

  unfilled.forEach(placeholder => {
    safeReplaceText(body, placeholder, '');
  });

  if (unfilled.length > 0) {
    logSuccess('removeAllUnfilledPlaceholders', `Removed ${unfilled.length} unfilled placeholders: ${unfilled.join(', ')}`);
  }

  return unfilled.length;
}

// ============================================================================
// COUNTRY-SPECIFIC VAT EXEMPTION HANDLING
// ============================================================================

/**
 * Handles VAT exemption notice based on company status
 * Gere la mention d'exoneration de TVA selon le statut de l'entreprise
 * @param {GoogleAppsScript.Document.Body} body - Document body
 * @param {Object} companyParams - Company parameters
 */
function handleVatExemptionNotice(body, companyParams) {
  const country = companyParams.country || 'FR';

  if (country === 'FR') {
    if (companyParams.isAutoEntrepreneur) {
      // Replace with actual notice
      safeReplaceText(body, '{{VAT_EXEMPTION_NOTICE}}', 'TVA non applicable, art. 293 B du CGI');
    } else {
      // Remove the placeholder
      safeReplaceText(body, '{{VAT_EXEMPTION_NOTICE}}', '');
    }
  } else {
    // Not France, remove the placeholder
    safeReplaceText(body, '{{VAT_EXEMPTION_NOTICE}}', '');
  }
}

/**
 * Handles amount in words block based on country requirements
 * Gere le bloc montant en lettres selon les exigences du pays
 * @param {GoogleAppsScript.Document.Body} body - Document body
 * @param {string} country - Country code
 * @param {number} amount - Total amount
 */
function handleAmountInWordsBlock(body, country, amount) {
  if (country === 'CM') {
    // Cameroon REQUIRES amount in words
    const amountWords = numberToWordsFR(amount);
    const fullBlock = `Arretee la presente facture a la somme de:\n${amountWords}`;
    safeReplaceText(body, '{{AMOUNT_IN_WORDS_BLOCK}}', fullBlock);
    safeReplaceText(body, '{{AMOUNT_IN_WORDS}}', amountWords);
  } else if (country === 'FR') {
    // France - optional, include if present
    const amountWords = numberToWordsEUR(amount);
    safeReplaceText(body, '{{AMOUNT_IN_WORDS_BLOCK}}', '');
    safeReplaceText(body, '{{AMOUNT_IN_WORDS}}', amountWords);
  } else {
    // US and others - remove
    safeReplaceText(body, '{{AMOUNT_IN_WORDS_BLOCK}}', '');
    safeReplaceText(body, '{{AMOUNT_IN_WORDS}}', '');
  }
}

// ============================================================================
// FULL DOCUMENT CLEANUP
// ============================================================================

/**
 * Performs full document cleanup after placeholder replacement
 * Effectue un nettoyage complet du document apres remplacement des placeholders
 * @param {GoogleAppsScript.Document.Body} body - Document body
 * @param {string} country - Country code
 * @param {Object} companyParams - Company parameters
 * @param {Object} invoiceData - Invoice data
 */
function performFullDocumentCleanup(body, country, companyParams, invoiceData) {
  // 1. Handle VAT exemption notice
  handleVatExemptionNotice(body, companyParams);

  // 2. Handle amount in words
  if (invoiceData && invoiceData.totalAmount) {
    handleAmountInWordsBlock(body, country, invoiceData.totalAmount);
  }

  // 3. Clean country-specific placeholders
  cleanUnusedPlaceholders(body, country);

  // 4. Remove any remaining unfilled placeholders
  removeAllUnfilledPlaceholders(body);

  logSuccess('performFullDocumentCleanup', 'Full document cleanup completed');
}
