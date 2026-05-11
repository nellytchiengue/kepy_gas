# InvoiceFlash - Sequences Email Post-Achat

---

## EMAIL 1: BIENVENUE (Immediat)

### Version Francaise

**Objet:** Votre acces InvoiceFlash + Demarrage en 5 min

**Corps:**

```
Bonjour {{first_name}},

Merci pour votre achat d'InvoiceFlash !

Vous avez fait le bon choix : plus jamais de factures manuelles chronophages.

---

ACCES A VOS FICHIERS

Telechargez votre package ici :
{{download_link}}

---

DEMARRAGE RAPIDE (5 minutes)

1. Telechargez le fichier ZIP
2. Uploadez le Google Sheet sur votre Drive
3. Ouvrez le Sheet et cliquez sur "Factures > Installation"
4. Suivez les 6 etapes de l'assistant
5. Creez votre premiere facture

Guide complet inclus dans le package.

---

BESOIN D'AIDE ?

- Consultez le guide de demarrage rapide (dans /documentation)
- FAQ complete incluse
{{if tier == PRO or tier == BUSINESS}}
- Repondez a cet email pour toute question (support {{support_duration}} jours)
{{endif}}

---

Bonne facturation !

L'equipe InvoiceFlash

P.S. Si vous rencontrez un probleme technique, repondez simplement a cet email avec une capture d'ecran. Nous repondons sous 24-48h.
```

---

### Version Anglaise

**Subject:** Your InvoiceFlash access + 5-min setup

**Body:**

```
Hi {{first_name}},

Thank you for purchasing InvoiceFlash!

You made the right choice: no more time-consuming manual invoices.

---

ACCESS YOUR FILES

Download your package here:
{{download_link}}

---

QUICK START (5 minutes)

1. Download the ZIP file
2. Upload the Google Sheet to your Drive
3. Open the Sheet and click "Invoices > Setup"
4. Follow the 6-step wizard
5. Create your first invoice

Complete guide included in the package.

---

NEED HELP?

- Check the quick start guide (in /documentation)
- Complete FAQ included
{{if tier == PRO or tier == BUSINESS}}
- Reply to this email for any questions ({{support_duration}}-day support)
{{endif}}

---

Happy invoicing!

The InvoiceFlash Team

P.S. If you encounter any technical issues, just reply to this email with a screenshot. We respond within 24-48 hours.
```

---

## EMAIL 2: AIDE (J+3)

### Version Francaise

**Objet:** Avez-vous cree votre premiere facture ?

**Corps:**

```
Bonjour {{first_name}},

Cela fait 3 jours que vous avez InvoiceFlash.

Ou en etes-vous ?

---

SI VOUS N'AVEZ PAS ENCORE COMMENCE

Pas de panique. Voici les 3 etapes les plus importantes :

1. Uploadez le Google Sheet sur votre Drive
2. Lancez l'assistant d'installation (menu Factures > Installation)
3. Remplissez vos infos entreprise

L'assistant fait le reste automatiquement.

---

PROBLEMES FREQUENTS

"Je ne vois pas le menu Factures"
→ Rafraichissez la page (F5) apres l'ouverture du Sheet

"L'autorisation Google echoue"
→ Utilisez le meme compte Google pour Sheet et Drive

"Je ne sais pas quoi mettre dans SIRET/NIU"
→ Selectionnez votre pays dans l'assistant, seuls les champs pertinents apparaitront

---

SI VOUS AVEZ DEJA FACTURE

Genial ! Quelques astuces pour aller plus loin :

- Ajoutez vos clients dans l'onglet "Clients" pour les reutiliser
- Utilisez l'onglet "Services" pour vos prestations recurrentes
- Activez l'envoi email automatique dans les parametres

---

Une question ? Repondez a cet email.

L'equipe InvoiceFlash
```

---

### Version Anglaise

**Subject:** Did you create your first invoice yet?

**Body:**

```
Hi {{first_name}},

It's been 3 days since you got InvoiceFlash.

How's it going?

---

IF YOU HAVEN'T STARTED YET

No worries. Here are the 3 most important steps:

1. Upload the Google Sheet to your Drive
2. Launch the setup wizard (Invoices menu > Setup)
3. Fill in your company info

The wizard does the rest automatically.

---

COMMON ISSUES

"I don't see the Invoices menu"
→ Refresh the page (F5) after opening the Sheet

"Google authorization fails"
→ Use the same Google account for Sheet and Drive

"I don't know what to put in SIRET/EIN"
→ Select your country in the wizard, only relevant fields will appear

---

IF YOU'VE ALREADY INVOICED

Great! A few tips to go further:

- Add your clients in the "Clients" tab to reuse them
- Use the "Services" tab for recurring services
- Enable automatic email sending in settings

---

Questions? Just reply to this email.

The InvoiceFlash Team
```

---

## EMAIL 3: FEEDBACK (J+7)

### Version Francaise

**Objet:** Votre avis sur InvoiceFlash (30 sec)

**Corps:**

