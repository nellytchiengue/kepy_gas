/**
 * @file 03_InvoiceGenerator.js
 * @description Génération automatique de factures PDF à partir d'un template Google Docs
 * @version 1.0
 * @date 2025-12-11
 */

// ============================================================================
// GÉNÉRATION D'UNE FACTURE INDIVIDUELLE
// ============================================================================

/**
 * Génère une facture PDF pour un ID donné
 * @param {string} invoiceId - L'ID de la facture à générer
 * @returns {Object} {success: boolean, message: string, url: string}
 */
function generateInvoiceById(invoiceId) {
  try {
    // 1. RÉCUPÉRATION DES DONNÉES
    const invoiceData = getInvoiceDataById(invoiceId);

    if (!invoiceData) {
      return {
        success: false,
        message: INVOICE_CONFIG.MESSAGES.ERROR_NO_DATA,
        url: null
      };
    }

    // 2. VALIDATION DES DONNÉES
    const validation = validateInvoiceData(invoiceData);
    if (!validation.isValid) {
      const errorMsg = `❌ Données invalides pour ${invoiceId}:\n${validation.errors.join('\n')}`;
      logError('generateInvoiceById', errorMsg);
      return {
        success: false,
        message: errorMsg,
        url: null
      };
    }

    // 3. RÉCUPÉRATION DES PARAMÈTRES
    const templateId = getParam(INVOICE_CONFIG.PARAM_KEYS.ID_TEMPLATE_DOCS);
    const folderId = getParam(INVOICE_CONFIG.PARAM_KEYS.ID_DOSSIER_DRIVE);
    const entrepriseParams = getEntrepriseParams();

    if (!templateId || !folderId) {
      return {
        success: false,
        message: INVOICE_CONFIG.MESSAGES.ERROR_MISSING_PARAMS,
        url: null
      };
    }

    // 4. CRÉATION DU DOCUMENT À PARTIR DU TEMPLATE
    const templateFile = DriveApp.getFileById(templateId);
    const targetFolder = DriveApp.getFolderById(folderId);

    const fileName = generateSafeFileName(invoiceData.invoiceId, invoiceData.clientNom);
    const newDocFile = templateFile.makeCopy(fileName, targetFolder);
    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();

    // 5. REMPLACEMENT DES MARQUEURS
    replaceMarkers(body, invoiceData, entrepriseParams);

    // 6. SAUVEGARDE DU DOCUMENT
    doc.saveAndClose();

    // 7. GÉNÉRATION DU PDF
    const pdfBlob = newDocFile.getAs(MimeType.PDF).setName(fileName + '.pdf');
    const pdfFile = targetFolder.createFile(pdfBlob);
    const pdfUrl = pdfFile.getUrl();

    // 8. SUPPRESSION DU DOCUMENT TEMPORAIRE (optionnel)
    newDocFile.setTrashed(true);

    // 9. MISE À JOUR DU STATUT DANS LE SHEET
    markInvoiceAsGenerated(invoiceData.invoiceId, pdfUrl);

    // 10. ENVOI EMAIL (SI ACTIVÉ)
    const autoSendEmail = getParam(INVOICE_CONFIG.PARAM_KEYS.AUTO_SEND_EMAIL);
    if (autoSendEmail === 'true' || autoSendEmail === true) {
      sendInvoiceEmail(invoiceData, pdfFile, entrepriseParams);
    }

    logSuccess('generateInvoiceById', `Facture ${invoiceId} générée avec succès`);

    return {
      success: true,
      message: INVOICE_CONFIG.MESSAGES.SUCCESS_GENERATION,
      url: pdfUrl
    };

  } catch (error) {
    logError('generateInvoiceById', `Erreur lors de la génération de ${invoiceId}`, error);
    return {
      success: false,
      message: `❌ Erreur: ${error.message}`,
      url: null
    };
  }
}

// ============================================================================
// REMPLACEMENT DES MARQUEURS DANS LE DOCUMENT
// ============================================================================

/**
 * Remplace tous les marqueurs dans le document avec les données réelles
 * @param {GoogleAppsScript.Document.Body} body - Le corps du document
 * @param {Object} invoiceData - Les données de la facture
 * @param {Object} entrepriseParams - Les paramètres de l'entreprise
 */
