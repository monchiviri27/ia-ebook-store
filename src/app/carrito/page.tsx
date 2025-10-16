// src/app/carrito/page.tsx
'use client';

import { useCarritoConNotificaciones } from '@/hooks/useCarritoConNotificaciones';
import { useToast } from '@/context/ToastContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CarritoPage() {
  const { items, removerDelCarrito, actualizarCantidad, vaciarCarrito, total } = useCarritoConNotificaciones();
  const { addToast } = useToast();

  const handleProcederPago = () => {
    if (items.length > 0) {
      addToast('¡Compra realizada con éxito! 📚', 'success');
      // Simular proceso de pago
      setTimeout(() => {
        vaciarCarrito();
      }, 2000);
    } else {
      addToast('El carrito está vacío', 'warning');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Carrito de Compras</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega algunos libros increíbles a tu carrito</p>
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
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Carrito de Compras</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Lista de Items */}
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="relative w-16 h-20 flex-shrink-0">
                  <Image
                    src={item.portada_url}
                    alt={item.titulo}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.titulo}</h3>
                  <p className="text-sm text-gray-600">Por: {item.autor}</p>
                  <p className="text-lg font-bold text-green-600">${item.precio.toFixed(2)}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    aria-label="Reducir cantidad"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.cantidad}</span>
                  <button
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-20">
                  <p className="font-semibold text-gray-900">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{item.cantidad} × ${item.precio.toFixed(2)}</p>
                </div>
                
                <button
                  onClick={() => removerDelCarrito(item.id)}
                  className="text-red-600 hover:text-red-800 p-2 transition-colors"
                  aria-label="Eliminar del carrito"
                  title="Eliminar del carrito"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Total y Acciones */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-2xl font-bold text-gray-900">Total: ${total.toFixed(2)}</span>
                <p className="text-sm text-gray-600 mt-1">
                  {items.length} {items.length === 1 ? 'libro' : 'libros'} en el carrito
                </p>
              </div>
              <button
                onClick={vaciarCarrito}
                className="text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Vaciar Carrito
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/" 
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors text-center font-medium"
              >
                Seguir Comprando
              </Link>
              <button 
                onClick={handleProcederPago}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Proceder al Pago
              </button>
            </div>

            {/* Resumen de la compra */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">📦 Resumen de tu compra</h3>
              <div className="text-sm text-blue-800 space-y-1">
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