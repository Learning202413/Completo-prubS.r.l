/**
 * js/controllers/operador.controller.js
 * Controlador para la vista del terminal del operador de prensa.
 */
export const OperadorController = {
    init: function(params) {
        const otId = params[0]; // ID de la OT desde la URL
        console.log(`OperadorController (Prensa) inicializado. ID: ${otId}`);

        // Simular carga de datos
        if (otId) {
            document.getElementById('ot-header').textContent = `Terminal: OT-${otId}`;
            document.getElementById('actions-header').textContent = `Acciones de Producción (OT-${otId})`;
            
            // Simulación de carga de datos
            const mockData = {
                '1234': { cliente: 'Industrias Gráficas S.A.', producto: '1000 Revistas A4', paper: 'Couche 150gr', inks: 'Full Color (CMYK)'},
                '1235': { cliente: 'Editorial Futuro EIRL', producto: '500 Libros Tapa Dura', paper: 'Bond 90gr (int)', inks: 'BN (int), CMYK (tapa)'},
            };
            const data = mockData[otId] || { cliente: 'Desconocido', producto: 'Desconocido', paper: 'N/A', inks: 'N/A' };
            
            document.getElementById('task-ot-id').textContent = `OT-${otId}`;
            document.getElementById('task-client').textContent = data.cliente;
            document.getElementById('task-product').textContent = data.producto;
            document.getElementById('task-paper').textContent = data.paper;
            document.getElementById('task-inks').textContent = data.inks;

            // Actualizar título del modal de finalización
            const finishModalDef = document.getElementById('finish-modal-content');
            if (finishModalDef) {
                const titleEl = finishModalDef.querySelector('h3');
                if (titleEl) titleEl.textContent = `Finalizar Tarea: OT-${otId}`;
            }
        }

        // Listeners para los botones de acción principal
        document.getElementById('btn-start-prep')?.addEventListener('click', (e) => {
             console.log("Iniciando preparación...");
             window.UI.showNotification('Preparación Iniciada', `Se ha registrado el inicio de preparación para OT-${otId}.`);
             e.currentTarget.disabled = true;
             document.getElementById('btn-start-print')?.removeAttribute('disabled');
        });
        
        document.getElementById('btn-start-print')?.addEventListener('click', (e) => {
             if(e.currentTarget.hasAttribute('disabled')) return;
             console.log("Iniciando impresión...");
             window.UI.showNotification('Impresión Iniciada', `Se ha registrado el inicio de impresión para OT-${otId}.`);
             e.currentTarget.disabled = true;
             document.getElementById('btn-finish-job')?.removeAttribute('disabled');
        });

        // Listeners para los formularios de los modales (usando delegación)
        const mainContent = document.getElementById('main-content');
        
        mainContent.addEventListener('submit', (e) => {
            if (e.target.id === 'incident-form') {
                e.preventDefault();
                const details = e.target.querySelector('#incident-details').value;
                console.log(`[INCIDENCIA] ${details}`);
                window.UI.hideModal('incident-modal-container');
                window.UI.showNotification('Reporte Enviado', 'Se ha guardado la incidencia (simulado).');
            }
            
            if (e.target.id === 'finish-form') {
                e.preventDefault();
                const consumo = e.target.querySelector('#consumo-real').value;
                const desperdicio = e.target.querySelector('#desperdicio').value;
                console.log(`[CONSUMO] Real: ${consumo}, Desperdicio: ${desperdicio}`);
                window.UI.hideModal('finish-modal-container');
                window.UI.showNotification('Tarea Finalizada', `OT-${otId} enviada a Post-Prensa (simulado).`);
                
                // Redirigir de vuelta a la cola
                window.location.hash = '#/cola';
            }
        });
    }
};