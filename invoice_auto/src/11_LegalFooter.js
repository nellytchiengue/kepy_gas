/**
 * @file 11_LegalFooter.js
 * @description Dynamic legal footer generation based on country (FR/CM/US) AND language (FR/EN)
 *              Generation dynamique du footer legal selon le pays ET la langue
 * @version 2.0
 * @date 2025-12-16
 * @author InvoiceFlash - Multi-Country Edition
 *
 * IMPORTANT: This file separates:
 * - COUNTRY (FR/CM/US) = which legal requirements apply (regulations)
 * - LANGUAGE (FR/EN) = which language to display the text in
 */

// ============================================================================
// MAIN FUNCTION / FONCTION PRINCIPALE
// ============================================================================

/**
 * Generates the complete legal footer based on country AND language
 * Genere le footer legal complet selon le pays ET la langue
 * @param {string} country - Country code for regulations (FR, CM, US)
 * @param {Object} companyParams - Company parameters (from getCompanyParams())
 * @param {Object} invoiceData - Invoice data (for amount in words, etc.)
 * @param {string} lang - Display language (FR or EN) - optional, defaults to configured locale
 * @returns {string} Complete legal footer text
 */
function generateLegalFooter(country, companyParams, invoiceData, lang) {
  const countryCode = country || companyParams.country || 'FR';
  const displayLang = lang || getConfiguredLocale() || 'FR';

  switch (countryCode) {
    case 'FR':
      return generateFrenchLegalFooter(companyParams, invoiceData, displayLang);
    case 'CM':
      return generateCameroonLegalFooter(companyParams, invoiceData, displayLang);
    case 'US':
      return generateUSLegalFooter(companyParams, invoiceData, displayLang);
    default:
      return generateFrenchLegalFooter(companyParams, invoiceData, displayLang);
  }
}

// ============================================================================
// FRANCE (FR) LEGAL FOOTER - Bilingual (FR/EN)
// ============================================================================

/**
 * Generates French legal footer with all required mentions (in FR or EN)
 * Genere le footer legal francais avec toutes les mentions obligatoires (en FR ou EN)
 * @param {Object} company - Company parameters
 * @param {Object} invoice - Invoice data
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} French legal footer
 */
function generateFrenchLegalFooter(company, invoice, lang) {
  const lines = [];
  const isEnglish = lang === 'EN';

  // Payment terms
  lines.push(isEnglish ? 'PAYMENT TERMS' : 'CONDITIONS DE PAIEMENT');
  const paymentDays = company.defaultPaymentDays || 30;

  if (isEnglish) {
    const paymentTerms = company.defaultPaymentTerms || 'Payment upon receipt';
    lines.push(`${paymentTerms} / ${paymentDays} days.`);
  } else {
    const paymentTerms = company.defaultPaymentTerms || 'Paiement à réception';
    lines.push(`${paymentTerms} / ${paymentDays} jours.`);
  }
  lines.push('');

  // VAT exemption notice for auto-entrepreneurs (French regulation - always show article ref)
  if (company.isAutoEntrepreneur) {
    if (isEnglish) {
      lines.push('VAT not applicable, art. 293 B of the French Tax Code (CGI)');
    } else {
      lines.push('TVA non applicable, art. 293 B du CGI');
    }
    lines.push('');
  }

  // Late payment penalties (MANDATORY in France)
  lines.push(isEnglish ? 'LATE PAYMENT PENALTIES' : 'PÉNALITÉS DE RETARD');
  if (isEnglish) {
    lines.push('In case of late payment, a penalty of 3 times the legal interest');
    lines.push('rate will be applied, plus a fixed compensation of 40 EUR for');
    lines.push('recovery costs (Art. L441-10 French Commercial Code).');
  } else {
    lines.push('En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt');
    lines.push('légal sera appliquée, ainsi qu\'une indemnité forfaitaire de 40 EUR pour');
    lines.push('frais de recouvrement (Art. L441-10 Code de commerce).');
  }
  lines.push('');

  // No discount for early payment
  if (isEnglish) {
    lines.push('No discount for early payment.');
  } else {
    lines.push('Pas d\'escompte pour paiement anticipé.');
  }
  lines.push('');

  // Company legal information
  const legalForm = company.legalForm || '';
  const capital = company.capital || '';

  let companyLine = company.name;
  if (legalForm) {
    companyLine += ` - ${legalForm}`;
  }
  if (capital) {
    if (isEnglish) {
      companyLine += ` with share capital of ${capital}`;
    } else {
      companyLine += ` au capital de ${capital}`;
    }
  }
  lines.push(companyLine);

  // SIRET & RCS (French identifiers - keep as-is, they're codes)
  const siretRcs = [];
  if (company.siret) siretRcs.push(`SIRET: ${company.siret}`);
  if (company.rcs) siretRcs.push(`RCS ${company.rcs}`);
  if (siretRcs.length > 0) {
    lines.push(siretRcs.join(' - '));
  }

  // VAT number (only if not auto-entrepreneur)
  if (!company.isAutoEntrepreneur && company.vatFR) {
    if (isEnglish) {
      lines.push(`EU VAT Number: ${company.vatFR}`);
    } else {
      lines.push(`N° TVA Intracommunautaire : ${company.vatFR}`);
    }
  }

  return lines.join('\n');
}

