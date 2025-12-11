
/**
 * @file 10_MenuActions.gs
 * @description Fonctions associées aux éléments du menu personnalisé.
 */

// ============================================================================
// KEPY - ACTIONS DU MENU PERSONNALISÉ
// ============================================================================
// Ces fonctions sont appelées depuis le menu "KEPY"
// NE PAS RENOMMER ces fonctions
// ============================================================================

/**
 * Efface l'historique des mouvements de stock
 * Appelée depuis : Menu KEPY > Recalculer un stock
 */
function recalculateStock() {
  const mvtSheet = getSheetByName_(KEPY_CONFIG.SHEETS.MOUVEMENTS);
  const lastRow = mvtSheet.getLastRow();
  
  if (lastRow > 1) {
    mvtSheet.getRange(2, 1, lastRow - 1, mvtSheet.getLastColumn()).clearContent();
  }
  
  SpreadsheetApp.getUi().alert('Historique mouvements effacé. Ré-exécutez sur soumissions futures.');
}

/**
 * Configure l'URL du portail web
 * Appelée depuis : Menu KEPY > Configurer Portail
 */
function configurePortal_() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Configurer le Portail',
    "Colle l'URL /exec de la Web App :",
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) return;
  
  const baseUrl = cleanString_(response.getResponseText());
  if (!baseUrl || baseUrl.indexOf('/exec') < 0) {
    ui.alert('URL invalide (doit finir par /exec).');
    return;
  }
  
  setParam_('PORTAL_BASE_URL', baseUrl);
  ensureVendorTokens_();
  syncPortalUrls_(baseUrl);
  ui.alert('✅ Portail configuré et liens mis à jour.');
}

/**
 * Régénère les URLs du portail
 * Appelée depuis : Menu KEPY > Mettre à jour URLs Portail
 */
function refreshPortalUrls_() {
  const baseUrl = getParam_('PORTAL_BASE_URL');
  if (!baseUrl) {
    SpreadsheetApp.getUi().alert('Définis PORTAL_BASE_URL via "Configurer Portail".');
    return;
  }
  
  ensureVendorTokens_();
  syncPortalUrls_(baseUrl);
  SpreadsheetApp.getUi().alert('✅ URLs de Portail regénérées.');
}

/**
 * Configure le lien prérempli du formulaire
 * Appelée depuis : Menu KEPY > Configurer lien prérempli (Form)
 */
function configureFormPrefillBase_() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Configurer lien prérempli (Form)',
    'Colle le lien obtenu via "Préremplir le formulaire" (ex. avec Adèle) :',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) return;
  
  const fullUrl = cleanString_(response.getResponseText());
  const baseUrl = parsePrefillBase_(fullUrl);
  
  if (!baseUrl) {
    ui.alert('❌ Lien invalide. Je dois reconnaître ".../viewform?usp=pp_url&entry.XXXXXXXX="');
    return;
  }
  
  setParam_('FORM_PREFILL_BASE', baseUrl);
  ui.alert('✅ Base du lien prérempli enregistrée :\n' + baseUrl);
}



/**
 * Action manuelle pour générer une facture à partir d'un SaleID.
 */
function generateInvoiceManually() {
  const ui = SpreadsheetApp.getUi();
  
  // Demande le SaleID à l'utilisateur
  const result = ui.prompt(
      'Générer Facture',
      'Entrez le SaleID pour la facture à générer :',
      ui.ButtonSet.OK_CANCEL);

  if (result.getSelectedButton() === ui.Button.CANCEL) {
    return;
  }
  
  const saleId = result.getResponseText();
  if (!saleId || saleId.trim() === '') {
    ui.alert('Erreur', 'Aucun SaleID fourni. Opération annulée.', ui.ButtonSet.OK);
    return;
  }
  
  try {
    const status = generateInvoiceBySaleId_(saleId.trim());
    ui.alert('Succès', status, ui.ButtonSet.OK);
  } catch (error) {
    ui.alert('Erreur', 'Impossible de générer la facture : ' + error.message, ui.ButtonSet.OK);
    Logger.log('Erreur manuelle facture: ' + error.message);
  }
}

