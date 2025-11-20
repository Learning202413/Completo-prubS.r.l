import { LocalDB } from './local.db.js'; 
// Si local.db.js está en la raiz de services, usa: ../../../../js/services/local.db.js

const getTimestamp = () => new Date().toLocaleString('es-PE', { 
    hour12: true, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

export const ColaService = {
    async getMyTasks(operatorName = 'Operador 1') {
        return new Promise(resolve => {
            const all = LocalDB.getAll();
            
            // FILTRO: Incluimos 'En proceso' y otros estados activos de prensa
            const myTasks = all.filter(t => 
                t.asignado_prensa === operatorName && 
                (
                    t.estado === 'Asignada a Prensa' || 
                    t.estado === 'En proceso' ||      
                    t.estado === 'En Preparación' ||  
                    t.estado === 'Imprimiendo'
                )
            );

            const viewData = myTasks.map(order => ({
                id: order.id,
                ot_id: order.ot_id,
                cliente: order.cliente_nombre,
                maquina: 'Offset-A',
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                fecha: order.fecha_asignacion_prensa,
                estado: order.estado,
                badgeColor: this.getBadgeColor(order.estado)
            }));

            setTimeout(() => resolve(viewData), 200);
        });
    },

    // Actualizar estado al iniciar la tarea desde la cola
    async updateStatus(id, newStatus) {
        const now = getTimestamp();
        return LocalDB.update(id, { 
            estado: newStatus, 
            ultima_actualizacion: now,
            fecha_inicio_proceso: now // Registra el momento exacto del inicio
        });
    },

    getBadgeColor(estado) {
        if (estado === 'En proceso') return 'bg-indigo-100 text-indigo-800';
        if (estado === 'En Preparación') return 'bg-orange-100 text-orange-800';
        if (estado === 'Imprimiendo') return 'bg-blue-600 text-white animate-pulse';
        return 'bg-blue-100 text-blue-800'; // Por defecto: Asignada
    }
};