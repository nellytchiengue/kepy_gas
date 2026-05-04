/**
 * @file 02_DataCollector.js
 * @description Data collection and manipulation from Google Sheet
 * @version 1.1 (Standardized)
 * @date 2025-12-11
 */

// ============================================================================
// BATCHED SHEET READING - Avoids memory limits on large sheets
// ============================================================================

/**
 * Reads sheet data in batches to avoid memory limits
 * Uses generator pattern for memory-efficient iteration
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to read
 * @param {number} batchSize - Rows per batch (default 500)
 * @yields {{rows: Array, startIndex: number}} Batch of rows with their starting index
 */
function* readSheetInBatches(sheet, batchSize) {
  if (batchSize === undefined) batchSize = 500;

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow <= 1) return; // Only header or empty

  for (var start = 2; start <= lastRow; start += batchSize) {
    var numRows = Math.min(batchSize, lastRow - start + 1);
    var rows = sheet.getRange(start, 1, numRows, lastCol).getValues();
    yield { rows: rows, startIndex: start };
  }
}

/**
 * Finds a row by ID using batched reading
 * More efficient than loading entire sheet for single lookups
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to search
 * @param {string} searchId - The ID to find
 * @param {number} idColumnIndex - Column index of ID (0-based)
 * @returns {{row: Array, rowIndex: number}|null} Found row with its index, or null
 */
function findRowById(sheet, searchId, idColumnIndex) {
  var normalizedId = String(searchId).trim();

  var batchIterator = readSheetInBatches(sheet);
  var batch = batchIterator.next();

  while (!batch.done) {
    var rows = batch.value.rows;
    var startIndex = batch.value.startIndex;

    for (var i = 0; i < rows.length; i++) {
      var rowId = String(rows[i][idColumnIndex]).trim();
      if (rowId === normalizedId) {
        return {
          row: rows[i],
          rowIndex: startIndex + i // 1-based row number
        };
      }
    }
    batch = batchIterator.next();
  }
  return null;
}

/**
 * Collects all rows matching a filter condition using batched reading
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to search
 * @param {function} filterFn - Function(row, index) returning true for matches
 * @param {number} maxResults - Maximum results to return (0 = unlimited)
 * @returns {Array<{row: Array, rowIndex: number}>} Matching rows with indices
 */
function findRowsByFilter(sheet, filterFn, maxResults) {
  if (maxResults === undefined) maxResults = 0;

  var results = [];
  var batchIterator = readSheetInBatches(sheet);
  var batch = batchIterator.next();

  while (!batch.done) {
    var rows = batch.value.rows;
    var startIndex = batch.value.startIndex;

    for (var i = 0; i < rows.length; i++) {
      if (filterFn(rows[i], startIndex + i)) {
        results.push({
          row: rows[i],
          rowIndex: startIndex + i
        });

        if (maxResults > 0 && results.length >= maxResults) {
          return results;
        }
      }
    }
    batch = batchIterator.next();
  }
  return results;
}

// ============================================================================
// INVOICE DATA RETRIEVAL
// ============================================================================

/**
 * Retrieves invoice data by its ID
 * Uses batched reading for better performance on large sheets
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

    // Use batched reading instead of getDataRange() for better performance
    const result = findRowById(invoicesSheet, invoiceId, INVOICE_CONFIG.COLUMNS.INVOICE_ID);

    if (!result) {
      logError('getInvoiceDataById', `InvoiceID ${invoiceId} not found`);
      return null;
    }

    const row = result.row;
    const clientName = cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_NAME]);

    // Build base data object
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
      status: String(row[INVOICE_CONFIG.COLUMNS.STATUS]).trim(),
      pdfUrl: String(row[INVOICE_CONFIG.COLUMNS.PDF_URL] || '').trim(),
      rowIndex: result.rowIndex
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

  } catch (error) {
    logError('getInvoiceDataById', `Error retrieving data`, error);
    return null;
  }
}

/**
 * Cache for Clients data - avoids multiple reads of the same sheet
 */
var _clientsCache = null;
var _clientsCacheTimestamp = 0;
var CLIENTS_CACHE_TTL_MS = 30000; // Cache valid for 30 seconds

/**
 * Loads all Clients into cache (single read)
 * @returns {Object} Map of clientName -> clientData
 */
function loadClientsCache() {
  const now = Date.now();

  // Return cache if still valid
  if (_clientsCache && (now - _clientsCacheTimestamp) < CLIENTS_CACHE_TTL_MS) {
    return _clientsCache;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const clientsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.CLIENTS);

    if (!clientsSheet) {
      return {};
    }

    const data = clientsSheet.getDataRange().getValues();
    _clientsCache = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const name = cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NAME]);
      if (name) {
        _clientsCache[name] = {
          country: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_COUNTRY]),
          siret: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_SIRET]),
          vatNumber: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_VAT_NUMBER]),
          niu: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NIU]),
          taxId: cleanString(row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_TAX_ID])
        };
      }
    }

    _clientsCacheTimestamp = now;
    return _clientsCache;

  } catch (error) {
    Logger.log('Error loading clients cache: ' + error);
    return {};
  }
}

/**
 * Clears the Clients cache (call after updating Clients)
 */
function clearClientsCache() {
  _clientsCache = null;
  _clientsCacheTimestamp = 0;
}

/**
 * Retrieves client legal information from Clients sheet by client name (uses cache)
 * @param {string} clientName - The client name to search for
 * @returns {Object|null} Object with legal IDs or null if not found
 */
function getClientLegalInfoByName(clientName) {
  const cache = loadClientsCache();
  return cache[clientName] || null;
}

/**
 * Retrieves all invoices with a specific status
 * Uses batched reading for better performance on large sheets
 * @param {string} status - The status to search for (e.g., "Draft")
 * @param {number} maxResults - Maximum results to return (0 = unlimited, default)
 * @returns {Array} Array of objects containing invoice data
 */
function getInvoicesByStatus(status, maxResults) {
  if (maxResults === undefined) maxResults = 0;

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) {
      logError('getInvoicesByStatus', 'Invoices sheet not found');
      return [];
    }

    // Use batched reading with filter
    const statusColumn = INVOICE_CONFIG.COLUMNS.STATUS;
    const matchingRows = findRowsByFilter(invoicesSheet, function(row) {
      return String(row[statusColumn]).trim() === status;
    }, maxResults);

    const invoices = matchingRows.map(function(result) {
      const row = result.row;
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
        status: status,
        pdfUrl: String(row[INVOICE_CONFIG.COLUMNS.PDF_URL] || '').trim(),
        rowIndex: result.rowIndex
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
    });

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

  // Validation Amount Consistency (including TVA)
  const subtotal = invoiceData.quantity * invoiceData.unitPrice;
  const tvaAmount = invoiceData.tva || 0;
  const expectedTotal = subtotal + tvaAmount;
  if (Math.abs(invoiceData.totalAmount - expectedTotal) > 0.01) {
    errors.push(`Inconsistency: Total amount (${invoiceData.totalAmount}) ≠ (Quantity × Unit Price) + TVA (${subtotal} + ${tvaAmount} = ${expectedTotal})`);
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