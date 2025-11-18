/**
 * js/controllers/historial.global.controller.js
 */
export const HistorialGlobalController = {
    init: function() {
        console.log("HistorialGlobalController inicializado. Configurando filtros.");
        
        const filterButton = document.getElementById('filter-button');
        const filterPanel = document.getElementById('filter-panel');
        if (filterButton && filterPanel) {
            filterButton.onclick = () => filterPanel.classList.toggle('hidden');
        }
        
      
        
        // =======================================================
        // LÓGICA 2: Inicialización de Flatpickr (Almanaque bonito)
        // Esto convierte el input de texto en un selector de rango
        // visual e interactivo para cumplir con los requisitos.
        // =======================================================
        
        const dateRangeInput = document.getElementById('filter-date-range');
        if (dateRangeInput && window.flatpickr) {
            window.flatpickr(dateRangeInput, {
                mode: "range",              // Permite seleccionar un rango (o un solo día)
                dateFormat: "d/m/Y",        // Formato visible: 16/11/2025
                locale: "es",               // Usa el idioma español
                altInput: true,             // Usa un input más limpio
                altFormat: "d/m/Y",         // Formato para el altInput
                placeholder: "Selecciona un día o rango...",
                // Aseguramos que el calendario aparezca en la parte superior del resto del contenido
                position: "auto",
                // Configuración para el click en el icono (si lo tuviera, Flatpickr ya lo maneja)
            });
        }


        // Lógica para cargar y filtrar el log global (usando tu tabla historial_cambios)
        // Nota: La función 'apply-filters' ahora leerá el rango de fechas del input de Flatpickr.
    }
};