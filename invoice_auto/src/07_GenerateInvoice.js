/**
 * @file 07_GenerateInvoice.js
 * @description Modern HTML interface for generating invoices (single or all drafts)
 *              Interface HTML moderne pour la generation de factures
 * @version 1.0
 * @date 2025-12-14
 */

// ============================================================================
// MENU FUNCTION - GENERATE INVOICES
// ============================================================================

/**
 * Opens the modern Generate Invoice dialog
 * Ouvre la fenetre moderne de generation de factures
 */
function menuGenerateInvoices() {
  const html = HtmlService.createHtmlOutput(getGenerateInvoiceFormHtml())
    .setWidth(560)
    .setHeight(650);
  const title = getConfiguredLocale() === 'FR' ? 'Generer des factures' : 'Generate Invoices';
  SpreadsheetApp.getUi().showModalDialog(html, title);
}

// ============================================================================
// GET DRAFT INVOICES FOR DROPDOWN
// ============================================================================

/**
 * Retrieves all draft invoices for the dropdown
 * @returns {Array} Array of draft invoices with id, clientName, totalAmount
 */
function getDraftInvoicesForUI() {
  try {
    const drafts = getPendingInvoices();
    return drafts.map(inv => ({
      id: inv.invoiceId,
      clientName: inv.clientName,
      description: inv.description,
      totalAmount: inv.totalAmount,
      date: formatDate(inv.date)
    }));
  } catch (error) {
    logError('getDraftInvoicesForUI', 'Error getting drafts', error);
    return [];
  }
}

// ============================================================================
// PROCESS GENERATION FROM UI
// ============================================================================

/**
 * Processes the generation request from the UI
 * @param {Object} data - {mode: 'single'|'all', invoiceId: string}
 * @returns {Object} Result object
 */
