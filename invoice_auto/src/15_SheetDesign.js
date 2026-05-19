/**
 * @file 15_SheetDesign.js
 * @description Professional visual design for the InvoiceFlash spreadsheet
 *              Transforms the raw data sheets into a polished, sales-ready product
 * @version 1.0
 */

// ============================================================================
// COLOR PALETTE — matches the HTML modal UI
// ============================================================================

const DESIGN = {
  // Brand colors
  PRIMARY:        '#1e40af',   // deep blue
  PRIMARY_LIGHT:  '#dbeafe',
  SECONDARY:      '#7c3aed',   // violet
  SECONDARY_LIGHT:'#ede9fe',

  // Status colors
  DRAFT_BG:       '#fef3c7',
  DRAFT_TEXT:     '#92400e',
  GENERATED_BG:   '#ede9fe',
  GENERATED_TEXT: '#5b21b6',
  SENT_BG:        '#d1fae5',
  SENT_TEXT:      '#065f46',

  // Neutral
  HEADER_BG:      '#0f172a',   // near-black for table headers
  HEADER_TEXT:    '#ffffff',
  ROW_ALT:        '#f8fafc',
  ROW_BASE:       '#ffffff',
  BORDER:         '#e2e8f0',
  SECTION_BG:     '#f1f5f9',

  // Dashboard accent
  DASH_BG:        '#0f172a',
  DASH_CARD_BG:   '#1e293b',
  DASH_ACCENT1:   '#3b82f6',
  DASH_ACCENT2:   '#8b5cf6',
  DASH_ACCENT3:   '#10b981',
  DASH_ACCENT4:   '#f59e0b',
  DASH_TEXT:      '#f1f5f9',
  DASH_MUTED:     '#94a3b8',
};

// ============================================================================
// MENU ENTRY — called from 04_Main.js via menuApplyDesign()
// ============================================================================

function menuApplyDesign() {
  const ui = SpreadsheetApp.getUi();
  const lang = getConfiguredLocale();

  const title = lang === 'FR' ? '✨ Appliquer le design pro' : '✨ Apply Pro Design';
  const msg   = lang === 'FR'
    ? 'Cette action va appliquer le design professionnel à toutes les feuilles.\nLa mise en forme existante sera remplacée.\n\nContinuer ?'
    : 'This will apply the professional design to all sheets.\nExisting formatting will be replaced.\n\nContinue?';

  const res = ui.alert(title, msg, ui.ButtonSet.YES_NO);
  if (res !== ui.Button.YES) return;

  try {
    applyFullDesign();
    const done = lang === 'FR' ? '✅ Design appliqué avec succès !' : '✅ Design applied successfully!';
    ui.alert(title, done, ui.ButtonSet.OK);
  } catch (e) {
    ui.alert('Error', e.message, ui.ButtonSet.OK);
  }
}

// ============================================================================
// MASTER FUNCTION
// ============================================================================

function applyFullDesign() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  applyInvoicesSheetDesign(ss);
  applyClientsSheetDesign(ss);
  applyServicesSheetDesign(ss);
  applySettingsSheetDesign(ss);
  applyOrRefreshDashboard(ss);

  // Set tab colors
  _setTabColors(ss);

  SpreadsheetApp.flush();
}

// ============================================================================
// INVOICES SHEET
// ============================================================================

