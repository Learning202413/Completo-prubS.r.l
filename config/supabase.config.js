/**
 * config/supabase.config.js
 * Archivo de configuración central.
 * Inicializa y exporta el cliente Supabase.
 */

// ** VARIABLES GLOBALES PARA SUPABASE **
const supabaseUrl = typeof __SUPABASE_URL !== 'undefined' ? __SUPABASE_URL : 'https://jwyfyfxnupbwvzlrujpl.supabase.co';
const supabaseKey = typeof __SUPABASE_KEY !== 'undefined' ? __SUPABASE_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eWZ5ZnhudXBid3Z6bHJ1anBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MzQ3OTIsImV4cCI6MjA3ODIxMDc5Mn0.ZLO3ezjZ5692tka5FSi8bqPbYuV2A7RWc2_o8Y_o0OE';

// Inicializar el cliente de Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

export const SupabaseConfig = {
    supabase,
};
