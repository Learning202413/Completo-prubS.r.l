/**
 * js/services/local.db.js
 * Simulación de una base de datos (con persistencia en localStorage)
 * para hacer que el módulo de admin sea 100% funcional localmente.
 */

// --- Datos por Defecto ---
const DEFAULT_USERS = [
    { id: 'u1', name: 'Carlos Ruiz', role: 'Diseñador (Pre-Prensa)' },
    { id: 'u2', name: 'Elena Ríos', role: 'Diseñador (Pre-Prensa)' },
    { id: 'u3', name: 'David Flores', role: 'Diseñador (Pre-Prensa)' },
    { id: 'u4', name: 'Luis Torres', role: 'Operador (Prensa)' },
    { id: 'u5', name: 'Ana Fernandez', role: 'Operador (Prensa)' },
    { id: 'u6', name: 'Maria Paz', role: 'Operador (Post-Prensa)' },
    { id: 'u7', name: 'Javier Solis', role: 'Operador (Post-Prensa)' },
    { id: 'u8', name: 'Ana García', role: 'Vendedor (CRM)' },
    { id: 'u9', name: 'Gerente General', role: 'Admin (Gerente)' },
];

const DEFAULT_PROVIDERS = [
    { id: 'p1', name: 'Proveedor de Papeles S.A.', taxId: '20987654321', contact: 'Juan Mendoza (jm@papeles.com)', insumos: 'Papel, Cartulina' },
    { id: 'p2', name: 'Importadora de Tintas Ltd.', taxId: '20111222333', contact: 'Rosa Lopez (ventas@tintas.com)', insumos: 'Tintas, Placas' },
];

const DEFAULT_OTS = [
    { id: 'OT-1234', cliente: 'Industrias Gráficas', producto: '1000 Revistas A4', status: 'Pre-Prensa Pendiente', assignedTo: null, assignedName: null },
    { id: 'OT-1235', cliente: 'Editorial Futuro', producto: '500 Libros', status: 'En Diseño', assignedTo: 'u1', assignedName: 'Carlos Ruiz' },
    { id: 'OT-1236', cliente: 'Cliente Ejemplo', producto: '2000 Flyers', status: 'Listo para Prensa', assignedTo: null, assignedName: null },
    { id: 'OT-1237', cliente: 'Otro Cliente', producto: '50 Cajas', status: 'Listo para Acabados', assignedTo: null, assignedName: null },
];

const DEFAULT_LOG = [
    { id: 'l1', user: 'Ana García (CRM)', timestamp: '16 nov 2025, 17:00:05', module: 'CRM', event: 'ORDEN_CREADA (OT-1234)' },
    { id: 'l2', user: 'Admin (Gerente)', timestamp: '16 nov 2025, 17:05:10', module: 'Admin', event: 'OT_ASIGNADA (OT-1235 a Carlos Ruiz)' },
    { id: 'l3', user: 'Carlos Ruiz (Pre-Prensa)', timestamp: '16 nov 2025, 17:35:10', module: 'Pre-Prensa', event: 'DISEÑO_LISTO (OT-1235)' },
    { id: 'l4', user: 'Admin (Gerente)', timestamp: '16 nov 2025, 17:40:00', module: 'Admin', event: 'USUARIO_CREADO (paz.m@impresos.com)' },
];

// --- Funciones Helper para localStorage ---
const getStorage = (key, defaultValue) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
};

const setStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// --- Estado de la Base de Datos ---
let state = {
    users: getStorage('admin_users', DEFAULT_USERS),
    providers: getStorage('admin_providers', DEFAULT_PROVIDERS),
    ots: getStorage('admin_ots', DEFAULT_OTS),
    log: getStorage('admin_log', DEFAULT_LOG)
};

// --- Métodos de la "Base de Datos" ---
export const db = {

    // --- USUARIOS ---
    async getUsers() {
        return [...state.users];
    },
    async addUser(data) {
        const newUser = { ...data, id: `u${Date.now()}` };
        state.users.push(newUser);
        setStorage('admin_users', state.users);
        await this.addLog('Admin (Gerente)', 'Admin', `USUARIO_CREADO (${newUser.name})`);
        return newUser;
    },
    async updateUser(id, data) {
        state.users = state.users.map(u => u.id === id ? { ...u, ...data } : u);
        setStorage('admin_users', state.users);
        await this.addLog('Admin (Gerente)', 'Admin', `USUARIO_MODIFICADO (${data.name})`);
        return true;
    },
    async deleteUser(id) {
        const user = state.users.find(u => u.id === id);
        state.users = state.users.filter(u => u.id !== id);
        setStorage('admin_users', state.users);
        await this.addLog('Admin (Gerente)', 'Admin', `USUARIO_ELIMINADO (${user?.name || 'ID ' + id})`);
        return true;
    },

    // --- PROVEEDORES ---
    async getProviders() {
        return [...state.providers];
    },
    async addProvider(data) {
        const newProvider = { ...data, id: `p${Date.now()}` };
        state.providers.push(newProvider);
        setStorage('admin_providers', state.providers);
        await this.addLog('Admin (Gerente)', 'Admin', `PROVEEDOR_CREADO (${newProvider.name})`);
        return newProvider;
    },
    async updateProvider(id, data) {
        state.providers = state.providers.map(p => p.id === id ? { ...p, ...data } : p);
        setStorage('admin_providers', state.providers);
        await this.addLog('Admin (Gerente)', 'Admin', `PROVEEDOR_MODIFICADO (${data.name})`);
        return true;
    },
    async deleteProvider(id) {
        const provider = state.providers.find(p => p.id === id);
        state.providers = state.providers.filter(p => p.id !== id);
        setStorage('admin_providers', state.providers);
        await this.addLog('Admin (Gerente)', 'Admin', `PROVEEDOR_ELIMINADO (${provider?.name || 'ID ' + id})`);
        return true;
    },

    // --- PRODUCCIÓN (OTs) ---
    async getProductionOTs() {
        return [...state.ots];
    },
    async getOperatorLoad(userId) {
        return state.ots.filter(ot => ot.assignedTo === userId && !ot.status.includes('Completada')).length;
    },
    async assignOT(otId, resourceId, resourceName, newStatus) {
        state.ots = state.ots.map(ot => 
            ot.id === otId 
            ? { ...ot, status: newStatus, assignedTo: resourceId, assignedName: resourceName } 
            : ot
        );
        setStorage('admin_ots', state.ots);
        await this.addLog('Admin (Gerente)', 'Admin', `OT_ASIGNADA (${otId} a ${resourceName})`);
        return true;
    },

    // --- LOGS ---
    async getGlobalLog() {
        return [...state.log].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Simular orden
    },
    async searchLog(filters) {
        return state.log.filter(entry => {
            const matchesSearch = !filters.search || entry.user.toLowerCase().includes(filters.search) || entry.event.toLowerCase().includes(filters.search);
            const matchesModule = !filters.module || entry.module === filters.module;
            const matchesEvent = !filters.event || entry.event.startsWith(filters.event);
            // (La lógica de fecha sería más compleja, omitida por simplicidad local)
            return matchesSearch && matchesModule && matchesEvent;
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    async getOTLog(otId) {
        return state.log.filter(entry => entry.event.includes(otId))
                         .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Orden cronológico
    },
    async addLog(user, module, event) {
        const newLog = {
            id: `l${Date.now()}`,
            user,
            timestamp: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'medium' }).replace('.', ''),
            module,
            event
        };
        state.log.push(newLog);
        setStorage('admin_log', state.log);
    }
};