function applyInvoicesSheetDesign(ss) {
  const sheet = ss.getSheetByName('Invoices');
  if (!sheet) return;

  const lastRow = Math.max(sheet.getLastRow(), 2);
  const lastCol = 17; // A–Q

  // ── Reset ──────────────────────────────────────────────────────────────────
  sheet.clearFormats();

  // ── Header row ─────────────────────────────────────────────────────────────
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange
    .setBackground(DESIGN.HEADER_BG)
    .setFontColor(DESIGN.HEADER_TEXT)
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);

  // ── Data rows ──────────────────────────────────────────────────────────────
  if (lastRow > 1) {
    for (let r = 2; r <= lastRow; r++) {
      const bg = (r % 2 === 0) ? DESIGN.ROW_ALT : DESIGN.ROW_BASE;
      sheet.getRange(r, 1, 1, lastCol).setBackground(bg).setFontSize(11).setVerticalAlignment('middle');
      sheet.setRowHeight(r, 28);
    }

    // Status column (L = col 12) — conditional coloring
    for (let r = 2; r <= lastRow; r++) {
      const statusCell = sheet.getRange(r, 12);
      const status = String(statusCell.getValue()).trim();
      if (status === 'Draft') {
        statusCell.setBackground(DESIGN.DRAFT_BG).setFontColor(DESIGN.DRAFT_TEXT).setFontWeight('bold');
      } else if (status === 'Generated') {
        statusCell.setBackground(DESIGN.GENERATED_BG).setFontColor(DESIGN.GENERATED_TEXT).setFontWeight('bold');
      } else if (status === 'Sent') {
        statusCell.setBackground(DESIGN.SENT_BG).setFontColor(DESIGN.SENT_TEXT).setFontWeight('bold');
      }
      // Center status cell
      statusCell.setHorizontalAlignment('center');
    }

    // Amount column (K = col 11) — right-align + bold
    sheet.getRange(2, 11, lastRow - 1, 1).setFontWeight('bold').setHorizontalAlignment('right');

    // InvoiceID (A) — monospace-ish, primary color
    sheet.getRange(2, 1, lastRow - 1, 1).setFontColor(DESIGN.PRIMARY).setFontWeight('bold');
  }

  // ── Column widths ───────────────────────────────────────────────────────────
  sheet.setColumnWidth(1, 195);   // InvoiceID
  sheet.setColumnWidth(2, 100);   // Date
  sheet.setColumnWidth(3, 140);   // ClientName
  sheet.setColumnWidth(4, 175);   // Email
  sheet.setColumnWidth(5, 110);   // Phone
  sheet.setColumnWidth(6, 200);   // Address
  sheet.setColumnWidth(7, 200);   // Description
  sheet.setColumnWidth(8, 75);    // Qty
  sheet.setColumnWidth(9, 90);    // UnitPrice
  sheet.setColumnWidth(10, 75);   // TVA
  sheet.setColumnWidth(11, 100);  // Total
  sheet.setColumnWidth(12, 100);  // Status
  sheet.setColumnWidth(13, 220);  // PDFUrl
  sheet.setColumnWidth(14, 130);  // CreatedAt
  sheet.setColumnWidth(15, 130);  // GeneratedAt
  sheet.setColumnWidth(16, 130);  // SentAt
  sheet.setColumnWidth(17, 160);  // Notes

  // ── Freeze + filter ─────────────────────────────────────────────────────────
  sheet.setFrozenRows(1);
  if (lastRow > 1) {
    sheet.getRange(1, 1, lastRow, lastCol).createFilter();
  }

  // ── Grid borders ───────────────────────────────────────────────────────────
  if (lastRow > 1) {
    sheet.getRange(1, 1, lastRow, lastCol)
      .setBorder(true, true, true, true, true, true,
        DESIGN.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  }
}

// ============================================================================
// CLIENTS SHEET
// ============================================================================

function applyClientsSheetDesign(ss) {
  const sheet = ss.getSheetByName('Clients');
  if (!sheet) return;

  const lastRow = Math.max(sheet.getLastRow(), 2);
  const lastCol = 13;

  sheet.clearFormats();

  // Header
  sheet.getRange(1, 1, 1, lastCol)
    .setBackground(DESIGN.PRIMARY)
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);

  // Data rows
  if (lastRow > 1) {
    for (let r = 2; r <= lastRow; r++) {
      const bg = (r % 2 === 0) ? DESIGN.PRIMARY_LIGHT : DESIGN.ROW_BASE;
      sheet.getRange(r, 1, 1, lastCol).setBackground(bg).setFontSize(11).setVerticalAlignment('middle');
      sheet.setRowHeight(r, 28);
    }
    // ClientID — bold primary
    sheet.getRange(2, 1, lastRow - 1, 1).setFontColor(DESIGN.PRIMARY).setFontWeight('bold').setHorizontalAlignment('center');
    // Active column (M = 13)
    sheet.getRange(2, 13, lastRow - 1, 1).setHorizontalAlignment('center');
  }

  sheet.setColumnWidth(1, 90);   // ClientID
  sheet.setColumnWidth(2, 150);  // Name
  sheet.setColumnWidth(3, 180);  // Email
  sheet.setColumnWidth(4, 120);  // Phone
  sheet.setColumnWidth(5, 220);  // Address
  sheet.setColumnWidth(6, 80);   // Country
  sheet.setColumnWidth(7, 130);  // SIRET
  sheet.setColumnWidth(8, 150);  // VATNumber
  sheet.setColumnWidth(9, 130);  // NIU
  sheet.setColumnWidth(10, 130); // TaxID
  sheet.setColumnWidth(11, 130); // PaymentTerms
  sheet.setColumnWidth(12, 160); // Notes
  sheet.setColumnWidth(13, 65);  // Active

  sheet.setFrozenRows(1);
  if (lastRow > 1) sheet.getRange(1, 1, lastRow, lastCol).createFilter();
  if (lastRow > 1) {
    sheet.getRange(1, 1, lastRow, lastCol)
      .setBorder(true, true, true, true, true, true, DESIGN.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  }
}

