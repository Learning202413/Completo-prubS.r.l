/**
 * js/controllers/historial.global.controller.js
 */
import { dbBase } from '../services/local.db.js';

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
                // Input de fecha (A1: Estándar 40px - ya usa py-2 y p-2)
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
        this.loadLogTable(); // Nueva llamada a una función de carga
    },

    async loadLogTable() {
        const logs = await dbBase.getLogs(); // Usa dbBase para logs
        const tbody = document.getElementById('log-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        // Simulación de renderizado con los nuevos logs
        logs.slice(0, 10).forEach(log => { // Solo los 10 más recientes
            const row = `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-bold text-gray-900">${log.action.includes('USUARIO') ? 'Admin' : 'Sistema'}</td>
                    <td class="px-6 py-4 text-sm font-mono text-gray-500">${log.timestamp}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${log.action.includes('PROVEEDOR') ? 'SRM' : log.action.includes('USUARIO') ? 'Admin' : 'Producción'}</td>
                    <td class="px-6 py-4 text-sm font-bold text-blue-600">${log.action} (${log.details})</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
        
    }
};