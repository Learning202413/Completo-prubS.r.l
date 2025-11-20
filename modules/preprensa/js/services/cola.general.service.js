import { LocalDB } from './local.db.js';

// Helper para obtener fecha/hora local exacta
const getTimestamp = () => new Date().toLocaleString('es-PE', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', second: '2-digit', 
    hour12: true 
});

export const ColaGeneralService = {
    async getUnassignedTasks() {
        return new Promise(resolve => {
            const all = LocalDB.getAll();
            const pending = all.filter(t => t.estado === 'Orden creada');

            const viewData = pending.map(order => ({
                id: order.id,
                ot_id: order.ot_id,
                cliente: order.cliente_nombre,
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                fecha_creacion: order.fecha_creacion,
                estado: order.estado
            }));
            setTimeout(() => resolve(viewData), 200);
        });
    },

    async assignTaskToMe(id, userName = 'Diseñador 1') {
        return new Promise(resolve => {
            const now = getTimestamp();
            console.log(`[ColaGeneral] Asignando OT-${id} a las ${now}`);

            // GUARDAMOS FECHA EXACTA AL ASIGNAR
            const success = LocalDB.update(id, { 
                estado: 'Diseño Pendiente', 
                asignado_a: userName,
                fecha_asignacion: now,          // <--- REGISTRO DE TIEMPO
                ultima_actualizacion: now,      // <--- LOG GENÉRICO
                pasos_preprensa: { 1: false, 2: false, 3: false, 4: false },
                comentarios: []
            });
            setTimeout(() => resolve(success), 300);
        });
    }
};