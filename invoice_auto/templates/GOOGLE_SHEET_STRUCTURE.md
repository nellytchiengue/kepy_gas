# Google Sheet Template Structure

**File name:** Invoice_Tracker_EN.xlsx

**How to create:**
1. Open Google Sheets
2. Create a new blank spreadsheet
3. Follow the structure below
4. Save/Download as Excel (.xlsx) for distribution

---

## SHEET 1: "Invoices"

### Row 1 (Headers) - **Make it bold and add background color #4285F4 (blue)**

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| InvoiceID | InvoiceDate | ClientName | ClientEmail | ClientPhone | ClientAddress | Description | Quantity | UnitPrice | TotalAmount | Status | PDFUrl |

### Row 2 (Example data)

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| INV2025-001 | 12/15/2025 | John Smith | john@example.com | +1-555-0123 | 123 Main Street, City, State 12345 | Web Design Services | 1 | 500 | =H2*I2 | Draft | |

### Row 3 (Example data)

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| INV2025-002 | 12/16/2025 | Jane Doe | jane@example.com | +1-555-0456 | 456 Oak Avenue, City, State 67890 | Consulting - 2 hours | 2 | 150 | =H3*I3 | Draft | |

### Row 4 (Example data)

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| INV2025-003 | 12/17/2025 | Acme Corp | billing@acmecorp.com | +1-555-0789 | 789 Business Blvd, City, State 13579 | Logo Design Package | 1 | 800 | =H4*I4 | Draft | |

---

## SHEET 2: "Settings"

### Row 1 (Headers) - **Make it bold and add background color #4285F4 (blue)**

| A | B |
|---|---|
| Parameter | Value |

### Data Rows

| A | B |
|---|---|
| TEMPLATE_DOCS_ID | [Will be filled by Setup Wizard] |
| DRIVE_FOLDER_ID | [Will be filled by Setup Wizard] |
| SENDER_EMAIL | your@email.com |
| AUTO_SEND_EMAIL | false |
| COMPANY_NAME | Your Company Name |
| COMPANY_ADDRESS | 123 Business Street, City, State, ZIP |
| COMPANY_PHONE | +1-555-9999 |
| COMPANY_EMAIL | contact@yourcompany.com |
| INVOICE_PREFIX | INV2025- |
| LAST_INVOICE_NUMBER | 0 |

---

## Formatting Instructions

### For "Invoices" Sheet:

#### 1. Header Row (Row 1)
- **Bold**: Yes
- **Background**: #4285F4 (blue)
- **Text color**: White (#FFFFFF)
- **Alignment**: Center
- **Font size**: 10pt

#### 2. Freeze Header Row
- View > Freeze > 1 row

#### 3. Column Widths
- A (InvoiceID): 120px
- B (InvoiceDate): 100px
- C (ClientName): 150px
- D (ClientEmail): 180px
- E (ClientPhone): 120px
- F (ClientAddress): 250px
- G (Description): 200px
- H (Quantity): 80px
- I (UnitPrice): 100px
- J (TotalAmount): 120px
- K (Status): 100px
- L (PDFUrl): 200px

#### 4. Data Validation for Status Column (K)

Select column K (from K2 to K1000):
- Data > Data validation
- Criteria: List of items
- Items: `Draft, Generated, Sent`
- Show dropdown: Yes
- Invalid data: Reject input

#### 5. Conditional Formatting for Status

**Rule 1: Draft = Orange**
- Select K2:K1000
- Format > Conditional formatting
- Format cells if: Text is exactly "Draft"
- Background: #FFE4B5 (light orange)

**Rule 2: Generated = Light Green**
- Select K2:K1000
- Format > Conditional formatting
- Format cells if: Text is exactly "Generated"
- Background: #90EE90 (light green)

**Rule 3: Sent = Dark Green**
- Select K2:K1000
- Format > Conditional formatting
- Format cells if: Text is exactly "Sent"
- Background: #32CD32 (lime green)

#### 6. Formula for TotalAmount (Column J)

In cell J2:
```
=H2*I2
```

Drag down to all rows or use:
```
=ARRAYFORMULA(IF(ROW(H:H)=1,"TotalAmount",IF(H:H="","",H:H*I:I)))
```

#### 7. Number Formatting

- Column I (UnitPrice): Number with 2 decimals, thousand separator
- Column J (TotalAmount): Number with 2 decimals, thousand separator

#### 8. Add Filter
- Select A1:L1
- Data > Create a filter

---

### For "Settings" Sheet:

#### 1. Header Row (Row 1)
- **Bold**: Yes
- **Background**: #4285F4 (blue)
- **Text color**: White
- **Alignment**: Center

#### 2. Column Widths
- A (Parameter): 220px
- B (Value): 400px

#### 3. Column A (Parameters)
- **Bold**: Yes
- **Text color**: #333333 (dark gray)

#### 4. Protect Sheet (Optional but recommended)
- Right-click on sheet tab
- Protect sheet
- Allow: "Select cells" only
- This prevents accidental deletion

---

## French Version Structure

For the French version (`Invoice_Tracker_FR.xlsx`), use these headers:

### Sheet 1: "Factures"

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| NumeroFacture | DateFacture | NomClient | EmailClient | TelClient | AdresseClient | Description | Quantite | PrixUnitaire | MontantTotal | Statut | URLPdf |

**Status values (French):**
- Brouillon
- Générée
- Envoyée

### Sheet 2: "Parametres"

Same parameter keys (in English to match the code), but you can add French descriptions in a third column if desired.

---

## Additional Features (Optional)

### 1. Dashboard Sheet

Create a third sheet called "Dashboard" with:

```
┌─────────────────────────────────────┐
│ 📊 INVOICE DASHBOARD                │
├─────────────────────────────────────┤
│ Total Invoices:       =COUNTA(Invoices!A2:A)
│ Total Revenue:        =SUM(Invoices!J2:J)
│ Draft:                =COUNTIF(Invoices!K2:K,"Draft")
│ Generated:            =COUNTIF(Invoices!K2:K,"Generated")
│ Sent:                 =COUNTIF(Invoices!K2:K,"Sent")
└─────────────────────────────────────┘
```

### 2. Chart (Optional)

Add a pie chart showing invoices by status:
- Data range: Invoices!K2:K
- Chart type: Pie chart
- Title: "Invoice Status Distribution"

---

## Testing Checklist

Before distributing the template:

- [ ] Headers are bold and blue
- [ ] All column widths are readable
- [ ] Data validation works on Status column
- [ ] Conditional formatting shows colors correctly
- [ ] Formula in TotalAmount calculates correctly
- [ ] Filter is enabled
- [ ] Settings sheet has all parameters
- [ ] Example data is present and realistic
- [ ] Sheet tabs are named correctly
- [ ] File is saved as .xlsx

---

## Export for Gumroad

1. **For Excel users:**
   - File > Download > Microsoft Excel (.xlsx)
   - This keeps all formatting and formulas

2. **For Google Sheets users:**
   - Users will upload the .xlsx to Drive
   - Google Sheets will convert it automatically
   - All formatting will be preserved

---

**Your Google Sheet template is ready!**

Users will:
1. Download this .xlsx file
2. Upload to Google Drive
3. Open with Google Sheets
4. Run the Setup Wizard
5. Start creating invoices

✅ Template complete!
