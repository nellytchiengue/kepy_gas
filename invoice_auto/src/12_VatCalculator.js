/**
 * @file 12_VatCalculator.js
 * @description Multi-rate VAT/Tax calculator with country-specific support
 *              Calculateur TVA multi-taux avec support par pays
 * @version 1.0
 * @date 2025-12-14
 * @author InvoiceFlash - Multi-Country Edition
 */

// ============================================================================
// MAIN VAT CALCULATION FUNCTIONS / FONCTIONS PRINCIPALES DE CALCUL TVA
// ============================================================================

/**
 * Calculates VAT summary for multiple invoice lines
 * Calcule le recapitulatif TVA pour plusieurs lignes de facture
 * @param {Array} lines - Array of line items [{quantity, unitPrice, vatRate, description}, ...]
 * @param {string} country - Country code (FR, CM, US)
 * @returns {Object} {subtotalHT, vatDetails: [{rate, base, amount}], totalVat, totalTTC, lines}
 */
function calculateVatSummary(lines, country) {
  const countryCode = country || getParam('COUNTRY') || 'FR';
  const vatByRate = {};
  let subtotalHT = 0;
  const processedLines = [];

  // Process each line
  lines.forEach((line, index) => {
    const quantity = parseFloat(line.quantity) || 0;
    const unitPrice = parseFloat(line.unitPrice) || 0;
    const lineHT = quantity * unitPrice;

    // Get VAT rate - use line-specific or country default
    let vatRate = parseFloat(line.vatRate);
    if (isNaN(vatRate)) {
      vatRate = getDefaultVatRateForCountry(countryCode);
    }

    const vatAmount = calculateVatAmount(lineHT, vatRate, countryCode);
    const lineTTC = lineHT + vatAmount;

    subtotalHT += lineHT;

    // Aggregate by VAT rate
    if (!vatByRate[vatRate]) {
      vatByRate[vatRate] = {
        rate: vatRate,
        base: 0,
        amount: 0,
        label: getVatRateLabel(vatRate, countryCode)
      };
    }
    vatByRate[vatRate].base += lineHT;
    vatByRate[vatRate].amount += vatAmount;

    // Store processed line
    processedLines.push({
      index: index + 1,
      description: line.description || '',
      quantity: quantity,
      unitPrice: unitPrice,
      vatRate: vatRate,
      lineHT: roundAmount(lineHT, countryCode),
      vatAmount: roundAmount(vatAmount, countryCode),
      lineTTC: roundAmount(lineTTC, countryCode)
    });
  });

  // Convert vatByRate to sorted array (highest rate first)
  const vatDetails = Object.values(vatByRate)
    .sort((a, b) => b.rate - a.rate)
    .map(v => ({
      rate: v.rate,
      label: v.label,
      base: roundAmount(v.base, countryCode),
      amount: roundAmount(v.amount, countryCode)
    }));

  const totalVat = vatDetails.reduce((sum, v) => sum + v.amount, 0);
  const totalTTC = subtotalHT + totalVat;

  return {
    subtotalHT: roundAmount(subtotalHT, countryCode),
    vatDetails: vatDetails,
    totalVat: roundAmount(totalVat, countryCode),
    totalTTC: roundAmount(totalTTC, countryCode),
    lines: processedLines,
    country: countryCode
  };
}

/**
 * Calculates VAT amount for a given base amount
 * @param {number} baseAmount - Amount before tax
 * @param {number} vatRate - VAT rate in percentage
 * @param {string} country - Country code
 * @returns {number} VAT amount
 */
function calculateVatAmount(baseAmount, vatRate, country) {
  if (!vatRate || vatRate === 0) return 0;

  // For Cameroon, handle the composite rate (TVA 17.5% + CAC 1.75% = 19.25%)
  if (country === 'CM' && vatRate === 19.25) {
    // The 19.25% is already the total rate
    return baseAmount * (vatRate / 100);
  }

  return baseAmount * (vatRate / 100);
}

/**
 * Calculates reverse VAT (from TTC to HT)
 * Calcule la TVA inverse (du TTC au HT)
 * @param {number} amountTTC - Total amount including tax
 * @param {number} vatRate - VAT rate in percentage
 * @returns {Object} {amountHT, vatAmount, amountTTC}
 */
