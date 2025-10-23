// src/app/success/SuccessContent.tsx - VERSIÓN PROFESIONAL
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCarrito } from '@/context/CarritoContext';
import { useToast } from '@/context/ToastContext';
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
  expira_en: string;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { vaciarCarrito, items } = useCarrito();
  const { addToast } = useToast();
  
  const [orden, setOrden] = useState<Orden | null>(null);
  const [descargas, setDescargas] = useState<Descarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState<string | null>(null);

  // Vaciar carrito y cargar datos
  useEffect(() => {
    if (items.length > 0) {
      vaciarCarrito();
    }

    const cargarDatos = async () => {
      if (!sessionId) {
        setError('No se encontró ID de sesión');
        setLoading(false);
        return;
      }

      try {
        // Cargar orden
        const { data: ordenData, error: ordenError } = await supabase
          .from('ordenes')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (ordenError) {
          console.error('Error cargando orden:', ordenError);
          setError('No se pudo cargar la información de tu compra');
          setLoading(false);
          return;
        }

        setOrden(ordenData);

        // Cargar descargas
        if (ordenData.customer_email) {
          const { data: descargasData } = await supabase
            .from('descargas')
            .select('*')
            .eq('sesion_id', sessionId)
            .eq('usuario_email', ordenData.customer_email);

          if (descargasData) {
            setDescargas(descargasData);
          }
        }

      } catch (err) {
        console.error('Error general:', err);
        setError('Error al cargar los datos de tu compra');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [sessionId]);

  // ✅ FUNCIÓN DE DESCARGA PROFESIONAL - CON LÍMITE REAL
  const manejarDescarga = async (libroId: string, formato: 'pdf' | 'epub') => {
    if (!orden) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No hay información de orden disponible'
      });
      return;
    }

    try {
      setDescargando(`${libroId}-${formato}`);
      
      // 1. Verificar límite de descargas
      const descarga = descargas.find(d => d.libro_id === libroId);
      const descargasRestantes = descarga ? descarga.descargas_disponibles - descarga.descargas_usadas : 3;

      if (descargasRestantes <= 0) {
        addToast({
          type: 'warning',
          title: 'Límite alcanzado',
          message: 'Has agotado tus descargas disponibles para este libro'
        });
        return;
      }

      // 2. Encontrar el libro en la orden
      const itemOrden = orden.items.find((item: any) => item.libro_id === libroId);
      
      if (!itemOrden) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'No se encontró el libro en tu orden'
        });
        return;
      }

      // 3. Buscar en la base de datos por TÍTULO
      const { data: libro, error } = await supabase
        .from('libros')
        .select('*')
        .eq('titulo', itemOrden.titulo)
        .single();

      if (error || !libro) {
        addToast({
          type: 'error',
          title: 'Error',
          message: `Libro "${itemOrden.titulo}" no encontrado`
        });
        return;
      }

      // 4. Obtener la ruta del archivo
      const rutaArchivo = formato === 'pdf' ? libro.ruta_pdf : libro.ruta_epub;
      
      if (!rutaArchivo) {
        addToast({
          type: 'warning',
          title: 'Formato no disponible',
          message: `El formato ${formato.toUpperCase()} no está disponible para este libro`
        });
        return;
      }

      // 5. ✅ DESCARGAR DIRECTAMENTE
      console.log('📥 Iniciando descarga desde:', rutaArchivo);
      const response = await fetch(rutaArchivo);
      
      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${libro.titulo}.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // 6. ✅ ACTUALIZAR CONTADOR DE DESCARGAS (IMPORTANTE)
      if (descarga) {
        const { error: updateError } = await supabase
          .from('descargas')
          .update({
            descargas_usadas: descarga.descargas_usadas + 1
          })
          .eq('id', descarga.id);

        if (!updateError) {
          setDescargas(prev => prev.map(d => 
            d.id === descarga.id 
              ? { ...d, descargas_usadas: d.descargas_usadas + 1 }
              : d
          ));
        }
      }

      // 7. ✅ NOTIFICACIÓN DE ÉXITO
      addToast({
        type: 'success',
        title: 'Descarga iniciada',
        message: `${libro.titulo} (${formato.toUpperCase()}) se está descargando`
      });

    } catch (error) {
      console.error('Error en descarga:', error);
      addToast({
        type: 'error',
        title: 'Error de descarga',
        message: 'No se pudo completar la descarga. Intenta nuevamente.'
      });
    } finally {
      setDescargando(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-green-800">Procesando tu compra...</h2>
        </div>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error al cargar la compra</h2>
          <p className="text-red-600 mb-6">{error || 'No se pudo encontrar la información de tu compra'}</p>
          <Link 
            href="/" 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-green-800 mb-4">¡Compra Exitosa!</h1>
          <p className="text-green-600 text-lg">
            Gracias por tu compra. Aquí tienes acceso inmediato a tus libros.
          </p>
          <div className="bg-white rounded-lg p-4 mt-4 inline-block">
            <p className="text-gray-600">
              <strong>ID de orden:</strong> {orden.stripe_session_id}
            </p>
            <p className="text-gray-600">
              <strong>Total:</strong> ${orden.amount_total} {orden.currency}
            </p>
          </div>
        </div>

        {/* Libros comprados */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">📚 Tus Libros Comprados</h2>
          
          <div className="space-y-6">
            {orden.items.map((item, index) => {
              const descarga = descargas.find(d => d.libro_id === item.libro_id);
              const descargasRestantes = descarga ? 
                descarga.descargas_disponibles - descarga.descargas_usadas : 3;

              return (
                <div key={item.libro_id} className="flex flex-col md:flex-row gap-6 p-4 border border-gray-200 rounded-lg">
                  
                  {/* Portada e información */}
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
                      <h3 className="font-semibold text-lg text-gray-900">{item.titulo}</h3>
                      <p className="text-gray-600">Cantidad: {item.cantidad}</p>
                      <p className="text-green-600 font-semibold">${item.precio}</p>
                      
                      {/* Contador de descargas */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-sm font-medium ${
                          descargasRestantes > 1 ? 'text-green-600' : 
                          descargasRestantes === 1 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {descargasRestantes > 0 ? (
                            <>📥 {descargasRestantes} descarga{descargasRestantes !== 1 ? 's' : ''} restante{descargasRestantes !== 1 ? 's' : ''}</>
                          ) : (
                            <>❌ Límite alcanzado</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de descarga */}
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={() => manejarDescarga(item.libro_id, 'pdf')}
                      disabled={descargando === `${item.libro_id}-pdf` || descargasRestantes <= 0}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-20 justify-center"
                    >
                      {descargando === `${item.libro_id}-pdf` ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        '📥 PDF'
                      )}
                    </button>
                    
                    <button
                      onClick={() => manejarDescarga(item.libro_id, 'epub')}
                      disabled={descargando === `${item.libro_id}-epub` || descargasRestantes <= 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-20 justify-center"
                    >
                      {descargando === `${item.libro_id}-epub` ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        '📥 EPUB'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Información de descargas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Información de descargas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>Límite: 3 descargas por libro</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏰</span>
              <span>Disponible por 30 días</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>Formatos: PDF y EPUB</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔄</span>
              <span>El contador se actualiza automáticamente</span>
            </div>
          </div>
        </div>

        {/* Volver al inicio */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors inline-block font-semibold"
          >
            🏠 Continuar Explorando Libros
          </Link>
        </div>

      </div>
    </div>
  );
}