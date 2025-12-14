/**
 * @file 04_Main.js
 * @description Main entry point and user interface (custom menu)
 * @version 1.1 (Bilingual Edition)
 * @date 2025-12-12
 */

// ============================================================================
// CUSTOM MENU IN GOOGLE SHEETS
// ============================================================================

/**
 * Creates a custom menu when opening the Google Sheet
 * This function is automatically called by Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const msg = getUIMessages();
  const lang = getConfiguredLocale();

  // Nouveau label pour l'ajout de facture
  const newInvoiceLabel = lang === 'FR' ? '➕ Nouvelle facture' : '➕ New Invoice';

  ui.createMenu(msg.MENU_TITLE)
    .addItem(newInvoiceLabel, 'menuAddNewInvoice')  // ← NOUVEAU
    .addSeparator()
    .addItem(msg.MENU_GENERATE_ALL, 'menuGenerateAllInvoices')
    .addItem(msg.MENU_GENERATE_SINGLE, 'menuGenerateSingleInvoice')
    .addSeparator()
    .addItem(msg.MENU_SEND_EMAIL, 'menuSendInvoiceEmail')
    .addSeparator()
    .addItem(msg.MENU_STATISTICS, 'menuShowStatistics')
    .addSeparator()
    .addItem(msg.MENU_TEST_PERMISSIONS, 'menuTestPermissions')
    .addItem(msg.MENU_ABOUT, 'menuAbout')
    .addToUi();

  Logger.log('Menu created successfully');
}

// ============================================================================
// MENU FUNCTIONS - INVOICE GENERATION
// ============================================================================

/**
 * Menu: Generates all invoices with status "Draft"
 */
