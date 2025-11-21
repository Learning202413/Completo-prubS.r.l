import { LocalDB } from './local.db.js'; 

const getCurrentUser = () => {
    const session = localStorage.getItem('erp_session');
    return session ? JSON.parse(session) : null;
};

export const PostPrensaColaService = {
    async getMyTasks() {
        return new Promise(resolve => {
            const user = getCurrentUser();
            if (!user) { resolve([]); return; }

            const all = LocalDB.getAll();
            
            const myTasks = all.filter(t => 
                t.asignado_postprensa === user.id && 
                (
                    t.estado === 'Pendiente' ||          
                    t.estado === 'En Acabados' || 
                    t.estado === 'En Control de Calidad'
                )
            );
            
            const viewData = myTasks.map(order => ({
                id: order.id, ot_id: order.ot_id, cliente: order.cliente_nombre,
                producto: (order.items[0]?.producto || ''), estacion: 'Acabados',
                estado: order.estado, badgeColor: this.getBadgeColor(order.estado)
            }));

            setTimeout(() => resolve(viewData), 200);
        });
    },

    async startProcessing(id) {
        const now = new Date().toLocaleString();
        return LocalDB.update(id, {
            estado: 'En Acabados',
            fecha_inicio_acabados: now,
            ultima_actualizacion: now
        });
    },

    getBadgeColor(estado) {
        if (estado === 'Pendiente') return 'bg-orange-100 text-orange-800';
        if (estado === 'En Acabados') return 'bg-blue-100 text-blue-800';
        if (estado === 'En Control de Calidad') return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    }
};