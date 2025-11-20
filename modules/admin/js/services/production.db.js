/**
 * js/services/production.db.js
 * Lógica de persistencia de Órdenes de Trabajo (OTs) y KPIs.
 */
import { getStorage, setStorage, log } from './local.db.js';

// --- Datos Iniciales (Seed Data) ---
const SEED_OTS = [
    { id: 'OT-1001', cliente: 'Industrias Gráficas', producto: '1000 Revistas', status: 'Pre-Prensa Pendiente', assignedTo: null, assignedName: null },
    { id: 'OT-1002', cliente: 'Editorial Futuro', producto: '500 Libros Tapa Dura', status: 'En Diseño', assignedTo: 'u1', assignedName: 'Carlos Ruiz' },
    { id: 'OT-1003', cliente: 'Cliente Eventual', producto: '2000 Flyers', status: 'Listo para Prensa', assignedTo: null, assignedName: null },
    { id: 'OT-1004', cliente: 'Corporación ABC', producto: '500 Cajas Corporativas', status: 'Listo para Acabados', assignedTo: null, assignedName: null },
];

export const productionDB = {
    async getOTs() {
        return getStorage('admin_ots', SEED_OTS);
    },
    // ACTUALIZACIÓN: Se incluye assignmentTime en el log para trazabilidad
    async assignOT(otId, userId, userName, newStatus, assignmentTime) {
        let ots = await this.getOTs();
        ots = ots.map(ot => 
            ot.id === otId 
            ? { ...ot, assignedTo: userId, assignedName: userName, status: newStatus } 
            : ot
        );
        setStorage('admin_ots', ots);
        // Usar assignmentTime en el log para mayor precisión.
        log('OT_ASIGNADA', `${otId} asignada a ${userName} (${newStatus}) el ${assignmentTime}`);
        return { success: true };
    },
    // Calcula la carga de trabajo (cuántas OTs activas tiene un usuario)
    async getUserLoad(userId) {
        const ots = await this.getOTs();
        // Consideramos carga cualquier OT asignada que no esté completada (simplificado)
        // Nota: Los IDs de usuario en la OT inicial son u1, u2, etc. (users.db.js)
        return ots.filter(ot => ot.assignedTo === userId && ot.status !== 'Completada').length;
    },
    async getDashboardStats() {
        const ots = await this.getOTs();
        
        return {
            totalOTs: ots.length,
            // Asumimos "Pendiente" o "Listo" como alertas críticas
            pendingOTs: ots.filter(ot => ot.status.includes('Pendiente') || ot.status.includes('Listo')).length
        };
    }
};