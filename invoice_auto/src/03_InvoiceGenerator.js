/**
 * @file 03_InvoiceGenerator.js
 * @description Automatic Google Doc and PDF invoice generation from template
 *              Multi-country support (FR/CM/US) with dynamic legal footers
 * @version 2.0 (Multi-Country Edition)
 * @date 2025-12-14
 */

// ============================================================================
// FOLDER MANAGEMENT / GESTION DES DOSSIERS
// ============================================================================

/**
 * Gets or creates a subfolder for a client in the root folder
 * Récupère ou crée un sous-dossier pour un client dans le dossier racine
 * @param {GoogleAppsScript.Drive.Folder} rootFolder - The root folder
 * @param {string} clientName - The client name
 * @returns {GoogleAppsScript.Drive.Folder} The client folder
 */
function getOrCreateClientFolder(rootFolder, clientName) {
  try {
    // Clean client name to make it folder-safe
    const safeFolderName = cleanString(clientName).replace(/[^a-z0-9\s\-_]/gi, '_');

    // Search for existing folder with this name
    const existingFolders = rootFolder.getFoldersByName(safeFolderName);

    if (existingFolders.hasNext()) {
      const folder = existingFolders.next();
      logSuccess('getOrCreateClientFolder', `Using existing folder: ${safeFolderName}`);
      return folder;
    }

    // Create new folder if doesn't exist
    const newFolder = rootFolder.createFolder(safeFolderName);
    logSuccess('getOrCreateClientFolder', `Created new folder: ${safeFolderName}`);
    return newFolder;

  } catch (error) {
    logError('getOrCreateClientFolder', `Error managing client folder for ${clientName}`, error);
    // Fallback: return root folder if subfolder creation fails
    return rootFolder;
  }
}

// ============================================================================
// INDIVIDUAL INVOICE GENERATION
// ============================================================================

/**
 * Generates Google Doc and PDF invoice files for a given ID
 * Génère les fichiers facture en Google Doc et PDF pour un ID donné
 * @param {string} invoiceId - The invoice ID to generate
 * @returns {Object} {success: boolean, message: string, url: string, docUrl: string, pdfUrl: string}
 */
function generateInvoiceById(invoiceId) {
  try {
    // 1. DATA RETRIEVAL
    const invoiceData = getInvoiceDataById(invoiceId);

    if (!invoiceData) {
      const lang = detectUserLanguage();
      const messages = getMessages(lang);
      return {
        success: false,
        message: messages.ERROR_NO_DATA,
        url: null
      };
    }

    // 2. DATA VALIDATION
    const validation = validateInvoiceData(invoiceData);
    if (!validation.isValid) {
      const errorMsg = `❌ Invalid data for ${invoiceId}:\n${validation.errors.join('\n')}`;
      logError('generateInvoiceById', errorMsg);
      return {
        success: false,
        message: errorMsg,
        url: null
      };
    }

    // 3. RETRIEVE PARAMETERS
    const templateId = getParam(INVOICE_CONFIG.PARAM_KEYS.TEMPLATE_DOCS_ID);
    const folderId = getParam(INVOICE_CONFIG.PARAM_KEYS.DRIVE_FOLDER_ID);
    const companyParams = getCompanyParams();

    if (!templateId || !folderId) {
      const lang = detectUserLanguage();
      const messages = getMessages(lang);
      return {
        success: false,
        message: messages.ERROR_MISSING_PARAMS,
        url: null
      };
    }

    // 4. GET OR CREATE CLIENT SUBFOLDER
    const rootFolder = DriveApp.getFolderById(folderId);
    const clientFolder = getOrCreateClientFolder(rootFolder, invoiceData.clientName);

    // 5. CREATE DOCUMENT FROM TEMPLATE
    const templateFile = DriveApp.getFileById(templateId);
    const fileName = generateSafeFileName(invoiceData.invoiceId, invoiceData.clientName);
    const newDocFile = templateFile.makeCopy(fileName, clientFolder);
    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();

    // 6. REPLACE MARKERS
    replaceMarkers(body, invoiceData, companyParams);

    // 7. SAVE DOCUMENT
    doc.saveAndClose();

    // 8. GENERATE PDF (keeping Google Doc as editable version)
    const pdfBlob = newDocFile.getAs('application/pdf').setName(fileName + '.pdf');
    const pdfFile = clientFolder.createFile(pdfBlob);
    const pdfUrl = pdfFile.getUrl();

    // 9. GET GOOGLE DOC URL (we keep it for editing)
    const docUrl = newDocFile.getUrl();

    // 10. UPDATE STATUS IN SHEET
    markInvoiceAsGenerated(invoiceData.invoiceId, pdfUrl);

    // 11. SEND EMAIL (IF ENABLED)
    const autoSendEmail = getParam(INVOICE_CONFIG.PARAM_KEYS.AUTO_SEND_EMAIL);
    if (autoSendEmail === 'true' || autoSendEmail === true) {
      sendInvoiceEmail(invoiceData, pdfFile, companyParams);
    }

    logSuccess('generateInvoiceById', `Invoice ${invoiceId} generated successfully (Google Doc + PDF) in folder: ${invoiceData.clientName}`);

    const lang = detectUserLanguage();
    const messages = getMessages(lang);
    return {
      success: true,
      message: messages.SUCCESS_GENERATION,
      url: pdfUrl,
      docUrl: docUrl,
      pdfUrl: pdfUrl
    };

  } catch (error) {
    logError('generateInvoiceById', `Error generating ${invoiceId}`, error);
    return {
      success: false,
      message: `❌ Error: ${error.message}`,
      url: null
    };
  }
}

