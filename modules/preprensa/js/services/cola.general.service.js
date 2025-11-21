import { LocalDB } from './local.db.js';

const getCurrentUser = () => {
    const session = localStorage.getItem('erp_session');
    return session ? JSON.parse(session) : { id: 'anon', name: 'Anónimo' };
};

export const ColaGeneralService = {
    async getUnassignedTasks() {
        return new Promise(resolve => {
            const all = LocalDB.getAll();
            const pending = all.filter(t => t.estado === 'Orden creada');

            const viewData = pending.map(order => ({
                id: order.id, ot_id: order.ot_id, cliente: order.cliente_nombre,
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                fecha_creacion: order.fecha_creacion, estado: order.estado
            }));
            setTimeout(() => resolve(viewData), 200);
        });
    },

    async assignTaskToMe(id) {
        return new Promise(resolve => {
            const user = getCurrentUser(); 
            const now = new Date().toLocaleString();

            const success = LocalDB.update(id, { 
                estado: 'Diseño Pendiente', 
                asignado_a: user.id, 
                asignado_nombre_preprensa: user.name,
                fecha_asignacion: now,          
                ultima_actualizacion: now,      
                pasos_preprensa: { 1: false, 2: false, 3: false, 4: false }
            });
            resolve(success);
        });
    }
};