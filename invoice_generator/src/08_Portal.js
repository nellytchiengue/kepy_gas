/**
 * @file 08_Portal.gs
 * @description Fonctions côté serveur pour le portail web (WebApp).
 */

// ============================================================================
// KEPY - PORTAIL WEB & QR CODES
// ============================================================================

/**
 * Génère les URLs du portail pour chaque vendeur
 */
function syncPortalUrls_(webAppBaseUrl) {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.VENDEURS);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  
  const colIndex = key => headers.indexOf(key);
  const tokenCol = colIndex('Token');
  const urlCol = colIndex('PortalURL');
  
  rows.forEach((row, index) => {
    const token = cleanString_(row[tokenCol]);
    if (!token) return;
    
    const portalUrl = `${webAppBaseUrl}?t=${encodeURIComponent(token)}`;
    sheet.getRange(index + 2, urlCol + 1).setValue(portalUrl);
  });
}

/**
 * Parse un lien prérempli complet
 */
function parsePrefillBase_(fullUrl) {
  const match = String(fullUrl || '').match(/^(.*entry\.\d+=)/);
  return match ? match[1] : '';
}

/**
 * Récupère la base du lien prérempli
 */
function getFormPrefillBase_() {
  const baseUrl = getParam_('FORM_PREFILL_BASE');
  if (!baseUrl) {
    throw new Error('FORM_PREFILL_BASE absent. Va dans Menu KEPY → "Configurer lien prérempli (Form)".');
  }
  return baseUrl;
}

/**
 * S'assure que les colonnes FormURL et FormQR existent
 */
function ensureVendorFormCols_() {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.VENDEURS);
  const headers = sheet.getRange(1, 1, 1, Math.max(5, sheet.getLastColumn())).getValues()[0].map(String);
  
  function ensureColumn(columnName) {
    const idx = headers.indexOf(columnName);
    if (idx === -1) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(columnName);
      headers.push(columnName);
      return nextCol;
    }
    return idx + 1;
  }
  
  return {
    colVendorId: headers.indexOf('VendorID') + 1,
    colName: headers.indexOf('Nom') + 1,
    colRole: headers.indexOf('Role') + 1,
    colFormURL: ensureColumn('FormURL'),
    colFormQR: ensureColumn('FormQR')
  };
}

/**
 * Génère les liens préremplis et QR codes
 */
function generateFormLinksAndQRCodes_() {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.VENDEURS);
  const cols = ensureVendorFormCols_();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('Aucun vendeur dans "Vendeurs".');
    return;
  }
  
  const baseUrl = getFormPrefillBase_();
  const rowCount = lastRow - 1;
  const range = sheet.getRange(2, 1, rowCount, Math.max(cols.colFormQR, cols.colName));
  const values = range.getValues();
  
  const idxName = cols.colName - 1;
  const idxFormURL = cols.colFormURL - 1;
  const idxFormQR = cols.colFormQR - 1;
  
  const outputRows = values.map((row, rowIdx) => {
    const vendorName = cleanString_(row[idxName]);
    if (!vendorName) return row;
    
    const prefillUrl = baseUrl + encodeURIComponent(vendorName);
    row[idxFormURL] = prefillUrl;
    
    const actualRowNumber = rowIdx + 2;
    const formURLColumn = columnNumberToLetter_(cols.colFormURL);
    const cellRef = formURLColumn + actualRowNumber;
    
    row[idxFormQR] = `=IMAGE("https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" & ENCODEURL(${cellRef}))`;
    
    return row;
  });
  
  range.setValues(outputRows);
  SpreadsheetApp.getUi().alert(`✅ Liens & QR codes générés pour ${rowCount} lignes.`);
}

/**
 * Point d'entrée de la Web App (doGet)
 * CETTE FONCTION DOIT RESTER EXACTEMENT AVEC CE NOM
 */
