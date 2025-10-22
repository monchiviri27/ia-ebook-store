// hooks/useCarritoConNotificaciones.ts - ACTUALIZADO
import { useCarrito } from '@/context/CarritoContext';
import { useToast } from '@/context/ToastContext';

export function useCarritoConNotificaciones() {
  const carrito = useCarrito();
  const { addToast } = useToast();

  const agregarAlCarrito = (libro: any) => {
    carrito.agregarAlCarrito(libro);
    addToast({
      type: 'success',
      title: '✅ Libro agregado',
      message: `"${libro.titulo}" añadido al carrito`,
      duration: 3000,
    });
  };

  const removerDelCarrito = (id: string) => {
    carrito.removerDelCarrito(id);
    addToast({
      type: 'info',
      title: '🗑️ Libro removido',
      message: 'Producto eliminado del carrito',
      duration: 3000,
    });
  };

  const vaciarCarrito = () => {
    carrito.vaciarCarrito();
    addToast({
      type: 'warning',
      title: '🛒 Carrito vaciado',
      message: 'Todos los productos han sido removidos',
      duration: 3000,
    });
  };

  return {
    ...carrito,
    agregarAlCarrito,
    removerDelCarrito,
    vaciarCarrito,
  };
}