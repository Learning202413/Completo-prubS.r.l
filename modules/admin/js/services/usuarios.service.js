// /produccion-interna/modules/admin/js/services/usuarios.service.js

import { supabase } from '../../../core/http/supabase.client.js';

/**
 * @fileoverview Servicio de datos para la gestión de Usuarios.
 * Se encarga de todas las interacciones con la API de Auth de Supabase
 * para CRUD de usuarios.
 */

// NOTA: Para Supabase, la gestión de usuarios (creación, borrado) se hace a través de la API de Auth.
// La lectura de usuarios puede requerir una función de borde (Edge Function) 
// o una tabla sincronizada si no se usa el rol 'service_role'. 
// Para un entorno web cliente, usaremos métodos compatibles.

export const UsuariosService = {

    /**
     * Obtiene la lista de usuarios. 
     * ADVERTENCIA: La API del cliente de Supabase solo puede leer el usuario actualmente logeado.
     * Para listar todos los usuarios, necesitarías una Edge Function o una tabla 'usuarios'
     * replicada con RLS (Row Level Security) o el método admin del servidor.
     * * Para este ejemplo, solo usaremos la API de Auth para crear/eliminar, y 
     * asumiremos que el perfil de usuario está en una tabla llamada 'user_profiles'.
     */
    getAllUsers: async () => {
        try {
            // Suponemos que tienes una tabla 'user_profiles' donde guardas el 'name' y 'role'.
            // Esta consulta funcionará solo si RLS permite la lectura para el rol de Admin.
            const { data, error } = await supabase
                .from('user_profiles')
                .select('id, email, name, role, status') // Adaptar los campos según tu tabla
                .order('name', { ascending: true });

            if (error) throw error;
            
            console.log(`[SERVICE:USUARIOS] ${data.length} perfiles de usuario obtenidos.`);
            return data;
        } catch (error) {
            console.error('[SERVICE:USUARIOS] Error al obtener usuarios:', error.message);
            return [];
        }
    },
    
    /**
     * Crea/Invita un nuevo usuario a través de Supabase Auth.
     * @param {string} email - Correo electrónico del nuevo usuario.
     * @param {string} password - Contraseña inicial.
     * @param {object} metadata - Metadatos adicionales (name, role) para el perfil.
     */
    createUser: async (email, password, metadata) => {
        try {
            // 1. Crear usuario en Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                // Puedes usar user_metadata o app_metadata si lo requieres, pero el perfil es mejor en una tabla.
            });

            if (authError) throw authError;

            const newUserId = authData.user.id;

            // 2. Insertar información de perfil en la tabla 'user_profiles'
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: newUserId, // Usar el ID de Auth como clave principal
                    email: email,
                    name: metadata.name,
                    role: metadata.role,
                    status: 'Offline' // Inicializar estado
                })
                .select(); // Devolver el perfil creado
                
            if (profileError) {
                // Idealmente, se debería intentar eliminar el usuario creado en Auth si falla la inserción del perfil.
                throw profileError; 
            }

            return { success: true, user: profileData[0] };
        } catch (error) {
            console.error('[SERVICE:USUARIOS] Error en creación/invitación:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Actualiza el perfil de un usuario existente.
     * ADVERTENCIA: La actualización de email/password requiere permisos de Auth Admin.
     * Aquí, solo actualizaremos los datos de la tabla user_profiles y mostraremos 
     * un mensaje para la actualización de password (que solo el propio usuario puede hacer 
     * fácilmente o un admin de servicio).
     * * @param {string} userId - ID del usuario.
     * @param {object} data - Datos del perfil a actualizar (name, role).
     * @param {string} [newPassword=null] - Nueva contraseña si se desea cambiar.
     */
    updateUser: async (userId, data, newPassword = null) => {
        try {
            // 1. Actualizar perfil en la tabla 'user_profiles'
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({ 
                    name: data.name, 
                    role: data.role 
                })
                .eq('id', userId);

            if (profileError) throw profileError;
            
            let authUpdateSuccess = true;
            let authUpdateMessage = '';

            // 2. Opcional: Actualizar contraseña o email (requiere credenciales de Service Role en Edge Function)
            if (newPassword) {
                // En un entorno de cliente, este método SÓLO funciona para el usuario actualmente autenticado.
                // Para que un admin cambie la contraseña de otro, se necesita una Edge Function con Service Role.
                // Como workaround didáctico, usamos el método de 'update user' del cliente, que fallará 
                // si el admin no tiene los permisos, lo cual es correcto por seguridad.
                const { error: authUpdateError } = await supabase.auth.updateUser({
                    password: newPassword
                });
                
                if (authUpdateError) {
                    authUpdateSuccess = false;
                    authUpdateMessage = `Advertencia Auth: ${authUpdateError.message}. La actualización de la contraseña debe ser realizada por el propio usuario o mediante una Edge Function con Service Role.`;
                    console.warn(`[SERVICE:USUARIOS] ${authUpdateMessage}`);
                } else {
                    authUpdateMessage = "Contraseña actualizada exitosamente (si el usuario actual es el afectado).";
                }
            }

            return { success: true, authSuccess: authUpdateSuccess, authMessage: authUpdateMessage };
        } catch (error) {
            console.error('[SERVICE:USUARIOS] Error al actualizar usuario:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Elimina un usuario de Supabase Auth (solo si se usan credenciales de admin).
     * En un entorno de producción, esto DEBE ser manejado por una Edge Function segura.
     * @param {string} userId - ID del usuario a eliminar.
     */
    deleteUser: async (userId) => {
        // En un entorno de cliente, esta operación requiere políticas de RLS muy permisivas 
        // o ser ejecutada por un rol de administrador a través de una función de borde (Edge Function).
        try {
            // 1. Eliminar perfil de la tabla user_profiles
            const { error: profileError } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', userId);

            if (profileError) throw profileError;

            // 2. Eliminar de Auth (Esta parte SUELE fallar en el cliente sin credenciales de servicio, solo logeamos)
            // const { error: authError } = await supabase.auth.api.deleteUser(userId);
            // if (authError) throw authError;

            console.warn(`[SERVICE:USUARIOS] Usuario ID ${userId} eliminado (perfil). 
            La eliminación de Auth debe ser confirmada en el servidor (Edge Function)`);

            return { success: true };
        } catch (error) {
            console.error('[SERVICE:USUARIOS] Error al eliminar usuario:', error.message);
            return { success: false, error: error.message };
        }
    },
};