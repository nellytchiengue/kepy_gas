# InvoiceFlash - Synthèse Produit pour Gumroad

## Vue d'ensemble

**InvoiceFlash** est un système complet de facturation automatisée fonctionnant entièrement dans Google Workspace (Sheets, Docs, Drive, Gmail). Conçu pour les freelances, auto-entrepreneurs et petites entreprises.

---

## Chiffres clés

| Métrique | Valeur |
|----------|--------|
| Lignes de code | 9,414 |
| Fichiers source | 16 modules JavaScript |
| Pays supportés | 3 (France, Cameroun, USA) |
| Langues | 2 (Français, Anglais) |
| Temps d'installation | ~5 minutes |
| Dépendances externes | 0 (100% Google Workspace) |

---

## Fonctionnalités principales

### 1. Génération automatique de factures PDF
- Conversion données Google Sheets → PDF via template Google Docs
- Traitement par lots (jusqu'à 50 factures/exécution)
- Génération sécurisée avec rollback automatique en cas d'erreur
- Organisation automatique : `Drive > CLIENTS > Client > Factures`

### 2. Intégration Email
- Envoi direct depuis Gmail avec pièce jointe PDF
- Templates email bilingues (FR/EN)
- Prévisualisation avant envoi
- Option d'envoi automatique après génération

### 3. Support Multi-Pays
| Pays | Devise | Identifiants légaux |
|------|--------|---------------------|
| France | EUR (€) | SIRET, SIREN, N° TVA, RCS, Capital |
| Cameroun | XAF (FCFA) | NIU, RCCM, Centre des impôts |
| USA | USD ($) | EIN, State Tax ID, Sales Tax |

### 4. Calculateur TVA intelligent
- France : 20%, 10%, 5.5%, 2.1%, 0%
- Cameroun : 19.25%
- USA : Sales Tax configurable par état
- Ventilation automatique par taux

### 5. Assistant d'installation (Setup Wizard)
- 6 étapes guidées
- Détection automatique du dossier Drive
- Collecte des informations entreprise
- Test des permissions
- Création facture test

### 6. Interface utilisateur
- Menu personnalisé dans Google Sheets
- Dialogues HTML modernes
- Tableau de bord statistiques
- Changement de langue instantané

---

## Structure des feuilles Google Sheets

### Feuille "Factures"
| Colonne | Contenu |
|---------|---------|
| InvoiceID | Identifiant unique (ex: INV2025-001) |
| InvoiceDate | Date de facturation |
| ClientName | Nom du client |
| ClientEmail | Email client |
| Description | Produit/service facturé |
| Quantity | Quantité |
| UnitPrice | Prix unitaire |
| TVA | Montant TVA |
| TotalAmount | Total TTC |
| Status | Draft / Generated / Sent |
| PDFUrl | Lien vers PDF (auto-rempli) |

### Feuille "Settings" (Configuration)
- Paramètres entreprise
- IDs légaux par pays
- Coordonnées bancaires
- Préférences de facturation

### Feuille "Clients" (Base clients)
- Coordonnées complètes
- Identifiants légaux clients
- Conditions de paiement personnalisées

### Feuille "Services" (Catalogue)
- Produits/services avec prix
- Taux TVA par défaut
- Catégories

---

## Workflow utilisateur

```
1. Créer facture (status: Draft)
   ↓
2. Menu > Générer factures
   ↓ PDF créé dans Drive
3. Status → Generated
   ↓
4. Menu > Envoyer par email
   ↓ Email envoyé avec PDF
5. Status → Sent
```

---

## Points forts pour Gumroad

### Différenciateurs
- **Zéro dépendance externe** : Tout fonctionne dans Google Workspace
- **Installation 5 minutes** : Wizard guidé vs 30 min manuel
- **Bilingue natif** : FR/EN avec détection automatique
- **Multi-pays** : France, Cameroun, USA avec conformité légale
- **Code ouvert** : L'utilisateur peut personnaliser

### Public cible
- Freelances et consultants
- Auto-entrepreneurs (France)
- Petites entreprises (1-10 employés)
- Expatriés francophones

### Arguments de vente
1. Économie d'abonnements SaaS (pas de frais mensuels)
2. Données 100% sur Google Drive de l'utilisateur
3. Personnalisation illimitée du template
4. Support multi-devises et multi-pays
5. Intégration native Gmail

---

## Fichiers inclus dans le package

```
/invoice_auto/
├── src/                          # 16 fichiers JavaScript
│   ├── 00_Config.js              # Configuration centrale
│   ├── 01_Utils.js               # Utilitaires
│   ├── 02_DataCollector.js       # Lecture données
│   ├── 03_InvoiceGenerator.js    # Génération PDF
│   ├── 04_Main.js                # Menu interface
│   ├── 05_SetupWizard.js         # Assistant installation
│   ├── 06_NewInvoice.js          # Création facture
│   ├── 07_GenerateInvoice.js     # UI génération
│   ├── 07_Services.js            # Catalogue services
│   ├── 08_SendEmail.js           # Envoi email
│   ├── 09_Statistics.js          # Tableau de bord
│   ├── 10_CountryConfig.js       # Config pays
│   ├── 11_LegalFooter.js         # Pied de page légal
│   ├── 12_VatCalculator.js       # Calcul TVA
│   ├── 13_PlaceholderCleaner.js  # Nettoyage template
│   └── 14_MultiLineInvoice.js    # Factures multi-lignes
│
├── templates/                     # Templates & docs
│   ├── Invoice_TEMPLATE.docx
│   ├── InvoiceFlash_Master.xlsx
│   └── GOOGLE_DOCS_TEMPLATE_*.md
│
├── QUICK_START_GUIDE_FR.md       # Guide démarrage FR
├── QUICK_START_GUIDE_EN.md       # Guide démarrage EN
└── README.md                      # Documentation complète
```

---

## Prérequis utilisateur

- Compte Google (Gmail)
- Google Sheets & Google Docs
- Google Drive
- Permissions OAuth (accordées lors de l'installation)

---

## Sécurité et confidentialité

- Aucune donnée envoyée à des serveurs externes
- Tout reste sur le Google Drive de l'utilisateur
- Emails envoyés depuis le Gmail de l'utilisateur
- Code source visible et modifiable
- Permissions OAuth minimales requises

---

## Tarification suggérée Gumroad

| Offre | Prix | Contenu |
|-------|------|---------|
| **Basic** | $29 | Code source + Template + Guide |
| **Pro** | $49 | Basic + Support email 30 jours |
| **Business** | $99 | Pro + Personnalisation template + Appel 30 min |

---

## Mots-clés SEO pour Gumroad

```
google sheets invoice, facturation google sheets, invoice automation,
facture automatique, freelance invoice template, auto-entrepreneur facture,
google apps script invoice, small business invoicing, pdf invoice generator,
facturation freelance, système facturation gratuit infrastructure
```

---

*Document généré le 2026-05-04*
*Version: InvoiceFlash 2.0 Multi-Country Edition*
