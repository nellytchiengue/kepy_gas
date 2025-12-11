// ============================================================================
// KEPY - ACCÈS BASE DE DONNÉES (SHEETS)
// ============================================================================
// Gestion des feuilles et colonnes
// ============================================================================

/**
 * Récupère une feuille par son nom
 */
function getSheetByName_(sheetName) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Feuille manquante : "${sheetName}"`);
  }
  return sheet;
}

/**
 * Récupère tous les paramètres depuis Parametres
 */
function getParams_() {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.PARAMETRES);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};
  
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const params = {};
  data.forEach(row => {
    const key = cleanString_(row[0]);
    const value = cleanString_(row[1]);
    if (key) params[key] = value;
  });
  return params;
}

/**
 * Récupère un paramètre par sa clé
 */
function getParam_(key) {
  const params = getParams_();
  return params[key] || '';
}

/**
 * Définit ou met à jour un paramètre
 */
function setParam_(key, value) {
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.PARAMETRES);
  const lastRow = sheet.getLastRow();
  const data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 2).getValues() : [];
  
  let rowIndex = 0;
  for (let i = 0; i < data.length; i++) {
    if (cleanString_(data[i][0]).toUpperCase() === cleanString_(key).toUpperCase()) {
      rowIndex = i + 2;
      break;
    }
  }
  
  if (rowIndex) {
    sheet.getRange(rowIndex, 2).setValue(value);
  } else {
    sheet.appendRow([key, value]);
  }
}

/**
 * S'assure qu'une colonne existe, la crée sinon
 */
function getOrCreateHeaderCol_(sheet, headerName) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const index = headers.indexOf(headerName);
  
  if (index === -1) {
    const nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue(headerName);
    return nextCol;
  }
  return index + 1;
}

/**
 * Récupère l'index d'une colonne par son nom
 */
function getColIndex_(headers, columnName) {
  const idx = headers.indexOf(columnName);
  if (idx === -1) {
    throw new Error(`Colonne "${columnName}" introuvable`);
  }
  return idx;
}

