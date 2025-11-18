/**
 * js/controllers/recepcion.controller.js
 * Controlador para la vista de recepción de OCs.
 */
export const RecepcionController = {
    init: function() {
        console.log("RecepcionController (Inventario) inicializado.");

        // Lógica del panel de filtros
        const filterButton = document.getElementById('filter-button');
        const filterPanel = document.getElementById('filter-panel');
        if (filterButton && filterPanel) {
            filterButton.onclick = () => filterPanel.classList.toggle('hidden');
        }

        // --- Lógica de Modales ---

        // Botón Recibir Mercancía (usando delegación)
        const tableBody = document.getElementById('oc-table-body');
        tableBody?.addEventListener('click', (e) => {
            if (e.target.closest('#btn-receive')) {
                console.log("Abriendo modal para recibir mercancía...");
                window.UI.showModal('receive-modal-container', 'receive-modal-content');
            }
        });
        
        // Listener para el formulario del modal
        const mainContent = document.getElementById('main-content');
        mainContent.addEventListener('submit', (e) => {
            if (e.target.id === 'receive-form') {
                e.preventDefault();
                console.log("Formulario 'Recibir Mercancía' enviado.");
                window.UI.hideModal('receive-modal-container');
                window.UI.showNotification('Éxito', 'Stock actualizado (simulado).');
            }
        });
    }
};