/**
 * Gets the VAT exemption notice for France (auto-entrepreneur)
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} VAT exemption notice
 */
function getVatExemptionNoticeFR(lang) {
  if (lang === 'EN') {
    return 'VAT not applicable, art. 293 B of the French Tax Code (CGI)';
  }
  return 'TVA non applicable, art. 293 B du CGI';
}

/**
 * Gets the late payment notice for France
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} Late payment notice
 */
function getLatePaymentNoticeFR(lang) {
  if (lang === 'EN') {
    return 'In case of late payment, a penalty of 3 times the legal interest rate will be applied, plus a fixed compensation of 40 EUR for recovery costs (Art. L441-10 French Commercial Code).';
  }
  return 'En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée, ainsi qu\'une indemnité forfaitaire de 40 EUR pour frais de recouvrement (Art. L441-10 Code de commerce).';
}

// ============================================================================
// CAMEROON (CM) LEGAL FOOTER - Bilingual (FR/EN)
// ============================================================================

/**
 * Generates Cameroon legal footer (OHADA compliant) in FR or EN
 * Genere le footer legal camerounais (conforme OHADA) en FR ou EN
 * @param {Object} company - Company parameters
 * @param {Object} invoice - Invoice data
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} Cameroon legal footer
 */
function generateCameroonLegalFooter(company, invoice, lang) {
  const lines = [];
  const isEnglish = lang === 'EN';

  // Payment terms
  lines.push(isEnglish ? 'PAYMENT TERMS' : 'CONDITIONS DE RÈGLEMENT');
  if (isEnglish) {
    const paymentTerms = company.defaultPaymentTerms || 'Cash payment';
    lines.push(`${paymentTerms}.`);
  } else {
    const paymentTerms = company.defaultPaymentTerms || 'Paiement comptant';
    lines.push(`${paymentTerms}.`);
  }
  lines.push('');

  // Amount in words (MANDATORY in Cameroon under OHADA)
  if (invoice && invoice.totalAmount) {
    lines.push(isEnglish ? 'AMOUNT IN WORDS' : 'MONTANT EN LETTRES');
    if (isEnglish) {
      lines.push('This invoice is established for the amount of:');
      const amountWords = numberToWordsEN(invoice.totalAmount);
      lines.push(amountWords);
    } else {
      lines.push('Arrêtée la présente facture à la somme de :');
      const amountWords = numberToWordsFR(invoice.totalAmount);
      lines.push(amountWords);
    }
    lines.push('');
  }

  // Company legal information
  lines.push(isEnglish ? 'LEGAL INFORMATION' : 'INFORMATIONS LÉGALES');
  lines.push(company.name);

  // NIU (MANDATORY)
  if (company.niu) {
    lines.push(`NIU: ${company.niu}`);
  } else {
    lines.push(isEnglish ? 'NIU: [TO BE PROVIDED]' : 'NIU : [À RENSEIGNER]');
  }

  // RCCM (MANDATORY)
  if (company.rccm) {
    lines.push(`RCCM: ${company.rccm}`);
  } else {
    lines.push(isEnglish ? 'RCCM: [TO BE PROVIDED]' : 'RCCM : [À RENSEIGNER]');
  }

  // Tax center (MANDATORY)
  if (company.taxCenter) {
    if (isEnglish) {
      lines.push(`Tax Center: ${company.taxCenter}`);
    } else {
      lines.push(`Centre des impôts de rattachement : ${company.taxCenter}`);
    }
  } else {
    lines.push(isEnglish ? 'Tax Center: [TO BE PROVIDED]' : 'Centre des impôts : [À RENSEIGNER]');
  }

  lines.push('');

  // Contact information
  const contact = [];
  if (company.email) contact.push(company.email);
  if (company.phone) contact.push(company.phone);
  if (contact.length > 0) {
    if (isEnglish) {
      lines.push(`For any inquiries: ${contact.join(' | ')}`);
    } else {
      lines.push(`Pour toute réclamation : ${contact.join(' | ')}`);
    }
  }

  return lines.join('\n');
}

