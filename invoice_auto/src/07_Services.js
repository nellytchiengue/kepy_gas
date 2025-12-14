/**
 * @file 07_Services.js
 * @description Gestion du catalogue des produits/services
 *              Services/Products catalog management
 * @version 1.0
 * @date 2025-12-13
 */

// ============================================================================
// RÉCUPÉRATION DES SERVICES
// ============================================================================

/**
 * Récupère tous les services actifs du catalogue
 * @returns {Array} Liste des services
 */
function getAllServices() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const servicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SERVICES);
    
    if (!servicesSheet) {
      logError('getAllServices', 'Feuille Services introuvable');
      return [];
    }
    
    const data = servicesSheet.getDataRange().getValues();
    const services = [];
    
    // Parcourir les lignes (en sautant l'en-tête)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const serviceName = row[INVOICE_CONFIG.SERVICE_COLUMNS.SERVICE_NAME];
      
      // Vérifier que le service a un nom et est actif
      if (serviceName) {
        const isActive = row[INVOICE_CONFIG.SERVICE_COLUMNS.ACTIVE];
        // Considérer actif si: TRUE, true, "TRUE", "true", 1, "1", ou vide (par défaut actif)
        const active = isActive === true || isActive === 'TRUE' || isActive === 'true' || 
                       isActive === 1 || isActive === '1' || isActive === '' || isActive === undefined;
        
        if (active) {
          services.push({
            id: row[INVOICE_CONFIG.SERVICE_COLUMNS.SERVICE_ID] || '',
            name: serviceName || '',
            description: row[INVOICE_CONFIG.SERVICE_COLUMNS.DESCRIPTION] || '',
            defaultPrice: Number(row[INVOICE_CONFIG.SERVICE_COLUMNS.DEFAULT_PRICE]) || 0,
            category: row[INVOICE_CONFIG.SERVICE_COLUMNS.CATEGORY] || '',
            active: true
          });
        }
      }
    }
    
    logSuccess('getAllServices', services.length + ' service(s) récupéré(s)');
    return services;
    
  } catch (error) {
    logError('getAllServices', 'Erreur lors de la récupération', error);
    return [];
  }
}

/**
 * Récupère un service par son nom
 * @param {string} serviceName - Nom du service
 * @returns {Object|null} Service trouvé ou null
 */
function getServiceByName(serviceName) {
  const services = getAllServices();
  return services.find(s => s.name === serviceName) || null;
}

/**
 * Récupère un service par son ID
 * @param {string} serviceId - ID du service (ex: SRV-001)
 * @returns {Object|null} Service trouvé ou null
 */
function getServiceById(serviceId) {
  const services = getAllServices();
  return services.find(s => s.id === serviceId) || null;
}

/**
 * Récupère les services par catégorie
 * @param {string} category - Nom de la catégorie
 * @returns {Array} Liste des services de cette catégorie
 */
function getServicesByCategory(category) {
  const services = getAllServices();
  return services.filter(s => s.category === category);
}

/**
 * Récupère toutes les catégories uniques
 * @returns {Array} Liste des catégories
 */
function getAllServiceCategories() {
  const services = getAllServices();
  const categories = [...new Set(services.map(s => s.category).filter(c => c))];
  return categories.sort();
}

// ============================================================================
// GÉNÉRATION D'ID
// ============================================================================

/**
 * Génère le prochain ID de service
 * @returns {string} Nouvel ID (ex: SRV-004)
 */
function generateNextServiceId() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const servicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SERVICES);
    
    if (!servicesSheet) return 'SRV-001';
    
    const data = servicesSheet.getDataRange().getValues();
    let maxNumber = 0;
    
    for (let i = 1; i < data.length; i++) {
      const match = String(data[i][0]).match(/SRV-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNumber) maxNumber = num;
      }
    }
    
    return 'SRV-' + String(maxNumber + 1).padStart(3, '0');
    
  } catch (error) {
    logError('generateNextServiceId', 'Erreur', error);
    return 'SRV-' + Date.now();
  }
}

// ============================================================================
// CRÉATION DE SERVICES
// ============================================================================

