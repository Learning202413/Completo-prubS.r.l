/**
 * js/controllers/facturacion.controller.js
 * Controlador para la vista de lista de documentos fiscales.
 */
export const FacturacionController = {
    init: function() {
        console.log("FacturacionController (CRM) inicializado.");

        // Lógica del panel de filtros
        const filterButton = document.getElementById('filter-button');
        const filterPanel = document.getElementById('filter-panel');
        if (filterButton && filterPanel) {
            filterButton.onclick = () => filterPanel.classList.toggle('hidden');
        }
    }
};