/**
 * Generates the amount in words block for Cameroon (OHADA requirement)
 * @param {number} amount - Total amount
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} Amount in words block
 */
function generateAmountInWordsBlockCM(amount, lang) {
  if (!amount || isNaN(amount)) return '';

  if (lang === 'EN') {
    const amountWords = numberToWordsEN(amount);
    return `This invoice is established for the amount of:\n${amountWords}`;
  }
  const amountWords = numberToWordsFR(amount);
  return `Arrêtée la présente facture à la somme de :\n${amountWords}`;
}

// ============================================================================
// USA (US) LEGAL FOOTER - Bilingual (FR/EN)
// ============================================================================

/**
 * Generates US legal footer (minimal requirements) in FR or EN
 * Genere le footer legal americain en FR ou EN
 * @param {Object} company - Company parameters
 * @param {Object} invoice - Invoice data
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} US legal footer
 */
function generateUSLegalFooter(company, invoice, lang) {
  const lines = [];
  const isEnglish = lang === 'EN';

  // Payment terms
  lines.push(isEnglish ? 'PAYMENT TERMS' : 'CONDITIONS DE PAIEMENT');
  const paymentTerms = company.defaultPaymentTerms || (isEnglish ? 'Payment due upon receipt' : 'Paiement à réception');
  const paymentDays = company.defaultPaymentDays || 30;
  lines.push(`${paymentTerms} / Net ${paymentDays}.`);
  lines.push('');

  // Sales tax notice
  const salesTaxRate = company.salesTaxRate || 0;
  if (salesTaxRate > 0) {
    if (isEnglish) {
      lines.push(`Sales tax (${salesTaxRate}%) applied where applicable.`);
    } else {
      lines.push(`Taxe de vente (${salesTaxRate}%) appliquée le cas échéant.`);
    }
    lines.push('');
  }

  // Company information
  lines.push(isEnglish ? 'LEGAL INFORMATION' : 'INFORMATIONS LÉGALES');
  lines.push(company.name);

  // EIN (optional but recommended)
  if (company.ein) {
    lines.push(`EIN: ${company.ein}`);
  }

  // State Tax ID (if applicable)
  if (company.stateId) {
    if (isEnglish) {
      lines.push(`State Tax ID: ${company.stateId}`);
    } else {
      lines.push(`N° fiscal d'État : ${company.stateId}`);
    }
  }

  lines.push('');

  // Contact
  if (company.email) {
    if (isEnglish) {
      lines.push(`For questions regarding this invoice: ${company.email}`);
    } else {
      lines.push(`Pour toute question concernant cette facture : ${company.email}`);
    }
  }

  // Thank you message
  lines.push('');
  lines.push(isEnglish ? 'Thank you for your business.' : 'Merci pour votre confiance.');

  return lines.join('\n');
}

/**
 * Gets the sales tax notice for US
 * @param {number} rate - Sales tax rate
 * @returns {string} Sales tax notice
 */
function getSalesTaxNoticeUS(rate) {
  if (!rate || rate === 0) {
    return 'No sales tax applicable.';
  }
  return `Sales tax (${rate}%) applied where applicable.`;
}

// ============================================================================
// HELPER FUNCTIONS / FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Gets the appropriate thank you message based on language
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} Thank you message
 */
function getThankYouMessage(lang) {
  if (lang === 'EN') {
    return 'Thank you for your business.';
  }
  return 'Merci pour votre confiance.';
}

/**
 * Validates that required legal fields are present for a country
 * Valide que les champs legaux requis sont presents pour un pays
 * @param {Object} companyParams - Company parameters
 * @param {string} country - Country code
 * @param {string} lang - Display language for error messages
 * @returns {Object} {isValid: boolean, missingFields: Array}
 */