// ============================================================================
// MARKER REPLACEMENT IN DOCUMENT
// ============================================================================

/**
 * Replaces all markers in the document with actual data
 * Version 2.0: Multi-country support with legal IDs and dynamic footers
 * @param {GoogleAppsScript.Document.Body} body - The document body
 * @param {Object} invoiceData - The invoice data
 * @param {Object} companyParams - The company parameters
 */
function replaceMarkers(body, invoiceData, companyParams) {
  const country = companyParams.country || 'FR';

  // Get labels based on country configuration
  const labels = getInvoiceLabels();

  // =========================================================================
  // COMPANY INFORMATION / INFORMATIONS ENTREPRISE
  // =========================================================================
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_NAME, companyParams.name || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_ADDRESS, companyParams.address || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_PHONE, companyParams.phone || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_EMAIL, companyParams.email || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_WEBSITE, companyParams.website || '');

  // Company Legal IDs Block (formatted based on country)
  const companyLegalIds = getCompanyLegalIdsFormatted(companyParams);
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_LEGAL_IDS, companyLegalIds);

  // Individual company legal IDs (France)
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_SIRET, companyParams.siret || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_SIREN, companyParams.siren || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_VAT_FR, companyParams.vatFR || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_RCS, companyParams.rcs || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_CAPITAL, companyParams.capital || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_LEGAL_FORM, companyParams.legalForm || '');

  // Individual company legal IDs (Cameroon)
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_NIU, companyParams.niu || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_RCCM, companyParams.rccm || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_TAX_CENTER, companyParams.taxCenter || '');

  // Individual company legal IDs (USA)
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_EIN, companyParams.ein || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_STATE_ID, companyParams.stateId || '');

  // =========================================================================
  // INVOICE INFORMATION / INFORMATIONS FACTURE
  // =========================================================================
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_ID, invoiceData.invoiceId);
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_DATE, formatDateForCountry(invoiceData.date));

  // Due date (if available)
  const dueDate = invoiceData.dueDate || calculateDueDate(invoiceData.date, companyParams.defaultPaymentDays);
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_DUE_DATE, formatDateForCountry(dueDate));

  // Optional fields
  body.replaceText(INVOICE_CONFIG.MARKERS.DELIVERY_DATE, invoiceData.deliveryDate ? formatDateForCountry(invoiceData.deliveryDate) : '');
  body.replaceText(INVOICE_CONFIG.MARKERS.PO_NUMBER, invoiceData.poNumber || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.PAYMENT_TERMS, companyParams.defaultPaymentTerms || '');

  // =========================================================================
  // CLIENT INFORMATION / INFORMATIONS CLIENT
  // =========================================================================
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_NAME, invoiceData.clientName || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_EMAIL, invoiceData.clientEmail || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_PHONE, invoiceData.clientPhone || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_ADDRESS, invoiceData.clientAddress || '');

  // Client Legal IDs Block (if available in invoiceData)
  const clientLegalIds = getClientLegalIdsFormatted(invoiceData, country);
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_LEGAL_IDS, clientLegalIds);

  // Individual client legal IDs
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_SIRET, invoiceData.clientSiret || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_VAT_NUMBER, invoiceData.clientVatNumber || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_NIU, invoiceData.clientNiu || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_TAX_ID, invoiceData.clientTaxId || '');

  // =========================================================================
  // LINE ITEMS / LIGNES DE FACTURE
  // =========================================================================
  body.replaceText(INVOICE_CONFIG.MARKERS.DESCRIPTION, invoiceData.description);
  body.replaceText(INVOICE_CONFIG.MARKERS.QUANTITY, String(invoiceData.quantity));
  body.replaceText(INVOICE_CONFIG.MARKERS.UNIT_PRICE, formatAmountForCountry(invoiceData.unitPrice));

  // VAT/Tax details
  const vatRate = invoiceData.vatRate || companyParams.defaultVatRate || 0;
  const tvaAmount = invoiceData.tva || 0;
  body.replaceText(INVOICE_CONFIG.MARKERS.LINE_VAT_RATE, vatRate + '%');
  body.replaceText(INVOICE_CONFIG.MARKERS.LINE_VAT_AMOUNT, formatAmountForCountry(tvaAmount));
  body.replaceText(INVOICE_CONFIG.MARKERS.TVA, formatAmountForCountry(tvaAmount));

  // =========================================================================
  // TOTALS / TOTAUX
  // =========================================================================
  const subtotalHT = invoiceData.quantity * invoiceData.unitPrice;
  const totalTTC = invoiceData.totalAmount;

  body.replaceText(INVOICE_CONFIG.MARKERS.SUBTOTAL_HT, formatAmountForCountry(subtotalHT));
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_TVA, formatAmountForCountry(tvaAmount));
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_TTC, formatAmountForCountry(totalTTC));
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_AMOUNT, formatAmountForCountry(totalTTC));

  // TVA Summary (for multi-rate, simplified for now)
  const tvaSummary = `TVA ${vatRate}%: ${formatAmountForCountry(tvaAmount)}`;
  body.replaceText(INVOICE_CONFIG.MARKERS.TVA_SUMMARY, tvaSummary);

  // =========================================================================
  // AMOUNT IN WORDS / MONTANT EN LETTRES
  // =========================================================================
  const amountInWords = convertAmountToWordsForCountry(totalTTC, country);
  body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS, amountInWords);

  // Amount in words block (for Cameroon - MANDATORY)
  if (country === 'CM') {
    const amountBlock = `Arretee la presente facture a la somme de:\n${amountInWords}`;
    body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS_BLOCK, amountBlock);
  } else {
    body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS_BLOCK, '');
  }

  // =========================================================================
  // BANK DETAILS / COORDONNEES BANCAIRES
  // =========================================================================
  const bankDetails = getBankDetailsFormatted(companyParams);
  body.replaceText(INVOICE_CONFIG.MARKERS.BANK_DETAILS, bankDetails);
  body.replaceText(INVOICE_CONFIG.MARKERS.BANK_NAME, companyParams.bankName || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.BANK_IBAN, companyParams.bankIban || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.BANK_BIC, companyParams.bankBic || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.BANK_ACCOUNT_NAME, companyParams.bankAccountName || '');

  // =========================================================================
  // LEGAL FOOTER / MENTIONS LEGALES
  // =========================================================================
  const legalFooter = generateLegalFooter(country, companyParams, invoiceData);
  body.replaceText(INVOICE_CONFIG.MARKERS.LEGAL_FOOTER, legalFooter);

  // Specific legal notices
  if (country === 'FR' && companyParams.isAutoEntrepreneur) {
    body.replaceText(INVOICE_CONFIG.MARKERS.VAT_EXEMPTION_NOTICE, 'TVA non applicable, art. 293 B du CGI');
  } else {
    body.replaceText(INVOICE_CONFIG.MARKERS.VAT_EXEMPTION_NOTICE, '');
  }

  body.replaceText(INVOICE_CONFIG.MARKERS.LATE_PAYMENT_NOTICE, country === 'FR' ? getLatePaymentNoticeFR() : '');
  body.replaceText(INVOICE_CONFIG.MARKERS.SALES_TAX_NOTICE, country === 'US' ? getSalesTaxNoticeUS(companyParams.salesTaxRate) : '');

  // =========================================================================
  // LABELS (TRANSLATED) / ETIQUETTES (TRADUITES)
  // =========================================================================
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_INVOICE, labels.LABEL_INVOICE);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_INVOICE_NUMBER, labels.LABEL_INVOICE_NUMBER);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_DATE, labels.LABEL_DATE);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_DUE_DATE, labels.LABEL_DUE_DATE || labels.LABEL_DATE);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_BILLED_TO, labels.LABEL_BILLED_TO);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_DESCRIPTION, labels.LABEL_DESCRIPTION);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_QTY, labels.LABEL_QTY);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_UNIT_PRICE, labels.LABEL_UNIT_PRICE);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_TVA, labels.LABEL_TVA);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_TOTAL, labels.LABEL_TOTAL);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_SUBTOTAL, labels.LABEL_SUBTOTAL || 'Sous-total HT');
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_TOTAL_VAT, labels.LABEL_TOTAL_VAT || 'Total TVA');
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_TOTAL_TTC, labels.LABEL_TOTAL_TTC || 'Total TTC');
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_FOOTER, labels.LABEL_FOOTER);

  // =========================================================================
  // CLEANUP UNUSED PLACEHOLDERS / NETTOYAGE DES PLACEHOLDERS NON UTILISES
  // =========================================================================
  cleanUnusedPlaceholders(body, country);

  logSuccess('replaceMarkers', `Markers replaced for invoice ${invoiceData.invoiceId} (country: ${country})`);
}

