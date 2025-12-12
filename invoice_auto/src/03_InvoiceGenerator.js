/**
 * @file 03_InvoiceGenerator.js
 * @description Automatic PDF invoice generation from Google Docs template
 * @version 1.1 (Standardized)
 * @date 2025-12-11
 */

// ============================================================================
// INDIVIDUAL INVOICE GENERATION
// ============================================================================

/**
 * Generates a PDF invoice for a given ID
 * @param {string} invoiceId - The invoice ID to generate
 * @returns {Object} {success: boolean, message: string, url: string}
 */
function generateInvoiceById(invoiceId) {
  try {
    // 1. DATA RETRIEVAL
    const invoiceData = getInvoiceDataById(invoiceId);

    if (!invoiceData) {
      const lang = detectUserLanguage();
      const messages = getMessages(lang);
      return {
        success: false,
        message: messages.ERROR_NO_DATA,
        url: null
      };
    }

    // 2. DATA VALIDATION
    const validation = validateInvoiceData(invoiceData);
    if (!validation.isValid) {
      const errorMsg = `❌ Invalid data for ${invoiceId}:\n${validation.errors.join('\n')}`;
      logError('generateInvoiceById', errorMsg);
      return {
        success: false,
        message: errorMsg,
        url: null
      };
    }

    // 3. RETRIEVE PARAMETERS
    const templateId = getParam(INVOICE_CONFIG.PARAM_KEYS.TEMPLATE_DOCS_ID);
    const folderId = getParam(INVOICE_CONFIG.PARAM_KEYS.DRIVE_FOLDER_ID);
    const companyParams = getCompanyParams();

    if (!templateId || !folderId) {
      const lang = detectUserLanguage();
      const messages = getMessages(lang);
      return {
        success: false,
        message: messages.ERROR_MISSING_PARAMS,
        url: null
      };
    }

    // 4. CREATE DOCUMENT FROM TEMPLATE
    const templateFile = DriveApp.getFileById(templateId);
    const targetFolder = DriveApp.getFolderById(folderId);

    const fileName = generateSafeFileName(invoiceData.invoiceId, invoiceData.clientName);
    const newDocFile = templateFile.makeCopy(fileName, targetFolder);
    const doc = DocumentApp.openById(newDocFile.getId());
    const body = doc.getBody();

    // 5. REPLACE MARKERS
    replaceMarkers(body, invoiceData, companyParams);

    // 6. SAVE DOCUMENT
    doc.saveAndClose();

    // 7. GENERATE PDF
    const pdfBlob = newDocFile.getAs(MimeType.PDF).setName(fileName + '.pdf');
    const pdfFile = targetFolder.createFile(pdfBlob);
    const pdfUrl = pdfFile.getUrl();

    // 8. DELETE TEMPORARY DOCUMENT (optional)
    newDocFile.setTrashed(true);

    // 9. UPDATE STATUS IN SHEET
    markInvoiceAsGenerated(invoiceData.invoiceId, pdfUrl);

    // 10. SEND EMAIL (IF ENABLED)
    const autoSendEmail = getParam(INVOICE_CONFIG.PARAM_KEYS.AUTO_SEND_EMAIL);
    if (autoSendEmail === 'true' || autoSendEmail === true) {
      sendInvoiceEmail(invoiceData, pdfFile, companyParams);
    }

    logSuccess('generateInvoiceById', `Invoice ${invoiceId} generated successfully`);

    const lang = detectUserLanguage();
    const messages = getMessages(lang);
    return {
      success: true,
      message: messages.SUCCESS_GENERATION,
      url: pdfUrl
    };

  } catch (error) {
    logError('generateInvoiceById', `Error generating ${invoiceId}`, error);
    return {
      success: false,
      message: `❌ Error: ${error.message}`,
      url: null
    };
  }
}

// ============================================================================
// MARKER REPLACEMENT IN DOCUMENT
// ============================================================================

/**
 * Replaces all markers in the document with actual data
 * @param {GoogleAppsScript.Document.Body} body - The document body
 * @param {Object} invoiceData - The invoice data
 * @param {Object} companyParams - The company parameters
 */
function replaceMarkers(body, invoiceData, companyParams) {
  // Company Information
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_NAME, companyParams.name || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_ADDRESS, companyParams.address || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_PHONE, companyParams.phone || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_EMAIL, companyParams.email || 'N/A');

  // Invoice Information
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_ID, invoiceData.invoiceId);
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_DATE, formatDate(invoiceData.date));

  // Client Information
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_NAME, invoiceData.clientName || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_EMAIL, invoiceData.clientEmail || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_PHONE, invoiceData.clientPhone || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_ADDRESS, invoiceData.clientAddress || 'N/A');

  // Transaction Details
  body.replaceText(INVOICE_CONFIG.MARKERS.DESCRIPTION, invoiceData.description);
  body.replaceText(INVOICE_CONFIG.MARKERS.QUANTITY, String(invoiceData.quantity));
  body.replaceText(INVOICE_CONFIG.MARKERS.UNIT_PRICE, formatAmount(invoiceData.unitPrice));
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_AMOUNT, formatAmount(invoiceData.totalAmount));

  // Amount in Words
  const amountInWords = convertAmountToWords(invoiceData.totalAmount);
  body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS, amountInWords);
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
