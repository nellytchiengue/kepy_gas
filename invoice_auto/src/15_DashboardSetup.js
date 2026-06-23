/**
 * @file 15_DashboardSetup.js
 * @description Dashboard creation and InvoiceFlash folder setup system
 *              Système de création du Dashboard et du dossier InvoiceFlash
 * @version 1.0 (Gumroad Security Edition)
 * @date 2025-05-21
 * @author InvoiceFlash - Secure Invoice Generator
 */

// ============================================================================
// CONSTANTS FOR SETUP / CONSTANTES POUR LE SETUP
// ============================================================================

const SETUP_PROPERTIES = {
  INVOICEFLASH_FOLDER_ID: 'INVOICEFLASH_FOLDER_ID',
  SETUP_COMPLETED: 'SETUP_COMPLETED',
  SETUP_DATE: 'SETUP_DATE',
  DASHBOARD_CREATED: 'DASHBOARD_CREATED'
};

const INVOICEFLASH_FOLDER_NAME = 'InvoiceFlash';
const DASHBOARD_SHEET_NAME = '🏠 InvoiceFlash';

// Row numbers for dashboard action buttons (must match setupDashboardContent layout)
const DASHBOARD_BTN_ROWS = {
  NEW_SALE:  15,
  GENERATE:  16,
  SEND:      17,
  STATS:     18,
  SETUP:     19
};

// Quick Entry zone layout on the Dashboard sheet (column B = input, column A = label)
const QUICK_ENTRY = {
  CLIENT_NAME_ROW:  30,
  CLIENT_EMAIL_ROW: 31,
  DESCRIPTION_ROW:  32,
  QUANTITY_ROW:     33,
  UNIT_PRICE_ROW:   34,
  TVA_ROW:          35,
  CREATE_ROW:       36,  // checkbox in col A triggers invoice creation
  VALUE_COL:        2    // column B holds user input
};

// ============================================================================
// INITIAL SETUP CHECK / VÉRIFICATION DU SETUP INITIAL
// ============================================================================

/**
 * Checks if initial setup has been completed
 * Vérifie si la configuration initiale a été effectuée
 * @returns {boolean} True if setup is complete
 */
function isSetupCompleted() {
  const scriptProps = PropertiesService.getScriptProperties();
  return scriptProps.getProperty(SETUP_PROPERTIES.SETUP_COMPLETED) === 'true';
}

/**
 * Gets the InvoiceFlash folder ID from script properties
 * Récupère l'ID du dossier InvoiceFlash depuis les propriétés
 * @returns {string|null} Folder ID or null if not set
 */
function getInvoiceFlashFolderId() {
  const scriptProps = PropertiesService.getScriptProperties();
  return scriptProps.getProperty(SETUP_PROPERTIES.INVOICEFLASH_FOLDER_ID);
}

/**
 * Main setup function - creates InvoiceFlash folder and Dashboard
 * Fonction principale de setup - crée le dossier InvoiceFlash et le Dashboard
 * Called automatically on first use or manually from menu
 * @returns {Object} {success: boolean, folderId?: string, message?: string}
 */
function performInitialSetup() {
  const ui = SpreadsheetApp.getUi();
  const lang = getConfiguredLocale();
  const scriptProps = PropertiesService.getScriptProperties();

  try {
    // Step 1: Create InvoiceFlash folder at Drive root
    const folderResult = createInvoiceFlashFolder();

    if (!folderResult.success) {
      return {
        success: false,
        message: folderResult.message || 'Failed to create InvoiceFlash folder'
      };
    }

    const folderId = folderResult.folderId;

    // Step 2: Save folder ID and current spreadsheet ID to script properties
    scriptProps.setProperty(SETUP_PROPERTIES.INVOICEFLASH_FOLDER_ID, folderId);
    scriptProps.setProperty(SETUP_PROPERTIES.SETUP_DATE, new Date().toISOString());
    scriptProps.setProperty('SETUP_SS_ID', SpreadsheetApp.getActiveSpreadsheet().getId());

    // Step 3: Update Settings sheet with folder ID
    updateSettingsWithFolderId(folderId);

    // Step 3b: Copy master template to user's Drive directly into InvoiceFlash folder
    const existingTemplateId = getParam(INVOICE_CONFIG.PARAM_KEYS.TEMPLATE_DOCS_ID);
    const isMasterTemplate = !existingTemplateId ||
      existingTemplateId === INVOICE_CONFIG.MASTER_TEMPLATE_DOCS_ID;
    if (isMasterTemplate) {
      const newTemplateId = copyMasterTemplateToUserDrive(lang, folderId);
      if (newTemplateId) {
        updateSettingsParam(INVOICE_CONFIG.PARAM_KEYS.TEMPLATE_DOCS_ID, newTemplateId);
        clearSettingsCache();
        Logger.log('[INFO] performInitialSetup: template copied into InvoiceFlash folder: ' + newTemplateId);
      }
    } else {
      // Template already exists — move it into InvoiceFlash folder if not already there
      try {
        const tplFile = DriveApp.getFileById(existingTemplateId);
        const tplParents = tplFile.getParents();
        const tplParentId = tplParents.hasNext() ? tplParents.next().getId() : null;
        if (tplParentId !== folderId) {
          tplFile.moveTo(DriveApp.getFolderById(folderId));
          Logger.log('[INFO] performInitialSetup: existing template moved into InvoiceFlash folder');
        }
      } catch (e) {
        Logger.log('[WARN] performInitialSetup: could not move existing template: ' + e);
      }
    }

    // Step 3c: Move the spreadsheet itself into InvoiceFlash folder (best-effort)
    moveSpreadsheetToFolder(folderId);

    // Step 4: Create Dashboard sheet
    const dashboardResult = createDashboardSheet();

    if (dashboardResult.success) {
      scriptProps.setProperty(SETUP_PROPERTIES.DASHBOARD_CREATED, 'true');
    }

    // Step 5: Clean up old triggers + install invoice checkbox trigger
    installDashboardButtonTrigger();
    installInvoiceCheckboxTrigger();

    // Step 6: Mark setup as completed
    scriptProps.setProperty(SETUP_PROPERTIES.SETUP_COMPLETED, 'true');

    // Success message
    const successMsg = lang === 'FR'
      ? `✅ Configuration initiale terminée !\n\n` +
        `📁 Dossier créé : "${INVOICEFLASH_FOLDER_NAME}"\n` +
        `📄 Template de facture copié dans votre Drive\n` +
        `🎯 Toutes vos factures seront sauvegardées dans ce dossier.\n\n` +
        `Consultez le Dashboard pour plus d'informations.`
      : `✅ Initial setup completed!\n\n` +
        `📁 Folder created: "${INVOICEFLASH_FOLDER_NAME}"\n` +
        `📄 Invoice template copied to your Drive\n` +
        `🎯 All your invoices will be saved in this folder.\n\n` +
        `Check the Dashboard for more information.`;

    return {
      success: true,
      folderId: folderId,
      message: successMsg
    };

  } catch (error) {
    logError('performInitialSetup', 'Setup failed', error);
    return {
      success: false,
      message: 'Setup error: ' + error.message
    };
  }
}

