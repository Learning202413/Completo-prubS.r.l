/**
 * modules/postprensa/js/services/local.db.js
 * Base de datos local COMPARTIDA.
 */
// CORRECCIÓN CLAVE: Usar la misma key que usa el módulo de Prensa
const DB_KEY = 'crm_orders'; 

export const LocalDB = {
    initMockData() {
        const existing = localStorage.getItem(DB_KEY);
        if (!existing) {
            console.log("Iniciando datos de prueba...");
            const mockData = [
                // Datos de ejemplo por si la BD está vacía
                {
                    id: '1001', 
                    ot_id: 'OT-1001', 
                    cliente_nombre: 'Editorial Alpha',
                    items: [{ producto: '2000 Revistas', specs: 'Bond 90g' }],
                    estado: 'En Post-Prensa', // Este debería aparecer en Cola General
                    asignado_postprensa: null
                },
                {
                    id: '1002', 
                    ot_id: 'OT-1002', 
                    cliente_nombre: 'Restaurante El Gusto',
                    items: [{ producto: '5000 Individuales', specs: 'Kraft 120g' }],
                    estado: 'Pendiente', 
                    asignado_postprensa: 'Operador Acabados 1',
                    avance_postprensa: { paso1: false, paso2: false, paso3: false }
                }
            ];
            this.saveAll(mockData);
        }
    },

    getAll() {
        // Si no existe, inicializa.
        if (!localStorage.getItem(DB_KEY)) {
            this.initMockData();
        }
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById(id) {
        const all = this.getAll();
        return all.find(item => item.id == id || item.ot_id == id) || null;
    },

    saveAll(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    },

    update(id, updates) {
        const all = this.getAll();
        const index = all.findIndex(item => item.id == id || item.ot_id == id);
        
        if (index !== -1) {
            if (updates.estado && updates.estado !== all[index].estado) {
                console.log(`[DB] Cambio estado: ${all[index].estado} -> ${updates.estado}`);
            }
            all[index] = { ...all[index], ...updates };
            this.saveAll(all);
            return true;
        }
        return false;
    }
};

// Inicializar
LocalDB.initMockData();