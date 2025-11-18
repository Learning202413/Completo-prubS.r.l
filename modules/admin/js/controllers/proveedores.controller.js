/**
 * js/controllers/proveedores.controller.js
 */
// Asumimos que UI está disponible globalmente a través de window.UI

const handleProviderDelete = (providerId, providerName) => {
    // 1. Mostrar el modal de confirmación
    window.UI.showConfirmModal(
        `Confirmar Eliminación de Proveedor`,
        `¿Está seguro de que desea eliminar al proveedor "${providerName}" (ID: ${providerId})? Esto afectará al Módulo de Inventario.`,
        `Sí, Eliminar Proveedor`,
        () => {
            // Lógica de eliminación (ejecutada al confirmar)
            console.log(`[ACCIÓN] Eliminando proveedor con ID: ${providerId} y Nombre: ${providerName}...`);
            // Simulación de remoción de la fila de la tabla
            const row = document.querySelector(`[data-provider-id="${providerId}"]`);
            if (row) {
                row.remove();
                console.log(`[UI] Fila de proveedor ${providerId} eliminada de la tabla.`);
            }
            // Aquí iría la llamada a la API para la eliminación real
        }
    );
};

// Lógica de configuración de modal para Creación
const setupProviderModalForCreation = () => {
    const form = document.getElementById('provider-create-form');
    if (form) form.reset(); 

    // Opcional: limpiar campos específicos para creación (si no se usa form.reset())
    // document.getElementById('provider-create-name').value = ''; 
    
    console.log("[UI] Modal de Proveedor configurado para Creación.");
};

// Lógica de configuración de modal para Edición (Mock)
const setupProviderModalForEdit = (providerId) => {
    const form = document.getElementById('provider-edit-form');
    if (form) form.reset(); // Reiniciar antes de cargar datos
    
    // Configurar el campo oculto con el ID del proveedor
    document.getElementById('provider-edit-id-field').value = providerId;
    
    const mockProviders = {
        'P1': { name: 'Proveedor de Papeles S.A.', taxId: '20987654321', contact: 'Juan Mendoza (jm@papeles.com)', insumos: 'Papel' },
        'P2': { name: 'Importadora de Tintas Ltd.', taxId: '20111222333', contact: 'Rosa Lopez (ventas@tintas.com)', insumos: 'Tintas, Placas' },
    };
    
    const providerData = mockProviders[providerId];
    if (providerData) {
        document.getElementById('provider-edit-name').value = providerData.name;
        document.getElementById('provider-edit-tax-id').value = providerData.taxId;
        document.getElementById('provider-edit-contact').value = providerData.contact;
        document.getElementById('provider-edit-insumos').value = providerData.insumos;
        console.log(`[UI] Datos del proveedor ${providerId} precargados para edición.`);
    }
};


// ======================================================================
// MANEJADORES DE EVENTOS NOMBRADOS PARA LIMPIEZA
// ======================================================================

// 1. Manejador para el botón de Creación
const handleAddProviderClick = () => {
    // Inyecta el contenido del modal de CREACIÓN
    window.UI.showModal('provider-modal-container', 'provider-create-modal-content');
    setupProviderModalForCreation(); 
};

// 2. Manejador para la delegación de eventos en la tabla (Editar/Eliminar)
const handleProviderTableClick = (e) => {
    const deleteButton = e.target.closest('.btn-delete-provider');
    const editButton = e.target.closest('.btn-edit-provider');
    
    if (deleteButton) {
        const providerId = deleteButton.getAttribute('data-provider-id');
        const providerName = deleteButton.getAttribute('data-provider-name');
        if (providerId && providerName) {
            handleProviderDelete(providerId, providerName);
        }
    } else if (editButton) {
        const row = editButton.closest('tr');
        const providerId = row.getAttribute('data-provider-id');
        console.log(`[ACCIÓN] Editar proveedor con ID: ${providerId}. Abriendo modal.`);
        
        // Inyecta el contenido del modal de EDICIÓN
        window.UI.showModal('provider-modal-container', 'provider-edit-modal-content');
        setupProviderModalForEdit(providerId); 
    }
};

// 3. Manejador para el Submit del Formulario Modal (Ahora maneja ambos formularios)
const handleProviderModalSubmit = (e) => {
    const formId = e.target.id;

    if (formId === 'provider-create-form' || formId === 'provider-edit-form') {
        e.preventDefault();
        
        const isCreate = formId === 'provider-create-form';
        const actionType = isCreate ? 'create' : 'edit';
        const prefix = isCreate ? 'create-' : 'edit-';

        const name = document.getElementById(`provider-${prefix}name`).value;
        const taxId = document.getElementById(`provider-${prefix}tax-id`).value;
        const insumosText = document.getElementById(`provider-${prefix}insumos`).value; 
        
        const insumosArray = insumosText.split(',').map(item => item.trim()).filter(item => item.length > 0);
        
        console.log(`[ACCIÓN] ${isCreate ? 'Guardando nuevo' : 'Actualizando'} proveedor: ${name} (RUC: ${taxId})`);
        console.log(`[DATOS] Insumos registrados como array:`, insumosArray);
        
        window.UI.hideModal('provider-modal-container');
    }
};


export const ProveedoresController = {
    init: function() {
        console.log("ProveedoresController inicializado. Configurando gestión de proveedores.");
        
        const tableBody = document.getElementById('provider-table-body');
        const btnAddProvider = document.getElementById('btn-add-provider');
        const modalContainer = document.getElementById('provider-modal-container');
        
        // 1. Configurar botón de agregar proveedor
        if (btnAddProvider) {
            btnAddProvider.removeEventListener('click', handleAddProviderClick);
            btnAddProvider.addEventListener('click', handleAddProviderClick);
        }
        
        // 2. Configurar el listener de la tabla (Delegación de eventos para Editar/Eliminar)
        if (tableBody) {
             tableBody.removeEventListener('click', handleProviderTableClick);
             tableBody.addEventListener('click', handleProviderTableClick);
        }
        
        // 3. Configurar el formulario (Delegación de eventos para submit)
        // El listener en el contenedor captura el submit de ambos formularios (create-form y edit-form)
        if(modalContainer) {
            modalContainer.removeEventListener('submit', handleProviderModalSubmit);
            modalContainer.addEventListener('submit', handleProviderModalSubmit);
        }
    }
};