/**
 * @file 00_Config.js
 * @description Configuration centralisée pour le système de génération de factures automatiques
 * @version 1.0
 * @date 2025-12-11
 */

// ============================================================================
// CONFIGURATION PRINCIPALE
// ============================================================================

const INVOICE_CONFIG = {

  // ---------------------------------------------------------------------------
  // NOMS DES FEUILLES DANS LE GOOGLE SHEET
  // ---------------------------------------------------------------------------
  SHEETS: {
    FACTURES: 'Factures',          // Feuille contenant les données de factures
    PARAMETRES: 'Parametres'       // Feuille contenant les paramètres de configuration
  },

  // ---------------------------------------------------------------------------
  // INDEX DES COLONNES (0-based) DANS LA FEUILLE "FACTURES"
  // ---------------------------------------------------------------------------
  COLUMNS: {
    INVOICE_ID: 0,       // Colonne A - ID unique de facture (ex: F001)
    DATE: 1,             // Colonne B - Date d'émission
    CLIENT_NOM: 2,       // Colonne C - Nom du client
    CLIENT_EMAIL: 3,     // Colonne D - Email du client
    CLIENT_TEL: 4,       // Colonne E - Téléphone du client
    CLIENT_ADRESSE: 5,   // Colonne F - Adresse du client
    DESIGNATION: 6,      // Colonne G - Description du produit/service
    QUANTITE: 7,         // Colonne H - Quantité vendue
    PRIX_UNITAIRE: 8,    // Colonne I - Prix unitaire (FCFA)
    MONTANT_TOTAL: 9,    // Colonne J - Montant total = Qté × PU
    STATUT: 10,          // Colonne K - Statut de la facture
    URL_FACTURE: 11      // Colonne L - Lien vers le PDF généré
  },

  // ---------------------------------------------------------------------------
  // EN-TÊTES DES COLONNES (pour validation)
  // ---------------------------------------------------------------------------
  HEADERS: {
    INVOICE_ID: 'InvoiceID',
    DATE: 'DateFacture',
    CLIENT_NOM: 'ClientNom',
    CLIENT_EMAIL: 'ClientEmail',
    CLIENT_TEL: 'ClientTel',
    CLIENT_ADRESSE: 'ClientAdresse',
    DESIGNATION: 'Designation',
    QUANTITE: 'Quantite',
    PRIX_UNITAIRE: 'PrixUnitaire',
    MONTANT_TOTAL: 'MontantTotal',
    STATUT: 'Statut',
    URL_FACTURE: 'URLFacture'
  },

  // ---------------------------------------------------------------------------
  // STATUTS POSSIBLES POUR UNE FACTURE
  // ---------------------------------------------------------------------------
  STATUTS: {
    BROUILLON: 'Brouillon',    // Facture en attente de génération
    GENEREE: 'Générée',        // Facture générée mais pas encore envoyée
    ENVOYEE: 'Envoyée'         // Facture générée et envoyée par email
  },

  // ---------------------------------------------------------------------------
  // CLÉS POUR LA FEUILLE "PARAMETRES" (ligne 2, colonne B contient la valeur)
  // ---------------------------------------------------------------------------
  PARAM_KEYS: {
    ID_TEMPLATE_DOCS: 'ID_TEMPLATE_DOCS',           // ID du template Google Docs
    ID_DOSSIER_DRIVE: 'ID_DOSSIER_DRIVE',           // ID du dossier de destination Drive
    EMAIL_EXPEDITEUR: 'EMAIL_EXPEDITEUR',           // Email d'envoi des factures
    AUTO_SEND_EMAIL: 'AUTO_SEND_EMAIL',             // Flag pour envoi auto (true/false)
    ENTREPRISE_NOM: 'ENTREPRISE_NOM',               // Nom de l'entreprise
    ENTREPRISE_ADRESSE: 'ENTREPRISE_ADRESSE',       // Adresse de l'entreprise
    ENTREPRISE_TEL: 'ENTREPRISE_TEL',               // Téléphone de l'entreprise
    ENTREPRISE_EMAIL: 'ENTREPRISE_EMAIL'            // Email de l'entreprise
  },

  // ---------------------------------------------------------------------------
  // MARQUEURS UTILISÉS DANS LE TEMPLATE GOOGLE DOCS
  // ---------------------------------------------------------------------------
  MARKERS: {
    // Informations entreprise
    ENTREPRISE_NOM: '<<ENTREPRISE_NOM>>',
    ENTREPRISE_ADRESSE: '<<ENTREPRISE_ADRESSE>>',
    ENTREPRISE_TEL: '<<ENTREPRISE_TEL>>',
    ENTREPRISE_EMAIL: '<<ENTREPRISE_EMAIL>>',

    // Informations facture
    FACTURE_ID: '<<FACTURE_ID>>',
    FACTURE_DATE: '<<FACTURE_DATE>>',

    // Informations client
    CLIENT_NOM: '<<CLIENT_NOM>>',
    CLIENT_EMAIL: '<<CLIENT_EMAIL>>',
    CLIENT_TEL: '<<CLIENT_TEL>>',
    CLIENT_ADRESSE: '<<CLIENT_ADRESSE>>',

    // Détails de la transaction
    DESIGNATION: '<<DESIGNATION>>',
    QUANTITE: '<<QUANTITE>>',
    PRIX_UNITAIRE: '<<PRIX_UNITAIRE>>',
    MONTANT_TOTAL: '<<MONTANT_TOTAL>>',
    MONTANT_LETTRES: '<<MONTANT_LETTRES>>'
  },

  // ---------------------------------------------------------------------------
  // OPTIONS DE FORMATAGE
  // ---------------------------------------------------------------------------
  FORMAT: {
    DATE_LOCALE: 'fr-FR',           // Locale pour le formatage de dates
    CURRENCY: 'FCFA',               // Devise utilisée
    DECIMAL_PLACES: 2               // Nombre de décimales pour les montants
  },

  // ---------------------------------------------------------------------------
  // MESSAGES ET TEXTES
  // ---------------------------------------------------------------------------
  MESSAGES: {
    SUCCESS_GENERATION: '✅ Facture générée avec succès',
    SUCCESS_EMAIL: '✅ Facture envoyée par email',
    ERROR_NO_DATA: '❌ Aucune donnée trouvée pour cet ID',
    ERROR_MISSING_PARAMS: '❌ Paramètres manquants dans la feuille Parametres',
    ERROR_TEMPLATE_NOT_FOUND: '❌ Template Google Docs introuvable',
    ERROR_FOLDER_NOT_FOUND: '❌ Dossier Drive introuvable',
    NO_PENDING_INVOICES: 'ℹ️ Aucune facture en brouillon à générer'
  }
};

// ============================================================================
// FONCTION D'EXPORT (optionnelle, pour accès depuis d'autres fichiers)
// ============================================================================

/**
 * Retourne la configuration complète
 * @returns {Object} Configuration INVOICE_CONFIG
 */
function getInvoiceConfig() {
  return INVOICE_CONFIG;
}