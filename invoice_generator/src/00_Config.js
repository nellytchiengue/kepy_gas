// ============================================================================
// KEPY LITE - CONFIGURATION GLOBALE
// ============================================================================
// Toutes les constantes centralisées
// a mettre dans la feuille Parametres!!
// ============================================================================

/** 
const params = getParams_();
const recipient = params['EMAIL_ALERTES'] 
*/

const KEPY_CONFIG = {
  // formulaire de saisie des ventes (mode Edit)
  FORM_ID: '1C0655EERaEnri4jbpG8XhmGHGn_LLF0tk8-e0lUO9W4',

  // formulaire de dépôt-vente (mode Edit)
  FORM_ID_DEPOT: '11CTDUtHXnhw1sa-lMrM2jBTr9u0GXX_uWdLffWC3Ozk',  
   
  SHEETS: {
    CONSOLIDATION: 'Consolidation',
    VENTES: 'Ventes_responses',
    DEPOT_VENTE: 'DepotVente_responses',
    VENDEURS: 'Vendeurs',
    CATALOGUE: 'Catalogue',
    CLIENTS: 'Clients',
    ENTREPOTS: 'Entrepots',
    PARAMETRES: 'Parametres',
    STOCK_FALLBACK: 'Suivi_Stock',
    STOCK_INITIAL: 'Stock_initial',
    MOUVEMENTS: 'Mouvements_stock',
    REGLEMENTS: 'Reglements'
  },
  
  CLIENTS: {
    NAME_COL: 2,
    QUESTION_LIST_TITLE: 'Nom Client',
    QUESTION_FREE_TITLE: 'Nouveau client (si non listé)',
    QUESTION_PHONE_TITLE: 'Téléphone Client',
    QUESTION_EMAIL_TITLE: 'Email Client',
    HEADERS: {
      id: 'ClientID',
      name: 'Nom',
      phone: 'Telephone',
      email: 'Email',
      created: 'CreatedAt',
      country: 'Pays',
      city: 'Ville',
      address: 'Adresse'
    }
  },
  
  FORM_QUESTIONS: {
    // CURRENCY: 'Devise',
    PAYMENT: 'Mode de paiement',
    VENDOR: 'Vendeur',
    PRODUCT: 'Nom du lot',
    WAREHOUSE: 'Entrepôt',
    QUANTITY: 'Quantité',
    AMOUNT: 'Montant',
    SALE_DATE: 'Date vente',
    PAYMENT_DATE: 'Date paiement'
  },
  
  STOCK: {
    MOVEMENT_TYPES: {
      IN: 'IN',
      OUT: 'OUT'
    },
    DEFAULT_SKU: 'AUTRE',
    DEFAULT_VENDOR_ID: 'V000'
  }
};


