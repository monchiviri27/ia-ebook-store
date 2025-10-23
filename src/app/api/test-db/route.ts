// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('=== 🧪 TEST DE BASE DE DATOS ===');
    
    // Test 1: Ordenes (que SÍ funciona)
    console.log('1. 🔍 Probando tabla ordenes...');
    const { data: ordenes, error: errorOrdenes } = await supabase
      .from('ordenes')
      .select('*')
      .limit(1);

    // Test 2: Descargas (que NO funciona)
    console.log('2. 🔍 Probando tabla descargas...');
    const { data: descargas, error: errorDescargas } = await supabase
      .from('descargas')
      .insert([{
        usuario_email: 'test@ejemplo.com',
        libro_id: 'test-id',
        libro_titulo: 'Libro de Test',
        sesion_id: 'test-session',
        descargas_disponibles: 3,
        descargas_usadas: 0,
        expira_en: new Date().toISOString()
      }])
      .select();

    // Test 3: Usuarios (que NO funciona)
    console.log('3. 🔍 Probando tabla usuarios...');
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios')
      .insert([{
        email: 'test@ejemplo.com',
        tipo: 'guest',
        descargas_habilitadas: true,
        ultima_compra: new Date().toISOString(),
        sesion_compra: 'test-session'
      }])
      .select();

    return NextResponse.json({
      ordenes: {
        success: !errorOrdenes,
        error: errorOrdenes?.message,
        data: ordenes
      },
      descargas: {
        success: !errorDescargas,
        error: errorDescargas?.message,
        data: descargas
      },
      usuarios: {
        success: !errorUsuarios,
        error: errorUsuarios?.message,
        data: usuarios
      }
    });

  } catch (error) {
    console.error('❌ Error en test:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}