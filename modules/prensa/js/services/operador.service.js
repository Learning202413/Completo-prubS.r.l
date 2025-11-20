import { LocalDB } from './local.db.js';

const getTimestamp = () => new Date().toLocaleString('es-PE', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

export const OperadorService = {
    async getTaskById(id) {
        return new Promise(resolve => {
            const order = LocalDB.getById(id);
            if (!order) { resolve(null); return; }

            // Mapear datos para la terminal del operador
            const taskView = {
                id: order.id,
                ot_id: order.ot_id,
                cliente: order.cliente_nombre,
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                paper: order.items && order.items.length > 0 ? (order.items[0].specs || 'Según Hoja de Ruta') : 'N/A',
                estado_prensa: order.estado,
                // Logs de tiempos si existen
                tiempos: {
                    prep: order.fecha_inicio_prep,
                    print: order.fecha_inicio_print
                }
            };
            setTimeout(() => resolve(taskView), 100);
        });
    },

    async startPreparation(id) {
        const now = getTimestamp();
        return LocalDB.update(id, { 
            estado: 'En Preparación',
            fecha_inicio_prep: now,
            ultima_actualizacion: now
        });
    },

    async startPrinting(id) {
        const now = getTimestamp();
        return LocalDB.update(id, { 
            estado: 'Imprimiendo',
            fecha_inicio_print: now,
            ultima_actualizacion: now
        });
    },

    async reportIncident(id, details, type) {
        const now = getTimestamp();
        const order = LocalDB.getById(id);
        const incidencias = order.incidencias_prensa || [];
        incidencias.push({ fecha: now, tipo: type, detalle: details });
        
        return LocalDB.update(id, { incidencias_prensa: incidencias });
    },

    async finishJob(id, consumo, desperdicio) {
        const now = getTimestamp();
        // El estado 'En Post-Prensa' saca la tarea del módulo de Prensa
        return LocalDB.update(id, { 
            estado: 'En Post-Prensa',
            fecha_fin_prensa: now,
            consumo_papel: consumo,
            desperdicio_papel: desperdicio,
            ultima_actualizacion: now
        });
    }
};