// ============================================================================
// KEPY - SYNCHRONISATION FORMULAIRE
// ============================================================================

/**
 * Synchronise une question de type liste dans le Form
 * @private
 */
function syncFormListQuestion_(questionTitle, values) {
  const form = FormApp.openById(KEPY_CONFIG.FORM_ID);
  const items = form.getItems(FormApp.ItemType.LIST);
  
  let targetItem = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].getTitle() === questionTitle) {
      targetItem = items[i].asListItem();
      break;
    }
  }
  
  if (!targetItem) {
    throw new Error(`Question "${questionTitle}" introuvable dans le formulaire.`);
  }
  
  targetItem.setChoiceValues(values);
  Logger.log(`✅ Liste "${questionTitle}" synchronisée : ${values.length} entrées`);
}

/**
 * Synchronise les vendeurs vers le Form
 */
function syncVendorsToForm() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(KEPY_CONFIG.SHEETS.VENDEURS);
  const vendorNames = sheet.getRange('B2:B').getValues().flat().filter(Boolean);
  syncFormListQuestion_(KEPY_CONFIG.FORM_QUESTIONS.VENDOR, vendorNames);
}

/**
 * Synchronise les produits vers le Form
 */
function syncProductsToForm() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(KEPY_CONFIG.SHEETS.CATALOGUE);
  const productNames = sheet.getRange('B2:B').getValues().flat().filter(Boolean);
  syncFormListQuestion_(KEPY_CONFIG.FORM_QUESTIONS.PRODUCT, productNames);
}

/**
 * Synchronise les entrepôts vers le Form
 */
function syncStoreToForm() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(KEPY_CONFIG.SHEETS.ENTREPOTS);
  const warehouseNames = sheet.getRange('B2:B').getValues().flat().filter(Boolean);
  syncFormListQuestion_(KEPY_CONFIG.FORM_QUESTIONS.WAREHOUSE, warehouseNames);
}


/**
 * Synchronise les clients vers le Form
 */
/** */
function syncClientsToForm_old() {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.CLIENTS);
  const lastRow = sheet.getLastRow();
  const rowCount = Math.max(0, lastRow - 1);
  const values = rowCount > 0 
    ? sheet.getRange(2, KEPY_CONFIG.CLIENTS.NAME_COL, rowCount, 1).getValues().flat() 
    : [];
  
  // Nettoyer et filtrer les doublons
  const clientNames = values
    .map(name => cleanString_(name))
    .filter(Boolean);
  
  // Supprimer les doublons (insensible à la casse)
  const seen = {};
  const uniqueClientNames = clientNames.filter(name => {
    const key = name.toLowerCase().trim();
    if (seen[key]) {
      Logger.log(`⚠️ Client en double ignoré : "${name}"`);
      return false;
    }
    seen[key] = true;
    return true;
  });
  
  Logger.log(`${clientNames.length} clients trouvés, ${uniqueClientNames.length} uniques`);
  
  syncFormListQuestion_(KEPY_CONFIG.CLIENTS.QUESTION_LIST_TITLE, uniqueClientNames);
}

/**
 * Synchronise les clients vers les DEUX formulaires (Ventes ET Dépôt)
 */
function syncClientsToForm() {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.CLIENTS);
  const lastRow = sheet.getLastRow();
  const rowCount = Math.max(0, lastRow - 1);
  const values = rowCount > 0 
    ? sheet.getRange(2, KEPY_CONFIG.CLIENTS.NAME_COL, rowCount, 1).getValues().flat() 
    : [];
  
  // Nettoyer et filtrer les doublons
  const clientNames = values
    .map(name => cleanString_(name))
    .filter(Boolean);
  
  // Supprimer les doublons (insensible à la casse)
  const seen = {};
  const uniqueClientNames = clientNames.filter(name => {
    const key = name.toLowerCase().trim();
    if (seen[key]) {
      Logger.log(`⚠️ Client en double ignoré : "${name}"`);
      return false;
    }
    seen[key] = true;
    return true;
  });
  
  Logger.log(`${clientNames.length} clients trouvés, ${uniqueClientNames.length} uniques`);
  
  // ✅ Sync vers le formulaire de VENTES
  try {
    syncFormListQuestion_(KEPY_CONFIG.CLIENTS.QUESTION_LIST_TITLE, uniqueClientNames, KEPY_CONFIG.FORM_ID);
    Logger.log('✅ Clients synchronisés vers formulaire Ventes');
  } catch (e) {
    Logger.log('❌ Erreur sync Ventes: ' + e.message);
  }
  
  // ✅ Sync vers le formulaire de DÉPÔT
  if (KEPY_CONFIG.FORM_ID_DEPOT) {
    try {
      syncFormListQuestion_(KEPY_CONFIG.CLIENTS.QUESTION_LIST_TITLE, uniqueClientNames, KEPY_CONFIG.FORM_ID_DEPOT);
      Logger.log('✅ Clients synchronisés vers formulaire Dépôt');
    } catch (e) {
      Logger.log('❌ Erreur sync Dépôt: ' + e.message);
    }
  }
}

