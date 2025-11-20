/**
 * js/services/orden.detalle.service.js
 * Servicio para el controlador de DETALLE.
 * Gestiona CRUD individual, conversión a OT y cambios de estado.
 */
import { getStorage, setStorage, log } from './local.db.js';

const DB_KEY = 'crm_orders';
// Replicamos SEED para consistencia en cold-start directo a detalle
const SEED_ORDERS = [
    { 
        id: 'B4A5C6D7', 
        codigo: 'COT-B4A5C6D7',
        ot_id: 'PENDIENTE',
        cliente_id: '2',
        cliente_nombre: 'Editorial Futuro EIRL',
        estado: 'En Negociación',
        fecha_creacion: '2025-11-15',
        total: 9800.00,
        items: [{ producto: 'Libro Tapa Dura', cantidad: 500, specs: '', precio: 19.60, subtotal: 9800.00 }]
    },
    { 
        id: '1234', 
        codigo: 'COT-GEN-1234',
        ot_id: 'OT-1234',
        cliente_id: '1',
        cliente_nombre: 'Industrias Gráficas S.A.',
        estado: 'En prensa', // Actualizado a uno de tus nuevos estados para demo
        fecha_creacion: '2025-11-10',
        total: 4500.00,
        items: [{ producto: 'Revistas A4', cantidad: 1000, specs: 'Couche 150gr', precio: 4.50, subtotal: 4500.00 }]
    }
];

export const OrdenDetalleService = {
    async getOrderById(id) {
        return new Promise(resolve => {
            const orders = getStorage(DB_KEY, SEED_ORDERS);
            const found = orders.find(o => o.id === id);
            setTimeout(() => resolve(found || null), 100);
        });
    },

    async createOrder(orderData) {
        const orders = getStorage(DB_KEY, SEED_ORDERS);
        
        // Generar ID y Código
        const newId = Date.now().toString(36).toUpperCase();
        const newOrder = {
            ...orderData,
            id: newId,
            codigo: `COT-${newId}`,
            ot_id: 'PENDIENTE',
            estado: 'En Negociación', // Estado inicial de COTIZACIÓN
            fecha_creacion: new Date().toISOString().split('T')[0]
        };

        orders.push(newOrder);
        setStorage(DB_KEY, orders);
        log('COTIZACION_CREADA', `Código: ${newOrder.codigo}`);
        return { success: true, id: newId };
    },

    async updateOrder(id, updates) {
        let orders = getStorage(DB_KEY, SEED_ORDERS);
        const index = orders.findIndex(o => o.id === id);
        
        if (index === -1) return { success: false, message: 'Orden no encontrada' };

        orders[index] = { ...orders[index], ...updates };
        setStorage(DB_KEY, orders);
        log('ORDEN_ACTUALIZADA', `ID: ${id}`);
        return { success: true };
    },

    /**
     * Convierte una Cotización en Orden de Trabajo (OT).
     */
    async convertToOT(id) {
        let orders = getStorage(DB_KEY, SEED_ORDERS);
        const index = orders.findIndex(o => o.id === id);
        
        if (index === -1) return { success: false };

        // Generar ID de OT
        const otId = `OT-${Math.floor(1000 + Math.random() * 9000)}`;
        
        orders[index].ot_id = otId;
        // CAMBIO: Estado inicial según tu flujo
        orders[index].estado = 'Orden creada'; 
        
        setStorage(DB_KEY, orders);
        log('CONVERSION_OT', `Cotización ${id} convertida a ${otId}`);
        return { success: true, otId };
    },

    /**
     * Marca una cotización como rechazada.
     */
    async rejectQuote(id) {
        let orders = getStorage(DB_KEY, SEED_ORDERS);
        const index = orders.findIndex(o => o.id === id);
        
        if (index === -1) return { success: false };

        orders[index].estado = 'Rechazada';
        setStorage(DB_KEY, orders);
        return { success: true };
    },
    
    async completeOrder(id) {
         let orders = getStorage(DB_KEY, SEED_ORDERS);
        const index = orders.findIndex(o => o.id === id);
        
        if (index === -1) return { success: false };

        // CAMBIO: Estado final según tu lista
        orders[index].estado = 'Completado';
        setStorage(DB_KEY, orders);
        return { success: true };
    }
};