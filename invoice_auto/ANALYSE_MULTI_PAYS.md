# Invoice Flash - Analyse et Architecture Multi-Pays (FR/CM/US)

**Date**: 2025-12-14
**Version**: 2.0
**Auteur**: Claude Code - Expert Apps Script + Facturation Multi-Pays

---

## 1. RESUME DE MA COMPREHENSION DU PROJET

### 1.1 Objectif d'Invoice Flash

Invoice Flash est un mini-produit permettant de generer automatiquement des factures professionnelles depuis Google Sheets vers Google Docs/PDF, avec envoi par email.

### 1.2 Flux Actuel (Schema)

```
+-------------------+     +------------------+     +-------------------+
|  GOOGLE SHEETS    |     |   APPS SCRIPT    |     |   GOOGLE DOCS     |
|                   |     |                  |     |                   |
| [Invoices]        |---->| generateInvoice  |---->| Template Copy     |
| - Client info     |     | - Validation     |     | - Replace markers |
| - Service/Product |     | - Data collect   |     | - Format          |
| - Amounts         |     | - Markers replace|     |                   |
|                   |     |                  |     +--------+----------+
| [Settings]        |---->| Config loading   |              |
| - Template ID     |     |                  |              v
| - Folder ID       |     |                  |     +-------------------+
| - Company info    |     |                  |     |   GOOGLE DRIVE    |
|                   |     |                  |     |                   |
| [Clients]         |---->| Client lookup    |     | /ClientFolder/    |
| - Base clients    |     |                  |     |   - Invoice.pdf   |
|                   |     |                  |     |   - Invoice.doc   |
| [Services]        |---->| Service catalog  |     +--------+----------+
| - Catalogue       |     |                  |              |
+-------------------+     +------------------+              v
                                                  +-------------------+
                                                  |   GMAIL           |
                                                  |                   |
                                                  | Email + PDF joint |
                                                  +-------------------+
```

### 1.3 Architecture des Fichiers Scripts Actuels

| Fichier | Role | Fonctions Cles |
|---------|------|----------------|
| `00_Config.js` | Configuration centralisee | `INVOICE_CONFIG`, markers, messages bilingues EN/FR |
| `01_Utils.js` | Utilitaires | `getParam()`, `formatAmount()`, `numberToWordsFR/EN()`, `generateNextInvoiceId()` |
| `02_DataCollector.js` | Collecte donnees | `getInvoiceDataById()`, `getInvoicesByStatus()`, `updateInvoiceStatus()` |
| `03_InvoiceGenerator.js` | Generation factures | `generateInvoiceById()`, `replaceMarkers()`, `sendInvoiceEmail()` |
| `04_Main.js` | Menu et UI | `onOpen()`, menus, `testAllPermissions()` |
| `05_SetupWizard.js` | Installation | `launchSetupWizard()`, `autoConfigureSettings()` |
| `06_NewInvoice.js` | Creation factures | `menuAddNewInvoice()`, formulaire HTML, `createNewInvoice()` |
| `07_Services.js` | Catalogue services | `getAllServices()`, `createNewService()` |
| `08_SendEmail.js` | Envoi email | Templates email bilingues |
| `09_Statistics.js` | Statistiques | Dashboard HTML avec graphiques |

### 1.4 Points Forts du Systeme Actuel

- Interface bilingue (EN/FR) bien implementee
- Formulaire HTML moderne pour creation de factures
- Organisation client par sous-dossiers Drive
- Conversion montant en lettres (FR/EN)
- Catalogue services avec prix par defaut
- Statistiques visuelles modernes
- Wizard d'installation guide

### 1.5 Limitations Actuelles

1. **Pas de gestion multi-pays** - Pas de champs SIRET, NIU, EIN, etc.
2. **Un seul template** - Pas de variante par pays
3. **Mentions legales absentes** - Pas de footer dynamique selon reglementation
4. **TVA basique** - Pas de gestion multi-taux ni recapitulatif TVA
5. **Pas d'identifiants reglementaires** - Ni pour vendeur ni pour client

---

## 2. STRATEGIE DE TEMPLATES ET PLACEHOLDERS

### 2.1 Approche Recommandee: UN SEUL TEMPLATE INTELLIGENT

**Choix**: Un template Google Docs unique avec placeholders optionnels et blocs conditionnels.

#### Avantages
- Maintenance simplifiee (un seul fichier a mettre a jour)
- Personnalisation facile par l'utilisateur
- Logique de suppression des blocs vides geree par Apps Script
- Extensible a de nouveaux pays sans creer de nouveaux templates

#### Inconvenients
- Template plus complexe visuellement (nombreux placeholders)
- Logique Apps Script plus elaboree pour nettoyer les blocs inutilises

### 2.2 Liste Complete des Placeholders

#### 2.2.1 Informations Entreprise (Vendeur)

| Placeholder | Description | FR | CM | US |
|-------------|-------------|:--:|:--:|:--:|
| `{{COMPANY_NAME}}` | Nom de l'entreprise | X | X | X |
| `{{COMPANY_ADDRESS}}` | Adresse complete | X | X | X |
| `{{COMPANY_PHONE}}` | Telephone | X | X | X |
| `{{COMPANY_EMAIL}}` | Email | X | X | X |
| `{{COMPANY_LOGO}}` | Logo (optionnel) | X | X | X |
| `{{COMPANY_WEBSITE}}` | Site web | X | X | X |
| **Identifiants FR** |
| `{{COMPANY_SIRET}}` | SIRET (14 chiffres) | X | - | - |
| `{{COMPANY_SIREN}}` | SIREN (9 chiffres) | X | - | - |
| `{{COMPANY_VAT_FR}}` | N TVA intracommunautaire | X | - | - |
| `{{COMPANY_RCS}}` | RCS + ville | X | - | - |
| `{{COMPANY_CAPITAL}}` | Capital social | X | - | - |
| `{{COMPANY_LEGAL_FORM}}` | Forme juridique (SARL, SAS...) | X | - | - |
| **Identifiants CM** |
| `{{COMPANY_NIU}}` | NIU (Numero Identifiant Unique) | - | X | - |
| `{{COMPANY_RCCM}}` | RCCM (Registre Commerce) | - | X | - |
| `{{COMPANY_TAX_CENTER}}` | Centre des impots rattachement | - | X | - |
| **Identifiants US** |
| `{{COMPANY_EIN}}` | EIN (Employer ID Number) | - | - | X |
| `{{COMPANY_STATE_ID}}` | State Tax ID | - | - | X |

#### 2.2.2 Informations Client

