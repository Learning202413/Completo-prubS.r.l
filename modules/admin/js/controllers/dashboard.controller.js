import { productionDB } from '../services/production.db.js';
import { usersDB } from '../services/users.db.js';

export const DashboardController = {
    init: async function() {
        console.log("DashboardController: Actualizando KPIs...");
        
        // Carga los stats de producción
        const productionStats = await productionDB.getDashboardStats();
        // Carga los stats de usuarios
        const activeUserCount = await usersDB.getActiveUserCount(); 
        
        // Actualizar DOM si existen los elementos
        const alertEl = document.querySelector('.border-red-500 .text-4xl');
        const completedEl = document.querySelector('.border-green-500 .text-4xl');
        const onlineEl = document.querySelector('.border-blue-500 .text-4xl');
        
        // Actualizar valores visuales
        // Usamos OTs pendientes como alerta
        if(alertEl) alertEl.textContent = productionStats.pendingOTs; 
        // Usamos Total OTs como completadas (ejemplo)
        if(completedEl) completedEl.textContent = productionStats.totalOTs; 
        if(onlineEl) onlineEl.textContent = activeUserCount; // Usuarios activos

        // Actualizar lista de usuarios en el panel lateral
        this.renderUserList();
    },

    async renderUserList() {
        const users = await usersDB.getUsers(); // Ahora usa usersDB
        const listContainer = document.querySelector('.divide-y');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        users.forEach(u => {
            const isOnline = u.status === 'Online';
            const html = `
                <li class="py-2 flex items-center justify-between">
                    <span class="font-medium text-gray-800">${u.name}</span>
                    <span class="flex items-center text-xs ${isOnline ? 'text-green-600' : 'text-gray-400'} font-semibold">
                        <span class="w-2 h-2 ${isOnline ? 'bg-green-500' : 'bg-gray-300'} rounded-full mr-1.5"></span>${u.status}
                    </span>
                </li>
            `;
            listContainer.insertAdjacentHTML('beforeend', html);
        });
    }
};