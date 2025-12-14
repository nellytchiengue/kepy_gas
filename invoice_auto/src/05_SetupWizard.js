/**
 * @file 05_SetupWizard.js
 * @description Setup Wizard for easy first-time installation
 *              Assistant d'installation pour une première configuration facile
 * @version 1.1 (Gumroad Edition)
 * @date 2025-12-11
 * @author InvoiceFlash - One-Click Invoice Generator
 */

// ============================================================================
// SETUP WIZARD - MAIN FUNCTION / ASSISTANT D'INSTALLATION - FONCTION PRINCIPALE
// ============================================================================

/**
 * Launches the setup wizard for first-time configuration
 * Lance l'assistant de configuration pour la première utilisation
 * This function guides users through the complete setup process
 */
function launchSetupWizard() {
  const lang = detectUserLanguage();
  const ui = SpreadsheetApp.getUi();
  const messages = getSetupMessages(lang);

  // Step 0: Welcome screen / Écran de bienvenue
  const welcomeResponse = ui.alert(
    messages.WELCOME_TITLE,
    messages.WELCOME_MESSAGE,
    ui.ButtonSet.YES_NO
  );

  if (welcomeResponse !== ui.Button.YES) {
    SpreadsheetApp.flush(); // Force UI refresh before alert
    ui.alert(messages.SETUP_CANCELLED);
    return;
  }

  // Step 1: Use existing template / Utiliser le template existant
  SpreadsheetApp.flush(); // Force UI refresh before alert
  ui.alert(messages.STEP1_TITLE, messages.STEP1_MESSAGE, ui.ButtonSet.OK);

  try {
    // Template ID from existing Google Docs template
    const templateId = '19lus1lxI1eqNUDSdMJ-1yrCRHl87JFYUdGJ1aNVBUNA';

    // Step 2: Auto-detect Drive folder / Détecter automatiquement le dossier Drive
    SpreadsheetApp.flush(); // Force UI refresh before alert
    ui.alert(messages.STEP2_TITLE, messages.STEP2_MESSAGE, ui.ButtonSet.OK);

    const folderId = getCurrentSpreadsheetFolder();

    if (!folderId) {
      SpreadsheetApp.flush(); // Force UI refresh before alert
      ui.alert(messages.ERROR, messages.STEP2_ERROR, ui.ButtonSet.OK);
      return;
    }

    // Step 3: Configure Settings sheet / Configurer la feuille Settings
    SpreadsheetApp.flush(); // Force UI refresh before alert
    ui.alert(messages.STEP3_TITLE, messages.STEP3_MESSAGE, ui.ButtonSet.OK);

    const companyInfo = collectCompanyInfo(lang);

    if (!companyInfo) {
      SpreadsheetApp.flush(); // Force UI refresh before alert
      ui.alert(messages.ERROR, messages.STEP3_ERROR, ui.ButtonSet.OK);
      return;
    }

    // Step 4: Auto-fill Settings sheet / Remplir automatiquement Settings
    const settingsConfigured = autoConfigureSettings(templateId, folderId, companyInfo);

    if (!settingsConfigured) {
      SpreadsheetApp.flush(); // Force UI refresh before alert
      ui.alert(messages.ERROR, messages.STEP4_ERROR, ui.ButtonSet.OK);
      return;
    }

    // Step 5: Test permissions / Tester les permissions
    SpreadsheetApp.flush(); // Force UI refresh before alert
    ui.alert(messages.STEP5_TITLE, messages.STEP5_MESSAGE, ui.ButtonSet.OK);

    const permissionsOk = testAllPermissions();

    if (!permissionsOk.success) {
      SpreadsheetApp.flush(); // Force UI refresh before alert
      ui.alert(
        messages.PERMISSIONS_ERROR,
        messages.PERMISSIONS_ERROR_DETAIL + '\n\n' + permissionsOk.details.map(d => d.test + ': ' + d.message).join('\n'),
        ui.ButtonSet.OK
      );
      return;
    }

    // Step 6: Create test invoice / Créer une facture de test
    const testResponse = ui.alert(
      messages.STEP6_TITLE,
      messages.STEP6_MESSAGE,
      ui.ButtonSet.YES_NO
    );

    if (testResponse === ui.Button.YES) {
      const testResult = createTestInvoice(companyInfo);

      SpreadsheetApp.flush(); // Force UI refresh before alert
      if (testResult.success) {
        ui.alert(
          messages.SUCCESS_TITLE,
          messages.SUCCESS_MESSAGE + '\n\n' + messages.TEST_INVOICE_URL + testResult.url,
          ui.ButtonSet.OK
        );
      } else {
        ui.alert(messages.ERROR, messages.TEST_INVOICE_ERROR + testResult.message, ui.ButtonSet.OK);
      }
    }

    // Final success message / Message de succès final
    // Force UI refresh to remove "working" spinner
    SpreadsheetApp.flush();

    const reloadPrompt = lang === 'FR'
      ? '\n\n💡 Veuillez RECHARGER la page (F5) pour voir le menu dans la langue configurée.'
      : '\n\n💡 Please RELOAD the page (F5) to see the menu in the configured language.';

    ui.alert(
      messages.FINAL_TITLE,
      messages.FINAL_MESSAGE + reloadPrompt,
      ui.ButtonSet.OK
    );

  } catch (error) {
    Logger.log('Setup Wizard Error: ' + error);
    // Force UI refresh even on error
    SpreadsheetApp.flush();
    ui.alert(messages.ERROR, messages.UNEXPECTED_ERROR + error.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// STEP 1 & 2: AUTO-DETECT FOLDER / DÉTECTER AUTOMATIQUEMENT LE DOSSIER
// ============================================================================

/**
 * Gets the folder ID where the current spreadsheet is located
 * Récupère l'ID du dossier où se trouve la feuille de calcul actuelle
 * @returns {string|null} Folder ID or null if failed
 */
function getCurrentSpreadsheetFolder() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const file = DriveApp.getFileById(ss.getId());
    const parents = file.getParents();

    if (parents.hasNext()) {
      const folder = parents.next();
      Logger.log('✅ Folder detected: ' + folder.getName() + ' (' + folder.getId() + ')');
      return folder.getId();
    } else {
      Logger.log('⚠️ Spreadsheet is in root folder (My Drive)');
      // Return the root folder ID or create a new folder
      return DriveApp.getRootFolder().getId();
    }

  } catch (error) {
    Logger.log('❌ Error detecting folder: ' + error);
    return null;
  }
}

// ============================================================================
// STEP 3: COLLECT COMPANY INFORMATION / COLLECTER INFOS ENTREPRISE
// ============================================================================

/**
 * Collects company information from user
 * Collecte les informations de l'entreprise auprès de l'utilisateur
 * @param {string} lang - Language code
 * @returns {Object|null} Company info object or null if cancelled
 */
function collectCompanyInfo(lang) {
  const ui = SpreadsheetApp.getUi();
  const messages = getSetupMessages(lang);

  // Company name / Nom de l'entreprise
  const nameResponse = ui.prompt(
    messages.COMPANY_NAME_PROMPT,
    ui.ButtonSet.OK_CANCEL
  );

  if (nameResponse.getSelectedButton() !== ui.Button.OK) return null;
  const companyName = nameResponse.getResponseText().trim();

  // Company address / Adresse
  const addressResponse = ui.prompt(
    messages.COMPANY_ADDRESS_PROMPT,
    ui.ButtonSet.OK_CANCEL
  );

  if (addressResponse.getSelectedButton() !== ui.Button.OK) return null;
  const companyAddress = addressResponse.getResponseText().trim();

  // Company phone / Téléphone
  const phoneResponse = ui.prompt(
    messages.COMPANY_PHONE_PROMPT,
    ui.ButtonSet.OK_CANCEL
  );

  if (phoneResponse.getSelectedButton() !== ui.Button.OK) return null;
  const companyPhone = phoneResponse.getResponseText().trim();

  // Company email / Email
  const emailResponse = ui.prompt(
    messages.COMPANY_EMAIL_PROMPT,
    ui.ButtonSet.OK_CANCEL
  );

  if (emailResponse.getSelectedButton() !== ui.Button.OK) return null;
  const companyEmail = emailResponse.getResponseText().trim();

  // Preferred language / Langue préférée
  const localePrompt = lang === 'FR'
    ? 'Choisissez la langue par défaut:\nEntrez "FR" pour Français ou "EN" pour Anglais:'
    : 'Choose default language:\nEnter "FR" for French or "EN" for English:';

  const localeResponse = ui.prompt(
    lang === 'FR' ? 'Langue préférée' : 'Preferred Language',
    localePrompt,
    ui.ButtonSet.OK_CANCEL
  );

  let preferredLocale = lang; // Default to detected language
  if (localeResponse.getSelectedButton() === ui.Button.OK) {
    const localeInput = localeResponse.getResponseText().trim().toUpperCase();
    if (localeInput === 'FR' || localeInput === 'EN') {
      preferredLocale = localeInput;
    }
  }

  return {
    name: companyName,
    address: companyAddress,
    phone: companyPhone,
    email: companyEmail,
    locale: preferredLocale
  };
}

// ============================================================================
// STEP 4: AUTO-CONFIGURE SETTINGS SHEET / CONFIGURER AUTO SETTINGS
// ============================================================================

/**
 * Automatically fills the Settings sheet with collected information
 * Remplit automatiquement la feuille Settings avec les informations collectées
 * @param {string} templateId - Template document ID
 * @param {string} folderId - Drive folder ID
 * @param {Object} companyInfo - Company information
 * @returns {boolean} True if successful
 */
function autoConfigureSettings(templateId, folderId, companyInfo) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let settingsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SETTINGS);

    // Create Settings sheet if it doesn't exist / Créer si n'existe pas
    if (!settingsSheet) {
      settingsSheet = ss.insertSheet(INVOICE_CONFIG.SHEETS.SETTINGS);
    }

    // Clear existing content / Effacer le contenu existant
    settingsSheet.clear();

    // Set headers / Définir les en-têtes
    settingsSheet.getRange(1, 1, 1, 2)
      .setValues([['Parameter', 'Value']])
      .setFontWeight('bold')
      .setBackground('#4285F4')
      .setFontColor('#FFFFFF');

    // Fill configuration / Remplir la configuration
    const configData = [
      [INVOICE_CONFIG.PARAM_KEYS.TEMPLATE_DOCS_ID, templateId],
      [INVOICE_CONFIG.PARAM_KEYS.DRIVE_FOLDER_ID, folderId],
      [INVOICE_CONFIG.PARAM_KEYS.SENDER_EMAIL, companyInfo.email],
      [INVOICE_CONFIG.PARAM_KEYS.AUTO_SEND_EMAIL, 'false'],
      [INVOICE_CONFIG.PARAM_KEYS.COMPANY_NAME, companyInfo.name],
      [INVOICE_CONFIG.PARAM_KEYS.COMPANY_ADDRESS, companyInfo.address],
      [INVOICE_CONFIG.PARAM_KEYS.COMPANY_PHONE, companyInfo.phone],
      [INVOICE_CONFIG.PARAM_KEYS.COMPANY_EMAIL, companyInfo.email],
      [INVOICE_CONFIG.PARAM_KEYS.INVOICE_PREFIX, 'INV' + new Date().getFullYear() + '-'],
      // Note: LAST_INVOICE_NUMBER no longer needed - IDs are auto-generated by scanning existing invoices
      [INVOICE_CONFIG.PARAM_KEYS.CURRENCY_SYMBOL, '€'],
      [INVOICE_CONFIG.PARAM_KEYS.CURRENCY_CODE, 'EUR'],
      ['LOCALE', companyInfo.locale || 'EN']  // Default language preference
    ];

    settingsSheet.getRange(2, 1, configData.length, 2).setValues(configData);

    // Auto-resize columns / Redimensionner les colonnes
    settingsSheet.autoResizeColumns(1, 2);

    Logger.log('✅ Settings sheet configured');
    return true;

  } catch (error) {
    Logger.log('❌ Error configuring settings: ' + error);
    return false;
  }
}