/**
 * Crée un nouveau service dans le catalogue
 * @param {Object} serviceData - Données du service
 * @returns {Object} Résultat {success, serviceId, message}
 */
function createNewService(serviceData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let servicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SERVICES);
    
    // Créer la feuille si elle n'existe pas
    if (!servicesSheet) {
      servicesSheet = createServicesSheet();
    }
    
    // Vérifier si le service existe déjà
    const existingService = getServiceByName(serviceData.name);
    if (existingService) {
      return { 
        success: false, 
        message: 'Un service avec ce nom existe déjà' 
      };
    }
    
    // Générer l'ID
    const serviceId = generateNextServiceId();
    
    // Préparer la nouvelle ligne
    const newRow = [
      serviceId,
      serviceData.name,
      serviceData.description || '',
      serviceData.defaultPrice || 0,
      serviceData.category || '',
      true  // Active par défaut
    ];
    
    // Ajouter la ligne
    servicesSheet.appendRow(newRow);
    
    logSuccess('createNewService', 'Service ' + serviceId + ' créé: ' + serviceData.name);
    
    return {
      success: true,
      serviceId: serviceId,
      serviceInfo: {
        id: serviceId,
        name: serviceData.name,
        description: serviceData.description || '',
        defaultPrice: serviceData.defaultPrice || 0,
        category: serviceData.category || '',
        active: true
      }
    };
    
  } catch (error) {
    logError('createNewService', 'Erreur lors de la création', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

/**
 * Crée la feuille Services avec les en-têtes
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} La feuille créée
 */
function createServicesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const servicesSheet = ss.insertSheet(INVOICE_CONFIG.SHEETS.SERVICES);
  
  // Définir les en-têtes
  const headers = ['ServiceID', 'ServiceName', 'Description', 'DefaultPrice', 'Category', 'Active'];
  
  servicesSheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold')
    .setBackground('#9b59b6')  // Violet pour différencier
    .setFontColor('#FFFFFF');
  
  // Ajuster la largeur des colonnes
  servicesSheet.setColumnWidth(1, 100);  // ServiceID
  servicesSheet.setColumnWidth(2, 200);  // ServiceName
  servicesSheet.setColumnWidth(3, 300);  // Description
  servicesSheet.setColumnWidth(4, 120);  // DefaultPrice
  servicesSheet.setColumnWidth(5, 150);  // Category
  servicesSheet.setColumnWidth(6, 80);   // Active
  
  // Ajouter quelques services exemples
  const sampleServices = [
    ['SRV-001', 'Consultation', 'Consultation stratégique (1 heure)', 150, 'Conseil', true],
    ['SRV-002', 'Développement Web', 'Création de site web personnalisé', 500, 'Développement', true],
    ['SRV-003', 'Formation', 'Formation personnalisée (journée)', 800, 'Formation', true],
    ['SRV-004', 'Maintenance', 'Maintenance mensuelle', 200, 'Support', true],
    ['SRV-005', 'Design Graphique', 'Création logo et charte graphique', 350, 'Design', true]
  ];
  
  servicesSheet.getRange(2, 1, sampleServices.length, sampleServices[0].length)
    .setValues(sampleServices);
  
  // Formater la colonne prix
  servicesSheet.getRange(2, 4, sampleServices.length, 1)
    .setNumberFormat('#,##0.00');
  
  logSuccess('createServicesSheet', 'Feuille Services créée avec ' + sampleServices.length + ' exemples');
  
  return servicesSheet;
}

// ============================================================================
// MISE À JOUR DE SERVICES
// ============================================================================

/**
 * Met à jour un service existant
 * @param {string} serviceId - ID du service à modifier
 * @param {Object} updateData - Données à mettre à jour
 * @returns {Object} Résultat {success, message}
 */
function updateService(serviceId, updateData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const servicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SERVICES);
    
    if (!servicesSheet) {
      return { success: false, message: 'Feuille Services introuvable' };
    }
    
    const data = servicesSheet.getDataRange().getValues();
    
    // Trouver la ligne du service
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][INVOICE_CONFIG.SERVICE_COLUMNS.SERVICE_ID]).trim() === serviceId) {
        const rowNumber = i + 1;
        
        // Mettre à jour les champs fournis
        if (updateData.name !== undefined) {
          servicesSheet.getRange(rowNumber, INVOICE_CONFIG.SERVICE_COLUMNS.SERVICE_NAME + 1)
            .setValue(updateData.name);
        }
        if (updateData.description !== undefined) {
          servicesSheet.getRange(rowNumber, INVOICE_CONFIG.SERVICE_COLUMNS.DESCRIPTION + 1)
            .setValue(updateData.description);
        }
        if (updateData.defaultPrice !== undefined) {
          servicesSheet.getRange(rowNumber, INVOICE_CONFIG.SERVICE_COLUMNS.DEFAULT_PRICE + 1)
            .setValue(updateData.defaultPrice);
        }
        if (updateData.category !== undefined) {
          servicesSheet.getRange(rowNumber, INVOICE_CONFIG.SERVICE_COLUMNS.CATEGORY + 1)
            .setValue(updateData.category);
        }
        if (updateData.active !== undefined) {
          servicesSheet.getRange(rowNumber, INVOICE_CONFIG.SERVICE_COLUMNS.ACTIVE + 1)
            .setValue(updateData.active);
        }
        
        logSuccess('updateService', 'Service ' + serviceId + ' mis à jour');
        return { success: true, message: 'Service mis à jour' };
      }
    }
    
    return { success: false, message: 'Service non trouvé' };
    
  } catch (error) {
    logError('updateService', 'Erreur lors de la mise à jour', error);
    return { success: false, message: error.message };
  }
}

