/**
 * @file 03_InvoiceGenerator.js
 * @description Automatic PDF invoice generation from Google Docs template
 * @version 1.1 (Standardized)
 * @date 2025-12-11
 */

// ============================================================================
// INDIVIDUAL INVOICE GENERATION
// ============================================================================

/**
 * Generates a PDF invoice for a given ID
 * @param {string} invoiceId - The invoice ID to generate
 * @returns {Object} {success: boolean, message: string, url: string}
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

    // 4. CREATE DOCUMENT FROM TEMPLATE
    const templateFile = DriveApp.getFileById(templateId);
    const targetFolder = DriveApp.getFolderById(folderId);

    const fileName = generateSafeFileName(invoiceData.invoiceId, invoiceData.clientName);
    const newDocFile = templateFile.makeCopy(fileName, targetFolder);
    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();

    // 5. REPLACE MARKERS
    replaceMarkers(body, invoiceData, companyParams);

    // 6. SAVE DOCUMENT
    doc.saveAndClose();

    // 7. GENERATE PDF
    const pdfBlob = newDocFile.getAs(MimeType.PDF).setName(fileName + '.pdf');
    const pdfFile = targetFolder.createFile(pdfBlob);
    const pdfUrl = pdfFile.getUrl();

    // 8. DELETE TEMPORARY DOCUMENT (optional)
    newDocFile.setTrashed(true);

    // 9. UPDATE STATUS IN SHEET
    markInvoiceAsGenerated(invoiceData.invoiceId, pdfUrl);

    // 10. SEND EMAIL (IF ENABLED)
    const autoSendEmail = getParam(INVOICE_CONFIG.PARAM_KEYS.AUTO_SEND_EMAIL);
    if (autoSendEmail === 'true' || autoSendEmail === true) {
      sendInvoiceEmail(invoiceData, pdfFile, companyParams);
    }

    logSuccess('generateInvoiceById', `Invoice ${invoiceId} generated successfully`);

    const lang = detectUserLanguage();
    const messages = getMessages(lang);
    return {
      success: true,
      message: messages.SUCCESS_GENERATION,
      url: pdfUrl
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
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_AMOUNT, formatAmount(invoiceData.totalAmount));

  // Amount in Words
  const amountInWords = convertAmountToWords(invoiceData.totalAmount);
  body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS, amountInWords);
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
    // Extract file ID from URL
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (!fileIdMatch) return null;

    const fileId = fileIdMatch[0];
    return DriveApp.getFileById(fileId);

  } catch (error) {
    logError('getPdfFileFromUrl', 'Error retrieving PDF', error);
    return null;
  }
}
