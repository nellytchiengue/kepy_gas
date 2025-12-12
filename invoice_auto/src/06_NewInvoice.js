/**
 * @file 06_NewInvoice.js
 * @description Ajout de nouvelles factures avec auto-complétion
 * @version 1.0
 */

// ============================================================================
// GESTION DES CLIENTS
// ============================================================================

/**
 * Récupère la liste de tous les clients
 * @returns {Array} Liste des clients avec leurs infos
 */
function getAllClients() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const clientsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.CLIENTS);
    
    if (!clientsSheet) {
      logError('getAllClients', 'Feuille Clients introuvable');
      return [];
    }
    
    const data = clientsSheet.getDataRange().getValues();
    const clients = [];
    
    // Ignorer l'en-tête (ligne 1)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NAME]) {
        clients.push({
          id: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_ID],
          name: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NAME],
          email: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_EMAIL],
          phone: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_PHONE],
          address: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_ADDRESS]
        });
      }
    }
    
    return clients;
  } catch (error) {
    logError('getAllClients', 'Erreur récupération clients', error);
    return [];
  }
}

/**
 * Recherche un client par son nom
 * @param {string} clientName - Nom du client
 * @returns {Object|null} Infos du client ou null
 */
function getClientByName(clientName) {
  const clients = getAllClients();
  return clients.find(c => c.name === clientName) || null;
}

// ============================================================================
// FORMULAIRE D'AJOUT DE FACTURE
// ============================================================================

/**
 * Menu: Ajouter une nouvelle facture
 */
function menuAddNewInvoice() {
  const ui = SpreadsheetApp.getUi();
  const lang = getConfiguredLocale();
  
  // Messages bilingues
  const msg = lang === 'FR' ? {
    TITLE: '➕ Nouvelle Facture',
    SELECT_CLIENT: 'Sélectionnez un client:',
    NO_CLIENTS: 'Aucun client trouvé. Ajoutez des clients dans la feuille "Clients".',
    ENTER_DESCRIPTION: 'Description du produit/service:',
    ENTER_QUANTITY: 'Quantité:',
    ENTER_UNIT_PRICE: 'Prix unitaire:',
    CANCELLED: 'Opération annulée',
    SUCCESS: '✅ Facture créée avec succès!\n\nID: ',
    ERROR: 'Erreur lors de la création',
    INVALID_NUMBER: 'Veuillez entrer un nombre valide'
  } : {
    TITLE: '➕ New Invoice',
    SELECT_CLIENT: 'Select a client:',
    NO_CLIENTS: 'No clients found. Add clients to the "Clients" sheet.',
    ENTER_DESCRIPTION: 'Product/service description:',
    ENTER_QUANTITY: 'Quantity:',
    ENTER_UNIT_PRICE: 'Unit price:',
    CANCELLED: 'Operation cancelled',
    SUCCESS: '✅ Invoice created successfully!\n\nID: ',
    ERROR: 'Error creating invoice',
    INVALID_NUMBER: 'Please enter a valid number'
  };
  
  // 1. Récupérer la liste des clients
  const clients = getAllClients();
  
  if (clients.length === 0) {
    ui.alert(msg.TITLE, msg.NO_CLIENTS, ui.ButtonSet.OK);
    return;
  }
  
  // 2. Afficher la liste des clients pour sélection
  const clientNames = clients.map(c => c.name).join('\n');
  const clientResponse = ui.prompt(
    msg.TITLE,
    msg.SELECT_CLIENT + '\n\n' + clientNames + '\n\nEntrez le nom exact:',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (clientResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert(msg.CANCELLED);
    return;
  }
  
  const selectedClientName = clientResponse.getResponseText().trim();
  const clientInfo = getClientByName(selectedClientName);
  
  if (!clientInfo) {
    ui.alert(msg.ERROR, 'Client "' + selectedClientName + '" non trouvé.', ui.ButtonSet.OK);
    return;
  }
  
  // 3. Demander la description
  const descResponse = ui.prompt(msg.TITLE, msg.ENTER_DESCRIPTION, ui.ButtonSet.OK_CANCEL);
  if (descResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert(msg.CANCELLED);
    return;
  }
  const description = descResponse.getResponseText().trim();
  
  // 4. Demander la quantité
  const qtyResponse = ui.prompt(msg.TITLE, msg.ENTER_QUANTITY, ui.ButtonSet.OK_CANCEL);
  if (qtyResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert(msg.CANCELLED);
    return;
  }
  const quantity = parseInt(qtyResponse.getResponseText().trim());
  if (isNaN(quantity) || quantity <= 0) {
    ui.alert(msg.ERROR, msg.INVALID_NUMBER, ui.ButtonSet.OK);
    return;
  }
  
  // 5. Demander le prix unitaire
  const priceResponse = ui.prompt(msg.TITLE, msg.ENTER_UNIT_PRICE, ui.ButtonSet.OK_CANCEL);
  if (priceResponse.getSelectedButton() !== ui.Button.OK) {
    ui.alert(msg.CANCELLED);
    return;
  }
  const unitPrice = parseFloat(priceResponse.getResponseText().trim());
  if (isNaN(unitPrice) || unitPrice <= 0) {
    ui.alert(msg.ERROR, msg.INVALID_NUMBER, ui.ButtonSet.OK);
    return;
  }
  
  // 6. Créer la facture
  const result = createNewInvoice(clientInfo, description, quantity, unitPrice);
  
  if (result.success) {
    ui.alert(msg.TITLE, msg.SUCCESS + result.invoiceId, ui.ButtonSet.OK);
  } else {
    ui.alert(msg.ERROR, result.message, ui.ButtonSet.OK);
  }
}

/**
 * Crée une nouvelle facture dans la feuille Invoices
 * @param {Object} clientInfo - Infos du client
 * @param {string} description - Description
 * @param {number} quantity - Quantité
 * @param {number} unitPrice - Prix unitaire
 * @returns {Object} Résultat {success, invoiceId, message}
 */
function createNewInvoice(clientInfo, description, quantity, unitPrice) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);
    
    if (!invoicesSheet) {
      return { success: false, message: 'Feuille Invoices introuvable' };
    }
    
    // Générer l'ID automatique
    const invoiceId = generateNextInvoiceId();
    
    // Calculer le montant total
    const totalAmount = quantity * unitPrice;
    
    // Préparer la nouvelle ligne
    const newRow = [
      invoiceId,                    // InvoiceID
      new Date(),                   // InvoiceDate
      clientInfo.name,              // ClientName
      clientInfo.email,             // ClientEmail
      clientInfo.phone,             // ClientPhone
      clientInfo.address,           // ClientAddress
      description,                  // Description
      quantity,                     // Quantity
      unitPrice,                    // UnitPrice
      totalAmount,                  // TotalAmount
      INVOICE_CONFIG.STATUSES.DRAFT, // Status = Draft
      ''                            // PDFUrl (vide)
    ];
    
    // Ajouter la ligne
    invoicesSheet.appendRow(newRow);
    
    logSuccess('createNewInvoice', `Facture ${invoiceId} créée`);
    
    return {
      success: true,
      invoiceId: invoiceId,
      message: 'Facture créée'
    };
    
  } catch (error) {
    logError('createNewInvoice', 'Erreur création facture', error);
    return {
      success: false,
      message: error.message
    };
  }
}