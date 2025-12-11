# MASTER PROMPT - Système de Génération Automatique de Factures

## 🎯 OBJECTIF DU PROJET

Créer un système autonome et simplifié de génération automatique de factures PDF à partir d'un Google Sheet, en utilisant Google Apps Script et un template Google Docs.

---

## 📋 ARCHITECTURE GLOBALE

```
invoice_auto/
├── src/
│   ├── 00_Config.js           # Configuration centralisée
│   ├── 01_Utils.js             # Fonctions utilitaires
│   ├── 02_DataCollector.js     # Collecte des données du Sheet
│   ├── 03_InvoiceGenerator.js  # Génération de factures
│   ├── 04_Main.js              # Point d'entrée et menu
│   ├── appsscript.json         # Configuration Apps Script
│   └── .clasp.json             # Configuration clasp
├── templates/
│   ├── SHEET_STRUCTURE.md      # Structure du Google Sheet
│   └── DOCS_TEMPLATE.md        # Structure du template Docs
├── README.md                   # Documentation complète
└── MASTER_PROMPT.md            # Ce fichier
```

---

## 📊 STRUCTURE DU GOOGLE SHEET SOURCE

### Feuille "Factures" (source de données)

| Colonne | Nom en-tête     | Type      | Description                      | Obligatoire |
|---------|-----------------|-----------|----------------------------------|-------------|
| A       | InvoiceID       | Texte     | ID unique de facture (ex: F001)  | ✅          |
| B       | DateFacture     | Date      | Date d'émission                  | ✅          |
| C       | ClientNom       | Texte     | Nom du client                    | ✅          |
| D       | ClientEmail     | Email     | Email du client                  | ❌          |
| E       | ClientTel       | Texte     | Téléphone du client              | ❌          |
| F       | ClientAdresse   | Texte     | Adresse du client                | ❌          |
| G       | Designation     | Texte     | Description du produit/service   | ✅          |
| H       | Quantite        | Nombre    | Quantité vendue                  | ✅          |
| I       | PrixUnitaire    | Nombre    | Prix unitaire (FCFA)             | ✅          |
| J       | MontantTotal    | Nombre    | Montant total = Qté × PU         | ✅          |
| K       | Statut          | Liste     | "Brouillon" / "Générée" / "Envoyée" | ✅    |
| L       | URLFacture      | URL       | Lien vers le PDF généré          | Auto        |

### Feuille "Parametres" (configuration)

| Colonne | Nom en-tête           | Valeur                           |
|---------|-----------------------|----------------------------------|
| A       | ID_TEMPLATE_DOCS      | ID du template Google Docs       |
| B       | ID_DOSSIER_DRIVE      | ID du dossier de destination     |
| C       | EMAIL_EXPEDITEUR      | Email d'envoi des factures       |
| D       | ENTREPRISE_NOM        | Nom de l'entreprise              |
| E       | ENTREPRISE_ADRESSE    | Adresse de l'entreprise          |
| F       | ENTREPRISE_TEL        | Téléphone de l'entreprise        |
| G       | ENTREPRISE_EMAIL      | Email de l'entreprise            |

---

## 📄 STRUCTURE DU TEMPLATE GOOGLE DOCS

### Marqueurs à remplacer dans le template

#### 1. Informations Entreprise
```
<<ENTREPRISE_NOM>>
<<ENTREPRISE_ADRESSE>>
<<ENTREPRISE_TEL>>
<<ENTREPRISE_EMAIL>>
```

#### 2. Informations Facture
```
<<FACTURE_ID>>
<<FACTURE_DATE>>
```

#### 3. Informations Client
```
<<CLIENT_NOM>>
<<CLIENT_EMAIL>>
<<CLIENT_TEL>>
<<CLIENT_ADRESSE>>
```

#### 4. Détails de la transaction
```
<<DESIGNATION>>
<<QUANTITE>>
<<PRIX_UNITAIRE>>
<<MONTANT_TOTAL>>
<<MONTANT_LETTRES>>
```

### Exemple de template Docs

