/**
 * @file 05_Stock.gs
 * @description Fonctions pour la gestion de l'inventaire et du stock.
 * 
 * VERSION MISE À JOUR : Ajout de getPriceFromCatalogue_()
 */

// ============================================================================
// KEPY - GESTION DU STOCK AMÉLIORÉE
// ============================================================================

/**
 * Mappe un libellé d'entrepôt vers son ID
 */
function mapEntrepotId_(libelle) {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.ENTREPOTS);
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  const map = {};
  
  data.forEach(row => {
    const label = cleanString_(row[1]).toUpperCase();
    const id = cleanString_(row[0]);
    if (label) map[label] = id;
  });
  
  const key = cleanString_(libelle).toUpperCase();
  return map[key] || '';
}

/**
 * Mappe un nom de lot vers son SKU
 */
function mapSKU_(nomLot) {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.CATALOGUE);
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  const map = {};
  
  data.forEach(row => {
    const productName = cleanString_(row[1]).toUpperCase();
    const sku = cleanString_(row[0]);
    if (productName) map[productName] = sku;
  });
  
  const key = cleanString_(nomLot).toUpperCase();
  return map[key] || KEPY_CONFIG.STOCK.DEFAULT_SKU;
}

/**
 * 🆕 Récupère le prix de vente HT depuis le Catalogue
 * @param {string} nomLot - Nom du lot (ex: "Lot de 10 boîtes")
 * @returns {number} Prix de vente HT en XAF (0 si non trouvé)
 */
function getPriceFromCatalogue_(nomLot) {
  try {
    const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.CATALOGUE);
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) return 0;
    
    // Colonnes : A=SKU, B=Nom_lot, C=Prix_vente_HT_XAF
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const searchKey = cleanString_(nomLot).toUpperCase();
    
    for (let i = 0; i < data.length; i++) {
      const productName = cleanString_(data[i][1]).toUpperCase();
      if (productName === searchKey) {
        const price = Number(data[i][2]) || 0;
        Logger.log(`💰 Prix trouvé pour "${nomLot}": ${price} XAF`);
        return price;
      }
    }
    
    Logger.log(`⚠️ Prix non trouvé pour "${nomLot}", retour 0`);
    return 0;
  } catch (e) {
    Logger.log(`❌ Erreur getPriceFromCatalogue_: ${e.message}`);
    return 0;
  }
}

/**
 * 🆕 Récupère le prix de vente HT depuis le Catalogue par SKU
 * @param {string} sku - SKU du produit (ex: "LOT_1")
 * @returns {number} Prix de vente HT en XAF (0 si non trouvé)
 */
function getPriceBySKU_(sku) {
  try {
    const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.CATALOGUE);
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) return 0;
    
    // Colonnes : A=SKU, B=Nom_lot, C=Prix_vente_HT_XAF
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    const searchKey = cleanString_(sku).toUpperCase();
    
    for (let i = 0; i < data.length; i++) {
      const productSKU = cleanString_(data[i][0]).toUpperCase();
      if (productSKU === searchKey) {
        return Number(data[i][2]) || 0;
      }
    }
    
    return 0;
  } catch (e) {
    Logger.log(`❌ Erreur getPriceBySKU_: ${e.message}`);
    return 0;
  }
}

/**
 * Récupère le stock courant pour un couple (EntrepotID, SKU)
 */
