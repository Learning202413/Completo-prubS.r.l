/**
 * js/controllers/produccion.controller.js
 */
import { productionDB } from '../services/production.db.js'; 
import { usersDB } from '../services/users.db.js'; 

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
    'Pendiente': 'Operador (Post-Prensa)'
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
            const displayId = ot.ot_id || ot.id || 'PENDIENTE';
            const clientName = ot.cliente_nombre || ot.cliente || 'Desconocido';
            const productSummary = (ot.items && ot.items.length > 0) ? ot.items[0].producto : (ot.producto || 'Varios');
            const status = ot.estado || 'Desconocido';

            let assignedName = '(Sin Asignar)';
            let isAssigned = false;

            if (ot.asignado_nombre_preprensa && (status.includes('Diseño') || status.includes('Pre'))) {
                assignedName = ot.asignado_nombre_preprensa; isAssigned = true;
            } else if (ot.asignado_nombre_prensa && (status.includes('Prensa') || status.includes('Imprimiendo'))) {
                assignedName = ot.asignado_nombre_prensa; isAssigned = true;
            } else if (ot.asignado_nombre_postprensa && (status.includes('Acabados') || status.includes('Post'))) {
                assignedName = ot.asignado_nombre_postprensa; isAssigned = true;
            } else if (ot.assignedName) {
                assignedName = ot.assignedName; isAssigned = true;
            }

            let badgeColor = 'bg-gray-100 text-gray-800';
            if (status === 'Orden creada') badgeColor = 'bg-red-100 text-red-800';
            else if (status.includes('Diseño')) badgeColor = 'bg-yellow-100 text-yellow-800';
            else if (status.includes('Prensa')) badgeColor = 'bg-blue-100 text-blue-800';
            else if (status.includes('Post')) badgeColor = 'bg-purple-100 text-purple-800';
            else if (status === 'Completado') badgeColor = 'bg-green-100 text-green-800';

            const actionBtnHTML = isAssigned 
                ? `<button class="btn-assign-from-list px-3 py-1 text-sm border rounded hover:bg-gray-50" title="Reasignar"><i data-lucide="user-check" class="w-4 h-4 inline text-green-600"></i> ${assignedName}</button>`
                : `<button class="btn-assign-from-list px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 shadow-sm"><i data-lucide="user-plus" class="w-4 h-4 inline mr-1"></i> Asignar</button>`;

            const row = `
                <tr class="hover:bg-gray-50 border-b" data-ot-id="${ot.id}">
                    <td class="px-6 py-4 font-bold text-gray-900">${displayId}</td>
                    <td class="px-6 py-4 text-gray-500">${clientName}</td>
                    <td class="px-6 py-4 text-gray-500">${productSummary}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${badgeColor}">${status}</span></td>
                    <td class="px-6 py-4 text-sm text-gray-600">${assignedName}</td>
                    <td class="px-6 py-4 text-center">${actionBtnHTML}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
        if (window.lucide) window.lucide.createIcons();
    },

    async openAssignModal(otId, currentStatus) {
        let roleToAssign = stageToRoleMap[currentStatus];
        
        if (!roleToAssign) {
            if (currentStatus.includes('Diseño')) roleToAssign = 'Diseñador (Pre-Prensa)';
            else if (currentStatus.includes('Prensa')) roleToAssign = 'Operador (Prensa)';
            else if (currentStatus.includes('Acabados') || currentStatus.includes('Post')) roleToAssign = 'Operador (Post-Prensa)';
            else roleToAssign = 'Diseñador (Pre-Prensa)';
        }

        window.UI.showModal('assign-modal-container', 'assign-modal-content');

        setTimeout(() => {
            const title = document.getElementById('assign-modal-title');
            const label = document.getElementById('assign-role-label');
            const otInput = document.getElementById('assign-ot-id');
            const resourceInput = document.getElementById('assign-resource-id');
            const searchInput = document.getElementById('assign-search-input');
            const confirmBtn = document.getElementById('confirm-assign-button');

            if(title) title.textContent = `Asignar Tarea: ${otId}`;
            if(label) label.innerHTML = `Rol Sugerido: <span class="font-bold text-gray-800">${roleToAssign}</span>`;
            if(otInput) otInput.value = otId;
            
            if(searchInput) { searchInput.value = ''; searchInput.focus(); }
            if(resourceInput) resourceInput.value = '';
            if(confirmBtn) confirmBtn.disabled = true;

            this.renderSuggestions(roleToAssign);

            if(searchInput) {
                const newSearch = searchInput.cloneNode(true);
                searchInput.parentNode.replaceChild(newSearch, searchInput);
                newSearch.addEventListener('input', (e) => {
                    document.getElementById('confirm-assign-button').disabled = true;
                    this.renderSuggestions(roleToAssign, e.target.value);
                });
            }
        }, 50);
    },

    async renderSuggestions(roleFilter, searchTerm = '') {
        const listEl = document.getElementById('assign-suggestions-list');
        if (!listEl) return;
        
        let users = await usersDB.getUsers();
        
        // Filtro flexible: Coincide si el rol contiene la palabra clave (ej. "Prensa")
        const roleKey = roleFilter.split(' ')[0]; 
        
        users = users.filter(u => 
            (!roleKey || u.role.includes(roleKey)) && 
            (!searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        listEl.innerHTML = '';
        if (users.length === 0) {
            listEl.innerHTML = '<p class="p-3 text-sm text-gray-500">No se encontraron usuarios.</p>';
            return;
        }

        users.forEach(u => {
            const item = document.createElement('div');
            item.className = 'p-3 hover:bg-red-50 cursor-pointer border-b flex justify-between items-center';
            item.innerHTML = `<div><span class="font-bold block">${u.name}</span><span class="text-xs text-gray-500">${u.role}</span></div>`;
            item.onclick = () => {
                document.getElementById('assign-resource-id').value = u.id;
                document.getElementById('assign-search-input').value = u.name;
                document.getElementById('confirm-assign-button').disabled = false;
                
                listEl.querySelectorAll('div').forEach(d => d.classList.remove('bg-red-100', 'border-l-4', 'border-red-500'));
                item.classList.add('bg-red-100', 'border-l-4', 'border-red-500');
            };
            listEl.appendChild(item);
        });
    },

    setupListAssignButtons() {
        const tbody = document.getElementById('list-table-body');
        if(!tbody) return;
        const newBody = tbody.cloneNode(true);
        tbody.parentNode.replaceChild(newBody, tbody);
        
        newBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-assign-from-list');
            if (btn) {
                const row = btn.closest('tr');
                const otId = row.dataset.otId;
                const status = row.querySelector('td:nth-child(4)').textContent.trim();
                this.openAssignModal(otId, status);
            }
        });
    },

    setupModalEvents() {
        const modal = document.getElementById('assign-modal-container');
        if (modal) {
            if(this._submitHandler) modal.removeEventListener('submit', this._submitHandler);
            
            this._submitHandler = async (e) => {
                if (e.target.id === 'assign-form') {
                    e.preventDefault();
                    const otId = document.getElementById('assign-ot-id').value;
                    const userId = document.getElementById('assign-resource-id').value;
                    const userName = document.getElementById('assign-search-input').value;
                    
                    if (!userId) return;

                    const allUsers = await usersDB.getUsers();
                    const selectedUser = allUsers.find(u => u.id === userId);
                    let newStatus = 'Asignado';
                    
                    if (selectedUser.role.includes('Diseñador')) newStatus = 'En Diseño';
                    else if (selectedUser.role.includes('Prensa')) newStatus = 'Asignada a Prensa';
                    else if (selectedUser.role.includes('Post')) newStatus = 'Pendiente'; 

                    await productionDB.assignOT(otId, userId, userName, newStatus);
                    
                    window.UI.hideModal('assign-modal-container');
                    window.UI.showNotification('Asignado', `Tarea enviada a ${userName}`);
                    this.loadOTs();
                }
            };
            modal.addEventListener('submit', this._submitHandler);
        }
    }
};