| Placeholder | Description | FR | CM | US |
|-------------|-------------|:--:|:--:|:--:|
| `{{CLIENT_NAME}}` | Nom du client | X | X | X |
| `{{CLIENT_ADDRESS}}` | Adresse complete | X | X | X |
| `{{CLIENT_EMAIL}}` | Email | X | X | X |
| `{{CLIENT_PHONE}}` | Telephone | X | X | X |
| **Identifiants Client FR** |
| `{{CLIENT_SIRET}}` | SIRET client | X | - | - |
| `{{CLIENT_VAT_NUMBER}}` | N TVA client | X | - | - |
| **Identifiants Client CM** |
| `{{CLIENT_NIU}}` | NIU client | - | X | - |
| **Identifiants Client US** |
| `{{CLIENT_TAX_ID}}` | Tax ID client | - | - | X |

#### 2.2.3 Informations Facture

| Placeholder | Description |
|-------------|-------------|
| `{{INVOICE_ID}}` | Numero de facture |
| `{{INVOICE_DATE}}` | Date d'emission |
| `{{INVOICE_DUE_DATE}}` | Date d'echeance |
| `{{DELIVERY_DATE}}` | Date de livraison (si applicable) |
| `{{PAYMENT_TERMS}}` | Conditions de paiement |
| `{{PAYMENT_METHOD}}` | Mode de paiement accepte |
| `{{PO_NUMBER}}` | Numero de commande client (optionnel) |

#### 2.2.4 Lignes de Facture et Totaux

| Placeholder | Description |
|-------------|-------------|
| `{{ITEMS_TABLE}}` | Tableau des lignes (genere dynamiquement) |
| `{{SUBTOTAL_HT}}` | Sous-total HT |
| `{{TVA_DETAILS}}` | Detail TVA par taux (tableau) |
| `{{TOTAL_TVA}}` | Total TVA |
| `{{TOTAL_TTC}}` | Total TTC |
| `{{TOTAL_AMOUNT}}` | Montant total (alias TTC) |
| `{{AMOUNT_IN_WORDS}}` | Montant en lettres |
| `{{DISCOUNT}}` | Remise (si applicable) |
| `{{DEPOSIT_PAID}}` | Acompte verse |
| `{{BALANCE_DUE}}` | Reste a payer |

#### 2.2.5 Mentions Legales et Footer

| Placeholder | Description | Contenu |
|-------------|-------------|---------|
| `{{LEGAL_FOOTER}}` | Footer legal complet | Genere selon pays |
| `{{VAT_EXEMPTION_FR}}` | Mention exoneration TVA FR | "TVA non applicable, art. 293 B du CGI" |
| `{{LATE_PAYMENT_FR}}` | Penalites retard FR | "Indemnite forfaitaire 40EUR..." |
| `{{ESCOMPTE_FR}}` | Escompte FR | "Pas d'escompte pour paiement anticipe" |
| `{{LEGAL_NOTICE_CM}}` | Mention legale CM | "Arretee la presente facture a..." |
| `{{SALES_TAX_US}}` | Mention sales tax US | Variable selon etat |
| `{{BANK_DETAILS}}` | Coordonnees bancaires | IBAN, BIC, etc. |

### 2.3 Structure du Template Google Docs

```
+========================================================================+
|  [LOGO]              {{COMPANY_NAME}}                                  |
|                      {{COMPANY_ADDRESS}}                               |
|                      Tel: {{COMPANY_PHONE}} | {{COMPANY_EMAIL}}        |
|                      {{COMPANY_WEBSITE}}                               |
|  ----------------------- IDENTIFIANTS VENDEUR ------------------------ |
|  {{COMPANY_LEGAL_IDS_BLOCK}}                                          |
|  (SIRET/SIREN/TVA ou NIU/RCCM ou EIN selon pays)                      |
+========================================================================+

                        {{LABEL_INVOICE}} N {{INVOICE_ID}}

                        {{LABEL_DATE}}: {{INVOICE_DATE}}
                        {{LABEL_DUE_DATE}}: {{INVOICE_DUE_DATE}}
                        {{LABEL_DELIVERY_DATE}}: {{DELIVERY_DATE}}

+------------------------------------------------------------------------+
|  {{LABEL_BILLED_TO}}                                                   |
|  {{CLIENT_NAME}}                                                       |
|  {{CLIENT_ADDRESS}}                                                    |
|  {{CLIENT_PHONE}} | {{CLIENT_EMAIL}}                                   |
|  {{CLIENT_LEGAL_IDS_BLOCK}}                                           |
+------------------------------------------------------------------------+

+========================================================================+
| {{LABEL_DESCRIPTION}} | {{LABEL_QTY}} | {{LABEL_UNIT_PRICE}} | {{LABEL_TVA}} | {{LABEL_TOTAL}} |
+========================+===============+=======================+===============+=================+
| {{ITEMS_TABLE}}                                                        |
+========================================================================+

+------------------------------------------------------------------------+
|                                          Sous-total HT: {{SUBTOTAL_HT}}|
|                                          {{TVA_DETAILS}}               |
|                                          -----------------------------|
|                                          TOTAL TTC: {{TOTAL_TTC}}      |
+------------------------------------------------------------------------+

{{AMOUNT_IN_WORDS_BLOCK}}
"Arretee la presente facture a la somme de: {{AMOUNT_IN_WORDS}}"

+========================================================================+
|  COORDONNEES BANCAIRES                                                 |
|  {{BANK_DETAILS}}                                                      |
+========================================================================+

+========================================================================+
|  MENTIONS LEGALES                                                      |
|  {{LEGAL_FOOTER}}                                                      |
+========================================================================+

                           [Cachet et Signature]
```

### 2.4 Gestion des Champs Optionnels

La strategie de nettoyage des placeholders non utilises:

```javascript
// Pseudo-code pour nettoyer les blocs vides
function cleanUnusedPlaceholders(body, country) {
  // 1. Supprimer les blocs entiers si vides
  const blocksToRemove = {
    'FR': ['{{COMPANY_NIU}}', '{{COMPANY_RCCM}}', '{{CLIENT_NIU}}', '{{COMPANY_EIN}}'],
    'CM': ['{{COMPANY_SIRET}}', '{{COMPANY_VAT_FR}}', '{{CLIENT_SIRET}}', '{{COMPANY_EIN}}'],
    'US': ['{{COMPANY_SIRET}}', '{{COMPANY_NIU}}', '{{CLIENT_NIU}}', '{{COMPANY_VAT_FR}}']
  };

  // 2. Remplacer les placeholders non pertinents par ""
  blocksToRemove[country].forEach(placeholder => {
    body.replaceText(placeholder, '');
  });

  // 3. Supprimer les lignes vides residuelles
  // ... logique de nettoyage des paragraphes vides
}
```

---

## 3. AMELIORATIONS GOOGLE SHEETS

