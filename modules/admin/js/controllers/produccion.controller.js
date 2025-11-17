/**
 * js/controllers/produccion.controller.js
 */
// Asumimos que UI está importado en el router para su uso global si es necesario, 
// o re-implementamos un modal handler local si fuera necesario.
// Para mantener la estructura original, la UI debe ser accesible globalmente o por importación.

// Variable temporal para almacenar la tarjeta que se está arrastrando
let draggedCard = null;

const setupDragAndDrop = () => {
    const columns = document.querySelectorAll('.kanban-column');
    const cards = document.querySelectorAll('.kanban-card');

    // 1. Configurar tarjetas arrastrables
    cards.forEach(card => {
        // Solo las tarjetas que están en estados "Pendiente" deben ser arrastrables
        const isDraggable = card.closest('[data-status="pendiente"]');
        card.setAttribute('draggable', isDraggable ? 'true' : 'false');
        card.classList.toggle('cursor-grab', isDraggable);
        card.classList.toggle('cursor-default', !isDraggable);
        
        if (isDraggable) {
            card.addEventListener('dragstart', (e) => {
                draggedCard = card;
                e.dataTransfer.effectAllowed = 'move';
                card.classList.add('opacity-50', 'border-dashed');
                console.log(`[D&D] Empezando a arrastrar OT: ${card.getAttribute('data-ot-id')}`);
            });

            card.addEventListener('dragend', () => {
                draggedCard = null;
                card.classList.remove('opacity-50', 'border-dashed');
                console.log("[D&D] Arrastre finalizado.");
            });
        }
    });

    // 2. Configurar columnas como zonas de soltar (Drop Zones)
    columns.forEach(column => {
        const dropZone = column.querySelector('[data-status]');

        if (dropZone) {
            // Prevenir el comportamiento por defecto (permite soltar)
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault(); 
                e.dataTransfer.dropEffect = 'move';
                dropZone.classList.add('bg-slate-300/60');
            });
            
            // Eliminar el estilo visual cuando el arrastre sale de la zona
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('bg-slate-300/60');
            });

            // Lógica al soltar la tarjeta
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('bg-slate-300/60');

                if (draggedCard) {
                    const otId = draggedCard.getAttribute('data-ot-id');
                    const sourceColumn = draggedCard.closest('.kanban-column');
                    const targetColumn = column;
                    
                    if (sourceColumn !== targetColumn) {
                        
                        // Si se mueve DE UNA PENDIENTE A UNA ASIGNADA, se lanza el modal.
                        // El modal se lanza solo si el destino es una columna de 'Asignado'
                        if (dropZone.getAttribute('data-status') === 'asignado') {
                            
                            // Guardar datos en el modal para el submit posterior
                            document.getElementById('assign-ot-id').value = otId;
                            document.getElementById('assign-source-column').value = sourceColumn.id;
                            document.getElementById('assign-modal-title').textContent = `Asignar Tarea: ${otId}`;
                            
                            // Mostrar el modal
                            window.UI.showModal('assign-modal-container', 'assign-modal-content');
                            
                            // NOTA: La tarjeta se moverá a la nueva columna SÓLO después de que el usuario confirme en el modal
                            console.log(`[D&D] Modal de asignación lanzado para OT: ${otId}.`);

                        } else {
                            // Si se mueve a otra columna 'Pendiente' (ej. Listo para Prensa a Listo para Acabados), se mueve directamente.
                            console.log(`[D&D] Movimiento directo de OT ${otId} a columna ${targetColumn.id}.`);
                            dropZone.appendChild(draggedCard);
                            // Aquí iría la llamada a la API para actualizar el estado de la OT directamente
                        }
                    }
                }
            });
        }
    });
};

export const ProductionController = {
    init: function() {
        console.log("ProductionController inicializado. Agregando lógica Kanban.");
        
        // Inicializar la lógica de Drag and Drop
        setupDragAndDrop();

        // Listener de confirmación de asignación (Submit del modal)
        const modalContainer = document.getElementById('assign-modal-container');
        if(modalContainer) {
            modalContainer.addEventListener('submit', (e) => {
                if (e.target.id === 'assign-form') {
                    e.preventDefault();
                    
                    const otId = document.getElementById('assign-ot-id').value;
                    const sourceColumnId = document.getElementById('assign-source-column').value;
                    const resource = document.getElementById('assign-resource').value;
                    const datetime = document.getElementById('assign-datetime').value;

                    console.log(`[ACCIÓN] Asignación de OT ${otId} confirmada. Recurso: ${resource}, Inicio Estimado: ${datetime}`);
                    
                    // LÓGICA DE MOVIMIENTO DE LA TARJETA EN LA UI
                    const cardToMove = document.querySelector(`[data-ot-id="${otId}"]`);
                    const targetDropZone = e.target.closest('#assign-modal-content').parentElement.querySelector('.drop-zone-target'); // Usar ID del modal para encontrar el drop zone
                    
                    // Buscar la columna destino basada en la que se lanzó el modal (ej. #column-diseno-asignado)
                    const targetColumn = document.querySelector(`[data-status="asignado"]`); // Simplificado: Solo se buscan las asignadas
                    if (cardToMove && targetColumn) {
                        // Mover la tarjeta
                        targetColumn.appendChild(cardToMove);
                        
                        // Actualizar detalles de la tarjeta para reflejar la asignación
                        let cardDetails = cardToMove.querySelector('.text-xs.font-bold.text-blue-600');
                        if (!cardDetails) {
                             cardDetails = document.createElement('p');
                             cardDetails.className = 'text-xs font-bold text-blue-600 mt-2 pt-2 border-t';
                             cardToMove.appendChild(cardDetails);
                        }
                        cardDetails.textContent = `Asignado a: ${resource}`;
                        
                        // Desactivar arrastre si ya está asignada
                        cardToMove.setAttribute('draggable', 'false');
                        cardToMove.classList.remove('cursor-grab');
                        cardToMove.classList.add('cursor-default');
                        
                        // Aquí iría la llamada a la API para actualizar el estado de la OT y notificar al CRM
                    }

                    window.UI.hideModal('assign-modal-container');
                }
            });
        }
        
        // Lógica de click inicial (que fue reemplazada por D&D, pero se mantiene para edición directa si es necesario)
        /*
        const kanbanContainer = document.getElementById('kanban-container');
        if (kanbanContainer) {
            kanbanContainer.addEventListener('click', (e) => {
                const card = e.target.closest('.kanban-card');
                if (card && card.parentElement.closest('#column-preprensa-pendiente')) {
                    const otId = card.getAttribute('data-ot-id');
                    document.getElementById('assign-modal-title').textContent = `Asignar Tarea: ${otId}`;
                    window.UI.showModal('assign-modal-container', 'assign-modal-content'); 
                }
            });
        }
        */
    }
};