// ============================================================================
// SERVICES SHEET
// ============================================================================

function applyServicesSheetDesign(ss) {
  const sheet = ss.getSheetByName('Services');
  if (!sheet) return;

  const lastRow = Math.max(sheet.getLastRow(), 2);
  const lastCol = 8;

  sheet.clearFormats();

  sheet.getRange(1, 1, 1, lastCol)
    .setBackground(DESIGN.SECONDARY)
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);

  if (lastRow > 1) {
    for (let r = 2; r <= lastRow; r++) {
      const bg = (r % 2 === 0) ? DESIGN.SECONDARY_LIGHT : DESIGN.ROW_BASE;
      sheet.getRange(r, 1, 1, lastCol).setBackground(bg).setFontSize(11).setVerticalAlignment('middle');
      sheet.setRowHeight(r, 28);
    }
    sheet.getRange(2, 1, lastRow - 1, 1).setFontColor(DESIGN.SECONDARY).setFontWeight('bold').setHorizontalAlignment('center');
    // Price column (D=4) — bold right
    sheet.getRange(2, 4, lastRow - 1, 1).setFontWeight('bold').setHorizontalAlignment('right');
  }

  sheet.setColumnWidth(1, 90);   // ServiceID
  sheet.setColumnWidth(2, 160);  // Name
  sheet.setColumnWidth(3, 250);  // Description
  sheet.setColumnWidth(4, 110);  // Price
  sheet.setColumnWidth(5, 120);  // Category
  sheet.setColumnWidth(6, 80);   // VATRate
  sheet.setColumnWidth(7, 80);   // Unit
  sheet.setColumnWidth(8, 70);   // Active

  sheet.setFrozenRows(1);
  if (lastRow > 1) {
    sheet.getRange(1, 1, lastRow, lastCol)
      .setBorder(true, true, true, true, true, true, DESIGN.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  }
}

// ============================================================================
// SETTINGS SHEET
// ============================================================================

function applySettingsSheetDesign(ss) {
  const sheet = ss.getSheetByName('Settings');
  if (!sheet) return;

  const lastRow = Math.max(sheet.getLastRow(), 2);

  sheet.clearFormats();
  sheet.setColumnWidth(1, 230);
  sheet.setColumnWidth(2, 420);

  // Section groups — detect section breaks by empty rows or key patterns
  const sectionHeaders = {
    'TEMPLATE_DOCS_ID':      '📁 Google Drive',
    'COMPANY_NAME':          '🏢 Entreprise',
    'COMPANY_SIRET':         '🔖 Identifiants légaux',
    'BANK_NAME':             '🏦 Coordonnées bancaires',
    'DEFAULT_VAT_RATE':      '💰 TVA & Paiement',
    'LEGAL_FOOTER_CUSTOM':   '📝 Footer légal',
    'COMPANY_NIU':           '🌍 Autres pays (CM/US)',
  };

  const data = sheet.getRange(1, 1, lastRow, 2).getValues();

  for (let r = 0; r < data.length; r++) {
    const key = String(data[r][0]).trim();
    const rowNum = r + 1;

    if (sectionHeaders[key]) {
      // Section header row — dark bg
      sheet.getRange(rowNum, 1, 1, 2)
        .setBackground(DESIGN.HEADER_BG)
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setFontSize(10);
      // Insert fake label in col A for visual
      sheet.getRange(rowNum, 1).setValue(sectionHeaders[key] + ' — ' + key);
    } else if (key === '') {
      sheet.getRange(rowNum, 1, 1, 2).setBackground('#f8fafc');
    } else {
      const bg = (rowNum % 2 === 0) ? '#f1f5f9' : '#ffffff';
      sheet.getRange(rowNum, 1, 1, 1).setBackground(bg).setFontWeight('bold').setFontColor('#374151').setFontSize(10);
      sheet.getRange(rowNum, 2, 1, 1).setBackground(bg).setFontColor('#1e293b').setFontSize(11);
    }
    sheet.setRowHeight(rowNum, 26);
  }

  sheet.setFrozenRows(1);
}

// ============================================================================
// DASHBOARD SHEET — Create or Refresh
// ============================================================================

