/**
 * @file 11_LegalFooter.js
 * @description Dynamic legal footer generation based on country (FR/CM/US)
 *              Generation dynamique du footer legal selon le pays
 * @version 1.0
 * @date 2025-12-14
 * @author InvoiceFlash - Multi-Country Edition
 */

// ============================================================================
// MAIN FUNCTION / FONCTION PRINCIPALE
// ============================================================================

/**
 * Generates the complete legal footer based on country
 * Genere le footer legal complet selon le pays
 * @param {string} country - Country code (FR, CM, US)
 * @param {Object} companyParams - Company parameters (from getCompanyParams())
 * @param {Object} invoiceData - Invoice data (for amount in words, etc.)
 * @returns {string} Complete legal footer text
 */
function generateLegalFooter(country, companyParams, invoiceData) {
  const countryCode = country || companyParams.country || 'FR';

  switch (countryCode) {
    case 'FR':
      return generateFrenchLegalFooter(companyParams, invoiceData);
    case 'CM':
      return generateCameroonLegalFooter(companyParams, invoiceData);
    case 'US':
      return generateUSLegalFooter(companyParams, invoiceData);
    default:
      return generateFrenchLegalFooter(companyParams, invoiceData);
  }
}

// ============================================================================
// FRANCE (FR) LEGAL FOOTER
// ============================================================================

/**
 * Generates French legal footer with all required mentions
 * Genere le footer legal francais avec toutes les mentions obligatoires
 * @param {Object} company - Company parameters
 * @param {Object} invoice - Invoice data
 * @returns {string} French legal footer
 */
function generateFrenchLegalFooter(company, invoice) {
  const lines = [];

  // Payment terms
  lines.push('CONDITIONS DE PAIEMENT');
  const paymentTerms = company.defaultPaymentTerms || 'Paiement a reception';
  const paymentDays = company.defaultPaymentDays || 30;
  lines.push(`${paymentTerms} / ${paymentDays} jours.`);
  lines.push('');

  // VAT exemption notice for auto-entrepreneurs
  if (company.isAutoEntrepreneur) {
    lines.push('TVA non applicable, art. 293 B du CGI');
    lines.push('');
  }

  // Late payment penalties (MANDATORY in France)
  lines.push('PENALITES DE RETARD');
  lines.push('En cas de retard de paiement, une penalite de 3 fois le taux d\'interet');
  lines.push('legal sera appliquee, ainsi qu\'une indemnite forfaitaire de 40 EUR pour');
  lines.push('frais de recouvrement (Art. L441-10 Code de commerce).');
  lines.push('');

  // No discount for early payment
  lines.push('Pas d\'escompte pour paiement anticipe.');
  lines.push('');

  // Company legal information
  const legalForm = company.legalForm || '';
  const capital = company.capital || '';

  let companyLine = company.name;
  if (legalForm) {
    companyLine += ` - ${legalForm}`;
  }
  if (capital) {
    companyLine += ` au capital de ${capital}`;
  }
  lines.push(companyLine);

  // SIRET & RCS
  const siretRcs = [];
  if (company.siret) siretRcs.push(`SIRET: ${company.siret}`);
  if (company.rcs) siretRcs.push(`RCS ${company.rcs}`);
  if (siretRcs.length > 0) {
    lines.push(siretRcs.join(' - '));
  }

  // VAT number (only if not auto-entrepreneur)
  if (!company.isAutoEntrepreneur && company.vatFR) {
    lines.push(`N TVA Intracommunautaire: ${company.vatFR}`);
  }

  return lines.join('\n');
}

/**
 * Gets the VAT exemption notice for France (auto-entrepreneur)
 * @returns {string} VAT exemption notice
 */
function getVatExemptionNoticeFR() {
  return 'TVA non applicable, art. 293 B du CGI';
}

/**
 * Gets the late payment notice for France
 * @returns {string} Late payment notice
 */
function getLatePaymentNoticeFR() {
  return 'En cas de retard de paiement, une penalite de 3 fois le taux d\'interet legal sera appliquee, ainsi qu\'une indemnite forfaitaire de 40 EUR pour frais de recouvrement (Art. L441-10 Code de commerce).';
}

// ============================================================================
// CAMEROON (CM) LEGAL FOOTER
// ============================================================================

/**
 * Generates Cameroon legal footer (OHADA compliant)
 * Genere le footer legal camerounais (conforme OHADA)
 * @param {Object} company - Company parameters
 * @param {Object} invoice - Invoice data
 * @returns {string} Cameroon legal footer
 */
