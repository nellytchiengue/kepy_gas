# 🚀 Guide de Démarrage Rapide - InvoiceFlash

**De zéro à votre première facture en 5 minutes !**

Version 1.1 | Générateur de Factures en Un Clic

---

## ⏱️ Installation en 5 Minutes

### Étape 1 : Ouvrir Votre Google Sheet (30 secondes)

1. Téléchargez le fichier `Invoice_Tracker_FR.xlsx` de votre achat
2. Uploadez-le sur Google Drive
3. Ouvrez-le avec Google Sheets
4. La feuille de calcul se convertira automatiquement

### Étape 2 : Lancer l'Assistant d'Installation (3 minutes)

1. **Rechargez la page** (important !)
2. Vous verrez un nouveau menu : **📄 Factures**
3. Cliquez sur : **📄 Factures > 🎬 Assistant d'Installation**
4. Suivez les 6 étapes simples :
   - ✅ Création du template (automatique)
   - ✅ Création du dossier (automatique)
   - ✅ Vos informations (vous tapez)
   - ✅ Configuration auto (automatique)
   - ✅ Test des permissions (automatique)
   - ✅ Facture de test (optionnel)

**C'est tout ! Vous êtes prêt.** ⚡

### Étape 3 : Créer Votre Première Facture (1 minute)