/**
 * Désactive un service (soft delete)
 * @param {string} serviceId - ID du service
 * @returns {Object} Résultat {success, message}
 */
function deactivateService(serviceId) {
  return updateService(serviceId, { active: false });
}

/**
 * Réactive un service
 * @param {string} serviceId - ID du service
 * @returns {Object} Résultat {success, message}
 */
function activateService(serviceId) {
  return updateService(serviceId, { active: true });
}

// ============================================================================
// STATISTIQUES DES SERVICES
// ============================================================================

/**
 * Récupère les statistiques d'utilisation des services
 * @returns {Object} Statistiques
 */
function getServiceStatistics() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const servicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SERVICES);
    const invoicesSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.INVOICES);
    
    if (!servicesSheet) {
      return { total: 0, active: 0, categories: 0, mostUsed: null };
    }
    
    const services = getAllServices();
    const categories = getAllServiceCategories();
    
    // Compter l'utilisation dans les factures
    let serviceUsage = {};
    
    if (invoicesSheet) {
      const invoiceData = invoicesSheet.getDataRange().getValues();
      
      for (let i = 1; i < invoiceData.length; i++) {
        const description = String(invoiceData[i][INVOICE_CONFIG.COLUMNS.DESCRIPTION]).trim();
        
        // Chercher si la description correspond à un service
        for (const service of services) {
          if (description.includes(service.name) || description === service.description) {
            serviceUsage[service.name] = (serviceUsage[service.name] || 0) + 1;
          }
        }
      }
    }
    
    // Trouver le service le plus utilisé
    let mostUsed = null;
    let maxUsage = 0;
    
    for (const [name, count] of Object.entries(serviceUsage)) {
      if (count > maxUsage) {
        maxUsage = count;
        mostUsed = { name, count };
      }
    }
    
    return {
      total: services.length,
      active: services.filter(s => s.active).length,
      categories: categories.length,
      mostUsed: mostUsed,
      usage: serviceUsage
    };
    
  } catch (error) {
    logError('getServiceStatistics', 'Erreur', error);
    return { total: 0, active: 0, categories: 0, mostUsed: null };
  }
}

// ============================================================================
// INITIALISATION
// ============================================================================

/**
 * Initialise la feuille Services si elle n'existe pas
 * Appelé depuis le Setup Wizard ou manuellement
 */
function initializeServicesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const existingSheet = ss.getSheetByName(INVOICE_CONFIG.SHEETS.SERVICES);
  
  if (!existingSheet) {
    createServicesSheet();
    return { success: true, message: 'Feuille Services créée avec succès' };
  }
  
  return { success: true, message: 'Feuille Services existe déjà' };
}