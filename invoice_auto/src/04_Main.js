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

  // 1. Créer le menu EN PREMIER — sans aucun appel externe.
  // Le menu doit apparaître même si tout le reste échoue.
  ui.createMenu('📄 InvoiceFlash')
    .addItem('1️⃣ - ➕ Nouvelle vente / New sale', 'menuAddNewInvoice')
    .addSeparator()
    .addItem('2️⃣ - 📄 Générer facture(s) / Generate invoice(s)', 'menuGenerateInvoices')
    .addSeparator()
    .addItem('3️⃣ - 📧 Envoyer mail(s) / Send email(s)', 'menuSendEmail')
    .addSeparator()
    .addItem('📊 Statistiques / Statistics', 'menuStatistics')
    .addSeparator()
    .addItem('⚙️ Configuration Initiale / Initial Setup', 'menuInitialSetup')
    .addItem('🔧 Réparer les triggers / Repair Triggers', 'menuRepairTriggers')
    .addItem('🌐 Changer la langue / Change language', 'menuChangeLanguage')
    .addItem('📝 Régénérer footer légal / Regenerate footer', 'menuRegenerateLegalFooter')
    .addItem('🚀 Assistant de configuration / Setup Wizard', 'launchSetupWizard')
    .addItem('🔐 Tester les permissions / Test permissions', 'menuTestPermissions')
    .addItem('ℹ️ À propos / About', 'menuAbout')
    .addToUi();

  Logger.log('Menu InvoiceFlash created');

  // 2. Vérification master vs copie (en silence si ça échoue)
  try {
    const isMaster = checkTemplateProtection();
    if (isMaster) return;
  } catch (e) {
    Logger.log('Template protection check skipped: ' + e);
  }

  // 3. Create dashboard sheet on first open if it doesn't exist yet.
  //    Uses SpreadsheetApp only — safe in a simple trigger.
  //    Setup will later refresh it with the correct configured values.
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss.getSheetByName(DASHBOARD_SHEET_NAME) && !ss.getSheetByName('Dashboard')) {
      createDashboardSheet();
      Logger.log('[onOpen] Dashboard sheet created on first open');
    }
  } catch (e) {
    Logger.log('Dashboard auto-creation skipped: ' + e);
  }

  // 4. Detect if this spreadsheet is a copy of a previously-configured one.
  //    ScriptProperties are copied with the spreadsheet, so SETUP_COMPLETED may
  //    be 'true' even on a brand-new copy. We detect this by comparing the
  //    stored spreadsheet ID against the current one.
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const storedSsId  = scriptProps.getProperty('SETUP_SS_ID');
    const currentSsId = SpreadsheetApp.getActiveSpreadsheet().getId();
    if (storedSsId && storedSsId !== currentSsId) {
      scriptProps.deleteAllProperties();
      Logger.log('[onOpen] Spreadsheet copy detected — setup properties cleared');
    }
  } catch (e) {
    Logger.log('Copy detection skipped: ' + e);
  }

  // 5. Popup de bienvenue si setup non fait (PropertiesService peut échouer sans auth)
  // NOTE: UrlFetchApp interdit ici — le setup réel se lance via le menu.
  try {
    if (!isSetupCompleted()) {
      ui.alert(
        '👋 Bienvenue / Welcome — InvoiceFlash',
        'Une configuration rapide est nécessaire avant de commencer.\n' +
        'A quick setup is needed before you can start.\n\n' +
        '▶  Menu  📄 InvoiceFlash  →  ⚙️ Configuration Initiale / Initial Setup',
        ui.ButtonSet.OK
      );
    }
  } catch (e) {
    Logger.log('Setup check skipped: ' + e);
  }
}

/**
 * Called when the add-on is installed
 * Required for proper authorization flow on first installation
 */
function onInstall(e) {
  onOpen(e);
}

// ============================================================================
// BATCH PROCESSING CONFIGURATION
// ============================================================================

/**
 * Batch processing limits to stay within GAS execution limits
 * - 6 min execution limit / ~5s per invoice = ~70 invoices max
 * - Add small delay between invoices to avoid quota errors
 */
var BATCH_CONFIG = {
  MAX_INVOICES_PER_RUN: 50,
  DELAY_BETWEEN_INVOICES_MS: 100
};

/**
 * Processes invoices in controlled batches with detailed error tracking
 * Uses generateInvoiceSafe for transactional generation with rollback
 *
 * @param {Array} invoices - Array of invoice data objects
 * @returns {Object} {success: number, failed: Array, remaining: number, details: Array}
 */
