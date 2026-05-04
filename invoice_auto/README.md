# 📄 InvoiceFlash - Facturation Automatique Google Sheets

Système complet de facturation automatisée fonctionnant 100% dans Google Workspace (Sheets, Docs, Drive, Gmail). Conçu pour les freelances, auto-entrepreneurs et petites entreprises.

## 🎯 Fonctionnalités

- ✨ **Génération automatique** : Transforme vos données Sheet en factures PDF professionnelles
- 📧 **Envoi par email** : Envoi direct depuis Gmail avec pièce jointe PDF
- 📊 **Suivi des statuts** : Draft → Generated → Sent
- 🔐 **Validation des données** : Vérification de cohérence des informations
- 📈 **Statistiques** : Tableau de bord avec vue d'ensemble
- 🎨 **Personnalisable** : Template Google Docs entièrement modifiable
- 🌍 **Multi-pays** : France, Cameroun, USA avec conformité légale
- 🇫🇷🇬🇧 **Bilingue** : Interface Français/Anglais
- ⚡ **Performance optimisée** : Cache intelligent pour exécution rapide

---

## 📋 Prérequis

- Un compte Google (Gmail)
- Google Sheets (gratuit)
- Google Docs (gratuit)
- Google Drive (gratuit)
- Node.js et npm installés (pour le déploiement via clasp)

---

## 🚀 Installation

### Étape 1 : Cloner le projet

```bash
cd /chemin/vers/votre/dossier
git clone https://github.com/nellytchiengue/kepy_gas.git
cd kepy_gas/invoice_auto
```

### Étape 2 : Installer clasp (Command Line Apps Script Projects)

```bash
npm install -g @google/clasp
clasp login
```

Suivez les instructions pour vous connecter avec votre compte Google.

### Étape 3 : Créer votre Google Sheet

1. Créez un nouveau Google Sheet
2. Suivez les instructions dans `templates/SHEET_STRUCTURE.md` pour créer la structure
3. Créez deux feuilles :
   - **Factures** : avec 12 colonnes (voir documentation)
   - **Parametres** : avec les paramètres de configuration

### Étape 4 : Créer votre template Google Docs

1. Créez un nouveau Google Docs
2. Suivez les instructions dans `templates/DOCS_TEMPLATE.md`
3. Copiez le template d'exemple et personnalisez-le
4. Récupérez l'ID du document (dans l'URL)

### Étape 5 : Créer un dossier Drive pour les factures

1. Créez un dossier dans Google Drive (ex: "Factures_2025")
2. Récupérez l'ID du dossier (dans l'URL)

### Étape 6 : Configurer les paramètres

Dans la feuille "Parametres" de votre Google Sheet, remplissez :

