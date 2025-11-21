import { LocalDB } from './local.db.js'; 

const getTimestamp = () => new Date().toLocaleString('es-PE', { 
    hour12: true, 
    hour: '2-digit', minute: '2-digit', second: '2-digit', 
    day: '2-digit', month: '2-digit', year: 'numeric'
});

export const PostPrensaColaService = {
    async getMyTasks(operatorName = 'Operador Acabados 1') {
        return new Promise(resolve => {
            const all = LocalDB.getAll();
            
            const myTasks = all.filter(t => 
                t.asignado_postprensa === operatorName && 
                (
                    t.estado === 'Pendiente' ||          
                    t.estado === 'En Acabados' || 
                    t.estado === 'En Control de Calidad'
                )
            );

            const viewData = myTasks.map(order => ({
                id: order.id,
                ot_id: order.ot_id,
                cliente: order.cliente_nombre,
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                estacion: 'Proceso Manual',
                estado: order.estado,
                badgeColor: this.getBadgeColor(order.estado)
            }));

            setTimeout(() => resolve(viewData), 200);
        });
    },

    async startProcessing(id) {
        const now = getTimestamp();
        return LocalDB.update(id, {
            estado: 'En Acabados',
            fecha_inicio_acabados: now,
            ultima_actualizacion: now
        });
    },

    getBadgeColor(estado) {
        // CAMBIO: Pendiente ahora es NARANJA para que resalte
        if (estado === 'Pendiente') return 'bg-orange-100 text-orange-800';
        if (estado === 'En Acabados') return 'bg-blue-100 text-blue-800';
        if (estado === 'En Control de Calidad') return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    }
};