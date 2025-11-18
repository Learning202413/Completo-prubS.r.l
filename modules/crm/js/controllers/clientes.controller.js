/**
 * js/controllers/clientes.controller.js
 * Controlador para la vista de lista de clientes.
 */
export const ClientesController = {
    init: function() {
        console.log("ClientesController (CRM) inicializado.");
        
        const clientTable = document.getElementById('client-table-body');
        if (!clientTable) return;

        clientTable.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.btn-delete');
            if (deleteButton) {
                const clientId = deleteButton.dataset.clientId;
                const clientName = deleteButton.dataset.clientName;
                
                // Usar el UI helper para mostrar el modal de confirmación
                window.UI.showConfirmModal(
                    'Confirmar Eliminación',
                    `¿Estás seguro de que deseas eliminar a "${clientName}"? Esta acción es irreversible.`,
                    'Sí, Eliminar',
                    () => {
                        console.log(`[ACCIÓN] Eliminando cliente ${clientId}...`);
                        // Aquí iría la llamada al servicio: await CrmService.deleteClient(clientId)
                    }
                );
            }
        });
    }
};