| Paramètre            | Valeur                                    |
|----------------------|-------------------------------------------|
| ID_TEMPLATE_DOCS     | [L'ID de votre template Google Docs]     |
| ID_DOSSIER_DRIVE     | [L'ID de votre dossier Drive]            |
| EMAIL_EXPEDITEUR     | votre.email@entreprise.com               |
| AUTO_SEND_EMAIL      | false (ou true pour envoi automatique)   |
| ENTREPRISE_NOM       | Nom de votre entreprise                  |
| ENTREPRISE_ADRESSE   | Adresse complète                         |
| ENTREPRISE_TEL       | Numéro de téléphone                      |
| ENTREPRISE_EMAIL     | Email de contact                         |

### Étape 7 : Déployer les scripts

#### Option A : Via clasp (recommandé)

```bash
cd src
clasp create --type standalone --title "Invoice Auto Generator"
clasp push
clasp open
```

Puis liez le script à votre Sheet :
1. Dans le script ouvert, cliquez sur "Projet" > "Conteneur"
2. Ou allez directement dans votre Sheet > Extensions > Apps Script

#### Option B : Copier-coller manuel

1. Ouvrez votre Google Sheet
2. Allez dans **Extensions > Apps Script**
3. Supprimez le code par défaut
4. Copiez-collez le contenu de chaque fichier .js dans l'ordre :
   - `00_Config.js`
   - `01_Utils.js`
   - `02_DataCollector.js`
   - `03_InvoiceGenerator.js`
   - `04_Main.js`
5. Sauvegardez

### Étape 8 : Autoriser les permissions

1. Dans l'éditeur Apps Script, exécutez la fonction `menuTestPermissions`
2. Autorisez toutes les permissions demandées par Google
3. Vérifiez que tous les tests passent

### Étape 9 : Tester

1. Retournez dans votre Google Sheet
2. Rechargez la page
3. Vous devriez voir un nouveau menu "📄 Factures"
4. Créez une facture de test avec statut "Brouillon"
5. Utilisez le menu pour générer la facture

---

## 📖 Utilisation

### Créer une nouvelle facture

1. Ajoutez une ligne dans la feuille "Factures"
2. Remplissez les colonnes obligatoires :
   - InvoiceID (ex: F001, F002, etc.)
   - DateFacture
   - ClientNom
   - Designation
   - Quantite
   - PrixUnitaire
   - MontantTotal (formule : `=H2*I2`)
   - Statut : Sélectionnez **"Brouillon"**

### Générer les factures

#### Option 1 : Générer toutes les factures en brouillon

1. Menu **Factures > Générer toutes les factures**
2. Confirmez l'opération
3. Attendez la fin de la génération
4. Consultez le résumé

#### Option 2 : Générer une facture spécifique

1. Menu **Factures > Générer une facture spécifique**
2. Entrez l'InvoiceID (ex: F001)
3. Cliquez sur OK
4. La facture est générée

### Envoyer une facture par email

**Si AUTO_SEND_EMAIL = false (envoi manuel) :**

1. Menu **Factures > Envoyer une facture par email**
2. Entrez l'InvoiceID
3. L'email est envoyé au client (ClientEmail)

**Si AUTO_SEND_EMAIL = true (envoi automatique) :**

Les factures sont automatiquement envoyées dès leur génération.

### Voir les statistiques

1. Menu **Factures > Voir les statistiques**
2. Consultez le nombre de factures par statut

---

## 🔧 Configuration Avancée

### Génération automatique planifiée (optionnel)

Pour générer automatiquement les factures à intervalle régulier :

1. Ouvrez Apps Script (Extensions > Apps Script)
2. Cliquez sur l'icône "Déclencheurs" (horloge) à gauche
3. Cliquez sur "+ Ajouter un déclencheur"
4. Configurez :
   - Fonction : `scheduledInvoiceGeneration`
   - Type de déclenchement : Basé sur la durée
   - Type de déclencheur temporel : Quotidien / Hebdomadaire
   - Heure : Choisissez l'heure (ex: 8h-9h)
5. Enregistrez

### Personnalisation du template

Pour modifier le design des factures :

1. Ouvrez votre template Google Docs
2. Modifiez le formatage, les couleurs, ajoutez un logo, etc.
3. **Ne modifiez pas** les marqueurs `<<TEXTE>>`
4. Sauvegardez
5. Les prochaines factures utiliseront le nouveau design

### Modification des colonnes

Si vous souhaitez ajouter/supprimer des colonnes :

1. Modifiez `00_Config.js` (section COLUMNS)
2. Modifiez `02_DataCollector.js` (fonctions de récupération)
3. Modifiez `03_InvoiceGenerator.js` (fonction replaceMarkers)
4. Modifiez votre template Docs (ajoutez les nouveaux marqueurs)
5. Redéployez les scripts

---

## 📁 Structure du Projet

```
invoice_auto/
├── src/
│   ├── 00_Config.js              # Configuration centralisée
│   ├── 01_Utils.js               # Fonctions utilitaires
│   ├── 02_DataCollector.js       # Collecte des données
│   ├── 03_InvoiceGenerator.js    # Génération de factures
│   ├── 04_Main.js                # Interface utilisateur
│   ├── appsscript.json           # Config Apps Script
│   └── .clasp.json               # Config clasp
├── templates/
│   ├── SHEET_STRUCTURE.md        # Structure du Google Sheet
│   └── DOCS_TEMPLATE.md          # Structure du template Docs
├── MASTER_PROMPT.md              # Documentation technique détaillée
└── README.md                     # Ce fichier
```

---

## 🐛 Dépannage

### Erreur : "Feuille Factures introuvable"

**Solution** : Vérifiez que votre feuille s'appelle exactement **"Factures"** (avec majuscule, sans espace)

### Erreur : "Template Google Docs introuvable"

**Solution** :
1. Vérifiez l'ID du template dans la feuille "Parametres"
2. Assurez-vous que le template est accessible avec le même compte Google
3. Testez avec le menu "Tester les permissions"

### Erreur : "Permission refusée"

**Solution** :
1. Exécutez la fonction `menuTestPermissions` depuis Apps Script
2. Autorisez toutes les permissions demandées
3. Si le problème persiste, supprimez les autorisations dans Google Account et réautorisez

### Les marqueurs ne sont pas remplacés

**Solution** :
1. Vérifiez que les marqueurs dans le template sont bien écrits : `<<TEXTE>>`
2. Pas d'espaces : `<<CLIENT_NOM>>` et non `<< CLIENT_NOM >>`
3. Respectez la casse exacte

### L'email n'est pas envoyé

**Solution** :
1. Vérifiez que ClientEmail contient une adresse valide
2. Vérifiez AUTO_SEND_EMAIL dans Parametres
3. Vérifiez les permissions Gmail dans Apps Script

---

## ⚙️ Menu Disponible

Une fois les scripts installés, le menu **📄 Factures** apparaît dans votre Google Sheet :

### Workflow principal (3 étapes)

| Option (FR)                          | Option (EN)                | Description                                    |
|--------------------------------------|----------------------------|------------------------------------------------|
| 1️⃣ ➕ Enregistrement d'une vente    | 1️⃣ ➕ Record a sale       | Crée une nouvelle facture (brouillon)          |
| 2️⃣ 📄 Génération de facture(s)      | 2️⃣ 📄 Generate invoice(s) | Génère les PDF des factures en attente         |
| 3️⃣ 📧 Envoi de mail(s)              | 3️⃣ 📧 Send email(s)       | Envoie les factures par email                  |

### Autres options

| Option                           | Description                                    |
|----------------------------------|------------------------------------------------|
| 📊 Statistiques                  | Tableau de bord avec vue d'ensemble            |
| 🌐 Changer de langue             | Bascule entre Français et English              |
| ⚙️ Tester les permissions        | Vérifie que tout est correctement configuré    |
| 📝 Régénérer footer légal        | Met à jour le pied de page légal               |

---

## 📊 Cycle de Vie d'une Facture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    Draft    │ ──▶  │  Generated  │ ──▶  │    Sent     │
└─────────────┘      └─────────────┘      └─────────────┘
   (Création)         (Génération)         (Email envoyé)
```

1. **Draft** : Facture créée dans le Sheet, en attente de génération
2. **Generated** : Facture transformée en PDF et stockée dans Drive
3. **Sent** : Facture envoyée par email au client

### Organisation des fichiers

```
📁 [Votre dossier principal]
└── 📁 CLIENTS
    └── 📁 [Nom du client]
        ├── 📄 Facture_INV2025-001_ClientABC.pdf
        └── 📄 Facture_INV2025-002_ClientABC.pdf
```

---

## 🔒 Sécurité et Confidentialité

- Les scripts s'exécutent sous **votre compte Google**
- Aucune donnée n'est envoyée à des serveurs externes
- Les factures sont stockées dans **votre Google Drive**
- Les emails sont envoyés depuis **votre compte Gmail**
- Vous gardez le contrôle total de vos données

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Consultez la section **Dépannage** ci-dessus
2. Vérifiez les logs dans Apps Script (Affichage > Journaux)
3. Utilisez le menu "Tester les permissions"
4. Consultez `MASTER_PROMPT.md` pour la documentation technique

---

## 📝 Notes Importantes

- Les InvoiceID doivent être **uniques**
- Ne modifiez pas les noms des feuilles ("Factures", "Parametres")
- Ne modifiez pas les en-têtes de colonnes
- Testez toujours avec des données de test avant utilisation réelle
- Faites des sauvegardes régulières de votre Google Sheet

---

## 🎓 Ressources

- [Documentation Google Apps Script](https://developers.google.com/apps-script)
- [Documentation clasp](https://github.com/google/clasp)
- [Templates de factures](templates/)
- [Master Prompt technique](MASTER_PROMPT.md)

---

## 📄 Licence

Ce projet est libre d'utilisation pour un usage personnel et commercial.

---

## 👨‍💻 Auteur

Développé par Claude Code pour Nelly Tchiengue
Version 2.0 Multi-Country Edition - Mai 2026

---

**Bon usage de InvoiceFlash !** 🚀
