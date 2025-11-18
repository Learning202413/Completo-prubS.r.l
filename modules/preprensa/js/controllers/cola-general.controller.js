/**
 * js/controllers/cola-general.controller.js
 * Controlador para la vista de cola general (Pull) de pre-prensa.
 */
export const ColaGeneralController = {
    init: function() {
        console.log("ColaGeneralController (Pre-Prensa) inicializado.");

        const tableBody = document.getElementById('tasks-table-body');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const takeButton = e.target.closest('.btn-take-task');
                if (takeButton) {
                    const row = takeButton.closest('tr');
                    const otId = row.dataset.otId;
                    console.log(`[ACCIÓN PULL] Usuario tomando OT: ${otId}`);
                    
                    // Aquí iría la lógica de Supabase para:
                    // 1. Asignar esta OT al usuario actual.
                    // 2. Moverla de la cola general a la cola "Mis Tareas".

                    // Simulación en UI:
                    takeButton.textContent = 'Tomada';
                    takeButton.disabled = true;
                    row.classList.add('opacity-50');
                    
                    window.UI.showNotification('Tarea Tomada', `La OT-${otId} ha sido asignada a tu cola "Mis Tareas".`);
                }
            });
        }
    }
};