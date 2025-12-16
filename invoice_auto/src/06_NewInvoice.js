/**
 * @file 06_NewInvoice.js
 * @description Ajout de nouvelles factures avec interface HTML moderne
 *              Supporte la creation de nouveaux clients ET la selection de services
 *              Multi-country support with legal ID fields (FR/CM/US)
 * @version 2.1 (Multi-Country Edition)
 * @date 2025-12-14
 */

// ============================================================================
// GESTION DES CLIENTS
// ============================================================================

function getAllClients() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const clientsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.CLIENTS);
    if (!clientsSheet) return [];

    const data = clientsSheet.getDataRange().getValues();
    const clients = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NAME]) {
        clients.push({
          id: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_ID] || '',
          name: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NAME] || '',
          email: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_EMAIL] || '',
          phone: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_PHONE] || '',
          address: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_ADDRESS] || '',
          // Country-specific legal IDs
          country: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_COUNTRY] || '',
          siret: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_SIRET] || '',
          vatNumber: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_VAT_NUMBER] || '',
          niu: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_NIU] || '',
          taxId: row[INVOICE_CONFIG.CLIENT_COLUMNS.CLIENT_TAX_ID] || ''
        });
      }
    }
    return clients;
  } catch (error) {
    logError('getAllClients', 'Erreur', error);
    return [];
  }
}

function getClientByName(clientName) {
  const clients = getAllClients();
  return clients.find(c => c.name === clientName) || null;
}

function generateNextClientId() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const clientsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.CLIENTS);
    if (!clientsSheet) return 'CLI-001';
    
    const data = clientsSheet.getDataRange().getValues();
    let maxNumber = 0;
    
    for (let i = 1; i < data.length; i++) {
      const match = String(data[i][0]).match(/CLI-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) maxNumber = num;
      }
    }
    return 'CLI-' + String(maxNumber + 1).padStart(3, '0');
  } catch (error) {
    return 'CLI-' + Date.now();
  }
}

function createNewClient(clientData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let clientsSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.CLIENTS);
    const country = getParam('COUNTRY') || 'FR';

    if (!clientsSheet) {
      clientsSheet = ss.insertSheet(INVOICE_CONFIG.SHEETS.CLIENTS);
      // Extended headers with legal IDs
      const headers = [
        'ClientID', 'ClientName', 'ClientEmail', 'ClientPhone', 'ClientAddress',
        'ClientCountry', 'ClientSIRET', 'ClientVATNumber', 'ClientNIU', 'ClientTaxID',
        'PaymentTerms', 'Notes', 'Active'
      ];
      clientsSheet.getRange(1, 1, 1, headers.length)
        .setValues([headers])
        .setFontWeight('bold')
        .setBackground('#c0392b')
        .setFontColor('#FFFFFF');
    }

    const existingClient = getClientByName(clientData.name);
    if (existingClient) {
      return { success: false, message: 'Client deja existant' };
    }

    const clientId = generateNextClientId();

    // Build row with country-specific fields
    const newRow = [
      clientId,
      clientData.name,
      clientData.email || '',
      clientData.phone || '',
      clientData.address || '',
      clientData.country || country,  // Default to company country
      clientData.siret || '',         // France
      clientData.vatNumber || '',     // France (EU VAT)
      clientData.niu || '',           // Cameroon
      clientData.taxId || '',         // USA
      clientData.paymentTerms || '',
      clientData.notes || '',
      true                            // Active by default
    ];
    clientsSheet.appendRow(newRow);

    logSuccess('createNewClient', 'Client ' + clientId + ' cree');

    return {
      success: true,
      clientId: clientId,
      clientInfo: {
        id: clientId,
        name: clientData.name,
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        country: clientData.country || country,
        siret: clientData.siret || '',
        vatNumber: clientData.vatNumber || '',
        niu: clientData.niu || '',
        taxId: clientData.taxId || ''
      }
    };
  } catch (error) {
    logError('createNewClient', 'Erreur', error);
    return { success: false, message: error.message };
  }
}