function calculateReverseVat(amountTTC, vatRate) {
  if (!vatRate || vatRate === 0) {
    return {
      amountHT: amountTTC,
      vatAmount: 0,
      amountTTC: amountTTC
    };
  }

  const amountHT = amountTTC / (1 + vatRate / 100);
  const vatAmount = amountTTC - amountHT;

  return {
    amountHT: Math.round(amountHT * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    amountTTC: amountTTC
  };
}

// ============================================================================
// COUNTRY-SPECIFIC VAT FUNCTIONS / FONCTIONS TVA PAR PAYS
// ============================================================================

/**
 * Gets the default VAT rate for a country
 * @param {string} country - Country code
 * @returns {number} Default VAT rate
 */
function getDefaultVatRateForCountry(country) {
  switch (country) {
    case 'FR':
      return 20; // Taux normal France
    case 'CM':
      return 19.25; // TVA Cameroun (17.5% + CAC 1.75%)
    case 'US':
      // US doesn't have federal VAT, use configured sales tax
      const salesTaxRate = getParam(INVOICE_CONFIG.PARAM_KEYS.SALES_TAX_RATE);
      return parseFloat(salesTaxRate) || 0;
    default:
      return 20;
  }
}

/**
 * Gets available VAT rates for a country
 * @param {string} country - Country code
 * @returns {Array} Array of available VAT rates
 */
function getAvailableVatRatesForCountry(country) {
  switch (country) {
    case 'FR':
      return [
        { rate: 20, label: 'Taux normal (20%)', category: 'standard' },
        { rate: 10, label: 'Taux intermediaire (10%)', category: 'intermediate' },
        { rate: 5.5, label: 'Taux reduit (5.5%)', category: 'reduced' },
        { rate: 2.1, label: 'Taux super-reduit (2.1%)', category: 'super_reduced' },
        { rate: 0, label: 'Exonere (0%)', category: 'exempt' }
      ];
    case 'CM':
      return [
        { rate: 19.25, label: 'TVA standard (19.25%)', category: 'standard' },
        { rate: 0, label: 'Exonere (0%)', category: 'exempt' }
      ];
    case 'US':
      // US sales tax varies by state - return configured rate and 0
      const configuredRate = parseFloat(getParam(INVOICE_CONFIG.PARAM_KEYS.SALES_TAX_RATE)) || 0;
      const rates = [{ rate: 0, label: 'No tax (0%)', category: 'exempt' }];
      if (configuredRate > 0) {
        rates.unshift({ rate: configuredRate, label: `Sales tax (${configuredRate}%)`, category: 'standard' });
      }
      return rates;
    default:
      return [{ rate: 0, label: 'No tax', category: 'exempt' }];
  }
}

/**
 * Gets label for a VAT rate based on country
 * @param {number} rate - VAT rate
 * @param {string} country - Country code
 * @returns {string} Rate label
 */
function getVatRateLabel(rate, country) {
  const rates = getAvailableVatRatesForCountry(country);
  const found = rates.find(r => r.rate === rate);

  if (found) {
    return found.label;
  }

  // Default label
  switch (country) {
    case 'FR':
    case 'CM':
      return `TVA ${rate}%`;
    case 'US':
      return `Tax ${rate}%`;
    default:
      return `${rate}%`;
  }
}

/**
 * Validates a VAT rate for a country
 * @param {number} rate - VAT rate to validate
 * @param {string} country - Country code
 * @returns {Object} {isValid: boolean, message: string}
 */
function validateVatRateForCountry(rate, country) {
  const availableRates = getAvailableVatRatesForCountry(country);
  const validRates = availableRates.map(r => r.rate);

  if (validRates.includes(rate)) {
    return { isValid: true, message: '' };
  }

  // Allow custom rates for US (sales tax varies)
  if (country === 'US' && rate >= 0 && rate <= 15) {
    return { isValid: true, message: '' };
  }

  return {
    isValid: false,
    message: `Invalid VAT rate ${rate}% for ${country}. Valid rates: ${validRates.join(', ')}`
  };
}

// ============================================================================
// FORMATTING FUNCTIONS / FONCTIONS DE FORMATAGE
// ============================================================================

/**
 * Rounds amount according to country currency decimals
 * @param {number} amount - Amount to round
 * @param {string} country - Country code
 * @returns {number} Rounded amount
 */
function roundAmount(amount, country) {
  switch (country) {
    case 'CM':
      // FCFA has no decimals
      return Math.round(amount);
    case 'FR':
    case 'US':
    default:
      // EUR and USD have 2 decimals
      return Math.round(amount * 100) / 100;
  }
}

/**
 * Formats VAT summary for display in document
 * @param {Array} vatDetails - VAT details from calculateVatSummary
 * @param {string} country - Country code
 * @returns {string} Formatted VAT summary text
 */
function formatVatSummaryForDocument(vatDetails, country) {
  if (!vatDetails || vatDetails.length === 0) {
    return '';
  }

  const countryCode = country || getParam('COUNTRY') || 'FR';

  return vatDetails.map(v => {
    const formattedAmount = formatAmountForCountry(v.amount);
    const rateStr = v.rate % 1 === 0 ? v.rate.toString() : v.rate.toFixed(2);

    switch (countryCode) {
      case 'FR':
      case 'CM':
        return `TVA ${rateStr}%: ${formattedAmount}`;
      case 'US':
        return `Tax ${rateStr}%: ${formattedAmount}`;
      default:
        return `${rateStr}%: ${formattedAmount}`;
    }
  }).join('\n');
}

/**
 * Formats VAT summary as HTML table for forms
 * @param {Array} vatDetails - VAT details from calculateVatSummary
 * @param {string} country - Country code
 * @returns {string} HTML table string
 */
function formatVatSummaryAsHtml(vatDetails, country) {
  if (!vatDetails || vatDetails.length === 0) {
    return '<p>No tax applicable</p>';
  }

  const countryCode = country || 'FR';
  const taxLabel = countryCode === 'US' ? 'Tax' : 'TVA';

  let html = '<table class="vat-summary" style="width:100%;border-collapse:collapse;">';
  html += '<thead><tr>';
  html += `<th style="text-align:left;padding:4px;">${taxLabel}</th>`;
  html += '<th style="text-align:right;padding:4px;">Base</th>';
  html += '<th style="text-align:right;padding:4px;">Amount</th>';
  html += '</tr></thead><tbody>';

  vatDetails.forEach(v => {
    const rateStr = v.rate % 1 === 0 ? v.rate.toString() : v.rate.toFixed(2);
    html += '<tr>';
    html += `<td style="padding:4px;">${rateStr}%</td>`;
    html += `<td style="text-align:right;padding:4px;">${formatAmountForCountry(v.base)}</td>`;
    html += `<td style="text-align:right;padding:4px;">${formatAmountForCountry(v.amount)}</td>`;
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

// ============================================================================
// CAMEROON-SPECIFIC: TVA BREAKDOWN / DETAIL TVA CAMEROUN
// ============================================================================

/**
 * Breaks down Cameroon VAT into TVA and CAC components
 * Au Cameroun: TVA totale 19.25% = TVA 17.5% + CAC 1.75% (10% de la TVA)
 * @param {number} baseAmount - Amount before tax
 * @returns {Object} {tvaBase: number, tvaPure: number, cac: number, totalTva: number}
 */
function calculateCameroonVatBreakdown(baseAmount) {
  const TVA_RATE = 17.5;      // Taux TVA de base
  const CAC_RATE = 10;        // Centimes Additionnels Communaux (10% de la TVA)

  const tvaPure = baseAmount * (TVA_RATE / 100);
  const cac = tvaPure * (CAC_RATE / 100);
  const totalTva = tvaPure + cac;

  return {
    baseAmount: baseAmount,
    tvaRate: TVA_RATE,
    tvaPure: Math.round(tvaPure),  // No decimals in FCFA
    cacRate: CAC_RATE,
    cac: Math.round(cac),
    totalTvaRate: 19.25,
    totalTva: Math.round(totalTva),
    totalTTC: Math.round(baseAmount + totalTva)
  };
}

/**
 * Formats Cameroon VAT breakdown for display
 * @param {Object} breakdown - From calculateCameroonVatBreakdown
 * @returns {string} Formatted breakdown text
 */
function formatCameroonVatBreakdown(breakdown) {
  const lines = [];
  lines.push(`Base HT: ${formatAmountForCountry(breakdown.baseAmount)} FCFA`);
  lines.push(`TVA (${breakdown.tvaRate}%): ${formatAmountForCountry(breakdown.tvaPure)} FCFA`);
  lines.push(`CAC (${breakdown.cacRate}% TVA): ${formatAmountForCountry(breakdown.cac)} FCFA`);
  lines.push(`Total TVA (${breakdown.totalTvaRate}%): ${formatAmountForCountry(breakdown.totalTva)} FCFA`);
  lines.push(`Total TTC: ${formatAmountForCountry(breakdown.totalTTC)} FCFA`);
  return lines.join('\n');
}

// ============================================================================
// FRANCE-SPECIFIC: AUTO-ENTREPRENEUR / AUTO-ENTREPRENEUR FRANCE
// ============================================================================

/**
 * Checks if company is auto-entrepreneur (VAT exempt)
 * @returns {boolean} True if auto-entrepreneur
 */
function isAutoEntrepreneur() {
  const isAE = getParam(INVOICE_CONFIG.PARAM_KEYS.IS_AUTO_ENTREPRENEUR);
  return isAE === 'true' || isAE === true;
}

/**
 * Gets VAT exemption notice for auto-entrepreneurs
 * @returns {string} VAT exemption notice or empty string
 */
function getAutoEntrepreneurVatNotice() {
  if (isAutoEntrepreneur()) {
    return 'TVA non applicable, art. 293 B du CGI';
  }
  return '';
}

/**
 * Calculates totals for auto-entrepreneur (no VAT)
 * @param {Array} lines - Invoice lines
 * @returns {Object} Summary with 0 VAT
 */
function calculateAutoEntrepreneurTotals(lines) {
  let total = 0;

  const processedLines = lines.map((line, index) => {
    const quantity = parseFloat(line.quantity) || 0;
    const unitPrice = parseFloat(line.unitPrice) || 0;
    const lineTotal = quantity * unitPrice;
    total += lineTotal;

    return {
      index: index + 1,
      description: line.description || '',
      quantity: quantity,
      unitPrice: unitPrice,
      vatRate: 0,
      lineHT: Math.round(lineTotal * 100) / 100,
      vatAmount: 0,
      lineTTC: Math.round(lineTotal * 100) / 100
    };
  });

  return {
    subtotalHT: Math.round(total * 100) / 100,
    vatDetails: [],
    totalVat: 0,
    totalTTC: Math.round(total * 100) / 100,
    lines: processedLines,
    country: 'FR',
    isAutoEntrepreneur: true,
    vatNotice: getAutoEntrepreneurVatNotice()
  };
}

// ============================================================================
// INVOICE TOTALS CALCULATION / CALCUL TOTAUX FACTURE
// ============================================================================

/**
 * Calculates complete invoice totals with country-specific logic
 * @param {Array} lines - Invoice lines
 * @param {Object} options - {country, discount, depositPaid}
 * @returns {Object} Complete invoice totals
 */
function calculateInvoiceTotals(lines, options = {}) {
  const country = options.country || getParam('COUNTRY') || 'FR';
  const discount = parseFloat(options.discount) || 0;
  const depositPaid = parseFloat(options.depositPaid) || 0;

  // Check for auto-entrepreneur (France only)
  if (country === 'FR' && isAutoEntrepreneur()) {
    const totals = calculateAutoEntrepreneurTotals(lines);
    totals.discount = discount;
    totals.subtotalAfterDiscount = totals.subtotalHT - discount;
    totals.depositPaid = depositPaid;
    totals.balanceDue = totals.totalTTC - depositPaid;
    return totals;
  }

  // Standard VAT calculation
  const vatSummary = calculateVatSummary(lines, country);

  // Apply discount (on HT)
  const subtotalAfterDiscount = vatSummary.subtotalHT - discount;

  // Recalculate VAT if discount applied
  let adjustedTotalVat = vatSummary.totalVat;
  let adjustedTotalTTC = vatSummary.totalTTC;

  if (discount > 0 && vatSummary.subtotalHT > 0) {
    // Proportionally reduce VAT based on discount
    const discountRatio = subtotalAfterDiscount / vatSummary.subtotalHT;
    adjustedTotalVat = roundAmount(vatSummary.totalVat * discountRatio, country);
    adjustedTotalTTC = subtotalAfterDiscount + adjustedTotalVat;
  }

  // Calculate balance due
  const balanceDue = adjustedTotalTTC - depositPaid;

  return {
    ...vatSummary,
    discount: discount,
    subtotalAfterDiscount: roundAmount(subtotalAfterDiscount, country),
    adjustedTotalVat: adjustedTotalVat,
    adjustedTotalTTC: roundAmount(adjustedTotalTTC, country),
    depositPaid: depositPaid,
    balanceDue: roundAmount(balanceDue, country)
  };
}

// ============================================================================
// UTILITY FUNCTIONS / FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Creates a simple invoice line object
 * @param {string} description - Line description
 * @param {number} quantity - Quantity
 * @param {number} unitPrice - Unit price
 * @param {number} vatRate - VAT rate (optional)
 * @returns {Object} Invoice line object
 */
function createInvoiceLine(description, quantity, unitPrice, vatRate) {
  return {
    description: description,
    quantity: parseFloat(quantity) || 0,
    unitPrice: parseFloat(unitPrice) || 0,
    vatRate: vatRate !== undefined ? parseFloat(vatRate) : null
  };
}

/**
 * Parses invoice lines from sheet data
 * @param {Array} sheetData - 2D array of sheet data
 * @param {Object} columnMapping - Column index mapping
 * @returns {Array} Array of invoice line objects
 */
function parseInvoiceLinesFromSheet(sheetData, columnMapping) {
  const lines = [];

  sheetData.forEach(row => {
    if (row[columnMapping.description]) {
      lines.push({
        description: row[columnMapping.description],
        quantity: parseFloat(row[columnMapping.quantity]) || 1,
        unitPrice: parseFloat(row[columnMapping.unitPrice]) || 0,
        vatRate: row[columnMapping.vatRate] !== undefined ?
                 parseFloat(row[columnMapping.vatRate]) : null
      });
    }
  });

  return lines;
}
