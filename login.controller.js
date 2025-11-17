// /produccion-interna/modules/auth/js/login.controller.js

import { authService } from '../../../core/auth/auth.service.js';

// Elementos del DOM (Se asume que están disponibles al cargar el DOM)
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const messageBox = document.getElementById('messageBox');
const REDIRECT_URL = './modules/admin/index.html'; // URL de la página principal post-login

/**
 * Muestra un mensaje en la caja de mensajes.
 * @param {string} message - Mensaje a mostrar.
 * @param {'success'|'error'|'warning'} type - Tipo de mensaje para aplicar estilos.
 */
function showMessage(message, type) {
    // Verificar que el messageBox exista antes de intentar manipularlo
    if (!messageBox) return; 

    messageBox.textContent = message;
    // Limpia todas las clases de estado y muestra
    messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700', 'bg-yellow-100', 'text-yellow-700');
    
    if (type === 'error') {
        // Estilo de error: Fondo rojo claro, texto rojo oscuro
        messageBox.classList.add('bg-red-100', 'text-red-700');
    } else if (type === 'success') {
        // Estilo de éxito: Fondo verde claro, texto verde oscuro
        messageBox.classList.add('bg-green-100', 'text-green-700');
    } else if (type === 'warning') {
        // Estilo de advertencia: Fondo amarillo claro, texto amarillo oscuro
        messageBox.classList.add('bg-yellow-100', 'text-yellow-700');
    }
    // Aseguramos que se muestre, removiendo 'hidden'
    messageBox.classList.remove('hidden');
}

/**
 * Habilita o deshabilita la interfaz de usuario durante la carga.
 * @param {boolean} isLoading - Si la operación está en curso.
 */
function toggleLoading(isLoading) {
    // Aseguramos que los elementos existan antes de manipularlos
    if (!loginButton || !emailInput || !passwordInput) return;
    
    loginButton.disabled = isLoading;
    loginButton.textContent = isLoading ? 'Cargando...' : 'Iniciar Sesión';
    
    emailInput.disabled = isLoading;
    passwordInput.disabled = isLoading;
    
    // Oculta la caja de mensajes al iniciar una nueva operación
    if (isLoading && messageBox) {
        messageBox.classList.add('hidden');
    }
}

/**
 * Inicializa el manejador de clic para el botón de alternar visibilidad de contraseña.
 */
function initializePasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const eyeOpen = document.getElementById('eye-open');
    const eyeClosed = document.getElementById('eye-closed');
    
    // CRUCIAL: Usamos la constante passwordInput que ya captura el input
    if (togglePassword && passwordInput && eyeOpen && eyeClosed) {
        togglePassword.addEventListener('click', function (e) {
            // Alternar el tipo de input utilizando passwordInput (el input del formulario)
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Alternar los íconos
            eyeOpen.classList.toggle('hidden');
            eyeClosed.classList.toggle('hidden');
        });
        console.log("[CONTROLLER] Lógica de Toggle Password inicializada.");
    } else {
        console.warn("[CONTROLLER] Elementos del toggle password no encontrados.");
    }
}


// 1. Verificar sesión al cargar la página
async function checkSession() {
    try {
        const user = await authService.getCurrentUser();
        if (user) {
            // Si el usuario ya está logueado, redirigir inmediatamente
            window.location.href = REDIRECT_URL;
        }
    } catch (e) {
        // En caso de error de red o Supabase, simplemente permitimos el login normal
        console.error("Error al verificar sesión:", e);
    }
}

// 2. Manejar el envío del formulario de login
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    toggleLoading(true);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showMessage('Por favor, ingresa tu correo y contraseña.', 'error');
        toggleLoading(false);
        return;
    }

    try {
        // Llama al servicio de Supabase para iniciar sesión
        const { user, error } = await authService.login(email, password);

        if (error) {
            let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
            // Mensajes específicos para el usuario si es un error común de credenciales
            if (error.status === 400 || error.message.includes('Invalid login credentials')) {
                errorMessage = 'Credenciales no válidas (correo o contraseña incorrectos).';
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }
            showMessage(errorMessage, 'error');
        } else if (user) {
            showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            // Redirigir al módulo principal
            setTimeout(() => {
                window.location.href = REDIRECT_URL;
            }, 500); // Pequeña espera para que el usuario vea el mensaje de éxito
        } else {
            // Fallback en caso de que no haya ni error ni usuario (inesperado)
            showMessage('No se pudo iniciar sesión por una razón desconocida.', 'error');
        }
    } catch (exception) {
        console.error("Excepción al intentar login:", exception);
        showMessage('Error inesperado del sistema. Por favor, inténtalo más tarde.', 'error');
    } finally {
        // Se asegura de re-habilitar el formulario si no hubo redirección
        if (window.location.href.includes('index.html')) {
             toggleLoading(false);
        }
    }
});

// Ejecutar la inicialización y verificación de sesión al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    initializePasswordToggle();
    checkSession();
});