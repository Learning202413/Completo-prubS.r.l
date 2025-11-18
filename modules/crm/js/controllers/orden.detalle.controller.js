/**
 * js/controllers/orden.detalle.controller.js
 * Controlador para la vista de detalle/edición de cotización/orden.
 */
export const OrdenDetalleController = {
    init: function(params) {
        const orderId = params[0]; // El ID vendrá de la URL, ej: #/orden-detalle/123
        console.log(`OrdenDetalleController (CRM) inicializado. ID: ${orderId || 'Nueva'}`);

        // --- INICIO: Lógica de visibilidad de botones ---
        const quoteActions = document.getElementById('quote-actions');
        const otActions = document.getElementById('ot-actions'); // Contenedor padre de Convertir y Facturar
        const btnConvertOT = document.getElementById('btn-convert-ot');
        const btnGenerateInvoice = document.getElementById('btn-generate-invoice');

        // --- Simulación de Base de Datos de Estados ---
        // (Para simular lo que vendría de la BD)
        const mockOrderStates = {
            'B4A5C6D7': 'En Negociación', // La cotización "ojo" de la lista
            '1234': 'En Producción',       // La OT de la lista
            'C1A2B3D4': 'Rechazada',      // La cotización rechazada de la lista
            'OT-5000': 'Completada'      // NUEVA: La OT terminada que pediste
        };
        // --- Fin Simulación ---


        if (orderId) {
             // Es una Orden de Trabajo (OT) o Cotización guardada
             document.getElementById('order-header').textContent = `Detalle: ${orderId}`;
             
             // *** INICIO DE LA CORRECCIÓN ***
             
             // 1. Determinar el estado REAL basado en el ID de la URL (simulado)
             const otStatus = mockOrderStates[orderId] || 'En Negociación'; // Default
             
             console.log(`Estado de la orden ${orderId}: ${otStatus}`);

             // 2. Aplicar la lógica de botones basada en el estado
             
             if (otStatus === 'Rechazada') {
                // LÓGICA: Si está rechazada, ocultar AMBOS grupos de botones
                if (quoteActions) quoteActions.classList.add('hidden');
                if (otActions) otActions.classList.add('hidden');

             } else if (otStatus === 'En Producción' || otStatus === 'Completada') {
                // LÓGICA: Es una OT (En Prod o Completada)
                if (quoteActions) quoteActions.classList.add('hidden');
                if (btnConvertOT) btnConvertOT.classList.add('hidden');
                if (btnGenerateInvoice) btnGenerateInvoice.classList.remove('hidden');

                if (otStatus === 'Completada') {
                    // Habilitar el botón si la OT está completada
                    if (btnGenerateInvoice) btnGenerateInvoice.removeAttribute('disabled');
                } else {
                    // Dejarlo deshabilitado si está 'En Producción'
                    if (btnGenerateInvoice) btnGenerateInvoice.setAttribute('disabled', 'true');
                }
             } else if (otStatus === 'En Negociación') {
                // LÓGICA: Es una cotización existente. Mostrar botones de cotización.
                if (btnGenerateInvoice) btnGenerateInvoice.classList.add('hidden');
                // quoteActions y btnConvertOT ya están visibles por defecto.
             }
             // *** FIN DE LA CORRECCIÓN ***
             
        } else {
             // Es una 'Nueva Cotización'
             document.getElementById('order-header').textContent = `Crear Nueva Cotización`;
             if (btnGenerateInvoice) btnGenerateInvoice.classList.add('hidden');
        }
        // --- FIN: Lógica de visibilidad de botones ---


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
             
             // Aquí se actualizaría el estado y se enviaría al backend
             window.UI.showNotification('Éxito', 'Orden de Trabajo (OT) creada y enviada a producción.');
             
             // Simular redirección de vuelta a la lista de órdenes
             // El usuario vería la OT en la nueva pestaña "Órdenes de Trabajo"
             setTimeout(() => {
                window.location.hash = '#/ordenes';
             }, 1500);
        });
        
        // NUEVO: Listener para "Rechazar Cotización"
        document.getElementById('btn-reject-quote')?.addEventListener('click', () => {
             console.log("[ACCIÓN] Rechazando cotización...");
             
             window.UI.showNotification('Archivado', 'Cotización marcada como rechazada.');
             
             // Simular redirección de vuelta a la lista de órdenes
             // El usuario vería la cotización en la nueva pestaña "Rechazadas"
             setTimeout(() => {
                window.location.hash = '#/ordenes';
             }, 1500);
        });


        // Listener para "Generar Documento Fiscal"
        document.getElementById('btn-generate-invoice')?.addEventListener('click', (e) => {
             if (e.currentTarget.hasAttribute('disabled')) {
                console.log("Botón de facturar deshabilitado. La OT no está completa.");
                return; // No hacer nada si está deshabilitado
             }

             console.log("[ACCIÓN] Abriendo modal de facturación...");
             // Inyecta el contenido del modal en el contenedor
             window.UI.showModal('invoice-modal-container', 'invoice-modal-content');
        });

        // Nota: La lógica para agregar/eliminar líneas de producto iría aquí.
    }
};