// ============================================================================
// HELPER FUNCTIONS FOR MARKER REPLACEMENT
// ============================================================================

/**
 * Gets client legal IDs formatted based on country
 * @param {Object} invoiceData - Invoice data with client info
 * @param {string} country - Country code
 * @returns {string} Formatted client legal IDs
 */
function getClientLegalIdsFormatted(invoiceData, country) {
  const ids = [];

  switch (country) {
    case 'FR':
      if (invoiceData.clientSiret) ids.push(`SIRET: ${invoiceData.clientSiret}`);
      if (invoiceData.clientVatNumber) ids.push(`TVA: ${invoiceData.clientVatNumber}`);
      break;
    case 'CM':
      if (invoiceData.clientNiu) ids.push(`NIU: ${invoiceData.clientNiu}`);
      break;
    case 'US':
      if (invoiceData.clientTaxId) ids.push(`Tax ID: ${invoiceData.clientTaxId}`);
      break;
  }

  return ids.join(' | ');
}

/**
 * Calculates due date from invoice date + payment days
 * @param {Date} invoiceDate - Invoice date
 * @param {number} paymentDays - Number of days for payment
 * @returns {Date} Due date
 */
function calculateDueDate(invoiceDate, paymentDays) {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + (paymentDays || 30));
  return date;
}