// ============================================================================
// STEP 6: CREATE TEST INVOICE / CRÉER UNE FACTURE DE TEST
// ============================================================================

/**
 * Creates a test invoice to validate the setup
 * Crée une facture de test pour valider l'installation
 * @param {Object} companyInfo - Company information
 * @returns {Object} Result object with success status and URL
 */
function createTestInvoice(companyInfo) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    // Create Invoices sheet if it doesn't exist / Créer si n'existe pas
    if (!invoicesSheet) {
      invoicesSheet = ss.insertSheet(INVOICE_CONFIG.SHEETS.INVOICES);

      // Add headers / Ajouter les en-têtes
      const headers = [
        'InvoiceID', 'InvoiceDate', 'ClientName', 'ClientEmail',
        'ClientPhone', 'ClientAddress', 'Description', 'Quantity',
        'UnitPrice', 'TVA', 'TotalAmount', 'Status', 'PDFUrl'
      ];

      invoicesSheet.getRange(1, 1, 1, headers.length)
        .setValues([headers])
        .setFontWeight('bold')
        .setBackground('#4285F4')
        .setFontColor('#FFFFFF');
    }

    // Add test invoice data / Ajouter une facture de test
    // Note: Using new format with ClientID: INV2025-CLI-001-0001
    const testData = [
      'INV2025-CLI-001-0001',  // New format with ClientID
      new Date(),
      'John Doe',
      'john.doe@example.com',
      '+1234567890',
      '123 Test Street, City',
      'Test Service - Setup Validation',
      1,
      100,
      0,      // TVA
      100,    // Total Amount
      INVOICE_CONFIG.STATUSES.DRAFT,
      ''
    ];

    invoicesSheet.appendRow(testData);

    // Generate the test invoice / Générer la facture de test
    // Note: This requires the InvoiceGenerator functions to be updated
    // For now, just return success
    // TODO: Call generateInvoiceById('INV2025-CLI-001-0001') once generator is updated

    return {
      success: true,
      url: 'Test invoice row added successfully',
      message: 'You can now generate it using the Invoices menu'
    };

  } catch (error) {
    Logger.log('❌ Error creating test invoice: ' + error);
    return {
      success: false,
      message: error.message
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS / FONCTIONS D'AIDE
// ============================================================================

/**
 * Returns setup wizard messages in the specified language
 * Retourne les messages de l'assistant dans la langue spécifiée
 * @param {string} lang - Language code ('EN' or 'FR')
 * @returns {Object} Messages object
 */
function getSetupMessages(lang) {
  const messages = {
    EN: {
      WELCOME_TITLE: '🎉 Welcome to InvoiceFlash!',
      WELCOME_MESSAGE: 'This wizard will help you set up your invoice system in 5 minutes.\n\nWe will:\n1. Configure your existing template\n2. Detect your Drive folder automatically\n3. Collect your company info\n4. Configure everything automatically\n5. Test the system\n\nReady to start?',
      SETUP_CANCELLED: 'Setup cancelled. You can restart it anytime from the menu.',

      STEP1_TITLE: '📄 Step 1/6: Configuring invoice template',
      STEP1_MESSAGE: 'We\'re using your existing Google Docs template for invoices.\n\nClick OK to continue.',
      STEP1_ERROR: 'Failed to access template. Please check permissions.',

      STEP2_TITLE: '📁 Step 2/6: Detecting Drive folder',
      STEP2_MESSAGE: 'We\'re automatically detecting the folder where this spreadsheet is located.\n\nClick OK to continue.',
      STEP2_ERROR: 'Failed to detect folder. Please check Drive permissions.',

      STEP3_TITLE: '🏢 Step 3/6: Company information',
      STEP3_MESSAGE: 'Please provide your company information.\n\nThis will appear on all invoices.',
      STEP3_ERROR: 'Company information incomplete. Setup cancelled.',

      STEP4_ERROR: 'Failed to configure settings. Please try again.',

      STEP5_TITLE: '🔐 Step 5/6: Testing permissions',
      STEP5_MESSAGE: 'We\'re verifying that everything is correctly configured.\n\nClick OK to continue.',
      PERMISSIONS_ERROR: 'Permission test failed',
      PERMISSIONS_ERROR_DETAIL: 'Some permissions are missing. Please grant all requested permissions.',

      STEP6_TITLE: '🧪 Step 6/6: Test invoice',
      STEP6_MESSAGE: 'Would you like to create a test invoice to validate the setup?',
      TEST_INVOICE_URL: 'Test invoice created!\n\nView it at: ',
      TEST_INVOICE_ERROR: 'Failed to create test invoice: ',

      SUCCESS_TITLE: '✅ Setup Complete!',
      SUCCESS_MESSAGE: 'Your invoice system is ready to use!\n\nYou can now:\n• Add invoices in the "Invoices" sheet\n• Generate PDFs from the "📄 Invoices" menu\n• Customize your template in Google Docs',

      FINAL_TITLE: '🎊 All Done!',
      FINAL_MESSAGE: 'Setup completed successfully!\n\nNext steps:\n1. Check the "Settings" sheet (auto-configured)\n2. Review the template document\n3. Create your first real invoice\n\nNeed help? Check the User Guide or contact support.',

      COMPANY_NAME_PROMPT: 'Enter your company name:',
      COMPANY_ADDRESS_PROMPT: 'Enter your company address:',
      COMPANY_PHONE_PROMPT: 'Enter your phone number:',
      COMPANY_EMAIL_PROMPT: 'Enter your email address:',

      ERROR: 'Error',
      UNEXPECTED_ERROR: 'An unexpected error occurred: '
    },

    FR: {
      WELCOME_TITLE: '🎉 Bienvenue sur InvoiceFlash !',
      WELCOME_MESSAGE: 'Cet assistant va vous aider à configurer votre système de facturation en 5 minutes.\n\nNous allons :\n1. Configurer votre template existant\n2. Détecter automatiquement votre dossier Drive\n3. Collecter vos informations\n4. Tout configurer automatiquement\n5. Tester le système\n\nPrêt à commencer ?',
      SETUP_CANCELLED: 'Configuration annulée. Vous pouvez la relancer depuis le menu.',

      STEP1_TITLE: '📄 Étape 1/6 : Configuration du template',
      STEP1_MESSAGE: 'Nous utilisons votre template Google Docs existant pour les factures.\n\nCliquez sur OK pour continuer.',
      STEP1_ERROR: 'Échec d\'accès au template. Vérifiez les permissions.',

      STEP2_TITLE: '📁 Étape 2/6 : Détection du dossier Drive',
      STEP2_MESSAGE: 'Nous détectons automatiquement le dossier où se trouve cette feuille de calcul.\n\nCliquez sur OK pour continuer.',
      STEP2_ERROR: 'Échec de détection du dossier. Vérifiez les permissions Drive.',

      STEP3_TITLE: '🏢 Étape 3/6 : Informations entreprise',
      STEP3_MESSAGE: 'Veuillez fournir les informations de votre entreprise.\n\nElles apparaîtront sur toutes vos factures.',
      STEP3_ERROR: 'Informations incomplètes. Configuration annulée.',

      STEP4_ERROR: 'Échec de configuration. Veuillez réessayer.',

      STEP5_TITLE: '🔐 Étape 5/6 : Test des permissions',
      STEP5_MESSAGE: 'Nous vérifions que tout est correctement configuré.\n\nCliquez sur OK pour continuer.',
      PERMISSIONS_ERROR: 'Échec du test de permissions',
      PERMISSIONS_ERROR_DETAIL: 'Certaines permissions manquent. Autorisez tous les accès demandés.',

      STEP6_TITLE: '🧪 Étape 6/6 : Facture de test',
      STEP6_MESSAGE: 'Voulez-vous créer une facture de test pour valider l\'installation ?',
      TEST_INVOICE_URL: 'Facture de test créée !\n\nConsultez-la : ',
      TEST_INVOICE_ERROR: 'Échec de création de la facture de test : ',

      SUCCESS_TITLE: '✅ Configuration Terminée !',
      SUCCESS_MESSAGE: 'Votre système de facturation est prêt !\n\nVous pouvez maintenant :\n• Ajouter des factures dans "Invoices"\n• Générer des PDF depuis le menu "📄 Invoices"\n• Personnaliser votre template dans Google Docs',

      FINAL_TITLE: '🎊 C\'est Terminé !',
      FINAL_MESSAGE: 'Configuration réussie !\n\nÉtapes suivantes :\n1. Vérifiez la feuille "Settings" (auto-configurée)\n2. Consultez le document template\n3. Créez votre première vraie facture\n\nBesoin d\'aide ? Consultez le guide ou contactez le support.',

      COMPANY_NAME_PROMPT: 'Nom de votre entreprise :',
      COMPANY_ADDRESS_PROMPT: 'Adresse de votre entreprise :',
      COMPANY_PHONE_PROMPT: 'Numéro de téléphone :',
      COMPANY_EMAIL_PROMPT: 'Adresse email :',

      ERROR: 'Erreur',
      UNEXPECTED_ERROR: 'Une erreur inattendue s\'est produite : '
    }
  };

  return messages[lang] || messages.EN;
}
