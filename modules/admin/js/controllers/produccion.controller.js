/**
 * js/controllers/produccion.controller.js
 *
 * Controlador mejorado que implementa la lógica de asignación
 * inteligente (filtro por rol y carga) como se describe en el
 * documento de análisis.
 */

// --- Simulación de Base de Datos Local ---
// (En una app real, esto vendría de Supabase o de la vista de usuarios)
const allOperators = [
    { id: 'u1', name: 'Carlos Ruiz', role: 'Diseñador (Pre-Prensa)', load: 2 },
    { id: 'u2', name: 'Elena Ríos', role: 'Diseñador (Pre-Prensa)', load: 5 },
    { id: 'u3', name: 'David Flores', role: 'Diseñador (Pre-Prensa)', load: 1 },
    { id: 'u4', name: 'Luis Torres', role: 'Operador (Prensa)', load: 1 },
    { id: 'u5', name: 'Ana Fernandez', role: 'Operador (Prensa)', load: 4 },
    { id: 'u6', name: 'Maria Paz', role: 'Operador (Post-Prensa)', load: 3 },
    { id: 'u7', name: 'Javier Solis', role: 'Operador (Post-Prensa)', load: 0 },
];

// Mapea el estado de la tabla a un rol de usuario
const stageToRoleMap = {
    'Pre-Prensa Pendiente': 'Diseñador (Pre-Prensa)',
    'En Diseño': 'Diseñador (Pre-Prensa)',
    'Listo para Prensa': 'Operador (Prensa)',
    'En Prensa': 'Operador (Prensa)',
    'Listo para Acabados': 'Operador (Post-Prensa)',
    'En Post-Prensa': 'Operador (Post-Prensa)'
};
// --- Fin Simulación ---


/**
 * Renderiza la lista de sugerencias de operadores en el modal.
 * Filtra por rol, ordena por carga y aplica un término de búsqueda.
 * @param {string} role - El rol a filtrar (ej. "Diseñador (Pre-Prensa)").
 * @param {string} [searchTerm=""] - Término de búsqueda opcional.
 */
const renderSuggestions = (role, searchTerm = "") => {
    const listEl = document.getElementById('assign-suggestions-list');
    if (!listEl) return;

    listEl.innerHTML = ''; // Limpiar lista anterior
    searchTerm = searchTerm.toLowerCase();

    // 1. Filtrar por Rol
    let suggestions = allOperators.filter(op => op.role === role);

    // 2. Filtrar por Búsqueda (si existe)
    if (searchTerm) {
        suggestions = suggestions.filter(op => op.name.toLowerCase().includes(searchTerm));
    }

    // 3. Ordenar por Carga
    suggestions.sort((a, b) => a.load - b.load);

    // 4. Limitar a 5 sugerencias si no se está buscando (según el análisis)
    if (!searchTerm) {
        suggestions = suggestions.slice(0, 5);
    }
    
    // 5. Renderizar
    if (suggestions.length === 0) {
        listEl.innerHTML = `<p class="p-4 text-sm text-gray-500">No se encontraron operadores para "${role}" ${searchTerm ? 'con el nombre "' + searchTerm + '"' : ''}.</p>`;
        return;
    }

    suggestions.forEach(op => {
        const item = document.createElement('div');
        item.className = 'suggestion-item flex justify-between items-center p-3 border-b border-gray-200';
        item.dataset.id = op.id;
        item.dataset.name = op.name;
        
        item.innerHTML = `
            <div>
                <p class="font-semibold">${op.name}</p>
                <p class="text-sm text-gray-500">${op.role}</p>
            </div>
            <span class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Carga: ${op.load}</span>
        `;
        listEl.appendChild(item);
    });
};

/**
 * Configura los listeners para el modal inteligente (búsqueda y clic).
 * Esta función debe llamarse CADA VEZ que se inyecta el modal.
 * @param {string} role - El rol para el cual filtrar.
 */
const setupModalListeners = (role) => {
    const searchInput = document.getElementById('assign-search-input');
    const suggestionsList = document.getElementById('assign-suggestions-list');
    const hiddenIdInput = document.getElementById('assign-resource-id');
    const confirmButton = document.getElementById('confirm-assign-button');
    
    if (!searchInput || !suggestionsList || !hiddenIdInput || !confirmButton) return;

    // Deshabilitar confirmación hasta que se seleccione uno
    confirmButton.disabled = true;

    // 1. Listener de Búsqueda
    const handleSearch = (e) => {
        const searchTerm = e.target.value;
        hiddenIdInput.value = ""; // Limpiar selección si se escribe de nuevo
        confirmButton.disabled = true; // Deshabilitar
        renderSuggestions(role, searchTerm);
    };
    
    // 2. Listener de Clic en Sugerencia
    const handleClick = (e) => {
        const item = e.target.closest('.suggestion-item');
        if (!item) return;

        const operatorId = item.dataset.id;
        const operatorName = item.dataset.name;

        // Limpiar selección anterior
        suggestionsList.querySelectorAll('.suggestion-item').forEach(el => el.classList.remove('selected'));
        
        // Resaltar selección
        item.classList.add('selected');
        
        // Guardar datos
        hiddenIdInput.value = operatorId;
        searchInput.value = operatorName; // Poner el nombre en el input
        confirmButton.disabled = false; // Habilitar confirmación
        
        console.log(`Operador seleccionado: ${operatorName} (ID: ${operatorId})`);
    };

    // Adjuntar listeners
    searchInput.addEventListener('input', handleSearch);
    suggestionsList.addEventListener('click', handleClick);
};


