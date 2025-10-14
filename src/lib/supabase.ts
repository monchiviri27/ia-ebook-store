import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificación más amigable para build
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // En el servidor durante el build
    console.warn('Supabase environment variables missing during build');
  } else {
    // En el cliente
    throw new Error("Faltan las variables de entorno de Supabase");
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co', // URL dummy para build
  supabaseAnonKey || 'dummy-key' // Key dummy para build
);