# InvoiceFlash - Google Docs Template Specification
## Version 2.0 (Multi-Country Edition)
## Date: 2025-12-14

This document describes all available placeholders for the multi-country invoice template.
Use these placeholders in your Google Docs template - they will be automatically replaced
when generating invoices.

---

## HEADER SECTION / EN-TETE

### Company Information / Informations Entreprise

| Placeholder | Description FR | Description EN |
|-------------|----------------|----------------|
| `{{COMPANY_NAME}}` | Nom de l'entreprise | Company name |
| `{{COMPANY_ADDRESS}}` | Adresse complete | Full address |
| `{{COMPANY_PHONE}}` | Telephone | Phone number |
| `{{COMPANY_EMAIL}}` | Email | Email address |
| `{{COMPANY_WEBSITE}}` | Site web (optionnel) | Website (optional) |
| `{{COMPANY_LOGO}}` | Logo (URL) | Logo (URL) |

### Company Legal IDs / Identifiants Legaux Entreprise

**Universal (auto-formatted based on country):**
| Placeholder | Description |
|-------------|-------------|
| `{{COMPANY_LEGAL_IDS}}` | Block of all legal IDs, formatted for the configured country |

**France (FR):**
| Placeholder | Description | Required |
|-------------|-------------|----------|
| `{{COMPANY_SIRET}}` | Numero SIRET (14 chiffres) | MANDATORY |
| `{{COMPANY_SIREN}}` | Numero SIREN (9 chiffres) | Optional |
| `{{COMPANY_VAT_FR}}` | TVA Intracommunautaire | Mandatory if not auto-entrepreneur |
| `{{COMPANY_RCS}}` | Registre du Commerce | Optional |
| `{{COMPANY_CAPITAL}}` | Capital social | Optional |
| `{{COMPANY_LEGAL_FORM}}` | Forme juridique (SARL, SAS...) | Optional |
| `{{COMPANY_APE_CODE}}` | Code APE/NAF | Optional |

**Cameroon (CM):**
| Placeholder | Description | Required |
|-------------|-------------|----------|
| `{{COMPANY_NIU}}` | Numero d'Identification Unique | MANDATORY |
| `{{COMPANY_RCCM}}` | Registre du Commerce | MANDATORY |
| `{{COMPANY_TAX_CENTER}}` | Centre des impots de rattachement | MANDATORY |

**USA (US):**
| Placeholder | Description | Required |
|-------------|-------------|----------|
| `{{COMPANY_EIN}}` | Employer Identification Number | Recommended |
| `{{COMPANY_STATE_ID}}` | State Tax ID | Optional |

---

## INVOICE INFORMATION / INFORMATIONS FACTURE

| Placeholder | Description FR | Description EN |
|-------------|----------------|----------------|
| `{{INVOICE_ID}}` | Numero de facture | Invoice number |
| `{{INVOICE_DATE}}` | Date de facture (formatee selon pays) | Invoice date |
| `{{INVOICE_DUE_DATE}}` | Date d'echeance | Due date |
| `{{DELIVERY_DATE}}` | Date de livraison (optionnel) | Delivery date (optional) |
| `{{PO_NUMBER}}` | Numero de commande (optionnel) | Purchase order number |
| `{{PAYMENT_TERMS}}` | Conditions de paiement | Payment terms |

---

## CLIENT INFORMATION / INFORMATIONS CLIENT

### Basic Client Info / Infos Client de Base

| Placeholder | Description FR | Description EN |
|-------------|----------------|----------------|
| `{{CLIENT_NAME}}` | Nom du client | Client name |
| `{{CLIENT_ADDRESS}}` | Adresse du client | Client address |
| `{{CLIENT_EMAIL}}` | Email du client | Client email |
| `{{CLIENT_PHONE}}` | Telephone du client | Client phone |

### Client Legal IDs / Identifiants Legaux Client

**Universal (auto-formatted):**
| Placeholder | Description |
|-------------|-------------|
| `{{CLIENT_LEGAL_IDS}}` | Block of client legal IDs, formatted for the country |

