# Template Google Docs Facture - Français (Style Classique)

**Comment utiliser ce template:**
1. Créez un nouveau document Google Docs
2. Copiez tout ce qui est en dessous de la ligne
3. Collez-le dans votre Google Doc
4. Formatez-le (voir instructions de formatage à la fin)
5. Récupérez l'ID du document depuis l'URL
6. Mettez l'ID dans votre feuille Settings

---

**COPIEZ À PARTIR D'ICI ↓**

```
═══════════════════════════════════════════════════════════════════════

                        {{COMPANY_NAME}}
                    {{COMPANY_ADDRESS}}
            Tél: {{COMPANY_PHONE}} | Email: {{COMPANY_EMAIL}}

═══════════════════════════════════════════════════════════════════════


                            FACTURE N° {{INVOICE_ID}}

                            Date: {{INVOICE_DATE}}


───────────────────────────────────────────────────────────────────────

FACTURÉ À

{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}
Tél: {{CLIENT_PHONE}}
Email: {{CLIENT_EMAIL}}

───────────────────────────────────────────────────────────────────────

DÉTAILS DE LA FACTURE


Désignation:                    {{DESCRIPTION}}

Quantité:                       {{QUANTITY}}

Prix Unitaire:                  {{UNIT_PRICE}}


─────────────────────────────────────────────────────────────────────

MONTANT TOTAL:                  {{TOTAL_AMOUNT}}

─────────────────────────────────────────────────────────────────────


Montant en lettres:
{{AMOUNT_IN_WORDS}}


═══════════════════════════════════════════════════════════════════════

Merci de votre confiance !

Conditions de paiement: Paiement à réception
Modes de règlement: Virement bancaire, Carte bancaire, PayPal, Espèces

Questions? Contactez-nous au {{COMPANY_EMAIL}} ou {{COMPANY_PHONE}}

═══════════════════════════════════════════════════════════════════════


                            [Cachet et Signature]
```

---

## Instructions de Formatage

### Étape 1: Sélectionner tout le texte
Appuyez sur Ctrl+A (Windows) ou Cmd+A (Mac)

### Étape 2: Définir la police par défaut
- Police: Arial
- Taille: 11pt
- Couleur: Noir

### Étape 3: Formater l'en-tête (Infos entreprise)
1. Sélectionnez le bloc entreprise (4 premières lignes)
2. Taille: 12pt
3. Alignement: Centré
4. Couleur: Gris foncé (#333333)
5. Optionnel: Fond bleu clair (#E8F0FE)

### Étape 4: Formater le titre FACTURE
1. Sélectionnez "FACTURE N° {{INVOICE_ID}}"
2. Taille: 20pt
3. Gras: Oui
4. Alignement: Centré
5. Couleur: Bleu foncé (#1A73E8)

### Étape 5: Formater la date
1. Sélectionnez "Date: {{INVOICE_DATE}}"
2. Taille: 12pt
3. Alignement: Centré

### Étape 6: Formater les titres de section
1. Sélectionnez "FACTURÉ À", "DÉTAILS DE LA FACTURE"
2. Taille: 12pt
3. Gras: Oui
4. Couleur: Gris foncé (#666666)

### Étape 7: Formater le total
1. Sélectionnez "MONTANT TOTAL: {{TOTAL_AMOUNT}}"
2. Taille: 16pt
3. Gras: Oui
4. Couleur: Rouge (#D93025) ou noir
5. Alignement: Droite ou centré

### Étape 8: Formater le pied de page
1. Sélectionnez le texte du pied (Merci... Questions?)
2. Taille: 9pt
3. Couleur: Gris (#666666)
4. Alignement: Centré

### Étape 9: Ajouter un logo (Optionnel)
1. Cliquez avant {{COMPANY_NAME}}
2. Insertion > Image > Importer depuis l'ordinateur
3. Redimensionnez à 100-150px de largeur
4. Centrez-le

### Étape 10: Ajuster l'espacement
- Interligne: 1.15 ou 1.5
- Ajoutez de l'espace avant/après les titres de section
- Assurez-vous que la facture tient sur 1 page

---

## Astuces Pro

### Palettes de couleurs

**Bleu Professionnel:**
- Fond en-tête: #E8F0FE (bleu clair)
- Titre: #1A73E8 (bleu Google)
- Texte: #333333 (gris foncé)

**Vert Moderne:**
- Fond en-tête: #E6F4EA (vert clair)
- Titre: #137333 (vert)
- Texte: #333333

**Noir Classique:**
- Tout en noir et blanc
- Utiliser le gras pour l'emphase
- Très professionnel

### Variantes de mise en page

**Mise en page centrée:**
- Tout centré
- Propre et moderne
- Bon pour factures digitales

**Mise en page alignée à gauche:**
- Infos entreprise à gauche
- Plus traditionnel
- Bon pour l'impression

**Mise en page deux colonnes:**
- Entreprise à gauche, Client à droite
- Plus compact
- Look professionnel

---

## Erreurs Courantes à Éviter

❌ **Ne changez pas les marqueurs**
- Gardez {{COMPANY_NAME}} exactement comme ça
- Pas d'espaces: {{CLIENT_NAME}} et non {{ CLIENT_NAME }}

❌ **Ne supprimez pas les marqueurs**
- Tous les {{MARQUEURS}} doivent rester
- Ils seront remplacés automatiquement

❌ **N'utilisez pas trop de polices**
- Maximum 1-2 polices
- Arial ou Helvetica recommandés

✅ **Restez simple**
- Mise en page propre
- Facile à lire
- Apparence professionnelle

---

## Tester Votre Template

Avant de l'utiliser pour de vraies factures:

1. Créez une facture de test dans votre feuille de calcul
2. Lancez "Générer Facture"
3. Vérifiez le PDF généré
4. Vérifiez que tous les marqueurs sont remplacés
5. Vérifiez que le formatage est correct
6. Testez l'impression

Si les marqueurs ne sont pas remplacés:
- Vérifiez l'orthographe: {{CLIENT_NAME}} et non {{client_name}}
- Vérifiez les espaces: pas d'espaces dans {{}}
- Re-copiez le template

---

**Template prêt à l'emploi !**

Une fois formaté, récupérez l'ID du document depuis l'URL:
`https://docs.google.com/document/d/VOTRE_ID_ICI/edit`

Mettez VOTRE_ID_ICI dans la feuille Settings sous TEMPLATE_DOCS_ID.

Terminé ! ✅
