// src/hooks/useCarritoConNotificaciones.ts
'use client';

import { useCarrito } from '@/context/CarritoContext';
import { useToast } from '@/context/ToastContext';
import type { Libro } from '@/context/CarritoContext';

export function useCarritoConNotificaciones() {
  const carrito = useCarrito();
  const { addToast } = useToast();

  const agregarAlCarrito = (libro: Libro) => {
    const existe = carrito.estaEnCarrito(libro.id);
    carrito.agregarAlCarrito(libro);
    
    if (existe) {
      addToast(`"${libro.titulo}" actualizado en el carrito`, 'info');
    } else {
      addToast(`"${libro.titulo}" agregado al carrito 🛒`, 'success');
    }
  };

  const removerDelCarrito = (id: string) => {
    const libro = carrito.items.find(item => item.id === id);
    carrito.removerDelCarrito(id);
    
    if (libro) {
      addToast(`"${libro.titulo}" removido del carrito`, 'warning');
    }
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    const libro = carrito.items.find(item => item.id === id);
    carrito.actualizarCantidad(id, cantidad);
    
    if (libro && cantidad > 1) {
      addToast(`Cantidad de "${libro.titulo}" actualizada: ${cantidad}`, 'info');
    }
  };

  const vaciarCarrito = () => {
    if (carrito.items.length > 0) {
      carrito.vaciarCarrito();
      addToast('Carrito vaciado', 'info');
    }
  };

  return {
    ...carrito,
    agregarAlCarrito,
    removerDelCarrito,
    actualizarCantidad,
    vaciarCarrito
  };
}