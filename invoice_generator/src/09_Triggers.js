/**
 * @file 09_Triggers.gs
 * @description Contient les fonctions déclenchées par des événements (onOpen, onEdit, etc.).
 * 
 * VERSION MISE À JOUR : Intègre la consolidation des ventes depuis le formulaire Dépôt-Vente
 */


// ============================================================================
// KEPY - TRIGGERS
// ============================================================================
// ATTENTION : Ces fonctions DOIVENT garder leurs noms exacts
// car elles sont reliées aux triggers Google Apps Script
// ============================================================================

/**
 * Trigger principal : soumission du formulaire de vente
 * NE PAS RENOMMER CETTE FONCTION
 */
function onFormSubmit(e) {
  // Sécurité : traite uniquement Ventes_responses
  if (e && e.range) {
    const eventSheet = e.range.getSheet();
    if (eventSheet.getName() !== KEPY_CONFIG.SHEETS.VENTES) {
      return;
    }
  }
  
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.VENTES);
  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const rowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const record = {};
  headers.forEach((header, index) => {
    record[header] = rowData[index];
  });
  
  // ====== GESTION CLIENT ======
  const clientFromList = cleanString_(record[KEPY_CONFIG.CLIENTS.QUESTION_LIST_TITLE]);
  const clientFreeText = cleanString_(record[KEPY_CONFIG.CLIENTS.QUESTION_FREE_TITLE]);
  const clientPhone = cleanString_(record[KEPY_CONFIG.CLIENTS.QUESTION_PHONE_TITLE]);
  const clientEmail = cleanString_(record[KEPY_CONFIG.CLIENTS.QUESTION_EMAIL_TITLE]);
  
  const finalClientName = clientFreeText || clientFromList;
  let clientId = '';
  let clientInserted = false;
  
  if (finalClientName) {
    const clientResult = upsertClient_(finalClientName, clientPhone, clientEmail);
    clientId = clientResult.id;
    clientInserted = clientResult.inserted;
    
    if (clientInserted) {
      try {
        syncClientsToForm();
      } catch (err) {
        Logger.log('Erreur sync clients: ' + err);
      }
    }
  }
  
  // Écrit colonnes calculées
  const colClientFinal = getOrCreateHeaderCol_(sheet, 'Client_final');
  const colClientID = getOrCreateHeaderCol_(sheet, 'ClientID');
  const colClientTel = getOrCreateHeaderCol_(sheet, 'Client_tel');
  const colClientEmail = getOrCreateHeaderCol_(sheet, 'Client_email');
  
  sheet.getRange(lastRow, colClientFinal).setValue(finalClientName);
  sheet.getRange(lastRow, colClientID).setValue(clientId);
  sheet.getRange(lastRow, colClientTel).setValue(clientPhone);
  sheet.getRange(lastRow, colClientEmail).setValue(clientEmail);
  
  // ====== TRAITEMENT VENTE ======
  const vendorName = record['Vendeur'];
  const vendorId = getVendorIdFromName_(vendorName);
  const entrepotId = mapEntrepotId_(record['Entrepôt'] || record['Entrepot']);
  
  const sku = mapSKU_(record['Nom du lot']);
  const quantity = parseNumber_(record['Quantité']);
  const amount = parseNumber_(record['Montant']);
  const unitPrice = quantity > 0 ? (amount / quantity) : 0;
  
  // const currency = record['Devise'] || 'XAF';
  const currency = 'XAF'; // Devise fixée à XAF
  const paymentMode = cleanString_(record['Mode de paiement']);
  const saleDate = record['Date vente'] || '';
  const paymentDate = record['Date paiement'] || '';
  
  const saleId = buildSaleId_(vendorId);
  
  // Hiérarchie vendeurs
  const vendorIndex = indexVendeurs_();
  const vendorInfo = vendorIndex.byId[vendorId] || {
    VendorID: vendorId,
    Nom: vendorName,
    ManagerID: '',
    Role: 'VENDEUR'
  };
  const managerId = vendorInfo.ManagerID || '';
  const teamRoot = findRoot_(vendorId);
  
  // Hash anti-doublon
  const rowHash = Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      JSON.stringify([vendorId, record['Nom du lot'], quantity, unitPrice, currency, paymentMode, saleDate, paymentDate, amount])
    )
  );
  
  // ====== MOUVEMENT DE STOCK ======
  if (quantity > 0 && entrepotId && sku) {
    const stockBefore = getCurrentStock_(entrepotId, sku);
    const stockAfter = stockBefore - quantity;
    pushStockMovement_(KEPY_CONFIG.STOCK.MOVEMENT_TYPES.OUT, saleId, entrepotId, sku, quantity, stockAfter);
    
    const params = getParams_();
    const threshold = Number(params['SEUIL_RUPTURE_GLOBAL'] || 0);
    if (stockAfter <= threshold) {
      sendRuptureAlert_(entrepotId, sku, stockAfter);
    }
  }
  
  // ====== RÈGLEMENTS ======
  if (paymentMode) {
    const modes = paymentMode.split(',').map(m => m.trim()).filter(Boolean);
    if (modes.length > 0) {
      const reglSheet = getSheetByName_(KEPY_CONFIG.SHEETS.REGLEMENTS);
      ensureReglementsHeaders_(reglSheet);
      
      const regDate = paymentDate || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      modes.forEach(mode => {
        reglSheet.appendRow([saleId, regDate, mode, amount, '', vendorName]);
      });
    }
  }
  
  // ====== CONSOLIDATION (UPSERT) ======
  const consoRow = [
    saleId,
    getCurrentTimestamp_(),
    vendorId,
    vendorName,
    managerId,
    teamRoot,
    record['Nom du lot'],
    quantity,
    unitPrice,
    currency,
    amount,
    paymentMode,
    saleDate,
    paymentDate,
    finalClientName,
    clientId,
    record['Entrepôt'] || record['Entrepot'] || '',
    'Ventes_responses',
    rowHash
  ];
  
  try {
    const status = upsertConsoBySaleId_(consoRow);
    SpreadsheetApp.getActive().toast(
      (status === 'updated' ? 'Mis à jour: ' : 'Ajouté: ') + saleId,
      'KEPY',
      3
    );
  } catch (err) {
    Logger.log('Erreur upsert Consolidation: ' + err);
  }
  
  // Écrit ID_vente
  const colSaleId = getOrCreateHeaderCol_(sheet, 'ID_vente');
  sheet.getRange(lastRow, colSaleId).setValue(saleId);

  // -----------------------------------------------------------------------------
  // Appel à la génération de facture en utilisant le SaleID nouvellement créé  
  try {
    const factureStatus = generateInvoiceBySaleId_(saleId);
    Logger.log(factureStatus);
  } catch (err) {
    Logger.log('Erreur fatale lors de la génération/envoi de facture: ' + err);
  }
}

