/**
 * js/controllers/produccion.controller.js
 * Controlador de Control de Producción.
 * ACTUALIZADO: Compatible con la estructura de datos del CRM.
 */

import { productionDB } from '../services/production.db.js'; 
import { usersDB } from '../services/users.db.js'; 

// Mapea el estado de la tabla a un rol de usuario requerido
const stageToRoleMap = {
    'Orden creada': 'Diseñador (Pre-Prensa)',
    'Pre-Prensa Pendiente': 'Diseñador (Pre-Prensa)',
    'Diseño Pendiente': 'Diseñador (Pre-Prensa)',
    'En Diseño': 'Diseñador (Pre-Prensa)',
    'Listo para Prensa': 'Operador (Prensa)',
    'En Prensa': 'Operador (Prensa)',
    'Asignada a Prensa': 'Operador (Prensa)',
    'Listo para Acabados': 'Operador (Post-Prensa)',
    'En Post-Prensa': 'Operador (Post-Prensa)',
    'Pendiente': 'Operador (Post-Prensa)' // Pendiente de acabados
};

export const ProductionController = {
    _submitHandler: null,

    init: async function() {
        console.log("ProductionController: Iniciando carga de OTs...");
        await this.loadOTs();
        this.setupListAssignButtons();
        this.setupModalEvents();
    },

    async loadOTs() {
        try {
            const ots = await productionDB.getOTs();
            // Ordenar: Las 'Orden creada' (nuevas) primero
            ots.sort((a, b) => (a.estado === 'Orden creada' ? -1 : 1));
            this.renderTable(ots);
        } catch (error) {
            console.error("Error cargando OTs:", error);
        }
    },

    renderTable(ots) {
        const tbody = document.getElementById('list-table-body');
        if (!tbody) return;
        tbody.innerHTML = ''; 

        if (ots.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-500">No hay órdenes de trabajo activas.</td></tr>';
            return;
        }

        ots.forEach(ot => {
            // 1. Mapeo de Datos (Adaptador CRM -> Vista Producción)
            const displayId = ot.ot_id || ot.id || 'PENDIENTE';
            const clientName = ot.cliente_nombre || ot.cliente || 'Cliente Desconocido';
            // Obtener el primer producto del array de items o usar un fallback
            const productSummary = (ot.items && ot.items.length > 0) ? ot.items[0].producto : (ot.producto || 'Varios');
            const status = ot.estado || 'Desconocido';

            // 2. Estilos de Badge
            let badgeColor = 'bg-gray-100 text-gray-800';
            if (status === 'Orden creada' || status.includes('Pendiente')) badgeColor = 'bg-red-100 text-red-800';
            else if (status.includes('Listo')) badgeColor = 'bg-green-100 text-green-800';
            else if (status.includes('Diseño') || status.includes('Pre-Prensa')) badgeColor = 'bg-yellow-100 text-yellow-800';
            else if (status.includes('Prensa')) badgeColor = 'bg-blue-100 text-blue-800';
            else if (status.includes('Acabados') || status.includes('Post') || status.includes('Calidad')) badgeColor = 'bg-purple-100 text-purple-800';
            else if (status === 'Completado') badgeColor = 'bg-green-600 text-white';

            // 3. Estado de Asignación
            const isAssigned = !!ot.assignedTo;
            const assignedName = ot.assignedName || '(Sin Asignar)';
            const assignedClass = isAssigned ? 'font-bold text-blue-600' : 'text-gray-400 italic';

            // 4. Botón de Acción
            let actionBtnHTML = '';
            // Si está completado, no mostramos botón de asignar
            if (status === 'Completado') {
                 actionBtnHTML = `<span class="text-green-600 font-bold"><i data-lucide="check-check" class="w-4 h-4 inline"></i> Fin</span>`;
            } else if (isAssigned) {
                actionBtnHTML = `
                    <button class="btn-assign-from-list px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition" title="Reasignar">
                        <i data-lucide="user-check" class="w-4 h-4 inline mr-1 text-green-600"></i> ${assignedName}
                    </button>
                `;
            } else {
                actionBtnHTML = `
                    <button class="btn-assign-from-list px-4 py-2 text-sm color-primary-red text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 transition animate-pulse">
                        <i data-lucide="user-plus" class="w-4 h-4 inline mr-1"></i> Asignar
                    </button>
                `;
            }

            const row = `
                <tr class="hover:bg-gray-50 transition border-b" data-ot-id="${ot.id}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${displayId}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${clientName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${productSummary}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeColor} border border-gray-200">
                            ${status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${assignedClass}">${assignedName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        ${actionBtnHTML}
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });

        if (window.lucide) window.lucide.createIcons();
    },

    // --- UTILIDADES DOM ---
    getModalElement(selector) {
        const container = document.getElementById('assign-modal-container');
        return container ? container.querySelector(selector) : null;
    },

    getCurrentDateTimeLocal() {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    },

    // --- LÓGICA MODAL ---
    async renderSuggestions(role, searchTerm = "") {
        const listEl = this.getModalElement('#assign-suggestions-list');
        if (!listEl) return;

        listEl.innerHTML = '<p class="p-2 text-sm text-gray-400">Cargando...</p>';
        searchTerm = searchTerm.toLowerCase();

        let allUsers = await usersDB.getUsers();
        // Filtro más flexible: si el rol incluye la palabra clave (ej. "Prensa")
        let suggestions = allUsers.filter(op => op.role && op.role.includes(role.split(' ')[0])); 
        
        // Si no encuentra exactos, mostrar todos (fallback para pruebas)
        if (suggestions.length === 0 && role) {
             suggestions = allUsers; 
        }

        const suggestionsWithLoad = await Promise.all(suggestions.map(async (op) => {
            const load = await productionDB.getUserLoad(op.id); 
            return { ...op, load };
        }));
        
        suggestions = suggestionsWithLoad
            .filter(op => op.name.toLowerCase().includes(searchTerm))
            .sort((a, b) => a.load - b.load)
            .slice(0, 5);

        listEl.innerHTML = ''; 
        
        if (suggestions.length === 0) {
            listEl.innerHTML = `<p class="p-4 text-sm text-gray-500">No se encontraron operadores.</p>`;
            return;
        }

        suggestions.forEach(op => {
            const item = document.createElement('div');
            item.className = 'suggestion-item flex justify-between items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-red-50 transition-colors';
            item.dataset.id = op.id;
            item.dataset.name = op.name;
            
            item.innerHTML = `
                <div><p class="font-semibold text-gray-800">${op.name}</p><p class="text-xs text-gray-500">${op.role}</p></div>
                <span class="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Carga: ${op.load}</span>
            `;
            
            item.addEventListener('click', () => this.selectOperator(item));
            listEl.appendChild(item);
        });
    },

    selectOperator(itemElement) {
        const hiddenIdInput = this.getModalElement('#assign-resource-id');
        const searchInput = this.getModalElement('#assign-search-input');
        const confirmButton = this.getModalElement('#confirm-assign-button');
        const suggestionsList = this.getModalElement('#assign-suggestions-list');

        suggestionsList.querySelectorAll('.suggestion-item').forEach(el => el.classList.remove('bg-red-100', 'border-l-4', 'border-red-500'));
        itemElement.classList.add('bg-red-100', 'border-l-4', 'border-red-500');

        if(hiddenIdInput) hiddenIdInput.value = itemElement.dataset.id;
        if(searchInput) searchInput.value = itemElement.dataset.name;
        if(confirmButton) confirmButton.disabled = false;
    },

    // --- EVENTOS ---
    setupListAssignButtons() {
        const listBody = document.getElementById('list-table-body');
        if (!listBody) return;

        // Clonar para limpiar listeners viejos
        const newListBody = listBody.cloneNode(true);
        listBody.parentNode.replaceChild(newListBody, listBody);

        newListBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-assign-from-list');
            if (btn) { // Permitimos reasignar aunque esté deshabilitado visualmente
                const row = btn.closest('tr');
                const otId = row.dataset.otId; // Este ID puede ser el UUID interno o el OT-ID
                const statusElement = row.querySelector('td:nth-child(4) span');
                const status = statusElement ? statusElement.textContent.trim() : '';
                
                this.openAssignModal(otId, status);
            }
        });
    },

    async openAssignModal(otId, currentStatus) {
        // Intentar mapear estado, si no existe usar uno por defecto o buscar palabra clave
        let roleToAssign = stageToRoleMap[currentStatus];
        
        if (!roleToAssign) {
            if (currentStatus.includes('Diseño')) roleToAssign = 'Diseñador (Pre-Prensa)';
            else if (currentStatus.includes('Prensa')) roleToAssign = 'Operador (Prensa)';
            else if (currentStatus.includes('Acabados') || currentStatus.includes('Post')) roleToAssign = 'Operador (Post-Prensa)';
            else roleToAssign = 'Diseñador (Pre-Prensa)'; // Default para 'Orden creada'
        }

        window.UI.showModal('assign-modal-container', 'assign-modal-content');

        setTimeout(() => {
            const title = this.getModalElement('#assign-modal-title');
            const label = this.getModalElement('#assign-role-label');
            const otInput = this.getModalElement('#assign-ot-id');
            const dateInput = this.getModalElement('#assign-datetime');
            const searchInput = this.getModalElement('#assign-search-input');
            const resourceInput = this.getModalElement('#assign-resource-id');
            const confirmBtn = this.getModalElement('#confirm-assign-button');

            // Intentar recuperar el OT_ID visual si el ID es un UUID interno
            const order = (productionDB.getOTs ? null : null); // TODO: Si quisieras mostrar el nombre del cliente en el modal

            if(title) title.textContent = `Asignar Tarea: ${otId}`; // Podrías mejorar esto buscando el OT real
            if(label) label.innerHTML = `Rol Sugerido: <span class="font-bold text-gray-800">${roleToAssign}</span>`;
            if(otInput) otInput.value = otId;
            if(dateInput) dateInput.value = this.getCurrentDateTimeLocal();
            
            if(searchInput) { searchInput.value = ''; searchInput.focus(); }
            if(resourceInput) resourceInput.value = '';
            if(confirmBtn) confirmBtn.disabled = true;

            this.renderSuggestions(roleToAssign);

            if(searchInput) {
                const newSearch = searchInput.cloneNode(true);
                searchInput.parentNode.replaceChild(newSearch, searchInput);
                newSearch.addEventListener('input', (e) => {
                    this.getModalElement('#confirm-assign-button').disabled = true;
                    this.renderSuggestions(roleToAssign, e.target.value);
                });
            }
        }, 50);
    },

    setupModalEvents() {
        const modalContainer = document.getElementById('assign-modal-container');
        if (!modalContainer) return;

        this._submitHandler = async (e) => {
            if (e.target.id === 'assign-form') {
                e.preventDefault();
                const form = e.target;
                
                const otId = form.querySelector('#assign-ot-id').value;
                const resourceId = form.querySelector('#assign-resource-id').value;
                const resourceName = form.querySelector('#assign-search-input').value;
                const assignDate = form.querySelector('#assign-datetime').value;

                if (!resourceId) return;

                // Determinar nuevo estado basado en el rol del usuario seleccionado
                const users = await usersDB.getUsers();
                const userRole = users.find(u => u.id === resourceId)?.role || '';
                let newStatus = 'Asignado';
                
                if (userRole.includes('Diseñador')) newStatus = 'En Diseño';
                else if (userRole.includes('Prensa')) newStatus = 'En Prensa';
                else if (userRole.includes('Post-Prensa')) newStatus = 'En Post-Prensa';

                // Guardar
                await productionDB.assignOT(otId, resourceId, resourceName, newStatus, assignDate);

                window.UI.hideModal('assign-modal-container');
                window.UI.showNotification('Asignado', `OT actualizada a: ${newStatus}`);
                
                // RECARGAR TABLA
                this.loadOTs();
            }
        };

        modalContainer.removeEventListener('submit', this._submitHandler);
        modalContainer.addEventListener('submit', this._submitHandler);
    }
};