function replaceMarkers(body, invoiceData, entrepriseParams) {
  // Informations Entreprise
  body.replaceText(INVOICE_CONFIG.MARKERS.ENTREPRISE_NOM, entrepriseParams.nom);
  body.replaceText(INVOICE_CONFIG.MARKERS.ENTREPRISE_ADRESSE, entrepriseParams.adresse);
  body.replaceText(INVOICE_CONFIG.MARKERS.ENTREPRISE_TEL, entrepriseParams.tel);
  body.replaceText(INVOICE_CONFIG.MARKERS.ENTREPRISE_EMAIL, entrepriseParams.email);

  // Informations Facture
  body.replaceText(INVOICE_CONFIG.MARKERS.FACTURE_ID, invoiceData.invoiceId);
  body.replaceText(INVOICE_CONFIG.MARKERS.FACTURE_DATE, formatDate(invoiceData.date));

  // Informations Client
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_NOM, invoiceData.clientNom || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_EMAIL, invoiceData.clientEmail || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_TEL, invoiceData.clientTel || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_ADRESSE, invoiceData.clientAdresse || 'N/A');

  // Détails de la transaction
  body.replaceText(INVOICE_CONFIG.MARKERS.DESIGNATION, invoiceData.designation);
  body.replaceText(INVOICE_CONFIG.MARKERS.QUANTITE, String(invoiceData.quantite));
  body.replaceText(INVOICE_CONFIG.MARKERS.PRIX_UNITAIRE, formatAmount(invoiceData.prixUnitaire));
  body.replaceText(INVOICE_CONFIG.MARKERS.MONTANT_TOTAL, formatAmount(invoiceData.montantTotal));

  // Montant en lettres
  const montantLettres = nombreEnToutesLettres(invoiceData.montantTotal);
  body.replaceText(INVOICE_CONFIG.MARKERS.MONTANT_LETTRES, montantLettres);
}

// ============================================================================
// GÉNÉRATION MULTIPLE DE FACTURES
// ============================================================================

/**
 * Génère toutes les factures en statut "Brouillon"
 * @returns {Object} Résumé de l'opération
 */
function generateAllPendingInvoices() {
  try {
    const pendingInvoices = getPendingInvoices();

    if (pendingInvoices.length === 0) {
      Logger.log(INVOICE_CONFIG.MESSAGES.NO_PENDING_INVOICES);
      return {
        success: true,
        totalProcessed: 0,
        successful: 0,
        failed: 0,
        message: INVOICE_CONFIG.MESSAGES.NO_PENDING_INVOICES
      };
    }

    const results = {
      success: true,
      totalProcessed: pendingInvoices.length,
      successful: 0,
      failed: 0,
      details: []
    };

    // Génère chaque facture
    pendingInvoices.forEach(invoice => {
      const result = generateInvoiceById(invoice.invoiceId);

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
      }

      results.details.push({
        invoiceId: invoice.invoiceId,
        success: result.success,
        message: result.message,
        url: result.url
      });
    });

    const summaryMessage = `✅ Génération terminée: ${results.successful} réussie(s), ${results.failed} échouée(s) sur ${results.totalProcessed} facture(s)`;
    results.message = summaryMessage;

    logSuccess('generateAllPendingInvoices', summaryMessage);

    return results;

  } catch (error) {
    logError('generateAllPendingInvoices', 'Erreur lors de la génération multiple', error);
    return {
      success: false,
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      message: `❌ Erreur: ${error.message}`
    };
  }
}

// ============================================================================
// ENVOI D'EMAIL
// ============================================================================

/**
 * Envoie la facture par email au client
 * @param {Object} invoiceData - Les données de la facture
 * @param {GoogleAppsScript.Drive.File} pdfFile - Le fichier PDF de la facture
 * @param {Object} entrepriseParams - Les paramètres de l'entreprise
 * @returns {boolean} true si l'envoi a réussi
 */
