/**
 * @file 08_SendEmail.js
 * @description Modern HTML interface for sending invoice emails with preview
 *              Interface HTML moderne pour l'envoi d'emails avec previsualisation
 * @version 1.0
 * @date 2025-12-14
 */

// ============================================================================
// MENU FUNCTION - SEND EMAIL
// ============================================================================

/**
 * Opens the modern Send Email dialog
 * Ouvre la fenetre moderne d'envoi d'email
 */
function menuSendEmail() {
  const ui = SpreadsheetApp.getUi();

  try {
    const htmlContent = getSendEmailFormHtml();
    const html = HtmlService.createHtmlOutput(htmlContent)
      .setWidth(450)
      .setHeight(620);

    ui.showModalDialog(html, getConfiguredLocale() === 'FR' ? 'Envoyer par email' : 'Send by Email');
  } catch (error) {
    logError('menuSendEmail', 'Failed to open dialog', error);
    ui.alert('Error: ' + error.message);
  }
}

// ============================================================================
// GET GENERATED INVOICES FOR DROPDOWN
// ============================================================================

/**
 * Retrieves all generated invoices (not yet sent) for the dropdown
 * @returns {Array} Array of generated invoices
 */
function getGeneratedInvoicesForUI() {
  try {
    const invoices = getInvoicesByStatus(INVOICE_CONFIG.STATUSES.GENERATED);
    return invoices.map(inv => ({
      id: inv.invoiceId,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail,
      description: inv.description,
      totalAmount: inv.totalAmount,
      quantity: inv.quantity,
      unitPrice: inv.unitPrice,
      date: formatDate(inv.date),
      pdfUrl: inv.pdfUrl
    }));
  } catch (error) {
    logError('getGeneratedInvoicesForUI', 'Error getting generated invoices', error);
    return [];
  }
}

/**
 * Generates email preview data for a specific invoice
 * @param {string} invoiceId - The invoice ID
 * @returns {Object} Email preview data
 */
function getEmailPreview(invoiceId) {
  try {
    const invoiceData = getInvoiceDataById(invoiceId);
    if (!invoiceData) {
      return { success: false, message: 'Invoice not found' };
    }

    const companyParams = getCompanyParams();
    const lang = getConfiguredLocale();
    const template = EMAIL_TEMPLATES[lang] || EMAIL_TEMPLATES.EN;

    const emailData = {
      clientName: invoiceData.clientName,
      invoiceId: invoiceData.invoiceId,
      totalAmountFormatted: formatAmount(invoiceData.totalAmount),
      dateFormatted: formatDate(invoiceData.date),
      description: invoiceData.description,
      quantity: invoiceData.quantity,
      unitPriceFormatted: formatAmount(invoiceData.unitPrice),
      companyName: companyParams.name,
      companyPhone: companyParams.phone,
      companyEmail: companyParams.email
    };

    const subject = template.subject(invoiceData.invoiceId, companyParams.name);
    const body = template.body(emailData);

    return {
      success: true,
      subject: subject,
      body: body,
      recipientEmail: invoiceData.clientEmail,
      recipientName: invoiceData.clientName,
      invoiceId: invoiceData.invoiceId,
      pdfUrl: invoiceData.pdfUrl
    };
  } catch (error) {
    logError('getEmailPreview', 'Error generating preview', error);
    return { success: false, message: error.message };
  }
}

// ============================================================================
// PROCESS EMAIL SENDING FROM UI
// ============================================================================

/**
 * Sends email with custom subject and body
 * @param {Object} data - {invoiceId, recipientEmail, subject, body}
 * @returns {Object} Result object
 */