function validateLegalFieldsForCountry(companyParams, country, lang) {
  const result = { isValid: true, missingFields: [] };
  const isEnglish = lang === 'EN';

  switch (country) {
    case 'FR':
      if (!companyParams.siret) {
        result.missingFields.push('SIRET');
      }
      break;

    case 'CM':
      if (!companyParams.niu) {
        result.missingFields.push('NIU');
      }
      if (!companyParams.rccm) {
        result.missingFields.push('RCCM');
      }
      if (!companyParams.taxCenter) {
        result.missingFields.push(isEnglish ? 'Tax Center' : 'Centre des impôts');
      }
      break;

    case 'US':
      // No mandatory fields for US
      break;
  }

  result.isValid = result.missingFields.length === 0;
  return result;
}

/**
 * Generates bank details section
 * Genere la section coordonnees bancaires
 * @param {Object} companyParams - Company parameters
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} Bank details section
 */
function generateBankDetailsSection(companyParams, lang) {
  const lines = [];
  const isEnglish = lang === 'EN';

  // Header
  lines.push(isEnglish ? 'BANK DETAILS' : 'COORDONNÉES BANCAIRES');

  if (companyParams.bankName) {
    lines.push(companyParams.bankName);
  }

  if (companyParams.bankIban) {
    lines.push(`IBAN: ${companyParams.bankIban}`);
  }

  if (companyParams.bankBic) {
    lines.push(`BIC/SWIFT: ${companyParams.bankBic}`);
  }

  if (companyParams.bankAccountName) {
    const label = isEnglish ? 'Account Holder' : 'Titulaire';
    lines.push(`${label}: ${companyParams.bankAccountName}`);
  }

  return lines.join('\n');
}

// ============================================================================
// FULL INVOICE FOOTER (BANK + LEGAL)
// ============================================================================

/**
 * Generates the complete invoice footer (bank details + legal mentions)
 * Genere le footer complet de la facture (coordonnees bancaires + mentions legales)
 * @param {Object} companyParams - Company parameters
 * @param {Object} invoiceData - Invoice data
 * @param {string} lang - Display language (FR or EN) - optional
 * @returns {Object} {bankDetails: string, legalFooter: string, full: string}
 */
function generateFullInvoiceFooter(companyParams, invoiceData, lang) {
  const country = companyParams.country || 'FR';
  const displayLang = lang || getConfiguredLocale() || 'FR';

  // Bank details
  const bankDetails = generateBankDetailsSection(companyParams, displayLang);

  // Legal footer
  const legalFooter = generateLegalFooter(country, companyParams, invoiceData, displayLang);

  // Combined
  const full = [bankDetails, '', legalFooter].join('\n');

  return {
    bankDetails: bankDetails,
    legalFooter: legalFooter,
    full: full
  };
}

// ============================================================================
// CUSTOMIZABLE FOOTER SYSTEM / SYSTEME DE FOOTER PERSONNALISABLE
// ============================================================================

/**
 * Gets the legal footer to use for invoice generation.
 * Priority: 1) Custom footer from Settings (if USE_CUSTOM_FOOTER=true)
 *           2) Auto-generated footer based on country/language
 *
 * @param {Object} companyParams - Company parameters
 * @param {Object} invoiceData - Invoice data
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} Legal footer text to use
 */
function getLegalFooterForInvoice(companyParams, invoiceData, lang) {
  const useCustom = String(getParam(INVOICE_CONFIG.PARAM_KEYS.USE_CUSTOM_FOOTER)).toLowerCase() === 'true';

  if (useCustom) {
    const customFooter = getParam(INVOICE_CONFIG.PARAM_KEYS.LEGAL_FOOTER_CUSTOM);
    if (customFooter && customFooter.trim() !== '') {
      return customFooter;
    }
  }

  // Fallback to auto-generated footer
  const country = companyParams.country || 'FR';
  const displayLang = lang || getConfiguredLocale() || 'FR';
  return generateLegalFooter(country, companyParams, invoiceData, displayLang);
}

/**
 * Gets the bank details to use for invoice generation.
 * Priority: 1) Custom bank details from Settings (if USE_CUSTOM_FOOTER=true)
 *           2) Auto-generated bank details
 *
 * @param {Object} companyParams - Company parameters
 * @param {string} lang - Display language (FR or EN)
 * @returns {string} Bank details text to use
 */
function getBankDetailsForInvoice(companyParams, lang) {
  const useCustom = String(getParam(INVOICE_CONFIG.PARAM_KEYS.USE_CUSTOM_FOOTER)).toLowerCase() === 'true';

  if (useCustom) {
    const customBankDetails = getParam(INVOICE_CONFIG.PARAM_KEYS.BANK_DETAILS_CUSTOM);
    if (customBankDetails && customBankDetails.trim() !== '') {
      return customBankDetails;
    }
  }

  // Fallback to auto-generated bank details
  const displayLang = lang || getConfiguredLocale() || 'FR';
  return generateBankDetailsSection(companyParams, displayLang);
}