/**
 * Trigger : soumission du formulaire Dépôt-vente
 * NE PAS RENOMMER CETTE FONCTION
 * 
 * 🆕 VERSION MISE À JOUR : Alimente Consolidation pour les ventes "Suivi fin de mois"
 */
function onDepotFormSubmit(e) {
  if (!e || !e.range) return;
  
  const sheet = e.range.getSheet();
  if (sheet.getName() !== KEPY_CONFIG.SHEETS.DEPOT_VENTE) return;
  
  const lastRow = sheet.getLastRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const rowData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const record = {};
  headers.forEach((header, index) => {
    record[header] = rowData[index];
  });
  
  // ====== EXTRACTION DES DONNÉES ======
  const vendorName = cleanString_(record['Vendeur']);
  const vendorId = getVendorIdFromName_(vendorName);
  
  const clientName = cleanString_(record['Nom Client']);
  const personnePresente = cleanString_(record['Personne présente en boutique']);
  const dateVisite = record['Date de visite'] || '';
  
  // Gestion des différentes orthographes possibles
  const operationType = cleanString_(
    record["Type d'opération"] ||
    record["Type d'opération"] ||
    record["Type d'operation"] ||
    record["Type d operation"]
  );
  
  const lotLabel = cleanString_(record['Nom du lot']);
  const entrepotLibelle = cleanString_(record['Entrepôt']) || clientName;
  const entrepotId = mapEntrepotId_(entrepotLibelle) || entrepotLibelle;

  const quantityDeposited = Number(record['Quantité déposée (boîtes)']) || 0;
  const stockRemaining = Number(record['Stock restant en rayon (boîtes)']) || 0;
  
  const paymentDone = cleanString_(record['Paiement effectué ?']);
  const amountPaid = parseNumber_(record['Montant payé (Fcfa)']);
  const paymentMode = cleanString_(record['Mode de paiement']);
  const paymentDate = record['Date du paiement (si paiement effectué)'] || '';
  const remarques = cleanString_(record['Remarques visite'] || record['Remarques dépôt'] || '');
  
  const sku = mapSKU_(lotLabel);
  
  // ====== GESTION CLIENT ======
  const clientResult = upsertClient_(clientName, '', '');
  const clientId = clientResult.id || '';
  
  // Génération de l'ID unique pour cette opération
  const depotId = buildDepotId_(clientId);
  
  // Écrire l'ID dans la feuille source
  const colDepotId = getOrCreateHeaderCol_(sheet, 'ID_operation');
  sheet.getRange(lastRow, colDepotId).setValue(depotId);
  
  // ====== HIÉRARCHIE VENDEUR ======
  const vendorIndex = indexVendeurs_();
  const vendorInfo = vendorIndex.byId[vendorId] || {
    VendorID: vendorId,
    Nom: vendorName,
    ManagerID: '',
    Role: 'VENDEUR'
  };
  const managerId = vendorInfo.ManagerID || '';
  const teamRoot = findRoot_(vendorId);
  
  // ====== CAS 1 : DÉPÔT INITIAL ======
  if (operationType === 'Dépôt initial') {
    Logger.log(`📦 Dépôt initial détecté : ${quantityDeposited} ${lotLabel} @ ${entrepotLibelle}`);
    
    if (quantityDeposited > 0 && entrepotId && sku) {
      const stockBefore = getCurrentStock_(entrepotId, sku);
      const stockAfter = stockBefore + quantityDeposited;
      
      pushStockMovement_(
        KEPY_CONFIG.STOCK.MOVEMENT_TYPES.IN, 
        depotId, 
        entrepotId, 
        sku, 
        quantityDeposited, 
        stockAfter
      );
      
      Logger.log(`✅ Stock IN enregistré : +${quantityDeposited} ${sku} @ ${entrepotId} (Stock: ${stockBefore} → ${stockAfter})`);
      
      // Alerte si stock bas après dépôt (rare mais possible)
      const params = getParams_();
      const threshold = Number(params['SEUIL_RUPTURE_GLOBAL'] || 0);
      if (stockAfter <= threshold) {
        sendRuptureAlert_(entrepotId, sku, stockAfter);
      }
    }
    
    SpreadsheetApp.getActive().toast(
      `Dépôt enregistré : +${quantityDeposited} ${lotLabel}`,
      'KEPY - Dépôt',
      3
    );
    return; // Pas de consolidation pour les dépôts initiaux
  }
  
  // ====== CAS 2 : SUIVI FIN DE MOIS (VENTES) ======
  if (operationType === 'Suivi fin de mois') {
    Logger.log(`📊 Suivi fin de mois détecté pour ${clientName}`);
    
    if (!entrepotId || !sku) {
      Logger.log(`⚠️ Données manquantes : entrepotId=${entrepotId}, sku=${sku}`);
      return;
    }
    
    // 1. Calcul des ventes
    const stockBefore = getCurrentStock_(entrepotId, sku);
    
    // Formule : Ventes = Stock_précédent + Dépôt_cette_visite - Stock_restant
    let quantitySold = stockBefore + quantityDeposited - stockRemaining;
    
    // Sécurité : pas de ventes négatives
    if (quantitySold < 0) {
      Logger.log(`⚠️ Calcul ventes négatif (${quantitySold}), forcé à 0. Stock avant: ${stockBefore}, Dépôt: ${quantityDeposited}, Restant: ${stockRemaining}`);
      quantitySold = 0;
    }
    
    Logger.log(`📈 Calcul ventes : ${stockBefore} + ${quantityDeposited} - ${stockRemaining} = ${quantitySold}`);
    
    // 2. Récupérer le prix de vente depuis le Catalogue
    const unitPrice = getPriceFromCatalogue_(lotLabel);
    const calculatedAmount = quantitySold * unitPrice;
    
    // Utiliser le montant payé s'il est fourni, sinon le montant calculé
    const finalAmount = (amountPaid > 0) ? amountPaid : calculatedAmount;
    
    Logger.log(`💰 Prix unitaire: ${unitPrice} XAF, Montant calculé: ${calculatedAmount} XAF, Montant final: ${finalAmount} XAF`);
    
    // 3. Mouvement de stock OUT (si dépôt cette visite, on l'ajoute d'abord)
    let newStockAfter = stockBefore;
    
    // 3a. Si dépôt cette visite → mouvement IN
    if (quantityDeposited > 0) {
      newStockAfter = stockBefore + quantityDeposited;
      pushStockMovement_(
        KEPY_CONFIG.STOCK.MOVEMENT_TYPES.IN, 
        depotId + '-IN', 
        entrepotId, 
        sku, 
        quantityDeposited, 
        newStockAfter
      );
      Logger.log(`✅ Dépôt enregistré : +${quantityDeposited} ${sku} (Stock: ${newStockAfter})`);
    }
    
    // 3b. Mouvement OUT pour les ventes
    if (quantitySold > 0) {
      const stockAfterSale = newStockAfter - quantitySold;
      pushStockMovement_(
        KEPY_CONFIG.STOCK.MOVEMENT_TYPES.OUT, 
        depotId, 
        entrepotId, 
        sku, 
        quantitySold, 
        stockAfterSale
      );
      
      Logger.log(`✅ Ventes enregistrées : -${quantitySold} ${sku} (Stock: ${stockAfterSale})`);
      
      // Alerte rupture
      const params = getParams_();
      const threshold = Number(params['SEUIL_RUPTURE_GLOBAL'] || 0);
      if (stockAfterSale <= threshold) {
        sendRuptureAlert_(entrepotId, sku, stockAfterSale);
      }
    }
    
    // 4. Enregistrement du règlement (si paiement effectué)
    if (paymentDone === 'Oui' && amountPaid > 0 && paymentMode) {
      const reglSheet = getSheetByName_(KEPY_CONFIG.SHEETS.REGLEMENTS);
      ensureReglementsHeaders_(reglSheet);
      
      reglSheet.appendRow([
        getCurrentTimestamp_(),
        depotId,
        clientId,
        'XAF',
        amountPaid,
        paymentMode,
        paymentDate || dateVisite,
        vendorId,
        vendorName,
        personnePresente
      ]);
      
      Logger.log(`💳 Règlement enregistré : ${amountPaid} XAF (${paymentMode})`);
    }
    
    // 5. 🆕 CONSOLIDATION - Ajouter la vente dans Consolidation
    if (quantitySold > 0) {
      // Hash anti-doublon
      const rowHash = Utilities.base64EncodeWebSafe(
        Utilities.computeDigest(
          Utilities.DigestAlgorithm.SHA_256,
          JSON.stringify([
            vendorId, lotLabel, quantitySold, unitPrice, 'XAF', 
            paymentMode, dateVisite, paymentDate, finalAmount, clientName
          ])
        )
      );
      
      const consoRow = [
        depotId,                           // SaleID
        getCurrentTimestamp_(),            // Timestamp
        vendorId,                          // VendorID
        vendorName,                        // VendorNom
        managerId,                         // ManagerID
        teamRoot,                          // TeamRoot
        lotLabel,                          // Produit
        quantitySold,                      // Quantite
        unitPrice,                         // PU
        'XAF',                             // Devise
        finalAmount,                       // Montant
        paymentMode || '',                 // ModePaiement
        dateVisite,                        // DateVente
        paymentDate || '',                 // DatePaiement
        clientName,                        // Client
        clientId,                          // ClientID
        entrepotLibelle,                   // Entrepot
        'DepotVente_responses',            // SourceSheet
        rowHash                            // RowHash
      ];
      
      try {
        const status = upsertConsoBySaleId_(consoRow);
        Logger.log(`✅ Consolidation ${status}: ${depotId} - ${quantitySold} ${lotLabel} @ ${finalAmount} XAF`);
        
        SpreadsheetApp.getActive().toast(
          `Vente consolidée : ${quantitySold} ${lotLabel} (${finalAmount} XAF)`,
          'KEPY - Consolidation',
          4
        );
      } catch (err) {
        Logger.log(`❌ Erreur Consolidation : ${err.message}`);
      }
    } else {
      Logger.log(`ℹ️ Pas de ventes à consolider (quantité = 0)`);
      SpreadsheetApp.getActive().toast(
        `Visite enregistrée (aucune vente)`,
        'KEPY',
        3
      );
    }
    
    // 6. Écrire les colonnes calculées dans DepotVente_responses
    const colQuantiteVendue = getOrCreateHeaderCol_(sheet, 'Quantite_vendue_calc');
    const colMontantCalc = getOrCreateHeaderCol_(sheet, 'Montant_calc');
    const colClientID = getOrCreateHeaderCol_(sheet, 'ClientID');
    
    sheet.getRange(lastRow, colQuantiteVendue).setValue(quantitySold);
    sheet.getRange(lastRow, colMontantCalc).setValue(calculatedAmount);
    sheet.getRange(lastRow, colClientID).setValue(clientId);
  }
}