### 3.1 Structure Proposee des Feuilles

#### Feuille `Settings` (Configuration)

| Parametre | Valeur Exemple | Description |
|-----------|----------------|-------------|
| **GENERAL** |
| `COUNTRY` | FR / CM / US | Pays de l'entreprise |
| `LOCALE` | FR / EN | Langue de l'interface |
| `CURRENCY_CODE` | EUR / XAF / USD | Code devise |
| `CURRENCY_SYMBOL` | EUR / FCFA / $ | Symbole devise |
| `DATE_FORMAT` | DD/MM/YYYY | Format date |
| `TEMPLATE_DOCS_ID` | [ID] | ID du template Google Docs |
| `DRIVE_FOLDER_ID` | [ID] | ID dossier destination |
| `AUTO_SEND_EMAIL` | false | Envoi auto email |
| `INVOICE_PREFIX` | INV2025- | Prefixe factures |
| **ENTREPRISE** |
| `COMPANY_NAME` | Ma Societe SARL | Nom |
| `COMPANY_ADDRESS` | 123 Rue, Ville | Adresse |
| `COMPANY_PHONE` | +33... | Telephone |
| `COMPANY_EMAIL` | contact@... | Email |
| `COMPANY_WEBSITE` | www... | Site web |
| `COMPANY_LOGO_URL` | [URL] | URL logo |
| **IDENTIFIANTS FR** |
| `COMPANY_SIRET` | 12345678901234 | SIRET |
| `COMPANY_SIREN` | 123456789 | SIREN |
| `COMPANY_VAT_FR` | FR12345678901 | N TVA |
| `COMPANY_RCS` | RCS Paris B 123 456 789 | RCS |
| `COMPANY_CAPITAL` | 10 000 EUR | Capital |
| `COMPANY_LEGAL_FORM` | SARL | Forme juridique |
| `IS_AUTO_ENTREPRENEUR` | false | Regime AE |
| **IDENTIFIANTS CM** |
| `COMPANY_NIU` | M012345678901X | NIU |
| `COMPANY_RCCM` | RC/DLA/2020/B/1234 | RCCM |
| `COMPANY_TAX_CENTER` | CDI Douala | Centre impots |
| **IDENTIFIANTS US** |
| `COMPANY_EIN` | 12-3456789 | EIN |
| `COMPANY_STATE_ID` | [ID] | State Tax ID |
| `SALES_TAX_RATE` | 0 | Taux sales tax |
| **BANQUE** |
| `BANK_NAME` | BNP Paribas | Nom banque |
| `BANK_IBAN` | FR76... | IBAN |
| `BANK_BIC` | BNPAFRPP | BIC/SWIFT |
| `BANK_ACCOUNT_NAME` | Ma Societe SARL | Titulaire |
| **TVA** |
| `DEFAULT_VAT_RATE` | 20 | Taux TVA par defaut |
| `VAT_RATES_LIST` | 20,10,5.5,0 | Taux disponibles (FR) |

#### Feuille `Clients` (Base Clients)

| Colonne | Header | Type | Description |
|---------|--------|------|-------------|
| A | ClientID | Texte | ID unique (CLI-001) |
| B | ClientName | Texte | Nom/Raison sociale |
| C | ClientEmail | Email | Email |
| D | ClientPhone | Texte | Telephone |
| E | ClientAddress | Texte | Adresse |
| F | ClientCountry | Liste | FR/CM/US |
| G | ClientSIRET | Texte | SIRET (FR) |
| H | ClientVATNumber | Texte | N TVA (FR) |
| I | ClientNIU | Texte | NIU (CM) |
| J | ClientTaxID | Texte | Tax ID (US) |
| K | PaymentTerms | Texte | Delai paiement (30 jours) |
| L | Notes | Texte | Notes internes |
| M | Active | Boolean | Client actif |

#### Feuille `Services` (Catalogue)

| Colonne | Header | Type | Description |
|---------|--------|------|-------------|
| A | ServiceID | Texte | ID unique (SRV-001) |
| B | ServiceName | Texte | Nom du service |
| C | Description | Texte | Description complete |
| D | DefaultPrice | Nombre | Prix unitaire HT |
| E | Category | Texte | Categorie |
| F | VATRate | Nombre | Taux TVA applicable |
| G | Unit | Texte | Unite (heure, jour, piece) |
| H | Active | Boolean | Service actif |

#### Feuille `Invoices` (Factures)

| Colonne | Header | Type | Description |
|---------|--------|------|-------------|
| A | InvoiceID | Texte | ID facture unique |
| B | InvoiceDate | Date | Date emission |
| C | DueDate | Date | Date echeance |
| D | ClientID | Texte | Reference client |
| E | ClientName | Texte | Nom client (denormalise) |
| F | ClientEmail | Texte | Email client |
| G | ClientPhone | Texte | Tel client |
| H | ClientAddress | Texte | Adresse client |
| I | Description | Texte | Description ligne |
| J | Quantity | Nombre | Quantite |
| K | UnitPrice | Nombre | Prix unitaire HT |
| L | VATRate | Nombre | Taux TVA (%) |
| M | VATAmount | Nombre | Montant TVA |
| N | LineTotal | Nombre | Total ligne TTC |
| O | TotalHT | Nombre | Total HT facture |
| P | TotalTVA | Nombre | Total TVA facture |
| Q | TotalTTC | Nombre | Total TTC facture |
| R | Status | Liste | Draft/Generated/Sent |
| S | PDFUrl | URL | Lien PDF genere |
| T | DocUrl | URL | Lien Google Doc |
| U | CreatedAt | DateTime | Date creation |
| V | GeneratedAt | DateTime | Date generation |
| W | SentAt | DateTime | Date envoi |
| X | Notes | Texte | Notes internes |

#### Feuille `InvoiceLines` (Lignes multi-produits - NOUVELLE)

Pour supporter plusieurs lignes par facture:

| Colonne | Header | Type | Description |
|---------|--------|------|-------------|
| A | LineID | Texte | ID ligne unique |
| B | InvoiceID | Texte | Reference facture |
| C | ServiceID | Texte | Reference service |
| D | Description | Texte | Description |
| E | Quantity | Nombre | Quantite |
| F | UnitPrice | Nombre | Prix unitaire HT |
| G | VATRate | Nombre | Taux TVA |
| H | VATAmount | Nombre | Montant TVA |
| I | LineTotal | Nombre | Total ligne TTC |

### 3.2 Validations de Donnees Recommandees

