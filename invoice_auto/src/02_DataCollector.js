/**
 * @file 02_DataCollector.js
 * @description Collecte et manipulation des données du Google Sheet
 * @version 1.0
 * @date 2025-12-11
 */

// ============================================================================
// RÉCUPÉRATION DES DONNÉES DE FACTURE
// ============================================================================

/**
 * Récupère les données d'une facture par son ID
 * @param {string} invoiceId - L'ID unique de la facture
 * @returns {Object|null} Objet contenant toutes les données de la facture ou null si non trouvé
 */
function getInvoiceDataById(invoiceId) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const facturesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.FACTURES);

    if (!facturesSheet) {
      logError('getInvoiceDataById', 'Feuille Factures introuvable');
      return null;
    }

    const data = facturesSheet.getDataRange().getValues();

    // La première ligne contient les en-têtes
    const headers = data[0];

    // Parcourt les lignes pour trouver l'InvoiceID (colonne A)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const currentInvoiceId = String(row[INVOICE_CONFIG.COLUMNS.INVOICE_ID]).trim();

      if (currentInvoiceId === String(invoiceId).trim()) {
        // Construit l'objet de données
        return {
          invoiceId: currentInvoiceId,
          date: row[INVOICE_CONFIG.COLUMNS.DATE],
          clientNom: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_NOM]),
          clientEmail: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_EMAIL]),
          clientTel: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_TEL]),
          clientAdresse: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_ADRESSE]),
          designation: cleanString(row[INVOICE_CONFIG.COLUMNS.DESIGNATION]),
          quantite: Number(row[INVOICE_CONFIG.COLUMNS.QUANTITE]) || 1,
          prixUnitaire: Number(row[INVOICE_CONFIG.COLUMNS.PRIX_UNITAIRE]) || 0,
          montantTotal: Number(row[INVOICE_CONFIG.COLUMNS.MONTANT_TOTAL]) || 0,
          statut: String(row[INVOICE_CONFIG.COLUMNS.STATUT]).trim(),
          urlFacture: String(row[INVOICE_CONFIG.COLUMNS.URL_FACTURE] || '').trim(),
          rowIndex: i + 1 // Index de la ligne (1-based pour Google Sheets)
        };
      }
    }

    logError('getInvoiceDataById', `InvoiceID ${invoiceId} non trouvé`);
    return null;

  } catch (error) {
    logError('getInvoiceDataById', `Erreur lors de la récupération des données`, error);
    return null;
  }
}

/**
 * Récupère toutes les factures avec un statut spécifique
 * @param {string} statut - Le statut à rechercher (ex: "Brouillon")
 * @returns {Array} Tableau d'objets contenant les données des factures
 */
function getInvoicesByStatus(statut) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const facturesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.FACTURES);

    if (!facturesSheet) {
      logError('getInvoicesByStatus', 'Feuille Factures introuvable');
      return [];
    }

    const data = facturesSheet.getDataRange().getValues();
    const headers = data[0];
    const invoices = [];

    // Parcourt toutes les lignes (sauf l'en-tête)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const currentStatut = String(row[INVOICE_CONFIG.COLUMNS.STATUT]).trim();

      if (currentStatut === statut) {
        const invoiceData = {
          invoiceId: String(row[INVOICE_CONFIG.COLUMNS.INVOICE_ID]).trim(),
          date: row[INVOICE_CONFIG.COLUMNS.DATE],
          clientNom: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_NOM]),
          clientEmail: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_EMAIL]),
          clientTel: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_TEL]),
          clientAdresse: cleanString(row[INVOICE_CONFIG.COLUMNS.CLIENT_ADRESSE]),
          designation: cleanString(row[INVOICE_CONFIG.COLUMNS.DESIGNATION]),
          quantite: Number(row[INVOICE_CONFIG.COLUMNS.QUANTITE]) || 1,
          prixUnitaire: Number(row[INVOICE_CONFIG.COLUMNS.PRIX_UNITAIRE]) || 0,
          montantTotal: Number(row[INVOICE_CONFIG.COLUMNS.MONTANT_TOTAL]) || 0,
          statut: currentStatut,
          urlFacture: String(row[INVOICE_CONFIG.COLUMNS.URL_FACTURE] || '').trim(),
          rowIndex: i + 1
        };

        invoices.push(invoiceData);
      }
    }

    logSuccess('getInvoicesByStatus', `${invoices.length} facture(s) avec statut "${statut}" trouvée(s)`);
    return invoices;

  } catch (error) {
    logError('getInvoicesByStatus', `Erreur lors de la récupération des factures`, error);
    return [];
  }
}

/**
 * Récupère toutes les factures en brouillon (prêtes à être générées)
 * @returns {Array} Tableau des factures avec statut "Brouillon"
 */
function getPendingInvoices() {
  return getInvoicesByStatus(INVOICE_CONFIG.STATUTS.BROUILLON);
}

// ============================================================================
// MISE À JOUR DES DONNÉES
// ============================================================================