```
Bonjour {{first_name}},

Une semaine avec InvoiceFlash !

J'aimerais savoir : comment ca se passe ?

---

2 QUESTIONS RAPIDES

1. Avez-vous reussi a envoyer votre premiere facture ?
   → Repondez simplement "Oui" ou "Non"

2. Qu'est-ce qui vous a le plus plu (ou deplu) ?
   → Une phrase suffit

---

VOTRE AVIS COMPTE

Si InvoiceFlash vous fait gagner du temps, un petit avis sur Gumroad nous aiderait enormement :

{{review_link}}

Les avis honnetes (meme critiques) nous aident a ameliorer le produit.

---

VOUS AVEZ DES IDEES ?

Des fonctionnalites manquantes ? Des ameliorations souhaitees ?

Repondez a cet email. Chaque suggestion est lue et consideree pour les futures versions.

---

Merci d'avoir choisi InvoiceFlash.

{{your_name}}
Createur d'InvoiceFlash

P.S. Si vous connaissez un freelance ou entrepreneur qui perd du temps sur ses factures, n'hesitez pas a lui parler d'InvoiceFlash. Le bouche-a-oreille est notre meilleure publicite.
```

---

### Version Anglaise

**Subject:** Your thoughts on InvoiceFlash (30 sec)

**Body:**

```
Hi {{first_name}},

One week with InvoiceFlash!

I'd love to know: how's it going?

---

2 QUICK QUESTIONS

1. Did you manage to send your first invoice?
   → Just reply "Yes" or "No"

2. What did you like most (or least)?
   → One sentence is enough

---

YOUR FEEDBACK MATTERS

If InvoiceFlash saves you time, a quick review on Gumroad would help us a lot:

{{review_link}}

Honest reviews (even critical ones) help us improve the product.

---

GOT IDEAS?

Missing features? Improvements you'd like to see?

Reply to this email. Every suggestion is read and considered for future versions.

---

Thanks for choosing InvoiceFlash.

{{your_name}}
Creator of InvoiceFlash

P.S. If you know a freelancer or entrepreneur wasting time on invoices, feel free to tell them about InvoiceFlash. Word of mouth is our best marketing.
```

---

## CONFIGURATION GUMROAD

### Parametres Email

| Email | Declencheur | Delai |
|-------|-------------|-------|
| Bienvenue | Achat confirme | Immediat |
| Aide | Achat confirme | +3 jours |
| Feedback | Achat confirme | +7 jours |

### Variables Dynamiques

| Variable | Description |
|----------|-------------|
| `{{first_name}}` | Prenom de l'acheteur |
| `{{download_link}}` | Lien de telechargement Gumroad |
| `{{review_link}}` | Lien vers la page d'avis |
| `{{tier}}` | Niveau achete (STARTER, PRO, BUSINESS) |
| `{{support_duration}}` | Duree support (30 ou 60 jours) |
| `{{your_name}}` | Votre nom/pseudo |

---

## EMAILS OPTIONNELS

### Email Upsell (J+14) - Uniquement pour STARTER

**Objet:** Passez a PRO pour $25 (offre limitee)

```
Bonjour {{first_name}},

Vous utilisez InvoiceFlash STARTER depuis 2 semaines.

Si vous voulez aller plus loin, voici une offre speciale :

PASSEZ A PRO POUR $25 (au lieu de $49)

Ce que vous debloquez :
- Video tutoriel complete (20 min)
- 3 templates de factures premium
- Support email 30 jours

Cette offre expire dans 48h.

{{upsell_link}}

L'equipe InvoiceFlash
```

### Email Reactivation (J+30) - Si pas d'activite

**Objet:** Tout va bien avec InvoiceFlash ?

```
Bonjour {{first_name}},

Cela fait un mois que vous avez InvoiceFlash.

Nous n'avons pas eu de nouvelles de vous.

Si vous avez rencontre des difficultes ou si le produit ne vous convient pas, faites-le nous savoir.

Nous pouvons :
- Vous aider a configurer l'outil
- Repondre a vos questions techniques
- Vous rembourser si le produit ne correspond pas a vos besoins

Repondez simplement a cet email.

L'equipe InvoiceFlash
```

---

## BONNES PRATIQUES

### Timing
- **Bienvenue:** Immediat = sentiment de prise en charge
- **Aide (J+3):** Assez tot pour debloquer, pas trop intrusif
- **Feedback (J+7):** Temps suffisant pour tester le produit

### Ton
- Direct et utile, pas commercial
- Focus sur l'aide, pas sur la vente
- Reponses courtes encouragees
- Toujours une porte ouverte pour le support

### A eviter
- Trop d'emails (max 3-4 la premiere semaine)
- Ton trop formel ou corporate
- Demander un avis avant que l'utilisateur ait teste
- Emails sans valeur ajoutee (newsletter generique)

---

## METRIQUES A SUIVRE

| Metrique | Objectif |
|----------|----------|
| Taux d'ouverture Email 1 | > 70% |
| Taux d'ouverture Email 2 | > 50% |
| Taux d'ouverture Email 3 | > 40% |
| Taux de reponse Email 3 | > 10% |
| Avis Gumroad generes | > 20% des acheteurs |