function generateCameroonLegalFooter(company, invoice) {
  const lines = [];

  // Payment terms
  lines.push('CONDITIONS DE REGLEMENT');
  const paymentTerms = company.defaultPaymentTerms || 'Paiement comptant';
  lines.push(`${paymentTerms}.`);
  lines.push('');

  // Amount in words (MANDATORY in Cameroon under OHADA)
  if (invoice && invoice.totalAmount) {
    lines.push('MONTANT EN LETTRES');
    lines.push('Arretee la presente facture a la somme de:');
    const amountWords = numberToWordsFR(invoice.totalAmount);
    lines.push(amountWords);
    lines.push('');
  }

  // Company legal information
  lines.push('INFORMATIONS LEGALES');
  lines.push(company.name);

  // NIU (MANDATORY)
  if (company.niu) {
    lines.push(`NIU: ${company.niu}`);
  } else {
    lines.push('NIU: [A RENSEIGNER]');
  }

  // RCCM (MANDATORY)
  if (company.rccm) {
    lines.push(`RCCM: ${company.rccm}`);
  } else {
    lines.push('RCCM: [A RENSEIGNER]');
  }

  // Tax center (MANDATORY)
  if (company.taxCenter) {
    lines.push(`Centre des impots de rattachement: ${company.taxCenter}`);
  } else {
    lines.push('Centre des impots: [A RENSEIGNER]');
  }

  lines.push('');

  // Contact information
  const contact = [];
  if (company.email) contact.push(company.email);
  if (company.phone) contact.push(company.phone);
  if (contact.length > 0) {
    lines.push(`Pour toute reclamation: ${contact.join(' | ')}`);
  }

  return lines.join('\n');
}

/**
 * Generates the amount in words block for Cameroon (OHADA requirement)
 * Genere le bloc montant en lettres pour le Cameroun (exigence OHADA)
 * @param {number} amount - Total amount
 * @returns {string} Amount in words block
 */
function generateAmountInWordsBlockCM(amount) {
  if (!amount || isNaN(amount)) return '';

  const amountWords = numberToWordsFR(amount);
  return `Arretee la presente facture a la somme de:\n${amountWords}`;
}

// ============================================================================
// USA (US) LEGAL FOOTER
// ============================================================================

/**
 * Generates US legal footer (minimal requirements)
 * Genere le footer legal US (exigences minimales)
 * @param {Object} company - Company parameters
 * @param {Object} invoice - Invoice data
 * @returns {string} US legal footer
 */
function generateUSLegalFooter(company, invoice) {
  const lines = [];

  // Payment terms
  lines.push('PAYMENT TERMS');
  const paymentTerms = company.defaultPaymentTerms || 'Payment due upon receipt';
  const paymentDays = company.defaultPaymentDays || 30;
  lines.push(`${paymentTerms} / Net ${paymentDays}.`);
  lines.push('');

  // Sales tax notice
  const salesTaxRate = company.salesTaxRate || 0;
  if (salesTaxRate > 0) {
    lines.push(`Sales tax (${salesTaxRate}%) applied where applicable.`);
    lines.push('');
  }

  // Company information
  lines.push(company.name);

  // EIN (optional but recommended)
  if (company.ein) {
    lines.push(`EIN: ${company.ein}`);
  }

  // State Tax ID (if applicable)
  if (company.stateId) {
    lines.push(`State Tax ID: ${company.stateId}`);
  }

  lines.push('');

  // Contact
  if (company.email) {
    lines.push(`For questions regarding this invoice: ${company.email}`);
  }

  // Thank you message
  lines.push('');
  lines.push('Thank you for your business.');

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
 * Gets the appropriate thank you message based on country/language
 * @param {string} country - Country code
 * @returns {string} Thank you message
 */
function getThankYouMessage(country) {
  switch (country) {
    case 'FR':
    case 'CM':
      return 'Merci pour votre confiance.';
    case 'US':
      return 'Thank you for your business.';
    default:
      return 'Thank you for your business.';
  }
}

/**
 * Validates that required legal fields are present for a country
 * Valide que les champs legaux requis sont presents pour un pays
 * @param {Object} companyParams - Company parameters
 * @param {string} country - Country code
 * @returns {Object} {isValid: boolean, missingFields: Array}
 */
function validateLegalFieldsForCountry(companyParams, country) {
  const result = { isValid: true, missingFields: [] };

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
        result.missingFields.push('Centre des impots');
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
 * @param {string} country - Country code (for language)
 * @returns {string} Bank details section
 */
function generateBankDetailsSection(companyParams, country) {
  const lines = [];
  const isFrench = country === 'FR' || country === 'CM';

  // Header
  lines.push(isFrench ? 'COORDONNEES BANCAIRES' : 'BANK DETAILS');

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
    const label = isFrench ? 'Titulaire' : 'Account Holder';
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
 * @returns {Object} {bankDetails: string, legalFooter: string, full: string}
 */
function generateFullInvoiceFooter(companyParams, invoiceData) {
  const country = companyParams.country || 'FR';

  // Bank details
  const bankDetails = generateBankDetailsSection(companyParams, country);

  // Legal footer
  const legalFooter = generateLegalFooter(country, companyParams, invoiceData);

  // Combined
  const full = [bankDetails, '', legalFooter].join('\n');

  return {
    bankDetails: bankDetails,
    legalFooter: legalFooter,
    full: full
  };
}