function processGenerateInvoice(data) {
  try {
    var result;
    if (data.mode === 'all') {
      result = generateAllPendingInvoices();
      // Force UI refresh to remove spinner
      SpreadsheetApp.flush();
      return {
        success: result.success,
        mode: 'all',
        totalProcessed: result.totalProcessed,
        successful: result.successful,
        failed: result.failed,
        message: result.message,
        details: result.details || []
      };
    } else if (data.mode === 'single' && data.invoiceId) {
      result = generateInvoiceById(data.invoiceId);
      // Force UI refresh to remove spinner
      SpreadsheetApp.flush();
      return {
        success: result.success,
        mode: 'single',
        invoiceId: data.invoiceId,
        message: result.message,
        url: result.url,
        docUrl: result.docUrl,
        pdfUrl: result.pdfUrl
      };
    } else {
      SpreadsheetApp.flush();
      return {
        success: false,
        message: 'Invalid request'
      };
    }
  } catch (error) {
    logError('processGenerateInvoice', 'Error processing generation', error);
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

function getGenerateInvoiceFormHtml() {
  const lang = getConfiguredLocale();
  const drafts = getDraftInvoicesForUI();
  const hasDrafts = drafts.length > 0;
  const currencySymbol = getCurrencySymbol();

  // Bilingual labels
  const L = lang === 'FR' ? {
    title: 'Generer des factures',
    subtitle: 'Creez vos documents Google Docs + PDF',
    noDrafts: 'Aucune facture en brouillon',
    noDraftsHint: 'Toutes vos factures ont deja ete generees.',
    modeSection: 'Mode de generation',
    modeSingle: 'Une facture specifique',
    modeSingleDesc: 'Generer une seule facture selectionnee',
    modeAll: 'Toutes les factures en brouillon',
    modeAllDesc: 'Generer toutes les factures Draft en une seule fois',
    selectInvoice: 'Selectionner une facture',
    selectPlaceholder: 'Choisir une facture...',
    invoiceInfo: 'Details de la facture',
    client: 'Client',
    description: 'Description',
    amount: 'Montant',
    date: 'Date',
    draftCount: 'facture(s) en brouillon',
    btnGenerate: 'Generer',
    btnCancel: 'Annuler',
    processing: 'Generation en cours...',
    successSingle: 'Facture generee avec succes!',
    successAll: 'Generation terminee!',
    error: 'Erreur',
    viewPdf: 'Voir le PDF',
    viewDoc: 'Voir le Doc',
    generated: 'generee(s)',
    failed: 'echouee(s)',
    currency: currencySymbol
  } : {
    title: 'Generate Invoices',
    subtitle: 'Create your Google Docs + PDF documents',
    noDrafts: 'No draft invoices',
    noDraftsHint: 'All your invoices have already been generated.',
    modeSection: 'Generation mode',
    modeSingle: 'A specific invoice',
    modeSingleDesc: 'Generate a single selected invoice',
    modeAll: 'All draft invoices',
    modeAllDesc: 'Generate all Draft invoices at once',
    selectInvoice: 'Select an invoice',
    selectPlaceholder: 'Choose an invoice...',
    invoiceInfo: 'Invoice details',
    client: 'Client',
    description: 'Description',
    amount: 'Amount',
    date: 'Date',
    draftCount: 'draft invoice(s)',
    btnGenerate: 'Generate',
    btnCancel: 'Cancel',
    processing: 'Generating...',
    successSingle: 'Invoice generated successfully!',
    successAll: 'Generation completed!',
    error: 'Error',
    viewPdf: 'View PDF',
    viewDoc: 'View Doc',
    generated: 'generated',
    failed: 'failed',
    currency: currencySymbol
  };

  // Generate invoice options
  const invoiceOptions = drafts.map(inv =>
    '<option value="' + escapeHtml(inv.id) + '" data-client="' + escapeHtml(inv.clientName) + '" data-desc="' + escapeHtml(inv.description) + '" data-amount="' + inv.totalAmount + '" data-date="' + escapeHtml(inv.date) + '">' + escapeHtml(inv.id) + ' - ' + escapeHtml(inv.clientName) + ' (' + L.currency + ' ' + inv.totalAmount.toFixed(2) + ')</option>'
  ).join('');

  // Build HTML
  var html = '<!DOCTYPE html><html><head><base target="_top">';
  html += '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">';
  html += '<style>';
  html += ':root{--primary:#059669;--primary-dark:#047857;--primary-light:#d1fae5;--secondary:#8b5cf6;--secondary-light:#f5f3ff;--success:#10b981;--success-light:#d1fae5;--error:#ef4444;--error-light:#fee2e2;--warning:#f59e0b;--warning-light:#fef3c7;--gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-300:#d1d5db;--gray-400:#9ca3af;--gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;--gray-800:#1f2937;--gray-900:#111827;--radius:12px}';
  html += '*{box-sizing:border-box;margin:0;padding:0}';
  html += 'body{font-family:"DM Sans",-apple-system,sans-serif;background:linear-gradient(180deg,var(--gray-50),#fff);color:var(--gray-800);padding:24px;overflow-x:hidden}';
  html += '.header{text-align:center;margin-bottom:24px}';
  html += '.header-icon{width:52px;height:52px;background:var(--primary-light);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;animation:float 3s ease-in-out infinite}';
  html += '@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}';
  html += '.header-icon svg{width:26px;height:26px;color:var(--primary)}';
  html += '.header h1{font-size:20px;font-weight:700;color:var(--gray-900);margin-bottom:4px}';
  html += '.header p{font-size:13px;color:var(--gray-500)}';
  html += '.section{margin-bottom:20px}';
  html += '.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:12px;display:flex;align-items:center;gap:8px}';
  html += '.section-title::after{content:"";flex:1;height:1px;background:var(--gray-200)}';
  html += '.mode-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}';
  html += '.mode-card{padding:16px;border:2px solid var(--gray-200);border-radius:var(--radius);cursor:pointer;transition:all .2s;background:#fff}';
  html += '.mode-card:hover{border-color:var(--gray-300);background:var(--gray-50)}';
  html += '.mode-card.active{border-color:var(--primary);background:var(--primary-light)}';
  html += '.mode-card.disabled{opacity:.5;cursor:not-allowed;pointer-events:none}';
  html += '.mode-card-icon{width:40px;height:40px;background:var(--gray-100);border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}';
  html += '.mode-card.active .mode-card-icon{background:var(--primary);color:#fff}';
  html += '.mode-card svg{width:20px;height:20px;color:var(--gray-500)}';
  html += '.mode-card.active svg{color:#fff}';
  html += '.mode-card h3{font-size:14px;font-weight:600;color:var(--gray-800);margin-bottom:4px}';
  html += '.mode-card.active h3{color:var(--primary-dark)}';
  html += '.mode-card p{font-size:12px;color:var(--gray-500)}';
  html += '.mode-card .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:var(--warning-light);color:var(--warning);border-radius:6px;font-size:11px;font-weight:600;margin-top:8px}';
  html += '.form-group{margin-bottom:14px}';
  html += 'label{display:block;font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:6px}';
  html += '.select-wrapper{position:relative}';
  html += 'select{width:100%;padding:12px 40px 12px 14px;font-size:14px;font-family:inherit;border:2px solid var(--gray-200);border-radius:var(--radius);background:#fff;cursor:pointer;appearance:none;transition:all .2s}';
  html += 'select:hover{border-color:var(--gray-300)}';
  html += 'select:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}';
  html += 'select:disabled{background:var(--gray-100);color:var(--gray-400);cursor:not-allowed}';
  html += '.select-arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-400)}';
  html += '.info-card{background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:14px;margin-top:10px;display:none;animation:slideDown .25s ease}';
  html += '@keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}';
  html += '.info-card.visible{display:block}';
  html += '.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}';
  html += '.info-item{display:flex;flex-direction:column;gap:2px}';
  html += '.info-item.full{grid-column:1/-1}';
  html += '.info-label{font-size:11px;font-weight:600;color:var(--gray-400);text-transform:uppercase}';
  html += '.info-value{font-size:13px;color:var(--gray-700)}';
  html += '.info-value.highlight{font-size:16px;font-weight:700;color:var(--primary-dark)}';
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
  html += '@keyframes spin{to{transform:rotate(360deg)}}';
  html += '.result-links{display:flex;gap:8px;margin-top:10px}';
  html += '.result-link{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:#fff;border:1px solid var(--gray-200);border-radius:8px;font-size:12px;font-weight:600;color:var(--gray-700);text-decoration:none;transition:all .2s}';
  html += '.result-link:hover{background:var(--gray-50);border-color:var(--gray-300)}';
  html += '.result-link svg{width:14px;height:14px}';
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
  html += '<div class="header"><div class="header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg></div>';
  html += '<h1>' + L.title + '</h1><p>' + L.subtitle + '</p></div>';

  if (!hasDrafts) {
    // Empty state
    html += '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>';
    html += '<h3>' + L.noDrafts + '</h3><p>' + L.noDraftsHint + '</p></div>';
    html += '<div class="buttons"><button type="button" class="btn-secondary" onclick="google.script.host.close()">' + L.btnCancel + '</button></div>';
    html += '</body></html>';
    return html;
  }

  // Form
  html += '<form id="generateForm">';

  // Mode Selection
  html += '<div class="section"><div class="section-title">' + L.modeSection + '</div>';
  html += '<div class="mode-cards">';

  // Single invoice card
  html += '<div class="mode-card active" id="modeSingle" data-mode="single">';
  html += '<div class="mode-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>';
  html += '<h3>' + L.modeSingle + '</h3><p>' + L.modeSingleDesc + '</p></div>';

  // All invoices card
  html += '<div class="mode-card" id="modeAll" data-mode="all">';
  html += '<div class="mode-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>';
  html += '<h3>' + L.modeAll + '</h3><p>' + L.modeAllDesc + '</p>';
  html += '<div class="badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>' + drafts.length + ' ' + L.draftCount + '</div></div>';

  html += '</div></div>';

  // Invoice Selection (for single mode)
  html += '<div class="section" id="invoiceSelectSection">';
  html += '<div class="section-title">' + L.selectInvoice + '</div>';
  html += '<div class="form-group"><div class="select-wrapper">';
  html += '<select id="invoiceSelect"><option value="">' + L.selectPlaceholder + '</option>' + invoiceOptions + '</select>';
  html += '<div class="select-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div></div>';

  // Invoice Info Card
  html += '<div class="info-card" id="invoiceInfo">';
  html += '<div class="info-grid">';
  html += '<div class="info-item"><span class="info-label">' + L.client + '</span><span class="info-value" id="infoClient">-</span></div>';
  html += '<div class="info-item"><span class="info-label">' + L.date + '</span><span class="info-value" id="infoDate">-</span></div>';
  html += '<div class="info-item full"><span class="info-label">' + L.description + '</span><span class="info-value" id="infoDesc">-</span></div>';
  html += '<div class="info-item"><span class="info-label">' + L.amount + '</span><span class="info-value highlight" id="infoAmount">-</span></div>';
  html += '</div></div>';
  html += '</div></div>';

  // Status & Buttons
  html += '<div class="status" id="status"><div class="spinner"></div><span id="statusText"></span></div>';
  html += '<div id="resultLinks" class="result-links" style="display:none"></div>';
  html += '<div class="buttons"><button type="button" class="btn-secondary" onclick="google.script.host.close()">' + L.btnCancel + '</button>';
  html += '<button type="submit" class="btn-primary" id="btnSubmit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>' + L.btnGenerate + '</button></div>';
  html += '</form>';

  // JavaScript
  html += '<script>';
  html += 'var L={processing:"' + L.processing + '",successSingle:"' + L.successSingle + '",successAll:"' + L.successAll + '",error:"' + L.error + '",viewPdf:"' + L.viewPdf + '",viewDoc:"' + L.viewDoc + '",generated:"' + L.generated + '",failed:"' + L.failed + '",currency:"' + L.currency + '"};';
  html += 'var currentMode="single";';
  html += 'var modeSingle=document.getElementById("modeSingle");var modeAll=document.getElementById("modeAll");';
  html += 'var invoiceSelectSection=document.getElementById("invoiceSelectSection");var invoiceSelect=document.getElementById("invoiceSelect");';
  html += 'var invoiceInfo=document.getElementById("invoiceInfo");';

  // Mode switching
  html += 'function setMode(mode){currentMode=mode;modeSingle.classList.toggle("active",mode==="single");modeAll.classList.toggle("active",mode==="all");invoiceSelectSection.style.display=mode==="single"?"block":"none";if(mode==="all"){invoiceSelect.value="";invoiceInfo.classList.remove("visible");}}';
  html += 'modeSingle.addEventListener("click",function(){setMode("single");});';
  html += 'modeAll.addEventListener("click",function(){setMode("all");});';

  // Invoice selection change
  html += 'invoiceSelect.addEventListener("change",function(){var s=this.options[this.selectedIndex];if(this.value){document.getElementById("infoClient").textContent=s.dataset.client||"-";document.getElementById("infoDate").textContent=s.dataset.date||"-";document.getElementById("infoDesc").textContent=s.dataset.desc||"-";document.getElementById("infoAmount").textContent=L.currency+" "+parseFloat(s.dataset.amount||0).toFixed(2);invoiceInfo.classList.add("visible");}else{invoiceInfo.classList.remove("visible");}});';

  // Form submission
  html += 'document.getElementById("generateForm").addEventListener("submit",function(e){e.preventDefault();';
  html += 'var btn=document.getElementById("btnSubmit");var status=document.getElementById("status");var resultLinks=document.getElementById("resultLinks");';
  html += 'if(currentMode==="single"&&!invoiceSelect.value){alert("Please select an invoice");return;}';
  html += 'btn.disabled=true;status.className="status loading";status.innerHTML=\'<div class="spinner"></div><span>\'+L.processing+\'</span>\';resultLinks.style.display="none";';
  html += 'var data={mode:currentMode,invoiceId:currentMode==="single"?invoiceSelect.value:null};';
  html += 'google.script.run.withSuccessHandler(function(r){';
  html += 'if(r.success){';
  html += 'if(r.mode==="single"){';
  html += 'status.className="status success";status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>\'+L.successSingle+\'</span>\';';
  html += 'if(r.pdfUrl||r.docUrl){var links="";if(r.pdfUrl){links+=\'<a href="\'+r.pdfUrl+\'" target="_blank" class="result-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>\'+L.viewPdf+\'</a>\';}if(r.docUrl){links+=\'<a href="\'+r.docUrl+\'" target="_blank" class="result-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>\'+L.viewDoc+\'</a>\';}resultLinks.innerHTML=links;resultLinks.style.display="flex";}';
  html += '}else{';
  html += 'var msg=L.successAll+" "+r.successful+" "+L.generated;if(r.failed>0){msg+=", "+r.failed+" "+L.failed;}';
  html += 'status.className="status success";status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>\'+msg+\'</span>\';';
  html += '}';
  html += 'setTimeout(function(){google.script.host.close();},3000);';
  html += '}else{status.className="status error";status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>\'+L.error+\': \'+r.message+\'</span>\';btn.disabled=false;}';
  html += '}).withFailureHandler(function(err){status.className="status error";status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>\'+L.error+\'</span>\';btn.disabled=false;}).processGenerateInvoice(data);});';

  html += '</script></body></html>';
  return html;
}
