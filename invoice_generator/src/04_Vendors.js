// ============================================================================
// KEPY - GESTION VENDEURS
// ============================================================================

/**
 * Indexe tous les vendeurs actifs
 */
function indexVendeurs_() {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.VENDEURS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  
  const colIndex = key => headers.indexOf(key);
  const byId = {};
  const children = {};
  
  rows.forEach(row => {
    const vendorId = cleanString_(row[colIndex('VendorID')]);
    const nom = cleanString_(row[colIndex('Nom')]);
    const managerId = cleanString_(row[colIndex('ManagerID')]);
    const role = cleanString_(row[colIndex('Role')]);
    const actif = String(row[colIndex('Actif')]).toUpperCase() !== 'FALSE';
    const tokenCol = colIndex('Token');
    const token = tokenCol > -1 ? cleanString_(row[tokenCol]) : '';
    
    if (!vendorId || !actif) return;
    
    byId[vendorId] = { VendorID: vendorId, Nom: nom, ManagerID: managerId, Role: role, Token: token };
    
    if (!children[managerId]) children[managerId] = [];
    children[managerId].push(vendorId);
  });
  
  return { byId, children };
}

/**
 * Récupère toute l'équipe sous un vendeur/manager
 */
function getTeam_(rootVendorId) {
  const index = indexVendeurs_();
  const teamSet = new Set([rootVendorId]);
  const stack = [rootVendorId];
  
  while (stack.length) {
    const current = stack.pop();
    const subordinates = index.children[current] || [];
    subordinates.forEach(childId => {
      if (!teamSet.has(childId)) {
        teamSet.add(childId);
        stack.push(childId);
      }
    });
  }
  
  return Array.from(teamSet);
}

/**
 * Trouve le vendeur racine (remonte la hiérarchie)
 */
function findRoot_(vendorId) {
  const index = indexVendeurs_().byId;
  let current = vendorId;
  let guard = 0;
  
  while (guard++ < 100) {
    const vendor = index[current];
    if (!vendor || !vendor.ManagerID) return current;
    current = vendor.ManagerID;
  }
  
  return vendorId;
}

/**
 * Récupère un vendeur par son token
 */
function getVendorByToken_(token) {
  if (!token) return null;
  const index = indexVendeurs_().byId;
  
  for (const vendorId in index) {
    const vendor = index[vendorId];
    if (vendor.Token && vendor.Token === token) return vendor;
  }
  
  return null;
}

/**
 * Récupère l'ID vendeur depuis son nom
 */
function getVendorIdFromName_(vendorName) {
  try {
    const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.VENDEURS);
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
    
    for (let i = 0; i < data.length; i++) {
      const name = cleanString_(data[i][1]);
      if (name.toUpperCase() === cleanString_(vendorName).toUpperCase()) {
        return cleanString_(data[i][0]);
      }
    }
  } catch (e) {
    Logger.log('getVendorIdFromName_ error: ' + e);
  }
  
  return cleanString_(vendorName) || KEPY_CONFIG.STOCK.DEFAULT_VENDOR_ID;
}

/**
 * Assure que chaque vendeur a un token unique
 */
function ensureVendorTokens_() {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.VENDEURS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  
  const colIndex = key => headers.indexOf(key);
  
  if (colIndex('Token') === -1) {
    sheet.getRange(1, headers.length + 1).setValue('Token');
    headers.push('Token');
  }
  if (colIndex('PortalURL') === -1) {
    sheet.getRange(1, headers.length + 1).setValue('PortalURL');
    headers.push('PortalURL');
  }
  
  rows.forEach((row, index) => {
    const tokenCol = colIndex('Token');
    if (!cleanString_(row[tokenCol])) {
      const newToken = Utilities.getUuid();
      sheet.getRange(index + 2, tokenCol + 1).setValue(newToken);
    }
  });
}



/**
 * Récupère l'email d'un vendeur à partir de la feuille 'Vendeurs'.
 * @param {string} vendorId L'ID du vendeur (V001, V002, etc.).
 * @returns {string} L'adresse e-mail du vendeur, ou une chaîne vide.
 */
function getVendorEmail(vendorId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const vendorSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.VENDEURS);
  
  if (!vendorSheet || !vendorId) return '';
  
  const data = vendorSheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('VendorID');
  const emailIndex = headers.indexOf('Email'); // Colonne H dans votre feuille Vendeurs

  if (idIndex === -1 || emailIndex === -1) {
    Logger.log("Erreur: Colonnes VendorID ou Email manquantes dans la feuille Vendeurs.");
    return '';
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] === vendorId) {
      return data[i][emailIndex];
    }
  }
  return '';
}