```
                    [LOGO ENTREPRISE]
                <<ENTREPRISE_NOM>>
            <<ENTREPRISE_ADRESSE>>
        Tel: <<ENTREPRISE_TEL>> | Email: <<ENTREPRISE_EMAIL>>

═══════════════════════════════════════════════════════════

                        FACTURE N° <<FACTURE_ID>>
                        Date: <<FACTURE_DATE>>

───────────────────────────────────────────────────────────

CLIENT:
Nom:        <<CLIENT_NOM>>
Email:      <<CLIENT_EMAIL>>
Téléphone:  <<CLIENT_TEL>>
Adresse:    <<CLIENT_ADRESSE>>

───────────────────────────────────────────────────────────

DÉTAILS DE LA FACTURE:

Désignation:        <<DESIGNATION>>
Quantité:           <<QUANTITE>>
Prix Unitaire:      <<PRIX_UNITAIRE>> FCFA
─────────────────────────────────────────
MONTANT TOTAL:      <<MONTANT_TOTAL>> FCFA

Montant en lettres: <<MONTANT_LETTRES>>

═══════════════════════════════════════════════════════════

Merci de votre confiance.

Conditions de paiement: [À définir]
```

---

## 🔧 ARCHITECTURE DES SCRIPTS

### 1. **00_Config.js** - Configuration centralisée

**Rôle:** Stocker toutes les constantes et configurations

```javascript
const INVOICE_CONFIG = {
  SHEETS: {
    FACTURES: 'Factures',
    PARAMETRES: 'Parametres'
  },

  COLUMNS: {
    INVOICE_ID: 0,      // Colonne A
    DATE: 1,            // Colonne B
    CLIENT_NOM: 2,      // Colonne C
    CLIENT_EMAIL: 3,    // Colonne D
    CLIENT_TEL: 4,      // Colonne E
    CLIENT_ADRESSE: 5,  // Colonne F
    DESIGNATION: 6,     // Colonne G
    QUANTITE: 7,        // Colonne H
    PRIX_UNITAIRE: 8,   // Colonne I
    MONTANT_TOTAL: 9,   // Colonne J
    STATUT: 10,         // Colonne K
    URL_FACTURE: 11     // Colonne L
  },

  STATUTS: {
    BROUILLON: 'Brouillon',
    GENEREE: 'Générée',
    ENVOYEE: 'Envoyée'
  }
};
```

### 2. **01_Utils.js** - Fonctions utilitaires

**Rôle:** Fonctions réutilisables (conversion nombres en lettres, formatage dates, etc.)

**Fonctions principales:**
- `nombreEnToutesLettres(n)` - Convertit un nombre en texte français
- `formatDate(date)` - Formate une date en format français
- `validateEmail(email)` - Valide un email
- `getParam(key)` - Récupère un paramètre de la feuille Parametres

### 3. **02_DataCollector.js** - Collecte de données

**Rôle:** Extraire et valider les données du Sheet

**Fonctions principales:**
```javascript
// Récupère les données d'une facture par son ID
function getInvoiceDataById(invoiceId) {
  // Retourne un objet avec toutes les infos de la facture
}

// Récupère toutes les factures avec statut "Brouillon"
function getPendingInvoices() {
  // Retourne un tableau de factures à générer
}

// Met à jour le statut d'une facture
function updateInvoiceStatus(invoiceId, newStatus, pdfUrl = null) {
  // Met à jour colonne K (Statut) et L (URLFacture)
}
```

### 4. **03_InvoiceGenerator.js** - Génération de factures

**Rôle:** Créer le document, remplacer les marqueurs, générer le PDF

**Fonctions principales:**
```javascript
// Génère une facture pour un ID donné
function generateInvoiceById(invoiceId) {
  // 1. Récupère les données
  // 2. Récupère les paramètres entreprise
  // 3. Copie le template
  // 4. Remplace les marqueurs
  // 5. Génère le PDF
  // 6. Met à jour le statut
  // 7. Envoie l'email (optionnel)
}

// Génère toutes les factures en brouillon
function generateAllPendingInvoices() {
  // Boucle sur toutes les factures "Brouillon"
}

// Remplace les marqueurs dans le document
function replaceMarkers(doc, data) {
  // Remplace tous les <<MARQUEUR>>
}
```

