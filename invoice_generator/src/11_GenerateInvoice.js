/**
 * @file 11_GenerateInvoice.gs
 * @description Fonctions pour la génération de factures (PDF, etc.).
 */
 
// ==============================================================================
// 1. CONFIGURATION (Utilisation des constantes déjà définies)
// ==============================================================================

// Fichier : 11_GenerateInvoice.gs

const ID_MODELE_FACTURE = "18iqNmprz-RRsAGv_DYLhyEWIXJukLMIksk-GTmCFrJs"; // 

const ID_DOSSIER_PARENT_DRIVE = "1ZS7lLYpoe-axYfpj0vfc5RKj5JwBtXrw"; // <--ID du dossier principal ( SALERS)
const EMAIL_COPIE = "nellypokam@gmail.com"; // "adyctbeauty@gmail.com";
const NOM_FEUILLE_VENTES = KEPY_CONFIG.SHEETS.VENTES // Nom de la feuille qui reçoit les soumissions de formulaire

// const NOM_FEUILLE_CLIENTS = "Clients"; // Nom de la feuille pour la recherche client

const NOM_FEUILLE_CLIENTS = KEPY_CONFIG.SHEETS.CLIENTS

/**  FORM_QUESTIONS: {
    CURRENCY: 'Devise',
    PAYMENT: 'Mode de paiement',
    VENDOR: 'Vendeur',
    PRODUCT: 'Nom du lot',
    WAREHOUSE: 'Entrepôt',
    QUANTITY: 'Quantité',
    AMOUNT: 'Montant',
    SALE_DATE: 'Date vente',
    PAYMENT_DATE: 'Date paiement'
  },
  
  KEPY_CONFIG.FORM_QUESTIONS.PRODUCT // 'Nom du lot'
*/
  

// Assurez-vous que getVendorEmail et getVendorFolder sont dans d'autres fichiers (comme 04_Vendors.gs)
// ==============================================================================
// 2. FONCTIONS UTILITAIRES (getVendorFolder, chercherClient, nombreEnToutesLettres)
// ==============================================================================

/**
 * Fonction utilitaire pour trouver ou créer un sous-dossier de vendeur.
 * @param {string} vendorId L'ID unique du vendeur.
 * @returns {GoogleAppsScript.Drive.Folder} L'objet dossier du vendeur.
 */
function getVendorFolder(vendorId) {
  const parentFolder = DriveApp.getFolderById(ID_DOSSIER_PARENT_DRIVE);
  const folders = parentFolder.getFoldersByName(vendorId);

  if (folders.hasNext()) {
    return folders.next();
  } else {
    // Crée le dossier si inexistant
    return parentFolder.createFolder(vendorId);
  }
}

/**
 * Recherche les informations d'un client dans la feuille 'Clients' par son ID ou Nom.
 *
 * @param {string} clientKey L'identifiant du client (Nom ou ID) à chercher.
 * @returns {{nom: string, adresse: string, telephone: string, email: string}} Un objet avec les informations du client.
 */
function chercherClient(clientKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const clientSheet = ss.getSheetByName(NOM_FEUILLE_CLIENTS);

  if (!clientSheet || !clientKey) {
    Logger.log("Erreur: Feuille client introuvable ou clé client manquante.");
    return { nom: "Client Inconnu", adresse: 'N/A', telephone: 'N/A', email: 'N/A' };
  }

  const range = clientSheet.getDataRange();
  const data = range.getValues();
  const headers = data.shift();
  
  // Cherche l'index des colonnes
  /**
  const clientKeyIndex = headers.indexOf("ID Client"); // REMPLACER par l'en-tête réel si différent
  const adresseIndex = headers.indexOf("Adresse");
  const telephoneIndex = headers.indexOf("Téléphone");
  const emailIndex = headers.indexOf("Email");
  */

  // Cherche l'index des colonnes
  // Utiliser KEPY_CONFIG pour garantir la cohérence
  const clientKeyIndex = headers.indexOf(KEPY_CONFIG.CLIENTS.HEADERS.id);
  const adresseIndex = headers.indexOf(KEPY_CONFIG.CLIENTS.HEADERS.address);
  const telephoneIndex = headers.indexOf(KEPY_CONFIG.CLIENTS.HEADERS.phone);
  const emailIndex = headers.indexOf(KEPY_CONFIG.CLIENTS.HEADERS.email);

  if (clientKeyIndex === -1) {
    Logger.log("Erreur: Colonne d'identification client introuvable dans la feuille Clients.");
    return { nom: clientKey, adresse: 'N/A', telephone: 'N/A', email: 'N/A' };
  }

  // Boucle pour trouver le client
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    if (String(row[clientKeyIndex]).trim() === String(clientKey).trim()) {
      return {
        nom: String(row[clientKeyIndex]),
        adresse: (adresseIndex !== -1) ? String(row[adresseIndex]) : 'N/A',
        telephone: (telephoneIndex !== -1) ? String(row[telephoneIndex]) : 'N/A',
        email: (emailIndex !== -1) ? String(row[emailIndex]) : 'N/A'
      };
    }
  }

  Logger.log(`Alerte: Client ${clientKey} non trouvé. Envoi à l'adresse de copie.`);
  return { nom: clientKey, adresse: 'N/A', telephone: 'N/A', email: 'N/A' };
}

