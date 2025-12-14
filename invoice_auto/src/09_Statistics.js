/**
 * @file 09_Statistics.js
 * @description Modern HTML interface for invoice statistics with charts
 *              Interface HTML moderne pour les statistiques avec graphiques
 * @version 1.0
 * @date 2025-12-14
 */

// ============================================================================
// MENU FUNCTION - STATISTICS
// ============================================================================

/**
 * Opens the modern Statistics dialog
 * Ouvre la fenetre moderne des statistiques
 */
function menuStatistics() {
  const html = HtmlService.createHtmlOutput(getStatisticsHtml())
    .setWidth(520)
    .setHeight(580);
  const title = getConfiguredLocale() === 'FR' ? 'Statistiques' : 'Statistics';
  SpreadsheetApp.getUi().showModalDialog(html, title);
  SpreadsheetApp.flush();
}

// ============================================================================
// GET DETAILED STATISTICS
// ============================================================================

/**
 * Retrieves detailed invoice statistics
 * @returns {Object} Statistics object
 */
function getDetailedStatistics() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);

    if (!invoicesSheet) {
      return {
        total: 0,
        draft: 0,
        generated: 0,
        sent: 0,
        totalAmount: 0,
        draftAmount: 0,
        generatedAmount: 0,
        sentAmount: 0
      };
    }

    const data = invoicesSheet.getDataRange().getValues();
    const stats = {
      total: 0,
      draft: 0,
      generated: 0,
      sent: 0,
      totalAmount: 0,
      draftAmount: 0,
      generatedAmount: 0,
      sentAmount: 0
    };

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const status = String(row[INVOICE_CONFIG.COLUMNS.STATUS]).trim();
      const amount = Number(row[INVOICE_CONFIG.COLUMNS.TOTAL_AMOUNT]) || 0;

      if (row[INVOICE_CONFIG.COLUMNS.INVOICE_ID]) {
        stats.total++;
        stats.totalAmount += amount;

        if (status === INVOICE_CONFIG.STATUSES.DRAFT) {
          stats.draft++;
          stats.draftAmount += amount;
        } else if (status === INVOICE_CONFIG.STATUSES.GENERATED) {
          stats.generated++;
          stats.generatedAmount += amount;
        } else if (status === INVOICE_CONFIG.STATUSES.SENT) {
          stats.sent++;
          stats.sentAmount += amount;
        }
      }
    }

    return stats;
  } catch (error) {
    logError('getDetailedStatistics', 'Error getting statistics', error);
    return null;
  }
}

// ============================================================================
// HTML GENERATION
// ============================================================================