function doGet(e) {
  const token = cleanString_((e && e.parameter && e.parameter.t) || '');
  const vendor = getVendorByToken_(token);
  
  if (!vendor) {
    return HtmlService.createHtmlOutput('<p>Lien invalide</p>');
  }
  
  const scopeIds = (cleanString_(vendor.Role).toUpperCase() === 'REVENDEUR') 
    ? getTeam_(vendor.VendorID) 
    : [vendor.VendorID];
  
  const consoSheet = getSheetByName_(KEPY_CONFIG.SHEETS.CONSOLIDATION);
  const lastRow = consoSheet.getLastRow();
  
  if (lastRow < 2) {
    const emptyTemplate = HtmlService.createHtmlOutput('<p>Aucune donnée disponible.</p>');
    return emptyTemplate.setTitle('KEPY – Mon activité');
  }
  
  const values = consoSheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const rows = values.slice(1);
  
  function getColIndex(name) {
    const idx = headers.indexOf(name);
    if (idx === -1) throw new Error(`Colonne manquante dans Consolidation: ${name}`);
    return idx;
  }
  
  const colMap = {
    SaleID: getColIndex('SaleID'),
    Timestamp: getColIndex('Timestamp'),
    VendorID: getColIndex('VendorID'),
    VendorNom: getColIndex('VendorNom'),
    Produit: getColIndex('Produit'),
    Quantite: getColIndex('Quantite'),
    PU: getColIndex('PU'),
    Devise: getColIndex('Devise'),
    Montant: getColIndex('Montant'),
    ModePaiement: getColIndex('ModePaiement'),
    DateVente: getColIndex('DateVente'),
    Client: getColIndex('Client'),
    Entrepot: getColIndex('Entrepot')
  };
  
  const searchQuery = cleanString_((e.parameter && e.parameter.q) || '').toLowerCase();
  const dateFrom = cleanString_((e.parameter && e.parameter.from) || '');
  const dateTo = cleanString_((e.parameter && e.parameter.to) || '');
  
  const filteredData = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    
    const sale = {
      SaleID: row[colMap.SaleID],
      Timestamp: row[colMap.Timestamp],
      VendorID: row[colMap.VendorID],
      VendorNom: row[colMap.VendorNom],
      Produit: row[colMap.Produit],
      Quantite: Number(row[colMap.Quantite]) || 0,
      PU: Number(row[colMap.PU]) || 0,
      Devise: cleanString_(row[colMap.Devise]),
      Montant: Number(row[colMap.Montant]) || 0,
      ModePaiement: cleanString_(row[colMap.ModePaiement]),
      DateVente: row[colMap.DateVente] || '',
      Client: cleanString_(row[colMap.Client]),
      Entrepot: cleanString_(row[colMap.Entrepot])
    };
    
    if (scopeIds.indexOf(String(sale.VendorID)) === -1) continue;
    
    const saleDate = sale.DateVente ? formatDate_(sale.DateVente) : formatDate_(sale.Timestamp);
    if (dateFrom && saleDate && saleDate < dateFrom) continue;
    if (dateTo && saleDate && saleDate > dateTo) continue;
    
    if (searchQuery) {
      const searchableText = [
        sale.Produit,
        sale.Client,
        sale.VendorNom,
        sale.Entrepot,
        sale.ModePaiement
      ].join(' ').toLowerCase();
      
      if (searchableText.indexOf(searchQuery) === -1) continue;
    }
    
    filteredData.push(sale);
  }
  
  let totalGlobal = 0;
  const totalsByCurrency = {};
  
  filteredData.forEach(sale => {
    totalGlobal += sale.Montant || 0;
    const currency = sale.Devise || '';
    totalsByCurrency[currency] = (totalsByCurrency[currency] || 0) + (sale.Montant || 0);
  });
  
  filteredData.sort((a, b) => {
    const dateA = toDateSafe_(a.DateVente || a.Timestamp);
    const dateB = toDateSafe_(b.DateVente || b.Timestamp);
    return dateB - dateA;
  });
  
  const template = HtmlService.createTemplateFromFile('portal');
  template.data = {
    vendor: vendor,
    rows: filteredData,
    total: totalGlobal,
    totalsByDevise: totalsByCurrency,
    q: searchQuery,
    from: dateFrom,
    to: dateTo
  };
  
  return template.evaluate()
    .setTitle('KEPY – Mon activité')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

