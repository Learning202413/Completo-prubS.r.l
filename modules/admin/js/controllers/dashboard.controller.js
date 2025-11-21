/**
 * js/controllers/dashboard.controller.js
 * Controlador para el Dashboard Gerencial.
 * Conecta con productionDB y usersDB para mostrar KPIs en tiempo real.
 */
import { productionDB } from '../services/production.db.js';
import { usersDB } from '../services/users.db.js';

export const DashboardController = {
    init: async function() {
        console.log("DashboardController: Actualizando KPIs...");
        
        try {
            // 1. Carga stats de producción (OTs Totales, Pendientes)
            const productionStats = await productionDB.getDashboardStats();
            
            // 2. Carga stats de usuarios (Usuarios Online)
            const activeUserCount = await usersDB.getActiveUserCount(); 
            
            // 3. Actualizar DOM
            this.updateKPIs(productionStats, activeUserCount);
            
            // 4. Renderizar lista de usuarios lateral
            await this.renderUserList();

        } catch (error) {
            console.error("Error cargando el dashboard:", error);
        }
    },

    updateKPIs(prodStats, userCount) {
        // Selectores basados en el HTML de dashboard.html (colores de borde)
        const alertEl = document.querySelector('.border-red-500 .text-4xl');
        const completedEl = document.querySelector('.border-green-500 .text-4xl');
        const onlineEl = document.querySelector('.border-blue-500 .text-4xl');
        
        if (alertEl) alertEl.textContent = prodStats.pendingOTs; // Alertas (Pendientes)
        if (completedEl) completedEl.textContent = prodStats.totalOTs; // Total OTs
        if (onlineEl) onlineEl.textContent = userCount; // Usuarios Online
    },

    async renderUserList() {
        const users = await usersDB.getUsers();
        const listContainer = document.querySelector('.divide-y'); // Contenedor de la lista lateral
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        // Mostramos primeros 10 o todos
        users.forEach(u => {
            const isOnline = u.status === 'Online';
            const html = `
                <li class="py-2 flex items-center justify-between">
                    <span class="font-medium text-gray-800 truncate w-32" title="${u.name}">${u.name}</span>
                    <span class="flex items-center text-xs ${isOnline ? 'text-green-600' : 'text-gray-400'} font-semibold">
                        <span class="w-2 h-2 ${isOnline ? 'bg-green-500' : 'bg-gray-300'} rounded-full mr-1.5"></span>
                        ${u.status}
                    </span>
                </li>
            `;
            listContainer.insertAdjacentHTML('beforeend', html);
        });
    }
};