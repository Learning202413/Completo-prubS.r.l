/**
 * js/services/production.db.js
 * Lógica de persistencia de Órdenes de Trabajo (OTs).
 */
import { getStorage, setStorage, log } from './local.db.js';

const DB_KEY = 'crm_orders';

export const productionDB = {
    async getOTs() {
        const allOrders = getStorage(DB_KEY, []);
        return allOrders.filter(order => {
            const s = order.estado;
            return s !== 'Nueva' && s !== 'En Negociación' && s !== 'Rechazada';
        });
    },

    async assignOT(otId, userId, userName, newStatus, assignmentTime) {
        let ots = getStorage(DB_KEY, []);
        const index = ots.findIndex(ot => ot.id === otId || ot.ot_id === otId);
        
        if (index !== -1) {
            let updates = { 
                estado: newStatus,
                fecha_asignacion_global: assignmentTime || new Date().toLocaleString()
            };

            // Lógica inteligente: Guardar en el campo específico según el estado/rol
            if (newStatus.includes('Diseño') || newStatus.includes('Pre-Prensa')) {
                updates.asignado_a = userId; 
                updates.asignado_nombre_preprensa = userName;
            } 
            else if (newStatus.includes('Prensa') || newStatus.includes('Imprimiendo')) {
                updates.asignado_prensa = userId; 
                updates.asignado_nombre_prensa = userName;
            } 
            else if (newStatus.includes('Acabados') || newStatus.includes('Post')) {
                updates.asignado_postprensa = userId; 
                updates.asignado_nombre_postprensa = userName;
            }

            // Asignación genérica visual
            updates.assignedTo = userId;
            updates.assignedName = userName;

            ots[index] = { ...ots[index], ...updates };
            setStorage(DB_KEY, ots);
            
            log('OT_ASIGNADA', `${ots[index].ot_id || otId} asignada a ${userName} con estado: ${newStatus}`);
            return { success: true };
        }
        return { success: false };
    },

    async getUserLoad(userId) {
        const ots = await this.getOTs();
        return ots.filter(ot => 
            (ot.asignado_a === userId || ot.asignado_prensa === userId || ot.asignado_postprensa === userId) && 
            ot.estado !== 'Completado'
        ).length;
    },

    async getDashboardStats() {
        const ots = await this.getOTs();
        return {
            totalOTs: ots.length,
            pendingOTs: ots.filter(ot => 
                ot.estado === 'Orden creada' || 
                ot.estado.includes('Pendiente') || 
                ot.estado.includes('Listo')
            ).length
        };
    }
};