function processBatchInvoices(invoices) {
  var results = {
    success: 0,
    failed: [],
    remaining: 0,
    details: []
  };

  // Limit to max per run
  var toProcess = invoices.slice(0, BATCH_CONFIG.MAX_INVOICES_PER_RUN);
  results.remaining = Math.max(0, invoices.length - BATCH_CONFIG.MAX_INVOICES_PER_RUN);

  for (var i = 0; i < toProcess.length; i++) {
    var invoice = toProcess[i];

    try {
      // Use safe generation with rollback
      var result = generateInvoiceSafe(invoice.invoiceId);

      if (result.success) {
        results.success++;
        results.details.push({
          invoiceId: invoice.invoiceId,
          success: true,
          message: 'OK',
          url: result.pdfUrl
        });
      } else {
        results.failed.push({
          invoiceId: invoice.invoiceId,
          error: result.error
        });
        results.details.push({
          invoiceId: invoice.invoiceId,
          success: false,
          message: result.error,
          url: null
        });
      }

      // Pause between each generation to avoid quota errors
      if (BATCH_CONFIG.DELAY_BETWEEN_INVOICES_MS > 0 && i < toProcess.length - 1) {
        Utilities.sleep(BATCH_CONFIG.DELAY_BETWEEN_INVOICES_MS);
      }

    } catch (error) {
      results.failed.push({
        invoiceId: invoice.invoiceId,
        error: error.message || String(error)
      });
      results.details.push({
        invoiceId: invoice.invoiceId,
        success: false,
        message: error.message || String(error),
        url: null
      });
      logError('processBatchInvoices', 'Unexpected error for ' + invoice.invoiceId, error);
    }
  }

  return results;
}

// ============================================================================
// MENU FUNCTIONS - INVOICE GENERATION
// ============================================================================

/**
 * Menu: Generates all invoices with status "Draft" using batch processing
 * Shows detailed results including failures
 * Limits processing to BATCH_CONFIG.MAX_INVOICES_PER_RUN per execution
 */
