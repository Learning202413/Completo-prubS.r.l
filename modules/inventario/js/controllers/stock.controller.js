/**
 * js/controllers/stock.controller.js
 * Controlador para la vista de gestión de stock.
 */
export const StockController = {
    init: function() {
        console.log("StockController (Inventario) inicializado.");

        // Lógica del panel de filtros
        const filterButton = document.getElementById('filter-button');
        const filterPanel = document.getElementById('filter-panel');
        if (filterButton && filterPanel) {
            filterButton.onclick = () => filterPanel.classList.toggle('hidden');
        }

        // --- Lógica de Modales ---

        // Botón Agregar Producto
        document.getElementById('btn-add-item')?.addEventListener('click', () => {
            console.log("Abriendo modal para agregar item...");
            // Inyecta el contenido del modal (definido en stock.html) en el contenedor (definido en index.html)
            window.UI.showModal('item-modal-container', 'item-modal-content');
        });

        // Botón Crear OC
        document.getElementById('btn-create-oc')?.addEventListener('click', () => {
            console.log("Abriendo modal para crear OC...");
            window.UI.showModal('oc-modal-container', 'oc-modal-content');
        });

        // Listeners para los formularios dentro de los modales (usando delegación en main-content)
        const mainContent = document.getElementById('main-content');
        mainContent.addEventListener('submit', (e) => {
            if (e.target.id === 'item-form') {
                e.preventDefault();
                console.log("Formulario 'Agregar Producto' enviado.");
                window.UI.hideModal('item-modal-container');
                window.UI.showNotification('Éxito', 'Producto agregado (simulado).');
            }
            if (e.target.id === 'oc-form') {
                e.preventDefault();
                console.log("Formulario 'Crear OC' enviado.");
                window.UI.hideModal('oc-modal-container');
                window.UI.showNotification('Éxito', 'Orden de Compra creada (simulado).');
            }
        });
    }
};