/**
 * js/services/local.db.js
 * Servicio base de persistencia.
 * IMPORTANTE: Se conecta a 'crm_orders' para compartir datos con el CRM.
 */

const DB_KEY = 'crm_orders'; // La misma clave que usa el CRM

export const LocalDB = {
    /**
     * Obtiene todos los registros de la base de datos compartida.
     */
    getAll() {
        const data = localStorage.getItem(DB_KEY);
        if (!data) return []; // Si no hay datos del CRM, devuelve vacío
        return JSON.parse(data);
    },

    /**
     * Guarda cambios en la base de datos compartida.
     */
    saveAll(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    /**
     * Busca una orden por ID (puede ser el ID interno o el OT_ID).
     */
    getById(id) {
        const all = this.getAll();
        // Busca por ID único o por string OT-ID
        return all.find(item => item.id === id || item.ot_id === id) || null;
    },

    /**
     * Actualiza una orden específica.
     */
    update(id, updates) {
        const all = this.getAll();
        const index = all.findIndex(item => item.id === id || item.ot_id === id);
        
        if (index !== -1) {
            // Merge de datos existentes con las actualizaciones
            all[index] = { ...all[index], ...updates };
            this.saveAll(all);
            return true;
        }
        return false;
    }
};