**Country-specific:**
| Placeholder | Country | Description |
|-------------|---------|-------------|
| `{{CLIENT_SIRET}}` | FR | Client SIRET number |
| `{{CLIENT_VAT_NUMBER}}` | FR | Client EU VAT number |
| `{{CLIENT_NIU}}` | CM | Client NIU (Cameroon) |
| `{{CLIENT_TAX_ID}}` | US | Client Tax ID (USA) |

---

## LINE ITEMS / LIGNES DE FACTURE

| Placeholder | Description FR | Description EN |
|-------------|----------------|----------------|
| `{{DESCRIPTION}}` | Description du service/produit | Service/product description |
| `{{QUANTITY}}` | Quantite | Quantity |
| `{{UNIT_PRICE}}` | Prix unitaire (formate) | Unit price (formatted) |
| `{{LINE_VAT_RATE}}` | Taux TVA de la ligne | Line VAT rate |
| `{{LINE_VAT_AMOUNT}}` | Montant TVA de la ligne | Line VAT amount |

---

## TOTALS / TOTAUX

| Placeholder | Description FR | Description EN |
|-------------|----------------|----------------|
| `{{SUBTOTAL_HT}}` | Sous-total HT | Subtotal before tax |
| `{{TVA}}` | Montant TVA total | Total VAT amount |
| `{{TOTAL_TVA}}` | Montant TVA total (alias) | Total VAT amount (alias) |
| `{{TOTAL_TTC}}` | Total TTC | Total including tax |
| `{{TOTAL_AMOUNT}}` | Montant total (alias) | Total amount (alias) |
| `{{TVA_SUMMARY}}` | Resume des taux TVA | VAT rates summary |

### Amount in Words / Montant en Lettres

| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `{{AMOUNT_IN_WORDS}}` | Montant en lettres | Always available |
| `{{AMOUNT_IN_WORDS_BLOCK}}` | Block complet avec introduction | MANDATORY for Cameroon (OHADA) |

**Example for Cameroon:**
```
Arretee la presente facture a la somme de:
Cent vingt-trois mille quatre cent cinquante-six francs CFA
```

---

## BANK DETAILS / COORDONNEES BANCAIRES

| Placeholder | Description FR | Description EN |
|-------------|----------------|----------------|
| `{{BANK_DETAILS}}` | Block complet coordonnees bancaires | Full bank details block |
| `{{BANK_NAME}}` | Nom de la banque | Bank name |
| `{{BANK_IBAN}}` | IBAN | IBAN |
| `{{BANK_BIC}}` | BIC/SWIFT | BIC/SWIFT |
| `{{BANK_ACCOUNT_NAME}}` | Titulaire du compte | Account holder name |

---

## LEGAL FOOTER / MENTIONS LEGALES

| Placeholder | Description | Notes |
|-------------|-------------|-------|
| `{{LEGAL_FOOTER}}` | Footer legal complet (genere automatiquement selon pays) | RECOMMENDED |

### Country-Specific Legal Notices / Mentions Legales par Pays

**France:**
| Placeholder | Description |
|-------------|-------------|
| `{{VAT_EXEMPTION_NOTICE}}` | "TVA non applicable, art. 293 B du CGI" (auto-entrepreneurs only) |
| `{{LATE_PAYMENT_NOTICE}}` | Mention penalites de retard (obligatoire en France) |

**USA:**
| Placeholder | Description |
|-------------|-------------|
| `{{SALES_TAX_NOTICE}}` | Sales tax notice |
| `{{STATE_ID_LINE}}` | State ID line (if applicable) |

---

## LABELS (TRANSLATED) / ETIQUETTES (TRADUITES)

These labels are automatically translated based on the configured locale.