function applyOrRefreshDashboard(ss) {
  let dash = ss.getSheetByName('📊 Dashboard');
  if (!dash) {
    dash = ss.insertSheet('📊 Dashboard', 0); // First tab
  }
  dash.clear();
  dash.clearFormats();
  dash.setTabColor(DESIGN.DASH_ACCENT1);

  // Minimal grid
  dash.setColumnWidth(1, 24);
  for (let c = 2; c <= 10; c++) dash.setColumnWidth(c, 140);
  dash.setColumnWidth(11, 24);

  // Background
  dash.getRange(1, 1, 60, 11).setBackground(DESIGN.DASH_BG);

  // ── Title ─────────────────────────────────────────────────────────────────
  dash.setRowHeight(2, 50);
  const titleCell = dash.getRange('B2:J2');
  titleCell.merge()
    .setValue('⚡ InvoiceFlash — Dashboard')
    .setBackground(DESIGN.DASH_BG)
    .setFontColor(DESIGN.DASH_TEXT)
    .setFontSize(22)
    .setFontWeight('bold')
    .setVerticalAlignment('middle');

  dash.setRowHeight(3, 14);

  // ── KPI cards (row 4-6) ───────────────────────────────────────────────────
  const stats = _computeStats(ss);
  const currency = _getCurrencyFromSettings(ss);

  const kpiData = [
    { label: 'TOTAL FACTURES',  value: String(stats.total),                           color: DESIGN.DASH_ACCENT1 },
    { label: 'CHIFFRE D\'AFF.', value: currency + ' ' + _fmt(stats.totalAmount),     color: DESIGN.DASH_ACCENT2 },
    { label: 'ENVOYÉES',        value: String(stats.sent),                            color: DESIGN.DASH_ACCENT3 },
    { label: 'EN ATTENTE',      value: String(stats.draft + stats.generated),         color: DESIGN.DASH_ACCENT4 },
  ];

  // Columns: B(2), D(4), F(6), H(8) — 2-wide each
  const kpiCols = [2, 4, 6, 8];
  dash.setRowHeight(4, 14);
  dash.setRowHeight(5, 48);
  dash.setRowHeight(6, 28);
  dash.setRowHeight(7, 14);

  kpiData.forEach((kpi, i) => {
    const col = kpiCols[i];
    const valueRange = dash.getRange(5, col, 1, 2);
    valueRange.merge()
      .setValue(kpi.value)
      .setBackground(kpi.color)
      .setFontColor('#ffffff')
      .setFontSize(26)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    const labelRange = dash.getRange(6, col, 1, 2);
    labelRange.merge()
      .setValue(kpi.label)
      .setBackground(DESIGN.DASH_CARD_BG)
      .setFontColor(DESIGN.DASH_MUTED)
      .setFontSize(9)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setFontFamily('Courier New');
  });

  // ── Status breakdown (row 8-16) ──────────────────────────────────────────
  dash.setRowHeight(8, 20);
  const sectionTitle1 = dash.getRange('B8:J8');
  sectionTitle1.merge()
    .setValue('RÉPARTITION PAR STATUT')
    .setBackground(DESIGN.DASH_BG)
    .setFontColor(DESIGN.DASH_MUTED)
    .setFontSize(9)
    .setFontWeight('bold')
    .setFontFamily('Courier New')
    .setVerticalAlignment('middle');

  const statuses = [
    { label: '📝  Brouillon (Draft)',     count: stats.draft,     amount: stats.draftAmount,     color: DESIGN.DASH_ACCENT4 },
    { label: '📄  Générée (Generated)',   count: stats.generated, amount: stats.generatedAmount, color: DESIGN.DASH_ACCENT2 },
    { label: '✅  Envoyée (Sent)',        count: stats.sent,      amount: stats.sentAmount,      color: DESIGN.DASH_ACCENT3 },
  ];

  statuses.forEach((s, i) => {
    const r = 9 + (i * 2);
    dash.setRowHeight(r, 32);
    dash.setRowHeight(r + 1, 4);

    // Label
    const lCell = dash.getRange(r, 2, 1, 4);
    lCell.merge()
      .setValue(s.label)
      .setBackground(DESIGN.DASH_CARD_BG)
      .setFontColor(DESIGN.DASH_TEXT)
      .setFontSize(12)
      .setFontWeight('bold')
      .setVerticalAlignment('middle');

    // Count
    const cCell = dash.getRange(r, 6, 1, 2);
    cCell.merge()
      .setValue(s.count + ' factures')
      .setBackground(DESIGN.DASH_CARD_BG)
      .setFontColor(DESIGN.DASH_MUTED)
      .setFontSize(11)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    // Amount
    const aCell = dash.getRange(r, 8, 1, 2);
    aCell.merge()
      .setValue(currency + ' ' + _fmt(s.amount))
      .setBackground(s.color)
      .setFontColor('#ffffff')
      .setFontSize(13)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
  });

  // ── Top clients (row 16+) ─────────────────────────────────────────────────
  const topRow = 17;
  dash.setRowHeight(topRow, 20);
  dash.getRange(topRow, 2, 1, 9).merge()
    .setValue('TOP CLIENTS')
    .setBackground(DESIGN.DASH_BG)
    .setFontColor(DESIGN.DASH_MUTED)
    .setFontSize(9)
    .setFontWeight('bold')
    .setFontFamily('Courier New')
    .setVerticalAlignment('middle');

  const topClients = _getTopClients(ss, 5);
  topClients.forEach((c, i) => {
    const r = topRow + 1 + (i * 2);
    dash.setRowHeight(r, 32);
    dash.setRowHeight(r + 1, 4);

    dash.getRange(r, 2, 1, 4).merge()
      .setValue(c.name)
      .setBackground(DESIGN.DASH_CARD_BG)
      .setFontColor(DESIGN.DASH_TEXT)
      .setFontSize(12)
      .setFontWeight('bold')
      .setVerticalAlignment('middle');

    dash.getRange(r, 6, 1, 2).merge()
      .setValue(c.count + ' factures')
      .setBackground(DESIGN.DASH_CARD_BG)
      .setFontColor(DESIGN.DASH_MUTED)
      .setFontSize(11)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');

    dash.getRange(r, 8, 1, 2).merge()
      .setValue(currency + ' ' + _fmt(c.total))
      .setBackground(i === 0 ? DESIGN.DASH_ACCENT1 : DESIGN.DASH_CARD_BG)
      .setFontColor(i === 0 ? '#ffffff' : DESIGN.DASH_TEXT)
      .setFontSize(13)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
  });

  // ── Footer watermark ──────────────────────────────────────────────────────
  const footerRow = topRow + 1 + topClients.length * 2 + 2;
  dash.setRowHeight(footerRow, 28);
  dash.getRange(footerRow, 2, 1, 9).merge()
    .setValue('⚡ InvoiceFlash v2.0  •  Multi-Country Invoice Generator  •  FR / CM / US')
    .setBackground(DESIGN.DASH_BG)
    .setFontColor('#334155')
    .setFontSize(9)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
}

