// Archivo: src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Las variables de entorno son leídas automáticamente por Next.js
// Siempre usamos process.env para acceder a ellas.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificación básica para asegurar que las claves están definidas
if (!supabaseUrl || !supabaseAnonKey) {
  // En un entorno de desarrollo, esto lanzará un error si falta el .env.local
  // En producción, Vercel ya tiene las variables gracias a la integración
  throw new Error("Faltan las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY). Asegúrate de que están en tu archivo .env.local.");
}

// Crea y exporta el cliente de Supabase
// Usaremos este objeto 'supabase' en toda nuestra aplicación para las consultas
export const supabase = createClient(supabaseUrl, supabaseAnonKey);