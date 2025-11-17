/**
 * js/controllers/cliente.detalle.controller.js
 * Controlador para la vista de detalle/edición de cliente.
 */
export const ClienteDetalleController = {
    init: function(params) {
        const clientId = params[0]; // El ID vendrá de la URL, ej: #/cliente-detalle/1
        console.log(`ClienteDetalleController (CRM) inicializado. ID: ${clientId || 'Nuevo'}`);

        // Lógica de Pestañas (Tabs)
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Ocultar todo
                tabButtons.forEach(btn => btn.classList.remove('tab-active', 'border-red-500', 'text-red-500')); // Ajustado para que coincida con el HTML
                tabContents.forEach(content => content.classList.add('hidden'));

                // Mostrar activo
                const tabId = e.currentTarget.dataset.tab;
                e.currentTarget.classList.add('tab-active', 'border-red-500', 'text-red-500');
                document.getElementById(`tab-${tabId}`).classList.remove('hidden');
            });
        });
        
        // Simular carga de datos si es edición
        if (clientId) {
            document.getElementById('client-header').textContent = `Detalle del Cliente: (ID: ${clientId})`;
            // Aquí iría la llamada: const data = await CrmService.getClient(clientId);
            // Y luego rellenar el formulario
        } else {
             document.getElementById('client-header').textContent = `Crear Nuevo Cliente`;
        }

        // Listener del formulario
        const clientForm = document.getElementById('client-form');
        clientForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("[ACCIÓN] Guardando cliente...");
            window.UI.showNotification('Éxito', 'Cliente guardado exitosamente (simulado).');
        });
    }
};