function getCurrentStock_(entrepotId, sku) {
  entrepotId = cleanString_(entrepotId);
  sku = cleanString_(sku);
  
  if (!entrepotId || !sku) return 0;
  
  const ss = SpreadsheetApp.getActive();
  
  // Stock initial
  let stockInitSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.STOCK_INITIAL);
  if (!stockInitSheet) {
    stockInitSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.STOCK_FALLBACK);
  }
  
  let initialStock = 0;
  if (stockInitSheet && stockInitSheet.getLastRow() > 1) {
    const initData = stockInitSheet.getRange(2, 1, stockInitSheet.getLastRow() - 1, 4).getValues();
    initData.forEach(row => {
      const entCell = cleanString_(row[0]);
      const skuCell = cleanString_(row[1]);
      if (entCell === entrepotId && skuCell === sku) {
        initialStock += Number(row[2]) || 0;
      }
    });
  }
  
  // Mouvements
  let currentStock = initialStock;
  const mvtSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.MOUVEMENTS);
  
  if (mvtSheet && mvtSheet.getLastRow() > 1) {
    const mvtData = mvtSheet.getRange(2, 1, mvtSheet.getLastRow() - 1, 7).getValues(); // Colonne 7 = Stock_apres
    mvtData.forEach(row => {
      const entCell = cleanString_(row[3]);
      const skuCell = cleanString_(row[4]);
      if (entCell !== entrepotId || skuCell !== sku) return;
      
      const type = cleanString_(row[1]).toUpperCase();
      const qty = Number(row[5]) || 0;
      if (!qty) return;
      
      const direction = (type === KEPY_CONFIG.STOCK.MOVEMENT_TYPES.IN) ? 1 : 
                        (type === KEPY_CONFIG.STOCK.MOVEMENT_TYPES.OUT ? -1 : 0);
      currentStock += direction * qty;
    });
  }
  
  return currentStock;
}

/**
 * Enregistre un mouvement de stock ET met à jour Suivi_Stock
 * @param {string} type - 'IN' ou 'OUT'
 * @param {string} referenceId - ID de la vente ou du dépôt
 * @param {string} entrepotId - ID de l'entrepôt
 * @param {string} sku - SKU du produit
 * @param {number} quantity - Quantité (toujours positive)
 * @param {number} stockAfter - Stock après mouvement (optionnel, recalculé si null)
 */
function pushStockMovement_(type, referenceId, entrepotId, sku, quantity, stockAfter = null) {
  // Nettoyer les valeurs
  type = cleanString_(type).toUpperCase();
  entrepotId = cleanString_(entrepotId);
  sku = cleanString_(sku);
  quantity = Math.abs(Number(quantity) || 0);
  
  if (!entrepotId || !sku || quantity === 0) {
    Logger.log(`⚠️ Mouvement ignoré : données invalides (${entrepotId}, ${sku}, ${quantity})`);
    return;
  }
  
  // Calculer le stock après si non fourni
  if (stockAfter === null) {
    const stockBefore = getCurrentStock_(entrepotId, sku);
    const direction = (type === KEPY_CONFIG.STOCK.MOVEMENT_TYPES.IN) ? 1 : -1;
    stockAfter = stockBefore + (direction * quantity);
  }
  
  // Enregistrer le mouvement
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.MOUVEMENTS);
  sheet.appendRow([
    getCurrentTimestamp_(),
    type,
    referenceId,
    entrepotId,
    sku,
    quantity,
    stockAfter
  ]);
  
  Logger.log(`✅ Mouvement enregistré : ${type} ${quantity} ${sku} @ ${entrepotId} → Stock: ${stockAfter}`);
  
  // Mettre à jour Suivi_Stock en temps réel
  updateSuiviStockLine_(entrepotId, sku, stockAfter);
  
  // Alerte si stock négatif
  if (stockAfter < 0) {
    sendRuptureAlert_(entrepotId, sku, stockAfter);
  }
}

/**
 * Met à jour UNE ligne dans Suivi_Stock (mise à jour incrémentale)
 * @param {string} entrepotId - ID de l'entrepôt
 * @param {string} sku - SKU du produit
 * @param {number} newStock - Nouveau stock courant
 */
