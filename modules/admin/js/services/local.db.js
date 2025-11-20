/**
 * js/services/local.db.js
 * Servicio de persistencia local usando localStorage.
 * Contiene helpers comunes y la función de logs global.
 */

// --- Helpers de LocalStorage ---
export const getStorage = (key, seed) => {
    const data = localStorage.getItem(key);
    if (!data) {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
    }
    return JSON.parse(data);
};

export const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));


// --- LOGS / HISTORIAL (Compartido) ---
export const log = (action, details) => {
    const logs = getStorage('admin_logs', []);
    const newLog = {
        id: Date.now(),
        action,
        details,
        timestamp: new Date().toLocaleString()
    };
    logs.unshift(newLog); // Agregar al inicio
    setStorage('admin_logs', logs);
};

// Se exportan las funciones de log y helpers para que sean usadas por los demás servicios
export const dbBase = {
    getLogs() {
        return getStorage('admin_logs', []);
    },
    getStorage,
    setStorage,
    log
};