function getStatisticsHtml() {
  const lang = getConfiguredLocale();
  const stats = getDetailedStatistics();
  const currencySymbol = getCurrencySymbol();

  // Bilingual labels
  const L = lang === 'FR' ? {
    title: 'Tableau de bord',
    subtitle: 'Vue d\'ensemble de vos factures',
    totalInvoices: 'Total factures',
    totalAmount: 'Montant total',
    statusOverview: 'Repartition par statut',
    draft: 'A generer',
    generated: 'A envoyer',
    sent: 'Envoyees',
    amount: 'Montant',
    invoices: 'factures',
    invoice: 'facture',
    noData: 'Aucune facture',
    btnClose: 'Fermer',
    currency: currencySymbol
  } : {
    title: 'Dashboard',
    subtitle: 'Overview of your invoices',
    totalInvoices: 'Total invoices',
    totalAmount: 'Total amount',
    statusOverview: 'Status breakdown',
    draft: 'To generate',
    generated: 'To send',
    sent: 'Sent',
    amount: 'Amount',
    invoices: 'invoices',
    invoice: 'invoice',
    noData: 'No invoices',
    btnClose: 'Close',
    currency: currencySymbol
  };

  // Calculate percentages for the chart
  const total = stats.total || 1;
  const draftPct = Math.round((stats.draft / total) * 100);
  const generatedPct = Math.round((stats.generated / total) * 100);
  const sentPct = Math.round((stats.sent / total) * 100);

  // Build HTML
  var html = '<!DOCTYPE html><html><head><base target="_top">';
  html += '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">';
  html += '<style>';
  html += ':root{--primary:#6366f1;--primary-dark:#4f46e5;--primary-light:#eef2ff;--draft:#f59e0b;--draft-light:#fef3c7;--generated:#8b5cf6;--generated-light:#f5f3ff;--sent:#10b981;--sent-light:#d1fae5;--gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-300:#d1d5db;--gray-400:#9ca3af;--gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;--gray-800:#1f2937;--gray-900:#111827;--radius:12px}';
  html += '*{box-sizing:border-box;margin:0;padding:0}';
  html += 'body{font-family:"DM Sans",-apple-system,sans-serif;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:var(--gray-800);padding:24px;min-height:100vh}';
  html += '.container{background:#fff;border-radius:20px;padding:28px;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)}';
  html += '.header{text-align:center;margin-bottom:28px}';
  html += '.header-icon{width:56px;height:56px;background:linear-gradient(135deg,var(--primary),var(--primary-dark));border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 10px 15px -3px rgba(99,102,241,.3)}';
  html += '.header-icon svg{width:28px;height:28px;color:#fff}';
  html += '.header h1{font-size:22px;font-weight:700;color:var(--gray-900);margin-bottom:4px}';
  html += '.header p{font-size:13px;color:var(--gray-500)}';
  html += '.metrics{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px}';
  html += '.metric-card{background:var(--gray-50);border-radius:var(--radius);padding:20px;text-align:center;border:1px solid var(--gray-100)}';
  html += '.metric-card.primary{background:linear-gradient(135deg,var(--primary),var(--primary-dark));border:none}';
  html += '.metric-card.primary .metric-value,.metric-card.primary .metric-label{color:#fff}';
  html += '.metric-value{font-size:32px;font-weight:700;color:var(--gray-900);line-height:1}';
  html += '.metric-label{font-size:12px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-top:8px}';
  html += '.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--gray-400);margin-bottom:16px;display:flex;align-items:center;gap:8px}';
  html += '.section-title::after{content:"";flex:1;height:1px;background:var(--gray-200)}';
  html += '.chart-container{margin-bottom:24px}';
  html += '.chart-bar{height:12px;background:var(--gray-100);border-radius:6px;overflow:hidden;display:flex}';
  html += '.chart-segment{height:100%;transition:width .5s ease}';
  html += '.chart-segment.draft{background:var(--draft)}';
  html += '.chart-segment.generated{background:var(--generated)}';
  html += '.chart-segment.sent{background:var(--sent)}';
  html += '.chart-legend{display:flex;justify-content:center;gap:20px;margin-top:12px}';
  html += '.legend-item{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--gray-600)}';
  html += '.legend-dot{width:8px;height:8px;border-radius:50%}';
  html += '.legend-dot.draft{background:var(--draft)}';
  html += '.legend-dot.generated{background:var(--generated)}';
  html += '.legend-dot.sent{background:var(--sent)}';
  html += '.status-cards{display:flex;flex-direction:column;gap:12px}';
  html += '.status-card{display:flex;align-items:center;padding:16px;border-radius:var(--radius);border:2px solid var(--gray-100);transition:all .2s}';
  html += '.status-card:hover{border-color:var(--gray-200);transform:translateX(4px)}';
  html += '.status-card.draft{border-left:4px solid var(--draft);background:var(--draft-light)}';
  html += '.status-card.generated{border-left:4px solid var(--generated);background:var(--generated-light)}';
  html += '.status-card.sent{border-left:4px solid var(--sent);background:var(--sent-light)}';
  html += '.status-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-right:14px}';
  html += '.status-card.draft .status-icon{background:var(--draft);color:#fff}';
  html += '.status-card.generated .status-icon{background:var(--generated);color:#fff}';
  html += '.status-card.sent .status-icon{background:var(--sent);color:#fff}';
  html += '.status-icon svg{width:20px;height:20px}';
  html += '.status-info{flex:1}';
  html += '.status-name{font-size:14px;font-weight:600;color:var(--gray-800)}';
  html += '.status-count{font-size:12px;color:var(--gray-500)}';
  html += '.status-amount{text-align:right}';
  html += '.status-amount-value{font-size:16px;font-weight:700;color:var(--gray-900)}';
  html += '.status-amount-label{font-size:10px;color:var(--gray-400);text-transform:uppercase}';
  html += '.btn-close{width:100%;padding:14px;font-size:14px;font-weight:600;font-family:inherit;border-radius:var(--radius);cursor:pointer;background:var(--gray-100);border:none;color:var(--gray-600);transition:all .2s;margin-top:20px}';
  html += '.btn-close:hover{background:var(--gray-200)}';
  html += '.empty-state{text-align:center;padding:40px;color:var(--gray-400)}';
  html += '.empty-state svg{width:48px;height:48px;margin-bottom:12px;opacity:.5}';
  html += '</style></head><body>';

  html += '<div class="container">';

  // Header
  html += '<div class="header"><div class="header-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg></div>';
  html += '<h1>' + L.title + '</h1><p>' + L.subtitle + '</p></div>';

  if (stats.total === 0) {
    html += '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
    html += '<p>' + L.noData + '</p></div>';
  } else {
    // Main metrics
    html += '<div class="metrics">';
    html += '<div class="metric-card primary"><div class="metric-value">' + stats.total + '</div><div class="metric-label">' + L.totalInvoices + '</div></div>';
    html += '<div class="metric-card"><div class="metric-value">' + L.currency + ' ' + stats.totalAmount.toFixed(0) + '</div><div class="metric-label">' + L.totalAmount + '</div></div>';
    html += '</div>';

    // Chart
    html += '<div class="chart-container"><div class="section-title">' + L.statusOverview + '</div>';
    html += '<div class="chart-bar">';
    if (stats.draft > 0) html += '<div class="chart-segment draft" style="width:' + draftPct + '%"></div>';
    if (stats.generated > 0) html += '<div class="chart-segment generated" style="width:' + generatedPct + '%"></div>';
    if (stats.sent > 0) html += '<div class="chart-segment sent" style="width:' + sentPct + '%"></div>';
    html += '</div>';
    html += '<div class="chart-legend">';
    html += '<div class="legend-item"><div class="legend-dot draft"></div>' + L.draft + ' (' + draftPct + '%)</div>';
    html += '<div class="legend-item"><div class="legend-dot generated"></div>' + L.generated + ' (' + generatedPct + '%)</div>';
    html += '<div class="legend-item"><div class="legend-dot sent"></div>' + L.sent + ' (' + sentPct + '%)</div>';
    html += '</div></div>';

    // Status cards
    html += '<div class="status-cards">';

    // Draft
    html += '<div class="status-card draft"><div class="status-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>';
    html += '<div class="status-info"><div class="status-name">' + L.draft + '</div><div class="status-count">' + stats.draft + ' ' + (stats.draft > 1 ? L.invoices : L.invoice) + '</div></div>';
    html += '<div class="status-amount"><div class="status-amount-value">' + L.currency + ' ' + stats.draftAmount.toFixed(0) + '</div><div class="status-amount-label">' + L.amount + '</div></div></div>';

    // Generated
    html += '<div class="status-card generated"><div class="status-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg></div>';
    html += '<div class="status-info"><div class="status-name">' + L.generated + '</div><div class="status-count">' + stats.generated + ' ' + (stats.generated > 1 ? L.invoices : L.invoice) + '</div></div>';
    html += '<div class="status-amount"><div class="status-amount-value">' + L.currency + ' ' + stats.generatedAmount.toFixed(0) + '</div><div class="status-amount-label">' + L.amount + '</div></div></div>';

    // Sent
    html += '<div class="status-card sent"><div class="status-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></div>';
    html += '<div class="status-info"><div class="status-name">' + L.sent + '</div><div class="status-count">' + stats.sent + ' ' + (stats.sent > 1 ? L.invoices : L.invoice) + '</div></div>';
    html += '<div class="status-amount"><div class="status-amount-value">' + L.currency + ' ' + stats.sentAmount.toFixed(0) + '</div><div class="status-amount-label">' + L.amount + '</div></div></div>';

    html += '</div>';
  }

  // Close button
  html += '<button class="btn-close" onclick="google.script.host.close()">' + L.btnClose + '</button>';

  html += '</div></body></html>';
  return html;
}
