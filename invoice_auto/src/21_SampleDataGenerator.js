/**
 * Prépare le fichier pour la vente sur Gumroad.
 * Nettoie les données existantes et insère des exemples propres.
 */
function generateCleanSampleData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const lang = getConfiguredLocale();
  const isFR = lang === 'FR';

  const title = isFR ? "⚠️ Préparation du Template" : "⚠️ Template Preparation";
  const msg = isFR 
    ? "Voulez-vous vider les feuilles et insérer des données de test propres ? (Action irréversible)"
    : "Do you want to clear the sheets and insert clean test data? (Irreversible action)";
  
  const response = ui.alert(title, msg, ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) return;

  // 1. Données pour la feuille CLIENTS
  const clientSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.CLIENTS);
  if (clientSheet) {
    clientSheet.getRange(2, 1, clientSheet.getLastRow(), clientSheet.getLastColumn()).clearContent();
    const sampleClient = isFR ? [
      "CLI-001", "Client Démo SARL", "contact@client-demo.fr", "+33 1 23 45 67 89", 
      "10 rue de la Paix, 75001 Paris", "FR", "12345678901234", "FR12345678901", 
      "", "", "30 jours", "Client exemple pour test", "TRUE"
    ] : [
      "CLI-001", "Demo Client Ltd", "contact@client-demo.com", "+1 555 123 4567", 
      "123 Business Ave, New York, NY", "US", "", "", 
      "", "12-3456789", "Net 30", "Sample client for testing", "TRUE"
    ];
    clientSheet.appendRow(sampleClient);
  }

  // 2. Données pour la feuille SERVICES
  const serviceSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SERVICES);
  if (serviceSheet) {
    serviceSheet.getRange(2, 1, serviceSheet.getLastRow(), serviceSheet.getLastColumn()).clearContent();
    const sampleService = isFR ? [
      "SRV-001", "Consulting Stratégique", "Accompagnement expert sur 1 journée", 
      "1200", "Conseil", "20", "jour", "TRUE"
    ] : [
      "SRV-001", "Strategic Consulting", "Expert guidance for 1 day", 
      "1200", "Consulting", "0", "day", "TRUE"
    ];
    serviceSheet.appendRow(sampleService);
  }

  // 3. Données pour la feuille INVOICES
  const invoiceSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);
  if (invoiceSheet) {
    invoiceSheet.getRange(2, 1, invoiceSheet.getLastRow(), invoiceSheet.getLastColumn()).clearContent();
    const now = new Date();
    const sampleInvoice = isFR ? [
      "INV-DEMO-001", now, "Client Démo SARL", "contact@client-demo.fr", 
      "+33 1 23 45 67 89", "10 rue de la Paix, 75001 Paris", "Prestation de test", 
      "1", "1200", "240", "1440", "Draft", "", 
      Utilities.formatDate(now, "GMT+1", "yyyyMMdd HHmmss"), "", ""
    ] : [
      "INV-DEMO-001", now, "Demo Client Ltd", "contact@client-demo.com", 
      "+1 555 123 4567", "123 Business Ave, New York, NY", "Testing service", 
      "1", "1200", "0", "1200", "Draft", "", 
      Utilities.formatDate(now, "GMT+1", "yyyyMMdd HHmmss"), "", ""
    ];
    invoiceSheet.appendRow(sampleInvoice);
  }

  // 4. Nettoyage de la feuille SETTINGS (on garde les clés mais on vide les valeurs sensibles)
  const settingsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SETTINGS);
  if (settingsSheet) {
    const data = settingsSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const key = data[i][0];
      // On vide l'ID du template et du dossier pour que l'acheteur lance son propre Wizard
      if (key === "TEMPLATE_DOCS_ID" || key === "DRIVE_FOLDER_ID" || key === "COMPANY_NAME") {
        settingsSheet.getRange(i + 1, 2).clearContent();
      }
    }
  }

  // 5. Réinitialisation des ScriptProperties (Setup)
  const scriptProps = PropertiesService.getScriptProperties();
  scriptProps.deleteAllProperties();

  const doneTitle = isFR ? "✅ Terminé" : "✅ Done";
  const doneMsg = isFR 
    ? "Le fichier est maintenant propre et prêt pour la vente.\n\nN'oubliez pas de vider la corbeille de votre Drive."
    : "The file is now clean and ready for sale.\n\nDon't forget to empty your Drive trash.";

  ui.alert(doneTitle, doneMsg, ui.ButtonSet.OK);
}