```javascript
// Validation Pays (Settings!B2)
const countryValidation = ['FR', 'CM', 'US', 'OTHER'];

// Validation Devise
const currencyValidation = {
  'FR': ['EUR'],
  'CM': ['XAF'],
  'US': ['USD']
};

// Validation Taux TVA (France)
const vatRatesFR = [20, 10, 5.5, 2.1, 0];

// Validation Taux TVA (Cameroun)
const vatRatesCM = [19.25, 0]; // TVA standard CM

// Validation Status Facture
const statusValidation = ['Draft', 'Generated', 'Sent', 'Paid', 'Cancelled'];

// Validation Format SIRET (14 chiffres)
const siretRegex = /^\d{14}$/;

// Validation Format NIU Cameroun
const niuRegex = /^M\d{12}[A-Z]$/;
```

---

## 4. AMELIORATIONS GOOGLE DOCS TEMPLATE

### 4.1 Structure du Template Recommande

Je propose un template unique avec des **blocs conditionnels** marques par des commentaires ou balises speciales:

```
<!-- BLOCK_HEADER_FR -->
<!-- BLOCK_HEADER_CM -->
<!-- BLOCK_HEADER_US -->
```

Mais pour simplifier, on utilisera plutot des **placeholders concatenes** dans le footer.

### 4.2 Sections du Template

#### Section 1: En-tete Entreprise

```
[LOGO]
{{COMPANY_NAME}}
{{COMPANY_ADDRESS}}
Tel: {{COMPANY_PHONE}} | Email: {{COMPANY_EMAIL}}
{{COMPANY_WEBSITE}}

{{COMPANY_LEGAL_IDS}}
```

Le placeholder `{{COMPANY_LEGAL_IDS}}` sera remplace par le bloc approprie:
- **FR**: `SIRET: {{SIRET}} | TVA: {{VAT}} | RCS: {{RCS}}`
- **CM**: `NIU: {{NIU}} | RCCM: {{RCCM}} | Centre: {{TAX_CENTER}}`
- **US**: `EIN: {{EIN}} | State ID: {{STATE_ID}}`

#### Section 2: Titre et Dates

```
                    {{LABEL_INVOICE}} N {{INVOICE_ID}}

{{LABEL_DATE}}: {{INVOICE_DATE}}
{{LABEL_DUE_DATE}}: {{INVOICE_DUE_DATE}}
{{LABEL_PO}}: {{PO_NUMBER}}
```

#### Section 3: Informations Client

```
{{LABEL_BILLED_TO}}:

{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}
Tel: {{CLIENT_PHONE}}
Email: {{CLIENT_EMAIL}}
{{CLIENT_LEGAL_IDS}}
```

#### Section 4: Tableau des Lignes

```
+-------------------------------------------------------------------+
| DESCRIPTION | QTE | PRIX U. HT | TVA % | TVA | TOTAL TTC |
+-------------------------------------------------------------------+
| {{LINE_1_DESC}} | {{LINE_1_QTY}} | {{LINE_1_PRICE}} | {{LINE_1_VAT_RATE}} | {{LINE_1_VAT}} | {{LINE_1_TOTAL}} |
| {{LINE_2_DESC}} | ... | ... | ... | ... | ... |
| ... jusqu'a LINE_20 pour supporter 20 lignes max |
+-------------------------------------------------------------------+
```

**Alternative recommandee**: Generer le tableau HTML/Markdown dans Apps Script et l'inserer comme un bloc.

#### Section 5: Recapitulatif

```
                              Sous-total HT: {{SUBTOTAL_HT}}

                              {{TVA_SUMMARY}}

                              ------------------------
                              TOTAL TTC: {{TOTAL_TTC}}
```

Le `{{TVA_SUMMARY}}` affiche le detail par taux:
```
TVA 20%: 200.00 EUR
TVA 10%: 50.00 EUR
TVA 5.5%: 27.50 EUR
```

#### Section 6: Montant en Lettres (CM obligatoire)

```
{{AMOUNT_IN_WORDS_BLOCK}}
```

Genere: `Arretee la presente facture a la somme de: Cinquante mille francs CFA`

#### Section 7: Coordonnees Bancaires

```
COORDONNEES BANCAIRES:
{{BANK_NAME}}
IBAN: {{BANK_IBAN}}
BIC: {{BANK_BIC}}
Titulaire: {{BANK_ACCOUNT_NAME}}
```

#### Section 8: Mentions Legales (Footer Dynamique)

```
{{LEGAL_FOOTER}}
```

Ce placeholder unique est remplace par le contenu complet selon le pays.

### 4.3 Contenu des Footers Legaux par Pays

#### Footer France (FR)

```
CONDITIONS DE PAIEMENT
Paiement a reception / sous 30 jours.
{{VAT_EXEMPTION_NOTICE}}

PENALITES DE RETARD
En cas de retard de paiement, une penalite de 3 fois le taux d'interet legal sera appliquee,
ainsi qu'une indemnite forfaitaire de 40 EUR pour frais de recouvrement (Art. L441-10 Code de commerce).

Pas d'escompte pour paiement anticipe.

{{COMPANY_NAME}} - {{COMPANY_LEGAL_FORM}} au capital de {{COMPANY_CAPITAL}}
SIRET: {{COMPANY_SIRET}} - RCS {{COMPANY_RCS}}
{{VAT_NUMBER_LINE}}
```

Si auto-entrepreneur: `{{VAT_EXEMPTION_NOTICE}}` = "TVA non applicable, art. 293 B du CGI"

#### Footer Cameroun (CM)

```
CONDITIONS DE REGLEMENT
Paiement comptant / sous 30 jours.

MENTIONS OBLIGATOIRES
Arretee la presente facture a la somme de: {{AMOUNT_IN_WORDS}}

{{COMPANY_NAME}}
NIU: {{COMPANY_NIU}}
RCCM: {{COMPANY_RCCM}}
Centre des impots de rattachement: {{COMPANY_TAX_CENTER}}

Pour toute reclamation, contacter: {{COMPANY_EMAIL}} | {{COMPANY_PHONE}}
```

#### Footer USA (US)

```
PAYMENT TERMS
Payment due upon receipt / Net 30.

{{SALES_TAX_NOTICE}}

{{COMPANY_NAME}}
EIN: {{COMPANY_EIN}}
{{STATE_ID_LINE}}

For questions regarding this invoice, please contact: {{COMPANY_EMAIL}}
```

---

## 5. AMELIORATIONS APPS SCRIPT

### 5.1 Nouvelle Architecture des Fichiers

Je propose de reorganiser et d'ajouter des modules:

