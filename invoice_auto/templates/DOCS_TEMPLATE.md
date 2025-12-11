# Template Google Docs pour Factures

Ce document décrit comment créer le template Google Docs qui sera utilisé pour générer les factures.

---

## 🎯 OBJECTIF

Créer un document Google Docs qui contient des **marqueurs** (placeholders) qui seront automatiquement remplacés par les données réelles lors de la génération de la facture.

---

## 📝 MARQUEURS DISPONIBLES

### Informations Entreprise
```
<<ENTREPRISE_NOM>>
<<ENTREPRISE_ADRESSE>>
<<ENTREPRISE_TEL>>
<<ENTREPRISE_EMAIL>>
```

### Informations Facture
```
<<FACTURE_ID>>
<<FACTURE_DATE>>
```

### Informations Client
```
<<CLIENT_NOM>>
<<CLIENT_EMAIL>>
<<CLIENT_TEL>>
<<CLIENT_ADRESSE>>
```

### Détails de la Transaction
```
<<DESIGNATION>>
<<QUANTITE>>
<<PRIX_UNITAIRE>>
<<MONTANT_TOTAL>>
<<MONTANT_LETTRES>>
```

---

## 📄 EXEMPLE DE TEMPLATE

Voici un exemple de template que vous pouvez copier-coller dans Google Docs :

```
═══════════════════════════════════════════════════════════════════════

                        <<ENTREPRISE_NOM>>
                    <<ENTREPRISE_ADRESSE>>
            Tél: <<ENTREPRISE_TEL>> | Email: <<ENTREPRISE_EMAIL>>

═══════════════════════════════════════════════════════════════════════


                            FACTURE N° <<FACTURE_ID>>

                            Date: <<FACTURE_DATE>>


───────────────────────────────────────────────────────────────────────

INFORMATIONS CLIENT

Nom:            <<CLIENT_NOM>>
Email:          <<CLIENT_EMAIL>>
Téléphone:      <<CLIENT_TEL>>
Adresse:        <<CLIENT_ADRESSE>>

───────────────────────────────────────────────────────────────────────

DÉTAILS DE LA FACTURE


Désignation:            <<DESIGNATION>>

Quantité:               <<QUANTITE>>

Prix Unitaire:          <<PRIX_UNITAIRE>>


─────────────────────────────────────────────────────────────────────

MONTANT TOTAL:          <<MONTANT_TOTAL>>

─────────────────────────────────────────────────────────────────────


Montant en lettres:
<<MONTANT_LETTRES>>


═══════════════════════════════════════════════════════════════════════

Merci de votre confiance !

Conditions de paiement: Paiement à réception
Mode de règlement accepté: Espèces, Virement bancaire, Mobile Money

═══════════════════════════════════════════════════════════════════════

                        [Signature et Cachet]

```

---

## 🎨 RECOMMANDATIONS DE FORMATAGE

### 1. Police et Taille

- **Titre (FACTURE N°)** : Arial 18-20pt, Gras
- **Nom de l'entreprise** : Arial 14-16pt, Gras
- **Sections** : Arial 12pt, Gras
- **Contenu** : Arial 11pt, Normal
- **Montant total** : Arial 14pt, Gras

### 2. Alignement

- **En-tête entreprise** : Centré
- **Titre FACTURE** : Centré
- **Infos client** : Aligné à gauche
- **Détails facture** : Aligné à gauche avec tabulations
- **Montant total** : Aligné à droite ou centré avec mise en évidence

### 3. Couleurs

