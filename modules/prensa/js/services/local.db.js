/**
 * js/services/local.db.js
 */

const DB_KEY = 'crm_orders'; 

export const LocalDB = {
    initMockData() {
        // ... (Tu código existente de initMockData se mantiene igual) ...
        const existing = localStorage.getItem(DB_KEY);
        if (!existing) {
            // ... data mock ...
            this.saveAll(mockData);
        }
    },

    getAll() {
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

    /**
     * MODIFICADO: Ahora detecta cambios de estado y guarda el timestamp completo.
     */
    update(id, updates) {
        const all = this.getAll();
        const index = all.findIndex(item => item.id == id || item.ot_id == id);
        
        if (index !== -1) {
            const currentItem = all[index];

            // --- LÓGICA DE HISTORIAL AUTOMÁTICO ---
            // Si viene un estado nuevo y es diferente al anterior
            if (updates.estado && updates.estado !== currentItem.estado) {
                
                // Generar timestamp con Segundos
                const nowFull = new Date().toLocaleString('es-PE', { 
                    hour12: true,
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' // <--- Importante para guardar segundos
                });

                const logEntry = {
                    estado_anterior: currentItem.estado,
                    estado_nuevo: updates.estado,
                    fecha_cambio: nowFull,
                    usuario: updates.asignado_prensa || 'Sistema' // Intenta capturar quién lo hizo
                };

                // Inicializar el array si no existe
                if (!currentItem.historial_estados) {
                    currentItem.historial_estados = [];
                }

                // Agregar al historial
                currentItem.historial_estados.push(logEntry);
                
                console.log(`[Historial] OT-${id}: ${currentItem.estado} -> ${updates.estado} a las ${nowFull}`);
            }
            // --------------------------------------

            // Merge normal
            all[index] = { ...all[index], ...updates };
            this.saveAll(all);
            return true;
        }
        console.error(`LocalDB: Error, no se encontró la OT-${id}`);
        return false;
    }
};