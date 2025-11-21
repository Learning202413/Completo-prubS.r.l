import { LocalDB } from './local.db.js';

const getCurrentUser = () => {
    const session = localStorage.getItem('erp_session');
    return session ? JSON.parse(session) : { id: 'anon', name: 'Anónimo' };
};

export const ColaGeneralService = {
    async getIncomingTasks() {
        return new Promise(resolve => {
            const all = LocalDB.getAll();
            const incoming = all.filter(t => t.estado === 'En prensa' && !t.asignado_prensa);

            const viewData = incoming.map(order => ({
                id: order.id, ot_id: order.ot_id, cliente: order.cliente_nombre,
                maquina: 'Offset-A', producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                estado: 'Nuevo' 
            }));

            setTimeout(() => resolve(viewData), 200);
        });
    },

    async assignTaskToMe(id) {
        return new Promise(resolve => {
            const user = getCurrentUser();
            const now = new Date().toLocaleString();
            
            const success = LocalDB.update(id, { 
                estado: 'Asignada a Prensa',
                asignado_prensa: user.id, 
                asignado_nombre_prensa: user.name,
                fecha_asignacion_prensa: now,
                ultima_actualizacion: now
            });
            setTimeout(() => resolve(success), 300);
        });
    }
};