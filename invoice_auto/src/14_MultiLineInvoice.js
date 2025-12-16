/**
 * @file 14_MultiLineInvoice.js
 * @description Support for multi-line invoices with multiple products/services
 *              Support des factures multi-lignes avec plusieurs produits/services
 * @version 1.0
 * @date 2025-12-14
 * @author InvoiceFlash - Multi-Country Edition
 */

// ============================================================================
// CONSTANTS / CONSTANTES
// ============================================================================

const INVOICE_LINES_SHEET = 'InvoiceLines';
const MAX_LINES_PER_INVOICE = 20;

// ============================================================================
// INVOICE LINES MANAGEMENT / GESTION DES LIGNES DE FACTURE
// ============================================================================

/**
 * Gets all lines for a specific invoice
 * Recupere toutes les lignes d'une facture specifique
 * @param {string} invoiceId - The invoice ID
 * @returns {Array} Array of line objects
 */
function getInvoiceLines(invoiceId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const linesSheet = ss.getSheetByName(INVOICE_LINES_SHEET);

    if (!linesSheet) {
      // Fall back to single line from Invoices sheet
      return getInvoiceLinesFromMainSheet(invoiceId);
    }

    const data = linesSheet.getDataRange().getValues();
    const lines = [];

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] === invoiceId) { // Column B = InvoiceID
        lines.push({
          lineId: row[0],           // LineID
          invoiceId: row[1],        // InvoiceID
          serviceId: row[2],        // ServiceID
          description: row[3],      // Description
          quantity: parseFloat(row[4]) || 0,
          unitPrice: parseFloat(row[5]) || 0,
          vatRate: parseFloat(row[6]) || 0,
          vatAmount: parseFloat(row[7]) || 0,
          lineTotal: parseFloat(row[8]) || 0,
          unit: row[9] || ''        // Unit (hour, day, piece, etc.)
        });
      }
    }

    return lines;

  } catch (error) {
    logError('getInvoiceLines', 'Error getting invoice lines', error);
    return [];
  }
}

/**
 * Gets invoice line from main Invoices sheet (single line fallback)
 * @param {string} invoiceId - The invoice ID
 * @returns {Array} Array with single line object
 */
function getInvoiceLinesFromMainSheet(invoiceId) {
  try {
    const invoiceData = getInvoiceDataById(invoiceId);

    if (!invoiceData) return [];

    return [{
      lineId: invoiceId + '-L001',
      invoiceId: invoiceId,
      serviceId: '',
      description: invoiceData.description,
      quantity: invoiceData.quantity,
      unitPrice: invoiceData.unitPrice,
      vatRate: invoiceData.vatRate || 0,
      vatAmount: invoiceData.tva || 0,
      lineTotal: invoiceData.totalAmount,
      unit: ''
    }];

  } catch (error) {
    logError('getInvoiceLinesFromMainSheet', 'Error', error);
    return [];
  }
}

/**
 * Adds a new line to an invoice
 * Ajoute une nouvelle ligne a une facture
 * @param {string} invoiceId - The invoice ID
 * @param {Object} lineData - Line data {description, quantity, unitPrice, vatRate, serviceId, unit}
 * @returns {Object} {success: boolean, lineId: string, message: string}
 */
