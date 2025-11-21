/**
 * js/controllers/historial.orden.controller.js
 */
export const HistorialOrdenController = {
    init: function() {
        console.log("HistorialOrdenController inicializado. Configurando búsqueda de OT.");
        
        const searchButton = document.getElementById('btn-search-ot');
        if(searchButton) {
            searchButton.addEventListener('click', () => {
                const otInput = document.getElementById('search-ot-input');
                console.log(`Buscando trazabilidad para OT: ${otInput.value}`);
                // Lógica para cargar la línea de tiempo
            });
        }
    }
};