/**
 * js/controllers/dashboard.controller.js
 * Controlador para la vista del dashboard (KPIs).
 */

// Simulación de una función que carga los datos de los KPIs
async function loadKpiData() {
    // En un caso real, esto haría una llamada a Supabase
    // const { data, error } = await supabase.rpc('get_crm_kpis');
    
    // Datos simulados
    return {
        totalQuotes: 8, // (3 Nuevas + 5 Negociación)
        totalOTs: 7, // (2 Aceptadas + 4 Producción + 1 Completada)
        inProduction: 6, // (2 Aceptadas + 4 En Producción)
        completedMonth: 1
    };
}


export const DashboardController = {
    init: function() {
        console.log("DashboardController (CRM) inicializado.");
        
        // 1. Cargar los datos de los KPIs
        loadKpiData().then(data => {
            const totalQuotesEl = document.getElementById('kpi-total-quotes');
            const totalOTsEl = document.getElementById('kpi-total-ots'); // Nueva tarjeta
            const inProductionEl = document.getElementById('kpi-in-production');
            const completedEl = document.getElementById('kpi-completed');

            if (totalQuotesEl) totalQuotesEl.textContent = data.totalQuotes;
            if (totalOTsEl) totalOTsEl.textContent = data.totalOTs; // Nueva tarjeta
            if (inProductionEl) inProductionEl.textContent = data.inProduction;
            if (completedEl) completedEl.textContent = data.completedMonth;
        });

        // 2. Lógica del Kanban eliminada.
    }
};