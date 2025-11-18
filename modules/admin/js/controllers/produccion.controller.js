/**
 * js/controllers/produccion_escalable.controller.js
 *
 * Controlador simplificado para manejar la Vista de Lista
 * y la asignación desde ella.
 */

/**
 * Abre el modal de asignación de OT.
 * @param {string} otId - El ID de la Orden de Trabajo (ej. "OT-1234").
 */
const openAssignModal = (otId) => {
    document.getElementById('assign-ot-id').value = otId;
    document.getElementById('assign-modal-title').textContent = `Asignar Tarea: ${otId}`;
    window.UI.showModal('assign-modal-container', 'assign-modal-content');
};

/**
 * Configura los botones "Asignar" en la Vista de Lista.
 */
const setupListAssignButtons = () => {
    const listBody = document.getElementById('list-table-body');
    if (!listBody) return;

    listBody.addEventListener('click', (e) => {
        const assignButton = e.target.closest('.btn-assign-from-list');
        if (assignButton && !assignButton.disabled) {
            const otId = assignButton.closest('tr').dataset.otId;
            openAssignModal(otId);
            console.log(`[Lista] Modal de asignación lanzado para OT: ${otId}.`);
        }
    });
};

export const ProductionController = {
    init: function() {
        console.log("ProductionController (Solo Lista) inicializado.");
        
        // 1. Configurar los botones "Asignar" en la Vista de Lista
        setupListAssignButtons();

        // 2. Listener del formulario del modal
        const modalContainer = document.getElementById('assign-modal-container');
        if(modalContainer) {
            modalContainer.addEventListener('submit', (e) => {
                if (e.target.id === 'assign-form') {
                    e.preventDefault();
                    
                    const otId = document.getElementById('assign-ot-id').value;
                    const resource = document.getElementById('assign-resource').value;
                    
                    console.log(`[ACCIÓN] Asignación de OT ${otId} confirmada. Recurso: ${resource}`);
                    
                    // Aquí iría la lógica para:
                    // 1. Actualizar la base de datos (Supabase)
                    // 2. Ocultar el modal
                    window.UI.hideModal('assign-modal-container');
                    // 3. Recargar los datos de la vista (para que la OT aparezca como "Asignada")
                    //    (Simulado por ahora)
                    
                    // Simulación de actualización de UI:
                    // En Vista Lista:
                    const row = document.querySelector(`#list-view tr[data-ot-id="${otId}"]`);
                    if (row) {
                        row.querySelector('td:nth-child(4) span').className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
                        row.querySelector('td:nth-child(4) span').textContent = 'En Diseño'; // o el estado apropiado
                        row.querySelector('td:nth-child(5)').textContent = resource;
                        row.querySelector('td:nth-child(5)').className = 'px-6 py-4 text-sm font-bold text-blue-600';
                        row.querySelector('.btn-assign-from-list').textContent = 'Asignada';
                        row.querySelector('.btn-assign-from-list').disabled = true;
                    }
                }
            });
        }
    }
};