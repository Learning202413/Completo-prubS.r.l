import { LocalDB } from './local.db.js'; 

const getTimestamp = () => new Date().toLocaleString('es-PE', { 
    hour12: true, 
    hour: '2-digit', minute: '2-digit', second: '2-digit', 
    day: '2-digit', month: '2-digit', year: 'numeric'
});

export const PostPrensaColaGeneralService = {
    async getIncomingTasks() {
        return new Promise(resolve => {
            const all = LocalDB.getAll();
            // Filtro: Estado 'En Post-Prensa' y sin asignar
            const incoming = all.filter(t => 
                t.estado === 'En Post-Prensa' && !t.asignado_postprensa
            );

            const viewData = incoming.map(order => ({
                id: order.id,
                ot_id: order.ot_id,
                cliente: order.cliente_nombre,
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                estacion: 'Acabados Generales', 
                estado: 'Nuevo' 
            }));

            setTimeout(() => resolve(viewData), 200);
        });
    },

    async assignTaskToMe(id, operatorName = 'Operador Acabados 1') {
        return new Promise(resolve => {
            const now = getTimestamp();
            // Al tomarla, pasa a 'Pendiente'
            const success = LocalDB.update(id, { 
                estado: 'Pendiente', 
                asignado_postprensa: operatorName,
                fecha_asignacion_postprensa: now,
                avance_postprensa: { paso1: false, paso2: false, paso3: false }
            });
            setTimeout(() => resolve(success), 300);
        });
    }
};