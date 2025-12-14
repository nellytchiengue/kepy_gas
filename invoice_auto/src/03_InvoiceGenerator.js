/**
 * @file 03_InvoiceGenerator.js
 * @description Automatic Google Doc and PDF invoice generation from template
 * @version 1.2 (Google Doc + PDF with client folders)
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
 * @param {GoogleAppsScript.Document.Body} body - The document body
 * @param {Object} invoiceData - The invoice data
 * @param {Object} companyParams - The company parameters
 */
function replaceMarkers(body, invoiceData, companyParams) {
  // Get labels in configured language
  const labels = getInvoiceLabels();

  // Company Information
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_NAME, companyParams.name || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_ADDRESS, companyParams.address || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_PHONE, companyParams.phone || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_EMAIL, companyParams.email || 'N/A');

  // Invoice Information
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_ID, invoiceData.invoiceId);
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_DATE, formatDate(invoiceData.date));

  // Client Information
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_NAME, invoiceData.clientName || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_EMAIL, invoiceData.clientEmail || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_PHONE, invoiceData.clientPhone || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_ADDRESS, invoiceData.clientAddress || 'N/A');

  // Transaction Details
  body.replaceText(INVOICE_CONFIG.MARKERS.DESCRIPTION, invoiceData.description);
  body.replaceText(INVOICE_CONFIG.MARKERS.QUANTITY, String(invoiceData.quantity));
  body.replaceText(INVOICE_CONFIG.MARKERS.UNIT_PRICE, formatAmount(invoiceData.unitPrice));
  body.replaceText(INVOICE_CONFIG.MARKERS.TVA, formatAmount(invoiceData.tva || 0));
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_AMOUNT, formatAmount(invoiceData.totalAmount));

  // Amount in Words
  const amountInWords = convertAmountToWords(invoiceData.totalAmount);
  body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS, amountInWords);

  // Invoice Labels (translated according to language)
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_INVOICE, labels.LABEL_INVOICE);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_INVOICE_NUMBER, labels.LABEL_INVOICE_NUMBER);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_DATE, labels.LABEL_DATE);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_BILLED_TO, labels.LABEL_BILLED_TO);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_DESCRIPTION, labels.LABEL_DESCRIPTION);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_QTY, labels.LABEL_QTY);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_UNIT_PRICE, labels.LABEL_UNIT_PRICE);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_TVA, labels.LABEL_TVA);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_TOTAL, labels.LABEL_TOTAL);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_FOOTER, labels.LABEL_FOOTER);
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
