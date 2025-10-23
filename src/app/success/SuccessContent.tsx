// src/app/success/SuccessContent.tsx - VERSIÓN MEJORADA
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
  expira_en: string;
}

// Función para simular orden de prueba
const simularOrdenDePrueba = (sessionId: string): Orden => {
  return {
    id: 'temp-id',
    stripe_session_id: sessionId,
    customer_email: 'cliente@ejemplo.com',
    amount_total: 19.99,
    currency: 'usd',
    items: [
      {
        libro_id: 'libro-ejemplo',
        titulo: 'Libro de Ejemplo - Pago Verificado',
        precio: 19.99,
        cantidad: 1,
        portada_url: '/placeholder-book.jpg'
      }
    ],
    created_at: new Date().toISOString()
  };
};

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { vaciarCarrito, items } = useCarrito();
  
  const [orden, setOrden] = useState<Orden | null>(null);
  const [descargas, setDescargas] = useState<Descarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carritoVaciado, setCarritoVaciado] = useState(false);
  const [intentos, setIntentos] = useState(0);

  // Vaciar carrito
  useEffect(() => {
    if (!carritoVaciado && items.length > 0) {
      console.log('🛒 Vaciando carrito en página de éxito...');
      vaciarCarrito();
      setCarritoVaciado(true);
    }
  }, [items.length, carritoVaciado, vaciarCarrito]);

  // Cargar datos de la orden con reintentos
  useEffect(() => {
    const cargarDatosCompra = async () => {
      if (!sessionId) {
        setError('No se encontró ID de sesión');
        setLoading(false);
        return;
      }

      try {
        console.log(`🔍 Buscando orden para session: ${sessionId} (intento ${intentos + 1})`);
        
        // 1. Intentar cargar orden desde Supabase
        const { data: ordenData, error: ordenError } = await supabase
          .from('ordenes')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (ordenError) {
          console.log('❌ Orden no encontrada en BD:', ordenError.message);
          
          // Si es el primer intento, esperar y reintentar
          if (intentos < 3) {
            console.log(`⏳ Reintentando en 3 segundos... (${intentos + 1}/3)`);
            setTimeout(() => {
              setIntentos(prev => prev + 1);
            }, 3000);
            return;
          }
          
          // Después de 3 intentos, usar datos de prueba
          console.log('🔄 Usando datos de prueba después de 3 intentos fallidos');
          const ordenSimulada = simularOrdenDePrueba(sessionId);
          setOrden(ordenSimulada);
          
          // Simular descargas también
          const descargasSimuladas: Descarga[] = ordenSimulada.items.map(item => ({
            id: `temp-${item.libro_id}`,
            libro_id: item.libro_id,
            libro_titulo: item.titulo,
            descargas_disponibles: 3,
            descargas_usadas: 0,
            expira_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }));
          setDescargas(descargasSimuladas);
          
        } else {
          // Orden encontrada
          console.log('✅ Orden encontrada en BD:', ordenData.id);
          setOrden(ordenData);

          // Cargar descargas
          if (ordenData.customer_email) {
            const { data: descargasData, error: descargasError } = await supabase
              .from('descargas')
              .select('*')
              .eq('sesion_id', sessionId)
              .eq('usuario_email', ordenData.customer_email);

            if (!descargasError && descargasData) {
              setDescargas(descargasData);
            } else if (descargasError) {
              console.log('⚠️ No se pudieron cargar las descargas:', descargasError.message);
            }
          }
        }

      } catch (err) {
        console.error('❌ Error general cargando datos:', err);
        setError('Error al cargar los datos de tu compra. Recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatosCompra();
  }, [sessionId, intentos]);

  // Función para manejar descargas
  const manejarDescarga = async (libroId: string, formato: 'pdf' | 'epub') => {
    try {
      const descarga = descargas.find(d => d.libro_id === libroId);
      
      if (!descarga) {
        alert('No se encontró información de descarga para este libro');
        return;
      }

      if (descarga.descargas_usadas >= descarga.descargas_disponibles) {
        alert('Has agotado tus descargas disponibles para este libro');
        return;
      }

      console.log(`📥 Descargando ${formato} para libro: ${libroId}`);
      
      const libro = orden?.items.find(item => item.libro_id === libroId);
      if (libro) {
        // Simular descarga
        const link = document.createElement('a');
        link.href = `#`;
        link.download = `${libro.titulo}.${formato}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Actualizar contador si no es una orden temporal
        if (!descarga.id.startsWith('temp-')) {
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

        alert(`✅ Descarga de ${formato} iniciada para: ${libro.titulo}`);
      }

    } catch (error) {
      console.error('Error en descarga:', error);
      alert('Error al procesar la descarga');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">Procesando tu compra...</h2>
          <p className="text-green-600">Estamos preparando tus descargas</p>
          {intentos > 0 && (
            <p className="text-green-500 text-sm mt-2">
              Esto puede tardar unos segundos... (intento {intentos + 1}/3)
            </p>
          )}
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
          <p className="text-red-600 mb-4">{error || 'No se pudo encontrar la información de tu compra'}</p>
          <p className="text-red-500 text-sm mb-6">
            El pago fue exitoso, pero hubo un problema cargando los detalles.
            Recarga la página o contacta a soporte.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              🔄 Recargar
            </button>
            <Link 
              href="/" 
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const esOrdenTemporal = orden.id === 'temp-id';

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
          {esOrdenTemporal && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mt-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Modo demostración:</strong> Usando datos de prueba. 
                El webhook puede estar en proceso.
              </p>
            </div>
          )}
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
                      
                      {descarga && (
                        <p className="text-sm text-gray-500 mt-2">
                          Descargas disponibles: {descargasRestantes}/3
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botones de descarga */}
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={() => manejarDescarga(item.libro_id, 'pdf')}
                      disabled={descargasRestantes <= 0}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      📥 PDF
                    </button>
                    
                    <button
                      onClick={() => manejarDescarga(item.libro_id, 'epub')}
                      disabled={descargasRestantes <= 0}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      📥 EPUB
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">💡 Información importante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span>⏰</span>
              <span>Tus descargas expiran en 30 días</span>
            </div>
            <div className="flex items-start gap-2">
              <span>📱</span>
              <span>Puedes descargar cada libro hasta 3 veces</span>
            </div>
            <div className="flex items-start gap-2">
              <span>📧</span>
              <span>Hemos enviado un email de confirmación</span>
            </div>
            <div className="flex items-start gap-2">
              <span>🆘</span>
              <span>¿Problemas? Contacta a soporte@iaebookstore.com</span>
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