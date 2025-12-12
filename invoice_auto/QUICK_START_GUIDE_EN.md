# 🚀 Quick Start Guide - InvoiceFlash

**From zero to your first invoice in 5 minutes!**

Version 1.1 | One-Click Invoice Generator

---

## ⏱️ 5-Minute Setup

### Step 1: Open Your Google Sheet (30 seconds)

1. Download the `Invoice_Tracker_EN.xlsx` file from your purchase
2. Upload it to Google Drive
3. Open it with Google Sheets
4. The spreadsheet will convert automatically

### Step 2: Run the Setup Wizard (3 minutes)

1. **Reload the page** (important!)
2. You'll see a new menu: **📄 Invoices**
3. Click: **📄 Invoices > 🎬 Setup Wizard**
4. Follow the 6 simple steps:
   - ✅ Template creation (automatic)
   - ✅ Folder creation (automatic)
   - ✅ Your company info (you type)
   - ✅ Auto-configuration (automatic)
   - ✅ Permissions test (automatic)
   - ✅ Test invoice (optional)

**That's it! You're ready to go.** ⚡

### Step 3: Create Your First Invoice (1 minute)

1. Go to the **"Invoices"** sheet
2. Fill in a new row:
   - InvoiceID: `INV2025-001` (or any unique ID)
   - InvoiceDate: Today's date
   - ClientName: Your client's name
   - ClientEmail: their@email.com
   - ClientPhone: +123456789
   - ClientAddress: Full address
   - Description: What you're billing for
   - Quantity: 1 (or more)
   - UnitPrice: 100 (price per unit)
   - TotalAmount: `=H2*I2` (formula)
   - Status: **Draft** (select from dropdown)
3. Click: **📄 Invoices > ✨ Generate Invoice**
4. **Done!** Your PDF is ready in Drive

---

## 📊 Understanding Your Spreadsheet

### Sheet 1: "Invoices"

This is where you manage all your invoices.

| Column | What to Enter | Example |
|--------|---------------|---------|
| InvoiceID | Unique identifier | INV2025-001 |
| InvoiceDate | Date of invoice | 12/15/2025 |
| ClientName | Full client name | John Smith |
| ClientEmail | Client's email | john@example.com |
| ClientPhone | Phone number | +1-555-0123 |
| ClientAddress | Full address | 123 Main St, NYC |
| Description | What you're selling | Web Design Service |
| Quantity | Number of units | 1 |
| UnitPrice | Price per unit | 500 |
| TotalAmount | **Formula:** =H×I | 500 |
| Status | Draft/Generated/Sent | Draft |
| PDFUrl | Auto-filled | (automatic) |

**Important:** Always set Status to "Draft" for new invoices.

### Sheet 2: "Settings"

Auto-configured by the wizard. You can modify:

| Parameter | What It Does | Example |
|-----------|--------------|---------|
| TEMPLATE_DOCS_ID | Your template document | 1a2b3c... |
| DRIVE_FOLDER_ID | Where PDFs are saved | 4d5e6f... |
| SENDER_EMAIL | Your email | you@company.com |
| AUTO_SEND_EMAIL | Auto-send to clients | false |
| COMPANY_NAME | Your business name | Acme Inc. |
| COMPANY_ADDRESS | Your address | 456 Business Ave |
| COMPANY_PHONE | Your phone | +1-555-9999 |
| COMPANY_EMAIL | Your email | contact@acme.com |
| INVOICE_PREFIX | Invoice numbering | INV2025- |
| LAST_INVOICE_NUMBER | Auto-increment | 0 |

---

## 🎨 Customizing Your Invoice Template

### Where is my template?

After setup, the wizard created a Google Docs template. Find it:

1. Open Google Drive
2. Search for: `Invoice_Template_EN`
3. Open it

### What can I customize?

**Everything except the markers!**

✅ **You can change:**
- Colors and fonts
- Logo (insert your company logo at the top)
- Layout and spacing
- Payment terms
- Footer text

❌ **Don't change these:**
- Markers like `{{CLIENT_NAME}}`
- They must stay exactly as `{{TEXT}}`

### Example customization:

```
Before:
{{COMPANY_NAME}}

After (in your template):
[YOUR LOGO HERE]
{{COMPANY_NAME}}
Tax ID: 123-456-789
```

---

## 📤 Sending Invoices

### Manual Sending (Default)

1. Generate the invoice: **📄 Invoices > ✨ Generate Invoice**
2. The PDF is saved in your Drive folder
3. Copy the PDF link from the "PDFUrl" column
4. Send it to your client via email (manually)

### Automatic Email (Optional)

Want invoices sent automatically?

1. Go to the "Settings" sheet
2. Change `AUTO_SEND_EMAIL` to **true**
3. Now when you generate an invoice, it's automatically emailed to the client!

**Email includes:**
- PDF attachment
- Professional message
- Your company signature

---

## 🔢 Invoice Numbering

### Automatic Numbering (Recommended)

The system can auto-increment invoice numbers:

**In Settings:**
- `INVOICE_PREFIX`: INV2025-
- `LAST_INVOICE_NUMBER`: 0

