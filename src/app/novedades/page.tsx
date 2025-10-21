// src/app/novedades/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Libro } from '@/context/CarritoContext';
import BookCarousel from '@/components/BookCarousel';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';

export default function NovedadesPage() {
  const [novedades, setNovedades] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarNovedades = async () => {
      try {
        // Ordenar por fecha de creación (asumiendo que tienes created_at)
        const { data, error } = await supabase
          .from('libros')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setNovedades(data as Libro[]);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarNovedades();
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🆕 Novedades</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre los últimos libros agregados a nuestra colección
          </p>
        </div>

        {novedades.length > 0 ? (
          <BookCarousel 
            titulo="Últimos Libros Agregados"
            libros={novedades}
            icono="🆕"
          />
        ) : (
          <ErrorState error="No hay novedades disponibles en este momento" />
        )}
      </div>
    </div>
  );
}