function processSendEmail(data) {
  try {
    const invoiceData = getInvoiceDataById(data.invoiceId);

    if (!invoiceData) {
      SpreadsheetApp.flush();
      return { success: false, message: 'Invoice not found' };
    }

    if (!invoiceData.pdfUrl) {
      SpreadsheetApp.flush();
      return { success: false, message: 'PDF not found for this invoice' };
    }

    // Validate email
    if (!validateEmail(data.recipientEmail)) {
      SpreadsheetApp.flush();
      return { success: false, message: 'Invalid email address' };
    }

    // Get PDF file
    const pdfFile = getPdfFileFromUrl(invoiceData.pdfUrl);
    if (!pdfFile) {
      SpreadsheetApp.flush();
      return { success: false, message: 'Could not retrieve PDF file' };
    }

    const companyParams = getCompanyParams();
    const senderEmail = getParam(INVOICE_CONFIG.PARAM_KEYS.SENDER_EMAIL);

    // Send email with custom subject and body
    GmailApp.sendEmail(
      data.recipientEmail,
      data.subject,
      data.body,
      {
        attachments: [pdfFile.getBlob()],
        name: companyParams.name,
        cc: senderEmail
      }
    );

    // Mark invoice as sent
    markInvoiceAsSent(data.invoiceId);

    logSuccess('processSendEmail', 'Email sent to ' + data.recipientEmail + ' for invoice ' + data.invoiceId);

    SpreadsheetApp.flush();
    return {
      success: true,
      message: 'Email sent successfully',
      recipientEmail: data.recipientEmail
    };

  } catch (error) {
    logError('processSendEmail', 'Error sending email', error);
    SpreadsheetApp.flush();
    return {
      success: false,
      message: error.message
    };
  }
}

// ============================================================================
// HTML FORM GENERATION
// ============================================================================