// ============================================================================
// MULTIPLE INVOICE GENERATION
// ============================================================================

/**
 * Generates invoices for all status "Draft"
 * @returns {Object} Operation summary
 */
function generateAllPendingInvoices() {
  try {
    const pendingInvoices = getPendingInvoices();
    const locale = getConfiguredLocale();
    const messages = getMessages(locale);
    const uiMsg = getUIMessages();

    if (pendingInvoices.length === 0) {
      Logger.log(messages.NO_PENDING_INVOICES);
      return {
        success: true,
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        message: messages.NO_PENDING_INVOICES
      };
    }

    const results = {
      success: true,
      totalProcessed: pendingInvoices.length,
      successful: 0,
      failed: 0,
      details: []
    };

    // Generate each invoice
    pendingInvoices.forEach(invoice => {
      const result = generateInvoiceById(invoice.invoiceId);

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
      }

      results.details.push({
        invoiceId: invoice.invoiceId,
        success: result.success,
        message: result.message,
        url: result.url
      });
    });

    const summaryMessage = `${uiMsg.SUMMARY_COMPLETED}: ${results.successful} ${uiMsg.SUMMARY_SUCCESS}, ${results.failed} ${uiMsg.SUMMARY_FAILED} ${uiMsg.SUMMARY_OUT_OF} ${results.totalProcessed} ${uiMsg.SUMMARY_INVOICES}`;
    results.message = summaryMessage;

    logSuccess('generateAllPendingInvoices', summaryMessage);

    return results;

  } catch (error) {
    logError('generateAllPendingInvoices', 'Error during multiple generation', error);
    return {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      message: `❌ Error: ${error.message}`
    };
  }
}

// ============================================================================
// EMAIL SENDING
// ============================================================================

/**
 * Sends invoice by email to client
 * @param {Object} invoiceData - The invoice data
 * @param {GoogleAppsScript.Drive.File} pdfFile - The PDF file of the invoice
 * @param {Object} companyParams - The company parameters
 * @returns {boolean} true if sending succeeded
 */
