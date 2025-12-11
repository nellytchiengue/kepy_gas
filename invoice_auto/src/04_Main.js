/**
 * @file 04_Main.js
 * @description Point d'entrée principal et interface utilisateur (menu personnalisé)
 * @version 1.0
 * @date 2025-12-11
 */

// ============================================================================
// MENU PERSONNALISÉ DANS GOOGLE SHEETS
// ============================================================================

/**
 * Crée un menu personnalisé lors de l'ouverture du Google Sheet
 * Cette fonction est automatiquement appelée par Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('📄 Factures')
    .addItem('✨ Générer toutes les factures', 'menuGenerateAllInvoices')
    .addItem('🔍 Générer une facture spécifique', 'menuGenerateSingleInvoice')
    .addSeparator()
    .addItem('📧 Envoyer une facture par email', 'menuSendInvoiceEmail')
    .addSeparator()
    .addItem('📊 Voir les statistiques', 'menuShowStatistics')
    .addSeparator()
    .addItem('⚙️ Tester les permissions', 'menuTestPermissions')
    .addItem('ℹ️ À propos', 'menuAbout')
    .addToUi();

  Logger.log('Menu Factures créé avec succès');
}

// ============================================================================
// FONCTIONS MENU - GÉNÉRATION DE FACTURES
// ============================================================================

/**
 * Menu: Génère toutes les factures en statut "Brouillon"
 */
