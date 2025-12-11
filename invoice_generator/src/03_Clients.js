// ============================================================================
// KEPY - GESTION CLIENTS
// ============================================================================

/**
 * S'assure que les colonnes Clients existent
 */
function ensureClientsHeaders_(sheet) {
  const headers = sheet.getRange(1, 1, 1, Math.max(5, sheet.getLastColumn())).getValues()[0].map(String);
  
  function ensureColumn(headerName) {
    const idx = headers.indexOf(headerName);
    if (idx === -1) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue(headerName);
      headers.push(headerName);
      return nextCol;
    }
    return idx + 1;
  }
  
  const config = KEPY_CONFIG.CLIENTS.HEADERS;
  return {
    colId: ensureColumn(config.id),
    colName: ensureColumn(config.name),
    colPhone: ensureColumn(config.phone),
    colEmail: ensureColumn(config.email),
    colCreated: ensureColumn(config.created)
  };
}

/**
 * Insère ou met à jour un client (upsert)
 */
function upsertClient_(name, phone, email) {
  name = cleanString_(name);
  phone = cleanString_(phone);
  email = cleanString_(email);
  
  if (!name) return { id: '', inserted: false, updated: false };
  
  const sheet = getSheetByName_(KEPY_CONFIG.SHEETS.CLIENTS);
  const cols = ensureClientsHeaders_(sheet);
  const lastRow = sheet.getLastRow();
  const rowCount = Math.max(0, lastRow - 1);
  
  // Recherche client existant
  if (rowCount > 0) {
    const values = sheet.getRange(2, 1, rowCount, Math.max(cols.colEmail, cols.colCreated)).getValues();
    
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const existingId = cleanString_(row[cols.colId - 1]);
      const existingName = cleanString_(row[cols.colName - 1]);
      
      if (existingName && existingName.toLowerCase() === name.toLowerCase()) {
        // Client trouvé : backfill téléphone/email si vides
        let updated = false;
        
        if (!cleanString_(row[cols.colPhone - 1]) && phone) {
          sheet.getRange(i + 2, cols.colPhone).setValue(phone);
          updated = true;
        }
        if (!cleanString_(row[cols.colEmail - 1]) && email) {
          sheet.getRange(i + 2, cols.colEmail).setValue(email);
          updated = true;
        }
        
        return { id: existingId, inserted: false, updated: updated };
      }
    }
  }
  
  // Insertion nouveau client
  const newId = Utilities.getUuid();
  const newRow = [];
  newRow[cols.colId - 1] = newId;
  newRow[cols.colName - 1] = name;
  newRow[cols.colPhone - 1] = phone;
  newRow[cols.colEmail - 1] = email;
  newRow[cols.colCreated - 1] = new Date();
  
  for (let k = 0; k < Math.max(cols.colCreated, 5); k++) {
    if (typeof newRow[k] === 'undefined') newRow[k] = '';
  }
  
  sheet.appendRow(newRow);
  return { id: newId, inserted: true, updated: false };
}

