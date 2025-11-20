/**
 * js/services/users.db.js
 * Lógica de persistencia de usuarios.
 */
import { getStorage, setStorage, log } from './local.db.js';

// --- Datos Iniciales (Seed Data) ---
const SEED_USERS = [
    { id: 'u1', name: 'Carlos Ruiz', email: 'carlos.ruiz@impresos.com', role: 'Diseñador (Pre-Prensa)', status: 'Online' },
    { id: 'u2', name: 'Elena Ríos', email: 'elena.rios@impresos.com', role: 'Diseñador (Pre-Prensa)', status: 'Offline' },
    { id: 'u3', name: 'Luis Torres', email: 'luis.torres@impresos.com', role: 'Operador (Prensa)', status: 'Online' },
    { id: 'u4', name: 'Maria Paz', email: 'maria.paz@impresos.com', role: 'Operador (Post-Prensa)', status: 'Online' },
    { id: 'u5', name: 'Ana García', email: 'ana.garcia@impresos.com', role: 'Vendedor (CRM)', status: 'Online' },
    { id: 'u6', name: 'Gerente General', email: 'gerencia@impresos.com', role: 'Admin (Gerente)', status: 'Online' },
];

export const usersDB = {
    async getUsers() {
        return getStorage('admin_users', SEED_USERS);
    },
    async addUser(user) {
        const users = await this.getUsers();
        // Generar ID y asegurar estado inicial
        const newUser = { ...user, id: `u${Date.now()}`, status: user.status || 'Offline' };
        users.push(newUser);
        setStorage('admin_users', users);
        log('USUARIO_CREADO', `Se creó el usuario ${newUser.name}`);
        return { success: true, data: newUser };
    },
    async updateUser(id, updates) {
        let users = await this.getUsers();
        const oldUser = users.find(u => u.id === id);
        if (!oldUser) return { success: false, error: 'Usuario no encontrado' };

        users = users.map(u => u.id === id ? { ...u, ...updates } : u);
        setStorage('admin_users', users);
        log('USUARIO_ACTUALIZADO', `Se actualizó el usuario ${oldUser.name} (ID: ${id})`);
        return { success: true };
    },
    async deleteUser(id) {
        let users = await this.getUsers();
        const user = users.find(u => u.id === id);
        users = users.filter(u => u.id !== id);
        setStorage('admin_users', users);
        log('USUARIO_ELIMINADO', `Se eliminó a ${user ? user.name : id}`);
        return { success: true };
    },
    async getActiveUserCount() {
        const users = await this.getUsers();
        return users.filter(u => u.status === 'Online').length;
    }
};