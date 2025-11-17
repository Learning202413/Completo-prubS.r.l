// /produccion-interna/modules/admin/js/controllers/usuarios.controller.js

import { UsuariosService } from '../services/usuarios.service.js';

// Asumimos que UI está disponible globalmente a través de window.UI

// Variable para almacenar el estado de los usuarios (datos reales de Supabase)
let allUsers = []; 

/**
 * Renderiza la tabla de usuarios con los datos proporcionados.
 * @param {Array<Object>} users - Lista de objetos de usuario.
 */
const renderUsersTable = (users) => {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Limpiar tabla
    
    users.forEach(user => {
        // Asumiendo que user tiene { id, name, email, role, status }
        const statusClass = user.status === 'Online' ? 'text-green-600 bg-green-500' : 'text-gray-500 bg-gray-400';
        
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        row.setAttribute('data-user-id', user.id);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${user.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${user.role.includes('Admin') ? 'font-bold text-red-600' : 'text-gray-500'}">${user.role}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm" data-status-value="${user.status}">
                <span class="flex items-center text-xs font-semibold ${statusClass}">
                    <span class="w-2 h-2 rounded-full mr-1.5 ${statusClass.split(' ')[1].replace('text-', 'bg-')}"></span>${user.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                <button class="text-blue-600 hover:text-blue-800 p-1 btn-edit-user" title="Editar" data-action="edit" data-user-id="${user.id}"><i data-lucide="edit" class="w-5 h-5"></i></button>
                <button class="text-red-600 hover:text-red-800 p-1 btn-delete-user" title="Eliminar" data-user-name="${user.name}" data-user-id="${user.id}"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Despues de renderizar, re-aplicamos los filtros si hay alguno activo
    applyFilters(users);
    
    // Si usas lucide, asegúrate de que se re-renderice
    if (window.lucide) window.lucide.createIcons();
};


// NOTA: Se definen todos los manejadores de eventos como funciones constantes
// para poder usar removeEventListener antes de adjuntarlos en init().

const handleUserDelete = (userId, userName) => {
    // 1. Mostrar el modal de confirmación
    window.UI.showConfirmModal(
        `Confirmar Eliminación de Usuario`,
        `¿Está seguro de que desea eliminar permanentemente al usuario "${userName}" (ID: ${userId})? Esta acción es irreversible.`,
        `Sí, Eliminar Usuario`,
        async () => {
            // Lógica de eliminación (ejecutada al confirmar)
            console.log(`[ACCIÓN] Llamando al servicio para eliminar usuario ID: ${userId}...`);
            
            const result = await UsuariosService.deleteUser(userId);

            if (result.success) {
                window.UI.showToast(`Usuario ${userName} eliminado.`, 'success');
                // Recargar o actualizar la lista de usuarios
                fetchUsersAndRender();
            } else {
                window.UI.showToast(`Error: ${result.error}`, 'error');
            }
        }
    );
};

// Función para precargar datos en el modal de edición
const setupModalForEdit = (userId) => {
    const form = document.getElementById('user-edit-form');
    if (form) form.reset(); 
    
    const userIdField = document.getElementById('user-edit-id-field');
    if (userIdField) userIdField.value = userId;

    // Buscar el usuario en la lista global
    const userData = allUsers.find(u => u.id === userId);
    
    if (userData) {
        document.getElementById('user-edit-email').value = userData.email;
        document.getElementById('user-edit-name').value = userData.name;
        document.getElementById('user-edit-role').value = userData.role;
        document.getElementById('user-edit-password').value = ''; // Siempre limpiar la contraseña
        console.log(`[UI] Datos del usuario ${userId} precargados para edición.`);
    } else {
        console.error(`Usuario con ID ${userId} no encontrado en el estado.`);
    }
};

// Función para configurar el modal para la creación
const setupModalForCreation = () => {
    const form = document.getElementById('user-create-form');
    if (form) form.reset();
};

// Funciones de utilidad para Filtros (se actualiza para filtrar sobre 'allUsers')
const applyFilters = () => {
    const searchInput = document.getElementById('search-user-input')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('filter-role')?.value || '';
    const statusFilter = document.getElementById('filter-status')?.value || '';
    const tableBody = document.getElementById('users-table-body');
    
    if (!tableBody) return;
    
    console.log(`[FILTRO] Aplicando filtros: Búsqueda: "${searchInput}", Rol: "${roleFilter}", Estado: "${statusFilter}"`);

    // El filtrado es en el DOM ya renderizado
    Array.from(tableBody.children).forEach(row => {
        const name = row.children[0].textContent.toLowerCase();
        const email = row.children[1].textContent.toLowerCase();
        const role = row.children[2].textContent;
        const status = row.querySelector('[data-status-value]')?.getAttribute('data-status-value');

        const matchesSearch = !searchInput || name.includes(searchInput) || email.includes(searchInput);
        const matchesRole = !roleFilter || role === roleFilter;
        const matchesStatus = !statusFilter || status === statusFilter;

        if (matchesSearch && matchesRole && matchesStatus) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
};

/**
 * Obtiene la lista de usuarios de Supabase y renderiza la tabla.
 */
const fetchUsersAndRender = async () => {
    window.UI.showLoader(); // Muestra un loader
    const users = await UsuariosService.getAllUsers();
    window.UI.hideLoader(); // Oculta el loader
    
    if (users) {
        allUsers = users; // Almacenar el estado
        renderUsersTable(allUsers);
    } else {
        // Manejar error de carga (e.g., mostrar mensaje en la tabla)
        window.UI.showToast("No se pudieron cargar los usuarios.", 'error');
        renderUsersTable([]);
    }
}


// ======================================================================
// MANEJADORES DE EVENTOS NOMBRADOS PARA LIMPIEZA
// ======================================================================

// 1. Manejador para el botón de Creación
const handleCreateUserClick = () => {
    window.UI.showModal('user-modal-container', 'user-create-modal-content');
    setupModalForCreation(); 
};

// 2. Manejador para la delegación de eventos en la tabla (Editar/Eliminar)
const handleTableClick = (e) => {
    const deleteButton = e.target.closest('.btn-delete-user');
    const editButton = e.target.closest('.btn-edit-user');
    
    if (deleteButton) {
        const userId = deleteButton.getAttribute('data-user-id');
        const userName = deleteButton.getAttribute('data-user-name');
        if (userId && userName) {
            handleUserDelete(userId, userName);
        }
    } else if (editButton) {
        const userId = editButton.getAttribute('data-user-id');
        console.log(`[ACCIÓN] Editar usuario con ID: ${userId}. Abriendo modal.`);
        
        window.UI.showModal('user-modal-container', 'user-edit-modal-content');
        setupModalForEdit(userId);
    }
};

// 3. Manejador para el Submit del Formulario Modal (Ahora maneja ambos formularios)
const handleModalSubmit = async (e) => {
    const formId = e.target.id;

    if (formId === 'user-create-form' || formId === 'user-edit-form') {
        e.preventDefault();
        
        const isCreate = formId === 'user-create-form';
        const actionType = isCreate ? 'create' : 'edit';
        
        // Obtener datos comunes
        const email = document.getElementById(`user-${actionType}-email`).value;
        const name = document.getElementById(`user-${actionType}-name`).value;
        const password = document.getElementById(`user-${actionType}-password`).value; 
        const role = document.getElementById(`user-${actionType}-role`).value;

        window.UI.showLoader();

        if (isCreate) {
            // Lógica de Creación/Invitación
            const result = await UsuariosService.createUser(email, password, { name, role });
            
            if (result.success) {
                window.UI.showToast(`Usuario ${name} creado exitosamente.`, 'success');
                fetchUsersAndRender(); // Recargar la lista
            } else {
                window.UI.showToast(`Error al crear usuario: ${result.error}`, 'error');
            }
        } else { 
            // Lógica de Edición
            const userId = document.getElementById('user-edit-id-field').value;
            // Lógica de update. Usar UsuariosService.updateUser(userId, data, password)
            console.log(`[ACCIÓN: EDIT] Llamando a update para ID ${userId}...`);
            window.UI.showToast("Edición simulada: La lógica de edición debe ser implementada en el Service.", 'info');
        }

        window.UI.hideLoader();
        window.UI.hideModal('user-modal-container');
    }
};


export const UsuariosController = {
    init: function() {
        console.log("UsuariosController inicializado. Configurando gestión de usuarios y conectando a Supabase.");
        
        // 0. Cargar los usuarios al iniciar
        fetchUsersAndRender(); 

        const tableBody = document.getElementById('users-table-body');
        const btnCreateUser = document.getElementById('btn-create-user');
        const modalContainer = document.getElementById('user-modal-container');
        
        // 1. Configurar botón de Creación
        if (btnCreateUser) {
            btnCreateUser.removeEventListener('click', handleCreateUserClick); 
            btnCreateUser.addEventListener('click', handleCreateUserClick);
        }
        
        // 2. Configurar el listener de la tabla (Delegación de eventos para Editar/Eliminar)
        if (tableBody) {
             tableBody.removeEventListener('click', handleTableClick); 
             tableBody.addEventListener('click', handleTableClick);
        }
        
        // 3. Configurar listeners de Filtros
        document.getElementById('search-user-input')?.removeEventListener('input', applyFilters);
        document.getElementById('filter-role')?.removeEventListener('change', applyFilters);
        document.getElementById('filter-status')?.removeEventListener('change', applyFilters);

        document.getElementById('search-user-input')?.addEventListener('input', applyFilters);
        document.getElementById('filter-role')?.addEventListener('change', applyFilters);
        document.getElementById('filter-status')?.addEventListener('change', applyFilters);
        
        // 4. Configurar el formulario (Submit)
        if (modalContainer) {
            modalContainer.removeEventListener('submit', handleModalSubmit);
            modalContainer.addEventListener('submit', handleModalSubmit);
        }
        
        // NOTA: applyFilters ya se llama dentro de fetchUsersAndRender
    }
};