/**
 * Met à jour le statut d'une facture et optionnellement l'URL du PDF
 * @param {string} invoiceId - L'ID de la facture à mettre à jour
 * @param {string} newStatus - Le nouveau statut
 * @param {string} pdfUrl - L'URL du PDF généré (optionnel)
 * @returns {boolean} true si la mise à jour a réussi
 */
function updateInvoiceStatus(invoiceId, newStatus, pdfUrl = null) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const facturesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.FACTURES);

    if (!facturesSheet) {
      logError('updateInvoiceStatus', 'Feuille Factures introuvable');
      return false;
    }

    const data = facturesSheet.getDataRange().getValues();

    // Cherche la ligne correspondant à l'InvoiceID
    for (let i = 1; i < data.length; i++) {
      const currentInvoiceId = String(data[i][INVOICE_CONFIG.COLUMNS.INVOICE_ID]).trim();

      if (currentInvoiceId === String(invoiceId).trim()) {
        const rowNumber = i + 1;

        // Met à jour le statut (colonne K)
        const statusCell = facturesSheet.getRange(rowNumber, INVOICE_CONFIG.COLUMNS.STATUT + 1);
        statusCell.setValue(newStatus);

        // Met à jour l'URL si fournie (colonne L)
        if (pdfUrl) {
          const urlCell = facturesSheet.getRange(rowNumber, INVOICE_CONFIG.COLUMNS.URL_FACTURE + 1);
          urlCell.setValue(pdfUrl);
        }

        logSuccess('updateInvoiceStatus', `Facture ${invoiceId} mise à jour → ${newStatus}`);
        return true;
      }
    }

    logError('updateInvoiceStatus', `InvoiceID ${invoiceId} non trouvé`);
    return false;

  } catch (error) {
    logError('updateInvoiceStatus', `Erreur lors de la mise à jour`, error);
    return false;
  }
}

/**
 * Marque une facture comme générée
 * @param {string} invoiceId - L'ID de la facture
 * @param {string} pdfUrl - L'URL du PDF généré
 * @returns {boolean} true si la mise à jour a réussi
 */
function markInvoiceAsGenerated(invoiceId, pdfUrl) {
  return updateInvoiceStatus(invoiceId, INVOICE_CONFIG.STATUTS.GENEREE, pdfUrl);
}

/**
 * Marque une facture comme envoyée
 * @param {string} invoiceId - L'ID de la facture
 * @returns {boolean} true si la mise à jour a réussi
 */
function markInvoiceAsSent(invoiceId) {
  return updateInvoiceStatus(invoiceId, INVOICE_CONFIG.STATUTS.ENVOYEE);
}

// ============================================================================
// VALIDATION DES DONNÉES
// ============================================================================

/**
 * Valide qu'une facture contient toutes les données obligatoires
 * @param {Object} invoiceData - Les données de la facture
 * @returns {Object} {isValid: boolean, errors: Array}
 */
function validateInvoiceData(invoiceData) {
  const errors = [];

  // Validation InvoiceID
  if (isEmpty(invoiceData.invoiceId)) {
    errors.push('InvoiceID manquant');
  }

  // Validation Client
  if (isEmpty(invoiceData.clientNom)) {
    errors.push('Nom du client manquant');
  }

  // Validation Produit/Service
  if (isEmpty(invoiceData.designation)) {
    errors.push('Désignation manquante');
  }

  // Validation Quantité
  if (!invoiceData.quantite || invoiceData.quantite <= 0) {
    errors.push('Quantité invalide');
  }

  // Validation Prix Unitaire
  if (!validateAmount(invoiceData.prixUnitaire)) {
    errors.push('Prix unitaire invalide');
  }

  // Validation Montant Total
  if (!validateAmount(invoiceData.montantTotal)) {
    errors.push('Montant total invalide');
  }

  // Validation cohérence Montant
  const expectedTotal = invoiceData.quantite * invoiceData.prixUnitaire;
  if (Math.abs(invoiceData.montantTotal - expectedTotal) > 0.01) {
    errors.push(`Incohérence: Montant total (${invoiceData.montantTotal}) ≠ Quantité × Prix Unitaire (${expectedTotal})`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// ============================================================================
// STATISTIQUES ET RAPPORTS
// ============================================================================

/**
 * Compte le nombre de factures par statut
 * @returns {Object} Objet avec le nombre de factures par statut
 */
function getInvoiceStatistics() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const facturesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.FACTURES);

    if (!facturesSheet) {
      return null;
    }

    const data = facturesSheet.getDataRange().getValues();
    const stats = {
      total: data.length - 1, // Exclut l'en-tête
      brouillon: 0,
      generee: 0,
      envoyee: 0
    };

    for (let i = 1; i < data.length; i++) {
      const statut = String(data[i][INVOICE_CONFIG.COLUMNS.STATUT]).trim();

      if (statut === INVOICE_CONFIG.STATUTS.BROUILLON) stats.brouillon++;
      else if (statut === INVOICE_CONFIG.STATUTS.GENEREE) stats.generee++;
      else if (statut === INVOICE_CONFIG.STATUTS.ENVOYEE) stats.envoyee++;
    }

    return stats;

  } catch (error) {
    logError('getInvoiceStatistics', 'Erreur lors du calcul des statistiques', error);
    return null;
  }
}