/**
 * Crée le menu personnalisé KEPY
 * NE PAS RENOMMER CETTE FONCTION (appelée automatiquement à l'ouverture)
 */
function onOpen(e) {
  SpreadsheetApp.getUi()

    .createMenu('KEPY')

    .addItem('Recalculer un stock', 'recalculateStock')
    .addItem('Actualiser Consolidation', 'syncConsolidationFromVentes_')
    //.addItem('Recalculer Suivi_Stock', 'rebuildSuiviStock_')

    //.addSeparator()
    //.addItem('Configurer Portail (coller URL)', 'configurePortal_')
    //.addItem('Mettre à jour URLs Portail', 'refreshPortalUrls_')

    .addSeparator()
    .addItem('Configurer lien prérempli (Form)', 'configureFormPrefillBase_')
    .addItem('Générer QR Codes (Form)', 'generateFormLinksAndQRCodes_')

    .addSeparator()
    .addItem('Sync Vendeurs -> Form', 'syncVendorsToForm')
    .addItem('Sync Lots -> Form', 'syncProductsToForm')
    .addItem('Sync Entrepôts -> Form', 'syncStoreToForm')
    .addItem('Sync Clients -> Form', 'syncClientsToForm')
    .addItem('Sync Paiements -> Form', 'syncPaymentModesToForm')
    // .addItem('Sync Devises -> Form', 'syncCurrenciesToForm')

    .addSeparator()
    .addItem('Générer Facture (Manuelle)', 'generateInvoiceManually')
    
    .addSeparator()
    .addItem('🔄 Resync Consolidation complète', 'syncAllToConsolidation_')
    
    .addToUi();
}

