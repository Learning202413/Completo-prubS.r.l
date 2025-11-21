import { LocalDB } from './local.db.js'; 

const getCurrentUser = () => {
    const session = localStorage.getItem('erp_session');
    return session ? JSON.parse(session) : null;
};

export const ColaService = {
    async getMyTasks() {
        return new Promise(resolve => {
            const user = getCurrentUser();
            if (!user) { resolve([]); return; }

            const all = LocalDB.getAll();
            
            const myTasks = all.filter(t => 
                t.asignado_prensa === user.id && 
                (
                    t.estado === 'Asignada a Prensa' || 
                    t.estado === 'En proceso' ||      
                    t.estado === 'En Preparación' ||  
                    t.estado === 'Imprimiendo'
                )
            );

            const viewData = myTasks.map(order => ({
                id: order.id, ot_id: order.ot_id, cliente: order.cliente_nombre,
                maquina: 'Offset-A', producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                fecha: order.fecha_asignacion_prensa,
                estado: order.estado,
                badgeColor: this.getBadgeColor(order.estado)
            }));

            setTimeout(() => resolve(viewData), 200);
        });
    },

    async updateStatus(id, newStatus) {
        const now = new Date().toLocaleString();
        return LocalDB.update(id, { estado: newStatus, ultima_actualizacion: now, fecha_inicio_proceso: now });
    },

    getBadgeColor(estado) {
        if (estado === 'En proceso') return 'bg-indigo-100 text-indigo-800';
        if (estado === 'En Preparación') return 'bg-orange-100 text-orange-800';
        if (estado === 'Imprimiendo') return 'bg-blue-600 text-white animate-pulse';
        return 'bg-blue-100 text-blue-800'; 
    }
};