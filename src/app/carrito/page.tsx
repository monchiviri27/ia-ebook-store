// src/app/carrito/page.tsx - VERSIÓN COMPLETAMENTE RESPONSIVE
'use client';

import { useCarritoConNotificaciones } from '@/hooks/useCarritoConNotificaciones';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function CarritoPage() {
  const { items, removerDelCarrito, actualizarCantidad, vaciarCarrito, total } = useCarritoConNotificaciones();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error al iniciar el pago. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error de conexión. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900">Carrito de Compras</h1>
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
            <div className="text-4xl sm:text-6xl mb-4">🛒</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Agrega algunos libros increíbles a tu carrito</p>
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block text-sm sm:text-base"
            >
              Explorar Libros
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-900">Carrito de Compras</h1>
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Lista de Items - Responsive */}
          <div className="space-y-3 sm:space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors p-3 sm:p-4">
                {/* Layout móvil: Stack vertical */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  
                  {/* Imagen y info básica */}
                  <div className="flex items-start gap-3 sm:flex-1">
                    <div className="relative w-12 h-16 sm:w-16 sm:h-20 flex-shrink-0">
                      <Image
                        src={item.portada_url}
                        alt={item.titulo}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 sm:truncate">{item.titulo}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Por: {item.autor}</p>
                      <p className="text-base sm:text-lg font-bold text-green-600 mt-1">${item.precio.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Controles de cantidad - Centrado en móvil */}
                  <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors text-sm sm:text-base"
                        aria-label="Reducir cantidad"
                      >
                        -
                      </button>
                      <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors text-sm sm:text-base"
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>

                    {/* Precio total y eliminar - Alineados a la derecha en móvil */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          ${(item.precio * item.cantidad).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 hidden sm:block">
                          {item.cantidad} × ${item.precio.toFixed(2)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removerDelCarrito(item.id)}
                        className="text-red-600 hover:text-red-800 p-1 sm:p-2 transition-colors flex-shrink-0"
                        aria-label="Eliminar del carrito"
                        title="Eliminar del carrito"
                      >
                        <span className="text-base sm:text-lg">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total y Acciones */}
          <div className="border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-center sm:text-left">
                <span className="text-xl sm:text-2xl font-bold text-gray-900">Total: ${total.toFixed(2)}</span>
                <p className="text-sm text-gray-600 mt-1">
                  {items.length} {items.length === 1 ? 'libro' : 'libros'} en el carrito
                </p>
              </div>
              
              <div className="flex justify-center sm:justify-end gap-4">
                <button
                  onClick={vaciarCarrito}
                  className="text-red-600 hover:text-red-800 font-medium transition-colors text-sm sm:text-base py-2 px-4"
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                href="/" 
                className="flex-1 bg-gray-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-700 transition-colors text-center font-medium text-sm sm:text-base"
              >
                Seguir Comprando
              </Link>
              
              <button
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="flex-1 bg-green-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors text-center font-medium text-sm sm:text-base"
              >
                {loading ? '🔄 Procesando...' : '💳 Proceder al Pago'}
              </button>
            </div>

            {/* Resumen de la compra */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">📦 Resumen de tu compra</h3>
              <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                <p>• Descarga inmediata después del pago</p>
                <p>• Formatos disponibles: PDF y EPUB</p>
                <p>• Acceso ilimitado a los libros</p>
                <p>• Soporte técnico incluido</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}