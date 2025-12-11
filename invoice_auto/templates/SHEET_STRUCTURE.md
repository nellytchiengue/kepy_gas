# Structure du Google Sheet

Ce document décrit la structure exacte du Google Sheet à créer pour utiliser le système de génération automatique de factures.

---

## 📊 FEUILLE 1 : "Factures"

Cette feuille contient toutes les données des factures. Chaque ligne représente une facture.

### Structure des colonnes

| Col | En-tête         | Type de données | Description                                  | Obligatoire | Exemple                    |
|-----|-----------------|-----------------|----------------------------------------------|-------------|----------------------------|
| A   | InvoiceID       | Texte           | Identifiant unique de la facture             | ✅          | F001                       |
| B   | DateFacture     | Date            | Date d'émission de la facture                | ✅          | 15/12/2025                 |
| C   | ClientNom       | Texte           | Nom complet du client                        | ✅          | Jean Dupont                |
| D   | ClientEmail     | Email           | Adresse email du client                      | ❌          | jean.dupont@email.com      |
| E   | ClientTel       | Texte           | Numéro de téléphone                          | ❌          | +33 6 12 34 56 78          |
| F   | ClientAdresse   | Texte           | Adresse complète du client                   | ❌          | 123 Rue de Paris, 75001    |
| G   | Designation     | Texte           | Description du produit ou service vendu      | ✅          | Consultation médicale      |
| H   | Quantite        | Nombre          | Quantité vendue                              | ✅          | 1                          |
| I   | PrixUnitaire    | Nombre          | Prix unitaire en FCFA                        | ✅          | 25000                      |
| J   | MontantTotal    | Nombre/Formule  | Montant total = Quantité × Prix Unitaire     | ✅          | 25000 (ou =H2*I2)         |
| K   | Statut          | Liste           | Statut de la facture                         | ✅          | Brouillon                  |
| L   | URLFacture      | URL             | Lien vers le PDF généré (auto-rempli)        | Auto        | https://drive.google.com/... |

### Valeurs possibles pour "Statut" (colonne K)

Créer une validation de données (Liste déroulante) avec ces valeurs :
- **Brouillon** : Facture en attente de génération
- **Générée** : Facture générée mais pas encore envoyée
- **Envoyée** : Facture générée et envoyée par email

### Exemple de données (première ligne après l'en-tête)

```
F001 | 15/12/2025 | Jean Dupont | jean@email.com | +33612345678 | 123 Rue Paris | Consultation | 1 | 25000 | 25000 | Brouillon |
```

### Formule recommandée pour la colonne J (MontantTotal)

En cellule J2 (puis à étirer vers le bas) :
```
=H2*I2
```

---

## ⚙️ FEUILLE 2 : "Parametres"

Cette feuille contient tous les paramètres de configuration du système.

### Structure

| Colonne A (Clé)          | Colonne B (Valeur)                          |
|--------------------------|---------------------------------------------|
| ID_TEMPLATE_DOCS         | [ID du template Google Docs]                |
| ID_DOSSIER_DRIVE         | [ID du dossier de destination Drive]        |
| EMAIL_EXPEDITEUR         | contact@votreentreprise.com                 |
| AUTO_SEND_EMAIL          | false (ou true pour envoi automatique)      |
| ENTREPRISE_NOM           | Votre Entreprise SARL                       |
| ENTREPRISE_ADRESSE       | 456 Avenue des Affaires, 75002 Paris        |
| ENTREPRISE_TEL           | +33 1 23 45 67 89                           |
| ENTREPRISE_EMAIL         | contact@votreentreprise.com                 |

### Comment récupérer les IDs nécessaires ?

#### 1. ID du template Google Docs (ID_TEMPLATE_DOCS)

1. Créez votre template de facture dans Google Docs
2. L'URL ressemble à : `https://docs.google.com/document/d/VOTRE_ID_ICI/edit`
3. Copiez la partie `VOTRE_ID_ICI`
4. Collez-la dans la colonne B, ligne "ID_TEMPLATE_DOCS"

#### 2. ID du dossier Drive (ID_DOSSIER_DRIVE)

1. Créez un dossier dans Google Drive pour stocker les factures
2. Ouvrez ce dossier
3. L'URL ressemble à : `https://drive.google.com/drive/folders/VOTRE_ID_ICI`
4. Copiez la partie `VOTRE_ID_ICI`
5. Collez-la dans la colonne B, ligne "ID_DOSSIER_DRIVE"

#### 3. Flag AUTO_SEND_EMAIL

- Mettez `true` si vous voulez que les factures soient automatiquement envoyées par email
- Mettez `false` si vous préférez envoyer manuellement via le menu

---

## 🎨 FORMATAGE RECOMMANDÉ

### Pour la feuille "Factures"

1. **Ligne d'en-tête (ligne 1)** :
   - Police en gras
   - Arrière-plan : bleu clair
   - Texte centré

2. **Colonne K (Statut)** :
   - Validation de données (liste déroulante)
   - Mise en forme conditionnelle :
     - "Brouillon" → Fond orange
     - "Générée" → Fond vert clair
     - "Envoyée" → Fond vert foncé

3. **Colonnes I et J (montants)** :
   - Format : Nombre avec séparateur de milliers
   - Exemple : 25 000

4. **Colonne L (URLFacture)** :
   - Largeur de colonne augmentée pour afficher les URLs

### Pour la feuille "Parametres"

1. **Ligne d'en-tête** : Ajouter "Paramètre" en A1 et "Valeur" en B1
2. **Colonne A** : Police en gras
3. **Largeur** : Adapter pour que les textes soient lisibles

---

## 📝 NOTES IMPORTANTES

1. **Ne modifiez pas les noms des en-têtes** : Le script s'appuie sur ces noms exacts
2. **Ne supprimez pas les colonnes** : Même si certaines sont optionnelles
3. **InvoiceID doit être unique** : Pas de doublons autorisés
4. **Sauvegardez régulièrement** : Google Sheets sauvegarde automatiquement mais faites des copies
5. **Testez d'abord** : Créez quelques factures de test avant utilisation réelle

---

## ✅ CHECKLIST DE CRÉATION

- [ ] Créer un nouveau Google Sheet
- [ ] Créer la feuille "Factures" avec les 12 colonnes
- [ ] Créer la feuille "Parametres" avec les 8 paramètres
- [ ] Ajouter la validation de données pour la colonne Statut
- [ ] Configurer les IDs dans la feuille Parametres
- [ ] Remplir les informations de l'entreprise
- [ ] Tester avec une facture de test (statut Brouillon)
- [ ] Lier les scripts Apps Script au Sheet
- [ ] Tester la génération via le menu "Factures"