function addInvoiceLine(invoiceId, lineData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let linesSheet = ss.getSheetByName(INVOICE_LINES_SHEET);

    // Create sheet if doesn't exist
    if (!linesSheet) {
      linesSheet = createInvoiceLinesSheet(ss);
    }

    // Check max lines
    const existingLines = getInvoiceLines(invoiceId);
    if (existingLines.length >= MAX_LINES_PER_INVOICE) {
      return {
        success: false,
        message: `Maximum ${MAX_LINES_PER_INVOICE} lines per invoice`
      };
    }

    // Generate line ID
    const lineId = generateLineId(invoiceId, existingLines.length + 1);

    // Get country for VAT calculation
    const country = getParam('COUNTRY') || 'FR';

    // Calculate line amounts
    const quantity = parseFloat(lineData.quantity) || 0;
    const unitPrice = parseFloat(lineData.unitPrice) || 0;
    const vatRate = parseFloat(lineData.vatRate) || getDefaultVatRateForCountry(country);

    const lineHT = quantity * unitPrice;
    const vatAmount = calculateVatAmount(lineHT, vatRate, country);
    const lineTotal = lineHT + vatAmount;

    // Round according to country
    const roundedVatAmount = roundAmount(vatAmount, country);
    const roundedLineTotal = roundAmount(lineTotal, country);

    // Append new line
    const newRow = [
      lineId,
      invoiceId,
      lineData.serviceId || '',
      lineData.description || '',
      quantity,
      unitPrice,
      vatRate,
      roundedVatAmount,
      roundedLineTotal,
      lineData.unit || ''
    ];

    linesSheet.appendRow(newRow);

    // Update invoice totals
    updateInvoiceTotals(invoiceId);

    logSuccess('addInvoiceLine', `Line ${lineId} added to invoice ${invoiceId}`);

    return {
      success: true,
      lineId: lineId,
      message: 'Line added successfully'
    };

  } catch (error) {
    logError('addInvoiceLine', 'Error adding line', error);
    return { success: false, message: error.message };
  }
}

/**
 * Updates an existing invoice line
 * Met a jour une ligne de facture existante
 * @param {string} lineId - The line ID to update
 * @param {Object} lineData - Updated line data
 * @returns {Object} {success: boolean, message: string}
 */
function updateInvoiceLine(lineId, lineData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const linesSheet = ss.getSheetByName(INVOICE_LINES_SHEET);

    if (!linesSheet) {
      return { success: false, message: 'InvoiceLines sheet not found' };
    }

    const data = linesSheet.getDataRange().getValues();
    let rowIndex = -1;
    let invoiceId = '';

    // Find the line
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === lineId) {
        rowIndex = i + 1; // 1-indexed for getRange
        invoiceId = data[i][1];
        break;
      }
    }

    if (rowIndex === -1) {
      return { success: false, message: 'Line not found' };
    }

    // Get country for calculations
    const country = getParam('COUNTRY') || 'FR';

    // Calculate amounts
    const quantity = parseFloat(lineData.quantity) || 0;
    const unitPrice = parseFloat(lineData.unitPrice) || 0;
    const vatRate = parseFloat(lineData.vatRate) || getDefaultVatRateForCountry(country);

    const lineHT = quantity * unitPrice;
    const vatAmount = roundAmount(calculateVatAmount(lineHT, vatRate, country), country);
    const lineTotal = roundAmount(lineHT + vatAmount, country);

    // Update the row
    const updatedRow = [
      lineId,
      invoiceId,
      lineData.serviceId || '',
      lineData.description || '',
      quantity,
      unitPrice,
      vatRate,
      vatAmount,
      lineTotal,
      lineData.unit || ''
    ];

    linesSheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);

    // Update invoice totals
    updateInvoiceTotals(invoiceId);

    logSuccess('updateInvoiceLine', `Line ${lineId} updated`);

    return { success: true, message: 'Line updated successfully' };

  } catch (error) {
    logError('updateInvoiceLine', 'Error updating line', error);
    return { success: false, message: error.message };
  }
}

/**
 * Deletes an invoice line
 * Supprime une ligne de facture
 * @param {string} lineId - The line ID to delete
 * @returns {Object} {success: boolean, message: string}
 */
function deleteInvoiceLine(lineId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const linesSheet = ss.getSheetByName(INVOICE_LINES_SHEET);

    if (!linesSheet) {
      return { success: false, message: 'InvoiceLines sheet not found' };
    }

    const data = linesSheet.getDataRange().getValues();
    let rowIndex = -1;
    let invoiceId = '';

    // Find the line
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === lineId) {
        rowIndex = i + 1;
        invoiceId = data[i][1];
        break;
      }
    }

    if (rowIndex === -1) {
      return { success: false, message: 'Line not found' };
    }

    // Delete the row
    linesSheet.deleteRow(rowIndex);

    // Update invoice totals
    updateInvoiceTotals(invoiceId);

    logSuccess('deleteInvoiceLine', `Line ${lineId} deleted`);

    return { success: true, message: 'Line deleted successfully' };

  } catch (error) {
    logError('deleteInvoiceLine', 'Error deleting line', error);
    return { success: false, message: error.message };
  }
}

