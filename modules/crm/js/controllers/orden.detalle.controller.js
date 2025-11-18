/**
 * js/controllers/orden.detalle.controller.js
 * Controlador para la vista de detalle/edición de cotización/orden.
 */
export const OrdenDetalleController = {
    init: function(params) {
        const orderId = params[0]; // El ID vendrá de la URL, ej: #/orden-detalle/123
        console.log(`OrdenDetalleController (CRM) inicializado. ID: ${orderId || 'Nueva'}`);

        if (orderId) {
             document.getElementById('order-header').textContent = `Detalle: OT-${orderId}`;
             // Aquí se cargarían los datos de la OT
        } else {
             document.getElementById('order-header').textContent = `Crear Nueva Cotización`;
        }

        // Listener del formulario
        const orderForm = document.getElementById('order-form');
        orderForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("[ACCIÓN] Guardando cotización...");
            window.UI.showNotification('Éxito', 'Cotización guardada exitosamente (simulado).');
        });

        // Listener para "Convertir a OT"
        document.getElementById('btn-convert-ot')?.addEventListener('click', () => {
             console.log("[ACCIÓN] Convirtiendo a OT...");
             window.UI.showNotification('Éxito', 'Orden de Trabajo (OT) creada y enviada a producción.');
             // Aquí se actualizaría el estado y se enviaría al backend
        });

        // Listener para "Generar Documento Fiscal"
        document.getElementById('btn-generate-invoice')?.addEventListener('click', () => {
             console.log("[ACCIÓN] Abriendo modal de facturación...");
             // Inyecta el contenido del modal en el contenedor
             window.UI.showModal('invoice-modal-container', 'invoice-modal-content');
        });

        // Nota: La lógica para agregar/eliminar líneas de producto iría aquí.
    }
};