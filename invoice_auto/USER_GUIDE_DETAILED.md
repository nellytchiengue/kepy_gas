# InvoiceFlash - Guide Utilisateur Complet

## Table des matières

1. [Introduction](#1-introduction)
2. [Installation](#2-installation)
3. [Configuration initiale](#3-configuration-initiale)
4. [Créer une facture](#4-créer-une-facture)
5. [Générer les PDF](#5-générer-les-pdf)
6. [Envoyer par email](#6-envoyer-par-email)
7. [Gérer les clients](#7-gérer-les-clients)
8. [Catalogue de services](#8-catalogue-de-services)
9. [Configuration pays](#9-configuration-pays)
10. [Personnalisation du template](#10-personnalisation-du-template)
11. [Tableau de bord statistiques](#11-tableau-de-bord-statistiques)
12. [Dépannage](#12-dépannage)
13. [FAQ](#13-faq)

---

## 1. Introduction

### Qu'est-ce qu'InvoiceFlash ?

InvoiceFlash est un système de facturation automatisée qui transforme vos données Google Sheets en factures PDF professionnelles. Il fonctionne entièrement dans l'écosystème Google Workspace, sans aucune dépendance externe.

### Pourquoi InvoiceFlash ?

| Avantage | Description |
|----------|-------------|
| **Gratuit à vie** | Pas d'abonnement mensuel, vous payez une fois |
| **Vos données** | Tout reste sur votre Google Drive |
| **Personnalisable** | Modifiez le template à votre image |
| **Multi-pays** | France, Cameroun, USA avec conformité légale |
| **Bilingue** | Interface français et anglais |

### Ce que vous pouvez faire

- ✅ Créer des factures depuis Google Sheets
- ✅ Générer des PDF professionnels automatiquement
- ✅ Envoyer les factures par email (Gmail)
- ✅ Gérer une base de clients
- ✅ Catalogue de produits/services
- ✅ Calcul automatique TVA multi-taux
- ✅ Suivi des statuts (Brouillon → Généré → Envoyé)
- ✅ Statistiques de facturation

---

## 2. Installation

### Étape 1 : Créer votre copie personnelle

1. Cliquez sur le lien fourni après votre achat sur Gumroad.
2. Une page Google s'ouvre vous demandant de "Créer une copie".
3. Cliquez sur le bouton bleu **Créer une copie**. Le fichier sera automatiquement enregistré dans votre propre Google Drive.

### Étape 2 : Ouvrir l'éditeur de scripts

1. Dans votre copie, menu **Extensions > Apps Script**
2. Un nouvel onglet s'ouvre avec l'éditeur de code

### Étape 3 : Autoriser les permissions

1. Cliquez sur **Exécuter** (icône ▶️)
2. Google demande des autorisations
3. Cliquez **Examiner les autorisations**
4. Sélectionnez votre compte Google
5. Cliquez **Autoriser**

> **Note** : Google affiche un avertissement car l'app n'est pas vérifiée. C'est normal pour les scripts personnels. Cliquez "Paramètres avancés" puis "Accéder à InvoiceFlash".

### Permissions demandées

| Permission | Utilisation |
|------------|-------------|
| Google Sheets | Lire/écrire vos factures |
| Google Docs | Copier le template pour chaque facture |
| Google Drive | Sauvegarder les PDF |
| Gmail | Envoyer les factures par email |

---

## 3. Configuration initiale

### Lancer l'assistant d'installation

1. Retournez sur votre Google Sheet
2. Actualisez la page (F5)
3. Un nouveau menu **📄 Factures** apparaît
4. Cliquez **📄 Factures > ⚙️ Configuration initiale**

### Les 6 étapes du wizard

#### Étape 1 : Bienvenue
- Présentation du système
- Confirmation pour continuer

#### Étape 2 : Template Google Docs
- Utilisez le template fourni (recommandé)
- Ou créez le vôtre plus tard

#### Étape 3 : Dossier Drive
- Détection automatique du dossier contenant votre Sheet
- Les factures seront organisées dans : `Dossier > CLIENTS > Client > Factures`

#### Étape 4 : Informations entreprise

Renseignez vos informations :

**Informations générales :**
- Nom de l'entreprise
- Adresse complète
- Téléphone
- Email
- Site web (optionnel)

**Sélection du pays :**
- 🇫🇷 France
- 🇨🇲 Cameroun
- 🇺🇸 USA

**Identifiants légaux selon le pays :**

| France | Cameroun | USA |
|--------|----------|-----|
| SIRET (14 chiffres) | NIU | EIN |
| N° TVA intracommunautaire | RCCM | State Tax ID |
| RCS + Ville | Centre des impôts | Sales Tax Rate |
| Capital social | | |
| Forme juridique | | |

**Coordonnées bancaires :**
- Nom de la banque
- IBAN
- BIC/SWIFT
- Titulaire du compte

#### Étape 5 : Configuration automatique
- La feuille "Settings" est remplie automatiquement
- Le pied de page légal est généré

#### Étape 6 : Test des permissions
- Vérification de l'accès à chaque service Google
- Création d'une facture test (optionnel)

---

## 4. Créer une facture

### Méthode 1 : Via le menu (recommandé)

1. Menu **📄 Factures > ➕ Enregistrement d'une vente**
2. Un formulaire s'affiche
3. Remplissez les champs :
   - **Client** : Sélectionnez ou créez nouveau
   - **Description** : Produit ou service
   - **Quantité** : Nombre d'unités
   - **Prix unitaire** : Prix HT
   - **Taux TVA** : Sélectionnez le taux applicable
4. Le total est calculé automatiquement
5. Cliquez **Créer**

### Méthode 2 : Saisie directe dans le Sheet

1. Allez sur la feuille **Factures**
2. Ajoutez une nouvelle ligne avec :

| Colonne | Exemple |
|---------|---------|
| InvoiceID | INV2025-001 |
| InvoiceDate | 04/05/2025 |
| ClientName | Entreprise ABC |
| ClientEmail | contact@abc.com |
| ClientPhone | 06 12 34 56 78 |
| ClientAddress | 123 Rue Exemple, 75001 Paris |
| Description | Consulting stratégique |
| Quantity | 5 |
| UnitPrice | 500 |
| TVA | 500 (automatique si formule) |
| TotalAmount | 3000 |
| Status | Draft |

> **Astuce** : Utilisez les formules pour calculer automatiquement TVA et Total.

### Numérotation automatique

Le système génère automatiquement les numéros de facture selon le format :
```
PREFIXE-NUMERO
```

Exemple : `INV2025-001`, `INV2025-002`, etc.

Pour personnaliser le préfixe, modifiez `INVOICE_PREFIX` dans la feuille Settings.

---

## 5. Générer les PDF

### Générer toutes les factures en attente

1. Menu **📄 Factures > 📄 Génération de facture(s)**
2. Sélectionnez **Générer tous les brouillons**
3. Le système traite chaque facture "Draft"
4. Un résumé s'affiche à la fin

### Générer une facture spécifique

1. Menu **📄 Factures > 📄 Génération de facture(s)**
2. Sélectionnez **Générer une facture spécifique**
3. Entrez l'ID de la facture (ex: INV2025-003)
4. Cliquez **Générer**

### Que se passe-t-il lors de la génération ?

```
1. Lecture des données de la facture
   ↓
2. Copie du template Google Docs
   ↓
3. Remplacement des marqueurs ({{CLIENT_NAME}}, etc.)
   ↓
4. Génération du pied de page légal
   ↓
5. Conversion en PDF
   ↓
6. Déplacement vers : CLIENTS > [Nom Client] > Facture.pdf
   ↓
7. Mise à jour du statut : Draft → Generated
   ↓
8. Enregistrement de l'URL du PDF
```

### Où trouver les PDF ?

Les factures sont organisées ainsi :
```
📁 [Votre dossier principal]
└── 📁 CLIENTS
    └── 📁 [Nom du client]
        ├── 📄 Facture_INV2025-001_ClientABC.pdf
        └── 📄 Facture_INV2025-002_ClientABC.pdf
```

### Limites de génération

| Limite | Valeur | Raison |
|--------|--------|--------|
| Factures par exécution | 40 max | Timeout Google (6 min) |
| Délai entre factures | 500ms | Éviter les quotas API |

Si vous avez plus de 40 factures, relancez la génération pour traiter les suivantes.

---

## 6. Envoyer par email

### Envoyer une facture

1. Assurez-vous que la facture est **Generated** (PDF créé)
2. Menu **📄 Factures > 📧 Envoi de mail(s)**
3. Sélectionnez la facture dans la liste
4. Vérifiez l'email du destinataire
5. Prévisualisez l'email
6. Cliquez **Envoyer**

### Contenu de l'email

L'email inclut :
- **Objet** : Facture n°INV2025-001 - [Votre entreprise]
- **Corps** : Message professionnel avec détails de la facture
- **Pièce jointe** : Le PDF de la facture

### Template email (exemple français)

```
Objet : Facture n°INV2025-001 - SARL Exemple

Bonjour,

Veuillez trouver ci-joint la facture n°INV2025-001
d'un montant de 3 000,00 €.

Détails :
- Description : Consulting stratégique
- Date : 04/05/2025
- Échéance : 03/06/2025

Merci de régler cette facture dans les délais indiqués.

Cordialement,
[Votre nom]
[Votre entreprise]
```

### Envoi automatique

Pour activer l'envoi automatique après génération :

1. Feuille **Settings**
2. Paramètre `AUTO_SEND_EMAIL`
3. Valeur : `TRUE`

---

## 7. Gérer les clients

### Feuille Clients

La feuille **Clients** contient votre base de données clients.

| Colonne | Description |
|---------|-------------|
| ClientID | Identifiant unique (CLI-001) |
| ClientName | Nom/Raison sociale |
| ClientEmail | Email principal |
| ClientPhone | Téléphone |
| ClientAddress | Adresse complète |
| ClientCountry | Pays (FR/CM/US) |
| ClientSIRET | SIRET (France) |
| ClientVatNumber | N° TVA (France) |
| ClientNIU | NIU (Cameroun) |
| ClientTaxID | Tax ID (USA) |
| PaymentTerms | Conditions de paiement |
| Notes | Notes internes |
| Active | TRUE/FALSE |

### Ajouter un client

**Via le formulaire :**
1. Menu **📄 Factures > ➕ Enregistrement d'une vente**
2. Dans le champ Client, cliquez **Créer nouveau**
3. Remplissez les informations
4. Le client est ajouté automatiquement

**Directement dans le Sheet :**
1. Allez sur la feuille **Clients**
2. Ajoutez une nouvelle ligne
3. Remplissez au minimum : ClientID, ClientName, ClientEmail

### Identifiants légaux clients

Selon le pays du client, les identifiants légaux appropriés seront inclus sur la facture :

- **France** : SIRET et N° TVA intracommunautaire
- **Cameroun** : NIU
- **USA** : Tax ID

---

## 8. Catalogue de services

### Feuille Services

Gérez vos produits et services dans la feuille **Services**.

| Colonne | Description |
|---------|-------------|
| ServiceID | Identifiant (SRV-001) |
| ServiceName | Nom du service/produit |
| Description | Description détaillée |
| DefaultPrice | Prix unitaire par défaut |
| Category | Catégorie |
| VatRate | Taux TVA par défaut (%) |
| Unit | Unité (heure, jour, pièce) |
| Active | TRUE/FALSE |

### Utilisation

Lors de la création d'une facture, vous pouvez :
1. Sélectionner un service existant
2. Les champs sont pré-remplis automatiquement
3. Modifier les valeurs si nécessaire

---

## 9. Configuration pays

### France 🇫🇷

**Identifiants légaux requis :**
- SIRET (14 chiffres)
- N° TVA intracommunautaire (FR + 11 chiffres)
- RCS (Ville d'immatriculation)

**Taux de TVA disponibles :**
| Taux | Application |
|------|-------------|
| 20% | Taux normal |
| 10% | Travaux, restauration |
| 5.5% | Alimentation, énergie |
| 2.1% | Médicaments, presse |
| 0% | Export, exonéré |

**Mentions légales automatiques :**
- Conditions de paiement
- Pénalités de retard (si activé)
- Mention auto-entrepreneur (si applicable)
- Capital social et forme juridique

### Cameroun 🇨🇲

**Identifiants légaux requis :**
- NIU (Numéro Identifiant Unique)
- RCCM (Registre du Commerce)
- Centre des impôts

**TVA :**
- Taux unique : 19.25%
- Montant en lettres OBLIGATOIRE sur les factures

**Mentions légales automatiques :**
- Références fiscales
- Montant en toutes lettres

### USA 🇺🇸

**Identifiants légaux requis :**
- EIN (Employer Identification Number)
- State Tax ID (selon l'état)

**Taxes :**
- Sales Tax : Variable selon l'état (configurable)
- Pas de TVA fédérale

### Changer de pays

1. Feuille **Settings**
2. Paramètre `COUNTRY`
3. Valeur : `FR`, `CM`, ou `US`
4. Menu **📄 Factures > 📝 Régénérer le pied de page légal**

---

## 10. Personnalisation du template

### Accéder au template Google Docs

1. Feuille **Settings**
2. Trouvez `TEMPLATE_DOCS_ID`
3. Ouvrez le lien du document

### Marqueurs disponibles

Les marqueurs utilisent le format `{{MARQUEUR}}`.

**Informations entreprise :**
```
{{COMPANY_NAME}}
{{COMPANY_ADDRESS}}
{{COMPANY_PHONE}}
{{COMPANY_EMAIL}}
{{COMPANY_WEBSITE}}
{{COMPANY_LEGAL_IDS}}
```

**Informations client :**
```
{{CLIENT_NAME}}
{{CLIENT_EMAIL}}
{{CLIENT_PHONE}}
{{CLIENT_ADDRESS}}
{{CLIENT_LEGAL_IDS}}
```

**Facture :**
```
{{INVOICE_ID}}
{{INVOICE_DATE}}
{{INVOICE_DUE_DATE}}
{{DESCRIPTION}}
{{QUANTITY}}
{{UNIT_PRICE}}
{{TVA}}
{{TOTAL_AMOUNT}}
```

**Montants :**
```
{{SUBTOTAL_HT}}
{{TOTAL_TVA}}
{{TOTAL_TTC}}
{{AMOUNT_IN_WORDS}}
```

**Banque & Légal :**
```
{{BANK_DETAILS}}
{{LEGAL_FOOTER}}
```

### Conseils de personnalisation

1. **Conservez les marqueurs** : Ne supprimez pas `{{...}}`, sinon l'info ne s'affichera pas
2. **Ajoutez votre logo** : Insérez une image dans le template
3. **Modifiez les couleurs** : Utilisez les outils de mise en forme Google Docs
4. **Testez** : Générez une facture test après chaque modification

---

## 11. Tableau de bord statistiques

### Accéder aux statistiques

Menu **📄 Factures > 📈 Statistiques**

### Informations affichées

| Métrique | Description |
|----------|-------------|
| Total factures | Nombre total de factures |
| Brouillons | Factures non générées |
| Générées | PDF créés, non envoyés |
| Envoyées | Factures livrées aux clients |
| Montant total | Somme de toutes les factures |
| Montant par statut | Ventilation par état |

---

## 12. Dépannage

### Problème : Le menu n'apparaît pas

**Solution :**
1. Actualisez la page (F5)
2. Si toujours absent, menu **Extensions > Apps Script**
3. Exécutez la fonction `onOpen`

### Problème : Erreur de permissions

**Solution :**
1. Menu **📄 Factures > ⚙️ Tester les permissions**
2. Identifiez la permission manquante
3. Réautorisez via **Extensions > Apps Script > Exécuter**

### Problème : Template non trouvé

**Solution :**
1. Vérifiez `TEMPLATE_DOCS_ID` dans Settings
2. Assurez-vous d'avoir accès au document
3. Le document doit être dans votre Drive ou partagé avec vous

### Problème : Dossier Drive non trouvé

**Solution :**
1. Vérifiez `DRIVE_FOLDER_ID` dans Settings
2. Assurez-vous que le dossier existe
3. Relancez la configuration : **⚙️ Configuration initiale**

### Problème : Email non envoyé

**Vérifications :**
1. La facture est-elle "Generated" ?
2. L'email du client est-il valide ?
3. Vérifiez vos quotas Gmail (500 emails/jour)

### Problème : PDF non généré

**Causes possibles :**
- Données manquantes (vérifiez tous les champs)
- Calculs incorrects (Total ≠ Qté × Prix + TVA)
- Template corrompu

**Solution :**
1. Vérifiez les données de la facture
2. Assurez-vous que les calculs sont corrects
3. Testez avec une facture simple

---

## 13. FAQ

### Q : Puis-je utiliser InvoiceFlash sans connexion internet ?

**R :** Non, InvoiceFlash nécessite une connexion car il utilise les services Google (Sheets, Docs, Drive, Gmail).

### Q : Mes données sont-elles sécurisées ?

**R :** Oui. Toutes vos données restent sur votre Google Drive. Aucune information n'est envoyée à des serveurs externes.

### Q : Combien de factures puis-je créer ?

**R :** Illimité. Google Sheets peut contenir des milliers de lignes.

### Q : Puis-je personnaliser le design des factures ?

**R :** Oui, en modifiant le template Google Docs. Ajoutez votre logo, modifiez les couleurs, réorganisez les sections.

### Q : Le système fonctionne-t-il avec d'autres devises ?

**R :** Oui. Modifiez `CURRENCY_SYMBOL` et `CURRENCY_CODE` dans Settings. Devises supportées : EUR, USD, GBP, XAF, CHF, CAD, MAD, XOF.

### Q : Comment exporter mes factures ?

**R :** Les PDF sont sauvegardés dans votre Google Drive. Vous pouvez les télécharger individuellement ou en lot.

### Q : Puis-je créer des devis avec ce système ?

**R :** Le système est conçu pour les factures, mais vous pouvez adapter le template pour des devis en modifiant les libellés.

### Q : Comment ajouter une nouvelle ligne de produit sur une facture ?

**R :** Utilisez la fonctionnalité multi-lignes via le menu **➕ Enregistrement d'une vente** ou la feuille dédiée aux lignes de facture.

### Q : Comment gérer la TVA à plusieurs taux ?

**R :** Lors de la création de la facture, sélectionnez le taux TVA pour chaque ligne. Le système calculera la ventilation automatiquement.

### Q : Puis-je envoyer des relances ?

**R :** Cette fonctionnalité n'est pas incluse nativement. Vous pouvez renvoyer la facture manuellement via le menu email.

---

## Support

Pour toute question :
1. Consultez ce guide
2. Vérifiez la feuille Settings
3. Testez les permissions
4. Contactez le support : [votre email]

---

*Guide rédigé pour InvoiceFlash v2.0 - Multi-Country Edition*
*Dernière mise à jour : Mai 2025*
