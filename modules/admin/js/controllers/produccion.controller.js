/**
 * js/controllers/produccion.controller.js
 * * SOLUCIÓN DE BUG:
 * Se ha reemplazado el uso de `document.getElementById` por selectores acotados
 * al contenedor del modal (`modalContainer.querySelector`). Esto evita que el código
 * seleccione por error los elementos de la plantilla oculta (que tienen los mismos IDs)
 * en lugar de los elementos del modal visible.
 */

import { productionDB } from '../services/production.db.js'; 
import { usersDB } from '../services/users.db.js'; 

// Mapea el estado de la tabla a un rol de usuario
const stageToRoleMap = {
    'Pre-Prensa Pendiente': 'Diseñador (Pre-Prensa)',
    'En Diseño': 'Diseñador (Pre-Prensa)',
    'Listo para Prensa': 'Operador (Prensa)',
    'En Prensa': 'Operador (Prensa)',
    'Listo para Acabados': 'Operador (Post-Prensa)',
    'En Post-Prensa': 'Operador (Post-Prensa)'
};

/**
 * Helper para buscar elementos SOLO dentro del modal activo.
 * Evita conflictos con los IDs de la plantilla oculta.
 */
const getModalElement = (selector) => {
    const container = document.getElementById('assign-modal-container');
    return container ? container.querySelector(selector) : null;
};

/**
 * Renderiza la lista de sugerencias.
 * Ahora busca la lista DENTRO del modal activo.
 */
const renderSuggestions = async (role, searchTerm = "") => {
    // CORRECCIÓN: Usar getModalElement en lugar de getElementById
    const listEl = getModalElement('#assign-suggestions-list');
    if (!listEl) {
        console.warn("No se encontró la lista de sugerencias en el modal activo.");
        return;
    }

    listEl.innerHTML = ''; 
    searchTerm = searchTerm.toLowerCase();

    let allUsers = await usersDB.getUsers(); 

    // 1. Filtrar por Rol
    let suggestions = allUsers.filter(op => op.role === role);

    // 2. Calcular carga
    const suggestionsWithLoad = await Promise.all(suggestions.map(async (op) => {
        const load = await productionDB.getUserLoad(op.id); 
        return { ...op, load };
    }));
    suggestions = suggestionsWithLoad;

    // 3. Filtrar por Búsqueda
    if (searchTerm) {
        suggestions = suggestions.filter(op => op.name.toLowerCase().includes(searchTerm));
    }

    // 4. Ordenar
    suggestions.sort((a, b) => a.load - b.load);

    // 5. Limitar
    if (!searchTerm) {
        suggestions = suggestions.slice(0, 5);
    }
    
    // 6. Renderizar
    if (suggestions.length === 0) {
        listEl.innerHTML = `<p class="p-4 text-sm text-gray-500">No se encontraron operadores con el rol "${role}" disponibles ${searchTerm ? 'con el nombre "' + searchTerm + '"' : ''}.</p>`;
        return;
    }

    suggestions.forEach(op => {
        const item = document.createElement('div');
        item.className = 'suggestion-item flex justify-between items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-red-50 transition-colors duration-150';
        item.dataset.id = op.id;
        item.dataset.name = op.name;
        
        item.innerHTML = `
            <div>
                <p class="font-semibold">${op.name}</p>
                <p class="text-sm text-gray-500">${op.role}</p>
            </div>
            <span class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Carga: ${op.load} OT(s)</span>
        `;
        listEl.appendChild(item);
    });
};

/**
 * Configura listeners SOLO para los elementos del modal activo.
 */
const setupModalListeners = (role) => {
    // CORRECCIÓN: Buscar elementos dentro del modal, no globalmente
    const searchInput = getModalElement('#assign-search-input');
    const suggestionsList = getModalElement('#assign-suggestions-list');
    const hiddenIdInput = getModalElement('#assign-resource-id');
    const confirmButton = getModalElement('#confirm-assign-button');
    
    if (!searchInput || !suggestionsList || !hiddenIdInput || !confirmButton) return;

    confirmButton.disabled = true;

    const handleSearch = (e) => {
        const searchTerm = e.target.value;
        hiddenIdInput.value = ""; 
        confirmButton.disabled = true; 
        renderSuggestions(role, searchTerm);
    };
    
    const handleClick = (e) => {
        const item = e.target.closest('.suggestion-item');
        if (!item) return;

        const operatorId = item.dataset.id;
        const operatorName = item.dataset.name;

        suggestionsList.querySelectorAll('.suggestion-item').forEach(el => el.classList.remove('selected', 'bg-red-100'));
        item.classList.add('selected', 'bg-red-100');
        
        hiddenIdInput.value = operatorId;
        searchInput.value = operatorName; 
        confirmButton.disabled = false; 
    };

    // Limpiar listeners anteriores para evitar duplicados (aunque el modal se reconstruye, es buena práctica)
    // Nota: Al usar innerHTML en showModal, los listeners viejos mueren, así que adjuntar nuevos es seguro.
    searchInput.addEventListener('input', handleSearch);
    suggestionsList.addEventListener('click', handleClick);
};

