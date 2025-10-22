// src/app/checkout/page.tsx - VERSIÓN CORREGIDA
'use client';

import { useEffect, useState } from 'react';
import { useCarritoConNotificaciones } from '@/hooks/useCarritoConNotificaciones';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, vaciarCarrito, total } = useCarritoConNotificaciones();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      addToast({
        type: 'warning',
        title: 'Carrito vacío',
        message: 'Tu carrito está vacío'
      });
    }
  }, [items, addToast]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Tu carrito está vacío'
      });
      return;
    }

    setLoading(true);

    try {
      // Crear sesión de checkout en el servidor
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            titulo: item.titulo,
            precio: item.precio,
            cantidad: item.cantidad,
            portada_url: item.portada_url,
          })),
        }),
      });

      const { sessionId, url } = await response.json();

      if (url) {
        // MÉTODO MODERNO: Redirigir directamente a la URL de Checkout
        window.location.href = url;
      } else if (sessionId) {
        // Método alternativo si aún necesitas sessionId
        window.location.href = `https://checkout.stripe.com/c/pay/${sessionId}`;
      } else {
        throw new Error('No se pudo crear la sesión de pago');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      addToast({
        type: 'error',
        title: 'Error de pago',
        message: 'Error al procesar el pago'
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega algunos libros antes de proceder al pago</p>
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
            >
              Explorar Libros
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Finalizar Compra</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumen del Pedido */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                  <div className="relative w-16 h-20 flex-shrink-0">
                    <Image
                      src={item.portada_url}
                      alt={item.titulo}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.titulo}</h3>
                    <p className="text-xs text-gray-600">Cantidad: {item.cantidad}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Impuestos</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Información de Pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>
            
            <div className="space-y-4">
              <div className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <p className="font-semibold">Stripe Checkout</p>
                    <p className="text-sm text-gray-600">Pago seguro con tarjeta</p>
                  </div>
                </div>
              </div>

              {/* Información de seguridad */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <span>🔒</span>
                  <p className="text-sm font-medium">Pago 100% seguro con Stripe</p>
                </div>
              </div>

              {/* Botón de pago */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    💳 Pagar ${total.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Al hacer clic en "Pagar", serás redirigido a Stripe para completar tu compra de forma segura.
              </p>

              {/* Volver al carrito */}
              <Link 
                href="/carrito" 
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Volver al carrito
              </Link>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">📦 ¿Qué incluye tu compra?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>Descarga inmediata post-pago</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>Formatos PDF y EPUB</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>Acceso ilimitado</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>Soporte técnico incluido</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}