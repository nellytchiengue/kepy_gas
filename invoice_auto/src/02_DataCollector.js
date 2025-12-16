/**
 * @file 02_DataCollector.js
 * @description Data collection and manipulation from Google Sheet
 * @version 1.1 (Standardized)
 * @date 2025-12-11
 */

// ============================================================================
// INVOICE DATA RETRIEVAL
// ============================================================================

/**
 * Retrieves invoice data by its ID
 * @param {string} invoiceId - The unique invoice ID
 * @returns {Object|null} Object containing all invoice data or null if not found
 */
function getInvoiceDataById(invoiceId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) {
      logError('getInvoiceDataById', 'Invoices sheet not found');
      return null;
    }

    const data = invoicesSheet.getDataRange().getValues();

    // Loop through rows to find the InvoiceID (column A, skip header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const currentInvoiceId = String(row[INVOICE_CONFIG.COLUMNS.INVOICE_ID]).trim();

      if (currentInvoiceId === String(invoiceId).trim()) {
        const clientName = cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_NAME]);

        // Build base data object
        const invoiceData = {
          invoiceId: currentInvoiceId,
          date: row[INVOICE_CONFIG.COLUMNS.DATE],
          clientName: clientName,
          clientEmail: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_EMAIL]),
          clientPhone: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_PHONE]),
          clientAddress: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_ADDRESS]),
          description: cleanString(row[INVOICE_CONFIG.COLUMNS.DESCRIPTION]),
          quantity: Number(row[INVOICE_CONFIG.COLUMNS.QUANTITY]) || 1,
          unitPrice: Number(row[INVOICE_CONFIG.COLUMNS.UNIT_PRICE]) || 0,
          tva: Number(row[INVOICE_CONFIG.COLUMNS.TVA]) || 0,
          totalAmount: Number(row[INVOICE_CONFIG.COLUMNS.TOTAL_AMOUNT]) || 0,
          status: String(row[INVOICE_CONFIG.COLUMNS.STATUS]).trim(),
          pdfUrl: String(row[INVOICE_CONFIG.COLUMNS.PDF_URL] || '').trim(),
          rowIndex: i + 1 // Row index (1-based for Google Sheets)
        };

        // Enrich with client legal IDs from Clients sheet
        const clientLegalInfo = getClientLegalInfoByName(clientName);
        if (clientLegalInfo) {
          invoiceData.clientCountry = clientLegalInfo.country;
          invoiceData.clientSiret = clientLegalInfo.siret;
          invoiceData.clientVatNumber = clientLegalInfo.vatNumber;
          invoiceData.clientNiu = clientLegalInfo.niu;
          invoiceData.clientTaxId = clientLegalInfo.taxId;
        }

        return invoiceData;
      }
    }

    logError('getInvoiceDataById', `InvoiceID ${invoiceId} not found`);
    return null;

  } catch (error) {
    logError('getInvoiceDataById', `Error retrieving data`, error);
    return null;
  }
}

/**
 * Retrieves client legal information from Clients sheet by client name
 * @param {string} clientName - The client name to search for
 * @returns {Object|null} Object with legal IDs or null if not found
 */
function getClientLegalInfoByName(clientName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const clientsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.CLIENTS);

    if (!clientsSheet) {
      return null;
    }

    const data = clientsSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NAME]);

      if (name === clientName) {
        return {
          country: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_COUNTRY]),
          siret: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_SIRET]),
          vatNumber: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_VAT_NUMBER]),
          niu: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NIU]),
          taxId: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_TAX_ID])
        };
      }
    }

    return null;
  } catch (error) {
    logError('getClientLegalInfoByName', `Error retrieving client legal info for ${clientName}`, error);
    return null;
  }
}

/**
 * Retrieves all invoices with a specific status
 * @param {string} status - The status to search for (e.g., "Draft")
 * @returns {Array} Array of objects containing invoice data
 */