/**
 * Synchronise une question de type liste dans un Form spécifique
 * @private
 */
function syncFormListQuestion_(questionTitle, values, formId) {
  const form = FormApp.openById(formId);
  const items = form.getItems(FormApp.ItemType.LIST);
  
  let targetItem = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].getTitle() === questionTitle) {
      targetItem = items[i].asListItem();
      break;
    }
  }
  
  if (!targetItem) {
    throw new Error(`Question "${questionTitle}" introuvable dans le formulaire ${formId}.`);
  }
  
  targetItem.setChoiceValues(values);
  Logger.log(`✅ Liste "${questionTitle}" synchronisée : ${values.length} entrées`);
}


/**
 * Synchronise les devises vers le Form
 * FONCTION DÉSACTIVÉE - Devise fixée à XAF
 */
/**
function syncCurrenciesToForm() {
  const form = FormApp.openById(KEPY_CONFIG.FORM_ID);
  const params = getParams_();
  let rawCurrencies = params['DEVISE'];
  
  if (!rawCurrencies) {
    const paramSheet = getSheetByName_(KEPY_CONFIG.SHEETS.PARAMETRES);
    rawCurrencies = paramSheet.getRange('B2').getValue();
  }
  
  const currencies = String(rawCurrencies || '')
    .split(/[;,]/)
    .map(c => cleanString_(c))
    .filter(Boolean);
  
  const seen = {};
  const uniqueCurrencies = currencies.filter(curr => {
    const key = curr.toUpperCase();
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  
  if (uniqueCurrencies.length === 0) {
    throw new Error('Aucune devise trouvée (Parametres!B2 / clé DEVISE).');
  }
  
  const items = form.getItems();
  let updated = false;
  
  items.forEach(item => {
    if (item.getTitle() !== KEPY_CONFIG.FORM_QUESTIONS.CURRENCY) return;
    
    if (item.getType() === FormApp.ItemType.LIST) {
      item.asListItem().setChoiceValues(uniqueCurrencies);
      updated = true;
    } else if (item.getType() === FormApp.ItemType.MULTIPLE_CHOICE) {
      item.asMultipleChoiceItem().setChoiceValues(uniqueCurrencies);
      updated = true;
    }
  });
  
  if (!updated) {
    throw new Error(`Question "${KEPY_CONFIG.FORM_QUESTIONS.CURRENCY}" introuvable.`);
  }
  
  Logger.log('✅ Devises synchronisées : ' + uniqueCurrencies.join(', '));
}
 */


/**
 * Synchronise les modes de paiement vers le Form
 */
function syncPaymentModesToForm() {
  const form = FormApp.openById(KEPY_CONFIG.FORM_ID);
  const params = getParams_();
  let rawModes = params['MODES_PAIEMENT'];
  
  if (!rawModes) {
    const paramSheet = getSheetByName_(KEPY_CONFIG.SHEETS.PARAMETRES);
    rawModes = paramSheet.getRange('B6').getValue();
  }
  
  const modes = String(rawModes || '')
    .split(',')
    .map(m => cleanString_(m))
    .filter(Boolean);
  
  const seen = {};
  const uniqueModes = modes.filter(mode => {
    const key = mode.toLowerCase();
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  
  if (uniqueModes.length === 0) {
    throw new Error('Aucune option de paiement trouvée (Parametres!B6 / MODES_PAIEMENT).');
  }
  
  const items = form.getItems();
  let updated = false;
  
  items.forEach(item => {
    if (item.getTitle() !== KEPY_CONFIG.FORM_QUESTIONS.PAYMENT) return;
    
    if (item.getType() === FormApp.ItemType.LIST) {
      item.asListItem().setChoiceValues(uniqueModes);
      updated = true;
    } else if (item.getType() === FormApp.ItemType.CHECKBOX) {
      item.asCheckboxItem().setChoiceValues(uniqueModes);
      updated = true;
    }
  });
  
  if (!updated) {
    throw new Error(`Question "${KEPY_CONFIG.FORM_QUESTIONS.PAYMENT}" introuvable.`);
  }
  
  Logger.log('✅ Modes de paiement synchronisés : ' + uniqueModes.join(', '));
}

