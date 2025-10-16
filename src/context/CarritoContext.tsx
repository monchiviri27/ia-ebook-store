// src/context/CarritoContext.tsx - VERSIÓN CORREGIDA
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// EXPORTAR la interfaz Libro
export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  descripcion: string;
  precio: number;
  genero: string;
  portada_url: string;
  ruta_pdf: string;
  ruta_epub: string;
}

interface CarritoItem extends Libro {
  cantidad: number;
}

interface CarritoContextType {
  items: CarritoItem[];
  agregarAlCarrito: (libro: Libro) => void;
  removerDelCarrito: (id: string) => void;
  actualizarCantidad: (id: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  total: number;
  cantidadTotal: number;
  estaEnCarrito: (id: string) => boolean;
  isLoaded: boolean;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

// Clave para localStorage
const CARRITO_STORAGE_KEY = 'ebookstore_carrito';

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CarritoItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    const cargarCarritoDesdeStorage = () => {
      try {
        const carritoGuardado = localStorage.getItem(CARRITO_STORAGE_KEY);
        if (carritoGuardado) {
          const itemsParseados = JSON.parse(carritoGuardado);
          
          if (Array.isArray(itemsParseados)) {
            setItems(itemsParseados);
          }
        }
      } catch (error) {
        console.error('Error al cargar el carrito desde localStorage:', error);
        localStorage.removeItem(CARRITO_STORAGE_KEY);
        setItems([]);
      } finally {
        setIsLoaded(true);
      }
    };

    cargarCarritoDesdeStorage();
  }, []);

  // Guardar carrito en localStorage cuando items cambien
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error al guardar el carrito en localStorage:', error);
      }
    }
  }, [items, isLoaded]);

  const agregarAlCarrito = (libro: Libro) => {
    setItems(prevItems => {
      const existe = prevItems.find(item => item.id === libro.id);
      
      if (existe) {
        return prevItems.map(item =>
          item.id === libro.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...libro, cantidad: 1 }];
    });
  };

  const removerDelCarrito = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removerDelCarrito(id);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  // ✅ VERSIÓN CORREGIDA - vaciarCarrito ahora limpia localStorage inmediatamente
  const vaciarCarrito = () => {
    console.log('🔄 Vaciando carrito...');
    setItems([]);
    
    // Limpiar localStorage inmediatamente
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(CARRITO_STORAGE_KEY);
        console.log('🗑️ localStorage limpiado inmediatamente');
      } catch (error) {
        console.error('Error al limpiar localStorage:', error);
      }
    }
  };

  const estaEnCarrito = (id: string) => {
    return items.some(item => item.id === id);
  };

  // Calcular total
  const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  // Calcular cantidad total de items
  const cantidadTotal = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CarritoContext.Provider value={{
      items,
      agregarAlCarrito,
      removerDelCarrito,
      actualizarCantidad,
      vaciarCarrito,
      total,
      cantidadTotal,
      estaEnCarrito,
      isLoaded
    }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const context = useContext(CarritoContext);
  if (context === undefined) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
}