// ============================================================================
// INVOICEFLASH FOLDER CREATION / CRÉATION DU DOSSIER INVOICEFLASH
// ============================================================================

/**
 * Creates the InvoiceFlash folder at Drive root
 * Crée le dossier InvoiceFlash à la racine du Drive
 * @returns {Object} {success: boolean, folderId?: string, message?: string}
 */
function createInvoiceFlashFolder() {
  try {
    // Check if folder already exists in script properties
    const existingFolderId = getInvoiceFlashFolderId();

    if (existingFolderId) {
      try {
        const existingFolder = DriveApp.getFolderById(existingFolderId);
        if (!existingFolder.isTrashed()) {
          logSuccess('createInvoiceFlashFolder', 'Using existing folder: ' + existingFolder.getName());
          return { success: true, folderId: existingFolderId };
        }
      } catch (e) {
        Logger.log('[WARN] createInvoiceFlashFolder: Previous folder not accessible, creating new one');
      }
    }

    // Search for an existing folder with this name before creating
    const existingFolders = DriveApp.getRootFolder().getFoldersByName(INVOICEFLASH_FOLDER_NAME);
    if (existingFolders.hasNext()) {
      const folder = existingFolders.next();
      logSuccess('createInvoiceFlashFolder', 'Found existing folder: ' + folder.getName());
      return { success: true, folderId: folder.getId() };
    }

    const newFolder = DriveApp.getRootFolder().createFolder(INVOICEFLASH_FOLDER_NAME);
    logSuccess('createInvoiceFlashFolder', 'Created new folder: ' + INVOICEFLASH_FOLDER_NAME + ' (' + newFolder.getId() + ')');
    return { success: true, folderId: newFolder.getId() };

  } catch (error) {
    logError('createInvoiceFlashFolder', 'Failed to create folder', error);
    return { success: false, message: error.message };
  }
}

/**
 * Updates the Settings sheet with the InvoiceFlash folder ID
 * Met à jour la feuille Settings avec l'ID du dossier InvoiceFlash
 * @param {string} folderId - The folder ID to save
 */
function updateSettingsWithFolderId(folderId) {
  try {
    // updateSettingsParam is defined in 04_Main.js
    updateSettingsParam(INVOICE_CONFIG.PARAM_KEYS.DRIVE_FOLDER_ID, folderId);
    logSuccess('updateSettingsWithFolderId', `Updated Settings with folder ID: ${folderId}`);
  } catch (error) {
    logError('updateSettingsWithFolderId', 'Failed to update Settings', error);
  }
}

// ============================================================================
// DASHBOARD SHEET CREATION / CRÉATION DE LA FEUILLE DASHBOARD
// ============================================================================

/**
 * Creates the Dashboard sheet with setup status and quick stats
 * Crée la feuille Dashboard avec le statut de configuration et statistiques rapides
 * @returns {Object} {success: boolean, message?: string}
 */
function createDashboardSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const lang = getConfiguredLocale();

    let dashboard = ss.getSheetByName(DASHBOARD_SHEET_NAME) || ss.getSheetByName('Dashboard');
    const isNew = !dashboard;

    if (isNew) {
      dashboard = ss.insertSheet(DASHBOARD_SHEET_NAME, 0);
      logSuccess('createDashboardSheet', 'Created new Dashboard sheet');
      setupDashboardContent(dashboard, lang);
    } else {
      // Sheet already exists — preserve the layout, only refresh formula cells.
      if (dashboard.getName() !== DASHBOARD_SHEET_NAME) {
        dashboard.setName(DASHBOARD_SHEET_NAME);
      }
      refreshDashboardFormulas(dashboard);
      logSuccess('createDashboardSheet', 'Refreshed existing Dashboard formulas');
    }

    // Move Dashboard to first position
    ss.setActiveSheet(dashboard);
    ss.moveActiveSheet(1);

    return {
      success: true,
      message: isNew ? 'Dashboard created successfully' : 'Dashboard refreshed successfully'
    };

  } catch (error) {
    logError('createDashboardSheet', 'Failed to create/refresh Dashboard', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Refreshes only the two setup-status cells on an existing Dashboard sheet.
 * All other cells (stats, company name) are live formulas — they update automatically.
 * Called by createDashboardSheet() when the sheet already exists.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function refreshDashboardFormulas(sheet) {
  try {
    sheet.getRange('B4').setFormula(
      `=IF(Settings!B${getSettingsRowForParam(INVOICE_CONFIG.PARAM_KEYS.DRIVE_FOLDER_ID)}<>"", "✅ Configured", "⚠️ Setup required")`
    );
    sheet.getRange('B5').setFormula(
      `=IF(Settings!B${getSettingsRowForParam(INVOICE_CONFIG.PARAM_KEYS.TEMPLATE_DOCS_ID)}<>"", "✅ Configured", "⚠️ Not configured")`
    );
    logSuccess('refreshDashboardFormulas', 'Setup status cells updated');
  } catch (e) {
    Logger.log('[WARN] refreshDashboardFormulas: ' + e);
  }
}

/**
 * Protects the Dashboard sheet layout.
 * Quick Entry input cells (B30:B35 + checkbox A36) are excluded — freely editable.
 * All other cells show a protection warning if edited accidentally.
 * Safe to call multiple times — removes previous protection first.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 */
function applyDashboardProtection(sheet) {
  try {
    // Remove any existing sheet-level protection
    sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)
      .forEach(p => p.remove());

    const protection = sheet.protect()
      .setDescription('InvoiceFlash Dashboard — layout protected');

    // Quick Entry input cells stay freely editable (no dialog)
    protection.setUnprotectedRanges([
      sheet.getRange(QUICK_ENTRY.CLIENT_NAME_ROW,  QUICK_ENTRY.VALUE_COL),
      sheet.getRange(QUICK_ENTRY.CLIENT_EMAIL_ROW, QUICK_ENTRY.VALUE_COL),
      sheet.getRange(QUICK_ENTRY.DESCRIPTION_ROW,  QUICK_ENTRY.VALUE_COL),
      sheet.getRange(QUICK_ENTRY.QUANTITY_ROW,     QUICK_ENTRY.VALUE_COL),
      sheet.getRange(QUICK_ENTRY.UNIT_PRICE_ROW,   QUICK_ENTRY.VALUE_COL),
      sheet.getRange(QUICK_ENTRY.TVA_ROW,          QUICK_ENTRY.VALUE_COL),
      sheet.getRange(QUICK_ENTRY.CREATE_ROW, 1)    // ☑ Create invoice checkbox
    ]);

    logSuccess('applyDashboardProtection', 'Dashboard sheet protected');
  } catch (e) {
    Logger.log('[WARN] applyDashboardProtection: ' + e);
  }
}

/**
 * Sets up the Dashboard content with bilingual support
 * Configure le contenu du Dashboard avec support bilingue
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The Dashboard sheet
 * @param {string} lang - Language code (FR or EN)
 */
function setupDashboardContent(sheet, _lang) {

  // ========== HEADER SECTION ==========
  sheet.getRange('A1:F1').merge()
    .setValue('InvoiceFlash')
    .setFontSize(15)
    .setFontWeight('bold')
    .setHorizontalAlignment('left')
    .setBackground('#1a1a2e')
    .setFontColor('#ffffff');
  sheet.setRowHeight(1, 36);

  // ========== SETUP STATUS SECTION ==========
  sheet.getRange('A3:B3').merge()
    .setValue('Setup Status')
    .setFontSize(11)
    .setFontWeight('bold')
    .setFontColor('#1a1a1a')
    .setBackground(null);
  sheet.getRange('A3').setBorder(
    false, false, true, false, false, false, '#cccccc', SpreadsheetApp.BorderStyle.SOLID
  );

  sheet.getRange('A4').setValue('InvoiceFlash Folder:').setFontSize(10).setBackground(null);
  sheet.getRange('B4').setFormula(
    `=IF(Settings!B${getSettingsRowForParam(INVOICE_CONFIG.PARAM_KEYS.DRIVE_FOLDER_ID)}<>"", "✅ Configured", "⚠️ Setup required")`
  ).setFontSize(10).setBackground(null);

  sheet.getRange('A5').setValue('Invoice Template:').setFontSize(10).setBackground(null);
  sheet.getRange('B5').setFormula(
    `=IF(Settings!B${getSettingsRowForParam(INVOICE_CONFIG.PARAM_KEYS.TEMPLATE_DOCS_ID)}<>"", "✅ Configured", "⚠️ Not configured")`
  ).setFontSize(10).setBackground(null);

  sheet.getRange('A6').setValue('Company Name:').setFontSize(10).setBackground(null);
  sheet.getRange('B6').setFormula(
    `=Settings!B${getSettingsRowForParam(INVOICE_CONFIG.PARAM_KEYS.COMPANY_NAME)}`
  ).setFontSize(10).setBackground(null);

  // ========== QUICK STATS SECTION ==========
  sheet.getRange('A8:B8').merge()
    .setValue('Quick Statistics')
    .setFontSize(11)
    .setFontWeight('bold')
    .setFontColor('#1a1a1a')
    .setBackground(null);
  sheet.getRange('A8').setBorder(
    false, false, true, false, false, false, '#cccccc', SpreadsheetApp.BorderStyle.SOLID
  );

  sheet.getRange('A9').setValue('Invoices this month:').setFontSize(10).setBackground(null);
  sheet.getRange('B9').setFormula(
    `=COUNTIFS(Invoices!B:B, ">="&DATE(YEAR(TODAY()), MONTH(TODAY()), 1), Invoices!L:L, "<>Draft")`
  ).setFontSize(10).setBackground(null);

  sheet.getRange('A10').setValue('Revenue (month):').setFontSize(10).setBackground(null);
  sheet.getRange('B10').setFormula(
    `=SUMIFS(Invoices!K:K, Invoices!B:B, ">="&DATE(YEAR(TODAY()), MONTH(TODAY()), 1), Invoices!L:L, "<>Draft")`
  ).setNumberFormat('#,##0.00 €').setFontSize(10).setBackground(null);

  sheet.getRange('A11').setValue('Pending invoices:').setFontSize(10).setBackground(null);
  sheet.getRange('B11').setFormula(
    `=COUNTIF(Invoices!L:L, "Draft")`
  ).setFontSize(10).setBackground(null);

  sheet.getRange('A12').setValue('Generated (not sent):').setFontSize(10).setBackground(null);
  sheet.getRange('B12').setFormula(
    `=COUNTIF(Invoices!L:L, "Generated")`
  ).setFontSize(10).setBackground(null);

  // ========== QUICK ACTIONS SECTION ==========
  sheet.getRange('A14:B14').merge()
    .setValue('Quick Actions')
    .setFontSize(11)
    .setFontWeight('bold')
    .setFontColor('#1a1a1a')
    .setBackground(null);
  sheet.getRange('A14').setBorder(
    false, false, true, false, false, false, '#cccccc', SpreadsheetApp.BorderStyle.SOLID
  );

  sheet.getRange('A15:B15').merge()
    .setValue('All actions below are available in the  InvoiceFlash  menu in the toolbar above.')
    .setFontSize(9)
    .setFontColor('#888888')
    .setFontStyle('italic')
    .setBackground(null);
  sheet.setRowHeight(15, 20);

  const actions = [
    ['1   ➕  New Sale',           'Add a new client invoice entry to the spreadsheet'],
    ['2   📄  Generate Invoice(s)', 'Create PDF invoices from your pending data'],
    ['3   📧  Send Email(s)',       'Email generated invoice PDFs to your clients'],
    ['4   📊  Statistics',          'View revenue analytics and monthly summaries'],
    ['5   ⚙️  Initial Setup',       'Configure your workspace (first use only)']
  ];

  actions.forEach(([label, desc], i) => {
    const row = 16 + i;
    sheet.getRange(row, 1).setValue(label)
      .setFontSize(10)
      .setFontWeight('bold')
      .setFontColor('#1a1a1a')
      .setBackground(null)
      .setVerticalAlignment('middle');
    sheet.getRange(row, 2).setValue(desc)
      .setFontSize(9)
      .setFontColor('#666666')
      .setBackground(null)
      .setVerticalAlignment('middle');
    sheet.setRowHeight(row, 26);
  });

  // ========== INFORMATION SECTION ==========
  sheet.getRange('A22:B22').merge()
    .setValue('Information')
    .setFontSize(11)
    .setFontWeight('bold')
    .setFontColor('#1a1a1a')
    .setBackground(null);
  sheet.getRange('A22').setBorder(
    false, false, true, false, false, false, '#cccccc', SpreadsheetApp.BorderStyle.SOLID
  );

  sheet.getRange('A23').setValue('📁  Invoice location:')
    .setFontSize(10)
    .setFontColor('#1a1a1a')
    .setBackground(null);
  sheet.getRange('B23').setFormula(
    `="Drive > InvoiceFlash > CLIENTS > [Client name]"`
  ).setFontSize(10).setFontColor('#444444').setBackground(null);

  // ========== PERMISSIONS NOTE (subtle) ==========
  const permText =
    '🔐 Permissions used to: create your InvoiceFlash folder (Drive), organise your files (Drive), ' +
    'fill the invoice template (Docs), send your invoices (Gmail).';

  sheet.getRange('A25:B26').merge()
    .setValue(permText)
    .setFontSize(8)
    .setFontColor('#aaaaaa')
    .setFontStyle('italic')
    .setWrap(true)
    .setVerticalAlignment('top')
    .setBackground(null);
  sheet.setRowHeight(25, 16);
  sheet.setRowHeight(26, 28);

  // ========== QUICK NEW SALE ZONE ==========
  sheet.getRange('A28:B28').merge()
    .setValue('Quick New Sale')
    .setFontSize(11)
    .setFontWeight('bold')
    .setFontColor('#1a1a1a')
    .setBackground(null);
  sheet.getRange('A28').setBorder(
    false, false, true, false, false, false, '#cccccc', SpreadsheetApp.BorderStyle.SOLID
  );
  sheet.setRowHeight(28, 28);

  // Row 29: subtitle hint
  sheet.getRange('A29:B29').merge()
    .setValue('Fill in the fields below, then check ☑ to create the invoice.')
    .setFontSize(9).setFontColor('#888888').setFontStyle('italic').setBackground(null);
  sheet.setRowHeight(29, 18);

  // Input field labels (col A) and editable cells (col B)
  const fields = [
    [QUICK_ENTRY.CLIENT_NAME_ROW,  'Client Name *',   '',  true],
    [QUICK_ENTRY.CLIENT_EMAIL_ROW, 'Client Email',     '',  false],
    [QUICK_ENTRY.DESCRIPTION_ROW,  'Description *',    '',  true],
    [QUICK_ENTRY.QUANTITY_ROW,     'Quantity',          1,   false],
    [QUICK_ENTRY.UNIT_PRICE_ROW,   'Unit Price *',      '',  true],
    [QUICK_ENTRY.TVA_ROW,          'TVA %',             0,   false]
  ];

  fields.forEach(([row, label, defaultVal, required]) => {
    sheet.getRange(row, 1).setValue(label)
      .setFontSize(10)
      .setFontColor(required ? '#1a1a1a' : '#555555')
      .setFontWeight(required ? 'bold' : 'normal')
      .setBackground(null)
      .setVerticalAlignment('middle');
    const inputCell = sheet.getRange(row, 2);
    inputCell.setValue(defaultVal)
      .setBackground('#f7f9ff')
      .setFontSize(10)
      .setFontColor('#1a1a1a')
      .setVerticalAlignment('middle');
    inputCell.setBorder(
      true, true, true, true, false, false, '#b0c4de', SpreadsheetApp.BorderStyle.SOLID
    );
    sheet.setRowHeight(row, 28);
  });

  // Create checkbox row
  sheet.getRange(QUICK_ENTRY.CREATE_ROW, 1)
    .insertCheckboxes().setValue(false)
    .setBackground('#1a1a2e')
    .setHorizontalAlignment('center');
  sheet.getRange(QUICK_ENTRY.CREATE_ROW, 2)
    .setValue('Create invoice  →  row added to Invoices sheet')
    .setFontSize(10).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#1a1a2e')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(QUICK_ENTRY.CREATE_ROW, 32);

  // Border around the whole quick entry block
  sheet.getRange(QUICK_ENTRY.CLIENT_NAME_ROW, 1,
                 QUICK_ENTRY.CREATE_ROW - QUICK_ENTRY.CLIENT_NAME_ROW + 1, 2)
    .setBorder(true, true, true, true, false, false, '#b0c4de', SpreadsheetApp.BorderStyle.SOLID);

  // ========== FORMATTING ==========
  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 380);
  sheet.getRange('A1:F30').setFontFamily('Arial');

  // Freeze header row
  sheet.setFrozenRows(1);

  // Protect layout — Quick Entry inputs remain freely editable
  applyDashboardProtection(sheet);

  logSuccess('setupDashboardContent', 'Dashboard content configured');
}