1. Allez dans la feuille **"Invoices"**
2. Remplissez une nouvelle ligne :
   - InvoiceID : `F2025-001` (ou n'importe quel ID unique)
   - InvoiceDate : La date du jour
   - ClientName : Le nom de votre client
   - ClientEmail : leur@email.com
   - ClientPhone : +33123456789
   - ClientAddress : Adresse complète
   - Description : Ce que vous facturez
   - Quantity : 1 (ou plus)
   - UnitPrice : 100 (prix unitaire)
   - TotalAmount : `=H2*I2` (formule)
   - Status : **Draft** (sélectionner dans la liste)
3. Cliquez : **📄 Factures > ✨ Générer Facture**
4. **Terminé !** Votre PDF est prêt dans Drive

---

## 📊 Comprendre Votre Feuille de Calcul

### Feuille 1 : "Invoices"

C'est ici que vous gérez toutes vos factures.

| Colonne | Quoi Entrer | Exemple |
|---------|-------------|---------|
| InvoiceID | Identifiant unique | F2025-001 |
| InvoiceDate | Date de la facture | 15/12/2025 |
| ClientName | Nom complet du client | Jean Dupont |
| ClientEmail | Email du client | jean@exemple.com |
| ClientPhone | Numéro de téléphone | +33 6 12 34 56 78 |
| ClientAddress | Adresse complète | 123 Rue Principale, Paris |
| Description | Ce que vous vendez | Prestation Web Design |
| Quantity | Nombre d'unités | 1 |
| UnitPrice | Prix unitaire | 500 |
| TotalAmount | **Formule :** =H×I | 500 |
| Status | Draft/Generated/Sent | Draft |
| PDFUrl | Auto-rempli | (automatique) |

**Important :** Mettez toujours Status à "Draft" pour les nouvelles factures.

### Feuille 2 : "Settings"

Auto-configurée par l'assistant. Vous pouvez modifier :

| Paramètre | Ce Qu'il Fait | Exemple |
|-----------|---------------|---------|
| TEMPLATE_DOCS_ID | Votre document template | 1a2b3c... |
| DRIVE_FOLDER_ID | Où les PDF sont sauvegardés | 4d5e6f... |
| SENDER_EMAIL | Votre email | vous@entreprise.com |
| AUTO_SEND_EMAIL | Envoi auto aux clients | false |
| COMPANY_NAME | Nom de votre entreprise | Acme SARL |
| COMPANY_ADDRESS | Votre adresse | 456 Avenue Business |
| COMPANY_PHONE | Votre téléphone | +33 1 23 45 67 89 |
| COMPANY_EMAIL | Votre email | contact@acme.com |
| INVOICE_PREFIX | Numérotation factures | F2025- |
| LAST_INVOICE_NUMBER | Auto-incrémentation | 0 |

---

## 🎨 Personnaliser Votre Template de Facture

### Où est mon template ?

Après l'installation, l'assistant a créé un template Google Docs. Trouvez-le :

1. Ouvrez Google Drive
2. Recherchez : `Invoice_Template_FR`
3. Ouvrez-le

### Que puis-je personnaliser ?

**Tout sauf les marqueurs !**

✅ **Vous pouvez changer :**
- Couleurs et polices
- Logo (insérez votre logo en haut)
- Mise en page et espacement
- Conditions de paiement
- Texte du pied de page

❌ **Ne changez pas ceux-ci :**
- Les marqueurs comme `{{CLIENT_NAME}}`
- Ils doivent rester exactement `{{TEXTE}}`

### Exemple de personnalisation :

```
Avant :
{{COMPANY_NAME}}

Après (dans votre template) :
[VOTRE LOGO ICI]
{{COMPANY_NAME}}
SIRET : 123 456 789 00012
```

---

## 📤 Envoyer les Factures

### Envoi Manuel (Par Défaut)

1. Générez la facture : **📄 Factures > ✨ Générer Facture**
2. Le PDF est sauvegardé dans votre dossier Drive
3. Copiez le lien PDF depuis la colonne "PDFUrl"
4. Envoyez-le à votre client par email (manuellement)

### Email Automatique (Optionnel)

Vous voulez que les factures soient envoyées automatiquement ?

1. Allez dans la feuille "Settings"
2. Changez `AUTO_SEND_EMAIL` à **true**
3. Maintenant, quand vous générez une facture, elle est automatiquement envoyée au client !

**L'email inclut :**
- PDF en pièce jointe
- Message professionnel
- Signature de votre entreprise

---

## 🔢 Numérotation des Factures

### Numérotation Automatique (Recommandé)

Le système peut auto-incrémenter les numéros de facture :

**Dans Settings :**
- `INVOICE_PREFIX` : F2025-
- `LAST_INVOICE_NUMBER` : 0

**Résultat :**
- Première facture : F2025-001
- Deuxième facture : F2025-002
- Et ainsi de suite...

Pour utiliser la numérotation auto :
1. Laissez la colonne InvoiceID **vide** quand vous créez une nouvelle facture
2. Le système assignera le prochain numéro automatiquement

### Numérotation Manuelle

Vous préférez contrôler les numéros vous-même ?

Tapez simplement votre propre InvoiceID dans chaque ligne :
- F001, F002, F003...
- 2025-JAN-001...
- CLIENT-PROJET-01...

**Important :** Assurez-vous que chaque InvoiceID est unique !

---

## 🎯 Workflows Courants

### Workflow 1 : Facture Unique

```
1. Ajoutez une ligne dans "Invoices"
2. Remplissez tous les champs
3. Mettez Status : Draft
4. Cliquez : Générer Facture
5. Le PDF apparaît dans Drive
6. Le statut change en : Generated
```

### Workflow 2 : Factures en Lot

```
1. Ajoutez plusieurs lignes (5, 10, 20...)
2. Toutes avec Status : Draft
3. Cliquez : Générer Toutes les Factures
4. Tous les PDF générés d'un coup
5. Tous les statuts changent en : Generated
```

### Workflow 3 : Avec Email

```
1. Activez AUTO_SEND_EMAIL dans Settings
2. Ajoutez une ligne de facture
3. Mettez Status : Draft
4. Cliquez : Générer Facture
5. PDF généré + Email envoyé automatiquement
6. Le statut change en : Sent
```

---

## 🆘 Dépannage

### Problème : "Aucun menu n'apparaît"

**Solution :**
- Rafraîchissez la page
- Attendez 10 secondes pour que les scripts se chargent
- Vérifiez : Extensions > Apps Script (les scripts doivent être là)

### Problème : "Template introuvable"

**Solution :**
- Allez dans la feuille Settings
- Vérifiez que TEMPLATE_DOCS_ID est rempli
- Ouvrez cet ID de document dans Google Docs pour vérifier qu'il existe
- Relancez l'Assistant d'Installation si nécessaire

### Problème : "Permission refusée"

**Solution :**
- Cliquez : 📄 Factures > ⚙️ Tester Permissions
- Accordez toutes les permissions demandées
- Si ça échoue encore, essayez dans une fenêtre de navigation privée

### Problème : "Les marqueurs ne sont pas remplacés"

**Solution :**
- Ouvrez votre document template
- Vérifiez que les marqueurs sont exactement : `{{TEXTE}}`
- Pas d'espaces : `{{CLIENT_NAME}}` ✅ | `{{ CLIENT_NAME }}` ❌
- Casse correcte : `{{CLIENT_NAME}}` ✅ | `{{client_name}}` ❌

### Problème : "La formule ne fonctionne pas"

**Solution :**
- Dans la colonne TotalAmount (J), utilisez : `=H2*I2`
- Faites glisser la formule vers le bas pour toutes les lignes
- Ou utilisez : `=ARRAYFORMULA(H2:H*I2:I)`

---

## 💡 Astuces Pro

### Astuce 1 : Validation des Données

Ajoutez des listes déroulantes pour le Status :

1. Sélectionnez la colonne K (Status)
2. Données > Validation des données
3. Liste d'éléments : Draft, Generated, Sent
4. Sauvegarder

Maintenant vous pouvez sélectionner le statut depuis un menu déroulant !

### Astuce 2 : Mise en Forme Conditionnelle

Colorez les factures par statut :

1. Sélectionnez la colonne Status
2. Format > Mise en forme conditionnelle
3. Règles :
   - Si "Draft" → Fond orange
   - Si "Generated" → Fond vert clair
   - Si "Sent" → Fond vert foncé

### Astuce 3 : Feuille Tableau de Bord

Créez un tableau de bord récapitulatif :

```
Total Factures : =NB(Invoices!A2:A)
Chiffre d'Affaires : =SOMME(Invoices!J2:J)
En attente : =NB.SI(Invoices!K2:K;"Draft")
Envoyées : =NB.SI(Invoices!K2:K;"Sent")
```

### Astuce 4 : Sauvegarde

Faites des sauvegardes régulières :

1. Fichier > Créer une copie
2. Nommez-la : Factures_Backup_2025-12-15
3. Stockez-la dans un dossier sûr

---

## 🎓 Prochaines Étapes

### Niveau 1 : Utilisateur Basique
- ✅ Créer des factures
- ✅ Générer des PDF
- ✅ Envoyer aux clients

### Niveau 2 : Utilisateur Avancé
- ⬜ Personnaliser le design du template
- ⬜ Ajouter votre logo
- ⬜ Activer l'email automatique
- ⬜ Utiliser la numérotation auto

### Niveau 3 : Expert
- ⬜ Créer plusieurs templates
- ⬜ Construire un tableau de bord
- ⬜ Automatiser avec des déclencheurs
- ⬜ Intégrer avec la comptabilité

---

## 📞 Besoin d'Aide ?

### Ressources

- **Guide Utilisateur Complet :** Voir `USER_GUIDE_FR.pdf`
- **FAQ :** Voir `FAQ_FR.pdf`
- **Dépannage :** Voir `TROUBLESHOOTING_FR.pdf`
- **Support Email :** support@invoiceflash.com

### Questions Fréquentes

**Q : Puis-je utiliser ceci pour plusieurs clients ?**
R : Oui ! Une ligne = un client = une facture.

**Q : Puis-je personnaliser le template ?**
R : Absolument ! Changez tout sauf les {{MARQUEURS}}.

**Q : Y a-t-il une limite au nombre de factures ?**
R : Non ! Google Sheets supporte 10 millions de cellules.

**Q : Puis-je utiliser mes propres numéros de facture ?**
R : Oui, tapez-les simplement manuellement dans la colonne InvoiceID.

**Q : Ça fonctionne sur mobile ?**
R : Oui, mais le bureau est recommandé pour l'installation.

---

## 🎉 Vous Êtes Prêt !

**Félicitations !** Vous savez maintenant comment :

✅ Installer le système en 5 minutes
✅ Créer votre première facture
✅ Générer des PDF professionnels
✅ Personnaliser votre template
✅ Envoyer des factures aux clients

**Votre système de facturation est prêt à l'emploi.**

Allez créer votre première vraie facture ! 💰

---

**InvoiceFlash** - Générateur de Factures en Un Clic
Version 1.1 | © 2025 | Créé par Nelly Tchiengue

*Besoin de la version anglaise ? Voir `QUICK_START_GUIDE_EN.md`*
