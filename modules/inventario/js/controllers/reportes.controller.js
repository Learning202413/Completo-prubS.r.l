/**
 * js/controllers/reportes.controller.js
 * Controlador para la vista de reportes de inventario.
 */
import { ReportesService } from '../services/reportes.service.js';

export const ReportesController = {
    init: async function() {
        console.log("ReportesController (Inventario) inicializado.");
        await this.loadReports();
    },

    async loadReports() {
        // 1. Cargar estadísticas
        const invStats = await ReportesService.getInventoryStats();
        const purchStats = await ReportesService.getPurchaseStats();

        // 2. Actualizar Métricas en DOM
        this.setText('metric-idle-c', invStats.idleC);
        this.setText('metric-freq', purchStats.purchaseFrequency);
        this.setText('metric-cycle', `${purchStats.cycleTime} días`);

        // 3. Renderizar Tabla de Reposición
        this.renderReplenishmentTable(invStats.replenishmentList);
    },

    setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    },

    renderReplenishmentTable(list) {
        const tbody = document.getElementById('replenishment-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center py-4 text-green-600">¡Todo el stock está saludable!</td></tr>';
            return;
        }

        list.forEach(item => {
            const row = `
                <tr class="border-b hover:bg-red-50">
                    <td class="py-2 text-gray-800">
                        <div class="font-bold">${item.producto}</div>
                        <div class="text-xs text-gray-500 font-mono">${item.sku}</div>
                    </td>
                    <td class="py-2 font-bold text-red-600">
                        -${item.deficit} <span class="text-xs text-red-400 font-normal">unid.</span>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    }
};