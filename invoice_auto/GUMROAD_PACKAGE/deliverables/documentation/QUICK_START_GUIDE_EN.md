# Quick Start Guide - InvoiceFlash

**From zero to your first invoice in 5 minutes**

Version 2.0 | Multi-Country | FR + EN

---

## Before You Start

**What you need:**
- A Google account (Gmail)
- 5 minutes of your time
- That's it!

**What's included in your purchase:**
- Pre-configured Google Sheet
- Invoice templates (FR + EN)
- Complete source code
- This guide

---

## 5-Minute Installation

### Step 1: Upload Google Sheet (30 seconds)

1. Unzip the downloaded ZIP file
2. Open the `/installation/` folder
3. Find the file `InvoiceFlash_Sheet.xlsx`
4. Upload it to Google Drive:
   - Go to [drive.google.com](https://drive.google.com)
   - Click **"+ New"** > **"File upload"**
   - Select `InvoiceFlash_Sheet.xlsx`
5. Once uploaded, double-click to open it
6. Google will automatically convert it to Google Sheets

### Step 2: Run the Setup Wizard (3 minutes)

1. **Refresh the page** (F5 or Cmd+R) - Important!
2. Wait 5-10 seconds
3. A new menu appears: **Invoices** (or **Factures**)
4. Click: **Invoices > Setup**
5. Follow the **6 guided steps**:

| Step | Action | Time |
|------|--------|------|
| 1 | Template creation | Automatic |
| 2 | Drive folder creation | Automatic |
| 3 | Company information | You type |
| 4 | Country selection | You select |
| 5 | Permissions test | Automatic |
| 6 | Test invoice | Optional |

**You're ready!**

### Step 3: First Invoice (2 minutes)

1. Go to the **"Invoices"** tab
2. Click **Invoices > New Invoice**
3. Fill in the form:
   - Client (name, email, address)
   - Service/Product
   - Quantity and price
   - VAT rate
4. Click **"Save"**
5. Click **Invoices > Generate Invoice**
6. Your PDF is ready in Google Drive!

---

## Your Google Sheet Structure

### "Invoices" Tab - Your Invoices

| Column | Description | Example |
|--------|-------------|---------|
| InvoiceID | Unique number | INV2025-001 |
| InvoiceDate | Invoice date | 01/15/2025 |
| ClientName | Client name | John Smith |
| ClientEmail | Client email | john@example.com |
| ClientPhone | Phone | +1-555-0123 |
| ClientAddress | Full address | 123 Main St, NYC |
| Description | Service/Product | Strategy consulting |
| Quantity | Quantity | 1 |
| UnitPrice | Unit price (excl. tax) | 500 |
| TVA | VAT rate | 20% |
| TotalAmount | Total (incl. tax) | 600 |
| Status | State | Draft / Generated / Sent |
| PDFUrl | PDF link | (automatic) |

**Possible statuses:**
- **Draft**: Ready to generate
- **Generated**: PDF created
- **Sent**: Email sent to client

### "Settings" Tab - Parameters

Automatically configured by the wizard. You can modify:

| Parameter | Description |
|-----------|-------------|
| COMPANY_NAME | Your company name |
| COMPANY_ADDRESS | Full address |
| COMPANY_PHONE | Phone |
| COMPANY_EMAIL | Contact email |
| COMPANY_WEBSITE | Website |
| COUNTRY | Country (FR, CM, US) |
| SIRET / NIU / EIN | Legal ID based on country |
| BANK_NAME | Bank name |
| BANK_IBAN | IBAN |
| BANK_BIC | BIC/SWIFT |
| AUTO_SEND_EMAIL | Auto send (true/false) |

### "Clients" Tab - Client Database

Save your clients to reuse them:

| Column | Description |
|--------|-------------|
| ClientID | Unique identifier |
| Name | Full name |
| Email | Email |
| Phone | Phone |
| Address | Address |
| Country | Country |
| SIRET / NIU | Client legal ID |
| PaymentTerms | Payment terms |
| Active | Active (TRUE/FALSE) |

### "Services" Tab - Catalog

Save your recurring services:

| Column | Description |
|--------|-------------|
| ServiceID | Identifier |
| Name | Service name |
| Description | Description |
| DefaultPrice | Default price |
| Category | Category |
| VATRate | VAT rate |
| Active | Active (TRUE/FALSE) |

---

## The InvoiceFlash Menu

### 3-Step Workflow

```
Invoices > 1. Record a sale       --> Create the invoice
Invoices > 2. Generate invoice(s) --> Create the PDF
Invoices > 3. Send email(s)       --> Send to client
```

### All Options

| Menu | Action |
|------|--------|
| **1. Record a sale** | Opens new invoice form |
| **2. Generate invoice(s)** | Creates PDFs for "Draft" invoices |
| **3. Send email(s)** | Sends "Generated" invoices by email |
| **Statistics** | Shows dashboard |
| **Switch language** | Toggle FR / EN |
| **Regenerate footer** | Updates legal mentions |
| **Setup** | Re-run configuration wizard |
| **Test permissions** | Verify authorizations |
| **About** | System information |

---

## Multi-Country Configuration

### France (FR)

**Required identifiers:**
- SIRET (14 digits)
- Intra-community VAT number
- RCS (Trade Register)
- Share capital
- Legal form (SARL, SAS, etc.)

**Available VAT rates:**
- 20% (standard rate)
- 10% (intermediate rate)
- 5.5% (reduced rate)
- 2.1% (super-reduced rate)
- 0% (VAT exemption)

**Auto-generated legal mentions:**
- Late payment penalties
- Fixed compensation fee
- Discount
- Registration exemption (if applicable)

### Cameroon (CM)

**Required identifiers:**
- NIU (Unique Identification Number)
- RCCM (Trade Register)
- Tax center

**VAT rate:**
- 19.25% (single rate)

**Special feature:**
- Amount in words mandatory (automatically generated)

### USA (US)

**Required identifiers:**
- EIN (Employer Identification Number)
- State Tax ID

**Taxes:**
- Configurable Sales Tax by state

---

## Template Customization

### Where to find the template?

1. Open Google Drive
2. Search for: `InvoiceFlash_Template`
3. Open the Google Doc

### What you can modify

**Modifiable:**
- Logo (insert your image at the top)
- Colors and fonts
- Layout
- Fixed text
- Custom footer

**Do not modify:**
- Markers `{{...}}`
- They must remain exactly as: `{{CLIENT_NAME}}`

### Main Markers List

| Marker | Replaced by |
|--------|-------------|
| `{{COMPANY_NAME}}` | Your company name |
| `{{COMPANY_ADDRESS}}` | Your address |
| `{{COMPANY_PHONE}}` | Your phone |
| `{{COMPANY_EMAIL}}` | Your email |
| `{{COMPANY_LOGO}}` | Your logo |
| `{{CLIENT_NAME}}` | Client name |
| `{{CLIENT_ADDRESS}}` | Client address |
| `{{CLIENT_EMAIL}}` | Client email |
| `{{INVOICE_ID}}` | Invoice number |
| `{{INVOICE_DATE}}` | Invoice date |
| `{{DUE_DATE}}` | Due date |
| `{{TOTAL_HT}}` | Total excl. tax |
| `{{TOTAL_TVA}}` | VAT amount |
| `{{TOTAL_TTC}}` | Total incl. tax |
| `{{LEGAL_FOOTER}}` | Legal mentions |

---

## Sending Invoices by Email

### Configuration

1. Go to the **Settings** tab
2. Check these parameters:
   - `SENDER_EMAIL`: Your Gmail address
   - `AUTO_SEND_EMAIL`: `true` for auto send, `false` for manual

### Manual Sending

1. Generate the invoice (status changes to "Generated")
2. Click **Invoices > Send email(s)**
3. Email is sent with PDF attached
4. Status changes to "Sent"

### Automatic Sending

1. Enable `AUTO_SEND_EMAIL = true`
2. When you generate an invoice, the email is sent automatically
3. Status changes directly to "Sent"

### Email Content

The email includes:
- Custom subject with invoice number
- Professional message
- PDF attachment
- Your company contact details

---

## Troubleshooting

### The "Invoices" menu doesn't appear

**Solutions:**
1. Refresh the page (F5)
2. Wait 10-15 seconds
3. Verify you're connected to the correct Google account
4. Try in incognito/private mode

### Google authorization error

**Solutions:**
1. Click **Invoices > Test permissions**
2. Accept all requested permissions
3. If it fails, disconnect and reconnect your Google account

### PDF doesn't generate

**Check:**
1. Invoice ID is unique
2. All required fields are filled
3. Status is "Draft"
4. Template exists in Drive

### Markers are not replaced

**Check in the template:**
1. Markers are exactly `{{TEXT}}`
2. No spaces: `{{CLIENT_NAME}}` not `{{ CLIENT_NAME }}`
3. Case sensitive: `{{CLIENT_NAME}}` not `{{client_name}}`

### Email is not sent

**Check:**
1. Client email address is valid
2. `AUTO_SEND_EMAIL` is configured correctly
3. You've authorized Gmail access

---

## Pro Tips

### Batch Invoices

Generate multiple invoices at once:
1. Create multiple rows with Status = "Draft"
2. Click **Invoices > Generate invoice(s)**
3. All Draft invoices are generated

### Multi-Line Invoices

For an invoice with multiple services:
1. Use the same InvoiceID for multiple rows
2. Each row = a different service
3. The system groups them automatically

### Recurring Clients

1. Add your clients in the "Clients" tab
2. When creating an invoice, select them from the list
3. Their information fills in automatically

### Recurring Services

1. Add your services in the "Services" tab
2. When creating, select the service
3. Price and VAT rate fill in automatically

---

## Need Help?

### Documentation

- **Complete guide:** `USER_GUIDE_COMPLETE_EN.pdf`
- **FAQ:** `FAQ.pdf`
- **Troubleshooting:** `TROUBLESHOOTING.pdf`

### Support

- **Email:** support@invoiceflash.com
- **Response time:** 24-48 business hours

### Guarantee

30-day money-back guarantee. Contact us if InvoiceFlash doesn't meet your expectations.

---

## First Start Checklist

- [ ] ZIP unzipped
- [ ] Google Sheet uploaded to Drive
- [ ] Page refreshed (F5)
- [ ] "Invoices" menu visible
- [ ] Setup wizard launched
- [ ] 6 steps completed
- [ ] Company information entered
- [ ] Country selected
- [ ] First invoice created
- [ ] PDF generated successfully

**You're operational!**

---

**InvoiceFlash** - Automatic Invoice Generator
Version 2.0 | Multi-Country | Created by Nelly Tchiengue

*French version available: `QUICK_START_GUIDE_FR.md`*
