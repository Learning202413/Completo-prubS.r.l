import { LocalDB } from './local.db.js';

// Helper de tiempo
const getTimestamp = () => new Date().toLocaleString('es-PE', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', second: '2-digit', 
    hour12: true 
});

export const ColaService = {
    async getMyTasks(userName = 'Diseñador 1') {
        return new Promise(resolve => {
            const all = LocalDB.getAll();
            
            const myTasks = all.filter(t => 
                t.asignado_a === userName && 
                (
                    t.estado === 'Diseño Pendiente' || 
                    t.estado === 'En diseño' || 
                    t.estado === 'En Aprobación de Cliente' || 
                    t.estado === 'Diseño Aprobado' || 
                    t.estado === 'Cambios Solicitados'
                )
            );

            const viewData = myTasks.map(order => ({
                id: order.id, 
                ot_id: order.ot_id, 
                cliente: order.cliente_nombre,
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                fecha_creacion: order.fecha_creacion,
                estado: order.estado || 'Diseño Pendiente',
                badgeColor: this.getBadgeColor(order.estado)
            }));
            setTimeout(() => resolve(viewData), 200);
        });
    },

    // CAMBIO DE ESTADO (Al dar click en "Comenzar")
    async updateStatus(id, newStatus) {
        const now = getTimestamp();
        
        // Objeto de actualización base
        let updates = { 
            estado: newStatus, 
            ultima_actualizacion: now 
        };

        // Si estamos EMPEZANDO a diseñar, guardamos esa fecha específica
        if (newStatus === 'En diseño') {
            updates.fecha_inicio_diseno = now; // <--- REGISTRO EXACTO
        }

        return LocalDB.update(id, updates);
    },

    getBadgeColor(estado) {
        if (estado === 'En diseño') return 'bg-indigo-100 text-indigo-800';
        if (estado === 'En Aprobación de Cliente') return 'bg-yellow-100 text-yellow-800';
        if (estado === 'Diseño Aprobado') return 'bg-green-100 text-green-800';
        if (estado === 'Cambios Solicitados') return 'bg-red-100 text-red-800';
        return 'bg-blue-100 text-blue-800'; 
    }
};