/**
 * Convertit un nombre en toutes lettres (pour le français).
 * Supporte les montants avec deux décimales (centimes).
 * @param {number} n Le montant à convertir.
 * @returns {string} Le montant en toutes lettres.
 */
function nombreEnToutesLettres(n) {
  if (isNaN(n) || n === 0) return "zéro francs CFA";
  
  const unite = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizaine = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];
  const dix = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];

  function numberToWords(num) {
    if (num < 10) return unite[num];
    if (num < 20) return dix[num - 10];
    if (num < 70) {
      if (num % 10 === 0) return dizaine[Math.floor(num / 10)];
      if (num % 10 === 1 && Math.floor(num / 10) !== 7) return dizaine[Math.floor(num / 10)] + '-et-' + unite[1];
      return dizaine[Math.floor(num / 10)] + '-' + unite[num % 10];
    }
    if (num < 80) { // 70-79
      if (num % 10 === 0) return 'soixante-dix';
      return 'soixante-' + dix[num - 70];
    }
    if (num < 100) { // 80-99
      if (num === 80) return 'quatre-vingts';
      if (num % 10 === 0) return dizaine[Math.floor(num / 10)] + (num > 80 ? 't' : '') + unite[num % 10];
      if (num > 80 && num < 90) return 'quatre-vingt-' + dix[num - 80];
      return dizaine[Math.floor(num / 10)] + (num % 10 === 1 && Math.floor(num / 10) !== 7 ? '-et-' : '-') + unite[num % 10];
    }
    if (num < 1000) {
      const cent = (Math.floor(num / 100) === 1) ? 'cent' : unite[Math.floor(num / 100)] + '-cents';
      const reste = num % 100;
      if (reste === 0) return cent.replace(/s$/, ''); // un cent, deux cents
      return cent.replace(/s$/, '') + (Math.floor(num / 100) > 1 && reste === 0 ? 's' : '') + ' ' + numberToWords(reste);
    }
    return ''; // Ne devrait pas arriver
  }

  // Gérer la partie entière et la partie décimale (Centimes)
  const [fParts, cParts] = String(n).split('.');
  const francs = parseInt(fParts);
  const centimes = cParts ? parseInt(cParts.padEnd(2, '0').slice(0, 2)) : 0; // Prend max 2 décimales

  let result = '';
  
  if (francs > 0) {
    if (francs < 1000) {
      result = numberToWords(francs);
    } else if (francs < 1000000) {
      const milliers = Math.floor(francs / 1000);
      const reste = francs % 1000;
      result = (milliers === 1 ? 'mille' : numberToWords(milliers) + '-mille');
      if (reste > 0) result += ' ' + numberToWords(reste);
    } else if (francs < 1000000000) {
      const millions = Math.floor(francs / 1000000);
      const reste = francs % 1000000;
      result = numberToWords(millions) + (millions > 1 ? '-millions' : '-million');
      if (reste > 0) result += ' ' + nombreEnToutesLettres(reste).split(' francs CFA')[0];
    }
    
    result += (francs > 1 ? ' francs CFA' : ' franc CFA');
  }

  if (centimes > 0) {
    if (francs > 0) result += ' et ';
    result += numberToWords(centimes);
    result += (centimes > 1 ? ' centimes' : ' centime');
  } else if (francs === 0) {
    return "zéro franc CFA";
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1);
}


// ==============================================================================
// 2. FONCTION PRINCIPALE DE GÉNÉRATION (Réutilisable)
// ==============================================================================

/**
 * Génère la facture, l'enregistre dans le dossier du vendeur et envoie l'e-mail.
 * Lit les données depuis la feuille Consolidation.
 * @param {string} saleId L'identifiant de la vente à facturer.
 * @returns {string} Le statut de l'opération ou le lien vers la facture.
 */