function sendInvoiceEmail(invoiceData, pdfFile, companyParams) {
  try {
    // Validate client email
    if (!validateEmail(invoiceData.clientEmail)) {
      logError('sendInvoiceEmail', `Invalid client email for ${invoiceData.invoiceId}: ${invoiceData.clientEmail}`);
      return false;
    }

    // Get sender email
    const senderEmail = getParam(INVOICE_CONFIG.PARAM_KEYS.SENDER_EMAIL);

    // Get email template based on configured locale
    const emailTemplate = getEmailTemplate();

    // Prepare data object for template
    const emailData = {
      clientName: invoiceData.clientName,
      invoiceId: invoiceData.invoiceId,
      totalAmountFormatted: formatAmount(invoiceData.totalAmount),
      dateFormatted: formatDate(invoiceData.date),
      description: invoiceData.description,
      quantity: invoiceData.quantity,
      unitPriceFormatted: formatAmount(invoiceData.unitPrice),
      companyName: companyParams.name,
      companyPhone: companyParams.phone,
      companyEmail: companyParams.email
    };

    // Generate subject and body from template
    const subject = emailTemplate.subject(invoiceData.invoiceId, companyParams.name);
    const body = emailTemplate.body(emailData);

    // Send email with invoice attachment
    GmailApp.sendEmail(
      invoiceData.clientEmail,
      subject,
      body,
      {
        attachments: [pdfFile.getBlob()],
        name: companyParams.name,
        cc: senderEmail
      }
    );

    // Mark invoice as sent
    markInvoiceAsSent(invoiceData.invoiceId);

    logSuccess('sendInvoiceEmail', `Email sent to ${invoiceData.clientEmail} for invoice ${invoiceData.invoiceId}`);
    return true;

  } catch (error) {
    logError('sendInvoiceEmail', `Error sending email for ${invoiceData.invoiceId}`, error);
    return false;
  }
}

/**
 * Sends invoice by email manually (after generation)
 * @param {string} invoiceId - The invoice ID to send
 * @returns {Object} Sending result
 */
function sendInvoiceEmailManually(invoiceId) {
  try {
    const invoiceData = getInvoiceDataById(invoiceId);
    const locale = getConfiguredLocale();
    const messages = getMessages(locale);

    if (!invoiceData) {
      return {
        success: false,
        message: messages.ERROR_NO_DATA
      };
    }

    // Check that invoice has been generated
    if (invoiceData.status === INVOICE_CONFIG.STATUSES.DRAFT) {
      return {
        success: false,
        message: `❌ Invoice ${invoiceId} has not been generated yet`
      };
    }

    if (!invoiceData.pdfUrl) {
      return {
        success: false,
        message: `❌ PDF URL missing for invoice ${invoiceId}`
      };
    }

    // Retrieve PDF file from URL
    const pdfFile = getPdfFileFromUrl(invoiceData.pdfUrl);
    if (!pdfFile) {
      return {
        success: false,
        message: `❌ PDF file not found for invoice ${invoiceId}`
      };
    }

    const companyParams = getCompanyParams();
    const emailSent = sendInvoiceEmail(invoiceData, pdfFile, companyParams);

    if (emailSent) {
      return {
        success: true,
        message: messages.SUCCESS_EMAIL
      };
    } else {
      return {
        success: false,
        message: `❌ Failed to send email for ${invoiceId}`
      };
    }

  } catch (error) {
    logError('sendInvoiceEmailManually', `Error during manual sending`, error);
    return {
      success: false,
      message: `❌ Error: ${error.message}`
    };
  }
}

/**
 * Retrieves a PDF file from its Drive URL
 * @param {string} url - The file URL on Google Drive
 * @returns {GoogleAppsScript.Drive.File|null} The file or null
 */
function getPdfFileFromUrl(url) {
  try {
    // Extract file ID from URL using more specific patterns for Google Drive URLs
    // Formats:
    // - https://drive.google.com/file/d/{FILE_ID}/view
    // - https://drive.google.com/open?id={FILE_ID}
    // - https://docs.google.com/file/d/{FILE_ID}/edit

    let fileId = null;

    // Try pattern: /d/{FILE_ID}/ or /d/{FILE_ID}?
    const pattern1 = url.match(/\/d\/([a-zA-Z0-9_-]{25,})/);
    if (pattern1) {
      fileId = pattern1[1];
    }

    // Try pattern: id={FILE_ID} or id={FILE_ID}&
    if (!fileId) {
      const pattern2 = url.match(/[?&]id=([a-zA-Z0-9_-]{25,})/);
      if (pattern2) {
        fileId = pattern2[1];
      }
    }

    // Fallback: extract any 25+ character alphanumeric string (original method)
    if (!fileId) {
      const pattern3 = url.match(/([a-zA-Z0-9_-]{25,})/);
      if (pattern3) {
        fileId = pattern3[1];
      }
    }

    if (!fileId) {
      logError('getPdfFileFromUrl', `Could not extract file ID from URL: ${url}`);
      return null;
    }

    return DriveApp.getFileById(fileId);

  } catch (error) {
    logError('getPdfFileFromUrl', 'Error retrieving PDF', error);
    return null;
  }
}