function updateSuiviStockLine_(entrepotId, sku, newStock) {
  const ss = SpreadsheetApp.getActive();
  let suiviSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.STOCK_FALLBACK);
  
  if (!suiviSheet) {
    suiviSheet = ss.insertSheet(KEPY_CONFIG.SHEETS.STOCK_FALLBACK);
    suiviSheet.getRange(1, 1, 1, 6).setValues([[
      'EntrepotID', 'SKU', 'Stock_initial', 'Stock_courant', 'Date_init', 'Dernier_mvt'
    ]]);
  }
  
  // Chercher la ligne existante
  const lastRow = suiviSheet.getLastRow();
  let targetRow = -1;
  
  if (lastRow > 1) {
    const data = suiviSheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (let i = 0; i < data.length; i++) {
      if (cleanString_(data[i][0]) === entrepotId && cleanString_(data[i][1]) === sku) {
        targetRow = i + 2; // +2 car commence à ligne 2
        break;
      }
    }
  }
  
  const timestamp = getCurrentTimestamp_();
  
  if (targetRow > 0) {
    // Mise à jour ligne existante
    suiviSheet.getRange(targetRow, 4).setValue(newStock); // Colonne D = Stock_courant
    suiviSheet.getRange(targetRow, 6).setValue(timestamp); // Colonne F = Dernier_mvt
  } else {
    // Nouvelle ligne
    const stockInitial = getInitialStock_(entrepotId, sku);
    suiviSheet.appendRow([
      entrepotId,
      sku,
      stockInitial,
      newStock,
      '', // Date_init sera remplie si besoin
      timestamp
    ]);
  }
}

/**
 * Récupère le stock initial pour un couple (EntrepotID, SKU)
 */
function getInitialStock_(entrepotId, sku) {
  const ss = SpreadsheetApp.getActive();
  const initSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.STOCK_INITIAL);
  
  if (!initSheet || initSheet.getLastRow() <= 1) return 0;
  
  let total = 0;
  const data = initSheet.getRange(2, 1, initSheet.getLastRow() - 1, 4).getValues();
  
  data.forEach(row => {
    if (cleanString_(row[0]) === entrepotId && cleanString_(row[1]) === sku) {
      total += Number(row[2]) || 0;
    }
  });
  
  return total;
}

/**
 * Envoie une alerte email en cas de rupture de stock
 */
function sendRuptureAlert_(entrepotId, sku, stockAfter) {
  const params = getParams_();
  const recipient = params['EMAIL_ALERTES'] || Session.getActiveUser().getEmail();
  const subject = `[KEPY] ⚠️ STOCK NÉGATIF - ${sku} @ ${entrepotId}`;
  const body = `
    ALERTE STOCK NÉGATIF
    ===================
    Entrepôt : ${entrepotId}
    Produit  : ${sku}
    Stock    : ${stockAfter}
    Date     : ${getCurrentTimestamp_()}

    ⚠️ Action requise : vérifier les commandes et réapprovisionner.
      `.trim();
  
  try {
    MailApp.sendEmail(recipient, subject, body);
    Logger.log(`📧 Alerte envoyée à ${recipient}`);
  } catch (e) {
    Logger.log(`❌ Erreur envoi email : ${e.message}`);
  }
}

/**
 * Recalcule ENTIÈREMENT la feuille Suivi_Stock (à utiliser en maintenance)
 */