function generateInvoiceBySaleId_(saleId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const consoSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.CONSOLIDATION);
  if (!consoSheet || !saleId) {
    throw new Error("SaleID manquant ou feuille Consolidation introuvable.");
  }

  // --- 1. RÉCUPÉRATION DES DONNÉES ---
  // On lit toutes les données pour trouver la ligne du SaleID
  const dataRange = consoSheet.getDataRange();
  const dataValues = dataRange.getValues();
  const headers = dataValues[0];
  const headerMap = {};
  headers.forEach((h, i) => headerMap[h] = i);
  
  let rowData = null;
  
  // Cherche le SaleID (colonne A/index 0)
  for (let i = 1; i < dataValues.length; i++) {
    if (String(dataValues[i][0]) === String(saleId)) {
      rowData = dataValues[i];
      break;
    }
  }

  if (!rowData) {
    throw new Error(`Vente avec SaleID ${saleId} non trouvée dans Consolidation.`);
  }

  // Mappe les données sur la base des en-têtes de Consolidation
  const data = {};
  headers.forEach((header, i) => data[header] = rowData[i]);

  const vendorID = data.VendorID;
  const clientKey = data.Client; 
  const montantTotal = parseFloat(data.Montant) || 0; 
  
  // On doit avoir des données critiques
  if (!vendorID || !clientKey || montantTotal === 0) {
    throw new Error(`Données critiques (VendorID, Client ou Montant) manquantes pour le SaleID ${saleId}. Arrêt.`);
  }

  // --- 2. PRÉPARATION ---
  const clientInfo = chercherClient(clientKey);
  const vendorFolder = getVendorFolder(vendorID);
  const vendorEmail = getVendorEmail(vendorID); // Récupéré de 04_Vendors.gs
  const montantLettres = nombreEnToutesLettres(montantTotal);
  
  // --- 3. CRÉATION DU DOCUMENT ---
  // (Le reste du code de génération de document est le même, mais s'appuie sur les noms de colonnes de Consolidation)
  const templateFile = DriveApp.getFileById(ID_MODELE_FACTURE);
  const factName = `Facture_${saleId}_${clientInfo.nom.replace(/[^a-z0-9]/gi, '_')}`;
  const newFile = templateFile.makeCopy(factName, vendorFolder);
  const doc = DocumentApp.openById(newFile.getId());
  const body = doc.getBody();

  // --- 4. REMPLACEMENT DES MARQUEURS ---
  
  // A. Infos Client et Vente
  body.replaceText('<<Client_Nom>>', clientInfo.nom);
  body.replaceText('<<Client_Email>>', clientInfo.email);
  body.replaceText('<<Client_Adresse>>', clientInfo.adresse);
  body.replaceText('<<Client_Tel>>', clientInfo.telephone);
  // Utilisation de DateVente et SaleID de Consolidation
  body.replaceText('<<Vente_Date>>', data.DateVente ? new Date(data.DateVente).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'));
  body.replaceText('<<Vente_ID>>', saleId);
  
  // B. Totaux et Montants
  body.replaceText('<<Montant_Total>>', `${montantTotal.toFixed(2)} FCFA`); 
  body.replaceText('<<Montant_Total_Lettres>>', montantLettres);
  
  // C. Lignes d'articles (Remplissage de la ligne 1)
  // Utilisation des en-têtes de Consolidation
  const designation = data.Produit || 'Produit Vente (Désignation manquante)'; // 'Produit' dans Consolidation
  const quantite = data.Quantite || 1;
  const pu = data.PU || montantTotal; // 'PU' dans Consolidation
  const pt = data.Montant || montantTotal;
  
  body.replaceText('<<Designation_1>>', designation);
  body.replaceText('<<Quantite_1>>', quantite);
  body.replaceText('<<PU_1>>', pu);
  body.replaceText('<<PT_1>>', pt);
  
  // Suppression des autres lignes (comme dans votre code original)
  for (let i = 2; i <= 7; i++) {
     body.replaceText(`<<Designation_${i}>>`, '');
     body.replaceText(`<<Quantite_${i}>>`, '');
     body.replaceText(`<<PU_${i}>>`, '');
     body.replaceText(`<<PT_${i}>>`, '');
  }

  doc.saveAndClose();

  // --- 5. SAUVEGARDE PDF & ENVOI ---
  const pdfBlob = newFile.getAs(MimeType.PDF).setName(factName + '.pdf');
  const pdfFile = vendorFolder.createFile(pdfBlob);
  const pdfUrl = pdfFile.getUrl();

  if (vendorEmail) {
      GmailApp.sendEmail(
          vendorEmail,
          /**  
          `Nouvelle Facture n°${saleId} générée | ZENOU MEDIC SARL`,
          `Bonjour ${data.VendorNom},\n\nVeuillez trouver la facture n°${saleId} générée pour le client ${clientInfo.nom}.\n\nPour l'ouvrir et l'imprimer, utilisez le lien : ${pdfUrl}.\n\nCordialement,\nZENOU MEDIC SARL`,
          */
          
          `Nouvelle Facture n°${saleId} générée | ZENOU MEDIC SARL`,
          `Bonjour ${data.VendorNom},\n\nVeuillez trouver la facture n°${saleId} générée pour le client ${clientInfo.nom}.
           \n\nVous pouvez l'ouvrir et l'imprimer, 
           \n\nCordialement,\nZENOU MEDIC SARL`,

          {
              cc: EMAIL_COPIE,
              attachments: [pdfFile.getBlob()],
              name: "ZENOU MEDIC SARL"
          }
      );
  } else {
      Logger.log(`Alerte: Email du vendeur ${data.VendorNom} non trouvé. Facture générée : ${pdfUrl}`);
  }

  return `Facture générée : ${pdfUrl}`;
}


