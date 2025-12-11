/**
 * @file 06_SalesConsolidation.gs
 * @description Scripts pour la consolidation et l'analyse des ventes.
 * 
 * VERSION MISE À JOUR : Synchronisation depuis Ventes_responses ET DepotVente_responses
 */

// ============================================================================
// KEPY - GESTION DES VENTES & CONSOLIDATION
// ============================================================================

/**
 * Génère un ID de vente unique
 */
function buildSaleId_(vendorId) {
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const random = Math.floor(Math.random() * 900 + 100);
  return `${now}-${vendorId}-${random}`;
}

/**
 * Génère un ID de dépôt-vente unique
 */
function buildDepotId_(clientId) {
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const random = Math.floor(Math.random() * 900 + 100);
  return `DEPOT-${now}-${clientId || 'NA'}-${random}`;
}

/**
 * S'assure que les en-têtes de Consolidation existent
 */
function ensureConsolidationHeaders_() {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.CONSOLIDATION);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'SaleID', 'Timestamp', 'VendorID', 'VendorNom', 'ManagerID', 'TeamRoot',
      'Produit', 'Quantite', 'PU', 'Devise', 'Montant', 'ModePaiement',
      'DateVente', 'DatePaiement', 'Client', 'ClientID', 'Entrepot',
      'SourceSheet', 'RowHash'
    ]);
  }
}

/**
 * S'assure que les en-têtes de Règlements existent
 */
function ensureReglementsHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'ID_reference', 'ClientID', 'Devise', 'Montant',
      'ModePaiement', 'DatePaiement', 'VendorID', 'VendorNom', 'Personne_presente'
    ]);
  }
}

/**
 * Insère ou met à jour une vente dans Consolidation
 * 🆕 VERSION CORRIGÉE : Ne déclenche PAS de mouvement de stock (déjà fait par le trigger)
 */
function upsertConsoBySaleId_(consoRow) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(KEPY_CONFIG.SHEETS.CONSOLIDATION);
  if (!sheet) throw new Error("Feuille 'Consolidation' introuvable.");
  
  const saleId = cleanString_(consoRow[0]);
  if (!saleId) throw new Error('SaleID manquant.');
  
  const lastRow = sheet.getLastRow();
  let action = 'inserted';
  
  if (lastRow >= 2) {
    const saleIds = sheet.getRange(2, 1, lastRow - 1, 1)
      .getValues()
      .map(row => cleanString_(row[0]));
    
    const existingIndex = saleIds.indexOf(saleId);
    if (existingIndex >= 0) {
      sheet.getRange(2 + existingIndex, 1, 1, consoRow.length).setValues([consoRow]);
      action = 'updated';
    } else {
      sheet.appendRow(consoRow);
    }
  } else {
    sheet.appendRow(consoRow);
  }
  
  // NOTE: Le mouvement de stock est déjà géré par onFormSubmit/onDepotFormSubmit
  // Ne pas dupliquer ici pour éviter les doubles mouvements
  
  return action;
}

/**
 * Reconstruit entièrement Consolidation depuis Ventes_responses
 * ⚠️ Ne reconstruit PAS les ventes depuis DepotVente_responses (utiliser syncAllToConsolidation_)
 */
function syncConsolidationFromVentes_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ventesSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.VENTES);
  const consoSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.CONSOLIDATION);
  
  if (!ventesSheet || !consoSheet) {
    SpreadsheetApp.getUi().alert("Erreur : Feuille 'Ventes_responses' ou 'Consolidation' introuvable.");
    return;
  }
  
  const data = ventesSheet.getDataRange().getValues();
  if (data.length < 2) {
    SpreadsheetApp.getUi().alert("Aucune donnée à consolider.");
    return;
  }
  
  const headers = data[0];
  const headerMap = {};
  headers.forEach((header, index) => {
    headerMap[header.trim()] = index;
  });
  
  const requiredColumns = [
    'ID_vente', 'Horodateur', 'Vendeur', 'Nom du lot', 'Quantité',
    'Montant', 'Devise', 'Mode de paiement', 'Date vente', 'Date paiement',
    'Nom Client', 'ClientID', 'Entrepôt'
  ];
  const missingColumns = requiredColumns.filter(col => !(col in headerMap));
  
  if (missingColumns.length) {
    SpreadsheetApp.getUi().alert('Colonnes manquantes dans Ventes_responses : ' + missingColumns.join(', '));
    return;
  }
  
  // Garde les lignes existantes de DepotVente_responses
  const existingData = consoSheet.getLastRow() > 1 
    ? consoSheet.getRange(2, 1, consoSheet.getLastRow() - 1, 19).getValues()
    : [];
  const depotRows = existingData.filter(row => cleanString_(row[17]) === 'DepotVente_responses');
  
  // Nettoie Consolidation
  if (consoSheet.getLastRow() > 1) {
    consoSheet.getRange(2, 1, consoSheet.getLastRow() - 1, consoSheet.getLastColumn()).clearContent();
  }
  
  const rows = [];
  const seenSaleIds = new Set();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const saleId = row[headerMap['ID_vente']];
    
    if (!saleId || seenSaleIds.has(saleId)) continue;
    seenSaleIds.add(saleId);
    
    const quantity = parseNumber_(row[headerMap['Quantité']]);
    const amount = parseNumber_(row[headerMap['Montant']]);
    const unitPrice = quantity > 0 ? amount / quantity : 0;
    
    const productName = row[headerMap['Nom du lot']];
    const entrepot = row[headerMap['Entrepôt']];
    
    const consoRow = [
      saleId,
      row[headerMap['Horodateur']],
      row[headerMap['Vendeur']],
      row[headerMap['Vendeur']],
      '',
      '',
      productName,
      quantity,
      unitPrice,
      row[headerMap['Devise']],
      amount,
      row[headerMap['Mode de paiement']],
      row[headerMap['Date vente']],
      row[headerMap['Date paiement']],
      row[headerMap['Nom Client']],
      row[headerMap['ClientID']],
      entrepot,
      'Ventes_responses',
      ''
    ];
    
    rows.push(consoRow);
  }
  
  // Ajoute les lignes de Ventes_responses
  if (rows.length > 0) {
    consoSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  // Réajoute les lignes de DepotVente_responses
  if (depotRows.length > 0) {
    const startRow = consoSheet.getLastRow() + 1;
    consoSheet.getRange(startRow, 1, depotRows.length, depotRows[0].length).setValues(depotRows);
  }
  
  const message = `Consolidation mise à jour : ${rows.length} ventes directes + ${depotRows.length} ventes dépôt`;
  SpreadsheetApp.getActive().toast(message, 'KEPY', 5);
  Logger.log(`✅ ${message}`);
}

