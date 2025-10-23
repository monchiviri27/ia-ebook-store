// src/app/success/SuccessContent.tsx - VERSIÓN SIMPLIFICADA QUE FUNCIONA
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCarrito } from '@/context/CarritoContext';
import Image from 'next/image';
import Link from 'next/link';

interface Orden {
  id: string;
  stripe_session_id: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  items: Array<{
    libro_id: string;
    titulo: string;
    precio: number;
    cantidad: number;
    portada_url: string;
  }>;
  created_at: string;
}

interface Descarga {
  id: string;
  libro_id: string;
  libro_titulo: string;
  descargas_disponibles: number;
  descargas_usadas: number;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { vaciarCarrito, items } = useCarrito();
  
  const [orden, setOrden] = useState<Orden | null>(null);
  const [descargas, setDescargas] = useState<Descarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState<string | null>(null);

  // 1. Vaciar carrito y cargar orden
  useEffect(() => {
    if (items.length > 0) {
      vaciarCarrito();
    }

    const cargarDatos = async () => {
      if (!sessionId) return;

      try {
        // Cargar orden
        const { data: ordenData } = await supabase
          .from('ordenes')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (ordenData) {
          setOrden(ordenData);
          
          // 2. ✅ CREAR DESCARGAS SI NO EXISTEN
          await crearDescargasSiNoExisten(ordenData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [sessionId]);

  // ✅ FUNCIÓN QUE SÍ CREA LAS DESCARGAS
  const crearDescargasSiNoExisten = async (ordenData: Orden) => {
    if (!ordenData.customer_email) return;

    try {
      // Verificar si ya existen descargas
      const { data: descargasExistentes } = await supabase
        .from('descargas')
        .select('*')
        .eq('sesion_id', sessionId);

      // Si no existen, CREARLAS
      if (!descargasExistentes || descargasExistentes.length === 0) {
        console.log('🔄 Creando descargas...');
        
        const nuevasDescargas = [];
        
        for (const item of ordenData.items) {
          const { data } = await supabase
            .from('descargas')
            .insert([{
              usuario_email: ordenData.customer_email,
              libro_id: item.libro_id,
              libro_titulo: item.titulo,
              sesion_id: sessionId,
              descargas_disponibles: 3,
              descargas_usadas: 0,
              expira_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }])
            .select()
            .single();

          if (data) {
            nuevasDescargas.push(data);
          }
        }
        
        setDescargas(nuevasDescargas);
        console.log('✅ Descargas creadas:', nuevasDescargas.length);
      } else {
        // Si ya existen, usarlas
        setDescargas(descargasExistentes);
      }
      
    } catch (error) {
      console.error('Error creando descargas:', error);
    }
  };

  // ✅ FUNCIÓN DE DESCARGA QUE SÍ FUNCIONA
 const manejarDescarga = async (libroId: string, formato: 'pdf' | 'epub') => {
  // ✅ VALIDAR que orden no sea null
  if (!orden) {
    alert('Error: No hay información de orden disponible');
    return;
  }

  try {
    setDescargando(`${libroId}-${formato}`);
    
    // 1. Encontrar el libro en el JSON de items de la orden
    const itemOrden = orden.items.find((item: any) => item.libro_id === libroId);
    
    if (!itemOrden) {
      console.log('❌ Item no encontrado en orden:', libroId);
      console.log('📦 Items disponibles:', orden.items);
      alert('No se encontró el libro en tu orden');
      return;
    }

    console.log('📖 Buscando libro:', itemOrden.titulo);

    // 2. Buscar en la base de datos por TÍTULO
    const { data: libro, error } = await supabase
      .from('libros')
      .select('*')
      .eq('titulo', itemOrden.titulo)
      .single();

    if (error || !libro) {
      console.error('❌ Error buscando libro:', error);
      alert(`Libro "${itemOrden.titulo}" no encontrado en la base de datos`);
      return;
    }

    // 3. Obtener la ruta del archivo
    const rutaArchivo = formato === 'pdf' ? libro.ruta_pdf : libro.ruta_epub;
    
    if (!rutaArchivo) {
      alert(`Formato ${formato.toUpperCase()} no disponible para "${libro.titulo}"`);
      return;
    }

    console.log('📁 Descargando desde:', rutaArchivo);

    // 4. Descargar archivo
    const link = document.createElement('a');
    link.href = rutaArchivo;
    link.download = `${libro.titulo}.${formato}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ Descargando: ${libro.titulo}`);

    // 5. Actualizar contador de descargas
    const descarga = descargas.find(d => d.libro_id === libroId);
    if (descarga && !descarga.id.startsWith('temp-')) {
      await supabase
        .from('descargas')
        .update({
          descargas_usadas: descarga.descargas_usadas + 1
        })
        .eq('id', descarga.id);
    }

  } catch (error) {
    console.error('Error en descarga:', error);
    alert('Error al procesar la descarga');
  } finally {
    setDescargando(null);
  }
};

  if (loading) {
    return <div className="min-h-screen bg-green-50 flex items-center justify-center">Cargando...</div>;
  }

  if (!orden) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Orden no encontrada</h2>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">¡Compra Exitosa!</h1>
          <p className="text-green-600">Tus libros están listos para descargar</p>
        </div>

        {/* Libros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Tus Libros</h2>
          
          <div className="space-y-6">
            {orden.items.map((item) => {
              const descarga = descargas.find(d => d.libro_id === item.libro_id);
              const descargasRestantes = descarga ? descarga.descargas_disponibles - descarga.descargas_usadas : 0;

              return (
                <div key={item.libro_id} className="flex flex-col md:flex-row gap-6 p-4 border border-gray-200 rounded-lg">
                  
                  <div className="flex gap-4 flex-1">
                    <div className="relative w-20 h-28 flex-shrink-0">
                      <Image
                        src={item.portada_url || '/placeholder-book.jpg'}
                        alt={item.titulo}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.titulo}</h3>
                      <p className="text-green-600 font-semibold">${item.precio}</p>
                      {descarga && (
                        <p className="text-sm text-gray-500 mt-2">
                          Descargas: {descargasRestantes}/3
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botones de descarga */}
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={() => manejarDescarga(item.libro_id, 'pdf')}
                      disabled={descargando === `${item.libro_id}-pdf`}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 min-w-20 justify-center"
                    >
                      {descargando === `${item.libro_id}-pdf` ? '⏳' : '📥 PDF'}
                    </button>
                    
                    <button
                      onClick={() => manejarDescarga(item.libro_id, 'epub')}
                      disabled={descargando === `${item.libro_id}-epub`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 min-w-20 justify-center"
                    >
                      {descargando === `${item.libro_id}-epub` ? '⏳' : '📥 EPUB'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 inline-block">
            🏠 Volver a la tienda
          </Link>
        </div>

      </div>
    </div>
  );
}