/**
 * Fonction de test publique pour autoriser les permissions Drive
 * À exécuter manuellement une première fois pour autoriser l'accès
 */
function TEST_authorizePermissions() {
  try {
    // Test d'accès au dossier Drive
    const testFolder = DriveApp.getFolderById(ID_DOSSIER_PARENT_DRIVE);
    Logger.log("✓ Accès au dossier Drive autorisé: " + testFolder.getName());
    
    // Test d'accès au templateÒ
    const testTemplate = DriveApp.getFileById(ID_MODELE_FACTURE);
    Logger.log("✓ Accès au template autorisé: " + testTemplate.getName());
    
    // Test d'accès au spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("✓ Accès au spreadsheet autorisé: " + ss.getName());
    
    Logger.log("✓✓✓ TOUTES LES PERMISSIONS SONT ACCORDÉES ✓✓✓");
    return "Permissions OK";
    
  } catch (err) {
    Logger.log("❌ Erreur d'autorisation: " + err);
    throw err;
  }
}

/**
 * Test complet incluant l'envoi d'email
 */
function TEST_authorizeEmailPermissions() {
  try {
    // Test d'accès Drive (déjà autorisé)
    const testFolder = DriveApp.getFolderById(ID_DOSSIER_PARENT_DRIVE);
    Logger.log("✓ Drive OK");
    
    // Test d'envoi d'email
    MailApp.sendEmail({
      to: EMAIL_COPIE,
      subject: "Test autorisation KEPY_GS_V0",
      body: "Ce message confirme que les permissions Gmail sont accordées."
    });
    Logger.log("✓ Gmail OK - Email de test envoyé à " + EMAIL_COPIE);
    
    Logger.log("✓✓✓ TOUTES LES PERMISSIONS SONT ACCORDÉES (Drive + Gmail) ✓✓✓");
    return "Permissions complètes OK";
    
  } catch (err) {
    Logger.log("❌ Erreur: " + err);
    throw err;
  }
}

/**
 * Test de génération de facture avec un SaleID réel
 * IMPORTANT: Remplacer 'VOTRE_SALE_ID' par un vrai SaleID de votre feuille Consolidation
 */
function TEST_generateInvoiceManually() {
  try {
    // 1. Récupérer le dernier SaleID de la feuille Consolidation
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const consoSheet = ss.getSheetByName(KEPY_CONFIG.SHEETS.CONSOLIDATION);
    
    if (!consoSheet) {
      Logger.log("❌ Feuille Consolidation introuvable!");
      return;
    }
    
    const lastRow = consoSheet.getLastRow();
    if (lastRow < 2) {
      Logger.log("❌ Aucune vente dans Consolidation!");
      return;
    }
    
    // Récupère le SaleID de la dernière ligne (colonne A)
    const lastSaleId = consoSheet.getRange(lastRow, 1).getValue();
    Logger.log(`📋 Test avec SaleID: ${lastSaleId}`);
    
    // 2. Appeler la fonction de génération
    const result = generateInvoiceBySaleId_(lastSaleId);
    Logger.log("✅ " + result);
    
  } catch (err) {
    Logger.log("❌ Erreur lors du test: " + err);
    Logger.log("Stack trace: " + err.stack);
  }
}


/**
 * Vérifie l'accès au template de facture
 */
function TEST_checkTemplateAccess() {
  try {
    Logger.log(`🔍 Tentative d'accès au template: ${ID_MODELE_FACTURE}`);
    
    const templateFile = DriveApp.getFileById(ID_MODELE_FACTURE);
    Logger.log(`✅ Template trouvé: ${templateFile.getName()}`);
    Logger.log(`   Type MIME: ${templateFile.getMimeType()}`);
    Logger.log(`   Propriétaire: ${templateFile.getOwner().getEmail()}`);
    
    // Test de copie
    const testFolder = DriveApp.getFolderById(ID_DOSSIER_PARENT_DRIVE);
    const testCopy = templateFile.makeCopy("TEST_COPIE_FACTURE", testFolder);
    Logger.log(`✅ Copie de test créée: ${testCopy.getUrl()}`);
    
    // Nettoyage
    testCopy.setTrashed(true);
    Logger.log("✅ Copie de test supprimée");
    
    return "Template OK";
    
  } catch (err) {
    Logger.log("❌ Erreur template: " + err);
    Logger.log("Stack: " + err.stack);
    throw err;
  }
}

