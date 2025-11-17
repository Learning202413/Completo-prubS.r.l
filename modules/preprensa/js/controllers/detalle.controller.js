/**
 * js/controllers/detalle.controller.js
 * Controlador para la vista de detalle de OT (taller de diseño).
 */
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

        // Los botones 'onclick' ya están manejados por las funciones globales
        // expuestas en preprensa.ui.js (showModal), por lo que no se necesita
        // agregar listeners aquí para esos botones específicos.
    }
};