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

export const ColaGeneralService = {
    async getIncomingTasks() {
        return new Promise(resolve => {
            const all = LocalDB.getAll();
            
            // Filtramos las que vienen de Pre-Prensa
            const incoming = all.filter(t => 
                t.estado === 'En prensa' && !t.asignado_prensa
            );

            const viewData = incoming.map(order => ({
                id: order.id,
                ot_id: order.ot_id,
                cliente: order.cliente_nombre,
                maquina: 'Offset-A',
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                estado: 'Nuevo' // <--- CAMBIO: Etiqueta visual solicitada
            }));

            setTimeout(() => resolve(viewData), 200);
        });
    },

    async assignTaskToMe(id, operatorName = 'Operador 1') {
        return new Promise(resolve => {
            const now = getTimestamp();
            const success = LocalDB.update(id, { 
                estado: 'Asignada a Prensa',
                asignado_prensa: operatorName,
                fecha_asignacion_prensa: now,
                ultima_actualizacion: now
            });
            setTimeout(() => resolve(success), 300);
        });
    }
};