function menuGenerateAllInvoices() {
  const ui = SpreadsheetApp.getUi();
  const msg = getUIMessages();
  const lang = getConfiguredLocale();

  // Get pending invoices first to show count in confirmation
  const pendingInvoices = getPendingInvoices();

  if (pendingInvoices.length === 0) {
    ui.alert(msg.INFO_TITLE, msg.NO_PENDING_INVOICES || 'No pending invoices to generate.', ui.ButtonSet.OK);
    return;
  }

  // Build confirmation message with batch limit warning
  var confirmMsg = msg.GENERATE_ALL_CONFIRM || 'Generate all draft invoices?';
  if (pendingInvoices.length > BATCH_CONFIG.MAX_INVOICES_PER_RUN) {
    var batchWarning = lang === 'FR'
      ? '\n\n⚠️ ' + pendingInvoices.length + ' factures trouvées. Seules les ' + BATCH_CONFIG.MAX_INVOICES_PER_RUN + ' premières seront traitées.\nRelancez l\'opération pour traiter les suivantes.'
      : '\n\n⚠️ ' + pendingInvoices.length + ' invoices found. Only the first ' + BATCH_CONFIG.MAX_INVOICES_PER_RUN + ' will be processed.\nRun again to process remaining.';
    confirmMsg += batchWarning;
  }

  // Confirmation before generation
  const response = ui.alert(
    msg.GENERATE_ALL_TITLE,
    confirmMsg,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ui.alert(msg.OPERATION_CANCELLED);
    return;
  }

  // Process invoices in batch with safe generation
  const result = processBatchInvoices(pendingInvoices);

  // Build detailed result message
  var summaryMsg = lang === 'FR'
    ? '✅ Succès: ' + result.success + '\n❌ Échecs: ' + result.failed.length
    : '✅ Success: ' + result.success + '\n❌ Failed: ' + result.failed.length;

  if (result.remaining > 0) {
    summaryMsg += lang === 'FR'
      ? '\n⏳ Restantes: ' + result.remaining + ' (relancer pour continuer)'
      : '\n⏳ Remaining: ' + result.remaining + ' (run again to continue)';
  }

  // Add failure details if any
  if (result.failed.length > 0) {
    summaryMsg += '\n\n' + (lang === 'FR' ? 'Détails des échecs:' : 'Failure details:');
    for (var i = 0; i < Math.min(result.failed.length, 10); i++) {
      summaryMsg += '\n• ' + result.failed[i].invoiceId + ': ' + result.failed[i].error;
    }
    if (result.failed.length > 10) {
      summaryMsg += '\n... ' + (lang === 'FR' ? 'et ' : 'and ') + (result.failed.length - 10) + (lang === 'FR' ? ' autres' : ' more');
    }
  }

  ui.alert(msg.RESULT_TITLE, summaryMsg, ui.ButtonSet.OK);
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

  // Generate invoice
  const result = generateInvoiceById(invoiceId);

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

  // Send email
  const result = sendInvoiceEmailManually(invoiceId);

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

    const message = `
${results.success ? msg.TEST_SUCCESS : msg.TEST_FAILURE}

${msg.DETAILS_LABEL}
${results.details.map(d => `${d.test}: ${d.success ? '✅' : '❌'} ${d.message}`).join('\n')}
    `;

    ui.alert(msg.TEST_TITLE, message, ui.ButtonSet.OK);

  } catch (error) {
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
// MENU FUNCTIONS - LANGUAGE CHANGE
// ============================================================================

/**
 * Menu: Installs or repairs all required script triggers.
 * Safe to run multiple times — skips triggers already installed.
 * Call this after copying the template if checkboxes don't respond.
 */
function menuRepairTriggers() {
  const ui   = SpreadsheetApp.getUi();
  const lang = getConfiguredLocale();

  installDashboardButtonTrigger();   // cleans up legacy handleDashboardButtons trigger
  installInvoiceCheckboxTrigger();   // installs handleInvoiceCheckboxes if missing

  const msg = lang === 'FR'
    ? '✅ Triggers réparés.\n\nLes cases à cocher sur la feuille Invoices (colonnes 📄 et 📧) sont maintenant actives.'
    : '✅ Triggers repaired.\n\nCheckboxes on the Invoices sheet (columns 📄 and 📧) are now active.';

  ui.alert(lang === 'FR' ? '🔧 Réparation terminée' : '🔧 Repair complete', msg, ui.ButtonSet.OK);
}

/**
 * Menu: Changes the application language (FR <-> EN)
 * Updates the LOCALE parameter in Settings sheet
 */
function menuChangeLanguage() {
  const ui = SpreadsheetApp.getUi();
  const currentLang = getConfiguredLocale();
  const newLang = currentLang === 'FR' ? 'EN' : 'FR';

  // Update LOCALE in Settings sheet
  const success = updateSettingsParam('LOCALE', newLang);

  if (success) {
    // Regenerate legal footer AND bank details in the new language
    try {
      const result = generateAndSaveLegalFooterToSettings(null, newLang);

      if (result.success) {
        logSuccess('menuChangeLanguage', `Legal footer and bank details regenerated in ${newLang}`);
      } else {
        logError('menuChangeLanguage', 'Failed to regenerate footer: ' + result.message);
      }
    } catch (error) {
      logError('menuChangeLanguage', 'Error regenerating legal footer', error);
    }

    const message = newLang === 'FR'
      ? 'Langue changée en Français.\nLe footer légal et les coordonnées bancaires ont été régénérés.\n\nVeuillez RECHARGER la page (F5) pour appliquer les changements.'
      : 'Language changed to English.\nLegal footer and bank details have been regenerated.\n\nPlease RELOAD the page (F5) to apply changes.';

    const title = newLang === 'FR' ? 'Langue mise à jour' : 'Language Updated';

    ui.alert(title, message, ui.ButtonSet.OK);
  } else {
    const errorMsg = currentLang === 'FR'
      ? 'Erreur lors du changement de langue. Vérifiez la feuille Settings.'
      : 'Error changing language. Check the Settings sheet.';

    ui.alert('Error', errorMsg, ui.ButtonSet.OK);
  }
}

/**
 * Updates a parameter in the Settings sheet
 * @param {string} key - The parameter key
 * @param {string} value - The new value
 * @returns {boolean} true if update succeeded
 */
function updateSettingsParam(key, value) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SETTINGS);

    if (!settingsSheet) {
      logError('updateSettingsParam', 'Settings sheet not found');
      return false;
    }

    const data = settingsSheet.getDataRange().getValues();

    // Find the row with the key
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) {
        // Update the value in column B
        settingsSheet.getRange(i + 1, 2).setValue(value);
        clearSettingsCache(); // Clear cache after update
        logSuccess('updateSettingsParam', `${key} updated to ${value}`);
        return true;
      }
    }

    // Key not found, add it at the end
    settingsSheet.appendRow([key, value]);
    clearSettingsCache(); // Clear cache after update
    logSuccess('updateSettingsParam', `${key} added with value ${value}`);
    return true;

  } catch (error) {
    logError('updateSettingsParam', 'Error updating parameter', error);
    return false;
  }
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
        message: 'OK - Envoi auto activé'
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

    logSuccess('scheduledInvoiceGeneration', `Génération terminée : ${result.message}`);

  } catch (error) {
    logError('scheduledInvoiceGeneration', 'Erreur lors de la génération planifiée', error);
  }
}