```
src/
  00_Config.js           # Configuration (existant, a enrichir)
  01_Utils.js            # Utilitaires (existant, a enrichir)
  02_DataCollector.js    # Collecte donnees (existant)
  03_InvoiceGenerator.js # Generation (existant, a modifier)
  04_Main.js             # Menu UI (existant)
  05_SetupWizard.js      # Installation (existant, a enrichir)
  06_NewInvoice.js       # Creation factures (existant, a enrichir)
  07_Services.js         # Catalogue (existant)
  08_SendEmail.js        # Email (existant)
  09_Statistics.js       # Stats (existant)

  # NOUVEAUX FICHIERS
  10_CountryConfig.js    # Configuration par pays
  11_LegalFooter.js      # Generation footer legal
  12_VatCalculator.js    # Calcul TVA multi-taux
  13_PlaceholderCleaner.js # Nettoyage placeholders
  14_MultiLineInvoice.js # Support multi-lignes
```

### 5.2 Nouveau Fichier: 10_CountryConfig.js

```javascript
/**
 * @file 10_CountryConfig.js
 * @description Configuration specifique par pays
 */

const COUNTRY_CONFIG = {
  FR: {
    name: 'France',
    currency: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
    dateFormat: 'DD/MM/YYYY',
    vatRates: [20, 10, 5.5, 2.1, 0],
    defaultVatRate: 20,
    requiredCompanyFields: ['SIRET', 'RCS'],
    optionalCompanyFields: ['VAT_FR', 'CAPITAL', 'LEGAL_FORM'],
    requiredClientFields: [],
    optionalClientFields: ['SIRET', 'VAT_NUMBER'],
    amountInWords: false, // Optionnel en France
    legalMentions: {
      vatExemption: 'TVA non applicable, art. 293 B du CGI',
      latePayment: 'Penalite de retard: 3x taux interet legal + 40EUR indemnite forfaitaire',
      noDiscount: 'Pas d\'escompte pour paiement anticipe'
    },
    labels: {
      invoice: 'FACTURE',
      date: 'Date',
      dueDate: 'Echeance',
      billedTo: 'Facture a',
      description: 'DESIGNATION',
      quantity: 'QTE',
      unitPrice: 'PRIX U. HT',
      vat: 'TVA',
      total: 'TOTAL TTC',
      subtotal: 'Sous-total HT',
      totalVat: 'Total TVA',
      totalTtc: 'Total TTC',
      footer: 'Merci pour votre confiance.'
    }
  },

  CM: {
    name: 'Cameroun',
    currency: { code: 'XAF', symbol: 'FCFA', locale: 'fr-CM' },
    dateFormat: 'DD/MM/YYYY',
    vatRates: [19.25, 0],
    defaultVatRate: 19.25,
    requiredCompanyFields: ['NIU', 'RCCM', 'TAX_CENTER'],
    optionalCompanyFields: [],
    requiredClientFields: [],
    optionalClientFields: ['NIU'],
    amountInWords: true, // OBLIGATOIRE au Cameroun
    legalMentions: {
      amountInWordsPrefix: 'Arretee la presente facture a la somme de:',
      vatNote: 'TVA incluse au taux de 19,25%'
    },
    labels: {
      invoice: 'FACTURE',
      date: 'Date',
      dueDate: 'Echeance',
      billedTo: 'Facture a',
      description: 'DESIGNATION',
      quantity: 'QTE',
      unitPrice: 'PRIX UNITAIRE',
      vat: 'TVA',
      total: 'MONTANT',
      subtotal: 'Sous-total HT',
      totalVat: 'Total TVA',
      totalTtc: 'NET A PAYER',
      footer: 'Merci pour votre confiance.'
    }
  },

  US: {
    name: 'United States',
    currency: { code: 'USD', symbol: '$', locale: 'en-US' },
    dateFormat: 'MM/DD/YYYY',
    vatRates: [], // Sales tax varie par etat
    defaultVatRate: 0,
    requiredCompanyFields: [],
    optionalCompanyFields: ['EIN', 'STATE_ID'],
    requiredClientFields: [],
    optionalClientFields: ['TAX_ID'],
    amountInWords: false,
    legalMentions: {
      salesTaxNote: 'Sales tax applied where applicable',
      paymentTerms: 'Payment due upon receipt'
    },
    labels: {
      invoice: 'INVOICE',
      date: 'Date',
      dueDate: 'Due Date',
      billedTo: 'Bill To',
      description: 'DESCRIPTION',
      quantity: 'QTY',
      unitPrice: 'UNIT PRICE',
      vat: 'TAX',
      total: 'AMOUNT',
      subtotal: 'Subtotal',
      totalVat: 'Sales Tax',
      totalTtc: 'TOTAL DUE',
      footer: 'Thank you for your business.'
    }
  }
};

/**
 * Recupere la configuration du pays actuel
 */
function getCountryConfig() {
  const country = getParam('COUNTRY') || 'FR';
  return COUNTRY_CONFIG[country] || COUNTRY_CONFIG.FR;
}

/**
 * Recupere les labels dans la langue/pays actuel
 */
function getCountryLabels() {
  return getCountryConfig().labels;
}
```

### 5.3 Nouveau Fichier: 11_LegalFooter.js