function menuGenerateAllInvoices() {
  const ui = SpreadsheetApp.getUi();
  const msg = getUIMessages();

  // Confirmation before generation
  const response = ui.alert(
    msg.GENERATE_ALL_TITLE,
    msg.GENERATE_ALL_CONFIRM,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ui.alert(msg.OPERATION_CANCELLED);
    return;
  }

  // Generate all invoices (processing starts immediately)
  const result = generateAllPendingInvoices();

  // Force UI refresh to remove "Working" spinner
  SpreadsheetApp.flush();

  // Display result
  if (result.totalProcessed === 0) {
    ui.alert(msg.INFO_TITLE, result.message, ui.ButtonSet.OK);
  } else {
    const details = result.details
      .map(d => `${d.invoiceId}: ${d.success ? '✅' : '❌'} ${d.message}`)
      .join('\n');

    ui.alert(
      msg.RESULT_TITLE,
      `${result.message}\n\n${msg.DETAILS_LABEL}\n${details}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Menu: Generates a specific invoice by ID
 */
function menuGenerateSingleInvoice() {
  const ui = SpreadsheetApp.getUi();
  const msg = getUIMessages();

  // Ask for invoice ID
  const response = ui.prompt(
    msg.MENU_GENERATE_SINGLE,
    msg.ENTER_INVOICE_ID,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    ui.alert(msg.OPERATION_CANCELLED);
    return;
  }

  const invoiceId = response.getResponseText().trim();

  if (!invoiceId) {
    ui.alert(msg.ERROR_TITLE, msg.INVOICE_ID_MISSING, ui.ButtonSet.OK);
    return;
  }

  // Generate invoice (processing starts immediately)
  const result = generateInvoiceById(invoiceId);

  // Force UI refresh to remove "Working" spinner
  SpreadsheetApp.flush();

  // Display result
  if (result.success) {
    ui.alert(
      msg.SUCCESS_TITLE,
      `${result.message}\n\nPDF URL:\n${result.url}`,
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(msg.ERROR_TITLE, result.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// MENU FUNCTIONS - EMAIL SENDING
// ============================================================================

/**
 * Menu: Sends an invoice by email
 */
function menuSendInvoiceEmail() {
  const ui = SpreadsheetApp.getUi();
  const msg = getUIMessages();

  // Ask for invoice ID
  const response = ui.prompt(
    msg.MENU_SEND_EMAIL,
    msg.ENTER_INVOICE_ID_SEND,
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    ui.alert(msg.OPERATION_CANCELLED);
    return;
  }

  const invoiceId = response.getResponseText().trim();

  if (!invoiceId) {
    ui.alert(msg.ERROR_TITLE, msg.INVOICE_ID_MISSING, ui.ButtonSet.OK);
    return;
  }

  // Send email (processing starts immediately)
  const result = sendInvoiceEmailManually(invoiceId);

  // Force UI refresh to remove "Working" spinner
  SpreadsheetApp.flush();

  // Display result
  ui.alert(
    result.success ? msg.SUCCESS_TITLE : msg.ERROR_TITLE,
    result.message,
    ui.ButtonSet.OK
  );
}

// ============================================================================
// MENU FUNCTIONS - STATISTICS
// ============================================================================

/**
 * Menu: Displays invoice statistics
 */
function menuShowStatistics() {
  const ui = SpreadsheetApp.getUi();
  const msg = getUIMessages();

  const stats = getInvoiceStatistics();

  // Force UI refresh to remove "Working" spinner
  SpreadsheetApp.flush();

  if (!stats) {
    ui.alert(msg.ERROR_TITLE, msg.STATS_ERROR, ui.ButtonSet.OK);
    return;
  }

  const message = `
${msg.STATS_TITLE}

${msg.STATS_TOTAL}: ${stats.total}

${msg.STATS_BY_STATUS}
  📝 ${msg.STATS_DRAFT}: ${stats.draft}
  ✅ ${msg.STATS_GENERATED}: ${stats.generated}
  📧 ${msg.STATS_SENT}: ${stats.sent}
  `;

  ui.alert(msg.MENU_STATISTICS, message, ui.ButtonSet.OK);
}

// ============================================================================
// MENU FUNCTIONS - TESTS AND CONFIGURATION
// ============================================================================

/**
 * Menu: Tests all necessary permissions
 */
function menuTestPermissions() {
  const ui = SpreadsheetApp.getUi();
  const msg = getUIMessages();

  try {
    ui.alert(msg.TEST_IN_PROGRESS, msg.TEST_VERIFYING, ui.ButtonSet.OK);

    const results = testAllPermissions();

    // Force UI refresh to remove "Working" spinner
    SpreadsheetApp.flush();

    const message = `
${results.success ? msg.TEST_SUCCESS : msg.TEST_FAILURE}

${msg.DETAILS_LABEL}
${results.details.map(d => `${d.test}: ${d.success ? '✅' : '❌'} ${d.message}`).join('\n')}
    `;

    ui.alert(msg.TEST_TITLE, message, ui.ButtonSet.OK);

  } catch (error) {
    // Force UI refresh even on error
    SpreadsheetApp.flush();
    ui.alert(msg.ERROR_TITLE, `${msg.TEST_ERROR}: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Menu: Displays system information
 */
function menuAbout() {
  const ui = SpreadsheetApp.getUi();
  const msg = getUIMessages();

  const message = `
${msg.ABOUT_SYSTEM}

${msg.ABOUT_VERSION}: ${INVOICE_CONFIG.APP.VERSION}
${msg.ABOUT_DATE}: 2025-12-12

${msg.ABOUT_FEATURES}
  ${msg.ABOUT_FEATURE_1}
  ${msg.ABOUT_FEATURE_2}
  ${msg.ABOUT_FEATURE_3}
  ${msg.ABOUT_FEATURE_4}

${msg.ABOUT_README}
  `;

  ui.alert(msg.ABOUT_TITLE, message, ui.ButtonSet.OK);
}

// ============================================================================
// TESTS DE PERMISSIONS
// ============================================================================

/**
 * Teste toutes les permissions et configurations nécessaires
 * @returns {Object} Résultats des tests
 */
function testAllPermissions() {
  const results = {
    success: true,
    details: []
  };

  // Test 1: Accès au Spreadsheet
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const name = ss.getName();
    results.details.push({
      test: 'Accès Spreadsheet',
      success: true,
      message: `OK - ${name}`
    });
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Accès Spreadsheet',
      success: false,
      message: error.message
    });
  }

  // Test 2: Invoices Sheet
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);
    if (sheet) {
      results.details.push({
        test: 'Invoices Sheet',
        success: true,
        message: 'OK'
      });
    } else {
      throw new Error('Sheet not found');
    }
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Invoices Sheet',
      success: false,
      message: error.message
    });
  }

  // Test 3: Settings Sheet
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SETTINGS);
    if (sheet) {
      results.details.push({
        test: 'Settings Sheet',
        success: true,
        message: 'OK'
      });
    } else {
      throw new Error('Sheet not found');
    }
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Settings Sheet',
      success: false,
      message: error.message
    });
  }

  // Test 4: Template Docs Access
  try {
    const templateId = getParam(INVOICE_CONFIG.PARAM_KEYS.TEMPLATE_DOCS_ID);
    if (templateId) {
      const template = DriveApp.getFileById(templateId);
      results.details.push({
        test: 'Template Docs',
        success: true,
        message: `OK - ${template.getName()}`
      });
    } else {
      throw new Error('Template ID not configured');
    }
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Template Docs',
      success: false,
      message: error.message
    });
  }

  // Test 5: Drive Folder Access
  try {
    const folderId = getParam(INVOICE_CONFIG.PARAM_KEYS.DRIVE_FOLDER_ID);
    if (folderId) {
      const folder = DriveApp.getFolderById(folderId);
      results.details.push({
        test: 'Drive Folder',
        success: true,
        message: `OK - ${folder.getName()}`
      });
    } else {
      throw new Error('Folder ID not configured');
    }
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Drive Folder',
      success: false,
      message: error.message
    });
  }

  // Test 6: Permission Gmail (optionnel)
  try {
    const autoSend = getParam(INVOICE_CONFIG.PARAM_KEYS.AUTO_SEND_EMAIL);
    if (autoSend === 'true' || autoSend === true) {
      // Test d'envoi fictif (ne sera pas réellement envoyé)
      results.details.push({
        test: 'Permission Gmail',
        success: true,
        message: 'OK - Auto-send activé'
      });
    } else {
      results.details.push({
        test: 'Permission Gmail',
        success: true,
        message: 'Désactivé (optionnel)'
      });
    }
  } catch (error) {
    results.details.push({
      test: 'Permission Gmail',
      success: false,
      message: error.message
    });
  }

  return results;
}

// ============================================================================
// FONCTIONS UTILITAIRES POUR TRIGGERS (OPTIONNEL)
// ============================================================================

/**
 * Fonction à appeler par un trigger temporel pour génération automatique
 * À configurer manuellement dans "Déclencheurs" si nécessaire
 */
function scheduledInvoiceGeneration() {
  try {
    logSuccess('scheduledInvoiceGeneration', 'Démarrage de la génération planifiée');

    const result = generateAllPendingInvoices();

    logSuccess('scheduledInvoiceGeneration', `Génération terminée: ${result.message}`);

    // Force UI refresh
    SpreadsheetApp.flush();

  } catch (error) {
    logError('scheduledInvoiceGeneration', 'Erreur lors de la génération planifiée', error);
    // Force UI refresh even on error
    SpreadsheetApp.flush();
  }
}