// ============================================================================
// FORMULAIRE HTML PRINCIPAL
// ============================================================================

function menuAddNewInvoice() {
  const html = HtmlService.createHtmlOutput(getNewInvoiceFormHtml())
    .setWidth(560)
    .setHeight(820);
  const title = getConfiguredLocale() === 'FR' ? 'Nouvelle Facture' : 'New Invoice';
  SpreadsheetApp.getUi().showModalDialog(html, title);
  // Force UI refresh to remove spinner after dialog closes
  SpreadsheetApp.flush();
}

function getNewInvoiceFormHtml() {
  const lang = getConfiguredLocale();
  const clients = getAllClients();
  const services = getAllServices();
  const hasClients = clients.length > 0;
  const hasServices = services.length > 0;

  // Get country configuration
  const country = getParam('COUNTRY') || 'FR';
  const currencySymbol = getCurrencySymbol();
  const defaultVatRate = getDefaultVatRateForCountry(country);
  const availableVatRates = getAvailableVatRatesForCountry(country);

  // Labels bilingues
  const L = lang === 'FR' ? {
    title: 'Créer une facture',
    subtitle: 'Remplissez les informations ci-dessous',
    clientSection: 'Client',
    selectPlaceholder: 'Choisir un client existant...',
    newClientToggle: 'Nouveau client',
    newClientName: 'Nom du client',
    newClientEmail: 'Email',
    newClientPhone: 'Téléphone',
    newClientAddress: 'Adresse',
    namePH: 'Nom complet ou entreprise',
    emailPH: 'email@exemple.com',
    phonePH: '+33 6 12 34 56 78',
    addressPH: '123 Rue Example, Ville',
    serviceSection: 'Produit / Service',
    selectServicePH: 'Choisir un service...',
    customServiceToggle: 'Description personnalisée',
    description: 'Description',
    descPH: 'Ex: Prestation de services',
    quantity: 'Quantité',
    unitPrice: 'Prix unitaire',
    tvaRate: 'Taux TVA (%)',
    currency: currencySymbol,
    total: 'Total',
    btnCreate: 'Créer la facture',
    btnCancel: 'Annuler',
    processing: 'Création...',
    success: 'Facture créée !',
    successWithClient: 'Client et facture créés !',
    error: 'Erreur',
    valName: 'Entrez le nom du client',
    valSelect: 'Sélectionnez un client',
    valService: 'Sélectionnez un service ou entrez une description',
    noServices: 'Aucun service disponible',
    addServiceHint: 'Ajoutez des services dans l\'onglet Services',
    // Legal ID labels
    legalIdSection: 'Identifiants legaux (optionnel)',
    siretLabel: 'SIRET',
    siretPH: '12345678901234',
    vatNumberLabel: 'N TVA Intracommunautaire',
    vatNumberPH: 'FR12345678901',
    niuLabel: 'NIU',
    niuPH: 'M012345678901A',
    taxIdLabel: 'Tax ID',
    taxIdPH: '12-3456789'
  } : {
    title: 'Create Invoice',
    subtitle: 'Fill in the details below',
    clientSection: 'Client',
    selectPlaceholder: 'Select an existing client...',
    newClientToggle: 'New client',
    newClientName: 'Client name',
    newClientEmail: 'Email',
    newClientPhone: 'Phone',
    newClientAddress: 'Address',
    namePH: 'Full name or company',
    emailPH: 'email@example.com',
    phonePH: '+1 555 123 4567',
    addressPH: '123 Example Street, City',
    serviceSection: 'Product / Service',
    selectServicePH: 'Select a service...',
    customServiceToggle: 'Custom description',
    description: 'Description',
    descPH: 'Ex: Web design services',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    tvaRate: 'VAT Rate (%)',
    currency: currencySymbol,
    total: 'Total',
    btnCreate: 'Create Invoice',
    btnCancel: 'Cancel',
    processing: 'Creating...',
    success: 'Invoice created!',
    successWithClient: 'Client and invoice created!',
    error: 'Error',
    valName: 'Enter the client name',
    valSelect: 'Select a client',
    valService: 'Select a service or enter a description',
    noServices: 'No services available',
    addServiceHint: 'Add services in the Services tab',
    // Legal ID labels
    legalIdSection: 'Legal IDs (optional)',
    siretLabel: 'SIRET',
    siretPH: '12345678901234',
    vatNumberLabel: 'EU VAT Number',
    vatNumberPH: 'FR12345678901',
    niuLabel: 'NIU',
    niuPH: 'M012345678901A',
    taxIdLabel: 'Tax ID',
    taxIdPH: '12-3456789'
  };
  
  // Générer les options clients
  const clientOptions = clients.map(c => 
    '<option value="' + escapeHtml(c.name) + '" data-email="' + escapeHtml(c.email) + '" data-phone="' + escapeHtml(c.phone) + '" data-address="' + escapeHtml(c.address) + '">' + escapeHtml(c.name) + '</option>'
  ).join('');
  
  // Générer les options services avec prix et catégorie
  const serviceOptions = services.map(s => 
    '<option value="' + escapeHtml(s.name) + '" data-description="' + escapeHtml(s.description) + '" data-price="' + s.defaultPrice + '" data-category="' + escapeHtml(s.category) + '">' + 
    escapeHtml(s.name) + (s.category ? ' (' + escapeHtml(s.category) + ')' : '') + ' - ' + L.currency + ' ' + s.defaultPrice.toFixed(2) + 
    '</option>'
  ).join('');

  // Construction du HTML
  var html = '<!DOCTYPE html><html><head><base target="_top">';
  html += '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">';
  html += '<style>';
  html += ':root{--primary:#2563eb;--primary-dark:#1d4ed8;--primary-light:#eff6ff;--secondary:#8b5cf6;--secondary-light:#f5f3ff;--success:#10b981;--success-light:#d1fae5;--error:#ef4444;--error-light:#fee2e2;--gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-300:#d1d5db;--gray-400:#9ca3af;--gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;--gray-800:#1f2937;--gray-900:#111827;--radius:12px}';
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
  html += '.form-group{margin-bottom:14px}';
  html += 'label{display:block;font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:6px}';
  html += '.toggle-container{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--gray-50);border:2px solid var(--gray-200);border-radius:var(--radius);margin-bottom:14px;cursor:pointer;transition:all .2s}';
  html += '.toggle-container:hover{border-color:var(--gray-300)}';
  html += '.toggle-container.active{background:var(--primary-light);border-color:var(--primary)}';
  html += '.toggle-container.active.secondary{background:var(--secondary-light);border-color:var(--secondary)}';
  html += '.toggle-label{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:var(--gray-600)}';
  html += '.toggle-container.active .toggle-label{color:var(--primary-dark)}';
  html += '.toggle-container.active.secondary .toggle-label{color:var(--secondary)}';
  html += '.toggle-label svg{width:20px;height:20px}';
  html += '.toggle-switch{position:relative;width:44px;height:24px;background:var(--gray-300);border-radius:12px;transition:all .2s}';
  html += '.toggle-switch.active{background:var(--primary)}';
  html += '.toggle-switch.active.secondary{background:var(--secondary)}';
  html += '.toggle-switch::after{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:all .2s}';
  html += '.toggle-switch.active::after{left:22px}';
  html += '.select-wrapper{position:relative}';
  html += 'select{width:100%;padding:12px 40px 12px 14px;font-size:14px;font-family:inherit;border:2px solid var(--gray-200);border-radius:var(--radius);background:#fff;cursor:pointer;appearance:none;transition:all .2s}';
  html += 'select:hover{border-color:var(--gray-300)}';
  html += 'select:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}';
  html += 'select:disabled{background:var(--gray-100);color:var(--gray-400);cursor:not-allowed}';
  html += '.select-arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-400)}';
  html += '.info-card{background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:12px 14px;margin-top:8px;display:none;animation:slideDown .25s ease}';
  html += '@keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}';
  html += '.info-card.visible{display:block}';
  html += '.info-row{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--gray-600);padding:3px 0}';
  html += '.info-row svg{width:14px;height:14px;color:var(--gray-400);flex-shrink:0}';
  html += '.info-row.highlight{font-weight:600;color:var(--primary-dark)}';
  html += '.expandable-form{display:none;animation:slideDown .25s ease;border:2px solid var(--primary);border-radius:var(--radius);padding:16px;margin-bottom:14px}';
  html += '.expandable-form.visible{display:block}';
  html += '.expandable-form.client-form{background:var(--primary-light)}';
  html += '.expandable-form.service-form{background:var(--secondary-light);border-color:var(--secondary)}';
  html += '.expandable-form.client-form label{color:var(--primary-dark)}';
  html += '.expandable-form.service-form label{color:var(--secondary)}';
  html += '.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}';
  html += '.form-grid .full-width{grid-column:1/-1}';
  html += 'input,textarea{width:100%;padding:12px 14px;font-size:14px;font-family:inherit;border:2px solid var(--gray-200);border-radius:var(--radius);background:#fff;transition:all .2s}';
  html += 'input:hover,textarea:hover{border-color:var(--gray-300)}';
  html += 'input:focus,textarea:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}';
  html += 'input::placeholder,textarea::placeholder{color:var(--gray-400)}';
  html += 'textarea{resize:none;min-height:70px}';
  html += '.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}';
  html += '.input-group{position:relative}';
  html += '.input-prefix{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--gray-400);font-size:14px;font-weight:500}';
  html += '.input-group input{padding-left:30px}';
  html += '.total-display{background:linear-gradient(135deg,var(--primary),var(--primary-dark));border-radius:var(--radius);padding:16px 18px;display:flex;justify-content:space-between;align-items:center;margin-top:6px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1)}';
  html += '.total-label{font-size:13px;font-weight:500;color:rgba(255,255,255,.85)}';
  html += '.total-amount{font-size:22px;font-weight:700;color:#fff}';
  html += '.status{padding:12px 14px;border-radius:var(--radius);font-size:13px;font-weight:500;display:none;align-items:center;gap:10px;margin-top:16px;animation:slideDown .25s ease}';
  html += '.status svg{width:18px;height:18px;flex-shrink:0}';
  html += '.status.loading{display:flex;background:var(--primary-light);color:var(--primary)}';
  html += '.status.success{display:flex;background:var(--success-light);color:var(--success)}';
  html += '.status.error{display:flex;background:var(--error-light);color:var(--error)}';
  html += '.spinner{width:18px;height:18px;border:2px solid var(--primary-light);border-top-color:var(--primary);border-radius:50%;animation:spin .8s linear infinite}';
  html += '@keyframes spin{to{transform:rotate(360deg)}}';
  html += '.buttons{display:flex;gap:10px;margin-top:20px}';
  html += 'button{flex:1;padding:12px 20px;font-size:14px;font-weight:600;font-family:inherit;border-radius:var(--radius);cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}';
  html += '.btn-secondary{background:#fff;border:2px solid var(--gray-200);color:var(--gray-600)}';
  html += '.btn-secondary:hover{background:var(--gray-50);border-color:var(--gray-300)}';
  html += '.btn-primary{background:var(--primary);border:2px solid var(--primary);color:#fff}';
  html += '.btn-primary:hover{background:var(--primary-dark);border-color:var(--primary-dark);transform:translateY(-1px)}';
  html += '.btn-primary:disabled{background:var(--gray-300);border-color:var(--gray-300);cursor:not-allowed;transform:none}';
  html += 'button svg{width:16px;height:16px}';
  html += '.empty-state{text-align:center;padding:20px;background:var(--gray-50);border-radius:var(--radius);color:var(--gray-500)}';
  html += '.empty-state svg{width:32px;height:32px;margin-bottom:8px;opacity:.5}';
  html += '.empty-state p{font-size:13px}';
  html += '</style></head><body>';
  
  // Header
  html += '<div class="header"><div class="header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg></div>';
  html += '<h1>' + L.title + '</h1><p>' + L.subtitle + '</p></div>';
  
  // Form
  html += '<form id="invoiceForm">';
  
  // Client Section
  html += '<div class="section"><div class="section-title">👤 ' + L.clientSection + '</div>';
  html += '<div class="toggle-container' + (!hasClients ? ' active' : '') + '" id="toggleClientContainer">';
  html += '<div class="toggle-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>' + L.newClientToggle + '</div>';
  html += '<div class="toggle-switch' + (!hasClients ? ' active' : '') + '" id="toggleClientSwitch"></div></div>';
  
  // New Client Form
  html += '<div class="expandable-form client-form' + (!hasClients ? ' visible' : '') + '" id="newClientForm">';
  html += '<div class="form-grid">';
  html += '<div class="form-group full-width"><label>' + L.newClientName + ' *</label><input type="text" id="newClientName" placeholder="' + L.namePH + '"></div>';
  html += '<div class="form-group"><label>' + L.newClientEmail + '</label><input type="email" id="newClientEmail" placeholder="' + L.emailPH + '"></div>';
  html += '<div class="form-group"><label>' + L.newClientPhone + '</label><input type="tel" id="newClientPhone" placeholder="' + L.phonePH + '"></div>';
  html += '<div class="form-group full-width"><label>' + L.newClientAddress + '</label><input type="text" id="newClientAddress" placeholder="' + L.addressPH + '"></div>';

  // Country-specific Legal ID fields
  html += '<div class="form-group full-width" style="margin-top:8px;padding-top:12px;border-top:1px solid var(--gray-200)">';
  html += '<label style="font-size:11px;color:var(--gray-400);text-transform:uppercase">' + L.legalIdSection + '</label></div>';

  // France: SIRET and VAT Number
  if (country === 'FR') {
    html += '<div class="form-group"><label>' + L.siretLabel + '</label><input type="text" id="newClientSiret" placeholder="' + L.siretPH + '" maxlength="14"></div>';
    html += '<div class="form-group"><label>' + L.vatNumberLabel + '</label><input type="text" id="newClientVatNumber" placeholder="' + L.vatNumberPH + '"></div>';
  }

  // Cameroon: NIU
  if (country === 'CM') {
    html += '<div class="form-group full-width"><label>' + L.niuLabel + '</label><input type="text" id="newClientNiu" placeholder="' + L.niuPH + '"></div>';
  }

  // USA: Tax ID
  if (country === 'US') {
    html += '<div class="form-group full-width"><label>' + L.taxIdLabel + '</label><input type="text" id="newClientTaxId" placeholder="' + L.taxIdPH + '"></div>';
  }

  html += '</div></div>';
  
  // Existing Client Select
  html += '<div class="form-group" id="existingClientSection" style="' + (!hasClients ? 'display:none' : '') + '">';
  html += '<div class="select-wrapper"><select id="client"' + (!hasClients ? ' disabled' : '') + '><option value="">' + L.selectPlaceholder + '</option>' + clientOptions + '</select>';
  html += '<div class="select-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div></div>';
  html += '<div class="info-card" id="clientInfo">';
  html += '<div class="info-row" id="clientEmailRow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span></span></div>';
  html += '<div class="info-row" id="clientPhoneRow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span></span></div>';
  html += '<div class="info-row" id="clientAddressRow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span></span></div>';
  html += '</div></div></div>';
  
  // Service Section
  html += '<div class="section"><div class="section-title">📦 ' + L.serviceSection + '</div>';
  
  if (hasServices) {
    html += '<div class="toggle-container secondary" id="toggleServiceContainer">';
    html += '<div class="toggle-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>' + L.customServiceToggle + '</div>';
    html += '<div class="toggle-switch secondary" id="toggleServiceSwitch"></div></div>';
    
    html += '<div class="expandable-form service-form" id="customServiceForm">';
    html += '<div class="form-group" style="margin-bottom:0"><label>' + L.description + ' *</label><textarea id="customDescription" placeholder="' + L.descPH + '"></textarea></div></div>';
    
    html += '<div class="form-group" id="existingServiceSection">';
    html += '<div class="select-wrapper"><select id="service"><option value="">' + L.selectServicePH + '</option>' + serviceOptions + '</select>';
    html += '<div class="select-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div></div>';
    html += '<div class="info-card" id="serviceInfo">';
    html += '<div class="info-row highlight" id="serviceDescRow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span></span></div>';
    html += '<div class="info-row" id="serviceCategoryRow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><span></span></div>';
    html += '</div></div>';
  } else {
    html += '<div class="form-group"><label>' + L.description + ' *</label><textarea id="customDescription" placeholder="' + L.descPH + '" required></textarea></div>';
    html += '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    html += '<p>' + L.noServices + '<br><small>' + L.addServiceHint + '</small></p></div>';
  }
  html += '</div>';
  
  // Amount Section
  html += '<div class="section"><div class="section-title">💰 ' + L.quantity + ', ' + L.unitPrice + ' & ' + L.tvaRate + '</div>';
  html += '<div class="row"><div class="form-group"><label>' + L.quantity + '</label><input type="number" id="quantity" min="1" value="1" required></div>';
  html += '<div class="form-group"><label>' + L.unitPrice + '</label><div class="input-group"><span class="input-prefix">' + L.currency + '</span><input type="number" id="unitPrice" min="0" step="0.01" placeholder="0.00" required></div></div></div>';
  // VAT Rate - use country default
  html += '<div class="row"><div class="form-group"><label>' + L.tvaRate + '</label><div class="input-group"><span class="input-prefix">%</span><input type="number" id="tvaRate" min="0" max="100" step="0.01" placeholder="' + defaultVatRate + '" value="' + defaultVatRate + '"></div></div><div class="form-group"></div></div>';
  html += '<div class="total-display"><span class="total-label">' + L.total + '</span><span class="total-amount" id="totalAmount">' + L.currency + ' 0.00</span></div></div>';
  
  // Status & Buttons
  html += '<div class="status" id="status"><div class="spinner"></div><span id="statusText"></span></div>';
  html += '<div class="buttons"><button type="button" class="btn-secondary" onclick="google.script.host.close()">' + L.btnCancel + '</button>';
  html += '<button type="submit" class="btn-primary" id="btnSubmit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' + L.btnCreate + '</button></div>';
  html += '</form>';
  
  // JavaScript
  html += '<script>';
  html += 'var L={currency:"' + L.currency + '",processing:"' + L.processing + '",success:"' + L.success + '",successWithClient:"' + L.successWithClient + '",error:"' + L.error + '",valName:"' + L.valName + '",valSelect:"' + L.valSelect + '",valService:"' + L.valService + '"};';
  html += 'var hasServices=' + hasServices + ';var isNewClient=' + (!hasClients) + ';var isCustomService=' + (!hasServices) + ';';
  html += 'var toggleClientContainer=document.getElementById("toggleClientContainer");var toggleClientSwitch=document.getElementById("toggleClientSwitch");var existingClientSection=document.getElementById("existingClientSection");var newClientForm=document.getElementById("newClientForm");var clientSelect=document.getElementById("client");var clientInfo=document.getElementById("clientInfo");';
  html += 'var toggleServiceContainer=document.getElementById("toggleServiceContainer");var toggleServiceSwitch=document.getElementById("toggleServiceSwitch");var existingServiceSection=document.getElementById("existingServiceSection");var customServiceForm=document.getElementById("customServiceForm");var serviceSelect=document.getElementById("service");var serviceInfo=document.getElementById("serviceInfo");var customDescription=document.getElementById("customDescription");';
  html += 'var qtyInput=document.getElementById("quantity");var priceInput=document.getElementById("unitPrice");var tvaRateInput=document.getElementById("tvaRate");var totalDisplay=document.getElementById("totalAmount");';
  
  // Toggle Client
  html += 'if(toggleClientContainer){toggleClientContainer.addEventListener("click",function(){isNewClient=!isNewClient;toggleClientContainer.classList.toggle("active",isNewClient);toggleClientSwitch.classList.toggle("active",isNewClient);if(isNewClient){existingClientSection.style.display="none";newClientForm.classList.add("visible");if(clientSelect){clientSelect.value="";clientInfo.classList.remove("visible");}}else{existingClientSection.style.display="block";newClientForm.classList.remove("visible");}});}';
  
  // Toggle Service
  html += 'if(toggleServiceContainer&&hasServices){toggleServiceContainer.addEventListener("click",function(){isCustomService=!isCustomService;toggleServiceContainer.classList.toggle("active",isCustomService);toggleServiceSwitch.classList.toggle("active",isCustomService);if(isCustomService){existingServiceSection.style.display="none";customServiceForm.classList.add("visible");if(serviceSelect){serviceSelect.value="";serviceInfo.classList.remove("visible");}}else{existingServiceSection.style.display="block";customServiceForm.classList.remove("visible");}});}';
  
  // Client Selection
  html += 'if(clientSelect){clientSelect.addEventListener("change",function(){var s=this.options[this.selectedIndex];if(this.value){document.querySelector("#clientEmailRow span").textContent=s.dataset.email||"-";document.querySelector("#clientPhoneRow span").textContent=s.dataset.phone||"-";document.querySelector("#clientAddressRow span").textContent=s.dataset.address||"-";clientInfo.classList.add("visible");}else{clientInfo.classList.remove("visible");}});}';
  
  // Service Selection with auto-fill price
  html += 'if(serviceSelect){serviceSelect.addEventListener("change",function(){var s=this.options[this.selectedIndex];if(this.value){document.querySelector("#serviceDescRow span").textContent=s.dataset.description||this.value;document.querySelector("#serviceCategoryRow span").textContent=s.dataset.category||"-";serviceInfo.classList.add("visible");var price=parseFloat(s.dataset.price)||0;if(price>0){priceInput.value=price.toFixed(2);updateTotal();}}else{serviceInfo.classList.remove("visible");}});}';
  
  // Calculate Total (TVA rate to amount conversion)
  html += 'function updateTotal(){var q=parseFloat(qtyInput.value)||0;var p=parseFloat(priceInput.value)||0;var tRate=parseFloat(tvaRateInput.value)||0;var subtotal=q*p;var tvaAmount=subtotal*(tRate/100);var total=subtotal+tvaAmount;totalDisplay.textContent=L.currency+" "+total.toFixed(2);}';
  html += 'qtyInput.addEventListener("input",updateTotal);priceInput.addEventListener("input",updateTotal);tvaRateInput.addEventListener("input",updateTotal);';
  
  // Form Submission
  html += 'document.getElementById("invoiceForm").addEventListener("submit",function(e){e.preventDefault();var btn=document.getElementById("btnSubmit");var status=document.getElementById("status");';
  html += 'if(isNewClient){var clientName=document.getElementById("newClientName").value.trim();if(!clientName){alert(L.valName);document.getElementById("newClientName").focus();return;}}else{if(!clientSelect||!clientSelect.value){alert(L.valSelect);if(clientSelect)clientSelect.focus();return;}}';
  html += 'var description="";if(isCustomService||!hasServices){description=customDescription?customDescription.value.trim():"";if(!description){alert(L.valService);if(customDescription)customDescription.focus();return;}}else{if(!serviceSelect||!serviceSelect.value){alert(L.valService);if(serviceSelect)serviceSelect.focus();return;}var selectedOption=serviceSelect.options[serviceSelect.selectedIndex];description=selectedOption.dataset.description||serviceSelect.value;}';
  html += 'btn.disabled=true;status.className="status loading";status.innerHTML=\'<div class="spinner"></div><span>\'+L.processing+\'</span>\';';
  html += 'var qty=parseInt(qtyInput.value);var unitPrice=parseFloat(priceInput.value);var tvaRate=parseFloat(tvaRateInput.value)||0;var tvaAmount=(qty*unitPrice)*(tvaRate/100);';
  // Build new client object with legal IDs (country-specific)
  html += 'function getNewClientData(){var c={name:document.getElementById("newClientName").value.trim(),email:document.getElementById("newClientEmail").value.trim(),phone:document.getElementById("newClientPhone").value.trim(),address:document.getElementById("newClientAddress").value.trim()};';
  html += 'var siretEl=document.getElementById("newClientSiret");if(siretEl)c.siret=siretEl.value.trim();';
  html += 'var vatEl=document.getElementById("newClientVatNumber");if(vatEl)c.vatNumber=vatEl.value.trim();';
  html += 'var niuEl=document.getElementById("newClientNiu");if(niuEl)c.niu=niuEl.value.trim();';
  html += 'var taxIdEl=document.getElementById("newClientTaxId");if(taxIdEl)c.taxId=taxIdEl.value.trim();';
  html += 'return c;}';
  html += 'var data={isNewClient:isNewClient,clientName:isNewClient?null:clientSelect.value,newClient:isNewClient?getNewClientData():null,description:description,quantity:qty,unitPrice:unitPrice,tva:tvaAmount};';
  html += 'google.script.run.withSuccessHandler(function(r){if(r.success){var msg=r.newClientCreated?L.successWithClient:L.success;status.className="status success";status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>\'+msg+\' ID: \'+r.invoiceId+\'</span>\';setTimeout(function(){google.script.host.close();},2000);}else{status.className="status error";status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>\'+L.error+\': \'+r.message+\'</span>\';btn.disabled=false;}}).withFailureHandler(function(err){status.className="status error";status.innerHTML=\'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>\'+L.error+\'</span>\';btn.disabled=false;}).processNewInvoiceForm(data);});';
  html += '</script></body></html>';
  
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ============================================================================
// TRAITEMENT DU FORMULAIRE
// ============================================================================

function processNewInvoiceForm(data) {
  try {
    var clientInfo;
    var newClientCreated = false;
    
    if (data.isNewClient) {
      var clientResult = createNewClient(data.newClient);
      if (!clientResult.success) {
        return { success: false, message: clientResult.message };
      }
      clientInfo = clientResult.clientInfo;
      newClientCreated = true;
    } else {
      clientInfo = getClientByName(data.clientName);
      if (!clientInfo) {
        return { success: false, message: 'Client non trouvé' };
      }
    }
    
    var invoiceResult = createNewInvoice(clientInfo, data.description, data.quantity, data.unitPrice, data.tva);

    return {
      success: invoiceResult.success,
      invoiceId: invoiceResult.invoiceId,
      message: invoiceResult.message,
      newClientCreated: newClientCreated
    };
  } catch (error) {
    logError('processNewInvoiceForm', 'Erreur', error);
    return { success: false, message: error.message };
  }
}

function createNewInvoice(clientInfo, description, quantity, unitPrice, tva) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) {
      return { success: false, message: 'Feuille Invoices introuvable' };
    }

    // Generate InvoiceID with ClientID included (e.g., INV2025-CLI-001-0009)
    var invoiceId = generateNextInvoiceId(clientInfo.id);
    var tvaAmount = tva || 0;
    var totalAmount = (quantity * unitPrice) + tvaAmount;
    var createdAt = formatDateTime(new Date());

    // Row data: InvoiceID, Date, Client info, Description, Qty, Price, TVA, Total, Status, PDFUrl, CreatedAt, GeneratedAt, SentAt
    var newRow = [
      invoiceId,
      new Date(),
      clientInfo.name,
      clientInfo.email,
      clientInfo.phone,
      clientInfo.address,
      description,
      quantity,
      unitPrice,
      tvaAmount,
      totalAmount,
      INVOICE_CONFIG.STATUSES.DRAFT,
      '',           // PDFUrl (empty)
      createdAt,    // CreatedAt
      '',           // GeneratedAt (empty)
      ''            // SentAt (empty)
    ];
    invoicesSheet.appendRow(newRow);

    logSuccess('createNewInvoice', 'Facture ' + invoiceId + ' créée pour client ' + clientInfo.id + ' at ' + createdAt);
    return { success: true, invoiceId: invoiceId, message: 'OK' };
  } catch (error) {
    logError('createNewInvoice', 'Erreur', error);
    return { success: false, message: error.message };
  }
}