```javascript
/**
 * @file 11_LegalFooter.js
 * @description Generation du footer legal selon le pays
 */

/**
 * Genere le footer legal complet selon le pays
 * @param {string} country - Code pays (FR/CM/US)
 * @param {Object} companyData - Donnees entreprise
 * @param {Object} invoiceData - Donnees facture
 * @returns {string} Footer legal formate
 */
function generateLegalFooter(country, companyData, invoiceData) {
  switch(country) {
    case 'FR':
      return generateFrenchFooter(companyData, invoiceData);
    case 'CM':
      return generateCameroonFooter(companyData, invoiceData);
    case 'US':
      return generateUSFooter(companyData, invoiceData);
    default:
      return generateFrenchFooter(companyData, invoiceData);
  }
}

function generateFrenchFooter(company, invoice) {
  let footer = [];

  // Conditions de paiement
  footer.push('CONDITIONS DE PAIEMENT');
  footer.push('Paiement a reception.');
  footer.push('');

  // Mention TVA si auto-entrepreneur
  const isAE = getParam('IS_AUTO_ENTREPRENEUR') === 'true';
  if (isAE) {
    footer.push('TVA non applicable, art. 293 B du CGI');
    footer.push('');
  }

  // Penalites de retard
  footer.push('PENALITES DE RETARD');
  footer.push('En cas de retard de paiement, une penalite de 3 fois le taux d\'interet legal');
  footer.push('sera appliquee, ainsi qu\'une indemnite forfaitaire de 40 EUR pour frais');
  footer.push('de recouvrement (Art. L441-10 Code de commerce).');
  footer.push('');
  footer.push('Pas d\'escompte pour paiement anticipe.');
  footer.push('');

  // Informations legales entreprise
  const legalForm = company.legalForm || 'SARL';
  const capital = company.capital || '';
  footer.push(`${company.name} - ${legalForm}${capital ? ' au capital de ' + capital : ''}`);
  footer.push(`SIRET: ${company.siret || 'N/A'} - RCS ${company.rcs || 'N/A'}`);

  if (!isAE && company.vatNumber) {
    footer.push(`N TVA Intracommunautaire: ${company.vatNumber}`);
  }

  return footer.join('\n');
}

function generateCameroonFooter(company, invoice) {
  let footer = [];

  // Conditions de reglement
  footer.push('CONDITIONS DE REGLEMENT');
  footer.push('Paiement comptant.');
  footer.push('');

  // Montant en lettres (OBLIGATOIRE)
  const amountInWords = numberToWordsFR(invoice.totalAmount);
  footer.push('Arretee la presente facture a la somme de:');
  footer.push(amountInWords);
  footer.push('');

  // Informations legales
  footer.push(company.name);
  footer.push(`NIU: ${company.niu || 'N/A'}`);
  footer.push(`RCCM: ${company.rccm || 'N/A'}`);
  footer.push(`Centre des impots de rattachement: ${company.taxCenter || 'N/A'}`);
  footer.push('');
  footer.push(`Pour toute reclamation: ${company.email} | ${company.phone}`);

  return footer.join('\n');
}

function generateUSFooter(company, invoice) {
  let footer = [];

  // Payment terms
  footer.push('PAYMENT TERMS');
  footer.push('Payment due upon receipt.');
  footer.push('');

  // Sales tax notice
  const salesTaxRate = getParam('SALES_TAX_RATE');
  if (salesTaxRate && parseFloat(salesTaxRate) > 0) {
    footer.push(`Sales tax (${salesTaxRate}%) applied where applicable.`);
    footer.push('');
  }

  // Company info
  footer.push(company.name);
  if (company.ein) {
    footer.push(`EIN: ${company.ein}`);
  }
  if (company.stateId) {
    footer.push(`State Tax ID: ${company.stateId}`);
  }
  footer.push('');
  footer.push(`For questions: ${company.email}`);

  return footer.join('\n');
}
```

### 5.4 Nouveau Fichier: 12_VatCalculator.js

```javascript
/**
 * @file 12_VatCalculator.js
 * @description Calcul TVA multi-taux et recapitulatif
 */

/**
 * Calcule le recapitulatif TVA pour plusieurs lignes
 * @param {Array} lines - Lignes de facture [{quantity, unitPrice, vatRate}, ...]
 * @returns {Object} {subtotalHT, vatDetails: [{rate, base, amount}], totalVat, totalTTC}
 */
function calculateVatSummary(lines) {
  const vatByRate = {};
  let subtotalHT = 0;

  lines.forEach(line => {
    const lineHT = line.quantity * line.unitPrice;
    const vatRate = line.vatRate || 0;
    const vatAmount = lineHT * (vatRate / 100);

    subtotalHT += lineHT;

    if (!vatByRate[vatRate]) {
      vatByRate[vatRate] = { rate: vatRate, base: 0, amount: 0 };
    }
    vatByRate[vatRate].base += lineHT;
    vatByRate[vatRate].amount += vatAmount;
  });

  const vatDetails = Object.values(vatByRate).sort((a, b) => b.rate - a.rate);
  const totalVat = vatDetails.reduce((sum, v) => sum + v.amount, 0);
  const totalTTC = subtotalHT + totalVat;

  return {
    subtotalHT: Math.round(subtotalHT * 100) / 100,
    vatDetails: vatDetails,
    totalVat: Math.round(totalVat * 100) / 100,
    totalTTC: Math.round(totalTTC * 100) / 100
  };
}

/**
 * Formate le recapitulatif TVA pour affichage
 * @param {Array} vatDetails - Details TVA [{rate, base, amount}]
 * @param {string} currencySymbol - Symbole devise
 * @returns {string} Texte formate
 */
function formatVatSummary(vatDetails, currencySymbol) {
  if (!vatDetails || vatDetails.length === 0) {
    return 'TVA: 0.00 ' + currencySymbol;
  }

  return vatDetails.map(v => {
    const rateStr = v.rate.toFixed(v.rate % 1 === 0 ? 0 : 2);
    return `TVA ${rateStr}%: ${v.amount.toFixed(2)} ${currencySymbol}`;
  }).join('\n');
}
```

### 5.5 Nouveau Fichier: 13_PlaceholderCleaner.js

