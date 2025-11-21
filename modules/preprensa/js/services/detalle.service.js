import { LocalDB } from './local.db.js';

// Helper de tiempo
const getTimestamp = () => new Date().toLocaleString('es-PE', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit', second: '2-digit', 
    hour12: true 
});

export const DetalleService = {
    async getTaskById(id) {
        // ... (Tu código de getTaskById existente, sin cambios en la lógica de lectura) ...
        return new Promise(resolve => {
            let order = LocalDB.getById(id);
            if (!order && ['1', '2', '3'].includes(id)) {
                 // (Lógica de Mock Persistence igual que antes...)
                 const mockOrders = {
                    '1': { id: '1', ot_id: 'OT-1234', cliente_nombre: 'Industrias Gráficas S.A.', items: [{ producto: '1000 Revistas A4', specs: 'Couche 150gr.' }], estado: 'Diseño Pendiente', asignado_a: 'Diseñador 1' },
                    '2': { id: '2', ot_id: 'OT-1235', cliente_nombre: 'Editorial Futuro EIRL', items: [{ producto: '500 Libros Tapa Dura', specs: 'Tapa Dura.' }], estado: 'En Aprobación de Cliente', asignado_a: 'Diseñador 1' },
                    '3': { id: '3', ot_id: 'OT-1230', cliente: 'Cliente Particular', items: [{ producto: '250 Tarjetas Personales', specs: 'Laminado Mate.' }], estado: 'Cambios Solicitados', asignado_a: 'Diseñador 1' }
                };
                order = mockOrders[id];
                const all = LocalDB.getAll();
                all.push(order);
                LocalDB.saveAll(all);
            }
            if (!order) { resolve(null); return; }

            // Devolvemos la vista
            const taskView = {
                id: order.id,
                ot_id: order.ot_id,
                cliente: order.cliente_nombre,
                producto: order.items && order.items.length > 0 ? order.items[0].producto : 'Varios',
                specs: order.items && order.items.length > 0 && order.items[0].specs ? order.items[0].specs : 'Ver hoja de ruta',
                pasos: order.pasos_preprensa || { 1: false, 2: false, 3: false, 4: false },
                comentarios: order.comentarios || [],
                estado_global: order.estado,
                
                // Opcional: devolver las fechas para mostrarlas si quieres
                fechas: {
                    asignado: order.fecha_asignacion,
                    inicio: order.fecha_inicio_diseno,
                    actualizado: order.ultima_actualizacion
                }
            };
            setTimeout(() => resolve(taskView), 100);
        });
    },

    async updateStepStatus(id, stepNumber, isCompleted) {
        const now = getTimestamp();
        const order = LocalDB.getById(id);
        if (!order) return false;

        const currentSteps = order.pasos_preprensa || { 1: false, 2: false, 3: false, 4: false };
        const newSteps = { ...currentSteps, [stepNumber]: isCompleted };
        
        let updates = { 
            pasos_preprensa: newSteps, 
            ultima_actualizacion: now 
        };

        if (stepNumber === 3 && isCompleted) {
            updates.estado = 'En Aprobación de Cliente';
            updates.fecha_solicitud_aprobacion = now; // <--- REGISTRO EXACTO
        }

        LocalDB.update(id, updates);
        return true;
    },

    async setApprovalStatus(id, tipo) {
        const now = getTimestamp();
        const order = LocalDB.getById(id);
        if (!order) return false;

        let nuevoEstado = order.estado;
        let updates = { ultima_actualizacion: now };

        if (tipo === 'aprobado') {
            nuevoEstado = 'Diseño Aprobado';
            updates.fecha_aprobacion_cliente = now; // <--- REGISTRO EXACTO APROBACIÓN
        }
        if (tipo === 'rechazado') {
            nuevoEstado = 'Cambios Solicitados';
            updates.fecha_rechazo_cliente = now;    // <--- REGISTRO EXACTO RECHAZO
        }
        updates.estado = nuevoEstado;

        LocalDB.update(id, updates);
        return true;
    },

    async completeTask(id) {
        const now = getTimestamp();
        return LocalDB.update(id, { 
            estado: 'En prensa', 
            fecha_pase_prensa: now, // <--- REGISTRO FINAL
            ultima_actualizacion: now
        });
    }
};