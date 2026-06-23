/**
 * Vérifie si l'utilisateur est sur le template original ou sur sa copie.
 * @returns {boolean} true si l'utilisateur est sur le Master
 */
function checkTemplateProtection() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const templateId = "1SPICbKbrNxVQNB2ocMtdCGR-lyoNC5ZoGwdy_LtGOzU";
  const lang = getConfiguredLocale();
  
  if (ss.getId() === templateId) {
    const ui = SpreadsheetApp.getUi();
    if (lang === 'FR') {
      ui.alert(
        "⚠️ Version Master (Lecture seule)",
        "Ceci est le template original d'InvoiceFlash. \n\n" +
        "Pour pouvoir l'utiliser, vous devez en créer une copie :\n" +
        "Allez dans Fichier > Créer une copie.",
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        "⚠️ Master Version (Read-only)",
        "This is the original InvoiceFlash template. \n\n" +
        "To use it, you must create your own copy:\n" +
        "Go to File > Make a copy.",
        ui.ButtonSet.OK
      );
    }
    return true;
  }
  return false;
}