```javascript
/**
 * @file 13_PlaceholderCleaner.js
 * @description Nettoyage des placeholders non utilises
 */

/**
 * Nettoie tous les placeholders non utilises du document
 * @param {GoogleAppsScript.Document.Body} body - Corps du document
 * @param {string} country - Code pays
 */
function cleanUnusedPlaceholders(body, country) {
  // Liste des placeholders par pays
  const countryPlaceholders = {
    FR: {
      toRemove: [
        '{{COMPANY_NIU}}', '{{COMPANY_RCCM}}', '{{COMPANY_TAX_CENTER}}',
        '{{COMPANY_EIN}}', '{{COMPANY_STATE_ID}}',
        '{{CLIENT_NIU}}', '{{CLIENT_TAX_ID}}',
        '{{SALES_TAX_NOTICE}}', '{{STATE_ID_LINE}}'
      ]
    },
    CM: {
      toRemove: [
        '{{COMPANY_SIRET}}', '{{COMPANY_SIREN}}', '{{COMPANY_VAT_FR}}',
        '{{COMPANY_RCS}}', '{{COMPANY_CAPITAL}}', '{{COMPANY_LEGAL_FORM}}',
        '{{COMPANY_EIN}}', '{{COMPANY_STATE_ID}}',
        '{{CLIENT_SIRET}}', '{{CLIENT_VAT_NUMBER}}', '{{CLIENT_TAX_ID}}',
        '{{VAT_EXEMPTION_NOTICE}}', '{{SALES_TAX_NOTICE}}'
      ]
    },
    US: {
      toRemove: [
        '{{COMPANY_SIRET}}', '{{COMPANY_SIREN}}', '{{COMPANY_VAT_FR}}',
        '{{COMPANY_RCS}}', '{{COMPANY_CAPITAL}}', '{{COMPANY_LEGAL_FORM}}',
        '{{COMPANY_NIU}}', '{{COMPANY_RCCM}}', '{{COMPANY_TAX_CENTER}}',
        '{{CLIENT_SIRET}}', '{{CLIENT_VAT_NUMBER}}', '{{CLIENT_NIU}}',
        '{{VAT_EXEMPTION_NOTICE}}', '{{AMOUNT_IN_WORDS_BLOCK}}'
      ]
    }
  };

  const placeholdersToRemove = countryPlaceholders[country]?.toRemove || [];

  // Remplacer par vide
  placeholdersToRemove.forEach(placeholder => {
    body.replaceText(escapeRegex(placeholder), '');
  });

  // Nettoyer les lignes vides residuelles (optionnel)
  cleanEmptyParagraphs(body);
}

/**
 * Supprime les paragraphes vides consecutifs
 */
function cleanEmptyParagraphs(body) {
  const paragraphs = body.getParagraphs();
  let previousWasEmpty = false;

  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const text = paragraphs[i].getText().trim();
    const isLabelOnly = text.match(/^(NIU|SIRET|EIN|RCCM|RCS):\s*$/);

    if (text === '' || isLabelOnly) {
      if (previousWasEmpty) {
        // Supprimer le paragraphe si le precedent etait deja vide
        paragraphs[i].removeFromParent();
      }
      previousWasEmpty = true;
    } else {
      previousWasEmpty = false;
    }
  }
}

/**
 * Echappe les caracteres speciaux regex
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

### 5.6 Modifications a Apporter a 00_Config.js

Ajouter les nouveaux marqueurs:

```javascript
// A ajouter dans INVOICE_CONFIG.MARKERS
MARKERS: {
  // ... (existants) ...

  // Nouveaux marqueurs entreprise
  COMPANY_SIRET: '{{COMPANY_SIRET}}',
  COMPANY_SIREN: '{{COMPANY_SIREN}}',
  COMPANY_VAT_FR: '{{COMPANY_VAT_FR}}',
  COMPANY_RCS: '{{COMPANY_RCS}}',
  COMPANY_CAPITAL: '{{COMPANY_CAPITAL}}',
  COMPANY_LEGAL_FORM: '{{COMPANY_LEGAL_FORM}}',
  COMPANY_NIU: '{{COMPANY_NIU}}',
  COMPANY_RCCM: '{{COMPANY_RCCM}}',
  COMPANY_TAX_CENTER: '{{COMPANY_TAX_CENTER}}',
  COMPANY_EIN: '{{COMPANY_EIN}}',
  COMPANY_STATE_ID: '{{COMPANY_STATE_ID}}',
  COMPANY_LEGAL_IDS: '{{COMPANY_LEGAL_IDS}}',
  COMPANY_WEBSITE: '{{COMPANY_WEBSITE}}',

  // Nouveaux marqueurs client
  CLIENT_SIRET: '{{CLIENT_SIRET}}',
  CLIENT_VAT_NUMBER: '{{CLIENT_VAT_NUMBER}}',
  CLIENT_NIU: '{{CLIENT_NIU}}',
  CLIENT_TAX_ID: '{{CLIENT_TAX_ID}}',
  CLIENT_LEGAL_IDS: '{{CLIENT_LEGAL_IDS}}',

  // Nouveaux marqueurs facture
  DUE_DATE: '{{INVOICE_DUE_DATE}}',
  DELIVERY_DATE: '{{DELIVERY_DATE}}',
  PO_NUMBER: '{{PO_NUMBER}}',
  PAYMENT_TERMS: '{{PAYMENT_TERMS}}',

  // Totaux et TVA
  SUBTOTAL_HT: '{{SUBTOTAL_HT}}',
  TVA_SUMMARY: '{{TVA_SUMMARY}}',
  TOTAL_TVA: '{{TOTAL_TVA}}',
  TOTAL_TTC: '{{TOTAL_TTC}}',

  // Footer et mentions
  LEGAL_FOOTER: '{{LEGAL_FOOTER}}',
  VAT_EXEMPTION_NOTICE: '{{VAT_EXEMPTION_NOTICE}}',
  AMOUNT_IN_WORDS_BLOCK: '{{AMOUNT_IN_WORDS_BLOCK}}',
  BANK_DETAILS: '{{BANK_DETAILS}}',

  // Labels dynamiques
  LABEL_DUE_DATE: '{{LABEL_DUE_DATE}}',
  LABEL_DELIVERY_DATE: '{{LABEL_DELIVERY_DATE}}',
  LABEL_SUBTOTAL: '{{LABEL_SUBTOTAL}}',
  LABEL_TOTAL_VAT: '{{LABEL_TOTAL_VAT}}',
  LABEL_TOTAL_TTC: '{{LABEL_TOTAL_TTC}}'
}
```

### 5.7 Modifications a Apporter a 03_InvoiceGenerator.js

La fonction `replaceMarkers` doit etre enrichie:

```javascript
/**
 * Remplace tous les marqueurs dans le document
 * Version enrichie pour multi-pays
 */
function replaceMarkers(body, invoiceData, companyParams) {
  const country = getParam('COUNTRY') || 'FR';
  const config = getCountryConfig();
  const labels = config.labels;

  // 1. Informations entreprise (existant)
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_NAME, companyParams.name || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_ADDRESS, companyParams.address || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_PHONE, companyParams.phone || 'N/A');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_EMAIL, companyParams.email || 'N/A');

  // 2. Identifiants legaux entreprise (NOUVEAU)
  const companyLegalIds = generateCompanyLegalIds(country, companyParams);
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_LEGAL_IDS, companyLegalIds);

  // Remplacer aussi les placeholders individuels
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_SIRET, getParam('COMPANY_SIRET') || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_NIU, getParam('COMPANY_NIU') || '');
  body.replaceText(INVOICE_CONFIG.MARKERS.COMPANY_EIN, getParam('COMPANY_EIN') || '');
  // ... autres identifiants ...

  // 3. Informations client (existant + nouveaux)
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_NAME, invoiceData.clientName || 'N/A');
  // ... autres champs client ...

  // 4. Identifiants legaux client (NOUVEAU)
  const clientLegalIds = generateClientLegalIds(country, invoiceData);
  body.replaceText(INVOICE_CONFIG.MARKERS.CLIENT_LEGAL_IDS, clientLegalIds);

  // 5. Informations facture
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_ID, invoiceData.invoiceId);
  body.replaceText(INVOICE_CONFIG.MARKERS.INVOICE_DATE, formatDateForCountry(invoiceData.date, country));
  body.replaceText(INVOICE_CONFIG.MARKERS.DUE_DATE, formatDateForCountry(invoiceData.dueDate, country));

  // 6. Calculs TVA (NOUVEAU)
  const vatSummary = calculateVatSummary([{
    quantity: invoiceData.quantity,
    unitPrice: invoiceData.unitPrice,
    vatRate: invoiceData.vatRate || config.defaultVatRate
  }]);

  body.replaceText(INVOICE_CONFIG.MARKERS.SUBTOTAL_HT, formatAmount(vatSummary.subtotalHT));
  body.replaceText(INVOICE_CONFIG.MARKERS.TVA_SUMMARY, formatVatSummary(vatSummary.vatDetails, config.currency.symbol));
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_TVA, formatAmount(vatSummary.totalVat));
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_TTC, formatAmount(vatSummary.totalTTC));
  body.replaceText(INVOICE_CONFIG.MARKERS.TOTAL_AMOUNT, formatAmount(vatSummary.totalTTC));

  // 7. Montant en lettres (NOUVEAU - obligatoire pour CM)
  if (config.amountInWords || country === 'CM') {
    const amountWords = convertAmountToWords(vatSummary.totalTTC, country);
    const prefix = config.legalMentions?.amountInWordsPrefix || '';
    body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS_BLOCK,
      `${prefix}\n${amountWords}`);
    body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS, amountWords);
  } else {
    body.replaceText(INVOICE_CONFIG.MARKERS.AMOUNT_IN_WORDS_BLOCK, '');
  }

  // 8. Labels traduits (existant + nouveaux)
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_INVOICE, labels.invoice);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_DATE, labels.date);
  body.replaceText(INVOICE_CONFIG.MARKERS.LABEL_DUE_DATE, labels.dueDate);
  // ... autres labels ...

  // 9. Footer legal (NOUVEAU)
  const legalFooter = generateLegalFooter(country, companyParams, invoiceData);
  body.replaceText(INVOICE_CONFIG.MARKERS.LEGAL_FOOTER, legalFooter);

  // 10. Coordonnees bancaires (NOUVEAU)
  const bankDetails = generateBankDetails();
  body.replaceText(INVOICE_CONFIG.MARKERS.BANK_DETAILS, bankDetails);

  // 11. Nettoyage des placeholders non utilises (NOUVEAU)
  cleanUnusedPlaceholders(body, country);
}

