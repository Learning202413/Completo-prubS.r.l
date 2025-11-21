// Importa el nuevo servicio de usuarios
import { usersDB } from '../services/users.db.js';

export const UsuariosController = {
    // Estado de paginación
    currentPage: 1,
    itemsPerPage: 10,
    
    // Estado de ordenamiento: Por defecto, ordenar por nombre ascendente
    sortState: { 
        key: 'name', 
        direction: 'asc' 
    },

    init: async function() {
        console.log("UsuariosController: Iniciando con BD de Usuarios...");
        await this.applyFilters();
        this.setupEvents();
        // Inicializar eventos de ordenamiento
        this.setupSortEvents(); 
    },

    // --- LÓGICA DE ORDENAMIENTO ---
    sortUsers(users, key, direction) {
        // Ordenar numéricamente si es un campo numérico, o alfabéticamente
        const isNumeric = ['id'].includes(key); 
        
        users.sort((a, b) => {
            let valA = a[key] || (isNumeric ? 0 : '');
            let valB = b[key] || (isNumeric ? 0 : '');

            // Convertir a minúsculas para un ordenamiento alfabético insensible a mayúsculas
            if (!isNumeric && typeof valA === 'string' && typeof valB === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            let comparison = 0;
            if (valA > valB) {
                comparison = 1;
            } else if (valA < valB) {
                comparison = -1;
            }

            // Aplicar dirección
            return direction === 'asc' ? comparison : comparison * -1;
        });
        
        return users;
    },

    // Función central para leer filtros, ordenar, paginar y actualizar tabla
    async applyFilters() {
        // 1. Obtener valores de los filtros
        const searchTerm = document.getElementById('search-user-input')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('filter-role')?.value || '';
        const statusFilter = document.getElementById('filter-status')?.value || '';

        // 2. Obtener todos los datos frescos de la DB
        const users = await usersDB.getUsers(); // Usa usersDB

        // 3. Aplicar lógica de filtrado
        const filteredUsers = users.filter(user => {
            const matchesSearch = (user.name && user.name.toLowerCase().includes(searchTerm)) || 
                                  (user.email && user.email.toLowerCase().includes(searchTerm));
            const matchesRole = roleFilter ? user.role === roleFilter : true;
            const matchesStatus = statusFilter ? user.status === statusFilter : true;
            return matchesSearch && matchesRole && matchesStatus;
        });

        // 4. Aplicar Ordenamiento
        const sortedUsers = this.sortUsers(filteredUsers, this.sortState.key, this.sortState.direction);

        // 5. Lógica de Paginación
        const totalItems = sortedUsers.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }
        if (this.currentPage < 1) this.currentPage = 1;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

        // 6. Renderizar
        this.renderTable(paginatedUsers);
        this.renderPagination(totalItems, startIndex + 1, Math.min(endIndex, totalItems), totalPages);
    },

    renderTable(users) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">No se encontraron usuarios.</td></tr>';
            return;
        }
        
        const sortKey = this.sortState.key;
        const sortDir = this.sortState.direction;
        
        // Función auxiliar para obtener el icono de ordenamiento a la izquierda
        const getSortIcon = (key) => {
            if (sortKey === key) {
                // Se usa mr-1 (margin-right) para separarlo del texto que viene después
                return `<i data-lucide="${sortDir === 'asc' ? 'arrow-down-narrow-wide' : 'arrow-up-narrow-wide'}" class="w-4 h-4 mr-1"></i>`;
            }
            return '';
        };

        // ACTUALIZACIÓN: Se usa la clase 'flex items-center justify-start' para el icono a la izquierda
        const thead = document.querySelector('.table-header-bg tr');
        if (thead) {
            thead.innerHTML = `
                <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" data-sort-key="name">
                    <div class="flex items-center justify-start">${getSortIcon('name')}Nombre Completo</div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" data-sort-key="email">
                    <div class="flex items-center justify-start">${getSortIcon('email')}Email</div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" data-sort-key="role">
                    <div class="flex items-center justify-start">${getSortIcon('role')}Rol Asignado</div>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" data-sort-key="status">
                    <div class="flex items-center justify-start">${getSortIcon('status')}Estado (Presence)</div>
                </th>
                <th class="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
            `;
        }

        // Renderizado del cuerpo de la tabla
        users.forEach(user => {
            const isOnline = user.status === 'Online';
            const statusColor = isOnline ? 'text-green-600' : 'text-gray-500';
            const dotColor = isOnline ? 'bg-green-500' : 'bg-gray-400';

            const row = `
                <tr class="hover:bg-gray-50 group transition-colors duration-150">
                    <td class="px-6 py-4 font-bold text-gray-900">${user.name || 'Sin Nombre'}</td>
                    <td class="px-6 py-4 text-gray-500">${user.email || 'Sin Email'}</td>
                    <td class="px-6 py-4 text-gray-700">${user.role || 'Sin Rol'}</td>
                    <td class="px-6 py-4">
                        <span class="flex items-center text-xs font-bold ${statusColor}">
                            <span class="w-2 h-2 rounded-full mr-2 ${dotColor}"></span>
                            ${user.status || 'Offline'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center space-x-2">
                        <button class="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition btn-edit" data-id="${user.id}">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button class="text-red-600 hover:bg-red-100 p-2 rounded-lg transition btn-delete" data-id="${user.id}" data-name="${user.name}">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
        
        if(window.lucide) window.lucide.createIcons();
    },

    // ACTIALIZACIÓN: Paginación (D1: Icono + Borde)
    renderPagination(totalItems, startItem, endItem, totalPages) {
        const container = document.getElementById('pagination-controls');
        if (!container) return;

        if (totalItems === 0) {
            container.innerHTML = '<span class="text-sm text-gray-500">No se encontraron resultados.</span>';
            return;
        }

        container.innerHTML = `
            <div class="text-sm text-gray-600">
                Mostrando <span class="font-bold text-gray-900">${startItem}</span> a <span class="font-bold text-gray-900">${endItem}</span> de <span class="font-bold text-gray-900">${totalItems}</span> usuarios
            </div>
            <div class="flex space-x-2">
                <!-- D1: Icono + Borde -->
                <button id="btn-prev-page" class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <span class="px-3 py-1 text-sm font-medium text-gray-700">Página ${this.currentPage}</span>
                <button id="btn-next-page" class="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" ${this.currentPage >= totalPages ? 'disabled' : ''}>
                    <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        
        if(window.lucide) window.lucide.createIcons();

        document.getElementById('btn-prev-page')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.applyFilters();
            }
        });

        document.getElementById('btn-next-page')?.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.applyFilters();
            }
        });
    },
    
    // --- EVENTOS DE ORDENAMIENTO ---
    setupSortEvents() {
        // Usamos delegación de eventos para capturar clics en los TH
        document.querySelector('.table-header-bg')?.addEventListener('click', (e) => {
            const th = e.target.closest('th');
            const key = th?.dataset.sortKey;

            // Asegurarse de que no estamos haciendo clic en la columna de Acciones
            if (key) {
                // Si la clave es la misma, invertir dirección; si es nueva, ascender por defecto
                if (this.sortState.key === key) {
                    this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortState.key = key;
                    this.sortState.direction = 'asc';
                }
                
                // Reiniciar a la primera página después de ordenar
                this.currentPage = 1;
                this.applyFilters();
            }
        });
    },

    setupEvents() {
        // --- EVENTOS DE FILTRADO (Resetean a página 1) ---
        const resetPageAndFilter = () => {
            this.currentPage = 1;
            this.applyFilters();
        };

        document.getElementById('search-user-input')?.addEventListener('input', resetPageAndFilter);
        document.getElementById('filter-role')?.addEventListener('change', resetPageAndFilter);
        document.getElementById('filter-status')?.addEventListener('change', resetPageAndFilter);

        // --- CREACIÓN / EDICIÓN ---
        document.getElementById('btn-create-user')?.addEventListener('click', () => {
            const form = document.getElementById('user-create-form');
            if(form) form.reset();
            window.UI.showModal('user-modal-container', 'user-create-modal-content');
        });

        document.getElementById('user-modal-container')?.addEventListener('submit', async (e) => {
            
            // CREAR
            if (e.target.id === 'user-create-form') {
                e.preventDefault();
                const form = e.target; // Usamos e.target para buscar en el modal activo
                
                // Corrección de campos vacíos: extracción del formulario específico
                const newUser = {
                    name: form.querySelector('#user-create-name').value,
                    email: form.querySelector('#user-create-email').value,
                    role: form.querySelector('#user-create-role').value,
                    status: 'Offline'
                };

                // NOTE: El alert() ha sido reemplazado por una notificación o modal de error si fuera necesario, 
                // pero por ahora mantendremos el return simple para no introducir UI extra.
                if (!newUser.name || !newUser.email) {
                    console.error("El nombre y el email son obligatorios.");
                    return;
                }

                await usersDB.addUser(newUser); // Usa usersDB
                window.UI.hideModal('user-modal-container');
                window.UI.showNotification('Éxito', 'Usuario creado correctamente.');
                
                // Limpiar filtros y volver a página 1 para ver el nuevo
                document.getElementById('search-user-input').value = '';
                this.currentPage = 1; 
                this.applyFilters();
            }

            // EDITAR
            if (e.target.id === 'user-edit-form') {
                e.preventDefault();
                const form = e.target; // Usamos e.target para buscar en el modal activo
                const id = form.querySelector('#user-edit-id-field').value;
                
                const updates = {
                    name: form.querySelector('#user-edit-name').value,
                    email: form.querySelector('#user-edit-email').value,
                    role: form.querySelector('#user-edit-role').value,
                };

                await usersDB.updateUser(id, updates); // Usa usersDB
                window.UI.hideModal('user-modal-container');
                window.UI.showNotification('Actualizado', 'Datos modificados.');
                
                // Mantiene la página y filtros actuales
                this.applyFilters();
            }
        });

        // --- ELIMINAR / ABRIR EDITAR (Delegación) ---
        const tbody = document.getElementById('users-table-body');
        tbody?.addEventListener('click', async (e) => {
            // Eliminar
            const btnDelete = e.target.closest('.btn-delete');
            if (btnDelete) {
                const id = btnDelete.dataset.id;
                const name = btnDelete.dataset.name;
                window.UI.showConfirmModal('Eliminar Usuario', `¿Eliminar a ${name}?`, 'Sí, eliminar', async () => {
                    await usersDB.deleteUser(id); // Usa usersDB
                    this.applyFilters(); // Recalcula paginación
                });
            }
            
            // Editar
            const btnEdit = e.target.closest('.btn-edit');
            if (btnEdit) {
                const id = btnEdit.dataset.id;
                const users = await usersDB.getUsers(); // Usa usersDB
                const user = users.find(u => u.id === id);
                if (user) {
                    window.UI.showModal('user-modal-container', 'user-edit-modal-content');
                    // Llenar campos en el modal visible
                    const container = document.getElementById('user-modal-container');
                    if(container) {
                        container.querySelector('#user-edit-id-field').value = user.id;
                        container.querySelector('#user-edit-name').value = user.name;
                        container.querySelector('#user-edit-email').value = user.email;
                        container.querySelector('#user-edit-role').value = user.role;
                    }
                }
            }
        });
    }
};