// ============================================================================
// TAB COLORS
// ============================================================================

function _setTabColors(ss) {
  const tabColors = {
    '📊 Dashboard': DESIGN.DASH_ACCENT1,
    'Invoices':     '#0f172a',
    'Clients':      DESIGN.PRIMARY,
    'Services':     DESIGN.SECONDARY,
    'Settings':     '#6b7280',
  };
  Object.entries(tabColors).forEach(([name, color]) => {
    const s = ss.getSheetByName(name);
    if (s) s.setTabColor(color);
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function _computeStats(ss) {
  const sheet = ss.getSheetByName('Invoices');
  const stats = { total: 0, draft: 0, generated: 0, sent: 0, totalAmount: 0, draftAmount: 0, generatedAmount: 0, sentAmount: 0 };
  if (!sheet) return stats;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const status = String(row[11]).trim();
    const amount = Number(row[10]) || 0;
    stats.total++;
    stats.totalAmount += amount;
    if (status === 'Draft')     { stats.draft++;     stats.draftAmount += amount; }
    else if (status === 'Generated') { stats.generated++; stats.generatedAmount += amount; }
    else if (status === 'Sent') { stats.sent++;      stats.sentAmount += amount; }
  }
  return stats;
}

function _getTopClients(ss, limit) {
  const sheet = ss.getSheetByName('Invoices');
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const map = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    const name = String(row[2]).trim();
    const amount = Number(row[10]) || 0;
    if (!map[name]) map[name] = { name, count: 0, total: 0 };
    map[name].count++;
    map[name].total += amount;
  }
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, limit);
}

function _getCurrencyFromSettings(ss) {
  try {
    const sheet = ss.getSheetByName('Settings');
    if (!sheet) return '€';
    const data = sheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === 'CURRENCY_SYMBOL') return String(data[i][1]).trim() || '€';
    }
  } catch (e) { /* ignore */ }
  return '€';
}

function _fmt(num) {
  return Number(num).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
