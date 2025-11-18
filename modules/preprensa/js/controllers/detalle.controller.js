/**
 * js/controllers/detalle.controller.js
 * Controlador para la vista de detalle de OT (taller de diseño).
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

export const DetalleController = {
    init: function(params) {
        const otId = params[0]; // ID de la OT desde la URL
        console.log(`DetalleController (Pre-Prensa) inicializado. ID: ${otId}`);

        // Simular carga de datos
        if (otId) {
            document.getElementById('ot-header').textContent = `Taller de Diseño: OT-${otId}`;
            
            // Simulación de carga de datos
            const mockData = {
                '1234': { cliente: 'Industrias Gráficas S.A.', producto: '1000 Revistas A4', specs: 'Couche 150gr, Tinta Full Color, Acabado Barniz UV, Engrapado.'},
                '1235': { cliente: 'Editorial Futuro EIRL', producto: '500 Libros Tapa Dura', specs: 'Tapa Dura, Encolado, Barniz Sectorizado.'},
                '1230': { cliente: 'Cliente Particular', producto: '250 Tarjetas Personales', specs: 'Laminado Mate, Puntas redondeadas.'},
            };
            const data = mockData[otId] || { cliente: 'Desconocido', producto: 'Desconocido', specs: 'N/A' };
            
            // Poblar campos
            const clientEl = document.getElementById('client-name');
            const productEl = document.getElementById('product-name');
            const specsEl = document.getElementById('product-specs');

            if (clientEl) clientEl.textContent = data.cliente;
            if (productEl) productEl.textContent = data.producto;
            if (specsEl) specsEl.textContent = data.specs;
        }

        // --- INICIO: Lógica Secuencial Estricta ---

        const btnStep1 = document.getElementById('btn-step-1');
        const btnStep2 = document.getElementById('btn-step-2');
        const btnStep3 = document.getElementById('btn-step-3');
        const btnStep4 = document.getElementById('btn-step-4');
        const btnFinal = document.getElementById('btn-ready-for-press');

        // Paso 1: Ajuste de Archivos
        btnStep1?.addEventListener('click', () => {
            console.log("Paso 1: Ajuste de Archivos completado.");
            btnStep1.disabled = true;
            btnStep1.textContent = 'Terminado';
            completeStepIcon(1);
            document.getElementById('time-step-1').textContent = `Terminado: ${new Date().toLocaleTimeString()}`;
            
            // Habilitar Paso 2
            btnStep2?.removeAttribute('disabled');
        });

        // Paso 2: Reserva de Materiales
        // El 'onclick' en el HTML ya maneja el modal.
        // Asumimos que el modal es solo una simulación, así que habilitamos el paso 3 al hacer clic.
        btnStep2?.addEventListener('click', () => {
            console.log("Paso 2: Reserva de Materiales completado.");
            // (La lógica real de UI.showModal sigue en el HTML)
            btnStep2.disabled = true;
            completeStepIcon(2);
            document.getElementById('stock-status').textContent = '¡RESERVADO!';
            document.getElementById('stock-status').classList.remove('text-red-600');
            document.getElementById('stock-status').classList.add('text-green-600');
            
            // Habilitar Paso 3
            btnStep3?.removeAttribute('disabled');
        });


        // Paso 3: Aprobación de Cliente
        // Asumimos que el modal es solo una simulación.
        btnStep3?.addEventListener('click', () => {
            console.log("Paso 3: Aprobación de Cliente solicitada.");
            // (La lógica real de UI.showModal sigue en el HTML)
            btnStep3.disabled = true;
            completeStepIcon(3);

            // Habilitar Paso 4
            btnStep4?.removeAttribute('disabled');
        });

        // Paso 4: Generación de Placas
        btnStep4?.addEventListener('click', () => {
            console.log("Paso 4: Generación de Placas completado.");
            btnStep4.disabled = true;
            btnStep4.textContent = 'Terminado';
            completeStepIcon(4);
            
            // Habilitar Botón Final
            btnFinal?.removeAttribute('disabled');
        });
        
        // Botón Final
        btnFinal?.addEventListener('click', () => {
             console.log("ACCIÓN FINAL: Marcado como LISTO PARA PRENSA");
             window.UI.showNotification('Estado Actualizado', 'La OT ha sido enviada a la cola de Prensa.');
             // Aquí se redirigiría a la cola
             setTimeout(() => window.location.hash = '#/cola', 1500);
        });
    }
};