/**
 * Genere le bloc d'identifiants legaux entreprise
 */
function generateCompanyLegalIds(country, company) {
  switch(country) {
    case 'FR':
      const siret = getParam('COMPANY_SIRET');
      const vat = getParam('COMPANY_VAT_FR');
      const rcs = getParam('COMPANY_RCS');
      let ids = [];
      if (siret) ids.push(`SIRET: ${siret}`);
      if (vat) ids.push(`TVA: ${vat}`);
      if (rcs) ids.push(`RCS: ${rcs}`);
      return ids.join(' | ');

    case 'CM':
      const niu = getParam('COMPANY_NIU');
      const rccm = getParam('COMPANY_RCCM');
      const center = getParam('COMPANY_TAX_CENTER');
      let cmIds = [];
      if (niu) cmIds.push(`NIU: ${niu}`);
      if (rccm) cmIds.push(`RCCM: ${rccm}`);
      if (center) cmIds.push(`Centre: ${center}`);
      return cmIds.join(' | ');

    case 'US':
      const ein = getParam('COMPANY_EIN');
      const stateId = getParam('COMPANY_STATE_ID');
      let usIds = [];
      if (ein) usIds.push(`EIN: ${ein}`);
      if (stateId) usIds.push(`State ID: ${stateId}`);
      return usIds.join(' | ');

    default:
      return '';
  }
}
```

---

## 6. PLAN DE MODIFICATIONS (ETAPES ET PRIORITES)

### Phase 1: Fondations (Priorite HAUTE)

1. **Creer `10_CountryConfig.js`** - Configuration multi-pays
2. **Enrichir `00_Config.js`** - Nouveaux markers et parametres
3. **Enrichir `01_Utils.js`** - Fonctions de formatage par pays
4. **Mettre a jour `05_SetupWizard.js`** - Collecte infos legales selon pays

### Phase 2: Footer et Mentions Legales (Priorite HAUTE)

5. **Creer `11_LegalFooter.js`** - Generation footer dynamique
6. **Creer `13_PlaceholderCleaner.js`** - Nettoyage placeholders

### Phase 3: TVA Multi-taux (Priorite MOYENNE)

7. **Creer `12_VatCalculator.js`** - Calculs TVA avances
8. **Modifier `03_InvoiceGenerator.js`** - Integration TVA et footer

### Phase 4: Interface Utilisateur (Priorite MOYENNE)

9. **Enrichir `06_NewInvoice.js`** - Formulaire avec champs legaux
10. **Enrichir Settings sheet** - Nouveaux parametres

### Phase 5: Multi-lignes (Priorite BASSE)

11. **Creer `14_MultiLineInvoice.js`** - Support plusieurs lignes
12. **Creer feuille InvoiceLines** - Structure multi-lignes

### Phase 6: Tests et Documentation (Priorite HAUTE)

13. **Tester chaque pays** - FR, CM, US
14. **Mettre a jour documentation** - README, guides

---

## 7. CHECKLIST FINALE

### 7.1 France (FR)

- [ ] SIRET/SIREN affiches sur facture
- [ ] N TVA intracommunautaire (si applicable)
- [ ] RCS + ville
- [ ] Capital social (optionnel)
- [ ] Forme juridique (optionnel)
- [ ] Mention auto-entrepreneur si applicable
- [ ] Penalites de retard (40 EUR)
- [ ] Pas d'escompte
- [ ] Multi-taux TVA (20%, 10%, 5.5%, 2.1%)
- [ ] Footer legal complet

### 7.2 Cameroun (CM)

- [ ] NIU vendeur affiche
- [ ] RCCM affiche
- [ ] Centre des impots
- [ ] NIU client (optionnel)
- [ ] Devise XAF/FCFA
- [ ] Montant en lettres OBLIGATOIRE
- [ ] TVA 19.25%
- [ ] Footer legal OHADA

### 7.3 USA (US)

- [ ] EIN affiche (optionnel)
- [ ] State Tax ID (optionnel)
- [ ] Tax ID client (optionnel)
- [ ] Devise USD
- [ ] Format date MM/DD/YYYY
- [ ] Sales tax configurable
- [ ] Footer minimaliste

### 7.4 General

- [x] Template unique fonctionnel
- [x] Placeholders non utilises supprimes proprement
- [x] Interface bilingue (EN/FR) maintenue
- [x] Wizard d'installation mis a jour
- [ ] Documentation utilisateur complete
- [ ] Tests automatises (si possible)

---

## 8. PROCHAINES ETAPES

**Voulez-vous que je commence l'implementation par:**

1. **Les fichiers de configuration** (`10_CountryConfig.js`) ?
2. **Le footer legal** (`11_LegalFooter.js`) ?
3. **La mise a jour du template Google Docs** avec les nouveaux placeholders ?
4. **Le wizard d'installation enrichi** ?

Je peux proceder etape par etape avec des diffs clairs pour chaque modification.