// ============================================================================
// INVOICE TOTALS UPDATE / MISE A JOUR TOTAUX FACTURE
// ============================================================================

/**
 * Updates invoice totals after line changes
 * Met a jour les totaux de la facture apres modification des lignes
 * @param {string} invoiceId - The invoice ID
 */
function updateInvoiceTotals(invoiceId) {
  try {
    const lines = getInvoiceLines(invoiceId);
    const country = getParam('COUNTRY') || 'FR';

    // Calculate totals
    let totalHT = 0;
    let totalVat = 0;

    lines.forEach(line => {
      const lineHT = line.quantity * line.unitPrice;
      totalHT += lineHT;
      totalVat += line.vatAmount;
    });

    const totalTTC = roundAmount(totalHT + totalVat, country);
    totalHT = roundAmount(totalHT, country);
    totalVat = roundAmount(totalVat, country);

    // Update main Invoices sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) return;

    const data = invoicesSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === invoiceId) {
        const rowIndex = i + 1;
        // Update TVA (column J = index 9), TotalAmount (column K = index 10)
        invoicesSheet.getRange(rowIndex, 10).setValue(totalVat);  // TVA column
        invoicesSheet.getRange(rowIndex, 11).setValue(totalTTC);  // TotalAmount column
        break;
      }
    }

    logSuccess('updateInvoiceTotals', `Totals updated for ${invoiceId}: HT=${totalHT}, TVA=${totalVat}, TTC=${totalTTC}`);

  } catch (error) {
    logError('updateInvoiceTotals', 'Error updating totals', error);
  }
}

// ============================================================================
// SHEET CREATION / CREATION DE FEUILLE
// ============================================================================

/**
 * Creates the InvoiceLines sheet with proper structure
 * Cree la feuille InvoiceLines avec la structure appropriee
 * @param {SpreadsheetApp.Spreadsheet} ss - The spreadsheet
 * @returns {SpreadsheetApp.Sheet} The created sheet
 */
function createInvoiceLinesSheet(ss) {
  const sheet = ss.insertSheet(INVOICE_LINES_SHEET);

  // Set headers
  const headers = [
    'LineID',
    'InvoiceID',
    'ServiceID',
    'Description',
    'Quantity',
    'UnitPrice',
    'VATRate',
    'VATAmount',
    'LineTotal',
    'Unit'
  ];

  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold')
    .setBackground('#9b59b6')  // Purple for lines
    .setFontColor('#FFFFFF');

  // Set column widths
  sheet.setColumnWidth(1, 150);   // LineID
  sheet.setColumnWidth(2, 150);   // InvoiceID
  sheet.setColumnWidth(3, 100);   // ServiceID
  sheet.setColumnWidth(4, 250);   // Description
  sheet.setColumnWidth(5, 80);    // Quantity
  sheet.setColumnWidth(6, 100);   // UnitPrice
  sheet.setColumnWidth(7, 80);    // VATRate
  sheet.setColumnWidth(8, 100);   // VATAmount
  sheet.setColumnWidth(9, 100);   // LineTotal
  sheet.setColumnWidth(10, 80);   // Unit

  // Freeze header row
  sheet.setFrozenRows(1);

  logSuccess('createInvoiceLinesSheet', 'InvoiceLines sheet created');

  return sheet;
}

// ============================================================================
// HELPER FUNCTIONS / FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Generates a unique line ID
 * @param {string} invoiceId - The invoice ID
 * @param {number} lineNumber - The line number
 * @returns {string} Line ID (e.g., INV2025-001-L001)
 */
function generateLineId(invoiceId, lineNumber) {
  return invoiceId + '-L' + String(lineNumber).padStart(3, '0');
}

/**
 * Creates a multi-line invoice with multiple services
 * Cree une facture multi-lignes avec plusieurs services
 * @param {Object} clientInfo - Client information
 * @param {Array} lines - Array of line data [{description, quantity, unitPrice, vatRate, serviceId}]
 * @returns {Object} {success: boolean, invoiceId: string, message: string}
 */