/**
 * Helper function to get the row number in Settings sheet for a specific parameter
 * Performs a real lookup (column A = key) instead of using hardcoded row numbers.
 * Fonction d'aide pour obtenir le numéro de ligne dans Settings pour un paramètre
 * @param {string} paramKey - The parameter key (e.g., DRIVE_FOLDER_ID)
 * @returns {number} 1-indexed row number, or 2 as a safe fallback
 */
function getSettingsRowForParam(paramKey) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const settingsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SETTINGS);
    if (!settingsSheet) return 2;

    const data = settingsSheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === paramKey) {
        return i + 1; // Sheets rows are 1-indexed
      }
    }
    Logger.log('[WARN] getSettingsRowForParam: key not found: ' + paramKey);
    return 2; // safe fallback
  } catch (e) {
    Logger.log('[WARN] getSettingsRowForParam error: ' + e.message);
    return 2;
  }
}

// ============================================================================
// MENU FUNCTION FOR MANUAL SETUP / FONCTION MENU POUR SETUP MANUEL
// ============================================================================

/**
 * Menu function to trigger initial setup manually
 * Fonction menu pour déclencher le setup initial manuellement
 */
function menuInitialSetup() {
  const ui = SpreadsheetApp.getUi();
  const lang = getConfiguredLocale();

  // Setup already done — offer quick trigger repair vs full reconfiguration
  if (isSetupCompleted()) {
    const msg = lang === 'FR'
      ? 'La configuration initiale a déjà été effectuée.\n\n' +
        '• OUI      — Réparer les triggers uniquement (rapide)\n' +
        '• NON      — Relancer la configuration complète\n' +
        '• ANNULER — Quitter'
      : 'Initial setup has already been completed.\n\n' +
        '• YES    — Repair triggers only (quick fix)\n' +
        '• NO     — Run full reconfiguration\n' +
        '• CANCEL — Exit';

    const choice = ui.alert(
      lang === 'FR' ? '⚙️ Setup déjà effectué' : '⚙️ Setup already completed',
      msg,
      ui.ButtonSet.YES_NO_CANCEL
    );

    if (choice === ui.Button.YES) {
      // Quick repair — triggers only
      installDashboardButtonTrigger();
      installInvoiceCheckboxTrigger();
      ui.alert(
        lang === 'FR' ? '🔧 Réparation terminée' : '🔧 Repair complete',
        lang === 'FR'
          ? '✅ Triggers réparés.\n\nLes cases à cocher des colonnes 📄 et 📧 sont maintenant actives.'
          : '✅ Triggers repaired.\n\nCheckboxes in columns 📄 and 📧 are now active.',
        ui.ButtonSet.OK
      );
      return;
    }

    if (choice !== ui.Button.NO) return; // CANCEL or dialog closed
    // NO → fall through to full reconfiguration below
  }

  // Full setup confirmation
  const confirmMsg = lang === 'FR'
    ? `Cette action va :\n\n` +
      `1️⃣ Créer un dossier "${INVOICEFLASH_FOLDER_NAME}" dans votre Drive\n` +
      `2️⃣ Mettre à jour la feuille Dashboard\n` +
      `3️⃣ Configurer les paramètres de base\n\n` +
      `Continuer ?`
    : `This will:\n\n` +
      `1️⃣ Create a "${INVOICEFLASH_FOLDER_NAME}" folder in your Drive\n` +
      `2️⃣ Update the Dashboard sheet\n` +
      `3️⃣ Configure basic settings\n\n` +
      `Continue?`;

  const response = ui.alert(
    lang === 'FR' ? 'Configuration Initiale' : 'Initial Setup',
    confirmMsg,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  const result = performInitialSetup();

  if (result.success) {
    ui.alert(lang === 'FR' ? '✅ Succès' : '✅ Success', result.message, ui.ButtonSet.OK);
    SpreadsheetApp.flush();
  } else {
    ui.alert(lang === 'FR' ? '❌ Erreur' : '❌ Error', result.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// AUTO-SETUP CHECK ON FIRST USE / VÉRIFICATION AUTO DU SETUP AU PREMIER USAGE
// ============================================================================

/**
 * Checks and prompts for setup if not completed
 * Vérifie et propose le setup s'il n'est pas effectué
 * Called from onOpen to check setup status.
 *
 * NOTE: This function shows ONE confirmation dialog, then launches the setup
 * directly (without re-asking). menuInitialSetup() is reserved for the manual
 * menu entry which does ask for confirmation (in case the user triggered it
 * accidentally).
 */
function checkAndPromptSetup() {
  if (!isSetupCompleted()) {
    const ui = SpreadsheetApp.getUi();
    const lang = getConfiguredLocale();

    const msg = lang === 'FR'
      ? `👋 Bienvenue dans InvoiceFlash !\n\n` +
        `Il semble que c'est votre première utilisation.\n\n` +
        `Voulez-vous lancer la configuration initiale ?\n` +
        `(Création du dossier InvoiceFlash et du Dashboard)`
      : `👋 Welcome to InvoiceFlash!\n\n` +
        `It looks like this is your first time using this tool.\n\n` +
        `Would you like to run the initial setup?\n` +
        `(Create InvoiceFlash folder and Dashboard)`;

    const response = ui.alert(
      lang === 'FR' ? 'Configuration Initiale Requise' : 'Initial Setup Required',
      msg,
      ui.ButtonSet.YES_NO
    );

    if (response === ui.Button.YES) {
      // Call performInitialSetup() directly — no second confirmation dialog
      const result = performInitialSetup();
      if (result.success) {
        ui.alert(
          lang === 'FR' ? '✅ Succès' : '✅ Success',
          result.message,
          ui.ButtonSet.OK
        );
        SpreadsheetApp.flush();
      } else {
        ui.alert(
          lang === 'FR' ? '❌ Erreur' : '❌ Error',
          result.message,
          ui.ButtonSet.OK
        );
      }
    }
  }
}

// ============================================================================
// HELPER FUNCTION TO GET INVOICEFLASH ROOT FOLDER
// ============================================================================

/**
 * Gets the InvoiceFlash root folder (replaces old getRootFolder logic)
 * Récupère le dossier racine InvoiceFlash
 * @returns {GoogleAppsScript.Drive.Folder|null} The InvoiceFlash folder or null
 */
function getInvoiceFlashRootFolder() {
  try {
    const folderId = getInvoiceFlashFolderId();

    if (!folderId) {
      Logger.log('[WARN] getInvoiceFlashRootFolder: No folder ID found, setup required');
      return null;
    }

    const folder = DriveApp.getFolderById(folderId);
    return folder;

  } catch (error) {
    logError('getInvoiceFlashRootFolder', 'Failed to get folder', error);
    return null;
  }
}

// ============================================================================
// DASHBOARD BUTTON TRIGGER / TRIGGER POUR LES BOUTONS DU DASHBOARD
// ============================================================================

/**
 * Simple onEdit trigger — auto-registered by GAS (no installation required).
 * Runs in the user's active UI session → showModalDialog works here.
 * Handles checkbox button clicks on the 🏠 InvoiceFlash dashboard.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (sheet.getName() !== DASHBOARD_SHEET_NAME && sheet.getName() !== 'Dashboard') return;
    const row = e.range.getRow();
    const col = e.range.getColumn();
    if (col !== 1) return;
    if (e.value !== 'TRUE') return;

    sheet.getRange(row, 1).setValue(false);
    SpreadsheetApp.flush();

    const lang = getConfiguredLocale();

    switch (row) {
      case DASHBOARD_BTN_ROWS.NEW_SALE:  menuAddNewInvoice();    break;
      case DASHBOARD_BTN_ROWS.GENERATE:  menuGenerateInvoices(); break;
      case DASHBOARD_BTN_ROWS.SEND:      menuSendEmail();        break;
      case DASHBOARD_BTN_ROWS.STATS:     menuStatistics();       break;
      case DASHBOARD_BTN_ROWS.SETUP:
        SpreadsheetApp.getActiveSpreadsheet().toast(
          lang === 'FR'
            ? 'Utilisez le menu InvoiceFlash > ⚙️ Configuration initiale'
            : 'Use the menu InvoiceFlash > ⚙️ Initial Setup',
          '⚙️ Setup', 6
        );
        break;
      case QUICK_ENTRY.CREATE_ROW:
        sheet.getRange(row, 1).setValue(false);
        SpreadsheetApp.flush();
        createInvoiceFromQuickEntry();
        break;
    }
  } catch (error) {
    logError('onEdit', 'Dashboard button error', error);
    try {
      SpreadsheetApp.getActiveSpreadsheet()
        .toast('Error: ' + error.message, '❌ InvoiceFlash', 6);
    } catch (_) {}
  }
}

/**
 * Removes any previously installed handleDashboardButtons installable triggers.
 * Called during setup to clean up the old trigger-based approach.
 */
function installDashboardButtonTrigger() {
  try {
    ScriptApp.getProjectTriggers().forEach(function(t) {
      if (t.getHandlerFunction() === 'handleDashboardButtons') {
        ScriptApp.deleteTrigger(t);
        Logger.log('[INFO] installDashboardButtonTrigger: removed old installable trigger');
      }
    });
  } catch (e) {
    Logger.log('[WARN] installDashboardButtonTrigger cleanup: ' + e);
  }
}

/**
 * Legacy handler — no-op. Dashboard buttons now handled by simple onEdit() trigger.
 */
function handleDashboardButtons(_e) {}

// ============================================================================
// INVOICE SHEET CHECKBOX TRIGGERS
// ============================================================================

/**
 * Installs an installable onEdit trigger for the Invoices sheet action checkboxes.
 * Installable trigger is required here because generate/email actions need DriveApp + GmailApp.
 * Skips installation if already present.
 */
function installInvoiceCheckboxTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    for (const t of triggers) {
      if (t.getHandlerFunction() === 'handleInvoiceCheckboxes') return;
    }
    ScriptApp.newTrigger('handleInvoiceCheckboxes')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onEdit()
      .create();
    logSuccess('installInvoiceCheckboxTrigger', 'Installed handleInvoiceCheckboxes trigger');
  } catch (error) {
    logError('installInvoiceCheckboxTrigger', 'Failed to install trigger', error);
  }
}

/**
 * Installable onEdit handler for the Invoices sheet action checkboxes.
 * Column R (GEN_CHECKBOX)   → generates PDF for that invoice row.
 * Column S (EMAIL_CHECKBOX) → creates a Gmail draft for that invoice row.
 * Uses Drive + Gmail — runs with full OAuth (installable trigger).
 * No UI dialogs — feedback via toast only.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e
 */
function handleInvoiceCheckboxes(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (sheet.getName() !== INVOICE_CONFIG.SHEETS.INVOICES) return;

    const row = e.range.getRow();
    const col = e.range.getColumn();
    if (row < 2) return;
    if (e.value !== 'TRUE') return;

    const GEN_COL   = INVOICE_CONFIG.COLUMNS.GEN_CHECKBOX   + 1; // 1-based: col 18
    const EMAIL_COL = INVOICE_CONFIG.COLUMNS.EMAIL_CHECKBOX  + 1; // 1-based: col 19
    if (col !== GEN_COL && col !== EMAIL_COL) return;

    // Reset checkbox immediately
    sheet.getRange(row, col).setValue(false);
    SpreadsheetApp.flush();

    const invoiceId = String(sheet.getRange(row, 1).getValue()).trim();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (!invoiceId) {
      ss.toast('No Invoice ID found in this row.', '⚠️ Error', 4);
      return;
    }

    // ── Generate PDF ──────────────────────────────────────────────────────────
    if (col === GEN_COL) {
      ss.toast('Generating ' + invoiceId + '…', '📄 Processing', 30);
      const result = generateInvoiceById(invoiceId);
      if (result.success) {
        ss.toast(invoiceId + ' generated successfully.', '📄 Done', 5);
      } else {
        ss.toast(result.message || 'Generation failed.', '❌ Error', 6);
      }
      return;
    }

    // ── Create email draft ────────────────────────────────────────────────────
    if (col === EMAIL_COL) {
      const preview = getEmailPreview(invoiceId);
      if (!preview.success) {
        ss.toast(preview.message || 'Could not build email.', '❌ Error', 6);
        return;
      }
      if (!preview.pdfUrl) {
        ss.toast('Generate the PDF first — check column 📄 Generate.', '⚠️ No PDF yet', 6);
        return;
      }
      const result = processSendEmail({
        invoiceId:      invoiceId,
        recipientEmail: preview.recipientEmail,
        subject:        preview.subject,
        body:           preview.body,
        mode:           'DRAFT'
      });
      if (result.success) {
        ss.toast('Draft created for ' + preview.recipientEmail, '📧 Draft ready', 5);
      } else {
        ss.toast(result.message || 'Failed to create draft.', '❌ Error', 6);
      }
    }

  } catch (error) {
    logError('handleInvoiceCheckboxes', 'Error processing checkbox', error);
    try {
      SpreadsheetApp.getActiveSpreadsheet()
        .toast('Error: ' + error.message, '❌ InvoiceFlash', 6);
    } catch (_) {}
  }
}

// ============================================================================
// QUICK NEW SALE — create invoice row directly from Dashboard input cells
// Runs from the simple onEdit trigger (SpreadsheetApp only, no Drive/Gmail)
// ============================================================================

/**
 * Reads the Quick Entry input cells on the Dashboard, validates them,
 * creates a Draft row in the Invoices sheet with action checkboxes,
 * then resets the input cells to their defaults.
 */
function createInvoiceFromQuickEntry() {
  try {
  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  if (!dashboard) return;

  const get = (row) => dashboard.getRange(row, QUICK_ENTRY.VALUE_COL).getValue();

  const clientName  = String(get(QUICK_ENTRY.CLIENT_NAME_ROW)).trim();
  const clientEmail = String(get(QUICK_ENTRY.CLIENT_EMAIL_ROW)).trim();
  const description = String(get(QUICK_ENTRY.DESCRIPTION_ROW)).trim();
  const quantity    = Number(get(QUICK_ENTRY.QUANTITY_ROW))    || 1;
  const unitPrice   = Number(get(QUICK_ENTRY.UNIT_PRICE_ROW))  || 0;
  const tva         = Number(get(QUICK_ENTRY.TVA_ROW))         || 0;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!clientName) {
    ss.toast('Client Name is required.', '⚠️ Missing field', 4); return;
  }
  if (!description) {
    ss.toast('Description is required.', '⚠️ Missing field', 4); return;
  }
  if (unitPrice <= 0) {
    ss.toast('Unit Price must be greater than 0.', '⚠️ Missing field', 4); return;
  }

  ss.toast('Creating invoice…', '⏳ InvoiceFlash', 10);

  // ── Build row data ────────────────────────────────────────────────────────
  const invoiceId   = generateQuickInvoiceId();
  const tvaAmount   = unitPrice * quantity * (tva / 100);
  const totalAmount = unitPrice * quantity + tvaAmount;
  const tz          = Session.getScriptTimeZone();
  const createdAt   = Utilities.formatDate(new Date(), tz, 'yyyyMMdd HHmmss');

  const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);
  if (!invoicesSheet) {
    ss.toast('Invoices sheet not found. Run Initial Setup first.', '❌ Error', 5); return;
  }

  const newRow = [
    invoiceId, new Date(), clientName, clientEmail,
    '', '',                // phone, address (not collected in quick entry)
    description, quantity, unitPrice, tva, totalAmount,
    INVOICE_CONFIG.STATUSES.DRAFT,
    '', '',                // M: GEN_CHECKBOX, N: EMAIL_CHECKBOX (placeholders)
    '',                    // O: PDFUrl
    createdAt, '', '', ''  // P: CreatedAt, Q: GeneratedAt, R: SentAt, S: Notes
  ];

  invoicesSheet.appendRow(newRow);

  // Insert Generate + Email Draft checkboxes
  const newRowIdx = invoicesSheet.getLastRow();
  invoicesSheet.getRange(newRowIdx, INVOICE_CONFIG.COLUMNS.GEN_CHECKBOX   + 1)
    .insertCheckboxes().setValue(false);
  invoicesSheet.getRange(newRowIdx, INVOICE_CONFIG.COLUMNS.EMAIL_CHECKBOX + 1)
    .insertCheckboxes().setValue(false);

  // ── Reset input cells to defaults ─────────────────────────────────────────
  dashboard.getRange(QUICK_ENTRY.CLIENT_NAME_ROW,  QUICK_ENTRY.VALUE_COL).setValue('');
  dashboard.getRange(QUICK_ENTRY.CLIENT_EMAIL_ROW, QUICK_ENTRY.VALUE_COL).setValue('');
  dashboard.getRange(QUICK_ENTRY.DESCRIPTION_ROW,  QUICK_ENTRY.VALUE_COL).setValue('');
  dashboard.getRange(QUICK_ENTRY.QUANTITY_ROW,     QUICK_ENTRY.VALUE_COL).setValue(1);
  dashboard.getRange(QUICK_ENTRY.UNIT_PRICE_ROW,   QUICK_ENTRY.VALUE_COL).setValue('');
  dashboard.getRange(QUICK_ENTRY.TVA_ROW,          QUICK_ENTRY.VALUE_COL).setValue(0);

  ss.toast(invoiceId + ' created — go to Invoices to generate PDF.', '✅ Invoice created', 6);

  } catch (error) {
    logError('createInvoiceFromQuickEntry', 'Failed', error);
    try {
      SpreadsheetApp.getActiveSpreadsheet()
        .toast('Error: ' + error.message, '❌ Could not create invoice', 7);
    } catch (_) {}
  }
}

/**
 * Generates a sequential invoice ID for quick-entry invoices.
 * Format: INV{year}-{4-digit sequence}
 * Coexists safely with the existing INV{year}-CLI-xxx-xxxx format.
 */
function generateQuickInvoiceId() {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);
    const year  = new Date().getFullYear();
    const prefix = 'INV' + year + '-';

    if (!sheet || sheet.getLastRow() < 2) return prefix + '0001';

    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues()
      .map(r => String(r[0]).trim())
      .filter(id => id.startsWith(prefix));

    if (ids.length === 0) return prefix + '0001';

    const nums = ids.map(id => {
      const parts = id.replace(prefix, '').split('-');
      return parseInt(parts[parts.length - 1], 10);
    }).filter(n => !isNaN(n) && n > 0);

    const next = nums.length > 0 ? Math.max(...nums) + 1 : ids.length + 1;
    return prefix + String(next).padStart(4, '0');
  } catch (_) {
    return 'INV' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4);
  }
}