function getInvoicesByStatus(status) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) {
      logError('getInvoicesByStatus', 'Invoices sheet not found');
      return [];
    }

    const data = invoicesSheet.getDataRange().getValues();
    const invoices = [];

    // Loop through all rows (except header)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const currentStatus = String(row[INVOICE_CONFIG.COLUMNS.STATUS]).trim();

      if (currentStatus === status) {
        const clientName = cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_NAME]);

        const invoiceData = {
          invoiceId: String(row[INVOICE_CONFIG.COLUMNS.INVOICE_ID]).trim(),
          date: row[INVOICE_CONFIG.COLUMNS.DATE],
          clientName: clientName,
          clientEmail: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_EMAIL]),
          clientPhone: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_PHONE]),
          clientAddress: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_ADDRESS]),
          description: cleanString(row[INVOICE_CONFIG.COLUMNS.DESCRIPTION]),
          quantity: Number(row[INVOICE_CONFIG.COLUMNS.QUANTITY]) || 1,
          unitPrice: Number(row[INVOICE_CONFIG.COLUMNS.UNIT_PRICE]) || 0,
          tva: Number(row[INVOICE_CONFIG.COLUMNS.TVA]) || 0,
          totalAmount: Number(row[INVOICE_CONFIG.COLUMNS.TOTAL_AMOUNT]) || 0,
          status: currentStatus,
          pdfUrl: String(row[INVOICE_CONFIG.COLUMNS.PDF_URL] || '').trim(),
          rowIndex: i + 1
        };

        // Enrich with client legal IDs from Clients sheet
        const clientLegalInfo = getClientLegalInfoByName(clientName);
        if (clientLegalInfo) {
          invoiceData.clientCountry = clientLegalInfo.country;
          invoiceData.clientSiret = clientLegalInfo.siret;
          invoiceData.clientVatNumber = clientLegalInfo.vatNumber;
          invoiceData.clientNiu = clientLegalInfo.niu;
          invoiceData.clientTaxId = clientLegalInfo.taxId;
        }

        invoices.push(invoiceData);
      }
    }

    logSuccess('getInvoicesByStatus', `${invoices.length} invoice(s) with status "${status}" found`);
    return invoices;

  } catch (error) {
    logError('getInvoicesByStatus', `Error retrieving invoices`, error);
    return [];
  }
}

/**
 * Retrieves all draft invoices (ready to be generated)
 * @returns {Array} Array of invoices with status "Draft"
 */
function getPendingInvoices() {
  return getInvoicesByStatus(INVOICE_CONFIG.STATUSES.DRAFT);
}

// ============================================================================
// DATA UPDATE FUNCTIONS
// ============================================================================

/**
 * Formats a date as a fixed datetime string (language-independent)
 * Format: YYYYMMDD HHMMSS (e.g., "20251214 225003")
 * @param {Date} date - The date to format
 * @returns {string} Formatted datetime
 */