/**
 * Abre el modal de asignación de OT y lo prepara con el filtro de rol correcto.
 * @param {string} otId - El ID de la Orden de Trabajo (ej. "OT-1234").
 */
const openAssignModal = (otId) => {
    const row = document.querySelector(`#list-view tr[data-ot-id="${otId}"]`);
    if (!row) {
        console.error(`No se encontró la fila para la OT: ${otId}`);
        return;
    }

    const currentStatusText = row.querySelector('td:nth-child(4) span').textContent.trim();
    const roleToAssign = stageToRoleMap[currentStatusText];

    if (!roleToAssign) {
        console.error(`No se pudo encontrar un rol para el estado: "${currentStatusText}"`);
        return;
    }

    // 1. Mostrar el modal (inyecta el HTML)
    window.UI.showModal('assign-modal-container', 'assign-modal-content');
    
    // 2. Poblar el modal (esto debe hacerse *después* de que showModal inyecte el HTML)
    const hiddenOtIdInput = document.getElementById('assign-ot-id');
    const roleLabel = document.getElementById('assign-role-label');
    const modalTitle = document.getElementById('assign-modal-title');

    if (hiddenOtIdInput) hiddenOtIdInput.value = otId;
    if (modalTitle) modalTitle.textContent = `Asignar Tarea: ${otId}`;
    if (roleLabel) roleLabel.textContent = `Asignar a Recurso (Rol: ${roleToAssign})`;

    // 3. Renderizar las sugerencias iniciales (ordenadas por carga)
    renderSuggestions(roleToAssign);
    
    // 4. Adjuntar los listeners de búsqueda y clic para el modal recién creado
    setupModalListeners(roleToAssign);
};

/**
 * Configura los botones "Asignar" en la Vista de Lista.
 */
const setupListAssignButtons = () => {
    const listBody = document.getElementById('list-table-body');
    if (!listBody) return;

    // Usar delegación de eventos en el cuerpo de la tabla
    listBody.addEventListener('click', (e) => {
        const assignButton = e.target.closest('.btn-assign-from-list');
        if (assignButton && !assignButton.disabled) {
            const otId = assignButton.closest('tr').dataset.otId;
            openAssignModal(otId);
        }
    });
};

/**
 * Manejador global para el envío del formulario del modal de asignación.
 */
const handleModalSubmit = (e) => {
    if (e.target.id === 'assign-form') {
        e.preventDefault();
        
        const otId = document.getElementById('assign-ot-id').value;
        const resourceId = document.getElementById('assign-resource-id').value;
        const resourceName = document.getElementById('assign-search-input').value; // El nombre del input

        if (!resourceId) {
             // (En una app real, mostraríamos un error en el modal)
            console.warn("Intento de asignar sin seleccionar un recurso.");
            return;
        }
        
        console.log(`[ACCIÓN] Asignación de OT ${otId} confirmada. Recurso ID: ${resourceId} (Nombre: ${resourceName})`);
        
        // Aquí iría la lógica para:
        // 1. Actualizar la base de datos (Supabase)
        // 2. Ocultar el modal
        window.UI.hideModal('assign-modal-container');
        
        // 3. Simulación de actualización de UI:
        const row = document.querySelector(`#list-view tr[data-ot-id="${otId}"]`);
        if (row) {
            // Cambiar estado
            row.querySelector('td:nth-child(4) span').className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
            
            // Determinar el nuevo estado basado en el rol
            const assignedRole = allOperators.find(op => op.id === resourceId)?.role || '';
            let newStatusText = 'Asignado';
            if (assignedRole.includes('Diseñador')) newStatusText = 'En Diseño';
            if (assignedRole.includes('Prensa')) newStatusText = 'En Prensa';
            if (assignedRole.includes('Post-Prensa')) newStatusText = 'En Acabados';

            row.querySelector('td:nth-child(4) span').textContent = newStatusText;
            
            // Asignar recurso
            row.querySelector('td:nth-child(5)').textContent = resourceName;
            row.querySelector('td:nth-child(5)').className = 'px-6 py-4 text-sm font-bold text-blue-600';
            
            // Deshabilitar botón
            const button = row.querySelector('.btn-assign-from-list');
            button.innerHTML = '<i data-lucide="check" class="w-4 h-4 inline mr-1"></i> Asignada';
            button.disabled = true;
            if (window.lucide) window.lucide.createIcons(); // Re-renderizar icono
        }
    }
};

export const ProductionController = {
    init: function() {
        console.log("ProductionController (Escalable - Solo Lista) inicializado.");
        
        // 1. Configurar los botones "Asignar" en la Vista de Lista
        setupListAssignButtons();

        // 2. Listener del formulario del modal (un solo listener para ambas vistas)
        const modalContainer = document.getElementById('assign-modal-container');
        if(modalContainer) {
            // Limpiar listener anterior si existiera
            modalContainer.removeEventListener('submit', handleModalSubmit);
            // Adjuntar nuevo listener
            modalContainer.addEventListener('submit', handleModalSubmit);
        }
    }
};