### 5. **04_Main.js** - Point d'entrée

**Rôle:** Interface utilisateur et menu personnalisé

**Fonctions principales:**
```javascript
// Crée le menu personnalisé dans Google Sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📄 Factures')
    .addItem('✨ Générer toutes les factures', 'generateAllPendingInvoices')
    .addItem('🔍 Générer une facture spécifique', 'generateInvoicePrompt')
    .addItem('⚙️ Tester les permissions', 'testPermissions')
    .addToUi();
}

// Demande à l'utilisateur quel ID générer
function generateInvoicePrompt() {
  // UI.prompt pour demander l'InvoiceID
}

// Teste les accès Drive, Docs, Gmail
function testPermissions() {
  // Vérifie que toutes les permissions sont OK
}
```

---

## 🔄 WORKFLOW COMPLET

### Étape 1: Configuration initiale
1. Utilisateur crée un Google Sheet avec la structure "Factures"
2. Utilisateur crée un template Google Docs avec les marqueurs
3. Utilisateur remplit la feuille "Parametres" avec les IDs et infos entreprise
4. Utilisateur installe les scripts via clasp

### Étape 2: Génération manuelle
1. Utilisateur remplit une ligne dans "Factures" (statut = "Brouillon")
2. Utilisateur clique sur menu "Factures > Générer toutes les factures"
3. Script récupère toutes les lignes avec statut "Brouillon"
4. Pour chaque ligne:
   - Copie le template
   - Remplace les marqueurs
   - Génère le PDF
   - Sauvegarde dans Drive
   - Met à jour le statut → "Générée"
   - Met à jour l'URL du PDF

### Étape 3: Génération automatique (optionnelle)
1. Création d'un trigger automatique (chaque jour à 8h, ou sur modification du Sheet)
2. Le script vérifie automatiquement les nouveaux brouillons
3. Génération et envoi automatiques

---

## 🔐 PERMISSIONS REQUISES

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/gmail.send"
  ]
}
```

---

## 📦 INSTALLATION ET DÉPLOIEMENT

### Prérequis
```bash
npm install -g @google/clasp
clasp login
```

### Étapes de déploiement
1. Cloner le repo: `git clone [repo_url]`
2. Aller dans invoice_auto: `cd invoice_auto/src`
3. Créer un nouveau projet Apps Script: `clasp create --type standalone --title "Invoice Auto Generator"`
4. Pousser le code: `clasp push`
5. Ouvrir le projet: `clasp open`
6. Exécuter la fonction `testPermissions()` pour autoriser les accès
7. Lier le script à votre Google Sheet via Extensions > Apps Script

---

## ✅ VALIDATION DU MASTER PROMPT

Avant de procéder à l'implémentation, veuillez valider les points suivants:

### Questions de validation:

1. **Structure du Sheet**: La structure proposée (12 colonnes) vous convient-elle? Y a-t-il des colonnes à ajouter/supprimer?

2. **Template Docs**: Le format de facture proposé correspond-il à vos besoins? Faut-il ajouter d'autres informations (TVA, logo, numéro SIRET, etc.)?

3. **Workflow**: Préférez-vous:
   - Génération manuelle uniquement (via menu)
   - Génération automatique (trigger sur modification)
   - Les deux options

4. **Envoi d'emails**: Voulez-vous que le système envoie automatiquement les factures par email aux clients?

5. **Multi-lignes**: Une facture peut-elle contenir plusieurs lignes de produits/services? (Actuellement: 1 ligne = 1 facture)

6. **Personnalisation**: Y a-t-il des éléments spécifiques à votre entreprise à intégrer?

---

## 🚀 PROCHAINES ÉTAPES

Une fois ce master prompt validé et ajusté selon vos besoins:

1. ✅ Création de la structure de dossier complète
2. ✅ Implémentation de tous les fichiers .js
3. ✅ Création des templates de documentation
4. ✅ Tests et validation
5. ✅ Déploiement

---

**Version:** 1.0
**Date:** 2025-12-11
**Auteur:** Claude Code
