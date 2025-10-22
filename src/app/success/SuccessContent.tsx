// src/app/success/SuccessContent.tsx - VERSIÓN CORREGIDA
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

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { vaciarCarrito, items } = useCarrito();
  
  const [orden, setOrden] = useState<Orden | null>(null);
  const [descargas, setDescargas] = useState<Descarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carritoVaciado, setCarritoVaciado] = useState(false);

  // Vaciar carrito al cargar la página de éxito (CORREGIDO - sin loop infinito)
  useEffect(() => {
    if (!carritoVaciado && items.length > 0) {
      console.log('🛒 Vaciando carrito en página de éxito...');
      vaciarCarrito();
      setCarritoVaciado(true);
    }
  }, [items.length, carritoVaciado, vaciarCarrito]);

  // Cargar datos de la orden y descargas
  useEffect(() => {
    const cargarDatosCompra = async () => {
      if (!sessionId) {
        setError('No se encontró ID de sesión');
        setLoading(false);
        return;
      }

      try {
        // 1. Cargar orden desde Supabase
        const { data: ordenData, error: ordenError } = await supabase
          .from('ordenes')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (ordenError) {
          console.error('Error cargando orden:', ordenError);
          setError('No se pudo encontrar la información de tu compra');
          setLoading(false);
          return;
        }

        setOrden(ordenData);

        // 2. Cargar descargas disponibles
        if (ordenData.customer_email) {
          const { data: descargasData, error: descargasError } = await supabase
            .from('descargas')
            .select('*')
            .eq('sesion_id', sessionId)
            .eq('usuario_email', ordenData.customer_email);

          if (!descargasError && descargasData) {
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

    cargarDatosCompra();
  }, [sessionId]);

  // Función para manejar descargas
  const manejarDescarga = async (libroId: string, formato: 'pdf' | 'epub') => {
    try {
      // 1. Buscar la descarga específica
      const descarga = descargas.find(d => d.libro_id === libroId);
      
      if (!descarga) {
        alert('No se encontró información de descarga para este libro');
        return;
      }

      if (descarga.descargas_usadas >= descarga.descargas_disponibles) {
        alert('Has agotado tus descargas disponibles para este libro');
        return;
      }

      // 2. Simular descarga (aquí iría tu lógica real de descarga)
      console.log(`📥 Descargando ${formato} para libro: ${libroId}`);
      
      // Ejemplo de descarga - reemplaza con tu lógica real
      const libro = orden?.items.find(item => item.libro_id === libroId);
      if (libro) {
        // Simular descarga
        const link = document.createElement('a');
        link.href = `#`; // Aquí iría la URL real del archivo
        link.download = `${libro.titulo}.${formato}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 3. Actualizar contador de descargas en la base de datos
        const { error: updateError } = await supabase
          .from('descargas')
          .update({
            descargas_usadas: descarga.descargas_usadas + 1
          })
          .eq('id', descarga.id);

        if (!updateError) {
          // Actualizar estado local
          setDescargas(prev => prev.map(d => 
            d.id === descarga.id 
              ? { ...d, descargas_usadas: d.descargas_usadas + 1 }
              : d
          ));

          alert(`✅ Descarga de ${formato} iniciada para: ${libro.titulo}`);
        }
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
          <h2 className="text-xl font-semibold text-green-800">Procesando tu compra...</h2>
          <p className="text-green-600 mt-2">Estamos preparando tus descargas</p>
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
                        src={item.portada_url}
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

        {/* Sección de registro opcional para usuarios guest */}
        {orden.customer_email && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              📝 ¿Quieres guardar tu historial?
            </h3>
            <p className="text-blue-800 mb-4">
              Regístrate con tu email <strong>{orden.customer_email}</strong> para:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-green-600">✅</span>
                <span>Acceso permanente a tus libros</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✅</span>
                <span>Historial de compras</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✅</span>
                <span>Re-descargas ilimitadas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600">✅</span>
                <span>Ofertas exclusivas</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/registro" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
              >
                Crear Cuenta Gratis
              </Link>
              
              <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                Quizás más tarde
              </button>
            </div>
          </div>
        )}

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
              <span>Hemos enviado un email de confirmación a {orden.customer_email}</span>
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