function createMultiLineInvoice(clientInfo, lines) {
  try {
    if (!lines || lines.length === 0) {
      return { success: false, message: 'At least one line is required' };
    }

    // Create the main invoice first (with first line data)
    const firstLine = lines[0];
    const invoiceResult = createNewInvoice(
      clientInfo,
      firstLine.description,
      firstLine.quantity,
      firstLine.unitPrice,
      0  // TVA will be calculated and updated
    );

    if (!invoiceResult.success) {
      return invoiceResult;
    }

    const invoiceId = invoiceResult.invoiceId;

    // Create InvoiceLines sheet if needed
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let linesSheet = ss.getSheetByName(INVOICE_LINES_SHEET);
    if (!linesSheet) {
      linesSheet = createInvoiceLinesSheet(ss);
    }

    // Add all lines
    const country = getParam('COUNTRY') || 'FR';

    lines.forEach((line, index) => {
      const lineId = generateLineId(invoiceId, index + 1);
      const quantity = parseFloat(line.quantity) || 0;
      const unitPrice = parseFloat(line.unitPrice) || 0;
      const vatRate = parseFloat(line.vatRate) || getDefaultVatRateForCountry(country);

      const lineHT = quantity * unitPrice;
      const vatAmount = roundAmount(calculateVatAmount(lineHT, vatRate, country), country);
      const lineTotal = roundAmount(lineHT + vatAmount, country);

      const newRow = [
        lineId,
        invoiceId,
        line.serviceId || '',
        line.description || '',
        quantity,
        unitPrice,
        vatRate,
        vatAmount,
        lineTotal,
        line.unit || ''
      ];

      linesSheet.appendRow(newRow);
    });

    // Update invoice totals
    updateInvoiceTotals(invoiceId);

    logSuccess('createMultiLineInvoice', `Multi-line invoice ${invoiceId} created with ${lines.length} lines`);

    return {
      success: true,
      invoiceId: invoiceId,
      linesCount: lines.length,
      message: 'Multi-line invoice created successfully'
    };

  } catch (error) {
    logError('createMultiLineInvoice', 'Error creating multi-line invoice', error);
    return { success: false, message: error.message };
  }
}

/**
 * Generates line items table for document replacement
 * Genere le tableau des lignes pour remplacement dans le document
 * @param {string} invoiceId - The invoice ID
 * @returns {string} Formatted table content
 */
function generateLinesTableContent(invoiceId) {
  const lines = getInvoiceLines(invoiceId);
  const country = getParam('COUNTRY') || 'FR';

  if (lines.length === 0) {
    return '';
  }

  // For now, return lines as formatted text
  // In future, this could generate a proper table structure
  return lines.map((line, index) => {
    const lineHT = line.quantity * line.unitPrice;
    return `${line.description}\t${line.quantity}\t${formatAmountForCountry(line.unitPrice)}\t${line.vatRate}%\t${formatAmountForCountry(lineHT)}`;
  }).join('\n');
}

/**
 * Checks if an invoice has multiple lines
 * @param {string} invoiceId - The invoice ID
 * @returns {boolean} True if invoice has multiple lines
 */
function isMultiLineInvoice(invoiceId) {
  const lines = getInvoiceLines(invoiceId);
  return lines.length > 1;
}

// ============================================================================
// MENU INTEGRATION / INTEGRATION MENU
// ============================================================================

/**
 * Opens the multi-line invoice creation dialog
 * Ouvre le dialogue de creation de facture multi-lignes
 */
function menuAddMultiLineInvoice() {
  const lang = getConfiguredLocale();
  const title = lang === 'FR' ? 'Nouvelle Facture Multi-lignes' : 'New Multi-line Invoice';

  const ui = SpreadsheetApp.getUi();
  ui.alert(
    title,
    lang === 'FR'
      ? 'Cette fonctionnalite sera disponible dans une prochaine version.\n\nPour l\'instant, creez une facture standard puis ajoutez des lignes via la feuille InvoiceLines.'
      : 'This feature will be available in a future version.\n\nFor now, create a standard invoice then add lines via the InvoiceLines sheet.',
    ui.ButtonSet.OK
  );
}
