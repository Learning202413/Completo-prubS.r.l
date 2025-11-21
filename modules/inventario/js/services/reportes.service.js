/**
 * js/services/reportes.service.js
 * Servicio para generar datos de reportes de inventario y compras.
 */
import { getStorage } from '../../../admin/js/services/local.db.js';

const DB_KEY_ITEMS = 'inv_items';
const DB_KEY_OCS = 'inv_ocs';

export const ReportesService = {
    
    async getInventoryStats() {
        const products = getStorage(DB_KEY_ITEMS, []);
        
        // 1. Items Clase C "Ociosos" (Simulación: Stock > 0 y es Clase C)
        // En un sistema real revisaríamos historial de movimientos.
        const idleC = products.filter(p => p.abc === 'C' && parseInt(p.stock) > 0).length;

        // 2. Lista de Reposición (Stock <= Minimo)
        const replenishmentList = products
            .filter(p => parseInt(p.stock) <= parseInt(p.min))
            .map(p => ({
                producto: p.nombre,
                sku: p.sku,
                deficit: parseInt(p.min) - parseInt(p.stock),
                unidad: 'Unid.' // Default
            }));

        return { idleC, replenishmentList };
    },

    async getPurchaseStats() {
        const ocs = getStorage(DB_KEY_OCS, []);
        
        // 1. Frecuencia de Compra (Mes Actual)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const purchaseFrequency = ocs.filter(oc => {
            // Formato fecha esperado: "19/11/2025, 10:00:00" o similar
            // Intentamos parsear
            const parts = oc.fecha.split(','); 
            if(parts.length > 0) {
                const [day, month, year] = parts[0].trim().split('/');
                return parseInt(month) - 1 === currentMonth && parseInt(year) === currentYear;
            }
            return false;
        }).length;

        // 2. Tiempo de Ciclo de Compra (Promedio Días: Creación -> Recepción)
        const receivedOCs = ocs.filter(oc => oc.estado.includes('Recibida') && oc.fecha_recepcion);
        
        let totalDays = 0;
        let count = 0;

        receivedOCs.forEach(oc => {
            // Helper para parsear fechas locales tipo "dd/mm/yyyy, hh:mm:ss"
            const parseDate = (str) => {
                const [datePart, timePart] = str.split(',');
                const [day, month, year] = datePart.trim().split('/');
                return new Date(year, month - 1, day);
            };

            try {
                const start = parseDate(oc.fecha);
                const end = parseDate(oc.fecha_recepcion);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                totalDays += diffDays;
                count++;
            } catch (e) {
                console.warn("Error calculando fechas en reporte:", e);
            }
        });

        const cycleTime = count > 0 ? (totalDays / count).toFixed(1) : 0;

        return { purchaseFrequency, cycleTime };
    }
};