function sendInvoiceEmail(invoiceData, pdfFile, entrepriseParams) {
  try {
    // Vérifie si le client a un email valide
    if (!validateEmail(invoiceData.clientEmail)) {
      logError('sendInvoiceEmail', `Email client invalide pour ${invoiceData.invoiceId}: ${invoiceData.clientEmail}`);
      return false;
    }

    // Récupère l'email expéditeur
    const senderEmail = getParam(INVOICE_CONFIG.PARAM_KEYS.EMAIL_EXPEDITEUR);

    // Prépare le sujet et le corps de l'email
    const subject = `Facture n°${invoiceData.invoiceId} - ${entrepriseParams.nom}`;

    const body = `Bonjour ${invoiceData.clientNom},

Veuillez trouver ci-joint votre facture n°${invoiceData.invoiceId} d'un montant de ${formatAmount(invoiceData.montantTotal)}.

Détails de la facture:
- Date: ${formatDate(invoiceData.date)}
- Désignation: ${invoiceData.designation}
- Quantité: ${invoiceData.quantite}
- Prix unitaire: ${formatAmount(invoiceData.prixUnitaire)}

Nous restons à votre disposition pour toute question.

Cordialement,
${entrepriseParams.nom}
${entrepriseParams.tel}
${entrepriseParams.email}`;

    // Envoi de l'email avec la facture en pièce jointe
    GmailApp.sendEmail(
      invoiceData.clientEmail,
      subject,
      body,
      {
        attachments: [pdfFile.getBlob()],
        name: entrepriseParams.nom,
        cc: senderEmail
      }
    );

    // Marque la facture comme envoyée
    markInvoiceAsSent(invoiceData.invoiceId);

    logSuccess('sendInvoiceEmail', `Email envoyé à ${invoiceData.clientEmail} pour facture ${invoiceData.invoiceId}`);
    return true;

  } catch (error) {
    logError('sendInvoiceEmail', `Erreur lors de l'envoi de l'email pour ${invoiceData.invoiceId}`, error);
    return false;
  }
}

/**
 * Envoie la facture par email manuellement (après génération)
 * @param {string} invoiceId - L'ID de la facture à envoyer
 * @returns {Object} Résultat de l'envoi
 */
function sendInvoiceEmailManually(invoiceId) {
  try {
    const invoiceData = getInvoiceDataById(invoiceId);

    if (!invoiceData) {
      return {
        success: false,
        message: INVOICE_CONFIG.MESSAGES.ERROR_NO_DATA
      };
    }

    // Vérifie que la facture a déjà été générée
    if (invoiceData.statut === INVOICE_CONFIG.STATUTS.BROUILLON) {
      return {
        success: false,
        message: `❌ La facture ${invoiceId} n'a pas encore été générée`
      };
    }

    if (!invoiceData.urlFacture) {
      return {
        success: false,
        message: `❌ URL du PDF manquante pour la facture ${invoiceId}`
      };
    }

    // Récupère le fichier PDF depuis l'URL
    const pdfFile = getPdfFileFromUrl(invoiceData.urlFacture);
    if (!pdfFile) {
      return {
        success: false,
        message: `❌ Fichier PDF introuvable pour la facture ${invoiceId}`
      };
    }

    const entrepriseParams = getEntrepriseParams();
    const emailSent = sendInvoiceEmail(invoiceData, pdfFile, entrepriseParams);

    if (emailSent) {
      return {
        success: true,
        message: INVOICE_CONFIG.MESSAGES.SUCCESS_EMAIL
      };
    } else {
      return {
        success: false,
        message: `❌ Échec de l'envoi de l'email pour ${invoiceId}`
      };
    }

  } catch (error) {
    logError('sendInvoiceEmailManually', `Erreur lors de l'envoi manuel`, error);
    return {
      success: false,
      message: `❌ Erreur: ${error.message}`
    };
  }
}

/**
 * Récupère un fichier PDF depuis son URL Drive
 * @param {string} url - L'URL du fichier sur Google Drive
 * @returns {GoogleAppsScript.Drive.File|null} Le fichier ou null
 */
function getPdfFileFromUrl(url) {
  try {
    // Extrait l'ID du fichier depuis l'URL
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (!fileIdMatch) return null;

    const fileId = fileIdMatch[0];
    return DriveApp.getFileById(fileId);

  } catch (error) {
    logError('getPdfFileFromUrl', 'Erreur lors de la récupération du PDF', error);
    return null;
  }
}
