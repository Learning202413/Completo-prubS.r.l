/**
 * js/controllers/calidad.controller.js
 * Controlador para la vista de detalle de OT y control de calidad.
 */
export const CalidadController = {
    init: function(params) {
        const otId = params[0]; // ID de la OT desde la URL
        console.log(`CalidadController (Post-Prensa) inicializado. ID: ${otId}`);

        // Simular carga de datos
        if (otId) {
            document.getElementById('ot-header').textContent = `Control de Calidad: OT-${otId}`;
            // Simulación de carga de datos
            const mockData = {
                '1234': { cliente: 'Industrias Gráficas S.A.', producto: '1000 Revistas A4', specs: 'Corte (Guillotina), Barniz UV, Engrapado, Empaquetado x100.'},
                '1235': { cliente: 'Editorial Futuro EIRL', producto: '500 Libros Tapa Dura', specs: 'Encolado (Lomo), Tapa Dura, Empaquetado individual.'},
                '1230': { cliente: 'Cliente Particular', producto: '250 Tarjetas Personales', specs: 'Corte, Empaquetado.'},
            };
            const data = mockData[otId] || { cliente: 'Desconocido', producto: 'Desconocido', specs: 'N/A' };
            
            document.getElementById('client-name').textContent = data.cliente;
            document.getElementById('product-name').textContent = data.producto;
            document.getElementById('product-specs').textContent = data.specs;
        }

        // Listeners para los botones de acción
        document.getElementById('btn-step-1')?.addEventListener('click', () => {
             window.UI.showNotification('Estación Terminada', 'Simulación de registro de tiempo.');
        });
        
        document.getElementById('btn-reject-qc')?.addEventListener('click', () => {
            window.UI.showNotification('Reporte', 'Calidad Rechazada (simulado).');
        });

        document.getElementById('btn-approve-qc')?.addEventListener('click', () => {
            window.UI.showNotification('Reporte', 'Calidad Aprobada (simulado).');
            // Habilitar el botón final
            document.getElementById('btn-complete-order')?.removeAttribute('disabled');
        });

        document.getElementById('btn-complete-order')?.addEventListener('click', () => {
            if(document.getElementById('btn-complete-order').hasAttribute('disabled')) return;
            window.UI.showNotification('Orden Completada', 'La orden ha sido marcada como completada y lista para despacho (simulado).');
        });
    }
};