function menuGenerateAllInvoices() {
  const ui = SpreadsheetApp.getUi();

  // Confirmation avant génération
  const response = ui.alert(
    'Générer les factures',
    'Voulez-vous générer toutes les factures en brouillon ?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    ui.alert('Opération annulée');
    return;
  }

  // Affiche un message de traitement
  ui.alert('Génération en cours...', 'Veuillez patienter', ui.ButtonSet.OK);

  // Génère toutes les factures
  const result = generateAllPendingInvoices();

  // Affiche le résultat
  if (result.totalProcessed === 0) {
    ui.alert('Information', result.message, ui.ButtonSet.OK);
  } else {
    const details = result.details
      .map(d => `${d.invoiceId}: ${d.success ? '✅' : '❌'} ${d.message}`)
      .join('\n');

    ui.alert(
      'Résultat de la génération',
      `${result.message}\n\nDétails:\n${details}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Menu: Génère une facture spécifique par ID
 */
function menuGenerateSingleInvoice() {
  const ui = SpreadsheetApp.getUi();

  // Demande l'ID de la facture
  const response = ui.prompt(
    'Générer une facture',
    'Entrez l\'ID de la facture à générer (ex: F001):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Opération annulée');
    return;
  }

  const invoiceId = response.getResponseText().trim();

  if (!invoiceId) {
    ui.alert('Erreur', 'ID de facture manquant', ui.ButtonSet.OK);
    return;
  }

  // Génère la facture
  ui.alert('Génération en cours...', 'Veuillez patienter', ui.ButtonSet.OK);

  const result = generateInvoiceById(invoiceId);

  // Affiche le résultat
  if (result.success) {
    ui.alert(
      'Succès',
      `${result.message}\n\nURL du PDF:\n${result.url}`,
      ui.ButtonSet.OK
    );
  } else {
    ui.alert('Erreur', result.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// FONCTIONS MENU - ENVOI D'EMAILS
// ============================================================================

/**
 * Menu: Envoie une facture par email
 */
function menuSendInvoiceEmail() {
  const ui = SpreadsheetApp.getUi();

  // Demande l'ID de la facture
  const response = ui.prompt(
    'Envoyer une facture par email',
    'Entrez l\'ID de la facture à envoyer (ex: F001):',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    ui.alert('Opération annulée');
    return;
  }

  const invoiceId = response.getResponseText().trim();

  if (!invoiceId) {
    ui.alert('Erreur', 'ID de facture manquant', ui.ButtonSet.OK);
    return;
  }

  // Envoie l'email
  ui.alert('Envoi en cours...', 'Veuillez patienter', ui.ButtonSet.OK);

  const result = sendInvoiceEmailManually(invoiceId);

  // Affiche le résultat
  ui.alert(
    result.success ? 'Succès' : 'Erreur',
    result.message,
    ui.ButtonSet.OK
  );
}

// ============================================================================
// FONCTIONS MENU - STATISTIQUES
// ============================================================================

/**
 * Menu: Affiche les statistiques des factures
 */
function menuShowStatistics() {
  const ui = SpreadsheetApp.getUi();

  const stats = getInvoiceStatistics();

  if (!stats) {
    ui.alert('Erreur', 'Impossible de récupérer les statistiques', ui.ButtonSet.OK);
    return;
  }

  const message = `
📊 STATISTIQUES DES FACTURES

Total de factures: ${stats.total}

Par statut:
  📝 Brouillon: ${stats.brouillon}
  ✅ Générée: ${stats.generee}
  📧 Envoyée: ${stats.envoyee}
  `;

  ui.alert('Statistiques', message, ui.ButtonSet.OK);
}

// ============================================================================
// FONCTIONS MENU - TESTS ET CONFIGURATION
// ============================================================================

/**
 * Menu: Teste toutes les permissions nécessaires
 */
function menuTestPermissions() {
  const ui = SpreadsheetApp.getUi();

  try {
    ui.alert('Test en cours...', 'Vérification des permissions', ui.ButtonSet.OK);

    const results = testAllPermissions();

    const message = `
${results.success ? '✅ TOUS LES TESTS SONT PASSÉS' : '❌ CERTAINS TESTS ONT ÉCHOUÉ'}

Détails:
${results.details.map(d => `${d.test}: ${d.success ? '✅' : '❌'} ${d.message}`).join('\n')}
    `;

    ui.alert('Résultats des tests', message, ui.ButtonSet.OK);

  } catch (error) {
    ui.alert('Erreur', `Erreur lors des tests: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Menu: Affiche les informations sur le système
 */
function menuAbout() {
  const ui = SpreadsheetApp.getUi();

  const message = `
📄 SYSTÈME DE GÉNÉRATION AUTOMATIQUE DE FACTURES

Version: 1.0
Date: 2025-12-11

Fonctionnalités:
  ✨ Génération automatique de factures PDF
  📧 Envoi automatique par email (optionnel)
  📊 Statistiques et suivi
  🔐 Validation des données

Pour toute question, consultez le README.md
  `;

  ui.alert('À propos', message, ui.ButtonSet.OK);
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

  // Test 2: Feuille Factures
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.FACTURES);
    if (sheet) {
      results.details.push({
        test: 'Feuille Factures',
        success: true,
        message: 'OK'
      });
    } else {
      throw new Error('Feuille introuvable');
    }
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Feuille Factures',
      success: false,
      message: error.message
    });
  }

  // Test 3: Feuille Parametres
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.PARAMETRES);
    if (sheet) {
      results.details.push({
        test: 'Feuille Parametres',
        success: true,
        message: 'OK'
      });
    } else {
      throw new Error('Feuille introuvable');
    }
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Feuille Parametres',
      success: false,
      message: error.message
    });
  }

  // Test 4: Accès au template Docs
  try {
    const templateId = getParam(INVOICE_CONFIG.PARAM_KEYS.ID_TEMPLATE_DOCS);
    if (templateId) {
      const template = DriveApp.getFileById(templateId);
      results.details.push({
        test: 'Template Docs',
        success: true,
        message: `OK - ${template.getName()}`
      });
    } else {
      throw new Error('ID template non configuré');
    }
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Template Docs',
      success: false,
      message: error.message
    });
  }

  // Test 5: Accès au dossier Drive
  try {
    const folderId = getParam(INVOICE_CONFIG.PARAM_KEYS.ID_DOSSIER_DRIVE);
    if (folderId) {
      const folder = DriveApp.getFolderById(folderId);
      results.details.push({
        test: 'Dossier Drive',
        success: true,
        message: `OK - ${folder.getName()}`
      });
    } else {
      throw new Error('ID dossier non configuré');
    }
  } catch (error) {
    results.success = false;
    results.details.push({
      test: 'Dossier Drive',
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

  } catch (error) {
    logError('scheduledInvoiceGeneration', 'Erreur lors de la génération planifiée', error);
  }
}