- **Bordures/Séparateurs** : Gris foncé (#333333)
- **Titre FACTURE** : Bleu foncé (#0066CC) ou noir
- **Montant total** : Rouge foncé (#CC0000) ou noir en gras

### 4. Espacement

- **Marges** : 2 cm de chaque côté
- **Espacement entre sections** : 1-2 lignes vides
- **Interligne** : 1.15 ou 1.5

---

## 🖼️ AJOUT D'UN LOGO (Optionnel)

Pour ajouter un logo :

1. Insérez votre logo en haut du document (avant le nom de l'entreprise)
2. Redimensionnez-le (recommandé : 150x150 pixels max)
3. Centrez-le
4. Le logo sera copié automatiquement sur chaque facture générée

**Note** : Le script ne remplace pas le logo - il est copié tel quel du template.

---

## 📋 ÉTAPES DE CRÉATION

### Étape 1 : Créer le document

1. Allez sur Google Docs
2. Créez un nouveau document vierge
3. Nommez-le "Template_Facture" (ou un nom de votre choix)

### Étape 2 : Copier le contenu

1. Copiez le template d'exemple ci-dessus
2. Collez-le dans votre Google Docs
3. Ajustez le formatage selon vos préférences

### Étape 3 : Personnaliser

1. Ajoutez votre logo (si souhaité)
2. Modifiez les couleurs selon votre charte graphique
3. Ajoutez des éléments fixes (numéro SIRET, conditions, etc.)
4. **Important** : Ne modifiez pas les marqueurs `<<TEXTE>>`

### Étape 4 : Récupérer l'ID

1. Une fois le document créé et sauvegardé
2. Récupérez l'ID depuis l'URL (voir SHEET_STRUCTURE.md)
3. Collez cet ID dans la feuille "Parametres" de votre Google Sheet

### Étape 5 : Tester

1. Créez une facture de test dans votre Sheet
2. Utilisez le menu "Factures > Générer une facture spécifique"
3. Vérifiez que le PDF généré correspond à vos attentes
4. Ajustez le template si nécessaire

---

## ⚠️ ERREURS COURANTES À ÉVITER

### ❌ Erreur : Marqueur mal écrit

```
Mauvais : <CLIENT_NOM>         (un seul < et >)
Mauvais : {{CLIENT_NOM}}       (mauvais type de parenthèses)
Mauvais : <<Client_Nom>>       (casse incorrecte)
Bon : <<CLIENT_NOM>>           (exactement comme ça)
```

### ❌ Erreur : Espaces dans les marqueurs

```
Mauvais : << CLIENT_NOM >>     (espaces avant/après)
Bon : <<CLIENT_NOM>>           (aucun espace)
```

### ❌ Erreur : Marqueur oublié

Si vous oubliez un marqueur dans le template, il ne sera pas remplacé et apparaîtra tel quel dans la facture finale.

---

## 🎨 TEMPLATE AVANCÉ (Avec Tableau)

Si vous préférez un format avec tableau :

```
═══════════════════════════════════════════════════════════════════════

                        <<ENTREPRISE_NOM>>
                    <<ENTREPRISE_ADRESSE>>
            Tél: <<ENTREPRISE_TEL>> | Email: <<ENTREPRISE_EMAIL>>

═══════════════════════════════════════════════════════════════════════

FACTURE N° <<FACTURE_ID>>                        Date: <<FACTURE_DATE>>

───────────────────────────────────────────────────────────────────────

FACTURÉ À:
<<CLIENT_NOM>>
<<CLIENT_ADRESSE>>
Tél: <<CLIENT_TEL>>
Email: <<CLIENT_EMAIL>>

───────────────────────────────────────────────────────────────────────

┌────────────────────────────────────────────────────────────────────┐
│  Désignation          │ Qté │ Prix Unit. │ Montant Total         │
├────────────────────────────────────────────────────────────────────┤
│  <<DESIGNATION>>      │ <<QUANTITE>> │ <<PRIX_UNITAIRE>> │ <<MONTANT_TOTAL>> │
└────────────────────────────────────────────────────────────────────┘

                                    TOTAL À PAYER: <<MONTANT_TOTAL>>

Montant en lettres: <<MONTANT_LETTRES>>

───────────────────────────────────────────────────────────────────────

Conditions de paiement: À réception
Mode de règlement: Espèces, Virement, Mobile Money

═══════════════════════════════════════════════════════════════════════
```

**Note** : Pour créer un tableau dans Google Docs, utilisez Insertion > Tableau

---

## ✅ CHECKLIST DE VALIDATION

Avant d'utiliser votre template :

- [ ] Tous les marqueurs sont correctement écrits (avec `<<` et `>>`)
- [ ] Aucun espace dans les marqueurs
- [ ] Le formatage est propre et professionnel
- [ ] Le logo est bien positionné (si applicable)
- [ ] Les informations fixes sont correctes (conditions de paiement, etc.)
- [ ] L'ID du document a été récupéré et placé dans Parametres
- [ ] Un test de génération a été effectué
- [ ] Le PDF généré est satisfaisant

---

## 💡 ASTUCES

1. **Cohérence visuelle** : Gardez un style uniforme (même police, mêmes couleurs)
2. **Lisibilité** : Ne surchargez pas le template, restez simple et clair
3. **Impression** : Testez l'impression du PDF généré pour vérifier les marges
4. **Versions** : Gardez plusieurs versions de votre template si vous avez différents types de factures
5. **Sauvegarde** : Faites une copie de votre template avant modifications importantes

---

## 🔄 MAINTENANCE

Pour modifier le template après déploiement :

1. Ouvrez le template Google Docs
2. Effectuez vos modifications
3. Sauvegardez (automatique dans Google Docs)
4. Les prochaines factures générées utiliseront la nouvelle version
5. Aucune modification de code nécessaire !

---

**Vous avez maintenant toutes les informations pour créer votre template de facture !**