/**
 * Generates and saves the legal footer to Settings sheet.
 * Called during setup or when user wants to regenerate the footer.
 *
 * @param {Object} companyParams - Company parameters (optional, will fetch if not provided)
 * @param {string} lang - Display language (optional)
 * @returns {Object} {success: boolean, legalFooter: string, bankDetails: string}
 */
function generateAndSaveLegalFooterToSettings(companyParams, lang) {
  try {
    const params = companyParams || getCompanyParams();
    const displayLang = lang || getConfiguredLocale() || 'FR';
    const country = params.country || 'FR';

    // Generate footer and bank details
    const legalFooter = generateLegalFooter(country, params, null, displayLang);
    const bankDetails = generateBankDetailsSection(params, displayLang);

    // Save to Settings sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SETTINGS);

    if (!settingsSheet) {
      return { success: false, message: 'Settings sheet not found' };
    }

    // Update or add LEGAL_FOOTER_CUSTOM
    updateOrAddSettingsParam(settingsSheet, INVOICE_CONFIG.PARAM_KEYS.LEGAL_FOOTER_CUSTOM, legalFooter);

    // Update or add BANK_DETAILS_CUSTOM
    updateOrAddSettingsParam(settingsSheet, INVOICE_CONFIG.PARAM_KEYS.BANK_DETAILS_CUSTOM, bankDetails);

    // Set USE_CUSTOM_FOOTER to true by default after generation
    updateOrAddSettingsParam(settingsSheet, INVOICE_CONFIG.PARAM_KEYS.USE_CUSTOM_FOOTER, 'TRUE');

    logSuccess('generateAndSaveLegalFooterToSettings', 'Legal footer and bank details saved to Settings');

    return {
      success: true,
      legalFooter: legalFooter,
      bankDetails: bankDetails
    };

  } catch (error) {
    logError('generateAndSaveLegalFooterToSettings', 'Error saving footer to Settings', error);
    return { success: false, message: error.message };
  }
}

/**
 * Updates an existing parameter or adds it if not found
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Settings sheet
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 */
function updateOrAddSettingsParam(sheet, key, value) {
  const data = sheet.getDataRange().getValues();

  // Search for existing key
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }

  // Key not found, add new row
  sheet.appendRow([key, value]);
}

/**
 * Regenerates the legal footer based on current company settings.
 * Can be called from menu to update the footer after Settings changes.
 *
 * @returns {Object} Result with success status and message
 */
function regenerateLegalFooter() {
  try {
    const companyParams = getCompanyParams();
    const lang = getConfiguredLocale();

    const result = generateAndSaveLegalFooterToSettings(companyParams, lang);

    if (result.success) {
      const isFrench = lang === 'FR';
      return {
        success: true,
        message: isFrench
          ? 'Footer légal régénéré et sauvegardé dans Settings.\n\nVous pouvez le modifier manuellement dans la feuille Settings.'
          : 'Legal footer regenerated and saved to Settings.\n\nYou can manually edit it in the Settings sheet.'
      };
    } else {
      return {
        success: false,
        message: result.message
      };
    }

  } catch (error) {
    logError('regenerateLegalFooter', 'Error regenerating footer', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Menu function to regenerate the legal footer
 */
function menuRegenerateLegalFooter() {
  const ui = SpreadsheetApp.getUi();
  const lang = getConfiguredLocale();
  const isFrench = lang === 'FR';

  const confirmTitle = isFrench ? 'Régénérer le footer légal' : 'Regenerate Legal Footer';
  const confirmMessage = isFrench
    ? 'Cette action va régénérer le footer légal et les coordonnées bancaires à partir des paramètres actuels.\n\nLes modifications manuelles seront écrasées.\n\nContinuer ?'
    : 'This will regenerate the legal footer and bank details from current settings.\n\nManual modifications will be overwritten.\n\nContinue?';

  const response = ui.alert(confirmTitle, confirmMessage, ui.ButtonSet.YES_NO);

  if (response === ui.Button.YES) {
    const result = regenerateLegalFooter();
    ui.alert(
      result.success ? '✅' : '❌',
      result.message,
      ui.ButtonSet.OK
    );
  }
}