/**
 * 🆕 Synchronise TOUTES les ventes vers Consolidation (Ventes + DepotVente)
 * À utiliser pour une reconstruction complète
 */
function syncAllToConsolidation_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const consoSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.CONSOLIDATION);
  
  if (!consoSheet) {
    SpreadsheetApp.getUi().alert("Erreur : Feuille 'Consolidation' introuvable.");
    return;
  }
  
  // 1. Nettoie Consolidation (garde les headers)
  ensureConsolidationHeaders_();
  if (consoSheet.getLastRow() > 1) {
    consoSheet.getRange(2, 1, consoSheet.getLastRow() - 1, consoSheet.getLastColumn()).clearContent();
  }
  
  const allRows = [];
  const seenIds = new Set();
  
  // 2. Charge les ventes depuis Ventes_responses
  const ventesRows = loadVentesForConsolidation_(seenIds);
  allRows.push(...ventesRows);
  Logger.log(`📊 ${ventesRows.length} ventes chargées depuis Ventes_responses`);
  
  // 3. Charge les ventes depuis DepotVente_responses
  const depotRows = loadDepotVenteForConsolidation_(seenIds);
  allRows.push(...depotRows);
  Logger.log(`📊 ${depotRows.length} ventes chargées depuis DepotVente_responses`);
  
  // 4. Écrit tout dans Consolidation
  if (allRows.length > 0) {
    consoSheet.getRange(2, 1, allRows.length, allRows[0].length).setValues(allRows);
  }
  
  const message = `Consolidation complète : ${ventesRows.length} ventes directes + ${depotRows.length} ventes dépôt = ${allRows.length} total`;
  SpreadsheetApp.getUi().alert(message);
  Logger.log(`✅ ${message}`);
}

/**
 * Charge les ventes depuis Ventes_responses pour la consolidation
 * @private
 */
function loadVentesForConsolidation_(seenIds) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ventesSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.VENTES);
  
  if (!ventesSheet || ventesSheet.getLastRow() < 2) return [];
  
  const data = ventesSheet.getDataRange().getValues();
  const headers = data[0];
  const headerMap = {};
  headers.forEach((h, i) => { headerMap[h.trim()] = i; });
  
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const saleId = cleanString_(row[headerMap['ID_vente']]);
    
    if (!saleId || seenIds.has(saleId)) continue;
    seenIds.add(saleId);
    
    const vendorName = cleanString_(row[headerMap['Vendeur']]);
    const vendorId = getVendorIdFromName_(vendorName);
    
    const vendorIndex = indexVendeurs_();
    const vendorInfo = vendorIndex.byId[vendorId] || {};
    const managerId = vendorInfo.ManagerID || '';
    const teamRoot = findRoot_(vendorId);
    
    const quantity = parseNumber_(row[headerMap['Quantité']]);
    const amount = parseNumber_(row[headerMap['Montant']]);
    const unitPrice = quantity > 0 ? amount / quantity : 0;
    
    rows.push([
      saleId,
      row[headerMap['Horodateur']],
      vendorId,
      vendorName,
      managerId,
      teamRoot,
      row[headerMap['Nom du lot']],
      quantity,
      unitPrice,
      // row[headerMap['Devise']] || 'XAF',
      'XAF', // Devise fixée
      amount,
      row[headerMap['Mode de paiement']],
      row[headerMap['Date vente']],
      row[headerMap['Date paiement']],
      row[headerMap['Nom Client']] || row[headerMap['Client_final']] || '',
      row[headerMap['ClientID']] || '',
      row[headerMap['Entrepôt']] || row[headerMap['Entrepot']] || '',
      'Ventes_responses',
      ''
    ]);
  }
  
  return rows;
}