| Placeholder | FR | EN |
|-------------|-----|-----|
| `{{LABEL_INVOICE}}` | FACTURE | INVOICE |
| `{{LABEL_INVOICE_NUMBER}}` | Facture N | Invoice # |
| `{{LABEL_DATE}}` | Date | Date |
| `{{LABEL_DUE_DATE}}` | Echeance | Due Date |
| `{{LABEL_BILLED_TO}}` | Facture a | Bill To |
| `{{LABEL_DESCRIPTION}}` | Description | Description |
| `{{LABEL_QTY}}` | Qte | Qty |
| `{{LABEL_UNIT_PRICE}}` | Prix Unit. | Unit Price |
| `{{LABEL_TVA}}` | TVA | VAT |
| `{{LABEL_TOTAL}}` | Total | Total |
| `{{LABEL_SUBTOTAL}}` | Sous-total HT | Subtotal |
| `{{LABEL_TOTAL_VAT}}` | Total TVA | Total VAT |
| `{{LABEL_TOTAL_TTC}}` | Total TTC | Total |
| `{{LABEL_FOOTER}}` | Mentions legales | Legal notices |
| `{{LABEL_DELIVERY_DATE}}` | Date de livraison | Delivery date |
| `{{LABEL_NOTES}}` | Notes | Notes |

---

## TEMPLATE STRUCTURE EXAMPLE / EXEMPLE DE STRUCTURE

### Header
```
{{COMPANY_NAME}}
{{COMPANY_ADDRESS}}
{{COMPANY_PHONE}} | {{COMPANY_EMAIL}}
{{COMPANY_LEGAL_IDS}}

                                        {{LABEL_INVOICE}}
                                        {{LABEL_INVOICE_NUMBER}}: {{INVOICE_ID}}
                                        {{LABEL_DATE}}: {{INVOICE_DATE}}
                                        {{LABEL_DUE_DATE}}: {{INVOICE_DUE_DATE}}
```

### Client Section
```
{{LABEL_BILLED_TO}}:
{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}
{{CLIENT_EMAIL}} | {{CLIENT_PHONE}}
{{CLIENT_LEGAL_IDS}}
```

### Items Table
```
| {{LABEL_DESCRIPTION}} | {{LABEL_QTY}} | {{LABEL_UNIT_PRICE}} | {{LABEL_TVA}} | {{LABEL_TOTAL}} |
|----------------------|---------------|---------------------|---------------|-----------------|
| {{DESCRIPTION}}      | {{QUANTITY}}  | {{UNIT_PRICE}}      | {{TVA}}       | {{TOTAL_AMOUNT}}|
```

### Totals
```
                                        {{LABEL_SUBTOTAL}}: {{SUBTOTAL_HT}}
                                        {{TVA_SUMMARY}}
                                        {{LABEL_TOTAL_TTC}}: {{TOTAL_TTC}}
```

### Amount in Words (Cameroon)
```
{{AMOUNT_IN_WORDS_BLOCK}}
```

### Bank Details
```
{{BANK_DETAILS}}
```

### Legal Footer
```
{{LEGAL_FOOTER}}
```

---

## COUNTRY-SPECIFIC NOTES / NOTES PAR PAYS

### France (FR)
- SIRET is MANDATORY
- Late payment penalties mention is MANDATORY
- TVA exemption notice for auto-entrepreneurs
- Amount in words is OPTIONAL

### Cameroon (CM)
- NIU, RCCM, and Tax Center are ALL MANDATORY
- Amount in words (AMOUNT_IN_WORDS_BLOCK) is MANDATORY under OHADA
- Currency is FCFA (XAF)
- VAT rate is typically 19.25%

### USA (US)
- EIN is recommended but not mandatory
- Sales tax varies by state
- Amount in words is NOT required
- Currency is USD ($)

---

## AUTOMATIC CLEANUP / NETTOYAGE AUTOMATIQUE

The system automatically removes unused placeholders based on the configured country:

- **For France:** Cameroon and US-specific placeholders are removed
- **For Cameroon:** France and US-specific placeholders are removed
- **For USA:** France and Cameroon-specific placeholders are removed

This means you can create a SINGLE template with ALL placeholders, and the system
will automatically clean up the ones that don't apply to your country.

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2025-12-14 | Multi-country support (FR/CM/US), legal IDs, bank details |
| 1.0 | 2025-12-11 | Initial version (France only) |
