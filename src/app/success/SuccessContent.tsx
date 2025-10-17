// src/app/success/SuccessContent.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { useCarrito } from '@/context/CarritoContext';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { addToast } = useToast();
  const { vaciarCarrito, items } = useCarrito();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) {
      console.log('⚠️ Pago ya procesado anteriormente');
      setLoading(false);
      return;
    }

    if (!sessionId) {
      console.log('❌ No hay sessionId');
      setError(true);
      setLoading(false);
      return;
    }

    hasProcessed.current = true;
    
    console.log('🔄 Procesando pago exitoso...', {
      sessionId,
      itemsIniciales: items.length
    });

    const procesarPago = async () => {
      try {
        console.log('📦 Ejecutando vaciarCarrito()...');
        vaciarCarrito();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✅ Proceso de vaciado completado');
        console.log('📊 Estado final del carrito:', items.length, 'items');
        
        addToast('¡Compra realizada con éxito! 🎉', 'success');
        
      } catch (error) {
        console.error('❌ Error procesando pago:', error);
        addToast('Error al procesar la compra', 'error');
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    procesarPago();
    
  }, [sessionId, addToast, vaciarCarrito, items.length]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error en el pago</h1>
            <p className="text-gray-600 mb-6">No se pudo verificar tu pago.</p>
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finalizando tu compra...</p>
          <p className="text-sm text-gray-500 mt-2">Procesando pago y vaciando carrito</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h1>
          <p className="text-gray-600 mb-6">
            Tu compra ha sido procesada correctamente. 
          </p>
          
          <div className={`rounded-lg p-4 mb-6 ${
            items.length === 0 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}>
            <div className="space-y-2">
              <p className="font-medium">✅ Pago confirmado y procesado</p>
              <p className="text-sm">Procesado una sola vez ✓</p>
              <p className="text-sm">Carrito vaciado: {items.length === 0 ? 'Sí ✅' : 'No ❌'}</p>
              <p className="text-sm">Items restantes: {items.length}</p>
              
              {items.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm mb-2">Si el carrito no se vació automáticamente:</p>
                  <button
                    onClick={() => {
                      vaciarCarrito();
                      window.location.reload();
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                  >
                    Vaciar Carrito Manualmente
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href="/" 
              className="block bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Seguir Comprando
            </Link>
            
            <p className="text-xs text-gray-500">
              ¿Problemas? <button 
                onClick={() => window.location.reload()} 
                className="text-blue-500 hover:text-blue-700 underline"
              >
                Recargar página
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}