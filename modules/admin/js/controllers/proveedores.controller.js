// Importa el nuevo servicio de proveedores
import { providersDB } from '../services/providers.db.js';

export const ProveedoresController = {
    // --- ESTADO DE LA TABLA ---
    currentPage: 1,
    itemsPerPage: 10,
    sortState: { 
        key: 'name',
        direction: 'asc' 
    },

    init: async function() {
        console.log("ProveedoresController: Iniciando...");
        await this.applyFiltersAndPagination();
        this.setupEvents();
        this.setupSortEvents();
    },

    // --- LÓGICA DE ORDENAMIENTO (Mantenida) ---
    sortProviders(list, key, direction) {
        list.sort((a, b) => {
            let valA = a[key] ? a[key].toString().toLowerCase() : '';
            let valB = b[key] ? b[key].toString().toLowerCase() : '';
            let comparison = 0;
            if (valA > valB) comparison = 1;
            else if (valA < valB) comparison = -1;
            return direction === 'asc' ? comparison : comparison * -1;
        });
        return list;
    },

    // --- FUNCIÓN CENTRAL: FILTRAR, ORDENAR Y PAGINAR (Mantenida) ---
    async applyFiltersAndPagination() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const providers = await providersDB.getProviders(); // Usa providersDB

        const filtered = providers.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchTerm)) || 
            (p.taxId && p.taxId.includes(searchTerm)) ||
            (p.insumos && p.insumos.toLowerCase().includes(searchTerm))
        );

        const sorted = this.sortProviders(filtered, this.sortState.key, this.sortState.direction);
        const totalItems = sorted.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (this.currentPage > totalPages && totalPages > 0) this.currentPage = totalPages;
        if (this.currentPage < 1) this.currentPage = 1;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginated = sorted.slice(startIndex, endIndex);

        this.renderTable(paginated);
        this.renderPagination(totalItems, startIndex + 1, Math.min(endIndex, totalItems), totalPages);
    },

    renderTable(list) {
        const tbody = document.getElementById('provider-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-gray-500">No hay proveedores registrados o no cumplen con los criterios de búsqueda.</td></tr>';
            this.updateTableHeader(); 
            return;
        }
        
        this.updateTableHeader();

        list.forEach(p => {
            // Aseguramos que insumos sea un string antes de split
            const rawInsumos = p.insumos || ''; 
            const insumosArray = rawInsumos.split(',');

            const insumosHtml = insumosArray
                .filter(tag => tag.trim().length > 0)
                .map(tag => 
                    `<span class="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full mr-1 inline-block my-1">${tag.trim()}</span>`
                ).join('');

            const row = `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-bold text-gray-900">${p.name}</td>
                    <td class="px-6 py-4 text-gray-500 font-mono">${p.taxId}</td>
                    <td class="px-6 py-4 text-gray-700">${p.contact}</td>
                    <td class="px-6 py-4">${insumosHtml}</td>
                    <td class="px-6 py-4 text-center space-x-2">
                        <button class="text-blue-600 p-2 rounded hover:bg-blue-100 btn-edit" data-id="${p.id}"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button class="text-red-600 p-2 rounded hover:bg-blue-100 btn-delete" data-id="${p.id}" data-name="${p.name}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
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
            container.innerHTML = '<span class="text-sm text-gray-500">Sin resultados.</span>';
            return;
        }

        container.innerHTML = `
            <div class="text-sm text-gray-600">
                Mostrando <span class="font-bold text-gray-900">${startItem}</span> a <span class="font-bold text-gray-900">${endItem}</span> de <span class="font-bold text-gray-900">${totalItems}</span> proveedores
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
                this.applyFiltersAndPagination();
            }
        });
        document.getElementById('btn-next-page')?.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.applyFiltersAndPagination();
            }
        });
    },

    updateTableHeader() {
        const thead = document.querySelector('.table-header-bg tr');
        if (!thead) return;
        const sortKey = this.sortState.key;
        const sortDir = this.sortState.direction;
        const getSortIcon = (key) => {
            if (sortKey === key) {
                return `<i data-lucide="${sortDir === 'asc' ? 'arrow-down-narrow-wide' : 'arrow-up-narrow-wide'}" class="w-4 h-4 mr-1"></i>`;
            }
            return '';
        };

        thead.innerHTML = `
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" data-sort-key="name">
                <div class="flex items-center justify-start">${getSortIcon('name')}Nombre del Proveedor</div>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" data-sort-key="taxId">
                <div class="flex items-center justify-start">${getSortIcon('taxId')}RUC/NIT</div>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" data-sort-key="contact">
                <div class="flex items-center justify-start">${getSortIcon('contact')}Contacto Principal</div>
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer" data-sort-key="insumos">
                <div class="flex items-center justify-start">${getSortIcon('insumos')}Categoría</div>
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
        `;
        if(window.lucide) window.lucide.createIcons();
    },

    setupSortEvents() {
        const thead = document.querySelector('.table-header-bg');
        if (!thead) return;
        thead.addEventListener('click', (e) => {
            const th = e.target.closest('th');
            const key = th?.dataset.sortKey;
            if (key) {
                if (this.sortState.key === key) {
                    this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortState.key = key;
                    this.sortState.direction = 'asc';
                }
                this.currentPage = 1;
                this.applyFiltersAndPagination();
            }
        });
    },

    addCategoryField(containerElement, initialValue = '') {
        if (!containerElement) {
            console.error("Contenedor de categorías no encontrado");
            return;
        }
        
        const inputId = `category-input-${Date.now()}`;
        
        // Input (A1: Estándar 40px)
        const inputHtml = `
            <div class="flex items-center space-x-2 dynamic-category-row mt-2">
                <input type="text" id="${inputId}" value="${initialValue}" placeholder="Añadir otra categoría" class="form-input dynamic-category-input w-full px-3 py-2 border border-gray-300 rounded-lg">
                <button type="button" class="text-red-500 hover:text-red-700 p-2 btn-remove-category">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        containerElement.insertAdjacentHTML('beforeend', inputHtml);
        if(window.lucide) window.lucide.createIcons(); 
    },

    collectCategories(formElement) {
        if (!formElement) return '';
        // Buscamos inputs SOLO dentro de este formulario específico
        const allInputs = formElement.querySelectorAll('.dynamic-category-input');
        let allCategories = [];
        allInputs.forEach(input => {
            if (input.value.trim().length > 0) {
                allCategories.push(input.value.trim());
            }
        });
        return allCategories.join(',');
    },

    setupEvents() {
        document.getElementById('search-input')?.addEventListener('input', () => {
            this.currentPage = 1;
            this.applyFiltersAndPagination();
        });

        // --- Delegación de Eventos (Modales) ---
        document.getElementById('provider-modal-container')?.addEventListener('click', (e) => {
            // CASO: Añadir Categoría (Crear)
            const btnAddCreate = e.target.closest('#btn-add-category-create');
            if (btnAddCreate) {
                const form = btnAddCreate.closest('form');
                const container = form.querySelector('#category-fields-container-create');
                this.addCategoryField(container);
                return;
            }
            
            // CASO: Añadir Categoría (Editar)
            const btnAddEdit = e.target.closest('#btn-add-category-edit');
            if (btnAddEdit) {
                const form = btnAddEdit.closest('form');
                const container = form.querySelector('#category-fields-container-edit');
                this.addCategoryField(container);
                return;
            }
            
            // ELIMINAR CATEGORÍA
            const btnRemove = e.target.closest('.btn-remove-category');
            if (btnRemove) {
                btnRemove.closest('.dynamic-category-row')?.remove();
            }
        });

        // --- CRUD: Abrir Modal Crear ---
        document.getElementById('btn-add-provider')?.addEventListener('click', () => {
            const originalForm = document.getElementById('provider-create-form');
            if(originalForm) originalForm.reset();

            window.UI.showModal('provider-modal-container', 'provider-create-modal-content');
            
            // FIX: Limpiar contenedor usando selectores robustos DESPUÉS de abrir el modal
            setTimeout(() => {
                const modalContainer = document.getElementById('provider-modal-container');
                // Buscamos el input dentro del modal activo
                const container = modalContainer.querySelector('#category-fields-container-create');
                if(container) {
                    // Input (A1: Estándar 40px)
                    container.innerHTML = `
                        <div class="flex items-center space-x-2">
                            <input type="text" id="provider-create-insumos" placeholder="Ej: Papel Bond" class="form-input dynamic-category-input w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    `;
                }
            }, 50);
        });

        // --- CRUD: Submit Crear ---
        document.getElementById('provider-modal-container')?.addEventListener('submit', async (e) => {
            if (e.target.id === 'provider-create-form') {
                e.preventDefault();
                const form = e.target; // Este es el formulario activo (el visible)
                
                const newProvider = {
                    name: form.querySelector('#provider-create-name').value,
                    taxId: form.querySelector('#provider-create-tax-id').value,
                    contact: form.querySelector('#provider-create-contact').value,
                    insumos: this.collectCategories(form) 
                };

                if (!newProvider.name || !newProvider.taxId) {
                    console.error('El nombre y la identificación fiscal son obligatorios.');
                    return;
                }

                await providersDB.addProvider(newProvider); // Usa providersDB
                window.UI.hideModal('provider-modal-container');
                window.UI.showNotification('Éxito', 'Proveedor agregado.');
                
                this.currentPage = 1; 
                this.applyFiltersAndPagination();
            }
        });

        // --- CRUD: Tabla (Editar/Eliminar) ---
        document.getElementById('provider-table-body')?.addEventListener('click', async (e) => {
            const btnDelete = e.target.closest('.btn-delete');
            if (btnDelete) {
                const { id, name } = btnDelete.dataset;
                window.UI.showConfirmModal('Eliminar', `¿Borrar a ${name}?`, 'Borrar', async () => {
                    await providersDB.deleteProvider(id); // Usa providersDB
                    this.applyFiltersAndPagination();
                });
            }
            
            const btnEdit = e.target.closest('.btn-edit');
            if (btnEdit) {
                const id = btnEdit.dataset.id;
                const providers = await providersDB.getProviders(); // Usa providersDB
                const p = providers.find(x => x.id === id);
                
                if(p) {
                    window.UI.showModal('provider-modal-container', 'provider-edit-modal-content');
                    
                    const modalContainer = document.getElementById('provider-modal-container');

                    setTimeout(() => {
                        if (modalContainer) {
                            // Buscar inputs DENTRO del modal activo para evitar duplicados ocultos
                            const editForm = modalContainer.querySelector('#provider-edit-form');
                            if(!editForm) return;

                            editForm.querySelector('#provider-edit-id-field').value = p.id;
                            editForm.querySelector('#provider-edit-name').value = p.name;
                            editForm.querySelector('#provider-edit-tax-id').value = p.taxId;
                            editForm.querySelector('#provider-edit-contact').value = p.contact; 

                            const categoryArray = p.insumos ? p.insumos.split(',').map(c => c.trim()) : [];
                            // Buscar contenedor DENTRO del form activo
                            const categoryContainer = editForm.querySelector('#category-fields-container-edit');
                            
                            categoryContainer.innerHTML = '';
                            const firstCategory = categoryArray.length > 0 ? categoryArray[0] : '';
                            
                            // Input (A1: Estándar 40px)
                            categoryContainer.innerHTML = `
                                <div class="flex items-center space-x-2">
                                    <input type="text" id="provider-edit-insumos" value="${firstCategory}" placeholder="Ej: Tintas UV" class="form-input dynamic-category-input w-full px-3 py-2 border border-gray-300 rounded-lg">
                                </div>
                            `;
                            
                            for (let i = 1; i < categoryArray.length; i++) {
                                // Usar la nueva versión de addCategoryField pasando el elemento
                                this.addCategoryField(categoryContainer, categoryArray[i]);
                            }
                        }
                    }, 50); // Timeout para asegurar renderizado
                }
            }
        });

        // --- CRUD: Submit Editar ---
        document.getElementById('provider-modal-container')?.addEventListener('submit', async (e) => {
            if (e.target.id === 'provider-edit-form') {
                e.preventDefault();
                const form = e.target; // Formulario activo
                const id = form.querySelector('#provider-edit-id-field').value;
                
                const updates = {
                    name: form.querySelector('#provider-edit-name').value,
                    taxId: form.querySelector('#provider-edit-tax-id').value,
                    contact: form.querySelector('#provider-edit-contact').value,
                    insumos: this.collectCategories(form) 
                };

                await providersDB.updateProvider(id, updates); // Usa providersDB
                window.UI.hideModal('provider-modal-container');
                window.UI.showNotification('Actualizado', 'Datos de proveedor guardados.');
                this.applyFiltersAndPagination();
            }
        });
    }
};