function rebuildSuiviStock_() {
  const ss = SpreadsheetApp.getActive();
  const initSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.STOCK_INITIAL);
  const mvtSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.MOUVEMENTS);
  let suiviSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.STOCK_FALLBACK);
  
  if (!suiviSheet) {
    suiviSheet = ss.insertSheet(KEPY_CONFIG.SHEETS.STOCK_FALLBACK);
  }
  
  const stockMap = {};
  
  function makeKey(entrepotId, sku) {
    return `${entrepotId}||${sku}`;
  }
  
  // Charge stock initial
  if (initSheet && initSheet.getLastRow() > 1) {
    const initData = initSheet.getRange(2, 1, initSheet.getLastRow() - 1, 4).getValues();
    initData.forEach(row => {
      const entrepotId = cleanString_(row[0]);
      const sku = cleanString_(row[1]);
      if (!entrepotId || !sku) return;
      
      const key = makeKey(entrepotId, sku);
      const stockInitial = Number(row[2]) || 0;
      const dateInit = row[3] || '';
      
      if (!stockMap[key]) {
        stockMap[key] = {
          entrepotId,
          sku,
          stockInitial: 0,
          stockCourant: 0,
          dateInit: '',
          lastMvt: ''
        };
      }
      
      stockMap[key].stockInitial += stockInitial;
      stockMap[key].stockCourant += stockInitial;
      if (!stockMap[key].dateInit && dateInit) {
        stockMap[key].dateInit = dateInit;
      }
    });
  }
  
  // Charge mouvements
  if (mvtSheet && mvtSheet.getLastRow() > 1) {
    const mvtData = mvtSheet.getRange(2, 1, mvtSheet.getLastRow() - 1, 7).getValues();
    mvtData.forEach(row => {
      const timestamp = row[0];
      const type = cleanString_(row[1]).toUpperCase();
      const entrepotId = cleanString_(row[3]);
      const sku = cleanString_(row[4]);
      const qty = Number(row[5]) || 0;
      
      if (!entrepotId || !sku || !qty) return;
      
      const direction = (type === KEPY_CONFIG.STOCK.MOVEMENT_TYPES.IN) ? 1 : 
                        (type === KEPY_CONFIG.STOCK.MOVEMENT_TYPES.OUT ? -1 : 0);
      if (direction === 0) return;
      
      const key = makeKey(entrepotId, sku);
      if (!stockMap[key]) {
        stockMap[key] = {
          entrepotId,
          sku,
          stockInitial: 0,
          stockCourant: 0,
          dateInit: '',
          lastMvt: ''
        };
      }
      
      stockMap[key].stockCourant += direction * qty;
      
      if (timestamp) {
        if (!stockMap[key].lastMvt || timestamp > stockMap[key].lastMvt) {
          stockMap[key].lastMvt = timestamp;
        }
      }
    });
  }
  
  // Prépare les lignes
  const rows = Object.keys(stockMap).sort().map(key => {
    const item = stockMap[key];
    return [
      item.entrepotId,
      item.sku,
      item.stockInitial,
      item.stockCourant,
      item.dateInit,
      item.lastMvt
    ];
  });
  
  // Écrit dans Suivi_Stock
  suiviSheet.clearContents();
  suiviSheet.getRange(1, 1, 1, 6).setValues([[
    'EntrepotID', 'SKU', 'Stock_initial', 'Stock_courant', 'Date_init', 'Dernier_mvt'
  ]]);
  
  if (rows.length > 0) {
    suiviSheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
  
  Logger.log(`✅ Suivi_Stock reconstruit : ${rows.length} lignes.`);
}

/**
 * 🔧 FONCTION PRINCIPALE : Enregistrer une vente et mettre à jour le stock
 * À appeler depuis votre script de traitement des ventes
 * 
 * @param {string} venteId - ID de la vente (ex: "V005")
 * @param {string} entrepotLabel - Nom de l'entrepôt (ex: "Entrepôt Paris")
 * @param {string} productName - Nom du produit (ex: "Crème visage")
 * @param {number} quantity - Quantité vendue
 */
function processVenteMouvement(venteId, entrepotLabel, productName, quantity) {
  // 1. Mapper les noms vers les IDs
  const entrepotId = mapEntrepotId_(entrepotLabel);
  const sku = mapSKU_(productName);
  
  if (!entrepotId || !sku) {
    Logger.log(`❌ Mapping échoué : Entrepot="${entrepotLabel}" → "${entrepotId}", Produit="${productName}" → "${sku}"`);
    return;
  }
  
  // 2. Enregistrer le mouvement OUT
  pushStockMovement_(
    KEPY_CONFIG.STOCK.MOVEMENT_TYPES.OUT,
    venteId,
    entrepotId,
    sku,
    quantity
  );
  
  Logger.log(`✅ Vente ${venteId} traitée : -${quantity} ${sku} @ ${entrepotId}`);
}

/**
 * 🧪 FONCTION DE TEST
 */
function testProcessVente() {
  processVenteMouvement('V999', 'Entrepôt Paris', 'Crème visage', 5);
}

/**
 * 🧪 TEST : Récupérer le prix d'un produit
 */
function testGetPrice() {
  const testProducts = [
    'Lot de 10 boîtes',
    'Lot de 20-49 boîtes',
    'Lot de 100-249 boîtes',
    'Produit inexistant'
  ];
  
  testProducts.forEach(product => {
    const price = getPriceFromCatalogue_(product);
    Logger.log(`${product} → ${price} XAF`);
  });
}