/**
 * 🆕 Charge les ventes depuis DepotVente_responses pour la consolidation
 * Ne charge que les lignes "Suivi fin de mois" avec des ventes > 0
 * @private
 */
function loadDepotVenteForConsolidation_(seenIds) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const depotSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.DEPOT_VENTE);
  
  if (!depotSheet || depotSheet.getLastRow() < 2) return [];
  
  const data = depotSheet.getDataRange().getValues();
  const headers = data[0];
  const headerMap = {};
  headers.forEach((h, i) => { headerMap[h.trim()] = i; });
  
  const rows = [];
  
  // Colonnes possibles selon le formulaire
  const getCol = (names) => {
    for (const name of names) {
      if (headerMap[name] !== undefined) return headerMap[name];
    }
    return -1;
  };
  
  const colOperationType = getCol(["Type d'opération", "Type d'opération", "Type d'operation"]);
  const colIdOperation = getCol(['ID_operation']);
  const colHorodateur = getCol(['Horodateur']);
  const colVendeur = getCol(['Vendeur']);
  const colClient = getCol(['Nom Client']);
  const colLot = getCol(['Nom du lot']);
  const colEntrepot = getCol(['Entrepôt', 'Entrepot']);
  const colQuantiteDeposee = getCol(['Quantité déposée (boîtes)']);
  const colStockRestant = getCol(['Stock restant en rayon (boîtes)']);
  const colMontantPaye = getCol(['Montant payé (Fcfa)']);
  const colModePaiement = getCol(['Mode de paiement']);
  const colDateVisite = getCol(['Date de visite']);
  const colDatePaiement = getCol(['Date du paiement (si paiement effectué)']);
  const colQuantiteVendue = getCol(['Quantite_vendue_calc']);
  const colClientID = getCol(['ClientID']);
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    // Ne traite que "Suivi fin de mois"
    const operationType = cleanString_(colOperationType >= 0 ? row[colOperationType] : '');
    if (operationType !== 'Suivi fin de mois') continue;
    
    // Récupère l'ID ou en génère un
    let depotId = cleanString_(colIdOperation >= 0 ? row[colIdOperation] : '');
    if (!depotId) {
      depotId = `DEPOT-REBUILD-${i}`;
    }
    
    if (seenIds.has(depotId)) continue;
    seenIds.add(depotId);
    
    // Calcul de la quantité vendue
    let quantitySold = 0;
    if (colQuantiteVendue >= 0 && row[colQuantiteVendue]) {
      quantitySold = Number(row[colQuantiteVendue]) || 0;
    } else {
      // Recalcul si pas de colonne calculée
      const stockRemaining = Number(colStockRestant >= 0 ? row[colStockRestant] : 0) || 0;
      const quantityDeposited = Number(colQuantiteDeposee >= 0 ? row[colQuantiteDeposee] : 0) || 0;
      
      // On ne peut pas calculer exactement sans le stock avant, donc on skip
      // sauf si quantite_vendue_calc existe
      Logger.log(`⚠️ Ligne ${i}: Pas de Quantite_vendue_calc, impossible de recalculer`);
      continue;
    }
    
    if (quantitySold <= 0) continue;
    
    // Données vendeur
    const vendorName = cleanString_(colVendeur >= 0 ? row[colVendeur] : '');
    const vendorId = getVendorIdFromName_(vendorName);
    const vendorIndex = indexVendeurs_();
    const vendorInfo = vendorIndex.byId[vendorId] || {};
    const managerId = vendorInfo.ManagerID || '';
    const teamRoot = findRoot_(vendorId);
    
    // Données produit
    const lotLabel = cleanString_(colLot >= 0 ? row[colLot] : '');
    const unitPrice = getPriceFromCatalogue_(lotLabel);
    const amountPaid = parseNumber_(colMontantPaye >= 0 ? row[colMontantPaye] : 0);
    const calculatedAmount = quantitySold * unitPrice;
    const finalAmount = amountPaid > 0 ? amountPaid : calculatedAmount;
    
    // Données client
    const clientName = cleanString_(colClient >= 0 ? row[colClient] : '');
    const clientId = cleanString_(colClientID >= 0 ? row[colClientID] : '');
    
    rows.push([
      depotId,
      colHorodateur >= 0 ? row[colHorodateur] : '',
      vendorId,
      vendorName,
      managerId,
      teamRoot,
      lotLabel,
      quantitySold,
      unitPrice,
      'XAF',
      finalAmount,
      cleanString_(colModePaiement >= 0 ? row[colModePaiement] : ''),
      colDateVisite >= 0 ? row[colDateVisite] : '',
      colDatePaiement >= 0 ? row[colDatePaiement] : '',
      clientName,
      clientId,
      cleanString_(colEntrepot >= 0 ? row[colEntrepot] : '') || clientName,
      'DepotVente_responses',
      ''
    ]);
  }
  
  return rows;
}