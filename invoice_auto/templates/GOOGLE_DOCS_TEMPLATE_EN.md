# Google Docs Invoice Template - English (Modern Style)

**How to use this template:**
1. Create a new Google Docs document
2. Copy everything below the line
3. Paste it into your Google Doc
4. Format it (see formatting instructions at the end)
5. Get the document ID from the URL
6. Put the ID in your Settings sheet

---

**COPY FROM HERE ↓**

```
═══════════════════════════════════════════════════════════════════════

                        {{COMPANY_NAME}}
                    {{COMPANY_ADDRESS}}
            Phone: {{COMPANY_PHONE}} | Email: {{COMPANY_EMAIL}}

═══════════════════════════════════════════════════════════════════════


                            INVOICE #{{INVOICE_ID}}

                            Date: {{INVOICE_DATE}}


───────────────────────────────────────────────────────────────────────

BILL TO

{{CLIENT_NAME}}
{{CLIENT_ADDRESS}}
Phone: {{CLIENT_PHONE}}
Email: {{CLIENT_EMAIL}}

───────────────────────────────────────────────────────────────────────

INVOICE DETAILS


Description:                    {{DESCRIPTION}}

Quantity:                       {{QUANTITY}}

Unit Price:                     {{UNIT_PRICE}}


─────────────────────────────────────────────────────────────────────

TOTAL DUE:                      {{TOTAL_AMOUNT}}

─────────────────────────────────────────────────────────────────────


Amount in words:
{{AMOUNT_IN_WORDS}}


═══════════════════════════════════════════════════════════════════════

Thank you for your business!

Payment Terms: Due upon receipt
Payment Methods: Bank transfer, Credit card, PayPal, Cash

Questions? Contact us at {{COMPANY_EMAIL}} or {{COMPANY_PHONE}}

═══════════════════════════════════════════════════════════════════════


                            [Company Seal/Signature]
```

---

## Formatting Instructions

### Step 1: Select All Text
Press Ctrl+A (Windows) or Cmd+A (Mac)

### Step 2: Set Default Font
- Font: Arial
- Size: 11pt
- Color: Black

### Step 3: Format Header (Company Info)
1. Select the company block (top 4 lines)
2. Font Size: 12pt
3. Alignment: Center
4. Color: Dark Gray (#333333)
5. Optional: Add light blue background (#E8F0FE)

### Step 4: Format Invoice Title
1. Select "INVOICE #{{INVOICE_ID}}"
2. Font Size: 20pt
3. Bold: Yes
4. Alignment: Center
5. Color: Dark Blue (#1A73E8)

### Step 5: Format Date
1. Select "Date: {{INVOICE_DATE}}"
2. Font Size: 12pt
3. Alignment: Center

### Step 6: Format Section Headers
1. Select "BILL TO", "INVOICE DETAILS"
2. Font Size: 12pt
3. Bold: Yes
4. Color: Dark Gray (#666666)

### Step 7: Format Total
1. Select "TOTAL DUE: {{TOTAL_AMOUNT}}"
2. Font Size: 16pt
3. Bold: Yes
4. Color: Red (#D93025) or keep black
5. Alignment: Right or Center

### Step 8: Format Footer
1. Select footer text (Thank you... Questions?)
2. Font Size: 9pt
3. Color: Gray (#666666)
4. Alignment: Center

### Step 9: Add Logo (Optional)
1. Click before {{COMPANY_NAME}}
2. Insert > Image > Upload from computer
3. Resize logo to 100-150px width
4. Center it

### Step 10: Adjust Spacing
- Line spacing: 1.15 or 1.5
- Add extra space before and after section headers
- Make sure the invoice fits on 1 page

---

## Pro Tips

### Color Schemes

**Professional Blue:**
- Header background: #E8F0FE (light blue)
- Title: #1A73E8 (Google blue)
- Text: #333333 (dark gray)

**Modern Green:**
- Header background: #E6F4EA (light green)
- Title: #137333 (green)
- Text: #333333

**Classic Black:**
- Everything in black and white
- Use bold for emphasis
- Very professional

### Layout Variations

**Centered Layout:**
- Everything centered
- Clean and modern
- Good for digital invoices

**Left-Aligned Layout:**
- Company info left-aligned
- More traditional
- Good for printing

**Two-Column Layout:**
- Company on left, Client on right
- More compact
- Professional look

---

## Common Mistakes to Avoid

❌ **Don't change the markers**
- Keep {{COMPANY_NAME}} exactly as is
- No spaces: {{CLIENT_NAME}} not {{ CLIENT_NAME }}

❌ **Don't remove markers**
- All {{MARKERS}} must stay in the document
- They will be replaced automatically

❌ **Don't use too many fonts**
- Stick to 1-2 fonts maximum
- Arial or Helvetica recommended

✅ **Do keep it simple**
- Clean layout
- Easy to read
- Professional appearance

---

## Testing Your Template

Before using it for real invoices:

1. Create a test invoice in your spreadsheet
2. Run "Generate Invoice"
3. Check the generated PDF
4. Verify all markers were replaced
5. Check formatting looks good
6. Test printing

If markers aren't replaced:
- Check spelling: {{CLIENT_NAME}} not {{client_name}}
- Check spaces: no spaces inside {{}}
- Re-copy the template

---

**Template ready to use!**

Once formatted, get the document ID from the URL:
`https://docs.google.com/document/d/YOUR_ID_HERE/edit`

Put YOUR_ID_HERE in the Settings sheet under TEMPLATE_DOCS_ID.

Done! ✅
