/**
 * js/services/production.db.js
 * Lógica de persistencia de Órdenes de Trabajo (OTs) y KPIs.
 * CONECTADO A LA BASE DE DATOS CENTRAL DEL CRM.
 */
import { getStorage, setStorage, log } from './local.db.js';

// Usamos la misma llave que el CRM para compartir los datos
const DB_KEY = 'crm_orders';

export const productionDB = {
    async getOTs() {
        const allOrders = getStorage(DB_KEY, []);
        
        // Filtramos solo las que son OTs activas (excluyendo cotizaciones borrador)
        return allOrders.filter(order => {
            const s = order.estado;
            // Excluir estados iniciales de venta o cancelados
            return s !== 'Nueva' && s !== 'En Negociación' && s !== 'Rechazada';
        });
    },

    async assignOT(otId, userId, userName, newStatus, assignmentTime) {
        let ots = getStorage(DB_KEY, []);
        
        // Buscar por ID único o por código de OT
        const index = ots.findIndex(ot => ot.id === otId || ot.ot_id === otId);
        
        if (index !== -1) {
            // Actualizar asignación y estado
            ots[index] = { 
                ...ots[index], 
                assignedTo: userId, 
                assignedName: userName, 
                estado: newStatus, // Actualizamos el campo 'estado' global
                fecha_asignacion_prod: assignmentTime || new Date().toLocaleString()
            };
            
            setStorage(DB_KEY, ots);
            
            // [LOG] Auditoría
            log('OT_ASIGNADA', `${ots[index].ot_id || otId} asignada a ${userName} con estado: ${newStatus}`);
            return { success: true };
        }
        return { success: false };
    },

    // Calcula la carga de trabajo (cuántas OTs activas tiene un usuario)
    async getUserLoad(userId) {
        const ots = await this.getOTs();
        return ots.filter(ot => ot.assignedTo === userId && ot.estado !== 'Completado').length;
    },

    async getDashboardStats() {
        const ots = await this.getOTs();
        return {
            totalOTs: ots.length,
            // Consideramos 'Orden creada' o 'Pendiente' como alertas
            pendingOTs: ots.filter(ot => 
                ot.estado === 'Orden creada' || 
                ot.estado.includes('Pendiente') || 
                ot.estado.includes('Listo')
            ).length
        };
    }
};