**Result:**
- First invoice: INV2025-001
- Second invoice: INV2025-002
- And so on...

To use auto-numbering:
1. Leave the InvoiceID column **empty** when creating a new invoice
2. The system will assign the next number automatically

### Manual Numbering

Prefer to control numbers yourself?

Just type your own InvoiceID in each row:
- F001, F002, F003...
- 2025-JAN-001...
- CLIENT-PROJECT-01...

**Important:** Make sure each InvoiceID is unique!

---

## 🎯 Common Workflows

### Workflow 1: Single Invoice

```
1. Add row in "Invoices" sheet
2. Fill all fields
3. Set Status: Draft
4. Click: Generate Invoice
5. PDF appears in Drive
6. Status changes to: Generated
```

### Workflow 2: Batch Invoices

```
1. Add multiple rows (5, 10, 20...)
2. All with Status: Draft
3. Click: Generate All Invoices
4. All PDFs generated at once
5. All statuses change to: Generated
```

### Workflow 3: With Email

```
1. Enable AUTO_SEND_EMAIL in Settings
2. Add invoice row
3. Set Status: Draft
4. Click: Generate Invoice
5. PDF generated + Email sent automatically
6. Status changes to: Sent
```

---

## 🆘 Troubleshooting

### Problem: "No menu appears"

**Solution:**
- Refresh the page
- Wait 10 seconds for scripts to load
- Check: Extensions > Apps Script (scripts should be there)

### Problem: "Template not found"

**Solution:**
- Go to Settings sheet
- Check TEMPLATE_DOCS_ID is filled
- Open that document ID in Google Docs to verify it exists
- Re-run Setup Wizard if needed

### Problem: "Permission denied"

**Solution:**
- Click: 📄 Invoices > ⚙️ Test Permissions
- Grant all requested permissions
- If still failing, try in an Incognito window

### Problem: "Markers not replaced"

**Solution:**
- Open your template document
- Verify markers are exactly: `{{TEXT}}`
- No spaces: `{{CLIENT_NAME}}` ✅ | `{{ CLIENT_NAME }}` ❌
- Correct case: `{{CLIENT_NAME}}` ✅ | `{{client_name}}` ❌

### Problem: "Formula not working"

**Solution:**
- In TotalAmount column (J), use: `=H2*I2`
- Drag the formula down for all rows
- Or use: `=ARRAYFORMULA(H2:H*I2:I)`

---

## 💡 Pro Tips

### Tip 1: Data Validation

Add dropdown lists for Status:

1. Select column K (Status)
2. Data > Data validation
3. List of items: Draft, Generated, Sent
4. Save

Now you can select status from a dropdown!

### Tip 2: Conditional Formatting

Color-code invoices by status:

1. Select the Status column
2. Format > Conditional formatting
3. Rules:
   - If "Draft" → Orange background
   - If "Generated" → Light green background
   - If "Sent" → Dark green background

### Tip 3: Dashboard Sheet

Create a summary dashboard:

```
Total Invoices: =COUNTA(Invoices!A2:A)
Total Revenue: =SUM(Invoices!J2:J)
Pending: =COUNTIF(Invoices!K2:K,"Draft")
Sent: =COUNTIF(Invoices!K2:K,"Sent")
```

### Tip 4: Backup

Make regular backups:

1. File > Make a copy
2. Name it: Invoice_Backup_2025-12-15
3. Store in a safe folder

---

## 🎓 Next Steps

### Level 1: Basic User
- ✅ Create invoices
- ✅ Generate PDFs
- ✅ Send to clients

### Level 2: Power User
- ⬜ Customize template design
- ⬜ Add your logo
- ⬜ Enable auto-email
- ⬜ Use auto-numbering

### Level 3: Expert
- ⬜ Create multiple templates
- ⬜ Build a dashboard
- ⬜ Automate with triggers
- ⬜ Integrate with accounting

---

## 📞 Need Help?

### Resources

- **Full User Guide:** See `USER_GUIDE_EN.pdf`
- **FAQ:** See `FAQ_EN.pdf`
- **Troubleshooting:** See `TROUBLESHOOTING_EN.pdf`
- **Email Support:** support@invoiceflash.com

### Common Questions

**Q: Can I use this for multiple clients?**
A: Yes! One row = one client = one invoice.

**Q: Can I customize the template?**
A: Absolutely! Change everything except the {{MARKERS}}.

**Q: Is there a limit to invoices?**
A: No! Google Sheets supports 10 million cells.

**Q: Can I use my own invoice numbers?**
A: Yes, just type them manually in InvoiceID column.

**Q: Does it work on mobile?**
A: Yes, but desktop is recommended for setup.

---

## 🎉 You're Ready!

**Congratulations!** You now know how to:

✅ Set up the system in 5 minutes
✅ Create your first invoice
✅ Generate professional PDFs
✅ Customize your template
✅ Send invoices to clients

**Your invoice system is ready to use.**

Now go create your first real invoice! 💰

---

**InvoiceFlash** - One-Click Invoice Generator
Version 1.1 | © 2025 | Made by Nelly Tchiengue

*Need the French version? See `QUICK_START_GUIDE_FR.md`*
