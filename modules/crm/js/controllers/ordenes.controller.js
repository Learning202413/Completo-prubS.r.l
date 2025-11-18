/**
 * js/controllers/ordenes.controller.js
 * Controlador para la vista de lista de órdenes/cotizaciones.
 */
export const OrdenesController = {
    init: function() {
        console.log("OrdenesController (CRM) inicializado.");

        // Lógica del panel de filtros
        const filterButton = document.getElementById('filter-button');
        const filterPanel = document.getElementById('filter-panel');
        if (filterButton && filterPanel) {
            filterButton.onclick = () => filterPanel.classList.toggle('hidden');
        }

        // --- INICIO: NUEVA LÓGICA DE PESTAÑAS ---
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Ocultar todo
                tabButtons.forEach(btn => btn.classList.remove('tab-active', 'border-red-500', 'text-red-500'));
                tabContents.forEach(content => content.classList.add('hidden'));

                // Mostrar activo
                const tabId = e.currentTarget.dataset.tab;
                e.currentTarget.classList.add('tab-active', 'border-red-500', 'text-red-500');
                const activeTabContent = document.getElementById(`tab-${tabId}`);
                if (activeTabContent) {
                    activeTabContent.classList.remove('hidden');
                }
                
                // (En una app real, aquí se llamaría a una función
                // para recargar la tabla con los datos de la pestaña seleccionada)
                console.log(`Cargando pestaña: ${tabId}`);
            });
        });
        // --- FIN: NUEVA LÓGICA DE PESTAÑAS ---


        // Aquí iría la lógica para cargar las órdenes desde un servicio
    }
};