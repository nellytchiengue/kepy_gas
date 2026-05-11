# Guide de Demarrage Rapide - InvoiceFlash

**De zero a votre premiere facture en 5 minutes**

Version 2.0 | Multi-Pays | FR + EN

---

## Avant de Commencer

**Ce dont vous avez besoin :**
- Un compte Google (Gmail)
- 5 minutes de votre temps
- C'est tout !

**Ce qui est inclus dans votre achat :**
- Google Sheet pre-configure
- Templates de factures (FR + EN)
- Code source complet
- Ce guide

---

## Installation en 5 Minutes

### Etape 1 : Upload du Google Sheet (30 secondes)

1. Decompressez le fichier ZIP telecharge
2. Ouvrez le dossier `/installation/`
3. Trouvez le fichier `InvoiceFlash_Sheet.xlsx`
4. Uploadez-le sur Google Drive :
   - Allez sur [drive.google.com](https://drive.google.com)
   - Cliquez sur **"+ Nouveau"** > **"Importer un fichier"**
   - Selectionnez `InvoiceFlash_Sheet.xlsx`
5. Une fois uploade, double-cliquez pour l'ouvrir
6. Google le convertira automatiquement en Google Sheets

### Etape 2 : Lancement de l'Assistant (3 minutes)

1. **Rafraichissez la page** (F5 ou Cmd+R) - Important !
2. Attendez 5-10 secondes
3. Un nouveau menu apparait : **Factures** (ou **Invoices**)
4. Cliquez sur : **Factures > Installation**
5. Suivez les **6 etapes guidees** :

| Etape | Action | Temps |
|-------|--------|-------|
| 1 | Creation du template | Automatique |
| 2 | Creation du dossier Drive | Automatique |
| 3 | Informations entreprise | Vous tapez |
| 4 | Selection du pays | Vous selectionnez |
| 5 | Test des permissions | Automatique |
| 6 | Facture de test | Optionnel |

**Vous etes pret !**

### Etape 3 : Premiere Facture (2 minutes)

1. Allez dans l'onglet **"Invoices"**
2. Cliquez sur **Factures > Nouvelle facture**
3. Remplissez le formulaire :
   - Client (nom, email, adresse)
   - Service/Produit
   - Quantite et prix
   - Taux de TVA
4. Cliquez sur **"Enregistrer"**
5. Cliquez sur **Factures > Generer facture**
6. Votre PDF est pret dans Google Drive !

---

## Structure de Votre Google Sheet

### Onglet "Invoices" - Vos Factures

| Colonne | Description | Exemple |
|---------|-------------|---------|
| InvoiceID | Numero unique | F2025-001 |
| InvoiceDate | Date de facture | 15/01/2025 |
| ClientName | Nom du client | Jean Dupont |
| ClientEmail | Email client | jean@exemple.com |
| ClientPhone | Telephone | +33 6 12 34 56 78 |
| ClientAddress | Adresse complete | 123 Rue Paris, 75001 |
| Description | Prestation/Produit | Conseil en strategie |
| Quantity | Quantite | 1 |
| UnitPrice | Prix unitaire HT | 500 |
| TVA | Taux TVA | 20% |
| TotalAmount | Total TTC | 600 |
| Status | Etat | Draft / Generated / Sent |
| PDFUrl | Lien PDF | (automatique) |

**Statuts possibles :**
- **Draft** : Brouillon, pret a generer
- **Generated** : PDF cree
- **Sent** : Email envoye au client

### Onglet "Settings" - Parametres

Configure automatiquement par l'assistant. Vous pouvez modifier :

| Parametre | Description |
|-----------|-------------|
| COMPANY_NAME | Nom de votre entreprise |
| COMPANY_ADDRESS | Adresse complete |
| COMPANY_PHONE | Telephone |
| COMPANY_EMAIL | Email de contact |
| COMPANY_WEBSITE | Site web |
| COUNTRY | Pays (FR, CM, US) |
| SIRET / NIU / EIN | Identifiant legal selon pays |
| BANK_NAME | Nom de la banque |
| BANK_IBAN | IBAN |
| BANK_BIC | BIC/SWIFT |
| AUTO_SEND_EMAIL | Envoi auto (true/false) |

### Onglet "Clients" - Base Clients

Enregistrez vos clients pour les reutiliser :

| Colonne | Description |
|---------|-------------|
| ClientID | Identifiant unique |
| Name | Nom complet |
| Email | Email |
| Phone | Telephone |
| Address | Adresse |
| Country | Pays |
| SIRET / NIU | ID legal client |
| PaymentTerms | Conditions de paiement |
| Active | Actif (TRUE/FALSE) |

### Onglet "Services" - Catalogue

Enregistrez vos prestations recurrentes :

| Colonne | Description |
|---------|-------------|
| ServiceID | Identifiant |
| Name | Nom du service |
| Description | Description |
| DefaultPrice | Prix par defaut |
| Category | Categorie |
| VATRate | Taux TVA |
| Active | Actif (TRUE/FALSE) |

---

## Le Menu InvoiceFlash

### Workflow en 3 Etapes

```
Factures > 1. Enregistrer une vente    --> Creer la facture
Factures > 2. Generer facture(s)       --> Creer le PDF
Factures > 3. Envoyer email(s)         --> Envoyer au client
```

### Toutes les Options

| Menu | Action |
|------|--------|
| **1. Enregistrer une vente** | Ouvre le formulaire de nouvelle facture |
| **2. Generer facture(s)** | Cree les PDF des factures "Draft" |
| **3. Envoyer email(s)** | Envoie les factures "Generated" par email |
| **Statistiques** | Affiche le tableau de bord |
| **Changer de langue** | Bascule FR / EN |
| **Regenerer pied de page** | Met a jour les mentions legales |
| **Installation** | Relance l'assistant de configuration |
| **Tester permissions** | Verifie les autorisations |
| **A propos** | Informations systeme |

---

## Configuration Multi-Pays

### France (FR)

**Identifiants requis :**
- SIRET (14 chiffres)
- Numero TVA intracommunautaire
- RCS (Registre du Commerce)
- Capital social
- Forme juridique (SARL, SAS, etc.)

**Taux de TVA disponibles :**
- 20% (taux normal)
- 10% (taux intermediaire)
- 5.5% (taux reduit)
- 2.1% (taux super-reduit)
- 0% (franchise de TVA)

**Mentions legales auto-generees :**
- Penalites de retard
- Indemnite forfaitaire
- Escompte
- Dispense d'immatriculation (si applicable)

### Cameroun (CM)

**Identifiants requis :**
- NIU (Numero Identifiant Unique)
- RCCM (Registre du Commerce)
- Centre des impots

**Taux de TVA :**
- 19.25% (taux unique)

**Particularite :**
- Montant en lettres obligatoire (genere automatiquement)

### USA (US)

**Identifiants requis :**
- EIN (Employer Identification Number)
- State Tax ID

**Taxes :**
- Sales Tax configurable par etat

---

## Personnalisation du Template

### Ou trouver le template ?

1. Ouvrez Google Drive
2. Cherchez : `InvoiceFlash_Template`
3. Ouvrez le Google Docs

### Ce que vous pouvez modifier

**Modifiable :**
- Logo (inserez votre image en haut)
- Couleurs et polices
- Mise en page
- Textes fixes
- Pied de page personnalise

**Ne pas modifier :**
- Les marqueurs `{{...}}`
- Ils doivent rester exactement comme : `{{CLIENT_NAME}}`

### Liste des Marqueurs Principaux

| Marqueur | Remplace par |
|----------|--------------|
| `{{COMPANY_NAME}}` | Nom de votre entreprise |
| `{{COMPANY_ADDRESS}}` | Votre adresse |
| `{{COMPANY_PHONE}}` | Votre telephone |
| `{{COMPANY_EMAIL}}` | Votre email |
| `{{COMPANY_LOGO}}` | Votre logo |
| `{{CLIENT_NAME}}` | Nom du client |
| `{{CLIENT_ADDRESS}}` | Adresse client |
| `{{CLIENT_EMAIL}}` | Email client |
| `{{INVOICE_ID}}` | Numero de facture |
| `{{INVOICE_DATE}}` | Date de facture |
| `{{DUE_DATE}}` | Date d'echeance |
| `{{TOTAL_HT}}` | Total hors taxes |
| `{{TOTAL_TVA}}` | Montant TVA |
| `{{TOTAL_TTC}}` | Total TTC |
| `{{LEGAL_FOOTER}}` | Mentions legales |

---

## Envoi des Factures par Email

### Configuration

1. Allez dans l'onglet **Settings**
2. Verifiez ces parametres :
   - `SENDER_EMAIL` : Votre adresse Gmail
   - `AUTO_SEND_EMAIL` : `true` pour envoi auto, `false` pour manuel

### Envoi Manuel

1. Generez la facture (statut passe a "Generated")
2. Cliquez sur **Factures > Envoyer email(s)**
3. L'email est envoye avec le PDF en piece jointe
4. Le statut passe a "Sent"

### Envoi Automatique

1. Activez `AUTO_SEND_EMAIL = true`
2. Quand vous generez une facture, l'email part automatiquement
3. Le statut passe directement a "Sent"

### Contenu de l'Email

L'email inclut :
- Objet personnalise avec numero de facture
- Message professionnel
- PDF en piece jointe
- Coordonnees de votre entreprise

---

## Depannage

### Le menu "Factures" n'apparait pas

**Solutions :**
1. Rafraichissez la page (F5)
2. Attendez 10-15 secondes
3. Verifiez que vous etes connecte au bon compte Google
4. Essayez en navigation privee

### Erreur d'autorisation Google

**Solutions :**
1. Cliquez sur **Factures > Tester permissions**
2. Acceptez toutes les autorisations demandees
3. Si ca echoue, deconnectez et reconnectez votre compte Google

### Le PDF ne se genere pas

**Verifiez :**
1. L'ID de facture est unique
2. Tous les champs obligatoires sont remplis
3. Le statut est bien "Draft"
4. Le template existe dans Drive

### Les marqueurs ne sont pas remplaces

**Verifiez dans le template :**
1. Les marqueurs sont exactement `{{TEXTE}}`
2. Pas d'espaces : `{{CLIENT_NAME}}` et non `{{ CLIENT_NAME }}`
3. Respect de la casse : `{{CLIENT_NAME}}` et non `{{client_name}}`

### L'email n'est pas envoye

**Verifiez :**
1. L'adresse email client est valide
2. `AUTO_SEND_EMAIL` est configure correctement
3. Vous avez autorise l'acces a Gmail

---

## Astuces Pro

### Factures en Lot

Generez plusieurs factures d'un coup :
1. Creez plusieurs lignes avec Status = "Draft"
2. Cliquez sur **Factures > Generer facture(s)**
3. Toutes les factures Draft sont generees

### Factures Multi-Lignes

Pour une facture avec plusieurs services :
1. Utilisez le meme InvoiceID pour plusieurs lignes
2. Chaque ligne = un service different
3. Le systeme les regroupe automatiquement

### Clients Recurrents

1. Ajoutez vos clients dans l'onglet "Clients"
2. Lors de la creation de facture, selectionnez-les dans la liste
3. Leurs informations se remplissent automatiquement

### Services Recurrents

1. Ajoutez vos prestations dans l'onglet "Services"
2. Lors de la creation, selectionnez le service
3. Le prix et le taux TVA se remplissent automatiquement

---

## Besoin d'Aide ?

### Documentation

- **Guide complet :** `USER_GUIDE_COMPLETE_FR.pdf`
- **FAQ :** `FAQ.pdf`
- **Depannage :** `TROUBLESHOOTING.pdf`

### Support

- **Email :** support@invoiceflash.com
- **Delai :** 24-48h ouvrables

### Garantie

30 jours satisfait ou rembourse. Contactez-nous si InvoiceFlash ne repond pas a vos attentes.

---

## Checklist Premier Demarrage

- [ ] ZIP decompresse
- [ ] Google Sheet uploade sur Drive
- [ ] Page rafraichie (F5)
- [ ] Menu "Factures" visible
- [ ] Assistant d'installation lance
- [ ] 6 etapes completees
- [ ] Informations entreprise renseignees
- [ ] Pays selectionne
- [ ] Premiere facture creee
- [ ] PDF genere avec succes

**Vous etes operationnel !**

---

**InvoiceFlash** - Generateur de Factures Automatique
Version 2.0 | Multi-Pays | Cree par Nelly Tchiengue

*Version anglaise disponible : `QUICK_START_GUIDE_EN.md`*