function getCurrentDateTimeLocal() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

const openAssignModal = async (otId) => {
    const row = document.querySelector(`#list-view tr[data-ot-id="${otId}"]`);
    if (!row) return;

    const currentStatusText = row.querySelector('td:nth-child(4) span').textContent.trim();
    const roleToAssign = stageToRoleMap[currentStatusText];

    if (!roleToAssign) {
        console.error(`No se encontró rol para: "${currentStatusText}"`);
        return;
    }

    window.UI.showModal('assign-modal-container', 'assign-modal-content');
    
    // Pequeño delay para asegurar que el DOM se actualizó
    setTimeout(async () => {
        // CORRECCIÓN: Usar getModalElement para poblar datos
        const hiddenOtIdInput = getModalElement('#assign-ot-id');
        const roleLabel = getModalElement('#assign-role-label');
        const modalTitle = getModalElement('#assign-modal-title');
        const searchInput = getModalElement('#assign-search-input'); 
        const dateTimeInput = getModalElement('#assign-datetime'); 
        
        if (dateTimeInput) dateTimeInput.value = getCurrentDateTimeLocal();
        if (hiddenOtIdInput) hiddenOtIdInput.value = otId;
        if (modalTitle) modalTitle.textContent = `Asignar Tarea: ${otId}`;
        if (roleLabel) roleLabel.textContent = `Asignar a Recurso (Rol: ${roleToAssign})`;
        if (searchInput) {
            searchInput.value = ''; 
            searchInput.focus(); // Poner foco para mejor UX
        }

        await renderSuggestions(roleToAssign);
        setupModalListeners(roleToAssign);
        
    }, 50); 
};

const setupListAssignButtons = () => {
    const listBody = document.getElementById('list-table-body');
    if (!listBody) return;

    listBody.addEventListener('click', (e) => {
        const assignButton = e.target.closest('.btn-assign-from-list');
        if (assignButton && !assignButton.disabled) {
            const otId = assignButton.closest('tr').dataset.otId;
            openAssignModal(otId);
        }
    });
};

const handleModalSubmit = async (e) => {
    if (e.target.id === 'assign-form') {
        e.preventDefault();
        
        // Buscar inputs DENTRO del formulario enviado para evitar errores
        const form = e.target;
        const otId = form.querySelector('#assign-ot-id').value;
        const resourceId = form.querySelector('#assign-resource-id').value;
        const resourceName = form.querySelector('#assign-search-input').value;
        const assignmentTime = form.querySelector('#assign-datetime').value; 

        if (!resourceId) return;
        
        const assignedRole = (await usersDB.getUsers()).find(op => op.id === resourceId)?.role || '';
        let newStatusText = 'Asignado';
        if (assignedRole.includes('Diseñador')) newStatusText = 'En Diseño';
        else if (assignedRole.includes('Prensa')) newStatusText = 'En Prensa';
        else if (assignedRole.includes('Post-Prensa')) newStatusText = 'En Post-Prensa';

        await productionDB.assignOT(otId, resourceId, resourceName, newStatusText, assignmentTime);
        
        window.UI.hideModal('assign-modal-container');
        window.UI.showNotification('Asignación Exitosa', `${otId} asignada a ${resourceName}.`);
        
        // Actualización visual
        const row = document.querySelector(`#list-view tr[data-ot-id="${otId}"]`);
        if (row) {
            let statusColor = 'bg-gray-100 text-gray-800';
            if (newStatusText.includes('Diseño')) statusColor = 'bg-yellow-100 text-yellow-800';
            else if (newStatusText.includes('Prensa')) statusColor = 'bg-blue-100 text-blue-800';
            else if (newStatusText.includes('Post-Prensa')) statusColor = 'bg-purple-100 text-purple-800';
            
            const badge = row.querySelector('td:nth-child(4) span');
            badge.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`;
            badge.textContent = newStatusText;
            
            const resourceCell = row.querySelector('td:nth-child(5)');
            resourceCell.textContent = resourceName;
            resourceCell.className = 'px-6 py-4 text-sm font-bold text-blue-600';
            
            const button = row.querySelector('.btn-assign-from-list');
            button.className = 'btn-assign-from-list px-4 py-2 text-sm bg-gray-300 text-gray-700 font-semibold rounded-lg';
            button.innerHTML = '<i data-lucide="check" class="w-4 h-4 inline mr-1"></i> Asignada';
            button.disabled = true;
            if (window.lucide) window.lucide.createIcons();
        }
    }
};

export const ProductionController = {
    init: function() {
        console.log("ProductionController inicializado.");
        setupListAssignButtons();
        
        const modalContainer = document.getElementById('assign-modal-container');
        if(modalContainer) {
            modalContainer.removeEventListener('submit', handleModalSubmit);
            modalContainer.addEventListener('submit', handleModalSubmit);
        }
    }
};