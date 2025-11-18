/**
 * js/controllers/calidad.controller.js
 * Controlador para la vista de detalle de OT y control de calidad.
 */

// Helper para actualizar el icono de un paso
const completeStepIcon = (stepId) => {
    const iconEl = document.getElementById(`icon-step-${stepId}`);
    if (iconEl) {
        iconEl.classList.remove('bg-blue-200', 'bg-gray-200');
        iconEl.classList.add('bg-green-200');
        iconEl.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-green-700"></i>';
        if (window.lucide) window.lucide.createIcons();
    }
};

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

        // --- INICIO: Lógica Secuencial Estricta ---
        
        const btnStep1 = document.getElementById('btn-step-1');
        const btnStep2 = document.getElementById('btn-step-2');
        const btnStep3 = document.getElementById('btn-step-3');
        const btnRejectQC = document.getElementById('btn-reject-qc');
        const btnApproveQC = document.getElementById('btn-approve-qc');
        const btnCompleteOrder = document.getElementById('btn-complete-order');

        // Paso 1: Corte
        btnStep1?.addEventListener('click', () => {
             window.UI.showNotification('Estación Terminada', 'Paso 1: Corte completado.');
             btnStep1.disabled = true;
             btnStep1.textContent = 'Terminado';
             completeStepIcon(1);
             // Habilitar Paso 2
             btnStep2?.removeAttribute('disabled');
        });
        
        // Paso 2: Engrapado
        btnStep2?.addEventListener('click', () => {
             window.UI.showNotification('Estación Terminada', 'Paso 2: Engrapado completado.');
             btnStep2.disabled = true;
             btnStep2.textContent = 'Terminado';
             completeStepIcon(2);
             // Habilitar Paso 3
             btnStep3?.removeAttribute('disabled');
        });

        // Paso 3: Empaquetado
        btnStep3?.addEventListener('click', () => {
             window.UI.showNotification('Estación Terminada', 'Paso 3: Empaquetado completado.');
             btnStep3.disabled = true;
             btnStep3.textContent = 'Terminado';
             completeStepIcon(3);
             // Habilitar botones de QC
             btnRejectQC?.removeAttribute('disabled');
             btnApproveQC?.removeAttribute('disabled');
        });


        // Decisión de Calidad: Rechazar
        btnRejectQC?.addEventListener('click', () => {
            window.UI.showNotification('Reporte', 'Calidad Rechazada (simulado). La OT volverá a trabajo.');
            // (Lógica para reiniciar pasos o enviar a re-trabajo)
        });

        // Decisión de Calidad: Aprobar
        btnApproveQC?.addEventListener('click', () => {
            window.UI.showNotification('Reporte', 'Calidad Aprobada (simulado).');
            // Habilitar el botón final
            btnApproveQC.disabled = true;
            btnRejectQC.disabled = true;
            btnCompleteOrder?.removeAttribute('disabled');
        });

        // Botón Final: Completar Orden
        btnCompleteOrder?.addEventListener('click', () => {
            if(btnCompleteOrder.hasAttribute('disabled')) return;
            window.UI.showNotification('Orden Completada', 'La orden ha sido marcada como completada y lista para despacho (simulado).');
            // Redirigir a la cola
            setTimeout(() => window.location.hash = '#/cola', 1500);
        });
    }
};