function formatDateTime(date) {
  if (!date) date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day} ${hours}${minutes}${seconds}`;
}

/**
 * Updates an invoice status and optionally the PDF URL
 * Also updates the corresponding date column (GeneratedAt or SentAt)
 * @param {string} invoiceId - The invoice ID to update
 * @param {string} newStatus - The new status
 * @param {string} pdfUrl - The generated PDF URL (optional)
 * @returns {boolean} true if update succeeded
 */
function updateInvoiceStatus(invoiceId, newStatus, pdfUrl = null) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) {
      logError('updateInvoiceStatus', 'Invoices sheet not found');
      return false;
    }

    const data = invoicesSheet.getDataRange().getValues();
    const now = formatDateTime(new Date());

    // Find the row matching the InvoiceID
    for (let i = 1; i < data.length; i++) {
      const currentInvoiceId = String(data[i][INVOICE_CONFIG.COLUMNS.INVOICE_ID]).trim();

      if (currentInvoiceId === String(invoiceId).trim()) {
        const rowNumber = i + 1;

        // Update status
        const statusCell = invoicesSheet.getRange(rowNumber, INVOICE_CONFIG.COLUMNS.STATUS + 1);
        statusCell.setValue(newStatus);

        // Update URL if provided
        if (pdfUrl) {
          const urlCell = invoicesSheet.getRange(rowNumber, INVOICE_CONFIG.COLUMNS.PDF_URL + 1);
          urlCell.setValue(pdfUrl);
        }

        // Update the corresponding date column based on status
        if (newStatus === INVOICE_CONFIG.STATUSES.GENERATED) {
          const generatedAtCell = invoicesSheet.getRange(rowNumber, INVOICE_CONFIG.COLUMNS.GENERATED_AT + 1);
          generatedAtCell.setValue(now);
        } else if (newStatus === INVOICE_CONFIG.STATUSES.SENT) {
          const sentAtCell = invoicesSheet.getRange(rowNumber, INVOICE_CONFIG.COLUMNS.SENT_AT + 1);
          sentAtCell.setValue(now);
        }

        logSuccess('updateInvoiceStatus', `Invoice ${invoiceId} updated → ${newStatus} at ${now}`);
        return true;
      }
    }

    logError('updateInvoiceStatus', `InvoiceID ${invoiceId} not found`);
    return false;

  } catch (error) {
    logError('updateInvoiceStatus', `Error during update`, error);
    return false;
  }
}

/**
 * Marks an invoice as generated
 * @param {string} invoiceId - The invoice ID
 * @param {string} pdfUrl - The generated PDF URL
 * @returns {boolean} true if update succeeded
 */
function markInvoiceAsGenerated(invoiceId, pdfUrl) {
  return updateInvoiceStatus(invoiceId, INVOICE_CONFIG.STATUSES.GENERATED, pdfUrl);
}

/**
 * Marks an invoice as sent
 * @param {string} invoiceId - The invoice ID
 * @returns {boolean} true if update succeeded
 */
function markInvoiceAsSent(invoiceId) {
  return updateInvoiceStatus(invoiceId, INVOICE_CONFIG.STATUSES.SENT);
}

// ============================================================================
// DATA VALIDATION
// ============================================================================

/**
 * Validates that an invoice contains all required data
 * @param {Object} invoiceData - The invoice data
 * @returns {Object} {isValid: boolean, errors: Array}
 */
function validateInvoiceData(invoiceData) {
  const errors = [];

  // Validation InvoiceID
  if (isEmpty(invoiceData.invoiceId)) {
    errors.push('InvoiceID missing');
  }

  // Validation Client
  if (isEmpty(invoiceData.clientName)) {
    errors.push('Client name missing');
  }

  // Validation Product/Service
  if (isEmpty(invoiceData.description)) {
    errors.push('Description missing');
  }

  // Validation Quantity
  if (!invoiceData.quantity || invoiceData.quantity <= 0) {
    errors.push('Invalid quantity');
  }

  // Validation Unit Price
  if (!validateAmount(invoiceData.unitPrice)) {
    errors.push('Invalid unit price');
  }

  // Validation Total Amount
  if (!validateAmount(invoiceData.totalAmount)) {
    errors.push('Invalid total amount');
  }

  // Validation Amount Consistency
  const expectedTotal = invoiceData.quantity * invoiceData.unitPrice;
  if (Math.abs(invoiceData.totalAmount - expectedTotal) > 0.01) {
    errors.push(`Inconsistency: Total amount (${invoiceData.totalAmount}) ≠ Quantity × Unit Price (${expectedTotal})`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// ============================================================================
// STATISTICS AND REPORTS
// ============================================================================

/**
 * Counts the number of invoices by status
 * @returns {Object} Object with the number of invoices per status
 */
function getInvoiceStatistics() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) {
      return null;
    }

    const data = invoicesSheet.getDataRange().getValues();
    const stats = {
      total: data.length - 1, // Excludes header
      draft: 0,
      generated: 0,
      sent: 0
    };

    for (let i = 1; i < data.length; i++) {
      const status = String(data[i][INVOICE_CONFIG.COLUMNS.STATUS]).trim();

      if (status === INVOICE_CONFIG.STATUSES.DRAFT) stats.draft++;
      else if (status === INVOICE_CONFIG.STATUSES.GENERATED) stats.generated++;
      else if (status === INVOICE_CONFIG.STATUSES.SENT) stats.sent++;
    }

    return stats;

  } catch (error) {
    logError('getInvoiceStatistics', 'Error calculating statistics', error);
    return null;
  }
}