function getSendEmailFormHtml() {
  const lang = getConfiguredLocale();
  const invoices = getGeneratedInvoicesForUI();
  const hasInvoices = invoices.length > 0;
  const currencySymbol = getCurrencySymbol();

  // Bilingual labels
  const L = lang === 'FR' ? {
    title: 'Envoyer par email',
    subtitle: 'Envoyez la facture directement au client',
    noInvoices: 'Aucune facture a envoyer',
    noInvoicesHint: 'Generez d\'abord des factures pour pouvoir les envoyer.',
    selectSection: 'Selectionner une facture',
    selectPlaceholder: 'Choisir une facture...',
    invoiceInfo: 'Details',
    client: 'Client',
    email: 'Email',
    amount: 'Montant',
    previewSection: 'Apercu de l\'email',
    recipient: 'Destinataire',
    subject: 'Objet',
    body: 'Message',
    editHint: 'Vous pouvez modifier le texte avant envoi',
    btnSend: 'Envoyer l\'email',
    btnCancel: 'Annuler',
    processing: 'Envoi en cours...',
    success: 'Email envoye avec succes!',
    error: 'Erreur',
    sentTo: 'Envoye a',
    currency: currencySymbol,
    selectFirst: 'Selectionnez une facture pour voir l\'apercu'
  } : {
    title: 'Send by Email',
    subtitle: 'Send the invoice directly to the client',
    noInvoices: 'No invoices to send',
    noInvoicesHint: 'Generate invoices first to be able to send them.',
    selectSection: 'Select an invoice',
    selectPlaceholder: 'Choose an invoice...',
    invoiceInfo: 'Details',
    client: 'Client',
    email: 'Email',
    amount: 'Amount',
    previewSection: 'Email preview',
    recipient: 'Recipient',
    subject: 'Subject',
    body: 'Message',
    editHint: 'You can edit the text before sending',
    btnSend: 'Send Email',
    btnCancel: 'Cancel',
    processing: 'Sending...',
    success: 'Email sent successfully!',
    error: 'Error',
    sentTo: 'Sent to',
    currency: currencySymbol,
    selectFirst: 'Select an invoice to see the preview'
  };

  // Generate invoice options
  const invoiceOptions = invoices.map(inv =>
    '<option value="' + escapeHtml(inv.id) + '" ' +
    'data-client="' + escapeHtml(inv.clientName) + '" ' +
    'data-email="' + escapeHtml(inv.clientEmail) + '" ' +
    'data-amount="' + inv.totalAmount + '" ' +
    'data-date="' + escapeHtml(inv.date) + '">' +
    escapeHtml(inv.id) + ' - ' + escapeHtml(inv.clientName) + ' (' + L.currency + ' ' + inv.totalAmount.toFixed(2) + ')' +
    '</option>'
  ).join('');

  // Build HTML
  var html = '<!DOCTYPE html><html><head><base target="_top">';
  html += '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">';
  html += '<style>';
  html += ':root{--primary:#8b5cf6;--primary-dark:#7c3aed;--primary-light:#f5f3ff;--secondary:#059669;--secondary-light:#d1fae5;--success:#10b981;--success-light:#d1fae5;--error:#ef4444;--error-light:#fee2e2;--warning:#f59e0b;--warning-light:#fef3c7;--gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-300:#d1d5db;--gray-400:#9ca3af;--gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;--gray-800:#1f2937;--gray-900:#111827;--radius:12px}';
  html += '*{box-sizing:border-box;margin:0;padding:0}';
  html += 'body{font-family:"DM Sans",-apple-system,sans-serif;background:linear-gradient(180deg,var(--gray-50),#fff);color:var(--gray-800);padding:16px;overflow-x:hidden;min-height:100vh}';
  html += '.header{text-align:center;margin-bottom:24px}';
  html += '.header-icon{width:52px;height:52px;background:var(--primary-light);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;animation:float 3s ease-in-out infinite}';
  html += '@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}';
  html += '.header-icon svg{width:26px;height:26px;color:var(--primary)}';
  html += '.header h1{font-size:20px;font-weight:700;color:var(--gray-900);margin-bottom:4px}';
  html += '.header p{font-size:13px;color:var(--gray-500)}';
  html += '.section{margin-bottom:20px}';
  html += '.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:12px;display:flex;align-items:center;gap:8px}';
  html += '.section-title::after{content:"";flex:1;height:1px;background:var(--gray-200)}';
  html += '.form-group{margin-bottom:14px}';
  html += 'label{display:block;font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:6px}';
  html += '.select-wrapper{position:relative}';
  html += 'select{width:100%;padding:12px 40px 12px 14px;font-size:14px;font-family:inherit;border:2px solid var(--gray-200);border-radius:var(--radius);background:#fff;cursor:pointer;appearance:none;transition:all .2s}';
  html += 'select:hover{border-color:var(--gray-300)}';
  html += 'select:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}';
  html += '.select-arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-400)}';
  html += '.info-card{background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:14px;margin-top:10px;display:none;animation:slideDown .25s ease}';
  html += '@keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}';
  html += '.info-card.visible{display:block}';
  html += '.info-grid{display:grid;grid-template-columns:1fr;gap:10px}';
  html += '.info-item{display:flex;flex-direction:column;gap:2px}';
  html += '.info-label{font-size:11px;font-weight:600;color:var(--gray-400);text-transform:uppercase}';
  html += '.info-value{font-size:13px;color:var(--gray-700)}';
  html += '.info-value.highlight{font-weight:700;color:var(--primary-dark)}';
  html += '.preview-section{display:none;animation:slideDown .25s ease}';
  html += '.preview-section.visible{display:block}';
  html += '.preview-placeholder{text-align:center;padding:30px 20px;background:var(--gray-50);border:2px dashed var(--gray-200);border-radius:var(--radius);color:var(--gray-400)}';
  html += '.preview-placeholder svg{width:32px;height:32px;margin-bottom:8px;opacity:.5}';
  html += 'input,textarea{width:100%;padding:12px 14px;font-size:14px;font-family:inherit;border:2px solid var(--gray-200);border-radius:var(--radius);background:#fff;transition:all .2s}';
  html += 'input:hover,textarea:hover{border-color:var(--gray-300)}';
  html += 'input:focus,textarea:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}';
  html += 'input::placeholder,textarea::placeholder{color:var(--gray-400)}';
  html += 'textarea{resize:vertical;min-height:180px;line-height:1.5}';
  html += '.edit-hint{font-size:11px;color:var(--gray-400);margin-top:6px;display:flex;align-items:center;gap:4px}';
  html += '.edit-hint svg{width:12px;height:12px}';
  html += '.recipient-badge{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;background:var(--primary-light);border:2px solid var(--primary);border-radius:var(--radius);margin-bottom:14px}';
  html += '.recipient-badge svg{width:18px;height:18px;color:var(--primary)}';
  html += '.recipient-badge .recipient-info{display:flex;flex-direction:column}';
  html += '.recipient-badge .recipient-name{font-size:14px;font-weight:600;color:var(--primary-dark)}';
  html += '.recipient-badge .recipient-email{font-size:12px;color:var(--primary)}';
  html += '.empty-state{text-align:center;padding:40px 20px;background:var(--gray-50);border-radius:var(--radius);color:var(--gray-500)}';
  html += '.empty-state svg{width:48px;height:48px;margin-bottom:12px;opacity:.4}';
  html += '.empty-state h3{font-size:16px;font-weight:600;color:var(--gray-700);margin-bottom:4px}';
  html += '.empty-state p{font-size:13px}';
  html += '.status{padding:14px;border-radius:var(--radius);font-size:13px;font-weight:500;display:none;align-items:center;gap:10px;margin-top:16px;animation:slideDown .25s ease}';
  html += '.status svg{width:18px;height:18px;flex-shrink:0}';
  html += '.status.loading{display:flex;background:var(--primary-light);color:var(--primary)}';
  html += '.status.success{display:flex;background:var(--success-light);color:var(--success)}';
  html += '.status.error{display:flex;background:var(--error-light);color:var(--error)}';
  html += '.spinner{width:18px;height:18px;border:2px solid var(--primary-light);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite}';
  html += '.preview-spinner{width:32px;height:32px;border:3px solid var(--gray-200);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}';
  html += '@keyframes spin{to{transform:rotate(360deg)}}';
  html += '.buttons{display:flex;gap:10px;margin-top:20px}';
  html += 'button{flex:1;padding:12px 20px;font-size:14px;font-weight:600;font-family:inherit;border-radius:var(--radius);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}';
  html += '.btn-secondary{background:#fff;border:2px solid var(--gray-200);color:var(--gray-600)}';
  html += '.btn-secondary:hover{background:var(--gray-50);border-color:var(--gray-300)}';
  html += '.btn-primary{background:var(--primary);border:2px solid var(--primary);color:#fff}';
  html += '.btn-primary:hover{background:var(--primary-dark);border-color:var(--primary-dark);transform:translateY(-1px)}';
  html += '.btn-primary:disabled{background:var(--gray-300);border-color:var(--gray-300);cursor:not-allowed;transform:none}';
  html += 'button svg{width:16px;height:16px}';
  html += '</style></head><body>';

  // Header
  html += '<div class="header"><div class="header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>';
  html += '<h1>' + L.title + '</h1><p>' + L.subtitle + '</p></div>';

  if (!hasInvoices) {
    // Empty state
    html += '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
    html += '<h3>' + L.noInvoices + '</h3><p>' + L.noInvoicesHint + '</p></div>';
    html += '<div class="buttons"><button type="button" class="btn-secondary" onclick="google.script.host.close()">' + L.btnCancel + '</button></div>';
    html += '</body></html>';
    return html;
  }

  // Form
  html += '<form id="emailForm">';

  // Invoice Selection
  html += '<div class="section"><div class="section-title">' + L.selectSection + '</div>';
  html += '<div class="form-group"><div class="select-wrapper">';
  html += '<select id="invoiceSelect"><option value="">' + L.selectPlaceholder + '</option>' + invoiceOptions + '</select>';
  html += '<div class="select-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div></div>';

  // Invoice Info Card
  html += '<div class="info-card" id="invoiceInfo">';
  html += '<div class="info-grid">';
  html += '<div class="info-item"><span class="info-label">' + L.client + '</span><span class="info-value" id="infoClient">-</span></div>';
  html += '<div class="info-item"><span class="info-label">' + L.email + '</span><span class="info-value" id="infoEmail">-</span></div>';
  html += '<div class="info-item"><span class="info-label">' + L.amount + '</span><span class="info-value highlight" id="infoAmount">-</span></div>';
  html += '</div></div>';
  html += '</div></div>';

  // Preview placeholder (shown before selection)
  html += '<div id="previewPlaceholder" class="preview-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
  html += '<p>' + L.selectFirst + '</p></div>';

  // Loading spinner for preview (shown while loading email preview)
  html += '<div id="previewLoading" class="preview-placeholder" style="display:none"><div class="preview-spinner"></div>';
  html += '<p>' + (lang === 'FR' ? 'Chargement de l\'apercu...' : 'Loading preview...') + '</p></div>';

  // Email Preview Section (hidden until invoice selected)
  html += '<div class="preview-section" id="previewSection">';
  html += '<div class="section"><div class="section-title">' + L.previewSection + '</div>';

  // Recipient badge
  html += '<div class="recipient-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  html += '<div class="recipient-info"><span class="recipient-name" id="recipientName">-</span><span class="recipient-email" id="recipientEmail">-</span></div></div>';

  // Subject
  html += '<div class="form-group"><label>' + L.subject + '</label>';
  html += '<input type="text" id="emailSubject" placeholder="' + L.subject + '"></div>';

  // Body
  html += '<div class="form-group"><label>' + L.body + '</label>';
  html += '<textarea id="emailBody" placeholder="' + L.body + '"></textarea>';
  html += '<div class="edit-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' + L.editHint + '</div></div>';

  html += '</div></div>';

  // Status & Buttons
  html += '<div class="status" id="status"><div class="spinner"></div><span id="statusText"></span></div>';
  html += '<div class="buttons"><button type="button" class="btn-secondary" onclick="google.script.host.close()">' + L.btnCancel + '</button>';
  html += '<button type="submit" class="btn-primary" id="btnSubmit" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' + L.btnSend + '</button></div>';
  html += '</form>';

  // JavaScript
  html += '<script>';
  html += 'var L={processing:"' + L.processing + '",success:"' + L.success + '",error:"' + L.error + '",sentTo:"' + L.sentTo + '",currency:"' + L.currency + '"};';
  html += 'var invoiceSelect=document.getElementById("invoiceSelect");';
  html += 'var invoiceInfo=document.getElementById("invoiceInfo");';
  html += 'var previewPlaceholder=document.getElementById("previewPlaceholder");';
  html += 'var previewLoading=document.getElementById("previewLoading");';
  html += 'var previewSection=document.getElementById("previewSection");';
  html += 'var emailSubject=document.getElementById("emailSubject");';
  html += 'var emailBody=document.getElementById("emailBody");';
  html += 'var recipientName=document.getElementById("recipientName");';
  html += 'var recipientEmail=document.getElementById("recipientEmail");';
  html += 'var btnSubmit=document.getElementById("btnSubmit");';
  html += 'var currentInvoiceId=null;';

  // Invoice selection change - load preview
  html += 'invoiceSelect.addEventListener("change",function(){';
  html += 'var s=this.options[this.selectedIndex];';
  html += 'if(this.value){';
  html += 'document.getElementById("infoClient").textContent=s.dataset.client||"-";';
  html += 'document.getElementById("infoEmail").textContent=s.dataset.email||"-";';
  html += 'document.getElementById("infoAmount").textContent=L.currency+" "+parseFloat(s.dataset.amount||0).toFixed(2);';
  html += 'invoiceInfo.classList.add("visible");';
  // Show loading spinner while fetching preview
  html += 'previewPlaceholder.style.display="none";';
  html += 'previewSection.classList.remove("visible");';
  html += 'previewLoading.style.display="block";';
  // Load email preview
  html += 'currentInvoiceId=this.value;';
  html += 'google.script.run.withSuccessHandler(function(r){';
  html += 'previewLoading.style.display="none";';
  html += 'if(r.success){';
  html += 'emailSubject.value=r.subject;';
  html += 'emailBody.value=r.body;';
  html += 'recipientName.textContent=r.recipientName;';
  html += 'recipientEmail.textContent=r.recipientEmail;';
  html += 'previewSection.classList.add("visible");';
  html += 'btnSubmit.disabled=false;';
  html += '}else{';
  html += 'previewPlaceholder.style.display="block";';
  html += '}';
  html += '}).withFailureHandler(function(err){';
  html += 'previewLoading.style.display="none";';
  html += 'previewPlaceholder.style.display="block";';
  html += '}).getEmailPreview(this.value);';
  html += '}else{';
  html += 'invoiceInfo.classList.remove("visible");';
  html += 'previewLoading.style.display="none";';
  html += 'previewPlaceholder.style.display="block";';
  html += 'previewSection.classList.remove("visible");';
  html += 'btnSubmit.disabled=true;';
  html += 'currentInvoiceId=null;';
  html += '}});';

  // Form submission
  html += 'document.getElementById("emailForm").addEventListener("submit",function(e){e.preventDefault();';
  html += 'if(!currentInvoiceId){return;}';
  html += 'var status=document.getElementById("status");';
  html += 'btnSubmit.disabled=true;';
  html += 'status.className="status loading";';
  html += 'status.innerHTML=\'<div class="spinner"></div><span>\'+L.processing+\'</span>\';';
  html += 'var data={invoiceId:currentInvoiceId,recipientEmail:recipientEmail.textContent,subject:emailSubject.value,body:emailBody.value};';
  html += 'google.script.run.withSuccessHandler(function(r){';
  html += 'if(r.success){';
  html += 'status.className="status success";';
  html += 'status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>\'+L.success+" "+L.sentTo+" "+r.recipientEmail+\'</span>\';';
  html += '}else{';
  html += 'status.className="status error";';
  html += 'status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>\'+L.error+": "+r.message+\'</span>\';';
  html += 'btnSubmit.disabled=false;';
  html += '}';
  html += '}).withFailureHandler(function(err){';
  html += 'status.className="status error";';
  html += 'status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>\'+L.error+\'</span>\';';
  html += 'btnSubmit.disabled=false;';
  html += '}).processSendEmail(data);});';

  html += '</script></body></html>';
  return html;
}
